'use client';

import { Eye, EyeOff } from 'lucide-react';
import * as React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { cn } from '@/lib/utils';
import type { RegistrationFormData } from '@/lib/validation/auth';
import { UiButton, UiDiv, UiInput, UiLabel, useTranslation } from '@/platform/ui';
import { COMMON_LAYOUT } from '@/platform/ui/registry/categories';
import { AUTH } from '@/platform/ui/registry/features/auth';

interface PasswordInputProps {
  name: 'password' | 'confirmPassword';
  labelIdentity: typeof AUTH.REGISTRATION.PASSWORD_INPUT | typeof AUTH.REGISTRATION.CONFIRM_PASSWORD_INPUT;
  inputIdentity: typeof AUTH.REGISTRATION.PASSWORD_INPUT | typeof AUTH.REGISTRATION.CONFIRM_PASSWORD_INPUT;
  toggleIdentity?: typeof AUTH.REGISTRATION.TOGGLE_PASSWORD;
  placeholderIdentity?: typeof AUTH.SHARED.PASSWORD_PLACEHOLDER;
}

export function PasswordInput({
  name,
  labelIdentity,
  inputIdentity,
  toggleIdentity = AUTH.REGISTRATION.TOGGLE_PASSWORD,
  placeholderIdentity = AUTH.SHARED.PASSWORD_PLACEHOLDER,
}: PasswordInputProps) {
  const [show, setShow] = React.useState(false);
  const { t } = useTranslation();
  const { control } = useFormContext<RegistrationFormData>();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="space-y-2">
          <UiLabel ui={labelIdentity} className="type-label-lg">
            {t(labelIdentity)}
          </UiLabel>
          <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="relative">
            <UiInput
              ui={inputIdentity}
              {...field}
              type={show ? 'text' : 'password'}
              placeholder={t(placeholderIdentity)}
              className={cn(
                'auth-input pe-10 motion-colors',
                fieldState.error && 'border-error focus-visible:ring-error'
              )}
            />
            <UiButton
              ui={toggleIdentity}
              type="button"
              variant="ghost"
              size="icon"
              className="absolute end-0 top-0 h-full px-3 text-on-surface-variant hover:text-on-surface"
              onClick={() => setShow((s) => !s)}
              tabIndex={-1}
              aria-label={t(toggleIdentity)}
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </UiButton>
          </UiDiv>
          {fieldState.error && (
            <p className="type-caption text-error">{fieldState.error.message}</p>
          )}
        </UiDiv>
      )}
    />
  );
}
