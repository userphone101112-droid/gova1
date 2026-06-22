/**
 * Common composite UI component identities (Card, Modal, Badge).
 */

import type { UiIdentity } from '../types';

export const COMMON_COMPONENTS = {
  CARD: {
    CONTAINER: {
      id: 'UI_COMMON_CARD_CONTAINER',
      path: 'common.components.card.container',
      lifecycle: 'active',
      description: 'Card container',
      category: 'container' as const,
      feature: 'common',
      version: '1.0.0',
      createdAt: '2026-06-17',
      updatedAt: '2026-06-17',
} as const,
    TITLE: {
      id: 'UI_COMMON_CARD_TITLE',
      path: 'common.components.card.title',
      lifecycle: 'active',
      description: 'Card title',
      category: 'display' as const,
      feature: 'common',
      version: '1.0.0',
      createdAt: '2026-06-17',
      updatedAt: '2026-06-17',
} as const,
  },
  MODAL: {
    CONTAINER: {
      id: 'UI_COMMON_MODAL_CONTAINER',
      path: 'common.components.modal.container',
      lifecycle: 'active',
      description: 'Modal dialog container',
      category: 'container' as const,
      feature: 'common',
      version: '1.0.0',
      createdAt: '2026-06-17',
      updatedAt: '2026-06-17',
} as const,
    TITLE: {
      id: 'UI_COMMON_MODAL_TITLE',
      path: 'common.components.modal.title',
      lifecycle: 'active',
      description: 'Modal title',
      category: 'display' as const,
      feature: 'common',
      version: '1.0.0',
      createdAt: '2026-06-17',
      updatedAt: '2026-06-17',
} as const,
    CLOSE_BUTTON: {
      id: 'UI_COMMON_MODAL_CLOSE',
      path: 'common.components.modal.close-button',
      lifecycle: 'active',
      description: 'Modal close button',
      category: 'action' as const,
      feature: 'common',
      version: '1.0.0',
      createdAt: '2026-06-17',
      updatedAt: '2026-06-17',
} as const,
  },
  BADGE: {
    LABEL: {
      id: 'UI_COMMON_BADGE_LABEL',
      path: 'common.components.badge.label',
      lifecycle: 'active',
      description: 'Badge label',
      category: 'display' as const,
      feature: 'common',
      version: '1.0.0',
      createdAt: '2026-06-17',
      updatedAt: '2026-06-17',
} as const,
  },
} as const;

export const COMPONENT_IDENTITIES = [
  ...Object.values(COMMON_COMPONENTS.CARD),
  ...Object.values(COMMON_COMPONENTS.MODAL),
  ...Object.values(COMMON_COMPONENTS.BADGE),
] as readonly UiIdentity[];
