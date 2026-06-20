import { notFound } from 'next/navigation';

import { isUiInspectorEnabled } from '@/platform/ui/devtools/inspector-access';
import { DevToolsInspectorPage } from '@/platform/ui/devtools/ui-inspector';

export default function UiInspectorRoutePage() {
  if (!isUiInspectorEnabled()) {
    notFound();
  }

  return <DevToolsInspectorPage />;
}
