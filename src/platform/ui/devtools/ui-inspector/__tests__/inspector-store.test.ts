import { describe, expect, it } from '@jest/globals';

import type { InspectElementSnapshot } from '../../UiInspectorFrameBridge';
import { createDatabaseBinding, createStorageBinding } from '../data/element-binding-utils';
import {
  buildInspectorDataEntry,
  emptyFormState,
  formStateFromEntry,
  getStorageKey,
} from '../data/inspector-config-storage';
import { selectSelectedElement } from '../state/inspector-selectors';
import { createInitialInspectorState, inspectorReducer } from '../state/inspector-store';

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

  it('SET_ELEMENTS does not collapse expanded sidebar sections', () => {
    let state = createInitialInspectorState();
    state = inspectorReducer(state, { type: 'SET_EXPANDED', expanded: { databaseCatalog: true, list: true } });
    state = inspectorReducer(state, {
      type: 'SET_ELEMENTS',
      elements: [mockElement()],
      lastScanTime: new Date(),
    });
    expect(state.expanded.databaseCatalog).toBe(true);
    expect(state.expanded.list).toBe(true);
  });

  it('SET_ELEMENTS does not reset formState', () => {
    let state = createInitialInspectorState();
    state = {
      ...state,
      formState: {
        ...emptyFormState(),
        inf1: 'unchanged',
        bindings: [createDatabaseBinding({ databaseName: 'db', tableName: 't', columnName: 'c' })],
      },
    };
    state = inspectorReducer(state, {
      type: 'SET_ELEMENTS',
      elements: [mockElement({ scanKey: 'other' })],
      lastScanTime: new Date(),
    });
    expect(state.formState.inf1).toBe('unchanged');
    expect(state.formState.bindings).toHaveLength(1);
  });
});

describe('inspector-store CLEAR_SELECTED_ELEMENT', () => {
  it('clears selection and formState without touching allInspectorData or framesModeEnabled', () => {
    const element = mockElement();
    let state = createInitialInspectorState();
    state = {
      ...state,
      framesModeEnabled: true,
      allInspectorData: {
        [getStorageKey(element)]: buildInspectorDataEntry(element, emptyFormState()),
      },
    };
    state = inspectorReducer(state, {
      type: 'SELECT_ELEMENT',
      scanKey: element.scanKey,
      element,
    });
    state = inspectorReducer(state, {
      type: 'SET_FORM_STATE',
      formState: { ...emptyFormState(), inf1: 'cleared-on-pick-off' },
    });
    state = inspectorReducer(state, { type: 'SET_DATABASE_PANEL_PINNED', pinned: true });
    state = inspectorReducer(state, { type: 'SET_SAVE_STATUS', status: 'saved' });

    const beforeData = state.allInspectorData;
    const next = inspectorReducer(state, { type: 'CLEAR_SELECTED_ELEMENT' });

    expect(next.selectedScanKey).toBeNull();
    expect(next.lastSelectedElement).toBeNull();
    expect(next.selectedIdentityKey).toBeNull();
    expect(next.formState).toEqual(emptyFormState());
    expect(next.databasePanelPinned).toBe(false);
    expect(next.saveStatus).toBe('idle');
    expect(next.allInspectorData).toBe(beforeData);
    expect(next.framesModeEnabled).toBe(true);
    expect(next.pickModeEnabled).toBe(state.pickModeEnabled);
  });

  it('only CLEAR_SELECTED_ELEMENT clears selection; SET_ROUTE and REFRESH_IFRAME preserve it', () => {
    const element = mockElement();
    let state = createInitialInspectorState();
    state = inspectorReducer(state, {
      type: 'SELECT_ELEMENT',
      scanKey: element.scanKey,
      element,
    });

    const afterRoute = inspectorReducer(state, { type: 'SET_ROUTE', routePath: '/settings' });
    expect(afterRoute.lastSelectedElement).toEqual(element);
    expect(afterRoute.selectedIdentityKey).toBe(getStorageKey(element));

    const afterRefresh = inspectorReducer(afterRoute, { type: 'REFRESH_IFRAME' });
    expect(afterRefresh.lastSelectedElement).toEqual(element);
    expect(afterRefresh.selectedIdentityKey).toBe(getStorageKey(element));

    const afterClear = inspectorReducer(afterRefresh, { type: 'CLEAR_SELECTED_ELEMENT' });
    expect(afterClear.lastSelectedElement).toBeNull();
    expect(afterClear.selectedIdentityKey).toBeNull();
  });
});

describe('inspector-store frames mode', () => {
  it('framesModeEnabled toggles independently from pickMode', () => {
    let state = createInitialInspectorState();
    state = inspectorReducer(state, { type: 'SET_FRAMES_MODE', enabled: true });
    state = inspectorReducer(state, { type: 'SET_PICK_MODE', enabled: false });
    expect(state.framesModeEnabled).toBe(true);
    expect(state.pickModeEnabled).toBe(false);
  });

  it('SET_ROUTE does not disable framesModeEnabled', () => {
    let state = createInitialInspectorState();
    state = inspectorReducer(state, { type: 'SET_FRAMES_MODE', enabled: true });
    state = inspectorReducer(state, { type: 'SET_ROUTE', routePath: '/settings' });
    expect(state.framesModeEnabled).toBe(true);
  });

  it('SET_ROUTE preserves lastSelectedElement and selectedIdentityKey', () => {
    const element = mockElement();
    let state = createInitialInspectorState();
    state = inspectorReducer(state, {
      type: 'SELECT_ELEMENT',
      scanKey: element.scanKey,
      element,
    });
    state = inspectorReducer(state, {
      type: 'SET_FORM_STATE',
      formState: { ...emptyFormState(), inf1: 'route-persist' },
    });
    state = inspectorReducer(state, { type: 'SET_ROUTE', routePath: '/settings' });
    expect(state.lastSelectedElement).toEqual(element);
    expect(state.selectedIdentityKey).toBe(getStorageKey(element));
    expect(state.selectedScanKey).toBeNull();
    expect(state.formState.inf1).toBe('route-persist');
  });

  it('REFRESH_IFRAME preserves lastSelectedElement and selectedIdentityKey', () => {
    const element = mockElement();
    let state = createInitialInspectorState();
    state = inspectorReducer(state, {
      type: 'SELECT_ELEMENT',
      scanKey: element.scanKey,
      element,
    });
    state = inspectorReducer(state, {
      type: 'SET_FORM_STATE',
      formState: { ...emptyFormState(), inf1: 'refresh-persist' },
    });
    state = inspectorReducer(state, { type: 'REFRESH_IFRAME' });
    expect(state.lastSelectedElement).toEqual(element);
    expect(state.selectedIdentityKey).toBe(getStorageKey(element));
    expect(state.formState.inf1).toBe('refresh-persist');
  });

  it('REFRESH_IFRAME does not disable framesModeEnabled', () => {
    let state = createInitialInspectorState();
    state = inspectorReducer(state, { type: 'SET_FRAMES_MODE', enabled: true });
    state = inspectorReducer(state, { type: 'REFRESH_IFRAME' });
    expect(state.framesModeEnabled).toBe(true);
  });

  it('SET_ELEMENTS does not disable framesModeEnabled', () => {
    let state = createInitialInspectorState();
    state = inspectorReducer(state, { type: 'SET_FRAMES_MODE', enabled: true });
    state = inspectorReducer(state, {
      type: 'SET_ELEMENTS',
      elements: [mockElement()],
      lastScanTime: new Date(),
    });
    expect(state.framesModeEnabled).toBe(true);
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
    const entry = buildInspectorDataEntry(element, {
      ...emptyFormState(),
      bindings: [
        createDatabaseBinding({
          databaseName: 'db1',
          tableName: 't1',
          columnName: 'c1',
        }),
        createStorageBinding({
          storageMainFile: 'Projects',
          storageSubFile: 'Frontend',
        }),
      ],
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
    });
    expect(entry.databaseName).toBe('db1');
    expect(entry.inf1).toBe('note-a');
    expect(entry.storageMainFile).toBe('Projects');
    expect(entry.storageSubFile).toBe('Frontend');
  });
});
