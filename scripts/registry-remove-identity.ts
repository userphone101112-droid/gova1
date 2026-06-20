#!/usr/bin/env tsx
import { execFileSync } from 'child_process';
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd();
const REGISTRY_DIRS = [
  join(ROOT, 'src', 'platform', 'ui', 'registry', 'features'),
  join(ROOT, 'src', 'platform', 'ui', 'registry', 'categories'),
];

function listTsFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((item) => {
    const fullPath = join(dir, item.name);
    if (item.isDirectory()) return listTsFiles(fullPath);
    if (item.isFile() && item.name.endsWith('.ts')) return [fullPath];
    return [];
  });
}

function extractString(body: string, key: string): string {
  const match = body.match(new RegExp(`(?:^|\\n)\\s*${key}:\\s*'([^']+)'`));
  return match?.[1] ?? '';
}

function removeIdentityFromFile(filePath: string, lookup: string): boolean {
  const content = readFileSync(filePath, 'utf-8');
  let removed = false;

  const nextContent = content.replace(
    /\n\s*[A-Z0-9_]+:\s*{\r?\n(\s*)([\s\S]*?\buuid:\s*'[^']+'[\s\S]*?\bid:\s*'[^']+'[\s\S]*?\bpath:\s*'[^']+'[\s\S]*?)\r?\n\s*}\s+as const,?/g,
    (fullMatch, _indent: string, body: string) => {
      const uuid = extractString(body, 'uuid');
      const id = extractString(body, 'id');
      const path = extractString(body, 'path');
      if (![uuid, id, path].includes(lookup)) return fullMatch;

      removed = true;
      return '';
    }
  );

  if (removed) {
    writeFileSync(filePath, nextContent, 'utf-8');
  }

  return removed;
}

function main() {
  const lookup = process.argv[2];
  if (!lookup) {
    throw new Error('Usage: npm run registry:remove -- <uuid|id|path>');
  }

  const changedFiles = REGISTRY_DIRS.flatMap((dir) => listTsFiles(dir)).filter((file) =>
    removeIdentityFromFile(file, lookup)
  );

  if (changedFiles.length === 0) {
    throw new Error(`No UI identity matched "${lookup}".`);
  }

  execFileSync('cmd', ['/c', 'npx', 'tsx', 'scripts/registry-materialize-uuids.ts'], {
    stdio: 'inherit',
    cwd: ROOT,
  });

  console.log(`Removed ${lookup} from active registry and preserved it in removedIdentities.`);
}

main();
