#!/usr/bin/env tsx
/**
 * CI: absolute UUID on every JSX intrinsic — AST scan of src, DevTools, generate-feature.
 */
import { readFileSync, readdirSync } from 'fs';
import { join, relative } from 'path';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const tsParser = require('@typescript-eslint/parser');

const {
  loadRegistryMemberPaths,
  loadRegistryMeta,
  isIntrinsicElement,
  getJsxTagName,
  validateOpeningElement,
  getAttribute,
  isBannedRegistryPath,
} = require('../src/platform/ui/enforcement/eslint/uuid-dom-validation.js');

const ROOT = process.cwd();
const TARGETS = [
  join(ROOT, 'src'),
  join(ROOT, 'scripts', 'generate-feature.ts'),
];

const LEGACY_PATTERNS = [
  /\bUi(?:Button|Div|Input|Link|Image|Header|Label|Card|Section|Span|Main|Nav|Form|Select|Textarea|Checkbox|Radio|Switch|Modal|Badge|H[1-6]|P|A|Img)\b/,
  /\bcreateUiComponent\b/,
  /\bcreateUiStyledComponent\b/,
  /\buiUuid\s*\(/,
  /data-ui-id\s*=/,
  /data-ui-path\s*=/,
  /data-ui-feature\s*=/,
];

function walk(dir: string, files: string[] = []): string[] {
  if (!readdirSync(dir, { withFileTypes: true })) return files;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.next') continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(tsx?|jsx?)$/.test(entry.name)) files.push(full);
  }
  return files;
}

function collectFiles(): string[] {
  const files = new Set<string>();
  for (const target of TARGETS) {
    if (target.endsWith('.ts') || target.endsWith('.tsx')) {
      files.add(target);
      continue;
    }
    walk(target).forEach((f) => files.add(f));
  }
  return [...files].filter((f) => !f.includes('.test.') && !f.includes('.spec.'));
}

function parseJsx(content: string, filePath: string) {
  return tsParser.parse(content, {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
    filePath,
  });
}

function walkAst(node: any, visit: (n: any) => void) {
  if (!node || typeof node !== 'object') return;
  visit(node);
  for (const key of Object.keys(node)) {
    const child = node[key];
    if (Array.isArray(child)) child.forEach((c) => walkAst(c, visit));
    else if (child && typeof child.type === 'string') walkAst(child, visit);
  }
}

function isFragment(node: any) {
  if (node.type !== 'JSXOpeningElement') return false;
  const name = getJsxTagName(node.name);
  return name === 'Fragment' || node.name?.type === 'JSXFragment';
}

const registryPaths = loadRegistryMemberPaths();
const { repeatableByPath } = loadRegistryMeta();
const violations: string[] = [];

for (const file of collectFiles()) {
  const rel = relative(ROOT, file).replace(/\\/g, '/');
  const content = readFileSync(file, 'utf-8');

  if (
    rel.startsWith('src/platform/ui/enforcement/') ||
    rel.startsWith('src/platform/ui/devtools/') ||
    rel === 'src/platform/ui/index.ts'
  ) {
    continue;
  }

  for (const pattern of LEGACY_PATTERNS) {
    if (pattern.test(content)) {
      violations.push(`${rel}: forbidden legacy pattern ${pattern.source}`);
    }
  }

  if (!/\.(tsx|jsx)$/.test(file)) continue;

  let ast: any;
  try {
    ast = parseJsx(content, file);
  } catch (error) {
    violations.push(`${rel}: parse error ${(error as Error).message}`);
    continue;
  }

  const pathCounts = new Map<string, number>();

  walkAst(ast, (node) => {
    if (node.type !== 'JSXOpeningElement' || isFragment(node)) return;
    if (!isIntrinsicElement(node)) return;

    const tag = getJsxTagName(node.name);
    const result = validateOpeningElement(node, registryPaths, rel);
    if (!result.valid) {
      violations.push(`${rel}:${node.loc.start.line}: <${tag}> ${result.reason}`);
      return;
    }

    if (isBannedRegistryPath(result.path!, rel)) {
      violations.push(`${rel}:${node.loc.start.line}: banned path ${result.path}`);
    }

    pathCounts.set(result.path!, (pathCounts.get(result.path!) || 0) + 1);

    if (repeatableByPath.get(result.path!) || registryPaths.repeatablePaths.has(result.path!)) {
      if (!getAttribute(node, 'data-ui-instance-id')) {
        violations.push(`${rel}:${node.loc.start.line}: missing data-ui-instance-id for repeatable ${result.path}`);
      }
    }
  });

  for (const [path, count] of pathCounts.entries()) {
    if (!repeatableByPath.get(path) && !registryPaths.repeatablePaths.has(path) && count > 1) {
      violations.push(`${rel}: duplicate registry path ${path} used ${count} times`);
    }
  }
}

if (violations.length > 0) {
  console.error('❌ ci:uuid-dom-absolute failed:\n');
  violations.slice(0, 100).forEach((v) => console.error(`  - ${v}`));
  if (violations.length > 100) console.error(`  ... and ${violations.length - 100} more`);
  process.exit(1);
}

console.log('✅ ci:uuid-dom-absolute passed');
