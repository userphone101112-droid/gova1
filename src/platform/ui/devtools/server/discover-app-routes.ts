import { existsSync, readdirSync } from 'fs';
import { join } from 'path';

/** URL prefixes excluded from inspector preview picker. */
export const INSPECTOR_EXCLUDED_PREFIXES = ['/devtools', '/api'] as const;

export interface DiscoveredAppRoute {
  path: string;
  label: string;
}

function isRouteGroup(name: string): boolean {
  return name.startsWith('(') && name.endsWith(')');
}

function shouldSkipDir(name: string): boolean {
  return name.startsWith('_') || name.startsWith('@');
}

export function pathToInspectorLabel(path: string): string {
  if (path === '/') return 'Splash';
  const segments = path.split('/').filter(Boolean);
  return segments
    .map((segment) =>
      segment
        .replace(/^\[(.+)\]$/, '$1')
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
    )
    .join(' / ');
}

function isExcluded(path: string): boolean {
  return INSPECTOR_EXCLUDED_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`)
  );
}

function collectRoutePaths(dir: string, urlSegments: string[]): string[] {
  const routes: string[] = [];

  if (existsSync(join(dir, 'page.tsx'))) {
    const path = urlSegments.length === 0 ? '/' : `/${urlSegments.join('/')}`;
    if (!isExcluded(path)) {
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

/** Scan App Router `page.tsx` files — includes nested routes (e.g. /merchant/analytics). */
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
