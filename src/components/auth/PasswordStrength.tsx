'use client';

import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useTranslation } from '@/platform/ui';
import { AUTH } from '@/platform/ui/registry/features/auth';

interface PasswordStrengthProps {
  password: string;
}

const REQUIREMENTS = [
  { key: AUTH.REGISTRATION.REQ_MIN_LENGTH, test: (pwd: string) => pwd.length >= 8 },
  { key: AUTH.REGISTRATION.REQ_UPPERCASE, test: (pwd: string) => /[A-Z]/.test(pwd) },
  { key: AUTH.REGISTRATION.REQ_LOWERCASE, test: (pwd: string) => /[a-z]/.test(pwd) },
  { key: AUTH.REGISTRATION.REQ_NUMBER, test: (pwd: string) => /[0-9]/.test(pwd) },
  { key: AUTH.REGISTRATION.REQ_SPECIAL, test: (pwd: string) => /[^A-Za-z0-9]/.test(pwd) },
] as const;

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const { t } = useTranslation();
  const passed = REQUIREMENTS.filter((r) => r.test(password)).length;
  const strength = Math.min(passed, 5);

  const barColor =
    strength <= 2 ? 'bg-error' : strength === 3 ? 'bg-warning' : 'bg-success';

  const strengthLabel =
    strength <= 2
      ? t(AUTH.REGISTRATION.STRENGTH_WEAK)
      : strength === 3
        ? t(AUTH.REGISTRATION.STRENGTH_FAIR)
        : strength === 4
          ? t(AUTH.REGISTRATION.STRENGTH_GOOD)
          : t(AUTH.REGISTRATION.STRENGTH_STRONG);

  return (
    <div data-ui-uuid={AUTH.REGISTRATION.PASSWORD_STRENGTH_CONTAINER.uuid} className="space-y-2 motion-opacity">
      <div data-ui-uuid={AUTH.SHELL.REGISTRATION_PASSWORD_STRENGTH_WRAPPER_L41.uuid} className="flex items-center justify-between">
        <span data-ui-uuid={AUTH.REGISTRATION.PASSWORD_STRENGTH.uuid} className="type-caption text-on-surface-variant">{t(AUTH.REGISTRATION.PASSWORD_STRENGTH)}</span>
        <span
          data-ui-uuid={AUTH.SHELL.REGISTRATION_PASSWORD_STRENGTH_WRAPPER_L44.uuid} className={cn(
            'type-caption font-medium',
            strength <= 2 && 'text-error',
            strength === 3 && 'text-warning',
            strength >= 4 && 'text-success'
          )}
        >
          {strengthLabel}
        </span>
      </div>
      <div data-ui-uuid={AUTH.SHELL.REGISTRATION_PASSWORD_STRENGTH_WRAPPER_L54.uuid} className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
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
        <li
          data-ui-uuid={AUTH.REGISTRATION.REQ_UPPERCASE.uuid}
          className={cn(
            'flex items-center gap-1.5 type-caption motion-colors',
            REQUIREMENTS[1].test(password) ? 'text-success' : 'text-on-surface-variant'
          )}
        >
          <Check className={cn('h-3.5 w-3.5', REQUIREMENTS[1].test(password) ? 'opacity-100' : 'opacity-subtle')} />
          {t(AUTH.REGISTRATION.REQ_UPPERCASE)}
        </li>
        <li
          data-ui-uuid={AUTH.REGISTRATION.REQ_LOWERCASE.uuid}
          className={cn(
            'flex items-center gap-1.5 type-caption motion-colors',
            REQUIREMENTS[2].test(password) ? 'text-success' : 'text-on-surface-variant'
          )}
        >
          <Check className={cn('h-3.5 w-3.5', REQUIREMENTS[2].test(password) ? 'opacity-100' : 'opacity-subtle')} />
          {t(AUTH.REGISTRATION.REQ_LOWERCASE)}
        </li>
        <li
          data-ui-uuid={AUTH.REGISTRATION.REQ_NUMBER.uuid}
          className={cn(
            'flex items-center gap-1.5 type-caption motion-colors',
            REQUIREMENTS[3].test(password) ? 'text-success' : 'text-on-surface-variant'
          )}
        >
          <Check className={cn('h-3.5 w-3.5', REQUIREMENTS[3].test(password) ? 'opacity-100' : 'opacity-subtle')} />
          {t(AUTH.REGISTRATION.REQ_NUMBER)}
        </li>
        <li
          data-ui-uuid={AUTH.REGISTRATION.REQ_SPECIAL.uuid}
          className={cn(
            'flex items-center gap-1.5 type-caption motion-colors',
            REQUIREMENTS[4].test(password) ? 'text-success' : 'text-on-surface-variant'
          )}
        >
          <Check className={cn('h-3.5 w-3.5', REQUIREMENTS[4].test(password) ? 'opacity-100' : 'opacity-subtle')} />
          {t(AUTH.REGISTRATION.REQ_SPECIAL)}
        </li>
      </ul>
    </div>
  );
}
