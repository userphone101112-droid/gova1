'use client';
import { useOnboardingStore } from '@/lib/onboarding/store';
import { ONBOARDING, useTranslation } from '@/platform/ui';


export function ShippingStep() {
  const {
    data: { shipping },
    updateShipping,
  } = useOnboardingStore();
  const { t } = useTranslation();

  return (
    <div className="w-full">
      <h1 data-ui-uuid={ONBOARDING.SHIPPING.TITLE.uuid} className="text-3xl font-bold tracking-tight mb-2">{t(ONBOARDING.SHIPPING.TITLE)}</h1>
      <p data-ui-uuid={ONBOARDING.SHIPPING.DESCRIPTION.uuid} className="text-muted-foreground mb-8">{t(ONBOARDING.SHIPPING.DESCRIPTION)}</p>

      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="space-y-2">
          <span data-ui-uuid={ONBOARDING.SHIPPING.COUNTRY_LABEL.uuid}>{t(ONBOARDING.SHIPPING.COUNTRY_LABEL)}</span>
          <input placeholder={t(ONBOARDING.SHIPPING.COUNTRY_PLACEHOLDER)} value={shipping.shippingFromCountry || ''} onChange={(e) => updateShipping({ shippingFromCountry: e.target.value })} />
        </div>

        <div className="space-y-2">
          <span data-ui-uuid={ONBOARDING.SHIPPING.CITY_LABEL.uuid}>{t(ONBOARDING.SHIPPING.CITY_LABEL)}</span>
          <input placeholder={t(ONBOARDING.SHIPPING.CITY_PLACEHOLDER)} value={shipping.shippingFromCity || ''} onChange={(e) => updateShipping({ shippingFromCity: e.target.value })} />
        </div>

        <div className="space-y-2">
          <span data-ui-uuid={ONBOARDING.SHIPPING.POSTAL_CODE_LABEL.uuid}>{t(ONBOARDING.SHIPPING.POSTAL_CODE_LABEL)}</span>
          <input placeholder={t(ONBOARDING.SHIPPING.POSTAL_CODE_PLACEHOLDER)} value={shipping.shippingFromPostal || ''} onChange={(e) => updateShipping({ shippingFromPostal: e.target.value })} />
        </div>

        <div className="space-y-2">
          <span data-ui-uuid={ONBOARDING.SHIPPING.ADDRESS_LABEL.uuid}>{t(ONBOARDING.SHIPPING.ADDRESS_LABEL)}</span>
          <textarea placeholder={t(ONBOARDING.SHIPPING.ADDRESS_PLACEHOLDER)} value={shipping.shippingFromAddress || ''} onChange={(e) => updateShipping({ shippingFromAddress: e.target.value })} rows={3} />
        </div>

        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={shipping.offerFreeShipping || false} onChange={(e) => updateShipping({ offerFreeShipping: e.target.checked })} />
            <span data-ui-uuid={ONBOARDING.SHIPPING.OFFER_FREE_SHIPPING_LABEL.uuid}>{t(ONBOARDING.SHIPPING.OFFER_FREE_SHIPPING_LABEL)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
