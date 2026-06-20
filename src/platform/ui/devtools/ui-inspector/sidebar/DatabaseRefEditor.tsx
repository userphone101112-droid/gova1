'use client';

import { useEffect, useMemo, useState } from 'react';

import { DEVTOOLS } from '@/platform/ui/registry/features/devtools';

import {
  cloneDatabaseRefFile,
  emptyDatabaseRefFile,
  uniqueEnName,
} from '../data/database-ref-utils';
import type {
  DatabaseRefColumn,
  DatabaseRefDatabase,
  DatabaseRefFile,
  DatabaseRefTable,
} from '../data/database-ref.types';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface DatabaseRefEditorProps {
  data: DatabaseRefFile;
  onChange: (next: DatabaseRefFile) => void;
  onSave: () => Promise<void>;
  saveStatus: SaveStatus;
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
    const nameEn = uniqueEnName(
      'new_database',
      next.databases.map((db) => db.name_en)
    );
    next.databases.push({
      name_ar: 'قاعدة جديدة',
      name_en: nameEn,
      tables: [],
    });
    onChange(next);
    setDbIndex(next.databases.length - 1);
    setTableIndex(0);
    setColumnIndex(0);
  };

  const handleAddTable = () => {
    if (!selectedDb) return;
    const next = cloneDatabaseRefFile(data);
    const nameEn = uniqueEnName(
      'new_table',
      next.databases[dbIndex].tables.map((table) => table.name_en)
    );
    next.databases[dbIndex].tables.push({
      name_ar: 'جدول جديد',
      name_en: nameEn,
      columns: [],
    });
    onChange(next);
    setTableIndex(next.databases[dbIndex].tables.length - 1);
    setColumnIndex(0);
  };

  const handleAddColumn = () => {
    if (!selectedDb || !selectedTable) return;
    const next = cloneDatabaseRefFile(data);
    const nameEn = uniqueEnName(
      'new_column',
      next.databases[dbIndex].tables[tableIndex].columns.map((column) => column.name_en)
    );
    next.databases[dbIndex].tables[tableIndex].columns.push({
      name_ar: 'عمود جديد',
      name_en: nameEn,
    });
    onChange(next);
    setColumnIndex(next.databases[dbIndex].tables[tableIndex].columns.length - 1);
  };

  const handleDeleteDatabase = () => {
    if (!selectedDb) return;
    if (!window.confirm(`Delete database "${selectedDb.name_en}" and all nested tables?`)) return;
    const next = cloneDatabaseRefFile(data);
    next.databases.splice(dbIndex, 1);
    onChange(next);
    setDbIndex(Math.max(0, dbIndex - 1));
    setTableIndex(0);
    setColumnIndex(0);
  };

  const handleDeleteTable = () => {
    if (!selectedDb || !selectedTable) return;
    if (!window.confirm(`Delete table "${selectedTable.name_en}" and all columns?`)) return;
    const next = cloneDatabaseRefFile(data);
    next.databases[dbIndex].tables.splice(tableIndex, 1);
    onChange(next);
    setTableIndex(Math.max(0, tableIndex - 1));
    setColumnIndex(0);
  };

  const handleDeleteColumn = () => {
    if (!selectedDb || !selectedTable || !selectedColumn) return;
    if (!window.confirm(`Delete column "${selectedColumn.name_en}"?`)) return;
    const next = cloneDatabaseRefFile(data);
    next.databases[dbIndex].tables[tableIndex].columns.splice(columnIndex, 1);
    onChange(next);
    setColumnIndex(Math.max(0, columnIndex - 1));
  };

  const handleSave = () => {
    void onSave();
  };

  const inputClass =
    'w-full rounded border border-outline-variant bg-surface px-2 py-1 text-xs';
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

      <span
        data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DATA.INF1_LABEL.uuid}
        className="text-[11px] text-on-surface-variant"
      >
        Database
      </span>
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
            label: `${db.name_en} (${db.name_ar})`,
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

      {selectedDb && (
        <>
          <input
            data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DBREF.DB_AR_INPUT.uuid}
            value={selectedDb.name_ar}
            onChange={(e) => updateDatabase({ name_ar: e.target.value })}
            placeholder="Database name_ar"
            className={inputClass}
          />
          <input
            data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DBREF.DB_EN_INPUT.uuid}
            value={selectedDb.name_en}
            onChange={(e) => updateDatabase({ name_en: e.target.value })}
            placeholder="Database name_en"
            className={inputClass}
          />
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
          <span
            data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DATA.INF2_LABEL.uuid}
            className="text-[11px] text-on-surface-variant"
          >
            Table
          </span>
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
                label: `${table.name_en} (${table.name_ar})`,
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
        </>
      )}

      {selectedTable && (
        <>
          <input
            data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DBREF.TABLE_AR_INPUT.uuid}
            value={selectedTable.name_ar}
            onChange={(e) => updateTable({ name_ar: e.target.value })}
            placeholder="Table name_ar"
            className={inputClass}
          />
          <input
            data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DBREF.TABLE_EN_INPUT.uuid}
            value={selectedTable.name_en}
            onChange={(e) => updateTable({ name_en: e.target.value })}
            placeholder="Table name_en"
            className={inputClass}
          />
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
        <>
          <span
            data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DATA.INF3_LABEL.uuid}
            className="text-[11px] text-on-surface-variant"
          >
            Column
          </span>
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
                label: `${column.name_en} (${column.name_ar})`,
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
        </>
      )}

      {selectedColumn && (
        <>
          <input
            data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DBREF.COLUMN_AR_INPUT.uuid}
            value={selectedColumn.name_ar}
            onChange={(e) => updateColumn({ name_ar: e.target.value })}
            placeholder="Column name_ar"
            className={inputClass}
          />
          <input
            data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DBREF.COLUMN_EN_INPUT.uuid}
            value={selectedColumn.name_en}
            onChange={(e) => updateColumn({ name_en: e.target.value })}
            placeholder="Column name_en"
            className={inputClass}
          />
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
        onClick={handleSave}
        disabled={saveStatus === 'saving'}
        className="rounded bg-secondary px-2 py-1.5 text-xs text-on-secondary disabled:opacity-60"
      >
        {saveLabel}
      </button>
    </section>
  );
}
