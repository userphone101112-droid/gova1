'use client';

/**
 * MAOL — Provider Component
 *
 * Bootstraps all MAOL collectors when mounted.
 * Sends a DOM summary on every route change.
 *
 * Lifecycle:
 *  mount   → get/create sessionId → init error + warning collectors
 *  route Δ → generate DOM summary → POST to /api/maol/ingest
 *  unmount → cleanup all interceptors
 *
 * Opt-in: only active if NEXT_PUBLIC_MAOL_ENABLED === 'true'
 * Never renders any UI — transparent wrapper.
 */

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { getMaolSessionId } from '@/shared/maol/session';
import { initMaolErrorCollector, initMaolWarningCollector } from '@/shared/maol/client-collector';
import { generateDomSummary } from '@/shared/maol/dom-summary';
import type { MaolIngestPayload } from '@/shared/maol/types';

const INGEST_URL = '/api/maol/ingest';
const IS_ENABLED = process.env.NEXT_PUBLIC_MAOL_ENABLED === 'true';

function sendDomSummary(sessionId: string, route: string): void {
  // Slight delay to allow the new route's DOM to render
  setTimeout(() => {
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
        }).catch(() => {});
      }
    } catch {
      // Intentionally silent — observability must never crash the app
    }
  }, 300);
}

export function MaolProvider() {
  const pathname = usePathname();
  const sessionIdRef = useRef<string | null>(null);
  const cleanupRef = useRef<(() => void)[]>([]);

  // Initialize collectors on mount
  useEffect(() => {
    if (!IS_ENABLED) return;

    const sessionId = getMaolSessionId();
    sessionIdRef.current = sessionId;

    const cleanupError = initMaolErrorCollector(sessionId);
    const cleanupWarning = initMaolWarningCollector(sessionId);

    cleanupRef.current = [cleanupError, cleanupWarning];

    // Send initial DOM summary for the first route
    sendDomSummary(sessionId, window.location.pathname);

    return () => {
      cleanupRef.current.forEach((fn) => fn());
      cleanupRef.current = [];
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Send DOM summary on every route change
  useEffect(() => {
    if (!IS_ENABLED) return;
    if (!sessionIdRef.current) return;
    sendDomSummary(sessionIdRef.current, pathname);
  }, [pathname]);

  // No UI rendered — purely behavioral
  return null;
}
