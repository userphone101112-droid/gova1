'use client';

import { useEffect, useMemo, useState } from 'react';

import { DEVTOOLS } from '@/platform/ui/registry/features/devtools';

import {
  cloneDatabaseRefFile,
  emptyDatabaseRefFile,
  getEntityDescription,
  uniqueName,
} from '../data/database-ref-utils';
import type {
  DatabaseRefColumn,
  DatabaseRefDatabase,
  DatabaseRefFile,
  DatabaseRefTable,
} from '../data/database-ref.types';

import { FieldGroup, inspectorFieldInputClass } from './FieldGroup';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface DatabaseRefEditorProps {
  data: DatabaseRefFile;
  onChange: (next: DatabaseRefFile) => void;
  onSave: () => Promise<void>;
  saveStatus: SaveStatus;
}

function entityLabel(name: string, description: string): string {
  return description ? `${name} — ${description}` : name;
}

export function DatabaseRefEditor({ data, onChange, onSave, saveStatus }: DatabaseRefEditorProps) {
  const [dbIndex, setDbIndex] = useState(0);
  const [tableIndex, setTableIndex] = useState(0);
  const [columnIndex, setColumnIndex] = useState(0);

  const databases = data.databases;
  const selectedDb = databases[dbIndex];
  const tables = selectedDb?.tables ?? [];
  const selectedTable = tables[tableIndex];
  const columns = selectedTable?.columns ?? [];
  const selectedColumn = columns[columnIndex];

  useEffect(() => {
    if (dbIndex >= databases.length) setDbIndex(Math.max(0, databases.length - 1));
  }, [dbIndex, databases.length]);

  useEffect(() => {
    if (tableIndex >= tables.length) setTableIndex(Math.max(0, tables.length - 1));
  }, [tableIndex, tables.length]);

  useEffect(() => {
    if (columnIndex >= columns.length) setColumnIndex(Math.max(0, columns.length - 1));
  }, [columnIndex, columns.length]);

  const saveLabel = useMemo(() => {
    if (saveStatus === 'saving') return 'Saving schema...';
    if (saveStatus === 'saved') return 'Schema saved';
    if (saveStatus === 'error') return 'Schema save failed';
    return 'Save database_ref.json';
  }, [saveStatus]);

  const updateDatabase = (patch: Partial<DatabaseRefDatabase>) => {
    if (!selectedDb) return;
    const next = cloneDatabaseRefFile(data);
    next.databases[dbIndex] = { ...next.databases[dbIndex], ...patch };
    onChange(next);
  };

  const updateTable = (patch: Partial<DatabaseRefTable>) => {
    if (!selectedDb || !selectedTable) return;
    const next = cloneDatabaseRefFile(data);
    next.databases[dbIndex].tables[tableIndex] = {
      ...next.databases[dbIndex].tables[tableIndex],
      ...patch,
    };
    onChange(next);
  };

  const updateColumn = (patch: Partial<DatabaseRefColumn>) => {
    if (!selectedDb || !selectedTable || !selectedColumn) return;
    const next = cloneDatabaseRefFile(data);
    next.databases[dbIndex].tables[tableIndex].columns[columnIndex] = {
      ...next.databases[dbIndex].tables[tableIndex].columns[columnIndex],
      ...patch,
    };
    onChange(next);
  };

  const handleAddDatabase = () => {
    const next = cloneDatabaseRefFile(data.databases.length ? data : emptyDatabaseRefFile());
    const name = uniqueName(
      'new_database',
      next.databases.map((db) => db.name)
    );
    next.databases.push({ name, tables: [] });
    onChange(next);
    setDbIndex(next.databases.length - 1);
    setTableIndex(0);
    setColumnIndex(0);
  };

  const handleAddTable = () => {
    if (!selectedDb) return;
    const next = cloneDatabaseRefFile(data);
    const name = uniqueName(
      'new_table',
      next.databases[dbIndex].tables.map((table) => table.name)
    );
    next.databases[dbIndex].tables.push({ name, columns: [] });
    onChange(next);
    setTableIndex(next.databases[dbIndex].tables.length - 1);
    setColumnIndex(0);
  };

  const handleAddColumn = () => {
    if (!selectedDb || !selectedTable) return;
    const next = cloneDatabaseRefFile(data);
    const name = uniqueName(
      'new_column',
      next.databases[dbIndex].tables[tableIndex].columns.map((column) => column.name)
    );
    next.databases[dbIndex].tables[tableIndex].columns.push({ name });
    onChange(next);
    setColumnIndex(next.databases[dbIndex].tables[tableIndex].columns.length - 1);
  };

  const handleDeleteDatabase = () => {
    if (!selectedDb) return;
    if (!window.confirm(`Delete database "${selectedDb.name}" and all nested tables?`)) return;
    const next = cloneDatabaseRefFile(data);
    next.databases.splice(dbIndex, 1);
    onChange(next);
    setDbIndex(Math.max(0, dbIndex - 1));
    setTableIndex(0);
    setColumnIndex(0);
  };

  const handleDeleteTable = () => {
    if (!selectedDb || !selectedTable) return;
    if (!window.confirm(`Delete table "${selectedTable.name}" and all columns?`)) return;
    const next = cloneDatabaseRefFile(data);
    next.databases[dbIndex].tables.splice(tableIndex, 1);
    onChange(next);
    setTableIndex(Math.max(0, tableIndex - 1));
    setColumnIndex(0);
  };

  const handleDeleteColumn = () => {
    if (!selectedDb || !selectedTable || !selectedColumn) return;
    if (!window.confirm(`Delete column "${selectedColumn.name}"?`)) return;
    const next = cloneDatabaseRefFile(data);
    next.databases[dbIndex].tables[tableIndex].columns.splice(columnIndex, 1);
    onChange(next);
    setColumnIndex(Math.max(0, columnIndex - 1));
  };

  const inputClass = inspectorFieldInputClass;
  const actionClass =
    'rounded border border-outline-variant px-2 py-1 text-xs hover:bg-surface-variant';

  return (
    <section
      data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DBREF.CONTAINER.uuid}
      data-ui-instance-id="editor-root"
      className="flex shrink-0 flex-col gap-2 border-t border-outline-variant px-3 py-3"
    >
      <span
        data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DATA.DATABASE_LABEL.uuid}
        className="text-xs font-semibold"
      >
        Database schema (database_ref.json)
      </span>

      <button
        data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DBREF.ADD_DB.uuid}
        type="button"
        onClick={handleAddDatabase}
        className={actionClass}
      >
        + Database
      </button>
      <button
        data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DBREF.ADD_TABLE.uuid}
        type="button"
        onClick={handleAddTable}
        disabled={!selectedDb}
        className={`${actionClass} disabled:opacity-50`}
      >
        + Table
      </button>
      <button
        data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DBREF.ADD_COLUMN.uuid}
        type="button"
        onClick={handleAddColumn}
        disabled={!selectedTable}
        className={`${actionClass} disabled:opacity-50`}
      >
        + Column
      </button>

      <FieldGroup label="Database" hint="Select a database entry to edit." instanceId="ref-db-select">
        <select
          data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DBREF.DB_SELECT.uuid}
          value={databases.length ? String(dbIndex) : ''}
          onChange={(e) => {
            setDbIndex(Number(e.target.value));
            setTableIndex(0);
            setColumnIndex(0);
          }}
          className={inputClass}
        >
          {[
            ...(databases.length === 0 ? [{ value: '', label: 'No databases' }] : []),
            ...databases.map((db, index) => ({
              value: String(index),
              label: entityLabel(db.name, getEntityDescription(db)),
            })),
          ].map((item) => (
            <option
              key={`refdb-${item.value || 'empty'}`}
              data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.FILTER_FEATURE_OPTION.uuid}
              data-ui-instance-id={`refdb-${item.value || 'empty'}`}
              value={item.value}
            >
              {item.label}
            </option>
          ))}
        </select>
      </FieldGroup>

      {selectedDb && (
        <>
          <FieldGroup label="Database name" hint="Canonical identifier for this database." instanceId="ref-db-name">
            <input
              data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DBREF.DB_EN_INPUT.uuid}
              value={selectedDb.name}
              onChange={(e) => updateDatabase({ name: e.target.value })}
              className={inputClass}
            />
          </FieldGroup>
          <FieldGroup label="Database description" hint="Optional notes about this database." instanceId="ref-db-desc">
            <textarea
              data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DBMGMT.DESC_TEXTAREA.uuid}
              value={selectedDb.description ?? ''}
              onChange={(e) => updateDatabase({ description: e.target.value })}
              rows={2}
              className={inputClass}
            />
          </FieldGroup>
          <button
            data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DBREF.DELETE_DB.uuid}
            type="button"
            onClick={handleDeleteDatabase}
            className={`${actionClass} text-error`}
          >
            Delete database
          </button>
        </>
      )}

      {selectedDb && (
        <>
          <FieldGroup label="Table" hint="Select a table within the database." instanceId="ref-table-select">
            <select
              data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DBREF.TABLE_SELECT.uuid}
              value={tables.length ? String(tableIndex) : ''}
              onChange={(e) => {
                setTableIndex(Number(e.target.value));
                setColumnIndex(0);
              }}
              className={inputClass}
            >
              {[
                ...(tables.length === 0 ? [{ value: '', label: 'No tables' }] : []),
                ...tables.map((table, index) => ({
                  value: String(index),
                  label: entityLabel(table.name, getEntityDescription(table)),
                })),
              ].map((item) => (
                <option
                  key={`reftb-${item.value || 'empty'}`}
                  data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.FILTER_TAG_OPTION.uuid}
                  data-ui-instance-id={`reftb-${item.value || 'empty'}`}
                  value={item.value}
                >
                  {item.label}
                </option>
              ))}
            </select>
          </FieldGroup>
        </>
      )}

      {selectedTable && (
        <>
          <FieldGroup label="Table name" hint="Canonical identifier for this table." instanceId="ref-table-name">
            <input
              data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DBREF.TABLE_EN_INPUT.uuid}
              value={selectedTable.name}
              onChange={(e) => updateTable({ name: e.target.value })}
              className={inputClass}
            />
          </FieldGroup>
          <FieldGroup label="Table description" hint="Optional notes about this table." instanceId="ref-table-desc">
            <textarea
              data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DBMGMT.DESC_TEXTAREA.uuid}
              value={selectedTable.description ?? ''}
              onChange={(e) => updateTable({ description: e.target.value })}
              rows={2}
              className={inputClass}
            />
          </FieldGroup>
          <button
            data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DBREF.DELETE_TABLE.uuid}
            type="button"
            onClick={handleDeleteTable}
            className={`${actionClass} text-error`}
          >
            Delete table
          </button>
        </>
      )}

      {selectedTable && (
        <FieldGroup label="Column" hint="Select a column within the table." instanceId="ref-column-select">
          <select
            data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DBREF.COLUMN_SELECT.uuid}
            value={columns.length ? String(columnIndex) : ''}
            onChange={(e) => setColumnIndex(Number(e.target.value))}
            className={inputClass}
          >
            {[
              ...(columns.length === 0 ? [{ value: '', label: 'No columns' }] : []),
              ...columns.map((column, index) => ({
                value: String(index),
                label: entityLabel(column.name, getEntityDescription(column)),
              })),
            ].map((item) => (
              <option
                key={`refcol-${item.value || 'empty'}`}
                data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.FILTER_LIFECYCLE_OPTION.uuid}
                data-ui-instance-id={`refcol-${item.value || 'empty'}`}
                value={item.value}
              >
                {item.label}
              </option>
            ))}
          </select>
        </FieldGroup>
      )}

      {selectedColumn && (
        <>
          <FieldGroup label="Column name" hint="Canonical identifier for this column." instanceId="ref-column-name">
            <input
              data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DBREF.COLUMN_EN_INPUT.uuid}
              value={selectedColumn.name}
              onChange={(e) => updateColumn({ name: e.target.value })}
              className={inputClass}
            />
          </FieldGroup>
          <FieldGroup label="Column description" hint="Optional notes about this column." instanceId="ref-column-desc">
            <textarea
              data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DBMGMT.DESC_TEXTAREA.uuid}
              value={selectedColumn.description ?? ''}
              onChange={(e) => updateColumn({ description: e.target.value })}
              rows={2}
              className={inputClass}
            />
          </FieldGroup>
          <button
            data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DBREF.DELETE_COLUMN.uuid}
            type="button"
            onClick={handleDeleteColumn}
            className={`${actionClass} text-error`}
          >
            Delete column
          </button>
        </>
      )}

      <button
        data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DBREF.SAVE_BUTTON.uuid}
        type="button"
        onClick={() => void onSave()}
        disabled={saveStatus === 'saving'}
        className="rounded bg-secondary px-2 py-1.5 text-xs text-on-secondary disabled:opacity-60"
      >
        {saveLabel}
      </button>
    </section>
  );
}
