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
  uniqueEnName,
  validateEnName,
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

  it('finds database and table by english name', () => {
    const file = {
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
    };
    const db = findDatabase(file, 'main_db');
    expect(db?.name_ar).toBe('قاعدة');
    expect(findTable(db, 'users')?.columns[0]?.name_en).toBe('id');
  });

  it('generates unique english names', () => {
    expect(uniqueEnName('new_table', ['new_table_1'])).toBe('new_table_2');
  });

  it('validates empty and duplicate english names', () => {
    expect(validateEnName('', ['a'])).toBe('English name is required.');
    expect(validateEnName('dup', ['dup'])).toBe('English name must be unique.');
    expect(validateEnName('dup', ['dup'], 'dup')).toBeNull();
  });

  it('supports database/table/column CRUD helpers', () => {
    let file = emptyDatabaseRefFile();
    file = addDatabase(file);
    const dbName = file.databases[0].name_en;
    const tableResult = addTable(file, dbName);
    expect(tableResult.error).toBeUndefined();
    file = tableResult.file;
    const tableName = file.databases[0].tables[0].name_en;
    const columnResult = addColumn(file, dbName, tableName);
    file = columnResult.file;
    const columnName = file.databases[0].tables[0].columns[0].name_en;

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
      databases: [{ name_en: 'db1', tables: [{ name_en: 't1', columns: [{ name_en: 'c1' }] }] }],
    });
    const dbDesc = applyDescriptionUpdate(file, 'database', { databaseNameEn: 'db1' }, 'db desc');
    const tableDesc = applyDescriptionUpdate(dbDesc.file, 'table', {
      databaseNameEn: 'db1',
      tableNameEn: 't1',
    }, 'table desc');
    const columnDesc = applyDescriptionUpdate(tableDesc.file, 'column', {
      databaseNameEn: 'db1',
      tableNameEn: 't1',
      columnNameEn: 'c1',
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
        { inf1: 'db_old', inf2: 'table_old', inf3: 'col_old' },
        {
          database: { oldNameEn: 'db_old', newNameEn: 'db_new' },
          table: { oldNameEn: 'table_old', newNameEn: 'table_new' },
          column: { oldNameEn: 'col_old', newNameEn: 'col_new' },
        }
      )
    ).toEqual({ inf1: 'db_new', inf2: 'table_new', inf3: 'col_new' });
  });
});
