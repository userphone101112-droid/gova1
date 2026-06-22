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
    <div className="w-full">
      <h1 data-ui-uuid={ONBOARDING.TAX_INFO.TITLE.uuid} className="text-3xl font-bold tracking-tight mb-2">{t(ONBOARDING.TAX_INFO.TITLE)}</h1>
      <p data-ui-uuid={ONBOARDING.TAX_INFO.DESCRIPTION.uuid} className="text-muted-foreground mb-8">{t(ONBOARDING.TAX_INFO.DESCRIPTION)}</p>

      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="space-y-2">
          <span data-ui-uuid={ONBOARDING.TAX_INFO.TAX_ID_LABEL.uuid}>{t(ONBOARDING.TAX_INFO.TAX_ID_LABEL)}</span>
          <input placeholder={t(ONBOARDING.TAX_INFO.TAX_ID_PLACEHOLDER)} value={taxInfo.taxId || ''} onChange={(e) => updateTaxInfo({ taxId: e.target.value })} />
        </div>
      </div>
    </div>
  );
}
