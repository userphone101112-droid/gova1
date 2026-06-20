'use client';

import type { BindingKind } from '../data/element-binding.types';

const KIND_CLASS: Record<BindingKind, string> = {
  database: 'bg-primary/15 text-primary border-primary/30',
  storage: 'bg-success/15 text-success border-success/30',
  element: 'bg-secondary/15 text-secondary border-secondary/30',
  derived: 'bg-tertiary/15 text-tertiary border-tertiary/30',
};

type InspectorBadgeProps = {
  kind: BindingKind;
  instanceId?: string;
};

export function InspectorBadge({ kind, instanceId }: InspectorBadgeProps) {
  return (
    <span
      {...(instanceId ? { 'data-ui-instance-id': instanceId } : {})}
      className={`inline-flex shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${KIND_CLASS[kind]}`}
    >
      {kind}
    </span>
  );
}
