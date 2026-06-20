'use client';

import { useCallback, useMemo, useState } from 'react';

import {
  addColumn,
  addDatabase,
  addTable,
  deleteColumn,
  deleteDatabase,
  deleteTable,
  getEntityDescription,
  remapElementFieldNames,
  renameColumn,
  renameDatabase,
  renameTable,
  type RenameMap,
} from '../data/database-ref-utils';
import type { DatabaseRefFile, DatabaseRefLevel } from '../data/database-ref.types';
import { persistDatabaseRefFile, saveDatabaseRefDescription } from '../services/database-ref.service';
import { useInspectorContext } from '../state/InspectorProvider';

export function useDatabaseManagement() {
  const { state, dispatch } = useInspectorContext();
  const [databaseName, setDatabaseName] = useState('');
  const [tableName, setTableName] = useState('');
  const [columnName, setColumnName] = useState('');
  const [dbDescriptionDraft, setDbDescriptionDraft] = useState('');
  const [tableDescriptionDraft, setTableDescriptionDraft] = useState('');
  const [columnDescriptionDraft, setColumnDescriptionDraft] = useState('');
  const [savingLevel, setSavingLevel] = useState<DatabaseRefLevel | null>(null);
  const [schemaBusy, setSchemaBusy] = useState(false);

  const databases = state.databaseRef.databases;
  const selectedDb = databases.find((db) => db.name === databaseName);
  const tables = selectedDb?.tables ?? [];
  const selectedTable = tables.find((table) => table.name === tableName);
  const columns = selectedTable?.columns ?? [];
  const selectedColumn = columns.find((column) => column.name === columnName);

  const syncDescriptionDrafts = useCallback(
    (dbName: string, table: string, column: string) => {
      const db = databases.find((entry) => entry.name === dbName);
      const tableEntry = db?.tables.find((entry) => entry.name === table);
      const columnEntry = tableEntry?.columns.find((entry) => entry.name === column);
      setDbDescriptionDraft(getEntityDescription(db));
      setTableDescriptionDraft(getEntityDescription(tableEntry));
      setColumnDescriptionDraft(getEntityDescription(columnEntry));
    },
    [databases]
  );

  const selectDatabase = useCallback(
    (name: string) => {
      setDatabaseName(name);
      setTableName('');
      setColumnName('');
      syncDescriptionDrafts(name, '', '');
    },
    [syncDescriptionDrafts]
  );

  const selectTable = useCallback(
    (name: string) => {
      setTableName(name);
      setColumnName('');
      syncDescriptionDrafts(databaseName, name, '');
    },
    [databaseName, syncDescriptionDrafts]
  );

  const selectColumn = useCallback(
    (name: string) => {
      setColumnName(name);
      syncDescriptionDrafts(databaseName, tableName, name);
    },
    [databaseName, tableName, syncDescriptionDrafts]
  );

  const applyPersistedFile = useCallback(
    (next: DatabaseRefFile, renameMap?: RenameMap) => {
      dispatch({ type: 'SET_DATABASE_REF', data: next });
      dispatch({ type: 'SET_DATABASE_REF_DRAFT', data: next });
      if (renameMap) {
        dispatch({
          type: 'PATCH_FORM_STATE',
          patch: remapElementFieldNames(state.formState, renameMap),
        });
        if (renameMap.database?.newName) {
          setDatabaseName(renameMap.database.newName);
        }
        if (renameMap.table?.newName) {
          setTableName(renameMap.table.newName);
        }
        if (renameMap.column?.newName) {
          setColumnName(renameMap.column.newName);
        }
      }
    },
    [dispatch, state.formState]
  );

  const persistRef = useCallback(
    async (next: DatabaseRefFile, renameMap?: RenameMap, confirm = true) => {
      setSchemaBusy(true);
      try {
        const saved = await persistDatabaseRefFile(next, { confirm });
        if (!saved) return false;
        applyPersistedFile(next, renameMap);
        return true;
      } finally {
        setSchemaBusy(false);
      }
    },
    [applyPersistedFile]
  );

  const saveDescription = useCallback(
    async (level: DatabaseRefLevel) => {
      if (!databaseName) return;
      if (level === 'table' && !tableName) return;
      if (level === 'column' && (!tableName || !columnName)) return;
      setSavingLevel(level);
      try {
        const description =
          level === 'database'
            ? dbDescriptionDraft
            : level === 'table'
              ? tableDescriptionDraft
              : columnDescriptionDraft;
        const ids =
          level === 'database'
            ? { databaseName }
            : level === 'table'
              ? { databaseName, tableName }
              : { databaseName, tableName, columnName };
        const next = await saveDatabaseRefDescription(state.databaseRef, level, ids, description);
        if (!next) return;
        dispatch({ type: 'SET_DATABASE_REF', data: next });
        dispatch({ type: 'SET_DATABASE_REF_DRAFT', data: next });
      } finally {
        setSavingLevel(null);
      }
    },
    [
      columnDescriptionDraft,
      columnName,
      databaseName,
      dbDescriptionDraft,
      dispatch,
      state.databaseRef,
      tableDescriptionDraft,
      tableName,
    ]
  );

  const handleAddDatabase = useCallback(async () => {
    const next = addDatabase(state.databaseRef);
    const added = next.databases[next.databases.length - 1];
    await persistRef(next, undefined, true);
    if (added) selectDatabase(added.name);
  }, [persistRef, selectDatabase, state.databaseRef]);

  const handleAddTable = useCallback(async () => {
    if (!databaseName) return;
    const result = addTable(state.databaseRef, databaseName);
    if (result.error) return;
    const table = result.file.databases.find((db) => db.name === databaseName)?.tables.at(-1);
    await persistRef(result.file, undefined, true);
    if (table) selectTable(table.name);
  }, [databaseName, persistRef, selectTable, state.databaseRef]);

  const handleAddColumn = useCallback(async () => {
    if (!databaseName || !tableName) return;
    const result = addColumn(state.databaseRef, databaseName, tableName);
    if (result.error) return;
    const column = result.file.databases
      .find((db) => db.name === databaseName)
      ?.tables.find((table) => table.name === tableName)
      ?.columns.at(-1);
    await persistRef(result.file, undefined, true);
    if (column) selectColumn(column.name);
  }, [databaseName, persistRef, selectColumn, state.databaseRef, tableName]);

  const handleRenameDatabase = useCallback(
    async (nextName: string) => {
      if (!databaseName) return;
      const trimmed = nextName.trim();
      if (!trimmed || trimmed === databaseName) return;
      const result = renameDatabase(state.databaseRef, databaseName, trimmed);
      if (result.error) {
        window.alert(result.error);
        return;
      }
      const oldName = databaseName;
      await persistRef(result.file, { database: { oldName, newName: trimmed } }, true);
      setDatabaseName(trimmed);
    },
    [databaseName, persistRef, state.databaseRef]
  );

  const handleRenameTable = useCallback(
    async (nextName: string) => {
      if (!databaseName || !tableName) return;
      const trimmed = nextName.trim();
      if (!trimmed || trimmed === tableName) return;
      const result = renameTable(state.databaseRef, databaseName, tableName, trimmed);
      if (result.error) {
        window.alert(result.error);
        return;
      }
      const oldName = tableName;
      await persistRef(result.file, { table: { oldName, newName: trimmed } }, true);
      setTableName(trimmed);
    },
    [databaseName, persistRef, state.databaseRef, tableName]
  );

  const handleRenameColumn = useCallback(
    async (nextName: string) => {
      if (!databaseName || !tableName || !columnName) return;
      const trimmed = nextName.trim();
      if (!trimmed || trimmed === columnName) return;
      const result = renameColumn(state.databaseRef, databaseName, tableName, columnName, trimmed);
      if (result.error) {
        window.alert(result.error);
        return;
      }
      const oldName = columnName;
      await persistRef(result.file, { column: { oldName, newName: trimmed } }, true);
      setColumnName(trimmed);
    },
    [columnName, databaseName, persistRef, state.databaseRef, tableName]
  );

  const handleDeleteDatabase = useCallback(async () => {
    if (!databaseName || !selectedDb) return;
    if (!window.confirm(`Delete database "${selectedDb.name}" and all nested tables?`)) return;
    const next = deleteDatabase(state.databaseRef, databaseName);
    await persistRef(next, undefined, true);
    selectDatabase('');
  }, [databaseName, persistRef, selectDatabase, selectedDb, state.databaseRef]);

  const handleDeleteTable = useCallback(async () => {
    if (!databaseName || !tableName || !selectedTable) return;
    if (!window.confirm(`Delete table "${selectedTable.name}" and all columns?`)) return;
    const next = deleteTable(state.databaseRef, databaseName, tableName);
    await persistRef(next, undefined, true);
    selectTable('');
  }, [databaseName, persistRef, selectTable, selectedTable, state.databaseRef, tableName]);

  const handleDeleteColumn = useCallback(async () => {
    if (!databaseName || !tableName || !columnName || !selectedColumn) return;
    if (!window.confirm(`Delete column "${selectedColumn.name}"?`)) return;
    const next = deleteColumn(state.databaseRef, databaseName, tableName, columnName);
    await persistRef(next, undefined, true);
    selectColumn('');
  }, [
    columnName,
    databaseName,
    persistRef,
    selectColumn,
    selectedColumn,
    state.databaseRef,
    tableName,
  ]);

  const previewDescriptions = useMemo(
    () => ({
      database: selectedDb ? getEntityDescription(selectedDb) : '',
      table: selectedTable ? getEntityDescription(selectedTable) : '',
      column: selectedColumn ? getEntityDescription(selectedColumn) : '',
    }),
    [selectedColumn, selectedDb, selectedTable]
  );

  return {
    databases,
    tables,
    columns,
    selectedDb,
    selectedTable,
    selectedColumn,
    databaseName,
    tableName,
    columnName,
    dbDescriptionDraft,
    tableDescriptionDraft,
    columnDescriptionDraft,
    setDbDescriptionDraft,
    setTableDescriptionDraft,
    setColumnDescriptionDraft,
    selectDatabase,
    selectTable,
    selectColumn,
    saveDescription,
    savingLevel,
    schemaBusy,
    previewDescriptions,
    handleAddDatabase,
    handleAddTable,
    handleAddColumn,
    handleRenameDatabase,
    handleRenameTable,
    handleRenameColumn,
    handleDeleteDatabase,
    handleDeleteTable,
    handleDeleteColumn,
  };
}
