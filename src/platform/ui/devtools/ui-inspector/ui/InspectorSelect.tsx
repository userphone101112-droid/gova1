'use client';

import { inspectorSelectClass } from './InspectorField';

export type InspectorSelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type InspectorSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: InspectorSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  instanceId?: string;
  className?: string;
};

export function InspectorSelect({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  disabled = false,
  instanceId,
  className = '',
}: InspectorSelectProps) {
  return (
    <select
      {...(instanceId ? { 'data-ui-instance-id': instanceId } : {})}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      className={`${inspectorSelectClass} disabled:opacity-50 ${className}`}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
          disabled={option.disabled}
          {...(instanceId ? { 'data-ui-instance-id': `${instanceId}-opt-${option.value}` } : {})}
        >
          {option.label}
        </option>
      ))}
    </select>
  );
}
