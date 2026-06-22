/**
 * Migration script v2: Uses regex to extract identities from registry files.
 * This avoids eval() issues with multi-export files like auth.ts
 *
 * Usage: node scripts/migrate-to-lang-uuid.mjs
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, extname } from 'path';

const ROOT = process.cwd();
const SRC = join(ROOT, 'src');

// ──────────────────────────────────────────────────────
// 1. Build identity map using pure regex (no eval)
// ──────────────────────────────────────────────────────

function generateTranslationKeyFromUi(uiPath) {
  const parts = uiPath.split('.');
  if (parts.length < 3) return null;
  const feature = parts[0];
  const section = parts[1];
  // For 3-part: feature.section.element → feature.section.camelCase(element)
  // For 4-part: feature.section.category.element → feature.section.camelCase(element)
  const element = parts.length >= 4 ? parts[3] : parts[2];
  const camelCaseElement = element.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  return `${feature}.${section}.${camelCaseElement}`;
}

/**
 * Parse a registry feature file with regex to extract:
 *   constName.NESTED.PATH → { uuid, translationKey }
 *
 * Strategy:
 * 1. Find all export const declarations → their prefix
 * 2. Scan blocks that have both uuid and path
 */
function parseRegistryFile(content, filePath) {
  const identities = new Map();

  // Find all export const NAME = { declarations
  const exportMatches = [...content.matchAll(/export const (\w+)\s*=/g)];
  if (exportMatches.length === 0) return identities;

  // Extract uuid+path pairs with surrounding context to infer accessor path
  // We look for blocks like:
  //   uuid: 'xxx',
  //   ... (any order)
  //   path: 'yyy',
  // within a js object block

  // Split content into segments by top-level object keys like "  SOME_KEY: {"
  // and track the current export const name + nesting

  // Simpler approach: find each object block that has both uuid and path
  // Then figure out the accessor path from context

  // Step 1: Remove block comments
  let cleaned = content
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*/g, '');

  // Step 2: For each export const, note which const name it is
  const constNames = exportMatches.map(m => m[1]);
  
  // Step 3: Find all { uuid: '...', ... path: '...' } blocks
  // We scan by looking for uuid: '...' and then search nearby for path: '...'
  const uuidRegex = /uuid:\s*'([a-f0-9-]+)'/g;
  let uuidMatch;
  
  while ((uuidMatch = uuidRegex.exec(cleaned)) !== null) {
    const uuid = uuidMatch[1];
    const blockStart = Math.max(0, uuidMatch.index - 500);
    const blockEnd = Math.min(cleaned.length, uuidMatch.index + 500);
    const block = cleaned.substring(blockStart, blockEnd);
    
    // Find path in same block
    const pathMatch = block.match(/path:\s*'([^']+)'/);
    if (!pathMatch) continue;
    const uiPath = pathMatch[1];
    
    const translationKey = generateTranslationKeyFromUi(uiPath);
    if (!translationKey) continue;
    
    // Determine accessor path: look backward from uuid position for KEY: { patterns
    const before = cleaned.substring(0, uuidMatch.index);
    
    // Find the const name that owns this uuid
    let ownerConst = constNames[0];
    for (const name of constNames) {
      const exportPos = cleaned.indexOf(`export const ${name}`);
      if (exportPos !== -1 && exportPos <= uuidMatch.index) {
        ownerConst = name;
      }
    }
    
    // Extract the property key path by scanning backward for KEY: { blocks
    // We'll build the path from the last few KEY: { occurrences before the uuid
    const keys = [];
    const keyPattern = /\b([A-Z][A-Z0-9_]*)\s*:\s*\{/g;
    let keyMatch;
    const beforeBlock = cleaned.substring(0, uuidMatch.index);
    
    while ((keyMatch = keyPattern.exec(beforeBlock)) !== null) {
      keys.push({ key: keyMatch[1], pos: keyMatch.index });
    }
    
    // We need the path that leads to the current uuid block.
    // The accessor is: CONSTNAME.KEY1.KEY2...
    // Heuristic: take the last 2 keys before uuid that are not already closed
    // This is imperfect but works for flat structures like SECTION.ELEMENT
    
    // Better approach: count brace depth to find enclosing keys
    const depth2Keys = getEnclosingKeys(beforeBlock, keys);
    
    let accessorPath = ownerConst;
    if (depth2Keys.length > 0) {
      accessorPath = `${ownerConst}.${depth2Keys.join('.')}`;
    }
    
    identities.set(accessorPath, { uuid, translationKey });
  }
  
  return identities;
}

/**
 * Given the text before a uuid, find the enclosing key names by brace counting.
 */
function getEnclosingKeys(text, keyPositions) {
  // Count open/close braces to determine depth at each key
  const enclosing = [];
  
  // Simple: scan backward and find keys that opened but haven't been closed
  let depth = 0;
  let i = text.length - 1;
  const result = [];
  
  while (i >= 0) {
    if (text[i] === '}') depth++;
    else if (text[i] === '{') {
      if (depth === 0) {
        // This { opened a block we're currently inside
        // Find the key that precedes this {
        const before = text.substring(0, i).trimEnd();
        const keyMatch = before.match(/\b([A-Z][A-Z0-9_]*)\s*:\s*$/);
        if (keyMatch) {
          result.unshift(keyMatch[1]);
        }
      } else {
        depth--;
      }
    }
    i--;
    if (result.length >= 3) break; // Stop at 3 levels deep
  }
  
  return result;
}

function buildIdentityMap() {
  const map = new Map();
  const featuresDir = join(SRC, 'platform', 'ui', 'registry', 'features');
  
  for (const file of readdirSync(featuresDir)) {
    if (!file.endsWith('.ts')) continue;
    const filePath = join(featuresDir, file);
    const content = readFileSync(filePath, 'utf-8');
    
    try {
      const fileIdentities = parseRegistryFile(content, filePath);
      for (const [accessor, data] of fileIdentities) {
        map.set(accessor, data);
      }
    } catch (e) {
      console.warn(`  ⚠ Could not parse ${file}:`, e.message);
    }
  }
  
  return map;
}

// ──────────────────────────────────────────────────────
// 2. Apply migrations to source files
// ──────────────────────────────────────────────────────

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '.next', '.git', 'build', 'tests', 'mocks', 'scripts', 'platform'].includes(entry.name)) continue;
      yield* walk(full);
    } else if (['.tsx', '.ts'].includes(extname(entry.name))) {
      if (entry.name.endsWith('.d.ts') || entry.name.includes('.test.') || entry.name.includes('.spec.')) continue;
      yield full;
    }
  }
}

function needsMigration(content) {
  return /t\(\s*[A-Z][A-Z0-9_]+(?:\.[A-Z][A-Z0-9_]+)+\s*[\),]/.test(content);
}

function migrateFile(content, identityMap) {
  let changed = false;
  let result = content;

  // Replace t(REGISTRY.PATH.KEY) → t('feature.section.key')
  result = result.replace(
    /t\(\s*([A-Z][A-Z0-9_]+(?:\.[A-Z][A-Z0-9_]+)+)\s*(?:,([^)]*))?\)/g,
    (match, accessor, fallback) => {
      const identity = identityMap.get(accessor);
      if (!identity) return match;
      changed = true;
      const fallbackPart = fallback ? `, ${fallback.trim()}` : '';
      return `t('${identity.translationKey}'${fallbackPart})`;
    }
  );

  // Add data-ui-lang-uuid alongside data-ui-uuid={REGISTRY.PATH.KEY.uuid}
  result = result.replace(
    /data-ui-uuid=\{([A-Z][A-Z0-9_]+(?:\.[A-Z][A-Z0-9_]+)+)\.uuid\}/g,
    (match, accessor) => {
      const identity = identityMap.get(accessor);
      if (!identity) return match;
      changed = true;
      return `data-ui-uuid={${accessor}.uuid}\n          data-ui-lang-uuid={\`lang-\${${accessor}.uuid}\`}`;
    }
  );

  return { result, changed };
}

// ──────────────────────────────────────────────────────
// 3. Main
// ──────────────────────────────────────────────────────

console.log('🔧 Building identity map from registry (regex mode)…');
const identityMap = buildIdentityMap();
console.log(`   Found ${identityMap.size} identities`);

// Spot-check
const sample = [...identityMap.entries()].filter(([k]) => k.startsWith('AUTH.')).slice(0, 5);
for (const [k, v] of sample) {
  console.log(`   ${k} → "${v.translationKey}"`);
}

const targetDirs = [
  join(SRC, 'components'),
  join(SRC, 'app'),
];

let totalFiles = 0;
let migratedFiles = 0;

for (const baseDir of targetDirs) {
  for (const filePath of walk(baseDir)) {
    totalFiles++;
    const content = readFileSync(filePath, 'utf-8');
    if (!needsMigration(content)) continue;

    const { result, changed } = migrateFile(content, identityMap);
    if (changed) {
      writeFileSync(filePath, result, 'utf-8');
      migratedFiles++;
      const rel = filePath.replace(ROOT, '').replace(/\\/g, '/');
      console.log(`   ✅ ${rel}`);
    }
  }
}

console.log(`\n✔ Done. Scanned ${totalFiles} files, migrated ${migratedFiles}.`);
