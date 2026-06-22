'use client';

import { useTranslation, SHARED_LAYOUT } from '@/platform/ui';

export default function FavoritesPage() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-lg px-4 py-12 text-center space-y-3">
      <h1 data-ui-uuid={SHARED_LAYOUT.FAVORITES_PAGE.TITLE.uuid}
          data-ui-lang-uuid={`lang-${SHARED_LAYOUT.FAVORITES_PAGE.TITLE.uuid}`} className="text-2xl font-bold text-primary">
        {t('shared-layout.favorites-page.title')}
      </h1>
      <p data-ui-uuid={SHARED_LAYOUT.FAVORITES_PAGE.MESSAGE.uuid}
          data-ui-lang-uuid={`lang-${SHARED_LAYOUT.FAVORITES_PAGE.MESSAGE.uuid}`} className="text-on-surface-variant">
        {t('shared-layout.favorites-page.message')}
      </p>
    </div>
  );
}
