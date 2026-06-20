'use client';

import type { ElementBinding } from '../data/element-binding.types';
import { InspectorField, inspectorInputClass } from '../ui/InspectorField';
import { InspectorSelect } from '../ui/InspectorSelect';
import { InspectorTextarea } from '../ui/InspectorTextarea';

type DerivedBindingEditorProps = {
  binding: ElementBinding;
  onChange: (patch: Partial<ElementBinding>) => void;
};

export function DerivedBindingEditor({ binding, onChange }: DerivedBindingEditorProps) {
  return (
    <>
      <InspectorField label="Derived from" instanceId="derived-from-kind">
        <InspectorSelect
          value={binding.derivedFromKind ?? ''}
          onChange={(derivedFromKind) =>
            onChange(
              (derivedFromKind
                ? { derivedFromKind: derivedFromKind as ElementBinding['derivedFromKind'] }
                : {}) as Partial<ElementBinding>
            )
          }
          placeholder="custom_expression"
          instanceId="derived-from-kind-select"
          options={[
            { value: 'database_binding', label: 'database_binding' },
            { value: 'storage_binding', label: 'storage_binding' },
            { value: 'linked_element', label: 'linked_element' },
            { value: 'custom_expression', label: 'custom_expression' },
          ]}
        />
      </InspectorField>

      <InspectorField label="Formula" hint="Expression or reference for the derived value." instanceId="derived-formula">
        <InspectorTextarea
          value={binding.formula ?? ''}
          onChange={(formula) => onChange({ formula })}
          rows={4}
          instanceId="derived-formula-input"
        />
      </InspectorField>

      <InspectorField label="Output meaning" instanceId="derived-output">
        <input
          value={binding.outputMeaning ?? ''}
          onChange={(event) => onChange({ outputMeaning: event.target.value })}
          className={inspectorInputClass}
          data-ui-instance-id="derived-output-input"
        />
      </InspectorField>

      <InspectorField label="Depends on" hint="Comma-separated binding IDs." instanceId="derived-depends">
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
          data-ui-instance-id="derived-depends-input"
        />
      </InspectorField>

      <InspectorField label="Mock value" instanceId="derived-mock">
        <input
          value={binding.mockValue ?? ''}
          onChange={(event) => onChange({ mockValue: event.target.value })}
          className={inspectorInputClass}
          data-ui-instance-id="derived-mock-input"
        />
      </InspectorField>
    </>
  );
}
