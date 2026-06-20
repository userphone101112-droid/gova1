import { inspectorApiClient } from '../api/client';
import { emptyDatabaseRefFile } from '../data/database-ref-utils';
import type { DatabaseRefFile } from '../data/database-ref.types';
import { DATABASE_REF_SAVE_CONFIRM_MESSAGE } from '../utils/constants';
import { confirmAction } from '../utils/format';

export async function loadDatabaseRefFile(): Promise<DatabaseRefFile> {
  const data = await inspectorApiClient.fetchDatabaseRef();
  return data ?? emptyDatabaseRefFile();
}

export async function saveDatabaseRefFile(
  data: DatabaseRefFile,
  options?: { confirm?: boolean }
): Promise<boolean> {
  if (options?.confirm !== false && !confirmAction(DATABASE_REF_SAVE_CONFIRM_MESSAGE)) {
    return false;
  }
  await inspectorApiClient.saveDatabaseRef(data);
  return true;
}
