'use client';

import { useMemo } from 'react';

import type { DatabaseCatalogNode } from '../../data/database-ref.types';
import { nodeToTreeId, useDatabaseCatalog } from '../../hooks/useDatabaseCatalog';
import { InspectorActionButton } from '../../ui/InspectorActionButton';
import { InspectorTree, type InspectorTreeNode } from '../../ui/InspectorTree';

type DatabaseCatalogTreeProps = {
  catalog: ReturnType<typeof useDatabaseCatalog>;
};

export function DatabaseCatalogTree({ catalog }: DatabaseCatalogTreeProps) {
  const nodes: InspectorTreeNode[] = useMemo(
    () =>
      catalog.file.databases.map((db) => ({
        id: nodeToTreeId({ level: 'database', databaseName: db.name }),
        label: db.name,
        children: db.tables.map((table) => ({
          id: nodeToTreeId({ level: 'table', databaseName: db.name, tableName: table.name }),
          label: table.name,
          children: table.columns.map((column) => ({
            id: nodeToTreeId({
              level: 'column',
              databaseName: db.name,
              tableName: table.name,
              columnName: column.name,
            }),
            label: column.name,
          })),
        })),
      })),
    [catalog.file]
  );

  const selected = catalog.selectedNode;

  return (
    <div className="flex flex-col gap-2">
      <InspectorTree
        nodes={nodes}
        {...(catalog.selectedTreeId ? { selectedId: catalog.selectedTreeId } : {})}
        onSelect={catalog.selectTreeId}
        instanceId="database-catalog-tree"
      />
      <div className="flex flex-wrap gap-2 border-t border-outline-variant/40 pt-2">
        <InspectorActionButton variant="secondary" disabled={catalog.busy} onClick={() => void catalog.addAndSaveDatabase()} instanceId="db-catalog-add-db">
          + Database
        </InspectorActionButton>
        <InspectorActionButton
          variant="secondary"
          disabled={catalog.busy || selected?.level !== 'database'}
          onClick={() => {
            if (selected?.level === 'database') void catalog.addAndSaveTable(selected.databaseName);
          }}
          instanceId="db-catalog-add-table"
        >
          + Table
        </InspectorActionButton>
        <InspectorActionButton
          variant="secondary"
          disabled={catalog.busy || !selected || selected.level === 'database'}
          onClick={() => {
            if (selected && selected.level !== 'database') {
              void catalog.addAndSaveColumn(selected.databaseName, selected.tableName);
            }
          }}
          instanceId="db-catalog-add-column"
        >
          + Column
        </InspectorActionButton>
      </div>
    </div>
  );
}

export type { DatabaseCatalogNode };
