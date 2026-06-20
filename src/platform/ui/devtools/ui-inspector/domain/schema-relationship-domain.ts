import { findColumn, findDatabase, findTable } from '../data/database-ref-utils';
import type { DatabaseRefColumn, DatabaseRefFile } from '../data/database-ref.types';
import { resolveEntryBindings } from '../data/element-binding-utils';
import type { InspectorDataMap } from '../data/inspector-config.types';
import { findStorageFolder } from '../data/storage-ref-utils';
import type { StorageRefFile } from '../data/storage-ref.types';

import { createDomainError } from './domain-errors';
import type { DatabaseColumnRef, SchemaRelationship, SchemaRelationshipKind, StorageLocationRef } from './domain-types';
import {
  columnRefKey,
  databaseColumnExists,
  hasStorageColumnAnchor,
  isDatabaseColumnRefComplete,
  storageLocationKey,
} from './governance-domain';
import { getElementsSharingDatabase, getElementsSharingStorage } from './relationship-domain';

function assertColumnExists(databaseRef: DatabaseRefFile, ref: DatabaseColumnRef): void {
  if (!databaseColumnExists(databaseRef, ref)) {
    throw createDomainError('NOT_FOUND', `Column ${columnRefKey(ref)} not found.`);
  }
}

export function getColumnForeignKey(
  databaseRef: DatabaseRefFile,
  source: DatabaseColumnRef
): DatabaseColumnRef | null {
  const column = findColumn(
    findTable(findDatabase(databaseRef, source.databaseName), source.tableName),
    source.columnName
  );
  if (!column?.isForeignKey) return null;
  if (!column.referencesDatabase || !column.referencesTable || !column.referencesColumn) return null;
  return {
    databaseName: column.referencesDatabase,
    tableName: column.referencesTable,
    columnName: column.referencesColumn,
  };
}

export function setColumnForeignKey(
  databaseRef: DatabaseRefFile,
  source: DatabaseColumnRef,
  target: DatabaseColumnRef
): DatabaseRefFile {
  assertColumnExists(databaseRef, source);
  assertColumnExists(databaseRef, target);

  return {
    databases: databaseRef.databases.map((db) =>
      db.name !== source.databaseName
        ? db
        : {
            ...db,
            tables: db.tables.map((table) =>
              table.name !== source.tableName
                ? table
                : {
                    ...table,
                    columns: table.columns.map((column) =>
                      column.name !== source.columnName
                        ? column
                        : {
                            ...column,
                            isForeignKey: true,
                            referencesDatabase: target.databaseName,
                            referencesTable: target.tableName,
                            referencesColumn: target.columnName,
                          }
                    ),
                  }
            ),
          }
    ),
  };
}

export function clearColumnForeignKey(
  databaseRef: DatabaseRefFile,
  source: DatabaseColumnRef
): DatabaseRefFile {
  return {
    databases: databaseRef.databases.map((db) =>
      db.name !== source.databaseName
        ? db
        : {
            ...db,
            tables: db.tables.map((table) =>
              table.name !== source.tableName
                ? table
                : {
                    ...table,
                    columns: table.columns.map((column) =>
                      column.name !== source.columnName
                        ? column
                        : {
                            ...column,
                            isForeignKey: false,
                          }
                    ),
                  }
            ),
          }
    ),
  };
}

export function listColumnForeignKeys(databaseRef: DatabaseRefFile): SchemaRelationship[] {
  const relationships: SchemaRelationship[] = [];
  for (const db of databaseRef.databases) {
    for (const table of db.tables) {
      for (const column of table.columns) {
        if (!column.isForeignKey || !column.referencesDatabase || !column.referencesTable || !column.referencesColumn) {
          continue;
        }
        const from: DatabaseColumnRef = {
          databaseName: db.name,
          tableName: table.name,
          columnName: column.name,
        };
        const to: DatabaseColumnRef = {
          databaseName: column.referencesDatabase,
          tableName: column.referencesTable,
          columnName: column.referencesColumn,
        };
        relationships.push({
          id: `fk:${columnRefKey(from)}->${columnRefKey(to)}`,
          kind: 'column_foreign_key',
          fromDatabaseColumn: from,
          toDatabaseColumn: to,
          reason: 'Column foreign key in database_ref.',
        });
      }
    }
  }
  return relationships;
}

export function linkStorageMainFileToDatabaseColumn(
  storageRef: StorageRefFile,
  location: StorageLocationRef,
  anchor: DatabaseColumnRef,
  databaseRef: DatabaseRefFile
): StorageRefFile {
  assertColumnExists(databaseRef, anchor);
  const folder = findStorageFolder(storageRef, location.storageMainFile);
  if (!folder) throw createDomainError('NOT_FOUND', `Storage main file "${location.storageMainFile}" not found.`);

  return {
    folders: storageRef.folders.map((entry) =>
      entry.name !== location.storageMainFile
        ? entry
        : {
            ...entry,
            linkedDatabaseName: anchor.databaseName,
            linkedTableName: anchor.tableName,
            linkedColumnName: anchor.columnName,
          }
    ),
  };
}

export function unlinkStorageMainFileFromDatabaseColumn(
  storageRef: StorageRefFile,
  location: StorageLocationRef
): StorageRefFile {
  return {
    folders: storageRef.folders.map((entry) => {
      if (entry.name !== location.storageMainFile) return entry;
      const { linkedDatabaseName: _a, linkedTableName: _b, linkedColumnName: _c, ...rest } = entry;
      return rest;
    }),
  };
}

export function listStorageColumnAnchors(storageRef: StorageRefFile): SchemaRelationship[] {
  const relationships: SchemaRelationship[] = [];
  for (const folder of storageRef.folders) {
    if (!hasStorageColumnAnchor(folder)) continue;
    relationships.push({
      id: `storage-anchor:${folder.name}`,
      kind: 'storage_backed_by_column',
      storageLocation: { storageMainFile: folder.name },
      anchoredDatabaseColumn: {
        databaseName: folder.linkedDatabaseName!,
        tableName: folder.linkedTableName!,
        columnName: folder.linkedColumnName!,
      },
      reason: 'Storage main file anchored to database column.',
    });
  }
  return relationships;
}

export function getStorageLocationsAnchoredToColumn(
  storageRef: StorageRefFile,
  column: DatabaseColumnRef
): StorageLocationRef[] {
  const key = columnRefKey(column);
  return listStorageColumnAnchors(storageRef)
    .filter((rel) => rel.anchoredDatabaseColumn && columnRefKey(rel.anchoredDatabaseColumn) === key)
    .map((rel) => rel.storageLocation!)
    .filter(Boolean);
}

export function listSchemaRelationships(
  databaseRef: DatabaseRefFile,
  storageRef: StorageRefFile,
  inspectorData?: InspectorDataMap
): SchemaRelationship[] {
  const relationships = [...listColumnForeignKeys(databaseRef), ...listStorageColumnAnchors(storageRef)];

  if (inspectorData) {
    for (const entry of Object.values(inspectorData)) {
      for (const binding of resolveEntryBindings(entry, { databases: [] })) {
        if (!binding.enabled || binding.kind !== 'database') continue;
        const ref: DatabaseColumnRef = {
          databaseName: binding.databaseName ?? '',
          tableName: binding.tableName ?? '',
          columnName: binding.columnName ?? '',
        };
        if (!isDatabaseColumnRefComplete(ref)) continue;
        const shared = getElementsSharingDatabase(inspectorData, ref.databaseName, ref.tableName, ref.columnName);
        if (shared.length > 1) {
          relationships.push({
            id: `shared-db:${columnRefKey(ref)}`,
            kind: 'shared_database_table',
            fromDatabaseColumn: ref,
            toDatabaseColumn: ref,
            reason: `${shared.length} elements share ${columnRefKey(ref)}.`,
          });
        }
      }
      for (const binding of resolveEntryBindings(entry, { databases: [] })) {
        if (!binding.enabled || binding.kind !== 'storage') continue;
        const main = binding.storageMainFile ?? '';
        if (!main) continue;
        const shared = getElementsSharingStorage(inspectorData, main);
        if (shared.length > 1) {
          relationships.push({
            id: `shared-storage:${storageLocationKey({ storageMainFile: main })}`,
            kind: 'shared_storage_location',
            storageLocation: { storageMainFile: main },
            reason: `${shared.length} elements share storage ${main}.`,
          });
        }
      }
    }
  }

  return relationships;
}

export function createDatabaseColumnRelationship(
  databaseRef: DatabaseRefFile,
  fromColumn: DatabaseColumnRef,
  toColumn: DatabaseColumnRef,
  kind: Extract<SchemaRelationshipKind, 'column_foreign_key'> = 'column_foreign_key'
): DatabaseRefFile {
  if (kind !== 'column_foreign_key') {
    throw createDomainError('INVALID_BINDING', 'Only column_foreign_key is supported for database column relationships.');
  }
  return setColumnForeignKey(databaseRef, fromColumn, toColumn);
}

export type CreateColumnInput = Pick<DatabaseRefColumn, 'name'> & Partial<Omit<DatabaseRefColumn, 'name'>>;
