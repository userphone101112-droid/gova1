'use client';

import { useMemo } from 'react';

import { useTranslation } from '@/platform/ui';
import { DEVTOOLS } from '@/platform/ui/registry/features/devtools';

import { useInspectorContext } from '../state/InspectorProvider';
import { copyText, emptyDisplayValue } from '../utils/format';

export function FullDetailsSection() {
  const { t } = useTranslation();
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
        data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DETAILS.EMPTY_MESSAGE.uuid}
        className="overflow-y-auto px-3 pb-3 text-sm text-on-surface-variant"
      >
        Select an element from the preview or list to inspect its registry metadata.
      </p>
    );
  }

  return (
    <>
      <span data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DETAILS.FEATURE_LABEL.uuid} className="px-3 text-xs font-medium">
        {t(DEVTOOLS.UI_INSPECTOR.DETAILS.FEATURE_LABEL)}
      </span>
      <code data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DETAILS.FEATURE_VALUE.uuid} className="block break-all px-3 pb-2 text-xs">
        {emptyDisplayValue(selected.feature)}
      </code>
      <span data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DETAILS.LIFECYCLE_LABEL.uuid} className="px-3 text-xs font-medium">
        {t(DEVTOOLS.UI_INSPECTOR.DETAILS.LIFECYCLE_LABEL)}
      </span>
      <code data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DETAILS.LIFECYCLE_VALUE.uuid} className="block break-all px-3 pb-2 text-xs">
        {emptyDisplayValue(selected.lifecycle)}
      </code>
      <span data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DETAILS.SOURCE_FILE_LABEL.uuid} className="px-3 text-xs font-medium">
        {t(DEVTOOLS.UI_INSPECTOR.DETAILS.SOURCE_FILE_LABEL)}
      </span>
      <code data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DETAILS.SOURCE_FILE_VALUE.uuid} className="block break-all px-3 pb-2 text-xs">
        {emptyDisplayValue(selected.sourceFile)}
      </code>
      <span data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DETAILS.SOURCE_COMPONENT_LABEL.uuid} className="px-3 text-xs font-medium">
        {t(DEVTOOLS.UI_INSPECTOR.DETAILS.SOURCE_COMPONENT_LABEL)}
      </span>
      <code
        data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DETAILS.SOURCE_COMPONENT_VALUE.uuid}
        className="block break-all px-3 pb-2 text-xs"
      >
        {emptyDisplayValue(selected.sourceComponent)}
      </code>
      <span data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DETAILS.SOURCE_LINE_LABEL.uuid} className="px-3 text-xs font-medium">
        {t(DEVTOOLS.UI_INSPECTOR.DETAILS.SOURCE_LINE_LABEL)}
      </span>
      <code data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DETAILS.SOURCE_LINE_VALUE.uuid} className="block break-all px-3 pb-2 text-xs">
        {selected.sourceLine ? String(selected.sourceLine) : '-'}
      </code>
      <span data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DETAILS.INSTANCE_LABEL.uuid} className="px-3 text-xs font-medium">
        {t(DEVTOOLS.UI_INSPECTOR.DETAILS.INSTANCE_LABEL)}
      </span>
      <code data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DETAILS.INSTANCE_VALUE.uuid} className="block break-all px-3 pb-2 text-xs">
        {emptyDisplayValue(selected.instanceId)}
      </code>
      <span data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DETAILS.IDENTITY_KEY_LABEL.uuid} className="px-3 text-xs font-medium">
        {t(DEVTOOLS.UI_INSPECTOR.DETAILS.IDENTITY_KEY_LABEL)}
      </span>
      <code
        data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DETAILS.IDENTITY_KEY_VALUE.uuid}
        className="block break-all px-3 pb-2 text-xs"
      >
        {emptyDisplayValue(selected.identityKey)}
      </code>
      <button
        data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DETAILS.COPY_UUID_BUTTON.uuid}
        type="button"
        onClick={() => copyText(selected.uuid)}
        className="mx-3 mb-1 w-[calc(100%-1.5rem)] rounded border border-outline-variant px-2 py-1 text-xs"
      >
        Copy UUID
      </button>
      <button
        data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DETAILS.COPY_PATH_BUTTON.uuid}
        type="button"
        onClick={() => copyText(selected.path)}
        className="mx-3 mb-1 w-[calc(100%-1.5rem)] rounded border border-outline-variant px-2 py-1 text-xs"
      >
        Copy identity path
      </button>
      <button
        data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DETAILS.COPY_SOURCE_BUTTON.uuid}
        type="button"
        onClick={() => copyText(sourceLocation)}
        className="mx-3 mb-1 w-[calc(100%-1.5rem)] rounded border border-outline-variant px-2 py-1 text-xs"
      >
        Copy source location
      </button>
      <button
        data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DETAILS.HIGHLIGHT_BUTTON.uuid}
        type="button"
        onClick={() => sendHighlight(selected.scanKey)}
        className="mx-3 mb-1 w-[calc(100%-1.5rem)] rounded border border-outline-variant px-2 py-1 text-xs"
      >
        Highlight in preview
      </button>
      <button
        data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DETAILS.SCROLL_BUTTON.uuid}
        type="button"
        onClick={() => sendScroll(selected.scanKey)}
        className="mx-3 mb-3 w-[calc(100%-1.5rem)] rounded border border-outline-variant px-2 py-1 text-xs"
      >
        Scroll to element
      </button>
    </>
  );
}
