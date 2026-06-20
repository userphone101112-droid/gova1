'use client';

import { useMemo } from 'react';

import { resolveEntryBindings } from '../data/element-binding-utils';
import type { ElementBinding } from '../data/element-binding.types';
import { useInspectorContext } from '../state/InspectorProvider';
import { InspectorField, inspectorInputClass } from '../ui/InspectorField';
import { InspectorSelect } from '../ui/InspectorSelect';

type ElementLinkBindingEditorProps = {
  binding: ElementBinding;
  onChange: (patch: Partial<ElementBinding>) => void;
};

export function ElementLinkBindingEditor({ binding, onChange }: ElementLinkBindingEditorProps) {
  const { state } = useInspectorContext();
  const currentIdentityKey = state.selectedIdentityKey;

  const elementOptions = useMemo(
    () =>
      Object.entries(state.allInspectorData)
        .filter(([key]) => key !== currentIdentityKey)
        .map(([key, entry]) => ({
          value: key,
          label: entry.dataUiPath ? `${key} — ${entry.dataUiPath}` : key,
        })),
    [currentIdentityKey, state.allInspectorData]
  );

  const linkedEntry = binding.linkedElementKey
    ? state.allInspectorData[binding.linkedElementKey]
    : undefined;

  const linkedBindings = useMemo(() => {
    if (!binding.linkedElementKey || !linkedEntry) return [];
    return resolveEntryBindings(linkedEntry, state.databaseRef);
  }, [binding.linkedElementKey, linkedEntry, state.databaseRef]);

  const willCreateEdge = Boolean(binding.linkedElementKey && binding.enabled);

  return (
    <>
      <InspectorField
        label="Linked element"
        hint="Another element from saved inspector data."
        instanceId="element-link-key"
      >
        <InspectorSelect
          value={binding.linkedElementKey ?? ''}
          onChange={(linkedElementKey) => {
            if (linkedElementKey && linkedElementKey === currentIdentityKey) return;
            onChange({ linkedElementKey, linkedBindingId: '' } as Partial<ElementBinding>);
          }}
          placeholder="Select element..."
          instanceId="element-link-key-select"
          options={elementOptions}
        />
      </InspectorField>

      {linkedEntry ? (
        <div className="rounded border border-tertiary/25 bg-tertiary/5 px-2 py-2 text-[11px] text-on-surface-variant">
          <div className="font-medium text-on-surface">Linked element preview</div>
          <div>Path: {linkedEntry.dataUiPath || '—'}</div>
          <div>Feature: {linkedEntry.dataUiFeature || '—'}</div>
          <div>Bindings: {linkedBindings.length}</div>
          {willCreateEdge ? (
            <div className="mt-1 text-tertiary">This link will create an explicit relationship edge.</div>
          ) : null}
        </div>
      ) : null}

      <InspectorField label="Link mode" instanceId="element-link-mode">
        <InspectorSelect
          value={binding.linkMode ?? ''}
          onChange={(linkMode) =>
            onChange(
              (linkMode ? { linkMode: linkMode as ElementBinding['linkMode'] } : {}) as Partial<ElementBinding>
            )
          }
          placeholder="Default"
          instanceId="element-link-mode-select"
          options={[
            { value: 'same_database', label: 'same_database' },
            { value: 'same_storage', label: 'same_storage' },
            { value: 'inherits_binding', label: 'inherits_binding' },
            { value: 'depends_on', label: 'depends_on' },
            { value: 'derived_from', label: 'derived_from' },
          ]}
        />
      </InspectorField>

      <InspectorField label="Inherit scope" instanceId="element-link-scope">
        <InspectorSelect
          value={binding.inheritScope ?? ''}
          onChange={(inheritScope) =>
            onChange(
              (inheritScope
                ? { inheritScope: inheritScope as ElementBinding['inheritScope'] }
                : {}) as Partial<ElementBinding>
            )
          }
          placeholder="None"
          instanceId="element-link-scope-select"
          options={[
            { value: 'database_only', label: 'database_only' },
            { value: 'storage_only', label: 'storage_only' },
            { value: 'all_bindings', label: 'all_bindings' },
            { value: 'selected_binding', label: 'selected_binding' },
          ]}
        />
      </InspectorField>

      <InspectorField
        label="Linked binding"
        hint="Specific binding on the linked element."
        instanceId="element-link-binding"
      >
        <InspectorSelect
          value={binding.linkedBindingId ?? ''}
          onChange={(linkedBindingId) =>
            onChange(
              (linkedBindingId ? { linkedBindingId } : { linkedBindingId: '' }) as Partial<ElementBinding>
            )
          }
          placeholder="Any / primary"
          disabled={!binding.linkedElementKey}
          instanceId="element-link-binding-select"
          options={linkedBindings.map((linked) => ({
            value: linked.id,
            label: linked.label || linked.id,
          }))}
        />
      </InspectorField>

      <InspectorField label="Relation type" instanceId="element-link-relation">
        <InspectorSelect
          value={binding.relationType ?? ''}
          onChange={(relationType) =>
            onChange(
              (relationType
                ? { relationType: relationType as ElementBinding['relationType'] }
                : {}) as Partial<ElementBinding>
            )
          }
          placeholder="none"
          instanceId="element-link-relation-select"
          options={[
            { value: 'none', label: 'none' },
            { value: 'one_to_one', label: 'one_to_one' },
            { value: 'one_to_many', label: 'one_to_many' },
            { value: 'many_to_one', label: 'many_to_one' },
            { value: 'many_to_many', label: 'many_to_many' },
          ]}
        />
      </InspectorField>

      <InspectorField label="Depends on" hint="Comma-separated binding IDs." instanceId="element-link-depends">
        <input
          value={binding.dependsOn?.join(', ') ?? ''}
          onChange={(event) => {
            const dependsOn = event.target.value
              .split(',')
              .map((entry) => entry.trim())
              .filter(Boolean);
            onChange({ dependsOn: dependsOn.length ? dependsOn : undefined } as Partial<ElementBinding>);
          }}
          className={inspectorInputClass}
          data-ui-instance-id="element-link-depends-input"
        />
      </InspectorField>
    </>
  );
}
