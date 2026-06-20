'use client';

import { useCallback } from 'react';

import { useInspectorContext } from '../state/InspectorProvider';

export function useDatabaseSettings() {
  const { state, dispatch, selectors } = useInspectorContext();
  const database = selectors.database;

  const handleDatabaseToggle = useCallback(() => {
    const nextEnabled = !state.formState.databaseEnabled;
    if (nextEnabled) {
      dispatch({ type: 'SET_DATABASE_PANEL_PINNED', pinned: true });
      dispatch({ type: 'SET_EXPANDED', expanded: { dbAttributes: true } });
    }
    dispatch({
      type: 'PATCH_FORM_STATE',
      patch: { databaseEnabled: nextEnabled },
    });
  }, [dispatch, state.formState.databaseEnabled]);

  const setDatabaseId = useCallback(
    (databaseId: string) => {
      dispatch({
        type: 'PATCH_FORM_STATE',
        patch: { inf1: databaseId, inf2: '', inf3: '' },
      });
    },
    [dispatch]
  );

  const setTableId = useCallback(
    (tableId: string) => {
      dispatch({
        type: 'PATCH_FORM_STATE',
        patch: { inf2: tableId, inf3: '' },
      });
    },
    [dispatch]
  );

  const setFieldId = useCallback(
    (fieldId: string) => {
      dispatch({ type: 'PATCH_FORM_STATE', patch: { inf3: fieldId } });
    },
    [dispatch]
  );

  return {
    formState: state.formState,
    databaseRef: state.databaseRef,
    tableOptions: database?.tableOptions ?? [],
    columnOptions: database?.columnOptions ?? [],
    isDatabaseSectionOpen: state.expanded.dbAttributes,
    isDatabasePanelPinned: state.databasePanelPinned,
    handleDatabaseToggle,
    setDatabaseId,
    setTableId,
    setFieldId,
  };
}
