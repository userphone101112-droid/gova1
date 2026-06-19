'use client';

import { Shield, Smartphone, Lock, Sparkles } from 'lucide-react';

import { UiDiv, UiSpan, useTranslation } from '@/platform/ui';
import { COMMON_LAYOUT } from '@/platform/ui/registry/categories';
import { AUTH } from '@/platform/ui/registry/features/auth';

interface AuthHeroProps {
  variant: 'login' | 'registration';
}

export function AuthHero({ variant }: AuthHeroProps) {
  const { t } = useTranslation();

  const quoteIdentity =
    variant === 'login' ? AUTH.LOGIN.HERO_QUOTE : AUTH.REGISTRATION.HEADING;
  const footerIdentity =
    variant === 'login' ? AUTH.LOGIN.HERO_FOOTER : AUTH.REGISTRATION.DESCRIPTION;

  return (
    <UiDiv
      ui={AUTH.SHARED.HERO}
      className="auth-hero hidden lg:flex flex-col justify-between relative overflow-hidden"
    >
      <UiDiv ui={AUTH.SHARED.HERO_DECOR} className="absolute inset-0 opacity-faint pointer-events-none">
        <UiDiv
          ui={COMMON_LAYOUT.WRAPPER}
          className="absolute top-20 start-20 w-72 h-72 rounded-full bg-primary-container blur-3xl"
        />
        <UiDiv
          ui={COMMON_LAYOUT.WRAPPER}
          className="absolute bottom-20 end-20 w-96 h-96 rounded-full bg-success-container blur-3xl"
        />
      </UiDiv>

      <UiDiv ui={AUTH.SHARED.BRAND_ROW} className="relative z-10 p-12">
        <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="flex items-center gap-3">
          <UiDiv
            ui={AUTH.SHARED.BRAND_ICON}
            className="w-10 h-10 rounded-xl bg-on-primary/10 backdrop-blur flex items-center justify-center"
          >
            <Sparkles className="h-5 w-5 text-on-primary" />
          </UiDiv>
          <UiSpan ui={AUTH.REGISTRATION.BRAND_NAME} className="type-title-lg text-on-primary">
            {t(AUTH.REGISTRATION.BRAND_NAME)}
          </UiSpan>
        </UiDiv>
      </UiDiv>

      <UiDiv ui={AUTH.SHARED.HERO_QUOTE_BLOCK} className="relative z-10 px-12 pb-12">
        <blockquote className="space-y-4">
          <p className="type-headline-md text-on-primary opacity-decorative leading-relaxed">
            &ldquo;{t(quoteIdentity)}&rdquo;
          </p>
          <footer className="type-body-sm text-on-primary opacity-muted">
            {t(footerIdentity)}
          </footer>
        </blockquote>
      </UiDiv>

      <UiDiv ui={AUTH.SHARED.HERO_HIGHLIGHTS} className="relative z-10 px-12 pb-12">
        <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="flex flex-wrap gap-6">
          <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="flex items-center gap-2 text-on-primary opacity-muted type-body-sm">
            <Shield className="h-4 w-4" />
            {t(AUTH.SHARED.HIGHLIGHT_SECURITY)}
          </UiDiv>
          <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="flex items-center gap-2 text-on-primary opacity-muted type-body-sm">
            <Smartphone className="h-4 w-4" />
            {t(AUTH.SHARED.HIGHLIGHT_PHONE)}
          </UiDiv>
          <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="flex items-center gap-2 text-on-primary opacity-muted type-body-sm">
            <Lock className="h-4 w-4" />
            {t(AUTH.SHARED.HIGHLIGHT_ENCRYPTED)}
          </UiDiv>
        </UiDiv>
      </UiDiv>
    </UiDiv>
  );
}
