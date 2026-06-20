import type { InspectElementSnapshot } from '../../UiInspectorFrameBridge';

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
    databaseEnabled: false,
    inf1: '',
    inf2: '',
    inf3: '',
    attributesEnabled: false,
    attribute1: false,
    attribute2: false,
    attribute3: false,
  };
}

export function formStateFromEntry(entry: InspectorDataEntry | undefined): ElementFormState {
  if (!entry) return emptyFormState();
  return {
    databaseEnabled: entry.databaseEnabled,
    inf1: entry.inf1,
    inf2: entry.inf2,
    inf3: entry.inf3,
    attributesEnabled: entry.attributesEnabled,
    attribute1: entry.attribute1,
    attribute2: entry.attribute2,
    attribute3: entry.attribute3,
  };
}

export function buildInspectorDataEntry(
  el: InspectElementSnapshot,
  formState: ElementFormState
): InspectorDataEntry {
  const storageKey = getStorageKey(el);
  return {
    databaseEnabled: formState.databaseEnabled,
    inf1: formState.inf1,
    inf2: formState.inf2,
    inf3: formState.inf3,
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
}

export function databaseSettingsFromForm(form: ElementFormState): ElementDatabaseSettings {
  return {
    enabled: form.databaseEnabled,
    databaseId: form.inf1,
    tableId: form.inf2,
    fieldId: form.inf3,
  };
}

export function applyDatabaseSettings(
  form: ElementFormState,
  settings: Partial<ElementDatabaseSettings>
): ElementFormState {
  return {
    ...form,
    databaseEnabled: settings.enabled ?? form.databaseEnabled,
    inf1: settings.databaseId ?? form.inf1,
    inf2: settings.tableId ?? form.inf2,
    inf3: settings.fieldId ?? form.inf3,
  };
}
