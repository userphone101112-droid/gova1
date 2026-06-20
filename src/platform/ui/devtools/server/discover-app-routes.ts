import { existsSync, readdirSync } from 'fs';
import { join } from 'path';

import {
  type DiscoveredAppRoute,
  isInspectorRouteExcluded,
  pathToInspectorLabel,
} from '../inspector-route-utils';

function isRouteGroup(name: string): boolean {
  return name.startsWith('(') && name.endsWith(')');
}

function shouldSkipDir(name: string): boolean {
  return name.startsWith('_') || name.startsWith('@');
}

function collectRoutePaths(dir: string, urlSegments: string[]): string[] {
  const routes: string[] = [];

  if (existsSync(join(dir, 'page.tsx'))) {
    const path = urlSegments.length === 0 ? '/' : `/${urlSegments.join('/')}`;
    if (!isInspectorRouteExcluded(path)) {
      routes.push(path);
    }
  }

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory() || shouldSkipDir(entry.name)) continue;

    const childDir = join(dir, entry.name);
    const nextSegments = isRouteGroup(entry.name) ? urlSegments : [...urlSegments, entry.name];
    routes.push(...collectRoutePaths(childDir, nextSegments));
  }

  return routes;
}

/** Scan App Router `page.tsx` files — includes nested routes (e.g. /merchant/analytics). Server only. */
export function discoverAppRoutes(appDir = join(process.cwd(), 'src', 'app')): DiscoveredAppRoute[] {
  const paths = [...new Set(collectRoutePaths(appDir, []))].sort((a, b) => {
    if (a === '/') return -1;
    if (b === '/') return 1;
    return a.localeCompare(b);
  });

  return paths.map((path) => ({
    path,
    label: pathToInspectorLabel(path),
  }));
}
