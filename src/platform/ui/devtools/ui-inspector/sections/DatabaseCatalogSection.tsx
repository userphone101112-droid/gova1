'use client';

import { ColumnEditor } from '../catalogs/database/ColumnEditor';
import { DatabaseCatalogTree } from '../catalogs/database/DatabaseCatalogTree';
import { DatabaseEditor } from '../catalogs/database/DatabaseEditor';
import { TableEditor } from '../catalogs/database/TableEditor';
import { useDatabaseCatalog } from '../hooks/useDatabaseCatalog';
import { InspectorEmptyState } from '../ui/InspectorEmptyState';
import { InspectorPanel } from '../ui/InspectorPanel';

export function DatabaseCatalogSection() {
  const catalog = useDatabaseCatalog();
  const selected = catalog.selectedNode;
  const database = catalog.getSelectedDatabase();
  const table = catalog.getSelectedTable();
  const column = catalog.getSelectedColumn();

  return (
    <div className="flex flex-col gap-2 px-2 pb-3">
      <InspectorPanel
        title="Database Catalog"
        description="Manage database, table, and column catalog metadata."
        tone="tertiary"
        instanceId="database-catalog-panel"
      >
        <DatabaseCatalogTree catalog={catalog} />
      </InspectorPanel>

      {!selected ? (
        <InspectorEmptyState
          title="Select a catalog node"
          description="Choose a database, table, or column from the tree to edit metadata."
          instanceId="database-catalog-empty"
        />
      ) : selected.level === 'database' && database ? (
        <InspectorPanel title={`Database: ${database.name}`} tone="tertiary" instanceId="database-editor-panel">
          <DatabaseEditor
            database={database}
            originalName={selected.databaseName}
            busy={catalog.busy}
            featureOptions={catalog.featureOptions}
            onSave={catalog.saveDatabase}
            onDelete={catalog.removeDatabase}
          />
        </InspectorPanel>
      ) : selected.level === 'table' && table ? (
        <InspectorPanel title={`Table: ${table.name}`} tone="tertiary" instanceId="table-editor-panel">
          <TableEditor
            table={table}
            originalName={selected.tableName}
            databaseName={selected.databaseName}
            busy={catalog.busy}
            onSave={catalog.saveTable}
            onDelete={catalog.removeTable}
          />
        </InspectorPanel>
      ) : selected.level === 'column' && column ? (
        <InspectorPanel title={`Column: ${column.name}`} tone="tertiary" instanceId="column-editor-panel">
          <ColumnEditor
            column={column}
            originalName={selected.columnName}
            databaseName={selected.databaseName}
            tableName={selected.tableName}
            catalogFile={catalog.file}
            busy={catalog.busy}
            onSave={catalog.saveColumn}
            onDelete={catalog.removeColumn}
          />
        </InspectorPanel>
      ) : (
        <InspectorEmptyState title="Node not found" description="The selected node no longer exists in the catalog." instanceId="database-catalog-missing" />
      )}
    </div>
  );
}
