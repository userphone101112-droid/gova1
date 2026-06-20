'use client';

import { DEVTOOLS } from '@/platform/ui/registry/features/devtools';

import { useStorageSettings } from '../hooks/useStorageSettings';
import { getSidebarSubpanelClass } from '../utils/sidebar-section-theme';

import { FieldGroup, inspectorFieldSelectClass, inspectorPanelStackClass } from './FieldGroup';

export function StorageSection() {
  const { formState, folders, subfolderOptions, handleStorageToggle, setMainFile, setSubFile } =
    useStorageSettings();

  return (
    <section
      data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DATA.CONTAINER.uuid}
      data-ui-instance-id="storage-panel"
      className={`${inspectorPanelStackClass} ${getSidebarSubpanelClass('storage')}`}
    >
      <FieldGroup
        label="Storage binding"
        hint="Enable to link the selected element to a main file and sub file."
        labelUuid={DEVTOOLS.UI_INSPECTOR.DATA.DATABASE_LABEL.uuid}
        instanceId="storage-toggle"
      >
        <button
          data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DATA.ATTRIBUTES_TOGGLE.uuid}
          data-ui-instance-id="storage-toggle-button"
          type="button"
          onClick={handleStorageToggle}
          className={`w-fit rounded px-3 py-1 text-xs ${
            formState.storageEnabled ? 'bg-primary text-on-primary' : 'border border-outline-variant'
          }`}
        >
          {formState.storageEnabled ? 'ON' : 'OFF'}
        </button>
      </FieldGroup>

      {formState.storageEnabled && (
        <>
          <FieldGroup
            label="Main file"
            hint="Top-level folder from storage.json linked to this element."
            labelUuid={DEVTOOLS.UI_INSPECTOR.DATA.INF1_LABEL.uuid}
            instanceId="storage-main"
          >
            <select
              data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DATA.INF1_INPUT.uuid}
              data-ui-instance-id="storage-main-select"
              value={formState.storageMainFile}
              onChange={(e) => setMainFile(e.target.value)}
              className={inspectorFieldSelectClass}
            >
              <option
                data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.FILTER_FEATURE_OPTION.uuid}
                data-ui-instance-id="storage-main-empty"
                value=""
              >
                Select main file...
              </option>
              {folders.map((folder) => (
                <option
                  key={folder.name}
                  data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.FILTER_FEATURE_OPTION.uuid}
                  data-ui-instance-id={`storage-main-${folder.name}`}
                  value={folder.name}
                >
                  {folder.name}
                </option>
              ))}
            </select>
          </FieldGroup>

          <FieldGroup
            label="Sub file"
            hint="Subfolder under the selected main file."
            labelUuid={DEVTOOLS.UI_INSPECTOR.DATA.INF2_LABEL.uuid}
            instanceId="storage-sub"
          >
            <select
              data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DATA.INF2_INPUT.uuid}
              data-ui-instance-id="storage-sub-select"
              value={formState.storageSubFile}
              disabled={!formState.storageMainFile}
              onChange={(e) => setSubFile(e.target.value)}
              className={`${inspectorFieldSelectClass} disabled:opacity-50`}
            >
              <option
                data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.FILTER_TAG_OPTION.uuid}
                data-ui-instance-id="storage-sub-empty"
                value=""
              >
                Select sub file...
              </option>
              {subfolderOptions.map((sub) => (
                <option
                  key={sub.name}
                  data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.FILTER_TAG_OPTION.uuid}
                  data-ui-instance-id={`storage-sub-${sub.name}`}
                  value={sub.name}
                >
                  {sub.name}
                </option>
              ))}
            </select>
          </FieldGroup>
        </>
      )}
    </section>
  );
}
