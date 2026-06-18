'use client';

import { Globe } from 'lucide-react';
import { useTranslation, UiButton, UiDiv } from '@/platform/ui';
import { COMMON_LAYOUT } from '@/platform/ui/registry/categories';

export default function LanguagePage() {
  const { locale, setLocale, t } = useTranslation();

  const handleLanguageChange = async (newLang: 'en' | 'ar') => {
    await setLocale(newLang);
  };

  return (
    <UiDiv
      ui={COMMON_LAYOUT.CONTAINER}
      className="mx-auto w-full max-w-lg px-3 py-4 pb-24 sm:max-w-xl sm:px-4 sm:py-6 md:max-w-2xl md:px-6 md:pb-8"
    >
      <header className="mb-6 space-y-2 sm:mb-8">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary sm:h-12 sm:w-12">
          <Globe className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-on-surface sm:text-2xl">
          {t('language.title')}
        </h1>
        <p className="max-w-prose text-sm leading-relaxed text-on-surface-variant">
          {t('language.description')}
        </p>
      </header>

      <div className="space-y-4">
        <UiButton
          ui={COMMON_LAYOUT.WRAPPER}
          variant={locale === 'en' ? 'default' : 'outline'}
          className="h-14 w-full justify-start gap-3 rounded-xl px-4 text-base font-medium"
          onClick={() => handleLanguageChange('en')}
        >
          <Globe className="h-5 w-5 shrink-0" />
          <span>English</span>
        </UiButton>

        <UiButton
          ui={COMMON_LAYOUT.WRAPPER}
          variant={locale === 'ar' ? 'default' : 'outline'}
          className="h-14 w-full justify-start gap-3 rounded-xl px-4 text-base font-medium"
          onClick={() => handleLanguageChange('ar')}
        >
          <Globe className="h-5 w-5 shrink-0" />
          <span>العربية</span>
        </UiButton>
      </div>
    </UiDiv>
  );
}
