#!/usr/bin/env tsx
/**
 * Rename FEATURE.DOM.* registry namespace to FEATURE.DOM.* (ban STRUCTURE in JSX).
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd();
const TARGET_DIRS = [
  join(ROOT, 'src'),
  join(ROOT, 'scripts'),
];

function walk(dir: string, files: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.next') continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(tsx?|jsx?|json)$/.test(entry.name)) files.push(full);
  }
  return files;
}

let changed = 0;

for (const file of TARGET_DIRS.flatMap((d) => walk(d))) {
  const before = readFileSync(file, 'utf-8');
  let after = before;

  if (file.includes('registry/features') || file.includes('registry/categories')) {
    after = after.replace(/\bSTRUCTURE:\s*\{/g, 'DOM: {');
  }

  after = after.replace(/\.STRUCTURE\./g, '.DOM.');
  after = after.replace(/\.structure\./g, '.dom.');

  if (after !== before) {
    writeFileSync(file, after, 'utf-8');
    changed += 1;
  }
}

console.log(`✅ Renamed STRUCTURE → DOM in ${changed} files`);
