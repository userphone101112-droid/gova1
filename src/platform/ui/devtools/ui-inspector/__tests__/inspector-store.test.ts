import { describe, expect, it } from '@jest/globals';

import type { InspectElementSnapshot } from '../../UiInspectorFrameBridge';
import { emptyFormState, formStateFromEntry, getStorageKey, buildInspectorDataEntry } from '../data/inspector-config-storage';
import { selectSelectedElement } from '../state/inspector-selectors';
import { createInitialInspectorState, inspectorReducer } from '../state/inspector-store';

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

describe('inspector-store selection stability', () => {
  it('SET_ELEMENTS does not clear selectedScanKey or lastSelectedElement', () => {
    const element = mockElement();
    let state = createInitialInspectorState();
    state = inspectorReducer(state, {
      type: 'SELECT_ELEMENT',
      scanKey: element.scanKey,
      element,
    });

    const next = inspectorReducer(state, {
      type: 'SET_ELEMENTS',
      elements: [],
      lastScanTime: new Date(),
    });

    expect(next.selectedScanKey).toBe('scan-1');
    expect(next.lastSelectedElement).toEqual(element);
    expect(next.selectedIdentityKey).toBe(getStorageKey(element));
  });

  it('selectors.selected falls back to lastSelectedElement when scan list changes', () => {
    const element = mockElement();
    let state = createInitialInspectorState();
    state = inspectorReducer(state, {
      type: 'SELECT_ELEMENT',
      scanKey: element.scanKey,
      element,
    });
    state = inspectorReducer(state, {
      type: 'SET_ELEMENTS',
      elements: [mockElement({ scanKey: 'other-scan', uuid: 'other' })],
      lastScanTime: new Date(),
    });

    const { selected, hasElementSelection } = selectSelectedElement(state);
    expect(selected).toEqual(element);
    expect(hasElementSelection).toBe(true);
  });
});

describe('inspector-config legacy migration', () => {
  it('maps legacy inf1/inf2/inf3 schema values into databaseName/tableName/columnName', () => {
    const databaseRef = {
      databases: [
        {
          name: 'db1',
          tables: [
            {
              name: 't1',
              columns: [{ name: 'c1' }],
            },
          ],
        },
      ],
    };

    const migrated = formStateFromEntry(
      {
        databaseEnabled: true,
        inf1: 'db1',
        inf2: 't1',
        inf3: 'c1',
        attributesEnabled: false,
        attribute1: false,
        attribute2: false,
        attribute3: false,
        dataUiPath: '',
        dataUiFeature: '',
        dataUiUuid: 'uuid-1',
        dataUiInstanceId: '',
        dataUiIdentityKey: 'uuid-1',
      },
      databaseRef
    );

    expect(migrated.databaseName).toBe('db1');
    expect(migrated.tableName).toBe('t1');
    expect(migrated.columnName).toBe('c1');
    expect(migrated.inf1).toBe('');
    expect(migrated.inf2).toBe('');
    expect(migrated.inf3).toBe('');
  });

  it('keeps inf fields when they do not match schema names', () => {
    const migrated = formStateFromEntry(
      {
        databaseEnabled: true,
        inf1: 'custom-note',
        inf2: 'extra',
        inf3: 'value',
        attributesEnabled: false,
        attribute1: false,
        attribute2: false,
        attribute3: false,
        dataUiPath: '',
        dataUiFeature: '',
        dataUiUuid: 'uuid-1',
        dataUiInstanceId: '',
        dataUiIdentityKey: 'uuid-1',
      },
      { databases: [] }
    );

    expect(migrated.databaseName).toBe('');
    expect(migrated.inf1).toBe('custom-note');
    expect(migrated.inf2).toBe('extra');
    expect(migrated.inf3).toBe('value');
  });
});

describe('inspector-config storage fields', () => {
  it('buildInspectorDataEntry keeps database binding separate from free inf fields', () => {
    const element = mockElement();
    const form = {
      ...emptyFormState(),
      databaseEnabled: true,
      databaseName: 'db1',
      tableName: 't1',
      columnName: 'c1',
      inf1: 'note-a',
      inf2: 'note-b',
      inf3: 'note-c',
      storageEnabled: true,
      storageMainFile: 'Projects',
      storageSubFile: 'Frontend',
    };

    const entry = buildInspectorDataEntry(element, form);
    expect(entry.databaseName).toBe('db1');
    expect(entry.inf1).toBe('note-a');
    expect(entry.storageMainFile).toBe('Projects');
    expect(entry.storageSubFile).toBe('Frontend');
  });
});
