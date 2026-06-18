import { Locale } from '../core/types';

/**
 * Locale storage adapter interface
 * Provides abstraction for different storage backends
 */
export interface LocaleStorageAdapter {
  /**
   * Get the current locale from storage
   */
  getLocale(): Promise<Locale | null>;
  
  /**
   * Set the current locale in storage
   */
  setLocale(locale: Locale): Promise<void>;
  
  /**
   * Remove the locale from storage
   */
  removeLocale(): Promise<void>;
  
  /**
   * Check if the adapter is available
   */
  isAvailable(): boolean;
}
