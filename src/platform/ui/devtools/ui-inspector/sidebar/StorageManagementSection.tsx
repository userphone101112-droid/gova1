'use client';

import { DEVTOOLS } from '@/platform/ui/registry/features/devtools';

import { useStorageManagement } from '../hooks/useStorageManagement';

import { FieldGroup, inspectorFieldInputClass, inspectorFieldSelectClass } from './FieldGroup';

const inputClass = inspectorFieldInputClass;
const actionClass = 'rounded border border-outline-variant px-2 py-1 text-xs hover:bg-surface-variant';

function DescriptionBlock({
  label,
  hint,
  value,
  onChange,
  onSave,
  saving,
  instanceId,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  saving: boolean;
  instanceId: string;
}) {
  return (
    <div
      data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DBMGMT.CONTAINER.uuid}
      data-ui-instance-id={`${instanceId}-block`}
      className="border-t border-outline-variant/60 px-3 py-3"
    >
      <FieldGroup label={label} hint={hint} instanceId={instanceId}>
        <textarea
          data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DBMGMT.DESC_TEXTAREA.uuid}
          data-ui-instance-id={instanceId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className={inputClass}
        />
        <button
          data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DBMGMT.SAVE_DESC_BUTTON.uuid}
          data-ui-instance-id={instanceId}
          type="button"
          onClick={onSave}
          disabled={saving}
          className={`${actionClass} mt-1 disabled:opacity-60`}
        >
          {saving ? 'Saving...' : 'Save Description'}
        </button>
      </FieldGroup>
    </div>
  );
}

function NameFields({
  name,
  onRename,
  onDelete,
  deleteLabel,
  busy,
  instancePrefix,
}: {
  name: string;
  onRename: (value: string) => void;
  onDelete: () => void;
  deleteLabel: string;
  busy: boolean;
  instancePrefix: string;
}) {
  return (
    <div
      data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DBMGMT.CONTAINER.uuid}
      data-ui-instance-id={`${instancePrefix}-fields`}
      className="flex flex-col gap-3 px-3 pb-2"
    >
      <FieldGroup
        label="Folder name"
        hint="Rename on blur. Updates storage.json."
        instanceId={`${instancePrefix}-name`}
      >
        <input
          data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DBREF.DB_EN_INPUT.uuid}
          data-ui-instance-id={`${instancePrefix}-name`}
          defaultValue={name}
          key={`${instancePrefix}-name-${name}`}
          onBlur={(e) => {
            if (e.target.value.trim() !== name) {
              void onRename(e.target.value);
            }
          }}
          className={inputClass}
        />
      </FieldGroup>
      <FieldGroup label="Delete" hint="Remove this folder from storage.json." instanceId={`${instancePrefix}-delete-group`}>
        <button
          data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DBREF.DELETE_DB.uuid}
          data-ui-instance-id={`${instancePrefix}-delete`}
          type="button"
          onClick={() => void onDelete()}
          disabled={busy}
          className={`${actionClass} w-fit text-error disabled:opacity-60`}
        >
          {deleteLabel}
        </button>
      </FieldGroup>
    </div>
  );
}

export function StorageManagementSection() {
  const {
    folders,
    subfolders,
    selectedFolder,
    selectedSubfolder,
    mainFileName,
    subFileName,
    mainDescriptionDraft,
    subDescriptionDraft,
    setMainFileName,
    setSubFileName,
    setMainDescriptionDraft,
    setSubDescriptionDraft,
    busy,
    savingDescription,
    handleAddMainFile,
    handleAddSubFile,
    handleRenameMainFile,
    handleRenameSubFile,
    handleDeleteMainFile,
    handleDeleteSubFile,
    saveMainDescription,
    saveSubDescription,
  } = useStorageManagement();

  return (
    <section
      data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DBMGMT.CONTAINER.uuid}
      data-ui-instance-id="storage-management-root"
      className="flex flex-col"
    >
      <div
        data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DBMGMT.CONTAINER.uuid}
        data-ui-instance-id="storage-main-header"
        className="flex flex-wrap items-center justify-between gap-2 px-3 pt-2"
      >
        <span
          data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DATA.DATABASE_LABEL.uuid}
          data-ui-instance-id="storage-main-title"
          className="text-xs font-medium text-on-surface"
        >
          Main files
        </span>
        <button
          data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DBREF.ADD_DB.uuid}
          data-ui-instance-id="storage-add-main"
          type="button"
          onClick={() => void handleAddMainFile()}
          disabled={busy}
          className={`${actionClass} disabled:opacity-60`}
        >
          + Main File
        </button>
      </div>
      <div className="px-3 pb-2">
        <FieldGroup
          label="Select main file"
          hint="Top-level storage folder to edit or manage subfolders."
          labelUuid={DEVTOOLS.UI_INSPECTOR.DBREF.DB_SELECT.uuid}
          instanceId="storage-main-select"
        >
          <select
            data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DBREF.DB_SELECT.uuid}
            data-ui-instance-id="storage-main-select"
            value={mainFileName}
            onChange={(e) => {
              setMainFileName(e.target.value);
              setSubFileName('');
            }}
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
                data-ui-instance-id={`storage-mgmt-main-${folder.name}`}
                value={folder.name}
              >
                {folder.name}
              </option>
            ))}
          </select>
        </FieldGroup>
      </div>

      {selectedFolder && (
        <>
          <NameFields
            name={selectedFolder.name}
            onRename={handleRenameMainFile}
            onDelete={handleDeleteMainFile}
            deleteLabel="Delete main file"
            busy={busy}
            instancePrefix="storage-main"
          />
          <DescriptionBlock
            label="Main file description"
            hint="Description stored in storage.json for this main file."
            value={mainDescriptionDraft}
            onChange={setMainDescriptionDraft}
            onSave={() => void saveMainDescription()}
            saving={savingDescription === 'main'}
            instanceId="storage-main-desc"
          />
        </>
      )}

      {mainFileName && (
        <>
          <div
            data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DBMGMT.CONTAINER.uuid}
            data-ui-instance-id="storage-sub-header"
            className="flex flex-wrap items-center justify-between gap-2 px-3 pt-2"
          >
            <span
              data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DATA.INF2_LABEL.uuid}
              data-ui-instance-id="storage-sub-title"
              className="text-xs font-medium text-on-surface"
            >
              Sub files
            </span>
            <button
              data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DBREF.ADD_TABLE.uuid}
              data-ui-instance-id="storage-add-sub"
              type="button"
              onClick={() => void handleAddSubFile()}
              disabled={busy}
              className={`${actionClass} disabled:opacity-60`}
            >
              + Sub File
            </button>
          </div>
          <div className="px-3 pb-2">
            <FieldGroup
              label="Select sub file"
              hint="Subfolder under the selected main file."
              labelUuid={DEVTOOLS.UI_INSPECTOR.DBREF.TABLE_SELECT.uuid}
              instanceId="storage-sub-select"
            >
              <select
                data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DBREF.TABLE_SELECT.uuid}
                data-ui-instance-id="storage-sub-select"
                value={subFileName}
                onChange={(e) => setSubFileName(e.target.value)}
                className={inspectorFieldSelectClass}
              >
                <option
                  data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.FILTER_TAG_OPTION.uuid}
                  data-ui-instance-id="storage-sub-empty"
                  value=""
                >
                  Select sub file...
                </option>
                {subfolders.map((sub) => (
                  <option
                    key={sub.name}
                    data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.FILTER_TAG_OPTION.uuid}
                    data-ui-instance-id={`storage-mgmt-sub-${sub.name}`}
                    value={sub.name}
                  >
                    {sub.name}
                  </option>
                ))}
              </select>
            </FieldGroup>
          </div>
        </>
      )}

      {selectedSubfolder && (
        <>
          <NameFields
            name={selectedSubfolder.name}
            onRename={handleRenameSubFile}
            onDelete={handleDeleteSubFile}
            deleteLabel="Delete sub file"
            busy={busy}
            instancePrefix="storage-sub"
          />
          <DescriptionBlock
            label="Sub file description"
            hint="Description stored in storage.json for this sub file."
            value={subDescriptionDraft}
            onChange={setSubDescriptionDraft}
            onSave={() => void saveSubDescription()}
            saving={savingDescription === 'sub'}
            instanceId="storage-sub-desc"
          />
        </>
      )}
    </section>
  );
}
