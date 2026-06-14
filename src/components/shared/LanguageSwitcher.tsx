'use client';

import { useTranslation } from '@/shared/i18n/core/useTranslation';
import { Locale } from '@/shared/i18n/core/types';
import { Globe } from 'lucide-react';
import { UiButton } from '@/components/ui-identified';
import { HOME } from '@/shared/ui-registry';

export function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation();

  const handleLocaleChange = (newLocale: Locale) => {
    setLocale(newLocale);
  };

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4" />
      <UiButton
        ui={HOME.LANGUAGE_SWITCHER.ENGLISH_BUTTON}
        onClick={() => handleLocaleChange('en')}
        variant={locale === 'en' ? 'default' : 'secondary'}
        size="sm"
      >
        EN
      </UiButton>
      <UiButton
        ui={HOME.LANGUAGE_SWITCHER.ARABIC_BUTTON}
        onClick={() => handleLocaleChange('ar')}
        variant={locale === 'ar' ? 'default' : 'secondary'}
        size="sm"
      >
        AR
      </UiButton>
    </div>
  );
}
