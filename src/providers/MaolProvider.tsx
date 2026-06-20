'use client';

/**
 * MAOL (Minimal Agent Observability Layer) — Provider Component
 *
 * ✅ MAOL IS ALWAYS ENABLED IN DEVELOPMENT MODE!
 * ✅ No configuration or env vars required to start using MAOL locally!
 * ✅ Automatically records data every 3 seconds!
 *
 * Bootstraps all MAOL collectors when mounted:
 * - Error capture (window.onerror, unhandledrejection)
 * - Console warnings capture
 * - DOM summary capture (every 3 seconds, auto-sent via sendBeacon)
 *
 * Features:
 * - Toggle MAOL ON/OFF via UI Inspector control (default ON)
 * - All data saved to JSON files:
 *    → errors/warnings in `error-data/maol-data.json`
 *    → DOM summaries in `data/maol-dom-data.json`
 * - Session data retrievable via GET /api/maol/session/:sessionId (no secret needed in dev mode!)
 *
 * @see docs/SERVER_ARCHITECTURE.md for complete docs
 */

import { useEffect, useRef } from 'react';

import {
  initMaolErrorCollector,
  initMaolWarningCollector,
  setMaolEnabledGetter,
} from '@/shared/maol/client-collector';
import { generateDomSummary } from '@/shared/maol/dom-summary';
import { getMaolSessionId } from '@/shared/maol/session';
import type { MaolIngestPayload } from '@/shared/maol/types';
import { useMaolStore } from '@/store/index';

const INGEST_URL = '/api/maol/ingest';

// ------------------------------
// AUTO-ENABLE MAOL IN DEV MODE
// ------------------------------
// In development mode, MAOL is always ON by default
const IS_DEV_MODE = process.env.NODE_ENV === 'development';
const IS_ENABLED_ENV = IS_DEV_MODE ? true : (process.env.NEXT_PUBLIC_MAOL_ENABLED === 'true');

/**
 * Helper: Send DOM Summary to MAOL Ingest API
 * Uses sendBeacon for non-blocking, fire-and-forget to avoid blocking the user
 *
 * @param sessionId - MAOL session identifier
 * @param route - Current app route
 * @param isEnabled - Whether MAOL is currently toggled ON
 */
function sendDomSummary(sessionId: string, route: string, isEnabled: boolean): void {
  if (!isEnabled) return;

  try {
    const summary = generateDomSummary(route);
    const payload: MaolIngestPayload = { sessionId, dom: summary };
    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });

    if (navigator.sendBeacon) {
      navigator.sendBeacon(INGEST_URL, blob);
    } else {
      fetch(INGEST_URL, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
      }).catch(() => {
        // Ignore failures; observability must never interfere with app functionality
      });
    }
  } catch {
    // Intentionally silent; observability must never cause app crashes
  }
}

export function MaolProvider() {
  const sessionIdRef = useRef<string | null>(null);
  const cleanupRef = useRef<(() => void)[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMaolEnabled = useMaolStore((state) => state.isEnabled);

  // Pass the current MAOL enabled state to the client collectors
  useEffect(() => {
    setMaolEnabledGetter(() => isMaolEnabled);
  }, [isMaolEnabled]);

  // Initialize collectors and auto-send interval
  useEffect(() => {
    // Always skip in production unless explicitly enabled
    if (!IS_ENABLED_ENV) return;

    const sessionId = getMaolSessionId();
    sessionIdRef.current = sessionId;

    // Clean up existing collectors/intervals
    const cleanupCollectors = () => {
      cleanupRef.current.forEach((cleanupFn) => cleanupFn());
      cleanupRef.current = [];
    };

    const stopAutoSend = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    if (isMaolEnabled) {
      // Initialize error and warning interceptors
      const cleanupError = initMaolErrorCollector(sessionId);
      const cleanupWarning = initMaolWarningCollector(sessionId);
      cleanupRef.current = [cleanupError, cleanupWarning];

      // ------------------------------
      // AUTO-SEND EVERY 3 SECONDS!
      // ------------------------------
      intervalRef.current = setInterval(() => {
        if (sessionIdRef.current) {
          sendDomSummary(
            sessionIdRef.current,
            window.location.pathname,
            isMaolEnabled
          );
        }
      }, 3000);
    } else {
      cleanupCollectors();
      stopAutoSend();
    }

    return () => {
      cleanupCollectors();
      stopAutoSend();
    };
  }, [isMaolEnabled]);

  return null; // No UI rendered by MAOL
}
