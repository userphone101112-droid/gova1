import { ReactNode } from 'react';

interface FeatureLayoutProps {
  children: ReactNode;
}

/**
 * Feature layout scaffold — i18n is provided once at root layout.
 * Wrap children with feature-specific shells only.
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
