import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { generateTranslationKeyFromUi, isCategoryUiPath } from '../../i18n/binding/registry-binding';
import {
  HOME,
  ERROR_BOUNDARY,
  SPLASH,
  SHARED_LAYOUT,
  AUTH,
  MERCHANT,
  ONBOARDING,
  ALL_UI_IDENTIFIERS,
  ALL_UI_IDENTITIES,
  isTranslationRequiredForUiIdentity,
} from '../../registry/registry';

const REGISTRY_SOURCES = {
  HOME,
  ERROR_BOUNDARY,
  SPLASH,
  SHARED_LAYOUT,
  AUTH,
  MERCHANT,
  ONBOARDING,
};

function isIdentity(obj: unknown): obj is { id: string; path: string } {
  return !!obj && typeof obj === 'object' && 'id' in obj && 'path' in obj;
}

function getReferenceVariants(sources: Record<string, unknown>): Record<string, string[]> {
  const map: Record<string, string[]> = {};
  const leafCounts: Record<string, number> = {};

  function countLeaves(current: unknown, leaf: string) {
    if (isIdentity(current)) {
      leafCounts[leaf] = (leafCounts[leaf] || 0) + 1;
    } else if (typeof current === 'object' && current !== null) {
      for (const [key, value] of Object.entries(current)) {
        countLeaves(value, key);
      }
    }
  }

  for (const [key, val] of Object.entries(sources)) {
    countLeaves(val, key);
  }

  function traverse(current: unknown, path: string[]) {
    if (isIdentity(current)) {
      const leaf = path[path.length - 1] ?? '';
      const fullPath = path.join('.');
      const variants = [current.path, fullPath];
      if (leaf && leafCounts[leaf] === 1) {
        variants.push(leaf, `'${leaf}'`, `"${leaf}"`);
      }
      map[current.path] = [...new Set(variants)];
    } else if (typeof current === 'object' && current !== null) {
      for (const [key, value] of Object.entries(current)) {
        traverse(value, [...path, key]);
      }
    }
  }

  for (const [key, val] of Object.entries(sources)) {
    traverse(val, [key]);
  }

  return map;
}

const UI_REFERENCE_VARIANTS = getReferenceVariants(REGISTRY_SOURCES);

export interface UsageScanResult {
  usedUiIdentifiers: Set<string>;
  usedTranslationKeys: Set<string>;
}

export function scanSourceUsage(rootPath = join(process.cwd(), 'src')): UsageScanResult {
  const usedUiIdentifiers = new Set<string>();
  const usedTranslationKeys = new Set<string>();

  scanDirectory(rootPath, usedUiIdentifiers, usedTranslationKeys);

  for (const identity of ALL_UI_IDENTITIES) {
    if (!isCategoryUiPath(identity.path) && isTranslationRequiredForUiIdentity(identity)) {
      usedTranslationKeys.add(generateTranslationKeyFromUi(identity.path));
    }
  }

  return { usedUiIdentifiers, usedTranslationKeys };
}

function scanDirectory(
  dirPath: string,
  usedUiIdentifiers: Set<string>,
  usedTranslationKeys: Set<string>
): void {
  if (!existsSync(dirPath)) return;

  for (const item of readdirSync(dirPath, { withFileTypes: true })) {
    const fullPath = join(dirPath, item.name);
    if (item.isDirectory()) {
      if (['node_modules', '.next', 'build', 'tests', 'mocks'].includes(item.name)) continue;
      scanDirectory(fullPath, usedUiIdentifiers, usedTranslationKeys);
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
      scanFile(fullPath, usedUiIdentifiers, usedTranslationKeys);
    }
  }
}

function scanFile(
  filePath: string,
  usedUiIdentifiers: Set<string>,
  usedTranslationKeys: Set<string>
): void {
  const content = readFileSync(filePath, 'utf-8');

  for (const identifier of ALL_UI_IDENTIFIERS) {
    const variants = UI_REFERENCE_VARIANTS[identifier] ?? [identifier];
    if (variants.some((variant) => content.includes(variant))) {
      usedUiIdentifiers.add(identifier);
    }
  }

  const translationRegex = /t\(\s*['"`]([^'"`]+)['"`]/g;
  let match;
  while ((match = translationRegex.exec(content)) !== null) {
    usedTranslationKeys.add(match[1]);
  }

  const literalKeyRegex =
    /['"`]((?:auth|home|splash|common|shared-layout|error-boundary|settings|merchant|onboarding|dashboard|contact|signup)\.[a-zA-Z0-9.-]+)['"`]/g;
  while ((match = literalKeyRegex.exec(content)) !== null) {
    usedTranslationKeys.add(match[1]);
  }
}
