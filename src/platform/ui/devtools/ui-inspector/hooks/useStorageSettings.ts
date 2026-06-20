'use client';

import { useCallback } from 'react';

import { useInspectorContext } from '../state/InspectorProvider';

export function useStorageSettings() {
  const { state, dispatch, selectors } = useInspectorContext();
  const storage = selectors.storage;

  const handleStorageToggle = useCallback(() => {
    const nextEnabled = !state.formState.storageEnabled;
    if (nextEnabled) {
      dispatch({ type: 'SET_DATABASE_PANEL_PINNED', pinned: true });
      dispatch({ type: 'SET_EXPANDED', expanded: { elementBindings: true } });
    }
    dispatch({
      type: 'PATCH_FORM_STATE',
      patch: { storageEnabled: nextEnabled },
    });
  }, [dispatch, state.formState.storageEnabled]);

  const setMainFile = useCallback(
    (storageMainFile: string) => {
      dispatch({
        type: 'PATCH_FORM_STATE',
        patch: { storageMainFile, storageSubFile: '' },
      });
    },
    [dispatch]
  );

  const setSubFile = useCallback(
    (storageSubFile: string) => {
      dispatch({ type: 'PATCH_FORM_STATE', patch: { storageSubFile } });
    },
    [dispatch]
  );

  return {
    formState: state.formState,
    folders: storage?.folders ?? [],
    subfolderOptions: storage?.subfolderOptions ?? [],
    handleStorageToggle,
    setMainFile,
    setSubFile,
  };
}
