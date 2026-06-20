'use client';

import { DEVTOOLS } from '@/platform/ui/registry/features/devtools';

import { useInspectorContext } from '../state/InspectorProvider';
import { emptyDisplayValue, formatScanTime } from '../utils/format';
import { INSPECTOR_LABELS } from '../utils/inspector-labels';

export function DisplaySection() {
  const { state, selectors } = useInspectorContext();
  const selected = selectors.selected;
  const { targetUrl } = selectors.preview;

  return (
    <>
      {!selected ? (
        <code
          data-ui-uuid={DEVTOOLS.UI_INSPECTOR.STATUS.CONTAINER.uuid}
          data-ui-instance-id="display-empty"
          className="block px-3 pb-3 text-sm text-on-surface-variant"
        >
          Select an element from the preview or list.
        </code>
      ) : (
        <section
          data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SELECTED.CONTAINER.uuid}
          className="bg-surface-variant/40 px-3 py-3"
        >
          <span data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DETAILS.STABLE_ID_LABEL.uuid} className="text-xs font-medium">
            {INSPECTOR_LABELS.stableId}
          </span>
          <code
            data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DETAILS.STABLE_ID_VALUE.uuid}
            className="mt-0.5 block break-all text-sm font-semibold"
          >
            {selected.id || selected.uuid.slice(0, 8)}
          </code>
          <span data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DETAILS.PATH_LABEL.uuid} className="mt-2 text-xs font-medium">
            {INSPECTOR_LABELS.identityPath}
          </span>
          <code
            data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DETAILS.PATH_VALUE.uuid}
            className="mt-0.5 block break-all text-xs text-on-surface-variant"
          >
            {emptyDisplayValue(selected.path)}
          </code>
          <span data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DETAILS.TAG_LABEL.uuid} className="mt-2 text-xs font-medium">
            {INSPECTOR_LABELS.tag}
          </span>
          <code data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DETAILS.TAG_VALUE.uuid} className="mt-0.5 block text-xs">
            {selected.tagName} | {selected.feature} | {selected.lifecycle}
          </code>
          <span data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DETAILS.UUID_LABEL.uuid} className="mt-2 text-xs font-medium">
            {INSPECTOR_LABELS.uuid}
          </span>
          <code
            data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DETAILS.UUID_VALUE.uuid}
            className="mt-0.5 block break-all text-[10px] text-on-surface-variant"
          >
            {selected.uuid}
          </code>
        </section>
      )}
      <section
        data-ui-uuid={DEVTOOLS.UI_INSPECTOR.STATUS.CONTAINER.uuid}
        data-ui-instance-id="status-bar"
        className="space-y-1 border-t border-outline-variant px-3 py-2 text-[11px]"
      >
        <code
          data-ui-uuid={DEVTOOLS.UI_INSPECTOR.STATUS.IFRAME_VALUE.uuid}
          className="block break-all text-on-surface-variant"
        >
          iframe: {state.iframeReady ? 'ready' : 'loading'}
        </code>
        <code
          data-ui-uuid={DEVTOOLS.UI_INSPECTOR.STATUS.SCAN_VALUE.uuid}
          className="block break-all text-on-surface-variant"
        >
          last scan: {formatScanTime(state.lastScanTime)}
        </code>
        <code
          data-ui-uuid={DEVTOOLS.UI_INSPECTOR.STATUS.COUNT_VALUE.uuid}
          className="block break-all text-on-surface-variant"
        >
          elements: {state.elements.length}
        </code>
        <code
          data-ui-uuid={DEVTOOLS.UI_INSPECTOR.STATUS.URL_VALUE.uuid}
          className="block break-all text-on-surface-variant"
        >
          url: {targetUrl}
        </code>
      </section>
    </>
  );
}
