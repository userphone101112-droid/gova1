'use client';

import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';
import { UiDiv, useTranslation } from '@/platform/ui';
import { COMMON_LAYOUT } from '@/platform/ui/registry/categories';
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
    <UiDiv ui={AUTH.REGISTRATION.PASSWORD_STRENGTH} className="space-y-2 motion-opacity">
      <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="flex items-center justify-between">
        <span className="type-caption text-on-surface-variant">{t(AUTH.REGISTRATION.PASSWORD_STRENGTH)}</span>
        <span
          className={cn(
            'type-caption font-medium',
            strength <= 2 && 'text-error',
            strength === 3 && 'text-warning',
            strength >= 4 && 'text-success'
          )}
        >
          {strengthLabel}
        </span>
      </UiDiv>
      <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <UiDiv
            key={i}
            ui={COMMON_LAYOUT.CONTAINER}
            className={cn(
              'h-1.5 flex-1 rounded-full motion-colors',
              i < strength ? barColor : 'bg-surface-container-high'
            )}
          />
        ))}
      </UiDiv>
      <ul className="space-y-1">
        {REQUIREMENTS.map((req) => {
          const isMet = req.test(password);
          return (
            <li
              key={req.key.id}
              className={cn(
                'flex items-center gap-1.5 type-caption motion-colors',
                isMet ? 'text-success' : 'text-on-surface-variant'
              )}
            >
              <Check className={cn('h-3.5 w-3.5', isMet ? 'opacity-100' : 'opacity-subtle')} />
              {t(req.key)}
            </li>
          );
        })}
      </ul>
    </UiDiv>
  );
}
