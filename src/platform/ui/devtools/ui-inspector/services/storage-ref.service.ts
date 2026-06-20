import { inspectorApiClient } from '../api/client';
import { emptyStorageRefFile, normalizeStorageRefFile } from '../data/storage-ref-utils';
import type { StorageRefFile } from '../data/storage-ref.types';
import { STORAGE_REF_SAVE_CONFIRM_MESSAGE } from '../utils/constants';
import { confirmAction } from '../utils/format';

export async function loadStorageRefFile(): Promise<StorageRefFile> {
  const data = await inspectorApiClient.fetchStorageRef();
  return data ?? emptyStorageRefFile();
}

export async function persistStorageRefFile(
  data: StorageRefFile,
  options?: { confirm?: boolean; message?: string }
): Promise<boolean> {
  if (options?.confirm !== false && !confirmAction(options?.message ?? STORAGE_REF_SAVE_CONFIRM_MESSAGE)) {
    return false;
  }
  await inspectorApiClient.saveStorageRef(normalizeStorageRefFile(data));
  return true;
}
