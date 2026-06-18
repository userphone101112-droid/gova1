import { Locale } from '../core/types';

/** Client-safe: text direction from locale */
export function getDirection(locale: Locale): 'ltr' | 'rtl' {
  return locale === 'ar' ? 'rtl' : 'ltr';
}

/** Client-safe: resolve effective theme (no system preference on server) */
export function getEffectiveTheme(mode: 'light' | 'dark' | 'system'): 'light' | 'dark' {
  return mode === 'system' ? 'light' : mode;
}
