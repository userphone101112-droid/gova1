import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

interface OrphanReport {
  orphanTranslations: Array<{
    key: string;
    feature: string;
    file: string;
  }>;
  orphanUiIdentifiers: Array<{
    identifier: string;
    feature: string;
  }>;
  missingLanguagePairs: Array<{
    feature: string;
    missing: string;
  }>;
  duplicateUiIdentifiers: Array<{
    identifier: string;
    count: number;
  }>;
  unusedTranslations: Array<{
    key: string;
    feature: string;
  }>;
  summary: {
    totalOrphanTranslations: number;
    totalOrphanUiIdentifiers: number;
    totalMissingLanguagePairs: number;
    totalDuplicateUiIdentifiers: number;
    totalUnusedTranslations: number;
  };
}

function findOrphans(): OrphanReport {
  console.log('🔍 Starting Orphan Detection...\n');
  
  const report: OrphanReport = {
    orphanTranslations: [],
    orphanUiIdentifiers: [],
    missingLanguagePairs: [],
    duplicateUiIdentifiers: [],
    unusedTranslations: [],
    summary: {
      totalOrphanTranslations: 0,
      totalOrphanUiIdentifiers: 0,
      totalMissingLanguagePairs: 0,
      totalDuplicateUiIdentifiers: 0,
      totalUnusedTranslations: 0,
    },
  };
  
  // Scan UI Registry
  console.log('Scanning UI Registry...');
  const uiRegistryPath = join(process.cwd(), 'src', 'shared', 'ui-registry.ts');
  const uiIdentifiers = new Set<string>();
  const uiIdentifierCounts = new Map<string, number>();
  
  if (existsSync(uiRegistryPath)) {
    const content = readFileSync(uiRegistryPath, 'utf-8');
    const identifierRegex = /'([a-z0-9-]+\.[a-z0-9-]+\.[a-z0-9-]+\.[a-z0-9-]+)'/g;
    let match;
    
    while ((match = identifierRegex.exec(content)) !== null) {
      const identifier = match[1];
      uiIdentifiers.add(identifier);
      uiIdentifierCounts.set(identifier, (uiIdentifierCounts.get(identifier) || 0) + 1);
    }
  }
  
  // Detect duplicate UI identifiers
  for (const [identifier, count] of uiIdentifierCounts.entries()) {
    if (count > 1) {
      report.duplicateUiIdentifiers.push({
        identifier,
        count,
      });
    }
  }
  
  console.log(`Found ${uiIdentifiers.size} UI identifiers`);
  console.log(`Found ${report.duplicateUiIdentifiers.length} duplicate UI identifiers\n`);
  
  // Scan all components for UI identifier usage
  console.log('Scanning component usage...');
  const usedUiIdentifiers = new Set<string>();
  const usedTranslationKeys = new Set<string>();
  
  scanDirectory(join(process.cwd(), 'src'), {
    usedUiIdentifiers,
    usedTranslationKeys,
  });
  
  console.log(`Found ${usedUiIdentifiers.size} used UI identifiers`);
  console.log(`Found ${usedTranslationKeys.size} used translation keys\n`);
  
  // Find orphan UI identifiers (registered but not used)
  console.log('Detecting orphan UI identifiers...');
  for (const identifier of uiIdentifiers) {
    if (!usedUiIdentifiers.has(identifier)) {
      const feature = identifier.split('.')[0];
      report.orphanUiIdentifiers.push({
        identifier,
        feature,
      });
    }
  }
  
  console.log(`Found ${report.orphanUiIdentifiers.length} orphan UI identifiers\n`);
  
  // Scan translations
  console.log('Scanning translations...');
  const featuresPath = join(process.cwd(), 'src', 'features');
  const allTranslationKeys = new Map<string, { feature: string; file: string }>();
  
  if (existsSync(featuresPath)) {
    const features = readdirSync(featuresPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    for (const feature of features) {
      const enPath = join(featuresPath, feature, 'i18n', 'en.json');
      const arPath = join(featuresPath, feature, 'i18n', 'ar.json');
      
      // Check for missing language pairs
      if (existsSync(enPath) && !existsSync(arPath)) {
        report.missingLanguagePairs.push({
          feature,
          missing: 'ar.json',
        });
      } else if (!existsSync(enPath) && existsSync(arPath)) {
        report.missingLanguagePairs.push({
          feature,
          missing: 'en.json',
        });
      }
      
      // Load translation keys
      if (existsSync(enPath)) {
        try {
          const content = readFileSync(enPath, 'utf-8');
          const translations = JSON.parse(content);
          extractTranslationKeys(translations, feature, enPath, allTranslationKeys);
        } catch (error) {
          console.error(`Error loading ${enPath}:`, error);
        }
      }
    }
  }
  
  console.log(`Found ${allTranslationKeys.size} translation keys`);
  console.log(`Found ${report.missingLanguagePairs.length} missing language pairs\n`);
  
  // Find orphan translations (exist but not used)
  console.log('Detecting orphan translations...');
  for (const [key, meta] of allTranslationKeys.entries()) {
    if (!usedTranslationKeys.has(key) && meta.feature !== 'common') {
      report.orphanTranslations.push({
        key,
        feature: meta.feature,
        file: meta.file,
      });
    }
  }
  
  console.log(`Found ${report.orphanTranslations.length} orphan translations\n`);
  
  // Find unused translations (exist but not used by any UI)
  console.log('Detecting unused translations...');
  for (const [key, meta] of allTranslationKeys.entries()) {
    if (!usedTranslationKeys.has(key) && meta.feature !== 'common') {
      report.unusedTranslations.push({
        key,
        feature: meta.feature,
      });
    }
  }
  
  console.log(`Found ${report.unusedTranslations.length} unused translations\n`);
  
  // Update summary
  report.summary.totalOrphanTranslations = report.orphanTranslations.length;
  report.summary.totalOrphanUiIdentifiers = report.orphanUiIdentifiers.length;
  report.summary.totalMissingLanguagePairs = report.missingLanguagePairs.length;
  report.summary.totalDuplicateUiIdentifiers = report.duplicateUiIdentifiers.length;
  report.summary.totalUnusedTranslations = report.unusedTranslations.length;
  
  return report;
}

function extractTranslationKeys(
  obj: any,
  feature: string,
  file: string,
  allKeys: Map<string, { feature: string; file: string }>
): void {
  for (const key in obj) {
    const value = obj[key];
    const fullKey = feature ? `${feature}.${key}` : key;
    
    if (typeof value === 'object' && value !== null) {
      extractTranslationKeys(value, fullKey, file, allKeys);
    } else {
      allKeys.set(fullKey, { feature, file });
    }
  }
}

function scanDirectory(
  dirPath: string,
  state: { usedUiIdentifiers: Set<string>; usedTranslationKeys: Set<string> }
): void {
  if (!existsSync(dirPath)) {
    return;
  }
  
  const items = readdirSync(dirPath, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = join(dirPath, item.name);
    
    if (item.isDirectory()) {
      // Skip node_modules and other common exclusions
      if (item.name === 'node_modules' || item.name === '.next' || item.name === 'build') {
        continue;
      }
      scanDirectory(fullPath, state);
    } else if (item.name.endsWith('.tsx') || item.name.endsWith('.ts')) {
      scanFile(fullPath, state);
    }
  }
}

function scanFile(
  filePath: string,
  state: { usedUiIdentifiers: Set<string>; usedTranslationKeys: Set<string> }
): void {
  try {
    const content = readFileSync(filePath, 'utf-8');
    
    // Extract UI identifier usage
    const uiRegex = /ui=\{([^}]+)\}/g;
    let match;
    while ((match = uiRegex.exec(content)) !== null) {
      const uiValue = match[1].trim();
      const stringMatches = uiValue.match(/'([^']+)'/g);
      if (stringMatches) {
        stringMatches.forEach(str => {
          const identifier = str.replace(/'/g, '');
          if (identifier.includes('.')) {
            state.usedUiIdentifiers.add(identifier);
          }
        });
      }
    }
    
    // Extract translation key usage
    const translationRegex = /t\(['"]([^'"]+)['"]\)/g;
    while ((match = translationRegex.exec(content)) !== null) {
      const key = match[1];
      state.usedTranslationKeys.add(key);
    }
  } catch (error) {
    console.error(`Error scanning ${filePath}:`, error);
  }
}

function generateReport(report: OrphanReport): void {
  const reportContent = `# Orphan Detection Report

Generated: ${new Date().toISOString()}

## Executive Summary

- Orphan Translations: ${report.summary.totalOrphanTranslations}
- Orphan UI Identifiers: ${report.summary.totalOrphanUiIdentifiers}
- Missing Language Pairs: ${report.summary.totalMissingLanguagePairs}
- Duplicate UI Identifiers: ${report.summary.totalDuplicateUiIdentifiers}
- Unused Translations: ${report.summary.totalUnusedTranslations}

## Orphan Translations

Translation keys that exist but are not used in any component:

${report.orphanTranslations.length > 0 
  ? report.orphanTranslations.map(t => `- \`${t.key}\` (${t.feature})`).join('\n')
  : 'None found ✅'}

## Orphan UI Identifiers

UI identifiers that are registered but never used in any component:

${report.orphanUiIdentifiers.length > 0
  ? report.orphanUiIdentifiers.map(ui => `- \`${ui.identifier}\` (${ui.feature})`).join('\n')
  : 'None found ✅'}

## Missing Language Pairs

Features that are missing either en.json or ar.json:

${report.missingLanguagePairs.length > 0
  ? report.missingLanguagePairs.map(pair => `- ${pair.feature} (missing ${pair.missing})`).join('\n')
  : 'None found ✅'}

## Duplicate UI Identifiers

UI identifiers that appear multiple times in the registry:

${report.duplicateUiIdentifiers.length > 0
  ? report.duplicateUiIdentifiers.map(dup => `- \`${dup.identifier}\` (${dup.count} times)`).join('\n')
  : 'None found ✅'}

## Unused Translations

Translation keys that exist but are not used:

${report.unusedTranslations.length > 0
  ? report.unusedTranslations.map(t => `- \`${t.key}\` (${t.feature})`).join('\n')
  : 'None found ✅'}

## Recommendations

${report.orphanTranslations.length > 0 || report.orphanUiIdentifiers.length > 0
  ? `
1. Remove orphan translations from i18n files
2. Remove orphan UI identifiers from ui-registry.ts
3. Add missing language pairs (en.json/ar.json)
4. Remove duplicate UI identifiers
5. Review unused translations and either use them or remove them
`
  : 'No orphans found. System is clean ✅'}
`;

  const outputPath = join(process.cwd(), 'docs', 'audits', 'orphan-report.md');
  const fs = require('fs');
  fs.writeFileSync(outputPath, reportContent, 'utf-8');
  
  console.log(`\n📄 Orphan report generated: ${outputPath}`);
}

function main() {
  console.log('🚀 Starting Orphan Detection...\n');
  
  try {
    const report = findOrphans();
    generateReport(report);
    
    const hasOrphans = 
      report.summary.totalOrphanTranslations > 0 ||
      report.summary.totalOrphanUiIdentifiers > 0 ||
      report.summary.totalMissingLanguagePairs > 0 ||
      report.summary.totalDuplicateUiIdentifiers > 0;
    
    if (hasOrphans) {
      console.log(`\n❌ Orphans detected. Please review the report.`);
      process.exit(1);
    } else {
      console.log(`\n✅ No orphans detected. System is clean.`);
    }
  } catch (error) {
    console.error('Orphan detection failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { main as findOrphans };
