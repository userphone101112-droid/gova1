import type { FrameCandidate, InspectElementSnapshot } from '../../UiInspectorFrameBridge';
import {
  createDatabaseBinding,
  createElementLinkBinding,
  createStorageBinding,
  resolveEntryBindings,
} from '../data/element-binding-utils';
import type { ElementAttribute } from '../data/element-binding.types';
import type { InspectorDataEntry, InspectorDataMap } from '../data/inspector-config.types';
import { getElementIdentityKey, isExcludedFromFrames } from '../data/inspector-file-layout-utils';

import { applyDatabaseRenameToInspectorData } from './database-domain';
import {
  createDatabaseBindingForElement,
  getDatabaseConnectionDetails,
  removeDatabaseBinding,
} from './database-domain';
import type { DatabaseRenameMap, DatabaseSelectionInput, ElementRelationInput, FrameEligibleOptions, InspectorDomainContext, SimulationSummary, StorageRenameMap, StorageSelectionInput } from './domain-types';
import {
  getElementProfile,
  getEnabledDatabaseBindings,
  getEnabledElementRelationBindings,
  getEnabledStorageBindings,
  hasAnySavedBinding,
  updateElementAttributes,
} from './element-domain';
import {
  getElementDirectRelations,
  getElementIncomingRelations,
  getElementOutgoingRelations,
  getElementsSharingDatabase,
  getElementsSharingStorage,
  getRelatedElementKeys,
  validateElementRelations,
  createElementRelationBinding,
  removeElementRelationBinding,
} from './relationship-domain';
import {
  applyStorageRenameToInspectorData,
  createStorageBindingForElement,
  getStorageConnectionDetails,
  removeStorageBinding,
} from './storage-domain';

function frameLabel(kind: FrameCandidate['kind']): string {
  switch (kind) {
    case 'database':
      return 'DB';
    case 'storage':
      return 'Storage';
    case 'linked':
      return 'Link';
    case 'mixed':
      return 'Mixed';
    default:
      return '?';
  }
}

function mergeKind(
  current: FrameCandidate['kind'] | null,
  next: FrameCandidate['kind']
): FrameCandidate['kind'] {
  if (!current) return next;
  if (current === next) return current;
  if (current === 'mixed' || next === 'mixed') return 'mixed';
  const kinds = new Set([current, next]);
  if (kinds.has('database') && kinds.has('storage')) return 'mixed';
  if (kinds.has('linked') && (kinds.has('database') || kinds.has('storage'))) return 'mixed';
  if (kinds.has('linked')) return 'linked';
  return next;
}

export function getInspectorElementProfile(context: InspectorDomainContext, identityKey: string) {
  const profile = getElementProfile(context.inspectorData, identityKey);
  if (!profile) return null;
  return {
    ...profile,
    databaseConnections: getDatabaseConnectionDetails(context.inspectorData[identityKey]!),
    storageConnections: getStorageConnectionDetails(context.inspectorData[identityKey]!),
    outgoingRelations: getElementOutgoingRelations(context.inspectorData, identityKey),
    incomingRelations: getElementIncomingRelations(context.inspectorData, identityKey),
    directRelations: getElementDirectRelations(context.inspectorData, identityKey),
    relatedElementKeys: getRelatedElementKeys(context.inspectorData, identityKey),
  };
}

export function saveElementDatabaseSelection(
  entry: InspectorDataEntry,
  selection: DatabaseSelectionInput
): InspectorDataEntry {
  return createDatabaseBindingForElement(entry, {
    databaseName: selection.databaseName,
    tableName: selection.tableName,
    columnName: selection.columnName,
    enabled: selection.enabled ?? true,
    confidence: selection.confidence ?? 'confirmed',
    ...(selection.reason ? { reason: selection.reason } : {}),
  });
}

export function saveElementStorageSelection(
  entry: InspectorDataEntry,
  selection: StorageSelectionInput,
  context: Pick<InspectorDomainContext, 'storageRef' | 'databaseRef'>
): InspectorDataEntry {
  return createStorageBindingForElement(
    entry,
    {
      storageMainFile: selection.storageMainFile,
      storageSubFile: selection.storageSubFile ?? '',
      enabled: selection.enabled ?? true,
      confidence: selection.confidence ?? 'confirmed',
      ...(selection.reason ? { reason: selection.reason } : {}),
    },
    {
      storageRef: context.storageRef,
      databaseRef: context.databaseRef,
      ...(selection.anchorDatabaseColumn ? { anchorDatabaseColumn: selection.anchorDatabaseColumn } : {}),
    }
  );
}

export function saveElementAttributes(
  entry: InspectorDataEntry,
  attributes: Partial<{
    attributesEnabled: boolean;
    attribute1: boolean;
    attribute2: boolean;
    attribute3: boolean;
    customAttributes: ElementAttribute[];
  }>
): InspectorDataEntry {
  return updateElementAttributes(entry, attributes);
}

export function saveElementRelation(entry: InspectorDataEntry, relationInput: ElementRelationInput): InspectorDataEntry {
  return createElementRelationBinding(entry, {
    linkedElementKey: relationInput.linkedElementKey,
    enabled: relationInput.enabled ?? true,
    confidence: relationInput.confidence ?? 'medium',
    ...(relationInput.linkedBindingId ? { linkedBindingId: relationInput.linkedBindingId } : {}),
    ...(relationInput.linkMode ? { linkMode: relationInput.linkMode } : {}),
    ...(relationInput.relationType ? { relationType: relationInput.relationType } : {}),
    ...(relationInput.reason ? { reason: relationInput.reason } : {}),
  });
}

export function removeElementDatabaseConnection(entry: InspectorDataEntry, bindingId: string): InspectorDataEntry {
  return removeDatabaseBinding(entry, bindingId);
}

export function removeElementStorageConnection(entry: InspectorDataEntry, bindingId: string): InspectorDataEntry {
  return removeStorageBinding(entry, bindingId);
}

export function removeElementRelation(entry: InspectorDataEntry, bindingId: string): InspectorDataEntry {
  return removeElementRelationBinding(entry, bindingId);
}

export { applyDatabaseRenameToInspectorData, applyStorageRenameToInspectorData };

export function getFrameEligibleElements(
  inspectorData: InspectorDataMap,
  elements: InspectElementSnapshot[],
  options?: FrameEligibleOptions
): FrameCandidate[] {
  const selectedKey = options?.selectedIdentityKey ?? null;
  const reverseIndex = options?.reverseIndex ?? {};
  const byScanKey = new Map<string, FrameCandidate>();

  const upsert = (
    el: InspectElementSnapshot,
    kind: FrameCandidate['kind'],
    confidence: FrameCandidate['confidence'],
    reason: string
  ) => {
    if (isExcludedFromFrames(el)) return;
    const identityKey = getElementIdentityKey(el);
    const existing = byScanKey.get(el.scanKey);
    const nextKind = mergeKind(existing?.kind ?? null, kind);
    const reasons = existing ? [...existing.reasons] : [];
    if (!reasons.includes(reason)) reasons.push(reason);
    const confidenceRank = { confirmed: 4, high: 3, medium: 2, low: 1 };
    const nextConfidence =
      existing && confidenceRank[existing.confidence] > confidenceRank[confidence]
        ? existing.confidence
        : confidence;

    byScanKey.set(el.scanKey, {
      scanKey: el.scanKey,
      identityKey,
      uuid: el.uuid,
      label: frameLabel(nextKind),
      kind: nextKind,
      confidence: nextConfidence,
      reasons,
    });
  };

  for (const el of elements) {
    const identityKey = getElementIdentityKey(el);
    const saved = inspectorData[identityKey] ?? inspectorData[el.uuid];

    if (saved) {
      const dbBindings = getEnabledDatabaseBindings(saved);
      const storageBindings = getEnabledStorageBindings(saved);
      const relationBindings = getEnabledElementRelationBindings(saved);

      for (const binding of dbBindings) {
        upsert(
          el,
          'database',
          binding.confidence === 'confirmed' ? 'confirmed' : 'high',
          'Saved database binding.'
        );
      }
      for (const binding of storageBindings) {
        upsert(
          el,
          'storage',
          binding.confidence === 'confirmed' ? 'confirmed' : 'high',
          'Saved storage binding.'
        );
      }
      for (const _binding of relationBindings) {
        upsert(el, 'linked', 'high', 'Saved element relationship.');
      }
      if (dbBindings.length > 0 && storageBindings.length > 0) {
        upsert(el, 'mixed', 'confirmed', 'Saved database and storage bindings.');
      }
    }

    for (const entry of Object.values(inspectorData)) {
      for (const binding of resolveEntryBindings(entry, { databases: [] })) {
        if (!binding.enabled || binding.kind !== 'element') continue;
        if (binding.linkedElementKey === identityKey) {
          upsert(el, 'linked', 'high', 'Saved element relationship.');
        }
      }
    }

    if (selectedKey && selectedKey !== identityKey) {
      const selectedRelations = reverseIndex[selectedKey];
      if (selectedRelations) {
        const related =
          selectedRelations.references.includes(identityKey) ||
          selectedRelations.referencedBy.includes(identityKey);
        if (related) {
          upsert(el, 'linked', 'high', 'Related to selected element.');
        }
      }
    }
  }

  return Array.from(byScanKey.values()).sort((a, b) => a.scanKey.localeCompare(b.scanKey));
}

export function getSimulationSummary(
  inspectorData: InspectorDataMap,
  databaseRef: InspectorDomainContext['databaseRef'],
  storageRef: InspectorDomainContext['storageRef']
): SimulationSummary {
  void databaseRef;
  void storageRef;

  const entries = Object.values(inspectorData);
  const dbCounts = new Map<string, number>();
  const tableCounts = new Map<string, number>();
  const storageCounts = new Map<string, number>();
  let databaseLinkedElements = 0;
  let storageLinkedElements = 0;
  let relationLinkedElements = 0;

  for (const entry of entries) {
    const db = getEnabledDatabaseBindings(entry);
    const storage = getEnabledStorageBindings(entry);
    const relations = getEnabledElementRelationBindings(entry);
    if (db.length) databaseLinkedElements += 1;
    if (storage.length) storageLinkedElements += 1;
    if (relations.length) relationLinkedElements += 1;

    for (const binding of db) {
      const dbName = binding.databaseName ?? '';
      if (dbName) dbCounts.set(dbName, (dbCounts.get(dbName) ?? 0) + 1);
      const tableKey = `${binding.databaseName ?? ''}.${binding.tableName ?? ''}`;
      if (binding.tableName) tableCounts.set(tableKey, (tableCounts.get(tableKey) ?? 0) + 1);
    }
    for (const binding of storage) {
      const key = binding.storageSubFile
        ? `${binding.storageMainFile}/${binding.storageSubFile}`
        : binding.storageMainFile ?? '';
      if (key) storageCounts.set(key, (storageCounts.get(key) ?? 0) + 1);
    }
  }

  const brokenRelations = validateElementRelations(inspectorData)
    .filter((issue) => issue.code === 'RELATION_TARGET_MISSING')
    .map((issue) => ({
      fromElementKey: issue.elementKey,
      toElementKey: '',
      bindingId: issue.bindingId,
    }));

  const boundKeys = new Set<string>();
  for (const entry of entries) {
    if (hasAnySavedBinding(entry)) boundKeys.add(entry.dataUiIdentityKey);
  }

  return {
    totalSavedElements: entries.length,
    databaseLinkedElements,
    storageLinkedElements,
    relationLinkedElements,
    unboundElements: entries.filter((entry) => !hasAnySavedBinding(entry)).length,
    topDatabases: Array.from(dbCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
    topTables: Array.from(tableCounts.entries())
      .map(([key, count]) => ({ key, count }))
      .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key)),
    topStorageLocations: Array.from(storageCounts.entries())
      .map(([key, count]) => ({ key, count }))
      .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key)),
    brokenRelations,
  };
}

export {
  getElementOutgoingRelations,
  getElementIncomingRelations,
  getElementDirectRelations,
  getElementsSharingDatabase,
  getElementsSharingStorage,
  getRelatedElementKeys,
  validateElementRelations,
  createDatabaseBinding,
  createStorageBinding,
  createElementLinkBinding,
};

export {
  getPageBindingSummary,
  listBoundElementsOnPage,
  listDatabaseLinkedElementsOnPage,
  listStorageLinkedElementsOnPage,
  listLiveBoundElementsOnPage,
  resolvePageFeatureFromRoute,
} from './page-domain';

export {
  validateStorageRefGovernance,
  validateInspectorDataGovernance,
  listLegacyReadonlyStorageLocations,
  isLegacyStorageLocation,
} from './governance-domain';

export { listSchemaRelationships, linkStorageSubFileToDatabaseColumn, setColumnForeignKey } from './schema-relationship-domain';

export type { DatabaseRenameMap, StorageRenameMap };
