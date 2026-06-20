import type { DatabaseRefFile } from '../data/database-ref.types';
import { resolveEntryBindings } from '../data/element-binding-utils';
import type { ElementBinding } from '../data/element-binding.types';
import type { InspectorDataMap } from '../data/inspector-config.types';
import type { StorageRefFile } from '../data/storage-ref.types';

export type UsageCount = { key: string; label: string; count: number };

export type CrudMatrixRow = {
  database: string;
  table: string;
  read: number;
  write: number;
  update: number;
  delete: number;
};

export type UploadMatrixRow = {
  mainFile: string;
  subFile: string;
  upload: number;
  download: number;
  preview: number;
};

export type SuggestedIndex = {
  database: string;
  table: string;
  column: string;
  reason: string;
  priority: 'likely' | 'required';
};

export type MissingDecision = {
  elementKey: string;
  bindingId?: string;
  message: string;
  severity: 'warning' | 'error';
};

export type ArchitectureSuggestion = {
  id: string;
  category: 'database' | 'storage' | 'api' | 'security' | 'general';
  message: string;
};

export type SimulationInsightsReport = {
  generatedAt: string;
  totalElements: number;
  savedElements: number;
  linkedElements: number;
  unboundElements: number;
  totalBindings: number;
  databaseUsage: UsageCount[];
  tableUsage: UsageCount[];
  columnUsage: UsageCount[];
  storageMainUsage: UsageCount[];
  storageSubUsage: UsageCount[];
  crudMatrix: CrudMatrixRow[];
  uploadMatrix: UploadMatrixRow[];
  suggestedIndexes: SuggestedIndex[];
  missingDecisions: MissingDecision[];
  architectureSuggestions: ArchitectureSuggestion[];
};

export type SimulationAnalysisInput = {
  inspectorData: InspectorDataMap;
  databaseRef: DatabaseRefFile;
  storageRef: StorageRefFile;
};

function increment(map: Map<string, UsageCount>, key: string, label: string): void {
  const existing = map.get(key);
  if (existing) {
    existing.count += 1;
  } else {
    map.set(key, { key, label, count: 1 });
  }
}

function sortedCounts(map: Map<string, UsageCount>): UsageCount[] {
  return Array.from(map.values()).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

function crudKey(database: string, table: string): string {
  return `${database}::${table}`;
}

export function runSimulationAnalysis(input: SimulationAnalysisInput): SimulationInsightsReport {
  const { inspectorData, databaseRef, storageRef } = input;
  const entries = Object.values(inspectorData);
  const savedElements = entries.length;

  const dbUsage = new Map<string, UsageCount>();
  const tableUsage = new Map<string, UsageCount>();
  const columnUsage = new Map<string, UsageCount>();
  const mainUsage = new Map<string, UsageCount>();
  const subUsage = new Map<string, UsageCount>();
  const crudMap = new Map<string, CrudMatrixRow>();
  const uploadMap = new Map<string, UploadMatrixRow>();
  const missingDecisions: MissingDecision[] = [];
  const architectureSuggestions: ArchitectureSuggestion[] = [];
  const indexCandidates = new Map<string, SuggestedIndex>();

  let totalBindings = 0;
  let linkedElements = 0;

  for (const entry of entries) {
    const elementKey = entry.dataUiIdentityKey || entry.dataUiUuid;
    const bindings: ElementBinding[] = resolveEntryBindings(entry, databaseRef);

    if (!bindings.length) {
      missingDecisions.push({
        elementKey,
        message: 'Element has no bindings configured.',
        severity: 'warning',
      });
      continue;
    }

    linkedElements += 1;
    totalBindings += bindings.length;

    for (const binding of bindings) {
      if (!binding.enabled) continue;

      if (!binding.confidence || binding.confidence === 'low') {
        missingDecisions.push({
          elementKey,
          bindingId: binding.id,
          message: 'Binding has low or missing confidence.',
          severity: 'warning',
        });
      }
      if (!binding.reason?.trim()) {
        missingDecisions.push({
          elementKey,
          bindingId: binding.id,
          message: 'Binding has no reason documented.',
          severity: 'warning',
        });
      }

      if (binding.kind === 'database') {
        if (!binding.columnName) {
          missingDecisions.push({
            elementKey,
            bindingId: binding.id,
            message: 'Database binding missing column.',
            severity: 'error',
          });
        }
        if (binding.databaseName) increment(dbUsage, binding.databaseName, binding.databaseName);
        if (binding.databaseName && binding.tableName) {
          increment(tableUsage, `${binding.databaseName}.${binding.tableName}`, `${binding.databaseName}.${binding.tableName}`);
        }
        if (binding.databaseName && binding.tableName && binding.columnName) {
          const colKey = `${binding.databaseName}.${binding.tableName}.${binding.columnName}`;
          increment(columnUsage, colKey, colKey);
        }

        const ck = crudKey(binding.databaseName ?? '', binding.tableName ?? '');
        const row = crudMap.get(ck) ?? {
          database: binding.databaseName ?? '',
          table: binding.tableName ?? '',
          read: 0,
          write: 0,
          update: 0,
          delete: 0,
        };
        if (binding.role === 'read_from' || binding.role === 'display_value') row.read += 1;
        if (binding.role === 'write_to') row.write += 1;
        if (binding.role === 'update') row.update += 1;
        if (binding.role === 'delete') row.delete += 1;
        crudMap.set(ck, row);

        if (
          binding.queryHint === 'search' ||
          binding.queryHint === 'lookup' ||
          binding.role === 'foreign_key' ||
          binding.indexNeed === 'likely' ||
          binding.indexNeed === 'required'
        ) {
          const idxKey = `${binding.databaseName}.${binding.tableName}.${binding.columnName}`;
          indexCandidates.set(idxKey, {
            database: binding.databaseName ?? '',
            table: binding.tableName ?? '',
            column: binding.columnName ?? '',
            reason: binding.queryHint === 'search' ? 'Used in search context' : 'Foreign key or lookup usage',
            priority: binding.indexNeed === 'required' ? 'required' : 'likely',
          });
        }
      }

      if (binding.kind === 'storage') {
        if (!binding.storageSubFile) {
          missingDecisions.push({
            elementKey,
            bindingId: binding.id,
            message: 'Storage binding missing sub file.',
            severity: 'warning',
          });
        }
        if (binding.storageMainFile) increment(mainUsage, binding.storageMainFile, binding.storageMainFile);
        if (binding.storageMainFile && binding.storageSubFile) {
          increment(subUsage, `${binding.storageMainFile}/${binding.storageSubFile}`, `${binding.storageMainFile}/${binding.storageSubFile}`);
        }

        const uk = `${binding.storageMainFile ?? ''}::${binding.storageSubFile ?? ''}`;
        const urow = uploadMap.get(uk) ?? {
          mainFile: binding.storageMainFile ?? '',
          subFile: binding.storageSubFile ?? '',
          upload: 0,
          download: 0,
          preview: 0,
        };
        if (binding.role === 'upload_to') urow.upload += 1;
        if (binding.role === 'download_from') urow.download += 1;
        if (binding.role === 'preview_from') urow.preview += 1;
        uploadMap.set(uk, urow);
      }

      if (binding.kind === 'element' && binding.linkedElementKey) {
        if (!inspectorData[binding.linkedElementKey]) {
          missingDecisions.push({
            elementKey,
            bindingId: binding.id,
            message: `Linked element "${binding.linkedElementKey}" not found.`,
            severity: 'error',
          });
        }
      }
    }
  }

  const unboundElements = savedElements - linkedElements;

  if (sortedCounts(columnUsage).length > 0) {
    architectureSuggestions.push({
      id: 'db-columns-review',
      category: 'database',
      message: 'Review frequently referenced columns for indexing and API DTO alignment.',
    });
  }
  if (sortedCounts(subUsage).length > 0) {
    architectureSuggestions.push({
      id: 'storage-paths',
      category: 'storage',
      message: 'Define consistent path templates and access levels for active storage bindings.',
    });
  }
  if (crudMap.size > 0) {
    architectureSuggestions.push({
      id: 'api-crud',
      category: 'api',
      message: 'Generate REST endpoints from CRUD matrix rows with read/write separation.',
    });
  }
  if (missingDecisions.some((d) => d.severity === 'error')) {
    architectureSuggestions.push({
      id: 'fix-errors',
      category: 'general',
      message: 'Resolve missing decisions marked as errors before final schema design.',
    });
  }

  void storageRef;

  return {
    generatedAt: new Date().toISOString(),
    totalElements: savedElements,
    savedElements,
    linkedElements,
    unboundElements,
    totalBindings,
    databaseUsage: sortedCounts(dbUsage),
    tableUsage: sortedCounts(tableUsage),
    columnUsage: sortedCounts(columnUsage),
    storageMainUsage: sortedCounts(mainUsage),
    storageSubUsage: sortedCounts(subUsage),
    crudMatrix: Array.from(crudMap.values()).sort((a, b) =>
      `${a.database}.${a.table}`.localeCompare(`${b.database}.${b.table}`)
    ),
    uploadMatrix: Array.from(uploadMap.values()).sort((a, b) =>
      `${a.mainFile}/${a.subFile}`.localeCompare(`${b.mainFile}/${b.subFile}`)
    ),
    suggestedIndexes: Array.from(indexCandidates.values()),
    missingDecisions,
    architectureSuggestions,
  };
}
