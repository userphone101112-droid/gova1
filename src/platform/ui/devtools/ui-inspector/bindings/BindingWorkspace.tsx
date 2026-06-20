'use client';

import type { BindingKind } from '../data/element-binding.types';
import { useElementBindings } from '../hooks/useElementBindings';
import { useInspectorContext } from '../state/InspectorProvider';
import { InspectorActionButton } from '../ui/InspectorActionButton';
import { InspectorEmptyState } from '../ui/InspectorEmptyState';
import { InspectorPanel } from '../ui/InspectorPanel';

import { BindingEditor } from './BindingEditor';
import { BindingSummaryCard } from './BindingSummaryCard';
import { BindingTree } from './BindingTree';

const ADD_KINDS: { kind: BindingKind; label: string }[] = [
  { kind: 'database', label: 'Database' },
  { kind: 'storage', label: 'Storage' },
  { kind: 'element', label: 'Element link' },
  { kind: 'derived', label: 'Derived' },
];

export function BindingWorkspace() {
  const { selectors } = useInspectorContext();
  const hasSelection = selectors.hasElementSelection;
  const {
    bindings,
    activeBindingId,
    activeBinding,
    addBinding,
    updateBinding,
    deleteBinding,
    duplicateBinding,
    setActiveBindingId,
  } = useElementBindings();

  if (!hasSelection) {
    return (
      <InspectorEmptyState
        title="No element selected"
        description="Select an element in the preview or list to edit bindings."
        instanceId="binding-workspace-empty"
      />
    );
  }

  return (
    <div className="flex flex-col gap-3 px-2 pb-2" data-ui-instance-id="binding-workspace">
      <InspectorPanel
        title="Element Bindings"
        description="Define how this UI element reads, writes, uploads, or inherits data."
        tone="secondary"
        instanceId="element-bindings-header"
      />

      <BindingSummaryCard />

      <InspectorPanel
        title="Bindings"
        description="Multiple typed bindings per element. Changes stay in form state until saved."
        tone="secondary"
        instanceId="binding-list-panel"
      >
        {bindings.length === 0 ? (
          <InspectorEmptyState
            title="No bindings yet"
            description="Add a database, storage, element link, or derived binding."
            instanceId="binding-list-empty"
          />
        ) : (
          <BindingTree
            bindings={bindings}
            activeBindingId={activeBindingId}
            onSelect={setActiveBindingId}
          />
        )}

        <div className="flex flex-wrap gap-2 border-t border-outline-variant/50 pt-3">
          {ADD_KINDS.map(({ kind, label }) => (
            <InspectorActionButton
              key={kind}
              variant="secondary"
              onClick={() => addBinding(kind)}
              instanceId={`binding-add-${kind}`}
            >
              + {label}
            </InspectorActionButton>
          ))}
        </div>
      </InspectorPanel>

      {activeBinding ? (
        <InspectorPanel
          title="Binding editor"
          description="Configure the selected binding."
          tone={
            activeBinding.kind === 'database'
              ? 'primary'
              : activeBinding.kind === 'storage'
                ? 'success'
                : activeBinding.kind === 'element'
                  ? 'secondary'
                  : 'tertiary'
          }
          instanceId="binding-editor-panel"
        >
          <BindingEditor
            binding={activeBinding}
            onChange={(patch) => updateBinding(activeBinding.id, patch)}
          />

          <div className="flex flex-wrap gap-2 border-t border-outline-variant/50 pt-3">
            <InspectorActionButton
              variant="secondary"
              onClick={() => duplicateBinding(activeBinding.id)}
              instanceId="binding-duplicate"
            >
              Duplicate
            </InspectorActionButton>
            <InspectorActionButton
              variant="danger"
              onClick={() => deleteBinding(activeBinding.id)}
              instanceId="binding-delete"
            >
              Delete
            </InspectorActionButton>
          </div>
        </InspectorPanel>
      ) : bindings.length > 0 ? (
        <InspectorEmptyState
          title="Select a binding"
          description="Choose a binding from the list to edit it."
          instanceId="binding-editor-empty"
        />
      ) : null}
    </div>
  );
}
