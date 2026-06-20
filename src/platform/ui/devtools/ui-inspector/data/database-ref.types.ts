export type DatabaseRefColumn = {
  name: string;
  description?: string;
};

export type DatabaseRefTable = {
  name: string;
  description?: string;
  columns: DatabaseRefColumn[];
};

export type DatabaseRefDatabase = {
  name: string;
  description?: string;
  tables: DatabaseRefTable[];
};

export type DatabaseRefFile = {
  databases: DatabaseRefDatabase[];
};

export type DatabaseEnabledState = 'on' | 'off';

export type DatabaseRefLevel = 'database' | 'table' | 'column';
