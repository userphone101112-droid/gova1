'use client';

import { DEVTOOLS } from '@/platform/ui/registry/features/devtools';

import { useInspectorContext } from '../state/InspectorProvider';
import { RESIZER_WIDTH } from '../utils/constants';

import { InspectorPreview } from './InspectorPreview';
import { InspectorSidebar } from './InspectorSidebar';

export function InspectorLayout() {
  const { handleResizeStart } = useInspectorContext();

  return (
    <div
      data-ui-uuid={DEVTOOLS.UI_INSPECTOR.WORKSPACE.CONTAINER.uuid}
      dir="ltr"
      className="flex min-h-0 flex-1 flex-row"
    >
      <InspectorSidebar />

      <button
        data-ui-uuid={DEVTOOLS.UI_INSPECTOR.LAYOUT.RESIZER.uuid}
        type="button"
        aria-label="Resize inspector sidebar"
        onMouseDown={handleResizeStart}
        style={{ width: RESIZER_WIDTH }}
        className="shrink-0 cursor-col-resize border-0 bg-outline-variant/50 hover:bg-primary/50 active:bg-primary/70"
      />

      <InspectorPreview />
    </div>
  );
}
