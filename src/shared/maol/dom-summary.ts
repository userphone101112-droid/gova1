/**
 * MAOL — DOM Summary Generator (UUID-first)
 */

import { getUiIdentityByUuid } from '@/platform/ui/registry/registry';

import type { MaolDomSummary, MaolComponentNode } from './types';

const IS_DEV = process.env.NODE_ENV === 'development';

const INTERACTIVE_TAGS = new Set(['button', 'a', 'input', 'select', 'textarea', 'form']);

export function generateDomSummary(route: string): MaolDomSummary {
  if (typeof document === 'undefined') {
    return {
      route,
      timestamp: Date.now(),
      totalIdentified: 0,
      tree: { type: 'page', children: [] },
    };
  }

  const elements = document.querySelectorAll<HTMLElement>('[data-ui-uuid]');
  const componentMap = new Map<string, MaolComponentNode>();

  elements.forEach((el) => {
    const uuid = el.getAttribute('data-ui-uuid');
    if (!uuid) return;

    const identity = getUiIdentityByUuid(uuid);
    const feature = identity?.feature || 'unknown';
    const uiId = identity?.id || uuid;
    const tag = el.tagName.toLowerCase();

    if (!IS_DEV && !INTERACTIVE_TAGS.has(tag)) return;

    if (!componentMap.has(feature)) {
      componentMap.set(feature, {
        name: feature,
        uiIds: [],
        tags: [],
      });
    }

    const node = componentMap.get(feature)!;
    if (!node.uiIds.includes(uiId)) {
      node.uiIds.push(uiId);
    }
    if (!node.tags.includes(tag)) {
      node.tags.push(tag);
    }
  });

  return {
    route,
    timestamp: Date.now(),
    totalIdentified: elements.length,
    tree: { type: 'page', children: Array.from(componentMap.values()) },
  };
}
