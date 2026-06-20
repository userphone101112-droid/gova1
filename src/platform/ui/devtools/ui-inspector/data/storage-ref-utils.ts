import {
  ACCESS_LEVEL_OPTIONS,
  FILE_PURPOSE_OPTIONS,
  FILE_PURPOSES_REQUIRING_PATH,
  NAMING_STRATEGY_OPTIONS,
  RETENTION_OPTIONS,
  STORAGE_TYPE_OPTIONS,
} from './catalog-options';
import type { AccessLevel, FilePurpose, NamingStrategy, RetentionPolicy } from './element-binding.types';
import type { StorageFolder, StorageRefFile, StorageSubfolder } from './storage-ref.types';
import type { StorageType } from './storage-ref.types';

export function emptyStorageRefFile(): StorageRefFile {
  return { folders: [] };
}

function optionalString(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  const trimmed = String(value).trim();
  return trimmed || undefined;
}

function enumValue<T extends string>(value: unknown, allowed: readonly T[]): T | undefined {
  const trimmed = String(value ?? '').trim();
  return allowed.includes(trimmed as T) ? (trimmed as T) : undefined;
}

function optionalPositiveNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return undefined;
  return parsed;
}

function normalizeSubfolder(raw: unknown): StorageSubfolder {
  if (!raw || typeof raw !== 'object') {
    return { name: '' };
  }
  const source = raw as Record<string, unknown>;
  const sub: StorageSubfolder = { name: String(source.name ?? '').trim() };
  const description = optionalString(source.description);
  if (description) sub.description = description;
  const entityName = optionalString(source.entityName);
  if (entityName) sub.entityName = entityName;
  const pathTemplate = optionalString(source.pathTemplate);
  if (pathTemplate) sub.pathTemplate = pathTemplate;
  const filePurpose = enumValue<FilePurpose>(source.filePurpose, FILE_PURPOSE_OPTIONS);
  if (filePurpose) sub.filePurpose = filePurpose;
  const allowedMimeTypes = optionalString(source.allowedMimeTypes);
  if (allowedMimeTypes) sub.allowedMimeTypes = allowedMimeTypes;
  const maxFileSizeMb = optionalPositiveNumber(source.maxFileSizeMb);
  if (maxFileSizeMb !== undefined) sub.maxFileSizeMb = maxFileSizeMb;
  const accessLevel = enumValue<AccessLevel>(source.accessLevel, ACCESS_LEVEL_OPTIONS);
  if (accessLevel) sub.accessLevel = accessLevel;
  const retention = enumValue<RetentionPolicy>(source.retention, RETENTION_OPTIONS);
  if (retention) sub.retention = retention;
  const namingStrategy = enumValue<NamingStrategy>(source.namingStrategy, NAMING_STRATEGY_OPTIONS);
  if (namingStrategy) sub.namingStrategy = namingStrategy;
  const notes = optionalString(source.notes);
  if (notes) sub.notes = notes;
  return sub;
}

function normalizeFolder(raw: unknown): StorageFolder {
  if (!raw || typeof raw !== 'object') {
    return { name: '', subfolders: [] };
  }
  const source = raw as Record<string, unknown>;
  const subfolders = Array.isArray(source.subfolders)
    ? source.subfolders.map(normalizeSubfolder).filter((entry) => entry.name)
    : [];
  const folder: StorageFolder = { name: String(source.name ?? '').trim(), subfolders };
  const description = optionalString(source.description);
  if (description) folder.description = description;
  const entityName = optionalString(source.entityName);
  if (entityName) folder.entityName = entityName;
  const storageType = enumValue<StorageType>(source.storageType, STORAGE_TYPE_OPTIONS);
  if (storageType) folder.storageType = storageType;
  const basePath = optionalString(source.basePath);
  if (basePath) folder.basePath = basePath;
  const accessLevel = enumValue<AccessLevel>(source.accessLevel, ACCESS_LEVEL_OPTIONS);
  if (accessLevel) folder.accessLevel = accessLevel;
  const retention = enumValue<RetentionPolicy>(source.retention, RETENTION_OPTIONS);
  if (retention) folder.retention = retention;
  return folder;
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

export function validateStorageName(name: string, existing: string[], current?: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return 'Name is required.';
  if (existing.some((entry) => entry === trimmed && entry !== current)) {
    return 'Name must be unique.';
  }
  return null;
}

export type StorageRefValidationIssue = {
  path: string;
  message: string;
};

function validateSubfolderEntity(sub: StorageSubfolder, path: string): StorageRefValidationIssue[] {
  const issues: StorageRefValidationIssue[] = [];
  if (!sub.name.trim()) {
    issues.push({ path, message: 'Sub file name is required.' });
  }
  if (sub.filePurpose && !FILE_PURPOSE_OPTIONS.includes(sub.filePurpose)) {
    issues.push({ path, message: 'Invalid filePurpose.' });
  }
  if (sub.accessLevel && !ACCESS_LEVEL_OPTIONS.includes(sub.accessLevel)) {
    issues.push({ path, message: 'Invalid accessLevel.' });
  }
  if (sub.retention && !RETENTION_OPTIONS.includes(sub.retention)) {
    issues.push({ path, message: 'Invalid retention.' });
  }
  if (sub.namingStrategy && !NAMING_STRATEGY_OPTIONS.includes(sub.namingStrategy)) {
    issues.push({ path, message: 'Invalid namingStrategy.' });
  }
  if (sub.maxFileSizeMb !== undefined && sub.maxFileSizeMb <= 0) {
    issues.push({ path, message: 'maxFileSizeMb must be a positive number.' });
  }
  if (
    sub.filePurpose &&
    FILE_PURPOSES_REQUIRING_PATH.includes(sub.filePurpose) &&
    !sub.pathTemplate?.trim()
  ) {
    issues.push({ path, message: 'pathTemplate is required for this file purpose.' });
  }
  return issues;
}

export function validateStorageRefFile(file: StorageRefFile): StorageRefValidationIssue[] {
  const issues: StorageRefValidationIssue[] = [];
  const folderNames = new Set<string>();

  for (const folder of file.folders) {
    const folderPath = folder.name || '(unnamed)';
    if (!folder.name.trim()) {
      issues.push({ path: folderPath, message: 'Main file name is required.' });
      continue;
    }
    if (folderNames.has(folder.name)) {
      issues.push({ path: folderPath, message: 'Duplicate main file name.' });
    }
    folderNames.add(folder.name);
    if (folder.storageType && !STORAGE_TYPE_OPTIONS.includes(folder.storageType)) {
      issues.push({ path: folderPath, message: 'Invalid storageType.' });
    }
    if (folder.accessLevel && !ACCESS_LEVEL_OPTIONS.includes(folder.accessLevel)) {
      issues.push({ path: folderPath, message: 'Invalid accessLevel.' });
    }
    if (folder.retention && !RETENTION_OPTIONS.includes(folder.retention)) {
      issues.push({ path: folderPath, message: 'Invalid retention.' });
    }

    const subNames = new Set<string>();
    for (const sub of folder.subfolders) {
      const subPath = `${folder.name}/${sub.name || '(unnamed)'}`;
      if (!sub.name.trim()) {
        issues.push({ path: subPath, message: 'Sub file name is required.' });
        continue;
      }
      if (subNames.has(sub.name)) {
        issues.push({ path: subPath, message: 'Duplicate sub file name.' });
      }
      subNames.add(sub.name);
      issues.push(...validateSubfolderEntity(sub, subPath));
    }
  }

  return issues;
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
  const error = validateStorageName(trimmed, file.folders.map((folder) => folder.name), oldName);
  if (error) return { file, error };
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
  const error = validateStorageName(
    trimmed,
    folder.subfolders.map((sub) => sub.name),
    oldName
  );
  if (error) return { file, error };
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

export function replaceStorageFolder(
  file: StorageRefFile,
  folderName: string,
  nextFolder: StorageFolder
): { file: StorageRefFile; error?: string } {
  const folder = findStorageFolder(file, folderName);
  if (!folder) return { file, error: 'Main file not found.' };
  const error = validateStorageName(
    nextFolder.name,
    file.folders.map((entry) => entry.name),
    folderName
  );
  if (error) return { file, error };
  const candidate: StorageRefFile = {
    folders: file.folders.map((entry) => (entry.name === folderName ? nextFolder : entry)),
  };
  const issues = validateStorageRefFile(candidate);
  if (issues.length) return { file, error: issues[0]?.message ?? 'Validation failed.' };
  return { file: candidate };
}

export function replaceStorageSubfolder(
  file: StorageRefFile,
  folderName: string,
  subName: string,
  nextSub: StorageSubfolder
): { file: StorageRefFile; error?: string } {
  const folder = findStorageFolder(file, folderName);
  const sub = findStorageSubfolder(folder, subName);
  if (!folder || !sub) return { file, error: 'Sub file not found.' };
  const error = validateStorageName(
    nextSub.name,
    folder.subfolders.map((entry) => entry.name),
    subName
  );
  if (error) return { file, error };
  const candidate: StorageRefFile = {
    folders: file.folders.map((entry) =>
      entry.name === folderName
        ? {
            ...entry,
            subfolders: entry.subfolders.map((subEntry) =>
              subEntry.name === subName ? nextSub : subEntry
            ),
          }
        : entry
    ),
  };
  const issues = validateStorageRefFile(candidate);
  if (issues.length) return { file, error: issues[0]?.message ?? 'Validation failed.' };
  return { file: candidate };
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
