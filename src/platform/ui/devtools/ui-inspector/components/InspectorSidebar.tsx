'use client';

import type { CSSProperties } from 'react';

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

import { TranslationPanel } from './TranslationPanel';

export function InspectorSidebar() {
  const {
    state,
    selectors,
    toggleSection,
    handlePickModeToggle,
    handleFramesModeToggle,
    handleAutofill,
    handleRefresh,
  } = useInspectorContext();
  const hasElementSelection = selectors.hasElementSelection;
  const hasUuidBackedElement = selectors.hasUuidBackedElement;
  const bindingsSuffix = state.databasePanelPinned ? ' (unsaved)' : '';

  return (
    <aside
      style={{ '--sidebar-w': `${state.sidebarWidth}px` } as CSSProperties}
      className="h-auto max-h-[45vh] w-full min-w-0 shrink-0 overflow-auto border-b border-outline-variant bg-surface lg:h-full lg:max-h-none lg:w-[var(--sidebar-w)] lg:min-w-[var(--sidebar-w)] lg:border-b-0 lg:border-e [&>*]:min-w-0 lg:[&>*]:min-w-[240px]"
    >
      <section
        data-ui-instance-id="sidebar-header"
        className={`flex shrink-0 flex-wrap items-center justify-between gap-2 px-3 py-2 ${getSidebarSectionTone('header').shell}`}
      >
        <h1
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
        data-ui-instance-id="display-panel"
        className={getSidebarSectionTone('display').shell}
      >
        <span
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
          data-ui-instance-id="display-content"
          className={getSidebarSectionTone('display').content}
        >
          <DisplaySection />
        </div>
      </section>

      {hasElementSelection && hasUuidBackedElement && (
        <SidebarSection
          tone="elementBindings"
          open={state.expanded.elementBindings}
          toggleButton={
            <button
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

      {hasElementSelection && !hasUuidBackedElement && (
        <SidebarSection
          tone="elementBindings"
          open={state.expanded.elementBindings}
          toggleButton={
            <button
              type="button"
              onClick={() => toggleSection('elementBindings')}
              className={sidebarSectionToggleClass('elementBindings')}
            >
              Element Registration
              {sectionChevron(state.expanded.elementBindings)}
            </button>
          }
        >
          <p className="px-3 pb-1 text-[10px] text-on-surface-variant">
            This element does not have a UUID. Database and storage bindings require a UUID-backed element.
          </p>
          <div className="px-3 pb-2">
            <div className="rounded border border-outline-variant bg-surface-container-low p-2 text-xs">
              <div className="font-medium text-on-surface mb-1">Element Info</div>
              <div className="text-on-surface-variant space-y-1">
                <div><span className="font-medium">Tag:</span> {selectors.selected?.tagName}</div>
                {selectors.selected?.textSnippet && <div><span className="font-medium">Text:</span> {selectors.selected.textSnippet}</div>}
                {selectors.selected?.sourceFile && <div><span className="font-medium">Source:</span> {selectors.selected.sourceFile}</div>}
              </div>
            </div>
          </div>
          <div className="px-3 pb-2">
            <button
              type="button"
              onClick={() => {
                const { selected } = selectors;
                if (selected) {
                  // Trigger UUID registration flow using the same function as pick confirm
                  // This will call the register endpoint and refresh the iframe
                  const element = {
                    sourceFile: selected.sourceFile || '',
                    sourceLine: selected.sourceLine || 0,
                    sourceColumn: selected.sourceColumn || 0,
                    tagName: selected.tagName,
                    domPath: selected.domPath || '',
                    textSnippet: selected.textSnippet || '',
                    route: state.routePath,
                    requestedPurpose: 'inspector-binding' as const,
                  };
                  fetch('/api/ui-inspector/register-element', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(element),
                  }).then(async (response) => {
                    const result = await response.json();
                    if (result.success) {
                      // Refresh iframe to pick up the new UUID
                      handleRefresh();
                      setTimeout(() => {
                        // Request new scan after refresh - this will be handled by the iframe ready event
                      }, 500);
                    } else {
                      alert(`Failed to register element: ${result.error}`);
                    }
                  }).catch((error) => {
                    console.error('Error registering element:', error);
                    alert('Failed to register element. Please try again.');
                  });
                }
              }}
              className="w-full rounded border border-primary bg-primary px-3 py-1.5 text-xs font-medium text-on-primary hover:bg-primary/90"
            >
              Create UUID
            </button>
          </div>
        </SidebarSection>
      )}

      {hasElementSelection && hasUuidBackedElement && (
        <SidebarSection
          tone="databaseCatalog"
          open={state.expanded.databaseCatalog}
          toggleButton={
            <button
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
      )}

      {hasElementSelection && hasUuidBackedElement && (
        <SidebarSection
          tone="storageCatalog"
          open={state.expanded.storageCatalog}
          toggleButton={
            <button
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
      )}

      {hasElementSelection && hasUuidBackedElement && (
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
      )}

      <SidebarSection
        tone="filters"
        open={state.expanded.filters}
        toggleButton={
          <button
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

      <TranslationPanel />

      <SidebarSection
        tone="details"
        open={state.expanded.details}
        toggleButton={
          <button
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
