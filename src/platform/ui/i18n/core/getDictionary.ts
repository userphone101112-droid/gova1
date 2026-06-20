import { Locale, Feature, TranslationDictionary } from './types';
import { resolveFeatureScope } from './featureScope';

/**
 * Cache entry with timestamp for potential TTL
 */
interface CacheEntry {
  dictionary: TranslationDictionary;
  timestamp: number;
}

/**
 * Server-side cache layer for merged dictionaries
 * Cache key format: locale:feature (e.g., "ar:dashboard", "en:auth")
 */
class DictionaryCache {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Generate cache key from locale and feature
   */
  private generateKey(locale: Locale, feature: Feature): string {
    return `${locale}:${feature}`;
  }

  /**
   * Get dictionary from cache
   */
  get(locale: Locale, feature: Feature): TranslationDictionary | null {
    const key = this.generateKey(locale, feature);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if cache entry has expired
    if (Date.now() - entry.timestamp > this.DEFAULT_TTL) {
      this.cache.delete(key);
      return null;
    }

    return entry.dictionary;
  }

  /**
   * Set dictionary in cache
   */
  set(locale: Locale, feature: Feature, dictionary: TranslationDictionary): void {
    const key = this.generateKey(locale, feature);
    this.cache.set(key, {
      dictionary,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear cache for specific locale and feature
   */
  clear(locale?: Locale, feature?: Feature): void {
    if (locale && feature) {
      const key = this.generateKey(locale, feature);
      this.cache.delete(key);
    } else if (locale) {
      // Clear all entries for a specific locale
      for (const key of this.cache.keys()) {
        if (key.startsWith(`${locale}:`)) {
          this.cache.delete(key);
        }
      }
    } else {
      // Clear entire cache
      this.cache.clear();
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Global cache instance
const dictionaryCache = new DictionaryCache();

/**
 * Deep merge two dictionaries with feature taking precedence over common
 */
function deepMerge(base: TranslationDictionary, override: TranslationDictionary): TranslationDictionary {
  const result = { ...base };

  for (const key in override) {
    if (override.hasOwnProperty(key)) {
      const baseValue = result[key];
      const overrideValue = override[key];

      if (
        typeof baseValue === 'object' &&
        baseValue !== null &&
        !Array.isArray(baseValue) &&
        typeof overrideValue === 'object' &&
        overrideValue !== null &&
        !Array.isArray(overrideValue)
      ) {
        // Both are objects, merge recursively
        result[key] = deepMerge(
          baseValue as TranslationDictionary,
          overrideValue as TranslationDictionary
        );
      } else {
        // Override with feature value
        result[key] = overrideValue;
      }
    }
  }

  return result;
}

/**
 * Load common dictionary for a locale
 */
async function loadCommonDictionary(locale: Locale): Promise<TranslationDictionary> {
  try {
    const module = await import(`@/platform/ui/i18n/locales/common/${locale}.json`);
    return module.default;
  } catch (error) {
    console.warn(`Common dictionary not found for locale: ${locale}`);
    return {};
  }
}

/**
 * Load feature-specific dictionary for a locale
 */
async function loadFeatureDictionary(feature: Feature, locale: Locale): Promise<TranslationDictionary> {
  try {
    const module = await import(`@/platform/ui/i18n/locales/${feature}/${locale}.json`);
    return module.default;
  } catch (error) {
    console.warn(`Feature dictionary not found for feature: ${feature}, locale: ${locale}`);
    return {};
  }
}

/**
 * Load and deep-merge all feature namespaces for a route scope.
 */
export async function getMergedDictionary(
  locale: Locale,
  feature: Feature
): Promise<TranslationDictionary> {
  const scope = resolveFeatureScope(feature);
  const uniqueScope = [...new Set(scope)];

  const dictionaries = await Promise.all(
    uniqueScope.map((scopeFeature) =>
      scopeFeature === 'common'
        ? loadCommonDictionary(locale)
        : loadFeatureDictionary(scopeFeature, locale)
    )
  );

  return dictionaries.reduce<TranslationDictionary>(
    (merged, dict) => deepMerge(merged, dict),
    {}
  );
}

/**
 * Get merged dictionary for a feature and locale (full route scope).
 */
export async function getDictionary(locale: Locale, feature: Feature): Promise<TranslationDictionary> {
  return getMergedDictionary(locale, feature);
}

/**
 * Get merged dictionary with server-side caching
 * Uses cache key format: locale:feature (e.g., "ar:dashboard", "en:auth")
 */
export async function getDictionaryCached(locale: Locale, feature: Feature): Promise<TranslationDictionary> {
  // Check cache first
  const cached = dictionaryCache.get(locale, feature);
  if (cached) {
    return cached;
  }

  // Load and cache the dictionary
  const dictionary = await getDictionary(locale, feature);
  dictionaryCache.set(locale, feature, dictionary);
  
  return dictionary;
}

/**
 * Clear dictionary cache
 * Useful for development or when translations are updated
 */
export function clearDictionaryCache(locale?: Locale, feature?: Feature): void {
  dictionaryCache.clear(locale, feature);
}

/**
 * Get cache statistics for debugging
 */
export function getDictionaryCacheStats(): { size: number; keys: string[] } {
  return dictionaryCache.getStats();
}

/** Features merged into the single app-wide dictionary */
export const APP_DICTIONARY_FEATURES: readonly Feature[] = [
  'common',
  'splash',
  'home',
  'auth',
  'shared-layout',
  'error-boundary',
  'settings',
  'merchant',
  'onboarding',
  'signup',
] as const;

const APP_DICTIONARY_CACHE_KEY = '__app__' as Feature;

/**
 * Load the full application dictionary (all route scopes) in one merge.
 */
export async function getAppDictionary(locale: Locale): Promise<TranslationDictionary> {
  const uniqueFeatures = [...new Set(APP_DICTIONARY_FEATURES)];

  const dictionaries = await Promise.all(
    uniqueFeatures.map((scopeFeature) =>
      scopeFeature === 'common'
        ? loadCommonDictionary(locale)
        : loadFeatureDictionary(scopeFeature, locale)
    )
  );

  return dictionaries.reduce<TranslationDictionary>(
    (merged, dict) => deepMerge(merged, dict),
    {}
  );
}

/**
 * Cached full application dictionary for root layout SSR.
 */
export async function getAppDictionaryCached(locale: Locale): Promise<TranslationDictionary> {
  const cached = dictionaryCache.get(locale, APP_DICTIONARY_CACHE_KEY);
  if (cached) {
    return cached;
  }

  const dictionary = await getAppDictionary(locale);
  dictionaryCache.set(locale, APP_DICTIONARY_CACHE_KEY, dictionary);
  return dictionary;
}
