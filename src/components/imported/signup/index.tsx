'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { UiButton, UiInput, UiDiv, UiHeader, UiMain, UiSection, UiForm, UiLabel, UiFooter, UiP, useTranslation } from '@/platform/ui';
import { SIGNUP } from '@/platform/ui';
import { COMMON_LAYOUT, DECORATIVE } from '@/platform/ui/registry/categories';

const egyptianPhoneRegex = /^(010|011|012|015)\d{8}$/;

const signupSchema = z.object({
  phone: z.string()
    .min(1, 'Phone is required')
    .regex(egyptianPhoneRegex, 'Invalid Egyptian phone number. Must start with 010, 011, 012, or 015 followed by 8 digits'),
  otp: z.string().optional(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type SignupFormValues = z.infer<typeof signupSchema>;

type PasswordStrength = 'weak' | 'medium' | 'strong';

const SignupPage = () => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>('weak');

  const { control, handleSubmit, watch } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      phone: '',
      otp: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  useEffect(() => {
    // Calculate password strength
    if (!password) {
      setPasswordStrength('weak');
      return;
    }

    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) setPasswordStrength('weak');
    else if (strength <= 4) setPasswordStrength('medium');
    else setPasswordStrength('strong');
  }, [password]);

  const handleVerifyPhone = async () => {
    setIsVerifyingPhone(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsVerifyingPhone(false);
    setShowOtpInput(true);
    setOtpCountdown(60);
  };

  const handleResendOtp = () => {
    setOtpCountdown(60);
    // Simulate resend
  };

  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCountdown]);

  const handleVerifyOtp = async () => {
    // Simulate OTP verification
    setPhoneVerified(true);
    setShowOtpInput(false);
  };

  const handleChangePhone = () => {
    setPhoneVerified(false);
    setShowOtpInput(false);
  };

  const onSubmit = (data: SignupFormValues) => {
    if (!phoneVerified) {
      alert('Please verify your phone number first');
      return;
    }
    console.log('Signup data:', data);
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 'weak': return 'text-error';
      case 'medium': return 'text-tertiary-container';
      case 'strong': return 'text-secondary';
      default: return 'text-outline-variant';
    }
  };

  const getPasswordStrengthBarColor = (index: number) => {
    if (passwordStrength === 'weak' && index < 1) return 'bg-error';
    if (passwordStrength === 'medium' && index < 2) return 'bg-tertiary-container';
    if (passwordStrength === 'strong' && index < 3) return 'bg-secondary';
    return 'bg-surface-variant';
  };

  return (
    <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="min-h-screen flex flex-col items-center justify-center relative bg-surface-container-low">
      {/* Background Subtle Atmospheric Element */}
      <UiDiv ui={DECORATIVE.BACKGROUND} className="fixed inset-0 pointer-events-none overflow-hidden opacity-30" />

      {/* Main Content Canvas */}
      <UiMain ui={COMMON_LAYOUT.MAIN} className="w-full max-w-[480px] px-margin-mobile md:px-0 z-10 flex flex-col items-center">
        {/* App Logo Area */}
        <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="mb-stack-lg flex flex-col items-center text-center">
          <UiDiv ui={COMMON_LAYOUT.WRAPPER}
            className="w-20 h-20 mb-stack-sm rounded-full bg-white flex items-center justify-center"
            style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}
          >
            <span
              className="material-symbols-outlined text-primary text-[40px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              person_add
            </span>
          </UiDiv>
          <UiHeader
            ui={SIGNUP.REGISTER.HEADING}
            level={1}
            className="font-headline-md text-headline-md text-primary tracking-tight"
          >
            {t(SIGNUP.REGISTER.HEADING)}
          </UiHeader>
          <UiP ui={SIGNUP.REGISTER.SUBHEADING} className="font-body-md text-on-surface-variant">
            {t(SIGNUP.REGISTER.SUBHEADING)}
          </UiP>
        </UiDiv>

        {/* Register Card */}
        <UiSection ui={COMMON_LAYOUT.SECTION}
          className="w-full bg-surface-container-lowest rounded-3xl p-8 md:p-10 border border-white/50"
          style={{ boxShadow: '0 30px 60px -12px rgba(0,0,0,0.04)' }}
        >
          <UiForm ui={COMMON_LAYOUT.CONTAINER} onSubmit={handleSubmit(onSubmit)} className="space-y-stack-md">
            {/* Phone Number Input */}
            <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="space-y-2">
              <UiLabel ui={SIGNUP.REGISTER.PHONE_INPUT} className="font-label-md text-secondary block px-1">
                {t(SIGNUP.REGISTER.PHONE_INPUT)}
              </UiLabel>
              <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="flex gap-2">
                <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="relative group flex-1">
                  <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="absolute end-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-on-surface-variant group-focus-within:text-primary transition-colors border-s border-outline-variant/30 pe-3">
                    <span className="material-symbols-outlined text-[20px]">phone</span>
                    <span className="text-body-md font-bold">{t(SIGNUP.REGISTER.PHONE_COUNTRY_CODE)}</span>
                  </UiDiv>
                  <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                      <UiInput
                        ui={SIGNUP.REGISTER.PHONE_INPUT}
                        {...field}
                        id="phone"
                        type="tel"
                        dir="ltr"
                        placeholder="010xxxxxxxx"
                        disabled={phoneVerified}
                        className="w-full h-14 bg-transparent border-none rounded-2xl pe-24 ps-4 text-on-surface focus:ring-0 font-body-md placeholder:text-outline-variant disabled:opacity-50"
                      />
                    )}
                  />
                </UiDiv>
                {!phoneVerified && !showOtpInput && (
                  <UiButton
                    ui={SIGNUP.REGISTER.VERIFY_PHONE_BUTTON}
                    type="button"
                    onClick={handleVerifyPhone}
                    disabled={isVerifyingPhone}
                    className="h-14 px-6 bg-primary text-on-primary rounded-2xl font-label-md hover:bg-primary-container transition-all active:scale-[0.98] whitespace-nowrap"
                    style={{ boxShadow: '0 10px 30px -12px rgba(47,93,142,0.2)' }}
                  >
                    {isVerifyingPhone ? (
                      <span className="material-symbols-outlined animate-spin">refresh</span>
                    ) : (
                      t(SIGNUP.REGISTER.VERIFY_PHONE_BUTTON)
                    )}
                  </UiButton>
                )}
                {phoneVerified && (
                  <UiButton
                    ui={SIGNUP.REGISTER.CHANGE_PHONE_BUTTON}
                    type="button"
                    onClick={handleChangePhone}
                    variant="outline"
                    className="h-14 px-4 bg-transparent border border-outline-variant text-secondary rounded-2xl font-label-sm hover:bg-surface-container-low transition-all active:scale-[0.98]"
                  >
                    {t(SIGNUP.REGISTER.CHANGE_PHONE_BUTTON)}
                  </UiButton>
                )}
              </UiDiv>
              {phoneVerified && (
                <UiDiv ui={SIGNUP.REGISTER.PHONE_VERIFIED_BADGE} className="flex items-center gap-1 text-secondary text-sm px-1">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  {t(SIGNUP.REGISTER.PHONE_VERIFIED_BADGE)}
                </UiDiv>
              )}
            </UiDiv>

            {/* OTP Input */}
            {showOtpInput && (
              <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="space-y-2">
                <UiLabel ui={SIGNUP.REGISTER.OTP_INPUT} className="font-label-md text-secondary block px-1">
                  {t(SIGNUP.REGISTER.OTP_INPUT)}
                </UiLabel>
                <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="flex gap-2">
                  <Controller
                    name="otp"
                    control={control}
                    render={({ field }) => (
                      <UiInput
                        ui={SIGNUP.REGISTER.OTP_INPUT}
                        {...field}
                        id="otp"
                        type="text"
                        dir="ltr"
                        placeholder="------"
                        maxLength={6}
                        className="flex-1 h-14 bg-surface-container-low border border-outline-variant/30 rounded-2xl px-4 text-on-surface focus:ring-2 focus:ring-primary font-body-md text-center tracking-widest"
                      />
                    )}
                  />
                  <UiButton
                    ui={SIGNUP.REGISTER.VERIFY_PHONE_BUTTON}
                    type="button"
                    onClick={handleVerifyOtp}
                    className="h-14 px-6 bg-primary text-on-primary rounded-2xl font-label-md hover:bg-primary-container transition-all active:scale-[0.98]"
                  >
                    {t(SIGNUP.REGISTER.VERIFY_PHONE_BUTTON)}
                  </UiButton>
                </UiDiv>
                <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="flex items-center justify-between">
                  {otpCountdown > 0 ? (
                    <UiP ui={SIGNUP.REGISTER.OTP_COUNTDOWN} className="text-body-sm text-on-surface-variant">
                      {t(SIGNUP.REGISTER.OTP_COUNTDOWN).replace('{seconds}', otpCountdown.toString())}
                    </UiP>
                  ) : (
                    <UiButton
                      ui={SIGNUP.REGISTER.RESEND_OTP_BUTTON}
                      type="button"
                      onClick={handleResendOtp}
                      variant="ghost"
                      className="text-body-sm text-primary hover:underline p-0 h-auto"
                    >
                      {t(SIGNUP.REGISTER.RESEND_OTP_BUTTON)}
                    </UiButton>
                  )}
                </UiDiv>
              </UiDiv>
            )}

            {/* Password Input */}
            <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="space-y-2">
              <UiLabel ui={SIGNUP.REGISTER.PASSWORD_INPUT} className="font-label-md text-secondary block px-1">
                {t(SIGNUP.REGISTER.PASSWORD_INPUT)}
              </UiLabel>
              <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="relative group rounded-2xl bg-surface-container-low transition-all duration-300 focus-within:bg-white focus-within:shadow-sm">
                <span className="material-symbols-outlined absolute end-4 top-1/2 -translate-y-1/2 text-outline">
                  lock
                </span>
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <UiInput
                      ui={SIGNUP.REGISTER.PASSWORD_INPUT}
                      {...field}
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="w-full h-14 bg-transparent border-none rounded-2xl pe-12 ps-12 text-on-surface focus:ring-0 font-body-md placeholder:text-outline-variant"
                    />
                  )}
                />
                <UiButton
                  ui={SIGNUP.REGISTER.TOGGLE_PASSWORD_VISIBILITY}
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute start-4 top-1/2 -translate-y-1/2 text-outline-variant hover:text-outline transition-colors"
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </UiButton>
              </UiDiv>

              {/* Password Strength Indicator */}
              <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="space-y-2 mt-2 px-1">
                <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="flex justify-between items-center mb-1">
                  <UiP ui={SIGNUP.REGISTER.PASSWORD_STRENGTH_LABEL} className="text-label-sm text-on-surface-variant">
                    {t(SIGNUP.REGISTER.PASSWORD_STRENGTH_LABEL)}
                  </UiP>
                  <UiP ui={COMMON_LAYOUT.CONTAINER} className={`text-label-sm font-bold ${getPasswordStrengthColor()}`}>
                    {t(SIGNUP.REGISTER[`STRENGTH_${passwordStrength.toUpperCase()}` as keyof typeof SIGNUP.REGISTER])}
                  </UiP>
                </UiDiv>
                <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="flex gap-2">
                  {[0, 1, 2].map((index) => (
                    <UiDiv
                      key={index}
                      ui={DECORATIVE.BACKGROUND}
                      className={`h-1.5 flex-1 rounded-full transition-all ${getPasswordStrengthBarColor(index)}`}
                    />
                  ))}
                </UiDiv>
              </UiDiv>
            </UiDiv>

            {/* Confirm Password Input */}
            <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="space-y-2">
              <UiLabel ui={SIGNUP.REGISTER.CONFIRM_PASSWORD_INPUT} className="font-label-md text-secondary block px-1">
                {t(SIGNUP.REGISTER.CONFIRM_PASSWORD_INPUT)}
              </UiLabel>
              <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="relative group rounded-2xl bg-surface-container-low transition-all duration-300 focus-within:bg-white focus-within:shadow-sm">
                <span className="material-symbols-outlined absolute end-4 top-1/2 -translate-y-1/2 text-outline">
                  lock_reset
                </span>
                <Controller
                  name="confirmPassword"
                  control={control}
                  render={({ field }) => (
                    <UiInput
                      ui={SIGNUP.REGISTER.CONFIRM_PASSWORD_INPUT}
                      {...field}
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="w-full h-14 bg-transparent border-none rounded-2xl pe-12 ps-12 text-on-surface focus:ring-0 font-body-md placeholder:text-outline-variant"
                    />
                  )}
                />
                <UiButton
                  ui={SIGNUP.REGISTER.TOGGLE_CONFIRM_PASSWORD_VISIBILITY}
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute start-4 top-1/2 -translate-y-1/2 text-outline-variant hover:text-outline transition-colors"
                >
                  <span className="material-symbols-outlined">
                    {showConfirmPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </UiButton>
              </UiDiv>
            </UiDiv>

            {/* Submit Button */}
            <UiButton
              ui={SIGNUP.REGISTER.SUBMIT_BUTTON}
              type="submit"
              disabled={!phoneVerified}
              className="w-full h-14 bg-primary text-on-primary rounded-2xl font-label-md text-base shadow-lg hover:bg-primary-container transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ boxShadow: '0 10px 30px -12px rgba(47,93,142,0.2)' }}
            >
              {t(SIGNUP.REGISTER.SUBMIT_BUTTON)}
            </UiButton>
          </UiForm>

          {/* Login Link */}
          <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="mt-stack-md pt-stack-md border-t border-surface-variant text-center">
            <UiP ui={SIGNUP.REGISTER.LOGIN_LINK} className="font-body-md text-on-surface-variant">
              {t(SIGNUP.REGISTER.LOGIN_LINK)}
            </UiP>
            <Link href="/login" className="font-label-md text-primary hover:underline font-semibold">
              Login
            </Link>
          </UiDiv>
        </UiSection>

        {/* Language & Theme Footer (Mini) */}
        <UiFooter ui={COMMON_LAYOUT.FOOTER} className="mt-stack-lg py-base flex flex-col items-center gap-4 w-full">
          <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="flex items-center gap-6">
            <UiButton
              ui={SIGNUP.REGISTER.ENGLISH_LANGUAGE_LINK}
              className="font-label-sm text-secondary hover:text-primary transition-colors"
            >
              {t(SIGNUP.REGISTER.ENGLISH_LANGUAGE_LINK)}
            </UiButton>
            <UiDiv ui={DECORATIVE.DIVIDER} className="w-[1px] h-3 bg-outline-variant" />
            <UiButton
              ui={SIGNUP.REGISTER.DARK_MODE_TOGGLE}
              className="flex items-center gap-1 font-label-sm text-secondary hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">dark_mode</span>
              {t(SIGNUP.REGISTER.DARK_MODE_TOGGLE)}
            </UiButton>
          </UiDiv>
          <UiP ui={SIGNUP.REGISTER.COPYRIGHT} className="font-label-sm text-on-surface-variant opacity-60">
            {t(SIGNUP.REGISTER.COPYRIGHT)}
          </UiP>
        </UiFooter>
      </UiMain>

      {/* Decorative Bottom Gradient */}
      <UiDiv ui={DECORATIVE.BACKGROUND} className="fixed bottom-0 start-0 w-full h-32 bg-gradient-to-t from-white/80 to-transparent pointer-events-none" />
    </UiDiv>
  );
};

export default SignupPage;
