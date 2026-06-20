'use client';

import { DEVTOOLS } from '@/platform/ui/registry/features/devtools';

import { useInspectorContext } from '../state/InspectorProvider';

export function InspectorPreview() {
  const { state, dispatch, selectors, iframeRef } = useInspectorContext();
  const {
    iframeSrc,
    previewFrameWidth,
    previewFrameHeight,
    previewZoomPercent,
  } = selectors.preview;

  const updatePreviewSize = (patch: { width?: number; height?: number; scale?: number }) => {
    dispatch({ type: 'PATCH_PREVIEW_SIZE', patch });
  };

  return (
    <section
      data-ui-uuid={DEVTOOLS.UI_INSPECTOR.PREVIEW.CONTAINER.uuid}
      className="flex min-h-0 min-w-0 flex-1 flex-col bg-surface-variant"
    >
      <section
        data-ui-uuid={DEVTOOLS.UI_INSPECTOR.PREVIEW.CONTROLS.uuid}
        className="flex shrink-0 flex-wrap items-center gap-2 border-b border-outline-variant px-2 py-2"
      >
        <button
          data-ui-uuid={DEVTOOLS.UI_INSPECTOR.PREVIEW.ZOOM_OUT.uuid}
          type="button"
          onClick={() => updatePreviewSize({ scale: state.previewSize.scale * 0.9 })}
          className="rounded border border-outline-variant px-2 py-1 text-xs"
        >
          -
        </button>
        <input
          data-ui-uuid={DEVTOOLS.UI_INSPECTOR.PREVIEW.ZOOM_VALUE.uuid}
          type="number"
          min={1}
          value={previewZoomPercent}
          onChange={(e) => {
            const percent = Number(e.target.value);
            if (!Number.isFinite(percent) || percent <= 0) return;
            updatePreviewSize({ scale: percent / 100 });
          }}
          className="w-16 rounded border border-outline-variant bg-surface px-2 py-1 text-xs"
        />
        <button
          data-ui-uuid={DEVTOOLS.UI_INSPECTOR.PREVIEW.ZOOM_IN.uuid}
          type="button"
          onClick={() => updatePreviewSize({ scale: state.previewSize.scale * 1.1 })}
          className="rounded border border-outline-variant px-2 py-1 text-xs"
        >
          +
        </button>
        <input
          data-ui-uuid={DEVTOOLS.UI_INSPECTOR.PREVIEW.WIDTH_INPUT.uuid}
          type="number"
          min={1}
          value={Math.round(state.previewSize.width)}
          onChange={(e) => {
            const width = Number(e.target.value);
            if (!Number.isFinite(width) || width <= 0) return;
            updatePreviewSize({ width });
          }}
          className="w-20 rounded border border-outline-variant bg-surface px-2 py-1 text-xs"
        />
        <input
          data-ui-uuid={DEVTOOLS.UI_INSPECTOR.PREVIEW.HEIGHT_INPUT.uuid}
          type="number"
          min={1}
          value={Math.round(state.previewSize.height)}
          onChange={(e) => {
            const height = Number(e.target.value);
            if (!Number.isFinite(height) || height <= 0) return;
            updatePreviewSize({ height });
          }}
          className="w-20 rounded border border-outline-variant bg-surface px-2 py-1 text-xs"
        />
      </section>

      <section
        data-ui-uuid={DEVTOOLS.UI_INSPECTOR.PREVIEW.SCROLL.uuid}
        className="min-h-0 flex-1 overflow-auto p-2"
      >
        <section
          data-ui-uuid={DEVTOOLS.UI_INSPECTOR.PREVIEW.FRAME.uuid}
          style={{ width: previewFrameWidth, height: previewFrameHeight }}
          className="inline-block rounded border border-outline-variant bg-surface shadow-sm"
        >
          <iframe
            ref={iframeRef}
            key={state.iframeKey}
            data-ui-uuid={DEVTOOLS.UI_INSPECTOR.PREVIEW.IFRAME.uuid}
            title="UI Inspector preview"
            src={iframeSrc}
            style={{ width: previewFrameWidth, height: previewFrameHeight }}
            className="block rounded bg-surface"
          />
        </section>
      </section>
    </section>
  );
}
