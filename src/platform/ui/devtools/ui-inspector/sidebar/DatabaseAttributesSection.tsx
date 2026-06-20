'use client';

import { DEVTOOLS } from '@/platform/ui/registry/features/devtools';

import { useSaveInspectorConfig } from '../hooks/useSaveInspectorConfig';

import { AttributesSection } from './AttributesSection';
import { DatabaseSection } from './DatabaseSection';

export function DatabaseAttributesSection() {
  const { saveLabel, saveStatus, saveElementConfig } = useSaveInspectorConfig();

  return (
    <>
      <DatabaseSection />
      <AttributesSection />
      <button
        data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DATA.SAVE_BUTTON.uuid}
        type="button"
        onClick={() => void saveElementConfig()}
        disabled={saveStatus === 'saving'}
        className="mx-3 mb-3 w-[calc(100%-1.5rem)] rounded bg-primary px-2 py-1.5 text-xs text-on-primary disabled:opacity-60"
      >
        {saveLabel}
      </button>
    </>
  );
}
