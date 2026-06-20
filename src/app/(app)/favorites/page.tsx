import { AppPlaceholderPage } from '@/components/layouts/AppPlaceholderPage';
import { SHARED_LAYOUT } from '@/platform/ui';

export default function FavoritesPage() {
  return (
    <AppPlaceholderPage
      container={SHARED_LAYOUT.FAVORITES_PAGE.CONTAINER}
      title={SHARED_LAYOUT.FAVORITES_PAGE.TITLE}
      message={SHARED_LAYOUT.FAVORITES_PAGE.MESSAGE}
    />
  );
}
