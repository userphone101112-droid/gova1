'use client';

import { UiDiv, UiH1, UiP, UiButton, COMMON_LAYOUT, ONBOARDING, useTranslation } from '@/platform/ui';
import { useOnboardingStore } from '@/lib/onboarding/store';
import { Rocket } from 'lucide-react';

export function WelcomeStep() {
  const { goToNextStep } = useOnboardingStore();
  const { t } = useTranslation();

  return (
    <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="w-full max-w-4xl mx-auto text-center">
      <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="mb-8">
        <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="h-20 w-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <Rocket className="h-10 w-10 text-primary" />
        </UiDiv>
        <UiH1 ui={ONBOARDING.WELCOME.TITLE} className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
          {t(ONBOARDING.WELCOME.TITLE)}
        </UiH1>
        <UiP ui={ONBOARDING.WELCOME.DESCRIPTION} className="text-lg text-muted-foreground mb-8">
          {t(ONBOARDING.WELCOME.DESCRIPTION)}
        </UiP>
      </UiDiv>

      <UiButton
        ui={ONBOARDING.WELCOME.GET_STARTED_BUTTON}
        size="lg"
        className="w-full sm:w-auto"
        onClick={goToNextStep}
      >
        {t(ONBOARDING.WELCOME.GET_STARTED_BUTTON)}
      </UiButton>
    </UiDiv>
  );
}
