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
      dispatch({ type: 'SET_EXPANDED', expanded: { elementBindings: true } });
    }
    dispatch({
      type: 'PATCH_FORM_STATE',
      patch: { databaseEnabled: nextEnabled },
    });
  }, [dispatch, state.formState.databaseEnabled]);

  const setDatabaseName = useCallback(
    (databaseName: string) => {
      dispatch({
        type: 'PATCH_FORM_STATE',
        patch: { databaseName, tableName: '', columnName: '' },
      });
    },
    [dispatch]
  );

  const setTableName = useCallback(
    (tableName: string) => {
      dispatch({
        type: 'PATCH_FORM_STATE',
        patch: { tableName, columnName: '' },
      });
    },
    [dispatch]
  );

  const setColumnName = useCallback(
    (columnName: string) => {
      dispatch({ type: 'PATCH_FORM_STATE', patch: { columnName } });
    },
    [dispatch]
  );

  const setAdditionalInfo = useCallback(
    (key: 'inf1' | 'inf2' | 'inf3', value: string) => {
      dispatch({ type: 'PATCH_FORM_STATE', patch: { [key]: value } });
    },
    [dispatch]
  );

  return {
    formState: state.formState,
    databaseRef: state.databaseRef,
    tableOptions: database?.tableOptions ?? [],
    columnOptions: database?.columnOptions ?? [],
    isDatabaseSectionOpen: state.expanded.elementBindings,
    isDatabasePanelPinned: state.databasePanelPinned,
    handleDatabaseToggle,
    setDatabaseName,
    setTableName,
    setColumnName,
    setAdditionalInfo,
  };
}
