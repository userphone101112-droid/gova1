/** postMessage contract between /devtools/ui-inspector and inspected iframe pages. */

export const UI_INSPECTOR_CHANNEL = 'gova-ui-inspector' as const;

export interface InspectElementSnapshot {
  /** Stable key for this DOM occurrence within a scan (unique even when uuid repeats). */
  scanKey: string;
  uuid: string;
  tagName: string;
  id: string;
  path: string;
  feature: string;
  lifecycle: string;
  instanceId: string | null;
  identityKey: string | null;
  rect: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  sourceFile: string;
  sourceComponent: string;
  sourceLine: number;
  hasSource: boolean;
}

export type UiInspectorParentMessage =
  | { channel: typeof UI_INSPECTOR_CHANNEL; type: 'REQUEST_SCAN' }
  | { channel: typeof UI_INSPECTOR_CHANNEL; type: 'HIGHLIGHT'; scanKey: string }
  | { channel: typeof UI_INSPECTOR_CHANNEL; type: 'SCROLL'; scanKey: string }
  | { channel: typeof UI_INSPECTOR_CHANNEL; type: 'CLEAR_HIGHLIGHT' }
  | { channel: typeof UI_INSPECTOR_CHANNEL; type: 'SET_PICK_MODE'; enabled: boolean };

export type UiInspectorFrameMessage =
  | { channel: typeof UI_INSPECTOR_CHANNEL; type: 'READY' }
  | { channel: typeof UI_INSPECTOR_CHANNEL; type: 'SCAN_RESULT'; elements: InspectElementSnapshot[] }
  | { channel: typeof UI_INSPECTOR_CHANNEL; type: 'ELEMENT_PICKED'; scanKey: string };

export function isUiInspectorParentMessage(data: unknown): data is UiInspectorParentMessage {
  if (!data || typeof data !== 'object') return false;
  const msg = data as Record<string, unknown>;
  return msg.channel === UI_INSPECTOR_CHANNEL && typeof msg.type === 'string';
}

export function isUiInspectorFrameMessage(data: unknown): data is UiInspectorFrameMessage {
  if (!data || typeof data !== 'object') return false;
  const msg = data as Record<string, unknown>;
  return msg.channel === UI_INSPECTOR_CHANNEL && typeof msg.type === 'string';
}

export function postToInspectorFrame(
  iframe: HTMLIFrameElement | null,
  message: UiInspectorParentMessage,
  targetOrigin: string
): void {
  iframe?.contentWindow?.postMessage(message, targetOrigin);
}
