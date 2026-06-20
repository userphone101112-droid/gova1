'use client';

import { useEffect, useState } from 'react';

import { ACCESS_PATTERN_OPTIONS, TABLE_TYPE_OPTIONS } from '../../data/catalog-options';
import type { DatabaseRefTable } from '../../data/database-ref.types';
import { InspectorActionButton } from '../../ui/InspectorActionButton';
import { InspectorField, inspectorInputClass } from '../../ui/InspectorField';
import { InspectorSelect } from '../../ui/InspectorSelect';
import { InspectorTextarea } from '../../ui/InspectorTextarea';

type TableEditorProps = {
  table: DatabaseRefTable;
  originalName: string;
  databaseName: string;
  busy: boolean;
  onSave: (databaseName: string, originalName: string, next: DatabaseRefTable) => Promise<boolean>;
  onDelete: (databaseName: string, tableName: string) => Promise<boolean>;
};

export function TableEditor({
  table,
  originalName,
  databaseName,
  busy,
  onSave,
  onDelete,
}: TableEditorProps) {
  const [draft, setDraft] = useState(table);
  useEffect(() => setDraft(table), [table]);

  const patch = (partial: Partial<DatabaseRefTable>) => setDraft((current) => ({ ...current, ...partial }));

  return (
    <div className="flex flex-col gap-3">
      <InspectorField label="Name" instanceId="table-editor-name">
        <input className={inspectorInputClass} value={draft.name} onChange={(e) => patch({ name: e.target.value })} />
      </InspectorField>
      <InspectorField label="Description" instanceId="table-editor-desc">
        <InspectorTextarea value={draft.description ?? ''} onChange={(description) => patch({ description })} instanceId="table-editor-desc-input" />
      </InspectorField>
      <InspectorField label="Entity name" instanceId="table-editor-entity">
        <input className={inspectorInputClass} value={draft.entityName ?? ''} onChange={(e) => patch({ entityName: e.target.value })} />
      </InspectorField>
      <InspectorField label="Table type" instanceId="table-editor-type">
        <InspectorSelect
          value={draft.tableType ?? ''}
          onChange={(tableType) => {
            if (!tableType) return;
            patch({ tableType: tableType as NonNullable<DatabaseRefTable['tableType']> });
          }}
          placeholder="Select type..."
          options={TABLE_TYPE_OPTIONS.map((value) => ({ value, label: value }))}
          instanceId="table-editor-type-select"
        />
      </InspectorField>
      <InspectorField label="Expected rows" instanceId="table-editor-rows">
        <input className={inspectorInputClass} value={draft.expectedRows ?? ''} onChange={(e) => patch({ expectedRows: e.target.value })} />
      </InspectorField>
      <InspectorField label="Access pattern" instanceId="table-editor-access">
        <InspectorSelect
          value={draft.accessPattern ?? ''}
          onChange={(accessPattern) => {
            if (!accessPattern) return;
            patch({ accessPattern: accessPattern as NonNullable<DatabaseRefTable['accessPattern']> });
          }}
          placeholder="Select pattern..."
          options={ACCESS_PATTERN_OPTIONS.map((value) => ({ value, label: value }))}
          instanceId="table-editor-access-select"
        />
      </InspectorField>
      <InspectorField label="Notes" instanceId="table-editor-notes">
        <InspectorTextarea value={draft.notes ?? ''} onChange={(notes) => patch({ notes })} instanceId="table-editor-notes-input" />
      </InspectorField>
      <div className="flex flex-wrap gap-2">
        <InspectorActionButton variant="primary" disabled={busy} onClick={() => void onSave(databaseName, originalName, draft)} instanceId="table-editor-save">
          Save
        </InspectorActionButton>
        <InspectorActionButton variant="danger" disabled={busy} onClick={() => void onDelete(databaseName, originalName)} instanceId="table-editor-delete">
          Delete
        </InspectorActionButton>
      </div>
    </div>
  );
}
