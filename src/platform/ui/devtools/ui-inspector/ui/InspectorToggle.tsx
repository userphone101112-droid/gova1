'use client';

type InspectorToggleProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  instanceId?: string;
};

export function InspectorToggle({
  checked,
  onChange,
  label,
  disabled = false,
  instanceId,
}: InspectorToggleProps) {
  return (
    <button
      {...(instanceId ? { 'data-ui-instance-id': instanceId } : {})}
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`w-fit rounded px-3 py-1 text-xs disabled:opacity-50 ${
        checked ? 'bg-primary text-on-primary' : 'border border-outline-variant'
      }`}
    >
      {label ?? (checked ? 'ON' : 'OFF')}
    </button>
  );
}
