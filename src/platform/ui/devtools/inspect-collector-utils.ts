import { DECORATIVE } from '@/platform/ui/registry/categories/layout';
import {
  getUiIdentityByUuid,
  getUiIdentityLifecycle,
  UI_UUID_MAP,
} from '@/platform/ui/registry/registry';
import { UI_SOURCE_INDEX_BY_UUID } from '@/platform/ui/registry/source-index';

import type { InspectElementSnapshot, FrameCandidate } from './UiInspectorFrameBridge';

const HIGHLIGHT_ID = 'gova-ui-inspector-highlight';
const HOVER_HIGHLIGHT_ID = 'gova-ui-inspector-hover';
const FRAMES_CONTAINER_ID = 'gova-ui-inspector-binding-frames';

let elementByScanKey = new Map<string, HTMLElement>();
let bindingFrameCandidates: FrameCandidate[] = [];
let pickModeEnabled = false;
let onPickHandler: ((scanKey: string) => void) | null = null;

const DECORATIVE_SPACER_UUID = (DECORATIVE.SPACER as { uuid?: string }).uuid ?? '';

export function scanInspectableElements(): InspectElementSnapshot[] {
  if (typeof document === 'undefined') return [];

  elementByScanKey = new Map();
  const elements = document.querySelectorAll<HTMLElement>('*');
  const snapshots: InspectElementSnapshot[] = [];

  elements.forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return;

    // Skip inspector-related elements
    if (
      el.closest('[data-gova-inspector-highlight]') ||
      el.closest('[data-gova-inspector-frame]') ||
      el.closest(`#${FRAMES_CONTAINER_ID}`) ||
      el.closest(`#${HOVER_HIGHLIGHT_ID}`) ||
      el.id === HIGHLIGHT_ID ||
      el.id === HOVER_HIGHLIGHT_ID
    ) {
      return;
    }

    // Skip non-intrinsic elements
    if (!el.tagName || el.tagName === 'HTML' || el.tagName === 'BODY' || el.tagName === 'HEAD') {
      return;
    }

    const uuid = el.getAttribute('data-ui-uuid') || '';
    const langUuid = el.getAttribute('data-ui-lang-uuid') || '';
    const hasUuid = Boolean(uuid && uuid in UI_UUID_MAP);

    const scanKey = `scan-${snapshots.length}`;
    elementByScanKey.set(scanKey, el);

    let snapshot: InspectElementSnapshot;

    if (hasUuid) {
      const identity = getUiIdentityByUuid(uuid);
      const source = UI_SOURCE_INDEX_BY_UUID[uuid];
      const instanceId = el.getAttribute('data-ui-instance-id');
      const identityKey = el.getAttribute('data-ui-identity-key');

      snapshot = {
        scanKey,
        uuid,
        langUuid,
        hasUuid: true,
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
        sourceColumn: (source as any)?.sourceColumn ?? 0,
        hasSource: Boolean(source),
        domPath: getDomPath(el),
        textSnippet: getTextSnippet(el),
        className: getClassName(el),
      };
    } else {
      // Element without UUID - collect basic info for registration
      const domPath = getDomPath(el);
      const textSnippet = getTextSnippet(el);
      const className = getClassName(el);

      // Try to get source info from dev-only markers
      const sourceFile = el.getAttribute('data-gova-source-file') || '';
      const sourceLine = parseInt(el.getAttribute('data-gova-source-line') || '0', 10);
      const sourceColumn = parseInt(el.getAttribute('data-gova-source-column') || '0', 10);
      const sourceComponent = el.getAttribute('data-gova-source-component') || '';

      snapshot = {
        scanKey,
        uuid,
        langUuid,
        hasUuid: false,
        tagName: el.tagName.toLowerCase(),
        id: el.id || '',
        path: '',
        feature: '',
        lifecycle: 'active',
        instanceId: null,
        identityKey: null,
        rect: {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        },
        sourceFile,
        sourceComponent,
        sourceLine,
        sourceColumn,
        hasSource: Boolean(sourceFile),
        domPath,
        textSnippet,
        className,
      };
    }

    snapshots.push(snapshot);
  });

  return snapshots.sort((a, b) => a.path.localeCompare(b.path));
}

function getDomPath(el: HTMLElement): string {
  const path: string[] = [];
  let current: HTMLElement | null = el;
  
  while (current && current !== document.body) {
    let selector = current.tagName.toLowerCase();
    if (current.id) {
      selector += `#${current.id}`;
    } else {
      const className = getClassName(current);
      if (!className) {
        path.unshift(selector);
        current = current.parentElement;
        continue;
      }
      const classes = className.split(' ').filter(c => c).slice(0, 2);
      if (classes.length > 0) {
        selector += `.${classes.join('.')}`;
      }
    }
    path.unshift(selector);
    current = current.parentElement;
  }
  
  return path.join(' > ');
}

function getClassName(el: Element): string {
  const className = (el as unknown as { className?: unknown }).className;
  if (typeof className === 'string') return className;
  if (className && typeof className === 'object') {
    return String((className as { baseVal?: string }).baseVal ?? '');
  }
  return '';
}

function getTextSnippet(el: HTMLElement): string {
  const text = el.textContent?.trim() || '';
  return text.length > 50 ? text.substring(0, 50) + '...' : text;
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
      el.closest('[data-gova-inspector-frame]') ||
      el.closest(`#${FRAMES_CONTAINER_ID}`) ||
      el.closest(`#${HOVER_HIGHLIGHT_ID}`) ||
      el.id === HIGHLIGHT_ID ||
      el.id === HOVER_HIGHLIGHT_ID
    ) {
      continue;
    }

    // First, try to find a UUID-backed element
    const uiElement = el.closest('[data-ui-uuid]') as HTMLElement | null;
    if (uiElement) {
      const uuid = uiElement.getAttribute('data-ui-uuid');
      if (uuid && uuid in UI_UUID_MAP && uuid !== DECORATIVE_SPACER_UUID) {
        return uiElement;
      }
    }

    // If no UUID-backed element found, return the first visible intrinsic element
    // This allows picking elements without UUID for later registration
    if (el.tagName && el.tagName !== 'HTML' && el.tagName !== 'BODY') {
      return el;
    }
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

function frameStyles(kind: FrameCandidate['kind']): { border: string; background: string } {
  switch (kind) {
    case 'database':
      return {
        border: '2px solid var(--gova-component-dev-ui-green-border, #16a34a)',
        background: 'rgba(22, 163, 74, 0.08)',
      };
    case 'storage':
      return {
        border: '2px solid var(--gova-component-dev-ui-orange-border, #ea580c)',
        background: 'rgba(234, 88, 12, 0.08)',
      };
    case 'linked':
      return {
        border: '2px solid var(--gova-component-dev-ui-purple-border, #9333ea)',
        background: 'rgba(147, 51, 234, 0.08)',
      };
    case 'mixed':
      return {
        border: '3px double var(--gova-component-dev-ui-teal-border, #0d9488)',
        background: 'rgba(13, 148, 136, 0.08)',
      };
    default:
      return { border: '1px dashed #999', background: 'transparent' };
  }
}

function ensureFramesContainer(): HTMLElement {
  let container = document.getElementById(FRAMES_CONTAINER_ID);
  if (!container) {
    container = document.createElement('div');
    container.id = FRAMES_CONTAINER_ID;
    Object.assign(container.style, {
      position: 'fixed',
      inset: '0',
      pointerEvents: 'none',
      zIndex: '2147483644',
    });
    document.body.appendChild(container);
  }
  return container;
}

function drawBindingFrame(el: HTMLElement, candidate: FrameCandidate): void {
  const rect = el.getBoundingClientRect();
  const styles = frameStyles(candidate.kind);
  const frame = document.createElement('div');
  frame.setAttribute('data-gova-inspector-frame', 'true');
  frame.setAttribute('data-frame-scan-key', candidate.scanKey);
  frame.setAttribute('data-frame-kind', candidate.kind);

  const label = document.createElement('span');
  label.textContent = candidate.label;
  Object.assign(label.style, {
    position: 'absolute',
    top: '-14px',
    left: '0',
    fontSize: '10px',
    lineHeight: '12px',
    padding: '0 4px',
    background: 'rgba(15, 23, 42, 0.85)',
    color: '#fff',
    borderRadius: '2px',
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
  });

  Object.assign(frame.style, {
    position: 'fixed',
    top: `${rect.top}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    border: styles.border,
    background: styles.background,
    pointerEvents: 'none',
    boxSizing: 'border-box',
  });

  frame.appendChild(label);
  ensureFramesContainer().appendChild(frame);
}

export function renderInspectableBindingFrames(candidates: FrameCandidate[]): void {
  bindingFrameCandidates = candidates;
  clearInspectableBindingFrames();
  for (const candidate of candidates) {
    const el = getInspectableElement(candidate.scanKey);
    if (!el) continue;
    drawBindingFrame(el, candidate);
  }
}

export function clearInspectableBindingFrames(): void {
  document.getElementById(FRAMES_CONTAINER_ID)?.remove();
}

export function repositionInspectableBindingFrames(): void {
  if (!bindingFrameCandidates.length) return;
  renderInspectableBindingFrames(bindingFrameCandidates);
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
    repositionInspectableBindingFrames();
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
