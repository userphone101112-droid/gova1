import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const db = new Database('./database/settings.db');
const dataDir = './src/data';

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const tables = [
  'categories',
  'subcategories',
  'pharmacy_categories',
  'pharmacy_subcategories',
  'forms',
  'strengths',
  'active_ingredients',
  'active_ingredient_forms',
  'active_ingredient_strengths',
  'product_brands'
];

try {
  console.log('Starting export from SQLite to JSON...');

  for (const table of tables) {
    const rows = db.prepare(`SELECT * FROM ${table}`).all();
    const filePath = path.join(dataDir, `${table}.json`);
    
    fs.writeFileSync(filePath, JSON.stringify(rows, null, 2), 'utf-8');
    console.log(`✓ Exported ${table}: ${rows.length} rows`);
  }

  console.log('\n✓ Export completed successfully!');
  console.log(`Data exported to: ${dataDir}`);
} catch (error) {
  console.error('✗ Export failed:', error);
  process.exit(1);
} finally {
  db.close();
}
