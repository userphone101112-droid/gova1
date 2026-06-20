'use client';

import { useCallback, useState } from 'react';

import { remapStorageFolderName } from '../data/inspector-config-storage';
import { replaceStorageFolder } from '../data/storage-ref-utils';
import type { StorageCatalogNode, StorageFolder } from '../data/storage-ref.types';
import type { DatabaseColumnRef } from '../domain/domain-types';
import { linkStorageMainFileToDatabaseColumn } from '../domain/schema-relationship-domain';
import {
  deleteStorageMainFile,
  getStorageMainFile,
  quickAddStorageMainFile,
} from '../domain/storage-domain';
import { persistStorageRefFile } from '../services/storage-ref.service';
import { useInspectorContext } from '../state/InspectorProvider';
import {
  STORAGE_CATALOG_SAVE_CONFIRM_MESSAGE,
  STORAGE_QUICK_ADD_CONFIRM_MESSAGE,
} from '../utils/constants';

export function nodeToTreeId(node: StorageCatalogNode): string {
  if (node.level === 'main') return `main:${node.mainName}`;
  return `sub:${node.mainName}:${node.subName}`;
}

export function treeIdToNode(id: string): StorageCatalogNode | null {
  if (id.startsWith('main:')) {
    return { level: 'main', mainName: id.slice(5) };
  }
  if (id.startsWith('sub:')) {
    const [, mainName, subName] = id.split(':');
    if (!mainName || !subName) return null;
    return { level: 'sub', mainName, subName };
  }
  return null;
}

export function useStorageCatalog() {
  const { state, dispatch } = useInspectorContext();
  const [selectedNode, setSelectedNode] = useState<StorageCatalogNode | null>(null);
  const [busy, setBusy] = useState(false);

  const file = state.storageRef;

  const applyPersistedFile = useCallback(
    (next: typeof state.storageRef, folderRename?: { oldName: string; newName: string }) => {
      dispatch({ type: 'SET_STORAGE_REF', data: next });
      if (folderRename) {
        dispatch({
          type: 'PATCH_FORM_STATE',
          patch: remapStorageFolderName(state.formState, folderRename.oldName, folderRename.newName),
        });
      }
    },
    [dispatch, state.formState]
  );

  const persistRef = useCallback(
    async (next: typeof state.storageRef, options?: { confirm?: boolean; message?: string }) => {
      setBusy(true);
      try {
        const saved = await persistStorageRefFile(next, {
          confirm: options?.confirm ?? true,
          message: options?.message ?? STORAGE_CATALOG_SAVE_CONFIRM_MESSAGE,
        });
        if (!saved) return false;
        return true;
      } finally {
        setBusy(false);
      }
    },
    []
  );

  const saveMainFile = useCallback(
    async (originalName: string, nextFolder: StorageFolder) => {
      const result = replaceStorageFolder(file, originalName, nextFolder);
      if (result.error) {
        window.alert(result.error);
        return false;
      }
      const saved = await persistRef(result.file);
      if (!saved) return false;
      applyPersistedFile(
        result.file,
        originalName !== nextFolder.name ? { oldName: originalName, newName: nextFolder.name } : undefined
      );
      setSelectedNode({ level: 'main', mainName: nextFolder.name });
      return true;
    },
    [applyPersistedFile, file, persistRef]
  );

  const addAndSaveMainFile = useCallback(
    async (anchor: { linkedDatabaseColumn: DatabaseColumnRef }) => {
      try {
        const next = quickAddStorageMainFile(file, anchor, state.databaseRef);
        const added = next.folders[next.folders.length - 1];
        if (!added) return false;
        const saved = await persistRef(next, { message: STORAGE_QUICK_ADD_CONFIRM_MESSAGE });
        if (!saved) return false;
        applyPersistedFile(next);
        setSelectedNode({ level: 'main', mainName: added.name });
        return true;
      } catch (error) {
        window.alert(error instanceof Error ? error.message : 'Storage main file requires a database column anchor.');
        return false;
      }
    },
    [applyPersistedFile, file, persistRef, state.databaseRef]
  );

  const anchorLegacyMainFile = useCallback(
    async (mainName: string, column: DatabaseColumnRef) => {
      try {
        const next = linkStorageMainFileToDatabaseColumn(
          file,
          { storageMainFile: mainName },
          column,
          state.databaseRef
        );
        const saved = await persistRef(next);
        if (!saved) return false;
        applyPersistedFile(next);
        return true;
      } catch (error) {
        window.alert(error instanceof Error ? error.message : 'Failed to anchor storage location.');
        return false;
      }
    },
    [applyPersistedFile, file, persistRef, state.databaseRef]
  );

  const removeMainFile = useCallback(
    async (mainName: string) => {
      if (!window.confirm(`Delete main file "${mainName}"?`)) return false;
      const next = deleteStorageMainFile(file, mainName);
      const saved = await persistRef(next);
      if (!saved) return false;
      applyPersistedFile(next);
      setSelectedNode(null);
      return true;
    },
    [applyPersistedFile, file, persistRef]
  );

  const getSelectedMainFile = (): StorageFolder | undefined => {
    if (!selectedNode) return undefined;
    return getStorageMainFile(file, selectedNode.mainName) ?? undefined;
  };

  return {
    file,
    busy,
    selectedNode,
    selectedTreeId: selectedNode ? nodeToTreeId(selectedNode) : null,
    selectTreeId: (id: string) => setSelectedNode(treeIdToNode(id)),
    saveMainFile,
    addAndSaveMainFile,
    anchorLegacyMainFile,
    removeMainFile,
    getSelectedMainFile,
  };
}
