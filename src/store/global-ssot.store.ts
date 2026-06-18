/**
 * Global Application State - Single Source of Truth (SSOT)
 * Controls language, direction, and theme mode with automatic synchronization
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// --- Types ---

export type Language = 'en' | 'ar';
export type Direction = 'ltr' | 'rtl';
export type ThemeMode = 'light' | 'dark' | 'system';
export type Density = 'compact' | 'comfortable' | 'spacious';

export interface SSOTServerSnapshot {
  language: Language;
  themeMode: ThemeMode;
  fontSize: number;
  density: Density;
  highContrast: boolean;
  reducedMotion: boolean;
}

interface GlobalSSOTState {
  language: Language;
  direction: Direction;
  themeMode: ThemeMode;
  fontSize: number;
  density: Density;
  highContrast: boolean;
  reducedMotion: boolean;

  setLanguage: (lang: Language) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setFontSize: (size: number) => void;
  setDensity: (density: Density) => void;
  setHighContrast: (enabled: boolean) => void;
  setReducedMotion: (enabled: boolean) => void;
  resetPreferences: () => void;
}

const DEFAULT_PREFERENCES = {
  language: 'en' as Language,
  themeMode: 'system' as ThemeMode,
  fontSize: 16,
  density: 'comfortable' as Density,
  highContrast: false,
  reducedMotion: false,
};

// --- Helper Functions ---

function getDirectionForLanguage(lang: Language): Direction {
  return lang === 'ar' ? 'rtl' : 'ltr';
}

function getSystemThemePreference(): 'light' | 'dark' {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light'; // Fallback
}

/**
 * Synchronizes the <html> element attributes from the SSOT store
 * Applies:
 * - lang
 * - dir
 * - data-theme
 * - CSS classes
 */
export function syncDOMFromSSOT(
  language: Language,
  themeMode: ThemeMode,
  preferences?: Pick<GlobalSSOTState, 'fontSize' | 'density' | 'highContrast' | 'reducedMotion'>
) {
  if (typeof window === 'undefined') return;

  const html = document.documentElement;
  const direction = getDirectionForLanguage(language);
  const effectiveTheme = themeMode === 'system' ? getSystemThemePreference() : themeMode;
  const fontSize = preferences?.fontSize ?? useGlobalSSOTStore.getState().fontSize;
  const density = preferences?.density ?? useGlobalSSOTStore.getState().density;
  const highContrast = preferences?.highContrast ?? useGlobalSSOTStore.getState().highContrast;
  const reducedMotion = preferences?.reducedMotion ?? useGlobalSSOTStore.getState().reducedMotion;

  html.setAttribute('lang', language);
  html.setAttribute('dir', direction);
  html.classList.remove('light', 'dark');
  html.classList.add(effectiveTheme);
  html.setAttribute('data-theme', effectiveTheme);
  html.style.fontSize = `${fontSize}px`;
  html.setAttribute('data-density', density);
  html.classList.toggle('high-contrast', highContrast);
  html.classList.toggle('reduce-motion', reducedMotion);
}

function persistSSOTCookie(state: Pick<GlobalSSOTState, 'language' | 'themeMode' | 'fontSize' | 'density' | 'highContrast' | 'reducedMotion'>) {
  if (typeof window === 'undefined') return;
  const payload = JSON.stringify({
    language: state.language,
    themeMode: state.themeMode,
    fontSize: state.fontSize,
    density: state.density,
    highContrast: state.highContrast,
    reducedMotion: state.reducedMotion,
  });
  document.cookie = `gova-global-ssot=${encodeURIComponent(payload)}; path=/; max-age=31536000`;
  document.cookie = `locale=${state.language}; path=/; max-age=31536000`;
}

let systemThemeMediaQuery: MediaQueryList | null = null;
let systemThemeChangeListener: ((e: MediaQueryListEvent) => void) | null = null;

/**
 * Initializes the global SSOT system:
 * - Hydrates from storage
 * - Sets up OS theme change listeners
 * - Performs initial DOM sync
 */
export function initializeGlobalSSOT() {
  if (typeof window === 'undefined') return;

  // 1. Initial sync will happen when store initializes
  // 2. Set up system theme change listener
  if (systemThemeMediaQuery) {
    systemThemeMediaQuery.removeEventListener('change', systemThemeChangeListener!);
  }

  systemThemeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  systemThemeChangeListener = () => {
    // If in system mode, re-sync DOM using current store state
    const state = useGlobalSSOTStore.getState();
    if (state.themeMode === 'system') {
      syncDOMFromSSOT(state.language, state.themeMode);
    }
  };
  systemThemeMediaQuery.addEventListener('change', systemThemeChangeListener);
}

function buildStateFromSnapshot(snapshot: SSOTServerSnapshot): Pick<
  GlobalSSOTState,
  'language' | 'direction' | 'themeMode' | 'fontSize' | 'density' | 'highContrast' | 'reducedMotion'
> {
  return {
    language: snapshot.language,
    direction: getDirectionForLanguage(snapshot.language),
    themeMode: snapshot.themeMode,
    fontSize: snapshot.fontSize,
    density: snapshot.density,
    highContrast: snapshot.highContrast,
    reducedMotion: snapshot.reducedMotion,
  };
}

/** Apply server-rendered snapshot so SSR and first client render match. */
export function applySSOTSnapshot(snapshot: SSOTServerSnapshot) {
  useGlobalSSOTStore.setState(buildStateFromSnapshot(snapshot));
}

export const useGlobalSSOTStore = create<GlobalSSOTState>()(
  devtools(
    persist(
      (set, get) => {
        const syncAll = () => {
          const current = get();
          syncDOMFromSSOT(current.language, current.themeMode, current);
          persistSSOTCookie(current);
        };

        return {
          ...buildStateFromSnapshot({
            language: DEFAULT_PREFERENCES.language,
            themeMode: DEFAULT_PREFERENCES.themeMode,
            fontSize: DEFAULT_PREFERENCES.fontSize,
            density: DEFAULT_PREFERENCES.density,
            highContrast: DEFAULT_PREFERENCES.highContrast,
            reducedMotion: DEFAULT_PREFERENCES.reducedMotion,
          }),

          setLanguage: (lang: Language) => {
            set({ language: lang, direction: getDirectionForLanguage(lang) });
            syncAll();
          },

          setThemeMode: (mode: ThemeMode) => {
            set({ themeMode: mode });
            syncAll();
          },

          setFontSize: (size: number) => {
            set({ fontSize: size });
            syncAll();
          },

          setDensity: (density: Density) => {
            set({ density });
            syncAll();
          },

          setHighContrast: (enabled: boolean) => {
            set({ highContrast: enabled });
            syncAll();
          },

          setReducedMotion: (enabled: boolean) => {
            set({ reducedMotion: enabled });
            syncAll();
          },

          resetPreferences: () => {
            set({
              ...DEFAULT_PREFERENCES,
              direction: getDirectionForLanguage(DEFAULT_PREFERENCES.language),
            });
            syncAll();
          },
        };
      },
      {
        name: 'gova-global-ssot',
        skipHydration: true,
        partialize: (state) => ({
          language: state.language,
          themeMode: state.themeMode,
          fontSize: state.fontSize,
          density: state.density,
          highContrast: state.highContrast,
          reducedMotion: state.reducedMotion,
        }),
        onRehydrateStorage: () => (state) => {
          if (state) {
            state.direction = getDirectionForLanguage(state.language);
          }
        },
      }
    )
  )
);
