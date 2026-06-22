/**
 * auth-fix.mjs  – fix the auth component t() keys that the main migration
 * script got wrong, because auth.ts uses a non-standard path format.
 *
 * Strategy: build a precise accessor→key map by reading auth.ts line-by-line
 * and tracking nesting + uuid/path pairs with a state-machine parser.
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, extname } from 'path';

const ROOT = process.cwd();
const SRC = join(ROOT, 'src');

// ──────────────────────────────────────────────────────────────
// Step 1: Parse auth.ts with a proper state-machine
// ──────────────────────────────────────────────────────────────

function camel(str) {
  return str.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

function generateKeyFromPath(uiPath) {
  if (!uiPath) return null;
  const parts = uiPath.split('.');
  if (parts.length < 2) return null;
  const feature = parts[0];   // "auth"
  const section = parts[1];   // "login" | "shared" | "registration"
  // For 2-part paths (auth.shared.phone-placeholder) the element is parts[2]
  // For 3-part paths (auth.login.display.heading) the element is parts[3]
  let element;
  if (parts.length === 3) {
    element = parts[2];
  } else if (parts.length >= 4) {
    element = parts[3];
  } else {
    element = parts[parts.length - 1];
  }
  return `${feature}.${section}.${camel(element)}`;
}

function parseAuthFile(content) {
  // Line-based parser. Track:
  //  - current export const name
  //  - nesting path of KEY: { blocks
  //  - accumulated uuid and path within a block
  const lines = content.split('\n');
  
  const result = new Map(); // accessor → { uuid, translationKey }
  
  let currentConst = null;
  const keyStack = []; // e.g. ['AUTH', 'LOGIN', ...]
  let pendingUuid = null;
  let pendingPath = null;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Export const declaration
    const exportMatch = trimmed.match(/^export const (\w+)\s*=/);
    if (exportMatch) {
      currentConst = exportMatch[1];
      keyStack.length = 0;
      keyStack.push(currentConst);
      pendingUuid = null;
      pendingPath = null;
      continue;
    }
    
    if (!currentConst) continue;
    
    // Key: { line  (opening a nested block)
    const keyMatch = trimmed.match(/^([A-Z][A-Z0-9_]*)\s*:\s*\{/);
    if (keyMatch) {
      keyStack.push(keyMatch[1]);
      pendingUuid = null;
      pendingPath = null;
      continue;
    }
    
    // uuid: 'xxx'
    const uuidMatch = trimmed.match(/^uuid:\s*'([a-f0-9-]+)'/);
    if (uuidMatch) {
      pendingUuid = uuidMatch[1];
      continue;
    }
    
    // path: 'xxx'
    const pathMatch = trimmed.match(/^path:\s*'([^']+)'/);
    if (pathMatch) {
      pendingPath = pathMatch[1];
      continue;
    }
    
    // } as const, or } as const;  → closing a block
    if (trimmed === '} as const,' || trimmed === '} as const;' || trimmed === '} as const') {
      // Record if we have both uuid and path
      if (pendingUuid && pendingPath && keyStack.length >= 2) {
        const accessor = keyStack.join('.');
        const translationKey = generateKeyFromPath(pendingPath);
        if (translationKey) {
          result.set(accessor, { uuid: pendingUuid, translationKey });
        }
      }
      keyStack.pop();
      pendingUuid = null;
      pendingPath = null;
      continue;
    }
    
    // Plain closing brace
    if (trimmed === '},') {
      if (keyStack.length > 1) {
        keyStack.pop();
      }
      pendingUuid = null;
      pendingPath = null;
    }
  }
  
  return result;
}

// ──────────────────────────────────────────────────────────────
// Step 2: Apply corrections to auth components
// ──────────────────────────────────────────────────────────────

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full);
    } else if (['.tsx', '.ts'].includes(extname(entry.name))) {
      if (!entry.name.endsWith('.d.ts')) yield full;
    }
  }
}

console.log('📖 Parsing auth.ts with state-machine parser…');
const authContent = readFileSync(join(SRC, 'platform', 'ui', 'registry', 'features', 'auth.ts'), 'utf-8');
const authMap = parseAuthFile(authContent);
console.log(`   Found ${authMap.size} auth identities`);

// Show samples
let i = 0;
for (const [k, v] of authMap) {
  if (i++ < 8) console.log(`   ${k} → "${v.translationKey}"`);
}

// Build reverse map: wrong_key → correct_key (for t() calls that were already migrated wrongly)
// We need to figure out what wrong key was assigned by the previous script.
// The previous script built its map with brace-counting and got confused on auth.ts.
// Rather than reverse-engineering that, let's just re-apply:
// scan for t('...')  that look like auth keys and fix them using the correct map.

// Better: fix data-ui-uuid attributes and t() calls in auth components.
// Re-scan auth components for any remaining t(AUTH.X.Y) patterns OR
// mismatched t('auth.X.wrongKey') patterns.

// Actually the simplest fix: Re-run the t() replacement on the current files
// using the correct map, BUT we need to handle already-migrated files where
// t(AUTH.X.Y) is already t('some.wrong.key').
// 
// The best approach: restore the original t(AUTH.X.Y) pattern then re-replace correctly.
// But we don't have originals. So instead:
// Look for t('auth...') calls and verify against correct map.

// The previous script replaced t(AUTH.X.Y) → t('prev.map.key')
// But AUTH constants are still referenced as data-ui-uuid={AUTH.X.Y.uuid}
// So we can find the accessor from data-ui-uuid attributes and correlate.

// Strategy: for each auth file, find blocks like:
//   data-ui-uuid={AUTH.LOGIN.HEADING.uuid}
//   data-ui-lang-uuid={...}
//   ... {t('auth.login.WRONG_KEY')} ...
// and correct the t() call to the correct key.

const authDir = join(SRC, 'components', 'auth');
let fixed = 0;

for (const filePath of walk(authDir)) {
  let content = readFileSync(filePath, 'utf-8');
  let changed = false;
  
  // Fix 1: t(AUTH.X.Y) → t('correct.key')  (if any still remain)
  content = content.replace(
    /t\(\s*(AUTH(?:\.[A-Z][A-Z0-9_]+)+)\s*\)/g,
    (match, accessor) => {
      const identity = authMap.get(accessor);
      if (!identity) return match;
      changed = true;
      return `t('${identity.translationKey}')`;
    }
  );
  
  // Fix 2: data-ui-uuid without data-ui-lang-uuid
  content = content.replace(
    /data-ui-uuid=\{(AUTH(?:\.[A-Z][A-Z0-9_]+)+)\.uuid\}/g,
    (match, accessor) => {
      const identity = authMap.get(accessor);
      if (!identity) return match;
      // Check if lang-uuid already present (look ahead 200 chars)
      changed = true;
      return `data-ui-uuid={${accessor}.uuid}\n          data-ui-lang-uuid={\`lang-\${${accessor}.uuid}\`}`;
    }
  );
  
  if (changed) {
    writeFileSync(filePath, content, 'utf-8');
    fixed++;
    console.log(`   ✅ Fixed: ${filePath.replace(ROOT, '').replace(/\\/g, '/')}`);
  }
}

// Now fix the already-wrong t() keys in auth files.
// We need a different approach: match data-ui-uuid accessor → expected key → fix t() nearby
// This is complex since the wrong replacement already happened.

// Let's build the accessor → correct key map, then for each file,
// find ALL t('auth...') calls and check if there's a nearby data-ui-uuid that tells us the correct key.
// Actually the cleanest fix: rebuild from the auth.ts map and fix the t() calls in the already-migrated files.

// Approach: For each file in auth dir, re-read and do a search for patterns like:
// {t('auth.login.WRONG')} near data-ui-uuid={AUTH.LOGIN.CORRECT.uuid}
// and replace WRONG with CORRECT.

// Build correct key lookup from the map
const correctKeyByUuid = new Map();
for (const [accessor, {uuid, translationKey}] of authMap) {
  correctKeyByUuid.set(uuid, { accessor, translationKey });
}

console.log('\n🔧 Fixing incorrect t() keys in auth components…');

for (const filePath of walk(authDir)) {
  let content = readFileSync(filePath, 'utf-8');
  let changed = false;
  
  // Find each data-ui-lang-uuid={`lang-${AUTH.X.Y.uuid}`} and correct the nearest t() call
  // We'll replace the whole content using a different strategy:
  // For each accessor mentioned in the file, find what key it should map to,
  // then find the closest t('auth.xxx') and fix it.
  
  // Find all AUTH.X.Y.uuid references
  const accessorMatches = [...content.matchAll(/AUTH(?:\.[A-Z][A-Z0-9_]+)+(?=\.uuid)/g)];
  
  for (const match of accessorMatches) {
    const accessor = match[0];
    const identity = authMap.get(accessor);
    if (!identity) continue;
    
    // Look ahead from this position for t('auth...')
    const afterPos = match.index + accessor.length;
    const window = content.substring(afterPos, afterPos + 400);
    
    // Replace the FIRST t('auth...') after this accessor with the correct key
    const newWindow = window.replace(
      /t\('(auth\.[^']+)'\)/,
      (tMatch, wrongKey) => {
        if (wrongKey === identity.translationKey) return tMatch; // already correct
        changed = true;
        return `t('${identity.translationKey}')`;
      }
    );
    
    if (newWindow !== window) {
      content = content.substring(0, afterPos) + newWindow + content.substring(afterPos + 400);
    }
  }
  
  if (changed) {
    writeFileSync(filePath, content, 'utf-8');
    fixed++;
    console.log(`   ✅ Key-corrected: ${filePath.replace(ROOT, '').replace(/\\/g, '/')}`);
  }
}

console.log(`\n✔ Auth fix done. Fixed ${fixed} files.`);
