'use client';

import { useCallback, useMemo } from 'react';

import {
  createDatabaseBinding,
  createDerivedBinding,
  createElementLinkBinding,
  createStorageBinding,
  deleteBinding as removeBinding,
  duplicateBinding as cloneBinding,
  normalizeBindings,
  syncLegacyFieldsFromBindings,
  updateBinding as patchBinding,
} from '../data/element-binding-utils';
import type { BindingKind, ElementBinding } from '../data/element-binding.types';
import type { ElementFormState, InspectorDataEntry } from '../data/inspector-config.types';
import { useInspectorContext } from '../state/InspectorProvider';

function emptyEntryBase(): InspectorDataEntry {
  return {
    databaseEnabled: false,
    databaseName: '',
    tableName: '',
    columnName: '',
    inf1: '',
    inf2: '',
    inf3: '',
    storageEnabled: false,
    storageMainFile: '',
    storageSubFile: '',
    attributesEnabled: false,
    attribute1: false,
    attribute2: false,
    attribute3: false,
    dataUiPath: '',
    dataUiFeature: '',
    dataUiUuid: '',
    dataUiInstanceId: '',
    dataUiIdentityKey: '',
  };
}

function bindingsToFormPatch(
  bindings: ElementBinding[],
  activeBindingId: string
): Partial<ElementFormState> {
  const synced = syncLegacyFieldsFromBindings(emptyEntryBase(), bindings);
  return {
    bindings,
    activeBindingId,
    databaseEnabled: synced.databaseEnabled,
    databaseName: synced.databaseName ?? '',
    tableName: synced.tableName ?? '',
    columnName: synced.columnName ?? '',
    storageEnabled: Boolean(synced.storageEnabled),
    storageMainFile: synced.storageMainFile ?? '',
    storageSubFile: synced.storageSubFile ?? '',
  };
}

export function useElementBindings() {
  const { state, dispatch } = useInspectorContext();
  const { bindings, activeBindingId } = state.formState;

  const activeBinding = useMemo(
    () => bindings.find((binding) => binding.id === activeBindingId),
    [bindings, activeBindingId]
  );

  const setActiveBindingId = useCallback(
    (bindingId: string) => {
      dispatch({ type: 'PATCH_FORM_STATE', patch: { activeBindingId: bindingId } });
    },
    [dispatch]
  );

  const applyBindings = useCallback(
    (nextBindings: ElementBinding[], nextActiveId: string) => {
      dispatch({
        type: 'PATCH_FORM_STATE',
        patch: bindingsToFormPatch(normalizeBindings(nextBindings), nextActiveId),
      });
    },
    [dispatch]
  );

  const addBinding = useCallback(
    (kind: BindingKind) => {
      let created: ElementBinding;
      switch (kind) {
        case 'database':
          created = createDatabaseBinding({ databaseName: '', tableName: '', columnName: '' });
          break;
        case 'storage':
          created = createStorageBinding({ storageMainFile: '' });
          break;
        case 'element':
          created = createElementLinkBinding({ linkedElementKey: '' });
          break;
        case 'derived':
          created = createDerivedBinding({ formula: '' });
          break;
      }
      const nextBindings = [...bindings, created];
      applyBindings(nextBindings, created.id);
    },
    [applyBindings, bindings]
  );

  const updateBinding = useCallback(
    (bindingId: string, patch: Partial<ElementBinding>) => {
      const nextBindings = bindings.map((binding) =>
        binding.id === bindingId ? patchBinding(binding, patch) : binding
      );
      applyBindings(nextBindings, activeBindingId);
    },
    [activeBindingId, applyBindings, bindings]
  );

  const deleteBinding = useCallback(
    (bindingId: string) => {
      const nextBindings = removeBinding(bindings, bindingId);
      const nextActiveId =
        activeBindingId === bindingId ? (nextBindings[0]?.id ?? '') : activeBindingId;
      applyBindings(nextBindings, nextActiveId);
    },
    [activeBindingId, applyBindings, bindings]
  );

  const duplicateBinding = useCallback(
    (bindingId: string) => {
      const beforeIds = new Set(bindings.map((binding) => binding.id));
      const nextBindings = cloneBinding(bindings, bindingId);
      const duplicate = nextBindings.find((binding) => !beforeIds.has(binding.id));
      applyBindings(nextBindings, duplicate?.id ?? activeBindingId);
    },
    [activeBindingId, applyBindings, bindings]
  );

  return {
    bindings,
    activeBindingId,
    activeBinding,
    addBinding,
    updateBinding,
    deleteBinding,
    duplicateBinding,
    setActiveBindingId,
  };
}
