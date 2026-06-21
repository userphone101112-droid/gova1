#!/usr/bin/env tsx
/**
 * CI: Legacy parity check - now informational only since UUIDs are optional.
 * This script no longer fails - it just logs statistics.
 */
import { readFileSync, readdirSync } from 'fs';
import { join, relative } from 'path';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const tsParser = require('@typescript-eslint/parser');

const {
  isIntrinsicElement,
} = require('../src/platform/ui/enforcement/eslint/uuid-dom-validation.js');

const ROOT = join(process.cwd(), 'src');

function walk(dir: string, files: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.next') continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(tsx|jsx)$/.test(entry.name)) files.push(full);
  }
  return files;
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

const violations: string[] = [];

for (const file of walk(ROOT)) {
  const rel = relative(process.cwd(), file).replace(/\\/g, '/');
  if (rel.includes('.test.') || rel.includes('.spec.') || rel.includes('__tests__')) continue;
  if (rel.startsWith('src/platform/ui/devtools/')) continue;

  const content = readFileSync(file, 'utf-8');
  let ast: any;
  try {
    ast = tsParser.parse(content, {
      ecmaVersion: 'latest',
      sourceType: 'module',
      ecmaFeatures: { jsx: true },
    });
  } catch {
    continue;
  }

  let intrinsics = 0;
  let withUuid = 0;

  walkAst(ast, (node) => {
    if (node.type !== 'JSXOpeningElement') return;
    if (node.name?.type === 'JSXIdentifier' && node.name.name === 'Fragment') return;
    if (!isIntrinsicElement(node)) return;
    intrinsics += 1;
    const hasUuid = node.attributes?.some(
      (attr: any) => attr.type === 'JSXAttribute' && attr.name?.name === 'data-ui-uuid'
    );
    if (hasUuid) withUuid += 1;
  });

  if (intrinsics !== withUuid) {
    violations.push(`${rel}: intrinsics=${intrinsics} uuid=${withUuid}`);
  }
}

if (violations.length > 0) {
  console.log('ℹ️  ci:uuid-dom-parity informational (UUIDs are now optional):');
  violations.forEach((v) => console.log(`  - ${v}`));
}

console.log('✅ ci:uuid-dom-parity check completed (informational only)');
