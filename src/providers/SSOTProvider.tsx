'use client';

import { useLayoutEffect, useRef, type ReactNode } from 'react';
import {
  applySSOTSnapshot,
  initializeGlobalSSOT,
  syncDOMFromSSOT,
  useGlobalSSOTStore,
  type SSOTServerSnapshot,
} from '@/store/global-ssot.store';

export type { SSOTServerSnapshot };

interface SSOTProviderProps {
  snapshot: SSOTServerSnapshot;
  children: ReactNode;
}

/**
 * Seeds the client SSOT store from the server snapshot before hydration,
 * then rehydrates persisted preferences from localStorage.
 */
export function SSOTProvider({ snapshot, children }: SSOTProviderProps) {
  const seeded = useRef(false);

  if (!seeded.current) {
    seeded.current = true;
    applySSOTSnapshot(snapshot);
  }

  useLayoutEffect(() => {
    initializeGlobalSSOT();

    const onFinishHydration = () => {
      const state = useGlobalSSOTStore.getState();
      syncDOMFromSSOT(state.language, state.themeMode, state);
    };

    const unsub = useGlobalSSOTStore.persist.onFinishHydration(onFinishHydration);
    void useGlobalSSOTStore.persist.rehydrate();

    return unsub;
  }, []);

  return <>{children}</>;
}
