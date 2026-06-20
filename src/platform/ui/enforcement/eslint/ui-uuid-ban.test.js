/**
 * Ensures the removed uiUuid helper cannot be imported or reintroduced.
 * Run via: npm run test:eslint-ui
 */
const { existsSync, readFileSync, readdirSync } = require('fs');
const { join } = require('path');

const ROOT = process.cwd();
const UI_UUID_FILE = join(ROOT, 'src/platform/ui/registry/ui-uuid.ts');
const PLATFORM_INDEX = join(ROOT, 'src/platform/ui/index.ts');

if (existsSync(UI_UUID_FILE)) {
  throw new Error('src/platform/ui/registry/ui-uuid.ts must not exist — use data-ui-uuid={REGISTRY.PATH.uuid}');
}

const indexContent = readFileSync(PLATFORM_INDEX, 'utf-8');
if (/from\s+['"]\.\/registry\/ui-uuid['"]/.test(indexContent)) {
  throw new Error('platform/ui/index.ts must not export from ./registry/ui-uuid');
}
if (/\buiUuid\b/.test(indexContent)) {
  throw new Error('platform/ui/index.ts must not reference uiUuid');
}

const BANNED_IMPORT = /from\s+['"][^'"]*registry\/ui-uuid['"]|require\s*\(\s*['"][^'"]*registry\/ui-uuid['"]\s*\)/;
const SCAN_ROOTS = [join(ROOT, 'src'), join(ROOT, 'scripts')];

function walk(dir, files = []) {
  if (!existsSync(dir)) return files;
  const stat = require('fs').statSync(dir);
  if (!stat.isDirectory()) {
    if (/\.(tsx?|jsx?)$/.test(dir)) files.push(dir);
    return files;
  }
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.next') continue;
    walk(join(dir, entry.name), files);
  }
  return files;
}

for (const file of SCAN_ROOTS.flatMap((root) => walk(root))) {
  const rel = file.replace(/\\/g, '/');
  if (rel.includes('/enforcement/eslint/')) continue;
  const content = readFileSync(file, 'utf-8');
  if (BANNED_IMPORT.test(content)) {
    throw new Error(`Direct import from registry/ui-uuid is forbidden: ${rel}`);
  }
}

console.log('ui-uuid-ban test passed');
