'use client';

import { useTranslation } from '@/shared/i18n/core/useTranslation';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-8">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <h1 className="text-4xl font-bold text-gray-900">
        {t('home.title')}
      </h1>
      <p className="text-xl text-gray-600">
        {t('home.subtitle')}
      </p>
      <p className="text-gray-500">
        {t('home.description')}
      </p>
    </div>
  );
}
