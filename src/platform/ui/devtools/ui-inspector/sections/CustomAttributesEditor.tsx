'use client';

import { useCallback } from 'react';

import { createBindingId } from '../data/element-binding-utils';
import type { AttributePreset, ElementAttribute, ElementAttributeType } from '../data/element-binding.types';
import { useInspectorContext } from '../state/InspectorProvider';
import { InspectorActionButton } from '../ui/InspectorActionButton';
import { InspectorField, inspectorInputClass } from '../ui/InspectorField';
import { InspectorPanel } from '../ui/InspectorPanel';
import { InspectorSelect } from '../ui/InspectorSelect';

const PRESETS: { value: AttributePreset; key: string; valueDefault: string; type: ElementAttributeType }[] = [
  { value: 'required', key: 'required', valueDefault: 'true', type: 'boolean' },
  { value: 'searchable', key: 'searchable', valueDefault: 'true', type: 'boolean' },
  { value: 'sortable', key: 'sortable', valueDefault: 'true', type: 'boolean' },
  { value: 'editable', key: 'editable', valueDefault: 'true', type: 'boolean' },
  { value: 'visible_to_admin', key: 'visible_to_admin', valueDefault: 'true', type: 'boolean' },
  { value: 'pii', key: 'pii', valueDefault: 'true', type: 'boolean' },
  { value: 'analytics_key', key: 'analytics_key', valueDefault: '', type: 'string' },
  { value: 'validation_rule', key: 'validation_rule', valueDefault: '', type: 'string' },
];

function createAttribute(partial?: Partial<ElementAttribute>): ElementAttribute {
  const attr: ElementAttribute = {
    id: createBindingId('attr'),
    key: partial?.key ?? '',
    value: partial?.value ?? '',
    type: partial?.type ?? 'string',
  };
  if (partial?.purpose) attr.purpose = partial.purpose;
  return attr;
}

export function CustomAttributesEditor() {
  const { state, dispatch } = useInspectorContext();
  const attributes = state.formState.customAttributes;

  const patchAttributes = useCallback(
    (next: ElementAttribute[]) => {
      dispatch({ type: 'PATCH_FORM_STATE', patch: { customAttributes: next, attributesEnabled: next.length > 0 } });
    },
    [dispatch]
  );

  const addAttribute = () => patchAttributes([...attributes, createAttribute()]);

  const updateAttribute = (id: string, patch: Partial<ElementAttribute>) => {
    patchAttributes(attributes.map((attr) => (attr.id === id ? { ...attr, ...patch } : attr)));
  };

  const deleteAttribute = (id: string) => {
    patchAttributes(attributes.filter((attr) => attr.id !== id));
  };

  const applyPreset = (preset: AttributePreset) => {
    const template = PRESETS.find((p) => p.value === preset);
    if (!template) return;
    patchAttributes([
      ...attributes,
      createAttribute({
        key: template.key,
        value: template.valueDefault,
        type: template.type,
        purpose: preset,
      }),
    ]);
  };

  return (
    <InspectorPanel
      title="Custom attributes"
      description="Structured metadata beyond legacy attribute toggles."
      tone="tertiary"
      instanceId="custom-attributes"
      className="mx-2 mb-2"
    >
      {attributes.map((attr) => (
        <div key={attr.id} className="mb-3 rounded border border-outline-variant/50 p-2">
          <InspectorField label="Key" hint="Machine-readable attribute name." instanceId={`attr-key-${attr.id}`}>
            <input
              className={inspectorInputClass}
              value={attr.key}
              onChange={(e) => updateAttribute(attr.id, { key: e.target.value })}
            />
          </InspectorField>
          <InspectorField label="Value" hint="Attribute value." instanceId={`attr-value-${attr.id}`}>
            <input
              className={inspectorInputClass}
              value={attr.value}
              onChange={(e) => updateAttribute(attr.id, { value: e.target.value })}
            />
          </InspectorField>
          <InspectorField label="Type" instanceId={`attr-type-${attr.id}`}>
            <InspectorSelect
              value={attr.type}
              onChange={(type) => updateAttribute(attr.id, { type: type as ElementAttributeType })}
              options={[
                { value: 'string', label: 'string' },
                { value: 'boolean', label: 'boolean' },
                { value: 'number', label: 'number' },
                { value: 'json', label: 'json' },
              ]}
              instanceId={`attr-type-select-${attr.id}`}
            />
          </InspectorField>
          <InspectorActionButton variant="danger" onClick={() => deleteAttribute(attr.id)} instanceId={`attr-del-${attr.id}`}>
            Delete
          </InspectorActionButton>
        </div>
      ))}

      <div className="flex flex-wrap gap-2">
        <InspectorActionButton variant="secondary" onClick={addAttribute} instanceId="attr-add">
          + Add attribute
        </InspectorActionButton>
        <InspectorSelect
          value=""
          onChange={(preset) => applyPreset(preset as AttributePreset)}
          placeholder="Add preset..."
          instanceId="attr-preset"
          options={PRESETS.map((p) => ({ value: p.value, label: p.value }))}
          className="max-w-[180px]"
        />
      </div>
    </InspectorPanel>
  );
}
