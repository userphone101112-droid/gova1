import type {
  DatabaseRefColumn,
  DatabaseRefDatabase,
  DatabaseRefFile,
  DatabaseRefLevel,
  DatabaseRefTable,
} from './database-ref.types';

export function emptyDatabaseRefFile(): DatabaseRefFile {
  return { databases: [] };
}

type Describable = { description?: string; discription?: string };

export function getEntityDescription(entity: Describable | undefined): string {
  if (!entity) return '';
  return entity.description ?? entity.discription ?? '';
}

export function withEntityDescription<T extends Describable>(entity: T, description: string): T {
  const next = { ...entity, description };
  if ('discription' in next) {
    delete next.discription;
  }
  return next;
}

function normalizeColumn(raw: unknown): DatabaseRefColumn {
  if (!raw || typeof raw !== 'object') {
    return { name_en: '', name_ar: '' };
  }
  const source = raw as Record<string, unknown>;
  return {
    name_en: String(source.name_en ?? ''),
    name_ar: String(source.name_ar ?? ''),
    ...(getEntityDescription(source as Describable)
      ? { description: getEntityDescription(source as Describable) }
      : {}),
  };
}

function normalizeTable(raw: unknown): DatabaseRefTable {
  if (!raw || typeof raw !== 'object') {
    return { name_en: '', name_ar: '', columns: [] };
  }
  const source = raw as Record<string, unknown>;
  const columns = Array.isArray(source.columns) ? source.columns.map(normalizeColumn) : [];
  return {
    name_en: String(source.name_en ?? ''),
    name_ar: String(source.name_ar ?? ''),
    columns,
    ...(getEntityDescription(source as Describable)
      ? { description: getEntityDescription(source as Describable) }
      : {}),
  };
}

function normalizeDatabase(raw: unknown): DatabaseRefDatabase {
  if (!raw || typeof raw !== 'object') {
    return { name_en: '', name_ar: '', tables: [] };
  }
  const source = raw as Record<string, unknown>;
  const tables = Array.isArray(source.tables) ? source.tables.map(normalizeTable) : [];
  return {
    name_en: String(source.name_en ?? ''),
    name_ar: String(source.name_ar ?? ''),
    tables,
    ...(getEntityDescription(source as Describable)
      ? { description: getEntityDescription(source as Describable) }
      : {}),
  };
}

export function normalizeDatabaseRefFile(raw: unknown): DatabaseRefFile {
  if (!raw || typeof raw !== 'object') return emptyDatabaseRefFile();
  const databases = (raw as DatabaseRefFile).databases;
  if (!Array.isArray(databases)) return emptyDatabaseRefFile();
  return { databases: databases.map(normalizeDatabase) };
}

export function findDatabase(file: DatabaseRefFile, nameEn: string): DatabaseRefDatabase | undefined {
  return file.databases.find((db) => db.name_en === nameEn);
}

export function findTable(db: DatabaseRefDatabase | undefined, nameEn: string): DatabaseRefTable | undefined {
  return db?.tables.find((table) => table.name_en === nameEn);
}

export function findColumn(table: DatabaseRefTable | undefined, nameEn: string): DatabaseRefColumn | undefined {
  return table?.columns.find((column) => column.name_en === nameEn);
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

export function validateEnName(name: string, existing: string[], current?: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return 'English name is required.';
  if (existing.some((entry) => entry === trimmed && entry !== current)) {
    return 'English name must be unique.';
  }
  return null;
}

export function addDatabase(file: DatabaseRefFile): DatabaseRefFile {
  const next = cloneDatabaseRefFile(file.databases.length ? file : emptyDatabaseRefFile());
  const nameEn = uniqueEnName(
    'new_database',
    next.databases.map((db) => db.name_en)
  );
  next.databases.push({
    name_ar: 'قاعدة جديدة',
    name_en: nameEn,
    tables: [],
  });
  return next;
}

export function renameDatabase(
  file: DatabaseRefFile,
  oldNameEn: string,
  nextNameEn: string
): { file: DatabaseRefFile; error?: string } {
  const db = findDatabase(file, oldNameEn);
  if (!db) return { file, error: 'Database not found.' };
  const error = validateEnName(
    nextNameEn,
    file.databases.map((entry) => entry.name_en),
    oldNameEn
  );
  if (error) return { file, error };
  const next = cloneDatabaseRefFile(file);
  const index = next.databases.findIndex((entry) => entry.name_en === oldNameEn);
  next.databases[index] = { ...next.databases[index], name_en: nextNameEn.trim() };
  return { file: next };
}

export function deleteDatabase(file: DatabaseRefFile, nameEn: string): DatabaseRefFile {
  const next = cloneDatabaseRefFile(file);
  next.databases = next.databases.filter((db) => db.name_en !== nameEn);
  return next;
}

export function addTable(file: DatabaseRefFile, databaseNameEn: string): { file: DatabaseRefFile; error?: string } {
  const db = findDatabase(file, databaseNameEn);
  if (!db) return { file, error: 'Database not found.' };
  const next = cloneDatabaseRefFile(file);
  const dbIndex = next.databases.findIndex((entry) => entry.name_en === databaseNameEn);
  const nameEn = uniqueEnName(
    'new_table',
    next.databases[dbIndex].tables.map((table) => table.name_en)
  );
  next.databases[dbIndex].tables.push({
    name_ar: 'جدول جديد',
    name_en: nameEn,
    columns: [],
  });
  return { file: next };
}

export function renameTable(
  file: DatabaseRefFile,
  databaseNameEn: string,
  oldNameEn: string,
  nextNameEn: string
): { file: DatabaseRefFile; error?: string } {
  const db = findDatabase(file, databaseNameEn);
  const table = findTable(db, oldNameEn);
  if (!db || !table) return { file, error: 'Table not found.' };
  const error = validateEnName(
    nextNameEn,
    db.tables.map((entry) => entry.name_en),
    oldNameEn
  );
  if (error) return { file, error };
  const next = cloneDatabaseRefFile(file);
  const dbIndex = next.databases.findIndex((entry) => entry.name_en === databaseNameEn);
  const tableIndex = next.databases[dbIndex].tables.findIndex((entry) => entry.name_en === oldNameEn);
  next.databases[dbIndex].tables[tableIndex] = {
    ...next.databases[dbIndex].tables[tableIndex],
    name_en: nextNameEn.trim(),
  };
  return { file: next };
}

export function deleteTable(file: DatabaseRefFile, databaseNameEn: string, tableNameEn: string): DatabaseRefFile {
  const next = cloneDatabaseRefFile(file);
  const dbIndex = next.databases.findIndex((entry) => entry.name_en === databaseNameEn);
  if (dbIndex === -1) return next;
  next.databases[dbIndex].tables = next.databases[dbIndex].tables.filter(
    (table) => table.name_en !== tableNameEn
  );
  return next;
}

export function addColumn(
  file: DatabaseRefFile,
  databaseNameEn: string,
  tableNameEn: string
): { file: DatabaseRefFile; error?: string } {
  const db = findDatabase(file, databaseNameEn);
  const table = findTable(db, tableNameEn);
  if (!db || !table) return { file, error: 'Table not found.' };
  const next = cloneDatabaseRefFile(file);
  const dbIndex = next.databases.findIndex((entry) => entry.name_en === databaseNameEn);
  const tableIndex = next.databases[dbIndex].tables.findIndex((entry) => entry.name_en === tableNameEn);
  const nameEn = uniqueEnName(
    'new_column',
    next.databases[dbIndex].tables[tableIndex].columns.map((column) => column.name_en)
  );
  next.databases[dbIndex].tables[tableIndex].columns.push({
    name_ar: 'عمود جديد',
    name_en: nameEn,
  });
  return { file: next };
}

export function renameColumn(
  file: DatabaseRefFile,
  databaseNameEn: string,
  tableNameEn: string,
  oldNameEn: string,
  nextNameEn: string
): { file: DatabaseRefFile; error?: string } {
  const db = findDatabase(file, databaseNameEn);
  const table = findTable(db, tableNameEn);
  const column = findColumn(table, oldNameEn);
  if (!db || !table || !column) return { file, error: 'Column not found.' };
  const error = validateEnName(
    nextNameEn,
    table.columns.map((entry) => entry.name_en),
    oldNameEn
  );
  if (error) return { file, error };
  const next = cloneDatabaseRefFile(file);
  const dbIndex = next.databases.findIndex((entry) => entry.name_en === databaseNameEn);
  const tableIndex = next.databases[dbIndex].tables.findIndex((entry) => entry.name_en === tableNameEn);
  const columnIndex = next.databases[dbIndex].tables[tableIndex].columns.findIndex(
    (entry) => entry.name_en === oldNameEn
  );
  next.databases[dbIndex].tables[tableIndex].columns[columnIndex] = {
    ...next.databases[dbIndex].tables[tableIndex].columns[columnIndex],
    name_en: nextNameEn.trim(),
  };
  return { file: next };
}

export function deleteColumn(
  file: DatabaseRefFile,
  databaseNameEn: string,
  tableNameEn: string,
  columnNameEn: string
): DatabaseRefFile {
  const next = cloneDatabaseRefFile(file);
  const dbIndex = next.databases.findIndex((entry) => entry.name_en === databaseNameEn);
  if (dbIndex === -1) return next;
  const tableIndex = next.databases[dbIndex].tables.findIndex((entry) => entry.name_en === tableNameEn);
  if (tableIndex === -1) return next;
  next.databases[dbIndex].tables[tableIndex].columns = next.databases[dbIndex].tables[
    tableIndex
  ].columns.filter((column) => column.name_en !== columnNameEn);
  return next;
}

export function setDatabaseDescription(
  file: DatabaseRefFile,
  databaseNameEn: string,
  description: string
): { file: DatabaseRefFile; error?: string } {
  const db = findDatabase(file, databaseNameEn);
  if (!db) return { file, error: 'Database not found.' };
  const next = cloneDatabaseRefFile(file);
  const index = next.databases.findIndex((entry) => entry.name_en === databaseNameEn);
  next.databases[index] = withEntityDescription(next.databases[index], description);
  return { file: next };
}

export function setTableDescription(
  file: DatabaseRefFile,
  databaseNameEn: string,
  tableNameEn: string,
  description: string
): { file: DatabaseRefFile; error?: string } {
  const db = findDatabase(file, databaseNameEn);
  const table = findTable(db, tableNameEn);
  if (!db || !table) return { file, error: 'Table not found.' };
  const next = cloneDatabaseRefFile(file);
  const dbIndex = next.databases.findIndex((entry) => entry.name_en === databaseNameEn);
  const tableIndex = next.databases[dbIndex].tables.findIndex((entry) => entry.name_en === tableNameEn);
  next.databases[dbIndex].tables[tableIndex] = withEntityDescription(
    next.databases[dbIndex].tables[tableIndex],
    description
  );
  return { file: next };
}

export function setColumnDescription(
  file: DatabaseRefFile,
  databaseNameEn: string,
  tableNameEn: string,
  columnNameEn: string,
  description: string
): { file: DatabaseRefFile; error?: string } {
  const db = findDatabase(file, databaseNameEn);
  const table = findTable(db, tableNameEn);
  const column = findColumn(table, columnNameEn);
  if (!db || !table || !column) return { file, error: 'Column not found.' };
  const next = cloneDatabaseRefFile(file);
  const dbIndex = next.databases.findIndex((entry) => entry.name_en === databaseNameEn);
  const tableIndex = next.databases[dbIndex].tables.findIndex((entry) => entry.name_en === tableNameEn);
  const columnIndex = next.databases[dbIndex].tables[tableIndex].columns.findIndex(
    (entry) => entry.name_en === columnNameEn
  );
  next.databases[dbIndex].tables[tableIndex].columns[columnIndex] = withEntityDescription(
    next.databases[dbIndex].tables[tableIndex].columns[columnIndex],
    description
  );
  return { file: next };
}

export function applyDescriptionUpdate(
  file: DatabaseRefFile,
  level: DatabaseRefLevel,
  ids: { databaseNameEn: string; tableNameEn?: string; columnNameEn?: string },
  description: string
): { file: DatabaseRefFile; error?: string } {
  if (level === 'database') {
    return setDatabaseDescription(file, ids.databaseNameEn, description);
  }
  if (level === 'table' && ids.tableNameEn) {
    return setTableDescription(file, ids.databaseNameEn, ids.tableNameEn, description);
  }
  if (level === 'column' && ids.tableNameEn && ids.columnNameEn) {
    return setColumnDescription(file, ids.databaseNameEn, ids.tableNameEn, ids.columnNameEn, description);
  }
  return { file, error: 'Invalid description target.' };
}

export type RenameMap = {
  database?: { oldNameEn: string; newNameEn: string };
  table?: { oldNameEn: string; newNameEn: string };
  column?: { oldNameEn: string; newNameEn: string };
};

export function remapElementFieldNames(
  fields: { inf1: string; inf2: string; inf3: string },
  renameMap: RenameMap
): { inf1: string; inf2: string; inf3: string } {
  let { inf1, inf2, inf3 } = fields;
  if (renameMap.database && inf1 === renameMap.database.oldNameEn) {
    inf1 = renameMap.database.newNameEn;
  }
  if (renameMap.table && inf2 === renameMap.table.oldNameEn) {
    inf2 = renameMap.table.newNameEn;
  }
  if (renameMap.column && inf3 === renameMap.column.oldNameEn) {
    inf3 = renameMap.column.newNameEn;
  }
  return { inf1, inf2, inf3 };
}
