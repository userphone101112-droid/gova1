'use client';
import { useOnboardingStore } from '@/lib/onboarding/store';
import { ONBOARDING, useTranslation } from '@/platform/ui';


export function TaxInfoStep() {
  const {
    data: { taxInfo },
    updateTaxInfo,
  } = useOnboardingStore();
  const { t } = useTranslation();

  return (
    <div data-ui-uuid={ONBOARDING.SHELL.TAX_INFO_TITLE_CONTAINER_L14.uuid} className="w-full">
      <h1 data-ui-uuid={ONBOARDING.TAX_INFO.TITLE.uuid} className="text-3xl font-bold tracking-tight mb-2">{t(ONBOARDING.TAX_INFO.TITLE)}</h1>
      <p data-ui-uuid={ONBOARDING.TAX_INFO.DESCRIPTION.uuid} className="text-muted-foreground mb-8">{t(ONBOARDING.TAX_INFO.DESCRIPTION)}</p>

      <div data-ui-uuid={ONBOARDING.SHELL.TAX_INFO_TAX_ID_LABEL_CONTAINER_L18.uuid} className="space-y-6 max-w-4xl mx-auto">
        <div data-ui-uuid={ONBOARDING.SHELL.TAX_INFO_TAX_ID_LABEL_CONTAINER_L19.uuid} className="space-y-2">
          <span data-ui-uuid={ONBOARDING.TAX_INFO.TAX_ID_LABEL.uuid}>{t(ONBOARDING.TAX_INFO.TAX_ID_LABEL)}</span>
          <input data-ui-uuid={ONBOARDING.TAX_INFO.TAX_ID_INPUT.uuid} placeholder={t(ONBOARDING.TAX_INFO.TAX_ID_PLACEHOLDER)} value={taxInfo.taxId || ''} onChange={(e) => updateTaxInfo({ taxId: e.target.value })} />
        </div>
      </div>
    </div>
  );
}
