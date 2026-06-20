'use client';

import { useCallback } from 'react';

import { DEVTOOLS } from '@/platform/ui/registry/features/devtools';

import { useInspectorContext } from '../state/InspectorProvider';

export function AttributesSection() {
  const { state, dispatch } = useInspectorContext();

  const handleAttributesToggle = useCallback(() => {
    const nextEnabled = !state.formState.attributesEnabled;
    if (nextEnabled) {
      dispatch({ type: 'SET_EXPANDED', expanded: { dbAttributes: true } });
    }
    dispatch({
      type: 'PATCH_FORM_STATE',
      patch: { attributesEnabled: nextEnabled },
    });
  }, [dispatch, state.formState.attributesEnabled]);

  const toggleAttribute = useCallback(
    (key: 'attribute1' | 'attribute2' | 'attribute3') => {
      dispatch({
        type: 'PATCH_FORM_STATE',
        patch: { [key]: !state.formState[key] },
      });
    },
    [dispatch, state.formState]
  );

  return (
    <section
      data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DATA.CONTAINER.uuid}
      data-ui-instance-id="attributes-panel"
      className="grid grid-cols-[1fr_auto] gap-x-2 gap-y-2 border-b border-outline-variant px-3 py-3"
    >
      <span
        data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DATA.ATTRIBUTES_LABEL.uuid}
        className="self-center text-xs font-medium"
      >
        Attributes
      </span>
      <button
        data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DATA.ATTRIBUTES_TOGGLE.uuid}
        type="button"
        onClick={handleAttributesToggle}
        className={`rounded px-2 py-0.5 text-xs ${
          state.formState.attributesEnabled ? 'bg-primary text-on-primary' : 'border border-outline-variant'
        }`}
      >
        {state.formState.attributesEnabled ? 'ON' : 'OFF'}
      </button>
      {state.formState.attributesEnabled && (
        <>
          <button
            data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DATA.ATTRIBUTE1_LABEL.uuid}
            type="button"
            onClick={() => toggleAttribute('attribute1')}
            className="col-span-2 flex w-full items-center gap-2 text-start text-xs"
          >
            <input
              data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DATA.ATTRIBUTE1_CHECKBOX.uuid}
              type="checkbox"
              checked={state.formState.attribute1}
              readOnly
              className="pointer-events-none"
            />
            Attribute 1
          </button>
          <button
            data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DATA.ATTRIBUTE2_LABEL.uuid}
            type="button"
            onClick={() => toggleAttribute('attribute2')}
            className="col-span-2 flex w-full items-center gap-2 text-start text-xs"
          >
            <input
              data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DATA.ATTRIBUTE2_CHECKBOX.uuid}
              type="checkbox"
              checked={state.formState.attribute2}
              readOnly
              className="pointer-events-none"
            />
            Attribute 2
          </button>
          <button
            data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DATA.ATTRIBUTE3_LABEL.uuid}
            type="button"
            onClick={() => toggleAttribute('attribute3')}
            className="col-span-2 flex w-full items-center gap-2 text-start text-xs"
          >
            <input
              data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DATA.ATTRIBUTE3_CHECKBOX.uuid}
              type="checkbox"
              checked={state.formState.attribute3}
              readOnly
              className="pointer-events-none"
            />
            Attribute 3
          </button>
        </>
      )}
    </section>
  );
}
