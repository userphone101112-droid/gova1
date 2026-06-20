export const SIDEBAR_WIDTH_KEY = 'ui-inspector-sidebar-width';
export const PICK_MODE_KEY = 'ui-inspector-pick-mode';
export const PREVIEW_SIZE_KEY = 'ui-inspector-preview-size';
export const DEFAULT_SIDEBAR_WIDTH = 380;
export const DEFAULT_PREVIEW_WIDTH = 390;
export const DEFAULT_PREVIEW_HEIGHT = 844;
export const DEFAULT_PREVIEW_SCALE = 1;
export const RESIZER_WIDTH = 6;
export const MIN_PANEL_SIZE = 1;

export const LIFECYCLE_FILTERS = [
  { value: 'all', label: 'All lifecycles' },
  { value: 'active', label: 'Active' },
  { value: 'deprecated', label: 'Deprecated' },
] as const;

export const TAG_FILTERS = [
  'all',
  'button',
  'input',
  'a',
  'div',
  'span',
  'section',
  'header',
  'main',
  'nav',
  'h1',
  'h2',
  'h3',
  'p',
  'form',
  'label',
  'img',
] as const;

export const DEFAULT_EXPANDED_SECTIONS = {
  dbAttributes: false,
  dbManagement: false,
  storageManagement: false,
  filters: false,
  list: false,
  details: false,
} as const;

export const ELEMENT_SAVE_CONFIRM_MESSAGE =
  'Save inspector settings for the selected element? This writes to ui-inspector-data.json.';

export const DATABASE_REF_SAVE_CONFIRM_MESSAGE =
  'Save changes to database_ref.json? This updates the shared schema file.';

export const STORAGE_REF_SAVE_CONFIRM_MESSAGE =
  'Save changes to storage.json? This updates the shared storage catalog.';

export const STORAGE_DESCRIPTION_SAVE_CONFIRM_MESSAGE =
  'Save this storage description to storage.json?';
