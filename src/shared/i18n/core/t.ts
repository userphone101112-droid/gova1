import { TranslationDictionary } from './types';

/**
 * Safely resolve a dot-notation key from a dictionary
 * Returns the key itself if not found (fallback)
 */
export function t(
  key: string,
  dictionary: TranslationDictionary,
  fallback?: string
): string {
  const keys = key.split('.');
  let value: any = dictionary;

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // Key not found, return fallback or the key itself
      return fallback || key;
    }
  }

  // If the final value is not a string, return fallback or key
  if (typeof value !== 'string') {
    return fallback || key;
  }

  return value;
}

/**
 * Type-safe translation function generator
 */
export function createTranslator(dictionary: TranslationDictionary) {
  return (key: string, fallback?: string) => t(key, dictionary, fallback);
}
