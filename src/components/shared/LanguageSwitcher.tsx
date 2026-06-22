'use client';
import { Globe } from 'lucide-react';

import { useTranslation, Locale, HOME } from '@/platform/ui';


export function LanguageSwitcher() {
  const { t, setLocale } = useTranslation();

  const handleLocaleChange = (newLocale: Locale) => {
    setLocale(newLocale);
  };

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4" />
      <button
        data-ui-uuid={HOME.LANGUAGE_SWITCHER.ENGLISH_BUTTON.uuid}
        data-ui-lang-uuid={`lang-${HOME.LANGUAGE_SWITCHER.ENGLISH_BUTTON.uuid}`}
        onClick={() => handleLocaleChange('en')}
      >
        {t('home.language-switcher.englishButton')}
      </button>
      <button
        data-ui-uuid={HOME.LANGUAGE_SWITCHER.ARABIC_BUTTON.uuid}
        data-ui-lang-uuid={`lang-${HOME.LANGUAGE_SWITCHER.ARABIC_BUTTON.uuid}`}
        onClick={() => handleLocaleChange('ar')}
      >
        {t('home.language-switcher.arabicButton')}
      </button>
    </div>
  );
}
