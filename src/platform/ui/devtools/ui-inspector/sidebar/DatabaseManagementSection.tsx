'use client';

import { DEVTOOLS } from '@/platform/ui/registry/features/devtools';

import { useDatabaseManagement } from '../hooks/useDatabaseManagement';

const inputClass = 'w-full rounded border border-outline-variant bg-surface px-2 py-1 text-xs';
const actionClass = 'rounded border border-outline-variant px-2 py-1 text-xs hover:bg-surface-variant';

function DescriptionBlock({
  label,
  value,
  onChange,
  onSave,
  saving,
  instanceId,
}: {
  label: string;
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
      className="space-y-2 border-t border-outline-variant/60 px-3 py-3"
    >
      <span
        data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DBMGMT.DESC_TEXTAREA.uuid}
        data-ui-instance-id={`${instanceId}-label`}
        className="text-[11px] font-medium text-on-surface-variant"
      >
        {label}
      </span>
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
        className={`${actionClass} disabled:opacity-60`}
      >
        {saving ? 'Saving...' : 'Save Description'}
      </button>
    </div>
  );
}

function SchemaFields({
  nameEn,
  nameAr,
  onRenameEn,
  onUpdateAr,
  onDelete,
  deleteLabel,
  busy,
  instancePrefix,
}: {
  nameEn: string;
  nameAr: string;
  onRenameEn: (value: string) => void;
  onUpdateAr: (value: string) => void;
  onDelete: () => void;
  deleteLabel: string;
  busy: boolean;
  instancePrefix: string;
}) {
  return (
    <div
      data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DBMGMT.CONTAINER.uuid}
      data-ui-instance-id={`${instancePrefix}-fields`}
      className="space-y-2 px-3 pb-2"
    >
      <input
        data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DBREF.DB_AR_INPUT.uuid}
        data-ui-instance-id={`${instancePrefix}-ar`}
        defaultValue={nameAr}
        key={`${instancePrefix}-ar-${nameEn}`}
        onBlur={(e) => onUpdateAr(e.target.value)}
        placeholder="name_ar"
        className={inputClass}
      />
      <input
        data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DBREF.DB_EN_INPUT.uuid}
        data-ui-instance-id={`${instancePrefix}-en`}
        defaultValue={nameEn}
        key={`${instancePrefix}-en-${nameEn}`}
        onBlur={(e) => {
          if (e.target.value.trim() !== nameEn) {
            void onRenameEn(e.target.value);
          }
        }}
        placeholder="name_en"
        className={inputClass}
      />
      <button
        data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DBREF.DELETE_DB.uuid}
        data-ui-instance-id={`${instancePrefix}-delete`}
        type="button"
        onClick={() => void onDelete()}
        disabled={busy}
        className={`${actionClass} text-error disabled:opacity-60`}
      >
        {deleteLabel}
      </button>
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
    databaseNameEn,
    tableNameEn,
    columnNameEn,
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
    updateNameAr,
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
        className="flex items-center justify-between gap-2 px-3 pt-2"
      >
        <span
          data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DATA.DATABASE_LABEL.uuid}
          data-ui-instance-id="mgmt-db-title"
          className="text-[11px] font-medium text-on-surface-variant"
        >
          Database
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
      <select
        data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DBREF.DB_SELECT.uuid}
        data-ui-instance-id="mgmt-db-select"
        value={databaseNameEn}
        onChange={(e) => selectDatabase(e.target.value)}
        className={`${inputClass} mx-3 mt-1`}
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
            key={db.name_en}
            data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.FILTER_FEATURE_OPTION.uuid}
            data-ui-instance-id={`mgmt-db-${db.name_en}`}
            value={db.name_en}
          >
            {db.name_en}
          </option>
        ))}
      </select>

      {selectedDb && (
        <>
          <SchemaFields
            nameEn={selectedDb.name_en}
            nameAr={selectedDb.name_ar ?? ''}
            onRenameEn={handleRenameDatabase}
            onUpdateAr={(value) => void updateNameAr('database', value)}
            onDelete={handleDeleteDatabase}
            deleteLabel="Delete database"
            busy={schemaBusy}
            instancePrefix="mgmt-db"
          />
          <DescriptionBlock
            label="Database Description"
            value={dbDescriptionDraft}
            onChange={setDbDescriptionDraft}
            onSave={() => void saveDescription('database')}
            saving={savingLevel === 'database'}
            instanceId="mgmt-db-desc"
          />
        </>
      )}

      {databaseNameEn && (
        <>
          <div
            data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DBMGMT.CONTAINER.uuid}
            data-ui-instance-id="mgmt-table-header"
            className="flex items-center justify-between gap-2 px-3 pt-2"
          >
            <span
              data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DATA.INF2_LABEL.uuid}
              data-ui-instance-id="mgmt-table-title"
              className="text-[11px] font-medium text-on-surface-variant"
            >
              Table
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
          <select
            data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DBREF.TABLE_SELECT.uuid}
            data-ui-instance-id="mgmt-table-select"
            value={tableNameEn}
            onChange={(e) => selectTable(e.target.value)}
            className={`${inputClass} mx-3 mt-1`}
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
                key={table.name_en}
                data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.FILTER_TAG_OPTION.uuid}
                data-ui-instance-id={`mgmt-table-${table.name_en}`}
                value={table.name_en}
              >
                {table.name_en}
              </option>
            ))}
          </select>
        </>
      )}

      {selectedTable && (
        <>
          <SchemaFields
            nameEn={selectedTable.name_en}
            nameAr={selectedTable.name_ar ?? ''}
            onRenameEn={handleRenameTable}
            onUpdateAr={(value) => void updateNameAr('table', value)}
            onDelete={handleDeleteTable}
            deleteLabel="Delete table"
            busy={schemaBusy}
            instancePrefix="mgmt-table"
          />
          <DescriptionBlock
            label="Table Description"
            value={tableDescriptionDraft}
            onChange={setTableDescriptionDraft}
            onSave={() => void saveDescription('table')}
            saving={savingLevel === 'table'}
            instanceId="mgmt-table-desc"
          />
        </>
      )}

      {tableNameEn && (
        <>
          <div
            data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DBMGMT.CONTAINER.uuid}
            data-ui-instance-id="mgmt-column-header"
            className="flex items-center justify-between gap-2 px-3 pt-2"
          >
            <span
              data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DATA.INF3_LABEL.uuid}
              data-ui-instance-id="mgmt-column-title"
              className="text-[11px] font-medium text-on-surface-variant"
            >
              Column
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
          <select
            data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DBREF.COLUMN_SELECT.uuid}
            data-ui-instance-id="mgmt-column-select"
            value={columnNameEn}
            onChange={(e) => selectColumn(e.target.value)}
            className={`${inputClass} mx-3 mt-1`}
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
                key={column.name_en}
                data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.FILTER_LIFECYCLE_OPTION.uuid}
                data-ui-instance-id={`mgmt-column-${column.name_en}`}
                value={column.name_en}
              >
                {column.name_en}
              </option>
            ))}
          </select>
        </>
      )}

      {selectedColumn && (
        <>
          <SchemaFields
            nameEn={selectedColumn.name_en}
            nameAr={selectedColumn.name_ar ?? ''}
            onRenameEn={handleRenameColumn}
            onUpdateAr={(value) => void updateNameAr('column', value)}
            onDelete={handleDeleteColumn}
            deleteLabel="Delete column"
            busy={schemaBusy}
            instancePrefix="mgmt-column"
          />
          <DescriptionBlock
            label="Column Description"
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
