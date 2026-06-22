import { randomUUID } from 'crypto';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';

type CheckTranslationItem = {
  key: string;
  uuid?: string;
  updatedAt?: string;
  [key: string]: unknown;
};

type CheckTranslationFile = {
  savedAt?: string | null;
  updatedAt?: string;
  items?: CheckTranslationItem[];
};

const CHECK_FILE = path.join(process.cwd(), 'data', 'ui-inspector', 'check-translation.json');

function main(): void {
  if (!existsSync(CHECK_FILE)) {
    console.log(`No check translation file found at ${CHECK_FILE}`);
    return;
  }

  const data = JSON.parse(readFileSync(CHECK_FILE, 'utf-8')) as CheckTranslationFile;
  const items = Array.isArray(data.items) ? data.items : [];
  let created = 0;

  for (const item of items) {
    const uuid = typeof item.uuid === 'string' ? item.uuid.trim() : '';
    if (uuid) continue;
    item.uuid = `lang-${randomUUID()}`;
    item.updatedAt = new Date().toISOString();
    created += 1;
  }

  if (created > 0) {
    data.items = items;
    data.updatedAt = new Date().toISOString();
    writeFileSync(CHECK_FILE, `${JSON.stringify(data, null, 2)}\n`, 'utf-8');
  }

  console.log(`Created ${created} lang UUID${created === 1 ? '' : 's'} in ${CHECK_FILE}`);
}

main();
