'use client';

import { DEVTOOLS } from '@/platform/ui/registry/features/devtools';

import { useDatabaseManagement } from '../hooks/useDatabaseManagement';

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
        label="Name"
        hint="Canonical identifier. Renaming updates the schema key on blur."
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
      <FieldGroup label="Delete" hint="Permanently remove this entry from database_ref.json." instanceId={`${instancePrefix}-delete-group`}>
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

export function DatabaseManagementSection() {
  const {
    databases,
    tables,
    columns,
    selectedDb,
    selectedTable,
    selectedColumn,
    databaseName,
    tableName,
    columnName,
    dbDescriptionDraft,
    tableDescriptionDraft,
    columnDescriptionDraft,
    setDbDescriptionDraft,
    setTableDescriptionDraft,
    setColumnDescriptionDraft,
    selectDatabase,
    selectTable,
    selectColumn,
    saveDescription,
    savingLevel,
    schemaBusy,
    handleAddDatabase,
    handleAddTable,
    handleAddColumn,
    handleRenameDatabase,
    handleRenameTable,
    handleRenameColumn,
    handleDeleteDatabase,
    handleDeleteTable,
    handleDeleteColumn,
  } = useDatabaseManagement();

  return (
    <section
      data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DBMGMT.CONTAINER.uuid}
      data-ui-instance-id="db-management-root"
      className="flex flex-col"
    >
      <div
        data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DBMGMT.CONTAINER.uuid}
        data-ui-instance-id="mgmt-db-header"
        className="flex flex-wrap items-center justify-between gap-2 px-3 pt-2"
      >
        <span
          data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DATA.DATABASE_LABEL.uuid}
          data-ui-instance-id="mgmt-db-title"
          className="text-xs font-medium text-on-surface"
        >
          Database catalog
        </span>
        <button
          data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DBREF.ADD_DB.uuid}
          type="button"
          onClick={() => void handleAddDatabase()}
          disabled={schemaBusy}
          className={`${actionClass} disabled:opacity-60`}
        >
          + Database
        </button>
      </div>
      <div className="px-3 pb-2">
        <FieldGroup
          label="Select database"
          hint="Choose a database to edit names, description, or nested tables."
          labelUuid={DEVTOOLS.UI_INSPECTOR.DBREF.DB_SELECT.uuid}
          instanceId="mgmt-db-select"
        >
          <select
            data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DBREF.DB_SELECT.uuid}
            data-ui-instance-id="mgmt-db-select"
            value={databaseName}
            onChange={(e) => selectDatabase(e.target.value)}
            className={inspectorFieldSelectClass}
          >
            <option
              data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.FILTER_FEATURE_OPTION.uuid}
              data-ui-instance-id="mgmt-db-empty"
              value=""
            >
              Select database...
            </option>
            {databases.map((db) => (
              <option
                key={db.name}
                data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.FILTER_FEATURE_OPTION.uuid}
                data-ui-instance-id={`mgmt-db-${db.name}`}
                value={db.name}
              >
                {db.name}
              </option>
            ))}
          </select>
        </FieldGroup>
      </div>

      {selectedDb && (
        <>
          <NameFields
            name={selectedDb.name}
            onRename={handleRenameDatabase}
            onDelete={handleDeleteDatabase}
            deleteLabel="Delete database"
            busy={schemaBusy}
            instancePrefix="mgmt-db"
          />
          <DescriptionBlock
            label="Database description"
            hint="Long-form notes about this database. Saved to database_ref.json."
            value={dbDescriptionDraft}
            onChange={setDbDescriptionDraft}
            onSave={() => void saveDescription('database')}
            saving={savingLevel === 'database'}
            instanceId="mgmt-db-desc"
          />
        </>
      )}

      {databaseName && (
        <>
          <div
            data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DBMGMT.CONTAINER.uuid}
            data-ui-instance-id="mgmt-table-header"
            className="flex flex-wrap items-center justify-between gap-2 px-3 pt-2"
          >
            <span
              data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DATA.INF2_LABEL.uuid}
              data-ui-instance-id="mgmt-table-title"
              className="text-xs font-medium text-on-surface"
            >
              Tables
            </span>
            <button
              data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DBREF.ADD_TABLE.uuid}
              type="button"
              onClick={() => void handleAddTable()}
              disabled={schemaBusy}
              className={`${actionClass} disabled:opacity-60`}
            >
              + Table
            </button>
          </div>
          <div className="px-3 pb-2">
            <FieldGroup
              label="Select table"
              hint="Choose a table within the selected database."
              labelUuid={DEVTOOLS.UI_INSPECTOR.DBREF.TABLE_SELECT.uuid}
              instanceId="mgmt-table-select"
            >
              <select
                data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DBREF.TABLE_SELECT.uuid}
                data-ui-instance-id="mgmt-table-select"
                value={tableName}
                onChange={(e) => selectTable(e.target.value)}
                className={inspectorFieldSelectClass}
              >
                <option
                  data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.FILTER_TAG_OPTION.uuid}
                  data-ui-instance-id="mgmt-table-empty"
                  value=""
                >
                  Select table...
                </option>
                {tables.map((table) => (
                  <option
                    key={table.name}
                    data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.FILTER_TAG_OPTION.uuid}
                    data-ui-instance-id={`mgmt-table-${table.name}`}
                    value={table.name}
                  >
                    {table.name}
                  </option>
                ))}
              </select>
            </FieldGroup>
          </div>
        </>
      )}

      {selectedTable && (
        <>
          <NameFields
            name={selectedTable.name}
            onRename={handleRenameTable}
            onDelete={handleDeleteTable}
            deleteLabel="Delete table"
            busy={schemaBusy}
            instancePrefix="mgmt-table"
          />
          <DescriptionBlock
            label="Table description"
            hint="Long-form notes about this table."
            value={tableDescriptionDraft}
            onChange={setTableDescriptionDraft}
            onSave={() => void saveDescription('table')}
            saving={savingLevel === 'table'}
            instanceId="mgmt-table-desc"
          />
        </>
      )}

      {tableName && (
        <>
          <div
            data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DBMGMT.CONTAINER.uuid}
            data-ui-instance-id="mgmt-column-header"
            className="flex flex-wrap items-center justify-between gap-2 px-3 pt-2"
          >
            <span
              data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DATA.INF3_LABEL.uuid}
              data-ui-instance-id="mgmt-column-title"
              className="text-xs font-medium text-on-surface"
            >
              Columns
            </span>
            <button
              data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DBREF.ADD_COLUMN.uuid}
              type="button"
              onClick={() => void handleAddColumn()}
              disabled={schemaBusy}
              className={`${actionClass} disabled:opacity-60`}
            >
              + Column
            </button>
          </div>
          <div className="px-3 pb-2">
            <FieldGroup
              label="Select column"
              hint="Choose a column within the selected table."
              labelUuid={DEVTOOLS.UI_INSPECTOR.DBREF.COLUMN_SELECT.uuid}
              instanceId="mgmt-column-select"
            >
              <select
                data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DBREF.COLUMN_SELECT.uuid}
                data-ui-instance-id="mgmt-column-select"
                value={columnName}
                onChange={(e) => selectColumn(e.target.value)}
                className={inspectorFieldSelectClass}
              >
                <option
                  data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.FILTER_LIFECYCLE_OPTION.uuid}
                  data-ui-instance-id="mgmt-column-empty"
                  value=""
                >
                  Select column...
                </option>
                {columns.map((column) => (
                  <option
                    key={column.name}
                    data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.FILTER_LIFECYCLE_OPTION.uuid}
                    data-ui-instance-id={`mgmt-column-${column.name}`}
                    value={column.name}
                  >
                    {column.name}
                  </option>
                ))}
              </select>
            </FieldGroup>
          </div>
        </>
      )}

      {selectedColumn && (
        <>
          <NameFields
            name={selectedColumn.name}
            onRename={handleRenameColumn}
            onDelete={handleDeleteColumn}
            deleteLabel="Delete column"
            busy={schemaBusy}
            instancePrefix="mgmt-column"
          />
          <DescriptionBlock
            label="Column description"
            hint="Long-form notes about this column."
            value={columnDescriptionDraft}
            onChange={setColumnDescriptionDraft}
            onSave={() => void saveDescription('column')}
            saving={savingLevel === 'column'}
            instanceId="mgmt-column-desc"
          />
        </>
      )}
    </section>
  );
}
