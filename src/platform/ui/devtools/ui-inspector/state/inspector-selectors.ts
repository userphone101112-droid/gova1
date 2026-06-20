import { useMemo } from 'react';

import { buildAbsoluteInspectUrl, buildInspectUrl } from '../../inspector-routes';
import { findDatabase, findTable } from '../data/database-ref-utils';
import { getInspectorData } from '../data/inspector-config-storage';

import type { InspectorState } from './inspector-actions';

export function selectSelectedElement(state: InspectorState) {
  const { elements, selectedScanKey, search, featureFilter, tagFilter, lifecycleFilter, missingSourceOnly } =
    state;
  const query = search.trim().toLowerCase();
  const filtered = elements.filter((el) => {
    if (featureFilter !== 'all' && el.feature !== featureFilter) return false;
    if (tagFilter !== 'all' && el.tagName !== tagFilter) return false;
    if (lifecycleFilter !== 'all' && el.lifecycle !== lifecycleFilter) return false;
    if (missingSourceOnly && el.hasSource) return false;
    if (!query) return true;
    return (
      el.uuid.toLowerCase().includes(query) ||
      el.id.toLowerCase().includes(query) ||
      el.path.toLowerCase().includes(query) ||
      el.feature.toLowerCase().includes(query)
    );
  });

  const selected =
    filtered.find((el) => el.scanKey === selectedScanKey) ??
    elements.find((el) => el.scanKey === selectedScanKey) ??
    null;

  return { selected, filteredElements: filtered };
}

export function selectFeatureOptions(state: InspectorState): string[] {
  const features = new Set(state.elements.map((el) => el.feature).filter(Boolean));
  return ['all', ...Array.from(features).sort()];
}

export function selectCurrentElementDatabaseSettings(state: InspectorState) {
  const { selected } = selectSelectedElement(state);
  if (!selected) return null;
  const saved = getInspectorData(state.allInspectorData, selected);
  const form = state.formState;
  const selectedDatabase = findDatabase(state.databaseRef, form.inf1);
  const tableOptions = selectedDatabase?.tables ?? [];
  const selectedTable = findTable(selectedDatabase, form.inf2);
  const columnOptions = selectedTable?.columns ?? [];
  return {
    selected,
    saved,
    form,
    selectedDatabase,
    tableOptions,
    selectedTable,
    columnOptions,
    isDatabaseSectionOpen: state.expanded.database,
    isDatabasePanelPinned: state.databasePanelPinned,
  };
}

export function selectDatabaseRefTree(state: InspectorState) {
  return {
    saved: state.databaseRef,
    draft: state.databaseRefDraft,
    refSaveStatus: state.refSaveStatus,
  };
}

export function selectPreviewModel(state: InspectorState, origin?: string) {
  const iframeSrc = buildInspectUrl(state.routePath);
  const targetUrl =
    typeof window === 'undefined' || !origin
      ? iframeSrc
      : buildAbsoluteInspectUrl(state.routePath, origin);
  const previewFrameWidth = state.previewSize.width * state.previewSize.scale;
  const previewFrameHeight = state.previewSize.height * state.previewSize.scale;
  const previewZoomPercent = Math.round(state.previewSize.scale * 100);
  return {
    iframeSrc,
    targetUrl,
    previewFrameWidth,
    previewFrameHeight,
    previewZoomPercent,
  };
}

export function useInspectorSelectors(state: InspectorState) {
  return useMemo(() => {
    const selection = selectSelectedElement(state);
    const database = selectCurrentElementDatabaseSettings(state);
    const databaseRef = selectDatabaseRefTree(state);
    const preview = selectPreviewModel(state, typeof window !== 'undefined' ? window.location.origin : undefined);
    const featureOptions = selectFeatureOptions(state);
    return { ...selection, database, databaseRef, preview, featureOptions };
  }, [state]);
}

export function selectIsDatabaseSectionOpen(state: InspectorState): boolean {
  return state.expanded.database;
}

export function selectCurrentElement(state: InspectorState) {
  return selectSelectedElement(state).selected;
}
