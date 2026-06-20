'use client';

import { useCallback, useState } from 'react';

import { remapStorageFolderName, remapStorageSubfolderName } from '../data/inspector-config-storage';
import { replaceStorageFolder, replaceStorageSubfolder } from '../data/storage-ref-utils';
import type { StorageCatalogNode, StorageFolder, StorageSubfolder } from '../data/storage-ref.types';
import {
  deleteStorageMainFile,
  deleteStorageSubFile,
  getStorageMainFile,
  getStorageSubFile,
  quickAddStorageMainFile,
  quickAddStorageSubFile,
} from '../domain/storage-domain';
import { linkStorageSubFileToDatabaseColumn } from '../domain/schema-relationship-domain';
import type { DatabaseColumnRef } from '../domain/domain-types';
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
    (next: typeof state.storageRef, folderRename?: { oldName: string; newName: string }, subRename?: { folderName: string; oldName: string; newName: string }) => {
      dispatch({ type: 'SET_STORAGE_REF', data: next });
      if (folderRename) {
        dispatch({
          type: 'PATCH_FORM_STATE',
          patch: remapStorageFolderName(state.formState, folderRename.oldName, folderRename.newName),
        });
      }
      if (subRename) {
        dispatch({
          type: 'PATCH_FORM_STATE',
          patch: remapStorageSubfolderName(
            state.formState,
            subRename.folderName,
            subRename.oldName,
            subRename.newName
          ),
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

  const saveSubFile = useCallback(
    async (mainName: string, originalSubName: string, nextSub: StorageSubfolder) => {
      const result = replaceStorageSubfolder(file, mainName, originalSubName, nextSub);
      if (result.error) {
        window.alert(result.error);
        return false;
      }
      const saved = await persistRef(result.file);
      if (!saved) return false;
      applyPersistedFile(
        result.file,
        undefined,
        originalSubName !== nextSub.name
          ? { folderName: mainName, oldName: originalSubName, newName: nextSub.name }
          : undefined
      );
      setSelectedNode({ level: 'sub', mainName, subName: nextSub.name });
      return true;
    },
    [applyPersistedFile, file, persistRef]
  );

  const addAndSaveMainFile = useCallback(async () => {
    const next = quickAddStorageMainFile(file);
    const added = next.folders[next.folders.length - 1];
    if (!added) return false;
    const saved = await persistRef(next, { message: STORAGE_QUICK_ADD_CONFIRM_MESSAGE });
    if (!saved) return false;
    applyPersistedFile(next);
    setSelectedNode({ level: 'main', mainName: added.name });
    return true;
  }, [applyPersistedFile, file, persistRef]);

  const addAndSaveSubFile = useCallback(
    async (mainName: string, anchor: { linkedDatabaseColumn: DatabaseColumnRef }) => {
      try {
        const next = quickAddStorageSubFile(file, mainName, anchor, state.databaseRef);
        const folder = next.folders.find((entry) => entry.name === mainName);
        const added = folder?.subfolders.at(-1);
        const saved = await persistRef(next, { message: STORAGE_QUICK_ADD_CONFIRM_MESSAGE });
        if (!saved || !added) return false;
        applyPersistedFile(next);
        setSelectedNode({ level: 'sub', mainName, subName: added.name });
        return true;
      } catch (error) {
        window.alert(error instanceof Error ? error.message : 'Storage sub file requires a database column anchor.');
        return false;
      }
    },
    [applyPersistedFile, file, persistRef, state.databaseRef]
  );

  const anchorLegacySubFile = useCallback(
    async (mainName: string, subName: string, column: DatabaseColumnRef) => {
      try {
        const next = linkStorageSubFileToDatabaseColumn(
          file,
          { storageMainFile: mainName, storageSubFile: subName },
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
      if (!window.confirm(`Delete main file "${mainName}" and all sub files?`)) return false;
      const next = deleteStorageMainFile(file, mainName);
      const saved = await persistRef(next);
      if (!saved) return false;
      applyPersistedFile(next);
      setSelectedNode(null);
      return true;
    },
    [applyPersistedFile, file, persistRef]
  );

  const removeSubFile = useCallback(
    async (mainName: string, subName: string) => {
      if (!window.confirm(`Delete sub file "${subName}"?`)) return false;
      const next = deleteStorageSubFile(file, mainName, subName);
      const saved = await persistRef(next);
      if (!saved) return false;
      applyPersistedFile(next);
      setSelectedNode({ level: 'main', mainName });
      return true;
    },
    [applyPersistedFile, file, persistRef]
  );

  const getSelectedMainFile = (): StorageFolder | undefined => {
    if (!selectedNode) return undefined;
    return getStorageMainFile(file, selectedNode.mainName) ?? undefined;
  };

  const getSelectedSubFile = (): StorageSubfolder | undefined => {
    if (!selectedNode || selectedNode.level !== 'sub') return undefined;
    return getStorageSubFile(file, selectedNode.mainName, selectedNode.subName) ?? undefined;
  };

  return {
    file,
    busy,
    selectedNode,
    selectedTreeId: selectedNode ? nodeToTreeId(selectedNode) : null,
    selectTreeId: (id: string) => setSelectedNode(treeIdToNode(id)),
    saveMainFile,
    saveSubFile,
    addAndSaveMainFile,
    addAndSaveSubFile,
    anchorLegacySubFile,
    removeMainFile,
    removeSubFile,
    getSelectedMainFile,
    getSelectedSubFile,
  };
}
