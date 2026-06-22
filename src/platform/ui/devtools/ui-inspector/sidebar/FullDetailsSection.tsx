'use client';

import { useMemo } from 'react';

import { useInspectorContext } from '../state/InspectorProvider';
import { copyText, emptyDisplayValue } from '../utils/format';
import { INSPECTOR_LABELS } from '../utils/inspector-labels';

export function FullDetailsSection() {
  const { selectors, sendHighlight, sendScroll } = useInspectorContext();
  const selected = selectors.selected;

  const sourceLocation = useMemo(
    () =>
      selected
        ? `${selected.sourceFile}:${selected.sourceLine} (${selected.sourceComponent})`
        : '',
    [selected]
  );

  if (!selected) {
    return (
      <p
        className="overflow-y-auto px-3 pb-3 text-sm text-on-surface-variant"
      >
        Select an element from the preview or list to inspect its registry metadata.
      </p>
    );
  }

  return (
    <>
      <span className="px-3 text-xs font-medium">
        {INSPECTOR_LABELS.feature}
      </span>
      <code className="block break-all px-3 pb-2 text-xs">
        {emptyDisplayValue(selected.feature)}
      </code>
      <span className="px-3 text-xs font-medium">
        {INSPECTOR_LABELS.lifecycle}
      </span>
      <code className="block break-all px-3 pb-2 text-xs">
        {emptyDisplayValue(selected.lifecycle)}
      </code>
      <span className="px-3 text-xs font-medium">
        {INSPECTOR_LABELS.sourceFile}
      </span>
      <code className="block break-all px-3 pb-2 text-xs">
        {emptyDisplayValue(selected.sourceFile)}
      </code>
      <span className="px-3 text-xs font-medium">
        {INSPECTOR_LABELS.sourceComponent}
      </span>
      <code
        className="block break-all px-3 pb-2 text-xs"
      >
        {emptyDisplayValue(selected.sourceComponent)}
      </code>
      <span className="px-3 text-xs font-medium">
        {INSPECTOR_LABELS.sourceLine}
      </span>
      <code className="block break-all px-3 pb-2 text-xs">
        {selected.sourceLine ? String(selected.sourceLine) : '-'}
      </code>
      <span className="px-3 text-xs font-medium">
        {INSPECTOR_LABELS.instanceId}
      </span>
      <code className="block break-all px-3 pb-2 text-xs">
        {emptyDisplayValue(selected.instanceId)}
      </code>
      <span className="px-3 text-xs font-medium">
        {INSPECTOR_LABELS.identityKey}
      </span>
      <code
        className="block break-all px-3 pb-2 text-xs"
      >
        {emptyDisplayValue(selected.identityKey)}
      </code>
      <button
        type="button"
        onClick={() => copyText(selected.uuid)}
        className="mx-3 mb-1 w-[calc(100%-1.5rem)] rounded border border-outline-variant px-2 py-1 text-xs"
      >
        Copy UUID
      </button>
      <button
        type="button"
        onClick={() => copyText(selected.path)}
        className="mx-3 mb-1 w-[calc(100%-1.5rem)] rounded border border-outline-variant px-2 py-1 text-xs"
      >
        Copy identity path
      </button>
      <button
        type="button"
        onClick={() => copyText(sourceLocation)}
        className="mx-3 mb-1 w-[calc(100%-1.5rem)] rounded border border-outline-variant px-2 py-1 text-xs"
      >
        Copy source location
      </button>
      <button
        type="button"
        onClick={() => sendHighlight(selected.scanKey)}
        className="mx-3 mb-1 w-[calc(100%-1.5rem)] rounded border border-outline-variant px-2 py-1 text-xs"
      >
        Highlight in preview
      </button>
      <button
        type="button"
        onClick={() => sendScroll(selected.scanKey)}
        className="mx-3 mb-3 w-[calc(100%-1.5rem)] rounded border border-outline-variant px-2 py-1 text-xs"
      >
        Scroll to element
      </button>
    </>
  );
}
