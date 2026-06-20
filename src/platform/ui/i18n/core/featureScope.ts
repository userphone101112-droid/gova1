import type { Feature } from './types';

/**
 * Features merged into each route scope (order matters: later overrides earlier).
 * Ensures client-side dictionary reload includes all namespaces a page needs.
 */
export const FEATURE_SCOPES: Record<string, readonly Feature[]> = {
  common: ['common', 'error-boundary'],
  home: ['common', 'shared-layout', 'home'],
  auth: ['common', 'auth'],
  splash: ['common', 'splash'],
  'shared-layout': ['common', 'shared-layout'],
  'error-boundary': ['common', 'error-boundary'],
  dashboard: ['common', 'dashboard'],
  settings: ['common', 'settings'],
  merchant: ['common', 'shared-layout', 'merchant'],
  onboarding: ['common', 'shared-layout', 'onboarding'],
  'image-upload-form': ['common', 'shared-layout', 'image-upload-form'],
  test1: ['common', 'shared-layout', 'test1'],
  signup: ['common', 'signup'],
  contact: ['common', 'contact'],
};

export function resolveFeatureScope(feature: Feature): Feature[] {
  const scope = FEATURE_SCOPES[feature];
  if (scope) {
    return [...scope];
  }
  return ['common', feature];
}
