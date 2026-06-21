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

export type FrameCandidateKind = 'database' | 'storage' | 'linked' | 'mixed';

export type FrameCandidateConfidence = 'confirmed' | 'high' | 'medium' | 'low';

export interface FrameCandidate {
  scanKey: string;
  identityKey: string;
  uuid: string;
  label: string;
  kind: FrameCandidateKind;
  confidence: FrameCandidateConfidence;
  reasons: string[];
}

export type UiInspectorParentMessage =
  | { channel: typeof UI_INSPECTOR_CHANNEL; type: 'REQUEST_SCAN' }
  | { channel: typeof UI_INSPECTOR_CHANNEL; type: 'HIGHLIGHT'; scanKey: string }
  | { channel: typeof UI_INSPECTOR_CHANNEL; type: 'SCROLL'; scanKey: string }
  | { channel: typeof UI_INSPECTOR_CHANNEL; type: 'CLEAR_HIGHLIGHT' }
  | { channel: typeof UI_INSPECTOR_CHANNEL; type: 'SET_PICK_MODE'; enabled: boolean }
  | {
      channel: typeof UI_INSPECTOR_CHANNEL;
      type: 'SET_BINDING_FRAMES';
      enabled: boolean;
      candidates: FrameCandidate[];
    }
  | { channel: typeof UI_INSPECTOR_CHANNEL; type: 'CLEAR_BINDING_FRAMES' }
  | { channel: typeof UI_INSPECTOR_CHANNEL; type: 'AUTOFILL_REGISTRATION' };

export type UiInspectorFrameMessage =
  | { channel: typeof UI_INSPECTOR_CHANNEL; type: 'READY' }
  | { channel: typeof UI_INSPECTOR_CHANNEL; type: 'SCAN_RESULT'; elements: InspectElementSnapshot[] }
  | { channel: typeof UI_INSPECTOR_CHANNEL; type: 'ELEMENT_PICKED'; scanKey: string };

export function isUiInspectorParentMessage(data: unknown): data is UiInspectorParentMessage {
  if (!data || typeof data !== 'object') return false;
  const msg = data as Record<string, unknown>;
  if (msg.channel !== UI_INSPECTOR_CHANNEL || typeof msg.type !== 'string') return false;
  switch (msg.type) {
    case 'REQUEST_SCAN':
    case 'CLEAR_HIGHLIGHT':
    case 'CLEAR_BINDING_FRAMES':
    case 'AUTOFILL_REGISTRATION':
      return true;
    case 'HIGHLIGHT':
    case 'SCROLL':
      return typeof msg.scanKey === 'string';
    case 'SET_PICK_MODE':
      return typeof msg.enabled === 'boolean';
    case 'SET_BINDING_FRAMES':
      return typeof msg.enabled === 'boolean' && Array.isArray(msg.candidates);
    default:
      return false;
  }
}

export function isUiInspectorFrameMessage(data: unknown): data is UiInspectorFrameMessage {
  if (!data || typeof data !== 'object') return false;
  const msg = data as Record<string, unknown>;
  if (msg.channel !== UI_INSPECTOR_CHANNEL || typeof msg.type !== 'string') return false;
  switch (msg.type) {
    case 'READY':
      return true;
    case 'SCAN_RESULT':
      return Array.isArray(msg.elements);
    case 'ELEMENT_PICKED':
      return typeof msg.scanKey === 'string';
    default:
      return false;
  }
}

export function postToInspectorFrame(
  iframe: HTMLIFrameElement | null,
  message: UiInspectorParentMessage,
  targetOrigin: string
): void {
  iframe?.contentWindow?.postMessage(message, targetOrigin);
}
