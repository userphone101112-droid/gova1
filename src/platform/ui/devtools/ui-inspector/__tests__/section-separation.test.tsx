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

  it('useSaveInspectorConfig does not import database-ref.service', () => {
    const source = readModule('hooks/useSaveInspectorConfig.ts');
    expect(source).not.toMatch(/database-ref\.service/);
    expect(source).toMatch(/inspector-config\.service/);
  });

  it('DatabaseManagementSection does not import inspector-config.service', () => {
    const source = readModule('sidebar/DatabaseManagementSection.tsx');
    expect(source).not.toMatch(/inspector-config\.service/);
  });

  it('DatabaseAttributesSection uses inspector save hook only', () => {
    const source = readModule('sidebar/DatabaseAttributesSection.tsx');
    expect(source).toMatch(/useSaveInspectorConfig/);
    expect(source).not.toMatch(/database-ref\.service/);
  });

  it('InspectorSidebar hides Database & Attributes without a selected element', () => {
    render(
      <InspectorProvider>
        <InspectorSidebar />
      </InspectorProvider>
    );
    expect(screen.queryByRole('button', { name: /Database & Attributes/i })).toBeNull();
    expect(screen.getByRole('button', { name: /Database Management/i })).toBeTruthy();
  });

  it('persists element inf1/inf2/inf3 and attributes in ui-inspector-data shape only', () => {
    const element = mockElement();
    const form = {
      ...emptyFormState(),
      databaseEnabled: true,
      inf1: 'human_resource_management_system',
      inf2: 'employees',
      inf3: 'employee_id',
      attributesEnabled: true,
      attribute1: true,
      attribute2: false,
      attribute3: true,
    };
    const entry = buildInspectorDataEntry(element, form);
    expect(entry.inf1).toBe('human_resource_management_system');
    expect(entry.inf2).toBe('employees');
    expect(entry.inf3).toBe('employee_id');
    expect(entry.attribute1).toBe(true);
    expect(entry).not.toHaveProperty('description');
    expect(formStateFromEntry(entry)).toEqual(form);
  });

  it('uses stable storage keys so returning to the same element restores saved values', () => {
    const element = mockElement();
    const key = getStorageKey(element);
    const saved = buildInspectorDataEntry(element, {
      ...emptyFormState(),
      databaseEnabled: true,
      inf1: 'ecommerce_system',
      inf2: 'products',
      inf3: 'product_id',
      attributesEnabled: true,
      attribute1: false,
      attribute2: true,
      attribute3: false,
    });
    const map = { [key]: saved };
    expect(formStateFromEntry(map[key])).toEqual({
      databaseEnabled: true,
      inf1: 'ecommerce_system',
      inf2: 'products',
      inf3: 'product_id',
      attributesEnabled: true,
      attribute1: false,
      attribute2: true,
      attribute3: false,
    });
  });
});
