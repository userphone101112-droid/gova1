import { notFound } from 'next/navigation';

import { isUiInspectorEnabled } from '@/platform/ui/devtools/inspector-access';
import { DevToolsInspectorPage } from '@/platform/ui/devtools/UiInspectorPage';

export default function UiInspectorRoutePage() {
  if (!isUiInspectorEnabled()) {
    notFound();
  }

  return <DevToolsInspectorPage />;
}
