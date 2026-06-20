import { describe, expect, it } from '@jest/globals';

import {
  bindingsFromLegacyEntry,
  createDatabaseBinding,
  createStorageBinding,
  deleteBinding,
  duplicateBinding,
  getPrimaryDatabaseBinding,
  getPrimaryStorageBinding,
  normalizeBindings,
  syncLegacyFieldsFromBindings,
  updateBinding,
} from '../data/element-binding-utils';
import type { InspectorDataEntry } from '../data/inspector-config.types';

const emptyEntry = (): InspectorDataEntry => ({
  databaseEnabled: false,
  inf1: '',
  inf2: '',
  inf3: '',
  attributesEnabled: false,
  attribute1: false,
  attribute2: false,
  attribute3: false,
  dataUiPath: '',
  dataUiFeature: '',
  dataUiUuid: 'u1',
  dataUiInstanceId: '',
  dataUiIdentityKey: 'u1',
});

describe('element-binding-utils', () => {
  it('migrates legacy database and storage fields into bindings', () => {
    const bindings = bindingsFromLegacyEntry(
      {
        ...emptyEntry(),
        databaseEnabled: true,
        databaseName: 'hr',
        tableName: 'employees',
        columnName: 'id',
        storageEnabled: true,
        storageMainFile: 'Projects',
        storageSubFile: 'Frontend',
      },
      { databases: [] }
    );
    expect(bindings).toHaveLength(2);
    expect(bindings[0]?.kind).toBe('database');
    expect(bindings[1]?.kind).toBe('storage');
  });

  it('supports binding CRUD helpers', () => {
    const db = createDatabaseBinding({
      databaseName: 'db',
      tableName: 't',
      columnName: 'c',
      role: 'read_from',
    });
    let bindings = [db];
    bindings = [updateBinding(bindings[0]!, { role: 'write_to' })];
    expect(bindings[0]?.role).toBe('write_to');
    bindings = duplicateBinding(bindings, bindings[0]!.id);
    expect(bindings).toHaveLength(2);
    bindings = deleteBinding(bindings, bindings[0]!.id);
    expect(bindings).toHaveLength(1);
  });

  it('syncs legacy fields from primary bindings without touching inf fields', () => {
    const bindings = normalizeBindings([
      createDatabaseBinding({
        databaseName: 'db',
        tableName: 'users',
        columnName: 'email',
        role: 'read_from',
      }),
      createStorageBinding({
        storageMainFile: 'Assets',
        storageSubFile: 'Avatars',
        role: 'upload_to',
      }),
    ]);
    const synced = syncLegacyFieldsFromBindings(
      { ...emptyEntry(), inf1: 'keep-me', inf2: '', inf3: '' },
      bindings
    );
    expect(synced.databaseName).toBe('db');
    expect(synced.storageMainFile).toBe('Assets');
    expect(synced.inf1).toBe('keep-me');
    expect(getPrimaryDatabaseBinding(bindings)?.columnName).toBe('email');
    expect(getPrimaryStorageBinding(bindings)?.storageSubFile).toBe('Avatars');
  });
});
