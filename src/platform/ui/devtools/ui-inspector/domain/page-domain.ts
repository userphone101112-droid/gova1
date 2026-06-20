import { resolveFeatureFromPathname } from '@/platform/ui/i18n/core/i18n-route-manifest';

import type { InspectElementSnapshot } from '../../UiInspectorFrameBridge';
import type { InspectorDataMap } from '../data/inspector-config.types';

import { getDatabaseConnectionDetails } from './database-domain';
import type { DatabaseConnectionDetails, PageBindingSummary, PageBoundElement, StorageConnectionDetails } from './domain-types';
import { getElementProfile, hasAnySavedBinding, hasDatabaseBinding, hasStorageBinding } from './element-domain';
import { getStorageConnectionDetails } from './storage-domain';

export function resolvePageFeatureFromRoute(routePath: string): string {
  return resolveFeatureFromPathname(routePath);
}

export function entryBelongsToPageFeature(entryFeature: string, pageFeature: string): boolean {
  return entryFeature === pageFeature;
}

export function filterInspectorDataByPageFeature(
  inspectorData: InspectorDataMap,
  routePath: string
): InspectorDataMap {
  const pageFeature = resolvePageFeatureFromRoute(routePath);
  const filtered: InspectorDataMap = {};
  for (const [key, entry] of Object.entries(inspectorData)) {
    if (entryBelongsToPageFeature(entry.dataUiFeature, pageFeature)) {
      filtered[key] = entry;
    }
  }
  return filtered;
}

export function listSavedElementsOnPage(inspectorData: InspectorDataMap, routePath: string) {
  return Object.values(filterInspectorDataByPageFeature(inspectorData, routePath));
}

function toPageBoundElement(
  identityKey: string,
  profile: NonNullable<ReturnType<typeof getElementProfile>>,
  databaseConnections: DatabaseConnectionDetails[],
  storageConnections: StorageConnectionDetails[]
): PageBoundElement {
  return {
    identityKey,
    path: profile.element.path,
    feature: profile.element.feature,
    uuid: profile.element.uuid,
    hasDatabaseBinding: profile.hasDatabaseBinding,
    hasStorageBinding: profile.hasStorageBinding,
    databaseConnections,
    storageConnections,
    profile,
  };
}

export function listPageBoundElements(
  inspectorData: InspectorDataMap,
  routePath: string,
  options?: {
    requireDatabase?: boolean;
    requireStorage?: boolean;
    requireAnyBinding?: boolean;
  }
): PageBoundElement[] {
  const pageData = filterInspectorDataByPageFeature(inspectorData, routePath);
  const results: PageBoundElement[] = [];

  for (const [identityKey, entry] of Object.entries(pageData)) {
    const profile = getElementProfile(inspectorData, identityKey);
    if (!profile) continue;

    const requireDb = options?.requireDatabase ?? false;
    const requireStorage = options?.requireStorage ?? false;
    const requireAny = options?.requireAnyBinding ?? false;

    if (requireDb && !profile.hasDatabaseBinding) continue;
    if (requireStorage && !profile.hasStorageBinding) continue;
    if (requireAny && !hasAnySavedBinding(profile)) continue;

    results.push(
      toPageBoundElement(
        identityKey,
        profile,
        getDatabaseConnectionDetails(entry),
        getStorageConnectionDetails(entry)
      )
    );
  }

  return results.sort((a, b) => a.path.localeCompare(b.path));
}

export function listDatabaseLinkedElementsOnPage(inspectorData: InspectorDataMap, routePath: string): PageBoundElement[] {
  return listPageBoundElements(inspectorData, routePath, { requireDatabase: true });
}

export function listStorageLinkedElementsOnPage(inspectorData: InspectorDataMap, routePath: string): PageBoundElement[] {
  return listPageBoundElements(inspectorData, routePath, { requireStorage: true });
}

export function listBoundElementsOnPage(inspectorData: InspectorDataMap, routePath: string): PageBoundElement[] {
  return listPageBoundElements(inspectorData, routePath, { requireAnyBinding: true });
}

export function getPageBindingSummary(inspectorData: InspectorDataMap, routePath: string): PageBindingSummary {
  const pageFeature = resolvePageFeatureFromRoute(routePath);
  const pageData = filterInspectorDataByPageFeature(inspectorData, routePath);
  const entries = Object.values(pageData);
  const bound = listBoundElementsOnPage(inspectorData, routePath);

  return {
    routePath,
    feature: pageFeature,
    totalSavedElements: entries.length,
    databaseLinkedCount: entries.filter((entry) => hasDatabaseBinding(entry)).length,
    storageLinkedCount: entries.filter((entry) => hasStorageBinding(entry)).length,
    anyBindingCount: bound.length,
    elements: bound,
  };
}

export function matchLiveSnapshotsToPage(
  snapshots: InspectElementSnapshot[],
  routePath: string
): InspectElementSnapshot[] {
  const pageFeature = resolvePageFeatureFromRoute(routePath);
  return snapshots.filter((snapshot) => snapshot.feature === pageFeature);
}

export function listLiveBoundElementsOnPage(
  inspectorData: InspectorDataMap,
  snapshots: InspectElementSnapshot[],
  routePath: string
): PageBoundElement[] {
  const pageSnapshots = matchLiveSnapshotsToPage(snapshots, routePath);
  const savedByKey = listBoundElementsOnPage(inspectorData, routePath);
  const savedKeys = new Set(savedByKey.map((el) => el.identityKey));

  const liveOnly: PageBoundElement[] = [];
  for (const snapshot of pageSnapshots) {
    const identityKey = snapshot.identityKey ?? snapshot.uuid;
    if (savedKeys.has(identityKey)) continue;
    const profile = getElementProfile(inspectorData, identityKey);
    if (profile && hasAnySavedBinding(profile)) {
      const entry = inspectorData[identityKey];
      if (!entry) continue;
      liveOnly.push(
        toPageBoundElement(
          identityKey,
          profile,
          getDatabaseConnectionDetails(entry),
          getStorageConnectionDetails(entry)
        )
      );
    }
  }

  return [...savedByKey, ...liveOnly].sort((a, b) => a.path.localeCompare(b.path));
}
