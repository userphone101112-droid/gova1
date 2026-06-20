import type { ViewportSettings } from '../data/inspector-config.types';

import {
  DEFAULT_PREVIEW_HEIGHT,
  DEFAULT_PREVIEW_SCALE,
  DEFAULT_PREVIEW_WIDTH,
  DEFAULT_SIDEBAR_WIDTH,
  MIN_PANEL_SIZE,
  PICK_MODE_KEY,
  PREVIEW_SIZE_KEY,
  RESIZER_WIDTH,
  SIDEBAR_WIDTH_KEY,
} from './constants';

export function readSidebarWidth(): number {
  if (typeof window === 'undefined') return DEFAULT_SIDEBAR_WIDTH;
  const saved = window.localStorage.getItem(SIDEBAR_WIDTH_KEY);
  const parsed = saved ? Number(saved) : DEFAULT_SIDEBAR_WIDTH;
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_SIDEBAR_WIDTH;
  return parsed;
}

export function clampSidebarWidth(width: number, viewportWidth: number): number {
  const maxWidth = Math.max(MIN_PANEL_SIZE, viewportWidth - RESIZER_WIDTH - MIN_PANEL_SIZE);
  return Math.max(MIN_PANEL_SIZE, Math.min(maxWidth, width));
}

export function persistSidebarWidth(width: number): void {
  window.localStorage.setItem(SIDEBAR_WIDTH_KEY, String(width));
}

export function readPreviewSize(): ViewportSettings {
  if (typeof window === 'undefined') {
    return {
      width: DEFAULT_PREVIEW_WIDTH,
      height: DEFAULT_PREVIEW_HEIGHT,
      scale: DEFAULT_PREVIEW_SCALE,
    };
  }
  try {
    const saved = window.localStorage.getItem(PREVIEW_SIZE_KEY);
    if (!saved) {
      return {
        width: DEFAULT_PREVIEW_WIDTH,
        height: DEFAULT_PREVIEW_HEIGHT,
        scale: DEFAULT_PREVIEW_SCALE,
      };
    }
    const parsed = JSON.parse(saved) as Partial<ViewportSettings>;
    return {
      width:
        typeof parsed.width === 'number' && parsed.width > 0
          ? parsed.width
          : DEFAULT_PREVIEW_WIDTH,
      height:
        typeof parsed.height === 'number' && parsed.height > 0
          ? parsed.height
          : DEFAULT_PREVIEW_HEIGHT,
      scale:
        typeof parsed.scale === 'number' && parsed.scale > 0
          ? parsed.scale
          : DEFAULT_PREVIEW_SCALE,
    };
  } catch {
    return {
      width: DEFAULT_PREVIEW_WIDTH,
      height: DEFAULT_PREVIEW_HEIGHT,
      scale: DEFAULT_PREVIEW_SCALE,
    };
  }
}

export function persistPreviewSize(size: ViewportSettings): void {
  window.localStorage.setItem(PREVIEW_SIZE_KEY, JSON.stringify(size));
}

export function clampPreviewDimension(value: number): number {
  if (!Number.isFinite(value)) return MIN_PANEL_SIZE;
  return Math.max(MIN_PANEL_SIZE, value);
}

export function clampPreviewScale(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_PREVIEW_SCALE;
  return Math.max(MIN_PANEL_SIZE / 100, value);
}

export function readPickModeEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  const saved = window.localStorage.getItem(PICK_MODE_KEY);
  return saved === null ? true : saved === 'true';
}

export function persistPickModeEnabled(enabled: boolean): void {
  window.localStorage.setItem(PICK_MODE_KEY, String(enabled));
}
