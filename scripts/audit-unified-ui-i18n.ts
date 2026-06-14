import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { 
  generateTranslationKeyFromUi,
  extractFeatureFromUiIdentifier
} from '../src/shared/unified-ui-i18n/registry-binding';

interface AuditResult {
  phase1: RegistryScanResult;
  phase2: TranslationScanResult;
  phase3: ComponentUsageResult;
  phase4: BindingMatrix;
  phase5: OrphanDetectionResult;
  overall: OverallAuditResult;
}

interface RegistryScanResult {
  uiIdentifiers: string[];
  byFeature: Record<string, string[]>;
  total: number;
}

interface TranslationScanResult {
  translationKeys: Set<string>;
  byFeature: Record<string, Set<string>>;
  missingLanguagePairs: string[];
  total: number;
}

interface ComponentUsageResult {
  usedUiIdentifiers: Set<string>;
  usedTranslationKeys: Set<string>;
  uiUsageByFile: Record<string, string[]>;
  translationUsageByFile: Record<string, string[]>;
  hardcodedText: Array<{ file: string; line: number; text: string }>;
}

interface BindingMatrix {
  byFeature: Array<{
    feature: string;
    uiElements: number;
    translationKeys: number;
    bindings: number;
    orphansUi: number;
    orphansTranslation: number;
    mismatches: number;
  }>;
}

interface OrphanDetectionResult {
  orphanUiIdentifiers: string[];
  orphanTranslations: string[];
  missingBindings: string[];
  crossFeatureViolations: Array<{
    ui: string;
    translation: string;
    uiFeature: string;
    translationFeature: string;
  }>;
}

interface OverallAuditResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  score: number;
  pass: boolean;
}

// ============================================================================
// PHASE 1: SCAN UI REGISTRY
// ============================================================================

function scanUiRegistry(): RegistryScanResult {
  console.log('\n🔍 PHASE 1: Scanning UI Registry\n');
  
  const registryPath = join(process.cwd(), 'src', 'shared', 'ui-registry.ts');
  
  if (!existsSync(registryPath)) {
    throw new Error(`UI registry not found at ${registryPath}`);
  }
  
  const content = readFileSync(registryPath, 'utf-8');
  
  // Extract all UI identifiers using regex
  const identifierRegex = /'([a-z0-9-]+\.[a-z0-9-]+\.[a-z0-9-]+\.[a-z0-9-]+)'/g;
  const identifiers: string[] = [];
  let match;
  
  while ((match = identifierRegex.exec(content)) !== null) {
    identifiers.push(match[1]);
  }
  
  const uniqueIdentifiers = [...new Set(identifiers)];
  const byFeature: Record<string, string[]> = {};
  
  for (const identifier of uniqueIdentifiers) {
    const feature = extractFeatureFromUiIdentifier(identifier);
    if (!byFeature[feature]) {
      byFeature[feature] = [];
    }
    byFeature[feature].push(identifier);
  }
  
  console.log(`Found ${uniqueIdentifiers.length} UI identifiers`);
  console.log(`Features: ${Object.keys(byFeature).join(', ')}`);
  
  return {
    uiIdentifiers: uniqueIdentifiers,
    byFeature,
    total: uniqueIdentifiers.length,
  };
}

// ============================================================================
// PHASE 2: SCAN TRANSLATIONS
// ============================================================================

function scanTranslations(): TranslationScanResult {
  console.log('\n🔍 PHASE 2: Scanning Translations\n');
  
  const featuresPath = join(process.cwd(), 'src', 'features');
  
  if (!existsSync(featuresPath)) {
    throw new Error(`Features directory not found at ${featuresPath}`);
  }
  
  const features = readdirSync(featuresPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  const translationKeys = new Set<string>();
  const byFeature: Record<string, Set<string>> = {};
  const missingLanguagePairs: string[] = [];
  
  for (const feature of features) {
    const enPath = join(featuresPath, feature, 'i18n', 'en.json');
    const arPath = join(featuresPath, feature, 'i18n', 'ar.json');
    
    // Check for missing language pairs
    if (existsSync(enPath) && !existsSync(arPath)) {
      missingLanguagePairs.push(`${feature} (missing ar.json)`);
    } else if (!existsSync(enPath) && existsSync(arPath)) {
      missingLanguagePairs.push(`${feature} (missing en.json)`);
    }
    
    // Load English translations
    if (existsSync(enPath)) {
      try {
        const content = readFileSync(enPath, 'utf-8');
        const translations = JSON.parse(content);
        const keys = extractTranslationKeys(translations, feature);
        
        byFeature[feature] = keys;
        keys.forEach(key => translationKeys.add(key));
      } catch (error) {
        console.error(`Error loading ${enPath}:`, error);
      }
    }
  }
  
  // Also scan common translations
  const commonEnPath = join(featuresPath, 'common', 'i18n', 'en.json');
  if (existsSync(commonEnPath)) {
    try {
      const content = readFileSync(commonEnPath, 'utf-8');
      const translations = JSON.parse(content);
      const keys = extractTranslationKeys(translations, 'common');
      
      byFeature['common'] = keys;
      keys.forEach(key => translationKeys.add(key));
    } catch (error) {
      console.error(`Error loading ${commonEnPath}:`, error);
    }
  }
  
  console.log(`Found ${translationKeys.size} translation keys`);
  console.log(`Features: ${Object.keys(byFeature).join(', ')}`);
  
  if (missingLanguagePairs.length > 0) {
    console.log(`Missing language pairs: ${missingLanguagePairs.join(', ')}`);
  }
  
  return {
    translationKeys,
    byFeature,
    missingLanguagePairs,
    total: translationKeys.size,
  };
}

function extractTranslationKeys(obj: any, prefix: string): Set<string> {
  const keys = new Set<string>();
  
  for (const key in obj) {
    const value = obj[key];
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null) {
      const nestedKeys = extractTranslationKeys(value, fullKey);
      nestedKeys.forEach(k => keys.add(k));
    } else {
      keys.add(fullKey);
    }
  }
  
  return keys;
}

// ============================================================================
// PHASE 3: SCAN COMPONENT USAGE
// ============================================================================

function scanComponentUsage(): ComponentUsageResult {
  console.log('\n🔍 PHASE 3: Scanning Component Usage\n');
  
  const srcPath = join(process.cwd(), 'src');
  const usedUiIdentifiers = new Set<string>();
  const usedTranslationKeys = new Set<string>();
  const uiUsageByFile: Record<string, string[]> = {};
  const translationUsageByFile: Record<string, string[]> = {};
  const hardcodedText: Array<{ file: string; line: number; text: string }> = [];
  
  // Scan all TypeScript and TSX files
  scanDirectory(srcPath, {
    usedUiIdentifiers,
    usedTranslationKeys,
    uiUsageByFile,
    translationUsageByFile,
    hardcodedText,
  });
  
  console.log(`Found ${usedUiIdentifiers.size} used UI identifiers`);
  console.log(`Found ${usedTranslationKeys.size} used translation keys`);
  console.log(`Found ${hardcodedText.length} hardcoded text instances`);
  
  return {
    usedUiIdentifiers,
    usedTranslationKeys,
    uiUsageByFile,
    translationUsageByFile,
    hardcodedText,
  };
}

function scanDirectory(
  dirPath: string,
  state: ComponentUsageResult
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

function scanFile(filePath: string, state: ComponentUsageResult): void {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    // Extract UI identifier usage
    const uiRegex = /ui=\{([^}]+)\}/g;
    let match;
    while ((match = uiRegex.exec(content)) !== null) {
      const uiValue = match[1].trim();
      // Extract string literals from the expression
      const stringMatches = uiValue.match(/'([^']+)'/g);
      if (stringMatches) {
        stringMatches.forEach(str => {
          const identifier = str.replace(/'/g, '');
          if (identifier.includes('.')) {
            state.usedUiIdentifiers.add(identifier);
            if (!state.uiUsageByFile[filePath]) {
              state.uiUsageByFile[filePath] = [];
            }
            state.uiUsageByFile[filePath].push(identifier);
          }
        });
      }
    }
    
    // Extract translation key usage
    const translationRegex = /t\(['"]([^'"]+)['"]\)/g;
    while ((match = translationRegex.exec(content)) !== null) {
      const key = match[1];
      state.usedTranslationKeys.add(key);
      if (!state.translationUsageByFile[filePath]) {
        state.translationUsageByFile[filePath] = [];
      }
      state.translationUsageByFile[filePath].push(key);
    }
    
    // Detect hardcoded text in JSX
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Look for text content in JSX that's not in expressions
      const jsxTextRegex = />\s*([A-Z][^<{]+)\s*</g;
      let textMatch;
      while ((textMatch = jsxTextRegex.exec(line)) !== null) {
        const text = textMatch[1].trim();
        if (text.length > 2 && !/^[A-Z_\-0-9]+$/.test(text)) {
          state.hardcodedText.push({
            file: filePath,
            line: i + 1,
            text: text.substring(0, 50),
          });
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning ${filePath}:`, error);
  }
}

// ============================================================================
// PHASE 4: BUILD BINDING MATRIX
// ============================================================================

function buildBindingMatrix(
  registryResult: RegistryScanResult,
  translationResult: TranslationScanResult
): BindingMatrix {
  console.log('\n🔍 PHASE 4: Building Binding Matrix\n');
  
  const allFeatures = new Set([
    ...Object.keys(registryResult.byFeature),
    ...Object.keys(translationResult.byFeature),
  ]);
  
  const matrix: BindingMatrix['byFeature'] = [];
  
  for (const feature of allFeatures) {
    const uiIdentifiers = registryResult.byFeature[feature] || [];
    const translationKeys = translationResult.byFeature[feature] || new Set();
    
    
    // Count bindings (UI identifiers with corresponding translations)
    let bindings = 0;
    let orphansUi = 0;
    let orphansTranslation = 0;
    let mismatches = 0;
    
    for (const ui of uiIdentifiers) {
      const expectedKey = generateTranslationKeyFromUi(ui);
      if (translationKeys.has(expectedKey)) {
        bindings++;
      } else {
        orphansUi++;
      }
    }
    
    for (const key of translationKeys) {
      const hasMatchingUi = uiIdentifiers.some(ui => {
        const expectedKey = generateTranslationKeyFromUi(ui);
        return key === expectedKey || key.startsWith(expectedKey.split('.')[0]);
      });
      if (!hasMatchingUi && feature !== 'common') {
        orphansTranslation++;
      }
    }
    
    matrix.push({
      feature,
      uiElements: uiIdentifiers.length,
      translationKeys: translationKeys.size,
      bindings,
      orphansUi,
      orphansTranslation,
      mismatches,
    });
  }
  
  return { byFeature: matrix };
}

// ============================================================================
// PHASE 5: ORPHAN DETECTION
// ============================================================================

function detectOrphans(
  registryResult: RegistryScanResult,
  translationResult: TranslationScanResult,
  usageResult: ComponentUsageResult
): OrphanDetectionResult {
  console.log('\n🔍 PHASE 5: Detecting Orphans\n');
  
  const orphanUiIdentifiers: string[] = [];
  const orphanTranslations: string[] = [];
  const missingBindings: string[] = [];
  const crossFeatureViolations: Array<{
    ui: string;
    translation: string;
    uiFeature: string;
    translationFeature: string;
  }> = [];
  
  // Find orphan UI identifiers (registered but not used)
  for (const ui of registryResult.uiIdentifiers) {
    if (!usageResult.usedUiIdentifiers.has(ui)) {
      orphanUiIdentifiers.push(ui);
    }
  }
  
  // Find orphan translations (exist but not used)
  for (const key of translationResult.translationKeys) {
    if (!usageResult.usedTranslationKeys.has(key)) {
      const feature = key.split('.')[0];
      if (feature !== 'common') {
        orphanTranslations.push(key);
      }
    }
  }
  
  // Find missing bindings (UI without corresponding translation)
  for (const ui of registryResult.uiIdentifiers) {
    const expectedKey = generateTranslationKeyFromUi(ui);
    if (!translationResult.translationKeys.has(expectedKey)) {
      missingBindings.push(ui);
    }
  }
  
  // Detect cross-feature violations
  for (const file in usageResult.uiUsageByFile) {
    const uiIdentifiers = usageResult.uiUsageByFile[file];
    const translationKeys = usageResult.translationUsageByFile[file] || [];
    
    for (const ui of uiIdentifiers) {
      const uiFeature = extractFeatureFromUiIdentifier(ui);
      
      for (const translation of translationKeys) {
        const translationFeature = translation.split('.')[0];
        
        if (uiFeature !== translationFeature && translationFeature !== 'common') {
          crossFeatureViolations.push({
            ui,
            translation,
            uiFeature,
            translationFeature,
          });
        }
      }
    }
  }
  
  console.log(`Orphan UI identifiers: ${orphanUiIdentifiers.length}`);
  console.log(`Orphan translations: ${orphanTranslations.length}`);
  console.log(`Missing bindings: ${missingBindings.length}`);
  console.log(`Cross-feature violations: ${crossFeatureViolations.length}`);
  
  return {
    orphanUiIdentifiers,
    orphanTranslations,
    missingBindings,
    crossFeatureViolations,
  };
}

// ============================================================================
// OVERALL AUDIT RESULT
// ============================================================================

function calculateOverallResult(
  translationResult: TranslationScanResult,
  usageResult: ComponentUsageResult,
  orphanResult: OrphanDetectionResult
): OverallAuditResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let score = 100;
  
  // Check for missing language pairs
  if (translationResult.missingLanguagePairs.length > 0) {
    errors.push(`Missing language pairs: ${translationResult.missingLanguagePairs.join(', ')}`);
    score -= 10;
  }
  
  // Check for orphan UI identifiers
  if (orphanResult.orphanUiIdentifiers.length > 0) {
    warnings.push(`Orphan UI identifiers: ${orphanResult.orphanUiIdentifiers.length} found`);
    score -= 5;
  }
  
  // Check for orphan translations
  if (orphanResult.orphanTranslations.length > 0) {
    warnings.push(`Orphan translations: ${orphanResult.orphanTranslations.length} found`);
    score -= 5;
  }
  
  // Check for missing bindings
  if (orphanResult.missingBindings.length > 0) {
    errors.push(`Missing bindings: ${orphanResult.missingBindings.length} UI identifiers without translations`);
    score -= 15;
  }
  
  // Check for cross-feature violations
  if (orphanResult.crossFeatureViolations.length > 0) {
    errors.push(`Cross-feature violations: ${orphanResult.crossFeatureViolations.length} found`);
    score -= 20;
  }
  
  // Check for hardcoded text
  if (usageResult.hardcodedText.length > 0) {
    errors.push(`Hardcoded text: ${usageResult.hardcodedText.length} instances found`);
    score -= 10;
  }
  
  const pass = errors.length === 0 && score >= 70;
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score: Math.max(0, score),
    pass,
  };
}

// ============================================================================
// MAIN AUDIT FUNCTION
// ============================================================================

function main() {
  console.log('🚀 Starting Unified UI + i18n Audit...\n');
  
  try {
    const registryResult = scanUiRegistry();
    const translationResult = scanTranslations();
    const usageResult = scanComponentUsage();
    const bindingMatrix = buildBindingMatrix(registryResult, translationResult);
    const orphanResult = detectOrphans(registryResult, translationResult, usageResult);
    const overall = calculateOverallResult(
      translationResult,
      usageResult,
      orphanResult
    );
    
    const result: AuditResult = {
      phase1: registryResult,
      phase2: translationResult,
      phase3: usageResult,
      phase4: bindingMatrix,
      phase5: orphanResult,
      overall,
    };
    
    // Generate report
    generateReport(result);
    
    console.log(`\n${overall.pass ? '✅ AUDIT PASSED' : '❌ AUDIT FAILED'}`);
    console.log(`Score: ${overall.score}/100`);
    
    if (!overall.pass) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Audit failed:', error);
    process.exit(1);
  }
}

function generateReport(result: AuditResult): void {
  const report = `# Unified UI + i18n Audit Report

Generated: ${new Date().toISOString()}

## Executive Summary

**Overall Result: ${result.overall.pass ? '✅ PASS' : '❌ FAIL'}**
**Score: ${result.overall.score}/100**

## Phase 1: UI Registry Scan

- Total UI Identifiers: ${result.phase1.total}
- Features: ${Object.keys(result.phase1.byFeature).join(', ')}

## Phase 2: Translation Scan

- Total Translation Keys: ${result.phase2.total}
- Features: ${Object.keys(result.phase2.byFeature).join(', ')}

## Phase 3: Component Usage

- Used UI Identifiers: ${result.phase3.usedUiIdentifiers.size}
- Used Translation Keys: ${result.phase3.usedTranslationKeys.size}
- Hardcoded Text Instances: ${result.phase3.hardcodedText.length}

## Phase 4: Binding Matrix

| Feature | UI Elements | Translation Keys | Bindings | Orphans UI | Orphans Translation |
|----------|-------------|------------------|----------|------------|-------------------|
${result.phase4.byFeature.map(row => 
  `| ${row.feature} | ${row.uiElements} | ${row.translationKeys} | ${row.bindings} | ${row.orphansUi} | ${row.orphansTranslation} |`
).join('\n')}

## Phase 5: Orphan Detection

- Orphan UI Identifiers: ${result.phase5.orphanUiIdentifiers.length}
- Orphan Translations: ${result.phase5.orphanTranslations.length}
- Missing Bindings: ${result.phase5.missingBindings.length}
- Cross-Feature Violations: ${result.phase5.crossFeatureViolations.length}

## Errors

${result.overall.errors.length > 0 ? result.overall.errors.map(e => `- ${e}`).join('\n') : 'None'}

## Warnings

${result.overall.warnings.length > 0 ? result.overall.warnings.map(w => `- ${w}`).join('\n') : 'None'}
`;

  const outputPath = join(process.cwd(), 'docs', 'audits', 'unified-ui-i18n-audit.md');
  const fs = require('fs');
  fs.writeFileSync(outputPath, report, 'utf-8');
  
  console.log(`\n📄 Report generated: ${outputPath}`);
}

if (require.main === module) {
  main();
}

export { main as auditUnifiedUiI18n };
