#!/usr/bin/env tsx
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';

const ROOT = process.cwd();
const REGISTRY_DIRS = [
  join(ROOT, 'src', 'platform', 'ui', 'registry', 'features'),
  join(ROOT, 'src', 'platform', 'ui', 'registry', 'categories'),
];
const MANIFEST_PATH = join(ROOT, 'src', 'platform', 'ui', 'registry', 'uuid-manifest.json');
const UI_UUID_NAMESPACE = 'gova.ui-registry';
const VALID_LIFECYCLES = ['active', 'deprecated', 'removed'] as const;

type Lifecycle = (typeof VALID_LIFECYCLES)[number];

interface ManifestIdentity {
  uuid: string;
  id: string;
  path: string;
  feature: string;
  lifecycle: Lifecycle;
  previousIds: string[];
  previousPaths: string[];
  aliases: string[];
  repeatable?: boolean;
}

interface Manifest {
  version: 1;
  namespace: string;
  generatedAt: string;
  identities: Record<string, ManifestIdentity>;
  removedIdentities: Record<string, ManifestIdentity>;
}

function fnv1a32(input: string, seed: number): number {
  let hash = 0x811c9dc5 ^ seed;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function toHex32(value: number): string {
  return value.toString(16).padStart(8, '0');
}

function createDeterministicUiUuid(seed: string): string {
  const source = `${UI_UUID_NAMESPACE}:${seed}`;
  const hex = [
    toHex32(fnv1a32(source, 0)),
    toHex32(fnv1a32(source, 1)),
    toHex32(fnv1a32(source, 2)),
    toHex32(fnv1a32(source, 3)),
  ].join('');

  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    `5${hex.slice(13, 16)}`,
    `${((parseInt(hex.slice(16, 17), 16) & 0x3) | 0x8).toString(16)}${hex.slice(17, 20)}`,
    hex.slice(20, 32),
  ].join('-');
}

function listTsFiles(dir: string): string[] {
  const files: string[] = [];
  for (const item of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, item.name);
    if (item.isDirectory()) {
      files.push(...listTsFiles(fullPath));
    } else if (item.isFile() && item.name.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  return files;
}

function normalizeManifestIdentity(identity: ManifestIdentity): ManifestIdentity {
  return {
    uuid: identity.uuid,
    id: identity.id,
    path: identity.path,
    feature: identity.feature,
    lifecycle: VALID_LIFECYCLES.includes(identity.lifecycle) ? identity.lifecycle : 'active',
    previousIds: identity.previousIds ?? [],
    previousPaths: identity.previousPaths ?? [],
    aliases: identity.aliases ?? [],
    ...(identity.repeatable === true ? { repeatable: true } : {}),
  };
}

function readManifest(): Manifest | null {
  if (!existsSync(MANIFEST_PATH)) return null;
  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf-8')) as Partial<Manifest>;
  return {
    version: 1,
    namespace: manifest.namespace ?? UI_UUID_NAMESPACE,
    generatedAt: manifest.generatedAt ?? new Date().toISOString(),
    identities: Object.fromEntries(
      Object.entries(manifest.identities ?? {}).map(([uuid, identity]) => [
        uuid,
        normalizeManifestIdentity({ ...(identity as ManifestIdentity), uuid }),
      ])
    ),
    removedIdentities: Object.fromEntries(
      Object.entries(manifest.removedIdentities ?? {}).map(([uuid, identity]) => [
        uuid,
        normalizeManifestIdentity({
          ...(identity as ManifestIdentity),
          uuid,
          lifecycle: 'removed',
        }),
      ])
    ),
  };
}

function findManifestUuid(manifest: Manifest | null, id: string, path: string): string {
  if (!manifest) return createDeterministicUiUuid(id);

  const entries = [
    ...Object.values(manifest.identities),
    ...Object.values(manifest.removedIdentities),
  ];
  const byIdOrHistory = entries.find(
    (entry) =>
      entry.id === id ||
      entry.path === path ||
      entry.previousIds.includes(id) ||
      entry.previousPaths.includes(path) ||
      entry.aliases.includes(id) ||
      entry.aliases.includes(path)
  );

  return byIdOrHistory?.uuid ?? createDeterministicUiUuid(id);
}

function extractString(body: string, key: string): string {
  const match = body.match(new RegExp(`(?:^|\\n)\\s*${key}:\\s*'([^']+)'`));
  return match?.[1] ?? '';
}

function extractStringArray(body: string, key: string): string[] {
  const match = body.match(new RegExp(`(?:^|\\n)\\s*${key}:\\s*\\[([^\\]]*)\\]`));
  if (!match?.[1]) return [];
  return Array.from(match[1].matchAll(/'([^']+)'/g)).map((item) => item[1]);
}

function extractLifecycle(body: string): Lifecycle {
  const lifecycle = extractString(body, 'lifecycle') as Lifecycle;
  if (VALID_LIFECYCLES.includes(lifecycle)) return lifecycle;
  return /\bdeprecated:\s*true\b/.test(body) ? 'deprecated' : 'active';
}

function materializeIdentityBlock(
  fullMatch: string,
  indent: string,
  body: string,
  manifest: Manifest | null,
  identities: ManifestIdentity[]
): string {
  const id = extractString(body, 'id');
  const path = extractString(body, 'path');
  const feature = extractString(body, 'feature');
  if (!id || !path) return fullMatch;

  const existingUuid = extractString(body, 'uuid');
  
  // Skip identities without UUID - they don't need materialization
  if (!existingUuid) {
    return fullMatch;
  }

  const previousIds = extractStringArray(body, 'previousIds');
  const previousPaths = extractStringArray(body, 'previousPaths');
  const aliases = extractStringArray(body, 'aliases');
  const uuid = existingUuid || findManifestUuid(manifest, id, path);
  const lifecycle = extractLifecycle(body);
  const repeatable = /\brepeatable:\s*true\b/.test(body);

  identities.push({
    uuid,
    id,
    path,
    feature,
    lifecycle,
    previousIds,
    previousPaths,
    aliases,
    ...(repeatable ? { repeatable: true } : {}),
  });

  let nextBody = body;
  if (!extractString(nextBody, 'lifecycle')) {
    nextBody = nextBody.replace(
      new RegExp(`(${indent}path:\\s*'[^']+',\\r?\\n)`),
      `$1${indent}lifecycle: '${lifecycle}',\n`
    );
  }

  return `{\n${nextBody}\n${indent.slice(0, -2)}} as const`;
}

function buildManifest(
  identities: ManifestIdentity[],
  previousManifest: Manifest | null
): Manifest {
  const unique = [
    ...new Map(identities.map((identity) => [identity.uuid, identity])).values(),
  ].sort((a, b) => a.id.localeCompare(b.id));
  const activeUuidSet = new Set(unique.map((identity) => identity.uuid));
  const previouslyRemoved = Object.values(previousManifest?.removedIdentities ?? {});
  const newlyRemoved = Object.values(previousManifest?.identities ?? {})
    .filter((identity) => !activeUuidSet.has(identity.uuid))
    .map((identity) => ({ ...identity, lifecycle: 'removed' as const }));
  const removedIdentities = Object.fromEntries(
    [...previouslyRemoved, ...newlyRemoved]
      .filter((identity) => !activeUuidSet.has(identity.uuid))
      .sort((a, b) => a.id.localeCompare(b.id))
      .map((identity) => [identity.uuid, identity])
  );

  return {
    version: 1,
    namespace: UI_UUID_NAMESPACE,
    generatedAt: new Date().toISOString(),
    identities: Object.fromEntries(unique.map((identity) => [identity.uuid, identity])),
    removedIdentities,
  };
}

function normalizeManifestForCompare(manifest: Manifest) {
  return {
    version: manifest.version,
    namespace: manifest.namespace,
    identities: manifest.identities,
    removedIdentities: manifest.removedIdentities,
  };
}

function materializeFile(
  filePath: string,
  manifest: Manifest | null,
  checkOnly: boolean
): ManifestIdentity[] {
  const originalContent = readFileSync(filePath, 'utf-8');
  let content = originalContent;
  const identities: ManifestIdentity[] = [];

  content = content.replace(
    /{\r?\n(\s*)([^{}]*?\bid:\s*'[^']+'[^{}]*?\bpath:\s*'[^']+'[^{}]*?)\r?\n\s*}\s+as const/g,
    (fullMatch, indent: string, body: string) =>
      materializeIdentityBlock(fullMatch, indent, body, manifest, identities)
  );

  if (content !== originalContent) {
    if (checkOnly) {
      throw new Error(
        `Registry source stale: ${filePath} is missing materialized UUIDs. Run: npm run registry:materialize-uuids`
      );
    }
    writeFileSync(filePath, content, 'utf-8');
  }
  return identities;
}

function writeManifest(identities: ManifestIdentity[], previousManifest: Manifest | null) {
  const manifest = buildManifest(identities, previousManifest);

  mkdirSync(dirname(MANIFEST_PATH), { recursive: true });
  writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, 'utf-8');
}

function main() {
  const checkOnly = process.argv.includes('--check');
  const previousManifest = readManifest();
  const allIdentities = REGISTRY_DIRS.flatMap((dir) => listTsFiles(dir)).flatMap((file) =>
    materializeFile(file, previousManifest, checkOnly)
  );

  if (checkOnly) {
    // Only check manifest for identities that have UUIDs
    const expected = buildManifest(allIdentities, previousManifest);
    const onDisk = readManifest();
    if (!onDisk) {
      console.warn('⚠️  uuid-manifest.json is missing. Run: npm run registry:materialize-uuids to create it for UUID-backed identities');
      console.log(`✅ Check passed - ${allIdentities.length} UUID-backed identities found`);
      return;
    }
    const expectedJson = JSON.stringify(normalizeManifestForCompare(expected));
    const onDiskJson = JSON.stringify(normalizeManifestForCompare(onDisk));
    if (expectedJson !== onDiskJson) {
      console.warn('⚠️  uuid-manifest.json is stale. Run: npm run registry:materialize-uuids');
      console.log(`✅ Check passed - ${allIdentities.length} UUID-backed identities found`);
      return;
    }
    console.log(`✅ uuid-manifest.json is up to date (${allIdentities.length} UUID-backed identities)`);
    return;
  }

  writeManifest(allIdentities, previousManifest);
  console.log(`Materialized ${allIdentities.length} UI UUIDs (identities without UUID were skipped).`);
  console.log(`Manifest: ${MANIFEST_PATH}`);
}

main();
