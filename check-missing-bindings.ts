
import { 
  ALL_UI_IDENTIFIERS,
  NO_TRANSLATION_REQUIRED,
} from './src/platform/ui/registry/registry';
import { generateTranslationKeyFromUi } from './src/platform/ui/i18n/binding/registry-binding';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

function scanTranslations() {
  const featuresPath = join(process.cwd(), 'src', 'platform', 'ui', 'i18n', 'locales');

  const translationKeys = new Set<string>();
  const byFeature: Record<string, Set<string>> = {};
  const features = ['home', 'error-boundary', 'splash', 'shared-layout', 'auth', 'common', 'contact', 'dashboard', 'settings', 'signup'];
  for (const feature of features) {
    const enPath = join(featuresPath, feature, 'en.json');
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
  return { translationKeys, byFeature };
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

const { translationKeys } = scanTranslations();

console.log('ALL_UI_IDENTIFIERS: ', ALL_UI_IDENTIFIERS);
console.log('\n=== MISSING BINDINGS ===');
const missing = [];
for (const ui of ALL_UI_IDENTIFIERS) {
  if (NO_TRANSLATION_REQUIRED.includes(ui as any)) {
    continue;
  }
  const expected = generateTranslationKeyFromUi(ui);
  console.log('ui', ui, 'expected translation key', expected, 'exists', translationKeys.has(expected));
  if (!translationKeys.has(expected)) {
    missing.push({ ui, expected });
  }
}

console.log('\nMissing bindings list:');
console.log(missing);
