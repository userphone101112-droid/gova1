#!/usr/bin/env tsx
/**
 * CI: scan active code for legacy Ui* / factory / legacy DOM attrs.
 * Scope: src/**, scripts/generate-feature.ts (matches uuid-dom-absolute coverage).
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const ROOT = process.cwd();
const SCAN_ROOTS = [
  join(ROOT, 'src'),
  join(ROOT, 'scripts', 'generate-feature.ts'),
];

const EXCLUDED_PATH_PARTS = [
  '/node_modules/',
  '/.next/',
  '/enforcement/eslint/',
  '/enforcement/scripts/codemod',
];

const ALLOWED_LEGACY_REF_FILES = new Set([
  'platform/ui/registry/types.ts',
  'platform/ui/telemetry/ui-telemetry.ts',
  'platform/ui/i18n/core/resolveTranslationSource.ts',
  'platform/ui/enforcement/eslint/no-legacy-ui-imports.js',
  'platform/ui/enforcement/eslint/uuid-dom-validation.js',
  'platform/ui/enforcement/eslint/require-data-ui-uuid.test.js',
]);

const PATTERNS: Array<{ label: string; re: RegExp }> = [
  { label: 'UiButton', re: /\bUiButton\b/ },
  { label: 'UiDiv', re: /\bUiDiv\b/ },
  { label: 'createUiComponent', re: /\bcreateUiComponent\b/ },
  { label: 'createUiStyledComponent', re: /\bcreateUiStyledComponent\b/ },
  { label: 'data-ui-id=', re: /data-ui-id\s*=/ },
  { label: 'data-ui-path=', re: /data-ui-path\s*=/ },
  { label: 'data-ui-feature=', re: /data-ui-feature\s*=/ },
  { label: 'registry/ui-uuid import', re: /from\s+['"][^'"]*registry\/ui-uuid['"]|require\s*\(\s*['"][^'"]*registry\/ui-uuid['"]\s*\)/ },
];

function shouldScanFile(absPath: string): boolean {
  const normalized = absPath.replace(/\\/g, '/');
  if (!/\.(tsx?|jsx?)$/.test(normalized)) return false;
  if (EXCLUDED_PATH_PARTS.some((part) => normalized.includes(part))) return false;
  if (/\.(test|spec)\.(tsx?|jsx?)$/.test(normalized)) return false;
  return true;
}

function collectFiles(target: string, files: string[] = []): string[] {
  if (!statSync(target, { throwIfNoEntry: false })?.isDirectory()) {
    if (shouldScanFile(target)) files.push(target);
    return files;
  }

  for (const entry of readdirSync(target, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.next') continue;
    collectFiles(join(target, entry.name), files);
  }
  return files;
}

const violations: string[] = [];

for (const root of SCAN_ROOTS) {
  for (const file of collectFiles(root)) {
    const relFromRoot = relative(ROOT, file).replace(/\\/g, '/');
    const relKey = relFromRoot.startsWith('src/')
      ? relFromRoot.slice('src/'.length)
      : relFromRoot;

    if (ALLOWED_LEGACY_REF_FILES.has(relKey) || relKey.endsWith('.d.ts')) continue;

    const content = readFileSync(file, 'utf-8');
    for (const { label, re } of PATTERNS) {
      if (re.test(content)) {
        violations.push(`${relFromRoot}: legacy pattern "${label}"`);
        break;
      }
    }
  }
}

if (violations.length > 0) {
  console.error('❌ ci:project-legacy-scan failed:\n');
  violations.forEach((v) => console.error(`  - ${v}`));
  process.exit(1);
}

console.log('✅ ci:project-legacy-scan passed');
