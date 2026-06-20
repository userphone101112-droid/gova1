import { resolveFeatureFromPathname } from '@/platform/ui/i18n/core/i18n-route-manifest';

import { INSPECTOR_ROUTES } from '../../inspector-routes';
import type { PageRegistryEntry, PageRegistrySnapshot } from '../data/page-registry.types';

export async function loadPageRegistry(): Promise<PageRegistrySnapshot> {
  const pages: PageRegistryEntry[] = INSPECTOR_ROUTES.map((route) => ({
    path: route.path,
    label: route.label,
    feature: resolveFeatureFromPathname(route.path),
  }));

  return {
    pages,
    loadedAt: new Date().toISOString(),
  };
}
