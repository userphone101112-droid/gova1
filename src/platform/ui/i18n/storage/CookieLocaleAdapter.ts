import { cookies } from 'next/headers';

import { Locale } from '../core/types';

import { LocaleStorageAdapter } from './LocaleStorageAdapter';

/**
 * Cookie-based locale storage adapter
 * Used for server-side locale persistence
 */
export class CookieLocaleAdapter implements LocaleStorageAdapter {
  private readonly COOKIE_NAME = 'locale';
  private readonly MAX_AGE = 365 * 24 * 60 * 60; // 1 year in seconds

  async getLocale(): Promise<Locale | null> {
    try {
      const cookieStore = await cookies();
      const cookie = cookieStore.get(this.COOKIE_NAME);
      
      if (cookie && (cookie.value === 'en' || cookie.value === 'ar')) {
        return cookie.value as Locale;
      }
      
      return null;
    } catch (error) {
      console.error('Error reading locale from cookie:', error);
      return null;
    }
  }

  async setLocale(locale: Locale): Promise<void> {
    try {
      const cookieStore = await cookies();
      cookieStore.set(this.COOKIE_NAME, locale, {
        maxAge: this.MAX_AGE,
        path: '/',
        httpOnly: false,
        sameSite: 'lax',
      });
    } catch (error) {
      console.error('Error setting locale in cookie:', error);
    }
  }

  async removeLocale(): Promise<void> {
    try {
      const cookieStore = await cookies();
      cookieStore.delete(this.COOKIE_NAME);
    } catch (error) {
      console.error('Error removing locale from cookie:', error);
    }
  }

  isAvailable(): boolean {
    // Cookie adapter is always available in Next.js
    return true;
  }
}
