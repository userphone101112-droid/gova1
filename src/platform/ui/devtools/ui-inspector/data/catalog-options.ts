import type {
  AccessPattern,
  ColumnDataType,
  ColumnSensitivity,
  DatabaseLifecycle,
  TableType,
} from './database-ref.types';
import type { AccessLevel, FilePurpose, NamingStrategy, RetentionPolicy } from './element-binding.types';
import type { StorageType } from './storage-ref.types';

export const DATABASE_LIFECYCLE_OPTIONS: DatabaseLifecycle[] = ['draft', 'active', 'deprecated', 'archived'];
export const TABLE_TYPE_OPTIONS: TableType[] = ['entity', 'lookup', 'junction', 'audit', 'view'];
export const ACCESS_PATTERN_OPTIONS: AccessPattern[] = ['read_heavy', 'write_heavy', 'balanced', 'batch'];
export const COLUMN_DATA_TYPE_OPTIONS: ColumnDataType[] = [
  'string',
  'text',
  'integer',
  'bigint',
  'decimal',
  'boolean',
  'date',
  'datetime',
  'json',
  'uuid',
  'enum',
];
export const COLUMN_SENSITIVITY_OPTIONS: ColumnSensitivity[] = [
  'public',
  'internal',
  'confidential',
  'pii',
  'secret',
];

export const STORAGE_TYPE_OPTIONS: StorageType[] = ['local', 's3', 'gcs', 'azure_blob', 'cdn'];
export const ACCESS_LEVEL_OPTIONS: AccessLevel[] = ['public', 'authenticated', 'owner_only', 'admin_only'];
export const RETENTION_OPTIONS: RetentionPolicy[] = ['temporary', 'permanent', 'archived'];
export const FILE_PURPOSE_OPTIONS: FilePurpose[] = [
  'avatar',
  'document',
  'attachment',
  'export',
  'import',
  'template',
  'media',
  'other',
];
export const NAMING_STRATEGY_OPTIONS: NamingStrategy[] = [
  'uuid',
  'slug',
  'entity_id',
  'timestamp',
  'original_name',
];

export const FILE_PURPOSES_REQUIRING_PATH: FilePurpose[] = [
  'document',
  'attachment',
  'export',
  'import',
  'template',
  'media',
];
