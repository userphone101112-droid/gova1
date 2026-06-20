import { describe, expect, it } from '@jest/globals';

import { emptyDatabaseRefFile } from '../../data/database-ref-utils';
import { createDatabaseBinding } from '../../data/element-binding-utils';
import { buildInspectorDataEntry, emptyFormState } from '../../data/inspector-config-storage';
import type { InspectElementSnapshot } from '../../../UiInspectorFrameBridge';
import {
  getColumnForeignKey,
  linkStorageSubFileToDatabaseColumn,
  listSchemaRelationships,
  setColumnForeignKey,
} from '../schema-relationship-domain';

function dbRef() {
  return {
    databases: [
      {
        name: 'db1',
        tables: [
          {
            name: 'users',
            columns: [{ name: 'id' }, { name: 'role_id' }],
          },
          {
            name: 'roles',
            columns: [{ name: 'id' }],
          },
        ],
      },
    ],
  };
}

describe('schema-relationship-domain', () => {
  it('creates column foreign key relationship', () => {
    const ref = setColumnForeignKey(dbRef(), {
      databaseName: 'db1',
      tableName: 'users',
      columnName: 'role_id',
    }, {
      databaseName: 'db1',
      tableName: 'roles',
      columnName: 'id',
    });
    const fk = getColumnForeignKey(ref, {
      databaseName: 'db1',
      tableName: 'users',
      columnName: 'role_id',
    });
    expect(fk?.columnName).toBe('id');
  });

  it('links storage sub file to database column', () => {
    const storageRef = {
      folders: [{ name: 'Projects', subfolders: [{ name: 'Avatars' }] }],
    };
    const next = linkStorageSubFileToDatabaseColumn(
      storageRef,
      { storageMainFile: 'Projects', storageSubFile: 'Avatars' },
      { databaseName: 'db1', tableName: 'users', columnName: 'id' },
      dbRef()
    );
    const relationships = listSchemaRelationships(dbRef(), next);
    expect(relationships.some((rel) => rel.kind === 'storage_backed_by_column')).toBe(true);
  });

  it('lists shared database usage across elements', () => {
    const snapshot: InspectElementSnapshot = {
      scanKey: 'scan-1',
      uuid: 'uuid-1',
      instanceId: '',
      id: 'UI_TEST',
      path: 'test.a',
      feature: 'home',
      tagName: 'input',
      lifecycle: 'active',
      identityKey: 'uuid-1',
      hasSource: true,
      sourceFile: '/src/test.tsx',
      sourceLine: 1,
      sourceComponent: 'Test',
      rect: { top: 0, left: 0, width: 100, height: 40 },
    };
    const entryA = buildInspectorDataEntry(snapshot, {
      ...emptyFormState(),
      bindings: [createDatabaseBinding({ databaseName: 'db1', tableName: 'users', columnName: 'email' })],
    });
    const entryB = buildInspectorDataEntry(
      { ...snapshot, uuid: 'uuid-2', identityKey: 'uuid-2', scanKey: 'scan-2' },
      {
        ...emptyFormState(),
        bindings: [createDatabaseBinding({ databaseName: 'db1', tableName: 'users', columnName: 'email' })],
      }
    );
    const entryB = buildInspectorDataEntry(
      { ...snapshot, uuid: 'uuid-2', identityKey: 'uuid-2', scanKey: 'scan-2' },
      {
        ...emptyFormState(),
        bindings: [createDatabaseBinding({ databaseName: 'db1', tableName: 'users', columnName: 'email' })],
      }
    );
    const relationships = listSchemaRelationships(emptyDatabaseRefFile(), { folders: [] }, {
      [entryA.dataUiIdentityKey]: entryA,
      [entryB.dataUiIdentityKey]: entryB,
    });
    expect(relationships.some((rel) => rel.kind === 'shared_database_table')).toBe(true);
  });
});
