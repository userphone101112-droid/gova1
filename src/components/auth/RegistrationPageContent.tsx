'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, CheckCircle2, Loader2, Shield } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';

import { AuthHero } from '@/components/auth/AuthHero';
import { AuthMobileBrand } from '@/components/auth/AuthMobileBrand';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { PasswordStrength } from '@/components/auth/PasswordStrength';
import { PhoneVerification } from '@/components/auth/PhoneVerification';
import { useGuestSession } from '@/hooks/use-guest-session';
import { cn } from '@/lib/utils';
import { registrationSchema, type RegistrationFormData } from '@/lib/validation/auth';
import {
  UiButton,
  UiDiv,
  UiHeader,
  UiLink,
  useTranslation,
} from '@/platform/ui';
import { COMMON_LAYOUT } from '@/platform/ui/registry/categories';
import { AUTH } from '@/platform/ui/registry/features/auth';

export function RegistrationPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const { endGuestSession } = useGuestSession();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      phone: '',
      password: '',
      confirmPassword: '',
      phoneVerified: false,
    },
    mode: 'onChange',
  });

  const password = useWatch({ control: form.control, name: 'password' }) ?? '';
  const phoneVerified = useWatch({ control: form.control, name: 'phoneVerified' }) ?? false;

  const onSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setSubmitted(true);
    endGuestSession();
    void data;
  };

  const handleContinue = () => {
    const redirect = searchParams.get('redirect');
    router.push(redirect ?? '/home');
  };

  if (submitted) {
    return (
      <UiDiv ui={AUTH.SHARED.PAGE} className="auth-page flex items-center justify-center px-4">
        <UiDiv ui={AUTH.SHARED.FORM_CARD} className="auth-card w-full max-w-md text-center space-y-6 motion-reveal">
          <UiDiv
            ui={COMMON_LAYOUT.WRAPPER}
            className="mx-auto w-20 h-20 rounded-full bg-success-container flex items-center justify-center"
          >
            <CheckCircle2 className="h-10 w-10 text-success" />
          </UiDiv>
          <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="space-y-2">
            <UiHeader ui={AUTH.REGISTRATION.SUCCESS_HEADING} level={2} className="type-headline-md">
              {t(AUTH.REGISTRATION.SUCCESS_HEADING)}
            </UiHeader>
            <p className="type-body-md text-on-surface-variant">{t(AUTH.REGISTRATION.SUCCESS_DESCRIPTION)}</p>
          </UiDiv>
          <UiButton ui={AUTH.REGISTRATION.CONTINUE_BUTTON} onClick={handleContinue} className="w-full auth-cta">
            {t(AUTH.REGISTRATION.CONTINUE_BUTTON)}
            <ArrowRight className="h-4 w-4 ms-2" />
          </UiButton>
        </UiDiv>
      </UiDiv>
    );
  }

  return (
    <UiDiv ui={AUTH.SHARED.PAGE} className="auth-page motion-colors">
      <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="min-h-[calc(100dvh-10rem)] md:min-h-[calc(100dvh-5.5rem)] grid lg:grid-cols-[1fr_2fr]">
        <AuthHero variant="registration" />

        <UiDiv ui={AUTH.SHARED.FORM_CARD} className="flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12 w-full">
          <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="w-full max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl 2xl:max-w-6xl space-y-6 sm:space-y-8">
            <AuthMobileBrand />

            <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="space-y-2 text-center lg:text-start">
              <UiHeader ui={AUTH.REGISTRATION.TITLE} level={1} className="type-display-sm text-on-surface">
                {t(AUTH.REGISTRATION.TITLE)}
              </UiHeader>
              <p className="type-body-md text-on-surface-variant">{t(AUTH.REGISTRATION.CARD_DESCRIPTION)}</p>
            </UiDiv>

            <FormProvider {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
                <PhoneVerification />

                <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="space-y-4">
                  <PasswordInput
                    name="password"
                    labelIdentity={AUTH.REGISTRATION.PASSWORD_INPUT}
                    inputIdentity={AUTH.REGISTRATION.PASSWORD_INPUT}
                  />
                  {password.length > 0 && <PasswordStrength password={password} />}
                  <PasswordInput
                    name="confirmPassword"
                    labelIdentity={AUTH.REGISTRATION.CONFIRM_PASSWORD_INPUT}
                    inputIdentity={AUTH.REGISTRATION.CONFIRM_PASSWORD_INPUT}
                  />
                </UiDiv>

                <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="space-y-3">
                  {!phoneVerified && (
                    <p className="type-caption text-on-surface-variant flex items-center gap-1.5">
                      <Shield className="h-3.5 w-3.5" />
                      {t(AUTH.REGISTRATION.PHONE_REQUIRED)}
                    </p>
                  )}
                  <UiButton
                    ui={AUTH.REGISTRATION.SUBMIT_BUTTON}
                    type="submit"
                    disabled={isSubmitting || !phoneVerified}
                    className={cn('w-full auth-cta h-12 type-label-lg', !phoneVerified && 'opacity-disabled')}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin me-2" />
                        {t(AUTH.REGISTRATION.SUBMITTING_BUTTON)}
                      </>
                    ) : (
                      <>
                        {t(AUTH.REGISTRATION.SUBMIT_BUTTON)}
                        <ArrowRight className="h-4 w-4 ms-2" />
                      </>
                    )}
                  </UiButton>
                </UiDiv>
              </form>
            </FormProvider>

            <p className="text-center type-body-sm text-on-surface-variant">
              {t(AUTH.REGISTRATION.SIGNIN_PROMPT)}{' '}
              <UiLink ui={AUTH.REGISTRATION.SIGNIN_LINK} href="/login" className="font-medium text-primary hover:underline">
                {t(AUTH.REGISTRATION.SIGNIN_LINK)}
              </UiLink>
            </p>
          </UiDiv>
        </UiDiv>
      </UiDiv>
    </UiDiv>
  );
}
