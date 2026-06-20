/**
 * Spacing Elements Registry
 *
 * UI identities for spacing elements: br, hr
 */

import type { UiIdentity } from '../types';

export const COMMON_SPACING = {
  BR: {
uuid: '0edaaf85-15ca-59aa-8592-187bc2e48c20',
    id: 'UI_COMMON_SPACING_BR',
    path: 'common.spacing.br',
    lifecycle: 'active',
    description: 'Generic line break',
    category: 'container' as const,
    feature: 'common',
    version: '1.0.0',
    createdAt: '2026-06-17',
    updatedAt: '2026-06-17',
} as const,
  HR: {
uuid: '0ee9ba0f-0de2-51f8-8583-0df1caf3a342',
    id: 'UI_COMMON_SPACING_HR',
    path: 'common.spacing.hr',
    lifecycle: 'active',
    description: 'Generic horizontal rule',
    category: 'container' as const,
    feature: 'common',
    version: '1.0.0',
    createdAt: '2026-06-17',
    updatedAt: '2026-06-17',
} as const,
} as const;

export const SPACING_IDENTITIES = [...Object.values(COMMON_SPACING)] as readonly UiIdentity[];
