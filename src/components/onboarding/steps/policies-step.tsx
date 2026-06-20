'use client';

import { UiDiv, UiH1, UiP, UiTextarea, UiLabel, COMMON_LAYOUT, COMMON_FORMS, ONBOARDING, useTranslation } from '@/platform/ui';
import { useOnboardingStore } from '@/lib/onboarding/store';

export function PoliciesStep() {
  const {
    data: { policies },
    updatePolicies,
  } = useOnboardingStore();
  const { t } = useTranslation();

  return (
    <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="w-full">
      <UiH1 ui={ONBOARDING.POLICIES.TITLE} className="text-3xl font-bold tracking-tight mb-2">{t(ONBOARDING.POLICIES.TITLE)}</UiH1>
      <UiP ui={ONBOARDING.POLICIES.DESCRIPTION} className="text-muted-foreground mb-8">{t(ONBOARDING.POLICIES.DESCRIPTION)}</UiP>

      <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="space-y-6 max-w-4xl mx-auto">
        <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="space-y-2">
          <UiLabel ui={ONBOARDING.POLICIES.RETURN_POLICY_LABEL}>{t(ONBOARDING.POLICIES.RETURN_POLICY_LABEL)}</UiLabel>
          <UiTextarea
            ui={COMMON_FORMS.TEXTAREA}
            placeholder={t(ONBOARDING.POLICIES.RETURN_POLICY_PLACEHOLDER)}
            value={policies.returnPolicy || ''}
            onChange={(e) => updatePolicies({ returnPolicy: e.target.value })}
            rows={4}
          />
        </UiDiv>

        <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="space-y-2">
          <UiLabel ui={ONBOARDING.POLICIES.REFUND_POLICY_LABEL}>{t(ONBOARDING.POLICIES.REFUND_POLICY_LABEL)}</UiLabel>
          <UiTextarea
            ui={COMMON_FORMS.TEXTAREA}
            placeholder={t(ONBOARDING.POLICIES.REFUND_POLICY_PLACEHOLDER)}
            value={policies.refundPolicy || ''}
            onChange={(e) => updatePolicies({ refundPolicy: e.target.value })}
            rows={4}
          />
        </UiDiv>

        <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="space-y-2">
          <UiLabel ui={ONBOARDING.POLICIES.PRIVACY_POLICY_LABEL}>{t(ONBOARDING.POLICIES.PRIVACY_POLICY_LABEL)}</UiLabel>
          <UiTextarea
            ui={COMMON_FORMS.TEXTAREA}
            placeholder={t(ONBOARDING.POLICIES.PRIVACY_POLICY_PLACEHOLDER)}
            value={policies.privacyPolicy || ''}
            onChange={(e) => updatePolicies({ privacyPolicy: e.target.value })}
            rows={4}
          />
        </UiDiv>

        <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="space-y-2">
          <UiLabel ui={ONBOARDING.POLICIES.TERMS_OF_SERVICE_LABEL}>{t(ONBOARDING.POLICIES.TERMS_OF_SERVICE_LABEL)}</UiLabel>
          <UiTextarea
            ui={COMMON_FORMS.TEXTAREA}
            placeholder={t(ONBOARDING.POLICIES.TERMS_OF_SERVICE_PLACEHOLDER)}
            value={policies.termsOfService || ''}
            onChange={(e) => updatePolicies({ termsOfService: e.target.value })}
            rows={4}
          />
        </UiDiv>
      </UiDiv>
    </UiDiv>
  );
}
