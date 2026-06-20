/**
 * Common composite UI component identities (Card, Modal, Badge).
 */

import type { UiIdentity } from '../types';

export const COMMON_COMPONENTS = {
  CARD: {
    CONTAINER: {
uuid: '5efd4cdd-b439-5daa-98ba-905fa6e3620c',
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
uuid: '4069ec28-7fae-5947-9a60-9c0e060bc155',
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
uuid: 'adf16d54-65e6-55fd-92ad-9cb6512361c7',
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
uuid: '04f136dd-d3d0-56c8-930e-a97bee4975f6',
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
uuid: '044ab13f-66e9-523a-87ba-9b61796b0ac4',
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
uuid: 'cfe55c9f-d150-5bfe-adac-3c85f063b6d4',
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
