'use client';

import type { ReactNode } from 'react';

type InspectorFieldProps = {
  label: string;
  hint?: string;
  inline?: boolean;
  labelUuid?: string;
  instanceId?: string;
  className?: string;
  children: ReactNode;
};

export const inspectorInputClass =
  'w-full min-w-0 rounded border border-outline-variant bg-surface px-2 py-1.5 text-xs';

export const inspectorSelectClass = inspectorInputClass;

export const inspectorPanelStackClass = 'flex flex-col gap-3 px-3 py-3';

export function InspectorField({
  label,
  hint,
  inline = false,
  labelUuid,
  instanceId,
  className = '',
  children,
}: InspectorFieldProps) {
  return (
    <div
      className={`${inline ? 'flex shrink-0 flex-row items-center gap-2' : 'flex flex-col gap-1'} ${className}`}
    >
      <span
        {...(labelUuid ? { 'data-ui-uuid': labelUuid } : {})}
        {...(instanceId ? { 'data-ui-instance-id': `${instanceId}-label` } : {})}
        className={`font-medium text-on-surface ${inline ? 'shrink-0 whitespace-nowrap text-[11px]' : 'text-xs'}`}
      >
        {label}
      </span>
      {!inline && hint ? (
        <span
          {...(instanceId ? { 'data-ui-instance-id': `${instanceId}-hint` } : {})}
          className="text-[10px] leading-snug text-on-surface-variant"
        >
          {hint}
        </span>
      ) : null}
      {children}
    </div>
  );
}
