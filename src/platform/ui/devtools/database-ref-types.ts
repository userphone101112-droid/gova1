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

export function emptyDatabaseRefFile(): DatabaseRefFile {
  return { databases: [] };
}

export function normalizeDatabaseRefFile(raw: unknown): DatabaseRefFile {
  if (!raw || typeof raw !== 'object') return emptyDatabaseRefFile();
  const databases = (raw as DatabaseRefFile).databases;
  if (!Array.isArray(databases)) return emptyDatabaseRefFile();
  return { databases };
}

export function findDatabase(file: DatabaseRefFile, nameEn: string): DatabaseRefDatabase | undefined {
  return file.databases.find((db) => db.name_en === nameEn);
}

export function findTable(db: DatabaseRefDatabase | undefined, nameEn: string): DatabaseRefTable | undefined {
  return db?.tables.find((table) => table.name_en === nameEn);
}
