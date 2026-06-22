#!/usr/bin/env tsx
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import { join } from 'path';

import {
  AUTH,
  DEVTOOLS,
  ERROR_BOUNDARY,
  HOME,
  IMAGE_UPLOAD_FORM,
  MERCHANT,
  ONBOARDING,
  SETTINGS,
  SHARED_LAYOUT,
  SPLASH,
  TEST1,
  type UiIdentity,
} from '../src/platform/ui/registry/registry';

const ROOT = process.cwd();
const WRITE = process.argv.includes('--write');

const REGISTRY_ROOTS: Record<string, unknown> = {
  AUTH,
  DEVTOOLS,
  ERROR_BOUNDARY,
  HOME,
  IMAGE_UPLOAD_FORM,
  MERCHANT,
  ONBOARDING,
  SETTINGS,
  SHARED_LAYOUT,
  SPLASH,
  TEST1,
};

const SCAN_ROOTS = ['src/app', 'src/components', 'src/platform/ui/devtools/ui-inspector'];
const INSPECTOR_DATA_DIR = join(ROOT, 'data', 'ui-inspector');
const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

function isIdentity(value: unknown): value is UiIdentity {
  return Boolean(value && typeof value === 'object' && 'uuid' in value && 'id' in value && 'path' in value);
}

function collectExpressionMap(): Map<string, UiIdentity> {
  const map = new Map<string, UiIdentity>();

  function visit(value: unknown, parts: string[]) {
    if (isIdentity(value)) {
      map.set(parts.join('.'), value);
      return;
    }
    if (!value || typeof value !== 'object') return;
    for (const [key, child] of Object.entries(value)) {
      visit(child, [...parts, key]);
    }
  }

  for (const [rootName, rootValue] of Object.entries(REGISTRY_ROOTS)) {
    visit(rootValue, [rootName]);
  }

  return map;
}

function walkFiles(dir: string, files: string[] = [], extensions = /\.(tsx|jsx|ts|js)$/): string[] {
  if (!existsSync(dir)) return files;
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      if (['node_modules', '.next', 'test-results'].includes(entry)) continue;
      walkFiles(fullPath, files, extensions);
    } else if (extensions.test(entry)) {
      files.push(fullPath);
    }
  }
  return files;
}

function collectInspectorUuids(): Set<string> {
  const uuids = new Set<string>();
  for (const file of walkFiles(INSPECTOR_DATA_DIR, [], /\.(json|ts|js)$/)) {
    const content = readFileSync(file, 'utf-8');
    for (const match of content.matchAll(UUID_RE)) {
      uuids.add(match[0].toLowerCase());
    }
  }
  return uuids;
}

function collectTranslationUuids(exprToIdentity: Map<string, UiIdentity>): Set<string> {
  const uuids = new Set<string>();
  const sourceFiles = SCAN_ROOTS.flatMap((root) => walkFiles(join(ROOT, root)));
  const tCallRe = /\bt\(\s*([A-Z][A-Z0-9_]*(?:\.[A-Z0-9_]+)+)/g;

  for (const file of sourceFiles) {
    const content = readFileSync(file, 'utf-8');
    for (const match of content.matchAll(tCallRe)) {
      const identity = exprToIdentity.get(match[1]);
      if (identity?.uuid) {
        uuids.add(identity.uuid.toLowerCase());
      }
    }
  }

  return uuids;
}

function pruneFile(file: string, exprToIdentity: Map<string, UiIdentity>, keepUuids: Set<string>) {
  const content = readFileSync(file, 'utf-8');
  let removed = 0;
  const next = content.replace(/\s+data-ui-uuid=\{([^}]+)\}/g, (full, rawExpr) => {
    const expr = String(rawExpr).trim().replace(/\.uuid$/, '');
    const identity = exprToIdentity.get(expr);
    if (!identity?.uuid) return full;
    if (keepUuids.has(identity.uuid.toLowerCase())) return full;
    removed += 1;
    return '';
  });

  if (removed > 0 && WRITE) {
    writeFileSync(file, next, 'utf-8');
  }

  return { file, removed };
}

function main() {
  const exprToIdentity = collectExpressionMap();
  const inspectorUuids = collectInspectorUuids();
  const translationUuids = collectTranslationUuids(exprToIdentity);
  const keepUuids = new Set([...inspectorUuids, ...translationUuids]);
  const files = SCAN_ROOTS.flatMap((root) => walkFiles(join(ROOT, root)));
  const results = files.map((file) => pruneFile(file, exprToIdentity, keepUuids)).filter((result) => result.removed > 0);
  const removed = results.reduce((total, result) => total + result.removed, 0);

  console.log(
    JSON.stringify(
      {
        mode: WRITE ? 'write' : 'report',
        keptForTranslation: translationUuids.size,
        keptForInspectorData: inspectorUuids.size,
        filesChanged: results.length,
        attributesRemoved: removed,
      },
      null,
      2
    )
  );
}

main();
