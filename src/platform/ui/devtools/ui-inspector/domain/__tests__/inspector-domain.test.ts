import { describe, expect, it } from '@jest/globals';

import type { InspectElementSnapshot } from '../../../UiInspectorFrameBridge';
import { emptyDatabaseRefFile } from '../../data/database-ref-utils';
import { createDatabaseBinding, createStorageBinding } from '../../data/element-binding-utils';
import { buildInspectorDataEntry, emptyFormState } from '../../data/inspector-config-storage';
import { emptyStorageRefFile } from '../../data/storage-ref-utils';
import { getFrameEligibleElements, getInspectorElementProfile, getSimulationSummary } from '../inspector-domain';

function mockSnapshot(overrides: Partial<InspectElementSnapshot> = {}): InspectElementSnapshot {
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
    ...overrides,
  };
}

describe('inspector-domain', () => {
  it('getInspectorElementProfile aggregates element data', () => {
    const snapshot = mockSnapshot();
    const entry = buildInspectorDataEntry(snapshot, {
      ...emptyFormState(),
      bindings: [
        createDatabaseBinding({ databaseName: 'db1', tableName: 'users', columnName: 'email' }),
        createStorageBinding({ storageMainFile: 'Projects' }),
      ],
    });
    const context = {
      inspectorData: { [entry.dataUiIdentityKey]: entry },
      databaseRef: emptyDatabaseRefFile(),
      storageRef: emptyStorageRefFile(),
    };
    const profile = getInspectorElementProfile(context, entry.dataUiIdentityKey);
    expect(profile?.hasDatabaseBinding).toBe(true);
    expect(profile?.hasStorageBinding).toBe(true);
    expect(profile?.databaseConnections).toHaveLength(1);
    expect(profile?.storageConnections).toHaveLength(1);
  });

  it('getFrameEligibleElements returns only saved binding elements', () => {
    const saved = mockSnapshot({ scanKey: 'scan-a', identityKey: 'key-a', uuid: 'uuid-a' });
    const unsaved = mockSnapshot({
      scanKey: 'scan-b',
      identityKey: 'key-b',
      uuid: 'uuid-b',
      path: 'settings.profile.email',
    });
    const entry = buildInspectorDataEntry(saved, {
      ...emptyFormState(),
      bindings: [createDatabaseBinding({ databaseName: 'db1', tableName: 'users', columnName: 'email' })],
    });
    const candidates = getFrameEligibleElements({ [entry.dataUiIdentityKey]: entry }, [saved, unsaved]);
    expect(candidates).toHaveLength(1);
    expect(candidates[0]?.scanKey).toBe('scan-a');
  });

  it('getSimulationSummary returns accurate counts', () => {
    const a = mockSnapshot({ identityKey: 'key-a', uuid: 'uuid-a' });
    const b = mockSnapshot({ identityKey: 'key-b', uuid: 'uuid-b', scanKey: 'scan-2' });
    const entryA = buildInspectorDataEntry(a, {
      ...emptyFormState(),
      bindings: [createDatabaseBinding({ databaseName: 'db1', tableName: 'users', columnName: 'email' })],
    });
    const entryB = buildInspectorDataEntry(b, emptyFormState());
    const summary = getSimulationSummary(
      { [entryA.dataUiIdentityKey]: entryA, [entryB.dataUiIdentityKey]: entryB },
      emptyDatabaseRefFile(),
      emptyStorageRefFile()
    );
    expect(summary.totalSavedElements).toBe(2);
    expect(summary.databaseLinkedElements).toBe(1);
    expect(summary.unboundElements).toBe(1);
    expect(summary.topDatabases[0]?.name).toBe('db1');
  });
});
