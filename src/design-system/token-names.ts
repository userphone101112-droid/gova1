/**
 * Design System Token Name Registry
 * Type-safe references to CSS custom property names.
 * Values live exclusively in CSS — this file provides names only.
 */

export const GOVA_TOKENS = {
  // Semantic colors
  background: '--gova-background',
  onBackground: '--gova-on-background',
  primary: '--gova-primary',
  onPrimary: '--gova-on-primary',
  primaryContainer: '--gova-primary-container',
  onPrimaryContainer: '--gova-on-primary-container',
  secondary: '--gova-secondary',
  onSecondary: '--gova-on-secondary',
  surface: '--gova-surface',
  onSurface: '--gova-on-surface',
  onSurfaceVariant: '--gova-on-surface-variant',
  surfaceContainer: '--gova-surface-container',
  surfaceContainerLow: '--gova-surface-container-low',
  surfaceContainerHigh: '--gova-surface-container-high',
  surfaceContainerLowest: '--gova-surface-container-lowest',
  outline: '--gova-outline',
  outlineVariant: '--gova-outline-variant',
  error: '--gova-error',
  onError: '--gova-on-error',
  success: '--gova-success',
  onSuccess: '--gova-on-success',
  warning: '--gova-warning',
  onWarning: '--gova-on-warning',
  info: '--gova-info',
  onInfo: '--gova-on-info',
  accent: '--gova-accent',
  onAccent: '--gova-on-accent',
  disabled: '--gova-disabled',
  onDisabled: '--gova-on-disabled',
  focus: '--gova-focus',
  focusRing: '--gova-focus-ring',
  selection: '--gova-selection',
  overlay: '--gova-overlay',
  overlayScrim: '--gova-overlay-scrim',
  brandRed: '--gova-brand-red',
  brandBlue: '--gova-brand-blue',
  brandYellow: '--gova-brand-yellow',
  brandGreen: '--gova-brand-green',
  inverseSurface: '--gova-inverse-surface',
  inverseOnSurface: '--gova-inverse-on-surface',

  // Component tokens
  buttonPrimaryBg: '--gova-component-button-primary-bg',
  cardBg: '--gova-component-card-bg',
  switchTrackBg: '--gova-component-switch-track-bg',
  switchTrackCheckedBg: '--gova-component-switch-track-checked-bg',
  dialogOverlayBg: '--gova-component-dialog-overlay-bg',
  settingsCardBg: '--gova-component-settings-card-bg',
  navActiveBg: '--gova-component-nav-active-bg',
  glassBg: '--gova-component-glass-bg',
} as const;

export type GovaTokenName = (typeof GOVA_TOKENS)[keyof typeof GOVA_TOKENS];

/** Returns a CSS var() reference for use in inline styles when Tailwind is insufficient */
export function cssVar(token: GovaTokenName): string {
  return `var(${token})`;
}
