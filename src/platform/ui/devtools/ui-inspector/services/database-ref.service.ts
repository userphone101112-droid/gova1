import { inspectorApiClient } from '../api/client';
import {
  applyDescriptionUpdate,
  emptyDatabaseRefFile,
  normalizeDatabaseRefFile,
} from '../data/database-ref-utils';
import type { DatabaseRefFile, DatabaseRefLevel } from '../data/database-ref.types';
import { DATABASE_REF_SAVE_CONFIRM_MESSAGE } from '../utils/constants';
import { confirmAction } from '../utils/format';

export async function loadDatabaseRefFile(): Promise<DatabaseRefFile> {
  const data = await inspectorApiClient.fetchDatabaseRef();
  return data ?? emptyDatabaseRefFile();
}

export async function persistDatabaseRefFile(
  data: DatabaseRefFile,
  options?: { confirm?: boolean; message?: string }
): Promise<boolean> {
  if (options?.confirm !== false && !confirmAction(options?.message ?? DATABASE_REF_SAVE_CONFIRM_MESSAGE)) {
    return false;
  }
  await inspectorApiClient.saveDatabaseRef(normalizeDatabaseRefFile(data));
  return true;
}

export async function saveDatabaseRefFile(
  data: DatabaseRefFile,
  options?: { confirm?: boolean }
): Promise<boolean> {
  return persistDatabaseRefFile(data, options);
}

export async function saveDatabaseRefDescription(
  current: DatabaseRefFile,
  level: DatabaseRefLevel,
  ids: { databaseName: string; tableName?: string; columnName?: string },
  description: string
): Promise<DatabaseRefFile | null> {
  const { file, error } = applyDescriptionUpdate(current, level, ids, description);
  if (error) return null;
  const saved = await persistDatabaseRefFile(file, { confirm: true });
  return saved ? file : null;
}
