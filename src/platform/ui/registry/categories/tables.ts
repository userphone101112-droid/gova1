/**
 * Table Elements Registry
 *
 * UI identities for table elements: table, thead, tbody, tr, th, td
 */

import type { UiIdentity } from '../types';

export const COMMON_TABLES = {
  TABLE: {
uuid: '85802ae9-ab46-512e-9afd-227316e824e8',
    id: 'UI_COMMON_TABLES_TABLE',
    path: 'common.tables.table',
    lifecycle: 'active',
    description: 'Generic table element',
    category: 'container' as const,
    feature: 'common',
    version: '1.0.0',
    createdAt: '2026-06-17',
    updatedAt: '2026-06-17',
} as const,
  THEAD: {
uuid: '098f6517-1901-5204-95f9-3d2d1b4c9c42',
    id: 'UI_COMMON_TABLES_THEAD',
    path: 'common.tables.thead',
    lifecycle: 'active',
    description: 'Generic table head',
    category: 'container' as const,
    feature: 'common',
    version: '1.0.0',
    createdAt: '2026-06-17',
    updatedAt: '2026-06-17',
} as const,
  TBODY: {
uuid: '22bcb049-a6b4-50ae-81ad-2c2f4f9d992c',
    id: 'UI_COMMON_TABLES_TBODY',
    path: 'common.tables.tbody',
    lifecycle: 'active',
    description: 'Generic table body',
    category: 'container' as const,
    feature: 'common',
    version: '1.0.0',
    createdAt: '2026-06-17',
    updatedAt: '2026-06-17',
} as const,
  TR: {
uuid: '86a86731-f24a-5fa8-b240-18bf1c1649b6',
    id: 'UI_COMMON_TABLES_TR',
    path: 'common.tables.tr',
    lifecycle: 'active',
    description: 'Generic table row',
    category: 'container' as const,
    feature: 'common',
    version: '1.0.0',
    createdAt: '2026-06-17',
    updatedAt: '2026-06-17',
} as const,
  TH: {
uuid: '8ca870a3-dc4a-5d06-8c40-41ad121639f8',
    id: 'UI_COMMON_TABLES_TH',
    path: 'common.tables.th',
    lifecycle: 'active',
    description: 'Generic table header cell',
    category: 'display' as const,
    feature: 'common',
    version: '1.0.0',
    createdAt: '2026-06-17',
    updatedAt: '2026-06-17',
} as const,
  TD: {
uuid: '98a88387-e84a-5fea-8040-2ec90e1633ac',
    id: 'UI_COMMON_TABLES_TD',
    path: 'common.tables.td',
    lifecycle: 'active',
    description: 'Generic table data cell',
    category: 'display' as const,
    feature: 'common',
    version: '1.0.0',
    createdAt: '2026-06-17',
    updatedAt: '2026-06-17',
} as const,
} as const;

export const TABLES_IDENTITIES = [...Object.values(COMMON_TABLES)] as readonly UiIdentity[];
