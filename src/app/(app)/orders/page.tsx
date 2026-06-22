'use client';

import { useTranslation, SHARED_LAYOUT } from '@/platform/ui';

export default function OrdersPage() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-lg px-4 py-12 text-center space-y-3">
      <h1 data-ui-uuid={SHARED_LAYOUT.ORDERS_PAGE.TITLE.uuid}
          data-ui-lang-uuid={`lang-${SHARED_LAYOUT.ORDERS_PAGE.TITLE.uuid}`} className="text-2xl font-bold text-primary">
        {t('shared-layout.orders-page.title')}
      </h1>
      <p data-ui-uuid={SHARED_LAYOUT.ORDERS_PAGE.MESSAGE.uuid}
          data-ui-lang-uuid={`lang-${SHARED_LAYOUT.ORDERS_PAGE.MESSAGE.uuid}`} className="text-on-surface-variant">
        {t('shared-layout.orders-page.message')}
      </p>
    </div>
  );
}
