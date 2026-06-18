'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { UiButton, UiInput, UiDiv, UiHeader, UiMain, UiSection, UiForm, UiLabel, UiFooter, UiP, useTranslation } from '@/platform/ui';
import { AUTH } from '@/platform/ui';
import { COMMON_LAYOUT, DECORATIVE } from '@/platform/ui/registry/categories';

const loginSchema = z.object({
  phone: z.string().min(1, 'Phone is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);

  const { control, handleSubmit } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    console.log('Login data:', data);
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
              sailing
            </span>
          </UiDiv>
          <UiHeader
            ui={AUTH.LOGIN.HEADING}
            level={1}
            className="font-headline-md text-headline-md text-primary tracking-tight"
          >
            {t(AUTH.LOGIN.HEADING)}
          </UiHeader>
        </UiDiv>

        {/* Login Card */}
        <UiSection ui={COMMON_LAYOUT.SECTION}
          className="w-full bg-surface-container-lowest rounded-3xl p-8 md:p-10 border border-white/50"
          style={{ boxShadow: '0 30px 60px -12px rgba(0,0,0,0.04)' }}
        >
          <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="mb-stack-md text-center">
            <UiHeader
              ui={AUTH.LOGIN.SUBHEADING}
              level={2}
              className="font-headline-lg text-headline-lg text-on-surface mb-2"
            >
              {t(AUTH.LOGIN.SUBHEADING)}
            </UiHeader>
          </UiDiv>

          <UiForm ui={COMMON_LAYOUT.CONTAINER} onSubmit={handleSubmit(onSubmit)} className="space-y-stack-md">
            {/* Phone Number Input */}
            <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="space-y-2">
              <UiLabel ui={AUTH.LOGIN.PHONE_INPUT} className="font-label-md text-secondary block px-1">
                {t(AUTH.LOGIN.PHONE_INPUT)}
              </UiLabel>
              <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="relative group rounded-2xl bg-surface-container-low transition-all duration-300 focus-within:bg-white focus-within:shadow-sm">
                <span className="material-symbols-outlined absolute end-4 top-1/2 -translate-y-1/2 text-outline">
                  call
                </span>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <UiInput
                      ui={AUTH.LOGIN.PHONE_INPUT}
                      {...field}
                      id="phone"
                      type="tel"
                      dir="ltr"
                      placeholder="05x xxxx xxx"
                      className="w-full h-14 bg-transparent border-none rounded-2xl pe-12 ps-4 text-on-surface focus:ring-0 font-body-md placeholder:text-outline-variant"
                    />
                  )}
                />
              </UiDiv>
            </UiDiv>

            {/* Password Input */}
            <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="space-y-2">
              <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="flex justify-between items-center px-1">
                <UiLabel ui={AUTH.LOGIN.PASSWORD_INPUT} className="font-label-md text-secondary">
                  {t(AUTH.LOGIN.PASSWORD_INPUT)}
                </UiLabel>
                <Link href="#" className="font-label-sm text-primary hover:underline transition-all">
                  {t(AUTH.LOGIN.FORGOT_PASSWORD_LINK)}
                </Link>
              </UiDiv>
              <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="relative group rounded-2xl bg-surface-container-low transition-all duration-300 focus-within:bg-white focus-within:shadow-sm">
                <span className="material-symbols-outlined absolute end-4 top-1/2 -translate-y-1/2 text-outline">
                  lock
                </span>
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <UiInput
                      ui={AUTH.LOGIN.PASSWORD_INPUT}
                      {...field}
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="w-full h-14 bg-transparent border-none rounded-2xl pe-12 ps-12 text-on-surface focus:ring-0 font-body-md placeholder:text-outline-variant"
                    />
                  )}
                />
                <UiButton
                  ui={AUTH.LOGIN.TOGGLE_PASSWORD_VISIBILITY}
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute start-4 top-1/2 -translate-y-1/2 text-outline-variant hover:text-outline transition-colors"
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </UiButton>
              </UiDiv>
            </UiDiv>

            {/* Login Action */}
            <UiButton
              ui={AUTH.LOGIN.LOGIN_BUTTON}
              type="submit"
              className="w-full h-14 bg-primary text-on-primary rounded-2xl font-label-md text-base shadow-lg hover:bg-primary-container transition-all active:scale-[0.98]"
              style={{ boxShadow: '0 10px 30px -12px rgba(47,93,142,0.2)' }}
            >
              {t(AUTH.LOGIN.LOGIN_BUTTON)}
            </UiButton>
          </UiForm>

          {/* Secondary Options */}
          <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="mt-stack-md pt-stack-md border-t border-surface-variant flex flex-col gap-4">
            <UiButton
              ui={AUTH.LOGIN.GUEST_LOGIN_BUTTON}
              variant="outline"
              className="w-full h-14 bg-transparent border border-outline-variant text-secondary rounded-2xl font-label-md hover:bg-surface-container-low transition-all active:scale-[0.98]"
            >
              <span className="material-symbols-outlined me-2" style={{ fontVariationSettings: "'opsz' 20" }}>
                person_outline
              </span>
              {t(AUTH.LOGIN.GUEST_LOGIN_BUTTON)}
            </UiButton>
            <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="text-center mt-2">
              <UiP ui={COMMON_LAYOUT.CONTAINER} className="font-body-md text-on-surface-variant">
                {t(AUTH.LOGIN.SIGNUP_LINK)}
              </UiP>
              <Link href="#" className="font-label-md text-primary hover:underline font-semibold">
                {t(AUTH.LOGIN.SIGNUP_LINK)}
              </Link>
            </UiDiv>
          </UiDiv>
        </UiSection>

        {/* Language & Theme Footer (Mini) */}
        <UiFooter ui={COMMON_LAYOUT.FOOTER} className="mt-stack-lg py-base flex flex-col items-center gap-4 w-full">
          <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="flex items-center gap-6">
            <UiButton
              ui={AUTH.LOGIN.ENGLISH_LANGUAGE_LINK}
              className="font-label-sm text-secondary hover:text-primary transition-colors"
            >
              {t(AUTH.LOGIN.ENGLISH_LANGUAGE_LINK)}
            </UiButton>
            <UiDiv ui={DECORATIVE.DIVIDER} className="w-[1px] h-3 bg-outline-variant" />
            <UiButton
              ui={AUTH.LOGIN.DARK_MODE_TOGGLE}
              className="flex items-center gap-1 font-label-sm text-secondary hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">dark_mode</span>
              {t(AUTH.LOGIN.DARK_MODE_TOGGLE)}
            </UiButton>
          </UiDiv>
          <UiP ui={AUTH.LOGIN.COPYRIGHT} className="font-label-sm text-on-surface-variant opacity-60">
            {t(AUTH.LOGIN.COPYRIGHT)}
          </UiP>
        </UiFooter>
      </UiMain>

      {/* Decorative Bottom Gradient */}
      <UiDiv ui={DECORATIVE.BACKGROUND} className="fixed bottom-0 start-0 w-full h-32 bg-gradient-to-t from-white/80 to-transparent pointer-events-none" />
    </UiDiv>
  );
};

export default LoginPage;
