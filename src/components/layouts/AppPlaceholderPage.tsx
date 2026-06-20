'use client';

import { useTranslation } from '@/platform/ui';
import type { UiIdentity } from '@/platform/ui';

interface AppPlaceholderPageProps {
  container: UiIdentity;
  title: UiIdentity;
  message: UiIdentity;
}

export function AppPlaceholderPage({ container, title, message }: AppPlaceholderPageProps) {
  const { t } = useTranslation();

  return (
    <div data-ui-uuid={container.uuid} className="mx-auto max-w-lg px-4 py-12 text-center space-y-3">
      <h1 data-ui-uuid={title.uuid} className="text-2xl font-bold text-primary">
        {t(title)}
      </h1>
      <p data-ui-uuid={message.uuid} className="text-on-surface-variant">
        {t(message)}
      </p>
    </div>
  );
}
