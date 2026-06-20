import type { InspectorRoutePath } from '../../inspector-routes';
import { emptyDatabaseRefFile } from '../data/database-ref-utils';
import type { DatabaseRefFile } from '../data/database-ref.types';
import { emptyFormState } from '../data/inspector-config-storage';
import type { ViewportSettings } from '../data/inspector-config.types';
import {
  DEFAULT_PREVIEW_HEIGHT,
  DEFAULT_PREVIEW_SCALE,
  DEFAULT_PREVIEW_WIDTH,
  DEFAULT_SIDEBAR_WIDTH,
} from '../utils/constants';
import {
  clampPreviewDimension,
  clampPreviewScale,
  persistPreviewSize,
} from '../utils/layout-storage';

import type { InspectorAction, InspectorState } from './inspector-actions';

export function createInitialInspectorState(): InspectorState {
  return {
    routePath: '/home',
    iframeKey: 0,
    elements: [],
    selectedScanKey: null,
    search: '',
    featureFilter: 'all',
    tagFilter: 'all',
    lifecycleFilter: 'all',
    missingSourceOnly: false,
    sidebarWidth: DEFAULT_SIDEBAR_WIDTH,
    previewSize: {
      width: DEFAULT_PREVIEW_WIDTH,
      height: DEFAULT_PREVIEW_HEIGHT,
      scale: DEFAULT_PREVIEW_SCALE,
    },
    pickModeEnabled: true,
    allInspectorData: {},
    formState: emptyFormState(),
    saveStatus: 'idle',
    refSaveStatus: 'idle',
    databaseRef: emptyDatabaseRefFile(),
    databaseRefDraft: emptyDatabaseRefFile(),
    databasePanelPinned: false,
    iframeReady: false,
    lastScanTime: null,
    expanded: {
      route: false,
      display: false,
      database: false,
      attributes: false,
      filters: false,
      list: false,
      details: false,
    },
  };
}

function nextPreviewSize(current: ViewportSettings, patch: Partial<ViewportSettings>): ViewportSettings {
  const next = {
    width: patch.width === undefined ? current.width : clampPreviewDimension(patch.width),
    height: patch.height === undefined ? current.height : clampPreviewDimension(patch.height),
    scale: patch.scale === undefined ? current.scale : clampPreviewScale(patch.scale),
  };
  persistPreviewSize(next);
  return next;
}

export function inspectorReducer(state: InspectorState, action: InspectorAction): InspectorState {
  switch (action.type) {
    case 'SET_ROUTE':
      return {
        ...state,
        routePath: action.routePath,
        selectedScanKey: null,
        elements: [],
        iframeReady: false,
        lastScanTime: null,
      };
    case 'REFRESH_IFRAME':
      return {
        ...state,
        elements: [],
        selectedScanKey: null,
        iframeKey: state.iframeKey + 1,
        iframeReady: false,
        lastScanTime: null,
      };
    case 'SET_ELEMENTS':
      return {
        ...state,
        elements: action.elements,
        lastScanTime: action.lastScanTime,
        selectedScanKey:
          state.selectedScanKey &&
          action.elements.some((el) => el.scanKey === state.selectedScanKey)
            ? state.selectedScanKey
            : null,
      };
    case 'SET_SELECTED_SCAN_KEY':
      return { ...state, selectedScanKey: action.scanKey };
    case 'SET_SEARCH':
      return { ...state, search: action.search };
    case 'SET_FEATURE_FILTER':
      return { ...state, featureFilter: action.featureFilter };
    case 'SET_TAG_FILTER':
      return { ...state, tagFilter: action.tagFilter };
    case 'SET_LIFECYCLE_FILTER':
      return { ...state, lifecycleFilter: action.lifecycleFilter };
    case 'TOGGLE_MISSING_SOURCE':
      return { ...state, missingSourceOnly: !state.missingSourceOnly };
    case 'SET_SIDEBAR_WIDTH':
      return { ...state, sidebarWidth: action.width };
    case 'SET_PREVIEW_SIZE':
      return { ...state, previewSize: action.previewSize };
    case 'PATCH_PREVIEW_SIZE':
      return { ...state, previewSize: nextPreviewSize(state.previewSize, action.patch) };
    case 'SET_PICK_MODE':
      return { ...state, pickModeEnabled: action.enabled };
    case 'SET_ALL_INSPECTOR_DATA':
      return { ...state, allInspectorData: action.data };
    case 'MERGE_INSPECTOR_ENTRY':
      return {
        ...state,
        allInspectorData: { ...state.allInspectorData, [action.storageKey]: action.entry },
      };
    case 'SET_FORM_STATE':
      return { ...state, formState: action.formState };
    case 'PATCH_FORM_STATE':
      return { ...state, formState: { ...state.formState, ...action.patch } };
    case 'SET_SAVE_STATUS':
      return { ...state, saveStatus: action.status };
    case 'SET_REF_SAVE_STATUS':
      return { ...state, refSaveStatus: action.status };
    case 'SET_DATABASE_REF':
      return { ...state, databaseRef: action.data };
    case 'SET_DATABASE_REF_DRAFT':
      return { ...state, databaseRefDraft: action.data };
    case 'SET_DATABASE_PANEL_PINNED':
      return { ...state, databasePanelPinned: action.pinned };
    case 'SET_IFRAME_READY':
      return { ...state, iframeReady: action.ready };
    case 'MARK_IFRAME_LOADING':
      return { ...state, iframeReady: false, lastScanTime: null };
    case 'TOGGLE_SECTION': {
      if (action.section === 'database' && state.databasePanelPinned && state.expanded.database) {
        return state;
      }
      return {
        ...state,
        expanded: {
          ...state.expanded,
          [action.section]: !state.expanded[action.section],
        },
      };
    }
    case 'SET_EXPANDED':
      return { ...state, expanded: { ...state.expanded, ...action.expanded } };
    case 'LOAD_ELEMENT_FORM':
      return {
        ...state,
        formState: action.formState,
        databasePanelPinned: false,
        saveStatus: 'idle',
        expanded: { ...state.expanded, ...action.expandedPatch },
      };
    default:
      return state;
  }
}

export type { InspectorRoutePath, DatabaseRefFile };
