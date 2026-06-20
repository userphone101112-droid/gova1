import type { InspectElementSnapshot } from '../../UiInspectorFrameBridge';
import {
  deleteBinding,
  getPrimaryDatabaseBinding,
  getPrimaryStorageBinding,
  normalizeBindings,
  resolveEntryBindings,
  syncLegacyFieldsFromBindings,
  updateBinding,
} from '../data/element-binding-utils';
import type { ElementAttribute, ElementBinding } from '../data/element-binding.types';
import { getStorageKey } from '../data/inspector-config-storage';
import type { InspectorDataEntry, InspectorDataMap } from '../data/inspector-config.types';

import type { ElementDataProfile, ElementLegacyFields, ProfileOrEntry } from './domain-types';

function legacyFieldsFromEntry(entry: InspectorDataEntry): ElementLegacyFields {
  return { inf1: entry.inf1, inf2: entry.inf2, inf3: entry.inf3 };
}

function profileFromEntry(entry: InspectorDataEntry, identityKey: string): ElementDataProfile {
  const bindings = resolveEntryBindings(entry, { databases: [] });
  const databaseBindings = bindings.filter((b) => b.kind === 'database');
  const storageBindings = bindings.filter((b) => b.kind === 'storage');
  const elementRelations = bindings.filter((b) => b.kind === 'element');
  const hasDatabaseBinding = databaseBindings.some((b) => b.enabled);
  const hasStorageBinding = storageBindings.some((b) => b.enabled);
  const hasRelations = elementRelations.some((b) => b.enabled && Boolean(b.linkedElementKey));

  return {
    identityKey,
    element: {
      identityKey,
      uuid: entry.dataUiUuid,
      instanceId: entry.dataUiInstanceId,
      path: entry.dataUiPath,
      feature: entry.dataUiFeature,
    },
    databaseBindings,
    storageBindings,
    elementRelations,
    customAttributes: entry.customAttributes ?? [],
    legacyFields: legacyFieldsFromEntry(entry),
    hasDatabaseBinding,
    hasStorageBinding,
    hasRelations,
    ...(entry.updatedAt ? { updatedAt: entry.updatedAt } : {}),
  };
}

function asEntry(value: ProfileOrEntry): InspectorDataEntry {
  if ('databaseBindings' in value) {
    throw new Error('Expected InspectorDataEntry, received ElementDataProfile.');
  }
  return value;
}

export function getElementProfile(
  inspectorData: InspectorDataMap,
  identityKey: string
): ElementDataProfile | null {
  const entry = inspectorData[identityKey];
  if (!entry) return null;
  return profileFromEntry(entry, identityKey);
}

export function getElementProfileBySnapshot(
  inspectorData: InspectorDataMap,
  snapshot: InspectElementSnapshot
): ElementDataProfile | null {
  const identityKey = getStorageKey(snapshot);
  const entry = inspectorData[identityKey] ?? inspectorData[snapshot.uuid];
  if (!entry) return null;
  return profileFromEntry(entry, identityKey);
}

export function hasDatabaseBinding(profileOrEntry: ProfileOrEntry): boolean {
  if ('hasDatabaseBinding' in profileOrEntry) return profileOrEntry.hasDatabaseBinding;
  return getEnabledDatabaseBindings(profileOrEntry).length > 0;
}

export function hasStorageBinding(profileOrEntry: ProfileOrEntry): boolean {
  if ('hasStorageBinding' in profileOrEntry) return profileOrEntry.hasStorageBinding;
  return getEnabledStorageBindings(profileOrEntry).length > 0;
}

export function hasAnySavedBinding(profileOrEntry: ProfileOrEntry): boolean {
  if ('hasDatabaseBinding' in profileOrEntry) {
    return (
      profileOrEntry.hasDatabaseBinding ||
      profileOrEntry.hasStorageBinding ||
      profileOrEntry.hasRelations
    );
  }
  const entry = asEntry(profileOrEntry);
  const bindings = resolveEntryBindings(entry, { databases: [] });
  return bindings.some((b) => b.enabled);
}

export function getPrimaryDatabaseBindingFromEntry(entry: InspectorDataEntry): ElementBinding | undefined {
  return getPrimaryDatabaseBinding(resolveEntryBindings(entry, { databases: [] }));
}

export function getPrimaryStorageBindingFromEntry(entry: InspectorDataEntry): ElementBinding | undefined {
  return getPrimaryStorageBinding(resolveEntryBindings(entry, { databases: [] }));
}

export function getEnabledDatabaseBindings(entry: InspectorDataEntry): ElementBinding[] {
  return resolveEntryBindings(entry, { databases: [] }).filter((b) => b.kind === 'database' && b.enabled);
}

export function getEnabledStorageBindings(entry: InspectorDataEntry): ElementBinding[] {
  return resolveEntryBindings(entry, { databases: [] }).filter((b) => b.kind === 'storage' && b.enabled);
}

export function getEnabledElementRelationBindings(entry: InspectorDataEntry): ElementBinding[] {
  return resolveEntryBindings(entry, { databases: [] }).filter(
    (b) => b.kind === 'element' && b.enabled && Boolean(b.linkedElementKey)
  );
}

export function updateElementAttributes(
  entry: InspectorDataEntry,
  attributesPatch: Partial<{
    attributesEnabled: boolean;
    attribute1: boolean;
    attribute2: boolean;
    attribute3: boolean;
    customAttributes: ElementAttribute[];
  }>
): InspectorDataEntry {
  return {
    ...entry,
    ...attributesPatch,
    customAttributes: attributesPatch.customAttributes ?? entry.customAttributes ?? [],
  };
}

export function updateElementLegacyFields(
  entry: InspectorDataEntry,
  fields: Partial<ElementLegacyFields>
): InspectorDataEntry {
  return {
    ...entry,
    inf1: fields.inf1 ?? entry.inf1,
    inf2: fields.inf2 ?? entry.inf2,
    inf3: fields.inf3 ?? entry.inf3,
  };
}

function withoutBindingsOfKind(entry: InspectorDataEntry, kind: ElementBinding['kind']): InspectorDataEntry {
  const bindings = resolveEntryBindings(entry, { databases: [] }).filter((b) => b.kind !== kind);
  return syncLegacyFieldsFromBindings({ ...entry, bindings: normalizeBindings(bindings) }, bindings);
}

export function clearElementBindings(entry: InspectorDataEntry): InspectorDataEntry {
  return syncLegacyFieldsFromBindings({ ...entry, bindings: [] }, []);
}

export function clearElementDatabaseBindings(entry: InspectorDataEntry): InspectorDataEntry {
  return withoutBindingsOfKind(entry, 'database');
}

export function clearElementStorageBindings(entry: InspectorDataEntry): InspectorDataEntry {
  return withoutBindingsOfKind(entry, 'storage');
}

export function clearElementRelations(entry: InspectorDataEntry): InspectorDataEntry {
  return withoutBindingsOfKind(entry, 'element');
}

export function upsertBinding(entry: InspectorDataEntry, binding: ElementBinding): InspectorDataEntry {
  const bindings = resolveEntryBindings(entry, { databases: [] });
  const index = bindings.findIndex((b) => b.id === binding.id);
  const next =
    index >= 0
      ? bindings.map((b, i) => (i === index ? binding : b))
      : [...bindings, binding];
  const normalized = normalizeBindings(next);
  return syncLegacyFieldsFromBindings({ ...entry, bindings: normalized }, normalized);
}

export function patchBindingInEntry(
  entry: InspectorDataEntry,
  bindingId: string,
  patch: Partial<ElementBinding>
): InspectorDataEntry {
  const bindings = resolveEntryBindings(entry, { databases: [] });
  const next = bindings.map((b) => (b.id === bindingId ? updateBinding(b, patch) : b));
  const normalized = normalizeBindings(next);
  return syncLegacyFieldsFromBindings({ ...entry, bindings: normalized }, normalized);
}

export function removeBindingFromEntry(entry: InspectorDataEntry, bindingId: string): InspectorDataEntry {
  const bindings = deleteBinding(resolveEntryBindings(entry, { databases: [] }), bindingId);
  const normalized = normalizeBindings(bindings);
  return syncLegacyFieldsFromBindings({ ...entry, bindings: normalized }, normalized);
}
