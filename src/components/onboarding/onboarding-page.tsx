'use client';

import { UiMain, UiDiv, UiCard, UiButton, ONBOARDING, COMMON_LAYOUT, useTranslation } from '@/platform/ui';
import { useOnboardingStore } from '@/lib/onboarding/store';
import { WelcomeStep } from './steps/welcome-step';
import { StoreInfoStep } from './steps/store-info-step';
import { BusinessDetailsStep } from './steps/business-details-step';
import { IdentityVerificationStep } from './steps/identity-verification-step';
import { ProductsStep } from './steps/products-step';
import { ShippingStep } from './steps/shipping-step';
import { PaymentsStep } from './steps/payments-step';
import { PoliciesStep } from './steps/policies-step';
import { BrandingStep } from './steps/branding-step';
import { PreferencesStep } from './steps/preferences-step';
import { TaxInfoStep } from './steps/tax-info-step';
import { MarketingStep } from './steps/marketing-step';
import { CompletionStep } from './steps/completion-step';

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
    <UiMain ui={COMMON_LAYOUT.MAIN}>
      <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="min-h-screen bg-gradient-to-br from-background to-muted/30">
        <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="w-full px-4 sm:px-6 py-6 sm:py-8">
          <UiCard ui={ONBOARDING.ONBOARDING_PAGE.CONTAINER} className="max-w-5xl w-full mx-auto shadow-xl overflow-hidden">
            {/* Progress Bar */}
            {!isLastStep && (
              <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="h-2 bg-muted">
                <UiDiv
                  ui={COMMON_LAYOUT.CONTAINER}
                  className="h-full bg-primary transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </UiDiv>
            )}

            <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="p-4 sm:p-6 md:p-10">
              {CurrentStepComponent && <CurrentStepComponent />}
            </UiDiv>

            {/* Navigation Buttons */}
            {!isLastStep && (
              <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-6 md:p-10 border-t border-gray-200 bg-gray-50/50">
                {!isFirstStep ? (
                  <UiButton
                    ui={ONBOARDING.COMMON.PREVIOUS_BUTTON}
                    variant="ghost"
                    onClick={goToPreviousStep}
                  >
                    {t(ONBOARDING.COMMON.PREVIOUS_BUTTON)}
                  </UiButton>
                ) : (
                  <UiDiv ui={COMMON_LAYOUT.CONTAINER} />
                )}
                <UiButton
                  ui={ONBOARDING.COMMON.NEXT_BUTTON}
                  onClick={goToNextStep}
                  className="w-full sm:w-auto"
                >
                  {currentStepIndex === TOTAL_STEPS - 2 ? t(ONBOARDING.COMMON.FINISH_BUTTON) : t(ONBOARDING.COMMON.NEXT_BUTTON)}
                </UiButton>
              </UiDiv>
            )}
          </UiCard>
        </UiDiv>
      </UiDiv>
    </UiMain>
  );
}

export default OnboardingPage;
