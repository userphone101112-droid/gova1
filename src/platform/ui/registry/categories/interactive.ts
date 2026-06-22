/**
 * Interactive Elements Registry
 *
 * UI identities for interactive elements: dialog, details, summary, a, link
 */

import type { UiIdentity } from '../types';

export const COMMON_INTERACTIVE = {
  DIALOG: {
    id: 'UI_COMMON_INTERACTIVE_DIALOG',
    path: 'common.interactive.dialog',
    lifecycle: 'active',
    description: 'Generic dialog element',
    category: 'container' as const,
    feature: 'common',
    version: '1.0.0',
    createdAt: '2026-06-17',
    updatedAt: '2026-06-17',
} as const,
  DETAILS: {
    id: 'UI_COMMON_INTERACTIVE_DETAILS',
    path: 'common.interactive.details',
    lifecycle: 'active',
    description: 'Generic details element',
    category: 'container' as const,
    feature: 'common',
    version: '1.0.0',
    createdAt: '2026-06-17',
    updatedAt: '2026-06-17',
} as const,
  SUMMARY: {
    id: 'UI_COMMON_INTERACTIVE_SUMMARY',
    path: 'common.interactive.summary',
    lifecycle: 'active',
    description: 'Generic details summary',
    category: 'display' as const,
    feature: 'common',
    version: '1.0.0',
    createdAt: '2026-06-17',
    updatedAt: '2026-06-17',
} as const,
  A: {
    id: 'UI_COMMON_INTERACTIVE_A',
    path: 'common.interactive.a',
    lifecycle: 'active',
    description: 'Generic anchor link',
    category: 'navigation' as const,
    feature: 'common',
    version: '1.0.0',
    createdAt: '2026-06-17',
    updatedAt: '2026-06-17',
} as const,
} as const;

export const INTERACTIVE_IDENTITIES = [
  ...Object.values(COMMON_INTERACTIVE),
] as readonly UiIdentity[];
