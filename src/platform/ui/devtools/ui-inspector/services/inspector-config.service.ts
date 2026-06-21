import type { InspectElementSnapshot } from '../../UiInspectorFrameBridge';
import { inspectorApiClient } from '../api/client';
import type { DatabaseRefFile } from '../data/database-ref.types';
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
  options?: { confirm?: boolean; databaseRef?: DatabaseRefFile; route?: string }
): Promise<InspectorDataEntryResult> {
  // Require UUID for save - elements without UUID cannot be saved to Inspector database
  if (!selected.hasUuid || !selected.uuid) {
    console.warn('Cannot save Inspector config for element without UUID');
    return { saved: false };
  }

  if (options?.confirm !== false && !confirmAction(ELEMENT_SAVE_CONFIRM_MESSAGE)) {
    return { saved: false };
  }

  await inspectorApiClient.saveInspectorElement({
    uiUuid: selected.uuid,
    uiInstanceId: selected.instanceId ?? '',
    bindings: formState.bindings,
    customAttributes: formState.customAttributes,
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
    route: options?.route,
  });

  const storageKey = getStorageKey(selected);
  return {
    saved: true,
    storageKey,
    entry: buildInspectorDataEntry(selected, formState, options?.databaseRef),
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
