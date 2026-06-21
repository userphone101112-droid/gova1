import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';

interface FeatureGeneratorOptions {
  featureName: string;
  withLayout?: boolean;
  withPage?: boolean;
}

type Category = 'action' | 'input' | 'navigation' | 'display' | 'container';

interface IdentitySpec {
  nest: string[];
  key: string;
  id: string;
  path: string;
  category: Category;
  description: string;
}

function toUpperFeature(featureName: string): string {
  return featureName.toUpperCase().replace(/-/g, '_');
}

function escapeSingleQuote(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function buildIdentityBlock(spec: IdentitySpec, featureName: string, today: string): string {
  const indent = '    '.repeat(spec.nest.length + 1);
  return `${indent}${spec.key}: {
${indent}  id: '${escapeSingleQuote(spec.id)}',
${indent}  path: '${escapeSingleQuote(spec.path)}',
${indent}  lifecycle: 'active',
${indent}  description: '${escapeSingleQuote(spec.description)}',
${indent}  category: '${spec.category}',
${indent}  feature: '${escapeSingleQuote(featureName)}',
${indent}  version: '1.0.0',
${indent}  createdAt: '${today}',
${indent}  updatedAt: '${today}',
${indent}} as const,`;
}

function buildRegistryTree(specs: IdentitySpec[], featureName: string, today: string): string {
  const upperFeature = toUpperFeature(featureName);
  const lines: string[] = [`/** ${featureName} feature UI identities */`, `export const ${upperFeature} = {`];
  const openGroups: string[] = [];

  for (const spec of specs) {
    while (openGroups.length > spec.nest.length) {
      const closingIndent = '  '.repeat(openGroups.length);
      lines.push(`${closingIndent}},`);
      openGroups.pop();
    }

    while (openGroups.length < spec.nest.length) {
      const groupKey = spec.nest[openGroups.length];
      const groupIndent = '  '.repeat(openGroups.length + 1);
      lines.push(`${groupIndent}${groupKey}: {`);
      openGroups.push(groupKey);
    }

    lines.push(buildIdentityBlock(spec, featureName, today));
  }

  while (openGroups.length > 0) {
    const closingIndent = '  '.repeat(openGroups.length);
    lines.push(`${closingIndent}},`);
    openGroups.pop();
  }

  lines.push('} as const;', '');
  return lines.join('\n');
}

function identitySpecs(featureName: string): IdentitySpec[] {
  const upper = toUpperFeature(featureName);
  return [
    {
      nest: ['PAGE'],
      key: 'CONTAINER',
      id: `UI_${upper}_PAGE_CONTAINER`,
      path: `${featureName}.page.layout.container`,
      category: 'container',
      description: 'Page root container',
    },
    {
      nest: ['PAGE'],
      key: 'TITLE',
      id: `UI_${upper}_PAGE_TITLE`,
      path: `${featureName}.page.display.title`,
      category: 'display',
      description: 'Page title',
    },
    {
      nest: ['PAGE'],
      key: 'DESCRIPTION',
      id: `UI_${upper}_PAGE_DESCRIPTION`,
      path: `${featureName}.page.display.description`,
      category: 'display',
      description: 'Page description',
    },
    {
      nest: ['ACTIONS'],
      key: 'CREATE_BUTTON',
      id: `UI_${upper}_ACTIONS_CREATE_BUTTON`,
      path: `${featureName}.actions.create-button`,
      category: 'action',
      description: 'Create action button',
    },
    {
      nest: ['ACTIONS'],
      key: 'SAVE_BUTTON',
      id: `UI_${upper}_ACTIONS_SAVE_BUTTON`,
      path: `${featureName}.actions.save-button`,
      category: 'action',
      description: 'Save action button',
    },
    {
      nest: ['ACTIONS'],
      key: 'ROW',
      id: `UI_${upper}_ACTIONS_ROW`,
      path: `${featureName}.actions.layout.row`,
      category: 'container',
      description: 'Actions button row',
    },
  ];
}

function generateDefaultEnTranslations(featureName: string): string {
  const capitalized = featureName.charAt(0).toUpperCase() + featureName.slice(1);

  return JSON.stringify(
    {
      [featureName]: {
        page: {
          title: `${capitalized}`,
          description: `${capitalized} description`,
        },
        actions: {
          create: 'Create',
          save: 'Save',
        },
      },
    },
    null,
    2
  );
}

function generateDefaultArTranslations(featureName: string): string {
  const capitalized = featureName.charAt(0).toUpperCase() + featureName.slice(1);

  return JSON.stringify(
    {
      [featureName]: {
        page: {
          title: `${capitalized}`,
          description: `وصف ${capitalized}`,
        },
        actions: {
          create: 'إنشاء',
          save: 'حفظ',
        },
      },
    },
    null,
    2
  );
}

function generateLayoutScaffold(featureName: string): string {
  const capitalized = featureName
    .charAt(0)
    .toUpperCase()
    .concat(featureName.slice(1).replace(/-([a-z])/g, (_, c) => c.toUpperCase()));

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

function generatePageScaffold(featureName: string): string {
  const capitalized = featureName
    .charAt(0)
    .toUpperCase()
    .concat(featureName.slice(1).replace(/-([a-z])/g, (_, c) => c.toUpperCase()));

  return `'use client';

import { useTranslation } from '@/platform/ui';

export default function ${capitalized}Page() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-8">
      <h1 className="text-4xl font-bold text-on-surface">
        {t('${featureName}.page.title')}
      </h1>
      <p className="text-xl text-on-surface-variant">
        {t('${featureName}.page.description')}
      </p>
      <div className="flex gap-4">
        <button
          type="button"
          className="rounded-md bg-primary px-4 py-2 text-on-primary"
        >
          {t('${featureName}.actions.create')}
        </button>
        <button
          type="button"
          className="rounded-md bg-secondary px-4 py-2 text-on-secondary"
        >
          {t('${featureName}.actions.save')}
        </button>
      </div>
    </div>
  );
}
`;
}

function generateBindingEntry(featureName: string): string {
  const upperFeature = toUpperFeature(featureName);

  return `import type { BindingMap } from '@/platform/ui';

export const ${upperFeature}_BINDINGS: BindingMap = {
  '${featureName}.page.display.title': '${featureName}.page.title',
  '${featureName}.page.display.description': '${featureName}.page.description',
  '${featureName}.actions.create-button': '${featureName}.actions.create',
  '${featureName}.actions.save-button': '${featureName}.actions.save',
} as const;
`;
}

function registerFeatureInRegistry(featureName: string): void {
  const registryPath = join(process.cwd(), 'src/platform/ui/registry/registry.ts');
  const upperFeature = toUpperFeature(featureName);

  if (!existsSync(registryPath)) {
    throw new Error(`Registry file not found: ${registryPath}`);
  }

  let content = readFileSync(registryPath, 'utf-8');

  if (content.includes(`from './features/${featureName}'`)) {
    console.log(`⚠️  Feature ${upperFeature} already registered, skipping registry patch...`);
    return;
  }

  content = content.replace(
    "import { ONBOARDING } from './features/onboarding';",
    `import { ONBOARDING } from './features/onboarding';\nimport { ${upperFeature} } from './features/${featureName}';`
  );

  content = content.replace(
    "export { ONBOARDING } from './features/onboarding';",
    `export { ONBOARDING } from './features/onboarding';\nexport { ${upperFeature} } from './features/${featureName}';`
  );

  content = content.replace(
    '  ONBOARDING,\n} as const;',
    `  ONBOARDING,\n  ${upperFeature},\n} as const;`
  );

  content = content.replace(
    '  ...flattenObject(ONBOARDING),\n  ...ALL_CATEGORY_IDENTITIES,',
    `  ...flattenObject(ONBOARDING),\n  ...flattenObject(${upperFeature}),\n  ...ALL_CATEGORY_IDENTITIES,`
  );

  writeFileSync(registryPath, content, 'utf-8');
  console.log(`✅ Registered ${upperFeature} in registry.ts`);
}

export function generateFeature(options: FeatureGeneratorOptions): void {
  const { featureName, withLayout = true, withPage = true } = options;

  if (!featureName || !/^[a-z][a-z0-9-]*$/.test(featureName)) {
    console.error('❌ Invalid feature name. Use lowercase letters, numbers, and hyphens, starting with a letter.');
    process.exit(1);
  }

  const localesPath = join(process.cwd(), 'src/platform/ui/i18n/locales');
  const i18nPath = join(localesPath, featureName);
  const featurePath = join(process.cwd(), 'src/features', featureName);
  const registryFeaturePath = join(process.cwd(), 'src/platform/ui/registry/features', `${featureName}.ts`);

  if (existsSync(i18nPath) || existsSync(featurePath) || existsSync(registryFeaturePath)) {
    console.error(`❌ Feature "${featureName}" already exists.`);
    process.exit(1);
  }

  console.log(`🚀 Generating feature: ${featureName}\n`);

  const today = new Date().toISOString().slice(0, 10);
  const registryContent = buildRegistryTree(identitySpecs(featureName), featureName, today);

  mkdirSync(join(process.cwd(), 'src/platform/ui/registry/features'), { recursive: true });
  writeFileSync(registryFeaturePath, registryContent, 'utf-8');
  console.log(`✅ Created registry identities: ${registryFeaturePath}`);

  registerFeatureInRegistry(featureName);

  mkdirSync(i18nPath, { recursive: true });
  writeFileSync(join(i18nPath, 'en.json'), generateDefaultEnTranslations(featureName), 'utf-8');
  writeFileSync(join(i18nPath, 'ar.json'), generateDefaultArTranslations(featureName), 'utf-8');
  console.log(`✅ Created translations: ${i18nPath}`);

  mkdirSync(featurePath, { recursive: true });

  if (withLayout) {
    writeFileSync(join(featurePath, 'layout.tsx'), generateLayoutScaffold(featureName), 'utf-8');
    console.log(`✅ Created: ${join(featurePath, 'layout.tsx')}`);
  }

  if (withPage) {
    writeFileSync(join(featurePath, 'page.tsx'), generatePageScaffold(featureName), 'utf-8');
    console.log(`✅ Created: ${join(featurePath, 'page.tsx')}`);
  }

  writeFileSync(join(featurePath, 'bindings.ts'), generateBindingEntry(featureName), 'utf-8');
  console.log(`✅ Created: ${join(featurePath, 'bindings.ts')}`);

  console.log(`\n✨ Feature "${featureName}" generated successfully!`);
  console.log('\n📝 Next steps:');
  console.log(`   1. Update translations in ${i18nPath}`);
  console.log(`   2. Implement feature logic in ${featurePath}`);
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('❌ Usage: tsx scripts/generate-feature.ts <feature-name> [--no-layout] [--no-page]');
    process.exit(1);
  }

  generateFeature({
    featureName: args[0],
    withLayout: !args.includes('--no-layout'),
    withPage: !args.includes('--no-page'),
  });
}

if (require.main === module) {
  main();
}
