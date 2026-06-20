'use client';


import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  LogIn,
  Shield,
  Smartphone,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';

import { AuthHero } from '@/components/auth/AuthHero';
import { AuthMobileBrand } from '@/components/auth/AuthMobileBrand';
import { useGuestSession } from '@/hooks/use-guest-session';
import { cn } from '@/lib/utils';
import { loginSchema, type LoginFormData } from '@/lib/validation/auth';
import { useTranslation } from '@/platform/ui';
import { AUTH } from '@/platform/ui/registry/features/auth';

export function LoginPageContent() {
  const router = useRouter();
  const { t } = useTranslation();
  const { startGuestSession } = useGuestSession();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { phone: '', password: '' },
    mode: 'onChange',
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setSubmitted(true);
    void data;
  };

  if (submitted) {
    return (
      <div data-ui-uuid={AUTH.SHELL.LOGIN_SUCCESS_PAGE.uuid} className="auth-page flex items-center justify-center px-4">
        <div data-ui-uuid={AUTH.SHELL.LOGIN_SUCCESS_FORM_CARD.uuid} className="auth-card w-full max-w-md text-center space-y-6 motion-reveal">
          <div data-ui-uuid={AUTH.SHELL.LOGIN_SUCCESS_HEADING_WRAPPER_L58.uuid} className="mx-auto w-20 h-20 rounded-full bg-success-container flex items-center justify-center">
            <Shield className="h-10 w-10 text-success" />
          </div>
          <div data-ui-uuid={AUTH.SHELL.LOGIN_SUCCESS_HEADING_WRAPPER_L61.uuid} className="space-y-2">
            <h2 data-ui-uuid={AUTH.LOGIN.SUCCESS_HEADING.uuid} className="type-headline-md">
              {t(AUTH.LOGIN.SUCCESS_HEADING)}
            </h2>
            <p data-ui-uuid={AUTH.LOGIN.SUCCESS_DESCRIPTION.uuid} className="type-body-md text-on-surface-variant">{t(AUTH.LOGIN.SUCCESS_DESCRIPTION)}</p>
          </div>
          <button data-ui-uuid={AUTH.LOGIN.SIGNIN_AGAIN.uuid} onClick={() => {
        setSubmitted(false);
        form.reset();
    }} className="w-full auth-cta">
            {t(AUTH.LOGIN.SIGNIN_AGAIN)}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div data-ui-uuid={AUTH.SHARED.PAGE.uuid} className="auth-page motion-colors">
      <div data-ui-uuid={AUTH.SHELL.LOGIN_HEADING_WRAPPER_L80.uuid} className="min-h-[calc(100dvh-10rem)] md:min-h-[calc(100dvh-5.5rem)] grid lg:grid-cols-[1fr_2fr]">
        <AuthHero variant="login" />

        <div data-ui-uuid={AUTH.SHARED.FORM_CARD.uuid} className="flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12 w-full">
          <div data-ui-uuid={AUTH.SHELL.LOGIN_HEADING_CONTAINER_L84.uuid} className="w-full max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl 2xl:max-w-6xl space-y-6 sm:space-y-8">
            <AuthMobileBrand />

            <div data-ui-uuid={AUTH.SHELL.LOGIN_HEADING_WRAPPER_L87.uuid} className="space-y-2 text-center lg:text-start">
              <h1 data-ui-uuid={AUTH.LOGIN.HEADING.uuid} className="type-display-sm text-on-surface">
                {t(AUTH.LOGIN.HEADING)}
              </h1>
              <p data-ui-uuid={AUTH.LOGIN.SUBHEADING.uuid} className="type-body-md text-on-surface-variant">{t(AUTH.LOGIN.SUBHEADING)}</p>
            </div>

            <FormProvider {...form}>
              <form data-ui-uuid={AUTH.SHELL.LOGIN_GUEST_LOGIN_WRAPPER_L95.uuid} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
                <Controller
                  name="phone"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <div data-ui-uuid={AUTH.SHELL.LOGIN_PHONE_INPUT_WRAPPER_L100.uuid} className="space-y-2">
                      <span data-ui-uuid={AUTH.LOGIN.PHONE_INPUT_LABEL.uuid} className="type-label-lg flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-primary" />
                        {t(AUTH.LOGIN.PHONE_INPUT)}
                      </span>
                      <div data-ui-uuid={AUTH.SHELL.LOGIN_PHONE_INPUT_WRAPPER_L105.uuid} className="relative">
                        <span data-ui-uuid={AUTH.SHELL.LOGIN_PHONE_INPUT_SPAN_L106.uuid} className="absolute start-3 top-1/2 -translate-y-1/2 type-body-sm text-on-surface-variant select-none">
                          +20
                        </span>
                        <input data-ui-uuid={AUTH.LOGIN.PHONE_INPUT.uuid} type="tel" inputMode="tel" maxLength={11} placeholder={t(AUTH.SHARED.PHONE_PLACEHOLDER)} className={cn('auth-input ps-12 motion-colors w-full', fieldState.error && 'border-error focus-visible:ring-error')} value={field.value} onChange={(e) => field.onChange(e.target.value.replace(/\D/g, '').slice(0, 11))} />
                      </div>
                      {fieldState.error && (
                        <p data-ui-uuid={AUTH.SHELL.LOGIN_HEADING_WRAPPER_L112.uuid} className="type-caption text-error">{fieldState.error.message}</p>
                      )}
                    </div>
                  )}
                />

                <Controller
                  name="password"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <div data-ui-uuid={AUTH.SHELL.LOGIN_PASSWORD_INPUT_WRAPPER_L122.uuid} className="space-y-2">
                      <div data-ui-uuid={AUTH.SHELL.LOGIN_PASSWORD_INPUT_WRAPPER_L123.uuid} className="flex items-center justify-between">
                        <span data-ui-uuid={AUTH.LOGIN.PASSWORD_INPUT_LABEL.uuid} className="type-label-lg flex items-center gap-2">
                          <Lock className="h-4 w-4 text-primary" />
                          {t(AUTH.LOGIN.PASSWORD_INPUT)}
                        </span>
                        <button data-ui-uuid={AUTH.LOGIN.FORGOT_PASSWORD.uuid} type="button" className="h-auto p-0 type-caption" onClick={() => {
        /* forgot password flow */
    }}>
                          {t(AUTH.LOGIN.FORGOT_PASSWORD)}
                        </button>
                      </div>
                      <div data-ui-uuid={AUTH.SHELL.LOGIN_PASSWORD_INPUT_WRAPPER_L134.uuid} className="relative">
                        <input data-ui-uuid={AUTH.LOGIN.PASSWORD_INPUT.uuid} type={showPassword ? 'text' : 'password'} placeholder={t(AUTH.SHARED.PASSWORD_PLACEHOLDER)} className={cn('auth-input pe-10 motion-colors w-full', fieldState.error && 'border-error focus-visible:ring-error')} value={field.value} onChange={field.onChange} />
                        <button data-ui-uuid={AUTH.LOGIN.TOGGLE_PASSWORD.uuid} type="button" className="absolute end-0 top-0 h-full px-3 text-on-surface-variant" onClick={() => setShowPassword((s) => !s)} tabIndex={-1} aria-label={t(AUTH.LOGIN.TOGGLE_PASSWORD)}>
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {fieldState.error && (
                        <p data-ui-uuid={AUTH.SHELL.LOGIN_HEADING_WRAPPER_L141.uuid} className="type-caption text-error">{fieldState.error.message}</p>
                      )}
                    </div>
                  )}
                />

                <button data-ui-uuid={AUTH.LOGIN.SUBMIT_BUTTON.uuid} type="submit" disabled={isSubmitting || !form.formState.isValid} className="w-full auth-cta h-12 type-label-lg">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin me-2" />
                      {t(AUTH.LOGIN.SUBMITTING_BUTTON)}
                    </>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4 me-2" />
                      {t(AUTH.LOGIN.SUBMIT_BUTTON)}
                    </>
                  )}
                </button>

                <button data-ui-uuid={AUTH.LOGIN.GUEST_LOGIN.uuid} type="button" className="w-full h-12 type-label-lg motion-colors" onClick={() => {
        startGuestSession();
        router.push('/home');
    }}>
                  <User className="h-4 w-4 me-2" />
                  {t(AUTH.LOGIN.GUEST_LOGIN)}
                </button>
              </form>
            </FormProvider>

            <div data-ui-uuid={AUTH.SHELL.LOGIN_SIGNUP_DIVIDER_WRAPPER_L171.uuid} className="text-center space-y-3">
              <div data-ui-uuid={AUTH.SHELL.LOGIN_SIGNUP_DIVIDER_WRAPPER_L172.uuid} className="relative">
                <div data-ui-uuid={AUTH.SHELL.LOGIN_SIGNUP_DIVIDER_WRAPPER_L173.uuid} className="absolute inset-0 flex items-center">
                  <span data-ui-uuid={AUTH.SHELL.LOGIN_SIGNUP_DIVIDER_WRAPPER_L174.uuid} className="w-full border-t border-outline-variant" />
                </div>
                <div data-ui-uuid={AUTH.SHELL.LOGIN_SIGNUP_DIVIDER_WRAPPER_L176.uuid} className="relative flex justify-center">
                  <span data-ui-uuid={AUTH.LOGIN.SIGNUP_DIVIDER.uuid} className="bg-background px-2 type-caption text-on-surface-variant uppercase">
                    {t(AUTH.LOGIN.SIGNUP_DIVIDER)}
                  </span>
                </div>
              </div>
              <Link data-ui-uuid={AUTH.LOGIN.SIGNUP_LINK.uuid} href="/registration" className="block">
                <button data-ui-uuid={AUTH.LOGIN.SIGNUP_LINK_BUTTON.uuid} className="w-full h-12 type-label-lg group">
                  {t(AUTH.LOGIN.SIGNUP_LINK)}
                  <ArrowRight className="h-4 w-4 ms-2 motion-transform group-hover:translate-x-1" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
