'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type InspectorActionButtonVariant = 'primary' | 'secondary' | 'danger';

const VARIANT_CLASS: Record<InspectorActionButtonVariant, string> = {
  primary: 'bg-primary text-on-primary hover:bg-primary/90',
  secondary: 'border border-outline-variant bg-surface hover:bg-surface-container',
  danger: 'bg-error text-on-error hover:bg-error/90',
};

type InspectorActionButtonProps = {
  variant?: InspectorActionButtonVariant;
  children: ReactNode;
  instanceId?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'>;

export function InspectorActionButton({
  variant = 'secondary',
  children,
  instanceId,
  type = 'button',
  ...rest
}: InspectorActionButtonProps) {
  return (
    <button
      {...(instanceId ? { 'data-ui-instance-id': instanceId } : {})}
      type={type}
      className={`rounded px-2.5 py-1 text-xs font-medium disabled:opacity-50 ${VARIANT_CLASS[variant]}`}
      {...rest}
    >
      {children}
    </button>
  );
}
