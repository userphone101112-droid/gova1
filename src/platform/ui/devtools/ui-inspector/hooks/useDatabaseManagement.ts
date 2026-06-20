'use client';

import { useCallback, useMemo, useState } from 'react';

import {
  addColumn,
  addDatabase,
  addTable,
  deleteColumn,
  deleteDatabase,
  deleteTable,
  cloneDatabaseRefFile,
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
  const [databaseNameEn, setDatabaseNameEn] = useState('');
  const [tableNameEn, setTableNameEn] = useState('');
  const [columnNameEn, setColumnNameEn] = useState('');
  const [dbDescriptionDraft, setDbDescriptionDraft] = useState('');
  const [tableDescriptionDraft, setTableDescriptionDraft] = useState('');
  const [columnDescriptionDraft, setColumnDescriptionDraft] = useState('');
  const [savingLevel, setSavingLevel] = useState<DatabaseRefLevel | null>(null);
  const [schemaBusy, setSchemaBusy] = useState(false);

  const databases = state.databaseRef.databases;
  const selectedDb = databases.find((db) => db.name_en === databaseNameEn);
  const tables = selectedDb?.tables ?? [];
  const selectedTable = tables.find((table) => table.name_en === tableNameEn);
  const columns = selectedTable?.columns ?? [];
  const selectedColumn = columns.find((column) => column.name_en === columnNameEn);

  const syncDescriptionDrafts = useCallback(
    (dbEn: string, tableEn: string, columnEn: string) => {
      const db = databases.find((entry) => entry.name_en === dbEn);
      const table = db?.tables.find((entry) => entry.name_en === tableEn);
      const column = table?.columns.find((entry) => entry.name_en === columnEn);
      setDbDescriptionDraft(getEntityDescription(db));
      setTableDescriptionDraft(getEntityDescription(table));
      setColumnDescriptionDraft(getEntityDescription(column));
    },
    [databases]
  );

  const selectDatabase = useCallback(
    (nameEn: string) => {
      setDatabaseNameEn(nameEn);
      setTableNameEn('');
      setColumnNameEn('');
      syncDescriptionDrafts(nameEn, '', '');
    },
    [syncDescriptionDrafts]
  );

  const selectTable = useCallback(
    (nameEn: string) => {
      setTableNameEn(nameEn);
      setColumnNameEn('');
      syncDescriptionDrafts(databaseNameEn, nameEn, '');
    },
    [databaseNameEn, syncDescriptionDrafts]
  );

  const selectColumn = useCallback(
    (nameEn: string) => {
      setColumnNameEn(nameEn);
      syncDescriptionDrafts(databaseNameEn, tableNameEn, nameEn);
    },
    [databaseNameEn, tableNameEn, syncDescriptionDrafts]
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
        if (renameMap.database?.newNameEn) {
          setDatabaseNameEn(renameMap.database.newNameEn);
        }
        if (renameMap.table?.newNameEn) {
          setTableNameEn(renameMap.table.newNameEn);
        }
        if (renameMap.column?.newNameEn) {
          setColumnNameEn(renameMap.column.newNameEn);
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
      if (!databaseNameEn) return;
      if (level === 'table' && !tableNameEn) return;
      if (level === 'column' && (!tableNameEn || !columnNameEn)) return;
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
            ? { databaseNameEn }
            : level === 'table'
              ? { databaseNameEn, tableNameEn }
              : { databaseNameEn, tableNameEn, columnNameEn };
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
      columnNameEn,
      databaseNameEn,
      dbDescriptionDraft,
      dispatch,
      state.databaseRef,
      tableDescriptionDraft,
      tableNameEn,
    ]
  );

  const handleAddDatabase = useCallback(async () => {
    const next = addDatabase(state.databaseRef);
    const added = next.databases[next.databases.length - 1];
    await persistRef(next, undefined, true);
    if (added) selectDatabase(added.name_en);
  }, [persistRef, selectDatabase, state.databaseRef]);

  const handleAddTable = useCallback(async () => {
    if (!databaseNameEn) return;
    const result = addTable(state.databaseRef, databaseNameEn);
    if (result.error) return;
    const table = result.file.databases.find((db) => db.name_en === databaseNameEn)?.tables.at(-1);
    await persistRef(result.file, undefined, true);
    if (table) selectTable(table.name_en);
  }, [databaseNameEn, persistRef, selectTable, state.databaseRef]);

  const handleAddColumn = useCallback(async () => {
    if (!databaseNameEn || !tableNameEn) return;
    const result = addColumn(state.databaseRef, databaseNameEn, tableNameEn);
    if (result.error) return;
    const column = result.file.databases
      .find((db) => db.name_en === databaseNameEn)
      ?.tables.find((table) => table.name_en === tableNameEn)
      ?.columns.at(-1);
    await persistRef(result.file, undefined, true);
    if (column) selectColumn(column.name_en);
  }, [databaseNameEn, persistRef, selectColumn, state.databaseRef, tableNameEn]);

  const handleRenameDatabase = useCallback(
    async (nextNameEn: string) => {
      if (!databaseNameEn) return;
      const trimmed = nextNameEn.trim();
      if (!trimmed || trimmed === databaseNameEn) return;
      const result = renameDatabase(state.databaseRef, databaseNameEn, trimmed);
      if (result.error) {
        window.alert(result.error);
        return;
      }
      const oldNameEn = databaseNameEn;
      await persistRef(result.file, { database: { oldNameEn, newNameEn: trimmed } }, true);
      setDatabaseNameEn(trimmed);
    },
    [databaseNameEn, persistRef, state.databaseRef]
  );

  const handleRenameTable = useCallback(
    async (nextNameEn: string) => {
      if (!databaseNameEn || !tableNameEn) return;
      const trimmed = nextNameEn.trim();
      if (!trimmed || trimmed === tableNameEn) return;
      const result = renameTable(state.databaseRef, databaseNameEn, tableNameEn, trimmed);
      if (result.error) {
        window.alert(result.error);
        return;
      }
      const oldNameEn = tableNameEn;
      await persistRef(result.file, { table: { oldNameEn, newNameEn: trimmed } }, true);
      setTableNameEn(trimmed);
    },
    [databaseNameEn, persistRef, state.databaseRef, tableNameEn]
  );

  const handleRenameColumn = useCallback(
    async (nextNameEn: string) => {
      if (!databaseNameEn || !tableNameEn || !columnNameEn) return;
      const trimmed = nextNameEn.trim();
      if (!trimmed || trimmed === columnNameEn) return;
      const result = renameColumn(state.databaseRef, databaseNameEn, tableNameEn, columnNameEn, trimmed);
      if (result.error) {
        window.alert(result.error);
        return;
      }
      const oldNameEn = columnNameEn;
      await persistRef(result.file, { column: { oldNameEn, newNameEn: trimmed } }, true);
      setColumnNameEn(trimmed);
    },
    [columnNameEn, databaseNameEn, persistRef, state.databaseRef, tableNameEn]
  );

  const handleDeleteDatabase = useCallback(async () => {
    if (!databaseNameEn || !selectedDb) return;
    if (!window.confirm(`Delete database "${selectedDb.name_en}" and all nested tables?`)) return;
    const next = deleteDatabase(state.databaseRef, databaseNameEn);
    await persistRef(next, undefined, true);
    selectDatabase('');
  }, [databaseNameEn, persistRef, selectDatabase, selectedDb, state.databaseRef]);

  const handleDeleteTable = useCallback(async () => {
    if (!databaseNameEn || !tableNameEn || !selectedTable) return;
    if (!window.confirm(`Delete table "${selectedTable.name_en}" and all columns?`)) return;
    const next = deleteTable(state.databaseRef, databaseNameEn, tableNameEn);
    await persistRef(next, undefined, true);
    selectTable('');
  }, [databaseNameEn, persistRef, selectTable, selectedTable, state.databaseRef, tableNameEn]);

  const handleDeleteColumn = useCallback(async () => {
    if (!databaseNameEn || !tableNameEn || !columnNameEn || !selectedColumn) return;
    if (!window.confirm(`Delete column "${selectedColumn.name_en}"?`)) return;
    const next = deleteColumn(state.databaseRef, databaseNameEn, tableNameEn, columnNameEn);
    await persistRef(next, undefined, true);
    selectColumn('');
  }, [
    columnNameEn,
    databaseNameEn,
    persistRef,
    selectColumn,
    selectedColumn,
    state.databaseRef,
    tableNameEn,
  ]);

  const updateNameAr = useCallback(
    async (level: DatabaseRefLevel, nameAr: string) => {
      if (!databaseNameEn) return;
      if (level === 'table' && !tableNameEn) return;
      if (level === 'column' && (!tableNameEn || !columnNameEn)) return;

      const next = cloneDatabaseRefFile(state.databaseRef);
      const dbIdx = next.databases.findIndex((db) => db.name_en === databaseNameEn);
      if (dbIdx < 0) return;

      if (level === 'database') {
        next.databases[dbIdx] = { ...next.databases[dbIdx], name_ar: nameAr };
      } else if (level === 'table') {
        const tableIdx = next.databases[dbIdx].tables.findIndex((table) => table.name_en === tableNameEn);
        if (tableIdx < 0) return;
        next.databases[dbIdx].tables[tableIdx] = {
          ...next.databases[dbIdx].tables[tableIdx],
          name_ar: nameAr,
        };
      } else {
        const tableIdx = next.databases[dbIdx].tables.findIndex((table) => table.name_en === tableNameEn);
        if (tableIdx < 0) return;
        const columnIdx = next.databases[dbIdx].tables[tableIdx].columns.findIndex(
          (column) => column.name_en === columnNameEn
        );
        if (columnIdx < 0) return;
        next.databases[dbIdx].tables[tableIdx].columns[columnIdx] = {
          ...next.databases[dbIdx].tables[tableIdx].columns[columnIdx],
          name_ar: nameAr,
        };
      }

      await persistRef(next, undefined, false);
    },
    [columnNameEn, databaseNameEn, persistRef, state.databaseRef, tableNameEn]
  );

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
    databaseNameEn,
    tableNameEn,
    columnNameEn,
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
    updateNameAr,
  };
}
