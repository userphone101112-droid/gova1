import { cookies } from 'next/headers';
import { Locale } from '../core/types';

const DEFAULT_LOCALE: Locale = 'en';

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
