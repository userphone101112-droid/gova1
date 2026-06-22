'use client';

import { useInspectorContext } from '../state/InspectorProvider';
import { RESIZER_WIDTH } from '../utils/constants';

import { InspectorPreview } from './InspectorPreview';
import { InspectorSidebar } from './InspectorSidebar';

export function InspectorLayout() {
  const { handleResizeStart } = useInspectorContext();

  return (
    <div
      dir="ltr"
      className="flex min-h-0 flex-1 flex-col lg:flex-row"
    >
      <InspectorSidebar />

      <button
        type="button"
        aria-label="Resize inspector sidebar"
        onMouseDown={handleResizeStart}
        style={{ width: RESIZER_WIDTH }}
        className="hidden shrink-0 cursor-col-resize border-0 bg-outline-variant/50 hover:bg-primary/50 active:bg-primary/70 lg:block"
      />

      <InspectorPreview />
    </div>
  );
}
