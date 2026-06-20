import { describe, expect, it } from '@jest/globals';

import {
  addStorageFolder,
  emptyStorageRefFile,
  normalizeStorageRefFile,
  renameStorageFolder,
  validateStorageRefFile,
} from '../data/storage-ref-utils';

describe('storage-ref-utils', () => {
  it('normalizes empty or invalid files safely', () => {
    expect(normalizeStorageRefFile(null)).toEqual(emptyStorageRefFile());
    expect(normalizeStorageRefFile({ folders: 'bad' })).toEqual(emptyStorageRefFile());
  });

  it('adds and renames folders with unique names', () => {
    const first = addStorageFolder(emptyStorageRefFile());
    expect(first.folders).toHaveLength(1);

    const renamed = renameStorageFolder(first, first.folders[0].name, 'Projects');
    expect(renamed.error).toBeUndefined();
    expect(renamed.file.folders[0].name).toBe('Projects');
  });

  it('preserves full storage metadata on normalize', () => {
    const file = normalizeStorageRefFile({
      folders: [
        {
          name: 'Projects',
          description: 'Project files',
          entityName: 'Project',
          storageType: 's3',
          basePath: '/projects',
          accessLevel: 'authenticated',
          retention: 'permanent',
          subfolders: [
            {
              name: 'Frontend',
              pathTemplate: '/projects/{id}/frontend/{fileName}',
              filePurpose: 'document',
              allowedMimeTypes: 'application/pdf',
              maxFileSizeMb: 25,
              accessLevel: 'owner_only',
              retention: 'archived',
              namingStrategy: 'uuid',
              notes: 'UI assets',
            },
          ],
        },
      ],
    });
    const folder = file.folders[0];
    expect(folder?.storageType).toBe('s3');
    expect(folder?.basePath).toBe('/projects');
    const sub = folder?.subfolders[0];
    expect(sub?.pathTemplate).toContain('{fileName}');
    expect(sub?.maxFileSizeMb).toBe(25);
    expect(sub?.namingStrategy).toBe('uuid');
  });

  it('validates positive maxFileSizeMb', () => {
    const issues = validateStorageRefFile({
      folders: [{ name: 'A', subfolders: [{ name: 'B', maxFileSizeMb: -5 }] }],
    });
    expect(issues.some((issue) => issue.message.includes('maxFileSizeMb'))).toBe(true);
  });
});
