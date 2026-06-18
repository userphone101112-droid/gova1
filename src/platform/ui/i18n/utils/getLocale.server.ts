import { cookies } from 'next/headers';

import { Locale } from '../core/types';

const DEFAULT_LOCALE: Locale = 'en';
const DEFAULT_THEME_MODE: 'light' | 'dark' | 'system' = 'system';

export interface SSOTPreferences {
  fontSize: number;
  density: 'compact' | 'comfortable' | 'spacious';
  highContrast: boolean;
  reducedMotion: boolean;
}

const DEFAULT_SSOT_PREFERENCES: SSOTPreferences = {
  fontSize: 16,
  density: 'comfortable',
  highContrast: false,
  reducedMotion: false,
};

function parseSSOTCookie(raw: string | undefined): Partial<SSOTPreferences & { language: Locale; themeMode: string }> {
  if (!raw) return {};
  try {
    return JSON.parse(decodeURIComponent(raw));
  } catch {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
}

async function readSSOTCookie() {
  const cookieStore = await cookies();
  return cookieStore.get('gova-global-ssot')?.value;
}

/** Server-only: read locale from SSOT cookie (single source of truth) */
export async function getLocale(): Promise<Locale> {
  const ssotRaw = await readSSOTCookie();
  const state = parseSSOTCookie(ssotRaw);

  if (state.language === 'en' || state.language === 'ar') {
    return state.language;
  }

  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('locale');
  if (localeCookie && (localeCookie.value === 'en' || localeCookie.value === 'ar')) {
    return localeCookie.value as Locale;
  }

  return DEFAULT_LOCALE;
}

/** Server-only: read theme mode from cookie */
export async function getThemeMode(): Promise<'light' | 'dark' | 'system'> {
  const ssotRaw = await readSSOTCookie();
  const state = parseSSOTCookie(ssotRaw);

  if (state.themeMode && ['light', 'dark', 'system'].includes(state.themeMode)) {
    return state.themeMode as 'light' | 'dark' | 'system';
  }

  return DEFAULT_THEME_MODE;
}

/** Server-only: read display & accessibility preferences from SSOT cookie */
export async function getSSOTPreferences(): Promise<SSOTPreferences> {
  const ssotRaw = await readSSOTCookie();
  const state = parseSSOTCookie(ssotRaw);

  return {
    fontSize:
      typeof state.fontSize === 'number' && state.fontSize >= 12 && state.fontSize <= 22
        ? state.fontSize
        : DEFAULT_SSOT_PREFERENCES.fontSize,
    density:
      state.density === 'compact' || state.density === 'comfortable' || state.density === 'spacious'
        ? state.density
        : DEFAULT_SSOT_PREFERENCES.density,
    highContrast: Boolean(state.highContrast),
    reducedMotion: Boolean(state.reducedMotion),
  };
}
