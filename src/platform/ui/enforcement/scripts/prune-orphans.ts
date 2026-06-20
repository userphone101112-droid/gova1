#!/usr/bin/env tsx
/**
 * Remove orphan translation keys reported by find-orphans (--apply to write).
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

import { findOrphans } from './find-orphans';
import { getRequiredRegistryBindingKeys } from './validate-registry-bindings';

const APPLY = process.argv.includes('--apply');
const localesRoot = join(process.cwd(), 'src', 'platform', 'ui', 'i18n', 'locales');

function deleteKey(obj: Record<string, unknown>, keyPath: string): boolean {
  const parts = keyPath.split('.');
  let current: Record<string, unknown> = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!current[part] || typeof current[part] !== 'object') return false;
    current = current[part] as Record<string, unknown>;
  }
  const last = parts[parts.length - 1];
  if (last in current) {
    delete current[last];
    return true;
  }
  return false;
}

function pruneEmptyObjects(obj: Record<string, unknown>): void {
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      pruneEmptyObjects(value as Record<string, unknown>);
      if (Object.keys(value as object).length === 0) {
        delete obj[key];
      }
    }
  }
}

function walkLocales(dir: string, orphanKeys: Set<string>): number {
  let pruned = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      pruned += walkLocales(full, orphanKeys);
    } else if (entry.name.endsWith('.json')) {
      const data = JSON.parse(readFileSync(full, 'utf8')) as Record<string, unknown>;
      let filePruned = 0;
      for (const key of orphanKeys) {
        if (deleteKey(data, key)) {
          filePruned += 1;
        }
      }
      if (filePruned > 0) {
        pruned += filePruned;
        console.log(
          `${APPLY ? 'Pruned' : 'Would prune'} ${filePruned} keys in ${full.replace(process.cwd(), '')}`
        );
        if (APPLY) {
          pruneEmptyObjects(data);
          writeFileSync(full, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
        }
      }
    }
  }
  return pruned;
}

console.log('🧹 Translation orphan prune (report-driven)\n');
const report = findOrphans();
const orphanKeys = new Set(report.orphanTranslations.map((entry) => entry.key));
const protectedKeys = getRequiredRegistryBindingKeys();
const blocked = [...orphanKeys].filter((key) => protectedKeys.has(key));
if (blocked.length > 0) {
  console.error(`❌ Refusing to prune ${blocked.length} registry-bound key(s):`);
  for (const key of blocked) {
    console.error(`   - ${key}`);
  }
  process.exit(1);
}
const total = walkLocales(localesRoot, orphanKeys);

console.log(
  APPLY
    ? `\n✅ Pruned ${total} orphan keys`
    : `\n📋 Found ${total} removable keys (dry run). Use --apply to write.`
);
