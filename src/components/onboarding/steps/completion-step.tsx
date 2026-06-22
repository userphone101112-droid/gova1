'use client';
import { CheckCircle2 } from 'lucide-react';

import { useOnboardingStore } from '@/lib/onboarding/store';
import { ONBOARDING, useTranslation } from '@/platform/ui';


export function CompletionStep() {
  const { completeOnboarding } = useOnboardingStore();
  const { t } = useTranslation();

  return (
    <div className="w-full max-w-4xl mx-auto text-center">
      <div className="mb-8">
        <div className="h-20 w-20 mx-auto rounded-full bg-success-container flex items-center justify-center mb-6">
          <CheckCircle2 className="h-10 w-10 text-success" />
        </div>
        <h1 data-ui-uuid={ONBOARDING.COMPLETION.TITLE.uuid}
          data-ui-lang-uuid={`lang-${ONBOARDING.COMPLETION.TITLE.uuid}`} className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
          {t('onboarding.completion.title')}
        </h1>
        <p data-ui-uuid={ONBOARDING.COMPLETION.DESCRIPTION.uuid}
          data-ui-lang-uuid={`lang-${ONBOARDING.COMPLETION.DESCRIPTION.uuid}`} className="text-lg text-muted-foreground mb-8">
          {t('onboarding.completion.description')}
        </p>
      </div>

      <button data-ui-uuid={ONBOARDING.COMPLETION.GO_TO_DASHBOARD_BUTTON.uuid}
          data-ui-lang-uuid={`lang-${ONBOARDING.COMPLETION.GO_TO_DASHBOARD_BUTTON.uuid}`} className="w-full sm:w-auto" onClick={completeOnboarding}>
        {t('onboarding.completion.goToDashboard')}
      </button>
    </div>
  );
}
