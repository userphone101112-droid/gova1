'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { UiButton } from '@/components/ui-identified/button';
import { UiInput } from '@/components/ui-identified/input';
import { AUTH } from '@/shared/ui-registry';
import { useBoundTranslation } from '@/shared/unified-ui-i18n/registry-binding';

const loginSchema = z.object({
  phone: z.string().min(1, 'Phone is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage = () => {
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
    <div className="min-h-screen flex flex-col items-center justify-center relative bg-surface-container-low">
      {/* Background Subtle Atmospheric Element */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30" />

      {/* Main Content Canvas */}
      <main className="w-full max-w-[480px] px-margin-mobile md:px-0 z-10 flex flex-col items-center">
        {/* App Logo Area */}
        <header className="mb-stack-lg flex flex-col items-center text-center">
          <div
            className="w-20 h-20 mb-stack-sm rounded-full bg-white flex items-center justify-center"
            style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}
          >
            <span
              className="material-symbols-outlined text-primary text-[40px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              sailing
            </span>
          </div>
          <h1 className="font-headline-md text-headline-md text-primary tracking-tight">
            Suez In Your Hands
          </h1>
        </header>

        {/* Login Card */}
        <section
          className="w-full bg-surface-container-lowest rounded-3xl p-8 md:p-10 border border-white/50"
          style={{ boxShadow: '0 30px 60px -12px rgba(0,0,0,0.04)' }}
        >
          <div className="mb-stack-md text-center">
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">
              مرحباً بك مجدداً
            </h2>
            <p className="font-body-md text-on-surface-variant">
              الرجاء إدخال بياناتك للمتابعة
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-stack-md">
            {/* Phone Number Input */}
            <div className="space-y-2">
              <label className="font-label-md text-secondary block px-1" htmlFor="phone">
                رقم الهاتف
              </label>
              <div className="relative group rounded-2xl bg-surface-container-low transition-all duration-300 focus-within:bg-white focus-within:shadow-sm">
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
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="font-label-md text-secondary" htmlFor="password">
                  كلمة المرور
                </label>
                <Link href="#" className="font-label-sm text-primary hover:underline transition-all">
                  نسيت كلمة المرور؟
                </Link>
              </div>
              <div className="relative group rounded-2xl bg-surface-container-low transition-all duration-300 focus-within:bg-white focus-within:shadow-sm">
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
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute start-4 top-1/2 -translate-y-1/2 text-outline-variant hover:text-outline transition-colors"
                  data-ui-id={AUTH.LOGIN.TOGGLE_PASSWORD_VISIBILITY.id}
                  data-ui-path={AUTH.LOGIN.TOGGLE_PASSWORD_VISIBILITY.path}
                  data-ui-feature={AUTH.LOGIN.TOGGLE_PASSWORD_VISIBILITY.feature}
                  data-ui-component="UiButton"
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Login Action */}
            <UiButton
              ui={AUTH.LOGIN.LOGIN_BUTTON}
              type="submit"
              className="w-full h-14 bg-primary text-on-primary rounded-2xl font-label-md text-base shadow-lg hover:bg-primary-container transition-all active:scale-[0.98]"
              style={{ boxShadow: '0 10px 30px -12px rgba(47,93,142,0.2)' }}
            >
              تسجيل الدخول
            </UiButton>
          </form>

          {/* Secondary Options */}
          <div className="mt-stack-md pt-stack-md border-t border-surface-variant flex flex-col gap-4">
            <UiButton
              ui={AUTH.LOGIN.GUEST_LOGIN_BUTTON}
              variant="outline"
              className="w-full h-14 bg-transparent border border-outline-variant text-secondary rounded-2xl font-label-md hover:bg-surface-container-low transition-all active:scale-[0.98]"
            >
              <span className="material-symbols-outlined me-2" style={{ fontVariationSettings: "'opsz' 20" }}>
                person_outline
              </span>
              الدخول كضيف
            </UiButton>
            <div className="text-center mt-2">
              <span className="font-body-md text-on-surface-variant">
                ليس لديك حساب؟{' '}
              </span>
              <Link href="#" className="font-label-md text-primary hover:underline font-semibold">
                إنشاء حساب جديد
              </Link>
            </div>
          </div>
        </section>

        {/* Language & Theme Footer (Mini) */}
        <footer className="mt-stack-lg py-base flex flex-col items-center gap-4 w-full">
          <div className="flex items-center gap-6">
            <button
              className="font-label-sm text-secondary hover:text-primary transition-colors"
              data-ui-id={AUTH.LOGIN.ENGLISH_LANGUAGE_LINK.id}
              data-ui-path={AUTH.LOGIN.ENGLISH_LANGUAGE_LINK.path}
              data-ui-feature={AUTH.LOGIN.ENGLISH_LANGUAGE_LINK.feature}
              data-ui-component="UiButton"
            >
              English
            </button>
            <div className="w-[1px] h-3 bg-outline-variant" />
            <button
              className="flex items-center gap-1 font-label-sm text-secondary hover:text-primary transition-colors"
              data-ui-id={AUTH.LOGIN.DARK_MODE_TOGGLE.id}
              data-ui-path={AUTH.LOGIN.DARK_MODE_TOGGLE.path}
              data-ui-feature={AUTH.LOGIN.DARK_MODE_TOGGLE.feature}
              data-ui-component="UiButton"
            >
              <span className="material-symbols-outlined text-[18px]">dark_mode</span>
              المظهر الداكن
            </button>
          </div>
          <p className="font-label-sm text-on-surface-variant opacity-60">
            © 2024 Suez Marketplace. جميع الحقوق محفوظة.
          </p>
        </footer>
      </main>

      {/* Decorative Bottom Gradient */}
      <div className="fixed bottom-0 start-0 w-full h-32 bg-gradient-to-t from-white/80 to-transparent pointer-events-none" />
    </div>
  );
};

export default LoginPage;
