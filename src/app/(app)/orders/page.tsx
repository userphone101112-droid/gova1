import { AppPlaceholderPage } from '@/components/layouts/AppPlaceholderPage';
import { SHARED_LAYOUT } from '@/platform/ui';

export default function OrdersPage() {
  return (
    <AppPlaceholderPage
      container={SHARED_LAYOUT.ORDERS_PAGE.CONTAINER}
      title={SHARED_LAYOUT.ORDERS_PAGE.TITLE}
      message={SHARED_LAYOUT.ORDERS_PAGE.MESSAGE}
    />
  );
}
