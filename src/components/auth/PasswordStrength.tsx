'use client';

import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';
import { type UiIdentity, useTranslation } from '@/platform/ui';
import { AUTH } from '@/platform/ui/registry/features/auth';

interface PasswordStrengthProps {
  password: string;
}

const REQUIREMENTS = [
  { key: AUTH.REGISTRATION.REQ_MIN_LENGTH, test: (pwd: string) => pwd.length >= 4 },
  { key: AUTH.REGISTRATION.REQ_LOWERCASE, test: (pwd: string) => /[a-z]/.test(pwd) || /[\u0600-\u06FF]/.test(pwd) },
  { key: AUTH.REGISTRATION.REQ_NUMBER, test: (pwd: string) => /[0-9]/.test(pwd) },
  { key: AUTH.REGISTRATION.REQ_SPECIAL, test: (pwd: string) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd) },
] as const;

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const { t } = useTranslation();

  const hasMinLength = REQUIREMENTS[0].test(password);
  const hasLetter = REQUIREMENTS[1].test(password);
  const hasNumber = REQUIREMENTS[2].test(password);
  const hasSpecial = REQUIREMENTS[3].test(password);

  let strength = 0;
  let strengthLabelKey: UiIdentity = AUTH.REGISTRATION.STRENGTH_WEAK;
  let strengthColor = 'bg-error text-error';

  if (!hasMinLength) {
    strength = 0;
    strengthLabelKey = AUTH.REGISTRATION.STRENGTH_WEAK;
    strengthColor = 'bg-error text-error';
  } else if (!hasLetter && !hasNumber && !hasSpecial) {
    strength = 1;
    strengthLabelKey = AUTH.REGISTRATION.STRENGTH_FAIR;
    strengthColor = 'bg-yellow-500 text-yellow-600';
  } else if (hasLetter && hasNumber && !hasSpecial) {
    strength = 2;
    strengthLabelKey = AUTH.REGISTRATION.STRENGTH_GOOD;
    strengthColor = 'bg-blue-500 text-blue-600';
  } else if (hasLetter && hasNumber && hasSpecial) {
    strength = 3;
    strengthLabelKey = AUTH.REGISTRATION.STRENGTH_STRONG;
    strengthColor = 'bg-success text-success';
  } else {
    strength = 1; // Default to accepted for other cases
    strengthLabelKey = AUTH.REGISTRATION.STRENGTH_FAIR;
    strengthColor = 'bg-yellow-500 text-yellow-600';
  }

  return (
    <div className="space-y-2 motion-opacity">
      <div className="flex items-center justify-between">
        <span data-ui-uuid={AUTH.REGISTRATION.PASSWORD_STRENGTH.uuid}
          data-ui-lang-uuid={`lang-${AUTH.REGISTRATION.PASSWORD_STRENGTH.uuid}`} className="type-caption text-on-surface-variant">{t('auth.registration.passwordStrengthLabel')}</span>
        <span className={cn(
            'type-caption font-medium',
            strengthColor.split(' ')[1]
          )}
        >
          {t(strengthLabelKey)}
        </span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1.5 flex-1 rounded-full motion-colors',
              i < strength ? strengthColor.split(' ')[0] : 'bg-surface-container-high'
            )}
          />
        ))}
      </div>
      <ul className="space-y-1">
        <li
          data-ui-uuid={AUTH.REGISTRATION.REQ_MIN_LENGTH.uuid}
          data-ui-lang-uuid={`lang-${AUTH.REGISTRATION.REQ_MIN_LENGTH.uuid}`}
          className={cn(
            'flex items-center gap-1.5 type-caption motion-colors',
            REQUIREMENTS[0].test(password) ? 'text-success' : 'text-on-surface-variant'
          )}
        >
          <Check className={cn('h-3.5 w-3.5', REQUIREMENTS[0].test(password) ? 'opacity-100' : 'opacity-subtle')} />
          {t('auth.registration.reqMinLength')}
        </li>
        <li
          data-ui-uuid={AUTH.REGISTRATION.REQ_LOWERCASE.uuid}
          data-ui-lang-uuid={`lang-${AUTH.REGISTRATION.REQ_LOWERCASE.uuid}`}
          className={cn(
            'flex items-center gap-1.5 type-caption motion-colors',
            REQUIREMENTS[1].test(password) ? 'text-success' : 'text-on-surface-variant'
          )}
        >
          <Check className={cn('h-3.5 w-3.5', REQUIREMENTS[1].test(password) ? 'opacity-100' : 'opacity-subtle')} />
          {t('auth.registration.reqLowercase')}
        </li>
        <li
          data-ui-uuid={AUTH.REGISTRATION.REQ_NUMBER.uuid}
          data-ui-lang-uuid={`lang-${AUTH.REGISTRATION.REQ_NUMBER.uuid}`}
          className={cn(
            'flex items-center gap-1.5 type-caption motion-colors',
            REQUIREMENTS[2].test(password) ? 'text-success' : 'text-on-surface-variant'
          )}
        >
          <Check className={cn('h-3.5 w-3.5', REQUIREMENTS[2].test(password) ? 'opacity-100' : 'opacity-subtle')} />
          {t('auth.registration.reqNumber')}
        </li>
        <li
          data-ui-uuid={AUTH.REGISTRATION.REQ_SPECIAL.uuid}
          data-ui-lang-uuid={`lang-${AUTH.REGISTRATION.REQ_SPECIAL.uuid}`}
          className={cn(
            'flex items-center gap-1.5 type-caption motion-colors',
            REQUIREMENTS[3].test(password) ? 'text-success' : 'text-on-surface-variant'
          )}
        >
          <Check className={cn('h-3.5 w-3.5', REQUIREMENTS[3].test(password) ? 'opacity-100' : 'opacity-subtle')} />
          {t('auth.registration.reqSpecial')}
        </li>
      </ul>
    </div>
  );
}
