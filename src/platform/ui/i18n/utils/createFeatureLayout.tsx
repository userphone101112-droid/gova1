import { ReactNode } from 'react';

interface FeatureLayoutProps {
  children: ReactNode;
}

/**
 * Feature layout scaffold — i18n is provided once at root layout.
 * Place new pages under `src/app/(app)/` to inherit AppHeader, AppSidebar, and BottomNavBar.
 * Use this helper for feature-specific wrappers only (not AppShell — that lives in `(app)/layout.tsx`).
 */
export function createFeatureLayout({ children }: FeatureLayoutProps) {
  return <>{children}</>;
}

/**
 * Scaffold for a new feature page (server component).
 */
export function createFeaturePage(Component: () => ReactNode) {
  return function FeaturePage() {
    return <Component />;
  };
}
