'use client';

import { useEffect, useMemo, useState } from 'react';

import { COLUMN_DATA_TYPE_OPTIONS, COLUMN_SENSITIVITY_OPTIONS } from '../../data/catalog-options';
import { findDatabase, findTable } from '../../data/database-ref-utils';
import type { DatabaseRefColumn, DatabaseRefFile } from '../../data/database-ref.types';
import { InspectorActionButton } from '../../ui/InspectorActionButton';
import { InspectorField, inspectorInputClass } from '../../ui/InspectorField';
import { InspectorSelect } from '../../ui/InspectorSelect';
import { InspectorTextarea } from '../../ui/InspectorTextarea';
import { InspectorToggle } from '../../ui/InspectorToggle';

type ColumnEditorProps = {
  column: DatabaseRefColumn;
  originalName: string;
  databaseName: string;
  tableName: string;
  catalogFile: DatabaseRefFile;
  busy: boolean;
  onSave: (
    databaseName: string,
    tableName: string,
    originalName: string,
    next: DatabaseRefColumn
  ) => Promise<boolean>;
  onDelete: (databaseName: string, tableName: string, columnName: string) => Promise<boolean>;
};

export function ColumnEditor({
  column,
  originalName,
  databaseName,
  tableName,
  catalogFile,
  busy,
  onSave,
  onDelete,
}: ColumnEditorProps) {
  const [draft, setDraft] = useState(column);
  useEffect(() => setDraft(column), [column]);

  const patch = (partial: Partial<DatabaseRefColumn>) => setDraft((current) => ({ ...current, ...partial }));

  const refDb = useMemo(
    () => findDatabase(catalogFile, draft.referencesDatabase ?? ''),
    [catalogFile, draft.referencesDatabase]
  );
  const refTables = refDb?.tables ?? [];
  const refTable = useMemo(() => findTable(refDb, draft.referencesTable ?? ''), [refDb, draft.referencesTable]);
  const refColumns = refTable?.columns ?? [];

  return (
    <div className="flex flex-col gap-3">
      <InspectorField label="Name" instanceId="column-editor-name">
        <input className={inspectorInputClass} value={draft.name} onChange={(e) => patch({ name: e.target.value })} />
      </InspectorField>
      <InspectorField label="Description" instanceId="column-editor-desc">
        <InspectorTextarea value={draft.description ?? ''} onChange={(description) => patch({ description })} instanceId="column-editor-desc-input" />
      </InspectorField>
      <InspectorField label="Data type" instanceId="column-editor-type">
        <InspectorSelect
          value={draft.dataType ?? ''}
          onChange={(dataType) => {
            if (!dataType) return;
            patch({ dataType: dataType as NonNullable<DatabaseRefColumn['dataType']> });
          }}
          placeholder="Select data type..."
          options={COLUMN_DATA_TYPE_OPTIONS.map((value) => ({ value, label: value }))}
          instanceId="column-editor-type-select"
        />
      </InspectorField>
      <div className="grid grid-cols-2 gap-3">
        {(
          [
            ['nullable', 'Nullable'],
            ['unique', 'Unique'],
            ['indexed', 'Indexed'],
            ['isPrimaryKey', 'Primary key'],
            ['isForeignKey', 'Foreign key'],
          ] as const
        ).map(([key, label]) => (
          <InspectorField key={key} label={label} inline instanceId={`column-editor-${key}`}>
            <InspectorToggle
              checked={Boolean(draft[key])}
              onChange={(checked) => {
                const next: Partial<DatabaseRefColumn> = { [key]: checked };
                if (key === 'isPrimaryKey' && checked) next.nullable = false;
                patch(next);
              }}
              instanceId={`column-editor-${key}-toggle`}
            />
          </InspectorField>
        ))}
      </div>
      <InspectorField label="References database" instanceId="column-editor-ref-db">
        <InspectorSelect
          value={draft.referencesDatabase ?? ''}
          onChange={(referencesDatabase) =>
            patch({ referencesDatabase, referencesTable: '', referencesColumn: '' })
          }
          placeholder="Select database..."
          options={catalogFile.databases.map((db) => ({ value: db.name, label: db.name }))}
          instanceId="column-editor-ref-db-select"
        />
      </InspectorField>
      <InspectorField label="References table" instanceId="column-editor-ref-table">
        <InspectorSelect
          value={draft.referencesTable ?? ''}
          onChange={(referencesTable) => patch({ referencesTable, referencesColumn: '' })}
          placeholder="Select table..."
          disabled={!draft.referencesDatabase}
          options={refTables.map((table) => ({ value: table.name, label: table.name }))}
          instanceId="column-editor-ref-table-select"
        />
      </InspectorField>
      <InspectorField label="References column" instanceId="column-editor-ref-column">
        <InspectorSelect
          value={draft.referencesColumn ?? ''}
          onChange={(referencesColumn) => patch({ referencesColumn })}
          placeholder="Select column..."
          disabled={!draft.referencesTable}
          options={refColumns.map((col) => ({ value: col.name, label: col.name }))}
          instanceId="column-editor-ref-column-select"
        />
      </InspectorField>
      <InspectorField label="Sensitivity" instanceId="column-editor-sensitivity">
        <InspectorSelect
          value={draft.sensitivity ?? ''}
          onChange={(sensitivity) => {
            if (!sensitivity) return;
            patch({ sensitivity: sensitivity as NonNullable<DatabaseRefColumn['sensitivity']> });
          }}
          placeholder="Select sensitivity..."
          options={COLUMN_SENSITIVITY_OPTIONS.map((value) => ({ value, label: value }))}
          instanceId="column-editor-sensitivity-select"
        />
      </InspectorField>
      <InspectorField label="Validation rule" instanceId="column-editor-validation">
        <input className={inspectorInputClass} value={draft.validationRule ?? ''} onChange={(e) => patch({ validationRule: e.target.value })} />
      </InspectorField>
      <InspectorField label="Example value" instanceId="column-editor-example">
        <input className={inspectorInputClass} value={draft.exampleValue ?? ''} onChange={(e) => patch({ exampleValue: e.target.value })} />
      </InspectorField>
      <div className="flex flex-wrap gap-2">
        <InspectorActionButton variant="primary" disabled={busy} onClick={() => void onSave(databaseName, tableName, originalName, draft)} instanceId="column-editor-save">
          Save
        </InspectorActionButton>
        <InspectorActionButton variant="danger" disabled={busy} onClick={() => void onDelete(databaseName, tableName, originalName)} instanceId="column-editor-delete">
          Delete
        </InspectorActionButton>
      </div>
    </div>
  );
}
