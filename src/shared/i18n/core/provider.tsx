'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Locale, Feature, I18nContext, TranslationDictionary } from './types';
import { getDictionary } from './getDictionary';
import { useGlobalSSOTStore } from '../../../store/global-ssot.store';

const I18nContextInstance = createContext<I18nContext | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
  initialLocale: Locale;
  initialDictionary: TranslationDictionary;
  feature: Feature;
}

export function I18nProvider({
  children,
  initialLocale,
  initialDictionary,
  feature,
}: I18nProviderProps) {
  // Get language from global SSOT store
  const { language: locale, setLanguage: setLocaleSSOT } = useGlobalSSOTStore();
  const [dictionary, setDictionary] = useState<TranslationDictionary>(initialDictionary);
  const [isClient, setIsClient] = useState(false);

  // Hydration fix - only update state on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Sync initial locale from server to SSOT store on client mount
  useEffect(() => {
    if (isClient) {
      // Set store to initial locale from server (if different)
      const storeLocale = useGlobalSSOTStore.getState().language;
      if (storeLocale !== initialLocale) {
        setLocaleSSOT(initialLocale);
      }
      // Load dictionary for current store language
      if (storeLocale !== initialLocale) {
        getDictionary(storeLocale, feature).then((dict) => {
          setDictionary(dict);
        });
      }
    }
  }, [isClient, feature, initialLocale, setLocaleSSOT]);

  // Handle locale change - delegates to SSOT store
  const handleSetLocale = async (newLocale: Locale) => {
    // 1. Tell SSOT store to update
    setLocaleSSOT(newLocale);
    
    // 2. Load new dictionary for the new locale
    const newDictionary = await getDictionary(newLocale, feature);
    setDictionary(newDictionary);
    
    // 3. Set cookie for server-side rendering
    document.cookie = `locale=${newLocale}; path=/; max-age=31536000`;
  };

  // Listen for SSOT language changes (e.g., from settings)
  useEffect(() => {
    if (isClient) {
      getDictionary(locale, feature).then((dict) => {
        setDictionary(dict);
      });
    }
  }, [locale, feature, isClient]);

  const contextValue: I18nContext = {
    locale,
    setLocale: handleSetLocale,
    dictionary,
    feature,
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
