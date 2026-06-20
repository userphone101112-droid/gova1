import { AppPlaceholderPage } from '@/components/layouts/AppPlaceholderPage';
import { SHARED_LAYOUT } from '@/platform/ui';

export default function ProfilePage() {
  return (
    <AppPlaceholderPage
      container={SHARED_LAYOUT.PROFILE_PAGE.CONTAINER}
      title={SHARED_LAYOUT.PROFILE_PAGE.TITLE}
      message={SHARED_LAYOUT.PROFILE_PAGE.MESSAGE}
    />
  );
}
