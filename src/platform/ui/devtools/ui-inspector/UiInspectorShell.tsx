'use client';

import { InspectorLayout } from './components/InspectorLayout';
import { InspectorProvider } from './state/InspectorProvider';

export function UiInspectorShell() {
  return (
    <div
      className="flex h-dvh flex-col overflow-hidden bg-surface text-on-surface"
    >
      <InspectorProvider>
        <InspectorLayout />
      </InspectorProvider>
    </div>
  );
}
