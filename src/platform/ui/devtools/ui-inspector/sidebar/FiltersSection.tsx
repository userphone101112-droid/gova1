'use client';

import { DEVTOOLS } from '@/platform/ui/registry/features/devtools';

import { useInspectorContext } from '../state/InspectorProvider';
import { LIFECYCLE_FILTERS, TAG_FILTERS } from '../utils/constants';

import { FieldGroup, inspectorFieldInputClass, inspectorFieldSelectClass } from './FieldGroup';

export function FiltersSection() {
  const { state, dispatch, selectors } = useInspectorContext();
  const featureOptions = selectors.featureOptions;

  return (
    <div className="flex flex-col gap-3 px-3 pb-3">
      <FieldGroup
        label="Search"
        hint="Filter elements by UUID, id, path, or feature name."
        labelUuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.SEARCH_LABEL.uuid}
        instanceId="filter-search"
      >
        <input
          data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.SEARCH_INPUT.uuid}
          value={state.search}
          onChange={(e) => dispatch({ type: 'SET_SEARCH', search: e.target.value })}
          placeholder="UUID, id, path, feature..."
          className={inspectorFieldInputClass}
        />
      </FieldGroup>

      <FieldGroup
        label="Feature"
        hint="Show elements belonging to a specific feature module."
        labelUuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.FILTER_FEATURE_LABEL.uuid}
        instanceId="filter-feature"
      >
        <select
          data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.FILTER_FEATURE_SELECT.uuid}
          value={state.featureFilter}
          onChange={(e) => dispatch({ type: 'SET_FEATURE_FILTER', featureFilter: e.target.value })}
          className={inspectorFieldSelectClass}
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
      </FieldGroup>

      <FieldGroup
        label="Tag type"
        hint="Filter by HTML tag or component tag category."
        labelUuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.FILTER_TAG_LABEL.uuid}
        instanceId="filter-tag"
      >
        <select
          data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.FILTER_TAG_SELECT.uuid}
          value={state.tagFilter}
          onChange={(e) => dispatch({ type: 'SET_TAG_FILTER', tagFilter: e.target.value })}
          className={inspectorFieldSelectClass}
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
      </FieldGroup>

      <FieldGroup
        label="Lifecycle"
        hint="Filter by element lifecycle stage (e.g. stable, experimental)."
        labelUuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.FILTER_LIFECYCLE_LABEL.uuid}
        instanceId="filter-lifecycle"
      >
        <select
          data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.FILTER_LIFECYCLE_SELECT.uuid}
          value={state.lifecycleFilter}
          onChange={(e) => dispatch({ type: 'SET_LIFECYCLE_FILTER', lifecycleFilter: e.target.value })}
          className={inspectorFieldSelectClass}
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
      </FieldGroup>

      <FieldGroup
        label="Missing source only"
        hint="Show only elements without a resolved source file path."
        labelUuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.FILTER_MISSING_LABEL.uuid}
        instanceId="filter-missing"
      >
        <button
          type="button"
          onClick={() => dispatch({ type: 'TOGGLE_MISSING_SOURCE' })}
          className={`flex w-full items-center gap-2 rounded border px-2 py-1.5 text-start text-sm ${
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
          Show missing source only
        </button>
      </FieldGroup>
    </div>
  );
}
