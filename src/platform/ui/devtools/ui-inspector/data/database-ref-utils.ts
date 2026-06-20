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

type Describable = { description?: string; discription?: string; name_ar?: string };

export function getEntityDescription(entity: Describable | undefined): string {
  if (!entity) return '';
  return entity.description ?? entity.discription ?? '';
}

function readLegacyName(source: Record<string, unknown>): string {
  return String(source.name ?? source.name_en ?? '').trim();
}

function readNormalizedDescription(source: Record<string, unknown>): string | undefined {
  const explicit = getEntityDescription(source as Describable);
  if (explicit) return explicit;
  const legacyAr = String(source.name_ar ?? '').trim();
  return legacyAr || undefined;
}

function normalizeColumn(raw: unknown): DatabaseRefColumn {
  if (!raw || typeof raw !== 'object') {
    return { name: '' };
  }
  const source = raw as Record<string, unknown>;
  const name = readLegacyName(source);
  const description = readNormalizedDescription(source);
  return description ? { name, description } : { name };
}

function normalizeTable(raw: unknown): DatabaseRefTable {
  if (!raw || typeof raw !== 'object') {
    return { name: '', columns: [] };
  }
  const source = raw as Record<string, unknown>;
  const columns = Array.isArray(source.columns)
    ? source.columns.map(normalizeColumn).filter((column) => column.name)
    : [];
  const name = readLegacyName(source);
  const description = readNormalizedDescription(source);
  return description ? { name, columns, description } : { name, columns };
}

function normalizeDatabase(raw: unknown): DatabaseRefDatabase {
  if (!raw || typeof raw !== 'object') {
    return { name: '', tables: [] };
  }
  const source = raw as Record<string, unknown>;
  const tables = Array.isArray(source.tables)
    ? source.tables.map(normalizeTable).filter((table) => table.name)
    : [];
  const name = readLegacyName(source);
  const description = readNormalizedDescription(source);
  return description ? { name, tables, description } : { name, tables };
}

export function normalizeDatabaseRefFile(raw: unknown): DatabaseRefFile {
  if (!raw || typeof raw !== 'object') return emptyDatabaseRefFile();
  const databases = (raw as DatabaseRefFile).databases;
  if (!Array.isArray(databases)) return emptyDatabaseRefFile();
  return {
    databases: databases.map(normalizeDatabase).filter((database) => database.name),
  };
}

export function findDatabase(file: DatabaseRefFile, name: string): DatabaseRefDatabase | undefined {
  return file.databases.find((db) => db.name === name);
}

export function findTable(db: DatabaseRefDatabase | undefined, name: string): DatabaseRefTable | undefined {
  return db?.tables.find((table) => table.name === name);
}

export function findColumn(table: DatabaseRefTable | undefined, name: string): DatabaseRefColumn | undefined {
  return table?.columns.find((column) => column.name === name);
}

export function cloneDatabaseRefFile(file: DatabaseRefFile): DatabaseRefFile {
  return JSON.parse(JSON.stringify(file)) as DatabaseRefFile;
}

export function uniqueName(base: string, existing: string[]): string {
  const candidate = base.trim() || 'new_item';
  if (!existing.includes(candidate)) return candidate;
  let index = 2;
  while (existing.includes(`${candidate}_${index}`)) index += 1;
  return `${candidate}_${index}`;
}

export function validateName(name: string, existing: string[], current?: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return 'Name is required.';
  if (existing.some((entry) => entry === trimmed && entry !== current)) {
    return 'Name must be unique.';
  }
  return null;
}

/** @deprecated Use validateName */
export const validateEnName = validateName;

/** @deprecated Use uniqueName via add* helpers */
export function uniqueEnName(prefix: string, existing: string[]): string {
  return uniqueName(prefix, existing);
}

export function addDatabase(file: DatabaseRefFile): DatabaseRefFile {
  const name = uniqueName(
    'new_database',
    file.databases.map((db) => db.name)
  );
  return {
    databases: [...file.databases, { name, tables: [] }],
  };
}

export function renameDatabase(
  file: DatabaseRefFile,
  oldName: string,
  newName: string
): { file: DatabaseRefFile; error?: string } {
  const db = findDatabase(file, oldName);
  if (!db) return { file, error: 'Database not found.' };
  const error = validateName(
    newName,
    file.databases.map((entry) => entry.name),
    oldName
  );
  if (error) return { file, error };
  return {
    file: {
      databases: file.databases.map((entry) =>
        entry.name === oldName ? { ...entry, name: newName.trim() } : entry
      ),
    },
  };
}

export function deleteDatabase(file: DatabaseRefFile, name: string): DatabaseRefFile {
  return { databases: file.databases.filter((db) => db.name !== name) };
}

export function addTable(file: DatabaseRefFile, databaseName: string): { file: DatabaseRefFile; error?: string } {
  const db = findDatabase(file, databaseName);
  if (!db) return { file, error: 'Database not found.' };
  const name = uniqueName(
    'new_table',
    db.tables.map((table) => table.name)
  );
  return {
    file: {
      databases: file.databases.map((entry) =>
        entry.name === databaseName
          ? { ...entry, tables: [...entry.tables, { name, columns: [] }] }
          : entry
      ),
    },
  };
}

export function renameTable(
  file: DatabaseRefFile,
  databaseName: string,
  oldName: string,
  newName: string
): { file: DatabaseRefFile; error?: string } {
  const db = findDatabase(file, databaseName);
  const table = findTable(db, oldName);
  if (!db || !table) return { file, error: 'Table not found.' };
  const error = validateName(
    newName,
    db.tables.map((entry) => entry.name),
    oldName
  );
  if (error) return { file, error };
  return {
    file: {
      databases: file.databases.map((entry) =>
        entry.name === databaseName
          ? {
              ...entry,
              tables: entry.tables.map((tableEntry) =>
                tableEntry.name === oldName ? { ...tableEntry, name: newName.trim() } : tableEntry
              ),
            }
          : entry
      ),
    },
  };
}

export function deleteTable(file: DatabaseRefFile, databaseName: string, tableName: string): DatabaseRefFile {
  return {
    databases: file.databases.map((entry) =>
      entry.name === databaseName
        ? { ...entry, tables: entry.tables.filter((table) => table.name !== tableName) }
        : entry
    ),
  };
}

export function addColumn(
  file: DatabaseRefFile,
  databaseName: string,
  tableName: string
): { file: DatabaseRefFile; error?: string } {
  const db = findDatabase(file, databaseName);
  const table = findTable(db, tableName);
  if (!db || !table) return { file, error: 'Table not found.' };
  const name = uniqueName(
    'new_column',
    table.columns.map((column) => column.name)
  );
  return {
    file: {
      databases: file.databases.map((entry) =>
        entry.name === databaseName
          ? {
              ...entry,
              tables: entry.tables.map((tableEntry) =>
                tableEntry.name === tableName
                  ? { ...tableEntry, columns: [...tableEntry.columns, { name }] }
                  : tableEntry
              ),
            }
          : entry
      ),
    },
  };
}

export function renameColumn(
  file: DatabaseRefFile,
  databaseName: string,
  tableName: string,
  oldName: string,
  newName: string
): { file: DatabaseRefFile; error?: string } {
  const db = findDatabase(file, databaseName);
  const table = findTable(db, tableName);
  const column = findColumn(table, oldName);
  if (!db || !table || !column) return { file, error: 'Column not found.' };
  const error = validateName(
    newName,
    table.columns.map((entry) => entry.name),
    oldName
  );
  if (error) return { file, error };
  return {
    file: {
      databases: file.databases.map((entry) =>
        entry.name === databaseName
          ? {
              ...entry,
              tables: entry.tables.map((tableEntry) =>
                tableEntry.name === tableName
                  ? {
                      ...tableEntry,
                      columns: tableEntry.columns.map((columnEntry) =>
                        columnEntry.name === oldName
                          ? { ...columnEntry, name: newName.trim() }
                          : columnEntry
                      ),
                    }
                  : tableEntry
              ),
            }
          : entry
      ),
    },
  };
}

export function deleteColumn(
  file: DatabaseRefFile,
  databaseName: string,
  tableName: string,
  columnName: string
): DatabaseRefFile {
  return {
    databases: file.databases.map((entry) =>
      entry.name === databaseName
        ? {
            ...entry,
            tables: entry.tables.map((tableEntry) =>
              tableEntry.name === tableName
                ? {
                    ...tableEntry,
                    columns: tableEntry.columns.filter((column) => column.name !== columnName),
                  }
                : tableEntry
            ),
          }
        : entry
    ),
  };
}

export function setDatabaseDescription(
  file: DatabaseRefFile,
  databaseName: string,
  description: string
): { file: DatabaseRefFile; error?: string } {
  const db = findDatabase(file, databaseName);
  if (!db) return { file, error: 'Database not found.' };
  return {
    file: {
      databases: file.databases.map((entry) =>
        entry.name === databaseName ? { ...entry, description } : entry
      ),
    },
  };
}

export function setTableDescription(
  file: DatabaseRefFile,
  databaseName: string,
  tableName: string,
  description: string
): { file: DatabaseRefFile; error?: string } {
  const db = findDatabase(file, databaseName);
  const table = findTable(db, tableName);
  if (!db || !table) return { file, error: 'Table not found.' };
  return {
    file: {
      databases: file.databases.map((entry) =>
        entry.name === databaseName
          ? {
              ...entry,
              tables: entry.tables.map((tableEntry) =>
                tableEntry.name === tableName ? { ...tableEntry, description } : tableEntry
              ),
            }
          : entry
      ),
    },
  };
}

export function setColumnDescription(
  file: DatabaseRefFile,
  databaseName: string,
  tableName: string,
  columnName: string,
  description: string
): { file: DatabaseRefFile; error?: string } {
  const db = findDatabase(file, databaseName);
  const table = findTable(db, tableName);
  const column = findColumn(table, columnName);
  if (!db || !table || !column) return { file, error: 'Column not found.' };
  return {
    file: {
      databases: file.databases.map((entry) =>
        entry.name === databaseName
          ? {
              ...entry,
              tables: entry.tables.map((tableEntry) =>
                tableEntry.name === tableName
                  ? {
                      ...tableEntry,
                      columns: tableEntry.columns.map((columnEntry) =>
                        columnEntry.name === columnName ? { ...columnEntry, description } : columnEntry
                      ),
                    }
                  : tableEntry
              ),
            }
          : entry
      ),
    },
  };
}

export function applyDescriptionUpdate(
  file: DatabaseRefFile,
  level: DatabaseRefLevel,
  ids: { databaseName: string; tableName?: string; columnName?: string },
  description: string
): { file: DatabaseRefFile; error?: string } {
  if (level === 'database') {
    return setDatabaseDescription(file, ids.databaseName, description);
  }
  if (level === 'table' && ids.tableName) {
    return setTableDescription(file, ids.databaseName, ids.tableName, description);
  }
  if (level === 'column' && ids.tableName && ids.columnName) {
    return setColumnDescription(file, ids.databaseName, ids.tableName, ids.columnName, description);
  }
  return { file, error: 'Invalid description target.' };
}

export type RenameMap = {
  database?: { oldName: string; newName: string };
  table?: { oldName: string; newName: string };
  column?: { oldName: string; newName: string };
};

export function remapElementFieldNames(
  fields: {
    databaseName: string;
    tableName: string;
    columnName: string;
    inf1: string;
    inf2: string;
    inf3: string;
  },
  renameMap: RenameMap
): {
  databaseName: string;
  tableName: string;
  columnName: string;
  inf1: string;
  inf2: string;
  inf3: string;
} {
  let { databaseName, tableName, columnName, inf1, inf2, inf3 } = fields;
  if (renameMap.database && databaseName === renameMap.database.oldName) {
    databaseName = renameMap.database.newName;
  }
  if (renameMap.table && tableName === renameMap.table.oldName) {
    tableName = renameMap.table.newName;
  }
  if (renameMap.column && columnName === renameMap.column.oldName) {
    columnName = renameMap.column.newName;
  }
  if (renameMap.database && inf1 === renameMap.database.oldName) {
    inf1 = renameMap.database.newName;
  }
  if (renameMap.table && inf2 === renameMap.table.oldName) {
    inf2 = renameMap.table.newName;
  }
  if (renameMap.column && inf3 === renameMap.column.oldName) {
    inf3 = renameMap.column.newName;
  }
  return { databaseName, tableName, columnName, inf1, inf2, inf3 };
}
