'use client';

import { useCallback, useMemo } from 'react';

import {
  addColumn,
  addDatabase,
  addTable,
  findDatabase,
  findTable,
  getEntityDescription,
} from '../data/database-ref-utils';
import type { ElementBinding } from '../data/element-binding.types';
import { persistDatabaseRefFile } from '../services/database-ref.service';
import { useInspectorContext } from '../state/InspectorProvider';
import { InspectorActionButton } from '../ui/InspectorActionButton';
import { InspectorField, inspectorInputClass } from '../ui/InspectorField';
import { InspectorSelect } from '../ui/InspectorSelect';
import { InspectorToggle } from '../ui/InspectorToggle';
import { DATABASE_QUICK_ADD_CONFIRM_MESSAGE } from '../utils/constants';
type DatabaseBindingEditorProps = {

  binding: ElementBinding;

  onChange: (patch: Partial<ElementBinding>) => void;

};



export function DatabaseBindingEditor({ binding, onChange }: DatabaseBindingEditorProps) {

  const { state, dispatch } = useInspectorContext();

  const databaseRef = state.databaseRef;



  const selectedDb = useMemo(

    () => findDatabase(databaseRef, binding.databaseName ?? ''),

    [databaseRef, binding.databaseName]

  );

  const tableOptions = selectedDb?.tables ?? [];

  const selectedTable = useMemo(

    () => findTable(selectedDb, binding.tableName ?? ''),

    [selectedDb, binding.tableName]

  );

  const columnOptions = selectedTable?.columns ?? [];



  const persistAndApply = useCallback(

    async (nextFile: typeof databaseRef) => {

      const saved = await persistDatabaseRefFile(nextFile, { message: DATABASE_QUICK_ADD_CONFIRM_MESSAGE });

      if (!saved) return false;

      dispatch({ type: 'SET_DATABASE_REF', data: nextFile });

      dispatch({ type: 'SET_DATABASE_REF_DRAFT', data: nextFile });

      return true;

    },

    [dispatch]

  );



  const handleQuickAddDatabase = useCallback(async () => {

    const next = addDatabase(databaseRef);

    const added = next.databases[next.databases.length - 1];

    if (!(await persistAndApply(next)) || !added) return;

    onChange({ databaseName: added.name, tableName: '', columnName: '' });

  }, [databaseRef, onChange, persistAndApply]);



  const handleQuickAddTable = useCallback(async () => {

    if (!binding.databaseName) return;

    const result = addTable(databaseRef, binding.databaseName);

    if (result.error) return;

    const table = result.file.databases

      .find((db) => db.name === binding.databaseName)

      ?.tables.at(-1);

    if (!(await persistAndApply(result.file)) || !table) return;

    onChange({ tableName: table.name, columnName: '' });

  }, [binding.databaseName, databaseRef, onChange, persistAndApply]);



  const handleQuickAddColumn = useCallback(async () => {

    if (!binding.databaseName || !binding.tableName) return;

    const result = addColumn(databaseRef, binding.databaseName, binding.tableName);

    if (result.error) return;

    const column = result.file.databases

      .find((db) => db.name === binding.databaseName)

      ?.tables.find((table) => table.name === binding.tableName)

      ?.columns.at(-1);

    if (!(await persistAndApply(result.file)) || !column) return;

    onChange({ columnName: column.name });

  }, [binding.databaseName, binding.tableName, databaseRef, onChange, persistAndApply]);



  return (

    <>

      <InspectorField

        label="Database"

        hint="Target database from database_ref.json."

        instanceId="db-binding-database"

      >

        <div className="flex gap-2">

          <InspectorSelect

            value={binding.databaseName ?? ''}

            onChange={(databaseName) => onChange({ databaseName, tableName: '', columnName: '' })}

            placeholder="Select database..."

            instanceId="db-binding-database-select"

            options={databaseRef.databases.map((db) => ({

              value: db.name,

              label: getEntityDescription(db) ? `${db.name} — ${getEntityDescription(db)}` : db.name,

            }))}

            className="min-w-0 flex-1"

          />

          <InspectorActionButton variant="secondary" onClick={() => void handleQuickAddDatabase()} instanceId="db-binding-add-db">

            + DB

          </InspectorActionButton>

        </div>

      </InspectorField>



      <InspectorField label="Table" hint="Table within the selected database." instanceId="db-binding-table">

        <div className="flex gap-2">

          <InspectorSelect

            value={binding.tableName ?? ''}

            onChange={(tableName) => onChange({ tableName, columnName: '' })}

            placeholder="Select table..."

            disabled={!binding.databaseName}

            instanceId="db-binding-table-select"

            options={tableOptions.map((table) => ({

              value: table.name,

              label: getEntityDescription(table) ? `${table.name} — ${getEntityDescription(table)}` : table.name,

            }))}

            className="min-w-0 flex-1"

          />

          <InspectorActionButton

            variant="secondary"

            onClick={() => void handleQuickAddTable()}

            disabled={!binding.databaseName}

            instanceId="db-binding-add-table"

          >

            + Table

          </InspectorActionButton>

        </div>

      </InspectorField>



      <InspectorField label="Column" hint="Column within the selected table." instanceId="db-binding-column">

        <div className="flex gap-2">

          <InspectorSelect

            value={binding.columnName ?? ''}

            onChange={(columnName) => onChange({ columnName })}

            placeholder="Select column..."

            disabled={!binding.tableName}

            instanceId="db-binding-column-select"

            options={columnOptions.map((column) => ({

              value: column.name,

              label: getEntityDescription(column)

                ? `${column.name} — ${getEntityDescription(column)}`

                : column.name,

            }))}

            className="min-w-0 flex-1"

          />

          <InspectorActionButton

            variant="secondary"

            onClick={() => void handleQuickAddColumn()}

            disabled={!binding.databaseName || !binding.tableName}

            instanceId="db-binding-add-column"

          >

            + Column

          </InspectorActionButton>

        </div>

      </InspectorField>



      <div className="flex flex-wrap gap-4">

        <InspectorField label="Required" inline instanceId="db-binding-required">

          <InspectorToggle

            checked={Boolean(binding.required)}

            onChange={(required) => onChange({ required })}

            instanceId="db-binding-required-toggle"

          />

        </InspectorField>

        <InspectorField label="Sensitive" inline instanceId="db-binding-sensitive">

          <InspectorToggle

            checked={Boolean(binding.sensitive)}

            onChange={(sensitive) => onChange({ sensitive })}

            instanceId="db-binding-sensitive-toggle"

          />

        </InspectorField>

      </div>



      <InspectorField label="Query hint" instanceId="db-binding-query-hint">

        <InspectorSelect

          value={binding.queryHint ?? ''}

          onChange={(queryHint) =>

            onChange(

              (queryHint ? { queryHint: queryHint as ElementBinding['queryHint'] } : {}) as Partial<ElementBinding>

            )

          }

          placeholder="None"

          instanceId="db-binding-query-hint-select"

          options={[

            { value: 'lookup', label: 'lookup' },

            { value: 'list', label: 'list' },

            { value: 'aggregate', label: 'aggregate' },

            { value: 'search', label: 'search' },

            { value: 'join', label: 'join' },

          ]}

        />

      </InspectorField>



      <InspectorField label="Index need" instanceId="db-binding-index">

        <InspectorSelect

          value={binding.indexNeed ?? ''}

          onChange={(indexNeed) =>

            onChange(

              (indexNeed ? { indexNeed: indexNeed as ElementBinding['indexNeed'] } : {}) as Partial<ElementBinding>

            )

          }

          placeholder="None"

          instanceId="db-binding-index-select"

          options={[

            { value: 'none', label: 'none' },

            { value: 'likely', label: 'likely' },

            { value: 'required', label: 'required' },

          ]}

        />

      </InspectorField>



      <InspectorField label="Mock value" hint="Sample value for simulation." instanceId="db-binding-mock">

        <input

          value={binding.mockValue ?? ''}

          onChange={(event) => onChange({ mockValue: event.target.value })}

          className={inspectorInputClass}

          data-ui-instance-id="db-binding-mock-input"

        />

      </InspectorField>

    </>

  );

}

