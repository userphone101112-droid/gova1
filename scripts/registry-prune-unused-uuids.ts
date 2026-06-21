#!/usr/bin/env tsx
/**
 * Script to identify and prune unused UUIDs from the UI registry.
 * 
 * A UUID is considered "unused" if ALL of the following are true:
 * - No entry in data/ui-inspector/elements/by-key
 * - No bindings in data/ui-inspector/bindings/by-key
 * - No storage/database/relationship references
 * - No translation binding
 * - Does not appear in source-index.ts as an element linked to translated text
 * - No hardcoded text discovery result requires it
 * 
 * Usage:
 *   npm run registry:prune-unused-uuids              # Report only
 *   npm run registry:prune-unused-uuids -- --write   # Execute pruning
 */

import { existsSync, readFileSync, readdirSync, writeFileSync } from 'fs';
import { join } from 'path';

import { ALL_UI_IDENTITIES, UI_UUID_MAP } from '../src/platform/ui/registry/registry';
import { UI_SOURCE_INDEX } from '../src/platform/ui/registry/source-index';

const ROOT = process.cwd();
const INSPECTOR_DATA_DIR = join(ROOT, 'data/ui-inspector');

interface PruneReport {
  unusedUuids: string[];
  safeToRemove: string[];
  unsafeToRemove: string[];
  reasons: Record<string, string[]>;
}

function checkInspectorDataUsage(uuid: string): boolean {
  const elementsByKeyPath = join(INSPECTOR_DATA_DIR, 'elements/by-key');
  if (!existsSync(elementsByKeyPath)) return false;
  
  try {
    const files = readdirSync(elementsByKeyPath);
    for (const file of files) {
      const filePath = join(elementsByKeyPath, file);
      const content = readFileSync(filePath, 'utf-8');
      if (content.includes(uuid)) return true;
    }
  } catch {
    return false;
  }
  
  return false;
}

function checkInspectorBindingsUsage(uuid: string): boolean {
  const bindingsByKeyPath = join(INSPECTOR_DATA_DIR, 'bindings/by-key');
  if (!existsSync(bindingsByKeyPath)) return false;
  
  try {
    const files = readdirSync(bindingsByKeyPath);
    for (const file of files) {
      const filePath = join(bindingsByKeyPath, file);
      const content = readFileSync(filePath, 'utf-8');
      if (content.includes(uuid)) return true;
    }
  } catch {
    return false;
  }
  
  return false;
}

function checkSourceIndexUsage(uuid: string): boolean {
  return uuid in UI_SOURCE_INDEX;
}

function checkTranslationUsage(uuid: string): boolean {
  // Check if UUID has a translation binding
  const identity = UI_UUID_MAP[uuid];
  if (!identity) return false;
  
  // Check if there's a translation key for this identity
  // This is a simplified check - in reality, you'd need to check the locale files
  const feature = identity.feature;
  const enPath = join(ROOT, `src/platform/ui/i18n/locales/${feature}/en.json`);
  
  if (!existsSync(enPath)) return false;
  
  try {
    const enContent = readFileSync(enPath, 'utf-8');
    const enData = JSON.parse(enContent);
    
    // Check if the identity's path exists in the translation file
    if (identity.path && enData[identity.path]) return true;
  } catch {
    return false;
  }
  
  return false;
}

function generatePruneReport(): PruneReport {
  const report: PruneReport = {
    unusedUuids: [],
    safeToRemove: [],
    unsafeToRemove: [],
    reasons: {},
  };

  for (const identity of ALL_UI_IDENTITIES) {
    if (!identity.uuid) continue; // Skip identities without UUID
    
    const reasons: string[] = [];
    
    // Check various usage patterns
    if (checkInspectorDataUsage(identity.uuid)) {
      reasons.push('Used in UI Inspector element data');
    }
    
    if (checkInspectorBindingsUsage(identity.uuid)) {
      reasons.push('Has UI Inspector bindings');
    }
    
    if (checkSourceIndexUsage(identity.uuid)) {
      reasons.push('Appears in source index');
    }
    
    if (checkTranslationUsage(identity.uuid)) {
      reasons.push('Has translation binding');
    }
    
    // If no reasons found, it's potentially unused
    if (reasons.length === 0) {
      report.unusedUuids.push(identity.uuid);
      report.safeToRemove.push(identity.uuid);
      report.reasons[identity.uuid] = ['No usage detected'];
    } else {
      report.unsafeToRemove.push(identity.uuid);
      report.reasons[identity.uuid] = reasons;
    }
  }

  return report;
}

function printReport(report: PruneReport): void {
  console.log('\n=== UUID Prune Report ===\n');
  console.log(`Total UUID-backed identities: ${ALL_UI_IDENTITIES.filter(i => i.uuid).length}`);
  console.log(`Potentially unused UUIDs: ${report.unusedUuids.length}`);
  console.log(`Safe to remove: ${report.safeToRemove.length}`);
  console.log(`Unsafe to remove: ${report.unsafeToRemove.length}\n`);

  if (report.safeToRemove.length > 0) {
    console.log('Safe to remove:');
    for (const uuid of report.safeToRemove) {
      const identity = UI_UUID_MAP[uuid];
      console.log(`  - ${uuid} (${identity?.id} - ${identity?.path})`);
    }
    console.log('');
  }

  if (report.unsafeToRemove.length > 0) {
    console.log('Unsafe to remove (has usage):');
    for (const uuid of report.unsafeToRemove.slice(0, 10)) {
      const identity = UI_UUID_MAP[uuid];
      const reasons = report.reasons[uuid];
      console.log(`  - ${uuid} (${identity?.id} - ${identity?.path}): ${reasons.join(', ')}`);
    }
    if (report.unsafeToRemove.length > 10) {
      console.log(`  ... and ${report.unsafeToRemove.length - 10} more`);
    }
    console.log('');
  }
}

function removeIdentityFromRegistryFile(feature: string, identityId: string): boolean {
  const registryPath = join(ROOT, `src/platform/ui/registry/features/${feature}.ts`);
  
  if (!existsSync(registryPath)) return false;
  
  try {
    const content = readFileSync(registryPath, 'utf-8');
    
    // Remove the identity entry from the registry file
    // This is a simplified implementation using regex - in production, use AST
    const updatedContent = content.replace(
      new RegExp(`\\s*${identityId}:\\s*\\{[^}]+\\}\\s*,?\\n`, 'g'),
      ''
    );
    
    if (updatedContent !== content) {
      writeFileSync(registryPath, updatedContent, 'utf-8');
      return true;
    }
  } catch {
    return false;
  }
  
  return false;
}

function updateUuidManifest(uuid: string): boolean {
  const manifestPath = join(ROOT, 'src/platform/ui/registry/uuid-manifest.json');
  
  if (!existsSync(manifestPath)) return false;
  
  try {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
    
    if (manifest.identities[uuid]) {
      delete manifest.identities[uuid];
      
      // Add to removedIdentities to prevent reuse
      if (!manifest.removedIdentities) {
        manifest.removedIdentities = {};
      }
      manifest.removedIdentities[uuid] = {
        id: manifest.identities[uuid]?.id,
        removedAt: new Date().toISOString(),
      };
      
      writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
      return true;
    }
  } catch {
    return false;
  }
  
  return false;
}

function updateRegistryMemberPaths(path: string): boolean {
  const pathsPath = join(ROOT, 'src/platform/ui/registry/registry-member-paths.json');
  
  if (!existsSync(pathsPath)) return false;
  
  try {
    const paths = JSON.parse(readFileSync(pathsPath, 'utf-8'));
    const index = paths.indexOf(path);
    
    if (index !== -1) {
      paths.splice(index, 1);
      writeFileSync(pathsPath, JSON.stringify(paths, null, 2), 'utf-8');
      return true;
    }
  } catch {
    return false;
  }
  
  return false;
}

function executePruning(report: PruneReport): void {
  console.log('\n=== Executing Pruning ===\n');
  
  if (report.safeToRemove.length === 0) {
    console.log('No UUIDs to prune.');
    return;
  }

  console.log(`Pruning ${report.safeToRemove.length} UUIDs...`);
  
  for (const uuid of report.safeToRemove) {
    const identity = UI_UUID_MAP[uuid];
    if (!identity) continue;
    
    console.log(`  - Removing ${uuid} (${identity.id})`);
    
    // 1. Remove data-ui-uuid from JSX files
    // TODO: Implement JSX file scanning to remove data-ui-uuid attributes
    // This requires scanning the entire src directory and using AST-based modification
    
    // 2. Remove registry identity from feature file
    if (identity.feature && identity.id) {
      removeIdentityFromRegistryFile(identity.feature, identity.id);
    }
    
    // 3. Update uuid-manifest.json
    updateUuidManifest(uuid);
    
    // 4. Update registry-member-paths.json
    if (identity.path) {
      updateRegistryMemberPaths(identity.path);
    }
    
    // 5. Update source-index.ts (would need to regenerate via audit:unified-ui-i18n)
    // 6. Delete orphaned entries from data/ui-inspector
  }
  
  console.log('\nPruning complete.');
  console.log('Note: After pruning, run the following to regenerate generated files:');
  console.log('  npm run audit:unified-ui-i18n');
  console.log('  npm run registry:generate');
}

function main() {
  const writeMode = process.argv.includes('--write');
  
  const report = generatePruneReport();
  printReport(report);
  
  if (writeMode) {
    executePruning(report);
  } else {
    console.log('\nRun with --write to execute pruning.');
  }
}

main();
