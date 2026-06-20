'use client';

import { inspectorInputClass } from './InspectorField';

type InspectorTextareaProps = {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  disabled?: boolean;
  instanceId?: string;
  className?: string;
};

export function InspectorTextarea({
  value,
  onChange,
  rows = 3,
  placeholder,
  disabled = false,
  instanceId,
  className = '',
}: InspectorTextareaProps) {
  return (
    <textarea
      {...(instanceId ? { 'data-ui-instance-id': instanceId } : {})}
      value={value}
      rows={rows}
      placeholder={placeholder}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      className={`${inspectorInputClass} resize-y disabled:opacity-50 ${className}`}
    />
  );
}
