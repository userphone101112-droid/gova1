/**
 * Layout Elements Registry
 *
 * UI identities for layout elements: div, span, header, nav, main, section, article, aside, footer
 */

import type { UiIdentity } from '../types';

// ============================================================================
// COMMON LAYOUT ELEMENTS
// ============================================================================

export const COMMON_LAYOUT = {
  CONTAINER: {
uuid: 'fb7203d1-60a8-549a-878b-654fd801dab8',
    id: 'UI_COMMON_LAYOUT_CONTAINER',
    path: 'common.layout.container',
    lifecycle: 'active',
    description: 'Generic container div',
    category: 'container' as const,
    feature: 'common',
    version: '1.0.0',
    createdAt: '2026-06-17',
    updatedAt: '2026-06-17',
} as const,
  WRAPPER: {
uuid: '46c4da25-f600-57e6-a22c-61a3f996e984',
    id: 'UI_COMMON_LAYOUT_WRAPPER',
    path: 'common.layout.wrapper',
    lifecycle: 'active',
    description: 'Generic wrapper div',
    category: 'container' as const,
    feature: 'common',
    version: '1.0.0',
    createdAt: '2026-06-17',
    updatedAt: '2026-06-17',
} as const,
  SPAN: {
uuid: '8c6247f2-d52a-598b-9783-7aa85f8439e1',
    id: 'UI_COMMON_LAYOUT_SPAN',
    path: 'common.layout.span',
    lifecycle: 'active',
    description: 'Generic inline span',
    category: 'container' as const,
    feature: 'common',
    version: '1.0.0',
    createdAt: '2026-06-17',
    updatedAt: '2026-06-17',
} as const,
  HEADER: {
uuid: '6c41e42b-ec26-5a16-b68d-b5dd93cfeb00',
    id: 'UI_COMMON_LAYOUT_HEADER',
    path: 'common.layout.header',
    lifecycle: 'active',
    description: 'Generic header element',
    category: 'container' as const,
    feature: 'common',
    version: '1.0.0',
    createdAt: '2026-06-17',
    updatedAt: '2026-06-17',
} as const,
  NAV: {
uuid: 'bf95bc7b-07c5-5790-a0a2-e17d09761f72',
    id: 'UI_COMMON_LAYOUT_NAV',
    path: 'common.layout.nav',
    lifecycle: 'active',
    description: 'Generic navigation element',
    category: 'container' as const,
    feature: 'common',
    version: '1.0.0',
    createdAt: '2026-06-17',
    updatedAt: '2026-06-17',
} as const,
  MAIN: {
uuid: 'add5563b-ed81-52ce-8c1d-7d755a21d1a8',
    id: 'UI_COMMON_LAYOUT_MAIN',
    path: 'common.layout.main',
    lifecycle: 'active',
    description: 'Generic main content element',
    category: 'container' as const,
    feature: 'common',
    version: '1.0.0',
    createdAt: '2026-06-17',
    updatedAt: '2026-06-17',
} as const,
  SECTION: {
uuid: '9d6110ed-7062-5dda-b247-d6cfc5172dcc',
    id: 'UI_COMMON_LAYOUT_SECTION',
    path: 'common.layout.section',
    lifecycle: 'active',
    description: 'Generic section element',
    category: 'container' as const,
    feature: 'common',
    version: '1.0.0',
    createdAt: '2026-06-17',
    updatedAt: '2026-06-17',
} as const,
  ARTICLE: {
uuid: '77d84a28-531b-56af-9dee-66b2cc4265d9',
    id: 'UI_COMMON_LAYOUT_ARTICLE',
    path: 'common.layout.article',
    lifecycle: 'active',
    description: 'Generic article element',
    category: 'container' as const,
    feature: 'common',
    version: '1.0.0',
    createdAt: '2026-06-17',
    updatedAt: '2026-06-17',
} as const,
  ASIDE: {
uuid: '305889c2-8d52-5879-a637-9a6018b10147',
    id: 'UI_COMMON_LAYOUT_ASIDE',
    path: 'common.layout.aside',
    lifecycle: 'active',
    description: 'Generic aside element',
    category: 'container' as const,
    feature: 'common',
    version: '1.0.0',
    createdAt: '2026-06-17',
    updatedAt: '2026-06-17',
} as const,
  FOOTER: {
uuid: 'f4396685-73d8-53bc-99e0-cb0bde9a4d12',
    id: 'UI_COMMON_LAYOUT_FOOTER',
    path: 'common.layout.footer',
    lifecycle: 'active',
    description: 'Generic footer element',
    category: 'container' as const,
    feature: 'common',
    version: '1.0.0',
    createdAt: '2026-06-17',
    updatedAt: '2026-06-17',
} as const,
} as const;

// ============================================================================
// DECORATIVE LAYOUT ELEMENTS
// ============================================================================

export const DECORATIVE = {
  SPACER: {
uuid: 'fe02463a-95dd-5833-88e3-8a30479e2609',
    id: 'UI_COMMON_DECORATIVE_SPACER',
    path: 'common.decorative.spacer',
    lifecycle: 'active',
    description: 'Decorative spacer element',
    category: 'container' as const,
    feature: 'common',
    version: '1.0.0',
    createdAt: '2026-06-17',
    updatedAt: '2026-06-17',
} as const,
  DIVIDER: {
uuid: 'd12f33e7-3854-5c44-90e5-5d8562d3f06a',
    id: 'UI_COMMON_DECORATIVE_DIVIDER',
    path: 'common.decorative.divider',
    lifecycle: 'active',
    description: 'Decorative divider element',
    category: 'container' as const,
    feature: 'common',
    version: '1.0.0',
    createdAt: '2026-06-17',
    updatedAt: '2026-06-17',
} as const,
  BACKGROUND: {
uuid: 'ac3041f2-3c5b-537b-ade4-a5684f020321',
    id: 'UI_COMMON_DECORATIVE_BACKGROUND',
    path: 'common.decorative.background',
    lifecycle: 'active',
    description: 'Decorative background element',
    category: 'container' as const,
    feature: 'common',
    version: '1.0.0',
    createdAt: '2026-06-17',
    updatedAt: '2026-06-17',
} as const,
  OVERLAY: {
uuid: '012b2322-e2b9-5a3d-aeac-dce4bea4c2f7',
    id: 'UI_COMMON_DECORATIVE_OVERLAY',
    path: 'common.decorative.overlay',
    lifecycle: 'active',
    description: 'Decorative overlay element',
    category: 'container' as const,
    feature: 'common',
    version: '1.0.0',
    createdAt: '2026-06-17',
    updatedAt: '2026-06-17',
} as const,
} as const;

export const LAYOUT_IDENTITIES = [
  ...Object.values(COMMON_LAYOUT),
  ...Object.values(DECORATIVE),
] as readonly UiIdentity[];
