import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';

interface FeatureGeneratorOptions {
  featureName: string;
  withLayout?: boolean;
  withPage?: boolean;
}

/**
 * Generate default English translations for a new feature
 */
function generateDefaultEnTranslations(featureName: string): string {
  const capitalized = featureName.charAt(0).toUpperCase() + featureName.slice(1);
  
  return JSON.stringify({
    [featureName]: {
      page: {
        title: `${capitalized}`,
        description: `${capitalized} description`,
      },
      actions: {
        create: `Create`,
        edit: `Edit`,
        delete: `Delete`,
        save: `Save`,
        cancel: `Cancel`,
      },
      form: {
        submitButton: `Submit`,
        resetButton: `Reset`,
      },
      list: {
        addButton: `Add`,
        filterButton: `Filter`,
      },
    },
  }, null, 2);
}

/**
 * Generate default Arabic translations for a new feature
 */
function generateDefaultArTranslations(featureName: string): string {
  const capitalized = featureName.charAt(0).toUpperCase() + featureName.slice(1);
  
  return JSON.stringify({
    [featureName]: {
      page: {
        title: `${capitalized}`,
        description: `وصف ${capitalized}`,
      },
      actions: {
        create: `إنشاء`,
        edit: `تعديل`,
        delete: `حذف`,
        save: `حفظ`,
        cancel: `إلغاء`,
      },
      form: {
        submitButton: `إرسال`,
        resetButton: `إعادة تعيين`,
      },
      list: {
        addButton: `إضافة`,
        filterButton: `تصفية`,
      },
    },
  }, null, 2);
}

/**
 * Generate layout scaffold for a new feature
 */
function generateLayoutScaffold(featureName: string): string {
  const capitalized = featureName.charAt(0).toUpperCase() + featureName.slice(1).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  
  return `import { ReactNode } from 'react';
import { createFeatureLayout } from '@/platform/ui/server';

interface ${capitalized}LayoutProps {
  children: ReactNode;
}

export default function ${capitalized}Layout({ children }: ${capitalized}LayoutProps) {
  return createFeatureLayout({ children });
}
`;
}

/**
 * Generate UI identifiers for a new feature
 */
function generateUiIdentifiers(featureName: string): string {
  const upperFeature = featureName.toUpperCase().replace(/-/g, '_');
  
  return `// ============================================================================
// ${upperFeature} PAGE IDENTIFIERS
// ============================================================================
export const ${upperFeature} = {
  PAGE: {
    TITLE: '${featureName}.page.title' as const,
    DESCRIPTION: '${featureName}.page.description' as const,
  },
  ACTIONS: {
    CREATE_BUTTON: '${featureName}.actions.create-button' as const,
    EDIT_BUTTON: '${featureName}.actions.edit-button' as const,
    DELETE_BUTTON: '${featureName}.actions.delete-button' as const,
    SAVE_BUTTON: '${featureName}.actions.save-button' as const,
    CANCEL_BUTTON: '${featureName}.actions.cancel-button' as const,
  },
  FORM: {
    SUBMIT_BUTTON: '${featureName}.form.submit-button' as const,
    RESET_BUTTON: '${featureName}.form.reset-button' as const,
  },
  LIST: {
    ADD_BUTTON: '${featureName}.list.add-button' as const,
    FILTER_BUTTON: '${featureName}.list.filter-button' as const,
  },
} as const;
`;
}

/**
 * Generate binding file entry for the feature
 */
function generateBindingEntry(featureName: string): string {
  const upperFeature = featureName.toUpperCase().replace(/-/g, '_');
  
  return `// ============================================================================
// ${upperFeature} BINDING ENTRIES
// ============================================================================
// This file defines the binding between UI identifiers and translation keys
// for the ${featureName} feature. This ensures structural coupling between
// the UI Identification System and Feature-Based i18n System.

import { generateBindingMap, type BindingMap } from '@/platform/ui';

/**
 * Binding map for ${featureName} feature
 * Maps each UI identifier to its required translation key
 */
export const ${upperFeature}_BINDINGS: BindingMap = {
  '${featureName}.page.title': '${featureName}.page.title',
  '${featureName}.page.description': '${featureName}.page.description',
  '${featureName}.actions.create-button': '${featureName}.actions.createButton',
  '${featureName}.actions.edit-button': '${featureName}.actions.editButton',
  '${featureName}.actions.delete-button': '${featureName}.actions.deleteButton',
  '${featureName}.actions.save-button': '${featureName}.actions.saveButton',
  '${featureName}.actions.cancel-button': '${featureName}.actions.cancelButton',
  '${featureName}.form.submit-button': '${featureName}.form.submitButton',
  '${featureName}.form.reset-button': '${featureName}.form.resetButton',
  '${featureName}.list.add-button': '${featureName}.list.addButton',
  '${featureName}.list.filter-button': '${featureName}.list.filterButton',
} as const;
`;
}

/**
 * Add UI identifiers to the registry file
 */
function addUiIdentifiersToRegistry(featureName: string, uiIdentifiers: string): void {
  const registryPath = join(process.cwd(), 'src', 'platform', 'ui', 'registry', 'registry.ts');
  const upperFeature = featureName.toUpperCase().replace(/-/g, '_');
  
  if (!existsSync(registryPath)) {
    console.error(`❌ UI registry file not found at ${registryPath}`);
    return;
  }
  
  const content = readFileSync(registryPath, 'utf-8');
  
  // Check if feature already exists in registry
  if (content.includes(`export const ${upperFeature} =`)) {
    console.log(`⚠️  Feature ${upperFeature} already exists in UI registry, skipping...`);
    return;
  }
  
  // Find the position to insert (before the REGISTRY VALIDATION section)
  const validationSectionIndex = content.indexOf('// ============================================================================\n// REGISTRY VALIDATION');
  
  if (validationSectionIndex === -1) {
    console.error(`❌ Could not find REGISTRY VALIDATION section in ui-registry.ts`);
    return;
  }
  
  // Insert the new UI identifiers
  const newContent = 
    content.slice(0, validationSectionIndex) + 
    uiIdentifiers + '\n\n' +
    content.slice(validationSectionIndex);
  
  // Update the UI_REGISTRY to include the new feature
  const registryIndex = newContent.indexOf('export const UI_REGISTRY = {');
  if (registryIndex !== -1) {
    const closingBraceIndex = newContent.indexOf('} as const;', registryIndex);
    if (closingBraceIndex !== -1) {
      const beforeRegistry = newContent.slice(0, closingBraceIndex);
      const afterRegistry = newContent.slice(closingBraceIndex);
      
      // Add the feature to the registry
      const updatedRegistry = beforeRegistry + `  ...${upperFeature},\n` + afterRegistry;
      
      writeFileSync(registryPath, updatedRegistry, 'utf-8');
      console.log(`✅ Added UI identifiers to registry: ${upperFeature}`);
      return;
    }
  }
  
  // Fallback: just write the content with the new identifiers
  writeFileSync(registryPath, newContent, 'utf-8');
  console.log(`✅ Added UI identifiers to registry: ${upperFeature}`);
}

/**
 * Generate page scaffold for a new feature
 */
function generatePageScaffold(featureName: string): string {
  const capitalized = featureName.charAt(0).toUpperCase() + featureName.slice(1).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  const upperFeature = featureName.toUpperCase().replace(/-/g, '_');
  
  return `'use client';

import { useTranslation } from '@/platform/ui';
import { UiButton } from '@/platform/ui';
import { ${upperFeature} } from '@/platform/ui';
import { useBoundUI } from '@/platform/ui';

export default function ${capitalized}Page() {
  const { t } = useTranslation();
  
  // Get bound UI context for create button
  const createButton = useBoundUI(${upperFeature}.ACTIONS.CREATE_BUTTON, new Set([
    '${featureName}.actions.create-button',
    '${featureName}.page.title',
    '${featureName}.page.description',
    '${featureName}.actions.save-button',
    '${featureName}.actions.cancel-button',
  ]));

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-8">
      <h1 className="text-4xl font-bold text-on-surface">
        {t('${featureName}.page.title')}
      </h1>
      <p className="text-xl text-on-surface-variant">
        {t('${featureName}.page.description')}
      </p>
      <div className="flex gap-4">
        <UiButton ui={${upperFeature}.ACTIONS.CREATE_BUTTON}>
          {t('${featureName}.actions.create')}
        </UiButton>
        <UiButton ui={${upperFeature}.ACTIONS.SAVE_BUTTON} variant="secondary">
          {t('${featureName}.actions.save')}
        </UiButton>
      </div>
    </div>
  );
}
`;
}

/**
 * Generate a new feature with all necessary files
 */
export function generateFeature(options: FeatureGeneratorOptions): void {
  const { featureName, withLayout = true, withPage = true } = options;
  
  // Validate feature name
  if (!featureName || !/^[a-z][a-z0-9-]*$/.test(featureName)) {
    console.error('❌ Invalid feature name. Use lowercase letters, numbers, and hyphens, starting with a letter.');
    process.exit(1);
  }
  
  const localesPath = join(process.cwd(), 'src', 'platform', 'ui', 'i18n', 'locales');
  const i18nPath = join(localesPath, featureName);
  
  const featurePath = join(process.cwd(), 'src', 'features', featureName);

  // Check if feature already exists
  if (existsSync(i18nPath) || existsSync(featurePath)) {
    console.error(`❌ Feature "${featureName}" already exists.`);
    process.exit(1);
  }
  
  console.log(`🚀 Generating feature: ${featureName}\n`);
  
  // Create directories
  mkdirSync(i18nPath, { recursive: true });
  console.log(`✅ Created directory: ${i18nPath}`);
  
  // Create translation files
  const enTranslations = generateDefaultEnTranslations(featureName);
  const arTranslations = generateDefaultArTranslations(featureName);
  
  writeFileSync(join(i18nPath, 'en.json'), enTranslations, 'utf-8');
  console.log(`✅ Created: ${join(i18nPath, 'en.json')}`);
  
  writeFileSync(join(i18nPath, 'ar.json'), arTranslations, 'utf-8');
  console.log(`✅ Created: ${join(i18nPath, 'ar.json')}`);
  
  // Create layout scaffold if requested
  if (withLayout) {
    const layoutContent = generateLayoutScaffold(featureName);
    writeFileSync(join(featurePath, 'layout.tsx'), layoutContent, 'utf-8');
    console.log(`✅ Created: ${join(featurePath, 'layout.tsx')}`);
  }
  
  // Create page scaffold if requested
  if (withPage) {
    const pageContent = generatePageScaffold(featureName);
    writeFileSync(join(featurePath, 'page.tsx'), pageContent, 'utf-8');
    console.log(`✅ Created: ${join(featurePath, 'page.tsx')}`);
  }
  
  // Generate and add UI identifiers to registry
  const uiIdentifiers = generateUiIdentifiers(featureName);
  addUiIdentifiersToRegistry(featureName, uiIdentifiers);
  
  // Generate binding file
  const bindingEntry = generateBindingEntry(featureName);
  writeFileSync(join(featurePath, 'bindings.ts'), bindingEntry, 'utf-8');
  console.log(`✅ Created: ${join(featurePath, 'bindings.ts')}`);
  
  console.log(`\n✨ Feature "${featureName}" generated successfully!`);
  console.log(`\n📝 Next steps:`);
  console.log(`   1. Update the translations in ${i18nPath}`);
  console.log(`   2. Implement your feature logic in ${featurePath}`);
  console.log(`   3. Add the feature route to your app router if needed`);
  console.log(`   4. Run: npm run i18n:validate to check translation coverage`);
  console.log(`   5. UI identifiers have been added to src/platform/ui/registry/registry.ts`);
}

/**
 * Main function for CLI usage
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('❌ Usage: tsx scripts/generate-feature.ts <feature-name> [--no-layout] [--no-page]');
    console.error('   Example: tsx scripts/generate-feature.ts dashboard');
    console.error('   Example: tsx scripts/generate-feature.ts settings --no-layout');
    process.exit(1);
  }
  
  const featureName = args[0];
  const withLayout = !args.includes('--no-layout');
  const withPage = !args.includes('--no-page');
  
  generateFeature({
    featureName,
    withLayout,
    withPage,
  });
}

// Run if called directly
if (require.main === module) {
  main();
}
