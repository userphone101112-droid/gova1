'use client';

import { useEffect, useState } from 'react';
import { useGlobalSSOTStore } from '@/store/global-ssot.store';

interface LocaleProviderProps {
  initialLocale: string;
  initialDirection: 'ltr' | 'rtl';
}

export function LocaleProvider({ initialLocale, initialDirection }: LocaleProviderProps) {
  const { language } = useGlobalSSOTStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      // Update HTML lang and dir attributes when language changes
      // Use the current language from SSOT store, not initialLocale
      document.documentElement.lang = language;
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    }
  }, [language, mounted]);

  return null;
}
