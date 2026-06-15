/**
 * MAOL — DOM Summary Generator
 *
 * Generates a structured UI tree per route based ONLY on UI Identity usage.
 * Never reads text content, CSS classes, or raw HTML.
 *
 * DEV mode:  full component tree with all uiIds and tags
 * PROD mode: minimal tree — only component names + count of identities
 *
 * Reads from DOM attributes only:
 *   - data-ui-id       → stable identity ID
 *   - data-ui-feature  → component/feature grouping key
 *   - tagName          → element type (button, a, input, etc.)
 */

import type { MaolDomSummary, MaolComponentNode, MaolDomTree } from './types';

const IS_DEV = process.env.NODE_ENV === 'development';

/** Interactive element tag names we care about */
const INTERACTIVE_TAGS = new Set(['button', 'a', 'input', 'select', 'textarea', 'form']);

/**
 * Generate a structured DOM summary for the current page.
 * Call this after navigation or route changes.
 *
 * @param route The current route path (e.g., '/home')
 * @returns MaolDomSummary — structured, safe, minimal UI tree
 */
export function generateDomSummary(route: string): MaolDomSummary {
  if (typeof document === 'undefined') {
    return {
      route,
      timestamp: Date.now(),
      totalIdentified: 0,
      tree: { type: 'page', children: [] },
    };
  }

  const elements = document.querySelectorAll<HTMLElement>('[data-ui-id]');
  const componentMap = new Map<string, MaolComponentNode>();

  elements.forEach((el) => {
    const uiId = el.getAttribute('data-ui-id');
    const feature = el.getAttribute('data-ui-feature') || 'unknown';
    const tag = el.tagName.toLowerCase();

    if (!uiId) return;

    // In PROD mode, skip non-interactive elements to minimize data
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

  const children: MaolComponentNode[] = Array.from(componentMap.values());

  const tree: MaolDomTree = {
    type: 'page',
    children,
  };

  return {
    route,
    timestamp: Date.now(),
    totalIdentified: elements.length,
    tree,
  };
}
