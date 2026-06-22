'use client';

import { Eye, EyeOff } from 'lucide-react';
import * as React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { cn } from '@/lib/utils';
import type { RegistrationFormData } from '@/lib/validation/auth';
import { useTranslation } from '@/platform/ui';
import { AUTH } from '@/platform/ui/registry/features/auth';

interface PasswordInputProps {
  name: 'password' | 'confirmPassword';
}

export function PasswordInput({ name }: PasswordInputProps) {
  const [show, setShow] = React.useState(false);
  const { t } = useTranslation();
  const { control } = useFormContext<RegistrationFormData>();

  if (name === 'password') {
    return (
      <Controller
        name="password"
        control={control}
        render={({ field, fieldState }) => (
          <div className="space-y-2">
            <span className="type-label-lg">
              {t('auth.registration.phoneVerifiedMessage')}
            </span>
            <div className="relative">
              <input
                data-ui-uuid={AUTH.REGISTRATION.PASSWORD_INPUT.uuid}
          data-ui-lang-uuid={`lang-${AUTH.REGISTRATION.PASSWORD_INPUT.uuid}`}
                type={show ? 'text' : 'password'}
                placeholder={t('auth.registration.passwordInput')}
                className={cn(
                  'auth-input pe-10 motion-colors w-full',
                  fieldState.error && 'border-error focus-visible:ring-error'
                )}
                value={field.value}
                onChange={field.onChange}
              />
              <button
                data-ui-uuid={AUTH.REGISTRATION.TOGGLE_PASSWORD.uuid}
          data-ui-lang-uuid={`lang-${AUTH.REGISTRATION.TOGGLE_PASSWORD.uuid}`}
                type="button"
                className="absolute end-0 top-0 h-full px-3 text-on-surface-variant hover:text-on-surface"
                onClick={() => setShow((s) => !s)}
                tabIndex={-1}
                aria-label={t('auth.registration.togglePasswordVisibility')}
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {fieldState.error && (
              <p className="type-caption text-error">
                {fieldState.error.message ? t(fieldState.error.message as any, fieldState.error.message) : ''}
              </p>
            )}
          </div>
        )}
      />
    );
  }

  return (
    <Controller
      name="confirmPassword"
      control={control}
      render={({ field, fieldState }) => (
        <div className="space-y-2">
          <span className="type-label-lg">
            {t('auth.registration.passwordInputLabel')}
          </span>
          <div className="relative">
            <input
              data-ui-uuid={AUTH.REGISTRATION.CONFIRM_PASSWORD_INPUT.uuid}
          data-ui-lang-uuid={`lang-${AUTH.REGISTRATION.CONFIRM_PASSWORD_INPUT.uuid}`}
              type={show ? 'text' : 'password'}
              placeholder={t('auth.registration.confirmPasswordInput')}
              className={cn(
                'auth-input pe-10 motion-colors w-full',
                fieldState.error && 'border-error focus-visible:ring-error'
              )}
              value={field.value}
              onChange={field.onChange}
            />
            <button
              type="button"
              className="absolute end-0 top-0 h-full px-3 text-on-surface-variant hover:text-on-surface"
              onClick={() => setShow((s) => !s)}
              tabIndex={-1}
              aria-label={t('auth.registration.emailInputLabel')}
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {fieldState.error && (
            <p className="type-caption text-error">
              {fieldState.error.message ? t(fieldState.error.message as any, fieldState.error.message) : ''}
            </p>
          )}
        </div>
      )}
    />
  );
}
