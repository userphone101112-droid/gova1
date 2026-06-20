'use client';

import { useCallback } from 'react';

import { saveDatabaseRefFile } from '../services/database-ref.service';
import { useInspectorContext } from '../state/InspectorProvider';
import { saveStatusLabel } from '../utils/format';

export function useDatabaseRefEditor() {
  const { state, dispatch } = useInspectorContext();

  const saveLabel = saveStatusLabel(state.refSaveStatus, 'Save database_ref.json');

  const setDraft = useCallback(
    (next: typeof state.databaseRefDraft) => {
      dispatch({ type: 'SET_DATABASE_REF_DRAFT', data: next });
    },
    [dispatch]
  );

  const saveDraft = useCallback(async () => {
    dispatch({ type: 'SET_REF_SAVE_STATUS', status: 'saving' });
    try {
      const saved = await saveDatabaseRefFile(state.databaseRefDraft, { confirm: true });
      if (!saved) {
        dispatch({ type: 'SET_REF_SAVE_STATUS', status: 'idle' });
        return;
      }
      dispatch({ type: 'SET_DATABASE_REF', data: state.databaseRefDraft });
      dispatch({ type: 'SET_REF_SAVE_STATUS', status: 'saved' });
      window.setTimeout(() => dispatch({ type: 'SET_REF_SAVE_STATUS', status: 'idle' }), 2000);
    } catch {
      dispatch({ type: 'SET_REF_SAVE_STATUS', status: 'error' });
      window.setTimeout(() => dispatch({ type: 'SET_REF_SAVE_STATUS', status: 'idle' }), 2000);
    }
  }, [dispatch, state.databaseRefDraft]);

  return {
    draft: state.databaseRefDraft,
    saveLabel,
    saveStatus: state.refSaveStatus,
    setDraft,
    saveDraft,
  };
}
