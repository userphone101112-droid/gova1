'use client';

import { CheckCircle2, Pencil } from 'lucide-react';
import * as React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { cn } from '@/lib/utils';
import type { RegistrationFormData } from '@/lib/validation/auth';
import { UiButton, UiDiv, UiInput, UiLabel, UiSpan, useTranslation } from '@/platform/ui';
import { COMMON_LAYOUT } from '@/platform/ui/registry/categories';
import { AUTH } from '@/platform/ui/registry/features/auth';

import { OtpInput } from './OtpInput';

const RESEND_COUNTDOWN = 60;

export function PhoneVerification() {
  const { t } = useTranslation();
  const { control, setValue, watch, trigger } = useFormContext<RegistrationFormData>();
  const phone = watch('phone');
  const phoneVerified = watch('phoneVerified');

  const [otpSent, setOtpSent] = React.useState(false);
  const [otp, setOtp] = React.useState('');
  const [isSending, setIsSending] = React.useState(false);
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [countdown, setCountdown] = React.useState(0);
  const [otpError, setOtpError] = React.useState('');

  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOtp = async () => {
    const isValid = await trigger('phone');
    if (!isValid) return;

    setIsSending(true);
    setOtpError('');
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSending(false);
    setOtpSent(true);
    setCountdown(RESEND_COUNTDOWN);
    setOtp('');
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setOtpError('Please enter the complete 6-digit code');
      return;
    }

    setIsVerifying(true);
    setOtpError('');
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setIsVerifying(false);
    setValue('phoneVerified', true, { shouldValidate: true });
  };

  const handleEditPhone = () => {
    setValue('phoneVerified', false);
    setOtpSent(false);
    setOtp('');
    setOtpError('');
    setCountdown(0);
  };

  const formatPhoneDisplay = (val: string) => {
    const digits = val.replace(/\D/g, '');
    if (digits.length === 0) return '+20';
    if (digits.length <= 2) return `+20 ${digits}`;
    if (digits.length <= 5) return `+20 ${digits.slice(0, 2)} ${digits.slice(2)}`;
    if (digits.length <= 8) {
      return `+20 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
    }
    return `+20 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 11)}`;
  };

  return (
    <UiDiv ui={AUTH.REGISTRATION.PHONE_INPUT} className="space-y-4">
      <Controller
        name="phone"
        control={control}
        render={({ field, fieldState }) => (
          <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="space-y-2">
            <UiLabel ui={AUTH.REGISTRATION.PHONE_INPUT} className="type-label-lg flex items-center gap-2">
              {t(AUTH.REGISTRATION.PHONE_INPUT)}
            </UiLabel>
            <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="flex gap-2">
              <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="relative flex-1">
                <UiSpan
                  ui={COMMON_LAYOUT.SPAN}
                  className="absolute start-3 top-1/2 -translate-y-1/2 type-body-sm text-on-surface-variant select-none"
                >
                  +20
                </UiSpan>
                <UiInput
                  ui={AUTH.REGISTRATION.PHONE_INPUT}
                  type="tel"
                  inputMode="tel"
                  maxLength={11}
                  disabled={phoneVerified}
                  placeholder={t(AUTH.SHARED.PHONE_PLACEHOLDER)}
                  className={cn(
                    'auth-input ps-12 motion-colors',
                    phoneVerified && 'bg-surface-container pe-10',
                    fieldState.error && 'border-error focus-visible:ring-error'
                  )}
                  value={field.value}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, '').slice(0, 11);
                    field.onChange(raw);
                    if (phoneVerified) setValue('phoneVerified', false);
                    setOtpError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !phoneVerified && !otpSent) {
                      e.preventDefault();
                      void handleSendOtp();
                    }
                  }}
                />
                {phoneVerified && (
                  <CheckCircle2 className="absolute end-3 top-1/2 -translate-y-1/2 h-5 w-5 text-success" />
                )}
              </UiDiv>
              {!phoneVerified && (
                <UiButton
                  ui={AUTH.REGISTRATION.VERIFY_BUTTON}
                  type="button"
                  onClick={() => void handleSendOtp()}
                  disabled={isSending || !phone || phone.length < 10}
                  className="shrink-0 motion-colors"
                >
                  {isSending ? '...' : otpSent ? t(AUTH.REGISTRATION.RESEND_BUTTON) : t(AUTH.REGISTRATION.VERIFY_BUTTON)}
                </UiButton>
              )}
              {phoneVerified && (
                <UiButton
                  ui={AUTH.REGISTRATION.EDIT_BUTTON}
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleEditPhone}
                  aria-label={t(AUTH.REGISTRATION.EDIT_BUTTON)}
                >
                  <Pencil className="h-4 w-4" />
                </UiButton>
              )}
            </UiDiv>
            {phoneVerified && (
              <p className="type-caption text-success flex items-center gap-1 mt-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {t(AUTH.REGISTRATION.PHONE_VERIFIED)}
              </p>
            )}
            {fieldState.error && (
              <p className="type-caption text-error">{fieldState.error.message}</p>
            )}
          </UiDiv>
        )}
      />

      {otpSent && !phoneVerified && (
        <UiDiv
          ui={AUTH.REGISTRATION.OTP_INPUT}
          className="motion-reveal space-y-4 rounded-xl border border-outline-variant bg-card p-4 elevation-2"
        >
          <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="space-y-1">
            <p className="type-label-lg">{t(AUTH.REGISTRATION.OTP_LABEL)}</p>
            <p className="type-caption text-on-surface-variant">
              {t(AUTH.REGISTRATION.OTP_DESCRIPTION)}{' '}
              <span className="font-medium text-on-surface">{formatPhoneDisplay(phone)}</span>
            </p>
          </UiDiv>

          <OtpInput
            ui={AUTH.REGISTRATION.OTP_INPUT}
            value={otp}
            onChange={setOtp}
            onComplete={() => void handleVerifyOtp()}
            disabled={isVerifying}
            hasError={!!otpError}
          />

          {otpError && <p className="type-caption text-error text-center">{otpError}</p>}

          <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="flex items-center gap-3 w-full">
            <UiButton
              ui={AUTH.REGISTRATION.VERIFY_OTP_BUTTON}
              type="button"
              onClick={() => void handleVerifyOtp()}
              disabled={otp.length !== 6 || isVerifying}
              className="flex-1 motion-colors"
            >
              {isVerifying ? t(AUTH.REGISTRATION.VERIFYING_OTP) : t(AUTH.REGISTRATION.VERIFY_OTP_BUTTON)}
            </UiButton>
            <UiButton
              ui={AUTH.REGISTRATION.RESEND_BUTTON}
              type="button"
              variant="outline"
              onClick={() => void handleSendOtp()}
              disabled={countdown > 0 || isSending}
              className="shrink-0"
            >
              {countdown > 0 ? `${countdown}s` : t(AUTH.REGISTRATION.RESEND_BUTTON)}
            </UiButton>
          </UiDiv>
        </UiDiv>
      )}
    </UiDiv>
  );
}
