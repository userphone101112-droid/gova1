/** Routes available for UI Inspector preview — synced from App Router pages. */
import manifest from './app-route-manifest.json';
import { pathToInspectorLabel } from './server/discover-app-routes';

export interface InspectorRoute {
  readonly path: string;
  readonly label: string;
}

/** Fallback when live API scan is unavailable (build / offline). */
export const INSPECTOR_ROUTES: readonly InspectorRoute[] = manifest.routes;

export type InspectorRoutePath = string;

export function buildInspectUrl(routePath: string): string {
  const normalized = routePath === '/' ? '/' : routePath.replace(/\/$/, '');
  const separator = normalized.includes('?') ? '&' : '?';
  return `${normalized}${separator}inspect=1`;
}

export function buildAbsoluteInspectUrl(routePath: string, origin: string): string {
  return new URL(buildInspectUrl(routePath), origin).href;
}

export function isInspectMode(search: string): boolean {
  return new URLSearchParams(search).get('inspect') === '1';
}

export function isInspectorRoutePath(path: string, routes: readonly InspectorRoute[] = INSPECTOR_ROUTES): path is InspectorRoutePath {
  return routes.some((route) => route.path === path);
}

export { pathToInspectorLabel };
