import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const db = new Database('./database/settings.db');
const dataDir = './src/data';

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Get all tables from database
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all() as { name: string }[];

try {
  console.log('Starting export from SQLite to JSON...');
  console.log(`Found ${tables.length} tables in database\n`);

  for (const table of tables) {
    const tableName = table.name;
    const rows = db.prepare(`SELECT * FROM ${tableName}`).all();
    const filePath = path.join(dataDir, `${tableName}.json`);
    
    fs.writeFileSync(filePath, JSON.stringify(rows, null, 2), 'utf-8');
    console.log(`✓ Exported ${tableName}: ${rows.length} rows`);
  }

  console.log('\n✓ Export completed successfully!');
  console.log(`Data exported to: ${dataDir}`);
} catch (error) {
  console.error('✗ Export failed:', error);
  process.exit(1);
} finally {
  db.close();
}
