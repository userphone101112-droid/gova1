'use client';
import { Building2 } from 'lucide-react';
import Image from 'next/image';

import { useTranslation, HOME } from '@/platform/ui';



export function PromoBanner() {
  const { t } = useTranslation();

  return (
    <section data-ui-uuid={HOME.PROMO_BANNER.CONTAINER.uuid} id="industrial-promo-banner" className="rounded-xl p-6 text-on-primary relative overflow-hidden reveal active bg-primary">
      <div data-ui-uuid={HOME.PROMO_BANNER.CONTENT_WRAPPER.uuid} className="relative z-10 max-w-full md:max-w-2/3 lg:max-w-3/5">
        <Image data-ui-uuid={HOME.PROMO_BANNER.LOGO.uuid} src="/images/logos/logo-full.webp" alt={t(HOME.PROMO_BANNER.LOGO)} width={120} height={48} className="mb-4 h-12 w-auto" priority />
        <h3 data-ui-uuid={HOME.PROMO_BANNER.TITLE.uuid} id="promo-banner-title" className="text-2xl font-bold font-sans">
          {t(HOME.PROMO_BANNER.TITLE)}
        </h3>
        <span data-ui-uuid={HOME.PROMO_BANNER.DESCRIPTION.uuid} id="promo-banner-text" className="text-sm opacity-90 mt-2">
          {t(HOME.PROMO_BANNER.DESCRIPTION)}
        </span>
        <button data-ui-uuid={HOME.PROMO_BANNER.ACTION_BUTTON.uuid} id="promo-banner-cta" className="mt-4 px-4 py-2 rounded-lg font-bold text-sm transition-transform active:scale-95 bg-brand-yellow text-on-surface">
          {t(HOME.PROMO_BANNER.ACTION_BUTTON)}
        </button>
      </div>

      <div data-ui-uuid={HOME.PROMO_BANNER.DECORATIVE_BACKGROUND.uuid} id="promo-banner-icon-bg" className="absolute end-0 top-0 h-full w-1/3 opacity-20 flex items-center justify-center pointer-events-none text-on-primary">
        <Building2 className="w-32 h-32 -rotate-12 scale-150" />
      </div>
    </section>
  );
}
