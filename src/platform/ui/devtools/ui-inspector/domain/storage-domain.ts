import { uniqueName } from '../data/database-ref-utils';
import type { DatabaseRefFile } from '../data/database-ref.types';
import {
  createStorageBinding,
  getPrimaryStorageBinding,
  normalizeBindings,
  resolveEntryBindings,
  syncLegacyFieldsFromBindings,
  updateBinding,
} from '../data/element-binding-utils';
import type { CreateStorageBindingInput, ElementBinding } from '../data/element-binding.types';
import type { InspectorDataEntry, InspectorDataMap } from '../data/inspector-config.types';
import {
  deleteStorageFolder,
  findStorageFolder,
  renameStorageFolder,
  updateStorageFolderDescription,
  validateStorageName,
} from '../data/storage-ref-utils';
import type { StorageFolder, StorageRefFile } from '../data/storage-ref.types';

import { createDomainError, mapRefErrorToDomain } from './domain-errors';
import type { DatabaseColumnRef, StorageAnchorInput, StorageRenameMap } from './domain-types';
import { patchBindingInEntry, removeBindingFromEntry, upsertBinding } from './element-domain';
import {
  assertNewStorageAnchor,
  assertStorageLocationMutable,
  validateNewStorageBinding,
} from './governance-domain';

function throwIfRefError(result: { error?: string }): void {
  if (result.error) throw mapRefErrorToDomain(result.error);
}

export function listStorageMainFiles(storageRef: StorageRefFile): StorageFolder[] {
  return [...storageRef.folders];
}

export function getStorageMainFile(storageRef: StorageRefFile, mainFileName: string): StorageFolder | null {
  return findStorageFolder(storageRef, mainFileName) ?? null;
}

export function createStorageMainFile(
  storageRef: StorageRefFile,
  input: Pick<StorageFolder, 'name'> &
    Partial<Omit<StorageFolder, 'name' | 'subfolders'>> &
    StorageAnchorInput,
  databaseRef: DatabaseRefFile
): StorageRefFile {
  assertNewStorageAnchor(input, databaseRef);
  const name = input.name.trim();
  if (findStorageFolder(storageRef, name)) {
    throw createDomainError('DUPLICATE_NAME', `Storage main file "${name}" already exists.`);
  }
  const nameError = validateStorageName(name, storageRef.folders.map((folder) => folder.name));
  if (nameError) throw mapRefErrorToDomain(nameError, 'INVALID_NAME');
  const folder: StorageFolder = {
    name,
    subfolders: [],
    linkedDatabaseName: input.linkedDatabaseColumn.databaseName,
    linkedTableName: input.linkedDatabaseColumn.tableName,
    linkedColumnName: input.linkedDatabaseColumn.columnName,
    ...(input.description ? { description: input.description } : {}),
    ...(input.entityName ? { entityName: input.entityName } : {}),
    ...(input.storageType ? { storageType: input.storageType } : {}),
    ...(input.basePath ? { basePath: input.basePath } : {}),
    ...(input.accessLevel ? { accessLevel: input.accessLevel } : {}),
    ...(input.retention ? { retention: input.retention } : {}),
  };
  return { folders: [...storageRef.folders, folder] };
}

export function renameStorageMainFile(
  storageRef: StorageRefFile,
  oldName: string,
  newName: string
): StorageRefFile {
  assertStorageLocationMutable(storageRef, { storageMainFile: oldName }, 'Rename');
  const result = renameStorageFolder(storageRef, oldName, newName);
  throwIfRefError(result);
  return result.file;
}

export function updateStorageMainFileDescription(
  storageRef: StorageRefFile,
  mainFileName: string,
  description: string
): StorageRefFile {
  return updateStorageFolderDescription(storageRef, mainFileName, description);
}

export function deleteStorageMainFile(storageRef: StorageRefFile, mainFileName: string): StorageRefFile {
  assertStorageLocationMutable(storageRef, { storageMainFile: mainFileName }, 'Delete');
  if (!findStorageFolder(storageRef, mainFileName)) {
    throw createDomainError('NOT_FOUND', `Storage main file "${mainFileName}" not found.`);
  }
  return deleteStorageFolder(storageRef, mainFileName);
}

export function quickAddStorageMainFile(
  storageRef: StorageRefFile,
  anchor: StorageAnchorInput,
  databaseRef: DatabaseRefFile
): StorageRefFile {
  const name = uniqueName(
    'new_folder',
    storageRef.folders.map((folder) => folder.name)
  );
  return createStorageMainFile(
    storageRef,
    { name, linkedDatabaseColumn: anchor.linkedDatabaseColumn },
    databaseRef
  );
}

export type CreateStorageBindingContext = {
  storageRef: StorageRefFile;
  databaseRef: DatabaseRefFile;
  anchorDatabaseColumn?: DatabaseColumnRef;
};

export function createStorageBindingForElement(
  entry: InspectorDataEntry,
  input: CreateStorageBindingInput,
  context: CreateStorageBindingContext
): InspectorDataEntry {
  validateNewStorageBinding({
    entry,
    storageRef: context.storageRef,
    databaseRef: context.databaseRef,
    storageMainFile: input.storageMainFile,
    ...(context.anchorDatabaseColumn ? { anchorDatabaseColumn: context.anchorDatabaseColumn } : {}),
  });

  const metadata = { ...(input.metadata ?? {}) };
  if (context.anchorDatabaseColumn) {
    metadata.linkedDatabaseName = context.anchorDatabaseColumn.databaseName;
    metadata.linkedTableName = context.anchorDatabaseColumn.tableName;
    metadata.linkedColumnName = context.anchorDatabaseColumn.columnName;
  }

  const binding = createStorageBinding({
    ...input,
    storageSubFile: '',
    ...(Object.keys(metadata).length ? { metadata } : {}),
  });
  return upsertBinding(entry, binding);
}

export function updateStorageBinding(
  entry: InspectorDataEntry,
  bindingId: string,
  patch: Partial<ElementBinding>
): InspectorDataEntry {
  return patchBindingInEntry(entry, bindingId, patch);
}

export function removeStorageBinding(entry: InspectorDataEntry, bindingId: string): InspectorDataEntry {
  return removeBindingFromEntry(entry, bindingId);
}

export function setStorageBindingEnabled(
  entry: InspectorDataEntry,
  bindingId: string,
  enabled: boolean
): InspectorDataEntry {
  return patchBindingInEntry(entry, bindingId, { enabled });
}

export function setPrimaryStorageBinding(entry: InspectorDataEntry, bindingId: string): InspectorDataEntry {
  const bindings = resolveEntryBindings(entry, { databases: [] }).map((binding) => {
    if (binding.kind !== 'storage') return binding;
    return updateBinding(binding, { role: binding.id === bindingId ? 'upload_to' : 'download_from' });
  });
  const normalized = normalizeBindings(bindings);
  return syncLegacyFieldsFromBindings({ ...entry, bindings: normalized }, normalized);
}

export function remapStorageBindingsInEntry(
  entry: InspectorDataEntry,
  rename: StorageRenameMap
): InspectorDataEntry {
  const bindings = resolveEntryBindings(entry, { databases: [] }).map((binding) => {
    if (binding.kind !== 'storage') return binding;
    let storageMainFile = binding.storageMainFile ?? '';
    if (rename.mainFile && storageMainFile === rename.mainFile.oldName) {
      storageMainFile = rename.mainFile.newName;
    }
    return { ...binding, storageMainFile, storageSubFile: '' };
  });
  let nextEntry = { ...entry };
  if (rename.mainFile && nextEntry.storageMainFile === rename.mainFile.oldName) {
    nextEntry = { ...nextEntry, storageMainFile: rename.mainFile.newName, storageSubFile: '' };
  }
  const normalized = normalizeBindings(bindings);
  return syncLegacyFieldsFromBindings({ ...nextEntry, bindings: normalized }, normalized);
}

export function applyStorageRenameToInspectorData(
  inspectorData: InspectorDataMap,
  rename: StorageRenameMap
): InspectorDataMap {
  const next: InspectorDataMap = {};
  for (const [key, entry] of Object.entries(inspectorData)) {
    next[key] = remapStorageBindingsInEntry(entry, rename);
  }
  return next;
}

export function getStorageConnectionDetails(entry: InspectorDataEntry) {
  return resolveEntryBindings(entry, { databases: [] })
    .filter((b) => b.kind === 'storage')
    .map((binding) => ({
      bindingId: binding.id,
      storageMainFile: binding.storageMainFile ?? '',
      enabled: binding.enabled,
      confidence: binding.confidence,
      ...(binding.reason ? { reason: binding.reason } : {}),
    }));
}

export function getPrimaryStorageConnection(entry: InspectorDataEntry) {
  const primary = getPrimaryStorageBinding(resolveEntryBindings(entry, { databases: [] }));
  if (!primary) return null;
  return {
    bindingId: primary.id,
    storageMainFile: primary.storageMainFile ?? '',
    enabled: primary.enabled,
    confidence: primary.confidence,
    ...(primary.reason ? { reason: primary.reason } : {}),
  };
}
