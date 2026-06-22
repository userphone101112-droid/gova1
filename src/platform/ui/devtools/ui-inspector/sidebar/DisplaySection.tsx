'use client';

import type { ReactNode } from 'react';

import { DEVTOOLS } from '@/platform/ui/registry/features/devtools';

import { useInspectorContext } from '../state/InspectorProvider';
import { emptyDisplayValue, formatScanTime } from '../utils/format';
import { INSPECTOR_LABELS } from '../utils/inspector-labels';

import { FieldGroup } from './FieldGroup';

function ReadOnlyField({
  label,
  hint,
  labelUuid,
  valueUuid,
  instanceId,
  children,
}: {
  label: string;
  hint: string;
  labelUuid?: string;
  valueUuid?: string;
  instanceId: string;
  children: ReactNode;
}) {
  return (
    <FieldGroup label={label} hint={hint} labelUuid={labelUuid} instanceId={instanceId}>
      <div {...(valueUuid ? { 'data-ui-uuid': valueUuid } : {})} data-ui-instance-id={`${instanceId}-value`}>
        {children}
      </div>
    </FieldGroup>
  );
}

export function DisplaySection() {
  const { state, selectors } = useInspectorContext();
  const selected = selectors.selected;
  const { targetUrl } = selectors.preview;

  return (
    <>
      {!selected ? (
        <code
          data-ui-instance-id="display-empty"
          className="block px-3 pb-3 text-sm text-on-surface-variant"
        >
          No element selected
        </code>
      ) : (
        <section
          className="flex flex-col gap-3 bg-surface-variant/40 px-3 py-3"
        >
          <ReadOnlyField
            label={INSPECTOR_LABELS.stableId}
            hint="Short stable identifier used in lists and selection."
            labelUuid={DEVTOOLS.UI_INSPECTOR.DETAILS.STABLE_ID_LABEL.uuid}
            instanceId="display-stable-id"
          >
            <code className="block break-all text-sm font-semibold">{selected.id || selected.uuid.slice(0, 8)}</code>
          </ReadOnlyField>

          <ReadOnlyField
            label={INSPECTOR_LABELS.identityPath}
            hint="Registry path for this UI identity."
            labelUuid={DEVTOOLS.UI_INSPECTOR.DETAILS.PATH_LABEL.uuid}
            instanceId="display-path"
          >
            <code className="block break-all text-xs text-on-surface-variant">
              {emptyDisplayValue(selected.path)}
            </code>
          </ReadOnlyField>

          <ReadOnlyField
            label={INSPECTOR_LABELS.tag}
            hint="HTML tag, feature module, and lifecycle stage."
            labelUuid={DEVTOOLS.UI_INSPECTOR.DETAILS.TAG_LABEL.uuid}
            instanceId="display-tag"
          >
            <code className="block text-xs">
              {selected.tagName} | {selected.feature} | {selected.lifecycle}
            </code>
          </ReadOnlyField>

          <ReadOnlyField
            label={INSPECTOR_LABELS.uuid}
            hint="Full registry UUID for this element."
            labelUuid={DEVTOOLS.UI_INSPECTOR.DETAILS.UUID_LABEL.uuid}
            instanceId="display-uuid"
          >
            <code className="block break-all text-[10px] text-on-surface-variant">{selected.uuid}</code>
          </ReadOnlyField>
        </section>
      )}
      <section
        data-ui-instance-id="status-bar"
        className="flex flex-col gap-3 border-t border-outline-variant px-3 py-3 text-[11px]"
      >
        <ReadOnlyField
          label="Iframe status"
          hint="Whether the preview iframe has finished loading."
          instanceId="status-iframe"
        >
          <code className="block break-all text-on-surface-variant">
            {state.iframeReady ? 'ready' : 'loading'}
          </code>
        </ReadOnlyField>

        <ReadOnlyField
          label="Last scan"
          hint="Timestamp of the most recent DOM scan."
          instanceId="status-scan"
        >
          <code className="block break-all text-on-surface-variant">{formatScanTime(state.lastScanTime)}</code>
        </ReadOnlyField>

        <ReadOnlyField
          label="Element count"
          hint="Total elements found in the current scan."
          instanceId="status-count"
        >
          <code className="block break-all text-on-surface-variant">{state.elements.length}</code>
        </ReadOnlyField>

        <ReadOnlyField
          label="Preview URL"
          hint="Current URL loaded in the preview iframe."
          instanceId="status-url"
        >
          <code className="block break-all text-on-surface-variant">{targetUrl}</code>
        </ReadOnlyField>
      </section>
    </>
  );
}
