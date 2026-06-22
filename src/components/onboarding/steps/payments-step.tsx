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
    { id: 'credit-card', label: t('onboarding.payments.paymentMethodCreditCard') },
    { id: 'debit-card', label: t('onboarding.payments.paymentMethodDebitCard') },
    { id: 'paypal', label: t('onboarding.payments.paymentMethodPaypal') },
    { id: 'bank-transfer', label: t('onboarding.payments.paymentMethodBankTransfer') },
  ];

  const currencyOptions = [
    { id: 'USD', label: t('onboarding.payments.currencyUsd') },
    { id: 'EUR', label: t('onboarding.payments.currencyEur') },
    { id: 'GBP', label: t('onboarding.payments.currencyGbp') },
    { id: 'CAD', label: t('onboarding.payments.currencyCad') },
    { id: 'AUD', label: t('onboarding.payments.currencyAud') },
  ];

  return (
    <div className="w-full">
      <h1 data-ui-uuid={ONBOARDING.PAYMENTS.TITLE.uuid}
          data-ui-lang-uuid={`lang-${ONBOARDING.PAYMENTS.TITLE.uuid}`} className="text-3xl font-bold tracking-tight mb-2">{t('onboarding.payments.title')}</h1>
      <p data-ui-uuid={ONBOARDING.PAYMENTS.DESCRIPTION.uuid}
          data-ui-lang-uuid={`lang-${ONBOARDING.PAYMENTS.DESCRIPTION.uuid}`} className="text-muted-foreground mb-8">{t('onboarding.payments.description')}</p>

      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="space-y-2">
          <span data-ui-uuid={ONBOARDING.PAYMENTS.PAYMENT_METHODS_LABEL.uuid}
          data-ui-lang-uuid={`lang-${ONBOARDING.PAYMENTS.PAYMENT_METHODS_LABEL.uuid}`}>{t('onboarding.payments.paymentMethods')}</span>
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
          <span data-ui-uuid={ONBOARDING.PAYMENTS.CURRENCY_LABEL.uuid}
          data-ui-lang-uuid={`lang-${ONBOARDING.PAYMENTS.CURRENCY_LABEL.uuid}`}>{t('onboarding.payments.currency')}</span>
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
