/**
 * Typography Elements Registry
 * 
 * UI identities for typography elements: h1-h6, p, strong, em, code, pre
 */

import type { UiIdentity } from '../types';

export const COMMON_TYPOGRAPHY = {
  H1: {
    id: 'UI_COMMON_TYPOGRAPHY_H1',
    path: 'common.typography.h1',
    description: 'Generic h1 heading',
    category: 'display' as const,
    feature: 'common',
    version: '1.0.0',
    createdAt: '2026-06-17',
    updatedAt: '2026-06-17',
  } as const,
  H2: {
    id: 'UI_COMMON_TYPOGRAPHY_H2',
    path: 'common.typography.h2',
    description: 'Generic h2 heading',
    category: 'display' as const,
    feature: 'common',
    version: '1.0.0',
    createdAt: '2026-06-17',
    updatedAt: '2026-06-17',
  } as const,
  H3: {
    id: 'UI_COMMON_TYPOGRAPHY_H3',
    path: 'common.typography.h3',
    description: 'Generic h3 heading',
    category: 'display' as const,
    feature: 'common',
    version: '1.0.0',
    createdAt: '2026-06-17',
    updatedAt: '2026-06-17',
  } as const,
  H4: {
    id: 'UI_COMMON_TYPOGRAPHY_H4',
    path: 'common.typography.h4',
    description: 'Generic h4 heading',
    category: 'display' as const,
    feature: 'common',
    version: '1.0.0',
    createdAt: '2026-06-17',
    updatedAt: '2026-06-17',
  } as const,
  H5: {
    id: 'UI_COMMON_TYPOGRAPHY_H5',
    path: 'common.typography.h5',
    description: 'Generic h5 heading',
    category: 'display' as const,
    feature: 'common',
    version: '1.0.0',
    createdAt: '2026-06-17',
    updatedAt: '2026-06-17',
  } as const,
  H6: {
    id: 'UI_COMMON_TYPOGRAPHY_H6',
    path: 'common.typography.h6',
    description: 'Generic h6 heading',
    category: 'display' as const,
    feature: 'common',
    version: '1.0.0',
    createdAt: '2026-06-17',
    updatedAt: '2026-06-17',
  } as const,
  P: {
    id: 'UI_COMMON_TYPOGRAPHY_P',
    path: 'common.typography.p',
    description: 'Generic paragraph',
    category: 'display' as const,
    feature: 'common',
    version: '1.0.0',
    createdAt: '2026-06-17',
    updatedAt: '2026-06-17',
  } as const,
  STRONG: {
    id: 'UI_COMMON_TYPOGRAPHY_STRONG',
    path: 'common.typography.strong',
    description: 'Generic strong/bold text',
    category: 'display' as const,
    feature: 'common',
    version: '1.0.0',
    createdAt: '2026-06-17',
    updatedAt: '2026-06-17',
  } as const,
  EM: {
    id: 'UI_COMMON_TYPOGRAPHY_EM',
    path: 'common.typography.em',
    description: 'Generic em/italic text',
    category: 'display' as const,
    feature: 'common',
    version: '1.0.0',
    createdAt: '2026-06-17',
    updatedAt: '2026-06-17',
  } as const,
  CODE: {
    id: 'UI_COMMON_TYPOGRAPHY_CODE',
    path: 'common.typography.code',
    description: 'Generic code element',
    category: 'display' as const,
    feature: 'common',
    version: '1.0.0',
    createdAt: '2026-06-17',
    updatedAt: '2026-06-17',
  } as const,
  PRE: {
    id: 'UI_COMMON_TYPOGRAPHY_PRE',
    path: 'common.typography.pre',
    description: 'Generic preformatted text',
    category: 'display' as const,
    feature: 'common',
    version: '1.0.0',
    createdAt: '2026-06-17',
    updatedAt: '2026-06-17',
  } as const,
} as const;

export const TYPOGRAPHY_IDENTITIES = [
  ...Object.values(COMMON_TYPOGRAPHY),
] as readonly UiIdentity[];
