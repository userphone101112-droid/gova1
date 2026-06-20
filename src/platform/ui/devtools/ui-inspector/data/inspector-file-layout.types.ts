import type { ElementAttribute, ElementBinding } from './element-binding.types';
import type { InspectorDataEntry } from './inspector-config.types';
import type { RelationshipGraphFile, RelationshipReverseIndexFile } from './relationship-graph.types';

export type InspectorIndexEntry = {
  identityKey: string;
  uuid: string;
  instanceId: string;
  path: string;
  feature: string;
  route?: string;
  updatedAt: string;
  hasBindings: boolean;
  bindingCount: number;
  hasStorage: boolean;
  hasDatabase: boolean;
};

export type InspectorIndexFile = {
  version: 1;
  updatedAt: string;
  entries: InspectorIndexEntry[];
};

export type InspectorElementFile = {
  identityKey: string;
  dataUiPath: string;
  dataUiFeature: string;
  dataUiUuid: string;
  dataUiInstanceId: string;
  sourceFile?: string;
  sourceComponent?: string;
  sourceLine?: number;
  route?: string;
  updatedAt: string;
};

export type InspectorBindingsFile = {
  identityKey: string;
  bindings: ElementBinding[];
  updatedAt: string;
};

export type InspectorAttributesFile = {
  identityKey: string;
  customAttributes: ElementAttribute[];
  inf1: string;
  inf2: string;
  inf3: string;
  attributesEnabled: boolean;
  attribute1: boolean;
  attribute2: boolean;
  attribute3: boolean;
  updatedAt: string;
};

export type InspectorRouteIndexFile = {
  route: string;
  identityKeys: string[];
  updatedAt: string;
};

export type InspectorSnapshotFile = {
  updatedAt: string;
  migratedAt?: string;
  totalElements: number;
  totalBindings: number;
  entries: InspectorDataEntry[];
};

export type InspectorEntryParts = {
  element: InspectorElementFile;
  bindings: InspectorBindingsFile;
  attributes: InspectorAttributesFile;
};

export type InspectorLayoutPaths = {
  baseDir: string;
  indexPath: string;
  graphPath: string;
  reverseIndexPath: string;
  snapshotPath: string;
  legacyMirrorPath: string;
  elementPath: (identityKey: string) => string;
  bindingsPath: (identityKey: string) => string;
  attributesPath: (identityKey: string) => string;
  routePath: (route: string) => string;
};

export type InspectorLayoutBundle = {
  index: InspectorIndexFile;
  graph: RelationshipGraphFile;
  reverseIndex: RelationshipReverseIndexFile;
  snapshot: InspectorSnapshotFile;
};
