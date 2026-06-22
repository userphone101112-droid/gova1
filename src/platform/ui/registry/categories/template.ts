/**
 * Template Elements Registry
 *
 * UI identities for template elements: template, slot
 */

import type { UiIdentity } from '../types';

export const COMMON_TEMPLATE = {
  TEMPLATE: {
    id: 'UI_COMMON_TEMPLATE_TEMPLATE',
    path: 'common.template.template',
    lifecycle: 'active',
    description: 'Generic template element',
    category: 'container' as const,
    feature: 'common',
    version: '1.0.0',
    createdAt: '2026-06-17',
    updatedAt: '2026-06-17',
} as const,
  SLOT: {
    id: 'UI_COMMON_TEMPLATE_SLOT',
    path: 'common.template.slot',
    lifecycle: 'active',
    description: 'Generic slot element',
    category: 'container' as const,
    feature: 'common',
    version: '1.0.0',
    createdAt: '2026-06-17',
    updatedAt: '2026-06-17',
} as const,
} as const;

export const TEMPLATE_IDENTITIES = [...Object.values(COMMON_TEMPLATE)] as readonly UiIdentity[];
