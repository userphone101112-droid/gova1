'use client';

import { useMemo } from 'react';

import { isDatabaseColumnRefComplete } from '../../domain/governance-domain';
import { nodeToTreeId, useStorageCatalog } from '../../hooks/useStorageCatalog';
import { useInspectorContext } from '../../state/InspectorProvider';
import { InspectorActionButton } from '../../ui/InspectorActionButton';
import { InspectorTree, type InspectorTreeNode } from '../../ui/InspectorTree';

type StorageCatalogTreeProps = {
  catalog: ReturnType<typeof useStorageCatalog>;
};

export function StorageCatalogTree({ catalog }: StorageCatalogTreeProps) {
  const { state } = useInspectorContext();
  const anchorFromSelection = useMemo(() => {
    const ref = {
      databaseName: state.formState.databaseName,
      tableName: state.formState.tableName,
      columnName: state.formState.columnName,
    };
    return isDatabaseColumnRefComplete(ref) ? ref : null;
  }, [state.formState.columnName, state.formState.databaseName, state.formState.tableName]);

  const nodes: InspectorTreeNode[] = useMemo(
    () =>
      catalog.file.folders.map((folder) => ({
        id: nodeToTreeId({ level: 'main', mainName: folder.name }),
        label: folder.name,
        children: folder.subfolders.map((sub) => ({
          id: nodeToTreeId({ level: 'sub', mainName: folder.name, subName: sub.name }),
          label: sub.name,
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
        instanceId="storage-catalog-tree"
      />
      <div className="flex flex-wrap gap-2 border-t border-outline-variant/40 pt-2">
        <InspectorActionButton variant="secondary" disabled={catalog.busy} onClick={() => void catalog.addAndSaveMainFile()} instanceId="storage-catalog-add-main">
          + Main File
        </InspectorActionButton>
        <InspectorActionButton
          variant="secondary"
          disabled={catalog.busy || selected?.level !== 'main' || !anchorFromSelection}
          onClick={() => {
            if (selected?.level === 'main' && anchorFromSelection) {
              void catalog.addAndSaveSubFile(selected.mainName, { linkedDatabaseColumn: anchorFromSelection });
            }
          }}
          instanceId="storage-catalog-add-sub"
        >
          + Sub File
        </InspectorActionButton>
      </div>
    </div>
  );
}
