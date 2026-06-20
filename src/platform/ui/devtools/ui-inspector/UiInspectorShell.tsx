'use client';

import { DEVTOOLS } from '@/platform/ui/registry/features/devtools';

import { InspectorLayout } from './components/InspectorLayout';
import { InspectorProvider } from './state/InspectorProvider';

export function UiInspectorShell() {
  return (
    <div
      data-ui-uuid={DEVTOOLS.UI_INSPECTOR.PAGE.CONTAINER.uuid}
      className="flex h-dvh flex-col overflow-hidden bg-surface text-on-surface"
    >
      <InspectorProvider>
        <InspectorLayout />
      </InspectorProvider>
    </div>
  );
}
