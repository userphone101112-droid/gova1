import type { Feature } from './types';

export interface I18nRouteEntry {
  prefix: string;
  feature: Feature;
}

/**
 * Route → primary i18n feature (scopes merged via FEATURE_SCOPES).
 * Longest prefix wins.
 */
export const I18N_ROUTE_MANIFEST: readonly I18nRouteEntry[] = [
  { prefix: '/settings', feature: 'settings' },
  { prefix: '/home', feature: 'home' },
  { prefix: '/registration', feature: 'auth' },
  { prefix: '/', feature: 'splash' },
] as const;

export function resolveFeatureFromPathname(pathname: string): Feature {
  const normalized = pathname.split('?')[0] || '/';
  const sorted = [...I18N_ROUTE_MANIFEST].sort((a, b) => b.prefix.length - a.prefix.length);

  for (const entry of sorted) {
    if (normalized === entry.prefix || normalized.startsWith(`${entry.prefix}/`)) {
      return entry.feature;
    }
  }

  return 'common';
}
