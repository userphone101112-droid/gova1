'use client';

import { DEVTOOLS } from '@/platform/ui/registry/features/devtools';

import { usePageRegistry } from '../hooks/usePageRegistry';
import { FieldGroup, inspectorFieldSelectClass } from '../sidebar/FieldGroup';
import { useInspectorContext } from '../state/InspectorProvider';


export function InspectorToolbar() {
  const { state, handleRouteChange, handleRefresh } = useInspectorContext();
  const { pages, refreshPages, loading } = usePageRegistry();

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
        labelUuid={DEVTOOLS.UI_INSPECTOR.HEADER.ROUTE_SELECT.uuid}
        instanceId="toolbar-route"
        className="min-w-[160px]"
      >
        <select
          data-ui-uuid={DEVTOOLS.UI_INSPECTOR.HEADER.ROUTE_SELECT.uuid}
          value={state.routePath}
          onChange={(e) => handleRouteChange(e.target.value)}
          className={`${inspectorFieldSelectClass} min-w-[120px]`}
        >
          {pages.map((page) => (
            <option
              key={page.path}
              data-ui-uuid={DEVTOOLS.UI_INSPECTOR.HEADER.ROUTE_OPTION.uuid}
              data-ui-instance-id={`route-${page.path}`}
              value={page.path}
            >
              {page.label} ({page.path})
            </option>
          ))}
        </select>
      </FieldGroup>

      <FieldGroup label="Actions" inline instanceId="toolbar-actions">
        <div className="flex items-center gap-1">
          <button
            data-ui-uuid={DEVTOOLS.UI_INSPECTOR.HEADER.REFRESH_BUTTON.uuid}
            type="button"
            onClick={handleRefreshAll}
            disabled={loading}
            className="rounded border border-outline-variant px-2 py-1 text-xs disabled:opacity-60"
          >
            Refresh
          </button>
          <button
            data-ui-uuid={DEVTOOLS.UI_INSPECTOR.HEADER.OPEN_TAB_BUTTON.uuid}
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
