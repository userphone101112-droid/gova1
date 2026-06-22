'use client';
import { useOnboardingStore } from '@/lib/onboarding/store';
import { ONBOARDING, useTranslation } from '@/platform/ui';


export function PoliciesStep() {
  const {
    data: { policies },
    updatePolicies,
  } = useOnboardingStore();
  const { t } = useTranslation();

  return (
    <div className="w-full">
      <h1 data-ui-uuid={ONBOARDING.POLICIES.TITLE.uuid}
          data-ui-lang-uuid={`lang-${ONBOARDING.POLICIES.TITLE.uuid}`} className="text-3xl font-bold tracking-tight mb-2">{t('onboarding.policies.title')}</h1>
      <p data-ui-uuid={ONBOARDING.POLICIES.DESCRIPTION.uuid}
          data-ui-lang-uuid={`lang-${ONBOARDING.POLICIES.DESCRIPTION.uuid}`} className="text-muted-foreground mb-8">{t('onboarding.policies.description')}</p>

      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="space-y-2">
          <span data-ui-uuid={ONBOARDING.POLICIES.RETURN_POLICY_LABEL.uuid}
          data-ui-lang-uuid={`lang-${ONBOARDING.POLICIES.RETURN_POLICY_LABEL.uuid}`}>{t('onboarding.policies.returnPolicy')}</span>
          <textarea placeholder={t('onboarding.policies.returnPolicyPlaceholder')} value={policies.returnPolicy || ''} onChange={(e) => updatePolicies({ returnPolicy: e.target.value })} rows={4} />
        </div>

        <div className="space-y-2">
          <span data-ui-uuid={ONBOARDING.POLICIES.REFUND_POLICY_LABEL.uuid}
          data-ui-lang-uuid={`lang-${ONBOARDING.POLICIES.REFUND_POLICY_LABEL.uuid}`}>{t('onboarding.policies.refundPolicy')}</span>
          <textarea placeholder={t('onboarding.policies.refundPolicyPlaceholder')} value={policies.refundPolicy || ''} onChange={(e) => updatePolicies({ refundPolicy: e.target.value })} rows={4} />
        </div>

        <div className="space-y-2">
          <span data-ui-uuid={ONBOARDING.POLICIES.PRIVACY_POLICY_LABEL.uuid}
          data-ui-lang-uuid={`lang-${ONBOARDING.POLICIES.PRIVACY_POLICY_LABEL.uuid}`}>{t('onboarding.policies.privacyPolicy')}</span>
          <textarea placeholder={t('onboarding.policies.privacyPolicyPlaceholder')} value={policies.privacyPolicy || ''} onChange={(e) => updatePolicies({ privacyPolicy: e.target.value })} rows={4} />
        </div>

        <div className="space-y-2">
          <span data-ui-uuid={ONBOARDING.POLICIES.TERMS_OF_SERVICE_LABEL.uuid}
          data-ui-lang-uuid={`lang-${ONBOARDING.POLICIES.TERMS_OF_SERVICE_LABEL.uuid}`}>{t('onboarding.policies.termsOfService')}</span>
          <textarea placeholder={t('onboarding.policies.termsOfServicePlaceholder')} value={policies.termsOfService || ''} onChange={(e) => updatePolicies({ termsOfService: e.target.value })} rows={4} />
        </div>
      </div>
    </div>
  );
}
