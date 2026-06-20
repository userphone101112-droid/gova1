'use client';

import { useCallback } from 'react';

import { DEVTOOLS } from '@/platform/ui/registry/features/devtools';

import { useInspectorContext } from '../state/InspectorProvider';
import { getSidebarSubpanelClass } from '../utils/sidebar-section-theme';

import { FieldGroup, inspectorPanelStackClass } from './FieldGroup';

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
      className={`${inspectorPanelStackClass} ${getSidebarSubpanelClass('attributes')}`}
    >
      <FieldGroup
        label="Attributes"
        hint="Toggle custom attribute flags saved for this element."
        labelUuid={DEVTOOLS.UI_INSPECTOR.DATA.ATTRIBUTES_LABEL.uuid}
        instanceId="attributes-toggle"
      >
        <button
          data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DATA.ATTRIBUTES_TOGGLE.uuid}
          type="button"
          onClick={handleAttributesToggle}
          className={`w-fit rounded px-3 py-1 text-xs ${
            state.formState.attributesEnabled ? 'bg-primary text-on-primary' : 'border border-outline-variant'
          }`}
        >
          {state.formState.attributesEnabled ? 'ON' : 'OFF'}
        </button>
      </FieldGroup>

      {state.formState.attributesEnabled && (
        <>
          <FieldGroup
            label="Attribute 1"
            hint="First boolean flag for this element."
            labelUuid={DEVTOOLS.UI_INSPECTOR.DATA.ATTRIBUTE1_LABEL.uuid}
            instanceId="attribute-1"
          >
            <button
              type="button"
              onClick={() => toggleAttribute('attribute1')}
              className="flex w-full items-center gap-2 rounded border border-outline-variant px-2 py-1.5 text-start text-xs"
            >
              <input
                data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DATA.ATTRIBUTE1_CHECKBOX.uuid}
                type="checkbox"
                checked={state.formState.attribute1}
                readOnly
                className="pointer-events-none"
              />
              Enabled
            </button>
          </FieldGroup>

          <FieldGroup
            label="Attribute 2"
            hint="Second boolean flag for this element."
            labelUuid={DEVTOOLS.UI_INSPECTOR.DATA.ATTRIBUTE2_LABEL.uuid}
            instanceId="attribute-2"
          >
            <button
              type="button"
              onClick={() => toggleAttribute('attribute2')}
              className="flex w-full items-center gap-2 rounded border border-outline-variant px-2 py-1.5 text-start text-xs"
            >
              <input
                data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DATA.ATTRIBUTE2_CHECKBOX.uuid}
                type="checkbox"
                checked={state.formState.attribute2}
                readOnly
                className="pointer-events-none"
              />
              Enabled
            </button>
          </FieldGroup>

          <FieldGroup
            label="Attribute 3"
            hint="Third boolean flag for this element."
            labelUuid={DEVTOOLS.UI_INSPECTOR.DATA.ATTRIBUTE3_LABEL.uuid}
            instanceId="attribute-3"
          >
            <button
              type="button"
              onClick={() => toggleAttribute('attribute3')}
              className="flex w-full items-center gap-2 rounded border border-outline-variant px-2 py-1.5 text-start text-xs"
            >
              <input
                data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DATA.ATTRIBUTE3_CHECKBOX.uuid}
                type="checkbox"
                checked={state.formState.attribute3}
                readOnly
                className="pointer-events-none"
              />
              Enabled
            </button>
          </FieldGroup>
        </>
      )}
    </section>
  );
}
