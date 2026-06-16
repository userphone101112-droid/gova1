import { cookies } from 'next/headers';
import { Locale } from '../core/types';

const DEFAULT_LOCALE: Locale = 'en';
const DEFAULT_THEME_MODE: 'light' | 'dark' | 'system' = 'system';

/**
 * Get locale from cookie or default
 * This is a server-side function for Next.js App Router
 */
export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('locale');
  
  if (localeCookie && (localeCookie.value === 'en' || localeCookie.value === 'ar')) {
    return localeCookie.value as Locale;
  }
  
  return DEFAULT_LOCALE;
}

/**
 * Get text direction for a locale
 */
export function getDirection(locale: Locale): 'ltr' | 'rtl' {
  return locale === 'ar' ? 'rtl' : 'ltr';
}

/**
 * Get theme mode from cookie or default (server-side)
 */
export async function getThemeMode(): Promise<'light' | 'dark' | 'system'> {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get('gova-global-ssot');
  
  if (themeCookie) {
    try {
      const state = JSON.parse(themeCookie.value);
      if (state.themeMode && ['light', 'dark', 'system'].includes(state.themeMode)) {
        return state.themeMode;
      }
    } catch (e) {
      // Ignore invalid JSON
    }
  }
  
  return DEFAULT_THEME_MODE;
}

/**
 * Get effective theme from mode (server-side, no system preference access)
 */
export function getEffectiveTheme(mode: 'light' | 'dark' | 'system'): 'light' | 'dark' {
  // On server, we can't access system preference, so default to 'light' for system mode
  return mode === 'system' ? 'light' : mode;
}
