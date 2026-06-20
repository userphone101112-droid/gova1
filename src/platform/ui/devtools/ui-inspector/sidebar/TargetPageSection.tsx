'use client';

import { DEVTOOLS } from '@/platform/ui/registry/features/devtools';

import { INSPECTOR_ROUTES, type InspectorRoutePath } from '../../inspector-routes';
import { useInspectorContext } from '../state/InspectorProvider';

export function TargetPageSection() {
  const { state, selectors, handleRouteChange, handleRefresh } = useInspectorContext();
  const targetUrl = selectors.preview.targetUrl;

  const openTargetInNewTab = () => {
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <select
        data-ui-uuid={DEVTOOLS.UI_INSPECTOR.HEADER.ROUTE_SELECT.uuid}
        value={state.routePath}
        onChange={(e) => handleRouteChange(e.target.value as InspectorRoutePath)}
        className="mx-3 mb-2 w-[calc(100%-1.5rem)] rounded border border-outline-variant bg-surface px-2 py-1.5 text-sm"
      >
        {INSPECTOR_ROUTES.map((route) => (
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
        onClick={handleRefresh}
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
