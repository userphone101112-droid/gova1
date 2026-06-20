import {
  addColumn,
  addDatabase,
  addTable,
  deleteColumn,
  deleteDatabase,
  deleteTable,
  findColumn,
  findDatabase,
  findTable,
  remapElementFieldNames,
  renameColumn,
  renameDatabase,
  renameTable,
  setColumnDescription,
  setDatabaseDescription,
  setTableDescription,
  type RenameMap,
  validateName,
} from '../data/database-ref-utils';
import type {
  DatabaseRefColumn,
  DatabaseRefDatabase,
  DatabaseRefFile,
  DatabaseRefTable,
} from '../data/database-ref.types';
import {
  createDatabaseBinding,
  getPrimaryDatabaseBinding,
  normalizeBindings,
  resolveEntryBindings,
  syncLegacyFieldsFromBindings,
  updateBinding,
} from '../data/element-binding-utils';
import type { CreateDatabaseBindingInput, ElementBinding } from '../data/element-binding.types';
import type { ElementFormState, InspectorDataEntry, InspectorDataMap } from '../data/inspector-config.types';

import { createDomainError, mapRefErrorToDomain } from './domain-errors';
import type { DatabaseRenameMap } from './domain-types';
import { patchBindingInEntry, removeBindingFromEntry, upsertBinding } from './element-domain';

function throwIfRefError(result: { error?: string }): void {
  if (result.error) throw mapRefErrorToDomain(result.error);
}

export function listDatabases(databaseRef: DatabaseRefFile): DatabaseRefDatabase[] {
  return [...databaseRef.databases];
}

export function getDatabase(databaseRef: DatabaseRefFile, databaseName: string): DatabaseRefDatabase | null {
  return findDatabase(databaseRef, databaseName) ?? null;
}

export function createDatabase(
  databaseRef: DatabaseRefFile,
  input: Pick<DatabaseRefDatabase, 'name'> & Partial<Omit<DatabaseRefDatabase, 'name' | 'tables'>>
): DatabaseRefFile {
  const name = input.name.trim();
  if (findDatabase(databaseRef, name)) {
    throw createDomainError('DUPLICATE_NAME', `Database "${name}" already exists.`);
  }
  const nameError = validateName(name, databaseRef.databases.map((db) => db.name));
  if (nameError) throw mapRefErrorToDomain(nameError, 'INVALID_NAME');
  const database: DatabaseRefDatabase = {
    name,
    tables: [],
    ...(input.description ? { description: input.description } : {}),
    ...(input.entityName ? { entityName: input.entityName } : {}),
    ...(input.ownerFeature ? { ownerFeature: input.ownerFeature } : {}),
    ...(input.domain ? { domain: input.domain } : {}),
    ...(input.lifecycle ? { lifecycle: input.lifecycle } : {}),
  };
  return { databases: [...databaseRef.databases, database] };
}

export function renameDatabaseInRef(
  databaseRef: DatabaseRefFile,
  oldName: string,
  newName: string
): DatabaseRefFile {
  const result = renameDatabase(databaseRef, oldName, newName);
  throwIfRefError(result);
  return result.file;
}

export function updateDatabaseDescription(
  databaseRef: DatabaseRefFile,
  databaseName: string,
  description: string
): DatabaseRefFile {
  const result = setDatabaseDescription(databaseRef, databaseName, description);
  throwIfRefError(result);
  return result.file;
}

export function deleteDatabaseFromRef(databaseRef: DatabaseRefFile, databaseName: string): DatabaseRefFile {
  if (!findDatabase(databaseRef, databaseName)) {
    throw createDomainError('NOT_FOUND', `Database "${databaseName}" not found.`);
  }
  return deleteDatabase(databaseRef, databaseName);
}

export function listTables(databaseRef: DatabaseRefFile, databaseName: string): DatabaseRefTable[] {
  const db = findDatabase(databaseRef, databaseName);
  if (!db) throw createDomainError('NOT_FOUND', `Database "${databaseName}" not found.`);
  return [...db.tables];
}

export function getTable(
  databaseRef: DatabaseRefFile,
  databaseName: string,
  tableName: string
): DatabaseRefTable | null {
  return findTable(findDatabase(databaseRef, databaseName), tableName) ?? null;
}

export function createTable(
  databaseRef: DatabaseRefFile,
  databaseName: string,
  input: Pick<DatabaseRefTable, 'name'> & Partial<Omit<DatabaseRefTable, 'name' | 'columns'>>
): DatabaseRefFile {
  const db = findDatabase(databaseRef, databaseName);
  if (!db) throw createDomainError('NOT_FOUND', `Database "${databaseName}" not found.`);
  const name = input.name.trim();
  const nameError = validateName(name, db.tables.map((table) => table.name));
  if (nameError) throw mapRefErrorToDomain(nameError, 'INVALID_NAME');
  if (findTable(db, name)) throw createDomainError('DUPLICATE_NAME', `Table "${name}" already exists.`);
  const table: DatabaseRefTable = {
    name,
    columns: [],
    ...(input.description ? { description: input.description } : {}),
    ...(input.entityName ? { entityName: input.entityName } : {}),
    ...(input.tableType ? { tableType: input.tableType } : {}),
    ...(input.expectedRows ? { expectedRows: input.expectedRows } : {}),
    ...(input.accessPattern ? { accessPattern: input.accessPattern } : {}),
    ...(input.notes ? { notes: input.notes } : {}),
  };
  return {
    databases: databaseRef.databases.map((entry) =>
      entry.name === databaseName ? { ...entry, tables: [...entry.tables, table] } : entry
    ),
  };
}

export function renameTableInRef(
  databaseRef: DatabaseRefFile,
  databaseName: string,
  oldTableName: string,
  newTableName: string
): DatabaseRefFile {
  const result = renameTable(databaseRef, databaseName, oldTableName, newTableName);
  throwIfRefError(result);
  return result.file;
}

export function updateTableDescription(
  databaseRef: DatabaseRefFile,
  databaseName: string,
  tableName: string,
  description: string
): DatabaseRefFile {
  const result = setTableDescription(databaseRef, databaseName, tableName, description);
  throwIfRefError(result);
  return result.file;
}

export function deleteTableFromRef(
  databaseRef: DatabaseRefFile,
  databaseName: string,
  tableName: string
): DatabaseRefFile {
  if (!findTable(findDatabase(databaseRef, databaseName), tableName)) {
    throw createDomainError('NOT_FOUND', `Table "${tableName}" not found.`);
  }
  return deleteTable(databaseRef, databaseName, tableName);
}

export function listColumns(
  databaseRef: DatabaseRefFile,
  databaseName: string,
  tableName: string
): DatabaseRefColumn[] {
  const table = findTable(findDatabase(databaseRef, databaseName), tableName);
  if (!table) throw createDomainError('NOT_FOUND', `Table "${tableName}" not found.`);
  return [...table.columns];
}

export function getColumn(
  databaseRef: DatabaseRefFile,
  databaseName: string,
  tableName: string,
  columnName: string
): DatabaseRefColumn | null {
  return findColumn(findTable(findDatabase(databaseRef, databaseName), tableName), columnName) ?? null;
}

export function createColumn(
  databaseRef: DatabaseRefFile,
  databaseName: string,
  tableName: string,
  input: Pick<DatabaseRefColumn, 'name'> & Partial<Omit<DatabaseRefColumn, 'name'>>
): DatabaseRefFile {
  const table = findTable(findDatabase(databaseRef, databaseName), tableName);
  if (!table) throw createDomainError('NOT_FOUND', `Table "${tableName}" not found.`);
  const name = input.name.trim();
  const nameError = validateName(name, table.columns.map((column) => column.name));
  if (nameError) throw mapRefErrorToDomain(nameError, 'INVALID_NAME');
  if (findColumn(table, name)) throw createDomainError('DUPLICATE_NAME', `Column "${name}" already exists.`);
  const column: DatabaseRefColumn = { ...input, name };
  return {
    databases: databaseRef.databases.map((db) =>
      db.name !== databaseName
        ? db
        : {
            ...db,
            tables: db.tables.map((tbl) =>
              tbl.name !== tableName ? tbl : { ...tbl, columns: [...tbl.columns, column] }
            ),
          }
    ),
  };
}

export function renameColumnInRef(
  databaseRef: DatabaseRefFile,
  databaseName: string,
  tableName: string,
  oldColumnName: string,
  newColumnName: string
): DatabaseRefFile {
  const result = renameColumn(databaseRef, databaseName, tableName, oldColumnName, newColumnName);
  throwIfRefError(result);
  return result.file;
}

export function updateColumnDescription(
  databaseRef: DatabaseRefFile,
  databaseName: string,
  tableName: string,
  columnName: string,
  description: string
): DatabaseRefFile {
  const result = setColumnDescription(databaseRef, databaseName, tableName, columnName, description);
  throwIfRefError(result);
  return result.file;
}

export function deleteColumnFromRef(
  databaseRef: DatabaseRefFile,
  databaseName: string,
  tableName: string,
  columnName: string
): DatabaseRefFile {
  if (!findColumn(findTable(findDatabase(databaseRef, databaseName), tableName), columnName)) {
    throw createDomainError('NOT_FOUND', `Column "${columnName}" not found.`);
  }
  return deleteColumn(databaseRef, databaseName, tableName, columnName);
}

export function quickAddDatabase(databaseRef: DatabaseRefFile): DatabaseRefFile {
  return addDatabase(databaseRef);
}

export function quickAddTable(databaseRef: DatabaseRefFile, databaseName: string): DatabaseRefFile {
  const result = addTable(databaseRef, databaseName);
  throwIfRefError(result);
  return result.file;
}

export function quickAddColumn(
  databaseRef: DatabaseRefFile,
  databaseName: string,
  tableName: string
): DatabaseRefFile {
  const result = addColumn(databaseRef, databaseName, tableName);
  throwIfRefError(result);
  return result.file;
}

export function createDatabaseBindingForElement(
  entry: InspectorDataEntry,
  input: CreateDatabaseBindingInput
): InspectorDataEntry {
  const binding = createDatabaseBinding(input);
  return upsertBinding(entry, binding);
}

export function updateDatabaseBinding(
  entry: InspectorDataEntry,
  bindingId: string,
  patch: Partial<ElementBinding>
): InspectorDataEntry {
  return patchBindingInEntry(entry, bindingId, patch);
}

export function removeDatabaseBinding(entry: InspectorDataEntry, bindingId: string): InspectorDataEntry {
  return removeBindingFromEntry(entry, bindingId);
}

export function setDatabaseBindingEnabled(
  entry: InspectorDataEntry,
  bindingId: string,
  enabled: boolean
): InspectorDataEntry {
  return patchBindingInEntry(entry, bindingId, { enabled });
}

export function setPrimaryDatabaseBinding(entry: InspectorDataEntry, bindingId: string): InspectorDataEntry {
  const bindings = resolveEntryBindings(entry, { databases: [] }).map((binding) => {
    if (binding.kind !== 'database') return binding;
    return updateBinding(binding, { role: binding.id === bindingId ? 'write_to' : 'read_from' });
  });
  const normalized = normalizeBindings(bindings);
  return syncLegacyFieldsFromBindings({ ...entry, bindings: normalized }, normalized);
}

export function remapDatabaseBindingsInEntry(
  entry: InspectorDataEntry,
  rename: RenameMap
): InspectorDataEntry {
  const bindings = resolveEntryBindings(entry, { databases: [] }).map((binding) => {
    if (binding.kind !== 'database') return binding;
    let databaseName = binding.databaseName ?? '';
    let tableName = binding.tableName ?? '';
    let columnName = binding.columnName ?? '';
    if (rename.database && databaseName === rename.database.oldName) databaseName = rename.database.newName;
    if (rename.table && tableName === rename.table.oldName) tableName = rename.table.newName;
    if (rename.column && columnName === rename.column.oldName) columnName = rename.column.newName;
    return { ...binding, databaseName, tableName, columnName };
  });
  const legacy = remapElementFieldNames(
    {
      databaseName: entry.databaseName ?? '',
      tableName: entry.tableName ?? '',
      columnName: entry.columnName ?? '',
      inf1: entry.inf1,
      inf2: entry.inf2,
      inf3: entry.inf3,
    },
    rename
  );
  const normalized = normalizeBindings(bindings);
  return syncLegacyFieldsFromBindings({ ...entry, ...legacy, bindings: normalized }, normalized);
}

export function applyDatabaseRenameToInspectorData(
  inspectorData: InspectorDataMap,
  rename: DatabaseRenameMap
): InspectorDataMap {
  const renameMap: RenameMap = rename;
  const next: InspectorDataMap = {};
  for (const [key, entry] of Object.entries(inspectorData)) {
    next[key] = remapDatabaseBindingsInEntry(entry, renameMap);
  }
  return next;
}

export function getDatabaseConnectionDetails(entry: InspectorDataEntry) {
  return resolveEntryBindings(entry, { databases: [] })
    .filter((b) => b.kind === 'database')
    .map((binding) => ({
      bindingId: binding.id,
      databaseName: binding.databaseName ?? '',
      tableName: binding.tableName ?? '',
      columnName: binding.columnName ?? '',
      enabled: binding.enabled,
      confidence: binding.confidence,
      reason: binding.reason,
    }));
}

export function getPrimaryDatabaseConnection(entry: InspectorDataEntry) {
  const primary = getPrimaryDatabaseBinding(resolveEntryBindings(entry, { databases: [] }));
  if (!primary) return null;
  return {
    bindingId: primary.id,
    databaseName: primary.databaseName ?? '',
    tableName: primary.tableName ?? '',
    columnName: primary.columnName ?? '',
    enabled: primary.enabled,
    confidence: primary.confidence,
    reason: primary.reason,
  };
}

export function remapDatabaseBindingsInForm(form: ElementFormState, rename: RenameMap): ElementFormState {
  const tempEntry: InspectorDataEntry = {
    bindings: form.bindings,
    customAttributes: form.customAttributes,
    databaseEnabled: form.databaseEnabled,
    databaseName: form.databaseName,
    tableName: form.tableName,
    columnName: form.columnName,
    inf1: form.inf1,
    inf2: form.inf2,
    inf3: form.inf3,
    storageEnabled: form.storageEnabled,
    storageMainFile: form.storageMainFile,
    storageSubFile: form.storageSubFile,
    attributesEnabled: form.attributesEnabled,
    attribute1: form.attribute1,
    attribute2: form.attribute2,
    attribute3: form.attribute3,
    dataUiPath: '',
    dataUiFeature: '',
    dataUiUuid: '',
    dataUiInstanceId: '',
    dataUiIdentityKey: '',
  };
  const remapped = remapDatabaseBindingsInEntry(tempEntry, rename);
  return {
    ...form,
    databaseName: remapped.databaseName ?? '',
    tableName: remapped.tableName ?? '',
    columnName: remapped.columnName ?? '',
    inf1: remapped.inf1,
    inf2: remapped.inf2,
    inf3: remapped.inf3,
    bindings: remapped.bindings ?? form.bindings,
  };
}

export type { RenameMap as DatabaseBindingRenameMap };
