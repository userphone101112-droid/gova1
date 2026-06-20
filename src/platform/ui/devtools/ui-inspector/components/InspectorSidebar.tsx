'use client';

import { DEVTOOLS } from '@/platform/ui/registry/features/devtools';

import { DatabaseAttributesSection } from '../sidebar/DatabaseAttributesSection';
import { DatabaseManagementSection } from '../sidebar/DatabaseManagementSection';
import { DisplaySection } from '../sidebar/DisplaySection';
import { ElementsSection } from '../sidebar/ElementsSection';
import { FiltersSection } from '../sidebar/FiltersSection';
import { FullDetailsSection } from '../sidebar/FullDetailsSection';
import { SidebarSection, sidebarSectionButtonClass } from '../sidebar/SidebarSection';
import { useInspectorContext } from '../state/InspectorProvider';
import { sectionChevron } from '../utils/format';

export function InspectorSidebar() {
  const {
    state,
    selectors,
    toggleSection,
    handlePickModeToggle,
  } = useInspectorContext();
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
        data-ui-instance-id="sidebar-header"
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

      <section
        data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SELECTED.CONTAINER.uuid}
        data-ui-instance-id="display-panel"
        className="border-b border-outline-variant"
      >
        <span
          data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.DISPLAY_LABEL.uuid}
          className="block px-3 py-2 text-sm font-medium"
        >
          Display
        </span>
        <DisplaySection />
      </section>

      {selected && (
        <SidebarSection
          open={state.expanded.dbAttributes}
          toggleButton={
            <button
              data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.DB_ATTRIBUTES_LABEL.uuid}
              type="button"
              onClick={() => toggleSection('dbAttributes')}
              className={sidebarSectionButtonClass}
            >
              Database &amp; Attributes
              {databaseSuffix}
              {sectionChevron(state.expanded.dbAttributes)}
            </button>
          }
        >
          <DatabaseAttributesSection />
        </SidebarSection>
      )}

      <SidebarSection
        open={state.expanded.dbManagement}
        toggleButton={
          <button
            data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.DB_MANAGEMENT_LABEL.uuid}
            type="button"
            onClick={() => toggleSection('dbManagement')}
            className={sidebarSectionButtonClass}
          >
            Database Management
            {sectionChevron(state.expanded.dbManagement)}
          </button>
        }
      >
        <DatabaseManagementSection />
      </SidebarSection>

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
