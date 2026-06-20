import type { StorageFolder, StorageRefFile, StorageSubfolder } from './storage-ref.types';

export function emptyStorageRefFile(): StorageRefFile {
  return { folders: [] };
}

function normalizeSubfolder(raw: unknown): StorageSubfolder {
  if (!raw || typeof raw !== 'object') {
    return { name: '' };
  }
  const source = raw as Record<string, unknown>;
  return {
    name: String(source.name ?? '').trim(),
    ...(source.description ? { description: String(source.description) } : {}),
  };
}

function normalizeFolder(raw: unknown): StorageFolder {
  if (!raw || typeof raw !== 'object') {
    return { name: '', subfolders: [] };
  }
  const source = raw as Record<string, unknown>;
  const subfolders = Array.isArray(source.subfolders)
    ? source.subfolders.map(normalizeSubfolder).filter((entry) => entry.name)
    : [];
  return {
    name: String(source.name ?? '').trim(),
    ...(source.description ? { description: String(source.description) } : {}),
    subfolders,
  };
}

export function normalizeStorageRefFile(raw: unknown): StorageRefFile {
  if (!raw || typeof raw !== 'object') return emptyStorageRefFile();
  const folders = (raw as StorageRefFile).folders;
  if (!Array.isArray(folders)) return emptyStorageRefFile();
  return {
    folders: folders.map(normalizeFolder).filter((folder) => folder.name),
  };
}

export function findStorageFolder(file: StorageRefFile, name: string): StorageFolder | undefined {
  return file.folders.find((folder) => folder.name === name);
}

export function findStorageSubfolder(
  folder: StorageFolder | undefined,
  name: string
): StorageSubfolder | undefined {
  return folder?.subfolders.find((sub) => sub.name === name);
}

function uniqueName(base: string, existing: string[]): string {
  const candidate = base.trim() || 'new_item';
  if (!existing.includes(candidate)) return candidate;
  let index = 2;
  while (existing.includes(`${candidate}_${index}`)) index += 1;
  return `${candidate}_${index}`;
}

export function addStorageFolder(file: StorageRefFile): StorageRefFile {
  const name = uniqueName(
    'new_folder',
    file.folders.map((folder) => folder.name)
  );
  return {
    folders: [...file.folders, { name, subfolders: [] }],
  };
}

export function renameStorageFolder(
  file: StorageRefFile,
  oldName: string,
  newName: string
): { file: StorageRefFile; error?: string } {
  const trimmed = newName.trim();
  if (!trimmed) return { file, error: 'Folder name cannot be empty.' };
  if (trimmed !== oldName && file.folders.some((folder) => folder.name === trimmed)) {
    return { file, error: 'Folder name already exists.' };
  }
  return {
    file: {
      folders: file.folders.map((folder) =>
        folder.name === oldName ? { ...folder, name: trimmed } : folder
      ),
    },
  };
}

export function deleteStorageFolder(file: StorageRefFile, name: string): StorageRefFile {
  return { folders: file.folders.filter((folder) => folder.name !== name) };
}

export function addStorageSubfolder(file: StorageRefFile, folderName: string): StorageRefFile {
  const folder = findStorageFolder(file, folderName);
  if (!folder) return file;
  const name = uniqueName(
    'new_subfolder',
    folder.subfolders.map((sub) => sub.name)
  );
  return {
    folders: file.folders.map((entry) =>
      entry.name === folderName
        ? { ...entry, subfolders: [...entry.subfolders, { name }] }
        : entry
    ),
  };
}

export function renameStorageSubfolder(
  file: StorageRefFile,
  folderName: string,
  oldName: string,
  newName: string
): { file: StorageRefFile; error?: string } {
  const folder = findStorageFolder(file, folderName);
  if (!folder) return { file, error: 'Folder not found.' };
  const trimmed = newName.trim();
  if (!trimmed) return { file, error: 'Subfolder name cannot be empty.' };
  if (
    trimmed !== oldName &&
    folder.subfolders.some((sub) => sub.name === trimmed)
  ) {
    return { file, error: 'Subfolder name already exists.' };
  }
  return {
    file: {
      folders: file.folders.map((entry) =>
        entry.name === folderName
          ? {
              ...entry,
              subfolders: entry.subfolders.map((sub) =>
                sub.name === oldName ? { ...sub, name: trimmed } : sub
              ),
            }
          : entry
      ),
    },
  };
}

export function deleteStorageSubfolder(
  file: StorageRefFile,
  folderName: string,
  subName: string
): StorageRefFile {
  return {
    folders: file.folders.map((entry) =>
      entry.name === folderName
        ? { ...entry, subfolders: entry.subfolders.filter((sub) => sub.name !== subName) }
        : entry
    ),
  };
}

export function updateStorageFolderDescription(
  file: StorageRefFile,
  folderName: string,
  description: string
): StorageRefFile {
  return {
    folders: file.folders.map((entry) =>
      entry.name === folderName ? { ...entry, description } : entry
    ),
  };
}

export function updateStorageSubfolderDescription(
  file: StorageRefFile,
  folderName: string,
  subName: string,
  description: string
): StorageRefFile {
  return {
    folders: file.folders.map((entry) =>
      entry.name === folderName
        ? {
            ...entry,
            subfolders: entry.subfolders.map((sub) =>
              sub.name === subName ? { ...sub, description } : sub
            ),
          }
        : entry
    ),
  };
}
