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
      <h1 data-ui-uuid={ONBOARDING.POLICIES.TITLE.uuid} className="text-3xl font-bold tracking-tight mb-2">{t(ONBOARDING.POLICIES.TITLE)}</h1>
      <p data-ui-uuid={ONBOARDING.POLICIES.DESCRIPTION.uuid} className="text-muted-foreground mb-8">{t(ONBOARDING.POLICIES.DESCRIPTION)}</p>

      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="space-y-2">
          <span data-ui-uuid={ONBOARDING.POLICIES.RETURN_POLICY_LABEL.uuid}>{t(ONBOARDING.POLICIES.RETURN_POLICY_LABEL)}</span>
          <textarea placeholder={t(ONBOARDING.POLICIES.RETURN_POLICY_PLACEHOLDER)} value={policies.returnPolicy || ''} onChange={(e) => updatePolicies({ returnPolicy: e.target.value })} rows={4} />
        </div>

        <div className="space-y-2">
          <span data-ui-uuid={ONBOARDING.POLICIES.REFUND_POLICY_LABEL.uuid}>{t(ONBOARDING.POLICIES.REFUND_POLICY_LABEL)}</span>
          <textarea placeholder={t(ONBOARDING.POLICIES.REFUND_POLICY_PLACEHOLDER)} value={policies.refundPolicy || ''} onChange={(e) => updatePolicies({ refundPolicy: e.target.value })} rows={4} />
        </div>

        <div className="space-y-2">
          <span data-ui-uuid={ONBOARDING.POLICIES.PRIVACY_POLICY_LABEL.uuid}>{t(ONBOARDING.POLICIES.PRIVACY_POLICY_LABEL)}</span>
          <textarea placeholder={t(ONBOARDING.POLICIES.PRIVACY_POLICY_PLACEHOLDER)} value={policies.privacyPolicy || ''} onChange={(e) => updatePolicies({ privacyPolicy: e.target.value })} rows={4} />
        </div>

        <div className="space-y-2">
          <span data-ui-uuid={ONBOARDING.POLICIES.TERMS_OF_SERVICE_LABEL.uuid}>{t(ONBOARDING.POLICIES.TERMS_OF_SERVICE_LABEL)}</span>
          <textarea placeholder={t(ONBOARDING.POLICIES.TERMS_OF_SERVICE_PLACEHOLDER)} value={policies.termsOfService || ''} onChange={(e) => updatePolicies({ termsOfService: e.target.value })} rows={4} />
        </div>
      </div>
    </div>
  );
}
