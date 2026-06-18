
'use client';

import { useEffect } from 'react';
import { useUnifiedStore } from '@/store/unified.store';

// Forbidden patterns that violate our SSOT rules don't allow!
const FORBIDDEN_CLASS_PATTERNS = [
  /\bml-/g,
  /\bmr-/g,
  /\btext-left\b/g,
  /\btext-right\b/g,
  /\bleft-/g,
  /\bright-/g,
  /-\[.*?\]/g, // Tailwind arbitrary values (e.g., p-[2px
];

const FORBIDDEN_INLINE_STYLE_KEYS = ['left', 'right', 'marginLeft', 'marginRight'];

export function SSOTGuard() {
  const ssotGuardEnabled = useUnifiedStore((state) => state.ssotGuardEnabled);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    if (!ssotGuardEnabled) return;

    let lastCheck = Date.now();

    const checkForViolations = () => {
      const now = Date.now();
      if (now - lastCheck < 1000) return; // Throttle checks to once per second
      lastCheck = now;

      // Check all elements
      const allElements = document.querySelectorAll('*');
      allElements.forEach(el => {
        // 1. Check inline styles
        if (el.hasAttribute('style')) {
          if (el.getAttribute('style')?.includes('#') ||
              FORBIDDEN_INLINE_STYLE_KEYS.some(key => 
                el instanceof HTMLElement && 
                (el as HTMLElement).style[key as any]
              )
          ) {
            console.warn(
              '[SSOT Guard] Inline styles are NOT allowed! Use Tailwind classes from design tokens instead.',
              el
            );
          }
        }

        // 2. Check for dir attribute on elements that are not html
        if (el.tagName.toLowerCase() !== 'html' && el.hasAttribute('dir')) {
          console.warn(
              '[SSOT Guard] dir attribute is ONLY allowed on <html> root element!',
              el
          );
        }

        // 3. Check forbidden class list for forbidden patterns
        const classList = Array.from(el.classList);
        classList.forEach(cls => {
          FORBIDDEN_CLASS_PATTERNS.forEach(pattern => {
            if (pattern.test(cls)) {
              console.warn(
              `[SSOT Guard] Forbidden class pattern detected: "${cls}"`,
              el
            );
            }
          });
        });

        // 4. Check for direct left/right in computed styles
        try {
          if (el instanceof HTMLElement) {
            const computedStyle = getComputedStyle(el);
            if (computedStyle.left !== 'auto' || computedStyle.right !== 'auto') {
              // Skip if it's the root elements that needs it (but log it's allowed
            }
          }
        } catch (e) {
          // ignore
        }
      });
    };

    // Initial check
    checkForViolations();

    // Observe DOM changes
    const observer = new MutationObserver(checkForViolations);
    observer.observe(document, { childList: true, subtree: true, attributes: true });

    // Cleanup
    return () => observer.disconnect();
  }, []);

  return null;
}
