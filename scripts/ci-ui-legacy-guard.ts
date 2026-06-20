#!/usr/bin/env tsx
/**
 * CI guard: no legacy Ui* components, data-ui-id/path/feature in src.
 */
import { readFileSync, readdirSync } from 'fs';
import { join, relative } from 'path';

const ROOT = join(process.cwd(), 'src');
const ALLOWED_UI_PREFIX_FILES = new Set([
  'platform/ui/registry/types.ts',
  'platform/ui/telemetry/ui-telemetry.ts',
  'platform/ui/i18n/core/resolveTranslationSource.ts',
]);

const LEGACY_DOM_ATTRS = ['data-ui-id', 'data-ui-path', 'data-ui-feature'];
const LEGACY_DOM_ATTR_PATTERN = (attr: string) => {
  const escaped = attr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(
    `(?:${escaped}\\s*=|getAttribute\\(['"]${escaped}['"]\\)|querySelector(?:All)?\\([^)]*\\[${escaped}(?:\\s|=|\\]|\\"))`,
    'm'
  );
};
const LEGACY_UI_COMPONENT = /\bUi(?:Button|Div|Input|Link|Image|Header|Label|Card|Section|Span|Main|Nav|Form|Select|Textarea|Checkbox|Radio|Switch|Modal|Badge|H[1-6]|P|A|Img)\b/;
const RUNTIME_IMPORT = /@\/platform\/ui\/runtime|createUiComponent|createUiStyledComponent/;

function walk(dir: string, files: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.next') continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(tsx?|jsx?)$/.test(entry.name)) files.push(full);
  }
  return files;
}

const violations: string[] = [];

for (const file of walk(ROOT)) {
  const rel = relative(join(process.cwd(), 'src'), file).replace(/\\/g, '/');
  const content = readFileSync(file, 'utf-8');

  if (LEGACY_UI_COMPONENT.test(content) && !rel.includes('enforcement/scripts/codemod')) {
    const isAllowedType = ALLOWED_UI_PREFIX_FILES.has(rel) || rel.endsWith('.d.ts');
    const isTestFile = /\.(test|spec)\.(tsx?|jsx?)$/.test(rel);
    const isEnforcementRule = rel.startsWith('platform/ui/enforcement/eslint/');
    if (!isAllowedType && !isTestFile && !isEnforcementRule && !rel.includes('scripts/')) {
      violations.push(`${rel}: legacy Ui* component reference`);
    }
  }

  if (RUNTIME_IMPORT.test(content) && !rel.startsWith('platform/ui/enforcement/eslint/')) {
    violations.push(`${rel}: legacy runtime factory import or path`);
  }

  for (const attr of LEGACY_DOM_ATTRS) {
    if (LEGACY_DOM_ATTR_PATTERN(attr).test(content)) {
      const isTestHelper = rel === 'platform/ui/telemetry/test-helpers.ts';
      if (!isTestHelper) {
        violations.push(`${rel}: forbidden legacy DOM attribute ${attr}`);
      }
    }
  }
}

if (violations.length > 0) {
  console.error('❌ UI legacy guard failed:\n');
  violations.forEach((v) => console.error(`  - ${v}`));
  process.exit(1);
}

console.log('✅ UI legacy guard passed');
