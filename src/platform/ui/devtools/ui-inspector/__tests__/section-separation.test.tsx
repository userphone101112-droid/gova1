import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import type { InspectElementSnapshot } from '../../UiInspectorFrameBridge';
import { InspectorSidebar } from '../components/InspectorSidebar';
import {
  buildInspectorDataEntry,
  emptyFormState,
  formStateFromEntry,
  getStorageKey,
} from '../data/inspector-config-storage';
import { InspectorProvider } from '../state/InspectorProvider';

const ROOT = join(__dirname, '..');

function readModule(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), 'utf8');
}

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

describe('ui-inspector section separation', () => {
  it('useDatabaseManagement does not import inspector-config.service', () => {
    const source = readModule('hooks/useDatabaseManagement.ts');
    expect(source).not.toMatch(/inspector-config\.service/);
    expect(source).toMatch(/database-ref\.service/);
  });

  it('useStorageManagement does not import inspector-config.service', () => {
    const source = readModule('hooks/useStorageManagement.ts');
    expect(source).not.toMatch(/inspector-config\.service/);
    expect(source).toMatch(/storage-ref\.service/);
  });

  it('useSaveInspectorConfig does not import database-ref.service or storage-ref.service', () => {
    const source = readModule('hooks/useSaveInspectorConfig.ts');
    expect(source).not.toMatch(/database-ref\.service/);
    expect(source).not.toMatch(/storage-ref\.service/);
    expect(source).toMatch(/inspector-config\.service/);
  });

  it('StorageSection does not write to storage.json', () => {
    const source = readModule('sidebar/StorageSection.tsx');
    expect(source).not.toMatch(/storage-ref\.service/);
    expect(source).toMatch(/useStorageSettings/);
  });

  it('InspectorSidebar hides Database & Attributes without a selected element', () => {
    render(
      <InspectorProvider>
        <InspectorSidebar />
      </InspectorProvider>
    );
    expect(screen.queryByRole('button', { name: /Database & Attributes/i })).toBeNull();
    expect(screen.getByRole('button', { name: /Database Management/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Storage Manager/i })).toBeTruthy();
  });

  it('persists databaseName/tableName/columnName and storage fields in ui-inspector-data shape', () => {
    const element = mockElement();
    const form = {
      ...emptyFormState(),
      databaseEnabled: true,
      databaseName: 'human_resource_management_system',
      tableName: 'employees',
      columnName: 'employee_id',
      inf1: 'extra-1',
      inf2: 'extra-2',
      inf3: 'extra-3',
      storageEnabled: true,
      storageMainFile: 'Projects',
      storageSubFile: 'Frontend',
      attributesEnabled: true,
      attribute1: true,
      attribute2: false,
      attribute3: true,
    };
    const entry = buildInspectorDataEntry(element, form);
    expect(entry.databaseName).toBe('human_resource_management_system');
    expect(entry.tableName).toBe('employees');
    expect(entry.columnName).toBe('employee_id');
    expect(entry.inf1).toBe('extra-1');
    expect(entry.storageMainFile).toBe('Projects');
    expect(entry.storageSubFile).toBe('Frontend');
    expect(entry.storageEnabled).toBe(true);
    expect(formStateFromEntry(entry, { databases: [] })).toEqual(form);
  });

  it('uses stable storage keys so returning to the same element restores saved values', () => {
    const element = mockElement();
    const key = getStorageKey(element);
    const saved = buildInspectorDataEntry(element, {
      ...emptyFormState(),
      databaseEnabled: true,
      databaseName: 'ecommerce_system',
      tableName: 'products',
      columnName: 'product_id',
      storageEnabled: true,
      storageMainFile: 'Database',
      storageSubFile: 'Tables',
      attributesEnabled: true,
      attribute1: false,
      attribute2: true,
      attribute3: false,
    });
    const map = { [key]: saved };
    expect(formStateFromEntry(map[key], { databases: [] })).toEqual({
      databaseEnabled: true,
      databaseName: 'ecommerce_system',
      tableName: 'products',
      columnName: 'product_id',
      inf1: '',
      inf2: '',
      inf3: '',
      storageEnabled: true,
      storageMainFile: 'Database',
      storageSubFile: 'Tables',
      attributesEnabled: true,
      attribute1: false,
      attribute2: true,
      attribute3: false,
    });
  });
});
