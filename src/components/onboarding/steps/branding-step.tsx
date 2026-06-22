'use client';
import { Image, Palette } from 'lucide-react';

import { useOnboardingStore } from '@/lib/onboarding/store';
import { ONBOARDING, useTranslation } from '@/platform/ui';


export function BrandingStep() {
  const {
    data: { branding },
    updateBranding,
  } = useOnboardingStore();
  const { t } = useTranslation();

  return (
    <div className="w-full">
      <h1 data-ui-uuid={ONBOARDING.BRANDING.TITLE.uuid}
          data-ui-lang-uuid={`lang-${ONBOARDING.BRANDING.TITLE.uuid}`} className="text-3xl font-bold tracking-tight mb-2">{t('onboarding.branding.title')}</h1>
      <p data-ui-uuid={ONBOARDING.BRANDING.DESCRIPTION.uuid}
          data-ui-lang-uuid={`lang-${ONBOARDING.BRANDING.DESCRIPTION.uuid}`} className="text-muted-foreground mb-8">{t('onboarding.branding.description')}</p>

      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="space-y-2">
          <span data-ui-uuid={ONBOARDING.BRANDING.STORE_TAGLINE_LABEL.uuid}
          data-ui-lang-uuid={`lang-${ONBOARDING.BRANDING.STORE_TAGLINE_LABEL.uuid}`}>{t('onboarding.branding.storeTagline')}</span>
          <input placeholder={t('onboarding.branding.storeTaglinePlaceholder')} value={branding.storeTagline || ''} onChange={(e) => updateBranding({ storeTagline: e.target.value })} />
        </div>

        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Image className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <span data-ui-uuid={ONBOARDING.BRANDING.LOGO_LABEL.uuid}
          data-ui-lang-uuid={`lang-${ONBOARDING.BRANDING.LOGO_LABEL.uuid}`} className="font-medium">{t('onboarding.branding.logo')}</span>
              <span data-ui-uuid={ONBOARDING.BRANDING.LOGO_SUBTITLE.uuid}
          data-ui-lang-uuid={`lang-${ONBOARDING.BRANDING.LOGO_SUBTITLE.uuid}`} className="text-sm text-muted-foreground">{t('onboarding.branding.logoSubtitle')}</span>
            </div>
            <button>
              {t('onboarding.branding.upload')}
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Palette className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <span data-ui-uuid={ONBOARDING.BRANDING.PRIMARY_COLOR_LABEL.uuid}
          data-ui-lang-uuid={`lang-${ONBOARDING.BRANDING.PRIMARY_COLOR_LABEL.uuid}`} className="font-medium">{t('onboarding.branding.primaryColor')}</span>
              <span data-ui-uuid={ONBOARDING.BRANDING.PRIMARY_COLOR_SUBTITLE.uuid}
          data-ui-lang-uuid={`lang-${ONBOARDING.BRANDING.PRIMARY_COLOR_SUBTITLE.uuid}`} className="text-sm text-muted-foreground">{t('onboarding.branding.primaryColorSubtitle')}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary" />
          </div>
        </div>
      </div>
    </div>
  );
}
