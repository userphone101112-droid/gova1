'use client';

import { UiDiv, UiH1, UiP, UiButton, COMMON_LAYOUT, COMMON_FORMS, ONBOARDING, useTranslation } from '@/platform/ui';
import { useOnboardingStore } from '@/lib/onboarding/store';
import { CheckCircle2 } from 'lucide-react';

export function CompletionStep() {
  const { completeOnboarding } = useOnboardingStore();
  const { t } = useTranslation();

  return (
    <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="w-full max-w-4xl mx-auto text-center">
      <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="mb-8">
        <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="h-20 w-20 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-6">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </UiDiv>
        <UiH1 ui={ONBOARDING.COMPLETION.TITLE} className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
          {t(ONBOARDING.COMPLETION.TITLE)}
        </UiH1>
        <UiP ui={ONBOARDING.COMPLETION.DESCRIPTION} className="text-lg text-muted-foreground mb-8">
          {t(ONBOARDING.COMPLETION.DESCRIPTION)}
        </UiP>
      </UiDiv>

      <UiButton
        ui={COMMON_FORMS.BUTTON}
        size="lg"
        className="w-full sm:w-auto"
        onClick={completeOnboarding}
      >
        {t(ONBOARDING.COMPLETION.GO_TO_DASHBOARD_BUTTON)}
      </UiButton>
    </UiDiv>
  );
}
