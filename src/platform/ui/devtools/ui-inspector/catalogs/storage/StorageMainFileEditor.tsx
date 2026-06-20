'use client';

import { useEffect, useState } from 'react';

import {
  ACCESS_LEVEL_OPTIONS,
  RETENTION_OPTIONS,
  STORAGE_TYPE_OPTIONS,
} from '../../data/catalog-options';
import type { StorageFolder } from '../../data/storage-ref.types';
import { InspectorActionButton } from '../../ui/InspectorActionButton';
import { InspectorField, inspectorInputClass } from '../../ui/InspectorField';
import { InspectorSelect } from '../../ui/InspectorSelect';
import { InspectorTextarea } from '../../ui/InspectorTextarea';

type StorageMainFileEditorProps = {
  folder: StorageFolder;
  originalName: string;
  busy: boolean;
  onSave: (originalName: string, next: StorageFolder) => Promise<boolean>;
  onDelete: (name: string) => Promise<boolean>;
};

export function StorageMainFileEditor({
  folder,
  originalName,
  busy,
  onSave,
  onDelete,
}: StorageMainFileEditorProps) {
  const [draft, setDraft] = useState(folder);
  useEffect(() => setDraft(folder), [folder]);

  const patch = (partial: Partial<StorageFolder>) => setDraft((current) => ({ ...current, ...partial }));

  return (
    <div className="flex flex-col gap-3">
      <InspectorField label="Name" instanceId="storage-main-name">
        <input className={inspectorInputClass} value={draft.name} onChange={(e) => patch({ name: e.target.value })} />
      </InspectorField>
      <InspectorField label="Description" instanceId="storage-main-desc">
        <InspectorTextarea value={draft.description ?? ''} onChange={(description) => patch({ description })} instanceId="storage-main-desc-input" />
      </InspectorField>
      <InspectorField label="Entity name" instanceId="storage-main-entity">
        <input className={inspectorInputClass} value={draft.entityName ?? ''} onChange={(e) => patch({ entityName: e.target.value })} />
      </InspectorField>
      <InspectorField label="Storage type" instanceId="storage-main-type">
        <InspectorSelect
          value={draft.storageType ?? ''}
          onChange={(storageType) => {
            if (!storageType) return;
            patch({ storageType: storageType as NonNullable<StorageFolder['storageType']> });
          }}
          placeholder="Select type..."
          options={STORAGE_TYPE_OPTIONS.map((value) => ({ value, label: value }))}
          instanceId="storage-main-type-select"
        />
      </InspectorField>
      <InspectorField label="Base path" instanceId="storage-main-base">
        <input className={inspectorInputClass} value={draft.basePath ?? ''} onChange={(e) => patch({ basePath: e.target.value })} />
      </InspectorField>
      <InspectorField label="Access level" instanceId="storage-main-access">
        <InspectorSelect
          value={draft.accessLevel ?? ''}
          onChange={(accessLevel) => {
            if (!accessLevel) return;
            patch({ accessLevel: accessLevel as NonNullable<StorageFolder['accessLevel']> });
          }}
          placeholder="Select access..."
          options={ACCESS_LEVEL_OPTIONS.map((value) => ({ value, label: value }))}
          instanceId="storage-main-access-select"
        />
      </InspectorField>
      <InspectorField label="Retention" instanceId="storage-main-retention">
        <InspectorSelect
          value={draft.retention ?? ''}
          onChange={(retention) => {
            if (!retention) return;
            patch({ retention: retention as NonNullable<StorageFolder['retention']> });
          }}
          placeholder="Select retention..."
          options={RETENTION_OPTIONS.map((value) => ({ value, label: value }))}
          instanceId="storage-main-retention-select"
        />
      </InspectorField>
      <div className="flex flex-wrap gap-2">
        <InspectorActionButton variant="primary" disabled={busy} onClick={() => void onSave(originalName, draft)} instanceId="storage-main-save">
          Save
        </InspectorActionButton>
        <InspectorActionButton variant="danger" disabled={busy} onClick={() => void onDelete(originalName)} instanceId="storage-main-delete">
          Delete
        </InspectorActionButton>
      </div>
    </div>
  );
}
