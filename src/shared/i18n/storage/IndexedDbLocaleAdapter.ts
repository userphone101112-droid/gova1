import { Locale } from '../core/types';
import { LocaleStorageAdapter } from './LocaleStorageAdapter';

/**
 * IndexedDB-based locale storage adapter
 * Used for client-side locale persistence
 * Prepared for future migration from cookies to IndexedDB
 */
export class IndexedDbLocaleAdapter implements LocaleStorageAdapter {
  private readonly DB_NAME = 'gova-i18n';
  private readonly DB_VERSION = 1;
  private readonly STORE_NAME = 'settings';
  private readonly LOCALE_KEY = 'locale';
  private db: IDBDatabase | null = null;

  async getLocale(): Promise<Locale | null> {
    try {
      const db = await this.getDatabase();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.STORE_NAME, 'readonly');
        const store = transaction.objectStore(this.STORE_NAME);
        const request = store.get(this.LOCALE_KEY);
        
        request.onsuccess = () => {
          const result = request.result;
          if (result && (result === 'en' || result === 'ar')) {
            resolve(result as Locale);
          } else {
            resolve(null);
          }
        };
        
        request.onerror = () => {
          reject(new Error('Failed to read locale from IndexedDB'));
        };
      });
    } catch (error) {
      console.error('Error reading locale from IndexedDB:', error);
      return null;
    }
  }

  async setLocale(locale: Locale): Promise<void> {
    try {
      const db = await this.getDatabase();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.STORE_NAME, 'readwrite');
        const store = transaction.objectStore(this.STORE_NAME);
        const request = store.put(locale, this.LOCALE_KEY);
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(new Error('Failed to set locale in IndexedDB'));
      });
    } catch (error) {
      console.error('Error setting locale in IndexedDB:', error);
    }
  }

  async removeLocale(): Promise<void> {
    try {
      const db = await this.getDatabase();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.STORE_NAME, 'readwrite');
        const store = transaction.objectStore(this.STORE_NAME);
        const request = store.delete(this.LOCALE_KEY);
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(new Error('Failed to remove locale from IndexedDB'));
      });
    } catch (error) {
      console.error('Error removing locale from IndexedDB:', error);
    }
  }

  isAvailable(): boolean {
    // IndexedDB is available in most modern browsers
    return typeof window !== 'undefined' && 'indexedDB' in window;
  }

  private async getDatabase(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME);
        }
      };
    });
  }

  /**
   * Close the database connection
   */
  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}
