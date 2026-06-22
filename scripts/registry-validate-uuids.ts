#!/usr/bin/env tsx
import { execFileSync } from 'child_process';

import {
  ALL_UI_IDENTITIES,
  getDuplicateUiAliases,
  getDuplicateUiUuids,
  getUiIdentityLifecycle,
  getUiIdentityUuid,
  isValidUiUuid,
} from '../src/platform/ui/registry/registry';
import UUID_MANIFEST from '../src/platform/ui/registry/uuid-manifest.json';

type Lifecycle = 'active' | 'deprecated' | 'removed';

interface ManifestIdentity {
  uuid: string;
  id: string;
  path: string;
  feature: string;
  lifecycle?: Lifecycle;
  previousIds?: string[];
  previousPaths?: string[];
  aliases?: string[];
}

interface Manifest {
  identities: Record<string, ManifestIdentity>;
  removedIdentities?: Record<string, ManifestIdentity>;
}

const manifest = UUID_MANIFEST as Manifest;
const manifestIdentities = manifest.identities;
const removedManifestIdentities = manifest.removedIdentities ?? {};
const errors: string[] = [];

function identityKeys(identity: ManifestIdentity): string[] {
  return [
    identity.id,
    identity.path,
    ...(identity.previousIds ?? []),
    ...(identity.previousPaths ?? []),
    ...(identity.aliases ?? []),
  ].filter(Boolean);
}

function readHeadManifest(): Manifest | null {
  try {
    const raw = execFileSync('git', ['show', 'HEAD:src/platform/ui/registry/uuid-manifest.json'], {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return JSON.parse(raw) as Manifest;
  } catch {
    return null;
  }
}

const missingUuid = ALL_UI_IDENTITIES.filter((identity) => !identity.uuid);
const uuidBackedIdentities = ALL_UI_IDENTITIES.filter((identity) => identity.uuid);

const invalidUuid = ALL_UI_IDENTITIES.filter((identity) => identity.uuid && !isValidUiUuid(identity.uuid));
if (invalidUuid.length > 0) {
  errors.push(
    `Invalid uuid: ${invalidUuid.map((identity) => `${identity.id}:${identity.uuid}`).join(', ')}`
  );
}

const duplicateUuids = getDuplicateUiUuids();
if (duplicateUuids.length > 0) {
  errors.push(`Duplicate uuid: ${duplicateUuids.join(', ')}`);
}

const duplicateAliases = getDuplicateUiAliases();
if (duplicateAliases.length > 0) {
  errors.push(`Duplicate/conflicting aliases: ${duplicateAliases.join(', ')}`);
}

const invalidLifecycle = ALL_UI_IDENTITIES.filter(
  (identity) => !['active', 'deprecated', 'removed'].includes(getUiIdentityLifecycle(identity))
);
if (invalidLifecycle.length > 0) {
  errors.push(
    `Invalid lifecycle: ${invalidLifecycle.map((identity) => `${identity.id}:${String(identity.lifecycle)}`).join(', ')}`
  );
}

const missingManifest = ALL_UI_IDENTITIES.filter(
  (identity) => identity.uuid && !manifestIdentities[getUiIdentityUuid(identity)]
);
if (missingManifest.length > 0) {
  errors.push(
    `Missing manifest entries: ${missingManifest.map((identity) => identity.id).join(', ')}`
  );
}

const reusedRemoved = ALL_UI_IDENTITIES.filter(
  (identity) => identity.uuid && removedManifestIdentities[getUiIdentityUuid(identity)]
);
if (reusedRemoved.length > 0) {
  errors.push(
    `Removed uuid reused in active registry: ${reusedRemoved.map((identity) => `${identity.id}:${identity.uuid}`).join(', ')}`
  );
}

const mismatches = ALL_UI_IDENTITIES.flatMap((identity) => {
  if (!identity.uuid) return [];
  const entry = manifestIdentities[getUiIdentityUuid(identity)];
  if (!entry) return [];

  const identityErrors: string[] = [];
  if (entry.id !== identity.id) identityErrors.push(`${identity.uuid} id mismatch`);
  if (entry.path !== identity.path) identityErrors.push(`${identity.uuid} path mismatch`);
  if (entry.feature !== identity.feature) identityErrors.push(`${identity.uuid} feature mismatch`);
  if ((entry.lifecycle ?? 'active') !== getUiIdentityLifecycle(identity)) {
    identityErrors.push(`${identity.uuid} lifecycle mismatch`);
  }
  return identityErrors;
});

if (mismatches.length > 0) {
  errors.push(`Manifest mismatches: ${mismatches.join(', ')}`);
}

const currentByHistoricalKey = new Map<string, ManifestIdentity>();
Object.values(manifestIdentities).forEach((identity) => {
  identityKeys(identity).forEach((key) => currentByHistoricalKey.set(key, identity));
});

const headManifest = readHeadManifest();
if (headManifest) {
  Object.values(headManifest.identities ?? {}).forEach((headIdentity) => {
    const current = identityKeys(headIdentity)
      .map((key) => currentByHistoricalKey.get(key))
      .find(Boolean);

    if (current && current.uuid !== headIdentity.uuid) {
      errors.push(
        `UUID changed for historical identity "${headIdentity.id}" / "${headIdentity.path}": ` +
          `${headIdentity.uuid} -> ${current.uuid}. Use registry:move or registry:add instead.`
      );
    }
  });
}

if (errors.length > 0) {
  console.error('[UI Registry UUID Validation] FAILED');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      status: 'ok',
      total: ALL_UI_IDENTITIES.length,
      uuidBacked: uuidBackedIdentities.length,
      nonUuidBacked: missingUuid.length,
      manifestEntries: Object.keys(manifestIdentities).length,
      removedManifestEntries: Object.keys(removedManifestIdentities).length,
    },
    null,
    2
  )
);
