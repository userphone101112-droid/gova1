'use client';

import { DEVTOOLS } from '@/platform/ui/registry/features/devtools';

import { useDatabaseSettings } from '../hooks/useDatabaseSettings';

export function DatabaseSection() {
  const {
    formState,
    databaseRef,
    tableOptions,
    columnOptions,
    handleDatabaseToggle,
    setDatabaseId,
    setTableId,
    setFieldId,
  } = useDatabaseSettings();

  return (
    <section
      data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DATA.CONTAINER.uuid}
      data-ui-instance-id="database-panel"
      className="grid grid-cols-[1fr_auto] gap-x-2 gap-y-2 border-b border-outline-variant px-3 py-3"
    >
      <span
        data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DATA.DATABASE_LABEL.uuid}
        className="self-center text-xs font-medium"
      >
        Database
      </span>
      <button
        data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DATA.DATABASE_TOGGLE.uuid}
        type="button"
        onClick={handleDatabaseToggle}
        className={`rounded px-2 py-0.5 text-xs ${
          formState.databaseEnabled ? 'bg-primary text-on-primary' : 'border border-outline-variant'
        }`}
      >
        {formState.databaseEnabled ? 'ON' : 'OFF'}
      </button>
      {formState.databaseEnabled && (
        <>
          <select
            data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DATA.INF1_INPUT.uuid}
            value={formState.inf1}
            onChange={(e) => setDatabaseId(e.target.value)}
            className="col-span-2 w-full rounded border border-outline-variant bg-surface px-2 py-1 text-xs"
          >
            {[
              { value: '', label: 'Select database...' },
              ...databaseRef.databases.map((db) => ({
                value: db.name_en,
                label: `${db.name_en} (${db.name_ar})`,
              })),
            ].map((item) => (
              <option
                key={item.value || 'empty-db'}
                data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DATA.INF1_LABEL.uuid}
                data-ui-instance-id={`element-db-${item.value || 'empty'}`}
                value={item.value}
              >
                {item.label}
              </option>
            ))}
          </select>
          <select
            data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DATA.INF2_INPUT.uuid}
            value={formState.inf2}
            disabled={!formState.inf1}
            onChange={(e) => setTableId(e.target.value)}
            className="col-span-2 w-full rounded border border-outline-variant bg-surface px-2 py-1 text-xs disabled:opacity-50"
          >
            {[
              { value: '', label: 'Select table...' },
              ...tableOptions.map((table) => ({
                value: table.name_en,
                label: `${table.name_en} (${table.name_ar})`,
              })),
            ].map((item) => (
              <option
                key={item.value || 'empty-table'}
                data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DATA.INF2_LABEL.uuid}
                data-ui-instance-id={`element-table-${item.value || 'empty'}`}
                value={item.value}
              >
                {item.label}
              </option>
            ))}
          </select>
          <select
            data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DATA.INF3_INPUT.uuid}
            value={formState.inf3}
            disabled={!formState.inf2}
            onChange={(e) => setFieldId(e.target.value)}
            className="col-span-2 w-full rounded border border-outline-variant bg-surface px-2 py-1 text-xs disabled:opacity-50"
          >
            {[
              { value: '', label: 'Select column...' },
              ...columnOptions.map((column) => ({
                value: column.name_en,
                label: `${column.name_en} (${column.name_ar})`,
              })),
            ].map((item) => (
              <option
                key={item.value || 'empty-column'}
                data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DATA.INF3_LABEL.uuid}
                data-ui-instance-id={`element-column-${item.value || 'empty'}`}
                value={item.value}
              >
                {item.label}
              </option>
            ))}
          </select>
        </>
      )}
    </section>
  );
}
