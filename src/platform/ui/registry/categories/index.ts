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

import { COMPONENT_IDENTITIES } from './components';
import { FORMS_IDENTITIES } from './forms';
import { INTERACTIVE_IDENTITIES } from './interactive';
import { LAYOUT_IDENTITIES } from './layout';
import { LISTS_IDENTITIES } from './lists';
import { MEDIA_IDENTITIES } from './media';
import { SPACING_IDENTITIES } from './spacing';
import { TABLES_IDENTITIES } from './tables';
import { TEMPLATE_IDENTITIES } from './template';
import { TYPOGRAPHY_IDENTITIES } from './typography';

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
  ...COMPONENT_IDENTITIES,
] as readonly UiIdentity[];
