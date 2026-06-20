'use client';

import type { CSSProperties } from 'react';

import { DEVTOOLS } from '@/platform/ui/registry/features/devtools';

import { DatabaseAttributesSection } from '../sidebar/DatabaseAttributesSection';
import { DatabaseManagementSection } from '../sidebar/DatabaseManagementSection';
import { DisplaySection } from '../sidebar/DisplaySection';
import { ElementsSection } from '../sidebar/ElementsSection';
import { FiltersSection } from '../sidebar/FiltersSection';
import { FullDetailsSection } from '../sidebar/FullDetailsSection';
import { SidebarSection } from '../sidebar/SidebarSection';
import { StorageManagementSection } from '../sidebar/StorageManagementSection';
import { useInspectorContext } from '../state/InspectorProvider';
import { sectionChevron } from '../utils/format';
import {
  getSidebarSectionTone,
  sidebarSectionLabelClass,
  sidebarSectionToggleClass,
} from '../utils/sidebar-section-theme';

export function InspectorSidebar() {
  const {
    state,
    selectors,
    toggleSection,
    handlePickModeToggle,
  } = useInspectorContext();
  const hasElementSelection = selectors.hasElementSelection;
  const databaseSuffix = state.databasePanelPinned ? ' (unsaved)' : '';

  return (
    <aside
      data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.CONTAINER.uuid}
      style={{ '--sidebar-w': `${state.sidebarWidth}px` } as CSSProperties}
      className="h-auto max-h-[45vh] w-full min-w-0 shrink-0 overflow-auto border-b border-outline-variant bg-surface lg:h-full lg:max-h-none lg:w-[var(--sidebar-w)] lg:min-w-[var(--sidebar-w)] lg:border-b-0 lg:border-e [&>*]:min-w-0 lg:[&>*]:min-w-[240px]"
    >
      <section
        data-ui-uuid={DEVTOOLS.UI_INSPECTOR.HEADER.CONTAINER.uuid}
        data-ui-instance-id="sidebar-header"
        className={`flex shrink-0 flex-wrap items-center justify-between gap-2 px-3 py-2 ${getSidebarSectionTone('header').shell}`}
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
        className={getSidebarSectionTone('display').shell}
      >
        <span
          data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.DISPLAY_LABEL.uuid}
          className={`${sidebarSectionLabelClass('display')} border-s-4 border-s-primary ps-2`}
        >
          Display
        </span>
        <div
          data-ui-uuid={DEVTOOLS.UI_INSPECTOR.STATUS.CONTAINER.uuid}
          data-ui-instance-id="display-content"
          className={getSidebarSectionTone('display').content}
        >
          <DisplaySection />
        </div>
      </section>

      {hasElementSelection && (
        <SidebarSection
          tone="dbAttributes"
          open={state.expanded.dbAttributes}
          toggleButton={
            <button
              data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.DB_ATTRIBUTES_LABEL.uuid}
              type="button"
              onClick={() => toggleSection('dbAttributes')}
              className={sidebarSectionToggleClass('dbAttributes')}
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
        tone="dbManagement"
        open={state.expanded.dbManagement}
        toggleButton={
          <button
            data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.DB_MANAGEMENT_LABEL.uuid}
            type="button"
            onClick={() => toggleSection('dbManagement')}
            className={sidebarSectionToggleClass('dbManagement')}
          >
            Database Management
            {sectionChevron(state.expanded.dbManagement)}
          </button>
        }
      >
        <DatabaseManagementSection />
      </SidebarSection>

      <SidebarSection
        tone="storageManagement"
        open={state.expanded.storageManagement}
        toggleButton={
          <button
            data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.SCHEMA_EDITOR_LABEL.uuid}
            type="button"
            onClick={() => toggleSection('storageManagement')}
            className={sidebarSectionToggleClass('storageManagement')}
          >
            Storage Manager
            {sectionChevron(state.expanded.storageManagement)}
          </button>
        }
      >
        <StorageManagementSection />
      </SidebarSection>

      <SidebarSection
        tone="filters"
        open={state.expanded.filters}
        toggleButton={
          <button
            data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.SEARCH_LABEL.uuid}
            type="button"
            onClick={() => toggleSection('filters')}
            className={sidebarSectionToggleClass('filters')}
          >
            Filters
            {sectionChevron(state.expanded.filters)}
          </button>
        }
      >
        <FiltersSection />
      </SidebarSection>

      <SidebarSection
        tone="elements"
        open={state.expanded.list}
        toggleButton={
          <button
            data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.COUNT.uuid}
            type="button"
            onClick={() => toggleSection('list')}
            className={sidebarSectionToggleClass('elements')}
          >
            {`Elements (${selectors.filteredElements.length}/${state.elements.length})`}
            {sectionChevron(state.expanded.list)}
          </button>
        }
      >
        <ElementsSection />
      </SidebarSection>

      <SidebarSection
        tone="details"
        open={state.expanded.details}
        toggleButton={
          <button
            data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DETAILS.TITLE.uuid}
            type="button"
            onClick={() => toggleSection('details')}
            className={sidebarSectionToggleClass('details')}
          >
            Full details
            {sectionChevron(state.expanded.details)}
          </button>
        }
      >
        <FullDetailsSection />
      </SidebarSection>
    </aside>
  );
}
