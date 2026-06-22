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
