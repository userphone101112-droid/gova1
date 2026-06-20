'use client';

import { useEffect, useState } from 'react';

import { DATABASE_LIFECYCLE_OPTIONS } from '../../data/catalog-options';
import type { DatabaseRefDatabase } from '../../data/database-ref.types';
import { InspectorActionButton } from '../../ui/InspectorActionButton';
import { InspectorField, inspectorInputClass } from '../../ui/InspectorField';
import { InspectorSelect } from '../../ui/InspectorSelect';
import { InspectorTextarea } from '../../ui/InspectorTextarea';

type DatabaseEditorProps = {
  database: DatabaseRefDatabase;
  originalName: string;
  busy: boolean;
  featureOptions: string[];
  onSave: (originalName: string, next: DatabaseRefDatabase) => Promise<boolean>;
  onDelete: (name: string) => Promise<boolean>;
};

export function DatabaseEditor({
  database,
  originalName,
  busy,
  featureOptions,
  onSave,
  onDelete,
}: DatabaseEditorProps) {
  const [draft, setDraft] = useState(database);
  useEffect(() => setDraft(database), [database]);

  const patch = (partial: Partial<DatabaseRefDatabase>) => setDraft((current) => ({ ...current, ...partial }));

  return (
    <div className="flex flex-col gap-3">
      <InspectorField label="Name" hint="Canonical database identifier." instanceId="db-editor-name">
        <input className={inspectorInputClass} value={draft.name} onChange={(e) => patch({ name: e.target.value })} />
      </InspectorField>
      <InspectorField label="Description" instanceId="db-editor-desc">
        <InspectorTextarea value={draft.description ?? ''} onChange={(description) => patch({ description })} instanceId="db-editor-desc-input" />
      </InspectorField>
      <InspectorField label="Entity name" instanceId="db-editor-entity">
        <input className={inspectorInputClass} value={draft.entityName ?? ''} onChange={(e) => patch({ entityName: e.target.value })} />
      </InspectorField>
      <InspectorField label="Owner feature" instanceId="db-editor-feature">
        <InspectorSelect
          value={draft.ownerFeature ?? ''}
          onChange={(ownerFeature) => patch({ ownerFeature })}
          placeholder="Select feature..."
          options={featureOptions.map((feature) => ({ value: feature, label: feature }))}
          instanceId="db-editor-feature-select"
        />
      </InspectorField>
      <InspectorField label="Domain" instanceId="db-editor-domain">
        <input className={inspectorInputClass} value={draft.domain ?? ''} onChange={(e) => patch({ domain: e.target.value })} />
      </InspectorField>
      <InspectorField label="Lifecycle" instanceId="db-editor-lifecycle">
        <InspectorSelect
          value={draft.lifecycle ?? ''}
          onChange={(lifecycle) => {
            if (!lifecycle) return;
            patch({ lifecycle: lifecycle as NonNullable<DatabaseRefDatabase['lifecycle']> });
          }}
          placeholder="Select lifecycle..."
          options={DATABASE_LIFECYCLE_OPTIONS.map((value) => ({ value, label: value }))}
          instanceId="db-editor-lifecycle-select"
        />
      </InspectorField>
      <div className="flex flex-wrap gap-2">
        <InspectorActionButton variant="primary" disabled={busy} onClick={() => void onSave(originalName, draft)} instanceId="db-editor-save">
          Save
        </InspectorActionButton>
        <InspectorActionButton variant="danger" disabled={busy} onClick={() => void onDelete(originalName)} instanceId="db-editor-delete">
          Delete
        </InspectorActionButton>
      </div>
    </div>
  );
}
