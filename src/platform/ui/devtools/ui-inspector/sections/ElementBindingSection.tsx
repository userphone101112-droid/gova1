'use client';

import { DEVTOOLS } from '@/platform/ui/registry/features/devtools';

import { BindingWorkspace } from '../bindings/BindingWorkspace';
import { useSaveInspectorConfig } from '../hooks/useSaveInspectorConfig';
import { useInspectorContext } from '../state/InspectorProvider';

import { CustomAttributesEditor } from './CustomAttributesEditor';

export function ElementBindingSection() {
  const { saveLabel, saveStatus, saveElementConfig } = useSaveInspectorConfig();
  const { selectors } = useInspectorContext();

  if (!selectors.hasElementSelection) {
    return null;
  }

  return (
    <>
      <BindingWorkspace />
      <CustomAttributesEditor />
      <button
        data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DATA.SAVE_BUTTON.uuid}
        type="button"
        onClick={() => void saveElementConfig()}
        disabled={saveStatus === 'saving'}
        className="mx-3 mb-3 mt-1 w-[calc(100%-1.5rem)] rounded border border-secondary/30 bg-secondary/15 px-2 py-1.5 text-xs font-medium text-on-surface hover:bg-secondary/25 disabled:opacity-60"
      >
        {saveLabel === 'Save data' ? 'Save Element Bindings' : saveLabel}
      </button>
    </>
  );
}
