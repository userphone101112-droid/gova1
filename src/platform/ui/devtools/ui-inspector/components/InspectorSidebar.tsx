'use client';

import { DEVTOOLS } from '@/platform/ui/registry/features/devtools';

import { useSaveInspectorConfig } from '../hooks/useSaveInspectorConfig';
import { AttributesSection } from '../sidebar/AttributesSection';
import { DatabaseRefEditorPanel } from '../sidebar/DatabaseRefEditorPanel';
import { DatabaseSection } from '../sidebar/DatabaseSection';
import { ElementsSection } from '../sidebar/ElementsSection';
import { FiltersSection } from '../sidebar/FiltersSection';
import { FullDetailsSection } from '../sidebar/FullDetailsSection';
import { SidebarSection, sidebarSectionButtonClass } from '../sidebar/SidebarSection';
import { TargetPageSection } from '../sidebar/TargetPageSection';
import { ViewportSection } from '../sidebar/ViewportSection';
import { useInspectorContext } from '../state/InspectorProvider';
import { sectionChevron } from '../utils/format';

export function InspectorSidebar() {
  const {
    state,
    selectors,
    toggleSection,
    handlePickModeToggle,
  } = useInspectorContext();
  const { saveLabel, saveStatus, saveElementConfig } = useSaveInspectorConfig();
  const selected = selectors.selected;
  const databaseSuffix = state.databasePanelPinned ? ' (unsaved)' : '';

  return (
    <aside
      data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.CONTAINER.uuid}
      style={{ width: state.sidebarWidth, minWidth: state.sidebarWidth }}
      className="h-full min-h-0 shrink-0 overflow-auto border-e border-outline-variant bg-surface [&>*]:min-w-[280px]"
    >
      <section
        data-ui-uuid={DEVTOOLS.UI_INSPECTOR.HEADER.CONTAINER.uuid}
        className="flex shrink-0 items-center justify-between gap-2 border-b border-outline-variant px-3 py-2"
      >
        <h1
          data-ui-uuid={DEVTOOLS.UI_INSPECTOR.HEADER.TITLE.uuid}
          className="text-base font-semibold"
        >
          UI Inspector
        </h1>
        <button
          data-ui-uuid={DEVTOOLS.UI_INSPECTOR.PICK.MODE_TOGGLE.uuid}
          type="button"
          onClick={handlePickModeToggle}
          className={`rounded px-2 py-1 text-xs font-medium ${
            state.pickModeEnabled ? 'bg-primary text-on-primary' : 'border border-outline-variant'
          }`}
        >
          Pick {state.pickModeEnabled ? 'ON' : 'OFF'}
        </button>
      </section>

      <SidebarSection
        open={state.expanded.route}
        toggleButton={
          <button
            data-ui-uuid={DEVTOOLS.UI_INSPECTOR.HEADER.ROUTE_LABEL.uuid}
            type="button"
            onClick={() => toggleSection('route')}
            className={sidebarSectionButtonClass}
          >
            Target page
            {sectionChevron(state.expanded.route)}
          </button>
        }
      >
        <TargetPageSection />
      </SidebarSection>

      <SidebarSection
        open={state.expanded.display}
        toggleButton={
          <button
            data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.DISPLAY_LABEL.uuid}
            type="button"
            onClick={() => toggleSection('display')}
            className={sidebarSectionButtonClass}
          >
            Display
            {sectionChevron(state.expanded.display)}
          </button>
        }
      >
        <ViewportSection />
      </SidebarSection>

      {selected && (
        <>
          <SidebarSection
            open={state.expanded.database}
            toggleButton={
              <button
                data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.DATABASE_SECTION_LABEL.uuid}
                type="button"
                onClick={() => toggleSection('database')}
                className={sidebarSectionButtonClass}
              >
                Database
                {databaseSuffix}
                {sectionChevron(state.expanded.database)}
              </button>
            }
          >
            <DatabaseSection />
          </SidebarSection>

          <SidebarSection
            open={state.expanded.attributes}
            toggleButton={
              <button
                data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.ATTRIBUTES_SECTION_LABEL.uuid}
                type="button"
                onClick={() => toggleSection('attributes')}
                className={sidebarSectionButtonClass}
              >
                Attributes
                {sectionChevron(state.expanded.attributes)}
              </button>
            }
          >
            <AttributesSection />
          </SidebarSection>

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
      )}

      <DatabaseRefEditorPanel />

      <SidebarSection
        open={state.expanded.filters}
        toggleButton={
          <button
            data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.SEARCH_LABEL.uuid}
            type="button"
            onClick={() => toggleSection('filters')}
            className={sidebarSectionButtonClass}
          >
            Filters
            {sectionChevron(state.expanded.filters)}
          </button>
        }
      >
        <FiltersSection />
      </SidebarSection>

      <SidebarSection
        open={state.expanded.list}
        toggleButton={
          <button
            data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.COUNT.uuid}
            type="button"
            onClick={() => toggleSection('list')}
            className={sidebarSectionButtonClass}
          >
            {`Elements (${selectors.filteredElements.length}/${state.elements.length})`}
            {sectionChevron(state.expanded.list)}
          </button>
        }
      >
        <ElementsSection />
      </SidebarSection>

      <section
        data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DETAILS.CONTAINER.uuid}
        className={`${state.expanded.details ? 'overflow-x-auto' : ''}`}
      >
        <SidebarSection
          open={state.expanded.details}
          toggleButton={
            <button
              data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DETAILS.TITLE.uuid}
              type="button"
              onClick={() => toggleSection('details')}
              className={sidebarSectionButtonClass}
            >
              Full details
              {sectionChevron(state.expanded.details)}
            </button>
          }
        >
          <FullDetailsSection />
        </SidebarSection>
      </section>
    </aside>
  );
}
