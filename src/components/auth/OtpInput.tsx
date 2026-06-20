'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';
import { AUTH, UiDiv, UiInput, useTranslation } from '@/platform/ui';
import { COMMON_LAYOUT } from '@/platform/ui/registry/categories';
import type { UiIdentity } from '@/platform/ui/registry/types';

interface OtpInputProps {
  ui: UiIdentity;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  length?: number;
  hasError?: boolean;
}

export function OtpInput({
  ui,
  value,
  onChange,
  onComplete,
  disabled = false,
  length = 6,
  hasError = false,
}: OtpInputProps) {
  const { t } = useTranslation();
  const inputsRef = React.useRef<Array<HTMLInputElement | null>>([]);

  const digits = value.padEnd(length, ' ').slice(0, length).split('');

  const updateValue = (next: string) => {
    const sanitized = next.replace(/\D/g, '').slice(0, length);
    onChange(sanitized);
    if (sanitized.length === length) {
      onComplete?.(sanitized);
    }
  };

  const handleChange = (index: number, char: string) => {
    const digit = char.replace(/\D/g, '').slice(-1);
    const next = digits.map((d, i) => (i === index ? digit : d.trim())).join('').replace(/\s/g, '');
    updateValue(next);
    if (digit && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index]?.trim() && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    updateValue(e.clipboardData.getData('text'));
  };

  return (
    <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="flex gap-2 justify-center" onPaste={handlePaste}>
      {Array.from({ length }).map((_, index) => (
        <UiInput
          key={index}
          ui={ui}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          disabled={disabled}
          value={digits[index]?.trim() ?? ''}
          aria-label={`${t(AUTH.REGISTRATION.OTP_INPUT)} ${index + 1}`}
          className={cn(
            'auth-otp-cell type-title-lg motion-colors focus:outline-none focus:ring-2 focus:ring-focus-ring',
            hasError && 'border-error focus:ring-error'
          )}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
        />
      ))}
    </UiDiv>
  );
}
