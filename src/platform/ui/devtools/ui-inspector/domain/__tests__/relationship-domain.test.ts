import { describe, expect, it } from '@jest/globals';

import type { InspectElementSnapshot } from '../../../UiInspectorFrameBridge';
import { createDatabaseBinding } from '../../data/element-binding-utils';
import { buildInspectorDataEntry, emptyFormState } from '../../data/inspector-config-storage';
import {
  createElementRelationBinding,
  getElementIncomingRelations,
  getElementOutgoingRelations,
  getElementsSharingDatabase,
  validateElementRelations,
} from '../relationship-domain';

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

describe('relationship-domain', () => {
  it('creates relation binding and resolves incoming/outgoing relations', () => {
    const source = mockSnapshot({ identityKey: 'key-a', uuid: 'uuid-a' });
    const target = mockSnapshot({ identityKey: 'key-b', uuid: 'uuid-b', scanKey: 'scan-2' });
    let sourceEntry = buildInspectorDataEntry(source, emptyFormState());
    sourceEntry = createElementRelationBinding(sourceEntry, {
      linkedElementKey: 'key-b',
      enabled: true,
    });
    const data = { [sourceEntry.dataUiIdentityKey]: sourceEntry };
    const outgoing = getElementOutgoingRelations(data, sourceEntry.dataUiIdentityKey);
    const incoming = getElementIncomingRelations(data, 'key-b');
    expect(outgoing[0]?.toElementKey).toBe('key-b');
    expect(incoming[0]?.fromElementKey).toBe(sourceEntry.dataUiIdentityKey);
    expect(target.uuid).toBe('uuid-b');
  });

  it('detects broken relation targets', () => {
    const source = mockSnapshot({ identityKey: 'key-a' });
    let entry = buildInspectorDataEntry(source, emptyFormState());
    entry = createElementRelationBinding(entry, { linkedElementKey: 'missing-key', enabled: true });
    const issues = validateElementRelations({ [entry.dataUiIdentityKey]: entry });
    expect(issues.some((issue) => issue.code === 'RELATION_TARGET_MISSING')).toBe(true);
  });

  it('finds elements sharing database bindings', () => {
    const a = mockSnapshot({ identityKey: 'key-a', uuid: 'uuid-a' });
    const b = mockSnapshot({ identityKey: 'key-b', uuid: 'uuid-b', scanKey: 'scan-2' });
    const entryA = buildInspectorDataEntry(a, {
      ...emptyFormState(),
      bindings: [createDatabaseBinding({ databaseName: 'db1', tableName: 'users', columnName: 'email' })],
    });
    const entryB = buildInspectorDataEntry(b, {
      ...emptyFormState(),
      bindings: [createDatabaseBinding({ databaseName: 'db1', tableName: 'users', columnName: 'name' })],
    });
    const shared = getElementsSharingDatabase(
      { [entryA.dataUiIdentityKey]: entryA, [entryB.dataUiIdentityKey]: entryB },
      'db1',
      'users'
    );
    expect(shared).toEqual(expect.arrayContaining([entryA.dataUiIdentityKey, entryB.dataUiIdentityKey]));
  });
});
