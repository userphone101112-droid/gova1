'use client';
import { Rocket } from 'lucide-react';

import { useOnboardingStore } from '@/lib/onboarding/store';
import { ONBOARDING, useTranslation } from '@/platform/ui';


export function WelcomeStep() {
  const { goToNextStep } = useOnboardingStore();
  const { t } = useTranslation();

  return (
    <div data-ui-uuid={ONBOARDING.SHELL.WELCOME_TITLE_CONTAINER_L13.uuid} className="w-full max-w-4xl mx-auto text-center">
      <div data-ui-uuid={ONBOARDING.SHELL.WELCOME_TITLE_CONTAINER_L14.uuid} className="mb-8">
        <div data-ui-uuid={ONBOARDING.SHELL.WELCOME_TITLE_CONTAINER_L15.uuid} className="h-20 w-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <Rocket className="h-10 w-10 text-primary" />
        </div>
        <h1 data-ui-uuid={ONBOARDING.WELCOME.TITLE.uuid} className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
          {t(ONBOARDING.WELCOME.TITLE)}
        </h1>
        <p data-ui-uuid={ONBOARDING.WELCOME.DESCRIPTION.uuid} className="text-lg text-muted-foreground mb-8">
          {t(ONBOARDING.WELCOME.DESCRIPTION)}
        </p>
      </div>

      <button data-ui-uuid={ONBOARDING.WELCOME.GET_STARTED_BUTTON.uuid} className="w-full sm:w-auto" onClick={goToNextStep}>
        {t(ONBOARDING.WELCOME.GET_STARTED_BUTTON)}
      </button>
    </div>
  );
}
