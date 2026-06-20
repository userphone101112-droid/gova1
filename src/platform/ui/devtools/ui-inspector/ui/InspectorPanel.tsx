'use client';

import type { ReactNode } from 'react';

export type InspectorPanelTone =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'tertiary'
  | 'warning';

const TONE_BORDER: Record<InspectorPanelTone, string> = {
  default: 'border-outline-variant bg-surface',
  primary: 'border-primary/25 bg-primary/5',
  secondary: 'border-secondary/25 bg-secondary/5',
  success: 'border-success/25 bg-success/5',
  tertiary: 'border-tertiary/25 bg-tertiary/5',
  warning: 'border-warning/25 bg-warning/5',
};

const TONE_TITLE: Record<InspectorPanelTone, string> = {
  default: 'text-on-surface',
  primary: 'text-primary',
  secondary: 'text-secondary',
  success: 'text-success',
  tertiary: 'text-tertiary',
  warning: 'text-on-surface',
};

type InspectorPanelProps = {
  title: string;
  description?: string;
  tone?: InspectorPanelTone;
  instanceId?: string;
  className?: string;
  children?: ReactNode;
};

export function InspectorPanel({
  title,
  description,
  tone = 'default',
  instanceId,
  className = '',
  children,
}: InspectorPanelProps) {
  return (
    <section
      {...(instanceId ? { 'data-ui-instance-id': instanceId } : {})}
      className={`rounded-md border ${TONE_BORDER[tone]} ${className}`}
    >
      <header className="border-b border-inherit px-3 py-2">
        <h3
          {...(instanceId ? { 'data-ui-instance-id': `${instanceId}-title` } : {})}
          className={`text-sm font-medium ${TONE_TITLE[tone]}`}
        >
          {title}
        </h3>
        {description ? (
          <p
            {...(instanceId ? { 'data-ui-instance-id': `${instanceId}-desc` } : {})}
            className="mt-0.5 text-[10px] leading-snug text-on-surface-variant"
          >
            {description}
          </p>
        ) : null}
      </header>
      <div className="flex flex-col gap-3 px-3 py-3">{children}</div>
    </section>
  );
}
