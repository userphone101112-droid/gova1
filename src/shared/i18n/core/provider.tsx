'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Locale, Feature, I18nContext, TranslationDictionary } from './types';
import { getDictionary } from './getDictionary';

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
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [dictionary, setDictionary] = useState<TranslationDictionary>(initialDictionary);
  const [isClient, setIsClient] = useState(false);

  // Hydration fix - only update state on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle locale change
  const handleSetLocale = async (newLocale: Locale) => {
    setLocale(newLocale);
    
    // Load new dictionary for the new locale
    const newDictionary = await getDictionary(newLocale, feature);
    setDictionary(newDictionary);
    
    // Update document direction
    document.documentElement.dir = newLocale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLocale;
    
    // Store locale in cookie
    document.cookie = `locale=${newLocale}; path=/; max-age=31536000`;
  };

  // Set initial document direction and language
  useEffect(() => {
    if (isClient) {
      document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = locale;
    }
  }, [locale, isClient]);

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
