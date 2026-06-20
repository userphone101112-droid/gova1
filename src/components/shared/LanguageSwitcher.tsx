'use client';
import { Globe } from 'lucide-react';

import { useTranslation, Locale, HOME } from '@/platform/ui';


export function LanguageSwitcher() {
  const { t, setLocale } = useTranslation();

  const handleLocaleChange = (newLocale: Locale) => {
    setLocale(newLocale);
  };

  return (
    <div data-ui-uuid={HOME.SHELL.LANGUAGE_SWITCHER_ENGLISH_BUTTON_WRAPPER_L15.uuid} className="flex items-center gap-2">
      <Globe className="w-4 h-4" />
      <button data-ui-uuid={HOME.LANGUAGE_SWITCHER.ENGLISH_BUTTON.uuid} onClick={() => handleLocaleChange('en')}>
        {t(HOME.LANGUAGE_SWITCHER.ENGLISH_BUTTON)}
      </button>
      <button data-ui-uuid={HOME.LANGUAGE_SWITCHER.ARABIC_BUTTON.uuid} onClick={() => handleLocaleChange('ar')}>
        {t(HOME.LANGUAGE_SWITCHER.ARABIC_BUTTON)}
      </button>
    </div>
  );
}
