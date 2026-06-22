'use client';

import { useOnboardingStore } from '@/lib/onboarding/store';
import { ONBOARDING, useTranslation } from '@/platform/ui';

import { BrandingStep } from './steps/branding-step';
import { BusinessDetailsStep } from './steps/business-details-step';
import { CompletionStep } from './steps/completion-step';
import { IdentityVerificationStep } from './steps/identity-verification-step';
import { MarketingStep } from './steps/marketing-step';
import { PaymentsStep } from './steps/payments-step';
import { PoliciesStep } from './steps/policies-step';
import { PreferencesStep } from './steps/preferences-step';
import { ProductsStep } from './steps/products-step';
import { ShippingStep } from './steps/shipping-step';
import { StoreInfoStep } from './steps/store-info-step';
import { TaxInfoStep } from './steps/tax-info-step';
import { WelcomeStep } from './steps/welcome-step';

const STEP_IDS = [
  'welcome',
  'store-info',
  'business-details',
  'identity-verification',
  'products',
  'shipping',
  'payments',
  'policies',
  'branding',
  'preferences',
  'tax-info',
  'marketing',
  'completion',
] as const;

const STEP_COMPONENTS: Record<(typeof STEP_IDS)[number], React.ComponentType> = {
  'welcome': WelcomeStep,
  'store-info': StoreInfoStep,
  'business-details': BusinessDetailsStep,
  'identity-verification': IdentityVerificationStep,
  'products': ProductsStep,
  'shipping': ShippingStep,
  'payments': PaymentsStep,
  'policies': PoliciesStep,
  'branding': BrandingStep,
  'preferences': PreferencesStep,
  'tax-info': TaxInfoStep,
  'marketing': MarketingStep,
  'completion': CompletionStep,
};

const TOTAL_STEPS = STEP_IDS.length;

export function OnboardingPage() {
  const { currentStep, goToNextStep, goToPreviousStep } = useOnboardingStore();
  const { t } = useTranslation();
  const currentStepIndex = STEP_IDS.indexOf(currentStep);
  const CurrentStepComponent = STEP_COMPONENTS[currentStep];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === TOTAL_STEPS - 1;
  const progress = ((currentStepIndex) / (TOTAL_STEPS - 1)) * 100;

  return (
    <main>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
        <div className="w-full px-4 sm:px-6 py-6 sm:py-8">
          <div className="max-w-5xl w-full mx-auto shadow-xl overflow-hidden">
            {/* Progress Bar */}
            {!isLastStep && (
              <div className="h-2 bg-muted">
                <div className="h-full bg-primary transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
              </div>
            )}

            <div className="p-4 sm:p-6 md:p-10">
              {CurrentStepComponent && <CurrentStepComponent />}
            </div>

            {/* Navigation Buttons */}
            {!isLastStep && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-6 md:p-10 border-t border-outline-variant bg-surface-container-low/50">
                {!isFirstStep ? (
                  <button data-ui-uuid={ONBOARDING.COMMON.PREVIOUS_BUTTON.uuid}
          data-ui-lang-uuid={`lang-${ONBOARDING.COMMON.PREVIOUS_BUTTON.uuid}`} onClick={goToPreviousStep}>
                    {t('onboarding.common.previous')}
                  </button>
                ) : (
                  <div />
                )}
                <button data-ui-uuid={ONBOARDING.COMMON.NEXT_BUTTON.uuid}
          data-ui-lang-uuid={`lang-${ONBOARDING.COMMON.NEXT_BUTTON.uuid}`} onClick={goToNextStep} className="w-full sm:w-auto">
                  {currentStepIndex === TOTAL_STEPS - 2 ? t('onboarding.common.finish') : t('onboarding.common.next')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default OnboardingPage;
