'use client';

import { useCallback, useMemo } from 'react';

import type { ElementBinding } from '../data/element-binding.types';
import {
  addStorageFolder,
  addStorageSubfolder,
  findStorageFolder,
} from '../data/storage-ref-utils';
import { persistStorageRefFile } from '../services/storage-ref.service';
import { useInspectorContext } from '../state/InspectorProvider';
import { InspectorActionButton } from '../ui/InspectorActionButton';
import { InspectorField, inspectorInputClass } from '../ui/InspectorField';
import { InspectorSelect } from '../ui/InspectorSelect';
import { STORAGE_QUICK_ADD_CONFIRM_MESSAGE } from '../utils/constants';

type StorageBindingEditorProps = {
  binding: ElementBinding;
  onChange: (patch: Partial<ElementBinding>) => void;
};

export function StorageBindingEditor({ binding, onChange }: StorageBindingEditorProps) {
  const { state, dispatch } = useInspectorContext();
  const storageRef = state.storageRef;

  const selectedFolder = useMemo(
    () => findStorageFolder(storageRef, binding.storageMainFile ?? ''),
    [storageRef, binding.storageMainFile]
  );
  const subfolderOptions = selectedFolder?.subfolders ?? [];

  const persistAndApply = useCallback(
    async (nextFile: typeof storageRef) => {
      const saved = await persistStorageRefFile(nextFile, { message: STORAGE_QUICK_ADD_CONFIRM_MESSAGE });
      if (!saved) return false;
      dispatch({ type: 'SET_STORAGE_REF', data: nextFile });
      return true;
    },
    [dispatch]
  );

  const handleQuickAddFolder = useCallback(async () => {
    const next = addStorageFolder(storageRef);
    const added = next.folders[next.folders.length - 1];
    if (!(await persistAndApply(next)) || !added) return;
    onChange({ storageMainFile: added.name, storageSubFile: '' });
  }, [onChange, persistAndApply, storageRef]);

  const handleQuickAddSubfolder = useCallback(async () => {
    if (!binding.storageMainFile) return;
    const next = addStorageSubfolder(storageRef, binding.storageMainFile);
    const folder = next.folders.find((entry) => entry.name === binding.storageMainFile);
    const added = folder?.subfolders.at(-1);
    if (!(await persistAndApply(next)) || !added) return;
    onChange({ storageSubFile: added.name });
  }, [binding.storageMainFile, onChange, persistAndApply, storageRef]);

  return (
    <>
      <InspectorField label="Main file" hint="Top-level folder from storage.json." instanceId="storage-binding-main">
        <div className="flex gap-2">
          <InspectorSelect
            value={binding.storageMainFile ?? ''}
            onChange={(storageMainFile) => onChange({ storageMainFile, storageSubFile: '' })}
            placeholder="Select main file..."
            instanceId="storage-binding-main-select"
            options={storageRef.folders.map((folder) => ({
              value: folder.name,
              label: folder.description ? `${folder.name} — ${folder.description}` : folder.name,
            }))}
            className="min-w-0 flex-1"
          />
          <InspectorActionButton variant="secondary" onClick={() => void handleQuickAddFolder()} instanceId="storage-binding-add-main">
            + Main File
          </InspectorActionButton>
        </div>
      </InspectorField>

      <InspectorField label="Sub file" hint="Subfolder under the main file." instanceId="storage-binding-sub">
        <div className="flex gap-2">
          <InspectorSelect
            value={binding.storageSubFile ?? ''}
            onChange={(storageSubFile) => onChange({ storageSubFile })}
            placeholder="Select sub file..."
            disabled={!binding.storageMainFile}
            instanceId="storage-binding-sub-select"
            options={subfolderOptions.map((sub) => ({
              value: sub.name,
              label: sub.description ? `${sub.name} — ${sub.description}` : sub.name,
            }))}
            className="min-w-0 flex-1"
          />
          <InspectorActionButton
            variant="secondary"
            onClick={() => void handleQuickAddSubfolder()}
            disabled={!binding.storageMainFile}
            instanceId="storage-binding-add-sub"
          >
            + Sub File
          </InspectorActionButton>
        </div>
      </InspectorField>

      <InspectorField label="File purpose" instanceId="storage-binding-purpose">
        <InspectorSelect
          value={binding.filePurpose ?? ''}
          onChange={(filePurpose) =>
            onChange(
              (filePurpose ? { filePurpose: filePurpose as ElementBinding['filePurpose'] } : {}) as Partial<ElementBinding>
            )
          }
          placeholder="None"
          instanceId="storage-binding-purpose-select"
          options={[
            { value: 'avatar', label: 'avatar' },
            { value: 'document', label: 'document' },
            { value: 'attachment', label: 'attachment' },
            { value: 'export', label: 'export' },
            { value: 'import', label: 'import' },
            { value: 'template', label: 'template' },
            { value: 'media', label: 'media' },
            { value: 'other', label: 'other' },
          ]}
        />
      </InspectorField>

      <InspectorField label="Path template" instanceId="storage-binding-path">
        <input
          value={binding.pathTemplate ?? ''}
          onChange={(event) => onChange({ pathTemplate: event.target.value })}
          className={inspectorInputClass}
          data-ui-instance-id="storage-binding-path-input"
        />
      </InspectorField>

      <InspectorField label="Allowed MIME types" instanceId="storage-binding-mime">
        <input
          value={binding.allowedMimeTypes ?? ''}
          onChange={(event) => onChange({ allowedMimeTypes: event.target.value })}
          placeholder="image/png, application/pdf"
          className={inspectorInputClass}
          data-ui-instance-id="storage-binding-mime-input"
        />
      </InspectorField>

      <InspectorField label="Max file size (MB)" instanceId="storage-binding-max-size">
        <input
          type="number"
          min={0}
          value={binding.maxFileSizeMb ?? ''}
          onChange={(event) =>
            onChange({
              maxFileSizeMb: event.target.value ? Number(event.target.value) : undefined,
            } as Partial<ElementBinding>)
          }
          className={inspectorInputClass}
          data-ui-instance-id="storage-binding-max-size-input"
        />
      </InspectorField>

      <InspectorField label="Access level" instanceId="storage-binding-access">
        <InspectorSelect
          value={binding.accessLevel ?? ''}
          onChange={(accessLevel) =>
            onChange(
              (accessLevel ? { accessLevel: accessLevel as ElementBinding['accessLevel'] } : {}) as Partial<ElementBinding>
            )
          }
          placeholder="None"
          instanceId="storage-binding-access-select"
          options={[
            { value: 'public', label: 'public' },
            { value: 'authenticated', label: 'authenticated' },
            { value: 'owner_only', label: 'owner_only' },
            { value: 'admin_only', label: 'admin_only' },
          ]}
        />
      </InspectorField>

      <InspectorField label="Retention" instanceId="storage-binding-retention">
        <InspectorSelect
          value={binding.retention ?? ''}
          onChange={(retention) =>
            onChange(
              (retention ? { retention: retention as ElementBinding['retention'] } : {}) as Partial<ElementBinding>
            )
          }
          placeholder="None"
          instanceId="storage-binding-retention-select"
          options={[
            { value: 'temporary', label: 'temporary' },
            { value: 'permanent', label: 'permanent' },
            { value: 'archived', label: 'archived' },
          ]}
        />
      </InspectorField>

      <InspectorField label="Naming strategy" instanceId="storage-binding-naming">
        <InspectorSelect
          value={binding.namingStrategy ?? ''}
          onChange={(namingStrategy) =>
            onChange(
              (namingStrategy
                ? { namingStrategy: namingStrategy as ElementBinding['namingStrategy'] }
                : {}) as Partial<ElementBinding>
            )
          }
          placeholder="None"
          instanceId="storage-binding-naming-select"
          options={[
            { value: 'uuid', label: 'uuid' },
            { value: 'slug', label: 'slug' },
            { value: 'entity_id', label: 'entity_id' },
            { value: 'timestamp', label: 'timestamp' },
            { value: 'original_name', label: 'original_name' },
          ]}
        />
      </InspectorField>
    </>
  );
}
