export interface DatabaseRefColumn {
  name_ar: string;
  name_en: string;
}

export interface DatabaseRefTable {
  name_ar: string;
  name_en: string;
  columns: DatabaseRefColumn[];
}

export interface DatabaseRefDatabase {
  name_ar: string;
  name_en: string;
  tables: DatabaseRefTable[];
}

export interface DatabaseRefFile {
  databases: DatabaseRefDatabase[];
}

export type DatabaseEnabledState = 'on' | 'off';
