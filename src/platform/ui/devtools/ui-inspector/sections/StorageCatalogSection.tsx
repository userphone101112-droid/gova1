'use client';

import { StorageCatalogTree } from '../catalogs/storage/StorageCatalogTree';
import { StorageMainFileEditor } from '../catalogs/storage/StorageMainFileEditor';
import { StorageSubFileEditor } from '../catalogs/storage/StorageSubFileEditor';
import { useStorageCatalog } from '../hooks/useStorageCatalog';
import { InspectorEmptyState } from '../ui/InspectorEmptyState';
import { InspectorPanel } from '../ui/InspectorPanel';

export function StorageCatalogSection() {
  const catalog = useStorageCatalog();
  const selected = catalog.selectedNode;
  const mainFile = catalog.getSelectedMainFile();
  const subFile = catalog.getSelectedSubFile();

  return (
    <div className="flex flex-col gap-2 px-2 pb-3">
      <InspectorPanel
        title="Storage Catalog"
        description="Manage storage folders, paths, access, and file rules."
        tone="success"
        instanceId="storage-catalog-panel"
      >
        <StorageCatalogTree catalog={catalog} />
      </InspectorPanel>

      {!selected ? (
        <InspectorEmptyState
          title="Select a catalog node"
          description="Choose a main file or sub file from the tree to edit metadata."
          instanceId="storage-catalog-empty"
        />
      ) : selected.level === 'main' && mainFile ? (
        <InspectorPanel title={`Main file: ${mainFile.name}`} tone="success" instanceId="storage-main-editor-panel">
          <StorageMainFileEditor
            folder={mainFile}
            originalName={selected.mainName}
            busy={catalog.busy}
            onSave={catalog.saveMainFile}
            onDelete={catalog.removeMainFile}
          />
        </InspectorPanel>
      ) : selected.level === 'sub' && subFile ? (
        <InspectorPanel title={`Sub file: ${subFile.name}`} tone="success" instanceId="storage-sub-editor-panel">
          <StorageSubFileEditor
            subfolder={subFile}
            originalName={selected.subName}
            mainName={selected.mainName}
            busy={catalog.busy}
            onSave={catalog.saveSubFile}
            onDelete={catalog.removeSubFile}
          />
        </InspectorPanel>
      ) : (
        <InspectorEmptyState title="Node not found" description="The selected node no longer exists in the catalog." instanceId="storage-catalog-missing" />
      )}
    </div>
  );
}
