import { describe, expect, it } from '@jest/globals';

import {
  emptyDatabaseRefFile,
  findDatabase,
  findTable,
  normalizeDatabaseRefFile,
  uniqueEnName,
} from '../data/database-ref-utils';

describe('database-ref-utils', () => {
  it('normalizes invalid payloads to empty file', () => {
    expect(normalizeDatabaseRefFile(null)).toEqual(emptyDatabaseRefFile());
    expect(normalizeDatabaseRefFile({ databases: 'bad' })).toEqual(emptyDatabaseRefFile());
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
});
