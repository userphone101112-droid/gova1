import { describe, expect, it } from '@jest/globals';

import type { InspectElementSnapshot } from '../../UiInspectorFrameBridge';
import { createDatabaseBinding, createElementLinkBinding, createStorageBinding } from '../data/element-binding-utils';
import { buildInspectorDataEntry, emptyFormState } from '../data/inspector-config-storage';
import {
  analyzeRelationshipGraph,
  buildInspectorIndex,
  buildRelationshipsGraph,
  buildRouteIndex,
  composeInspectorEntry,
  safeFileNameFromIdentityKey,
  safeRouteFileName,
  splitInspectorEntry,
} from '../data/inspector-file-layout-utils';

function mockElement(): InspectElementSnapshot {
  return {
    scanKey: 'scan-1',
    uuid: 'uuid-a',
    instanceId: '',
    id: 'UI_A',
    path: 'auth.login.email',
    feature: 'auth',
    tagName: 'input',
    lifecycle: 'active',
    identityKey: 'uuid-a',
    hasSource: true,
    sourceFile: '/src/a.tsx',
    sourceLine: 1,
    sourceComponent: 'A',
    rect: { top: 0, left: 0, width: 10, height: 10 },
  };
}

describe('inspector-file-layout-utils', () => {
  it('safeFileNameFromIdentityKey sanitizes keys', () => {
    expect(safeFileNameFromIdentityKey('uuid:inst/1')).toBe('uuid__inst__1');
  });

  it('safeRouteFileName sanitizes routes', () => {
    expect(safeRouteFileName('/home')).toBe('home');
  });

  it('split and compose preserve entry fields', () => {
    const entry = buildInspectorDataEntry(mockElement(), {
      ...emptyFormState(),
      bindings: [
        createDatabaseBinding({ databaseName: 'db1', tableName: 't1', columnName: 'c1' }),
      ],
      customAttributes: [{ id: 'attr-1', key: 'aria-label', value: 'Email', type: 'string' }],
      inf1: 'note',
    });
    const parts = splitInspectorEntry(entry, '/home');
    const composed = composeInspectorEntry(parts);
    expect(composed.bindings).toHaveLength(1);
    expect(composed.customAttributes).toHaveLength(1);
    expect(composed.inf1).toBe('note');
    expect(composed.dataUiIdentityKey).toBe(entry.dataUiIdentityKey);
  });

  it('buildInspectorIndex summarizes entries', () => {
    const entry = buildInspectorDataEntry(mockElement(), {
      ...emptyFormState(),
      bindings: [createDatabaseBinding({ databaseName: 'db1', tableName: 't1', columnName: 'c1' })],
    });
    const index = buildInspectorIndex({ [entry.dataUiIdentityKey]: entry });
    expect(index.entries[0]?.hasDatabase).toBe(true);
    expect(index.entries[0]?.bindingCount).toBe(1);
  });

  it('buildRouteIndex groups by route', () => {
    const entry = buildInspectorDataEntry(mockElement(), emptyFormState());
    const routes = buildRouteIndex({ [entry.dataUiIdentityKey]: entry }, {
      [entry.dataUiIdentityKey]: '/home',
    });
    expect(routes.home?.identityKeys).toContain(entry.dataUiIdentityKey);
  });

  it('buildRelationshipsGraph creates explicit and inferred edges', () => {
    const a = buildInspectorDataEntry(mockElement(), {
      ...emptyFormState(),
      bindings: [
        createElementLinkBinding({ linkedElementKey: 'uuid-b', enabled: true }),
      ],
    });
    const b = buildInspectorDataEntry(
      { ...mockElement(), uuid: 'uuid-b', identityKey: 'uuid-b', scanKey: 'scan-2' },
      {
        ...emptyFormState(),
        bindings: [
          createDatabaseBinding({ databaseName: 'db1', tableName: 'users', columnName: 'email' }),
        ],
      }
    );
    const c = buildInspectorDataEntry(
      { ...mockElement(), uuid: 'uuid-c', identityKey: 'uuid-c', scanKey: 'scan-3' },
      {
        ...emptyFormState(),
        bindings: [
          createDatabaseBinding({ databaseName: 'db1', tableName: 'users', columnName: 'email' }),
        ],
      }
    );
    const map = {
      [a.dataUiIdentityKey]: a,
      [b.dataUiIdentityKey]: b,
      [c.dataUiIdentityKey]: c,
    };
    const graph = buildRelationshipsGraph(map);
    expect(graph.edges.some((edge) => edge.createdFrom === 'explicit_binding')).toBe(true);
    expect(graph.edges.some((edge) => edge.createdFrom === 'inferred_shared_database')).toBe(true);
    const analysis = analyzeRelationshipGraph(graph, map);
    expect(analysis.nodeCount).toBe(3);
    expect(analysis.sharedDatabaseGroups.length).toBeGreaterThan(0);
  });
});

describe('relationship graph storage binding inference', () => {
  it('creates shared storage edges', () => {
    const entryA = buildInspectorDataEntry(mockElement(), {
      ...emptyFormState(),
      bindings: [createStorageBinding({ storageMainFile: 'Projects', storageSubFile: 'Docs' })],
    });
    const entryB = buildInspectorDataEntry(
      { ...mockElement(), uuid: 'uuid-b', identityKey: 'uuid-b' },
      {
        ...emptyFormState(),
        bindings: [createStorageBinding({ storageMainFile: 'Projects', storageSubFile: 'Docs' })],
      }
    );
    const map = { [entryA.dataUiIdentityKey]: entryA, [entryB.dataUiIdentityKey]: entryB };
    const graph = buildRelationshipsGraph(map);
    expect(
      graph.edges.some(
        (edge) => edge.relationKind === 'shares_storage_folder' && edge.createdFrom === 'inferred_shared_storage'
      )
    ).toBe(true);
  });
});
