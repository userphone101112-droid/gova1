import { readdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface ValidationResult {
  feature: string;
  isValid: boolean;
  errors: string[];
}

interface TranslationStructure {
  [key: string]: string | TranslationStructure;
}

/**
 * Get all keys from a nested object as dot-notation paths
 */
function getObjectKeys(obj: TranslationStructure, prefix = ''): string[] {
  const keys: string[] = [];
  
  for (const key in obj) {
    const value = obj[key];
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null) {
      keys.push(...getObjectKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  
  return keys;
}

/**
 * Compare two translation structures and return differences
 */
function compareTranslations(
  en: TranslationStructure,
  ar: TranslationStructure,
  feature: string
): ValidationResult {
  const errors: string[] = [];
  
  const enKeys = new Set(getObjectKeys(en));
  const arKeys = new Set(getObjectKeys(ar));
  
  // Check for missing keys in Arabic
  for (const key of enKeys) {
    if (!arKeys.has(key)) {
      errors.push(`Missing key in ar.json: ${key}`);
    }
  }
  
  // Check for extra keys in Arabic
  for (const key of arKeys) {
    if (!enKeys.has(key)) {
      errors.push(`Extra key in ar.json (not in en.json): ${key}`);
    }
  }
  
  return {
    feature,
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Load translation file
 */
function loadTranslationFile(feature: string, locale: string): TranslationStructure | null {
  const localesPath = join(process.cwd(), 'src', 'platform', 'ui', 'i18n', 'locales');
  const filePath = join(localesPath, feature, `${locale}.json`);
  
  if (!existsSync(filePath)) {
    return null;
  }
  
  try {
    const content = readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error loading ${filePath}:`, error);
    return null;
  }
}

/**
 * Validate all feature translations
 */
function validateAllTranslations(): ValidationResult[] {
  const localesPath = join(process.cwd(), 'src', 'platform', 'ui', 'i18n', 'locales');
  const results: ValidationResult[] = [];
  
  if (!existsSync(localesPath)) {
    console.error('Locales directory not found');
    return results;
  }
  
  const features = readdirSync(localesPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  for (const feature of features) {
    const enTranslations = loadTranslationFile(feature, 'en');
    const arTranslations = loadTranslationFile(feature, 'ar');
    
    if (!enTranslations || !arTranslations) {
      results.push({
        feature,
        isValid: false,
        errors: [
          !enTranslations ? 'Missing en.json' : '',
          !arTranslations ? 'Missing ar.json' : '',
        ].filter(Boolean),
      });
      continue;
    }
    
    const comparison = compareTranslations(enTranslations, arTranslations, feature);
    results.push(comparison);
  }
  
  return results;
}

/**
 * Main validation function
 */
function main() {
  console.log('🔍 Validating translations...\n');
  
  const results = validateAllTranslations();
  
  let hasErrors = false;
  
  for (const result of results) {
    if (!result.isValid) {
      hasErrors = true;
      console.error(`❌ ${result.feature}:`);
      for (const error of result.errors) {
        console.error(`   - ${error}`);
      }
      console.error('');
    } else {
      console.log(`✅ ${result.feature}: Valid`);
    }
  }
  
  if (hasErrors) {
    console.error('\n❌ Translation validation failed!');
    console.error('Please fix the errors above before committing or building.');
    process.exit(1);
  } else {
    console.log('\n✅ All translations are valid!');
    process.exit(0);
  }
}

// Run validation if called directly
if (require.main === module) {
  main();
}

export { validateAllTranslations, compareTranslations };
