import { useI18nContext } from './provider';
import { t as tFunction } from './t';
import { validateTranslationKey } from './enforceBoundary';

/**
 * Translation hook for components
 * Automatically bound to the current feature scope
 */
export function useTranslation() {
  const { locale, setLocale, dictionary, feature } = useI18nContext();

  /**
   * Translate a key using the current dictionary
   * @param key - Dot notation key (e.g., "common.buttons.submit")
   * @param fallback - Optional fallback text if key not found
   */
  const t = (key: string, fallback?: string) => {
    // Enforce localization boundary
    try {
      validateTranslationKey(key, feature);
    } catch (error) {
      console.warn(error);
      // Still allow the translation to proceed in development
      // In production, you might want to throw the error
    }
    
    return tFunction(key, dictionary, fallback);
  };

  return {
    t,
    locale,
    setLocale,
    feature,
  };
}
