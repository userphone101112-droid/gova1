import type { InspectElementSnapshot } from '../../UiInspectorFrameBridge';

import { findColumn, findDatabase, findTable } from './database-ref-utils';
import type { DatabaseRefFile } from './database-ref.types';
import {
  bindingsFromLegacyEntry,
  normalizeBindings,
  syncLegacyFieldsFromBindings,
} from './element-binding-utils';
import type { ElementAttribute } from './element-binding.types';
import type {
  ElementDatabaseSettings,
  ElementFormState,
  InspectorDataEntry,
  InspectorDataMap,
} from './inspector-config.types';

export function getStorageKey(el: InspectElementSnapshot): string {
  const instanceId = el.instanceId ?? '';
  return instanceId ? `${el.uuid}:${instanceId}` : el.uuid;
}

export function getInspectorData(
  data: InspectorDataMap,
  el: InspectElementSnapshot
): InspectorDataEntry | undefined {
  const storageKey = getStorageKey(el);
  return data[storageKey] || data[el.uuid] || (el.id ? data[el.id] : undefined);
}

export function emptyFormState(): ElementFormState {
  return {
    bindings: [],
    activeBindingId: '',
    customAttributes: [],
    databaseEnabled: false,
    databaseName: '',
    tableName: '',
    columnName: '',
    inf1: '',
    inf2: '',
    inf3: '',
    storageEnabled: false,
    storageMainFile: '',
    storageSubFile: '',
    attributesEnabled: false,
    attribute1: false,
    attribute2: false,
    attribute3: false,
  };
}

export function resolveInspectorIdentityKey(uuid: string, instanceId: string): string {
  const normalizedInstance = instanceId?.trim() ?? '';
  return normalizedInstance ? `${uuid}:${normalizedInstance}` : uuid;
}

export function isSameInspectorElement(
  entry: InspectorDataEntry,
  uuid: string,
  instanceId: string
): boolean {
  const entryInstance = entry.dataUiInstanceId?.trim() ?? '';
  const targetInstance = instanceId?.trim() ?? '';
  return entry.dataUiUuid === uuid && entryInstance === targetInstance;
}

export function normalizeInspectorDataMap(data: InspectorDataMap): InspectorDataMap {
  const normalized: InspectorDataMap = {};

  for (const entry of Object.values(data)) {
    const canonicalKey =
      entry.dataUiIdentityKey?.trim() ||
      resolveInspectorIdentityKey(entry.dataUiUuid, entry.dataUiInstanceId ?? '');

    const existing = normalized[canonicalKey];
    if (!existing || (entry.updatedAt ?? '') >= (existing.updatedAt ?? '')) {
      normalized[canonicalKey] = { ...entry, dataUiIdentityKey: canonicalKey };
    }
  }

  return normalized;
}

export function mergeInspectorEntry(
  data: InspectorDataMap,
  storageKey: string,
  entry: InspectorDataEntry
): InspectorDataMap {
  const canonicalEntry = { ...entry, dataUiIdentityKey: storageKey };
  const withoutAliases: InspectorDataMap = {};

  for (const [key, value] of Object.entries(data)) {
    if (key === storageKey) continue;
    if (isSameInspectorElement(value, canonicalEntry.dataUiUuid, canonicalEntry.dataUiInstanceId ?? '')) {
      continue;
    }
    if (value.dataUiIdentityKey === storageKey) {
      continue;
    }
    withoutAliases[key] = value;
  }

  return normalizeInspectorDataMap({
    ...withoutAliases,
    [storageKey]: canonicalEntry,
  });
}

function resolveLegacyDatabaseBinding(
  entry: InspectorDataEntry,
  databaseRef: DatabaseRefFile
): Pick<ElementFormState, 'databaseName' | 'tableName' | 'columnName' | 'inf1' | 'inf2' | 'inf3'> {
  let databaseName = entry.databaseName?.trim() ?? '';
  let tableName = entry.tableName?.trim() ?? '';
  let columnName = entry.columnName?.trim() ?? '';
  let inf1 = entry.inf1 ?? '';
  let inf2 = entry.inf2 ?? '';
  let inf3 = entry.inf3 ?? '';

  if (!databaseName && inf1) {
    const db = findDatabase(databaseRef, inf1);
    if (db) {
      databaseName = inf1;
      inf1 = '';
      if (!tableName && inf2) {
        const table = findTable(db, inf2);
        if (table) {
          tableName = inf2;
          inf2 = '';
          if (!columnName && inf3) {
            const column = findColumn(table, inf3);
            if (column) {
              columnName = inf3;
              inf3 = '';
            }
          }
        }
      }
    }
  }

  return { databaseName, tableName, columnName, inf1, inf2, inf3 };
}

function resolveBindings(
  entry: InspectorDataEntry,
  databaseRef: DatabaseRefFile
): ElementFormState['bindings'] {
  if (entry.bindings?.length) {
    return normalizeBindings(entry.bindings);
  }
  const legacyPath = resolveLegacyDatabaseBinding(entry, databaseRef);
  return bindingsFromLegacyEntry(
    {
      ...entry,
      databaseName: legacyPath.databaseName,
      tableName: legacyPath.tableName,
      columnName: legacyPath.columnName,
    },
    databaseRef
  );
}

function resolveCustomAttributes(entry: InspectorDataEntry): ElementAttribute[] {
  if (entry.customAttributes?.length) {
    return entry.customAttributes;
  }
  return [];
}

export function formStateFromEntry(
  entry: InspectorDataEntry | undefined,
  databaseRef: DatabaseRefFile = { databases: [] }
): ElementFormState {
  if (!entry) return emptyFormState();

  const binding = resolveLegacyDatabaseBinding(entry, databaseRef);
  const bindings = resolveBindings(entry, databaseRef);

  return {
    bindings,
    activeBindingId: bindings[0]?.id ?? '',
    customAttributes: resolveCustomAttributes(entry),
    databaseEnabled: entry.databaseEnabled,
    databaseName: binding.databaseName,
    tableName: binding.tableName,
    columnName: binding.columnName,
    inf1: binding.inf1,
    inf2: binding.inf2,
    inf3: binding.inf3,
    storageEnabled: entry.storageEnabled ?? Boolean(entry.storageMainFile || entry.storageSubFile),
    storageMainFile: entry.storageMainFile ?? '',
    storageSubFile: entry.storageSubFile ?? '',
    attributesEnabled: entry.attributesEnabled,
    attribute1: entry.attribute1,
    attribute2: entry.attribute2,
    attribute3: entry.attribute3,
  };
}

function resolveBindingsForSave(formState: ElementFormState): ElementFormState['bindings'] {
  return normalizeBindings(formState.bindings);
}

export function buildInspectorDataEntry(
  el: InspectElementSnapshot,
  formState: ElementFormState,
  _databaseRef: DatabaseRefFile = { databases: [] }
): InspectorDataEntry {
  const storageKey = getStorageKey(el);
  const bindings = resolveBindingsForSave(formState);

  const base: InspectorDataEntry = {
    bindings,
    customAttributes: formState.customAttributes,
    databaseEnabled: formState.databaseEnabled,
    databaseName: formState.databaseName,
    tableName: formState.tableName,
    columnName: formState.columnName,
    inf1: formState.inf1,
    inf2: formState.inf2,
    inf3: formState.inf3,
    storageEnabled: formState.storageEnabled,
    storageMainFile: formState.storageEnabled ? formState.storageMainFile : '',
    storageSubFile: formState.storageEnabled ? formState.storageSubFile : '',
    attributesEnabled: formState.attributesEnabled,
    attribute1: formState.attribute1,
    attribute2: formState.attribute2,
    attribute3: formState.attribute3,
    dataUiPath: el.path,
    dataUiFeature: el.feature,
    dataUiUuid: el.uuid,
    dataUiInstanceId: el.instanceId ?? '',
    dataUiIdentityKey: storageKey,
    updatedAt: new Date().toISOString(),
  };

  return syncLegacyFieldsFromBindings(base, bindings);
}

export function databaseSettingsFromForm(form: ElementFormState): ElementDatabaseSettings {
  return {
    enabled: form.databaseEnabled,
    databaseName: form.databaseName,
    tableName: form.tableName,
    columnName: form.columnName,
  };
}

export function applyDatabaseSettings(
  form: ElementFormState,
  settings: Partial<ElementDatabaseSettings>
): ElementFormState {
  return {
    ...form,
    databaseEnabled: settings.enabled ?? form.databaseEnabled,
    databaseName: settings.databaseName ?? form.databaseName,
    tableName: settings.tableName ?? form.tableName,
    columnName: settings.columnName ?? form.columnName,
  };
}

export function remapStorageFolderName(
  form: ElementFormState,
  oldName: string,
  newName: string
): ElementFormState {
  const nextBindings = form.bindings.map((binding) =>
    binding.kind === 'storage' && binding.storageMainFile === oldName
      ? { ...binding, storageMainFile: newName, storageSubFile: '' }
      : binding
  );
  if (form.storageMainFile !== oldName) {
    return { ...form, bindings: nextBindings };
  }
  return {
    ...form,
    bindings: nextBindings,
    storageMainFile: newName,
    storageSubFile: '',
  };
}

export function remapStorageSubfolderName(
  form: ElementFormState,
  folderName: string,
  oldName: string,
  newName: string
): ElementFormState {
  const nextBindings = form.bindings.map((binding) =>
    binding.kind === 'storage' &&
    binding.storageMainFile === folderName &&
    binding.storageSubFile === oldName
      ? { ...binding, storageSubFile: newName }
      : binding
  );
  if (form.storageMainFile !== folderName || form.storageSubFile !== oldName) {
    return { ...form, bindings: nextBindings };
  }
  return { ...form, bindings: nextBindings, storageSubFile: newName };
}
