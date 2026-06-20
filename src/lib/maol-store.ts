/**
 * MAOL (Minimal Agent Observability Layer) — JSON Persistent Store
 *
 * Handles all server-side data persistence for MAOL.
 *
 * Storage:
 *  - Errors/Warnings: `error-data/maol-data.json` (no duplicates!)
 *  - DOM Summaries: `data/maol-dom-data.json`
 *
 * Features:
 *  ✅ Deduplication: same errors/warnings aren't saved multiple times!
 *  ✅ Auto-cleanup: max 200 records per session to avoid bloat
 *  ✅ Auto-create directories/files if they don't exist yet
 *
 * @see docs/SERVER_ARCHITECTURE.md for complete documentation
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

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
const MAX_RECORDS_PER_SESSION = 200; // Keep sessions light
const ERROR_DATA_DIR = join(process.cwd(), 'error-data');
const DATA_DIR = join(process.cwd(), 'data');
const ERROR_DATA_PATH = join(ERROR_DATA_DIR, 'maol-data.json');
const DOM_DATA_PATH = join(DATA_DIR, 'maol-dom-data.json');

// ---------------------------------------------------------------------------
// Types (for our internal store structure)
// ---------------------------------------------------------------------------
interface ErrorWarningData {
  [sessionId: string]: {
    errors: MaolErrorEvent[];
    warnings: MaolWarningEvent[];
  };
}

interface DomData {
  [sessionId: string]: MaolDomSummary[];
}

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

/**
 * Ensure directories exist (auto-create if missing)
 */
function ensureDirExists(dir: string) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

/**
 * Clean up messages by removing console formatting (%c, CSS styles)
 */
function sanitizeMessage(msg: string): string {
  let cleaned = msg;
  cleaned = cleaned.replace(/%c/g, ''); // Remove color tokens
  cleaned = cleaned.replace(/background:[^;]+;?/gi, '');
  cleaned = cleaned.replace(/color:[^;]+;?/gi, '');
  cleaned = cleaned.replace(/border-radius:[^;]+;?/gi, '');
  cleaned = cleaned.replace(/\s{2,}/g, ' '); // Normalize whitespace
  return cleaned.trim();
}

/**
 * Read error/warning data from disk
 */
function readErrorData(): ErrorWarningData {
  ensureDirExists(ERROR_DATA_DIR);
  try {
    const content = readFileSync(ERROR_DATA_PATH, 'utf8');
    return JSON.parse(content);
  } catch {
    return {}; // Start with empty object if file isn't there yet
  }
}

/**
 * Write error/warning data to disk (with indentation for readability)
 */
function writeErrorData(data: ErrorWarningData): void {
  ensureDirExists(ERROR_DATA_DIR);
  writeFileSync(ERROR_DATA_PATH, JSON.stringify(data, null, 2));
}

/**
 * Read DOM summary data from disk
 */
function readDomData(): DomData {
  ensureDirExists(DATA_DIR);
  try {
    const content = readFileSync(DOM_DATA_PATH, 'utf8');
    return JSON.parse(content);
  } catch {
    return {};
  }
}

/**
 * Write DOM summary data to disk
 */
function writeDomData(data: DomData): void {
  ensureDirExists(DATA_DIR);
  writeFileSync(DOM_DATA_PATH, JSON.stringify(data, null, 2));
}

/**
 * Create a unique key for errors to check for duplicates
 */
function getErrorKey(event: MaolErrorEvent): string {
  return `${event.message}-${event.route}-${event.stack || 'no-stack'}`;
}

/**
 * Create a unique key for warnings to check for duplicates
 */
function getWarningKey(event: MaolWarningEvent): string {
  return `${event.message}-${event.route}-${event.component || 'no-component'}-${event.severity}`;
}

/**
 * Keep only the latest N records to avoid file bloat
 */
function evictOldRecords<T>(arr: T[], max: number): T[] {
  if (arr.length <= max) return arr;
  return arr.slice(-max); // Keep newest ones
}

// ---------------------------------------------------------------------------
// Write Operations
// ---------------------------------------------------------------------------

/**
 * Store an error event (if not already stored)
 */
export function storeError(sessionId: string, event: MaolErrorEvent): void {
  if (!isValidMaolSessionId(sessionId)) return;
  try {
    const data = readErrorData();
    if (!data[sessionId]) {
      data[sessionId] = { errors: [], warnings: [] };
    }

    const sanitizedEvent = {
      ...event,
      message: sanitizeMessage(event.message),
    };

    const key = getErrorKey(sanitizedEvent);
    const exists = data[sessionId].errors.some((e) => getErrorKey(e) === key);
    if (!exists) {
      data[sessionId].errors.push(sanitizedEvent);
      data[sessionId].errors = evictOldRecords(data[sessionId].errors, MAX_RECORDS_PER_SESSION);
      writeErrorData(data);
    }
  } catch (err) {
    console.error('[MAOL Store] Failed to store error:', err);
  }
}

/**
 * Store a warning event (if not already stored)
 */
export function storeWarning(sessionId: string, event: MaolWarningEvent): void {
  if (!isValidMaolSessionId(sessionId)) return;
  try {
    const data = readErrorData();
    if (!data[sessionId]) {
      data[sessionId] = { errors: [], warnings: [] };
    }

    const sanitizedEvent = {
      ...event,
      message: sanitizeMessage(event.message),
    };

    const key = getWarningKey(sanitizedEvent);
    const exists = data[sessionId].warnings.some((w) => getWarningKey(w) === key);
    if (!exists) {
      data[sessionId].warnings.push(sanitizedEvent);
      data[sessionId].warnings = evictOldRecords(data[sessionId].warnings, MAX_RECORDS_PER_SESSION);
      writeErrorData(data);
    }
  } catch (err) {
    console.error('[MAOL Store] Failed to store warning:', err);
  }
}

/**
 * Store a DOM summary
 * Updates existing entry if same route already exists, otherwise adds a new one
 */
export function storeDomSummary(sessionId: string, summary: MaolDomSummary): void {
  if (!isValidMaolSessionId(sessionId)) return;
  try {
    const data = readDomData();
    if (!data[sessionId]) {
      data[sessionId] = [];
    }

    const existingIndex = data[sessionId].findIndex((d) => d.route === summary.route);
    if (existingIndex !== -1) {
      data[sessionId][existingIndex] = summary; // Update existing route summary
    } else {
      data[sessionId].push(summary); // Add new route summary
      data[sessionId] = evictOldRecords(data[sessionId], MAX_RECORDS_PER_SESSION);
    }

    writeDomData(data);
  } catch (err) {
    console.error('[MAOL Store] Failed to store DOM summary:', err);
  }
}

// ---------------------------------------------------------------------------
// Read Operations
// ---------------------------------------------------------------------------

/**
 * Retrieve complete session data for the agent
 */
export function getSessionData(sessionId: string): MaolAgentResponse | null {
  if (!isValidMaolSessionId(sessionId)) return null;

  try {
    const errorData = readErrorData();
    const domData = readDomData();

    const errors = errorData[sessionId]?.errors || [];
    const warnings = errorData[sessionId]?.warnings || [];
    const dom = domData[sessionId] || [];

    // Calculate unique routes visited
    const routesVisited = [
      ...new Set([
        ...errors.map((e) => e.route),
        ...warnings.map((w) => w.route),
        ...dom.map((d) => d.route),
      ]),
    ];

    // Calculate warning severity counts
    const warnBySeverity: Record<MaolWarningSeverity, number> = {
      low: 0,
      medium: 0,
      high: 0,
    };
    warnings.forEach((w) => {
      warnBySeverity[w.severity] = (warnBySeverity[w.severity] || 0) + 1;
    });

    // Get session start and last activity timestamps
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
    const errorData = readErrorData();
    delete errorData[sessionId];
    writeErrorData(errorData);

    const domData = readDomData();
    delete domData[sessionId];
    writeDomData(domData);
  } catch (err) {
    console.error('[MAOL Store] Failed to purge session:', err);
  }
}
