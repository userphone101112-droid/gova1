export interface DatabaseRefColumn {
  name_ar?: string;
  name_en: string;
  description?: string;
  /** @deprecated Legacy typo preserved for backward compatibility when reading. */
  discription?: string;
}

export interface DatabaseRefTable {
  name_ar?: string;
  name_en: string;
  description?: string;
  discription?: string;
  columns: DatabaseRefColumn[];
}

export interface DatabaseRefDatabase {
  name_ar?: string;
  name_en: string;
  description?: string;
  discription?: string;
  tables: DatabaseRefTable[];
}

export interface DatabaseRefFile {
  databases: DatabaseRefDatabase[];
}

export type DatabaseEnabledState = 'on' | 'off';

export type DatabaseRefLevel = 'database' | 'table' | 'column';
