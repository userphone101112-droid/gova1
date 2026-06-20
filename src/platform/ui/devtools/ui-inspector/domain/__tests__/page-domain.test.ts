import { describe, expect, it } from '@jest/globals';

import type { InspectElementSnapshot } from '../../../UiInspectorFrameBridge';
import { createDatabaseBinding, createStorageBinding } from '../../data/element-binding-utils';
import { buildInspectorDataEntry, emptyFormState } from '../../data/inspector-config-storage';
import {
  getPageBindingSummary,
  listBoundElementsOnPage,
  resolvePageFeatureFromRoute,
} from '../page-domain';

function mockSnapshot(overrides: Partial<InspectElementSnapshot> = {}): InspectElementSnapshot {
  return {
    scanKey: 'scan-1',
    uuid: 'uuid-1',
    instanceId: '',
    id: 'UI_TEST',
    path: 'home.hero.title',
    feature: 'home',
    tagName: 'h1',
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

describe('page-domain', () => {
  it('resolvePageFeatureFromRoute maps /home to home feature', () => {
    expect(resolvePageFeatureFromRoute('/home')).toBe('home');
  });

  it('lists only elements matching page feature (excludes shared-layout)', () => {
    const home = mockSnapshot({ feature: 'home', path: 'home.hero.title' });
    const shared = mockSnapshot({
      feature: 'shared-layout',
      path: 'shared-layout.sidebar.close',
      uuid: 'uuid-2',
      identityKey: 'uuid-2',
      scanKey: 'scan-2',
    });
    const homeEntry = buildInspectorDataEntry(home, {
      ...emptyFormState(),
      bindings: [createDatabaseBinding({ databaseName: 'db1', tableName: 't1', columnName: 'c1' })],
    });
    const sharedEntry = buildInspectorDataEntry(shared, {
      ...emptyFormState(),
      bindings: [createDatabaseBinding({ databaseName: 'db1', tableName: 't1', columnName: 'c2' })],
    });
    const data = {
      [homeEntry.dataUiIdentityKey]: homeEntry,
      [sharedEntry.dataUiIdentityKey]: sharedEntry,
    };

    const bound = listBoundElementsOnPage(data, '/home');
    expect(bound).toHaveLength(1);
    expect(bound[0]?.feature).toBe('home');
  });

  it('getPageBindingSummary returns bound elements for page', () => {
    const home = mockSnapshot();
    const entry = buildInspectorDataEntry(home, {
      ...emptyFormState(),
      bindings: [
        createDatabaseBinding({ databaseName: 'db1', tableName: 'users', columnName: 'email' }),
        createStorageBinding({ storageMainFile: 'Projects' }),
      ],
    });
    const summary = getPageBindingSummary({ [entry.dataUiIdentityKey]: entry }, '/home');
    expect(summary.feature).toBe('home');
    expect(summary.anyBindingCount).toBe(1);
    expect(summary.databaseLinkedCount).toBe(1);
    expect(summary.storageLinkedCount).toBe(1);
  });
});
