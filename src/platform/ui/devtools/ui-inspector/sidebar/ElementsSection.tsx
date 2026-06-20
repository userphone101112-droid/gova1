'use client';

import { DEVTOOLS } from '@/platform/ui/registry/features/devtools';

import { useInspectorContext } from '../state/InspectorProvider';

export function ElementsSection() {
  const { state, selectors, selectElement } = useInspectorContext();
  const { filteredElements } = selectors;

  return (
    <div
      data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.LIST.uuid}
      className="overflow-x-auto border-b border-outline-variant"
    >
      {filteredElements.map((el) => (
        <button
          key={el.scanKey}
          data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.LIST_ITEM.uuid}
          data-ui-instance-id={el.scanKey}
          type="button"
          onClick={() => selectElement(el.scanKey)}
          className={`block w-full border-b border-outline-variant px-3 py-2 text-start text-xs hover:bg-surface-variant ${
            state.selectedScanKey === el.scanKey ? 'bg-primary-container' : ''
          }`}
        >
          {el.id || el.uuid.slice(0, 8)} | {el.tagName} | {el.feature}
        </button>
      ))}
    </div>
  );
}
