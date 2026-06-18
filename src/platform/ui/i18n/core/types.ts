export type Locale = 'en' | 'ar';

// Feature type is now dynamically discovered from filesystem
export type Feature = string;

export interface TranslationDictionary {
  [key: string]: string | TranslationDictionary;
}

export interface I18nContext {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  dictionary: TranslationDictionary;
  feature: Feature;
}

export interface DictionaryLoaderOptions {
  locale: Locale;
  feature: Feature;
}
