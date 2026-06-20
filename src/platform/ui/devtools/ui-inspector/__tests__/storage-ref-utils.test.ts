import { describe, expect, it } from '@jest/globals';

import {
  addStorageFolder,
  emptyStorageRefFile,
  normalizeStorageRefFile,
  renameStorageFolder,
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
});
