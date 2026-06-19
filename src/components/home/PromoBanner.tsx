'use client';

import { useTranslation } from '@/platform/ui';
import { Building2 } from 'lucide-react';
import { UiButton, UiHeader, UiLabel, UiImage, UiSection, UiDiv } from '@/platform/ui';
import { HOME } from '@/platform/ui';

export function PromoBanner() {
  const { t } = useTranslation();

  return (
    <UiSection
      ui={HOME.PROMO_BANNER.CONTAINER}
      id="industrial-promo-banner"
      className="rounded-xl p-6 text-on-primary relative overflow-hidden reveal active bg-primary"
    >
      <UiDiv
        ui={HOME.PROMO_BANNER.CONTENT_WRAPPER}
        className="relative z-10 max-w-full md:max-w-2/3 lg:max-w-3/5"
      >
        <UiImage
          ui={HOME.PROMO_BANNER.LOGO}
          src="/images/logos/logo-full.webp"
          alt={t(HOME.PROMO_BANNER.LOGO)}
          width={120}
          height={48}
          className="mb-4 h-12 w-auto"
          priority
        />
        <UiHeader
          ui={HOME.PROMO_BANNER.TITLE}
          id="promo-banner-title"
          level={3}
          className="text-2xl font-bold font-sans"
        >
          {t(HOME.PROMO_BANNER.TITLE)}
        </UiHeader>
        <UiLabel
          ui={HOME.PROMO_BANNER.DESCRIPTION}
          id="promo-banner-text"
          className="text-sm opacity-90 mt-2"
        >
          {t(HOME.PROMO_BANNER.DESCRIPTION)}
        </UiLabel>
        <UiButton
          ui={HOME.PROMO_BANNER.ACTION_BUTTON}
          id="promo-banner-cta"
          className="mt-4 px-4 py-2 rounded-lg font-bold text-sm transition-transform active:scale-95 bg-brand-yellow text-on-surface"
        >
          {t(HOME.PROMO_BANNER.ACTION_BUTTON)}
        </UiButton>
      </UiDiv>

      <UiDiv
        ui={HOME.PROMO_BANNER.DECORATIVE_BACKGROUND}
        id="promo-banner-icon-bg"
        className="absolute end-0 top-0 h-full w-1/3 opacity-20 flex items-center justify-center pointer-events-none text-on-primary"
      >
        <Building2 className="w-32 h-32 -rotate-12 scale-150" />
      </UiDiv>
    </UiSection>
  );
}
