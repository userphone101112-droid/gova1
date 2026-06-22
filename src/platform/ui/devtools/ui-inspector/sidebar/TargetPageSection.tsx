'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { buildAbsoluteInspectUrl } from '../../inspector-routes';
import { usePageRegistry } from '../hooks/usePageRegistry';
import { useInspectorContext } from '../state/InspectorProvider';

export function TargetPageSection() {
  const { state, handleRouteBack, handleRouteChange, handleRouteForward, handleRefresh } =
    useInspectorContext();
  const { pages, refreshPages } = usePageRegistry();
  const canGoBack = state.routeHistoryIndex > 0;
  const canGoForward = state.routeHistoryIndex < state.routeHistory.length - 1;

  const openTargetInNewTab = () => {
    const absoluteUrl = buildAbsoluteInspectUrl(state.routePath, window.location.origin);
    window.open(absoluteUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <div className="mx-3 mb-2 flex gap-1">
        <button
          type="button"
          onClick={handleRouteBack}
          disabled={!canGoBack}
          className="grid size-8 shrink-0 place-items-center rounded border border-outline-variant text-on-surface-variant disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Back"
          title="Back"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={handleRouteForward}
          disabled={!canGoForward}
          className="grid size-8 shrink-0 place-items-center rounded border border-outline-variant text-on-surface-variant disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Forward"
          title="Forward"
        >
          <ChevronRight className="size-4" aria-hidden="true" />
        </button>
        <select
          value={state.routePath}
          onChange={(e) => handleRouteChange(e.target.value)}
          className="min-w-0 flex-1 rounded border border-outline-variant bg-surface px-2 py-1.5 text-sm"
        >
          {pages.map((route) => (
            <option
              key={route.path}
              data-ui-instance-id={`route-${route.path}`}
              value={route.path}
            >
              {route.label} ({route.path})
            </option>
          ))}
        </select>
      </div>
      <button
        type="button"
        onClick={() => {
          void refreshPages();
          handleRefresh();
        }}
        className="mx-3 mb-2 w-[calc(100%-1.5rem)] rounded bg-primary px-3 py-1.5 text-sm text-on-primary"
      >
        Refresh preview
      </button>
      <button
        type="button"
        onClick={openTargetInNewTab}
        className="mx-3 mb-3 w-[calc(100%-1.5rem)] rounded border border-outline-variant px-3 py-1.5 text-sm"
      >
        Open target in new tab
      </button>
    </>
  );
}
