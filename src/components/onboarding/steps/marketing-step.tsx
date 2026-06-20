'use client';

import { UiDiv, UiH1, UiP, UiCheckbox, UiLabel, UiCard, COMMON_LAYOUT, COMMON_TYPOGRAPHY, COMMON_FORMS, COMMON_COMPONENTS, ONBOARDING, useTranslation } from '@/platform/ui';
import { useOnboardingStore } from '@/lib/onboarding/store';
import { Share, Users, TrendingUp } from 'lucide-react';

export function MarketingStep() {
  const {
    data: { marketing },
    updateMarketing,
  } = useOnboardingStore();
  const { t } = useTranslation();

  const toggleOption = (id: string) => {
    updateMarketing({
      enabledFeatures: (marketing.enabledFeatures || []).includes(id as any)
        ? (marketing.enabledFeatures || []).filter((fid) => fid !== (id as any))
        : [...(marketing.enabledFeatures || []), id as any],
    });
  };

  return (
    <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="w-full">
      <UiH1 ui={ONBOARDING.MARKETING.TITLE} className="text-3xl font-bold tracking-tight mb-2">{t(ONBOARDING.MARKETING.TITLE)}</UiH1>
      <UiP ui={ONBOARDING.MARKETING.DESCRIPTION} className="text-muted-foreground mb-8">{t(ONBOARDING.MARKETING.DESCRIPTION)}</UiP>

      <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="space-y-4 max-w-4xl mx-auto">
        <UiCard ui={COMMON_COMPONENTS.CARD.CONTAINER} className="p-6 cursor-pointer" onClick={() => toggleOption('email-marketing')}>
          <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="flex items-start gap-4">
            <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="rounded-full bg-primary/10 p-3">
              <Users className="h-6 w-6 text-primary" />
            </UiDiv>
            <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="flex-1">
              <UiLabel ui={COMMON_TYPOGRAPHY.P} className="font-medium">{t(ONBOARDING.MARKETING.EMAIL_MARKETING_LABEL)}</UiLabel>
              <UiLabel ui={COMMON_TYPOGRAPHY.P} className="text-sm text-muted-foreground">{t(ONBOARDING.MARKETING.EMAIL_MARKETING_SUBTITLE)}</UiLabel>
            </UiDiv>
            <UiCheckbox
              ui={COMMON_FORMS.CHECKBOX}
              checked={(marketing.enabledFeatures || []).includes('email-marketing' as any)}
            />
          </UiDiv>
        </UiCard>

        <UiCard ui={COMMON_COMPONENTS.CARD.CONTAINER} className="p-6 cursor-pointer" onClick={() => toggleOption('social-sharing')}>
          <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="flex items-start gap-4">
            <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="rounded-full bg-primary/10 p-3">
              <Share className="h-6 w-6 text-primary" />
            </UiDiv>
            <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="flex-1">
              <UiLabel ui={COMMON_TYPOGRAPHY.P} className="font-medium">{t(ONBOARDING.MARKETING.SOCIAL_SHARING_LABEL)}</UiLabel>
              <UiLabel ui={COMMON_TYPOGRAPHY.P} className="text-sm text-muted-foreground">{t(ONBOARDING.MARKETING.SOCIAL_SHARING_SUBTITLE)}</UiLabel>
            </UiDiv>
            <UiCheckbox
              ui={COMMON_FORMS.CHECKBOX}
              checked={(marketing.enabledFeatures || []).includes('social-sharing' as any)}
            />
          </UiDiv>
        </UiCard>

        <UiCard ui={COMMON_COMPONENTS.CARD.CONTAINER} className="p-6 cursor-pointer" onClick={() => toggleOption('reviews')}>
          <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="flex items-start gap-4">
            <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="rounded-full bg-primary/10 p-3">
              <TrendingUp className="h-6 w-6 text-primary" />
            </UiDiv>
            <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="flex-1">
              <UiLabel ui={COMMON_TYPOGRAPHY.P} className="font-medium">{t(ONBOARDING.MARKETING.PRODUCT_REVIEWS_LABEL)}</UiLabel>
              <UiLabel ui={COMMON_TYPOGRAPHY.P} className="text-sm text-muted-foreground">{t(ONBOARDING.MARKETING.PRODUCT_REVIEWS_SUBTITLE)}</UiLabel>
            </UiDiv>
            <UiCheckbox
              ui={COMMON_FORMS.CHECKBOX}
              checked={(marketing.enabledFeatures || []).includes('reviews' as any)}
            />
          </UiDiv>
        </UiCard>
      </UiDiv>
    </UiDiv>
  );
}
