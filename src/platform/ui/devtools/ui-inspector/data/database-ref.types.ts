export type DatabaseLifecycle = 'draft' | 'active' | 'deprecated' | 'archived';

export type TableType = 'entity' | 'lookup' | 'junction' | 'audit' | 'view';

export type AccessPattern = 'read_heavy' | 'write_heavy' | 'balanced' | 'batch';

export type ColumnDataType =
  | 'string'
  | 'text'
  | 'integer'
  | 'bigint'
  | 'decimal'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'json'
  | 'uuid'
  | 'enum';

export type ColumnSensitivity = 'public' | 'internal' | 'confidential' | 'pii' | 'secret';

export type DatabaseRefColumn = {
  name: string;
  description?: string;
  dataType?: ColumnDataType;
  nullable?: boolean;
  unique?: boolean;
  indexed?: boolean;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
  referencesDatabase?: string;
  referencesTable?: string;
  referencesColumn?: string;
  sensitivity?: ColumnSensitivity;
  validationRule?: string;
  exampleValue?: string;
};

export type DatabaseRefTable = {
  name: string;
  description?: string;
  entityName?: string;
  tableType?: TableType;
  expectedRows?: string;
  accessPattern?: AccessPattern;
  notes?: string;
  columns: DatabaseRefColumn[];
};

export type DatabaseRefDatabase = {
  name: string;
  description?: string;
  entityName?: string;
  ownerFeature?: string;
  domain?: string;
  lifecycle?: DatabaseLifecycle;
  tables: DatabaseRefTable[];
};

export type DatabaseRefFile = {
  databases: DatabaseRefDatabase[];
};

export type DatabaseEnabledState = 'on' | 'off';

export type DatabaseRefLevel = 'database' | 'table' | 'column';

export type DatabaseCatalogNode =
  | { level: 'database'; databaseName: string }
  | { level: 'table'; databaseName: string; tableName: string }
  | { level: 'column'; databaseName: string; tableName: string; columnName: string };
