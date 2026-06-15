'use client';

import { useTranslation } from '@/shared/i18n/core/useTranslation';
import { Building2 } from 'lucide-react';

export function PromoBanner() {
  const { t } = useTranslation();

  return (
    <section
      id="industrial-promo-banner"
      className="rounded-xl p-6 text-white relative overflow-hidden reveal active"
      style={{ background: 'var(--gova-primary)' }}
    >
      <div className="relative z-10 max-w-full md:max-w-[70%] lg:max-w-[60%]">
        <h3
          id="promo-banner-title"
          className="text-2xl font-bold"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {t('home.promoBanner.title')}
        </h3>
        <p id="promo-banner-text" className="text-sm opacity-90 mt-2">
          {t('home.promoBanner.text')}
        </p>
        <button
          id="promo-banner-cta"
          className="mt-4 px-4 py-2 rounded-lg font-bold text-sm transition-transform active:scale-95"
          style={{ background: 'var(--gova-google-yellow)', color: 'var(--gova-on-surface)' }}
        >
          {t('home.promoBanner.cta')}
        </button>
      </div>

      {/* Decorative icon background */}
      <div
        id="promo-banner-icon-bg"
        className="absolute end-0 top-0 h-full w-1/3 opacity-20 flex items-center justify-center pointer-events-none text-white"
      >
        <Building2 className="w-32 h-32 -rotate-12 scale-150" />
      </div>
    </section>
  );
}
