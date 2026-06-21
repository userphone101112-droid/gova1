import { describe, expect, it } from '@jest/globals';

import {
  isUiInspectorFrameMessage,
  isUiInspectorParentMessage,
  type FrameCandidate,
} from '../../UiInspectorFrameBridge';
import type { InspectElementSnapshot } from '../../UiInspectorFrameBridge';
import {
  createDatabaseBinding,
  createElementLinkBinding,
  createStorageBinding,
} from '../data/element-binding-utils';
import { buildFrameCandidates } from '../data/frame-candidates';
import { buildInspectorDataEntry, emptyFormState } from '../data/inspector-config-storage';
import { buildRelationshipsGraph, buildReverseIndex } from '../data/inspector-file-layout-utils';

function mockElement(overrides: Partial<InspectElementSnapshot> = {}): InspectElementSnapshot {
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

describe('frame-candidates', () => {
  it('marks saved database binding as database candidate', () => {
    const element = mockElement();
    const entry = buildInspectorDataEntry(element, {
      ...emptyFormState(),
      bindings: [
        createDatabaseBinding({
          databaseName: 'db1',
          tableName: 'users',
          columnName: 'email',
          enabled: true,
          confidence: 'confirmed',
        }),
      ],
    });
    const candidates = buildFrameCandidates([element], { [entry.dataUiIdentityKey]: entry });
    expect(candidates[0]?.kind).toBe('database');
    expect(candidates[0]?.confidence).toBe('confirmed');
  });

  it('marks saved storage binding as storage candidate', () => {
    const element = mockElement({ tagName: 'img', path: 'auth.avatar.image' });
    const entry = buildInspectorDataEntry(element, {
      ...emptyFormState(),
      bindings: [
        createStorageBinding({
          storageMainFile: 'Projects',
          storageSubFile: 'Images',
          enabled: true,
          confidence: 'confirmed',
        }),
      ],
    });
    const candidates = buildFrameCandidates([element], { [entry.dataUiIdentityKey]: entry });
    expect(candidates[0]?.kind).toBe('storage');
  });

  it('returns no candidates for heuristic database-like input without saved data', () => {
    const element = mockElement({ tagName: 'input', path: 'settings.profile.email' });
    const candidates = buildFrameCandidates([element], {});
    expect(candidates).toHaveLength(0);
  });

  it('returns no candidates for heuristic storage-like image without saved data', () => {
    const element = mockElement({ tagName: 'img', path: 'settings.profile.avatar.image' });
    const candidates = buildFrameCandidates([element], {});
    expect(candidates).toHaveLength(0);
  });

  it('excludes decorative tiny elements', () => {
    const element = mockElement({
      path: 'shared-layout.decorative.spacer',
      id: 'DECORATIVE_SPACER',
      rect: { top: 0, left: 0, width: 2, height: 2 },
    });
    const candidates = buildFrameCandidates([element], {});
    expect(candidates).toHaveLength(0);
  });

  it('marks mixed when database and storage bindings exist', () => {
    const element = mockElement();
    const entry = buildInspectorDataEntry(element, {
      ...emptyFormState(),
      bindings: [
        createDatabaseBinding({ databaseName: 'db1', tableName: 't1', columnName: 'c1' }),
        createStorageBinding({ storageMainFile: 'Projects', storageSubFile: 'Docs' }),
      ],
    });
    const candidates = buildFrameCandidates([element], { [entry.dataUiIdentityKey]: entry });
    expect(candidates[0]?.kind).toBe('mixed');
  });

  it('does not frame disabled database or storage bindings', () => {
    const element = mockElement();
    const entry = buildInspectorDataEntry(element, {
      ...emptyFormState(),
      bindings: [
        createDatabaseBinding({
          databaseName: 'db1',
          tableName: 't1',
          columnName: 'c1',
          enabled: false,
        }),
        createStorageBinding({
          storageMainFile: 'Projects',
          storageSubFile: 'Docs',
          enabled: false,
        }),
      ],
    });
    const candidates = buildFrameCandidates([element], { [entry.dataUiIdentityKey]: entry });
    expect(candidates).toHaveLength(0);
  });

  it('marks element link binding as linked', () => {
    const source = mockElement({ scanKey: 'scan-src', identityKey: 'key-src', uuid: 'uuid-src' });
    const entry = buildInspectorDataEntry(source, {
      ...emptyFormState(),
      bindings: [
        createElementLinkBinding({
          linkedElementKey: 'key-target',
          enabled: true,
        }),
      ],
    });
    const candidates = buildFrameCandidates([source], { [entry.dataUiIdentityKey]: entry });
    expect(candidates[0]?.kind).toBe('linked');
  });

  it('frames target element when another saved entry links to it', () => {
    const source = mockElement({ scanKey: 'scan-src', identityKey: 'key-src', uuid: 'uuid-src' });
    const target = mockElement({ scanKey: 'scan-target', identityKey: 'key-target', uuid: 'uuid-target' });
    const sourceEntry = buildInspectorDataEntry(source, {
      ...emptyFormState(),
      bindings: [createElementLinkBinding({ linkedElementKey: 'key-target', enabled: true })],
    });
    const candidates = buildFrameCandidates([source, target], { [sourceEntry.dataUiIdentityKey]: sourceEntry });
    const targetCandidate = candidates.find((c) => c.scanKey === 'scan-target');
    expect(targetCandidate?.kind).toBe('linked');
  });

  it('includes only saved element A, not heuristic element B', () => {
    const elementA = mockElement({ scanKey: 'scan-a', identityKey: 'key-a', uuid: 'uuid-a' });
    const elementB = mockElement({
      scanKey: 'scan-b',
      identityKey: 'key-b',
      uuid: 'uuid-b',
      tagName: 'input',
      path: 'settings.profile.email',
    });
    const entryA = buildInspectorDataEntry(elementA, {
      ...emptyFormState(),
      bindings: [
        createDatabaseBinding({
          databaseName: 'db1',
          tableName: 'users',
          columnName: 'email',
          enabled: true,
        }),
      ],
    });
    const candidates = buildFrameCandidates([elementA, elementB], { [entryA.dataUiIdentityKey]: entryA });
    expect(candidates).toHaveLength(1);
    expect(candidates[0]?.scanKey).toBe('scan-a');
    expect(candidates[0]?.kind).toBe('database');
  });

  it('shows linked frame for directly related element when one is selected', () => {
    const elementA = mockElement({ scanKey: 'scan-a', identityKey: 'key-a', uuid: 'uuid-a' });
    const elementB = mockElement({ scanKey: 'scan-b', identityKey: 'key-b', uuid: 'uuid-b' });
    const entryA = buildInspectorDataEntry(elementA, {
      ...emptyFormState(),
      bindings: [createElementLinkBinding({ linkedElementKey: 'key-b', enabled: true })],
    });
    const inspectorData = { [entryA.dataUiIdentityKey]: entryA };
    const reverseIndex = buildReverseIndex(buildRelationshipsGraph(inspectorData));

    const candidates = buildFrameCandidates([elementA, elementB], inspectorData, {
      selectedIdentityKey: 'key-a',
      reverseIndex,
    });

    const candidateB = candidates.find((c) => c.scanKey === 'scan-b');
    expect(candidateB?.kind).toBe('linked');
    expect(candidates.find((c) => c.scanKey === 'scan-a' && c.reasons.some((r) => r.includes('Related to selected')))).toBeUndefined();
  });

  it('does not expand linked frames to unrelated elements via reverse index', () => {
    const elementA = mockElement({ scanKey: 'scan-a', identityKey: 'key-a', uuid: 'uuid-a' });
    const elementB = mockElement({ scanKey: 'scan-b', identityKey: 'key-b', uuid: 'uuid-b' });
    const elementC = mockElement({ scanKey: 'scan-c', identityKey: 'key-c', uuid: 'uuid-c', path: 'other.field' });
    const entryA = buildInspectorDataEntry(elementA, {
      ...emptyFormState(),
      bindings: [createElementLinkBinding({ linkedElementKey: 'key-b', enabled: true })],
    });
    const inspectorData = { [entryA.dataUiIdentityKey]: entryA };
    const reverseIndex = buildReverseIndex(buildRelationshipsGraph(inspectorData));

    const candidates = buildFrameCandidates([elementA, elementB, elementC], inspectorData, {
      selectedIdentityKey: 'key-a',
      reverseIndex,
    });

    expect(candidates.find((c) => c.scanKey === 'scan-c')).toBeUndefined();
  });
});

describe('UiInspectorFrameBridge parent messages', () => {
  it('accepts SET_BINDING_FRAMES', () => {
    const message = {
      channel: 'gova-ui-inspector',
      type: 'SET_BINDING_FRAMES',
      enabled: true,
      candidates: [] as FrameCandidate[],
    };
    expect(isUiInspectorParentMessage(message)).toBe(true);
  });

  it('accepts CLEAR_BINDING_FRAMES', () => {
    expect(
      isUiInspectorParentMessage({
        channel: 'gova-ui-inspector',
        type: 'CLEAR_BINDING_FRAMES',
      })
    ).toBe(true);
  });

  it('accepts REQUEST_SCAN, HIGHLIGHT, SCROLL, CLEAR_HIGHLIGHT, SET_PICK_MODE', () => {
    expect(isUiInspectorParentMessage({ channel: 'gova-ui-inspector', type: 'REQUEST_SCAN' })).toBe(true);
    expect(
      isUiInspectorParentMessage({ channel: 'gova-ui-inspector', type: 'HIGHLIGHT', scanKey: 'scan-1' })
    ).toBe(true);
    expect(
      isUiInspectorParentMessage({ channel: 'gova-ui-inspector', type: 'SCROLL', scanKey: 'scan-1' })
    ).toBe(true);
    expect(isUiInspectorParentMessage({ channel: 'gova-ui-inspector', type: 'CLEAR_HIGHLIGHT' })).toBe(true);
    expect(
      isUiInspectorParentMessage({ channel: 'gova-ui-inspector', type: 'SET_PICK_MODE', enabled: true })
    ).toBe(true);
  });

  it('rejects unknown parent message types', () => {
    expect(
      isUiInspectorParentMessage({ channel: 'gova-ui-inspector', type: 'UNKNOWN_TYPE' })
    ).toBe(false);
    expect(
      isUiInspectorParentMessage({ channel: 'gova-ui-inspector', type: 'HIGHLIGHT' })
    ).toBe(false);
    expect(
      isUiInspectorParentMessage({ channel: 'gova-ui-inspector', type: 'SET_BINDING_FRAMES', enabled: true })
    ).toBe(false);
  });
});

describe('UiInspectorFrameBridge frame messages', () => {
  it('accepts READY, SCAN_RESULT, ELEMENT_PICKED', () => {
    expect(isUiInspectorFrameMessage({ channel: 'gova-ui-inspector', type: 'READY' })).toBe(true);
    expect(
      isUiInspectorFrameMessage({ channel: 'gova-ui-inspector', type: 'SCAN_RESULT', elements: [] })
    ).toBe(true);
    expect(
      isUiInspectorFrameMessage({ channel: 'gova-ui-inspector', type: 'ELEMENT_PICKED', scanKey: 'scan-1' })
    ).toBe(true);
  });

  it('rejects unknown frame message types', () => {
    expect(isUiInspectorFrameMessage({ channel: 'gova-ui-inspector', type: 'UNKNOWN' })).toBe(false);
    expect(isUiInspectorFrameMessage({ channel: 'gova-ui-inspector', type: 'SCAN_RESULT' })).toBe(false);
    expect(isUiInspectorFrameMessage({ channel: 'other-channel', type: 'READY' })).toBe(false);
  });
});
