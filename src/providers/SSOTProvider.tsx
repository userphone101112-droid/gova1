'use client';

import { useLayoutEffect, useRef, type ReactNode } from 'react';

import {
  initializeUnifiedStore,
  syncDOMFromStore,
  useUnifiedStore,
} from '@/store/unified.store';

interface UnifiedProviderProps {
  snapshot: {
    language: 'en' | 'ar';
    themeMode: 'light' | 'dark' | 'system';
    fontSize: number;
    density: 'compact' | 'comfortable' | 'spacious';
    highContrast: boolean;
    reducedMotion: boolean;
  };
  children: ReactNode;
}

/**
 * Seeds the client unified store from the server snapshot before hydration,
 * then rehydrates persisted preferences from localStorage.
 */
export function SSOTProvider({ snapshot, children }: UnifiedProviderProps) {
  const seeded = useRef(false);

  if (!seeded.current) {
    seeded.current = true;
    // Apply snapshot to store
    useUnifiedStore.setState({
      language: snapshot.language,
      themeMode: snapshot.themeMode,
      fontSize: snapshot.fontSize,
      density: snapshot.density,
      highContrast: snapshot.highContrast,
      reducedMotion: snapshot.reducedMotion,
      direction: snapshot.language === 'ar' ? 'rtl' : 'ltr',
    });
  }

  useLayoutEffect(() => {
    initializeUnifiedStore();

    const onFinishHydration = () => {
      const state = useUnifiedStore.getState();
      syncDOMFromStore(state);
    };

    const unsub = useUnifiedStore.persist.onFinishHydration(onFinishHydration);
    void useUnifiedStore.persist.rehydrate();

    return unsub;
  }, []);

  return <>{children}</>;
}
