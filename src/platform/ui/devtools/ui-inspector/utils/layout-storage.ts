import type { ViewportSettings } from '../data/inspector-config.types';

import {
  DEFAULT_PREVIEW_HEIGHT,
  DEFAULT_PREVIEW_SCALE,
  DEFAULT_PREVIEW_WIDTH,
  DEFAULT_SIDEBAR_WIDTH,
  MIN_PANEL_SIZE,
  RESIZER_WIDTH,
} from './constants';
import { govaDbGetUiInspector, govaDbSetUiInspector } from '@/lib/gova-db';

export async function readSidebarWidth(): Promise<number> {
  const data = await govaDbGetUiInspector();
  const parsed = data.sidebarWidth;
  if (parsed == null || !Number.isFinite(parsed) || parsed <= 0) return DEFAULT_SIDEBAR_WIDTH;
  return parsed;
}

export function clampSidebarWidth(width: number, viewportWidth: number): number {
  const maxWidth = Math.max(MIN_PANEL_SIZE, viewportWidth - RESIZER_WIDTH - MIN_PANEL_SIZE);
  return Math.max(MIN_PANEL_SIZE, Math.min(maxWidth, width));
}

export async function persistSidebarWidth(width: number): Promise<void> {
  await govaDbSetUiInspector({ sidebarWidth: width });
}

export async function readPreviewSize(): Promise<ViewportSettings> {
  const data = await govaDbGetUiInspector();
  const saved = data.previewSize;
  if (!saved) {
    return {
      width: DEFAULT_PREVIEW_WIDTH,
      height: DEFAULT_PREVIEW_HEIGHT,
      scale: DEFAULT_PREVIEW_SCALE,
    };
  }
  return {
    width:
      typeof saved.width === 'number' && saved.width > 0
        ? saved.width
        : DEFAULT_PREVIEW_WIDTH,
    height:
      typeof saved.height === 'number' && saved.height > 0
        ? saved.height
        : DEFAULT_PREVIEW_HEIGHT,
    scale:
      typeof saved.scale === 'number' && saved.scale > 0
        ? saved.scale
        : DEFAULT_PREVIEW_SCALE,
  };
}

export async function persistPreviewSize(size: ViewportSettings): Promise<void> {
  await govaDbSetUiInspector({ previewSize: size });
}

export function clampPreviewDimension(value: number): number {
  if (!Number.isFinite(value)) return MIN_PANEL_SIZE;
  return Math.max(MIN_PANEL_SIZE, value);
}

export function clampPreviewScale(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_PREVIEW_SCALE;
  return Math.max(MIN_PANEL_SIZE / 100, value);
}

export async function readPickModeEnabled(): Promise<boolean> {
  const data = await govaDbGetUiInspector();
  return data.pickModeEnabled ?? true;
}

export async function persistPickModeEnabled(enabled: boolean): Promise<void> {
  await govaDbSetUiInspector({ pickModeEnabled: enabled });
}

export async function readFramesModeEnabled(): Promise<boolean> {
  const data = await govaDbGetUiInspector();
  return data.framesModeEnabled ?? false;
}

export async function persistFramesModeEnabled(enabled: boolean): Promise<void> {
  await govaDbSetUiInspector({ framesModeEnabled: enabled });
}
