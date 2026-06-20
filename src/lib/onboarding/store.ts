import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type {
  OnboardingStore,
  OnboardingStepId,
  OnboardingData,
  StoreInfo,
  BusinessDetails,
  IdentityVerification,
  ProductSetup,
  ShippingSetup,
  PaymentSetup,
  Policies,
  Branding,
  Preferences,
  TaxInfo,
  Marketing,
} from './types';

const initialSteps: OnboardingStore['steps'] = [
  {
    id: 'welcome',
    title: 'Welcome',
    description: 'Let\'s get started with your merchant account',
    order: 0,
    isCompleted: false,
    isLocked: false,
    progress: 0,
  },
  {
    id: 'store-info',
    title: 'Store Information',
    description: 'Tell us about your store',
    order: 1,
    isCompleted: false,
    isLocked: true,
    progress: 0,
  },
  {
    id: 'business-details',
    title: 'Business Details',
    description: 'Your business information',
    order: 2,
    isCompleted: false,
    isLocked: true,
    progress: 0,
  },
  {
    id: 'identity-verification',
    title: 'Identity Verification',
    description: 'Verify your identity',
    order: 3,
    isCompleted: false,
    isLocked: true,
    progress: 0,
  },
  {
    id: 'products',
    title: 'Products',
    description: 'Set up your product catalog',
    order: 4,
    isCompleted: false,
    isLocked: true,
    progress: 0,
  },
  {
    id: 'shipping',
    title: 'Shipping',
    description: 'Configure shipping options',
    order: 5,
    isCompleted: false,
    isLocked: true,
    progress: 0,
  },
  {
    id: 'payments',
    title: 'Payments',
    description: 'Set up payment methods',
    order: 6,
    isCompleted: false,
    isLocked: true,
    progress: 0,
  },
  {
    id: 'policies',
    title: 'Policies',
    description: 'Add your store policies',
    order: 7,
    isCompleted: false,
    isLocked: true,
    progress: 0,
  },
  {
    id: 'branding',
    title: 'Branding',
    description: 'Customize your store look',
    order: 8,
    isCompleted: false,
    isLocked: true,
    progress: 0,
  },
  {
    id: 'preferences',
    title: 'Preferences',
    description: 'Set your preferences',
    order: 9,
    isCompleted: false,
    isLocked: true,
    progress: 0,
  },
  {
    id: 'tax-info',
    title: 'Tax Information',
    description: 'Add tax details',
    order: 10,
    isCompleted: false,
    isLocked: true,
    progress: 0,
  },
  {
    id: 'marketing',
    title: 'Marketing Setup',
    description: 'Optional marketing tools',
    order: 11,
    isCompleted: false,
    isLocked: true,
    progress: 0,
  },
  {
    id: 'completion',
    title: 'You\'re All Set!',
    description: 'Welcome to the platform',
    order: 12,
    isCompleted: false,
    isLocked: true,
    progress: 0,
  },
];

interface OnboardingState extends OnboardingStore {
  data: OnboardingData;
  setCurrentStep: (stepId: OnboardingStepId) => void;
  completeStep: (stepId: OnboardingStepId) => void;
  unlockNextStep: (currentStepId: OnboardingStepId) => void;
  updateStepProgress: (stepId: OnboardingStepId, progress: number) => void;
  updateStoreInfo: (info: Partial<StoreInfo>) => void;
  updateBusinessDetails: (details: Partial<BusinessDetails>) => void;
  updateIdentityVerification: (verification: Partial<IdentityVerification>) => void;
  updateProducts: (products: Partial<ProductSetup>) => void;
  updateShipping: (shipping: Partial<ShippingSetup>) => void;
  updatePayments: (payments: Partial<PaymentSetup>) => void;
  updatePolicies: (policies: Partial<Policies>) => void;
  updateBranding: (branding: Partial<Branding>) => void;
  updatePreferences: (preferences: Partial<Preferences>) => void;
  updateTaxInfo: (taxInfo: Partial<TaxInfo>) => void;
  updateMarketing: (marketing: Partial<Marketing>) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
}

const initialData: OnboardingData = {
  storeInfo: {},
  businessDetails: {},
  identityVerification: {},
  products: {
    isDigital: false,
    isPhysical: false,
  },
  shipping: {
    offerFreeShipping: false,
  },
  payments: {
    paymentMethods: [],
    currency: 'USD',
  },
  policies: {},
  branding: {},
  preferences: {
    notifications: [],
    timezone: 'America/New_York',
  },
  taxInfo: {},
  marketing: {
    enabledFeatures: [],
  },
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      steps: initialSteps,
      currentStep: 'welcome',
      isOnboardingComplete: false,
      hasStarted: false,
      data: initialData,

      setCurrentStep: (stepId: OnboardingStepId) => {
        const { steps } = get();
        const step = steps.find((s) => s.id === stepId);
        if (step && !step.isLocked) {
          set({ currentStep: stepId, hasStarted: true });
        }
      },

      completeStep: (stepId: OnboardingStepId) => {
        const { steps } = get();
        set({
          steps: steps.map((s) =>
            s.id === stepId ? { ...s, isCompleted: true, progress: 100 } : s
          ),
        });
        get().unlockNextStep(stepId);
      },

      unlockNextStep: (currentStepId: OnboardingStepId) => {
        const { steps } = get();
        const currentStepIndex = steps.findIndex((s) => s.id === currentStepId);
        const nextStep = steps[currentStepIndex + 1];

        if (nextStep) {
          set({
            steps: steps.map((s) =>
              s.id === nextStep.id ? { ...s, isLocked: false } : s
            ),
          });
        }
      },

      updateStepProgress: (stepId: OnboardingStepId, progress: number) => {
        const { steps } = get();
        set({
          steps: steps.map((s) =>
            s.id === stepId ? { ...s, progress: Math.min(Math.max(progress, 0), 100) } : s
          ),
        });
      },

      updateStoreInfo: (info: Partial<StoreInfo>) =>
        set((state) => ({
          data: { ...state.data, storeInfo: { ...state.data.storeInfo, ...info } },
        })),

      updateBusinessDetails: (details: Partial<BusinessDetails>) =>
        set((state) => ({
          data: { ...state.data, businessDetails: { ...state.data.businessDetails, ...details } },
        })),

      updateIdentityVerification: (verification: Partial<IdentityVerification>) =>
        set((state) => ({
          data: {
            ...state.data,
            identityVerification: { ...state.data.identityVerification, ...verification },
          },
        })),

      updateProducts: (products: Partial<ProductSetup>) =>
        set((state) => ({
          data: { ...state.data, products: { ...state.data.products, ...products } },
        })),

      updateShipping: (shipping: Partial<ShippingSetup>) =>
        set((state) => ({
          data: { ...state.data, shipping: { ...state.data.shipping, ...shipping } },
        })),

      updatePayments: (payments: Partial<PaymentSetup>) =>
        set((state) => ({
          data: { ...state.data, payments: { ...state.data.payments, ...payments } },
        })),

      updatePolicies: (policies: Partial<Policies>) =>
        set((state) => ({
          data: { ...state.data, policies: { ...state.data.policies, ...policies } },
        })),

      updateBranding: (branding: Partial<Branding>) =>
        set((state) => ({
          data: { ...state.data, branding: { ...state.data.branding, ...branding } },
        })),

      updatePreferences: (preferences: Partial<Preferences>) =>
        set((state) => ({
          data: { ...state.data, preferences: { ...state.data.preferences, ...preferences } },
        })),

      updateTaxInfo: (taxInfo: Partial<TaxInfo>) =>
        set((state) => ({
          data: { ...state.data, taxInfo: { ...state.data.taxInfo, ...taxInfo } },
        })),

      updateMarketing: (marketing: Partial<Marketing>) =>
        set((state) => ({
          data: { ...state.data, marketing: { ...state.data.marketing, ...marketing } },
        })),

      completeOnboarding: () => {
        set({
          isOnboardingComplete: true,
          currentStep: 'completion',
          steps: get().steps.map((s) => ({ ...s, isCompleted: true })),
        });
      },

      resetOnboarding: () =>
        set({
          steps: initialSteps,
          currentStep: 'welcome',
          isOnboardingComplete: false,
          hasStarted: false,
          data: initialData,
        }),

      goToNextStep: () => {
        const { steps, currentStep } = get();
        const currentIndex = steps.findIndex((s) => s.id === currentStep);
        const nextStep = steps[currentIndex + 1];

        if (nextStep) {
          get().completeStep(currentStep);
          set({ currentStep: nextStep.id });

          if (nextStep.id === 'completion') {
            get().completeOnboarding();
          }
        }
      },

      goToPreviousStep: () => {
        const { steps, currentStep } = get();
        const currentIndex = steps.findIndex((s) => s.id === currentStep);
        const prevStep = steps[currentIndex - 1];

        if (prevStep) {
          set({ currentStep: prevStep.id });
        }
      },
    }),
    {
      name: 'onboarding-storage',
    }
  )
);
