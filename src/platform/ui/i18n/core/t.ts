import type { TranslationKey } from '../keys';
import { TranslationDictionary } from './types';

const missingKeys = new Set<string>();

/**
 * Safely resolve a dot-notation key from a dictionary.
 * In development, missing keys log once and surface a visible marker.
 */
export function t(
  key: TranslationKey,
  dictionary: TranslationDictionary,
  fallback?: string
): string {
  const keys = key.split('.');
  let value: unknown = dictionary;

  for (const k of keys) {
    if (value && typeof value === 'object' && k in (value as object)) {
      value = (value as TranslationDictionary)[k];
    } else {
      if (process.env.NODE_ENV === 'development') {
        if (!missingKeys.has(key)) {
          missingKeys.add(key);
          console.error(
            `[i18n] Missing translation key: "${key}". Run npm run i18n:validate and add the key to locales.`
          );
        }
        return fallback ?? `[missing:${key}]`;
      }
      return fallback ?? '';
    }
  }

  if (typeof value !== 'string') {
    if (process.env.NODE_ENV === 'development') {
      if (!missingKeys.has(key)) {
        missingKeys.add(key);
        console.error(`[i18n] Translation key "${key}" is not a string.`);
      }
      return fallback ?? `[missing:${key}]`;
    }
    return fallback ?? '';
  }

  return value;
}

/**
 * Type-safe translation function generator
 */
export function createTranslator(dictionary: TranslationDictionary) {
  return (key: TranslationKey, fallback?: string) => t(key, dictionary, fallback);
}
