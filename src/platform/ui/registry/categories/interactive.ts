/**
 * Interactive Elements Registry
 *
 * UI identities for interactive elements: dialog, details, summary, a, link
 */

import type { UiIdentity } from '../types';

export const COMMON_INTERACTIVE = {
  DIALOG: {
uuid: '45d2dbbe-bfcc-5059-98b5-8194dc60c087',
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
uuid: 'ae8afc14-191e-5ae5-87f1-5f325c76146b',
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
uuid: '260ad1aa-24a3-5f93-8679-e5ac9589ff05',
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
uuid: 'ea84d05d-11ba-542c-9d70-dd1f6e506b7e',
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
