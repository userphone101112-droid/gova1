/**
 * MAOL — SQLite Persistent Store
 *
 * Server-side singleton that persists all observability events.
 * Uses better-sqlite3 (already in project dependencies).
 *
 * Storage: logs/maol.sqlite (persistent across server restarts)
 * Max records: 200 per session per table (FIFO eviction)
 *
 * Security:
 *  - All payloads stored as JSON strings (sanitized via JSON round-trip)
 *  - No raw SQL string concatenation — all queries use parameterized statements
 *  - sessionId validated before every write/read
 */

import Database from 'better-sqlite3';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { isValidMaolSessionId } from '@/shared/maol/session';
import type {
  MaolErrorEvent,
  MaolWarningEvent,
  MaolDomSummary,
  MaolAgentResponse,
  MaolSessionSummary,
  MaolWarningSeverity,
} from '@/shared/maol/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_RECORDS_PER_SESSION = 200;
const LOGS_DIR = join(process.cwd(), 'logs');
const DB_PATH = join(LOGS_DIR, 'maol.sqlite');

// ---------------------------------------------------------------------------
// Singleton DB Instance
// ---------------------------------------------------------------------------

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (_db) return _db;

  // Ensure logs directory exists
  if (!existsSync(LOGS_DIR)) {
    mkdirSync(LOGS_DIR, { recursive: true });
  }

  _db = new Database(DB_PATH);

  // Enable WAL mode for better concurrent read performance
  _db.pragma('journal_mode = WAL');
  _db.pragma('foreign_keys = ON');

  // Create tables
  _db.exec(`
    CREATE TABLE IF NOT EXISTS maol_errors (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      sessionId TEXT    NOT NULL,
      payload   TEXT    NOT NULL,
      createdAt TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS maol_warnings (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      sessionId TEXT    NOT NULL,
      payload   TEXT    NOT NULL,
      createdAt TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS maol_dom (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      sessionId TEXT    NOT NULL,
      route     TEXT    NOT NULL,
      payload   TEXT    NOT NULL,
      createdAt TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_errors_session   ON maol_errors(sessionId);
    CREATE INDEX IF NOT EXISTS idx_warnings_session ON maol_warnings(sessionId);
    CREATE INDEX IF NOT EXISTS idx_dom_session      ON maol_dom(sessionId);
  `);

  return _db;
}

// ---------------------------------------------------------------------------
// FIFO Eviction Helper
// ---------------------------------------------------------------------------

function evictOldRecords(table: string, sessionId: string): void {
  const db = getDb();
  db.prepare(`
    DELETE FROM ${table}
    WHERE sessionId = ?
      AND id NOT IN (
        SELECT id FROM ${table}
        WHERE sessionId = ?
        ORDER BY id DESC
        LIMIT ?
      )
  `).run(sessionId, sessionId, MAX_RECORDS_PER_SESSION);
}

// ---------------------------------------------------------------------------
// Sanitize helper — prevents injecting malformed JSON into DB
// ---------------------------------------------------------------------------

function sanitize<T>(data: T): string {
  return JSON.stringify(JSON.parse(JSON.stringify(data)));
}

// ---------------------------------------------------------------------------
// Write Operations
// ---------------------------------------------------------------------------

export function storeError(sessionId: string, event: MaolErrorEvent): void {
  if (!isValidMaolSessionId(sessionId)) return;
  try {
    const db = getDb();
    db.prepare(
      'INSERT INTO maol_errors (sessionId, payload) VALUES (?, ?)'
    ).run(sessionId, sanitize(event));
    evictOldRecords('maol_errors', sessionId);
  } catch (err) {
    console.error('[MAOL Store] Failed to store error:', err);
  }
}

export function storeWarning(sessionId: string, event: MaolWarningEvent): void {
  if (!isValidMaolSessionId(sessionId)) return;
  try {
    const db = getDb();
    db.prepare(
      'INSERT INTO maol_warnings (sessionId, payload) VALUES (?, ?)'
    ).run(sessionId, sanitize(event));
    evictOldRecords('maol_warnings', sessionId);
  } catch (err) {
    console.error('[MAOL Store] Failed to store warning:', err);
  }
}

export function storeDomSummary(sessionId: string, summary: MaolDomSummary): void {
  if (!isValidMaolSessionId(sessionId)) return;
  try {
    const db = getDb();
    // Upsert: replace existing DOM summary for the same session+route
    const existing = db.prepare(
      'SELECT id FROM maol_dom WHERE sessionId = ? AND route = ?'
    ).get(sessionId, summary.route) as { id: number } | undefined;

    if (existing) {
      db.prepare(
        'UPDATE maol_dom SET payload = ?, createdAt = datetime(\'now\') WHERE id = ?'
      ).run(sanitize(summary), existing.id);
    } else {
      db.prepare(
        'INSERT INTO maol_dom (sessionId, route, payload) VALUES (?, ?, ?)'
      ).run(sessionId, summary.route, sanitize(summary));
      evictOldRecords('maol_dom', sessionId);
    }
  } catch (err) {
    console.error('[MAOL Store] Failed to store DOM summary:', err);
  }
}

// ---------------------------------------------------------------------------
// Read Operations
// ---------------------------------------------------------------------------

export function getSessionData(sessionId: string): MaolAgentResponse | null {
  if (!isValidMaolSessionId(sessionId)) return null;

  try {
    const db = getDb();

    const errorRows = db.prepare(
      'SELECT payload, createdAt FROM maol_errors WHERE sessionId = ? ORDER BY id ASC'
    ).all(sessionId) as { payload: string; createdAt: string }[];

    const warningRows = db.prepare(
      'SELECT payload, createdAt FROM maol_warnings WHERE sessionId = ? ORDER BY id ASC'
    ).all(sessionId) as { payload: string; createdAt: string }[];

    const domRows = db.prepare(
      'SELECT payload FROM maol_dom WHERE sessionId = ? ORDER BY id ASC'
    ).all(sessionId) as { payload: string }[];

    const errors: MaolErrorEvent[] = errorRows.map((r) => JSON.parse(r.payload));
    const warnings: MaolWarningEvent[] = warningRows.map((r) => JSON.parse(r.payload));
    const dom: MaolDomSummary[] = domRows.map((r) => JSON.parse(r.payload));

    const routesVisited = [
      ...new Set([
        ...errors.map((e) => e.route),
        ...warnings.map((w) => w.route),
        ...dom.map((d) => d.route),
      ]),
    ];

    const warnBySeverity: Record<MaolWarningSeverity, number> = {
      low: 0,
      medium: 0,
      high: 0,
    };
    warnings.forEach((w) => {
      warnBySeverity[w.severity] = (warnBySeverity[w.severity] || 0) + 1;
    });

    const allTimestamps = [
      ...errors.map((e) => e.timestamp),
      ...warnings.map((w) => w.timestamp),
      ...dom.map((d) => d.timestamp),
    ].filter(Boolean);

    const summary: MaolSessionSummary = {
      totalErrors: errors.length,
      totalWarnings: warnings.length,
      totalWarningsByseverity: warnBySeverity,
      routesVisited,
      sessionStart: allTimestamps.length
        ? new Date(Math.min(...allTimestamps)).toISOString()
        : undefined,
      lastActivity: allTimestamps.length
        ? new Date(Math.max(...allTimestamps)).toISOString()
        : undefined,
    };

    return {
      sessionId,
      errors,
      warnings,
      dom,
      summary,
    };
  } catch (err) {
    console.error('[MAOL Store] Failed to read session data:', err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Cleanup (for testing or manual purge)
// ---------------------------------------------------------------------------

export function purgeSession(sessionId: string): void {
  if (!isValidMaolSessionId(sessionId)) return;
  try {
    const db = getDb();
    db.prepare('DELETE FROM maol_errors WHERE sessionId = ?').run(sessionId);
    db.prepare('DELETE FROM maol_warnings WHERE sessionId = ?').run(sessionId);
    db.prepare('DELETE FROM maol_dom WHERE sessionId = ?').run(sessionId);
  } catch (err) {
    console.error('[MAOL Store] Failed to purge session:', err);
  }
}
