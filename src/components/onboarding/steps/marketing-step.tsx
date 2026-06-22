'use client';
import { Share, Users, TrendingUp } from 'lucide-react';

import { useOnboardingStore } from '@/lib/onboarding/store';
import { ONBOARDING, useTranslation } from '@/platform/ui';


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
    <div className="w-full">
      <h1 data-ui-uuid={ONBOARDING.MARKETING.TITLE.uuid} className="text-3xl font-bold tracking-tight mb-2">{t(ONBOARDING.MARKETING.TITLE)}</h1>
      <p data-ui-uuid={ONBOARDING.MARKETING.DESCRIPTION.uuid} className="text-muted-foreground mb-8">{t(ONBOARDING.MARKETING.DESCRIPTION)}</p>

      <div className="space-y-4 max-w-4xl mx-auto">
        <div className="p-6 cursor-pointer" onClick={() => toggleOption('email-marketing')}>
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <span data-ui-uuid={ONBOARDING.MARKETING.EMAIL_MARKETING_LABEL.uuid} className="font-medium">{t(ONBOARDING.MARKETING.EMAIL_MARKETING_LABEL)}</span>
              <span data-ui-uuid={ONBOARDING.MARKETING.EMAIL_MARKETING_SUBTITLE.uuid} className="text-sm text-muted-foreground">{t(ONBOARDING.MARKETING.EMAIL_MARKETING_SUBTITLE)}</span>
            </div>
            <input checked={(marketing.enabledFeatures || []).includes('email-marketing' as any)} />
          </div>
        </div>

        <div className="p-6 cursor-pointer" onClick={() => toggleOption('social-sharing')}>
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Share className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <span data-ui-uuid={ONBOARDING.MARKETING.SOCIAL_SHARING_LABEL.uuid} className="font-medium">{t(ONBOARDING.MARKETING.SOCIAL_SHARING_LABEL)}</span>
              <span data-ui-uuid={ONBOARDING.MARKETING.SOCIAL_SHARING_SUBTITLE.uuid} className="text-sm text-muted-foreground">{t(ONBOARDING.MARKETING.SOCIAL_SHARING_SUBTITLE)}</span>
            </div>
            <input checked={(marketing.enabledFeatures || []).includes('social-sharing' as any)} />
          </div>
        </div>

        <div className="p-6 cursor-pointer" onClick={() => toggleOption('reviews')}>
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-primary/10 p-3">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <span data-ui-uuid={ONBOARDING.MARKETING.PRODUCT_REVIEWS_LABEL.uuid} className="font-medium">{t(ONBOARDING.MARKETING.PRODUCT_REVIEWS_LABEL)}</span>
              <span data-ui-uuid={ONBOARDING.MARKETING.PRODUCT_REVIEWS_SUBTITLE.uuid} className="text-sm text-muted-foreground">{t(ONBOARDING.MARKETING.PRODUCT_REVIEWS_SUBTITLE)}</span>
            </div>
            <input checked={(marketing.enabledFeatures || []).includes('reviews' as any)} />
          </div>
        </div>
      </div>
    </div>
  );
}
