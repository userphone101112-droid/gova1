'use client';

import type { CSSProperties } from 'react';

import { DEVTOOLS } from '@/platform/ui/registry/features/devtools';

import { DatabaseCatalogSection } from '../sections/DatabaseCatalogSection';
import { ElementBindingSection } from '../sections/ElementBindingSection';
import { SimulationInsightsSection } from '../sections/SimulationInsightsSection';
import { StorageCatalogSection } from '../sections/StorageCatalogSection';
import { DisplaySection } from '../sidebar/DisplaySection';
import { ElementsSection } from '../sidebar/ElementsSection';
import { FiltersSection } from '../sidebar/FiltersSection';
import { FullDetailsSection } from '../sidebar/FullDetailsSection';
import { SidebarSection } from '../sidebar/SidebarSection';
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
    handleFramesModeToggle,
    handleAutofill,
  } = useInspectorContext();
  const hasElementSelection = selectors.hasElementSelection;
  const bindingsSuffix = state.databasePanelPinned ? ' (unsaved)' : '';

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
        <div className="flex items-center gap-1">
          <button
            type="button"
            data-ui-instance-id="autofill-button"
            onClick={handleAutofill}
            className="rounded border border-outline-variant px-2 py-1 text-xs font-medium"
          >
            Autofill
          </button>
          <button
            data-ui-uuid={DEVTOOLS.UI_INSPECTOR.PICK.MODE_TOGGLE.uuid}
            data-ui-instance-id="pick-mode-toggle"
            type="button"
            onClick={handlePickModeToggle}
            className={`rounded px-2 py-1 text-xs font-medium ${
              state.pickModeEnabled ? 'bg-primary text-on-primary' : 'border border-outline-variant'
            }`}
          >
            Pick {state.pickModeEnabled ? 'ON' : 'OFF'}
          </button>
          <button
            type="button"
            data-ui-instance-id="frames-mode-toggle"
            onClick={handleFramesModeToggle}
            className={`rounded px-2 py-1 text-xs font-medium ${
              state.framesModeEnabled ? 'bg-teal-600 text-white' : 'border border-outline-variant'
            }`}
          >
            Frames {state.framesModeEnabled ? 'ON' : 'OFF'}
          </button>
        </div>
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
        <p className="px-3 pb-1 text-[10px] text-on-surface-variant">Shows the last selected UI element.</p>
        {state.framesModeEnabled ? (
          <div className="mx-3 mb-2 rounded border border-outline-variant/60 bg-surface-container-low px-2 py-1.5 text-[10px] leading-relaxed text-on-surface-variant">
            <div className="font-medium text-on-surface">Frames legend</div>
            <div><span className="text-secondary">DB</span> = saved database binding</div>
            <div><span className="text-warning">Storage</span> = saved storage binding</div>
            <div><span className="text-tertiary">Link</span> = saved element relationship</div>
            <div><span className="text-on-surface">Mixed</span> = database + storage</div>
          </div>
        ) : null}
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
          tone="elementBindings"
          open={state.expanded.elementBindings}
          toggleButton={
            <button
              data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.DB_ATTRIBUTES_LABEL.uuid}
              type="button"
              onClick={() => toggleSection('elementBindings')}
              className={sidebarSectionToggleClass('elementBindings')}
            >
              Element Bindings
              {bindingsSuffix}
              {sectionChevron(state.expanded.elementBindings)}
            </button>
          }
        >
          <p className="px-3 pb-1 text-[10px] text-on-surface-variant">
            Define how this element reads, writes, uploads, or inherits data.
          </p>
          <ElementBindingSection />
        </SidebarSection>
      )}

      <SidebarSection
        tone="databaseCatalog"
        open={state.expanded.databaseCatalog}
        toggleButton={
          <button
            data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.DB_MANAGEMENT_LABEL.uuid}
            type="button"
            onClick={() => toggleSection('databaseCatalog')}
            className={sidebarSectionToggleClass('databaseCatalog')}
          >
            Database Catalog
            {sectionChevron(state.expanded.databaseCatalog)}
          </button>
        }
      >
        <p className="px-3 pb-1 text-[10px] text-on-surface-variant">
          Manage database, table, and column catalog metadata.
        </p>
        <DatabaseCatalogSection />
      </SidebarSection>

      <SidebarSection
        tone="storageCatalog"
        open={state.expanded.storageCatalog}
        toggleButton={
          <button
            data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.SCHEMA_EDITOR_LABEL.uuid}
            type="button"
            onClick={() => toggleSection('storageCatalog')}
            className={sidebarSectionToggleClass('storageCatalog')}
          >
            Storage Catalog
            {sectionChevron(state.expanded.storageCatalog)}
          </button>
        }
      >
        <p className="px-3 pb-1 text-[10px] text-on-surface-variant">
          Manage storage folders, paths, access, and file rules.
        </p>
        <StorageCatalogSection />
      </SidebarSection>

      <SidebarSection
        tone="simulationInsights"
        open={state.expanded.simulationInsights}
        toggleButton={
          <button
            type="button"
            onClick={() => toggleSection('simulationInsights')}
            className={sidebarSectionToggleClass('simulationInsights')}
          >
            Simulation Insights
            {sectionChevron(state.expanded.simulationInsights)}
          </button>
        }
      >
        <p className="px-3 pb-1 text-[10px] text-on-surface-variant">
          Analyze saved bindings to guide architecture decisions.
        </p>
        <SimulationInsightsSection />
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
