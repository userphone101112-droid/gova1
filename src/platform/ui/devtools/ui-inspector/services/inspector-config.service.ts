import type { InspectElementSnapshot } from '../../UiInspectorFrameBridge';
import { inspectorApiClient } from '../api/client';
import {
  buildInspectorDataEntry,
  getStorageKey,
  mergeInspectorEntry,
  normalizeInspectorDataMap,
} from '../data/inspector-config-storage';
import type { ElementFormState, InspectorDataMap } from '../data/inspector-config.types';
import { ELEMENT_SAVE_CONFIRM_MESSAGE } from '../utils/constants';
import { confirmAction } from '../utils/format';

export async function loadInspectorConfigMap(): Promise<InspectorDataMap> {
  const data = await inspectorApiClient.fetchInspectorData();
  return normalizeInspectorDataMap(data ?? {});
}

export async function saveInspectorElementConfig(
  selected: InspectElementSnapshot,
  formState: ElementFormState,
  options?: { confirm?: boolean }
): Promise<InspectorDataEntryResult> {
  if (options?.confirm !== false && !confirmAction(ELEMENT_SAVE_CONFIRM_MESSAGE)) {
    return { saved: false };
  }

  await inspectorApiClient.saveInspectorElement({
    uiUuid: selected.uuid,
    uiInstanceId: selected.instanceId ?? '',
    databaseEnabled: formState.databaseEnabled,
    databaseName: formState.databaseName,
    tableName: formState.tableName,
    columnName: formState.columnName,
    inf1: formState.inf1,
    inf2: formState.inf2,
    inf3: formState.inf3,
    storageEnabled: formState.storageEnabled,
    storageMainFile: formState.storageMainFile,
    storageSubFile: formState.storageSubFile,
    attributesEnabled: formState.attributesEnabled,
    attribute1: formState.attribute1,
    attribute2: formState.attribute2,
    attribute3: formState.attribute3,
  });

  const storageKey = getStorageKey(selected);
  return {
    saved: true,
    storageKey,
    entry: buildInspectorDataEntry(selected, formState),
  };
}

export type InspectorDataEntryResult = {
  saved: boolean;
  storageKey?: string;
  entry?: ReturnType<typeof buildInspectorDataEntry>;
};

export function mergeSavedEntry(
  current: InspectorDataMap,
  storageKey: string,
  entry: ReturnType<typeof buildInspectorDataEntry>
): InspectorDataMap {
  return mergeInspectorEntry(current, storageKey, entry);
}
