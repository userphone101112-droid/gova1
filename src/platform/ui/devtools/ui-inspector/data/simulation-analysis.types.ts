import type { ElementBinding } from './element-binding.types';
import type { InspectorDataEntry } from './inspector-config.types';

export type SimulationSeverity = 'info' | 'warning' | 'error';

export type SimulationIssueCode =
  | 'missing_binding'
  | 'invalid_binding'
  | 'unresolved_reference'
  | 'conflicting_binding'
  | 'legacy_mismatch';

export type SimulationIssue = {
  code: SimulationIssueCode;
  severity: SimulationSeverity;
  message: string;
  bindingId?: string;
  field?: string;
};

export type BindingSimulationResult = {
  binding: ElementBinding;
  valid: boolean;
  targetLabel: string;
  displayLabel: string;
  issues: SimulationIssue[];
};

export type LegacySyncSnapshot = {
  before: InspectorDataEntry;
  after: InspectorDataEntry;
  changedFields: Array<keyof InspectorDataEntry>;
};

export type SimulationSummary = {
  totalBindings: number;
  validBindings: number;
  invalidBindings: number;
  warnings: number;
  errors: number;
};

export type SimulationAnalysisReport = {
  generatedAt: string;
  summary: SimulationSummary;
  bindingResults: BindingSimulationResult[];
  entrySnapshot?: LegacySyncSnapshot;
  issues: SimulationIssue[];
};
