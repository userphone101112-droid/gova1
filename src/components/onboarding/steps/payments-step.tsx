'use client';
import { useOnboardingStore } from '@/lib/onboarding/store';
import { ONBOARDING, useTranslation } from '@/platform/ui';


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
    <div className="w-full">
      <h1 data-ui-uuid={ONBOARDING.PAYMENTS.TITLE.uuid} className="text-3xl font-bold tracking-tight mb-2">{t(ONBOARDING.PAYMENTS.TITLE)}</h1>
      <p data-ui-uuid={ONBOARDING.PAYMENTS.DESCRIPTION.uuid} className="text-muted-foreground mb-8">{t(ONBOARDING.PAYMENTS.DESCRIPTION)}</p>

      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="space-y-2">
          <span data-ui-uuid={ONBOARDING.PAYMENTS.PAYMENT_METHODS_LABEL.uuid}>{t(ONBOARDING.PAYMENTS.PAYMENT_METHODS_LABEL)}</span>
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center gap-2">
                <input type="checkbox" data-ui-instance-id={method.id} checked={(payments.paymentMethods || []).includes(method.id as any)} onChange={(e) => {
        const checked = e.target.checked;
        const currentMethods = payments.paymentMethods || [];
        if (checked) {
            updatePayments({
                paymentMethods: [...currentMethods, method.id as any],
            });
        }
        else {
            updatePayments({
                paymentMethods: currentMethods.filter((id) => id !== method.id as any),
            });
        }
    }} />
                <span data-ui-instance-id={method.id}>{method.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <span data-ui-uuid={ONBOARDING.PAYMENTS.CURRENCY_LABEL.uuid}>{t(ONBOARDING.PAYMENTS.CURRENCY_LABEL)}</span>
          <select value={payments.currency || 'USD'} onChange={(e) => updatePayments({ currency: e.target.value })}>
            {currencyOptions.map((opt) => (
              <option data-ui-instance-id={opt.id} key={opt.id}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
