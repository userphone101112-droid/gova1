import { readdirSync, readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

interface TranslationStructure {
  [key: string]: string | TranslationStructure;
}

/**
 * Generate TypeScript type from translation structure
 */
function generateTypeFromStructure(
  obj: TranslationStructure,
  prefix = ''
): string {
  let typeDefinition = '';
  
  for (const key in obj) {
    const value = obj[key];
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null) {
      // Nested object - generate nested type
      typeDefinition += generateTypeFromStructure(value, fullKey);
    } else {
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
  const keys = generateTypeFromStructure(enTranslations);
  
  return `// ${feature} feature translations
export type ${feature}TranslationKey =
${keys};
`;
}

/**
 * Load all feature translations
 */
function loadAllTranslations(): Record<string, TranslationStructure> {
  const featuresPath = join(process.cwd(), 'src', 'features');
  const translations: Record<string, TranslationStructure> = {};
  
  if (!existsSync(featuresPath)) {
    return translations;
  }
  
  const features = readdirSync(featuresPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  for (const feature of features) {
    const enPath = join(featuresPath, feature, 'i18n', 'en.json');
    
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
    typeDefinition += `  | ${feature}TranslationKey\n`;
  }
  
  typeDefinition += `\nexport type TranslationKey = AllTranslationKeys;\n`;
  
  // Write the generated file
  const outputPath = join(process.cwd(), 'src', 'shared', 'i18n', 'translation-keys.d.ts');
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
