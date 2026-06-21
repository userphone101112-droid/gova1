'use client';

import { useEffect } from 'react';

import {
  bindInspectablePickHandlers,
  clearInspectableBindingFrames,
  clearInspectableHighlight,
  highlightInspectableElement,
  renderInspectableBindingFrames,
  repositionInspectableBindingFrames,
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
        case 'SET_BINDING_FRAMES':
          if (event.data.enabled) {
            renderInspectableBindingFrames(event.data.candidates);
          } else {
            clearInspectableBindingFrames();
          }
          break;
        case 'CLEAR_BINDING_FRAMES':
          clearInspectableBindingFrames();
          break;
        case 'AUTOFILL_REGISTRATION': {
          // Helper to fill an input and trigger React's onChange properly
          const fillInput = (element: HTMLInputElement, value: string) => {
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
              window.HTMLInputElement.prototype,
              'value'
            )?.set;
            if (nativeInputValueSetter) {
              nativeInputValueSetter.call(element, value);
            } else {
              element.value = value;
            }
            
            element.focus();
            
            const inputEvent = new Event('input', { bubbles: true });
            const changeEvent = new Event('change', { bubbles: true });
            
            element.dispatchEvent(inputEvent);
            element.dispatchEvent(changeEvent);
            
            element.blur();
          };
          
          // Helper to generate random valid Egyptian phone number
          const generateRandomPhone = () => {
            const prefixes = ['010', '011', '012', '015'];
            const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
            let randomSuffix = '';
            for (let i = 0; i < 8; i++) {
              randomSuffix += Math.floor(Math.random() * 10).toString();
            }
            return randomPrefix + randomSuffix;
          };
          
          // Helper to generate random valid password (at least 4 chars)
          const generateRandomPassword = () => {
            const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
            const length = Math.floor(Math.random() * 6) + 4; // 4-10 chars
            let password = '';
            for (let i = 0; i < length; i++) {
              password += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return password;
          };

          // Helper to generate random valid email
          const generateRandomEmail = () => {
            const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
            const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
            const usernameLength = Math.floor(Math.random() * 8) + 6; // 6-14 chars
            let username = '';
            for (let i = 0; i < usernameLength; i++) {
              username += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            const randomDomain = domains[Math.floor(Math.random() * domains.length)];
            return `${username}@${randomDomain}`;
          };

          const randomPhone = generateRandomPhone();
          const randomPassword = generateRandomPassword();
          const randomEmail = generateRandomEmail();
          
          // Fill phone input
          const phoneInput = document.querySelector('[data-ui-uuid="a1fed973-0ee2-517c-8c71-b511dc3a4a02"]') as HTMLInputElement;
          if (phoneInput) {
            fillInput(phoneInput, randomPhone);
          }
          
          // Wait for RHF validation then click verify
          setTimeout(() => {
            const verifyButton = document.querySelector('[data-ui-uuid="7598a99a-b039-526d-bd4e-f504b16dfe2f"]') as HTMLButtonElement;
            if (verifyButton && !verifyButton.disabled) {
              verifyButton.click();
            }
            
            // Wait for verification then fill password fields
            setTimeout(() => {
              const passwordInput = document.querySelector('[data-ui-uuid="44b2b3d2-8d19-5133-8732-c708bb730df1"]') as HTMLInputElement;
              if (passwordInput) {
                fillInput(passwordInput, randomPassword);
              }

              const confirmPasswordInput = document.querySelector('[data-ui-uuid="c8277664-0566-5611-b32a-97825b994e47"]') as HTMLInputElement;
              if (confirmPasswordInput) {
                fillInput(confirmPasswordInput, randomPassword);
              }

              // Fill email input (optional field)
              const emailInput = document.querySelector('[data-ui-uuid="7748b67f-a8ca-5024-abff-50cd06e17032"]') as HTMLInputElement;
              if (emailInput) {
                fillInput(emailInput, randomEmail);
              }
            }, 1500);
          }, 400);
          break;
        }
        default:
          break;
      }
    };

    const observer = new MutationObserver(() => scheduleScanResult());
    observer.observe(document.body, { subtree: true, childList: true, attributes: true });

    const onScrollOrResize = () => {
      repositionInspectableHighlight();
      repositionInspectableBindingFrames();
    };
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
      clearInspectableBindingFrames();
    };
  }, []);

  return null;
}
