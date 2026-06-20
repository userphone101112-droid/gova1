import { describe, expect, it } from '@jest/globals';

import {
  addColumn,
  addDatabase,
  addTable,
  applyDescriptionUpdate,
  deleteColumn,
  deleteDatabase,
  deleteTable,
  emptyDatabaseRefFile,
  findDatabase,
  findTable,
  getEntityDescription,
  normalizeDatabaseRefFile,
  remapElementFieldNames,
  renameColumn,
  renameDatabase,
  renameTable,
  uniqueName,
  validateName,
} from '../data/database-ref-utils';

describe('database-ref-utils', () => {
  it('normalizes invalid payloads to empty file', () => {
    expect(normalizeDatabaseRefFile(null)).toEqual(emptyDatabaseRefFile());
    expect(normalizeDatabaseRefFile({ databases: 'bad' })).toEqual(emptyDatabaseRefFile());
  });

  it('reads legacy discription fields during normalization', () => {
    const file = normalizeDatabaseRefFile({
      databases: [
        {
          discription: 'legacy db',
          name_en: 'main_db',
          tables: [
            {
              discription: 'legacy table',
              name_en: 'users',
              columns: [{ discription: 'legacy column', name_en: 'id' }],
            },
          ],
        },
      ],
    });
    const db = findDatabase(file, 'main_db');
    expect(getEntityDescription(db)).toBe('legacy db');
    expect(getEntityDescription(findTable(db, 'users'))).toBe('legacy table');
    expect(getEntityDescription(findTable(db, 'users')?.columns[0])).toBe('legacy column');
  });

  it('migrates legacy name_en/name_ar into name/description', () => {
    const file = normalizeDatabaseRefFile({
      databases: [
        {
          name_ar: 'قاعدة',
          name_en: 'main_db',
          tables: [
            {
              name_ar: 'جدول',
              name_en: 'users',
              columns: [{ name_ar: 'عمود', name_en: 'id' }],
            },
          ],
        },
      ],
    });
    const db = findDatabase(file, 'main_db');
    expect(db?.name).toBe('main_db');
    expect(getEntityDescription(db)).toBe('قاعدة');
    expect(findTable(db, 'users')?.columns[0]?.name).toBe('id');
  });

  it('generates unique names', () => {
    expect(uniqueName('new_table', ['new_table'])).toBe('new_table_2');
  });

  it('validates empty and duplicate names', () => {
    expect(validateName('', ['a'])).toBe('Name is required.');
    expect(validateName('dup', ['dup'])).toBe('Name must be unique.');
    expect(validateName('dup', ['dup'], 'dup')).toBeNull();
  });

  it('supports database/table/column CRUD helpers', () => {
    let file = emptyDatabaseRefFile();
    file = addDatabase(file);
    const dbName = file.databases[0].name;
    const tableResult = addTable(file, dbName);
    expect(tableResult.error).toBeUndefined();
    file = tableResult.file;
    const tableName = file.databases[0].tables[0].name;
    const columnResult = addColumn(file, dbName, tableName);
    file = columnResult.file;
    const columnName = file.databases[0].tables[0].columns[0].name;

    const renamedDb = renameDatabase(file, dbName, 'renamed_db');
    expect(renamedDb.error).toBeUndefined();
    file = renamedDb.file;

    const renamedTable = renameTable(file, 'renamed_db', tableName, 'renamed_table');
    file = renamedTable.file!;

    const renamedColumn = renameColumn(file, 'renamed_db', 'renamed_table', columnName, 'renamed_column');
    file = renamedColumn.file!;

    file = deleteColumn(file, 'renamed_db', 'renamed_table', 'renamed_column');
    file = deleteTable(file, 'renamed_db', 'renamed_table');
    file = deleteDatabase(file, 'renamed_db');
    expect(file.databases).toHaveLength(0);
  });

  it('saves descriptions on database/table/column levels', () => {
    const file = normalizeDatabaseRefFile({
      databases: [{ name: 'db1', tables: [{ name: 't1', columns: [{ name: 'c1' }] }] }],
    });
    const dbDesc = applyDescriptionUpdate(file, 'database', { databaseName: 'db1' }, 'db desc');
    const tableDesc = applyDescriptionUpdate(dbDesc.file, 'table', {
      databaseName: 'db1',
      tableName: 't1',
    }, 'table desc');
    const columnDesc = applyDescriptionUpdate(tableDesc.file, 'column', {
      databaseName: 'db1',
      tableName: 't1',
      columnName: 'c1',
    }, 'column desc');

    expect(getEntityDescription(findDatabase(columnDesc.file, 'db1'))).toBe('db desc');
    expect(getEntityDescription(findTable(findDatabase(columnDesc.file, 'db1'), 't1'))).toBe('table desc');
    expect(
      getEntityDescription(findTable(findDatabase(columnDesc.file, 'db1'), 't1')?.columns[0])
    ).toBe('column desc');
  });

  it('remaps element field names after schema rename', () => {
    expect(
      remapElementFieldNames(
        {
          databaseName: 'db_old',
          tableName: 'table_old',
          columnName: 'col_old',
          inf1: 'db_old',
          inf2: 'table_old',
          inf3: 'col_old',
        },
        {
          database: { oldName: 'db_old', newName: 'db_new' },
          table: { oldName: 'table_old', newName: 'table_new' },
          column: { oldName: 'col_old', newName: 'col_new' },
        }
      )
    ).toEqual({
      databaseName: 'db_new',
      tableName: 'table_new',
      columnName: 'col_new',
      inf1: 'db_new',
      inf2: 'table_new',
      inf3: 'col_new',
    });
  });
});
