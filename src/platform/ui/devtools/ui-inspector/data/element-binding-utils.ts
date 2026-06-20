import { findColumn, findDatabase, findTable } from './database-ref-utils';
import type { DatabaseRefFile } from './database-ref.types';
import type {
  BindingKind,
  BindingRole,
  CreateDatabaseBindingInput,
  CreateDerivedBindingInput,
  CreateElementLinkBindingInput,
  CreateStorageBindingInput,
  ElementBinding,
  BindingValidationResult,
} from './element-binding.types';
import type { InspectorDataEntry } from './inspector-config.types';

function nowIso(): string {
  return new Date().toISOString();
}

function trimOrEmpty(value: string | undefined): string {
  return (value ?? '').trim();
}

function hasValue(value: string | undefined): boolean {
  return Boolean(trimOrEmpty(value));
}

function normalizeDependsOn(dependsOn: string[] | undefined): string[] | undefined {
  if (!dependsOn?.length) return undefined;
  const normalized = Array.from(new Set(dependsOn.map((entry) => entry.trim()).filter(Boolean)));
  return normalized.length ? normalized : undefined;
}

function defaultRoleForKind(kind: BindingKind): BindingRole {
  if (kind === 'database') return 'write_to';
  if (kind === 'storage') return 'upload_to';
  if (kind === 'element') return 'same_as_element';
  return 'derived_from';
}

export function createBindingId(prefix = 'binding'): string {
  const safePrefix = trimOrEmpty(prefix) || 'binding';
  const randomUuid = globalThis.crypto?.randomUUID?.();
  if (randomUuid) return `${safePrefix}_${randomUuid}`;
  const randomPart = Math.random().toString(36).slice(2, 10);
  return `${safePrefix}_${Date.now().toString(36)}_${randomPart}`;
}

export function createDatabaseBinding(input: CreateDatabaseBindingInput): ElementBinding {
  const databaseName = trimOrEmpty(input.databaseName);
  const tableName = trimOrEmpty(input.tableName);
  const columnName = trimOrEmpty(input.columnName);
  const target = [databaseName, tableName, columnName].filter(Boolean).join('.');
  return normalizeBinding({
    kind: 'database',
    role: input.role ?? 'write_to',
    enabled: input.enabled ?? true,
    label: trimOrEmpty(input.label) || target || 'database binding',
    databaseName,
    tableName,
    columnName,
    ...(input.required !== undefined ? { required: input.required } : {}),
    ...(input.sensitive !== undefined ? { sensitive: input.sensitive } : {}),
    ...(input.queryHint ? { queryHint: input.queryHint } : {}),
    ...(input.indexNeed ? { indexNeed: input.indexNeed } : {}),
    confidence: input.confidence ?? 'medium',
    ...(input.reason ? { reason: input.reason } : {}),
    ...(input.actionContext ? { actionContext: input.actionContext } : {}),
    ...(input.notes ? { notes: input.notes } : {}),
    ...(input.metadata ? { metadata: input.metadata } : {}),
  });
}

export function createStorageBinding(input: CreateStorageBindingInput): ElementBinding {
  const storageMainFile = trimOrEmpty(input.storageMainFile);
  const storageSubFile = trimOrEmpty(input.storageSubFile);
  const target = storageSubFile ? `${storageMainFile}/${storageSubFile}` : storageMainFile;
  return normalizeBinding({
    kind: 'storage',
    role: input.role ?? 'upload_to',
    enabled: input.enabled ?? true,
    label: trimOrEmpty(input.label) || target || 'storage binding',
    storageMainFile,
    storageSubFile,
    ...(input.filePurpose ? { filePurpose: input.filePurpose } : {}),
    ...(input.pathTemplate ? { pathTemplate: input.pathTemplate } : {}),
    ...(input.allowedMimeTypes ? { allowedMimeTypes: input.allowedMimeTypes } : {}),
    ...(input.maxFileSizeMb !== undefined ? { maxFileSizeMb: input.maxFileSizeMb } : {}),
    ...(input.accessLevel ? { accessLevel: input.accessLevel } : {}),
    ...(input.retention ? { retention: input.retention } : {}),
    ...(input.namingStrategy ? { namingStrategy: input.namingStrategy } : {}),
    confidence: input.confidence ?? 'medium',
    ...(input.reason ? { reason: input.reason } : {}),
    ...(input.actionContext ? { actionContext: input.actionContext } : {}),
    ...(input.notes ? { notes: input.notes } : {}),
    ...(input.metadata ? { metadata: input.metadata } : {}),
  });
}

export function createElementLinkBinding(input: CreateElementLinkBindingInput): ElementBinding {
  const linkedElementKey = trimOrEmpty(input.linkedElementKey);
  const linkedBindingId = trimOrEmpty(input.linkedBindingId);
  return normalizeBinding({
    kind: 'element',
    role: input.role ?? 'same_as_element',
    enabled: input.enabled ?? true,
    label: trimOrEmpty(input.label) || linkedElementKey || 'linked element binding',
    linkedElementKey,
    ...(linkedBindingId ? { linkedBindingId } : {}),
    linkMode: input.linkMode ?? 'inherits_binding',
    ...(input.inheritScope ? { inheritScope: input.inheritScope } : {}),
    ...(input.relationType ? { relationType: input.relationType } : {}),
    ...(input.dependsOn?.length ? { dependsOn: input.dependsOn } : {}),
    confidence: input.confidence ?? 'medium',
    ...(input.reason ? { reason: input.reason } : {}),
    ...(input.actionContext ? { actionContext: input.actionContext } : {}),
    ...(input.notes ? { notes: input.notes } : {}),
    ...(input.metadata ? { metadata: input.metadata } : {}),
  });
}

export function createDerivedBinding(input: CreateDerivedBindingInput): ElementBinding {
  const formula = trimOrEmpty(input.formula);
  const outputMeaning = trimOrEmpty(input.outputMeaning);
  return normalizeBinding({
    kind: 'derived',
    role: input.role ?? 'derived_from',
    enabled: input.enabled ?? true,
    label: trimOrEmpty(input.label) || formula || 'derived binding',
    derivedFromKind: input.derivedFromKind ?? 'custom_expression',
    formula,
    ...(outputMeaning ? { outputMeaning } : {}),
    ...(input.dependsOn?.length ? { dependsOn: input.dependsOn } : {}),
    confidence: input.confidence ?? 'medium',
    ...(input.reason ? { reason: input.reason } : {}),
    ...(input.actionContext ? { actionContext: input.actionContext } : {}),
    ...(input.notes ? { notes: input.notes } : {}),
    ...(input.metadata ? { metadata: input.metadata } : {}),
  });
}

export function updateBinding(binding: ElementBinding, patch: Partial<ElementBinding>): ElementBinding {
  return normalizeBinding({
    ...binding,
    ...patch,
    id: binding.id,
    kind: patch.kind ?? binding.kind,
    createdAt: binding.createdAt,
    updatedAt: nowIso(),
  });
}

export function deleteBinding(bindings: ElementBinding[], bindingId: string): ElementBinding[] {
  return bindings.filter((binding) => binding.id !== bindingId);
}

export function duplicateBinding(bindings: ElementBinding[], bindingId: string): ElementBinding[] {
  const index = bindings.findIndex((binding) => binding.id === bindingId);
  if (index === -1) return bindings;
  const source = bindings[index];
  const duplicate = normalizeBinding({
    ...source,
    id: createBindingId(source.kind),
    label: `${source.label} (copy)`,
    confidence: source.confidence === 'confirmed' ? 'high' : source.confidence,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  });
  return [...bindings.slice(0, index + 1), duplicate, ...bindings.slice(index + 1)];
}

export function normalizeBinding(binding: Partial<ElementBinding>): ElementBinding {
  const kind = binding.kind ?? 'database';
  const createdAt = binding.createdAt ?? nowIso();
  const updatedAt = binding.updatedAt ?? nowIso();
  const normalized: ElementBinding = {
    id: trimOrEmpty(binding.id) || createBindingId(kind),
    kind,
    role: binding.role ?? defaultRoleForKind(kind),
    enabled: binding.enabled ?? true,
    label: trimOrEmpty(binding.label) || getBindingTargetLabel(binding as ElementBinding) || `${kind} binding`,
    confidence: binding.confidence ?? 'medium',
    createdAt,
    updatedAt,
  };

  const databaseName = trimOrEmpty(binding.databaseName);
  if (databaseName) normalized.databaseName = databaseName;
  const tableName = trimOrEmpty(binding.tableName);
  if (tableName) normalized.tableName = tableName;
  const columnName = trimOrEmpty(binding.columnName);
  if (columnName) normalized.columnName = columnName;
  const storageMainFile = trimOrEmpty(binding.storageMainFile);
  if (storageMainFile) normalized.storageMainFile = storageMainFile;
  const storageSubFile = trimOrEmpty(binding.storageSubFile);
  if (storageSubFile) normalized.storageSubFile = storageSubFile;
  const linkedElementKey = trimOrEmpty(binding.linkedElementKey);
  if (linkedElementKey) normalized.linkedElementKey = linkedElementKey;
  const linkedBindingId = trimOrEmpty(binding.linkedBindingId);
  if (linkedBindingId) normalized.linkedBindingId = linkedBindingId;
  if (binding.linkMode) normalized.linkMode = binding.linkMode;
  if (binding.inheritScope) normalized.inheritScope = binding.inheritScope;
  if (binding.derivedFromKind) normalized.derivedFromKind = binding.derivedFromKind;
  const formula = trimOrEmpty(binding.formula);
  if (formula) normalized.formula = formula;
  const outputMeaning = trimOrEmpty(binding.outputMeaning);
  if (outputMeaning) normalized.outputMeaning = outputMeaning;
  const dependsOn = normalizeDependsOn(binding.dependsOn);
  if (dependsOn) normalized.dependsOn = dependsOn;
  if (binding.relationType) normalized.relationType = binding.relationType;
  if (binding.queryHint) normalized.queryHint = binding.queryHint;
  if (binding.indexNeed) normalized.indexNeed = binding.indexNeed;
  if (binding.required !== undefined) normalized.required = binding.required;
  if (binding.sensitive !== undefined) normalized.sensitive = binding.sensitive;
  if (binding.filePurpose) normalized.filePurpose = binding.filePurpose;
  const pathTemplate = trimOrEmpty(binding.pathTemplate);
  if (pathTemplate) normalized.pathTemplate = pathTemplate;
  const allowedMimeTypes = trimOrEmpty(binding.allowedMimeTypes);
  if (allowedMimeTypes) normalized.allowedMimeTypes = allowedMimeTypes;
  if (binding.maxFileSizeMb !== undefined) normalized.maxFileSizeMb = binding.maxFileSizeMb;
  if (binding.accessLevel) normalized.accessLevel = binding.accessLevel;
  if (binding.retention) normalized.retention = binding.retention;
  if (binding.namingStrategy) normalized.namingStrategy = binding.namingStrategy;
  const entityName = trimOrEmpty(binding.entityName);
  if (entityName) normalized.entityName = entityName;
  const scenario = trimOrEmpty(binding.scenario);
  if (scenario) normalized.scenario = scenario;
  if (binding.actionContext) normalized.actionContext = binding.actionContext;
  const routeContext = trimOrEmpty(binding.routeContext);
  if (routeContext) normalized.routeContext = routeContext;
  const userRole = trimOrEmpty(binding.userRole);
  if (userRole) normalized.userRole = userRole;
  const reason = trimOrEmpty(binding.reason);
  if (reason) normalized.reason = reason;
  const mockValue = trimOrEmpty(binding.mockValue);
  if (mockValue) normalized.mockValue = mockValue;
  const validationRule = trimOrEmpty(binding.validationRule);
  if (validationRule) normalized.validationRule = validationRule;
  const notes = trimOrEmpty(binding.notes);
  if (notes) normalized.notes = notes;
  if (binding.metadata && Object.keys(binding.metadata).length) normalized.metadata = binding.metadata;

  return normalized;
}

export function normalizeBindings(bindings: ElementBinding[]): ElementBinding[] {
  const seen = new Set<string>();
  return bindings.map((binding) => {
    const normalized = normalizeBinding(binding);
    if (!seen.has(normalized.id)) {
      seen.add(normalized.id);
      return normalized;
    }
    const next = { ...normalized, id: createBindingId(normalized.kind), updatedAt: nowIso() };
    seen.add(next.id);
    return next;
  });
}

function roleRank(binding: ElementBinding): number {
  const role = binding.role;
  if (role === 'write_to' || role === 'upload_to') return 4;
  if (role === 'read_from' || role === 'download_from') return 3;
  if (role === 'display_value' || role === 'preview_from') return 2;
  return 1;
}

export function getPrimaryDatabaseBinding(bindings: ElementBinding[]): ElementBinding | undefined {
  return bindings
    .filter((binding) => binding.kind === 'database' && binding.enabled)
    .sort((a, b) => roleRank(b) - roleRank(a))[0];
}

export function getPrimaryStorageBinding(bindings: ElementBinding[]): ElementBinding | undefined {
  return bindings
    .filter((binding) => binding.kind === 'storage' && binding.enabled)
    .sort((a, b) => roleRank(b) - roleRank(a))[0];
}

export function syncLegacyFieldsFromBindings(
  entry: InspectorDataEntry,
  bindings: ElementBinding[]
): InspectorDataEntry {
  const normalized = normalizeBindings(bindings);
  const primaryDb = getPrimaryDatabaseBinding(normalized);
  const primaryStorage = getPrimaryStorageBinding(normalized);

  return {
    ...entry,
    databaseEnabled: Boolean(primaryDb?.enabled),
    databaseName: primaryDb?.databaseName ?? '',
    tableName: primaryDb?.tableName ?? '',
    columnName: primaryDb?.columnName ?? '',
    storageEnabled: Boolean(primaryStorage?.enabled),
    storageMainFile: primaryStorage?.storageMainFile ?? '',
    storageSubFile: primaryStorage?.storageSubFile ?? '',
  };
}

function resolveLegacyDatabasePath(
  entry: InspectorDataEntry,
  databaseRef: DatabaseRefFile
): { databaseName: string; tableName: string; columnName: string } {
  let databaseName = trimOrEmpty(entry.databaseName);
  let tableName = trimOrEmpty(entry.tableName);
  let columnName = trimOrEmpty(entry.columnName);
  const inf1 = trimOrEmpty(entry.inf1);
  const inf2 = trimOrEmpty(entry.inf2);
  const inf3 = trimOrEmpty(entry.inf3);

  if (!databaseName && inf1) {
    const db = findDatabase(databaseRef, inf1);
    if (db) {
      databaseName = inf1;
      if (!tableName && inf2) {
        const table = findTable(db, inf2);
        if (table) {
          tableName = inf2;
          if (!columnName && inf3) {
            const column = findColumn(table, inf3);
            if (column) columnName = inf3;
          }
        }
      }
    }
  }

  return { databaseName, tableName, columnName };
}

export function bindingsFromLegacyEntry(
  entry: InspectorDataEntry,
  databaseRef: DatabaseRefFile
): ElementBinding[] {
  const result: ElementBinding[] = [];
  const resolved = resolveLegacyDatabasePath(entry, databaseRef);
  const shouldHaveDbBinding =
    entry.databaseEnabled || hasValue(resolved.databaseName) || hasValue(resolved.tableName) || hasValue(resolved.columnName);

  if (shouldHaveDbBinding) {
    result.push(
      createDatabaseBinding({
        databaseName: resolved.databaseName,
        tableName: resolved.tableName,
        columnName: resolved.columnName,
        enabled:
          Boolean(entry.databaseEnabled) ||
          hasValue(resolved.databaseName) ||
          hasValue(resolved.tableName) ||
          hasValue(resolved.columnName),
        confidence: entry.databaseEnabled ? 'confirmed' : 'medium',
        role: 'write_to',
        label: [resolved.databaseName, resolved.tableName, resolved.columnName].filter(Boolean).join('.'),
      })
    );
  }

  const storageMainFile = trimOrEmpty(entry.storageMainFile);
  const storageSubFile = trimOrEmpty(entry.storageSubFile);
  const shouldHaveStorageBinding =
    Boolean(entry.storageEnabled) || hasValue(storageMainFile) || hasValue(storageSubFile);

  if (shouldHaveStorageBinding) {
    result.push(
      createStorageBinding({
        storageMainFile,
        storageSubFile,
        enabled: Boolean(entry.storageEnabled ?? shouldHaveStorageBinding),
        confidence: entry.storageEnabled ? 'confirmed' : 'medium',
        role: 'upload_to',
        label: storageSubFile ? `${storageMainFile}/${storageSubFile}` : storageMainFile,
      })
    );
  }

  return normalizeBindings(result);
}

export function resolveEntryBindings(
  entry: InspectorDataEntry,
  databaseRef: DatabaseRefFile
): ElementBinding[] {
  if (entry.bindings !== undefined) return normalizeBindings(entry.bindings);
  return bindingsFromLegacyEntry(entry, databaseRef);
}

export function validateBinding(
  binding: ElementBinding,
  databaseRef?: DatabaseRefFile
): BindingValidationResult {
  const normalized = normalizeBinding(binding);
  const issues: BindingValidationResult['issues'] = [];

  if (!normalized.label.trim()) {
    issues.push({ field: 'label', message: 'Binding label is required.' });
  }

  if (normalized.kind === 'database') {
    if (!normalized.databaseName) issues.push({ field: 'databaseName', message: 'Database name is required.' });
    if (!normalized.tableName) issues.push({ field: 'tableName', message: 'Table name is required.' });
    if (!normalized.columnName) issues.push({ field: 'columnName', message: 'Column name is required.' });

    if (databaseRef && normalized.databaseName) {
      const db = findDatabase(databaseRef, normalized.databaseName);
      if (!db) {
        issues.push({ field: 'databaseName', message: 'Database does not exist in reference file.' });
      } else if (normalized.tableName) {
        const table = findTable(db, normalized.tableName);
        if (!table) {
          issues.push({ field: 'tableName', message: 'Table does not exist in selected database.' });
        } else if (normalized.columnName) {
          const column = findColumn(table, normalized.columnName);
          if (!column) {
            issues.push({ field: 'columnName', message: 'Column does not exist in selected table.' });
          }
        }
      }
    }
  }

  if (normalized.kind === 'storage') {
    if (!normalized.storageMainFile) {
      issues.push({ field: 'storageMainFile', message: 'Storage main folder is required.' });
    }
    if (normalized.maxFileSizeMb !== undefined && normalized.maxFileSizeMb <= 0) {
      issues.push({ field: 'maxFileSizeMb', message: 'Max file size must be greater than zero.' });
    }
  }

  if (normalized.kind === 'element' && !normalized.linkedElementKey) {
    issues.push({ field: 'linkedElementKey', message: 'Linked element key is required.' });
  }

  if (normalized.kind === 'derived' && !normalized.formula) {
    issues.push({ field: 'formula', message: 'Formula is required for derived bindings.' });
  }

  return { valid: issues.length === 0, issues };
}

export function getBindingTargetLabel(binding: ElementBinding): string {
  if (binding.kind === 'database') {
    return [binding.databaseName, binding.tableName, binding.columnName].filter(Boolean).join('.');
  }
  if (binding.kind === 'storage') {
    return [binding.storageMainFile, binding.storageSubFile].filter(Boolean).join('/');
  }
  if (binding.kind === 'element') {
    return binding.linkedElementKey ?? '';
  }
  return binding.formula || binding.outputMeaning || '';
}

export function getBindingDisplayLabel(binding: ElementBinding): string {
  const normalized = normalizeBinding(binding);
  const target = getBindingTargetLabel(normalized);
  const base = normalized.label || target || `${normalized.kind} binding`;
  return `${base} [${normalized.kind}]`;
}
