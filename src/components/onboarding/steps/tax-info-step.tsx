'use client';

import { UiDiv, UiH1, UiP, UiInput, UiLabel, COMMON_LAYOUT, COMMON_FORMS, ONBOARDING, useTranslation } from '@/platform/ui';
import { useOnboardingStore } from '@/lib/onboarding/store';

export function TaxInfoStep() {
  const {
    data: { taxInfo },
    updateTaxInfo,
  } = useOnboardingStore();
  const { t } = useTranslation();

  return (
    <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="w-full">
      <UiH1 ui={ONBOARDING.TAX_INFO.TITLE} className="text-3xl font-bold tracking-tight mb-2">{t(ONBOARDING.TAX_INFO.TITLE)}</UiH1>
      <UiP ui={ONBOARDING.TAX_INFO.DESCRIPTION} className="text-muted-foreground mb-8">{t(ONBOARDING.TAX_INFO.DESCRIPTION)}</UiP>

      <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="space-y-6 max-w-4xl mx-auto">
        <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="space-y-2">
          <UiLabel ui={COMMON_FORMS.LABEL}>{t(ONBOARDING.TAX_INFO.TAX_ID_LABEL)}</UiLabel>
          <UiInput
            ui={COMMON_FORMS.INPUT}
            placeholder={t(ONBOARDING.TAX_INFO.TAX_ID_PLACEHOLDER)}
            value={taxInfo.taxId || ''}
            onChange={(e) => updateTaxInfo({ taxId: e.target.value })}
          />
        </UiDiv>
      </UiDiv>
    </UiDiv>
  );
}
