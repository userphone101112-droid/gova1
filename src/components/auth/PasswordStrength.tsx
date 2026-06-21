'use client';

import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useTranslation } from '@/platform/ui';
import { AUTH } from '@/platform/ui/registry/features/auth';

interface PasswordStrengthProps {
  password: string;
}

const REQUIREMENTS = [
  { key: AUTH.REGISTRATION.REQ_MIN_LENGTH, test: (pwd: string) => pwd.length >= 4 },
] as const;

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const { t } = useTranslation();
  const passed = REQUIREMENTS.filter((r) => r.test(password)).length;
  const strength = passed;

  const barColor = strength === 0 ? 'bg-error' : 'bg-success';

  const strengthLabel =
    strength === 0
      ? t(AUTH.REGISTRATION.STRENGTH_WEAK)
      : t(AUTH.REGISTRATION.STRENGTH_GOOD);

  return (
    <div data-ui-uuid={AUTH.REGISTRATION.PASSWORD_STRENGTH_CONTAINER.uuid} className="space-y-2 motion-opacity">
      <div data-ui-uuid={AUTH.SHELL.REGISTRATION_PASSWORD_STRENGTH_WRAPPER_L41.uuid} className="flex items-center justify-between">
        <span data-ui-uuid={AUTH.REGISTRATION.PASSWORD_STRENGTH.uuid} className="type-caption text-on-surface-variant">{t(AUTH.REGISTRATION.PASSWORD_STRENGTH)}</span>
        <span
          data-ui-uuid={AUTH.SHELL.REGISTRATION_PASSWORD_STRENGTH_WRAPPER_L44.uuid} className={cn(
            'type-caption font-medium',
            strength === 0 && 'text-error',
            strength >= 1 && 'text-success'
          )}
        >
          {strengthLabel}
        </span>
      </div>
      <div data-ui-uuid={AUTH.SHELL.REGISTRATION_PASSWORD_STRENGTH_WRAPPER_L54.uuid} className="flex gap-1">
        {Array.from({ length: 2 }).map((_, i) => (
          <div data-ui-uuid={AUTH.SHELL.REGISTRATION_PASSWORD_STRENGTH_CONTAINER_L56.uuid} key={i} className={cn('h-1.5 flex-1 rounded-full motion-colors', i < strength ? barColor : 'bg-surface-container-high')} />
        ))}
      </div>
      <ul data-ui-uuid={AUTH.SHELL.KEY_WRAPPER_L59.uuid} className="space-y-1">
        <li
          data-ui-uuid={AUTH.REGISTRATION.REQ_MIN_LENGTH.uuid}
          className={cn(
            'flex items-center gap-1.5 type-caption motion-colors',
            REQUIREMENTS[0].test(password) ? 'text-success' : 'text-on-surface-variant'
          )}
        >
          <Check className={cn('h-3.5 w-3.5', REQUIREMENTS[0].test(password) ? 'opacity-100' : 'opacity-subtle')} />
          {t(AUTH.REGISTRATION.REQ_MIN_LENGTH)}
        </li>
      </ul>
    </div>
  );
}
