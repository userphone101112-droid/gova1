'use client';

import Link from 'next/link';

import { useTranslation, ERROR_BOUNDARY } from '@/platform/ui';

/**
 * Not found for in-app routes — rendered inside AppShell via (app)/layout.
 */
export default function AppNotFound() {
  const { t } = useTranslation();

  return (
    <div className="max-w-md mx-auto text-center py-12 px-4">
      <h2 data-ui-uuid={ERROR_BOUNDARY.APP_NOT_FOUND.TITLE.uuid} className="mb-4 text-2xl font-bold text-on-surface">
        {t(ERROR_BOUNDARY.APP_NOT_FOUND.TITLE)}
      </h2>
      <div data-ui-uuid={ERROR_BOUNDARY.APP_NOT_FOUND.MESSAGE.uuid} className="mb-6 text-on-surface-variant">
        {t(ERROR_BOUNDARY.APP_NOT_FOUND.MESSAGE)}
      </div>
      <Link data-ui-uuid={ERROR_BOUNDARY.APP_NOT_FOUND.HOME_LINK.uuid} href="/home">
        {t(ERROR_BOUNDARY.APP_NOT_FOUND.HOME_LINK)}
      </Link>
    </div>
  );
}
