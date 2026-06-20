'use client';

import { DEVTOOLS } from '@/platform/ui/registry/features/devtools';

import { buildAbsoluteInspectUrl } from '../../inspector-routes';
import { usePageRegistry } from '../hooks/usePageRegistry';
import { useInspectorContext } from '../state/InspectorProvider';

export function TargetPageSection() {
  const { state, handleRouteChange, handleRefresh } = useInspectorContext();
  const { pages, refreshPages } = usePageRegistry();

  const openTargetInNewTab = () => {
    const absoluteUrl = buildAbsoluteInspectUrl(state.routePath, window.location.origin);
    window.open(absoluteUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <select
        data-ui-uuid={DEVTOOLS.UI_INSPECTOR.HEADER.ROUTE_SELECT.uuid}
        value={state.routePath}
        onChange={(e) => handleRouteChange(e.target.value)}
        className="mx-3 mb-2 w-[calc(100%-1.5rem)] rounded border border-outline-variant bg-surface px-2 py-1.5 text-sm"
      >
        {pages.map((route) => (
          <option
            key={route.path}
            data-ui-uuid={DEVTOOLS.UI_INSPECTOR.HEADER.ROUTE_OPTION.uuid}
            data-ui-instance-id={`route-${route.path}`}
            value={route.path}
          >
            {route.label} ({route.path})
          </option>
        ))}
      </select>
      <button
        data-ui-uuid={DEVTOOLS.UI_INSPECTOR.HEADER.REFRESH_BUTTON.uuid}
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
        data-ui-uuid={DEVTOOLS.UI_INSPECTOR.HEADER.OPEN_TAB_BUTTON.uuid}
        type="button"
        onClick={openTargetInNewTab}
        className="mx-3 mb-3 w-[calc(100%-1.5rem)] rounded border border-outline-variant px-3 py-1.5 text-sm"
      >
        Open target in new tab
      </button>
    </>
  );
}
