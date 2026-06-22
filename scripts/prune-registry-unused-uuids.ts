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
  UI_UUID_MAP,
  type UiIdentity,
} from '../src/platform/ui/registry/registry';

const ROOT = process.cwd();
const WRITE = process.argv.includes('--write');
const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
const SOURCE_ROOTS = ['src/app', 'src/components', 'src/platform/ui/devtools/ui-inspector'];
const REGISTRY_FILES = [
  ...readdirSync(join(ROOT, 'src/platform/ui/registry/categories'))
    .filter((file) => file.endsWith('.ts'))
    .map((file) => `src/platform/ui/registry/categories/${file}`),
  ...readdirSync(join(ROOT, 'src/platform/ui/registry/features'))
    .filter((file) => file.endsWith('.ts'))
    .map((file) => `src/platform/ui/registry/features/${file}`),
];

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

function isIdentity(value: unknown): value is UiIdentity {
  return Boolean(value && typeof value === 'object' && 'id' in value && 'path' in value);
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
  for (const [root, value] of Object.entries(REGISTRY_ROOTS)) {
    visit(value, [root]);
  }
  return map;
}

function collectTranslationUuids(exprToIdentity: Map<string, UiIdentity>): Set<string> {
  const uuids = new Set<string>();
  const tCallRe = /\bt\(\s*([A-Z][A-Z0-9_]*(?:\.[A-Z0-9_]+)+)/g;
  for (const file of SOURCE_ROOTS.flatMap((root) => walkFiles(join(ROOT, root)))) {
    const content = readFileSync(file, 'utf-8');
    for (const match of content.matchAll(tCallRe)) {
      const uuid = exprToIdentity.get(match[1])?.uuid;
      if (uuid) uuids.add(uuid.toLowerCase());
    }
  }
  return uuids;
}

function collectInspectorUuids(): Set<string> {
  const uuids = new Set<string>();
  for (const file of walkFiles(join(ROOT, 'data/ui-inspector'), [], /\.(json|ts|js)$/)) {
    const content = readFileSync(file, 'utf-8');
    for (const match of content.matchAll(UUID_RE)) {
      uuids.add(match[0].toLowerCase());
    }
  }
  return uuids;
}

function updateManifest(removeUuids: Set<string>) {
  const manifestPath = join(ROOT, 'src/platform/ui/registry/uuid-manifest.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8')) as {
    identities: Record<string, any>;
    removedIdentities?: Record<string, any>;
  };
  manifest.removedIdentities ??= {};

  let moved = 0;
  for (const uuid of removeUuids) {
    const entry = manifest.identities[uuid];
    if (!entry) continue;
    manifest.removedIdentities[uuid] = {
      ...entry,
      lifecycle: 'removed',
      removedAt: new Date().toISOString(),
      removalReason: 'unused-by-translation-or-ui-inspector-data',
    };
    delete manifest.identities[uuid];
    moved += 1;
  }

  if (WRITE && moved > 0) {
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf-8');
  }

  return moved;
}

function pruneRegistryFiles(removeUuids: Set<string>) {
  let filesChanged = 0;
  let removedLines = 0;

  for (const relative of REGISTRY_FILES) {
    const file = join(ROOT, relative);
    const before = readFileSync(file, 'utf-8');
    let count = 0;
    const after = before.replace(
      /^\s*uuid:\s*['"]([0-9a-f-]{36})['"],?\r?\n/gim,
      (line, uuid: string) => {
        if (!removeUuids.has(uuid.toLowerCase())) return line;
        count += 1;
        return '';
      }
    );
    if (count > 0) {
      filesChanged += 1;
      removedLines += count;
      if (WRITE) writeFileSync(file, after, 'utf-8');
    }
  }

  return { filesChanged, removedLines };
}

function main() {
  const exprToIdentity = collectExpressionMap();
  const keepUuids = new Set([...collectTranslationUuids(exprToIdentity), ...collectInspectorUuids()]);
  const allUuids = new Set(Object.keys(UI_UUID_MAP).map((uuid) => uuid.toLowerCase()));
  const removeUuids = new Set([...allUuids].filter((uuid) => !keepUuids.has(uuid)));
  const registry = pruneRegistryFiles(removeUuids);
  const manifestMoved = updateManifest(removeUuids);

  console.log(
    JSON.stringify(
      {
        mode: WRITE ? 'write' : 'report',
        totalUuidBackedBefore: allUuids.size,
        keepUuids: keepUuids.size,
        removeUuids: removeUuids.size,
        registryFilesChanged: registry.filesChanged,
        registryUuidLinesRemoved: registry.removedLines,
        manifestMovedToRemoved: manifestMoved,
      },
      null,
      2
    )
  );
}

main();
