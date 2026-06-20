'use client';

import { useEffect, useState } from 'react';

import {
  ACCESS_LEVEL_OPTIONS,
  FILE_PURPOSE_OPTIONS,
  NAMING_STRATEGY_OPTIONS,
  RETENTION_OPTIONS,
} from '../../data/catalog-options';
import type { StorageSubfolder } from '../../data/storage-ref.types';
import { InspectorActionButton } from '../../ui/InspectorActionButton';
import { InspectorField, inspectorInputClass } from '../../ui/InspectorField';
import { InspectorSelect } from '../../ui/InspectorSelect';
import { InspectorTextarea } from '../../ui/InspectorTextarea';

type StorageSubFileEditorProps = {
  subfolder: StorageSubfolder;
  originalName: string;
  mainName: string;
  busy: boolean;
  onSave: (mainName: string, originalName: string, next: StorageSubfolder) => Promise<boolean>;
  onDelete: (mainName: string, subName: string) => Promise<boolean>;
};

export function StorageSubFileEditor({
  subfolder,
  originalName,
  mainName,
  busy,
  onSave,
  onDelete,
}: StorageSubFileEditorProps) {
  const [draft, setDraft] = useState(subfolder);
  useEffect(() => setDraft(subfolder), [subfolder]);

  const patch = (partial: Partial<StorageSubfolder>) => setDraft((current) => ({ ...current, ...partial }));

  return (
    <div className="flex flex-col gap-3">
      <InspectorField label="Name" instanceId="storage-sub-name">
        <input className={inspectorInputClass} value={draft.name} onChange={(e) => patch({ name: e.target.value })} />
      </InspectorField>
      <InspectorField label="Description" instanceId="storage-sub-desc">
        <InspectorTextarea value={draft.description ?? ''} onChange={(description) => patch({ description })} instanceId="storage-sub-desc-input" />
      </InspectorField>
      <InspectorField label="Entity name" instanceId="storage-sub-entity">
        <input className={inspectorInputClass} value={draft.entityName ?? ''} onChange={(e) => patch({ entityName: e.target.value })} />
      </InspectorField>
      <InspectorField label="Path template" hint="Example: /{entity}/{id}/{fileName}" instanceId="storage-sub-path">
        <input className={inspectorInputClass} value={draft.pathTemplate ?? ''} onChange={(e) => patch({ pathTemplate: e.target.value })} />
      </InspectorField>
      <InspectorField label="File purpose" instanceId="storage-sub-purpose">
        <InspectorSelect
          value={draft.filePurpose ?? ''}
          onChange={(filePurpose) => {
            if (!filePurpose) return;
            patch({ filePurpose: filePurpose as NonNullable<StorageSubfolder['filePurpose']> });
          }}
          placeholder="Select purpose..."
          options={FILE_PURPOSE_OPTIONS.map((value) => ({ value, label: value }))}
          instanceId="storage-sub-purpose-select"
        />
      </InspectorField>
      <InspectorField label="Allowed mime types" instanceId="storage-sub-mime">
        <input className={inspectorInputClass} value={draft.allowedMimeTypes ?? ''} onChange={(e) => patch({ allowedMimeTypes: e.target.value })} />
      </InspectorField>
      <InspectorField label="Max file size (MB)" instanceId="storage-sub-size">
        <input
          type="number"
          min={1}
          className={inspectorInputClass}
          value={draft.maxFileSizeMb ?? ''}
          onChange={(e) => {
            const value = e.target.value;
            if (!value) {
              const { maxFileSizeMb: _removed, ...rest } = draft;
              setDraft(rest as StorageSubfolder);
              return;
            }
            patch({ maxFileSizeMb: Number(value) });
          }}
        />
      </InspectorField>
      <InspectorField label="Access level" instanceId="storage-sub-access">
        <InspectorSelect
          value={draft.accessLevel ?? ''}
          onChange={(accessLevel) => {
            if (!accessLevel) return;
            patch({ accessLevel: accessLevel as NonNullable<StorageSubfolder['accessLevel']> });
          }}
          placeholder="Select access..."
          options={ACCESS_LEVEL_OPTIONS.map((value) => ({ value, label: value }))}
          instanceId="storage-sub-access-select"
        />
      </InspectorField>
      <InspectorField label="Retention" instanceId="storage-sub-retention">
        <InspectorSelect
          value={draft.retention ?? ''}
          onChange={(retention) => {
            if (!retention) return;
            patch({ retention: retention as NonNullable<StorageSubfolder['retention']> });
          }}
          placeholder="Select retention..."
          options={RETENTION_OPTIONS.map((value) => ({ value, label: value }))}
          instanceId="storage-sub-retention-select"
        />
      </InspectorField>
      <InspectorField label="Naming strategy" instanceId="storage-sub-naming">
        <InspectorSelect
          value={draft.namingStrategy ?? ''}
          onChange={(namingStrategy) => {
            if (!namingStrategy) return;
            patch({ namingStrategy: namingStrategy as NonNullable<StorageSubfolder['namingStrategy']> });
          }}
          placeholder="Select strategy..."
          options={NAMING_STRATEGY_OPTIONS.map((value) => ({ value, label: value }))}
          instanceId="storage-sub-naming-select"
        />
      </InspectorField>
      <InspectorField label="Notes" instanceId="storage-sub-notes">
        <InspectorTextarea value={draft.notes ?? ''} onChange={(notes) => patch({ notes })} instanceId="storage-sub-notes-input" />
      </InspectorField>
      <div className="flex flex-wrap gap-2">
        <InspectorActionButton variant="primary" disabled={busy} onClick={() => void onSave(mainName, originalName, draft)} instanceId="storage-sub-save">
          Save
        </InspectorActionButton>
        <InspectorActionButton variant="danger" disabled={busy} onClick={() => void onDelete(mainName, originalName)} instanceId="storage-sub-delete">
          Delete
        </InspectorActionButton>
      </div>
    </div>
  );
}
