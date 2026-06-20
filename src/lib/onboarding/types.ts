export type OnboardingStepId =
  | 'welcome'
  | 'store-info'
  | 'business-details'
  | 'identity-verification'
  | 'products'
  | 'shipping'
  | 'payments'
  | 'policies'
  | 'branding'
  | 'preferences'
  | 'tax-info'
  | 'marketing'
  | 'completion';

export interface OnboardingStep {
  id: OnboardingStepId;
  title: string;
  description: string;
  order: number;
  isCompleted: boolean;
  isLocked: boolean;
  progress: number;
}

export interface OnboardingStore {
  steps: OnboardingStep[];
  currentStep: OnboardingStepId;
  isOnboardingComplete: boolean;
  hasStarted: boolean;
}

export interface StoreInfo {
  storeName: string;
  storeUrl: string;
  storeCategory: string;
  storeDescription: string;
}

export interface BusinessDetails {
  businessName: string;
  businessType: 'sole-proprietorship' | 'llc' | 'corporation' | 'partnership' | 'other';
  businessRegistrationNumber: string;
  yearFounded: string;
  employeeCount: string;
  address: Address;
}

export interface Address {
  street: string;
  unit: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface IdentityVerification {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  idType: 'passport' | 'driver-license' | 'national-id';
  idNumber: string;
  hasUploadedId: boolean;
}

export interface ProductSetup {
  hasProducts: boolean;
  productCount: number;
  productSources: ('manual' | 'csv' | 'api' | 'migrate')[];
  isDigital: boolean;
  isPhysical: boolean;
}

export interface ShippingSetup {
  offersShipping: boolean;
  shippingCarriers: string[];
  shippingRegions: string[];
  hasReturnPolicy: boolean;
  offerFreeShipping: boolean;
  shippingFromCountry: string;
  shippingFromCity: string;
  shippingFromPostal: string;
  shippingFromAddress: string;
}

export interface PaymentSetup {
  acceptsCreditCards: boolean;
  acceptsPayPal: boolean;
  acceptsOther: boolean;
  otherPaymentMethods: string[];
  hasStripeAccount: boolean;
  paymentMethods: ('credit-card' | 'debit-card' | 'paypal' | 'bank-transfer')[];
  currency: string;
}

export interface Policies {
  hasReturnPolicy: boolean;
  hasShippingPolicy: boolean;
  hasPrivacyPolicy: boolean;
  hasTermsOfService: boolean;
  returnPolicy: string;
  refundPolicy: string;
  privacyPolicy: string;
  termsOfService: string;
  returnPolicyContent: string;
  shippingPolicyContent: string;
  privacyPolicyContent: string;
  termsOfServiceContent: string;
}

export interface Branding {
  logoUrl: string;
  bannerUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  brandVoice: 'friendly' | 'professional' | 'luxury' | 'minimal' | 'bold';
  storeTagline: string;
}

export interface Preferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  marketingEmails: boolean;
  analyticsOptIn: boolean;
  timezone: string;
  currency: string;
  language: string;
  notifications: ('order-notifications' | 'marketing-emails' | 'system-updates' | 'weekly-report')[];
}

export interface TaxInfo {
  taxId: string;
  taxRegistrationNumber: string;
  taxRegions: string[];
  hasTaxCertificate: boolean;
}

export interface Marketing {
  wantsSocialMedia: boolean;
  socialMediaPlatforms: string[];
  wantsEmailMarketing: boolean;
  wantsAds: boolean;
  enabledFeatures: ('email-marketing' | 'social-sharing' | 'reviews')[];
}

export interface OnboardingData {
  storeInfo: Partial<StoreInfo>;
  businessDetails: Partial<BusinessDetails>;
  identityVerification: Partial<IdentityVerification>;
  products: Partial<ProductSetup>;
  shipping: Partial<ShippingSetup>;
  payments: Partial<PaymentSetup>;
  policies: Partial<Policies>;
  branding: Partial<Branding>;
  preferences: Partial<Preferences>;
  taxInfo: Partial<TaxInfo>;
  marketing: Partial<Marketing>;
}
