#!/usr/bin/env tsx
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';

const CHECK = process.argv.includes('--check');

console.log('📦 Registry generate...\n');
execSync('npx tsx scripts/generate-app-route-manifest.ts', { stdio: 'inherit' });
execSync('npx tsx scripts/generate-registry-member-paths.ts', { stdio: 'inherit' });

const sourceIndexPath = join(process.cwd(), 'src/platform/ui/registry/source-index.ts');
const before = readFileSync(sourceIndexPath, 'utf-8');

execSync('npm run audit:unified-ui-i18n', { stdio: 'inherit' });

const after = readFileSync(sourceIndexPath, 'utf-8');

if (CHECK && before !== after) {
  console.error('\n❌ source-index.ts is out of date. Run: npm run registry:generate');
  process.exit(1);
}

if (!CHECK) {
  console.log('\n✅ Registry source index updated');
} else {
  console.log('\n✅ Registry source index is up to date');
}
