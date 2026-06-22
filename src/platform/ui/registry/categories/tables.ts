/**
 * Table Elements Registry
 *
 * UI identities for table elements: table, thead, tbody, tr, th, td
 */

import type { UiIdentity } from '../types';

export const COMMON_TABLES = {
  TABLE: {
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
