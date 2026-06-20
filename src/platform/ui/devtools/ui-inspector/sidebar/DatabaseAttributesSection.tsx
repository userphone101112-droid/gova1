'use client';

import { DEVTOOLS } from '@/platform/ui/registry/features/devtools';

import { useSaveInspectorConfig } from '../hooks/useSaveInspectorConfig';

import { AttributesSection } from './AttributesSection';
import { DatabaseSection } from './DatabaseSection';
import { StorageSection } from './StorageSection';

export function DatabaseAttributesSection() {
  const { saveLabel, saveStatus, saveElementConfig } = useSaveInspectorConfig();

  return (
    <>
      <DatabaseSection />
      <StorageSection />
      <AttributesSection />
      <button
        data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DATA.SAVE_BUTTON.uuid}
        type="button"
        onClick={() => void saveElementConfig()}
        disabled={saveStatus === 'saving'}
        className="mx-3 mb-3 mt-1 w-[calc(100%-1.5rem)] rounded border border-secondary/30 bg-secondary/15 px-2 py-1.5 text-xs font-medium text-on-surface hover:bg-secondary/25 disabled:opacity-60"
      >
        {saveLabel}
      </button>
    </>
  );
}
