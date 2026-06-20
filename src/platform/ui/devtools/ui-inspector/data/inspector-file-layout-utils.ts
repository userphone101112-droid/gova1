import type { InspectElementSnapshot } from '../../UiInspectorFrameBridge';

import type { ElementBinding } from './element-binding.types';
import type { InspectorDataEntry, InspectorDataMap } from './inspector-config.types';
import type {
  InspectorEntryParts,
  InspectorIndexEntry,
  InspectorIndexFile,
  InspectorRouteIndexFile,
  InspectorSnapshotFile,
} from './inspector-file-layout.types';
import type {
  RelationshipGraphAnalysis,
  RelationshipGraphEdge,
  RelationshipGraphFile,
  RelationshipGraphNode,
  RelationshipNodeKind,
  RelationshipReverseIndexFile,
} from './relationship-graph.types';

const DATABASE_FIELD_HINT =
  /(?:name|title|price|date|status|count|id|email|phone|amount|total|label|value|code|number)/i;
const STORAGE_PATH_HINT =
  /(?:^|[./_-])(?:image|avatar|file|upload|download|document|attachment|logo|media|photo|thumbnail)(?:$|[./_-])/i;

export function safeFileNameFromIdentityKey(identityKey: string): string {
  return identityKey.replace(/[^a-zA-Z0-9._-]+/g, '__');
}

export function safeRouteFileName(route: string): string {
  const trimmed = route.trim() || 'unknown';
  return trimmed.replace(/^\//, '').replace(/[^a-zA-Z0-9._-]+/g, '__') || 'root';
}

export function splitInspectorEntry(
  entry: InspectorDataEntry,
  route?: string
): InspectorEntryParts {
  const updatedAt = entry.updatedAt ?? new Date().toISOString();
  const identityKey = entry.dataUiIdentityKey;

  return {
    element: {
      identityKey,
      dataUiPath: entry.dataUiPath,
      dataUiFeature: entry.dataUiFeature,
      dataUiUuid: entry.dataUiUuid,
      dataUiInstanceId: entry.dataUiInstanceId ?? '',
      updatedAt,
      ...(route ? { route } : {}),
    },
    bindings: {
      identityKey,
      bindings: entry.bindings ?? [],
      updatedAt,
    },
    attributes: {
      identityKey,
      customAttributes: entry.customAttributes ?? [],
      inf1: entry.inf1 ?? '',
      inf2: entry.inf2 ?? '',
      inf3: entry.inf3 ?? '',
      attributesEnabled: entry.attributesEnabled ?? false,
      attribute1: entry.attribute1 ?? false,
      attribute2: entry.attribute2 ?? false,
      attribute3: entry.attribute3 ?? false,
      updatedAt,
    },
  };
}

export function composeInspectorEntry(parts: InspectorEntryParts): InspectorDataEntry {
  const { element, bindings, attributes } = parts;
  const entry: InspectorDataEntry = {
    bindings: bindings.bindings,
    customAttributes: attributes.customAttributes,
    databaseEnabled: false,
    databaseName: '',
    tableName: '',
    columnName: '',
    inf1: attributes.inf1,
    inf2: attributes.inf2,
    inf3: attributes.inf3,
    storageEnabled: false,
    storageMainFile: '',
    storageSubFile: '',
    attributesEnabled: attributes.attributesEnabled,
    attribute1: attributes.attribute1,
    attribute2: attributes.attribute2,
    attribute3: attributes.attribute3,
    dataUiPath: element.dataUiPath,
    dataUiFeature: element.dataUiFeature,
    dataUiUuid: element.dataUiUuid,
    dataUiInstanceId: element.dataUiInstanceId,
    dataUiIdentityKey: element.identityKey,
    updatedAt: bindings.updatedAt || attributes.updatedAt || element.updatedAt,
  };

  const primaryDb = bindings.bindings.find((b) => b.kind === 'database' && b.enabled);
  const primaryStorage = bindings.bindings.find((b) => b.kind === 'storage' && b.enabled);
  if (primaryDb) {
    entry.databaseEnabled = true;
    entry.databaseName = primaryDb.databaseName ?? '';
    entry.tableName = primaryDb.tableName ?? '';
    entry.columnName = primaryDb.columnName ?? '';
  }
  if (primaryStorage) {
    entry.storageEnabled = true;
    entry.storageMainFile = primaryStorage.storageMainFile ?? '';
    entry.storageSubFile = primaryStorage.storageSubFile ?? '';
  }

  return entry;
}

export function buildInspectorIndex(inspectorData: InspectorDataMap): InspectorIndexFile {
  const entries: InspectorIndexEntry[] = Object.values(inspectorData).map((entry) => {
    const bindings = entry.bindings ?? [];
    const hasDatabase = bindings.some((b) => b.kind === 'database' && b.enabled);
    const hasStorage = bindings.some((b) => b.kind === 'storage' && b.enabled);
    return {
      identityKey: entry.dataUiIdentityKey,
      uuid: entry.dataUiUuid,
      instanceId: entry.dataUiInstanceId ?? '',
      path: entry.dataUiPath,
      feature: entry.dataUiFeature,
      updatedAt: entry.updatedAt ?? '',
      hasBindings: bindings.length > 0,
      bindingCount: bindings.length,
      hasStorage,
      hasDatabase,
    };
  });

  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    entries: entries.sort((a, b) => a.identityKey.localeCompare(b.identityKey)),
  };
}

export function buildRouteIndex(
  inspectorData: InspectorDataMap,
  routeByKey?: Record<string, string>
): Record<string, InspectorRouteIndexFile> {
  const routes: Record<string, Set<string>> = {};

  for (const entry of Object.values(inspectorData)) {
    const route = routeByKey?.[entry.dataUiIdentityKey] ?? '/unknown';
    const safe = safeRouteFileName(route);
    if (!routes[safe]) routes[safe] = new Set();
    routes[safe].add(entry.dataUiIdentityKey);
  }

  const result: Record<string, InspectorRouteIndexFile> = {};
  const now = new Date().toISOString();
  for (const [safeRoute, keys] of Object.entries(routes)) {
    result[safeRoute] = {
      route: safeRoute,
      identityKeys: Array.from(keys).sort(),
      updatedAt: now,
    };
  }
  return result;
}

function bindingKinds(bindings: ElementBinding[]): RelationshipNodeKind[] {
  const kinds = new Set<RelationshipNodeKind>();
  for (const binding of bindings) {
    if (binding.kind === 'database') kinds.add('database');
    if (binding.kind === 'storage') kinds.add('storage');
    if (binding.kind === 'element') kinds.add('element');
    if (binding.kind === 'derived') kinds.add('derived');
  }
  return Array.from(kinds);
}

function edgeId(from: string, to: string, kind: string, bindingId?: string): string {
  return `${from}::${to}::${kind}::${bindingId ?? 'none'}`;
}

export function buildRelationshipsGraph(inspectorData: InspectorDataMap): RelationshipGraphFile {
  const nodes: RelationshipGraphNode[] = [];
  const edges: RelationshipGraphEdge[] = [];
  const edgeKeys = new Set<string>();

  const addEdge = (edge: RelationshipGraphEdge) => {
    if (edgeKeys.has(edge.id)) return;
    edgeKeys.add(edge.id);
    edges.push(edge);
  };

  for (const entry of Object.values(inspectorData)) {
    const bindings = entry.bindings ?? [];
    nodes.push({
      identityKey: entry.dataUiIdentityKey,
      uuid: entry.dataUiUuid,
      path: entry.dataUiPath,
      feature: entry.dataUiFeature,
      bindingCount: bindings.length,
      kinds: bindingKinds(bindings),
    });

    for (const binding of bindings) {
      if (!binding.enabled) continue;

      if (binding.kind === 'element' && binding.linkedElementKey) {
        addEdge({
          id: edgeId(entry.dataUiIdentityKey, binding.linkedElementKey, 'inherits_binding', binding.id),
          fromElementKey: entry.dataUiIdentityKey,
          toElementKey: binding.linkedElementKey,
          fromBindingId: binding.id,
          ...(binding.linkedBindingId ? { toBindingId: binding.linkedBindingId } : {}),
          relationKind:
            binding.linkMode === 'depends_on'
              ? 'depends_on'
              : binding.linkMode === 'derived_from'
                ? 'derived_from'
                : 'inherits_binding',
          confidence: binding.confidence === 'confirmed' ? 'high' : 'medium',
          reason: binding.reason || 'Explicit element link binding.',
          createdFrom: 'explicit_binding',
        });
      }
    }
  }

  const entries = Object.values(inspectorData);
  for (let i = 0; i < entries.length; i += 1) {
    for (let j = i + 1; j < entries.length; j += 1) {
      const a = entries[i];
      const b = entries[j];
      const aBindings = a.bindings ?? [];
      const bBindings = b.bindings ?? [];

      for (const ab of aBindings) {
        if (!ab.enabled || ab.kind !== 'database') continue;
        for (const bb of bBindings) {
          if (!bb.enabled || bb.kind !== 'database') continue;
          if (ab.databaseName !== bb.databaseName) continue;

          if (
            ab.tableName &&
            bb.tableName &&
            ab.columnName &&
            bb.columnName &&
            ab.tableName === bb.tableName &&
            ab.columnName === bb.columnName
          ) {
            addEdge({
              id: edgeId(a.dataUiIdentityKey, b.dataUiIdentityKey, 'shares_database_table', ab.id),
              fromElementKey: a.dataUiIdentityKey,
              toElementKey: b.dataUiIdentityKey,
              fromBindingId: ab.id,
              toBindingId: bb.id,
              relationKind: 'shares_database_table',
              confidence: 'high',
              reason: `Shared column ${ab.databaseName}.${ab.tableName}.${ab.columnName}`,
              createdFrom: 'inferred_shared_database',
            });
          } else if (ab.tableName && bb.tableName && ab.tableName === bb.tableName) {
            addEdge({
              id: edgeId(a.dataUiIdentityKey, b.dataUiIdentityKey, 'same_database', ab.id),
              fromElementKey: a.dataUiIdentityKey,
              toElementKey: b.dataUiIdentityKey,
              fromBindingId: ab.id,
              toBindingId: bb.id,
              relationKind: 'same_database',
              confidence: 'medium',
              reason: `Shared table ${ab.databaseName}.${ab.tableName}`,
              createdFrom: 'inferred_shared_database',
            });
          }
        }
      }

      for (const ab of aBindings) {
        if (!ab.enabled || ab.kind !== 'storage') continue;
        for (const bb of bBindings) {
          if (!bb.enabled || bb.kind !== 'storage') continue;
          if (ab.storageMainFile !== bb.storageMainFile) continue;
          if (ab.storageSubFile && bb.storageSubFile && ab.storageSubFile === bb.storageSubFile) {
            addEdge({
              id: edgeId(a.dataUiIdentityKey, b.dataUiIdentityKey, 'shares_storage_folder', ab.id),
              fromElementKey: a.dataUiIdentityKey,
              toElementKey: b.dataUiIdentityKey,
              fromBindingId: ab.id,
              toBindingId: bb.id,
              relationKind: 'shares_storage_folder',
              confidence: 'high',
              reason: `Shared storage ${ab.storageMainFile}/${ab.storageSubFile}`,
              createdFrom: 'inferred_shared_storage',
            });
          }
        }
      }
    }
  }

  return {
    nodes: nodes.sort((a, b) => a.identityKey.localeCompare(b.identityKey)),
    edges,
    updatedAt: new Date().toISOString(),
  };
}

export function buildReverseIndex(graph: RelationshipGraphFile): RelationshipReverseIndexFile {
  const index: RelationshipReverseIndexFile = {};

  const ensure = (key: string) => {
    if (!index[key]) index[key] = { referencedBy: [], references: [] };
  };

  for (const node of graph.nodes) {
    ensure(node.identityKey);
  }

  for (const edge of graph.edges) {
    ensure(edge.fromElementKey);
    ensure(edge.toElementKey);
    if (!index[edge.fromElementKey].references.includes(edge.toElementKey)) {
      index[edge.fromElementKey].references.push(edge.toElementKey);
    }
    if (!index[edge.toElementKey].referencedBy.includes(edge.fromElementKey)) {
      index[edge.toElementKey].referencedBy.push(edge.fromElementKey);
    }
  }

  for (const key of Object.keys(index)) {
    index[key].referencedBy.sort();
    index[key].references.sort();
  }

  return index;
}

export function buildInspectorSnapshot(inspectorData: InspectorDataMap): InspectorSnapshotFile {
  const entries = Object.values(inspectorData).sort((a, b) =>
    (a.dataUiIdentityKey ?? '').localeCompare(b.dataUiIdentityKey ?? '')
  );
  const totalBindings = entries.reduce((sum, entry) => sum + (entry.bindings?.length ?? 0), 0);
  return {
    updatedAt: new Date().toISOString(),
    totalElements: entries.length,
    totalBindings,
    entries,
  };
}

export function analyzeRelationshipGraph(
  graph: RelationshipGraphFile,
  inspectorData: InspectorDataMap
): RelationshipGraphAnalysis {
  const connectionCount = new Map<string, number>();
  for (const edge of graph.edges) {
    connectionCount.set(edge.fromElementKey, (connectionCount.get(edge.fromElementKey) ?? 0) + 1);
    connectionCount.set(edge.toElementKey, (connectionCount.get(edge.toElementKey) ?? 0) + 1);
  }

  const mostConnected = Array.from(connectionCount.entries())
    .map(([identityKey, count]) => ({ identityKey, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const missingLinkedTargets: string[] = [];
  for (const edge of graph.edges) {
    if (edge.createdFrom !== 'explicit_binding') continue;
    if (!inspectorData[edge.toElementKey]) {
      missingLinkedTargets.push(edge.toElementKey);
    }
  }

  const adjacency = new Map<string, string[]>();
  for (const edge of graph.edges) {
    const list = adjacency.get(edge.fromElementKey) ?? [];
    list.push(edge.toElementKey);
    adjacency.set(edge.fromElementKey, list);
  }

  const circularDependencies: string[][] = [];
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const stack: string[] = [];

  const dfs = (node: string) => {
    if (visiting.has(node)) {
      const cycleStart = stack.indexOf(node);
      if (cycleStart >= 0) circularDependencies.push(stack.slice(cycleStart).concat(node));
      return;
    }
    if (visited.has(node)) return;
    visiting.add(node);
    stack.push(node);
    for (const next of adjacency.get(node) ?? []) dfs(next);
    stack.pop();
    visiting.delete(node);
    visited.add(node);
  };

  for (const node of graph.nodes) dfs(node.identityKey);

  const dbGroups = new Map<string, Set<string>>();
  const storageGroups = new Map<string, Set<string>>();

  for (const entry of Object.values(inspectorData)) {
    for (const binding of entry.bindings ?? []) {
      if (!binding.enabled) continue;
      if (binding.kind === 'database' && binding.databaseName && binding.tableName && binding.columnName) {
        const key = `${binding.databaseName}.${binding.tableName}.${binding.columnName}`;
        if (!dbGroups.has(key)) dbGroups.set(key, new Set());
        dbGroups.get(key)!.add(entry.dataUiIdentityKey);
      }
      if (binding.kind === 'storage' && binding.storageMainFile && binding.storageSubFile) {
        const key = `${binding.storageMainFile}/${binding.storageSubFile}`;
        if (!storageGroups.has(key)) storageGroups.set(key, new Set());
        storageGroups.get(key)!.add(entry.dataUiIdentityKey);
      }
    }
  }

  return {
    nodeCount: graph.nodes.length,
    edgeCount: graph.edges.length,
    mostConnected,
    missingLinkedTargets: Array.from(new Set(missingLinkedTargets)),
    circularDependencies,
    sharedDatabaseGroups: Array.from(dbGroups.entries())
      .filter(([, members]) => members.size > 1)
      .map(([key, members]) => ({ key, members: Array.from(members).sort() }))
      .slice(0, 10),
    sharedStorageGroups: Array.from(storageGroups.entries())
      .filter(([, members]) => members.size > 1)
      .map(([key, members]) => ({ key, members: Array.from(members).sort() }))
      .slice(0, 10),
  };
}

export function isLikelyDatabaseElement(el: InspectElementSnapshot): boolean {
  const tag = el.tagName.toLowerCase();
  if (['input', 'select', 'textarea'].includes(tag)) return true;
  if (tag === 'button' && /form|submit|save|field/i.test(el.path)) return true;
  if (['table', 'tr', 'td', 'li'].includes(tag)) return true;
  if (DATABASE_FIELD_HINT.test(el.path) || DATABASE_FIELD_HINT.test(el.id)) return true;
  return false;
}

export function isLikelyStorageElement(el: InspectElementSnapshot): boolean {
  const tag = el.tagName.toLowerCase();
  if (tag === 'img') return true;
  if (STORAGE_PATH_HINT.test(el.path) || STORAGE_PATH_HINT.test(el.id)) return true;
  return false;
}

export function isExcludedFromFrames(el: InspectElementSnapshot): boolean {
  if (el.rect.width < 8 || el.rect.height < 8) return true;
  if (el.rect.width * el.rect.height < 64) return true;
  if (/decorative|spacer|structure/i.test(el.path) || /SPACER|DECORATIVE/i.test(el.id)) return true;
  if (/ui-inspector|devtools/i.test(el.path)) return true;
  return false;
}

export function getElementIdentityKey(el: InspectElementSnapshot): string {
  if (el.identityKey) return el.identityKey;
  if (el.instanceId) return `${el.uuid}:${el.instanceId}`;
  return el.uuid;
}
