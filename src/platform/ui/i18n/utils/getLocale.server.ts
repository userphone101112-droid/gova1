import { cookies } from 'next/headers';

import { Locale } from '../core/types';

const DEFAULT_LOCALE: Locale = 'en';
const DEFAULT_THEME_MODE: 'light' | 'dark' | 'system' = 'system';

/** Server-only: read locale from cookie */
export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('locale');

  if (localeCookie && (localeCookie.value === 'en' || localeCookie.value === 'ar')) {
    return localeCookie.value as Locale;
  }

  return DEFAULT_LOCALE;
}

/** Server-only: read theme mode from cookie */
export async function getThemeMode(): Promise<'light' | 'dark' | 'system'> {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get('gova-global-ssot');

  if (themeCookie) {
    try {
      const state = JSON.parse(themeCookie.value);
      if (state.themeMode && ['light', 'dark', 'system'].includes(state.themeMode)) {
        return state.themeMode;
      }
    } catch {
      // Ignore invalid JSON
    }
  }

  return DEFAULT_THEME_MODE;
}
