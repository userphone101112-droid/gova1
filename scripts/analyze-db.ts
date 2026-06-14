import Database from 'better-sqlite3';

const db = new Database('./database/settings.db');

try {
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as { name: string }[];
  console.log('Tables in database:', tables);

  for (const table of tables) {
    const columns = db.prepare(`PRAGMA table_info(${table.name})`).all() as any[];
    console.log(`\nTable: ${table.name}`);
    console.log('Columns:', columns.map(col => `${col.name} (${col.type})`).join(', '));
    
    const count = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get() as { count: number };
    console.log(`Rows: ${count.count}`);
  }
} catch (error) {
  console.error('Error:', error);
} finally {
  db.close();
}
