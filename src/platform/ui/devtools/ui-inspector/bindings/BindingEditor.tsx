'use client';

import type { ElementBinding } from '../data/element-binding.types';
import { InspectorBadge } from '../ui/InspectorBadge';
import { InspectorField, inspectorInputClass } from '../ui/InspectorField';
import { InspectorSelect } from '../ui/InspectorSelect';
import { InspectorTextarea } from '../ui/InspectorTextarea';
import { InspectorToggle } from '../ui/InspectorToggle';

import { DatabaseBindingEditor } from './DatabaseBindingEditor';
import { DerivedBindingEditor } from './DerivedBindingEditor';
import { ElementLinkBindingEditor } from './ElementLinkBindingEditor';
import { StorageBindingEditor } from './StorageBindingEditor';

type BindingEditorProps = {
  binding: ElementBinding;
  onChange: (patch: Partial<ElementBinding>) => void;
};

const ROLE_OPTIONS: ElementBinding['role'][] = [
  'display_value',
  'read_from',
  'write_to',
  'update',
  'delete',
  'primary_key',
  'foreign_key',
  'upload_to',
  'download_from',
  'preview_from',
  'same_as_element',
  'inherits_binding',
  'depends_on',
  'derived_from',
];

export function BindingEditor({ binding, onChange }: BindingEditorProps) {
  return (
    <div className="flex flex-col gap-3" data-ui-instance-id="binding-editor">
      <div className="flex items-center gap-2">
        <InspectorBadge kind={binding.kind} instanceId="binding-editor-kind" />
        <span className="truncate text-xs text-on-surface-variant">{binding.id}</span>
      </div>

      <InspectorField label="Label" hint="Human-readable binding name." instanceId="binding-label">
        <input
          value={binding.label}
          onChange={(event) => onChange({ label: event.target.value })}
          className={inspectorInputClass}
          data-ui-instance-id="binding-label-input"
        />
      </InspectorField>

      <div className="flex flex-wrap gap-4">
        <InspectorField label="Enabled" inline instanceId="binding-enabled">
          <InspectorToggle
            checked={binding.enabled}
            onChange={(enabled) => onChange({ enabled })}
            instanceId="binding-enabled-toggle"
          />
        </InspectorField>
      </div>

      <InspectorField label="Role" instanceId="binding-role">
        <InspectorSelect
          value={binding.role}
          onChange={(role) => onChange({ role: role as ElementBinding['role'] })}
          placeholder="Select role..."
          instanceId="binding-role-select"
          options={ROLE_OPTIONS.map((role) => ({ value: role, label: role }))}
        />
      </InspectorField>

      <InspectorField label="Confidence" instanceId="binding-confidence">
        <InspectorSelect
          value={binding.confidence}
          onChange={(confidence) =>
            onChange({ confidence: confidence as ElementBinding['confidence'] })
          }
          instanceId="binding-confidence-select"
          options={[
            { value: 'low', label: 'low' },
            { value: 'medium', label: 'medium' },
            { value: 'high', label: 'high' },
            { value: 'confirmed', label: 'confirmed' },
          ]}
        />
      </InspectorField>

      <InspectorField label="Action context" instanceId="binding-action-context">
        <InspectorSelect
          value={binding.actionContext ?? ''}
          onChange={(actionContext) =>
            onChange(
              (actionContext
                ? { actionContext: actionContext as ElementBinding['actionContext'] }
                : {}) as Partial<ElementBinding>
            )
          }
          placeholder="None"
          instanceId="binding-action-context-select"
          options={[
            { value: 'view', label: 'view' },
            { value: 'create', label: 'create' },
            { value: 'edit', label: 'edit' },
            { value: 'delete', label: 'delete' },
            { value: 'search', label: 'search' },
            { value: 'upload', label: 'upload' },
            { value: 'download', label: 'download' },
            { value: 'mixed', label: 'mixed' },
          ]}
        />
      </InspectorField>

      <InspectorField label="Reason" hint="Why this binding exists." instanceId="binding-reason">
        <InspectorTextarea
          value={binding.reason ?? ''}
          onChange={(reason) => onChange({ reason })}
          rows={2}
          instanceId="binding-reason-input"
        />
      </InspectorField>

      <InspectorField label="Notes" instanceId="binding-notes">
        <InspectorTextarea
          value={binding.notes ?? ''}
          onChange={(notes) => onChange({ notes })}
          rows={2}
          instanceId="binding-notes-input"
        />
      </InspectorField>

      {binding.kind === 'database' ? (
        <DatabaseBindingEditor binding={binding} onChange={onChange} />
      ) : null}
      {binding.kind === 'storage' ? (
        <StorageBindingEditor binding={binding} onChange={onChange} />
      ) : null}
      {binding.kind === 'element' ? (
        <ElementLinkBindingEditor binding={binding} onChange={onChange} />
      ) : null}
      {binding.kind === 'derived' ? (
        <DerivedBindingEditor binding={binding} onChange={onChange} />
      ) : null}
    </div>
  );
}
