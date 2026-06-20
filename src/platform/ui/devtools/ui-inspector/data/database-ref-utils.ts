import type {
  DatabaseRefDatabase,
  DatabaseRefFile,
  DatabaseRefTable,
} from './database-ref.types';

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

export function cloneDatabaseRefFile(file: DatabaseRefFile): DatabaseRefFile {
  return JSON.parse(JSON.stringify(file)) as DatabaseRefFile;
}

export function uniqueEnName(prefix: string, existing: string[]): string {
  let index = existing.length + 1;
  let candidate = `${prefix}_${index}`;
  while (existing.includes(candidate)) {
    index += 1;
    candidate = `${prefix}_${index}`;
  }
  return candidate;
}
