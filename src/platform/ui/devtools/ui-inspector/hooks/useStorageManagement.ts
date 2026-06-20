'use client';

import { useCallback, useEffect, useState } from 'react';

import {
  remapStorageFolderName,
  remapStorageSubfolderName,
} from '../data/inspector-config-storage';
import {
  addStorageFolder as addFolderToFile,
  addStorageSubfolder as addSubToFile,
  deleteStorageFolder as deleteFolderFromFile,
  deleteStorageSubfolder as deleteSubFromFile,
  renameStorageFolder,
  renameStorageSubfolder,
  updateStorageFolderDescription,
  updateStorageSubfolderDescription,
} from '../data/storage-ref-utils';
import { persistStorageRefFile } from '../services/storage-ref.service';
import { useInspectorContext } from '../state/InspectorProvider';
import { STORAGE_DESCRIPTION_SAVE_CONFIRM_MESSAGE } from '../utils/constants';

export function useStorageManagement() {
  const { state, dispatch } = useInspectorContext();
  const [mainFileName, setMainFileName] = useState('');
  const [subFileName, setSubFileName] = useState('');
  const [mainDescriptionDraft, setMainDescriptionDraft] = useState('');
  const [subDescriptionDraft, setSubDescriptionDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [savingDescription, setSavingDescription] = useState<'main' | 'sub' | null>(null);

  const folders = state.storageRef.folders;
  const selectedFolder = folders.find((folder) => folder.name === mainFileName);
  const subfolders = selectedFolder?.subfolders ?? [];
  const selectedSubfolder = subfolders.find((sub) => sub.name === subFileName);

  useEffect(() => {
    setMainDescriptionDraft(selectedFolder?.description ?? '');
  }, [mainFileName, selectedFolder?.description, selectedFolder?.name]);

  useEffect(() => {
    setSubDescriptionDraft(selectedSubfolder?.description ?? '');
  }, [subFileName, selectedSubfolder?.description, selectedSubfolder?.name]);

  const persistRef = useCallback(
    async (next: typeof state.storageRef, confirm = true, message?: string) => {
      setBusy(true);
      try {
        const saved = await persistStorageRefFile(
          next,
          message ? { confirm, message } : { confirm }
        );
        if (!saved) return false;
        dispatch({ type: 'SET_STORAGE_REF', data: next });
        return true;
      } finally {
        setBusy(false);
      }
    },
    [dispatch]
  );

  const applyFolderRenameToForm = useCallback(
    (oldName: string, newName: string) => {
      dispatch({
        type: 'PATCH_FORM_STATE',
        patch: remapStorageFolderName(state.formState, oldName, newName),
      });
    },
    [dispatch, state.formState]
  );

  const applySubRenameToForm = useCallback(
    (folderName: string, oldName: string, newName: string) => {
      dispatch({
        type: 'PATCH_FORM_STATE',
        patch: remapStorageSubfolderName(state.formState, folderName, oldName, newName),
      });
    },
    [dispatch, state.formState]
  );

  const handleAddMainFile = useCallback(async () => {
    const next = addFolderToFile(state.storageRef);
    const added = next.folders[next.folders.length - 1];
    await persistRef(next, true);
    if (added) setMainFileName(added.name);
  }, [persistRef, state.storageRef]);

  const handleAddSubFile = useCallback(async () => {
    if (!mainFileName) return;
    const next = addSubToFile(state.storageRef, mainFileName);
    const folder = next.folders.find((entry) => entry.name === mainFileName);
    const added = folder?.subfolders.at(-1);
    await persistRef(next, true);
    if (added) setSubFileName(added.name);
  }, [mainFileName, persistRef, state.storageRef]);

  const handleRenameMainFile = useCallback(
    async (nextName: string) => {
      if (!mainFileName) return;
      const trimmed = nextName.trim();
      if (!trimmed || trimmed === mainFileName) return;
      const result = renameStorageFolder(state.storageRef, mainFileName, trimmed);
      if (result.error) {
        window.alert(result.error);
        return;
      }
      const oldName = mainFileName;
      await persistRef(result.file, true);
      applyFolderRenameToForm(oldName, trimmed);
      setMainFileName(trimmed);
    },
    [applyFolderRenameToForm, mainFileName, persistRef, state.storageRef]
  );

  const handleRenameSubFile = useCallback(
    async (nextName: string) => {
      if (!mainFileName || !subFileName) return;
      const trimmed = nextName.trim();
      if (!trimmed || trimmed === subFileName) return;
      const result = renameStorageSubfolder(state.storageRef, mainFileName, subFileName, trimmed);
      if (result.error) {
        window.alert(result.error);
        return;
      }
      const oldName = subFileName;
      await persistRef(result.file, true);
      applySubRenameToForm(mainFileName, oldName, trimmed);
      setSubFileName(trimmed);
    },
    [applySubRenameToForm, mainFileName, persistRef, state.storageRef, subFileName]
  );

  const handleDeleteMainFile = useCallback(async () => {
    if (!mainFileName || !selectedFolder) return;
    if (!window.confirm(`Delete main file "${selectedFolder.name}" and all sub files?`)) return;
    const next = deleteFolderFromFile(state.storageRef, mainFileName);
    await persistRef(next, true);
    setMainFileName('');
    setSubFileName('');
  }, [mainFileName, persistRef, selectedFolder, state.storageRef]);

  const handleDeleteSubFile = useCallback(async () => {
    if (!mainFileName || !subFileName || !selectedSubfolder) return;
    if (!window.confirm(`Delete sub file "${selectedSubfolder.name}"?`)) return;
    const next = deleteSubFromFile(state.storageRef, mainFileName, subFileName);
    await persistRef(next, true);
    setSubFileName('');
  }, [mainFileName, persistRef, selectedSubfolder, state.storageRef, subFileName]);

  const saveMainDescription = useCallback(async () => {
    if (!mainFileName) return;
    setSavingDescription('main');
    try {
      const next = updateStorageFolderDescription(state.storageRef, mainFileName, mainDescriptionDraft);
      await persistRef(next, true, STORAGE_DESCRIPTION_SAVE_CONFIRM_MESSAGE);
    } finally {
      setSavingDescription(null);
    }
  }, [mainDescriptionDraft, mainFileName, persistRef, state.storageRef]);

  const saveSubDescription = useCallback(async () => {
    if (!mainFileName || !subFileName) return;
    setSavingDescription('sub');
    try {
      const next = updateStorageSubfolderDescription(
        state.storageRef,
        mainFileName,
        subFileName,
        subDescriptionDraft
      );
      await persistRef(next, true, STORAGE_DESCRIPTION_SAVE_CONFIRM_MESSAGE);
    } finally {
      setSavingDescription(null);
    }
  }, [mainFileName, persistRef, state.storageRef, subDescriptionDraft, subFileName]);

  return {
    folders,
    subfolders,
    selectedFolder,
    selectedSubfolder,
    mainFileName,
    subFileName,
    mainDescriptionDraft,
    subDescriptionDraft,
    setMainFileName,
    setSubFileName,
    setMainDescriptionDraft,
    setSubDescriptionDraft,
    busy,
    savingDescription,
    handleAddMainFile,
    handleAddSubFile,
    handleRenameMainFile,
    handleRenameSubFile,
    handleDeleteMainFile,
    handleDeleteSubFile,
    saveMainDescription,
    saveSubDescription,
  };
}
