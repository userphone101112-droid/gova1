import type { InspectElementSnapshot } from '../../UiInspectorFrameBridge';
import type { DatabaseRefFile } from '../data/database-ref.types';
import type { ElementAttribute, ElementBinding } from '../data/element-binding.types';
import type { InspectorDataEntry, InspectorDataMap } from '../data/inspector-config.types';
import type { RelationshipReverseIndexFile } from '../data/relationship-graph.types';
import type { StorageRefFile } from '../data/storage-ref.types';

import type { DomainError, DomainErrorCode } from './domain-errors';

export type ElementIdentity = {
  identityKey: string;
  uuid: string;
  instanceId: string;
  path: string;
  feature: string;
};

export type ElementLegacyFields = {
  inf1: string;
  inf2: string;
  inf3: string;
};

export type ElementDataProfile = {
  identityKey: string;
  element: ElementIdentity;
  databaseBindings: ElementBinding[];
  storageBindings: ElementBinding[];
  elementRelations: ElementBinding[];
  customAttributes: ElementAttribute[];
  legacyFields: ElementLegacyFields;
  hasDatabaseBinding: boolean;
  hasStorageBinding: boolean;
  hasRelations: boolean;
  updatedAt?: string;
};

export type DatabaseConnectionDetails = {
  bindingId: string;
  databaseName: string;
  tableName: string;
  columnName: string;
  enabled: boolean;
  confidence: ElementBinding['confidence'];
  reason?: string;
  description?: string;
};

export type StorageConnectionDetails = {
  bindingId: string;
  storageMainFile: string;
  storageSubFile: string;
  enabled: boolean;
  confidence: ElementBinding['confidence'];
  reason?: string;
};

export type ElementRelationshipDetails = {
  bindingId: string;
  fromElementKey: string;
  toElementKey: string;
  relationKind?: string;
  relationType?: ElementBinding['relationType'];
  createdFrom: 'explicit_binding' | 'inferred_shared_database' | 'inferred_shared_storage';
  confidence: ElementBinding['confidence'];
  reason?: string;
};

export type DomainOperationResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: DomainError };

export type InspectorDomainContext = {
  inspectorData: InspectorDataMap;
  databaseRef: DatabaseRefFile;
  storageRef: StorageRefFile;
  relationshipReverseIndex?: RelationshipReverseIndexFile;
};

export type DatabaseRenameMap = {
  database?: { oldName: string; newName: string };
  table?: { oldName: string; newName: string };
  column?: { oldName: string; newName: string };
};

export type StorageRenameMap = {
  mainFile?: { oldName: string; newName: string };
  subFile?: { folderName: string; oldName: string; newName: string };
};

export type DatabaseSelectionInput = {
  databaseName: string;
  tableName: string;
  columnName: string;
  enabled?: boolean;
  confidence?: ElementBinding['confidence'];
  reason?: string;
};

export type StorageSelectionInput = {
  storageMainFile: string;
  storageSubFile?: string;
  enabled?: boolean;
  confidence?: ElementBinding['confidence'];
  reason?: string;
  anchorDatabaseColumn?: DatabaseColumnRef;
};

export type ElementRelationInput = {
  linkedElementKey: string;
  linkedBindingId?: string;
  linkMode?: ElementBinding['linkMode'];
  relationType?: ElementBinding['relationType'];
  enabled?: boolean;
  confidence?: ElementBinding['confidence'];
  reason?: string;
};

export type SimulationSummary = {
  totalSavedElements: number;
  databaseLinkedElements: number;
  storageLinkedElements: number;
  relationLinkedElements: number;
  unboundElements: number;
  topDatabases: { name: string; count: number }[];
  topTables: { key: string; count: number }[];
  topStorageLocations: { key: string; count: number }[];
  brokenRelations: { fromElementKey: string; toElementKey: string; bindingId: string }[];
};

export type ProfileOrEntry = ElementDataProfile | InspectorDataEntry;

export type FrameEligibleOptions = {
  selectedIdentityKey?: string | null;
  reverseIndex?: RelationshipReverseIndexFile;
};

export type DatabaseColumnRef = {
  databaseName: string;
  tableName: string;
  columnName: string;
};

export type StorageLocationRef = {
  storageMainFile: string;
  storageSubFile?: string;
};

export type PageBoundElement = {
  identityKey: string;
  path: string;
  feature: string;
  uuid: string;
  hasDatabaseBinding: boolean;
  hasStorageBinding: boolean;
  databaseConnections: DatabaseConnectionDetails[];
  storageConnections: StorageConnectionDetails[];
  profile: ElementDataProfile;
};

export type PageBindingSummary = {
  routePath: string;
  feature: string;
  totalSavedElements: number;
  databaseLinkedCount: number;
  storageLinkedCount: number;
  anyBindingCount: number;
  elements: PageBoundElement[];
};

export type SchemaRelationshipKind =
  | 'column_foreign_key'
  | 'storage_backed_by_column'
  | 'shared_database_table'
  | 'shared_storage_location';

export type SchemaRelationship = {
  id: string;
  kind: SchemaRelationshipKind;
  fromDatabaseColumn?: DatabaseColumnRef;
  toDatabaseColumn?: DatabaseColumnRef;
  storageLocation?: StorageLocationRef;
  anchoredDatabaseColumn?: DatabaseColumnRef;
  reason?: string;
};

export type GovernanceViolation = {
  code: DomainErrorCode;
  message: string;
  path: string;
  legacy?: boolean;
};

export type GovernanceReport = {
  valid: boolean;
  violations: GovernanceViolation[];
  legacyReadonlyStorageLocations: StorageLocationRef[];
};

export type StorageAnchorInput = {
  linkedDatabaseColumn: DatabaseColumnRef;
};

export function identityFromSnapshot(snapshot: InspectElementSnapshot): ElementIdentity {
  return {
    identityKey: snapshot.identityKey ?? snapshot.uuid,
    uuid: snapshot.uuid,
    instanceId: snapshot.instanceId ?? '',
    path: snapshot.path,
    feature: snapshot.feature,
  };
}
