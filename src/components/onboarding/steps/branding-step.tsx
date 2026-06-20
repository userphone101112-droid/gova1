'use client';

import { UiDiv, UiH1, UiP, UiInput, UiLabel, UiCard, UiButton, COMMON_LAYOUT, COMMON_TYPOGRAPHY, COMMON_FORMS, COMMON_COMPONENTS, ONBOARDING, useTranslation } from '@/platform/ui';
import { useOnboardingStore } from '@/lib/onboarding/store';
import { Image, Palette } from 'lucide-react';

export function BrandingStep() {
  const {
    data: { branding },
    updateBranding,
  } = useOnboardingStore();
  const { t } = useTranslation();

  return (
    <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="w-full">
      <UiH1 ui={ONBOARDING.BRANDING.TITLE} className="text-3xl font-bold tracking-tight mb-2">{t(ONBOARDING.BRANDING.TITLE)}</UiH1>
      <UiP ui={ONBOARDING.BRANDING.DESCRIPTION} className="text-muted-foreground mb-8">{t(ONBOARDING.BRANDING.DESCRIPTION)}</UiP>

      <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="space-y-6 max-w-4xl mx-auto">
        <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="space-y-2">
          <UiLabel ui={COMMON_FORMS.LABEL}>{t(ONBOARDING.BRANDING.STORE_TAGLINE_LABEL)}</UiLabel>
          <UiInput
            ui={COMMON_FORMS.INPUT}
            placeholder={t(ONBOARDING.BRANDING.STORE_TAGLINE_PLACEHOLDER)}
            value={branding.storeTagline || ''}
            onChange={(e) => updateBranding({ storeTagline: e.target.value })}
          />
        </UiDiv>

        <UiCard ui={COMMON_COMPONENTS.CARD.CONTAINER} className="p-6">
          <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="flex items-start gap-4">
            <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="rounded-full bg-primary/10 p-3">
              <Image className="h-6 w-6 text-primary" />
            </UiDiv>
            <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="flex-1">
              <UiLabel ui={COMMON_TYPOGRAPHY.P} className="font-medium">{t(ONBOARDING.BRANDING.LOGO_LABEL)}</UiLabel>
              <UiLabel ui={COMMON_TYPOGRAPHY.P} className="text-sm text-muted-foreground">{t(ONBOARDING.BRANDING.LOGO_SUBTITLE)}</UiLabel>
            </UiDiv>
            <UiButton
              ui={COMMON_FORMS.BUTTON}
              variant="ghost"
            >
              {t(ONBOARDING.BRANDING.UPLOAD_BUTTON)}
            </UiButton>
          </UiDiv>
        </UiCard>

        <UiCard ui={COMMON_COMPONENTS.CARD.CONTAINER} className="p-6">
          <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="flex items-start gap-4">
            <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="rounded-full bg-primary/10 p-3">
              <Palette className="h-6 w-6 text-primary" />
            </UiDiv>
            <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="flex-1">
              <UiLabel ui={COMMON_TYPOGRAPHY.P} className="font-medium">{t(ONBOARDING.BRANDING.PRIMARY_COLOR_LABEL)}</UiLabel>
              <UiLabel ui={COMMON_TYPOGRAPHY.P} className="text-sm text-muted-foreground">{t(ONBOARDING.BRANDING.PRIMARY_COLOR_SUBTITLE)}</UiLabel>
            </UiDiv>
            <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="w-10 h-10 rounded-full bg-primary" />
          </UiDiv>
        </UiCard>
      </UiDiv>
    </UiDiv>
  );
}
