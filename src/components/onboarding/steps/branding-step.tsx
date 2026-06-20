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
    <div data-ui-uuid={ONBOARDING.SHELL.BRANDING_TITLE_CONTAINER_L16.uuid} className="w-full">
      <h1 data-ui-uuid={ONBOARDING.BRANDING.TITLE.uuid} className="text-3xl font-bold tracking-tight mb-2">{t(ONBOARDING.BRANDING.TITLE)}</h1>
      <p data-ui-uuid={ONBOARDING.BRANDING.DESCRIPTION.uuid} className="text-muted-foreground mb-8">{t(ONBOARDING.BRANDING.DESCRIPTION)}</p>

      <div data-ui-uuid={ONBOARDING.SHELL.BRANDING_STORE_TAGLINE_LABEL_CONTAINER_L20.uuid} className="space-y-6 max-w-4xl mx-auto">
        <div data-ui-uuid={ONBOARDING.SHELL.BRANDING_STORE_TAGLINE_LABEL_CONTAINER_L21.uuid} className="space-y-2">
          <span data-ui-uuid={ONBOARDING.BRANDING.STORE_TAGLINE_LABEL.uuid}>{t(ONBOARDING.BRANDING.STORE_TAGLINE_LABEL)}</span>
          <input data-ui-uuid={ONBOARDING.BRANDING.TAGLINE_INPUT.uuid} placeholder={t(ONBOARDING.BRANDING.STORE_TAGLINE_PLACEHOLDER)} value={branding.storeTagline || ''} onChange={(e) => updateBranding({ storeTagline: e.target.value })} />
        </div>

        <div data-ui-uuid={ONBOARDING.BRANDING.LOGO_CARD.uuid} className="p-6">
          <div data-ui-uuid={ONBOARDING.SHELL.BRANDING_LOGO_LABEL_CONTAINER_L27.uuid} className="flex items-start gap-4">
            <div data-ui-uuid={ONBOARDING.SHELL.BRANDING_LOGO_LABEL_CONTAINER_L28.uuid} className="rounded-full bg-primary/10 p-3">
              <Image className="h-6 w-6 text-primary" />
            </div>
            <div data-ui-uuid={ONBOARDING.SHELL.BRANDING_LOGO_LABEL_CONTAINER_L31.uuid} className="flex-1">
              <span data-ui-uuid={ONBOARDING.BRANDING.LOGO_LABEL.uuid} className="font-medium">{t(ONBOARDING.BRANDING.LOGO_LABEL)}</span>
              <span data-ui-uuid={ONBOARDING.BRANDING.LOGO_SUBTITLE.uuid} className="text-sm text-muted-foreground">{t(ONBOARDING.BRANDING.LOGO_SUBTITLE)}</span>
            </div>
            <button data-ui-uuid={ONBOARDING.BRANDING.LOGO_BUTTON.uuid}>
              {t(ONBOARDING.BRANDING.UPLOAD_BUTTON)}
            </button>
          </div>
        </div>

        <div data-ui-uuid={ONBOARDING.BRANDING.COLOR_CARD.uuid} className="p-6">
          <div data-ui-uuid={ONBOARDING.SHELL.BRANDING_PRIMARY_COLOR_LABEL_CONTAINER_L42.uuid} className="flex items-start gap-4">
            <div data-ui-uuid={ONBOARDING.SHELL.BRANDING_PRIMARY_COLOR_LABEL_CONTAINER_L43.uuid} className="rounded-full bg-primary/10 p-3">
              <Palette className="h-6 w-6 text-primary" />
            </div>
            <div data-ui-uuid={ONBOARDING.SHELL.BRANDING_PRIMARY_COLOR_LABEL_CONTAINER_L46.uuid} className="flex-1">
              <span data-ui-uuid={ONBOARDING.BRANDING.PRIMARY_COLOR_LABEL.uuid} className="font-medium">{t(ONBOARDING.BRANDING.PRIMARY_COLOR_LABEL)}</span>
              <span data-ui-uuid={ONBOARDING.BRANDING.PRIMARY_COLOR_SUBTITLE.uuid} className="text-sm text-muted-foreground">{t(ONBOARDING.BRANDING.PRIMARY_COLOR_SUBTITLE)}</span>
            </div>
            <div data-ui-uuid={ONBOARDING.SHELL.BRANDING_PRIMARY_COLOR_LABEL_CONTAINER_L50.uuid} className="w-10 h-10 rounded-full bg-primary" />
          </div>
        </div>
      </div>
    </div>
  );
}
