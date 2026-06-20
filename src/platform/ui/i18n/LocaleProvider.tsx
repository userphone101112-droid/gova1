'use client';

import { useEffect, useState } from 'react';

import { useUnifiedStore } from '@/store/unified.store';

interface LocaleProviderProps {
  initialLocale: string;
  initialDirection: 'ltr' | 'rtl';
}

export function LocaleProvider({ initialLocale: _initialLocale, initialDirection: _initialDirection }: LocaleProviderProps) {
  const { language } = useUnifiedStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      // Update HTML lang and dir attributes when language changes
      // Use the current language from unified store, not initialLocale
      document.documentElement.lang = language;
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    }
  }, [language, mounted]);

  return null;
}
