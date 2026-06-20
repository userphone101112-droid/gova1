import { AppPlaceholderPage } from '@/components/layouts/AppPlaceholderPage';
import { SHARED_LAYOUT } from '@/platform/ui';

export default function NotificationsPage() {
  return (
    <AppPlaceholderPage
      container={SHARED_LAYOUT.NOTIFICATIONS_PAGE.CONTAINER}
      title={SHARED_LAYOUT.NOTIFICATIONS_PAGE.TITLE}
      message={SHARED_LAYOUT.NOTIFICATIONS_PAGE.MESSAGE}
    />
  );
}
