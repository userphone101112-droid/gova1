#!/usr/bin/env tsx
/**
 * Generate registry-member-paths.json for strict ESLint validation.
 */
import { writeFileSync } from 'fs';
import { join } from 'path';

import {
  AUTH,
  DEVTOOLS,
  ERROR_BOUNDARY,
  HOME,
  MERCHANT,
  ONBOARDING,
  SETTINGS,
  SHARED_LAYOUT,
  SPLASH,
} from '../src/platform/ui/registry/registry';
import { ALL_CATEGORY_IDENTITIES } from '../src/platform/ui/registry/categories';

const ROOTS = {
  HOME,
  ERROR_BOUNDARY,
  SPLASH,
  SHARED_LAYOUT,
  AUTH,
  SETTINGS,
  MERCHANT,
  ONBOARDING,
  DEVTOOLS,
  COMMON_LAYOUT: null as unknown,
  COMMON_FORMS: null as unknown,
  COMMON_TYPOGRAPHY: null as unknown,
  COMMON_MEDIA: null as unknown,
  COMMON_COMPONENTS: null as unknown,
  COMMON_TABLES: null as unknown,
  COMMON_LISTS: null as unknown,
  COMMON_INTERACTIVE: null as unknown,
  COMMON_TEMPLATE: null as unknown,
  COMMON_SPACING: null as unknown,
  DECORATIVE: null as unknown,
};

import * as categories from '../src/platform/ui/registry/categories';
ROOTS.COMMON_LAYOUT = categories.COMMON_LAYOUT;
ROOTS.COMMON_FORMS = categories.COMMON_FORMS;
ROOTS.COMMON_TYPOGRAPHY = categories.COMMON_TYPOGRAPHY;
ROOTS.COMMON_MEDIA = categories.COMMON_MEDIA;
ROOTS.COMMON_COMPONENTS = categories.COMMON_COMPONENTS;
ROOTS.COMMON_TABLES = categories.COMMON_TABLES;
ROOTS.COMMON_LISTS = categories.COMMON_LISTS;
ROOTS.COMMON_INTERACTIVE = categories.COMMON_INTERACTIVE;
ROOTS.COMMON_TEMPLATE = categories.COMMON_TEMPLATE;
ROOTS.COMMON_SPACING = categories.COMMON_SPACING;
ROOTS.DECORATIVE = categories.DECORATIVE;

function isIdentity(obj: unknown): obj is { uuid: string; id: string; path: string } {
  return Boolean(obj && typeof obj === 'object' && 'uuid' in obj && 'path' in obj);
}

function collectPaths(obj: unknown, prefix: string[], out: Set<string>) {
  if (isIdentity(obj)) {
    out.add(prefix.join('.'));
    return;
  }
  if (obj && typeof obj === 'object') {
    for (const [key, value] of Object.entries(obj)) {
      collectPaths(value, [...prefix, key], out);
    }
  }
}

const paths = new Set<string>();
for (const [root, tree] of Object.entries(ROOTS)) {
  if (tree) collectPaths(tree, [root], paths);
}
void ALL_CATEGORY_IDENTITIES;

const output = {
  version: 1,
  roots: Object.keys(ROOTS),
  paths: [...paths].sort(),
};

const outPath = join(process.cwd(), 'src/platform/ui/registry/registry-member-paths.json');
writeFileSync(outPath, `${JSON.stringify(output, null, 2)}\n`, 'utf-8');
console.log(`✅ Generated ${paths.size} registry member paths → ${outPath}`);
