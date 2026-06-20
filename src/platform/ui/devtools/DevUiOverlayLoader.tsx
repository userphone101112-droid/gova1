'use client';

import dynamic from 'next/dynamic';

const DevUiOverlay = dynamic(
  () => import('./DevUiOverlay').then((mod) => mod.DevUiOverlay),
  { ssr: false }
);

export function DevUiOverlayLoader() {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return <DevUiOverlay />;
}
