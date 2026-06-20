'use client';

import { usePathname } from 'next/navigation';
import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';

import { useUnifiedStore } from '@/store/unified.store';

import { getAppDictionary } from './getDictionary';
import { resolveFeatureFromPathname } from './i18n-route-manifest';
import { Locale, I18nContext, TranslationDictionary } from './types';


const I18nContextInstance = createContext<I18nContext | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
  initialLocale: Locale;
  initialDictionary: TranslationDictionary;
}

/**
 * Single root i18n provider — loads full app dictionary once; route feature syncs via pathname.
 */
export function I18nProvider({
  children,
  initialLocale,
  initialDictionary,
}: I18nProviderProps) {
  const pathname = usePathname();
  const routeFeature = useMemo(
    () => resolveFeatureFromPathname(pathname ?? '/'),
    [pathname]
  );

  const { language: locale, setLanguage: setLocaleSSOT } = useUnifiedStore();
  const [dictionary, setDictionary] = useState<TranslationDictionary>(initialDictionary);

  const loadDictionary = useCallback(
    async (targetLocale: Locale) => getAppDictionary(targetLocale),
    []
  );

  useEffect(() => {
    if (locale === initialLocale) {
      return;
    }

    let cancelled = false;
    loadDictionary(locale).then((dict) => {
      if (!cancelled) {
        setDictionary(dict);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [locale, initialLocale, loadDictionary]);

  const handleSetLocale = async (newLocale: Locale) => {
    setLocaleSSOT(newLocale);
    const newDictionary = await loadDictionary(newLocale);
    setDictionary(newDictionary);
  };

  const contextValue: I18nContext = {
    locale,
    setLocale: handleSetLocale,
    dictionary,
    feature: routeFeature,
  };

  return (
    <I18nContextInstance.Provider value={contextValue}>
      {children}
    </I18nContextInstance.Provider>
  );
}

export function useI18nContext(): I18nContext {
  const context = useContext(I18nContextInstance);
  if (!context) {
    throw new Error('useI18nContext must be used within I18nProvider');
  }
  return context;
}
