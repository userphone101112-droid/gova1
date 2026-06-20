export type BindingKind = 'database' | 'storage' | 'element' | 'derived';

export type BindingRole =
  | 'display_value'
  | 'read_from'
  | 'write_to'
  | 'update'
  | 'delete'
  | 'primary_key'
  | 'foreign_key'
  | 'upload_to'
  | 'download_from'
  | 'preview_from'
  | 'same_as_element'
  | 'inherits_binding'
  | 'depends_on'
  | 'derived_from';

export type BindingConfidence = 'low' | 'medium' | 'high' | 'confirmed';

export type ActionContext =
  | 'view'
  | 'create'
  | 'edit'
  | 'delete'
  | 'search'
  | 'upload'
  | 'download'
  | 'mixed';

export type LinkMode =
  | 'same_database'
  | 'same_storage'
  | 'inherits_binding'
  | 'depends_on'
  | 'derived_from';

export type InheritScope = 'database_only' | 'storage_only' | 'all_bindings' | 'selected_binding';

export type DerivedFromKind = 'database_binding' | 'storage_binding' | 'linked_element' | 'custom_expression';

export type RelationType = 'none' | 'one_to_one' | 'one_to_many' | 'many_to_one' | 'many_to_many';

export type QueryHint = 'lookup' | 'list' | 'aggregate' | 'search' | 'join';

export type IndexNeed = 'none' | 'likely' | 'required';

export type FilePurpose =
  | 'avatar'
  | 'document'
  | 'attachment'
  | 'export'
  | 'import'
  | 'template'
  | 'media'
  | 'other';

export type AccessLevel = 'public' | 'authenticated' | 'owner_only' | 'admin_only';

export type RetentionPolicy = 'temporary' | 'permanent' | 'archived';

export type NamingStrategy = 'uuid' | 'slug' | 'entity_id' | 'timestamp' | 'original_name';

export type ElementBinding = {
  id: string;
  kind: BindingKind;
  role: BindingRole;
  enabled: boolean;
  label: string;
  databaseName?: string;
  tableName?: string;
  columnName?: string;
  storageMainFile?: string;
  storageSubFile?: string;
  linkedElementKey?: string;
  linkedBindingId?: string;
  linkMode?: LinkMode;
  inheritScope?: InheritScope;
  derivedFromKind?: DerivedFromKind;
  formula?: string;
  outputMeaning?: string;
  dependsOn?: string[];
  relationType?: RelationType;
  queryHint?: QueryHint;
  indexNeed?: IndexNeed;
  required?: boolean;
  sensitive?: boolean;
  filePurpose?: FilePurpose;
  pathTemplate?: string;
  allowedMimeTypes?: string;
  maxFileSizeMb?: number;
  accessLevel?: AccessLevel;
  retention?: RetentionPolicy;
  namingStrategy?: NamingStrategy;
  entityName?: string;
  scenario?: string;
  actionContext?: ActionContext;
  routeContext?: string;
  userRole?: string;
  confidence: BindingConfidence;
  reason?: string;
  mockValue?: string;
  validationRule?: string;
  notes?: string;
  metadata?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
};

export type ElementAttributeType = 'string' | 'boolean' | 'number' | 'json';

export type ElementAttribute = {
  id: string;
  key: string;
  value: string;
  type: ElementAttributeType;
  purpose?: string;
};

export type AttributePreset =
  | 'required'
  | 'searchable'
  | 'sortable'
  | 'editable'
  | 'visible_to_admin'
  | 'pii'
  | 'analytics_key'
  | 'validation_rule';

export type BindingValidationIssue = {
  field: keyof ElementBinding | 'general';
  message: string;
};

export type BindingValidationResult = {
  valid: boolean;
  issues: BindingValidationIssue[];
};

export type CreateBindingCommonInput = {
  role?: BindingRole;
  label?: string;
  enabled?: boolean;
  confidence?: BindingConfidence;
  reason?: string;
  actionContext?: ActionContext;
  notes?: string;
  metadata?: Record<string, string>;
};

export type CreateDatabaseBindingInput = CreateBindingCommonInput & {
  databaseName: string;
  tableName: string;
  columnName: string;
  required?: boolean;
  sensitive?: boolean;
  queryHint?: QueryHint;
  indexNeed?: IndexNeed;
};

export type CreateStorageBindingInput = CreateBindingCommonInput & {
  storageMainFile: string;
  storageSubFile?: string;
  filePurpose?: FilePurpose;
  pathTemplate?: string;
  allowedMimeTypes?: string;
  maxFileSizeMb?: number;
  accessLevel?: AccessLevel;
  retention?: RetentionPolicy;
  namingStrategy?: NamingStrategy;
};

export type CreateElementLinkBindingInput = CreateBindingCommonInput & {
  linkedElementKey: string;
  linkedBindingId?: string;
  linkMode?: LinkMode;
  inheritScope?: InheritScope;
  relationType?: RelationType;
  dependsOn?: string[];
};

export type CreateDerivedBindingInput = CreateBindingCommonInput & {
  derivedFromKind?: DerivedFromKind;
  formula?: string;
  outputMeaning?: string;
  dependsOn?: string[];
};
