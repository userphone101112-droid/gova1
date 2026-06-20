import { describe, expect, it } from '@jest/globals';

import type { InspectElementSnapshot } from '../../../UiInspectorFrameBridge';
import { createDatabaseBinding, createStorageBinding } from '../../data/element-binding-utils';
import { buildInspectorDataEntry, emptyFormState } from '../../data/inspector-config-storage';
import {
  clearElementDatabaseBindings,
  clearElementStorageBindings,
  getElementProfile,
  hasAnySavedBinding,
} from '../element-domain';

function mockSnapshot(overrides: Partial<InspectElementSnapshot> = {}): InspectElementSnapshot {
  return {
    scanKey: 'scan-1',
    uuid: 'uuid-1',
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
    ...overrides,
  };
}

describe('element-domain', () => {
  it('getElementProfile returns database/storage/relations correctly', () => {
    const snapshot = mockSnapshot();
    const entry = buildInspectorDataEntry(snapshot, {
      ...emptyFormState(),
      bindings: [
        createDatabaseBinding({ databaseName: 'db1', tableName: 'users', columnName: 'email' }),
        createStorageBinding({ storageMainFile: 'Projects' }),
      ],
    });
    const profile = getElementProfile({ [entry.dataUiIdentityKey]: entry }, entry.dataUiIdentityKey);
    expect(profile?.hasDatabaseBinding).toBe(true);
    expect(profile?.hasStorageBinding).toBe(true);
    expect(profile?.databaseBindings).toHaveLength(1);
    expect(profile?.storageBindings).toHaveLength(1);
    expect(profile?.legacyFields.inf1).toBe(entry.inf1);
  });

  it('clearElementDatabaseBindings does not touch storage or attributes', () => {
    const snapshot = mockSnapshot();
    const entry = buildInspectorDataEntry(snapshot, {
      ...emptyFormState(),
      bindings: [
        createDatabaseBinding({ databaseName: 'db1', tableName: 't1', columnName: 'c1' }),
        createStorageBinding({ storageMainFile: 'Projects' }),
      ],
      attributesEnabled: true,
      attribute1: true,
    });
    const cleared = clearElementDatabaseBindings(entry);
    expect(cleared.bindings?.filter((b) => b.kind === 'database')).toHaveLength(0);
    expect(cleared.bindings?.filter((b) => b.kind === 'storage')).toHaveLength(1);
    expect(cleared.attributesEnabled).toBe(true);
    expect(cleared.attribute1).toBe(true);
    expect(hasAnySavedBinding(cleared)).toBe(true);
  });

  it('clearElementStorageBindings does not touch database', () => {
    const snapshot = mockSnapshot();
    const entry = buildInspectorDataEntry(snapshot, {
      ...emptyFormState(),
      bindings: [
        createDatabaseBinding({ databaseName: 'db1', tableName: 't1', columnName: 'c1' }),
        createStorageBinding({ storageMainFile: 'Projects' }),
      ],
    });
    const cleared = clearElementStorageBindings(entry);
    expect(cleared.bindings?.filter((b) => b.kind === 'storage')).toHaveLength(0);
    expect(cleared.bindings?.filter((b) => b.kind === 'database')).toHaveLength(1);
  });
});
