'use client';

import { ReactNode } from 'react';
import { UiDiv } from '@/platform/ui';
import { COMMON_LAYOUT } from '@/platform/ui/registry/categories';

interface SettingsGroupProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function SettingsGroup({ title, description, children }: SettingsGroupProps) {
  return (
    <section className="space-y-2">
      <div className="px-1">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
          {title}
        </h2>
        {description && (
          <p className="mt-0.5 text-xs text-on-surface-variant/80">{description}</p>
        )}
      </div>
      <UiDiv
        ui={COMMON_LAYOUT.CONTAINER}
        className="overflow-hidden rounded-2xl border border-outline-variant bg-surface-container shadow-sm"
      >
        {children}
      </UiDiv>
    </section>
  );
}

interface SettingsRowProps {
  label: string;
  description?: string;
  children: ReactNode;
  bordered?: boolean;
}

export function SettingsRow({ label, description, children, bordered = true }: SettingsRowProps) {
  const stackOnMobile = Boolean(description);

  return (
    <div
      className={[
        'px-3 py-3.5 sm:px-4',
        stackOnMobile
          ? 'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4'
          : 'flex items-center justify-between gap-4',
        bordered ? 'border-b border-outline-variant/50 last:border-b-0' : '',
      ].join(' ')}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-on-surface">{label}</p>
        {description && (
          <p className="mt-0.5 text-xs leading-relaxed text-on-surface-variant">{description}</p>
        )}
      </div>
      <div
        className={[
          'shrink-0',
          stackOnMobile ? 'flex w-full items-center sm:w-auto sm:justify-end' : '',
        ].join(' ')}
      >
        {children}
      </div>
    </div>
  );
}

interface SettingsSwitchProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  label: string;
}

export function SettingsSwitch({ checked, onChange, disabled, label }: SettingsSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={[
        'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        checked ? 'bg-primary' : 'bg-outline-variant',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
      ].join(' ')}
    >
      <span
        className={[
          'absolute top-1 h-5 w-5 rounded-full bg-surface-bright shadow-md transition-all duration-200',
          checked ? 'inset-inline-end-1' : 'inset-inline-start-1',
        ].join(' ')}
      />
    </button>
  );
}

interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
}

interface SettingsSegmentedProps<T extends string> {
  value: T;
  options: SegmentedOption<T>[];
  onChange: (value: T) => void;
  fullWidth?: boolean;
}

export function SettingsSegmented<T extends string>({
  value,
  options,
  onChange,
  fullWidth,
}: SettingsSegmentedProps<T>) {
  const stackOnSmallScreens = fullWidth && options.length >= 3;

  return (
    <div
      className={[
        'rounded-xl border border-outline-variant/60 bg-surface-container-low p-1',
        fullWidth ? 'flex w-full' : 'inline-flex',
        stackOnSmallScreens ? 'flex-col gap-1 sm:flex-row' : 'flex-row gap-1',
      ].join(' ')}
    >
      {options.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            disabled={option.disabled}
            onClick={() => onChange(option.value)}
            className={[
              'inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg px-2.5 py-2.5 text-xs font-semibold transition-all duration-200 sm:min-h-0 sm:px-3 sm:py-2',
              fullWidth ? 'w-full sm:flex-1' : '',
              active
                ? 'bg-primary text-on-primary shadow-sm'
                : 'bg-transparent text-on-surface-variant hover:bg-surface-container hover:text-on-surface',
              option.disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer',
            ].join(' ')}
          >
            {option.icon}
            <span className="text-center leading-tight">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

interface SettingsSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
}

export function SettingsSlider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
}: SettingsSliderProps) {
  return (
    <div className="space-y-3 px-3 py-3.5 sm:px-4 sm:py-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-medium text-on-surface">{label}</span>
        <span className="rounded-md bg-surface-container-high px-2 py-0.5 text-xs font-semibold tabular-nums text-on-surface">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="settings-slider h-2 w-full min-h-[44px] cursor-pointer appearance-none rounded-full bg-surface-container-high sm:min-h-0"
      />
    </div>
  );
}

export function SettingsBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-lg bg-primary/15 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
      {children}
    </span>
  );
}
