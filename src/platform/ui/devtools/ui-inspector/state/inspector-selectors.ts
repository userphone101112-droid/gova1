import { useMemo } from 'react';

import { buildInspectUrl } from '../../inspector-routes';
import { findDatabase, findTable } from '../data/database-ref-utils';
import { getInspectorData } from '../data/inspector-config-storage';
import { findStorageFolder } from '../data/storage-ref-utils';

import type { InspectorState } from './inspector-actions';

export function selectSelectedElement(state: InspectorState) {
  const { elements, selectedScanKey, lastSelectedElement, search, featureFilter, tagFilter, lifecycleFilter, missingSourceOnly } =
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

  const liveSelected = selectedScanKey
    ? elements.find((el) => el.scanKey === selectedScanKey)
    : null;
  const selected = liveSelected ?? lastSelectedElement;
  const hasElementSelection = Boolean(selected);
  const hasUuidBackedElement = selected?.hasUuid ?? false;

  return { selected, hasElementSelection, hasUuidBackedElement, filteredElements: filtered };
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
  const selectedDatabase = findDatabase(state.databaseRef, form.databaseName);
  const tableOptions = selectedDatabase?.tables ?? [];
  const selectedTable = findTable(selectedDatabase, form.tableName);
  const columnOptions = selectedTable?.columns ?? [];
  return {
    selected,
    saved,
    form,
    selectedDatabase,
    tableOptions,
    selectedTable,
    columnOptions,
    isDatabaseSectionOpen: state.expanded.elementBindings,
    isDatabasePanelPinned: state.databasePanelPinned,
  };
}

export function selectCurrentElementStorageSettings(state: InspectorState) {
  const { selected } = selectSelectedElement(state);
  if (!selected) return null;
  const form = state.formState;
  const selectedFolder = findStorageFolder(state.storageRef, form.storageMainFile);
  const subfolderOptions = selectedFolder?.subfolders ?? [];
  return {
    selected,
    form,
    folders: state.storageRef.folders,
    selectedFolder,
    subfolderOptions,
  };
}

export function selectDatabaseRefTree(state: InspectorState) {
  return {
    saved: state.databaseRef,
    draft: state.databaseRefDraft,
    refSaveStatus: state.refSaveStatus,
  };
}

export function selectPreviewModel(state: InspectorState) {
  const iframeSrc = buildInspectUrl(state.routePath);
  const previewFrameWidth = state.previewSize.width * state.previewSize.scale;
  const previewFrameHeight = state.previewSize.height * state.previewSize.scale;
  const previewZoomPercent = Math.round(state.previewSize.scale * 100);
  return {
    iframeSrc,
    targetUrl: iframeSrc,
    previewFrameWidth,
    previewFrameHeight,
    previewZoomPercent,
  };
}

export function useInspectorSelectors(state: InspectorState) {
  return useMemo(() => {
    const selection = selectSelectedElement(state);
    const database = selectCurrentElementDatabaseSettings(state);
    const storage = selectCurrentElementStorageSettings(state);
    const databaseRef = selectDatabaseRefTree(state);
    const preview = selectPreviewModel(state);
    const featureOptions = selectFeatureOptions(state);
    return { ...selection, database, storage, databaseRef, preview, featureOptions };
  }, [state]);
}

export function selectIsDatabaseSectionOpen(state: InspectorState): boolean {
  return state.expanded.elementBindings;
}

export function selectCurrentElement(state: InspectorState) {
  return selectSelectedElement(state).selected;
}
