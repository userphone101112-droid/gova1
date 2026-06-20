import type { AccessLevel, FilePurpose, NamingStrategy, RetentionPolicy } from './element-binding.types';

export type StorageType = 'local' | 's3' | 'gcs' | 'azure_blob' | 'cdn';

export type StorageSubfolder = {
  name: string;
  description?: string;
  entityName?: string;
  pathTemplate?: string;
  filePurpose?: FilePurpose;
  allowedMimeTypes?: string;
  maxFileSizeMb?: number;
  accessLevel?: AccessLevel;
  retention?: RetentionPolicy;
  namingStrategy?: NamingStrategy;
  notes?: string;
  /** Required for new subfolders — anchors storage to a database column. */
  linkedDatabaseName?: string;
  linkedTableName?: string;
  linkedColumnName?: string;
};

export type StorageFolder = {
  name: string;
  description?: string;
  entityName?: string;
  storageType?: StorageType;
  basePath?: string;
  accessLevel?: AccessLevel;
  retention?: RetentionPolicy;
  /** Required for new main files — anchors storage to a database column. */
  linkedDatabaseName?: string;
  linkedTableName?: string;
  linkedColumnName?: string;
  subfolders: StorageSubfolder[];
};

export type StorageRefFile = {
  folders: StorageFolder[];
};

export type StorageCatalogNode =
  | { level: 'main'; mainName: string }
  | { level: 'sub'; mainName: string; subName: string };
