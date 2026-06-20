import fs from 'fs/promises';
import path from 'path';

import type { DatabaseRefFile } from '../data/database-ref.types';
import { bindingsFromLegacyEntry } from '../data/element-binding-utils';
import { normalizeInspectorDataMap } from '../data/inspector-config-storage';
import type { InspectorDataEntry, InspectorDataMap } from '../data/inspector-config.types';
import {
  buildInspectorIndex,
  buildInspectorSnapshot,
  buildRelationshipsGraph,
  buildReverseIndex,
  buildRouteIndex,
  composeInspectorEntry,
  safeFileNameFromIdentityKey,
  splitInspectorEntry,
} from '../data/inspector-file-layout-utils';
import type {
  InspectorAttributesFile,
  InspectorBindingsFile,
  InspectorElementFile,
} from '../data/inspector-file-layout.types';
import type { RelationshipReverseIndexFile } from '../data/relationship-graph.types';

const DATA_ROOT = path.join(process.cwd(), 'data');
const LAYOUT_ROOT = path.join(DATA_ROOT, 'ui-inspector');
const LEGACY_MIRROR_PATH = path.join(DATA_ROOT, 'ui-inspector-data.json');

function layoutPaths() {
  return {
    baseDir: LAYOUT_ROOT,
    indexPath: path.join(LAYOUT_ROOT, 'index.json'),
    graphPath: path.join(LAYOUT_ROOT, 'relationships', 'graph.json'),
    reverseIndexPath: path.join(LAYOUT_ROOT, 'relationships', 'reverse-index.json'),
    snapshotPath: path.join(LAYOUT_ROOT, 'snapshots', 'latest.json'),
    legacyMirrorPath: LEGACY_MIRROR_PATH,
    elementsDir: path.join(LAYOUT_ROOT, 'elements', 'by-key'),
    bindingsDir: path.join(LAYOUT_ROOT, 'bindings', 'by-key'),
    attributesDir: path.join(LAYOUT_ROOT, 'attributes', 'by-key'),
    routesDir: path.join(LAYOUT_ROOT, 'routes'),
  };
}

async function atomicWriteJson(filePath: string, data: unknown): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const tmpPath = `${filePath}.tmp`;
  const content = `${JSON.stringify(data, null, 2)}\n`;
  await fs.writeFile(tmpPath, content, 'utf8');
  try {
    await fs.rm(filePath, { force: true });
    await fs.rename(tmpPath, filePath);
  } catch {
    await fs.writeFile(filePath, content, 'utf8');
    await fs.rm(tmpPath, { force: true });
  }
}

async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function layoutExists(): Promise<boolean> {
  try {
    await fs.access(layoutPaths().indexPath);
    return true;
  } catch {
    return false;
  }
}

async function readLegacyMirror(): Promise<InspectorDataMap> {
  try {
    const raw = await fs.readFile(LEGACY_MIRROR_PATH, 'utf8');
    return normalizeInspectorDataMap(JSON.parse(raw) as InspectorDataMap);
  } catch {
    return {};
  }
}

async function composeEntryFromFiles(identityKey: string): Promise<InspectorDataEntry | null> {
  const safe = safeFileNameFromIdentityKey(identityKey);
  const paths = layoutPaths();
  const element = await readJsonFile<InspectorElementFile>(path.join(paths.elementsDir, `${safe}.json`));
  const bindings = await readJsonFile<InspectorBindingsFile>(path.join(paths.bindingsDir, `${safe}.json`));
  const attributes = await readJsonFile<InspectorAttributesFile>(path.join(paths.attributesDir, `${safe}.json`));
  if (!element || !bindings || !attributes) return null;
  return composeInspectorEntry({ element, bindings, attributes });
}

export async function loadInspectorDataMapFromLayout(): Promise<InspectorDataMap> {
  if (!(await layoutExists())) {
    return readLegacyMirror();
  }

  const index = await readJsonFile<{ entries: { identityKey: string }[] }>(layoutPaths().indexPath);
  if (!index?.entries?.length) {
    return readLegacyMirror();
  }

  const map: InspectorDataMap = {};
  for (const entry of index.entries) {
    const composed = await composeEntryFromFiles(entry.identityKey);
    if (composed) {
      map[entry.identityKey] = composed;
    }
  }

  return normalizeInspectorDataMap(map);
}

export async function loadRelationshipReverseIndexFromLayout(): Promise<RelationshipReverseIndexFile> {
  return (await readJsonFile<RelationshipReverseIndexFile>(layoutPaths().reverseIndexPath)) ?? {};
}

export type SaveInspectorEntryOptions = {
  route?: string;
};

export async function saveInspectorEntryToLayout(
  entry: InspectorDataEntry,
  options?: SaveInspectorEntryOptions
): Promise<InspectorDataMap> {
  const identityKey = entry.dataUiIdentityKey;
  const safe = safeFileNameFromIdentityKey(identityKey);
  const paths = layoutPaths();
  const parts = splitInspectorEntry(entry, options?.route);

  await atomicWriteJson(path.join(paths.elementsDir, `${safe}.json`), parts.element);
  await atomicWriteJson(path.join(paths.bindingsDir, `${safe}.json`), parts.bindings);
  await atomicWriteJson(path.join(paths.attributesDir, `${safe}.json`), parts.attributes);

  const currentMap = await loadInspectorDataMapFromLayout();
  const merged = normalizeInspectorDataMap({
    ...currentMap,
    [identityKey]: entry,
  });

  const index = buildInspectorIndex(merged);
  const graph = buildRelationshipsGraph(merged);
  const reverseIndex = buildReverseIndex(graph);
  const snapshot = buildInspectorSnapshot(merged);
  const routeIndexes = buildRouteIndex(
    merged,
    Object.fromEntries(
      Object.keys(merged).map((key) => [key, options?.route ?? parts.element.route ?? '/unknown'])
    )
  );

  await atomicWriteJson(paths.indexPath, index);
  await atomicWriteJson(paths.graphPath, graph);
  await atomicWriteJson(paths.reverseIndexPath, reverseIndex);
  await atomicWriteJson(paths.snapshotPath, snapshot);

  for (const [safeRoute, routeIndex] of Object.entries(routeIndexes)) {
    await atomicWriteJson(path.join(paths.routesDir, `${safeRoute}.json`), routeIndex);
  }

  await atomicWriteJson(paths.legacyMirrorPath, merged);

  return merged;
}

export async function migrateLegacyInspectorDataToLayout(
  databaseRef: DatabaseRefFile = { databases: [] }
): Promise<{
  migrated: number;
  migratedAt: string;
}> {
  const legacy = await readLegacyMirror();
  const migratedAt = new Date().toISOString();
  let count = 0;

  for (const entry of Object.values(legacy)) {
    const bindings = entry.bindings?.length
      ? entry.bindings
      : bindingsFromLegacyEntry(entry, databaseRef);
    await saveInspectorEntryToLayout({
      ...entry,
      bindings,
      customAttributes: entry.customAttributes ?? [],
    });
    count += 1;
  }

  const snapshot = buildInspectorSnapshot(await loadInspectorDataMapFromLayout());
  await atomicWriteJson(layoutPaths().snapshotPath, { ...snapshot, migratedAt });

  return { migrated: count, migratedAt };
}

export async function writeLegacyMirrorOnly(data: InspectorDataMap): Promise<void> {
  await atomicWriteJson(LEGACY_MIRROR_PATH, normalizeInspectorDataMap(data));
}
