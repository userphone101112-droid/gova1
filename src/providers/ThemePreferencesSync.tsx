'use client';

import { useEffect } from 'react';

import { useUnifiedStore, syncDOMFromStore } from '@/store/unified.store';

/**
 * Keeps `<html>` attributes in sync with unified store preferences.
 * Ensures Settings changes (theme, density, font size, a11y) apply app-wide.
 */
export function ThemePreferencesSync() {
  const language = useUnifiedStore((s) => s.language);
  const themeMode = useUnifiedStore((s) => s.themeMode);
  const fontSize = useUnifiedStore((s) => s.fontSize);
  const density = useUnifiedStore((s) => s.density);
  const highContrast = useUnifiedStore((s) => s.highContrast);
  const reducedMotion = useUnifiedStore((s) => s.reducedMotion);

  useEffect(() => {
    syncDOMFromStore({
      language,
      themeMode,
      fontSize,
      density,
      highContrast,
      reducedMotion,
    });
  }, [language, themeMode, fontSize, density, highContrast, reducedMotion]);

  return null;
}
