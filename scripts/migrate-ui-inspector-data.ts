import fs from 'fs/promises';
import path from 'path';

import type { DatabaseRefFile } from '../src/platform/ui/devtools/ui-inspector/data/database-ref.types';
import { migrateLegacyInspectorDataToLayout } from '../src/platform/ui/devtools/ui-inspector/services/inspector-persistence.service';

async function runInspectorConfigMigration(): Promise<void> {
  let databaseRef: DatabaseRefFile = { databases: [] };
  try {
    const raw = await fs.readFile(path.join(process.cwd(), 'data', 'database_ref.json'), 'utf8');
    databaseRef = JSON.parse(raw) as DatabaseRefFile;
  } catch {
    /* use empty ref */
  }

  const result = await migrateLegacyInspectorDataToLayout(databaseRef);
  console.log(
    `[ui-inspector] Migrated ${result.migrated} entries to data/ui-inspector/ at ${result.migratedAt}`
  );
}

runInspectorConfigMigration().catch((error) => {
  console.error('[ui-inspector] Migration failed:', error);
  process.exit(1);
});
