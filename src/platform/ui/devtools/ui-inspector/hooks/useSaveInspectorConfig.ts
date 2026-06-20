'use client';

import { useCallback } from 'react';

import {
  mergeSavedEntry,
  saveInspectorElementConfig,
} from '../services/inspector-config.service';
import { useInspectorContext } from '../state/InspectorProvider';
import { saveStatusLabel } from '../utils/format';

export function useSaveInspectorConfig() {
  const { state, dispatch, selectors } = useInspectorContext();
  const selected = selectors.selected;

  const saveLabel = saveStatusLabel(state.saveStatus, 'Save data');

  const saveElementConfig = useCallback(async () => {
    if (!selected) return;
    dispatch({ type: 'SET_SAVE_STATUS', status: 'saving' });
    try {
      const result = await saveInspectorElementConfig(selected, state.formState, {
        confirm: true,
        databaseRef: state.databaseRef,
        route: state.routePath,
      });
      if (!result.saved || !result.storageKey || !result.entry) {
        dispatch({ type: 'SET_SAVE_STATUS', status: 'idle' });
        return;
      }
      dispatch({
        type: 'MERGE_INSPECTOR_ENTRY',
        storageKey: result.storageKey,
        entry: result.entry,
      });
      dispatch({ type: 'SET_SAVE_STATUS', status: 'saved' });
      dispatch({ type: 'SET_DATABASE_PANEL_PINNED', pinned: false });
      window.setTimeout(() => dispatch({ type: 'SET_SAVE_STATUS', status: 'idle' }), 2000);
    } catch {
      dispatch({ type: 'SET_SAVE_STATUS', status: 'error' });
      window.setTimeout(() => dispatch({ type: 'SET_SAVE_STATUS', status: 'idle' }), 2000);
    }
  }, [dispatch, selected, state.formState]);

  return {
    saveLabel,
    saveStatus: state.saveStatus,
    saveElementConfig,
    canSave: Boolean(selected),
  };
}

// keep merge export for tests
export { mergeSavedEntry };
