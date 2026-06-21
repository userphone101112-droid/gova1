/**
 * Unified Store
 * Single source of truth for all application settings and preferences
 * Combines settings.store and global-ssot.store into one unified store
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import { createGovaDbZustandStorage, GOVA_DB_STORES } from '@/lib/gova-db';

import { DEFAULT_SETTINGS } from '../../config/default-settings';
import { FEATURE_FLAGS } from '../../config/feature-flags';
import { AppSettings, FeatureFlags, PartialSettings, FeatureFlagKey } from '../../config/settings.schema';

// --- Types ---

export type Language = 'en' | 'ar';
export type Direction = 'ltr' | 'rtl';
export type ThemeMode = 'light' | 'dark' | 'system';
export type Density = 'compact' | 'comfortable' | 'spacious';

export interface UnifiedStoreState {
  // App Settings
  settings: AppSettings;
  features: FeatureFlags;
  maintenanceBypassed: boolean;

  // User Preferences (from global-ssot)
  language: Language;
  direction: Direction;
  themeMode: ThemeMode;
  fontSize: number;
  density: Density;
  highContrast: boolean;
  reducedMotion: boolean;

  // Development Tools
  ssotGuardEnabled: boolean;
}

export interface UnifiedStoreActions {
  // App Settings Actions
  setSettings: (settings: PartialSettings) => void;
  setFeature: (key: FeatureFlagKey, value: boolean) => void;
  setMaintenanceBypass: (bypassed: boolean) => void;

  // User Preferences Actions
  setLanguage: (lang: Language) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setFontSize: (size: number) => void;
  setDensity: (density: Density) => void;
  setHighContrast: (enabled: boolean) => void;
  setReducedMotion: (enabled: boolean) => void;

  // Development Tools Actions
  setSSOTGuardEnabled: (enabled: boolean) => void;

  // Utility Actions
  reset: () => void;
  resetPreferences: () => void;
  isMaintenanceEnabled: () => boolean;
  isMaintenanceActive: () => boolean;
  getEffectiveLanguage: () => 'en' | 'ar';
  syncDOM: () => void;
}

type UnifiedStore = UnifiedStoreState & UnifiedStoreActions;

// --- Constants ---

const DEFAULT_PREFERENCES = {
  language: 'ar' as Language,
  themeMode: 'system' as ThemeMode,
  fontSize: 16,
  density: 'comfortable' as Density,
  highContrast: false,
  reducedMotion: false,
  ssotGuardEnabled: false,
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

// Prevent excessive DOM syncs
let lastSyncState: string = '';
function shouldSyncDOM(state: Pick<UnifiedStoreState, 'language' | 'themeMode' | 'fontSize' | 'density' | 'highContrast' | 'reducedMotion'>): boolean {
  const currentState = JSON.stringify(state);
  if (currentState === lastSyncState) return false;
  lastSyncState = currentState;
  return true;
}

/**
 * Synchronizes the <html> element attributes from the unified store
 */
export function syncDOMFromStore(state: Pick<UnifiedStoreState, 'language' | 'themeMode' | 'fontSize' | 'density' | 'highContrast' | 'reducedMotion'>) {
  if (typeof window === 'undefined') return;

  // Prevent excessive DOM syncs
  if (!shouldSyncDOM(state)) return;

  const html = document.documentElement;
  const direction = getDirectionForLanguage(state.language);
  const effectiveTheme = state.themeMode === 'system' ? getSystemThemePreference() : state.themeMode;

  html.setAttribute('lang', state.language);
  html.setAttribute('dir', direction);
  html.classList.remove('light', 'dark');
  html.classList.add(effectiveTheme);
  html.setAttribute('data-theme', effectiveTheme);
  html.style.fontSize = `${state.fontSize}px`;
  html.setAttribute('data-density', state.density);
  html.classList.toggle('high-contrast', state.highContrast);
  html.classList.toggle('reduce-motion', state.reducedMotion);
}

function persistCookies(state: Pick<UnifiedStoreState, 'language' | 'themeMode' | 'fontSize' | 'density' | 'highContrast' | 'reducedMotion'>) {
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
 * Initializes the unified store system
 */
export function initializeUnifiedStore() {
  if (typeof window === 'undefined') return;

  // Set up system theme change listener
  if (systemThemeMediaQuery) {
    systemThemeMediaQuery.removeEventListener('change', systemThemeChangeListener!);
  }

  systemThemeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  systemThemeChangeListener = () => {
    // If in system mode, re-sync DOM using current store state
    const state = useUnifiedStore.getState();
    if (state.themeMode === 'system') {
      syncDOMFromStore(state);
    }
  };
  systemThemeMediaQuery.addEventListener('change', systemThemeChangeListener);
}

// --- Store Creation ---

export const useUnifiedStore = create<UnifiedStore>()(
  devtools(
    persist(
      (set, get) => {
        const syncAll = () => {
          const current = get();
          syncDOMFromStore(current);
          persistCookies(current);
        };

        return {
          // Initial State
          settings: { ...DEFAULT_SETTINGS },
          features: { ...FEATURE_FLAGS },
          maintenanceBypassed: DEFAULT_SETTINGS.maintenanceBypassed,
          language: DEFAULT_PREFERENCES.language,
          themeMode: DEFAULT_PREFERENCES.themeMode,
          fontSize: DEFAULT_PREFERENCES.fontSize,
          density: DEFAULT_PREFERENCES.density,
          highContrast: DEFAULT_PREFERENCES.highContrast,
          reducedMotion: DEFAULT_PREFERENCES.reducedMotion,
          ssotGuardEnabled: DEFAULT_PREFERENCES.ssotGuardEnabled,
          direction: getDirectionForLanguage(DEFAULT_PREFERENCES.language),

          // App Settings Actions
          setSettings: (partialSettings) =>
            set((state) => ({
              settings: { ...state.settings, ...partialSettings },
            })),

          setFeature: (key, value) => {
            set((state) => ({
              features: { ...state.features, [key]: value },
            }));
            // Only force theme to light if darkMode is being disabled AND current theme is not light
            if (key === 'darkMode' && !value) {
              const currentThemeMode = get().themeMode;
              if (currentThemeMode !== 'light') {
                set({ themeMode: 'light' });
                syncAll();
              }
            }
          },

          setMaintenanceBypass: (bypassed) => set({ maintenanceBypassed: bypassed }),

          // User Preferences Actions
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

          // Development Tools Actions
          setSSOTGuardEnabled: (enabled: boolean) => {
            set({ ssotGuardEnabled: enabled });
          },

          // Utility Actions
          reset: () => {
            set({
              settings: { ...DEFAULT_SETTINGS },
              features: { ...FEATURE_FLAGS },
              maintenanceBypassed: DEFAULT_SETTINGS.maintenanceBypassed,
              language: DEFAULT_PREFERENCES.language,
              themeMode: DEFAULT_PREFERENCES.themeMode,
              fontSize: DEFAULT_PREFERENCES.fontSize,
              density: DEFAULT_PREFERENCES.density,
              highContrast: DEFAULT_PREFERENCES.highContrast,
              reducedMotion: DEFAULT_PREFERENCES.reducedMotion,
              ssotGuardEnabled: DEFAULT_PREFERENCES.ssotGuardEnabled,
              direction: getDirectionForLanguage(DEFAULT_PREFERENCES.language),
            });
            syncAll();
          },

          resetPreferences: () => {
            set({
              language: DEFAULT_PREFERENCES.language,
              themeMode: DEFAULT_PREFERENCES.themeMode,
              fontSize: DEFAULT_PREFERENCES.fontSize,
              density: DEFAULT_PREFERENCES.density,
              highContrast: DEFAULT_PREFERENCES.highContrast,
              reducedMotion: DEFAULT_PREFERENCES.reducedMotion,
              ssotGuardEnabled: DEFAULT_PREFERENCES.ssotGuardEnabled,
              direction: getDirectionForLanguage(DEFAULT_PREFERENCES.language),
            });
            syncAll();
          },

          isMaintenanceEnabled: () => get().settings.maintenance.enabled,

          isMaintenanceActive: () => {
            const state = get();
            return state.settings.maintenance.enabled && !state.maintenanceBypassed;
          },

          getEffectiveLanguage: () => {
            if (typeof window !== 'undefined') {
              const lang = get().language;
              if (lang === 'en' || lang === 'ar') {
                return lang;
              }
            }
            return 'en';
          },

          syncDOM: () => {
            syncAll();
          },
        };
      },
      {
        name: 'gova-unified-store',
        storage: createGovaDbZustandStorage(GOVA_DB_STORES.APP_SETTINGS) as any,
        skipHydration: true,
        partialize: (state) => ({
          settings: state.settings,
          features: state.features,
          maintenanceBypassed: state.maintenanceBypassed,
          language: state.language,
          themeMode: state.themeMode,
          fontSize: state.fontSize,
          density: state.density,
          highContrast: state.highContrast,
          reducedMotion: state.reducedMotion,
          ssotGuardEnabled: state.ssotGuardEnabled,
        }),
        onRehydrateStorage: () => (state) => {
          if (state) {
            state.direction = getDirectionForLanguage(state.language);
            syncDOMFromStore(state);
          }
        },
      }
    )
  )
);

// --- Exported Utility Functions ---

export function isMaintenanceEnabled(): boolean {
  return useUnifiedStore.getState().isMaintenanceEnabled();
}

export function isMaintenanceActive(): boolean {
  return useUnifiedStore.getState().isMaintenanceActive();
}

export function getEffectiveLanguage(): 'en' | 'ar' {
  return useUnifiedStore.getState().getEffectiveLanguage();
}
