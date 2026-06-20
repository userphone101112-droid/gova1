#!/usr/bin/env tsx
/**
 * CI: registry files must be tool-generated — no manual uuid-manifest/registry drift.
 */
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd();
const REGISTRY_PATHS = [
  'src/platform/ui/registry/uuid-manifest.json',
  'src/platform/ui/registry/registry-member-paths.json',
  'src/platform/ui/registry/source-index.ts',
];

function gitDiff(paths: string[]): string {
  try {
    return execSync(`git diff -- ${paths.map((p) => `"${p}"`).join(' ')}`, {
      cwd: ROOT,
      encoding: 'utf-8',
    });
  } catch {
    return readFileSync(join(ROOT, '.gitignore'), 'utf-8') && '';
  }
}

execSync('npm run registry:materialize-uuids', { stdio: 'inherit', cwd: ROOT });
execSync('npx tsx scripts/generate-registry-member-paths.ts', { stdio: 'inherit', cwd: ROOT });
execSync('npm run audit:unified-ui-i18n', { stdio: 'inherit', cwd: ROOT });

const diff = gitDiff(REGISTRY_PATHS);
if (diff.trim()) {
  console.error('❌ ci:registry-integrity failed — generated registry files are stale.');
  console.error('Run: npm run registry:materialize-uuids && npm run registry:generate');
  console.error('Use registry:move to change paths while preserving UUID.');
  process.exit(1);
}

console.log('✅ ci:registry-integrity passed');
