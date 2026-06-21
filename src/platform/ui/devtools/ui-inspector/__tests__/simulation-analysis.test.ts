import { describe, expect, it } from '@jest/globals';

import type { InspectElementSnapshot } from '../../UiInspectorFrameBridge';
import { runSimulationAnalysis } from '../analysis/simulation-analysis';
import { createDatabaseBinding, createStorageBinding } from '../data/element-binding-utils';
import { buildInspectorDataEntry, emptyFormState } from '../data/inspector-config-storage';

function mockElement(): InspectElementSnapshot {
  return {
    scanKey: 's1',
    uuid: 'uuid-1',
    hasUuid: true,
    instanceId: 'i1',
    id: 'UI_TEST',
    path: 'auth.login',
    feature: 'auth',
    tagName: 'input',
    lifecycle: 'active',
    identityKey: 'uuid-1:i1',
    hasSource: true,
    sourceFile: '/src/test.tsx',
    sourceLine: 1,
    sourceComponent: 'Test',
    rect: { top: 0, left: 0, width: 10, height: 10 },
  };
}

describe('simulation-analysis', () => {
  it('computes usage counts and CRUD matrix from bindings', () => {
    const element = mockElement();
    const form = {
      ...emptyFormState(),
      bindings: [
        createDatabaseBinding({
          databaseName: 'hr',
          tableName: 'employees',
          columnName: 'email',
          role: 'read_from',
          queryHint: 'search',
          indexNeed: 'likely',
        }),
        createDatabaseBinding({
          databaseName: 'hr',
          tableName: 'employees',
          columnName: 'email',
          role: 'write_to',
        }),
        createStorageBinding({
          storageMainFile: 'Projects',
          storageSubFile: 'Docs',
          role: 'upload_to',
        }),
      ],
    };
    const entry = buildInspectorDataEntry(element, form);
    const report = runSimulationAnalysis({
      inspectorData: { [entry.dataUiIdentityKey]: entry },
      databaseRef: { databases: [] },
      storageRef: { folders: [] },
    });

    expect(report.savedElements).toBe(1);
    expect(report.linkedElements).toBe(1);
    expect(report.totalBindings).toBe(3);
    expect(report.crudMatrix[0]?.read).toBe(1);
    expect(report.crudMatrix[0]?.write).toBe(1);
    expect(report.suggestedIndexes.length).toBeGreaterThan(0);
  });
});
