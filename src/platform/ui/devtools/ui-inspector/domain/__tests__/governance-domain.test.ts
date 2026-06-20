import { describe, expect, it } from '@jest/globals';

import { createDatabaseBinding } from '../../data/element-binding-utils';
import { buildInspectorDataEntry, emptyFormState } from '../../data/inspector-config-storage';
import type { StorageRefFile } from '../../data/storage-ref.types';
import type { InspectElementSnapshot } from '../../../UiInspectorFrameBridge';
import { createStorageSubFile } from '../storage-domain';
import {
  isLegacyStorageLocation,
  listLegacyReadonlyStorageLocations,
  validateNewStorageBinding,
  validateStorageRefGovernance,
} from '../governance-domain';
import { linkStorageSubFileToDatabaseColumn } from '../schema-relationship-domain';

function dbRef() {
  return {
    databases: [
      {
        name: 'db1',
        tables: [{ name: 'users', columns: [{ name: 'avatar_path' }, { name: 'email' }] }],
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
    path: 'auth.avatar',
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

describe('governance-domain', () => {
  it('marks legacy storage without anchor as readonly', () => {
    const storageRef = {
      folders: [{ name: 'Projects', subfolders: [{ name: 'Legacy' }] }],
    };
    expect(isLegacyStorageLocation(storageRef, { storageMainFile: 'Projects', storageSubFile: 'Legacy' })).toBe(
      true
    );
    expect(listLegacyReadonlyStorageLocations(storageRef)).toHaveLength(1);
  });

  it('blocks new storage sub file without database column anchor', () => {
    let storageRef = emptyStorageRefFile();
    storageRef = { folders: [{ name: 'Projects', subfolders: [] }] };
    expect(() =>
      createStorageSubFile(storageRef, 'Projects', {
        name: 'NewDocs',
        linkedDatabaseColumn: { databaseName: '', tableName: '', columnName: '' },
      }, dbRef())
    ).toThrow();
  });

  it('allows new storage sub file with valid anchor', () => {
    const storageRef: StorageRefFile = { folders: [{ name: 'Projects', subfolders: [] }] };
    const next = createStorageSubFile(
      storageRef,
      'Projects',
      {
        name: 'Anchored',
        linkedDatabaseColumn: { databaseName: 'db1', tableName: 'users', columnName: 'avatar_path' },
      },
      dbRef()
    );
    expect(next.folders[0]?.subfolders[0]?.linkedColumnName).toBe('avatar_path');
  });

  it('allows storage binding when element has enabled database binding', () => {
    const entry = buildInspectorDataEntry(mockSnapshot(), {
      ...emptyFormState(),
      bindings: [createDatabaseBinding({ databaseName: 'db1', tableName: 'users', columnName: 'email' })],
    });
    const storageRef = {
      folders: [{ name: 'Projects', subfolders: [{ name: 'Legacy' }] }],
    };
    expect(() =>
      validateNewStorageBinding({
        entry,
        storageRef,
        databaseRef: dbRef(),
        storageMainFile: 'Projects',
        storageSubFile: 'Legacy',
      })
    ).not.toThrow();
  });

  it('upgrading legacy storage via anchor removes readonly state', () => {
    let storageRef = {
      folders: [{ name: 'Projects', subfolders: [{ name: 'Legacy' }] }],
    };
    storageRef = linkStorageSubFileToDatabaseColumn(
      storageRef,
      { storageMainFile: 'Projects', storageSubFile: 'Legacy' },
      { databaseName: 'db1', tableName: 'users', columnName: 'avatar_path' },
      dbRef()
    );
    expect(isLegacyStorageLocation(storageRef, { storageMainFile: 'Projects', storageSubFile: 'Legacy' })).toBe(
      false
    );
    const report = validateStorageRefGovernance(storageRef, dbRef());
    expect(report.legacyReadonlyStorageLocations).toHaveLength(0);
  });
});
