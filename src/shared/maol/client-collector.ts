/**
 * MAOL — Client-Side Collectors
 *
 * Captures runtime errors and console.warn calls in the browser.
 * Sends events to /api/maol/ingest via navigator.sendBeacon (non-blocking).
 *
 * Safety guarantees:
 *  - No keystrokes captured
 *  - No form values captured
 *  - No PII extracted
 *  - Only message + stack + route + nearest UI identity
 *
 * DEV mode: full detail, component info, stack traces
 * PROD mode: message + route + uiContext only (no stack)
 */

import type {
  MaolErrorEvent,
  MaolWarningEvent,
  MaolIngestPayload,
  MaolWarningSeverity,
} from './types';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

const INGEST_URL = '/api/maol/ingest';
const IS_DEV = process.env.NODE_ENV === 'development';
let isMaolEnabledGetter: (() => boolean) = () => true;

export function setMaolEnabledGetter(getter: () => boolean) {
  isMaolEnabledGetter = getter;
}

function sanitizeMessage(msg: string): string {
  // Remove %c and all CSS styles from console.warn messages
  let cleaned = msg;
  
  // Remove %c tokens
  cleaned = cleaned.replace(/%c/g, '');
  
  // Remove CSS style strings (look for "background:" or "color:" patterns)
  // Split by whitespace and remove any CSS property/value pairs
  cleaned = cleaned.replace(/background:[^;]+;?/gi, '');
  cleaned = cleaned.replace(/color:[^;]+;?/gi, '');
  cleaned = cleaned.replace(/border-radius:[^;]+;?/gi, '');
  cleaned = cleaned.replace(/\s{2,}/g, ' ');
  
  // Trim whitespace and remove extra leading/trailing spaces
  cleaned = cleaned.trim();
  
  return cleaned;
}

function getCurrentRoute(): string {
  if (typeof window === 'undefined') return '/';
  return window.location.pathname;
}

/**
 * Walk up the DOM from the event target to find the nearest [data-ui-id].
 * Returns the ID string or undefined.
 */
function resolveUiContext(target: EventTarget | null): string | undefined {
  if (!target || !(target instanceof Element)) return undefined;
  let el: Element | null = target;
  while (el) {
    const id = el.getAttribute('data-ui-id');
    if (id) return id;
    el = el.parentElement;
  }
  return undefined;
}

/**
 * Send a payload to the ingest endpoint via sendBeacon (fire-and-forget).
 * Falls back to fetch if sendBeacon is unavailable.
 */
function sendPayload(payload: MaolIngestPayload): void {
  if (!isMaolEnabledGetter()) return;
  try {
    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(INGEST_URL, blob);
    } else {
      // Fallback: non-blocking fetch
      fetch(INGEST_URL, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
      }).catch(() => {
        // Intentionally silent — observability must never crash the app
      });
    }
  } catch {
    // Intentionally silent
  }
}

// ---------------------------------------------------------------------------
// Error Collector
// ---------------------------------------------------------------------------

let _errorHandlerInstalled = false;
let _rejectionHandlerInstalled = false;

/**
 * Initialize the global error collector.
 * Hooks window.error and unhandledrejection events.
 * Returns a cleanup function.
 */
export function initMaolErrorCollector(sessionId: string): () => void {
  if (typeof window === 'undefined') return () => {};

  const env = IS_DEV ? 'dev' : 'prod';

  const onError = (event: ErrorEvent) => {
    if (!isMaolEnabledGetter()) return;
    try {
      const error: MaolErrorEvent = {
        type: 'error',
        message: sanitizeMessage(event.message || 'Unknown error'),
        // Stack only in dev mode
        stack: IS_DEV ? event.error?.stack : undefined,
        route: getCurrentRoute(),
        timestamp: Date.now(),
        uiContext: resolveUiContext(event.target),
        env,
      };
      sendPayload({ sessionId, events: [error] });
    } catch {
      // Intentionally silent
    }
  };

  const onUnhandledRejection = (event: PromiseRejectionEvent) => {
    if (!isMaolEnabledGetter()) return;
    try {
      const reason = event.reason;
      const message =
        reason instanceof Error
          ? sanitizeMessage(reason.message)
          : typeof reason === 'string'
          ? sanitizeMessage(reason)
          : 'Unhandled Promise Rejection';

      const error: MaolErrorEvent = {
        type: 'error',
        message,
        stack: IS_DEV && reason instanceof Error ? reason.stack : undefined,
        route: getCurrentRoute(),
        timestamp: Date.now(),
        uiContext: undefined,
        env,
      };
      sendPayload({ sessionId, events: [error] });
    } catch {
      // Intentionally silent
    }
  };

  if (!_errorHandlerInstalled) {
    window.addEventListener('error', onError);
    _errorHandlerInstalled = true;
  }

  if (!_rejectionHandlerInstalled) {
    window.addEventListener('unhandledrejection', onUnhandledRejection);
    _rejectionHandlerInstalled = true;
  }

  return () => {
    window.removeEventListener('error', onError);
    window.removeEventListener('unhandledrejection', onUnhandledRejection);
    _errorHandlerInstalled = false;
    _rejectionHandlerInstalled = false;
  };
}

// ---------------------------------------------------------------------------
// Warning Collector
// ---------------------------------------------------------------------------

let _originalConsoleWarn: typeof console.warn | null = null;

/**
 * Severity detection rules:
 * - [UI Registry Deprecation] / [UI Registry Error] → high
 * - [MAOL] prefix → medium
 * - all others → low
 *
 * In PROD mode, only high/medium severity warnings are forwarded.
 */
function detectSeverity(message: string): MaolWarningSeverity {
  if (
    message.includes('[UI Registry Deprecation]') ||
    message.includes('[UI Registry Error]') ||
    message.includes('[MAOL] HIGH')
  ) {
    return 'high';
  }
  if (message.includes('[MAOL]')) {
    return 'medium';
  }
  return 'low';
}

/**
 * Try to extract a component name from the warning message.
 * Looks for patterns like "Component: SomeName" or "in SomeName".
 */
function extractComponent(message: string): string | undefined {
  const match =
    message.match(/Component:\s+([A-Za-z0-9_]+)/) ||
    message.match(/\bin\s+([A-Z][A-Za-z0-9_]+)/);
  return match?.[1];
}

/**
 * Initialize the console.warn interceptor.
 * Returns a cleanup function that restores the original console.warn.
 */
export function initMaolWarningCollector(sessionId: string): () => void {
  if (typeof window === 'undefined' || _originalConsoleWarn !== null) return () => {};

  const env = IS_DEV ? 'dev' : 'prod';
  _originalConsoleWarn = console.warn;

  console.warn = (...args: unknown[]) => {
    // Always call original first — preserves dev experience
    _originalConsoleWarn!(...args);

    if (!isMaolEnabledGetter()) return;

    try {
      const message = args
        .map((a) => (typeof a === 'string' ? a : JSON.stringify(a)))
        .join(' ');

      const sanitizedMsg = sanitizeMessage(message);
      const severity = detectSeverity(sanitizedMsg);

      // PROD mode: only forward high/medium severity to reduce noise
      if (!IS_DEV && severity === 'low') return;

      const warning: MaolWarningEvent = {
        type: 'warning',
        message: sanitizedMsg.substring(0, 500), // cap at 500 chars
        route: getCurrentRoute(),
        component: IS_DEV ? extractComponent(sanitizedMsg) : undefined,
        severity,
        timestamp: Date.now(),
        env,
      };

      sendPayload({ sessionId, events: [warning] });
    } catch {
      // Intentionally silent
    }
  };

  return () => {
    if (_originalConsoleWarn !== null) {
      console.warn = _originalConsoleWarn;
      _originalConsoleWarn = null;
    }
  };
}
