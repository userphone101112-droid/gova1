import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import { InspectorSidebar } from '../components/InspectorSidebar';
import { createDatabaseBinding, createStorageBinding } from '../data/element-binding-utils';
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

describe('ui-inspector section separation', () => {
  it('useDatabaseCatalog does not import inspector-config.service', () => {
    const source = readModule('hooks/useDatabaseCatalog.ts');
    expect(source).not.toMatch(/inspector-config\.service/);
    expect(source).toMatch(/database-ref\.service/);
  });

  it('useStorageCatalog does not import inspector-config.service', () => {
    const source = readModule('hooks/useStorageCatalog.ts');
    expect(source).not.toMatch(/inspector-config\.service/);
    expect(source).toMatch(/storage-ref\.service/);
  });

  it('useSaveInspectorConfig does not import database-ref.service or storage-ref.service', () => {
    const source = readModule('hooks/useSaveInspectorConfig.ts');
    expect(source).not.toMatch(/database-ref\.service/);
    expect(source).not.toMatch(/storage-ref\.service/);
    expect(source).toMatch(/inspector-config\.service/);
  });

  it('SimulationInsightsSection does not import save services', () => {
    const source = readModule('sections/SimulationInsightsSection.tsx');
    expect(source).not.toMatch(/inspector-config\.service/);
    expect(source).not.toMatch(/database-ref\.service/);
    expect(source).not.toMatch(/storage-ref\.service/);
  });

  it('ElementBindingSection does not write database_ref or storage catalogs', () => {
    const source = readModule('sections/ElementBindingSection.tsx');
    expect(source).not.toMatch(/database-ref\.service/);
    expect(source).not.toMatch(/storage-ref\.service/);
  });

  it('InspectorSidebar hides Element Bindings without a selected element', () => {
    render(
      <InspectorProvider>
        <InspectorSidebar />
      </InspectorProvider>
    );
    expect(screen.queryByRole('button', { name: /Element Bindings/i })).toBeNull();
    expect(screen.getByRole('button', { name: /Database Catalog/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Storage Catalog/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Simulation Insights/i })).toBeTruthy();
  });

  it('persists bindings and legacy fields in ui-inspector-data shape', () => {
    const element = {
      scanKey: 's1',
      uuid: 'uuid-1',
      hasUuid: true,
      instanceId: 'inst-1',
      id: 'UI_TEST',
      path: 'test.path',
      feature: 'devtools',
      tagName: 'button',
      lifecycle: 'active' as const,
      identityKey: 'uuid-1:inst-1',
      hasSource: true,
      sourceFile: '/src/test.tsx',
      sourceLine: 1,
      sourceComponent: 'Test',
      rect: { top: 0, left: 0, width: 100, height: 40 },
    };
    const form = {
      ...emptyFormState(),
      bindings: [
        createDatabaseBinding({
          databaseName: 'human_resource_management_system',
          tableName: 'employees',
          columnName: 'employee_id',
        }),
        createStorageBinding({
          storageMainFile: 'Projects',
          storageSubFile: 'Frontend',
        }),
      ],
      databaseEnabled: true,
      databaseName: 'human_resource_management_system',
      tableName: 'employees',
      columnName: 'employee_id',
      inf1: 'extra-1',
      storageEnabled: true,
      storageMainFile: 'Projects',
      storageSubFile: 'Frontend',
    };
    const entry = buildInspectorDataEntry(element, form);
    expect(entry.databaseName).toBe('human_resource_management_system');
    expect(entry.inf1).toBe('extra-1');
    expect(entry.bindings?.length).toBeGreaterThan(0);
    const loaded = formStateFromEntry(entry, { databases: [] });
    expect(loaded.databaseName).toBe('human_resource_management_system');
    expect(loaded.inf1).toBe('extra-1');
    expect(loaded.bindings.length).toBeGreaterThan(0);
  });

  it('uses stable storage keys so returning to the same element restores saved values', () => {
    const element = {
      scanKey: 's1',
      uuid: 'uuid-1',
      hasUuid: true,
      instanceId: 'inst-1',
      id: 'UI_TEST',
      path: 'test.path',
      feature: 'devtools',
      tagName: 'button',
      lifecycle: 'active' as const,
      identityKey: 'uuid-1:inst-1',
      hasSource: true,
      sourceFile: '/src/test.tsx',
      sourceLine: 1,
      sourceComponent: 'Test',
      rect: { top: 0, left: 0, width: 100, height: 40 },
    };
    const key = getStorageKey(element);
    const saved = buildInspectorDataEntry(element, {
      ...emptyFormState(),
      bindings: [
        createDatabaseBinding({
          databaseName: 'ecommerce_system',
          tableName: 'products',
          columnName: 'product_id',
        }),
        createStorageBinding({
          storageMainFile: 'Database',
          storageSubFile: 'Tables',
        }),
      ],
      databaseEnabled: true,
      databaseName: 'ecommerce_system',
      tableName: 'products',
      columnName: 'product_id',
      storageEnabled: true,
      storageMainFile: 'Database',
      storageSubFile: 'Tables',
    });
    const map = { [key]: saved };
    const loaded = formStateFromEntry(map[key], { databases: [] });
    expect(loaded.databaseName).toBe('ecommerce_system');
    expect(loaded.storageMainFile).toBe('Database');
    expect(loaded.bindings.some((b) => b.kind === 'database')).toBe(true);
  });

  it('persists empty bindings array when all bindings are removed', () => {
    const element = {
      scanKey: 's1',
      uuid: 'uuid-1',
      hasUuid: true,
      instanceId: 'inst-1',
      id: 'UI_TEST',
      path: 'test.path',
      feature: 'devtools',
      tagName: 'button',
      lifecycle: 'active' as const,
      identityKey: 'uuid-1:inst-1',
      hasSource: true,
      sourceFile: '/src/test.tsx',
      sourceLine: 1,
      sourceComponent: 'Test',
      rect: { top: 0, left: 0, width: 100, height: 40 },
    };
    const entry = buildInspectorDataEntry(element, {
      ...emptyFormState(),
      bindings: [],
      customAttributes: [],
      inf1: 'keep-note',
    });
    expect(entry.bindings).toEqual([]);
    expect(entry.customAttributes).toEqual([]);
    expect(entry.databaseEnabled).toBe(false);
    expect(entry.databaseName).toBe('');
    expect(entry.storageEnabled).toBe(false);
    expect(entry.inf1).toBe('keep-note');
  });

  it('DatabaseBindingEditor quick add uses database-ref.service', () => {
    const source = readModule('bindings/DatabaseBindingEditor.tsx');
    expect(source).toMatch(/database-ref\.service/);
    expect(source).not.toMatch(/inspector-config\.service/);
  });
});
