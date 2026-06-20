/**
 * UI Identity Diff Tracking Engine
 *
 * UUID is the primary key. Moving a component or renaming id/path is tracked as
 * metadata movement while the immutable UUID remains the durable identity.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

import {
  ALL_UI_IDENTITIES,
  getUiIdentityLifecycle,
  getUiIdentityUuid,
  isValidUiUuid,
} from '../../registry/registry';
import { UI_SOURCE_INDEX, UI_SOURCE_INDEX_BY_UUID } from '../../registry/source-index';

interface SnapshotEntry {
  uuid: string;
  id: string;
  path: string;
  previousIds: readonly string[];
  previousPaths: readonly string[];
  aliases: readonly string[];
  feature: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  lifecycle: 'active' | 'deprecated' | 'removed';
  sourceFile: string;
  sourceComponent: string;
  sourceLine: number;
}

interface DiffEntry {
  timestamp: string;
  type:
    | 'ADDED'
    | 'REMOVED'
    | 'ID_CHANGED'
    | 'PATH_CHANGED'
    | 'FEATURE_REASSIGNED'
    | 'COMPONENT_MOVED'
    | 'DEPRECATED'
    | 'RESTORED'
    | 'VERSION_BUMPED';
  uuid: string;
  id: string;
  before?: Partial<SnapshotEntry>;
  after?: Partial<SnapshotEntry>;
  description: string;
}

const ROOT = join(__dirname, '..');
const LOGS_DIR = join(ROOT, 'logs');
const SNAPSHOT_FILE = join(LOGS_DIR, 'ui-identity-snapshot.json');
const CHANGELOG_FILE = join(LOGS_DIR, 'ui-identity-changes.log');

function ensureLogsDir() {
  if (!existsSync(LOGS_DIR)) {
    mkdirSync(LOGS_DIR, { recursive: true });
  }
}

function buildCurrentSnapshot(): Record<string, SnapshotEntry> {
  const snapshot: Record<string, SnapshotEntry> = {};

  for (const identity of ALL_UI_IDENTITIES) {
    const uuid = getUiIdentityUuid(identity);
    const source = UI_SOURCE_INDEX_BY_UUID[uuid] ?? UI_SOURCE_INDEX[identity.id];
    snapshot[uuid] = {
      uuid,
      id: identity.id,
      path: identity.path,
      previousIds: identity.previousIds ?? [],
      previousPaths: identity.previousPaths ?? [],
      aliases: identity.aliases ?? [],
      feature: identity.feature,
      version: identity.version,
      createdAt: identity.createdAt,
      updatedAt: identity.updatedAt,
      lifecycle: getUiIdentityLifecycle(identity),
      sourceFile: source?.sourceFile ?? 'unknown',
      sourceComponent: source?.sourceComponent ?? 'unknown',
      sourceLine: source?.sourceLine ?? 0,
    };
  }

  return snapshot;
}

function loadPreviousSnapshot(): Record<string, SnapshotEntry> | null {
  if (!existsSync(SNAPSHOT_FILE)) return null;
  try {
    return JSON.parse(readFileSync(SNAPSHOT_FILE, 'utf-8')) as Record<string, SnapshotEntry>;
  } catch {
    return null;
  }
}

function computeDiffs(
  prev: Record<string, SnapshotEntry>,
  curr: Record<string, SnapshotEntry>
): DiffEntry[] {
  const diffs: DiffEntry[] = [];
  const now = new Date().toISOString();
  const allUuids = new Set([...Object.keys(prev), ...Object.keys(curr)]);

  for (const uuid of allUuids) {
    const before = prev[uuid];
    const after = curr[uuid];

    if (!before && after) {
      diffs.push({
        timestamp: now,
        type: 'ADDED',
        uuid,
        id: after.id,
        after,
        description: `New UI identity registered: ${after.id} (${uuid}) -> "${after.path}" (${after.feature})`,
      });
      continue;
    }

    if (before && !after) {
      diffs.push({
        timestamp: now,
        type: 'REMOVED',
        uuid,
        id: before.id,
        before,
        description: `UI identity removed: ${before.id} (${uuid}) was "${before.path}" (${before.feature})`,
      });
      continue;
    }

    if (!before || !after) continue;

    if (before.id !== after.id) {
      diffs.push({
        timestamp: now,
        type: 'ID_CHANGED',
        uuid,
        id: after.id,
        before: { id: before.id },
        after: { id: after.id },
        description: `Stable ID changed for ${uuid}: "${before.id}" -> "${after.id}"`,
      });
    }

    if (before.path !== after.path) {
      diffs.push({
        timestamp: now,
        type: 'PATH_CHANGED',
        uuid,
        id: after.id,
        before: { path: before.path },
        after: { path: after.path },
        description: `Path changed for ${after.id} (${uuid}): "${before.path}" -> "${after.path}"`,
      });
    }

    if (before.feature !== after.feature) {
      diffs.push({
        timestamp: now,
        type: 'FEATURE_REASSIGNED',
        uuid,
        id: after.id,
        before: { feature: before.feature },
        after: { feature: after.feature },
        description: `Feature reassigned for ${after.id} (${uuid}): "${before.feature}" -> "${after.feature}"`,
      });
    }

    if (
      before.sourceFile !== after.sourceFile ||
      before.sourceComponent !== after.sourceComponent
    ) {
      diffs.push({
        timestamp: now,
        type: 'COMPONENT_MOVED',
        uuid,
        id: after.id,
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
          `Component moved for ${after.id} (${uuid}): ` +
          `${before.sourceComponent}@${before.sourceFile}:${before.sourceLine} -> ` +
          `${after.sourceComponent}@${after.sourceFile}:${after.sourceLine}`,
      });
    }

    if (before.lifecycle !== 'deprecated' && after.lifecycle === 'deprecated') {
      diffs.push({
        timestamp: now,
        type: 'DEPRECATED',
        uuid,
        id: after.id,
        before: { lifecycle: before.lifecycle },
        after: { lifecycle: after.lifecycle },
        description: `UI identity marked deprecated: ${after.id} (${uuid})`,
      });
    }

    if (before.lifecycle === 'deprecated' && after.lifecycle !== 'deprecated') {
      diffs.push({
        timestamp: now,
        type: 'RESTORED',
        uuid,
        id: after.id,
        before: { lifecycle: before.lifecycle },
        after: { lifecycle: after.lifecycle },
        description: `UI identity restored from deprecated: ${after.id} (${uuid})`,
      });
    }

    if (before.version !== after.version) {
      diffs.push({
        timestamp: now,
        type: 'VERSION_BUMPED',
        uuid,
        id: after.id,
        before: { version: before.version },
        after: { version: after.version },
        description: `Version bumped for ${after.id} (${uuid}): ${before.version} -> ${after.version}`,
      });
    }
  }

  return diffs;
}

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

function saveSnapshot(snapshot: Record<string, SnapshotEntry>) {
  writeFileSync(SNAPSHOT_FILE, JSON.stringify(snapshot, null, 2), 'utf-8');
  console.log(`[Diff Tracker] Snapshot saved: ${SNAPSHOT_FILE}`);
}

function main() {
  ensureLogsDir();

  const current = buildCurrentSnapshot();
  const invalidUuids = Object.keys(current).filter((uuid) => !isValidUiUuid(uuid));
  if (invalidUuids.length > 0) {
    throw new Error(`Invalid UI UUIDs in snapshot: ${invalidUuids.join(', ')}`);
  }

  const previous = loadPreviousSnapshot();

  if (!previous) {
    console.log('[Diff Tracker] No previous snapshot found. Creating initial UUID snapshot...');
    saveSnapshot(current);
    console.log(`[Diff Tracker] Initial snapshot written with ${Object.keys(current).length} identities.`);
    return;
  }

  const diffs = computeDiffs(previous, current);

  if (diffs.length === 0) {
    console.log('[Diff Tracker] No changes detected since last snapshot.');
  } else {
    console.log(`[Diff Tracker] ${diffs.length} change(s) detected:`);
    diffs.forEach((diff) => console.log(`  [${diff.type}] ${diff.description}`));
    appendToChangelog(diffs);
  }

  saveSnapshot(current);
}

main();
