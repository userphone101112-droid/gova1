import { DECORATIVE } from '@/platform/ui/registry/categories/layout';
import {
  getUiIdentityByUuid,
  getUiIdentityLifecycle,
  UI_UUID_MAP,
} from '@/platform/ui/registry/registry';
import { UI_SOURCE_INDEX_BY_UUID } from '@/platform/ui/registry/source-index';

import type { InspectElementSnapshot } from './UiInspectorFrameBridge';

const HIGHLIGHT_ID = 'gova-ui-inspector-highlight';
const HOVER_HIGHLIGHT_ID = 'gova-ui-inspector-hover';

let elementByScanKey = new Map<string, HTMLElement>();
let pickModeEnabled = false;
let onPickHandler: ((scanKey: string) => void) | null = null;

const DECORATIVE_SPACER_UUID = DECORATIVE.SPACER.uuid;

export function scanInspectableElements(): InspectElementSnapshot[] {
  if (typeof document === 'undefined') return [];

  elementByScanKey = new Map();
  const elements = document.querySelectorAll<HTMLElement>('[data-ui-uuid]');
  const snapshots: InspectElementSnapshot[] = [];

  elements.forEach((el) => {
    const uuid = el.getAttribute('data-ui-uuid') || '';
    if (!uuid || !(uuid in UI_UUID_MAP)) return;

    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return;

    const scanKey = `scan-${snapshots.length}`;
    elementByScanKey.set(scanKey, el);

    const identity = getUiIdentityByUuid(uuid);
    const source = UI_SOURCE_INDEX_BY_UUID[uuid];
    const instanceId = el.getAttribute('data-ui-instance-id');
    const identityKey = el.getAttribute('data-ui-identity-key');

    snapshots.push({
      scanKey,
      uuid,
      tagName: el.tagName.toLowerCase(),
      id: identity?.id ?? '',
      path: identity?.path ?? '',
      feature: identity?.feature ?? '',
      lifecycle: identity ? getUiIdentityLifecycle(identity) : 'active',
      instanceId,
      identityKey,
      rect: {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      },
      sourceFile: source?.sourceFile ?? '',
      sourceComponent: source?.sourceComponent ?? '',
      sourceLine: source?.sourceLine ?? 0,
      hasSource: Boolean(source),
    });
  });

  return snapshots.sort((a, b) => a.path.localeCompare(b.path));
}

function getInspectableElement(scanKey: string): HTMLElement | null {
  return elementByScanKey.get(scanKey) ?? null;
}

function resolveScanKey(el: HTMLElement): string | null {
  for (const [key, node] of elementByScanKey) {
    if (node === el) return key;
  }
  scanInspectableElements();
  for (const [key, node] of elementByScanKey) {
    if (node === el) return key;
  }
  return null;
}

function getUiElementFromPoint(clientX: number, clientY: number): HTMLElement | null {
  const elements = document.elementsFromPoint(clientX, clientY) as HTMLElement[];

  for (const el of elements) {
    if (
      el.closest('[data-gova-inspector-highlight]') ||
      el.closest(`#${HOVER_HIGHLIGHT_ID}`) ||
      el.id === HIGHLIGHT_ID ||
      el.id === HOVER_HIGHLIGHT_ID
    ) {
      continue;
    }

    const uiElement = el.closest('[data-ui-uuid]') as HTMLElement | null;
    if (!uiElement) continue;

    const uuid = uiElement.getAttribute('data-ui-uuid');
    if (!uuid || !(uuid in UI_UUID_MAP)) continue;
    if (uuid === DECORATIVE_SPACER_UUID) continue;

    return uiElement;
  }

  return null;
}

function drawOverlay(
  el: HTMLElement,
  scanKey: string,
  overlayId: string,
  borderStyle: string,
  background: string
): void {
  const rect = el.getBoundingClientRect();
  const overlay = document.createElement('div');
  overlay.id = overlayId;
  overlay.setAttribute('data-gova-inspector-highlight', 'true');
  overlay.setAttribute('data-highlight-scan-key', scanKey);
  Object.assign(overlay.style, {
    position: 'fixed',
    top: `${rect.top}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    border: borderStyle,
    background,
    pointerEvents: 'none',
    zIndex: overlayId === HOVER_HIGHLIGHT_ID ? '2147483645' : '2147483646',
    boxSizing: 'border-box',
  });
  document.body.appendChild(overlay);
}

function drawHighlight(el: HTMLElement, scanKey: string): void {
  drawOverlay(
    el,
    scanKey,
    HIGHLIGHT_ID,
    '2px solid var(--gova-component-dev-ui-blue-border, #2563eb)',
    'var(--gova-component-dev-ui-blue-bg, rgba(37, 99, 235, 0.12))'
  );
}

function drawHoverHighlight(el: HTMLElement, scanKey: string): void {
  drawOverlay(
    el,
    scanKey,
    HOVER_HIGHLIGHT_ID,
    '2px dashed var(--gova-component-dev-ui-blue-border, #2563eb)',
    'var(--gova-component-dev-ui-blue-bg, rgba(37, 99, 235, 0.08))'
  );
}

export function highlightInspectableElement(scanKey: string): void {
  clearInspectableHighlight();
  const el = getInspectableElement(scanKey);
  if (!el) return;
  drawHighlight(el, scanKey);
}

export function scrollToInspectableElement(scanKey: string): void {
  const el = getInspectableElement(scanKey);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
  highlightInspectableElement(scanKey);
}

export function clearInspectableHighlight(): void {
  document.getElementById(HIGHLIGHT_ID)?.remove();
}

export function clearInspectableHover(): void {
  document.getElementById(HOVER_HIGHLIGHT_ID)?.remove();
}

export function repositionInspectableHighlight(): void {
  const overlay = document.getElementById(HIGHLIGHT_ID);
  if (!overlay) return;
  const scanKey = overlay.getAttribute('data-highlight-scan-key');
  if (!scanKey) return;
  const el = getInspectableElement(scanKey);
  if (!el) return;
  clearInspectableHighlight();
  drawHighlight(el, scanKey);
}

function repositionInspectableHover(): void {
  const overlay = document.getElementById(HOVER_HIGHLIGHT_ID);
  if (!overlay) return;
  const scanKey = overlay.getAttribute('data-highlight-scan-key');
  if (!scanKey) return;
  const el = getInspectableElement(scanKey);
  if (!el) return;
  clearInspectableHover();
  drawHoverHighlight(el, scanKey);
}

export function setInspectablePickMode(enabled: boolean): void {
  pickModeEnabled = enabled;
  if (!enabled) {
    clearInspectableHover();
    document.documentElement.style.cursor = '';
  } else {
    document.documentElement.style.cursor = 'crosshair';
  }
}

export function bindInspectablePickHandlers(onPick: (scanKey: string) => void): () => void {
  onPickHandler = onPick;

  const onMouseMove = (event: MouseEvent) => {
    if (!pickModeEnabled) return;
    const el = getUiElementFromPoint(event.clientX, event.clientY);
    if (!el) {
      clearInspectableHover();
      return;
    }
    const scanKey = resolveScanKey(el);
    if (!scanKey) {
      clearInspectableHover();
      return;
    }
    const existing = document.getElementById(HOVER_HIGHLIGHT_ID);
    if (existing?.getAttribute('data-highlight-scan-key') === scanKey) return;
    clearInspectableHover();
    drawHoverHighlight(el, scanKey);
  };

  const onClick = (event: MouseEvent) => {
    if (!pickModeEnabled) return;
    const el = getUiElementFromPoint(event.clientX, event.clientY);
    if (!el) return;
    event.preventDefault();
    event.stopPropagation();
    const scanKey = resolveScanKey(el);
    if (!scanKey) return;
    highlightInspectableElement(scanKey);
    onPickHandler?.(scanKey);
  };

  const onScrollOrResize = () => {
    repositionInspectableHighlight();
    repositionInspectableHover();
  };

  document.addEventListener('mousemove', onMouseMove, true);
  document.addEventListener('click', onClick, true);
  window.addEventListener('scroll', onScrollOrResize, true);
  window.addEventListener('resize', onScrollOrResize);

  return () => {
    document.removeEventListener('mousemove', onMouseMove, true);
    document.removeEventListener('click', onClick, true);
    window.removeEventListener('scroll', onScrollOrResize, true);
    window.removeEventListener('resize', onScrollOrResize);
    onPickHandler = null;
    setInspectablePickMode(false);
    clearInspectableHover();
  };
}
