import { describe, expect, it } from '@jest/globals';

import type { InspectElementSnapshot } from '../../../UiInspectorFrameBridge';
import { emptyDatabaseRefFile } from '../../data/database-ref-utils';
import { createDatabaseBinding } from '../../data/element-binding-utils';
import { buildInspectorDataEntry, emptyFormState } from '../../data/inspector-config-storage';
import {
  applyDatabaseRenameToInspectorData,
  createColumn,
  createDatabase,
  createTable,
  deleteDatabaseFromRef,
  renameDatabaseInRef,
} from '../database-domain';
import { isDomainError } from '../domain-errors';

function mockSnapshot(): InspectElementSnapshot {
  return {
    scanKey: 'scan-1',
    uuid: 'uuid-1',
    hasUuid: true,
    instanceId: '',
    id: 'UI_TEST',
    path: 'auth.login.email',
    feature: 'auth',
    tagName: 'input',
    lifecycle: 'active',
    identityKey: 'uuid-1',
    hasSource: true,
    sourceFile: '/src/test.tsx',
    sourceLine: 1,
    sourceComponent: 'Test',
    rect: { top: 0, left: 0, width: 120, height: 32 },
  };
}

describe('database-domain', () => {
  it('creates, renames, and deletes database', () => {
    let ref = emptyDatabaseRefFile();
    ref = createDatabase(ref, { name: 'users_db' });
    expect(ref.databases).toHaveLength(1);
    ref = renameDatabaseInRef(ref, 'users_db', 'accounts_db');
    expect(ref.databases[0]?.name).toBe('accounts_db');
    ref = deleteDatabaseFromRef(ref, 'accounts_db');
    expect(ref.databases).toHaveLength(0);
  });

  it('creates, renames, and deletes table and column', () => {
    let ref = createDatabase(emptyDatabaseRefFile(), { name: 'db1' });
    ref = createTable(ref, 'db1', { name: 'users' });
    ref = createColumn(ref, 'db1', 'users', { name: 'email' });
    expect(ref.databases[0]?.tables[0]?.columns[0]?.name).toBe('email');
    ref = deleteDatabaseFromRef(ref, 'db1');
    expect(ref.databases).toHaveLength(0);
  });

  it('throws DUPLICATE_NAME for duplicate database', () => {
    const ref = createDatabase(emptyDatabaseRefFile(), { name: 'db1' });
    expect(() => createDatabase(ref, { name: 'db1' })).toThrow();
    try {
      createDatabase(ref, { name: 'db1' });
    } catch (error) {
      expect(isDomainError(error)).toBe(true);
      if (isDomainError(error)) expect(error.code).toBe('DUPLICATE_NAME');
    }
  });

  it('rename helper updates bindings in inspectorData', () => {
    const snapshot = mockSnapshot();
    const entry = buildInspectorDataEntry(snapshot, {
      ...emptyFormState(),
      bindings: [
        createDatabaseBinding({ databaseName: 'old_db', tableName: 'old_table', columnName: 'old_col' }),
      ],
    });
    const data = { [entry.dataUiIdentityKey]: entry };
    const next = applyDatabaseRenameToInspectorData(data, {
      database: { oldName: 'old_db', newName: 'new_db' },
      table: { oldName: 'old_table', newName: 'new_table' },
      column: { oldName: 'old_col', newName: 'new_col' },
    });
    const remapped = next[entry.dataUiIdentityKey];
    expect(remapped?.bindings?.[0]?.databaseName).toBe('new_db');
    expect(remapped?.bindings?.[0]?.tableName).toBe('new_table');
    expect(remapped?.bindings?.[0]?.columnName).toBe('new_col');
  });
});
