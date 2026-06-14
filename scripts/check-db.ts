import Database from 'better-sqlite3';

const db = new Database('./database/gova.db');

try {
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as {
    name: string;
  }[];
  console.log('Tables in database:', tables);

  if (tables.length > 0 && tables[0]) {
    const firstTable = tables[0].name;
    const count = db.prepare(`SELECT COUNT(*) as count FROM ${firstTable}`).get() as {
      count: number;
    };
    console.log(`Row count in ${firstTable}:`, count);
  }
} catch (error) {
  console.log('Database might be empty or corrupted:', (error as Error).message);
}

db.close();
