import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import {
  ALL_UI_IDENTIFIERS,
  isTranslationRequiredForUiIdentity,
} from '../../registry/registry';
import {
  generateTranslationKeyFromUi,
  isCategoryUiPath,
} from '../../i18n/binding/registry-binding';

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

  for (const ui of ALL_UI_IDENTIFIERS) {
    if (isCategoryUiPath(ui) || !isTranslationRequiredForUiIdentity(ui)) {
      continue;
    }

    required.add(generateTranslationKeyFromUi(ui));
  }

  return required;
}

export function validateRegistryBindings(): {
  isValid: boolean;
  missing: Array<{ ui: string; expectedKey: string }>;
} {
  const availableKeys = loadAllTranslationKeys();
  const missing: Array<{ ui: string; expectedKey: string }> = [];

  for (const ui of ALL_UI_IDENTIFIERS) {
    if (isCategoryUiPath(ui) || !isTranslationRequiredForUiIdentity(ui)) {
      continue;
    }

    const expectedKey = generateTranslationKeyFromUi(ui);
    if (!availableKeys.has(expectedKey)) {
      missing.push({ ui, expectedKey });
    }
  }

  return {
    isValid: missing.length === 0,
    missing,
  };
}

function main() {
  console.log('🔗 Validating UI registry → translation bindings...\n');

  const { isValid, missing } = validateRegistryBindings();

  if (!isValid) {
    console.error(`❌ ${missing.length} missing registry binding(s):\n`);
    for (const entry of missing) {
      console.error(`   UI path: ${entry.ui}`);
      console.error(`   Expected translation key: "${entry.expectedKey}"`);
      console.error('');
    }
    console.error(
      'Add the missing keys to src/platform/ui/i18n/locales/<feature>/en.json and ar.json'
    );
    console.error('Key shape follows generateTranslationKeyFromUi (page.section.camelCaseElement).');
    process.exit(1);
  }

  console.log(`✅ All ${ALL_UI_IDENTIFIERS.length} registry identities have bound translations.`);
}

if (require.main === module) {
  main();
}
