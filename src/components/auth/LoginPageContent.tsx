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
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';

import { AuthHero } from '@/components/auth/AuthHero';
import { AuthMobileBrand } from '@/components/auth/AuthMobileBrand';
import { useGuestSession } from '@/hooks/use-guest-session';
import { cn } from '@/lib/utils';
import { loginSchema, type LoginFormData } from '@/lib/validation/auth';
import {
  UiButton,
  UiDiv,
  UiHeader,
  UiInput,
  UiLabel,
  UiLink,
  UiSpan,
  useTranslation,
} from '@/platform/ui';
import { COMMON_LAYOUT } from '@/platform/ui/registry/categories';
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
      <UiDiv ui={AUTH.SHARED.PAGE} className="auth-page flex items-center justify-center px-4">
        <UiDiv ui={AUTH.SHARED.FORM_CARD} className="auth-card w-full max-w-md text-center space-y-6 motion-reveal">
          <UiDiv
            ui={COMMON_LAYOUT.WRAPPER}
            className="mx-auto w-20 h-20 rounded-full bg-success-container flex items-center justify-center"
          >
            <Shield className="h-10 w-10 text-success" />
          </UiDiv>
          <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="space-y-2">
            <UiHeader ui={AUTH.LOGIN.SUCCESS_HEADING} level={2} className="type-headline-md">
              {t(AUTH.LOGIN.SUCCESS_HEADING)}
            </UiHeader>
            <p className="type-body-md text-on-surface-variant">{t(AUTH.LOGIN.SUCCESS_DESCRIPTION)}</p>
          </UiDiv>
          <UiButton
            ui={AUTH.LOGIN.SIGNIN_AGAIN}
            onClick={() => {
              setSubmitted(false);
              form.reset();
            }}
            className="w-full auth-cta"
          >
            {t(AUTH.LOGIN.SIGNIN_AGAIN)}
          </UiButton>
        </UiDiv>
      </UiDiv>
    );
  }

  return (
    <UiDiv ui={AUTH.SHARED.PAGE} className="auth-page motion-colors">
      <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="min-h-[calc(100dvh-10rem)] md:min-h-[calc(100dvh-5.5rem)] grid lg:grid-cols-2">
        <AuthHero variant="login" />

        <UiDiv ui={AUTH.SHARED.FORM_CARD} className="flex items-center justify-center p-4 sm:p-8 lg:p-12">
          <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="w-full max-w-md space-y-8">
            <AuthMobileBrand />

            <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="space-y-2 text-center lg:text-start">
              <UiHeader ui={AUTH.LOGIN.HEADING} level={1} className="type-display-sm text-on-surface">
                {t(AUTH.LOGIN.HEADING)}
              </UiHeader>
              <p className="type-body-md text-on-surface-variant">{t(AUTH.LOGIN.SUBHEADING)}</p>
            </UiDiv>

            <FormProvider {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
                <Controller
                  name="phone"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="space-y-2">
                      <UiLabel ui={AUTH.LOGIN.PHONE_INPUT} className="type-label-lg flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-primary" />
                        {t(AUTH.LOGIN.PHONE_INPUT)}
                      </UiLabel>
                      <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="relative">
                        <UiSpan
                          ui={COMMON_LAYOUT.SPAN}
                          className="absolute start-3 top-1/2 -translate-y-1/2 type-body-sm text-on-surface-variant select-none"
                        >
                          +20
                        </UiSpan>
                        <UiInput
                          ui={AUTH.LOGIN.PHONE_INPUT}
                          type="tel"
                          inputMode="tel"
                          maxLength={11}
                          placeholder={t(AUTH.SHARED.PHONE_PLACEHOLDER)}
                          className={cn(
                            'auth-input ps-12 motion-colors',
                            fieldState.error && 'border-error focus-visible:ring-error'
                          )}
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value.replace(/\D/g, '').slice(0, 11))}
                        />
                      </UiDiv>
                      {fieldState.error && (
                        <p className="type-caption text-error">{fieldState.error.message}</p>
                      )}
                    </UiDiv>
                  )}
                />

                <Controller
                  name="password"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="space-y-2">
                      <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="flex items-center justify-between">
                        <UiLabel ui={AUTH.LOGIN.PASSWORD_INPUT} className="type-label-lg flex items-center gap-2">
                          <Lock className="h-4 w-4 text-primary" />
                          {t(AUTH.LOGIN.PASSWORD_INPUT)}
                        </UiLabel>
                        <UiButton
                          ui={AUTH.LOGIN.FORGOT_PASSWORD}
                          type="button"
                          variant="link"
                          className="h-auto p-0 type-caption"
                          onClick={() => {
                            /* forgot password flow */
                          }}
                        >
                          {t(AUTH.LOGIN.FORGOT_PASSWORD)}
                        </UiButton>
                      </UiDiv>
                      <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="relative">
                        <UiInput
                          ui={AUTH.LOGIN.PASSWORD_INPUT}
                          type={showPassword ? 'text' : 'password'}
                          placeholder={t(AUTH.SHARED.PASSWORD_PLACEHOLDER)}
                          className={cn(
                            'auth-input pe-10 motion-colors',
                            fieldState.error && 'border-error focus-visible:ring-error'
                          )}
                          {...field}
                        />
                        <UiButton
                          ui={AUTH.LOGIN.TOGGLE_PASSWORD}
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute end-0 top-0 h-full px-3 text-on-surface-variant"
                          onClick={() => setShowPassword((s) => !s)}
                          tabIndex={-1}
                          aria-label={t(AUTH.LOGIN.TOGGLE_PASSWORD)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </UiButton>
                      </UiDiv>
                      {fieldState.error && (
                        <p className="type-caption text-error">{fieldState.error.message}</p>
                      )}
                    </UiDiv>
                  )}
                />

                <UiButton
                  ui={AUTH.LOGIN.SUBMIT_BUTTON}
                  type="submit"
                  disabled={isSubmitting || !form.formState.isValid}
                  className="w-full auth-cta h-12 type-label-lg"
                >
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
                </UiButton>

                <UiButton
                  ui={AUTH.LOGIN.GUEST_LOGIN}
                  type="button"
                  variant="outline"
                  className="w-full h-12 type-label-lg motion-colors"
                  onClick={() => {
                    startGuestSession();
                    router.push('/home');
                  }}
                >
                  <User className="h-4 w-4 me-2" />
                  {t(AUTH.LOGIN.GUEST_LOGIN)}
                </UiButton>
              </form>
            </FormProvider>

            <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="text-center space-y-3">
              <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="relative">
                <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-outline-variant" />
                </UiDiv>
                <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="relative flex justify-center">
                  <UiSpan ui={AUTH.LOGIN.SIGNUP_DIVIDER} className="bg-background px-2 type-caption text-on-surface-variant uppercase">
                    {t(AUTH.LOGIN.SIGNUP_DIVIDER)}
                  </UiSpan>
                </UiDiv>
              </UiDiv>
              <UiLink ui={AUTH.LOGIN.SIGNUP_LINK} href="/registration" className="block">
                <UiButton ui={AUTH.LOGIN.SIGNUP_LINK} variant="ghost" className="w-full h-12 type-label-lg group">
                  {t(AUTH.LOGIN.SIGNUP_LINK)}
                  <ArrowRight className="h-4 w-4 ms-2 motion-transform group-hover:translate-x-1" />
                </UiButton>
              </UiLink>
            </UiDiv>
          </UiDiv>
        </UiDiv>
      </UiDiv>
    </UiDiv>
  );
}
