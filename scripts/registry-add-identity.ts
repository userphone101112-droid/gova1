#!/usr/bin/env tsx
import { execFileSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import { createDeterministicUiUuid } from '../src/platform/ui/registry/identity-uuid';

type Category = 'action' | 'input' | 'navigation' | 'display' | 'container';

interface AddOptions {
  file: string;
  id: string;
  path: string;
  description: string;
  category: Category;
  feature?: string;
}

const ROOT = process.cwd();
const VALID_CATEGORIES = ['action', 'input', 'navigation', 'display', 'container'];

function parseArgs(): AddOptions {
  const options: Partial<AddOptions> = {};
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i];
    const value = args[i + 1];
    if (!value) throw new Error(`Missing value for ${key}`);
    if (key === '--file') options.file = value;
    else if (key === '--id') options.id = value;
    else if (key === '--path') options.path = value;
    else if (key === '--description') options.description = value;
    else if (key === '--category') options.category = value as Category;
    else if (key === '--feature') options.feature = value;
    else throw new Error(`Unknown option: ${key}`);
  }

  if (!options.file || !options.id || !options.path || !options.description || !options.category) {
    throw new Error(
      'Usage: npm run registry:add -- --file src/platform/ui/registry/features/home.ts --id UI_HOME_EXAMPLE --path home.section.display.example --description "Example" --category display'
    );
  }
  if (!VALID_CATEGORIES.includes(options.category)) {
    throw new Error(
      `Invalid category "${options.category}". Use one of: ${VALID_CATEGORIES.join(', ')}`
    );
  }

  return {
    file: options.file,
    id: options.id,
    path: options.path,
    description: options.description,
    category: options.category,
    feature: options.feature ?? options.path.split('.')[0],
  };
}

function toKey(id: string): string {
  return id.replace(/^UI_/, '').replace(/[^A-Z0-9]+/g, '_');
}

function escapeSingleQuote(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function main() {
  const options = parseArgs();
  const filePath = join(ROOT, options.file);
  if (!existsSync(filePath)) {
    throw new Error(`Registry file does not exist: ${filePath}`);
  }

  const content = readFileSync(filePath, 'utf-8');
  if (content.includes(`id: '${options.id}'`) || content.includes(`path: '${options.path}'`)) {
    throw new Error(`Identity already exists for id/path: ${options.id} / ${options.path}`);
  }

  const today = new Date().toISOString().slice(0, 10);
  const uuid = createDeterministicUiUuid(options.id);
  const propertyKey = toKey(options.id);
  const entry = `  ${propertyKey}: {
    uuid: '${uuid}',
    id: '${escapeSingleQuote(options.id)}',
    path: '${escapeSingleQuote(options.path)}',
    lifecycle: 'active',
    description: '${escapeSingleQuote(options.description)}',
    category: '${options.category}',
    feature: '${escapeSingleQuote(options.feature ?? options.path.split('.')[0])}',
    version: '1.0.0',
    createdAt: '${today}',
    updatedAt: '${today}',
  } as const,
`;

  const nextContent = content.replace(/\n} as const;\s*$/m, `\n${entry}} as const;\n`);
  if (nextContent === content) {
    throw new Error(`Could not find root registry object terminator in ${filePath}`);
  }

  writeFileSync(filePath, nextContent, 'utf-8');
  execFileSync('cmd', ['/c', 'npx', 'tsx', 'scripts/registry-materialize-uuids.ts'], {
    stdio: 'inherit',
    cwd: ROOT,
  });
  console.log(`Added UI identity ${options.id} (${uuid}) to ${filePath}`);
}

main();
