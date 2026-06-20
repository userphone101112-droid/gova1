'use client';

import { useEffect } from 'react';

import {
  bindInspectablePickHandlers,
  clearInspectableHighlight,
  highlightInspectableElement,
  repositionInspectableHighlight,
  scanInspectableElements,
  scrollToInspectableElement,
  setInspectablePickMode,
} from './inspect-collector-utils';
import {
  UI_INSPECTOR_CHANNEL,
  isUiInspectorParentMessage,
  type UiInspectorFrameMessage,
} from './UiInspectorFrameBridge';

function postFrameMessage(message: UiInspectorFrameMessage): void {
  if (window.parent === window) return;
  window.parent.postMessage(message, window.location.origin);
}

let scanDebounceTimer = 0;

function sendScanResult(): void {
  postFrameMessage({
    channel: UI_INSPECTOR_CHANNEL,
    type: 'SCAN_RESULT',
    elements: scanInspectableElements(),
  });
}

function scheduleScanResult(): void {
  window.clearTimeout(scanDebounceTimer);
  scanDebounceTimer = window.setTimeout(sendScanResult, 150);
}

/**
 * Invisible inspect bridge — active only when `?inspect=1` is present.
 * No visible DOM is rendered inside the target page.
 */
export function InspectCollectorBridge() {
  useEffect(() => {
    if (window.parent === window) return;

    postFrameMessage({ channel: UI_INSPECTOR_CHANNEL, type: 'READY' });
    sendScanResult();

    const unbindPick = bindInspectablePickHandlers((scanKey) => {
      postFrameMessage({
        channel: UI_INSPECTOR_CHANNEL,
        type: 'ELEMENT_PICKED',
        scanKey,
      });
    });

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (!isUiInspectorParentMessage(event.data)) return;

      switch (event.data.type) {
        case 'REQUEST_SCAN':
          sendScanResult();
          break;
        case 'HIGHLIGHT':
          highlightInspectableElement(event.data.scanKey);
          break;
        case 'SCROLL':
          scrollToInspectableElement(event.data.scanKey);
          break;
        case 'CLEAR_HIGHLIGHT':
          clearInspectableHighlight();
          break;
        case 'SET_PICK_MODE':
          setInspectablePickMode(event.data.enabled);
          break;
        default:
          break;
      }
    };

    const observer = new MutationObserver(() => scheduleScanResult());
    observer.observe(document.body, { subtree: true, childList: true, attributes: true });

    const onScrollOrResize = () => repositionInspectableHighlight();
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);

    window.addEventListener('message', onMessage);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
      window.removeEventListener('message', onMessage);
      unbindPick();
      clearInspectableHighlight();
    };
  }, []);

  return null;
}
