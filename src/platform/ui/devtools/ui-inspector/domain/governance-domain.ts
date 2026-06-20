import { findColumn, findDatabase, findTable } from '../data/database-ref-utils';
import type { DatabaseRefFile } from '../data/database-ref.types';
import { resolveEntryBindings } from '../data/element-binding-utils';
import type { ElementBinding } from '../data/element-binding.types';
import type { InspectorDataEntry, InspectorDataMap } from '../data/inspector-config.types';
import { findStorageFolder } from '../data/storage-ref-utils';
import type { StorageRefFile } from '../data/storage-ref.types';

import { createDomainError } from './domain-errors';
import type {
  DatabaseColumnRef,
  GovernanceReport,
  GovernanceViolation,
  StorageAnchorInput,
  StorageLocationRef,
} from './domain-types';
import { getEnabledDatabaseBindings } from './element-domain';

export function columnRefKey(ref: DatabaseColumnRef): string {
  return `${ref.databaseName}.${ref.tableName}.${ref.columnName}`;
}

export function storageLocationKey(location: StorageLocationRef): string {
  return location.storageMainFile;
}

export function isDatabaseColumnRefComplete(ref: Partial<DatabaseColumnRef>): ref is DatabaseColumnRef {
  return Boolean(ref.databaseName?.trim() && ref.tableName?.trim() && ref.columnName?.trim());
}

export function databaseColumnExists(databaseRef: DatabaseRefFile, ref: DatabaseColumnRef): boolean {
  const column = findColumn(
    findTable(findDatabase(databaseRef, ref.databaseName), ref.tableName),
    ref.columnName
  );
  return Boolean(column);
}

export function hasStorageColumnAnchor(
  folder: { linkedDatabaseName?: string; linkedTableName?: string; linkedColumnName?: string } | undefined
): boolean {
  if (!folder) return false;
  const databaseName = folder.linkedDatabaseName?.trim() ?? '';
  const tableName = folder.linkedTableName?.trim() ?? '';
  const columnName = folder.linkedColumnName?.trim() ?? '';
  return Boolean(databaseName && tableName && columnName);
}

export function resolveStorageColumnAnchor(
  storageRef: StorageRefFile,
  location: StorageLocationRef
): DatabaseColumnRef | null {
  const folder = findStorageFolder(storageRef, location.storageMainFile);
  if (!hasStorageColumnAnchor(folder)) return null;
  return {
    databaseName: folder!.linkedDatabaseName!,
    tableName: folder!.linkedTableName!,
    columnName: folder!.linkedColumnName!,
  };
}

export function isLegacyStorageLocation(storageRef: StorageRefFile, location: StorageLocationRef): boolean {
  const folder = findStorageFolder(storageRef, location.storageMainFile);
  return Boolean(folder && !hasStorageColumnAnchor(folder));
}

export function listLegacyReadonlyStorageLocations(storageRef: StorageRefFile): StorageLocationRef[] {
  const legacy: StorageLocationRef[] = [];
  for (const folder of storageRef.folders) {
    if (!hasStorageColumnAnchor(folder)) {
      legacy.push({ storageMainFile: folder.name });
    }
  }
  return legacy;
}

export function assertNewStorageAnchor(input: StorageAnchorInput, databaseRef: DatabaseRefFile): void {
  if (!isDatabaseColumnRefComplete(input.linkedDatabaseColumn)) {
    throw createDomainError(
      'STORAGE_REQUIRES_DATABASE_COLUMN',
      'New storage locations must declare linkedDatabaseColumn (database, table, column).'
    );
  }
  if (!databaseColumnExists(databaseRef, input.linkedDatabaseColumn)) {
    throw createDomainError(
      'NOT_FOUND',
      `Database column ${columnRefKey(input.linkedDatabaseColumn)} not found in database_ref.`
    );
  }
}

export function assertStorageLocationMutable(
  storageRef: StorageRefFile,
  location: StorageLocationRef,
  operation: string
): void {
  if (!isLegacyStorageLocation(storageRef, location)) return;
  throw createDomainError(
    'LEGACY_STORAGE_READONLY',
    `Storage "${storageLocationKey(location)}" is legacy (no DB column anchor). ${operation} blocked until linked.`,
    { path: storageLocationKey(location) }
  );
}

export function resolveBindingStorageAnchor(binding: ElementBinding): DatabaseColumnRef | null {
  const meta = binding.metadata;
  if (!meta) return null;
  const ref = {
    databaseName: meta.linkedDatabaseName ?? '',
    tableName: meta.linkedTableName ?? '',
    columnName: meta.linkedColumnName ?? '',
  };
  return isDatabaseColumnRefComplete(ref) ? ref : null;
}

export function elementHasEnabledDatabaseBinding(entry: InspectorDataEntry): boolean {
  return getEnabledDatabaseBindings(entry).length > 0;
}

export function validateNewStorageBinding(input: {
  entry: InspectorDataEntry;
  storageRef: StorageRefFile;
  databaseRef: DatabaseRefFile;
  storageMainFile: string;
  anchorDatabaseColumn?: DatabaseColumnRef;
}): void {
  const location: StorageLocationRef = { storageMainFile: input.storageMainFile };

  const catalogAnchor = resolveStorageColumnAnchor(input.storageRef, location);
  if (catalogAnchor) {
    if (!databaseColumnExists(input.databaseRef, catalogAnchor)) {
      throw createDomainError('NOT_FOUND', `Anchored column ${columnRefKey(catalogAnchor)} missing from database_ref.`);
    }
    return;
  }

  if (input.anchorDatabaseColumn && isDatabaseColumnRefComplete(input.anchorDatabaseColumn)) {
    assertNewStorageAnchor({ linkedDatabaseColumn: input.anchorDatabaseColumn }, input.databaseRef);
    return;
  }

  if (elementHasEnabledDatabaseBinding(input.entry)) {
    const primary = getEnabledDatabaseBindings(input.entry)[0];
    if (
      primary &&
      isDatabaseColumnRefComplete({
        databaseName: primary.databaseName ?? '',
        tableName: primary.tableName ?? '',
        columnName: primary.columnName ?? '',
      }) &&
      databaseColumnExists(input.databaseRef, {
        databaseName: primary.databaseName!,
        tableName: primary.tableName!,
        columnName: primary.columnName!,
      })
    ) {
      return;
    }
  }

  if (isLegacyStorageLocation(input.storageRef, location)) {
    throw createDomainError(
      'LEGACY_STORAGE_READONLY',
      `Cannot add binding to legacy storage "${storageLocationKey(location)}" without anchoring it to a database column first.`
    );
  }

  throw createDomainError(
    'STORAGE_REQUIRES_DATABASE_COLUMN',
    'Storage bindings require a database column anchor (catalog anchor, binding anchor, or enabled database binding on the same element).'
  );
}

export function validateStorageRefGovernance(
  storageRef: StorageRefFile,
  databaseRef: DatabaseRefFile
): GovernanceReport {
  const violations: GovernanceViolation[] = [];
  const legacyReadonlyStorageLocations = listLegacyReadonlyStorageLocations(storageRef);

  for (const location of legacyReadonlyStorageLocations) {
    violations.push({
      code: 'LEGACY_STORAGE_READONLY',
      message: `Legacy storage "${storageLocationKey(location)}" has no database column anchor.`,
      path: storageLocationKey(location),
      legacy: true,
    });
  }

  for (const folder of storageRef.folders) {
    if (!hasStorageColumnAnchor(folder)) continue;
    const anchor: DatabaseColumnRef = {
      databaseName: folder.linkedDatabaseName!,
      tableName: folder.linkedTableName!,
      columnName: folder.linkedColumnName!,
    };
    if (!databaseColumnExists(databaseRef, anchor)) {
      violations.push({
        code: 'GOVERNANCE_VIOLATION',
        message: `Storage "${folder.name}" anchors missing column ${columnRefKey(anchor)}.`,
        path: folder.name,
      });
    }
  }

  return {
    valid: violations.filter((v) => !v.legacy).length === 0,
    violations,
    legacyReadonlyStorageLocations,
  };
}

export function validateInspectorDataGovernance(
  inspectorData: InspectorDataMap,
  storageRef: StorageRefFile,
  databaseRef: DatabaseRefFile
): GovernanceReport {
  const base = validateStorageRefGovernance(storageRef, databaseRef);
  const violations = [...base.violations];

  for (const entry of Object.values(inspectorData)) {
    for (const binding of resolveEntryBindings(entry, { databases: [] })) {
      if (!binding.enabled || binding.kind !== 'storage') continue;
      const main = binding.storageMainFile ?? '';
      if (!main) continue;
      try {
        validateNewStorageBinding({
          entry,
          storageRef,
          databaseRef,
          storageMainFile: main,
          ...(resolveBindingStorageAnchor(binding)
            ? { anchorDatabaseColumn: resolveBindingStorageAnchor(binding)! }
            : {}),
        });
      } catch (error) {
        if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
          const domainError = error as GovernanceViolation;
          violations.push({
            code: domainError.code as GovernanceViolation['code'],
            message: String(domainError.message),
            path: `${entry.dataUiIdentityKey}::${binding.id}`,
            legacy: domainError.code === 'LEGACY_STORAGE_READONLY',
          });
        }
      }
    }
  }

  return {
    valid: violations.filter((v) => !v.legacy).length === 0,
    violations,
    legacyReadonlyStorageLocations: base.legacyReadonlyStorageLocations,
  };
}
