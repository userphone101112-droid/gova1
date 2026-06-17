/**
 * Media Elements Registry
 * 
 * UI identities for media elements: img, picture, figure, figcaption, video, audio, iframe, canvas, svg
 */

import type { UiIdentity } from '../types';

export const COMMON_MEDIA = {
  IMG: {
    id: 'UI_COMMON_MEDIA_IMG',
    path: 'common.media.img',
    description: 'Generic image element',
    category: 'display' as const,
    feature: 'common',
    version: '1.0.0',
    createdAt: '2026-06-17',
    updatedAt: '2026-06-17',
  } as const,
  PICTURE: {
    id: 'UI_COMMON_MEDIA_PICTURE',
    path: 'common.media.picture',
    description: 'Generic picture element',
    category: 'display' as const,
    feature: 'common',
    version: '1.0.0',
    createdAt: '2026-06-17',
    updatedAt: '2026-06-17',
  } as const,
  FIGURE: {
    id: 'UI_COMMON_MEDIA_FIGURE',
    path: 'common.media.figure',
    description: 'Generic figure element',
    category: 'container' as const,
    feature: 'common',
    version: '1.0.0',
    createdAt: '2026-06-17',
    updatedAt: '2026-06-17',
  } as const,
  FIGCAPTION: {
    id: 'UI_COMMON_MEDIA_FIGCAPTION',
    path: 'common.media.figcaption',
    description: 'Generic figure caption',
    category: 'display' as const,
    feature: 'common',
    version: '1.0.0',
    createdAt: '2026-06-17',
    updatedAt: '2026-06-17',
  } as const,
  VIDEO: {
    id: 'UI_COMMON_MEDIA_VIDEO',
    path: 'common.media.video',
    description: 'Generic video element',
    category: 'display' as const,
    feature: 'common',
    version: '1.0.0',
    createdAt: '2026-06-17',
    updatedAt: '2026-06-17',
  } as const,
  AUDIO: {
    id: 'UI_COMMON_MEDIA_AUDIO',
    path: 'common.media.audio',
    description: 'Generic audio element',
    category: 'display' as const,
    feature: 'common',
    version: '1.0.0',
    createdAt: '2026-06-17',
    updatedAt: '2026-06-17',
  } as const,
  IFRAME: {
    id: 'UI_COMMON_MEDIA_IFRAME',
    path: 'common.media.iframe',
    description: 'Generic iframe element',
    category: 'display' as const,
    feature: 'common',
    version: '1.0.0',
    createdAt: '2026-06-17',
    updatedAt: '2026-06-17',
  } as const,
  CANVAS: {
    id: 'UI_COMMON_MEDIA_CANVAS',
    path: 'common.media.canvas',
    description: 'Generic canvas element',
    category: 'display' as const,
    feature: 'common',
    version: '1.0.0',
    createdAt: '2026-06-17',
    updatedAt: '2026-06-17',
  } as const,
  SVG: {
    id: 'UI_COMMON_MEDIA_SVG',
    path: 'common.media.svg',
    description: 'Generic svg element',
    category: 'display' as const,
    feature: 'common',
    version: '1.0.0',
    createdAt: '2026-06-17',
    updatedAt: '2026-06-17',
  } as const,
} as const;

export const MEDIA_IDENTITIES = [
  ...Object.values(COMMON_MEDIA),
] as readonly UiIdentity[];
