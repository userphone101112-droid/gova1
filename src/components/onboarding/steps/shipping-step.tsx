'use client';

import { UiDiv, UiH1, UiP, UiInput, UiLabel, UiTextarea, UiCheckbox, COMMON_LAYOUT, COMMON_FORMS, ONBOARDING, useTranslation } from '@/platform/ui';
import { useOnboardingStore } from '@/lib/onboarding/store';

export function ShippingStep() {
  const {
    data: { shipping },
    updateShipping,
  } = useOnboardingStore();
  const { t } = useTranslation();

  return (
    <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="w-full">
      <UiH1 ui={ONBOARDING.SHIPPING.TITLE} className="text-3xl font-bold tracking-tight mb-2">{t(ONBOARDING.SHIPPING.TITLE)}</UiH1>
      <UiP ui={ONBOARDING.SHIPPING.DESCRIPTION} className="text-muted-foreground mb-8">{t(ONBOARDING.SHIPPING.DESCRIPTION)}</UiP>

      <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="space-y-6 max-w-4xl mx-auto">
        <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="space-y-2">
          <UiLabel ui={ONBOARDING.SHIPPING.COUNTRY_LABEL}>{t(ONBOARDING.SHIPPING.COUNTRY_LABEL)}</UiLabel>
          <UiInput
            ui={COMMON_FORMS.INPUT}
            placeholder={t(ONBOARDING.SHIPPING.COUNTRY_PLACEHOLDER)}
            value={shipping.shippingFromCountry || ''}
            onChange={(e) => updateShipping({ shippingFromCountry: e.target.value })}
          />
        </UiDiv>

        <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="space-y-2">
          <UiLabel ui={ONBOARDING.SHIPPING.CITY_LABEL}>{t(ONBOARDING.SHIPPING.CITY_LABEL)}</UiLabel>
          <UiInput
            ui={COMMON_FORMS.INPUT}
            placeholder={t(ONBOARDING.SHIPPING.CITY_PLACEHOLDER)}
            value={shipping.shippingFromCity || ''}
            onChange={(e) => updateShipping({ shippingFromCity: e.target.value })}
          />
        </UiDiv>

        <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="space-y-2">
          <UiLabel ui={ONBOARDING.SHIPPING.POSTAL_CODE_LABEL}>{t(ONBOARDING.SHIPPING.POSTAL_CODE_LABEL)}</UiLabel>
          <UiInput
            ui={COMMON_FORMS.INPUT}
            placeholder={t(ONBOARDING.SHIPPING.POSTAL_CODE_PLACEHOLDER)}
            value={shipping.shippingFromPostal || ''}
            onChange={(e) => updateShipping({ shippingFromPostal: e.target.value })}
          />
        </UiDiv>

        <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="space-y-2">
          <UiLabel ui={ONBOARDING.SHIPPING.ADDRESS_LABEL}>{t(ONBOARDING.SHIPPING.ADDRESS_LABEL)}</UiLabel>
          <UiTextarea
            ui={COMMON_FORMS.TEXTAREA}
            placeholder={t(ONBOARDING.SHIPPING.ADDRESS_PLACEHOLDER)}
            value={shipping.shippingFromAddress || ''}
            onChange={(e) => updateShipping({ shippingFromAddress: e.target.value })}
            rows={3}
          />
        </UiDiv>

        <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="space-y-4 pt-4">
          <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="flex items-center gap-2">
            <UiCheckbox
              ui={COMMON_FORMS.CHECKBOX}
              checked={shipping.offerFreeShipping || false}
              onCheckedChange={(checked) => updateShipping({ offerFreeShipping: checked as boolean })}
            />
            <UiLabel ui={ONBOARDING.SHIPPING.OFFER_FREE_SHIPPING_LABEL}>{t(ONBOARDING.SHIPPING.OFFER_FREE_SHIPPING_LABEL)}</UiLabel>
          </UiDiv>
        </UiDiv>
      </UiDiv>
    </UiDiv>
  );
}
