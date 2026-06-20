'use client';

import dynamic from 'next/dynamic';
import { useSyncExternalStore } from 'react';

import { isInspectMode } from './inspector-routes';

const InspectCollectorBridge = dynamic(
  () => import('./UiInspectCollector').then((mod) => mod.InspectCollectorBridge),
  { ssr: false }
);

function subscribeInspectMode(onStoreChange: () => void): () => void {
  if (typeof window === 'undefined') return () => undefined;
  window.addEventListener('popstate', onStoreChange);
  return () => window.removeEventListener('popstate', onStoreChange);
}

function getInspectModeSnapshot(): boolean {
  if (typeof window === 'undefined') return false;
  return isInspectMode(window.location.search);
}

function getInspectModeServerSnapshot(): boolean {
  return false;
}

/** Loads the invisible inspect collector when `?inspect=1` is in the URL. */
export function InspectCollectorLoader() {
  const inspectMode = useSyncExternalStore(
    subscribeInspectMode,
    getInspectModeSnapshot,
    getInspectModeServerSnapshot
  );

  if (!inspectMode) return null;
  return <InspectCollectorBridge />;
}
