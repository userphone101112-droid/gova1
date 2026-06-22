'use client';

import { useTranslation, SHARED_LAYOUT } from '@/platform/ui';

export default function NotificationsPage() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-lg px-4 py-12 text-center space-y-3">
      <h1 data-ui-uuid={SHARED_LAYOUT.NOTIFICATIONS_PAGE.TITLE.uuid} className="text-2xl font-bold text-primary">
        {t(SHARED_LAYOUT.NOTIFICATIONS_PAGE.TITLE)}
      </h1>
      <p data-ui-uuid={SHARED_LAYOUT.NOTIFICATIONS_PAGE.MESSAGE.uuid} className="text-on-surface-variant">
        {t(SHARED_LAYOUT.NOTIFICATIONS_PAGE.MESSAGE)}
      </p>
    </div>
  );
}
