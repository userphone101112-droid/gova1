import { describe, expect, it } from '@jest/globals';

import type { InspectElementSnapshot } from '../../../UiInspectorFrameBridge';
import { createStorageBinding } from '../../data/element-binding-utils';
import { buildInspectorDataEntry, emptyFormState } from '../../data/inspector-config-storage';
import { emptyStorageRefFile } from '../../data/storage-ref-utils';
import { isDomainError } from '../domain-errors';
import {
  applyStorageRenameToInspectorData,
  createStorageMainFile,
  deleteStorageMainFile,
  renameStorageMainFile,
} from '../storage-domain';

function dbRef() {
  return {
    databases: [
      {
        name: 'db1',
        tables: [{ name: 'users', columns: [{ name: 'avatar_path' }] }],
      },
    ],
  };
}

function mockSnapshot(): InspectElementSnapshot {
  return {
    scanKey: 'scan-1',
    uuid: 'uuid-1',
    instanceId: '',
    id: 'UI_TEST',
    path: 'auth.avatar.image',
    feature: 'auth',
    tagName: 'img',
    lifecycle: 'active',
    identityKey: 'uuid-1',
    hasSource: true,
    sourceFile: '/src/test.tsx',
    sourceLine: 1,
    sourceComponent: 'Test',
    rect: { top: 0, left: 0, width: 120, height: 32 },
  };
}

describe('storage-domain', () => {
  it('creates, renames, and deletes main files with anchor', () => {
    let ref = createStorageMainFile(
      emptyStorageRefFile(),
      {
        name: 'Projects',
        linkedDatabaseColumn: { databaseName: 'db1', tableName: 'users', columnName: 'avatar_path' },
      },
      dbRef()
    );
    expect(ref.folders[0]?.linkedColumnName).toBe('avatar_path');
    ref = renameStorageMainFile(ref, 'Projects', 'Assets');
    expect(ref.folders[0]?.name).toBe('Assets');
    ref = deleteStorageMainFile(ref, 'Assets');
    expect(ref.folders).toHaveLength(0);
  });

  it('throws DUPLICATE_NAME for duplicate main file', () => {
    const ref = createStorageMainFile(
      emptyStorageRefFile(),
      {
        name: 'Projects',
        linkedDatabaseColumn: { databaseName: 'db1', tableName: 'users', columnName: 'avatar_path' },
      },
      dbRef()
    );
    expect(() =>
      createStorageMainFile(
        ref,
        {
          name: 'Projects',
          linkedDatabaseColumn: { databaseName: 'db1', tableName: 'users', columnName: 'avatar_path' },
        },
        dbRef()
      )
    ).toThrow();
    try {
      createStorageMainFile(
        ref,
        {
          name: 'Projects',
          linkedDatabaseColumn: { databaseName: 'db1', tableName: 'users', columnName: 'avatar_path' },
        },
        dbRef()
      );
    } catch (error) {
      expect(isDomainError(error)).toBe(true);
      if (isDomainError(error)) expect(error.code).toBe('DUPLICATE_NAME');
    }
  });

  it('rename helper updates storage bindings in inspectorData', () => {
    const snapshot = mockSnapshot();
    const entry = buildInspectorDataEntry(snapshot, {
      ...emptyFormState(),
      bindings: [createStorageBinding({ storageMainFile: 'OldMain' })],
    });
    const data = { [entry.dataUiIdentityKey]: entry };
    const next = applyStorageRenameToInspectorData(data, {
      mainFile: { oldName: 'OldMain', newName: 'NewMain' },
    });
    const remapped = next[entry.dataUiIdentityKey];
    expect(remapped?.bindings?.[0]?.storageMainFile).toBe('NewMain');
  });
});
