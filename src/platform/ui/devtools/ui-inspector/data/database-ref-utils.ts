import {
  ACCESS_PATTERN_OPTIONS,
  COLUMN_DATA_TYPE_OPTIONS,
  COLUMN_SENSITIVITY_OPTIONS,
  DATABASE_LIFECYCLE_OPTIONS,
  TABLE_TYPE_OPTIONS,
} from './catalog-options';
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

function optionalString(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  const trimmed = String(value).trim();
  return trimmed || undefined;
}

function optionalBoolean(value: unknown): boolean | undefined {
  if (value === undefined || value === null) return undefined;
  return Boolean(value);
}

function enumValue<T extends string>(value: unknown, allowed: readonly T[]): T | undefined {
  const trimmed = String(value ?? '').trim();
  return allowed.includes(trimmed as T) ? (trimmed as T) : undefined;
}

function normalizeColumn(raw: unknown): DatabaseRefColumn {
  if (!raw || typeof raw !== 'object') {
    return { name: '' };
  }
  const source = raw as Record<string, unknown>;
  const name = readLegacyName(source);
  const column: DatabaseRefColumn = { name };
  const description = readNormalizedDescription(source);
  if (description) column.description = description;
  const dataType = enumValue(source.dataType, COLUMN_DATA_TYPE_OPTIONS);
  if (dataType) column.dataType = dataType;
  const nullable = optionalBoolean(source.nullable);
  if (nullable !== undefined) column.nullable = nullable;
  const unique = optionalBoolean(source.unique);
  if (unique !== undefined) column.unique = unique;
  const indexed = optionalBoolean(source.indexed);
  if (indexed !== undefined) column.indexed = indexed;
  const isPrimaryKey = optionalBoolean(source.isPrimaryKey);
  if (isPrimaryKey !== undefined) column.isPrimaryKey = isPrimaryKey;
  const isForeignKey = optionalBoolean(source.isForeignKey);
  if (isForeignKey !== undefined) column.isForeignKey = isForeignKey;
  const referencesDatabase = optionalString(source.referencesDatabase);
  if (referencesDatabase) column.referencesDatabase = referencesDatabase;
  const referencesTable = optionalString(source.referencesTable);
  if (referencesTable) column.referencesTable = referencesTable;
  const referencesColumn = optionalString(source.referencesColumn);
  if (referencesColumn) column.referencesColumn = referencesColumn;
  const sensitivity = enumValue(source.sensitivity, COLUMN_SENSITIVITY_OPTIONS);
  if (sensitivity) column.sensitivity = sensitivity;
  const validationRule = optionalString(source.validationRule);
  if (validationRule) column.validationRule = validationRule;
  const exampleValue = optionalString(source.exampleValue);
  if (exampleValue) column.exampleValue = exampleValue;
  return column;
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
  const table: DatabaseRefTable = { name, columns };
  const description = readNormalizedDescription(source);
  if (description) table.description = description;
  const entityName = optionalString(source.entityName);
  if (entityName) table.entityName = entityName;
  const tableType = enumValue(source.tableType, TABLE_TYPE_OPTIONS);
  if (tableType) table.tableType = tableType;
  const expectedRows = optionalString(source.expectedRows);
  if (expectedRows) table.expectedRows = expectedRows;
  const accessPattern = enumValue(source.accessPattern, ACCESS_PATTERN_OPTIONS);
  if (accessPattern) table.accessPattern = accessPattern;
  const notes = optionalString(source.notes);
  if (notes) table.notes = notes;
  return table;
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
  const database: DatabaseRefDatabase = { name, tables };
  const description = readNormalizedDescription(source);
  if (description) database.description = description;
  const entityName = optionalString(source.entityName);
  if (entityName) database.entityName = entityName;
  const ownerFeature = optionalString(source.ownerFeature);
  if (ownerFeature) database.ownerFeature = ownerFeature;
  const domain = optionalString(source.domain);
  if (domain) database.domain = domain;
  const lifecycle = enumValue(source.lifecycle, DATABASE_LIFECYCLE_OPTIONS);
  if (lifecycle) database.lifecycle = lifecycle;
  return database;
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

export type DatabaseRefValidationIssue = {
  path: string;
  message: string;
};

function validateColumnEntity(
  file: DatabaseRefFile,
  databaseName: string,
  tableName: string,
  column: DatabaseRefColumn
): DatabaseRefValidationIssue[] {
  const issues: DatabaseRefValidationIssue[] = [];
  const basePath = `${databaseName}/${tableName}/${column.name || '(unnamed)'}`;

  if (!column.name.trim()) {
    issues.push({ path: basePath, message: 'Column name is required.' });
  }

  if (column.dataType && !COLUMN_DATA_TYPE_OPTIONS.includes(column.dataType)) {
    issues.push({ path: basePath, message: 'Invalid column dataType.' });
  }

  if (column.sensitivity && !COLUMN_SENSITIVITY_OPTIONS.includes(column.sensitivity)) {
    issues.push({ path: basePath, message: 'Invalid column sensitivity.' });
  }

  if (column.isPrimaryKey && column.nullable) {
    issues.push({ path: basePath, message: 'Primary key columns cannot be nullable.' });
  }

  if (column.isForeignKey) {
    const refDb = column.referencesDatabase?.trim();
    const refTable = column.referencesTable?.trim();
    const refColumn = column.referencesColumn?.trim();
    if (!refDb || !refTable || !refColumn) {
      issues.push({ path: basePath, message: 'Foreign key requires complete references.' });
    } else {
      const targetDb = findDatabase(file, refDb);
      const targetTable = findTable(targetDb, refTable);
      const targetColumn = findColumn(targetTable, refColumn);
      if (!targetDb || !targetTable || !targetColumn) {
        issues.push({ path: basePath, message: 'Foreign key references must point to existing catalog entries.' });
      }
    }
  }

  return issues;
}

export function validateDatabaseRefFile(file: DatabaseRefFile): DatabaseRefValidationIssue[] {
  const issues: DatabaseRefValidationIssue[] = [];
  const databaseNames = new Set<string>();

  for (const database of file.databases) {
    if (!database.name.trim()) {
      issues.push({ path: 'database/(unnamed)', message: 'Database name is required.' });
      continue;
    }
    if (databaseNames.has(database.name)) {
      issues.push({ path: database.name, message: 'Duplicate database name.' });
    }
    databaseNames.add(database.name);

    if (database.lifecycle && !DATABASE_LIFECYCLE_OPTIONS.includes(database.lifecycle)) {
      issues.push({ path: database.name, message: 'Invalid database lifecycle.' });
    }

    const tableNames = new Set<string>();
    for (const table of database.tables) {
      const tablePath = `${database.name}/${table.name || '(unnamed)'}`;
      if (!table.name.trim()) {
        issues.push({ path: tablePath, message: 'Table name is required.' });
        continue;
      }
      if (tableNames.has(table.name)) {
        issues.push({ path: tablePath, message: 'Duplicate table name in database.' });
      }
      tableNames.add(table.name);

      if (table.tableType && !TABLE_TYPE_OPTIONS.includes(table.tableType)) {
        issues.push({ path: tablePath, message: 'Invalid tableType.' });
      }
      if (table.accessPattern && !ACCESS_PATTERN_OPTIONS.includes(table.accessPattern)) {
        issues.push({ path: tablePath, message: 'Invalid accessPattern.' });
      }

      const columnNames = new Set<string>();
      for (const column of table.columns) {
        if (column.name && columnNames.has(column.name)) {
          issues.push({ path: `${tablePath}/${column.name}`, message: 'Duplicate column name in table.' });
        }
        if (column.name) columnNames.add(column.name);
        issues.push(...validateColumnEntity(file, database.name, table.name, column));
      }
    }
  }

  return issues;
}

export function replaceDatabase(
  file: DatabaseRefFile,
  databaseName: string,
  nextDatabase: DatabaseRefDatabase
): { file: DatabaseRefFile; error?: string } {
  const db = findDatabase(file, databaseName);
  if (!db) return { file, error: 'Database not found.' };
  const error = validateName(
    nextDatabase.name,
    file.databases.map((entry) => entry.name),
    databaseName
  );
  if (error) return { file, error };
  const candidate: DatabaseRefFile = {
    databases: file.databases.map((entry) =>
      entry.name === databaseName ? nextDatabase : entry
    ),
  };
  const issues = validateDatabaseRefFile(candidate);
  if (issues.length) return { file, error: issues[0]?.message ?? 'Validation failed.' };
  return { file: candidate };
}

export function replaceTable(
  file: DatabaseRefFile,
  databaseName: string,
  tableName: string,
  nextTable: DatabaseRefTable
): { file: DatabaseRefFile; error?: string } {
  const db = findDatabase(file, databaseName);
  const table = findTable(db, tableName);
  if (!db || !table) return { file, error: 'Table not found.' };
  const error = validateName(
    nextTable.name,
    db.tables.map((entry) => entry.name),
    tableName
  );
  if (error) return { file, error };
  const candidate: DatabaseRefFile = {
    databases: file.databases.map((entry) =>
      entry.name === databaseName
        ? {
            ...entry,
            tables: entry.tables.map((tableEntry) =>
              tableEntry.name === tableName ? nextTable : tableEntry
            ),
          }
        : entry
    ),
  };
  const issues = validateDatabaseRefFile(candidate);
  if (issues.length) return { file, error: issues[0]?.message ?? 'Validation failed.' };
  return { file: candidate };
}

export function replaceColumn(
  file: DatabaseRefFile,
  databaseName: string,
  tableName: string,
  columnName: string,
  nextColumn: DatabaseRefColumn
): { file: DatabaseRefFile; error?: string } {
  const db = findDatabase(file, databaseName);
  const table = findTable(db, tableName);
  const column = findColumn(table, columnName);
  if (!db || !table || !column) return { file, error: 'Column not found.' };
  const error = validateName(
    nextColumn.name,
    table.columns.map((entry) => entry.name),
    columnName
  );
  if (error) return { file, error };
  const candidate: DatabaseRefFile = {
    databases: file.databases.map((entry) =>
      entry.name === databaseName
        ? {
            ...entry,
            tables: entry.tables.map((tableEntry) =>
              tableEntry.name === tableName
                ? {
                    ...tableEntry,
                    columns: tableEntry.columns.map((columnEntry) =>
                      columnEntry.name === columnName ? nextColumn : columnEntry
                    ),
                  }
                : tableEntry
            ),
          }
        : entry
    ),
  };
  const issues = validateDatabaseRefFile(candidate);
  if (issues.length) return { file, error: issues[0]?.message ?? 'Validation failed.' };
  return { file: candidate };
}
