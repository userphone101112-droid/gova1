/** Central list of app routes available for UI Inspector preview. */
export interface InspectorRoute {
  readonly path: string;
  readonly label: string;
}

export const INSPECTOR_ROUTES = [
  { path: '/', label: 'Splash' },
  { path: '/home', label: 'Home' },
  { path: '/login', label: 'Login' },
  { path: '/registration', label: 'Registration' },
  { path: '/merchant', label: 'Merchant' },
  { path: '/onboarding', label: 'Onboarding' },
  { path: '/settings', label: 'Settings' },
  { path: '/notifications', label: 'Notifications' },
  { path: '/favorites', label: 'Favorites' },
  { path: '/orders', label: 'Orders' },
  { path: '/profile', label: 'Profile' },
] as const satisfies readonly InspectorRoute[];

export type InspectorRoutePath = (typeof INSPECTOR_ROUTES)[number]['path'];

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
