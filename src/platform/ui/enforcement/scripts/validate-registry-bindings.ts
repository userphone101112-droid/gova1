import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

function flattenTranslationKeys(
  obj: Record<string, unknown>,
  prefix = '',
  keys = new Set<string>()
): Set<string> {
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      flattenTranslationKeys(value as Record<string, unknown>, fullKey, keys);
    } else {
      keys.add(fullKey);
    }
  }

  return keys;
}

export function loadAllTranslationKeys(): Set<string> {
  const keys = new Set<string>();
  const localesPath = join(process.cwd(), 'src', 'platform', 'ui', 'i18n', 'locales');

  if (!existsSync(localesPath)) {
    return keys;
  }

  for (const entry of readdirSync(localesPath, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;

    for (const locale of ['en', 'ar'] as const) {
      const filePath = join(localesPath, entry.name, `${locale}.json`);
      if (!existsSync(filePath)) continue;

      const content = JSON.parse(readFileSync(filePath, 'utf-8')) as Record<string, unknown>;
      flattenTranslationKeys(content, '', keys);
    }
  }

  return keys;
}

export function getRequiredRegistryBindingKeys(): Set<string> {
  const required = new Set<string>();
  const srcDir = join(process.cwd(), 'src');

  function scanDir(dir: string) {
    for (const item of readdirSync(dir, { withFileTypes: true })) {
      const fullPath = join(dir, item.name);
      if (item.isDirectory()) {
        if (['node_modules', '.next', 'build', 'tests', 'mocks'].includes(item.name)) continue;
        scanDir(fullPath);
      } else if (/\.(tsx|ts)$/.test(item.name)) {
        if (
          item.name.endsWith('.d.ts') ||
          item.name.endsWith('.test.ts') ||
          item.name.endsWith('.spec.ts') ||
          item.name.endsWith('.test.tsx') ||
          item.name.endsWith('.spec.tsx')
        ) {
          continue;
        }
        scanFile(fullPath);
      }
    }
  }

  function scanFile(filePath: string) {
    const content = readFileSync(filePath, 'utf-8');
    const langUuidRegex = /data-ui-lang-uuid=["'](lang-[a-f0-9-]+)["']/g;
    let match;
    
    while ((match = langUuidRegex.exec(content)) !== null) {
      const uuid = match[1];
      const matchIndex = match.index;
      const start = Math.max(0, matchIndex - 100);
      const end = Math.min(content.length, matchIndex + 400);
      const contextText = content.substring(start, end);
      
      const tCallRegex = /t\(\s*['"`]([^'"`]+)['"`]/g;
      let tMatch;
      while ((tMatch = tCallRegex.exec(contextText)) !== null) {
        const key = tMatch[1];
        if (key && !key.startsWith('common.')) {
          required.add(key);
        }
      }
    }
  }

  if (existsSync(srcDir)) {
    scanDir(srcDir);
  }

  return required;
}

export function validateRegistryBindings(): {
  isValid: boolean;
  missing: Array<{ ui: string; expectedKey: string }>;
} {
  const availableKeys = loadAllTranslationKeys();
  const requiredKeys = getRequiredRegistryBindingKeys();
  const missing: Array<{ ui: string; expectedKey: string }> = [];

  for (const key of requiredKeys) {
    if (!availableKeys.has(key)) {
      missing.push({ ui: `Element with key: ${key}`, expectedKey: key });
    }
  }

  return {
    isValid: missing.length === 0,
    missing,
  };
}

function main() {
  console.log('🔗 Validating UI translation bindings...\n');

  const { isValid, missing } = validateRegistryBindings();

  if (!isValid) {
    console.error(`❌ ${missing.length} missing translation binding(s):\n`);
    for (const entry of missing) {
      console.error(`   UI path: ${entry.ui}`);
      console.error(`   Expected translation key: "${entry.expectedKey}"`);
      console.error('');
    }
    console.error(
      'Add the missing keys to src/platform/ui/i18n/locales/<feature>/en.json and ar.json'
    );
    process.exit(1);
  }

  console.log(`✅ All translation identities have bound translations.`);
}

if (require.main === module) {
  main();
}

