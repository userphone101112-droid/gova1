/** Client-safe helpers for inspector route labels (no Node.js fs). */

/** URL prefixes excluded from inspector preview picker. */
export const INSPECTOR_EXCLUDED_PREFIXES = ['/devtools', '/api'] as const;

export interface DiscoveredAppRoute {
  path: string;
  label: string;
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

export function isInspectorRouteExcluded(path: string): boolean {
  return INSPECTOR_EXCLUDED_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`)
  );
}
