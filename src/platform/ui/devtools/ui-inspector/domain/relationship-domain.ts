import { createElementLinkBinding, resolveEntryBindings } from '../data/element-binding-utils';
import type { CreateElementLinkBindingInput, ElementBinding } from '../data/element-binding.types';
import type { InspectorDataEntry, InspectorDataMap } from '../data/inspector-config.types';
import {
  buildRelationshipsGraph,
  buildReverseIndex,
} from '../data/inspector-file-layout-utils';
import type { RelationshipGraphFile } from '../data/relationship-graph.types';

import { createDomainError } from './domain-errors';
import type { ElementRelationshipDetails } from './domain-types';
import { patchBindingInEntry, removeBindingFromEntry, upsertBinding } from './element-domain';

export function createElementRelationBinding(
  entry: InspectorDataEntry,
  input: CreateElementLinkBindingInput
): InspectorDataEntry {
  if (!input.linkedElementKey.trim()) {
    throw createDomainError('INVALID_BINDING', 'linkedElementKey is required.');
  }
  if (input.linkedElementKey === entry.dataUiIdentityKey) {
    throw createDomainError('INVALID_BINDING', 'Element cannot link to itself.');
  }
  const binding = createElementLinkBinding(input);
  return upsertBinding(entry, binding);
}

export function updateElementRelationBinding(
  entry: InspectorDataEntry,
  bindingId: string,
  patch: Partial<ElementBinding>
): InspectorDataEntry {
  if (patch.linkedElementKey === entry.dataUiIdentityKey) {
    throw createDomainError('INVALID_BINDING', 'Element cannot link to itself.');
  }
  return patchBindingInEntry(entry, bindingId, patch);
}

export function removeElementRelationBinding(entry: InspectorDataEntry, bindingId: string): InspectorDataEntry {
  return removeBindingFromEntry(entry, bindingId);
}

export function setElementRelationEnabled(
  entry: InspectorDataEntry,
  bindingId: string,
  enabled: boolean
): InspectorDataEntry {
  return patchBindingInEntry(entry, bindingId, { enabled });
}

function explicitRelationsForEntry(
  entry: InspectorDataEntry,
  direction: 'outgoing' | 'incoming',
  inspectorData: InspectorDataMap
): ElementRelationshipDetails[] {
  const identityKey = entry.dataUiIdentityKey;
  const results: ElementRelationshipDetails[] = [];

  if (direction === 'outgoing') {
    for (const binding of resolveEntryBindings(entry, { databases: [] })) {
      if (binding.kind !== 'element' || !binding.enabled || !binding.linkedElementKey) continue;
      results.push({
        bindingId: binding.id,
        fromElementKey: identityKey,
        toElementKey: binding.linkedElementKey,
        relationType: binding.relationType,
        createdFrom: 'explicit_binding',
        confidence: binding.confidence,
        ...(binding.reason ? { reason: binding.reason } : {}),
      });
    }
    return results;
  }

  for (const other of Object.values(inspectorData)) {
    for (const binding of resolveEntryBindings(other, { databases: [] })) {
      if (binding.kind !== 'element' || !binding.enabled || binding.linkedElementKey !== identityKey) continue;
      results.push({
        bindingId: binding.id,
        fromElementKey: other.dataUiIdentityKey,
        toElementKey: identityKey,
        relationType: binding.relationType,
        createdFrom: 'explicit_binding',
        confidence: binding.confidence,
        ...(binding.reason ? { reason: binding.reason } : {}),
      });
    }
  }
  return results;
}

export function getElementOutgoingRelations(
  inspectorData: InspectorDataMap,
  identityKey: string
): ElementRelationshipDetails[] {
  const entry = inspectorData[identityKey];
  if (!entry) return [];
  return explicitRelationsForEntry(entry, 'outgoing', inspectorData);
}

export function getElementIncomingRelations(
  inspectorData: InspectorDataMap,
  identityKey: string
): ElementRelationshipDetails[] {
  const entry = inspectorData[identityKey];
  if (!entry) {
    return Object.values(inspectorData).flatMap((other) =>
      explicitRelationsForEntry(other, 'outgoing', inspectorData).filter((rel) => rel.toElementKey === identityKey)
    );
  }
  return explicitRelationsForEntry(entry, 'incoming', inspectorData);
}

export function getElementDirectRelations(
  inspectorData: InspectorDataMap,
  identityKey: string
): ElementRelationshipDetails[] {
  const outgoing = getElementOutgoingRelations(inspectorData, identityKey);
  const incoming = getElementIncomingRelations(inspectorData, identityKey);
  const seen = new Set<string>();
  return [...outgoing, ...incoming].filter((rel) => {
    const key = `${rel.fromElementKey}->${rel.toElementKey}:${rel.bindingId}:${rel.createdFrom}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function getElementsSharingDatabase(
  inspectorData: InspectorDataMap,
  databaseName: string,
  tableName?: string,
  columnName?: string
): string[] {
  const keys = new Set<string>();
  for (const entry of Object.values(inspectorData)) {
    for (const binding of resolveEntryBindings(entry, { databases: [] })) {
      if (!binding.enabled || binding.kind !== 'database') continue;
      if ((binding.databaseName ?? '') !== databaseName) continue;
      if (tableName && (binding.tableName ?? '') !== tableName) continue;
      if (columnName && (binding.columnName ?? '') !== columnName) continue;
      keys.add(entry.dataUiIdentityKey);
    }
  }
  return Array.from(keys).sort();
}

export function getElementsSharingStorage(
  inspectorData: InspectorDataMap,
  mainFileName: string
): string[] {
  const keys = new Set<string>();
  for (const entry of Object.values(inspectorData)) {
    for (const binding of resolveEntryBindings(entry, { databases: [] })) {
      if (!binding.enabled || binding.kind !== 'storage') continue;
      if ((binding.storageMainFile ?? '') !== mainFileName) continue;
      keys.add(entry.dataUiIdentityKey);
    }
  }
  return Array.from(keys).sort();
}

export function buildElementRelationshipGraph(inspectorData: InspectorDataMap): RelationshipGraphFile {
  return buildRelationshipsGraph(inspectorData);
}

export function getRelatedElementKeys(inspectorData: InspectorDataMap, identityKey: string): string[] {
  const reverseIndex = buildReverseIndex(buildRelationshipsGraph(inspectorData));
  const node = reverseIndex[identityKey];
  if (!node) return [];
  return Array.from(new Set([...node.references, ...node.referencedBy])).sort();
}

export function removeRelationsToMissingElements(inspectorData: InspectorDataMap): InspectorDataMap {
  const known = new Set(Object.keys(inspectorData));
  const next: InspectorDataMap = {};
  for (const [key, entry] of Object.entries(inspectorData)) {
    const bindings = resolveEntryBindings(entry, { databases: [] }).filter((binding) => {
      if (binding.kind !== 'element' || !binding.linkedElementKey) return true;
      return known.has(binding.linkedElementKey);
    });
    next[key] = { ...entry, bindings };
  }
  return next;
}

export type RelationValidationIssue = {
  elementKey: string;
  bindingId: string;
  message: string;
  code: 'RELATION_TARGET_MISSING' | 'SELF_LINK';
};

export function validateElementRelations(inspectorData: InspectorDataMap): RelationValidationIssue[] {
  const known = new Set(Object.keys(inspectorData));
  const issues: RelationValidationIssue[] = [];
  for (const entry of Object.values(inspectorData)) {
    for (const binding of resolveEntryBindings(entry, { databases: [] })) {
      if (binding.kind !== 'element' || !binding.enabled) continue;
      if (!binding.linkedElementKey) continue;
      if (binding.linkedElementKey === entry.dataUiIdentityKey) {
        issues.push({
          elementKey: entry.dataUiIdentityKey,
          bindingId: binding.id,
          message: 'Element cannot link to itself.',
          code: 'SELF_LINK',
        });
        continue;
      }
      if (!known.has(binding.linkedElementKey)) {
        issues.push({
          elementKey: entry.dataUiIdentityKey,
          bindingId: binding.id,
          message: `Linked element "${binding.linkedElementKey}" not found.`,
          code: 'RELATION_TARGET_MISSING',
        });
      }
    }
  }
  return issues;
}

export function getInferredSharedRelations(
  inspectorData: InspectorDataMap
): ElementRelationshipDetails[] {
  const graph = buildRelationshipsGraph(inspectorData);
  return graph.edges
    .filter((edge) => edge.createdFrom !== 'explicit_binding')
    .map((edge) => ({
      bindingId: edge.id,
      fromElementKey: edge.fromElementKey,
      toElementKey: edge.toElementKey,
      relationKind: edge.relationKind,
      createdFrom:
        edge.createdFrom === 'inferred_shared_storage'
          ? 'inferred_shared_storage'
          : 'inferred_shared_database',
      confidence: edge.confidence === 'high' ? 'high' : edge.confidence === 'medium' ? 'medium' : 'low',
      reason: edge.reason,
    }));
}
