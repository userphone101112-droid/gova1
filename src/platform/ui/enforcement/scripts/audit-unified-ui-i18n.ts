import { readFileSync, readdirSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';

import { 
  generateTranslationKeyFromUi,
  extractFeatureFromUiIdentifier,
  isCategoryUiPath,
} from '../../i18n/binding/registry-binding';
import * as categories from '../../registry/categories';
import {
  HOME,
  ERROR_BOUNDARY,
  SPLASH,
  SHARED_LAYOUT,
  ALL_UI_IDENTIFIERS,
  ALL_UI_IDENTITIES,
  AUTH,
  UI_REGISTRY,
  isTranslationRequiredForUiIdentity,
} from '../../registry/registry';

const REGISTRY_SOURCES = {
  HOME,
  ERROR_BOUNDARY,
  SPLASH,
  SHARED_LAYOUT,
  AUTH,
};

function buildRegistryPathToIdentity(): Map<string, (typeof ALL_UI_IDENTITIES)[number]> {
  const map = new Map<string, (typeof ALL_UI_IDENTITIES)[number]>();

  function isIdentity(obj: unknown): obj is (typeof ALL_UI_IDENTITIES)[number] {
    return Boolean(obj && typeof obj === 'object' && 'id' in obj && 'path' in obj);
  }

  function walk(obj: unknown, prefix: string[]) {
    if (isIdentity(obj)) {
      map.set(prefix.join('.'), obj);
      return;
    }
    if (obj && typeof obj === 'object') {
      for (const [key, value] of Object.entries(obj)) {
        walk(value, [...prefix, key]);
      }
    }
  }

  const roots: Record<string, unknown> = {
    ...UI_REGISTRY,
    COMMON_LAYOUT: categories.COMMON_LAYOUT,
    COMMON_FORMS: categories.COMMON_FORMS,
    COMMON_TYPOGRAPHY: categories.COMMON_TYPOGRAPHY,
    COMMON_MEDIA: categories.COMMON_MEDIA,
    COMMON_COMPONENTS: categories.COMMON_COMPONENTS,
    COMMON_TABLES: categories.COMMON_TABLES,
    COMMON_LISTS: categories.COMMON_LISTS,
    COMMON_INTERACTIVE: categories.COMMON_INTERACTIVE,
    COMMON_TEMPLATE: categories.COMMON_TEMPLATE,
    COMMON_SPACING: categories.COMMON_SPACING,
    DECORATIVE: categories.DECORATIVE,
  };

  for (const [root, tree] of Object.entries(roots)) {
    if (tree) walk(tree, [root]);
  }

  return map;
}

const REGISTRY_PATH_TO_IDENTITY = buildRegistryPathToIdentity();

function indexIdentityUsage(
  identity: (typeof ALL_UI_IDENTITIES)[number],
  filePath: string,
  content: string,
  matchIndex: number,
  state: ComponentUsageResult
): void {
  state.usedUiIdentifiers.add(identity.path);
  if (!state.uiUsageByFile[filePath]) {
    state.uiUsageByFile[filePath] = [];
  }
  state.uiUsageByFile[filePath].push(identity.path);

  const relativePath = filePath.replace(process.cwd(), '').replace(/\\/g, '/');
  const componentName = getComponentName(content, filePath);
  const lineNo = content.slice(0, matchIndex).split('\n').length;
  const sourceLocation = {
    uuid: identity.uuid || '',
    id: identity.id,
    path: identity.path,
    lifecycle: identity.lifecycle ?? (identity.deprecated ? 'deprecated' : 'active'),
    sourceFile: relativePath,
    sourceComponent: componentName,
    sourceLine: lineNo,
    feature: identity.feature,
  };
  sourceMappings[identity.id] = sourceLocation;
  // Only add to UUID map if identity has a UUID
  if (identity.uuid) {
    sourceMappingsByUuid[identity.uuid] = sourceLocation;
  }
}

const sourceMappings: Record<string, any> = {};
const sourceMappingsByUuid: Record<string, any> = {};

function writeFileWithRetry(filePath: string, content: string, attempts = 5): void {
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      writeFileSync(filePath, content, 'utf-8');
      return;
    } catch (error) {
      lastError = error;
      const waitUntil = Date.now() + 200;
      while (Date.now() < waitUntil) {
        // brief backoff for transient Windows file locks
      }
    }
  }
  throw lastError;
}

function getComponentName(content: string, filePath: string): string {
  const exportFuncMatch = content.match(/export\s+function\s+([A-Za-z0-9_]+)/);
  if (exportFuncMatch) return exportFuncMatch[1];
  const exportConstMatch = content.match(/export\s+const\s+([A-Za-z0-9_]+)/);
  if (exportConstMatch) return exportConstMatch[1];
  const base = filePath.split(/[/\\]/).pop() || '';
  return base.replace(/\.(tsx|ts)$/, '');
}

function getReferenceVariants(sources: Record<string, any>): Record<string, string[]> {
  const map: Record<string, string[]> = {};
  const leafCounts: Record<string, number> = {};

  function isIdentity(obj: any): boolean {
    return obj && typeof obj === 'object' && 'id' in obj && 'path' in obj;
  }

  function countLeaves(current: any, leaf: string) {
    if (isIdentity(current)) {
      leafCounts[leaf] = (leafCounts[leaf] || 0) + 1;
    } else if (typeof current === 'object' && current !== null) {
      for (const [key, value] of Object.entries(current)) {
        countLeaves(value, key);
      }
    }
  }
  for (const [key, val] of Object.entries(sources)) {
    countLeaves(val, key);
  }

  function traverse(current: any, path: string[]) {
    if (isIdentity(current)) {
      const leaf = path[path.length - 1];
      const fullPath = path.join('.');
      const value = current.path;
      const variants = [
        value,
        fullPath,
      ];
      if (leafCounts[leaf] === 1) {
        variants.push(leaf);
        variants.push(`'${leaf}'`);
        variants.push(`"${leaf}"`);
        variants.push(`\`${leaf}\``);
      }
      map[value] = [...new Set(variants)];
    } else if (typeof current === 'object' && current !== null) {
      for (const [key, value] of Object.entries(current)) {
        traverse(value, [...path, key]);
      }
    }
  }

  for (const [key, val] of Object.entries(sources)) {
    traverse(val, [key]);
  }
  return map;
}

const UI_REFERENCE_VARIANTS = getReferenceVariants(REGISTRY_SOURCES);

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
  strictViolations: string[];
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
  
  const uniqueIdentifiers = [...ALL_UI_IDENTIFIERS];
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
  
  const featuresPath = join(process.cwd(), 'src', 'platform', 'ui', 'i18n', 'locales');
  
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
    const enPath = join(featuresPath, feature, 'en.json');
    const arPath = join(featuresPath, feature, 'ar.json');
    
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
        const keys = extractTranslationKeys(translations, '');
        
        byFeature[feature] = keys;
        keys.forEach(key => translationKeys.add(key));
      } catch (error) {
        console.error(`Error loading ${enPath}:`, error);
      }
    }
  }
  
  // Also scan common translations
  const commonEnPath = join(featuresPath, 'common', 'en.json');
  if (existsSync(commonEnPath)) {
    try {
      const content = readFileSync(commonEnPath, 'utf-8');
      const translations = JSON.parse(content);
      const keys = extractTranslationKeys(translations, '');
      
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

function findFeatureOfTranslationKey(
  key: string,
  byFeature: Record<string, Set<string>>
): string | null {
  for (const [feature, keys] of Object.entries(byFeature)) {
    if (keys.has(key)) {
      return feature;
    }
  }
  return null;
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
  const strictViolations: string[] = [];
  
  // Scan all TypeScript and TSX files
  scanDirectory(srcPath, {
    usedUiIdentifiers,
    usedTranslationKeys,
    uiUsageByFile,
    translationUsageByFile,
    hardcodedText,
    strictViolations,
  });
  
  console.log(`Found ${usedUiIdentifiers.size} used UI identifiers`);
  console.log(`Found ${usedTranslationKeys.size} used translation keys`);
  console.log(`Found ${hardcodedText.length} hardcoded text instances`);
  console.log(`Found ${strictViolations.length} strict UI violations`);
  
  return {
    usedUiIdentifiers,
    usedTranslationKeys,
    uiUsageByFile,
    translationUsageByFile,
    hardcodedText,
    strictViolations,
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
      if (item.name === 'node_modules' || item.name === '.next' || item.name === 'build' || item.name === 'tests' || item.name === 'mocks') {
        continue;
      }
      scanDirectory(fullPath, state);
    } else if (item.name.endsWith('.tsx') || item.name.endsWith('.ts')) {
      // Skip declarations, test files, and the registry itself
      if (item.name.endsWith('.d.ts') || item.name.endsWith('.test.ts') || item.name.endsWith('.spec.ts') || item.name.endsWith('.test.tsx') || item.name.endsWith('.spec.tsx')) {
        continue;
      }
      if (item.name === 'public-api.ts' || item.name === 'registry.ts' || item.name === 'registry-binding.ts' || item.name === 'source-index.ts' || item.name === 'test-helpers.ts') {
        continue;
      }
      scanFile(fullPath, state);
    }
  }
}

function scanFile(filePath: string, state: ComponentUsageResult): void {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    // Extract UI identifier usage using reference variants
    ALL_UI_IDENTIFIERS.forEach(identifier => {
      const variants = UI_REFERENCE_VARIANTS[identifier] || [identifier];
      const isUsed = variants.some(variant => content.includes(variant));
      
      if (isUsed) {
        state.usedUiIdentifiers.add(identifier);
        if (!state.uiUsageByFile[filePath]) {
          state.uiUsageByFile[filePath] = [];
        }
        state.uiUsageByFile[filePath].push(identifier);

        // Phase 3: Add to source mapping index
        const identity = ALL_UI_IDENTITIES.find(id => id.path === identifier);
        if (identity) {
          const relativePath = filePath.replace(process.cwd(), '').replace(/\\/g, '/');
          const componentName = getComponentName(content, filePath);
          
          let sourceLine = 1;
          for (let i = 0; i < lines.length; i++) {
            if (variants.some(variant => lines[i].includes(variant))) {
              sourceLine = i + 1;
              break;
            }
          }

          const sourceLocation = {
            uuid: identity.uuid || '',
            id: identity.id,
            path: identity.path,
            lifecycle: identity.lifecycle ?? (identity.deprecated ? 'deprecated' : 'active'),
            sourceFile: relativePath,
            sourceComponent: componentName,
            sourceLine,
            feature: identity.feature
          };
          sourceMappings[identity.id] = sourceLocation;
          // Only add to UUID map if identity has a UUID
          if (identity.uuid) {
            sourceMappingsByUuid[identity.uuid] = sourceLocation;
          }
        }
      }
    });
    
    // Extract translation key usage
    const translationRegex = /t\(['"]([^'"]+)['"]\)/g;
    let match;
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

    // Strict coverage: no legacy Ui* factory components; data-ui-uuid must use registry refs
    if (!filePath.endsWith('.tsx')) {
      return;
    }

    const legacyUiRegex = /<(Ui[A-Z][a-zA-Z0-9]*)\b/g;
    let legacyMatch;
    while ((legacyMatch = legacyUiRegex.exec(content)) !== null) {
      const relativePath = filePath.replace(process.cwd(), '').replace(/\\/g, '/');
      const lineNo = content.slice(0, legacyMatch.index).split('\n').length;
      state.strictViolations.push(
        `Strict Coverage Violation: Legacy factory component <${legacyMatch[1]}> in "${relativePath}:${lineNo}". Use native elements with data-ui-uuid={IDENTITY.uuid}.`
      );
    }

    const rawUuidLineRegex = /data-ui-uuid\s*=\s*(?:["']([^"']+)["']|\{\s*["']([^"']+)["']\s*\})/;
    lines.forEach((line, i) => {
      if (line.includes('querySelector') || line.includes('getAttribute')) return;
      const rawMatch = line.match(rawUuidLineRegex);
      if (rawMatch) {
        const relativePath = filePath.replace(process.cwd(), '').replace(/\\/g, '/');
        const raw = rawMatch[1] || rawMatch[2];
        state.strictViolations.push(
          `Strict Coverage Violation: data-ui-uuid uses raw string "${raw}" in "${relativePath}:${i + 1}". Use a registry identity reference: data-ui-uuid={HOME.X.uuid}.`
        );
      }
    });

    // Index source locations from data-ui-uuid={REF.uuid}
    const uuidRefRegex = /data-ui-uuid=\{([A-Z_][A-Z0-9_.]*)\.uuid\}/g;
    let uuidRefMatch;
    while ((uuidRefMatch = uuidRefRegex.exec(content)) !== null) {
      const identity = REGISTRY_PATH_TO_IDENTITY.get(uuidRefMatch[1]);
      if (identity) {
        indexIdentityUsage(identity, filePath, content, uuidRefMatch.index, state);
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
    const mismatches = 0;
    
    for (const ui of uiIdentifiers) {
      if (!isTranslationRequiredForUiIdentity(ui) || isCategoryUiPath(ui)) {
        bindings++;
        continue;
      }
      const expectedKey = generateTranslationKeyFromUi(ui);
      if (translationKeys.has(expectedKey)) {
        bindings++;
      } else {
        orphansUi++;
      }
    }
    
    for (const key of translationKeys) {
      const hasMatchingUi = uiIdentifiers.some(ui => {
        if (!isTranslationRequiredForUiIdentity(ui) || isCategoryUiPath(ui)) {
          return false;
        }
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
      const feature = findFeatureOfTranslationKey(key, translationResult.byFeature);
      if (feature !== 'common') {
        orphanTranslations.push(key);
      }
    }
  }
  
  // Find missing bindings (UI without corresponding translation)
  for (const ui of registryResult.uiIdentifiers) {
    if (!isTranslationRequiredForUiIdentity(ui) || isCategoryUiPath(ui)) {
      continue;
    }
    const expectedKey = generateTranslationKeyFromUi(ui);
    if (!translationResult.translationKeys.has(expectedKey)) {
      missingBindings.push(ui);
    }
  }
  
  // Detect cross-feature violations
  // Allow shared translations between home, splash, and shared-layout features
  const allowedSharedFeatures = ['home', 'splash', 'shared-layout', 'common'];
  
  for (const file in usageResult.uiUsageByFile) {
    const uiIdentifiers = usageResult.uiUsageByFile[file];
    const translationKeys = usageResult.translationUsageByFile[file] || [];
    
    for (const ui of uiIdentifiers) {
      const uiFeature = extractFeatureFromUiIdentifier(ui);
      
      for (const translation of translationKeys) {
        const translationFeature = findFeatureOfTranslationKey(translation, translationResult.byFeature);

        if (!translationFeature) {
          continue;
        }
        
        // Allow cross-feature usage if both features are in the allowed shared list
        const isAllowedShared = allowedSharedFeatures.includes(uiFeature) && 
                                allowedSharedFeatures.includes(translationFeature);
        
        if (uiFeature !== translationFeature && translationFeature !== 'common' && !isAllowedShared) {
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
  if (missingBindings.length > 0) {
    console.log('Missing bindings list:', JSON.stringify(missingBindings, null, 2));
  }
  console.log(`Cross-feature violations: ${crossFeatureViolations.length}`);
  if (crossFeatureViolations.length > 0) {
    console.log('Cross-feature violations list:', JSON.stringify(crossFeatureViolations, null, 2));
  }
  
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

  // Check strict UI violations — HARD FAILURE: build must stop
  if (usageResult.strictViolations && usageResult.strictViolations.length > 0) {
    usageResult.strictViolations.forEach(violation => errors.push(violation));
    score -= 20;
  }

  // Check for missing language pairs — HARD FAILURE
  if (translationResult.missingLanguagePairs.length > 0) {
    errors.push(`Missing language pairs: ${translationResult.missingLanguagePairs.join(', ')}`);
    score -= 10;
  }

  // Check for missing bindings — HARD FAILURE (UI identity without translation)
  if (orphanResult.missingBindings.length > 0) {
    errors.push(`Missing bindings: ${orphanResult.missingBindings.length} UI identifiers without translations`);
    score -= 15;
  }

  // Check for cross-feature violations — HARD FAILURE
  if (orphanResult.crossFeatureViolations.length > 0) {
    errors.push(`Cross-feature violations: ${orphanResult.crossFeatureViolations.length} found`);
    score -= 20;
  }

  // Orphan UI identifiers — WARNING only (registered but unused; expected during migration)
  if (orphanResult.orphanUiIdentifiers.length > 0) {
    warnings.push(`Orphan UI identifiers: ${orphanResult.orphanUiIdentifiers.length} found (registered but not used in code yet)`);
    score -= 2;
  }

  // Orphan translations — WARNING only (features not yet migrated to UI identity platform)
  if (orphanResult.orphanTranslations.length > 0) {
    warnings.push(`Orphan translations: ${orphanResult.orphanTranslations.length} found (features pending UI identity migration)`);
    // No score deduction — migration is in progress
  }

  // Hardcoded text — WARNING only (may be intentional brand/icon text)
  if (usageResult.hardcodedText.length > 0) {
    warnings.push(`Hardcoded text: ${usageResult.hardcodedText.length} instance(s) found — review if intentional`);
    score -= 2;
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
// SOURCE INDEX CHECK (CI check-only — no writes)
// ============================================================================

export function buildSourceIndexByUuidForCheck(): Record<string, unknown> {
  for (const key of Object.keys(sourceMappings)) delete sourceMappings[key];
  for (const key of Object.keys(sourceMappingsByUuid)) delete sourceMappingsByUuid[key];
  scanComponentUsage();
  return { ...sourceMappingsByUuid };
}

function extractJsonExport(content: string, exportName: string): Record<string, unknown> {
  const marker = `export const ${exportName}`;
  const start = content.indexOf(marker);
  if (start === -1) {
    throw new Error(`Missing export ${exportName} in source-index.ts`);
  }
  const eq = content.indexOf('=', start);
  const open = content.indexOf('{', eq);
  if (open === -1) {
    throw new Error(`Malformed export ${exportName}`);
  }

  let depth = 0;
  for (let i = open; i < content.length; i++) {
    if (content[i] === '{') depth += 1;
    else if (content[i] === '}') {
      depth -= 1;
      if (depth === 0) {
        return JSON.parse(content.slice(open, i + 1));
      }
    }
  }
  throw new Error(`Unterminated JSON for ${exportName}`);
}

function checkSourceIndexOnly(): void {
  const sourceIndexPath = join(process.cwd(), 'src', 'platform', 'ui', 'registry', 'source-index.ts');
  const onDisk = readFileSync(sourceIndexPath, 'utf-8');
  const onDiskByUuid = extractJsonExport(onDisk, 'UI_SOURCE_INDEX_BY_UUID');
  const freshByUuid = buildSourceIndexByUuidForCheck();

  if (JSON.stringify(onDiskByUuid) !== JSON.stringify(freshByUuid)) {
    console.error('❌ source-index.ts is stale. Run: npm run audit:unified-ui-i18n');
    process.exit(1);
  }

  console.log(`✅ source-index.ts is up to date (${Object.keys(freshByUuid).length} entries)`);
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

    // Phase 3: Write source index file
    const sourceIndexPath = join(process.cwd(), 'src', 'platform', 'ui', 'registry', 'source-index.ts');
    const indexContent = `/**
 * Automatically generated by audit-unified-ui-i18n.ts.
 * Do not edit this file manually.
 */

export interface UiSourceLocation {
  uuid: string;
  id: string;
  path: string;
  lifecycle: 'active' | 'deprecated' | 'removed';
  sourceFile: string;
  sourceComponent: string;
  sourceLine: number;
  feature: string;
}

export const UI_SOURCE_INDEX_BY_UUID: Record<string, UiSourceLocation> = ${JSON.stringify(sourceMappingsByUuid, null, 2)};

export const UI_SOURCE_INDEX: Record<string, UiSourceLocation> = ${JSON.stringify(sourceMappings, null, 2)};
`;
    writeFileWithRetry(sourceIndexPath, indexContent);
    console.log(`📄 Generated source index: ${sourceIndexPath}`);

    // Phase 6: Generate identity-audit.md
    const identityErrors: string[] = [];
    const identityWarnings: string[] = [];

    // Check duplicate Stable IDs
    const seenIds = new Set<string>();
    const duplicateIds = new Set<string>();
    ALL_UI_IDENTITIES.forEach(id => {
      if (seenIds.has(id.id)) duplicateIds.add(id.id);
      seenIds.add(id.id);
    });
    if (duplicateIds.size > 0) {
      identityErrors.push(`Duplicate Stable IDs found in registry: ${Array.from(duplicateIds).join(', ')}`);
    }

    // Check duplicate Paths
    const seenPaths = new Set<string>();
    const duplicatePaths = new Set<string>();
    ALL_UI_IDENTITIES.forEach(id => {
      if (seenPaths.has(id.path)) duplicatePaths.add(id.path);
      seenPaths.add(id.path);
    });
    if (duplicatePaths.size > 0) {
      identityErrors.push(`Duplicate Paths found in registry: ${Array.from(duplicatePaths).join(', ')}`);
    }

    // Check metadata validity
    const validCategories = ['action', 'input', 'navigation', 'display', 'container'];
    ALL_UI_IDENTITIES.forEach(id => {
      if (!id.id) {
        identityErrors.push(`UI Identity path "${id.path}" has missing or empty Stable ID.`);
      }
      if (!id.description) {
        identityErrors.push(`UI Identity "${id.id}" has missing or empty description.`);
      }
      if (!id.feature) {
        identityErrors.push(`UI Identity "${id.id}" has missing or empty feature ownership.`);
      }
      if (!id.category || !validCategories.includes(id.category)) {
        identityErrors.push(`UI Identity "${id.id}" has invalid category: "${id.category}". Valid categories are: ${validCategories.join(', ')}`);
      }
    });

    // Check Orphans (unused IDs) - only check UUID-backed identities
    const orphansList: string[] = [];
    ALL_UI_IDENTITIES.forEach(id => {
      if (id.uuid && !sourceMappingsByUuid[id.uuid]) {
        orphansList.push(id.id);
        identityWarnings.push(`Orphan UI Identity: "${id.id}" (registered but not used in code).`);
      }
    });

    const identityAuditReport = `# UI Identity Platform Audit Report

Generated: ${new Date().toISOString()}

## Summary
- Total Registered Identities: ${ALL_UI_IDENTITIES.length}
- Mapped to Code: ${Object.keys(sourceMappings).length}
- Orphan/Unused Identities: ${orphansList.length}
- Status: ${identityErrors.length === 0 ? '✅ PASS' : '❌ FAIL'}

## Errors (${identityErrors.length})
${identityErrors.length > 0 ? identityErrors.map(e => `- 🔴 ${e}`).join('\n') : '- No identity errors found.'}

## Warnings (${identityWarnings.length})
${identityWarnings.length > 0 ? identityWarnings.map(w => `- 🟡 ${w}`).join('\n') : '- No identity warnings found.'}

## Mapped Source Registry
| UUID | Stable ID | Path | Lifecycle | Feature | Source File | Component | Line |
|------|-----------|------|-----------|---------|-------------|-----------|------|
${Object.values(sourceMappingsByUuid).map((m: any) => `| \`${m.uuid}\` | \`${m.id}\` | \`${m.path}\` | \`${m.lifecycle}\` | \`${m.feature}\` | [${m.sourceFile}](file:///${join(process.cwd(), m.sourceFile).replace(/\\/g, '/')}) | \`${m.sourceComponent}\` | \`${m.sourceLine}\` |`).join('\n')}
`;

    const identityReportPath = join(process.cwd(), 'docs', 'audits', 'identity-audit.md');
    writeFileWithRetry(identityReportPath, identityAuditReport);
    console.log(`📄 Generated identity audit report: ${identityReportPath}`);
    
    console.log(`\n${overall.pass && identityErrors.length === 0 ? '✅ AUDIT PASSED' : '❌ AUDIT FAILED'}`);
    console.log(`Score: ${overall.score}/100`);
    
    if (!overall.pass || identityErrors.length > 0) {
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
  if (process.argv.includes('--check-source-index')) {
    checkSourceIndexOnly();
  } else {
    main();
  }
}

export { main as auditUnifiedUiI18n };
