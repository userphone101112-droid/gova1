import { Locale } from '../core/types';

import { CookieLocaleAdapter } from './CookieLocaleAdapter';
import { IndexedDbLocaleAdapter } from './IndexedDbLocaleAdapter';
import { LocaleStorageAdapter } from './LocaleStorageAdapter';

/**
 * Locale storage manager
 * Manages multiple storage adapters with fallback strategy
 */
export class LocaleStorageManager {
  private adapters: LocaleStorageAdapter[];
  private primaryAdapter: LocaleStorageAdapter;

  constructor() {
    // Initialize adapters in priority order
    const cookieAdapter = new CookieLocaleAdapter();
    const indexedDbAdapter = new IndexedDbLocaleAdapter();

    // Use IndexedDB as primary if available, fallback to cookies
    this.primaryAdapter = indexedDbAdapter.isAvailable() ? indexedDbAdapter : cookieAdapter;
    
    this.adapters = [this.primaryAdapter, cookieAdapter];
  }

  /**
   * Get locale from storage with fallback
   */
  async getLocale(): Promise<Locale | null> {
    for (const adapter of this.adapters) {
      if (adapter.isAvailable()) {
        try {
          const locale = await adapter.getLocale();
          if (locale) {
            return locale;
          }
        } catch (error) {
          console.error(`Error reading from adapter:`, error);
          continue;
        }
      }
    }
    
    return null;
  }

  /**
   * Set locale in all available adapters
   */
  async setLocale(locale: Locale): Promise<void> {
    const promises = this.adapters
      .filter(adapter => adapter.isAvailable())
      .map(adapter => adapter.setLocale(locale).catch(error => {
        console.error(`Error setting locale in adapter:`, error);
      }));

    await Promise.all(promises);
  }

  /**
   * Remove locale from all adapters
   */
  async removeLocale(): Promise<void> {
    const promises = this.adapters
      .filter(adapter => adapter.isAvailable())
      .map(adapter => adapter.removeLocale().catch(error => {
        console.error(`Error removing locale from adapter:`, error);
      }));

    await Promise.all(promises);
  }

  /**
   * Get the primary adapter being used
   */
  getPrimaryAdapter(): LocaleStorageAdapter {
    return this.primaryAdapter;
  }
}

// Singleton instance
let storageManagerInstance: LocaleStorageManager | null = null;

/**
 * Get the singleton locale storage manager instance
 */
export function getLocaleStorageManager(): LocaleStorageManager {
  if (!storageManagerInstance) {
    storageManagerInstance = new LocaleStorageManager();
  }
  return storageManagerInstance;
}
