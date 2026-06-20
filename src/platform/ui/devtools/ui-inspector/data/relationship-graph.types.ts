export type RelationshipNodeKind = 'database' | 'storage' | 'element' | 'derived';

export type RelationshipRelationKind =
  | 'same_database'
  | 'same_storage'
  | 'inherits_binding'
  | 'depends_on'
  | 'derived_from'
  | 'shares_database_table'
  | 'shares_storage_folder';

export type RelationshipEdgeCreatedFrom =
  | 'explicit_binding'
  | 'inferred_shared_database'
  | 'inferred_shared_storage';

export type RelationshipGraphNode = {
  identityKey: string;
  uuid: string;
  path: string;
  feature: string;
  route?: string;
  bindingCount: number;
  kinds: RelationshipNodeKind[];
};

export type RelationshipGraphEdge = {
  id: string;
  fromElementKey: string;
  toElementKey: string;
  fromBindingId?: string;
  toBindingId?: string;
  relationKind: RelationshipRelationKind;
  confidence: 'high' | 'medium' | 'low';
  reason: string;
  createdFrom: RelationshipEdgeCreatedFrom;
};

export type RelationshipGraphFile = {
  nodes: RelationshipGraphNode[];
  edges: RelationshipGraphEdge[];
  updatedAt: string;
};

export type RelationshipReverseIndexFile = Record<
  string,
  {
    referencedBy: string[];
    references: string[];
  }
>;

export type RelationshipGraphAnalysis = {
  nodeCount: number;
  edgeCount: number;
  mostConnected: { identityKey: string; count: number }[];
  missingLinkedTargets: string[];
  circularDependencies: string[][];
  sharedDatabaseGroups: { key: string; members: string[] }[];
  sharedStorageGroups: { key: string; members: string[] }[];
};
