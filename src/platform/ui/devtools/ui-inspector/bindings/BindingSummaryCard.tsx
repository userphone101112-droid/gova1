'use client';

import { useInspectorContext } from '../state/InspectorProvider';
import { InspectorField } from '../ui/InspectorField';
import { InspectorPanel } from '../ui/InspectorPanel';
import { emptyDisplayValue } from '../utils/format';
import { INSPECTOR_LABELS } from '../utils/inspector-labels';

export function BindingSummaryCard() {
  const { selectors } = useInspectorContext();
  const selected = selectors.selected;

  if (!selected) {
    return (
      <InspectorPanel title="Selected element" description="Pick an element to manage bindings." tone="default">
        <p className="text-xs text-on-surface-variant">No element selected.</p>
      </InspectorPanel>
    );
  }

  return (
    <InspectorPanel
      title="Selected element"
      description="Identity summary for the active binding target."
      tone="primary"
      instanceId="binding-summary"
    >
      <InspectorField label={INSPECTOR_LABELS.stableId} hint="Short stable identifier." instanceId="summary-id">
        <code className="block break-all text-xs font-semibold">{selected.id || selected.uuid.slice(0, 8)}</code>
      </InspectorField>
      <InspectorField label={INSPECTOR_LABELS.identityPath} hint="Registry path." instanceId="summary-path">
        <code className="block break-all text-[10px] text-on-surface-variant">
          {emptyDisplayValue(selected.path)}
        </code>
      </InspectorField>
      <InspectorField label={INSPECTOR_LABELS.tag} hint="Tag, feature, lifecycle." instanceId="summary-tag">
        <code className="block text-xs">
          {selected.tagName} | {selected.feature} | {selected.lifecycle}
        </code>
      </InspectorField>
    </InspectorPanel>
  );
}
