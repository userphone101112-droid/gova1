import { describe, expect, it } from '@jest/globals';

import type { InspectElementSnapshot } from '../../UiInspectorFrameBridge';
import { createDatabaseBinding, createStorageBinding } from '../data/element-binding-utils';
import {
  buildInspectorDataEntry,
  emptyFormState,
  formStateFromEntry,
  getInspectorData,
  getStorageKey,
  mergeInspectorEntry,
  normalizeInspectorDataMap,
} from '../data/inspector-config-storage';

function mockElement(overrides: Partial<InspectElementSnapshot> = {}): InspectElementSnapshot {
  return {
    scanKey: 'scan-1',
    uuid: 'uuid-1',
    hasUuid: true,
    instanceId: 'inst-1',
    id: 'UI_TEST',
    path: 'test.path',
    feature: 'devtools',
    tagName: 'button',
    lifecycle: 'active',
    identityKey: 'uuid-1:inst-1',
    hasSource: true,
    sourceFile: '/src/test.tsx',
    sourceLine: 1,
    sourceComponent: 'Test',
    rect: { top: 0, left: 0, width: 100, height: 40 },
    ...overrides,
  };
}

describe('inspector-config-storage', () => {
  it('builds stable storage keys', () => {
    const element = mockElement();
    expect(getStorageKey(element)).toBe('uuid-1:inst-1');
    expect(getStorageKey(mockElement({ instanceId: null }))).toBe('uuid-1');
  });

  it('returns empty form state when no saved entry exists', () => {
    expect(formStateFromEntry(undefined)).toEqual(emptyFormState());
  });

  it('maps saved entry into form state and back', () => {
    const element = mockElement();
    const form = {
      ...emptyFormState(),
      bindings: [
        createDatabaseBinding({
          databaseName: 'db_en',
          tableName: 'table_en',
          columnName: 'column_en',
        }),
      ],
      databaseEnabled: true,
      databaseName: 'db_en',
      tableName: 'table_en',
      columnName: 'column_en',
      inf1: 'note',
      attributesEnabled: true,
      attribute1: true,
      attribute2: false,
      attribute3: true,
    };
    const entry = buildInspectorDataEntry(element, form);
    expect(entry.dataUiUuid).toBe('uuid-1');
    expect(entry.databaseName).toBe('db_en');
    const loaded = formStateFromEntry(entry, { databases: [] });
    expect(loaded.databaseName).toBe('db_en');
    expect(loaded.inf1).toBe('note');
    expect(loaded.bindings.length).toBeGreaterThan(0);
  });

  it('resolves saved data by storage key', () => {
    const element = mockElement();
    const map = {
      'uuid-1:inst-1': buildInspectorDataEntry(element, {
        ...emptyFormState(),
        bindings: [
          createDatabaseBinding({
            databaseName: 'saved-db',
            tableName: 't1',
            columnName: 'c1',
          }),
        ],
        databaseName: 'saved-db',
      }),
    };
    expect(getInspectorData(map, element)?.databaseName).toBe('saved-db');
  });

  it('merges saved entries without duplicate keys for the same element', () => {
    const element = mockElement({ instanceId: 'inst-1' });
    const entry = buildInspectorDataEntry(element, {
      ...emptyFormState(),
      bindings: [
        createStorageBinding({
          storageMainFile: 'Projects',
        }),
      ],
      storageEnabled: true,
      storageMainFile: 'Projects',
    });
    const merged = mergeInspectorEntry(
      {
        'uuid-1': { ...entry, inf1: 'legacy' },
        'uuid-1:inst-1': { ...entry, inf1: 'older', updatedAt: '2020-01-01T00:00:00.000Z' },
      },
      'uuid-1:inst-1',
      entry
    );
    expect(Object.keys(merged)).toEqual(['uuid-1:inst-1']);
    expect(merged['uuid-1:inst-1']?.storageMainFile).toBe('Projects');
  });

  it('normalizes duplicate inspector map keys by newest updatedAt', () => {
    const element = mockElement({ instanceId: null });
    const older = buildInspectorDataEntry(element, { ...emptyFormState(), inf1: 'old' });
    const newer = {
      ...buildInspectorDataEntry(element, { ...emptyFormState(), inf1: 'new' }),
      updatedAt: '2099-01-01T00:00:00.000Z',
    };
    const normalized = normalizeInspectorDataMap({
      'uuid-1': older,
      duplicate: { ...newer, dataUiIdentityKey: 'uuid-1' },
    });
    expect(Object.keys(normalized)).toHaveLength(1);
    expect(normalized['uuid-1']?.inf1).toBe('new');
  });
});
