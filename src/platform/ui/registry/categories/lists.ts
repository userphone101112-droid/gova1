/**
 * List Elements Registry
 *
 * UI identities for list elements: ul, ol, li
 */

import type { UiIdentity } from '../types';

export const COMMON_LISTS = {
  UL: {
uuid: 'bc285034-6053-553f-bb0d-628a465e1a85',
    id: 'UI_COMMON_LISTS_UL',
    path: 'common.lists.ul',
    lifecycle: 'active',
    description: 'Generic unordered list',
    category: 'container' as const,
    feature: 'common',
    version: '1.0.0',
    createdAt: '2026-06-17',
    updatedAt: '2026-06-17',
} as const,
  OL: {
uuid: 'c0194bf6-643b-56a5-b6f5-57584277ac1f',
    id: 'UI_COMMON_LISTS_OL',
    path: 'common.lists.ol',
    lifecycle: 'active',
    description: 'Generic ordered list',
    category: 'container' as const,
    feature: 'common',
    version: '1.0.0',
    createdAt: '2026-06-17',
    updatedAt: '2026-06-17',
} as const,
  LI: {
uuid: '9d16d646-873d-5c55-9bfc-b21c5d6f87db',
    id: 'UI_COMMON_LISTS_LI',
    path: 'common.lists.li',
    lifecycle: 'active',
    description: 'Generic list item',
    category: 'container' as const,
    feature: 'common',
    version: '1.0.0',
    createdAt: '2026-06-17',
    updatedAt: '2026-06-17',
} as const,
} as const;

export const LISTS_IDENTITIES = [...Object.values(COMMON_LISTS)] as readonly UiIdentity[];
