'use client';

import { DEVTOOLS } from '@/platform/ui/registry/features/devtools';

import { useInspectorContext } from '../state/InspectorProvider';
import { LIFECYCLE_FILTERS, TAG_FILTERS } from '../utils/constants';

export function FiltersSection() {
  const { state, dispatch, selectors } = useInspectorContext();
  const featureOptions = selectors.featureOptions;

  return (
    <>
      <input
        data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.SEARCH_INPUT.uuid}
        value={state.search}
        onChange={(e) => dispatch({ type: 'SET_SEARCH', search: e.target.value })}
        placeholder="UUID, id, path, feature..."
        className="mx-3 mb-2 w-[calc(100%-1.5rem)] rounded border border-outline-variant bg-surface px-2 py-1.5 text-sm"
      />
      <span
        data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.FILTER_FEATURE_LABEL.uuid}
        className="mx-3 mb-1 block text-xs text-on-surface-variant"
      >
        Feature
      </span>
      <select
        data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.FILTER_FEATURE_SELECT.uuid}
        value={state.featureFilter}
        onChange={(e) => dispatch({ type: 'SET_FEATURE_FILTER', featureFilter: e.target.value })}
        className="mx-3 mb-2 w-[calc(100%-1.5rem)] rounded border border-outline-variant bg-surface px-2 py-1.5 text-sm"
      >
        {featureOptions.map((feature) => (
          <option
            key={feature}
            data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.FILTER_FEATURE_OPTION.uuid}
            data-ui-instance-id={`feature-${feature}`}
            value={feature}
          >
            {feature}
          </option>
        ))}
      </select>
      <span
        data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.FILTER_TAG_LABEL.uuid}
        className="mx-3 mb-1 block text-xs text-on-surface-variant"
      >
        Tag type
      </span>
      <select
        data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.FILTER_TAG_SELECT.uuid}
        value={state.tagFilter}
        onChange={(e) => dispatch({ type: 'SET_TAG_FILTER', tagFilter: e.target.value })}
        className="mx-3 mb-2 w-[calc(100%-1.5rem)] rounded border border-outline-variant bg-surface px-2 py-1.5 text-sm"
      >
        {TAG_FILTERS.map((tag) => (
          <option
            key={tag}
            data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.FILTER_TAG_OPTION.uuid}
            data-ui-instance-id={`tag-${tag}`}
            value={tag}
          >
            {tag}
          </option>
        ))}
      </select>
      <span
        data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.FILTER_LIFECYCLE_LABEL.uuid}
        className="mx-3 mb-1 block text-xs text-on-surface-variant"
      >
        Lifecycle
      </span>
      <select
        data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.FILTER_LIFECYCLE_SELECT.uuid}
        value={state.lifecycleFilter}
        onChange={(e) => dispatch({ type: 'SET_LIFECYCLE_FILTER', lifecycleFilter: e.target.value })}
        className="mx-3 mb-2 w-[calc(100%-1.5rem)] rounded border border-outline-variant bg-surface px-2 py-1.5 text-sm"
      >
        {LIFECYCLE_FILTERS.map((item) => (
          <option
            key={item.value}
            data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.FILTER_LIFECYCLE_OPTION.uuid}
            data-ui-instance-id={`lifecycle-${item.value}`}
            value={item.value}
          >
            {item.label}
          </option>
        ))}
      </select>
      <button
        data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.FILTER_MISSING_LABEL.uuid}
        type="button"
        onClick={() => dispatch({ type: 'TOGGLE_MISSING_SOURCE' })}
        className={`mx-3 mb-3 flex w-[calc(100%-1.5rem)] items-center gap-2 rounded border px-2 py-1.5 text-start text-sm ${
          state.missingSourceOnly ? 'border-primary bg-primary-container' : 'border-outline-variant'
        }`}
      >
        <input
          data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.FILTER_MISSING_CHECKBOX.uuid}
          type="checkbox"
          checked={state.missingSourceOnly}
          readOnly
          className="pointer-events-none"
        />
        Missing source only
      </button>
    </>
  );
}
