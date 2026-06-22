'use client';

import { Controller, useFormContext } from 'react-hook-form';

import { cn } from '@/lib/utils';
import type { RegistrationFormData } from '@/lib/validation/auth';
import { useTranslation } from '@/platform/ui';
import { AUTH } from '@/platform/ui/registry/features/auth';

export function EmailInput() {
  const { t } = useTranslation();
  const { control } = useFormContext<RegistrationFormData>();

  return (
    <Controller
      name="email"
      control={control}
      render={({ field, fieldState }) => (
        <div className="space-y-2">
          <span className="type-label-lg">
            {t(AUTH.REGISTRATION.EMAIL_INPUT)}
          </span>
          <div className="relative">
            <input
              data-ui-uuid={AUTH.REGISTRATION.EMAIL_INPUT.uuid}
              type="email"
              inputMode="email"
              placeholder={t(AUTH.REGISTRATION.EMAIL_INPUT)}
              className={cn(
                'auth-input motion-colors w-full',
                fieldState.error && 'border-error focus-visible:ring-error'
              )}
              value={field.value || ''}
              onChange={field.onChange}
            />
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
