import { readdirSync, readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import {
  ALL_UI_IDENTITIES,
  isTranslationRequiredForUiIdentity,
} from '../../registry/registry';
import { generateTranslationKeyFromUi } from '../../i18n/binding/registry-binding';

interface TranslationStructure {
  [key: string]: string | TranslationStructure;
}

function getNonTextTranslationKeys(): Set<string> {
  return new Set(
    ALL_UI_IDENTITIES
      .filter((identity) => !isTranslationRequiredForUiIdentity(identity))
      .map((identity) => generateTranslationKeyFromUi(identity.path))
  );
}

/**
 * Generate TypeScript type from translation structure
 */
function generateTypeFromStructure(
  obj: TranslationStructure,
  prefix = '',
  ignoredKeys = new Set<string>()
): string {
  let typeDefinition = '';
  
  for (const key in obj) {
    const value = obj[key];
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null) {
      // Nested object - generate nested type
      typeDefinition += generateTypeFromStructure(value, fullKey, ignoredKeys);
    } else {
      if (ignoredKeys.has(fullKey)) {
        continue;
      }
      // Leaf node - add as literal type
      typeDefinition += `  | '${fullKey}'\n`;
    }
  }
  
  return typeDefinition;
}

/**
 * Generate type for a specific feature
 */
function generateFeatureType(feature: string, enTranslations: TranslationStructure): string {
  const keys = generateTypeFromStructure(enTranslations, '', getNonTextTranslationKeys());
  const safeFeatureName = feature.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  
  return `// ${feature} feature translations
export type ${safeFeatureName}TranslationKey =
${keys};
`;
}

/**
 * Load all feature translations
 */
function loadAllTranslations(): Record<string, TranslationStructure> {
  const localesPath = join(process.cwd(), 'src', 'platform', 'ui', 'i18n', 'locales');
  const translations: Record<string, TranslationStructure> = {};
  
  if (!existsSync(localesPath)) {
    return translations;
  }
  
  const features = readdirSync(localesPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  for (const feature of features) {
    const enPath = join(localesPath, feature, 'en.json');
    
    if (existsSync(enPath)) {
      try {
        const content = readFileSync(enPath, 'utf-8');
        translations[feature] = JSON.parse(content);
      } catch (error) {
        console.error(`Error loading ${enPath}:`, error);
      }
    }
  }
  
  return translations;
}

/**
 * Generate the translation keys type definition file
 */
function generateTranslationKeysType() {
  const translations = loadAllTranslations();
  
  let typeDefinition = `// Auto-generated translation keys
// DO NOT EDIT MANUALLY - Run: npm run i18n:generate-keys

`;
  
  const featureTypes: string[] = [];
  
  for (const [feature, enTranslations] of Object.entries(translations)) {
    featureTypes.push(generateFeatureType(feature, enTranslations));
  }
  
  typeDefinition += featureTypes.join('\n');
  
  typeDefinition += `

// Union type of all possible translation keys
export type AllTranslationKeys =\n`;
  
  for (const feature of Object.keys(translations)) {
    const safeFeatureName = feature.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    typeDefinition += `  | ${safeFeatureName}TranslationKey\n`;
  }
  
  typeDefinition += `\nexport type TranslationKey = AllTranslationKeys;\n`;
  
  // Write the generated file
  const outputPath = join(process.cwd(), 'src', 'platform', 'ui', 'i18n', 'translation-keys.d.ts');
  writeFileSync(outputPath, typeDefinition, 'utf-8');
  
  console.log(`✅ Generated translation keys type definition: ${outputPath}`);
}

/**
 * Main function
 */
function main() {
  console.log('🔑 Generating translation keys type definitions...\n');
  generateTranslationKeysType();
  console.log('\n✅ Translation keys type generation complete!');
}

// Run if called directly
if (require.main === module) {
  main();
}

export { generateTranslationKeysType };
