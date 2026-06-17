/**
 * UI Registry Categories - Main Export
 * 
 * Exports all category-based UI identities.
 */

export * from './layout';
export * from './typography';
export * from './forms';
export * from './media';
export * from './lists';
export * from './tables';
export * from './interactive';
export * from './spacing';
export * from './template';
export * from './components';

import type { UiIdentity } from '../types';
import { LAYOUT_IDENTITIES } from './layout';
import { TYPOGRAPHY_IDENTITIES } from './typography';
import { FORMS_IDENTITIES } from './forms';
import { MEDIA_IDENTITIES } from './media';
import { LISTS_IDENTITIES } from './lists';
import { TABLES_IDENTITIES } from './tables';
import { INTERACTIVE_IDENTITIES } from './interactive';
import { SPACING_IDENTITIES } from './spacing';
import { TEMPLATE_IDENTITIES } from './template';
import { COMPONENTS_IDENTITIES } from './components';

export const ALL_CATEGORY_IDENTITIES = [
  ...LAYOUT_IDENTITIES,
  ...TYPOGRAPHY_IDENTITIES,
  ...FORMS_IDENTITIES,
  ...MEDIA_IDENTITIES,
  ...LISTS_IDENTITIES,
  ...TABLES_IDENTITIES,
  ...INTERACTIVE_IDENTITIES,
  ...SPACING_IDENTITIES,
  ...TEMPLATE_IDENTITIES,
  ...COMPONENTS_IDENTITIES,
] as readonly UiIdentity[];
