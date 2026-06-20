/**
 * Template Elements Registry
 *
 * UI identities for template elements: template, slot
 */

import type { UiIdentity } from '../types';

export const COMMON_TEMPLATE = {
  TEMPLATE: {
uuid: '7d733c9c-e2ba-5d61-81d2-ad8ed16aced3',
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
uuid: 'd73f3d1e-51b1-5d5f-9a70-f81822669659',
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
