'use client';

import { useCallback, useState } from 'react';

import { replaceColumn, replaceDatabase, replaceTable } from '../data/database-ref-utils';
import type {
  DatabaseCatalogNode,
  DatabaseRefColumn,
  DatabaseRefDatabase,
  DatabaseRefFile,
  DatabaseRefTable,
} from '../data/database-ref.types';
import {
  deleteColumnFromRef,
  deleteDatabaseFromRef,
  deleteTableFromRef,
  getColumn,
  getDatabase,
  getTable,
  quickAddColumn,
  quickAddDatabase,
  quickAddTable,
  remapDatabaseBindingsInForm,
  type DatabaseBindingRenameMap,
} from '../domain/database-domain';
import { persistDatabaseRefFile } from '../services/database-ref.service';
import { useInspectorContext } from '../state/InspectorProvider';
import {
  DATABASE_CATALOG_SAVE_CONFIRM_MESSAGE,
  DATABASE_QUICK_ADD_CONFIRM_MESSAGE,
} from '../utils/constants';

export function nodeToTreeId(node: DatabaseCatalogNode): string {
  if (node.level === 'database') return `db:${node.databaseName}`;
  if (node.level === 'table') return `table:${node.databaseName}:${node.tableName}`;
  return `col:${node.databaseName}:${node.tableName}:${node.columnName}`;
}

export function treeIdToNode(id: string): DatabaseCatalogNode | null {
  if (id.startsWith('db:')) {
    return { level: 'database', databaseName: id.slice(3) };
  }
  if (id.startsWith('table:')) {
    const [, databaseName, tableName] = id.split(':');
    if (!databaseName || !tableName) return null;
    return { level: 'table', databaseName, tableName };
  }
  if (id.startsWith('col:')) {
    const [, databaseName, tableName, columnName] = id.split(':');
    if (!databaseName || !tableName || !columnName) return null;
    return { level: 'column', databaseName, tableName, columnName };
  }
  return null;
}

export function useDatabaseCatalog() {
  const { state, dispatch } = useInspectorContext();
  const [selectedNode, setSelectedNode] = useState<DatabaseCatalogNode | null>(null);
  const [busy, setBusy] = useState(false);

  const file = state.databaseRef;

  const applyPersistedFile = useCallback(
    (next: DatabaseRefFile, renameMap?: DatabaseBindingRenameMap) => {
      dispatch({ type: 'SET_DATABASE_REF', data: next });
      dispatch({ type: 'SET_DATABASE_REF_DRAFT', data: next });
      if (renameMap) {
        dispatch({
          type: 'PATCH_FORM_STATE',
          patch: remapDatabaseBindingsInForm(state.formState, renameMap),
        });
      }
    },
    [dispatch, state.formState]
  );

  const persistRef = useCallback(
    async (next: DatabaseRefFile, options?: { confirm?: boolean; message?: string; renameMap?: DatabaseBindingRenameMap }) => {
      setBusy(true);
      try {
        const saved = await persistDatabaseRefFile(next, {
          confirm: options?.confirm ?? true,
          message: options?.message ?? DATABASE_CATALOG_SAVE_CONFIRM_MESSAGE,
        });
        if (!saved) return false;
        applyPersistedFile(next, options?.renameMap);
        return true;
      } finally {
        setBusy(false);
      }
    },
    [applyPersistedFile]
  );

  const saveDatabase = useCallback(
    async (originalName: string, nextDatabase: DatabaseRefDatabase) => {
      const result = replaceDatabase(file, originalName, nextDatabase);
      if (result.error) {
        window.alert(result.error);
        return false;
      }
      const renameMap: DatabaseBindingRenameMap | undefined =
        originalName !== nextDatabase.name
          ? { database: { oldName: originalName, newName: nextDatabase.name } }
          : undefined;
      const saved = await persistRef(result.file, renameMap ? { renameMap } : {});
      if (saved) {
        setSelectedNode({ level: 'database', databaseName: nextDatabase.name });
      }
      return saved;
    },
    [file, persistRef]
  );

  const saveTable = useCallback(
    async (databaseName: string, originalTableName: string, nextTable: DatabaseRefTable) => {
      const result = replaceTable(file, databaseName, originalTableName, nextTable);
      if (result.error) {
        window.alert(result.error);
        return false;
      }
      const renameMap: DatabaseBindingRenameMap | undefined =
        originalTableName !== nextTable.name
          ? { table: { oldName: originalTableName, newName: nextTable.name } }
          : undefined;
      const saved = await persistRef(result.file, renameMap ? { renameMap } : {});
      if (saved) {
        setSelectedNode({ level: 'table', databaseName, tableName: nextTable.name });
      }
      return saved;
    },
    [file, persistRef]
  );

  const saveColumn = useCallback(
    async (
      databaseName: string,
      tableName: string,
      originalColumnName: string,
      nextColumn: DatabaseRefColumn
    ) => {
      const result = replaceColumn(file, databaseName, tableName, originalColumnName, nextColumn);
      if (result.error) {
        window.alert(result.error);
        return false;
      }
      const renameMap: DatabaseBindingRenameMap | undefined =
        originalColumnName !== nextColumn.name
          ? { column: { oldName: originalColumnName, newName: nextColumn.name } }
          : undefined;
      const saved = await persistRef(result.file, renameMap ? { renameMap } : {});
      if (saved) {
        setSelectedNode({
          level: 'column',
          databaseName,
          tableName,
          columnName: nextColumn.name,
        });
      }
      return saved;
    },
    [file, persistRef]
  );

  const addAndSaveDatabase = useCallback(async () => {
    const next = quickAddDatabase(file);
    const added = next.databases[next.databases.length - 1];
    if (!added) return false;
    const saved = await persistRef(next, { message: DATABASE_QUICK_ADD_CONFIRM_MESSAGE });
    if (saved) setSelectedNode({ level: 'database', databaseName: added.name });
    return saved;
  }, [file, persistRef]);

  const addAndSaveTable = useCallback(
    async (databaseName: string) => {
      try {
        const next = quickAddTable(file, databaseName);
        const table = next.databases.find((db) => db.name === databaseName)?.tables.at(-1);
        const saved = await persistRef(next, { message: DATABASE_QUICK_ADD_CONFIRM_MESSAGE });
        if (saved && table) {
          setSelectedNode({ level: 'table', databaseName, tableName: table.name });
        }
        return saved;
      } catch (error) {
        window.alert(error instanceof Error ? error.message : 'Failed to add table.');
        return false;
      }
    },
    [file, persistRef]
  );

  const addAndSaveColumn = useCallback(
    async (databaseName: string, tableName: string) => {
      try {
        const next = quickAddColumn(file, databaseName, tableName);
        const column = next.databases
          .find((db) => db.name === databaseName)
          ?.tables.find((table) => table.name === tableName)
          ?.columns.at(-1);
        const saved = await persistRef(next, { message: DATABASE_QUICK_ADD_CONFIRM_MESSAGE });
        if (saved && column) {
          setSelectedNode({ level: 'column', databaseName, tableName, columnName: column.name });
        }
        return saved;
      } catch (error) {
        window.alert(error instanceof Error ? error.message : 'Failed to add column.');
        return false;
      }
    },
    [file, persistRef]
  );

  const removeDatabase = useCallback(
    async (databaseName: string) => {
      if (!window.confirm(`Delete database "${databaseName}" and all nested tables?`)) return false;
      try {
        const next = deleteDatabaseFromRef(file, databaseName);
        const saved = await persistRef(next);
        if (saved) setSelectedNode(null);
        return saved;
      } catch (error) {
        window.alert(error instanceof Error ? error.message : 'Failed to delete database.');
        return false;
      }
    },
    [file, persistRef]
  );

  const removeTable = useCallback(
    async (databaseName: string, tableName: string) => {
      if (!window.confirm(`Delete table "${tableName}" and all columns?`)) return false;
      const next = deleteTableFromRef(file, databaseName, tableName);
      const saved = await persistRef(next);
      if (saved) setSelectedNode({ level: 'database', databaseName });
      return saved;
    },
    [file, persistRef]
  );

  const removeColumn = useCallback(
    async (databaseName: string, tableName: string, columnName: string) => {
      if (!window.confirm(`Delete column "${columnName}"?`)) return false;
      const next = deleteColumnFromRef(file, databaseName, tableName, columnName);
      const saved = await persistRef(next);
      if (saved) setSelectedNode({ level: 'table', databaseName, tableName });
      return saved;
    },
    [file, persistRef]
  );

  const getSelectedDatabase = (): DatabaseRefDatabase | undefined => {
    if (!selectedNode) return undefined;
    return getDatabase(file, selectedNode.databaseName) ?? undefined;
  };

  const getSelectedTable = (): DatabaseRefTable | undefined => {
    if (!selectedNode || selectedNode.level === 'database') return undefined;
    return getTable(file, selectedNode.databaseName, selectedNode.tableName) ?? undefined;
  };

  const getSelectedColumn = (): DatabaseRefColumn | undefined => {
    if (!selectedNode || selectedNode.level !== 'column') return undefined;
    return getColumn(file, selectedNode.databaseName, selectedNode.tableName, selectedNode.columnName) ?? undefined;
  };

  return {
    file,
    busy,
    selectedNode,
    setSelectedNode,
    selectTreeId: (id: string) => setSelectedNode(treeIdToNode(id)),
    selectedTreeId: selectedNode ? nodeToTreeId(selectedNode) : null,
    saveDatabase,
    saveTable,
    saveColumn,
    addAndSaveDatabase,
    addAndSaveTable,
    addAndSaveColumn,
    removeDatabase,
    removeTable,
    removeColumn,
    getSelectedDatabase,
    getSelectedTable,
    getSelectedColumn,
    featureOptions: Array.from(new Set(state.elements.map((el) => el.feature).filter(Boolean))).sort(),
  };
}
