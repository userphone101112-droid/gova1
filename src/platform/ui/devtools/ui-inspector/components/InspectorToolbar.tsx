'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { usePageRegistry } from '../hooks/usePageRegistry';
import { FieldGroup, inspectorFieldSelectClass } from '../sidebar/FieldGroup';
import { useInspectorContext } from '../state/InspectorProvider';


export function InspectorToolbar() {
  const { state, handleRouteBack, handleRouteChange, handleRouteForward, handleRefresh } =
    useInspectorContext();
  const { pages, refreshPages, loading } = usePageRegistry();
  const canGoBack = state.routeHistoryIndex > 0;
  const canGoForward = state.routeHistoryIndex < state.routeHistory.length - 1;

  const handleRefreshAll = () => {
    void refreshPages();
    handleRefresh();
  };

  const handleOpenPreview = () => {
    handleRouteChange(state.routePath);
    handleRefresh();
  };

  return (
    <>
      <FieldGroup
        label="Preview route"
        inline
        instanceId="toolbar-route"
        className="min-w-[160px]"
      >
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleRouteBack}
            disabled={!canGoBack}
            className="grid size-7 shrink-0 place-items-center rounded border border-outline-variant text-on-surface-variant disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Back"
            title="Back"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={handleRouteForward}
            disabled={!canGoForward}
            className="grid size-7 shrink-0 place-items-center rounded border border-outline-variant text-on-surface-variant disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Forward"
            title="Forward"
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
          <select
            value={state.routePath}
            onChange={(e) => handleRouteChange(e.target.value)}
            className={`${inspectorFieldSelectClass} min-w-[120px]`}
          >
            {pages.map((page) => (
              <option
                key={page.path}
                data-ui-instance-id={`route-${page.path}`}
                value={page.path}
              >
                {page.label} ({page.path})
              </option>
            ))}
          </select>
        </div>
      </FieldGroup>

      <FieldGroup label="Actions" inline instanceId="toolbar-actions">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleRefreshAll}
            disabled={loading}
            className="rounded border border-outline-variant px-2 py-1 text-xs disabled:opacity-60"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={handleOpenPreview}
            className="rounded bg-primary px-2 py-1 text-xs text-on-primary"
          >
            Open
          </button>
        </div>
      </FieldGroup>
    </>
  );
}
