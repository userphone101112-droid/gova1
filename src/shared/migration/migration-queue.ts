/**
 * Migration Queue System
 * 
 * Manages the progressive cleanup of legacy violations by organizing them
 * into a prioritized queue that can be processed feature-by-feature.
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface LegacyViolation {
  id: string;
  type: 'hardcoded_text' | 'missing_ui_identifier' | 'missing_translation' | 'missing_binding';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  file: string;
  line: number;
  column: number;
  feature: string;
  description: string;
  suggestion: string;
  autoFixable: boolean;
  status?: 'pending' | 'in_progress' | 'fixed' | 'skipped' | 'blocked';
}

export interface MigrationQueue {
  violations: LegacyViolation[];
  byFeature: Record<string, LegacyViolation[]>;
  bySeverity: Record<string, LegacyViolation[]>;
  total: number;
  pending: number;
  inProgress: number;
  fixed: number;
  skipped: number;
  blocked: number;
}

export interface FeatureMigrationStatus {
  feature: string;
  totalViolations: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  autoFixable: number;
  manualFixRequired: number;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  progress: number;
}

const SEVERITY_ORDER = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
const FEATURE_ORDER = ['auth', 'home', 'dashboard', 'settings', 'splash', 'common'];

/**
 * Load violations from the legacy violation report
 */
export function loadViolations(): LegacyViolation[] {
  const reportPath = join(process.cwd(), 'docs', 'migration', 'legacy-violations-report.json');
  
  if (!existsSync(reportPath)) {
    console.warn('Legacy violation report not found. Run scan-legacy-violations first.');
    return [];
  }
  
  try {
    const content = readFileSync(reportPath, 'utf-8');
    const report = JSON.parse(content);
    return report.violations || [];
  } catch (error) {
    console.error('Error loading violation report:', error);
    return [];
  }
}

/**
 * Build migration queue from violations
 */
export function buildMigrationQueue(violations: LegacyViolation[]): MigrationQueue {
  const byFeature: Record<string, LegacyViolation[]> = {};
  const bySeverity: Record<string, LegacyViolation[]> = {};
  
  // Initialize with all features
  for (const feature of FEATURE_ORDER) {
    byFeature[feature] = [];
  }
  
  // Group violations by feature and severity
  for (const violation of violations) {
    const feature = violation.feature || 'common';
    if (!byFeature[feature]) {
      byFeature[feature] = [];
    }
    byFeature[feature].push(violation);
    
    const severity = violation.severity;
    if (!bySeverity[severity]) {
      bySeverity[severity] = [];
    }
    bySeverity[severity].push(violation);
    
    // Set default status
    if (!violation.status) {
      violation.status = 'pending';
    }
  }
  
  // Sort violations within each feature by severity
  for (const feature in byFeature) {
    byFeature[feature].sort((a, b) => {
      const severityA = SEVERITY_ORDER.indexOf(a.severity);
      const severityB = SEVERITY_ORDER.indexOf(b.severity);
      return severityA - severityB;
    });
  }
  
  // Sort violations within each severity by feature order
  for (const severityKey in bySeverity) {
    bySeverity[severityKey].sort((a, b) => {
      const featureA = FEATURE_ORDER.indexOf(a.feature);
      const featureB = FEATURE_ORDER.indexOf(b.feature);
      return featureA - featureB;
    });
  }
  
  // Calculate statistics
  const total = violations.length;
  const pending = violations.filter(v => v.status === 'pending').length;
  const inProgress = violations.filter(v => v.status === 'in_progress').length;
  const fixed = violations.filter(v => v.status === 'fixed').length;
  const skipped = violations.filter(v => v.status === 'skipped').length;
  const blocked = violations.filter(v => v.status === 'blocked').length;
  
  return {
    violations,
    byFeature,
    bySeverity,
    total,
    pending,
    inProgress,
    fixed,
    skipped,
    blocked,
  };
}

/**
 * Get feature migration status
 */
export function getFeatureMigrationStatus(queue: MigrationQueue, feature: string): FeatureMigrationStatus {
  const featureViolations = queue.byFeature[feature] || [];
  
  const critical = featureViolations.filter(v => v.severity === 'CRITICAL').length;
  const high = featureViolations.filter(v => v.severity === 'HIGH').length;
  const medium = featureViolations.filter(v => v.severity === 'MEDIUM').length;
  const low = featureViolations.filter(v => v.severity === 'LOW').length;
  const autoFixable = featureViolations.filter(v => v.autoFixable).length;
  const manualFixRequired = featureViolations.filter(v => !v.autoFixable).length;
  
  const fixed = featureViolations.filter(v => v.status === 'fixed').length;
  const progress = featureViolations.length > 0 ? (fixed / featureViolations.length) * 100 : 100;
  
  let status: 'pending' | 'in_progress' | 'completed' | 'blocked' = 'pending';
  if (progress === 100) {
    status = 'completed';
  } else if (fixed > 0) {
    status = 'in_progress';
  }
  
  return {
    feature,
    totalViolations: featureViolations.length,
    critical,
    high,
    medium,
    low,
    autoFixable,
    manualFixRequired,
    status,
    progress,
  };
}

/**
 * Get next violation to process
 */
export function getNextViolation(queue: MigrationQueue): LegacyViolation | null {
  // Find first pending violation by priority
  for (const _severity of SEVERITY_ORDER) {
    for (const feature of FEATURE_ORDER) {
      const featureViolations = queue.byFeature[feature] || [];
      const pending = featureViolations.find(v => v.status === 'pending');
      if (pending) {
        return pending;
      }
    }
  }
  
  return null;
}

/**
 * Mark violation as fixed
 */
export function markViolationFixed(queue: MigrationQueue, violationId: string): boolean {
  const violation = queue.violations.find(v => v.id === violationId);
  if (violation) {
    violation.status = 'fixed';
    return true;
  }
  return false;
}

/**
 * Mark violation as in progress
 */
export function markViolationInProgress(queue: MigrationQueue, violationId: string): boolean {
  const violation = queue.violations.find(v => v.id === violationId);
  if (violation) {
    violation.status = 'in_progress';
    return true;
  }
  return false;
}

/**
 * Mark violation as skipped
 */
export function markViolationSkipped(queue: MigrationQueue, violationId: string, reason?: string): boolean {
  const violation = queue.violations.find(v => v.id === violationId);
  if (violation) {
    violation.status = 'skipped';
    if (reason) {
      violation.description += ` (Skipped: ${reason})`;
    }
    return true;
  }
  return false;
}

/**
 * Mark violation as blocked
 */
export function markViolationBlocked(queue: MigrationQueue, violationId: string, reason?: string): boolean {
  const violation = queue.violations.find(v => v.id === violationId);
  if (violation) {
    violation.status = 'blocked';
    if (reason) {
      violation.description += ` (Blocked: ${reason})`;
    }
    return true;
  }
  return false;
}

/**
 * Get violations for a specific feature
 */
export function getFeatureViolations(queue: MigrationQueue, feature: string): LegacyViolation[] {
  return queue.byFeature[feature] || [];
}

/**
 * Get violations by severity
 */
export function getSeverityViolations(queue: MigrationQueue, severity: string): LegacyViolation[] {
  return queue.bySeverity[severity] || [];
}

/**
 * Get auto-fixable violations
 */
export function getAutoFixableViolations(queue: MigrationQueue): LegacyViolation[] {
  return queue.violations.filter(v => v.autoFixable && v.status === 'pending');
}

/**
 * Get manual fix violations
 */
export function getManualFixViolations(queue: MigrationQueue): LegacyViolation[] {
  return queue.violations.filter(v => !v.autoFixable && v.status === 'pending');
}

/**
 * Calculate overall migration progress
 */
export function calculateMigrationProgress(queue: MigrationQueue): number {
  if (queue.total === 0) {
    return 100;
  }
  return (queue.fixed / queue.total) * 100;
}

/**
 * Get migration summary
 */
export function getMigrationSummary(queue: MigrationQueue): {
  totalViolations: number;
  completed: number;
  remaining: number;
  progress: number;
  byFeature: Record<string, FeatureMigrationStatus>;
  bySeverity: Record<string, number>;
} {
  const byFeature: Record<string, FeatureMigrationStatus> = {};
  
  for (const feature of FEATURE_ORDER) {
    byFeature[feature] = getFeatureMigrationStatus(queue, feature);
  }
  
  const bySeverity: Record<string, number> = {};
  for (const severityKey of SEVERITY_ORDER) {
    bySeverity[severityKey] = (queue.bySeverity[severityKey] || []).length;
  }
  
  return {
    totalViolations: queue.total,
    completed: queue.fixed,
    remaining: queue.pending + queue.inProgress,
    progress: calculateMigrationProgress(queue),
    byFeature,
    bySeverity,
  };
}

/**
 * Save migration queue state
 */
export function saveMigrationQueue(queue: MigrationQueue): void {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const fs = require('fs');
  const queuePath = join(process.cwd(), 'docs', 'migration', 'migration-queue.json');
  fs.writeFileSync(queuePath, JSON.stringify(queue, null, 2), 'utf-8');
  console.log(`Migration queue saved to ${queuePath}`);
}

/**
 * Load migration queue state
 */
export function loadMigrationQueue(): MigrationQueue | null {
  const queuePath = join(process.cwd(), 'docs', 'migration', 'migration-queue.json');
  
  if (!existsSync(queuePath)) {
    return null;
  }
  
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs');
    const content = fs.readFileSync(queuePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error loading migration queue:', error);
    return null;
  }
}

/**
 * Initialize migration queue from violations
 */
export function initializeMigrationQueue(): MigrationQueue {
  console.log('🔧 Initializing Migration Queue...\n');
  
  const violations = loadViolations();
  const queue = buildMigrationQueue(violations);
  
  const summary = getMigrationSummary(queue);
  
  console.log(`📊 Migration Queue Initialized:`);
  console.log(`   Total Violations: ${summary.totalViolations}`);
  console.log(`   Completed: ${summary.completed}`);
  console.log(`   Remaining: ${summary.remaining}`);
  console.log(`   Progress: ${summary.progress.toFixed(1)}%`);
  
  console.log(`\n📋 By Feature:`);
  for (const feature of FEATURE_ORDER) {
    const status = summary.byFeature[feature];
    if (status.totalViolations > 0) {
      console.log(`   ${feature}: ${status.totalViolations} (${status.progress.toFixed(1)}%)`);
    }
  }
  
  console.log(`\n🎯 By Severity:`);
  for (const severity of SEVERITY_ORDER) {
    const count = summary.bySeverity[severity];
    if (count > 0) {
      console.log(`   ${severity}: ${count}`);
    }
  }
  
  saveMigrationQueue(queue);
  
  return queue;
}
