'use client';

import { useTranslation } from '@/platform/ui';
import { Locale } from '@/platform/ui';
import { Globe } from 'lucide-react';
import { UiButton, UiDiv } from '@/platform/ui';
import { HOME } from '@/platform/ui';
import { COMMON_LAYOUT } from '@/platform/ui/registry/categories';

export function LanguageSwitcher() {
  const { t, locale, setLocale } = useTranslation();

  const handleLocaleChange = (newLocale: Locale) => {
    setLocale(newLocale);
  };

  return (
    <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="flex items-center gap-2">
      <Globe className="w-4 h-4" />
      <UiButton
        ui={HOME.LANGUAGE_SWITCHER.ENGLISH_BUTTON}
        onClick={() => handleLocaleChange('en')}
        variant={locale === 'en' ? 'default' : 'secondary'}
        size="sm"
      >
        {t(HOME.LANGUAGE_SWITCHER.ENGLISH_BUTTON)}
      </UiButton>
      <UiButton
        ui={HOME.LANGUAGE_SWITCHER.ARABIC_BUTTON}
        onClick={() => handleLocaleChange('ar')}
        variant={locale === 'ar' ? 'default' : 'secondary'}
        size="sm"
      >
        {t(HOME.LANGUAGE_SWITCHER.ARABIC_BUTTON)}
      </UiButton>
    </UiDiv>
  );
}
