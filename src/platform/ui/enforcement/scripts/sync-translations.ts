import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';

import { generateTranslationKeyFromUi, isCategoryUiPath } from '../../i18n/binding/registry-binding';
import {
  ALL_UI_IDENTITIES,
  isTranslationRequiredForUiIdentity,
} from '../../registry/registry';

type Locale = 'en' | 'ar';
type TranslationValue = string | TranslationTree;

interface TranslationTree {
  [key: string]: TranslationValue;
}

interface SyncChange {
  locale: Locale;
  key: string;
}

const LOCALES: readonly Locale[] = ['en', 'ar'] as const;
const LOCALES_ROOT = join(process.cwd(), 'src', 'platform', 'ui', 'i18n', 'locales');

function readJson(filePath: string): TranslationTree {
  if (!existsSync(filePath)) {
    return {};
  }

  return JSON.parse(readFileSync(filePath, 'utf-8')) as TranslationTree;
}

function writeJson(filePath: string, data: TranslationTree): void {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf-8');
}

function getNestedValue(root: TranslationTree, key: string): TranslationValue | undefined {
  let current: TranslationValue | undefined = root;

  for (const part of key.split('.')) {
    if (!current || typeof current !== 'object' || !(part in current)) {
      return undefined;
    }

    current = current[part];
  }

  return current;
}

function setNestedValue(root: TranslationTree, key: string, value: string): void {
  const parts = key.split('.');
  let current = root;

  for (const part of parts.slice(0, -1)) {
    const next = current[part];
    if (!next || typeof next !== 'object') {
      current[part] = {};
    }
    current = current[part] as TranslationTree;
  }

  current[parts[parts.length - 1]!] = value;
}

function fallbackValue(locale: Locale, description: string, key: string): string {
  if (locale === 'en') {
    return description || key;
  }

  return `TODO(ar): ${description || key}`;
}

function getRequiredTranslationEntries(): Array<{ key: string; description: string }> {
  const entries = new Map<string, string>();

  for (const identity of ALL_UI_IDENTITIES) {
    if (isCategoryUiPath(identity.path) || !isTranslationRequiredForUiIdentity(identity)) {
      continue;
    }

    entries.set(generateTranslationKeyFromUi(identity.path), identity.description);
  }

  return [...entries.entries()].map(([key, description]) => ({ key, description }));
}

export function syncTranslations(): SyncChange[] {
  const changes: SyncChange[] = [];
  const requiredEntries = getRequiredTranslationEntries();

  for (const locale of LOCALES) {
    const files = new Map<string, TranslationTree>();

    for (const entry of requiredEntries) {
      const feature = entry.key.split('.')[0]!;
      const filePath = join(LOCALES_ROOT, feature, `${locale}.json`);
      const data = files.get(filePath) ?? readJson(filePath);

      if (getNestedValue(data, entry.key) === undefined) {
        setNestedValue(data, entry.key, fallbackValue(locale, entry.description, entry.key));
        changes.push({ locale, key: entry.key });
      }

      files.set(filePath, data);
    }

    for (const [filePath, data] of files) {
      writeJson(filePath, data);
    }
  }

  return changes;
}

function main(): void {
  console.log('Syncing i18n registry bindings...\n');
  const changes = syncTranslations();

  if (changes.length === 0) {
    console.log('All required translation keys already exist.');
    return;
  }

  console.log(`Added ${changes.length} missing translation key(s):`);
  for (const change of changes) {
    console.log(` - ${change.locale}: ${change.key}`);
  }
}

if (require.main === module) {
  main();
}
