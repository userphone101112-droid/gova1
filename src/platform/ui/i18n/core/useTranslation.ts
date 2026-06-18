import { useI18nContext } from './provider';
import { t as translateKey } from './t';
import { validateTranslationKey } from './enforceBoundary';
import {
  resolveTranslationKey,
  type TranslationSource,
} from './resolveTranslationSource';

export type TranslateFn = (source: TranslationSource, fallback?: string) => string;

/**
 * Translation hook — single `t()` for UI identities and translation keys.
 */
export function useTranslation() {
  const { locale, setLocale, dictionary, feature } = useI18nContext();

  const t: TranslateFn = (source, fallback) => {
    const key = resolveTranslationKey(source);

    if (!key) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[i18n] No translation key for source:', source);
      }
      return fallback ?? '';
    }

    try {
      validateTranslationKey(key, feature);
    } catch (error) {
      console.warn(error);
    }

    const result = translateKey(key, dictionary, fallback);

    if (result === key && process.env.NODE_ENV === 'development') {
      console.warn(`[i18n] Missing translation for key "${key}" (feature scope: ${feature})`);
    }

    return result;
  };

  return {
    t,
    locale,
    setLocale,
    feature,
  };
}
