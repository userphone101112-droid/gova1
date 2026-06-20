'use client';

import { UiDiv, UiH1, UiP, UiLabel, UiSelect, UiOption, UiCheckbox, COMMON_LAYOUT, COMMON_FORMS, ONBOARDING, useTranslation } from '@/platform/ui';
import { useOnboardingStore } from '@/lib/onboarding/store';

export function PaymentsStep() {
  const {
    data: { payments },
    updatePayments,
  } = useOnboardingStore();
  const { t } = useTranslation();

  const paymentMethods = [
    { id: 'credit-card', label: t(ONBOARDING.PAYMENTS.PAYMENT_METHOD_CREDIT_CARD) },
    { id: 'debit-card', label: t(ONBOARDING.PAYMENTS.PAYMENT_METHOD_DEBIT_CARD) },
    { id: 'paypal', label: t(ONBOARDING.PAYMENTS.PAYMENT_METHOD_PAYPAL) },
    { id: 'bank-transfer', label: t(ONBOARDING.PAYMENTS.PAYMENT_METHOD_BANK_TRANSFER) },
  ];

  const currencyOptions = [
    { id: 'USD', label: t(ONBOARDING.PAYMENTS.CURRENCY_USD) },
    { id: 'EUR', label: t(ONBOARDING.PAYMENTS.CURRENCY_EUR) },
    { id: 'GBP', label: t(ONBOARDING.PAYMENTS.CURRENCY_GBP) },
    { id: 'CAD', label: t(ONBOARDING.PAYMENTS.CURRENCY_CAD) },
    { id: 'AUD', label: t(ONBOARDING.PAYMENTS.CURRENCY_AUD) },
  ];

  return (
    <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="w-full">
      <UiH1 ui={ONBOARDING.PAYMENTS.TITLE} className="text-3xl font-bold tracking-tight mb-2">{t(ONBOARDING.PAYMENTS.TITLE)}</UiH1>
      <UiP ui={ONBOARDING.PAYMENTS.DESCRIPTION} className="text-muted-foreground mb-8">{t(ONBOARDING.PAYMENTS.DESCRIPTION)}</UiP>

      <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="space-y-6 max-w-4xl mx-auto">
        <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="space-y-2">
          <UiLabel ui={ONBOARDING.PAYMENTS.PAYMENT_METHODS_LABEL}>{t(ONBOARDING.PAYMENTS.PAYMENT_METHODS_LABEL)}</UiLabel>
          <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="space-y-3">
            {paymentMethods.map((method) => (
              <UiDiv key={method.id} ui={COMMON_LAYOUT.CONTAINER} className="flex items-center gap-2">
                <UiCheckbox
                  ui={COMMON_FORMS.CHECKBOX}
                  checked={(payments.paymentMethods || []).includes(method.id as any)}
                  onCheckedChange={(checked) => {
                    const currentMethods = payments.paymentMethods || [];
                    if (checked) {
                      updatePayments({
                        paymentMethods: [...currentMethods, method.id as any],
                      });
                    } else {
                      updatePayments({
                        paymentMethods: currentMethods.filter((id) => id !== method.id as any),
                      });
                    }
                  }}
                />
                <UiLabel ui={COMMON_FORMS.LABEL}>{method.label}</UiLabel>
              </UiDiv>
            ))}
          </UiDiv>
        </UiDiv>

        <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="space-y-2">
          <UiLabel ui={ONBOARDING.PAYMENTS.CURRENCY_LABEL}>{t(ONBOARDING.PAYMENTS.CURRENCY_LABEL)}</UiLabel>
          <UiSelect
            ui={COMMON_FORMS.SELECT}
            value={payments.currency || 'USD'}
            onChange={(e) => updatePayments({ currency: e.target.value })}
          >
            {currencyOptions.map((opt) => (
              <UiOption key={opt.id} ui={COMMON_FORMS.OPTION}>{opt.label}</UiOption>
            ))}
          </UiSelect>
        </UiDiv>
      </UiDiv>
    </UiDiv>
  );
}
