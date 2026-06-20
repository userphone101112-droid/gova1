'use client';

import { DEVTOOLS } from '@/platform/ui/registry/features/devtools';

import { useDatabaseSettings } from '../hooks/useDatabaseSettings';
import { getEntityDescription } from '../data/database-ref-utils';
import { getSidebarSubpanelClass } from '../utils/sidebar-section-theme';

import {
  FieldGroup,
  inspectorFieldInputClass,
  inspectorFieldSelectClass,
  inspectorPanelStackClass,
} from './FieldGroup';

export function DatabaseSection() {
  const {
    formState,
    databaseRef,
    tableOptions,
    columnOptions,
    handleDatabaseToggle,
    setDatabaseName,
    setTableName,
    setColumnName,
    setAdditionalInfo,
  } = useDatabaseSettings();

  return (
    <section
      data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DATA.CONTAINER.uuid}
      data-ui-instance-id="database-panel"
      className={`${inspectorPanelStackClass} ${getSidebarSubpanelClass('database')}`}
    >
      <FieldGroup
        label="Database binding"
        hint="Enable to link the selected element to a database, table, and column."
        labelUuid={DEVTOOLS.UI_INSPECTOR.DATA.DATABASE_LABEL.uuid}
        instanceId="db-toggle"
      >
        <button
          data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DATA.DATABASE_TOGGLE.uuid}
          type="button"
          onClick={handleDatabaseToggle}
          className={`w-fit rounded px-3 py-1 text-xs ${
            formState.databaseEnabled ? 'bg-primary text-on-primary' : 'border border-outline-variant'
          }`}
        >
          {formState.databaseEnabled ? 'ON' : 'OFF'}
        </button>
      </FieldGroup>

      {formState.databaseEnabled && (
        <>
          <FieldGroup
            label="Database name"
            hint="Pick the target database from database_ref.json."
            labelUuid={DEVTOOLS.UI_INSPECTOR.DATA.INF1_LABEL.uuid}
            instanceId="db-name"
          >
            <select
              data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DATA.INF1_INPUT.uuid}
              data-ui-instance-id="db-name-select"
              value={formState.databaseName}
              onChange={(e) => setDatabaseName(e.target.value)}
              className={inspectorFieldSelectClass}
            >
              <option value="">Select database...</option>
              {databaseRef.databases.map((db) => (
                <option
                  key={db.name}
                  data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.FILTER_FEATURE_OPTION.uuid}
                  data-ui-instance-id={`element-db-${db.name}`}
                  value={db.name}
                >
                  {getEntityDescription(db) ? `${db.name} — ${getEntityDescription(db)}` : db.name}
                </option>
              ))}
            </select>
          </FieldGroup>

          <FieldGroup
            label="Table name"
            hint="Table within the selected database."
            labelUuid={DEVTOOLS.UI_INSPECTOR.DATA.INF2_LABEL.uuid}
            instanceId="table-name"
          >
            <select
              data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DATA.INF2_INPUT.uuid}
              data-ui-instance-id="table-name-select"
              value={formState.tableName}
              disabled={!formState.databaseName}
              onChange={(e) => setTableName(e.target.value)}
              className={`${inspectorFieldSelectClass} disabled:opacity-50`}
            >
              <option value="">Select table...</option>
              {tableOptions.map((table) => (
                <option
                  key={table.name}
                  data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.FILTER_TAG_OPTION.uuid}
                  data-ui-instance-id={`element-table-${table.name}`}
                  value={table.name}
                >
                  {getEntityDescription(table) ? `${table.name} — ${getEntityDescription(table)}` : table.name}
                </option>
              ))}
            </select>
          </FieldGroup>

          <FieldGroup
            label="Column name"
            hint="Column within the selected table."
            labelUuid={DEVTOOLS.UI_INSPECTOR.DATA.INF3_LABEL.uuid}
            instanceId="column-name"
          >
            <select
              data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DATA.INF3_INPUT.uuid}
              data-ui-instance-id="column-name-select"
              value={formState.columnName}
              disabled={!formState.tableName}
              onChange={(e) => setColumnName(e.target.value)}
              className={`${inspectorFieldSelectClass} disabled:opacity-50`}
            >
              <option value="">Select column...</option>
              {columnOptions.map((column) => (
                <option
                  key={column.name}
                  data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.FILTER_LIFECYCLE_OPTION.uuid}
                  data-ui-instance-id={`element-column-${column.name}`}
                  value={column.name}
                >
                  {getEntityDescription(column) ? `${column.name} — ${getEntityDescription(column)}` : column.name}
                </option>
              ))}
            </select>
          </FieldGroup>

          <FieldGroup
            label="Additional info (inf1)"
            hint="Free-text note saved with this element only."
            labelUuid={DEVTOOLS.UI_INSPECTOR.DATA.ATTRIBUTES_LABEL.uuid}
            instanceId="additional-inf1"
          >
            <input
              data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DBREF.DB_AR_INPUT.uuid}
              data-ui-instance-id="additional-inf1-input"
              value={formState.inf1}
              onChange={(e) => setAdditionalInfo('inf1', e.target.value)}
              className={inspectorFieldInputClass}
            />
          </FieldGroup>

          <FieldGroup
            label="Additional info (inf2)"
            hint="Second free-text field for element metadata."
            instanceId="additional-inf2"
          >
            <input
              data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DBREF.TABLE_AR_INPUT.uuid}
              data-ui-instance-id="additional-inf2-input"
              value={formState.inf2}
              onChange={(e) => setAdditionalInfo('inf2', e.target.value)}
              className={inspectorFieldInputClass}
            />
          </FieldGroup>

          <FieldGroup
            label="Additional info (inf3)"
            hint="Third free-text field for element metadata."
            instanceId="additional-inf3"
          >
            <input
              data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DBREF.COLUMN_AR_INPUT.uuid}
              data-ui-instance-id="additional-inf3-input"
              value={formState.inf3}
              onChange={(e) => setAdditionalInfo('inf3', e.target.value)}
              className={inspectorFieldInputClass}
            />
          </FieldGroup>
        </>
      )}
    </section>
  );
}
