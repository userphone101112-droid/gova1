/**
 * UI Identity Diff Tracking Engine
 *
 * Detects changes between a previous snapshot and the current registry state.
 * Logs diffs (Stable ID changes, path changes, component moves, feature reassignments,
 * deprecated additions) to: logs/ui-identity-changes.log
 *
 * Usage:
 *   npx tsx scripts/track-ui-identity-diff.ts
 *
 * The script also writes a fresh snapshot to logs/ui-identity-snapshot.json
 * so the next invocation can detect future changes.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { ALL_UI_IDENTITIES } from '../../registry/registry';
import { UI_SOURCE_INDEX } from '../../registry/source-index';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SnapshotEntry {
  id: string;
  path: string;
  feature: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  deprecated: boolean;
  sourceFile: string;
  sourceComponent: string;
  sourceLine: number;
}

interface DiffEntry {
  timestamp: string;
  type:
    | 'ADDED'
    | 'REMOVED'
    | 'PATH_CHANGED'
    | 'FEATURE_REASSIGNED'
    | 'COMPONENT_MOVED'
    | 'DEPRECATED'
    | 'RESTORED'
    | 'VERSION_BUMPED';
  id: string;
  before?: Partial<SnapshotEntry>;
  after?: Partial<SnapshotEntry>;
  description: string;
}

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const ROOT = join(__dirname, '..');
const LOGS_DIR = join(ROOT, 'logs');
const SNAPSHOT_FILE = join(LOGS_DIR, 'ui-identity-snapshot.json');
const CHANGELOG_FILE = join(LOGS_DIR, 'ui-identity-changes.log');

function ensureLogsDir() {
  if (!existsSync(LOGS_DIR)) {
    mkdirSync(LOGS_DIR, { recursive: true });
  }
}

// ---------------------------------------------------------------------------
// Build current snapshot from registry + source index
// ---------------------------------------------------------------------------

function buildCurrentSnapshot(): Record<string, SnapshotEntry> {
  const snapshot: Record<string, SnapshotEntry> = {};
  for (const identity of ALL_UI_IDENTITIES) {
    const source = UI_SOURCE_INDEX[identity.id];
    snapshot[identity.id] = {
      id: identity.id,
      path: identity.path,
      feature: identity.feature,
      version: identity.version,
      createdAt: identity.createdAt,
      updatedAt: identity.updatedAt,
      deprecated: identity.deprecated ?? false,
      sourceFile: source?.sourceFile ?? 'unknown',
      sourceComponent: source?.sourceComponent ?? 'unknown',
      sourceLine: source?.sourceLine ?? 0,
    };
  }
  return snapshot;
}

// ---------------------------------------------------------------------------
// Load previous snapshot
// ---------------------------------------------------------------------------

function loadPreviousSnapshot(): Record<string, SnapshotEntry> | null {
  if (!existsSync(SNAPSHOT_FILE)) return null;
  try {
    return JSON.parse(readFileSync(SNAPSHOT_FILE, 'utf-8')) as Record<string, SnapshotEntry>;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Compute diffs
// ---------------------------------------------------------------------------

function computeDiffs(
  prev: Record<string, SnapshotEntry>,
  curr: Record<string, SnapshotEntry>
): DiffEntry[] {
  const diffs: DiffEntry[] = [];
  const now = new Date().toISOString();

  const allIds = new Set([...Object.keys(prev), ...Object.keys(curr)]);

  for (const id of allIds) {
    const before = prev[id];
    const after = curr[id];

    if (!before && after) {
      diffs.push({
        timestamp: now,
        type: 'ADDED',
        id,
        after,
        description: `New UI identity registered: ${id} → "${after.path}" (${after.feature})`,
      });
      continue;
    }

    if (before && !after) {
      diffs.push({
        timestamp: now,
        type: 'REMOVED',
        id,
        before,
        description: `UI identity removed: ${id} was "${before.path}" (${before.feature})`,
      });
      continue;
    }

    if (!before || !after) continue;

    if (before.path !== after.path) {
      diffs.push({
        timestamp: now,
        type: 'PATH_CHANGED',
        id,
        before: { path: before.path },
        after: { path: after.path },
        description: `Path changed for ${id}: "${before.path}" → "${after.path}"`,
      });
    }

    if (before.feature !== after.feature) {
      diffs.push({
        timestamp: now,
        type: 'FEATURE_REASSIGNED',
        id,
        before: { feature: before.feature },
        after: { feature: after.feature },
        description: `Feature reassigned for ${id}: "${before.feature}" → "${after.feature}"`,
      });
    }

    if (
      before.sourceFile !== after.sourceFile ||
      before.sourceComponent !== after.sourceComponent
    ) {
      diffs.push({
        timestamp: now,
        type: 'COMPONENT_MOVED',
        id,
        before: {
          sourceFile: before.sourceFile,
          sourceComponent: before.sourceComponent,
          sourceLine: before.sourceLine,
        },
        after: {
          sourceFile: after.sourceFile,
          sourceComponent: after.sourceComponent,
          sourceLine: after.sourceLine,
        },
        description:
          `Component moved for ${id}: ` +
          `${before.sourceComponent}@${before.sourceFile}:${before.sourceLine} → ` +
          `${after.sourceComponent}@${after.sourceFile}:${after.sourceLine}`,
      });
    }

    if (!before.deprecated && after.deprecated) {
      diffs.push({
        timestamp: now,
        type: 'DEPRECATED',
        id,
        before: { deprecated: false },
        after: { deprecated: true },
        description: `UI identity marked deprecated: ${id}`,
      });
    }

    if (before.deprecated && !after.deprecated) {
      diffs.push({
        timestamp: now,
        type: 'RESTORED',
        id,
        before: { deprecated: true },
        after: { deprecated: false },
        description: `UI identity restored from deprecated: ${id}`,
      });
    }

    if (before.version !== after.version) {
      diffs.push({
        timestamp: now,
        type: 'VERSION_BUMPED',
        id,
        before: { version: before.version },
        after: { version: after.version },
        description: `Version bumped for ${id}: ${before.version} → ${after.version}`,
      });
    }
  }

  return diffs;
}

// ---------------------------------------------------------------------------
// Append diffs to changelog
// ---------------------------------------------------------------------------

function appendToChangelog(diffs: DiffEntry[]) {
  if (diffs.length === 0) return;

  const lines: string[] = [];
  lines.push('');
  lines.push(`# Audit Run: ${new Date().toISOString()}`);
  lines.push(`# ${diffs.length} change(s) detected`);
  lines.push('');

  for (const diff of diffs) {
    lines.push(`[${diff.timestamp}] [${diff.type}] ${diff.description}`);
    if (diff.before) {
      lines.push(`  BEFORE: ${JSON.stringify(diff.before)}`);
    }
    if (diff.after) {
      lines.push(`  AFTER:  ${JSON.stringify(diff.after)}`);
    }
  }

  lines.push('');

  const existing = existsSync(CHANGELOG_FILE)
    ? readFileSync(CHANGELOG_FILE, 'utf-8')
    : '# UI Identity Change Log\n# Auto-generated. Do not edit manually.\n';

  writeFileSync(CHANGELOG_FILE, existing + lines.join('\n'), 'utf-8');
  console.log(`[Diff Tracker] Appended ${diffs.length} diff(s) to ${CHANGELOG_FILE}`);
}

// ---------------------------------------------------------------------------
// Save current snapshot
// ---------------------------------------------------------------------------

function saveSnapshot(snapshot: Record<string, SnapshotEntry>) {
  writeFileSync(SNAPSHOT_FILE, JSON.stringify(snapshot, null, 2), 'utf-8');
  console.log(`[Diff Tracker] Snapshot saved: ${SNAPSHOT_FILE}`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  ensureLogsDir();

  const current = buildCurrentSnapshot();
  const previous = loadPreviousSnapshot();

  if (!previous) {
    console.log('[Diff Tracker] No previous snapshot found. Creating initial snapshot...');
    saveSnapshot(current);
    console.log(`[Diff Tracker] Initial snapshot written with ${Object.keys(current).length} identities.`);
    return;
  }

  const diffs = computeDiffs(previous, current);

  if (diffs.length === 0) {
    console.log('[Diff Tracker] No changes detected since last snapshot.');
  } else {
    console.log(`[Diff Tracker] ${diffs.length} change(s) detected:`);
    diffs.forEach((d) => console.log(`  [${d.type}] ${d.description}`));
    appendToChangelog(diffs);
  }

  // Always update snapshot to current state
  saveSnapshot(current);
}

main();
