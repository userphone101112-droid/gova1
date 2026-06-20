'use client';

import { useTranslation, SHARED_LAYOUT } from '@/platform/ui';

export default function ProfilePage() {
  const { t } = useTranslation();

  return (
    <div data-ui-uuid={SHARED_LAYOUT.PROFILE_PAGE.CONTAINER.uuid} className="mx-auto max-w-lg px-4 py-12 text-center space-y-3">
      <h1 data-ui-uuid={SHARED_LAYOUT.PROFILE_PAGE.TITLE.uuid} className="text-2xl font-bold text-primary">
        {t(SHARED_LAYOUT.PROFILE_PAGE.TITLE)}
      </h1>
      <p data-ui-uuid={SHARED_LAYOUT.PROFILE_PAGE.MESSAGE.uuid} className="text-on-surface-variant">
        {t(SHARED_LAYOUT.PROFILE_PAGE.MESSAGE)}
      </p>
    </div>
  );
}
