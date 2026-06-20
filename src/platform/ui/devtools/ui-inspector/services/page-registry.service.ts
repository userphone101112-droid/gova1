import { resolveFeatureFromPathname } from '@/platform/ui/i18n/core/i18n-route-manifest';

import manifest from '../../app-route-manifest.json';
import { INSPECTOR_ROUTES } from '../../inspector-routes';
import type { PageRegistryEntry, PageRegistrySnapshot } from '../data/page-registry.types';

const APP_ROUTES_API = '/api/devtools/app-routes';

function toPageEntries(routes: { path: string; label: string }[]): PageRegistryEntry[] {
  return routes.map((route) => ({
    path: route.path,
    label: route.label,
    feature: resolveFeatureFromPathname(route.path),
  }));
}

export async function loadPageRegistry(): Promise<PageRegistrySnapshot> {
  if (typeof window !== 'undefined') {
    try {
      const response = await fetch(APP_ROUTES_API, { cache: 'no-store' });
      if (response.ok) {
        const data = (await response.json()) as {
          routes: { path: string; label: string }[];
          loadedAt?: string;
        };
        return {
          pages: toPageEntries(data.routes),
          loadedAt: data.loadedAt ?? new Date().toISOString(),
        };
      }
    } catch {
      /* fall through to manifest */
    }
  }

  const routes = manifest.routes.length > 0 ? manifest.routes : [...INSPECTOR_ROUTES];

  return {
    pages: toPageEntries(routes),
    loadedAt: manifest.generatedAt ?? new Date().toISOString(),
  };
}
