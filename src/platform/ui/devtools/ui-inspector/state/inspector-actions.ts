import type { InspectorRoutePath } from '../../inspector-routes';
import type { InspectElementSnapshot } from '../../UiInspectorFrameBridge';
import type { DatabaseRefFile } from '../data/database-ref.types';
import type {
  ElementFormState,
  InspectorDataMap,
  SaveStatus,
  SidebarSection,
  ViewportSettings,
} from '../data/inspector-config.types';
import { DEFAULT_EXPANDED_SECTIONS } from '../utils/constants';

export type InspectorState = {
  routePath: InspectorRoutePath;
  iframeKey: number;
  elements: InspectElementSnapshot[];
  selectedScanKey: string | null;
  search: string;
  featureFilter: string;
  tagFilter: string;
  lifecycleFilter: string;
  missingSourceOnly: boolean;
  sidebarWidth: number;
  previewSize: ViewportSettings;
  pickModeEnabled: boolean;
  allInspectorData: InspectorDataMap;
  formState: ElementFormState;
  saveStatus: SaveStatus;
  refSaveStatus: SaveStatus;
  databaseRef: DatabaseRefFile;
  databaseRefDraft: DatabaseRefFile;
  databasePanelPinned: boolean;
  iframeReady: boolean;
  lastScanTime: Date | null;
  expanded: Record<SidebarSection, boolean>;
};

export type InspectorAction =
  | { type: 'SET_ROUTE'; routePath: InspectorRoutePath }
  | { type: 'REFRESH_IFRAME' }
  | { type: 'SET_ELEMENTS'; elements: InspectElementSnapshot[]; lastScanTime: Date }
  | { type: 'SET_SELECTED_SCAN_KEY'; scanKey: string | null }
  | { type: 'SET_SEARCH'; search: string }
  | { type: 'SET_FEATURE_FILTER'; featureFilter: string }
  | { type: 'SET_TAG_FILTER'; tagFilter: string }
  | { type: 'SET_LIFECYCLE_FILTER'; lifecycleFilter: string }
  | { type: 'TOGGLE_MISSING_SOURCE' }
  | { type: 'SET_SIDEBAR_WIDTH'; width: number }
  | { type: 'SET_PREVIEW_SIZE'; previewSize: ViewportSettings }
  | { type: 'PATCH_PREVIEW_SIZE'; patch: Partial<ViewportSettings> }
  | { type: 'SET_PICK_MODE'; enabled: boolean }
  | { type: 'SET_ALL_INSPECTOR_DATA'; data: InspectorDataMap }
  | { type: 'MERGE_INSPECTOR_ENTRY'; storageKey: string; entry: InspectorDataMap[string] }
  | { type: 'SET_FORM_STATE'; formState: ElementFormState }
  | { type: 'PATCH_FORM_STATE'; patch: Partial<ElementFormState> }
  | { type: 'SET_SAVE_STATUS'; status: SaveStatus }
  | { type: 'SET_REF_SAVE_STATUS'; status: SaveStatus }
  | { type: 'SET_DATABASE_REF'; data: DatabaseRefFile }
  | { type: 'SET_DATABASE_REF_DRAFT'; data: DatabaseRefFile }
  | { type: 'SET_DATABASE_PANEL_PINNED'; pinned: boolean }
  | { type: 'SET_IFRAME_READY'; ready: boolean }
  | { type: 'MARK_IFRAME_LOADING' }
  | { type: 'TOGGLE_SECTION'; section: SidebarSection }
  | { type: 'SET_EXPANDED'; expanded: Partial<Record<SidebarSection, boolean>> }
  | { type: 'LOAD_ELEMENT_FORM'; formState: ElementFormState; expandedPatch: Partial<Record<SidebarSection, boolean>> };

export function createInitialExpandedState(): Record<SidebarSection, boolean> {
  return { ...DEFAULT_EXPANDED_SECTIONS };
}
