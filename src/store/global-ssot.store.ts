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

interface GlobalSSOTState {
  // Language & Direction
  language: Language;
  direction: Direction;

  // Theme
  themeMode: ThemeMode;

  // Actions
  setLanguage: (lang: Language) => void;
  setThemeMode: (mode: ThemeMode) => void;
}

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
export function syncDOMFromSSOT(language: Language, themeMode: ThemeMode) {
  if (typeof window === 'undefined') return;

  const html = document.documentElement;
  const direction = getDirectionForLanguage(language);
  const effectiveTheme = themeMode === 'system' ? getSystemThemePreference() : themeMode;

  // 1. Sync Language & Direction
  html.setAttribute('lang', language);
  html.setAttribute('dir', direction);

  // 2. Sync Theme
  // Remove old theme classes
  html.classList.remove('light', 'dark');
  // Add effective theme class
  html.classList.add(effectiveTheme);
  // Set data-theme attribute (for CSS targeting)
  html.setAttribute('data-theme', effectiveTheme);
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

// --- Store ---

// Function to get initial state from cookie (client side)
function getInitialStateFromCookie(): Partial<GlobalSSOTState> {
  if (typeof window === 'undefined') return {};
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'gova-global-ssot') {
      try {
        const parsed = JSON.parse(decodeURIComponent(value));
        return {
          language: parsed.language,
          themeMode: parsed.themeMode
        };
      } catch (e) {
        return {};
      }
    }
  }
  return {};
}

export const useGlobalSSOTStore = create<GlobalSSOTState>()(
  devtools(
    persist(
      (set, get) => {
        // Get initial state from cookie first
        const cookieState = getInitialStateFromCookie();
        
        return {
          // Initial State (with cookie overrides)
          language: cookieState.language || 'en',
          direction: getDirectionForLanguage(cookieState.language || 'en'),
          themeMode: cookieState.themeMode || 'system',

          // Actions
          setLanguage: (lang: Language) => {
            const direction = getDirectionForLanguage(lang);
            set({ language: lang, direction });
            syncDOMFromSSOT(lang, get().themeMode);
            // Sync to cookie for server-side access
            if (typeof window !== 'undefined') {
              const currentState = get();
              document.cookie = `gova-global-ssot=${JSON.stringify({ language: currentState.language, themeMode: currentState.themeMode })}; path=/; max-age=31536000`;
            }
          },

          setThemeMode: (mode: ThemeMode) => {
            set({ themeMode: mode });
            syncDOMFromSSOT(get().language, mode);
            // Sync to cookie for server-side access
            if (typeof window !== 'undefined') {
              const currentState = get();
              document.cookie = `gova-global-ssot=${JSON.stringify({ language: currentState.language, themeMode: currentState.themeMode })}; path=/; max-age=31536000`;
            }
          },
        };
      },
      {
        name: 'gova-global-ssot', // Unique localStorage key
        partialize: (state) => ({
          // Only persist the user-controlled settings
          language: state.language,
          themeMode: state.themeMode,
        }),
        // Re-hydrate direction from language
        onRehydrateStorage: () => (state) => {
          if (state) {
            state.direction = getDirectionForLanguage(state.language);
            // Perform initial DOM sync after rehydration
            setTimeout(() => {
              syncDOMFromSSOT(state.language, state.themeMode);
            }, 0);
          }
        },
      }
    )
  )
);
