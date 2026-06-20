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
  elementBindings: false,
  databaseCatalog: false,
  storageCatalog: false,
  simulationInsights: false,
  filters: false,
  list: false,
  details: false,
} as const;

export const ELEMENT_SAVE_CONFIRM_MESSAGE =
  'Save selected element bindings and attributes to ui-inspector-data.json?';

export const DATABASE_CATALOG_SAVE_CONFIRM_MESSAGE =
  'Save database catalog changes to database_ref.json?';

export const STORAGE_CATALOG_SAVE_CONFIRM_MESSAGE =
  'Save storage catalog changes to storage.json?';

export const DATABASE_REF_SAVE_CONFIRM_MESSAGE = DATABASE_CATALOG_SAVE_CONFIRM_MESSAGE;

export const STORAGE_REF_SAVE_CONFIRM_MESSAGE = STORAGE_CATALOG_SAVE_CONFIRM_MESSAGE;

export const DATABASE_QUICK_ADD_CONFIRM_MESSAGE =
  'Add this item to database_ref.json and save now?';

export const STORAGE_QUICK_ADD_CONFIRM_MESSAGE =
  'Add this item to storage.json and save now?';

export const STORAGE_DESCRIPTION_SAVE_CONFIRM_MESSAGE =
  'Save this storage description to storage.json?';
