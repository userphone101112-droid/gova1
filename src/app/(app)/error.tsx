'use client';

import { useEffect } from 'react';

import { useTranslation, ERROR_BOUNDARY } from '@/platform/ui';

/**
 * Segment error UI for in-app routes — rendered inside AppShell via (app)/layout.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useTranslation();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div data-ui-uuid={ERROR_BOUNDARY.APP_ERROR.CONTAINER.uuid} className="max-w-md mx-auto text-center py-12 px-4">
      <h2 data-ui-uuid={ERROR_BOUNDARY.APP_ERROR.TITLE.uuid} className="mb-4 text-2xl font-bold text-on-surface">
        {t(ERROR_BOUNDARY.APP_ERROR.TITLE)}
      </h2>
      <div data-ui-uuid={ERROR_BOUNDARY.APP_ERROR.MESSAGE.uuid} className="mb-6 text-on-surface-variant">
        {error.message || t(ERROR_BOUNDARY.APP_ERROR.MESSAGE)}
      </div>
      <button data-ui-uuid={ERROR_BOUNDARY.APP_ERROR.RETRY_BUTTON.uuid} onClick={reset}>
        {t(ERROR_BOUNDARY.APP_ERROR.RETRY_BUTTON)}
      </button>
    </div>
  );
}
