import { describe, expect, it } from '@jest/globals';

import type { InspectElementSnapshot } from '../../UiInspectorFrameBridge';
import {
  buildInspectorDataEntry,
  emptyFormState,
  formStateFromEntry,
  getInspectorData,
  getStorageKey,
} from '../data/inspector-config-storage';

function mockElement(overrides: Partial<InspectElementSnapshot> = {}): InspectElementSnapshot {
  return {
    scanKey: 'scan-1',
    uuid: 'uuid-1',
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
      databaseEnabled: true,
      inf1: 'db_en',
      inf2: 'table_en',
      inf3: 'column_en',
      attributesEnabled: true,
      attribute1: true,
      attribute2: false,
      attribute3: true,
    };
    const entry = buildInspectorDataEntry(element, form);
    expect(entry.dataUiUuid).toBe('uuid-1');
    expect(entry.inf1).toBe('db_en');
    expect(formStateFromEntry(entry)).toEqual(form);
  });

  it('resolves saved data by storage key', () => {
    const element = mockElement();
    const map = {
      'uuid-1:inst-1': buildInspectorDataEntry(element, {
        ...emptyFormState(),
        inf1: 'saved-db',
      }),
    };
    expect(getInspectorData(map, element)?.inf1).toBe('saved-db');
  });
});
