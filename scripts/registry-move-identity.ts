#!/usr/bin/env tsx
import { execFileSync } from 'child_process';
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd();
const REGISTRY_DIRS = [
  join(ROOT, 'src', 'platform', 'ui', 'registry', 'features'),
  join(ROOT, 'src', 'platform', 'ui', 'registry', 'categories'),
];

interface MoveOptions {
  lookup: string;
  id?: string;
  path?: string;
  feature?: string;
}

function listTsFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((item) => {
    const fullPath = join(dir, item.name);
    if (item.isDirectory()) return listTsFiles(fullPath);
    if (item.isFile() && item.name.endsWith('.ts')) return [fullPath];
    return [];
  });
}

function parseArgs(): MoveOptions {
  const [, , lookup, ...rest] = process.argv;
  if (!lookup) {
    throw new Error(
      'Usage: npx tsx scripts/registry-move-identity.ts <uuid|id|path> --id NEW_ID --path new.path --feature feature'
    );
  }

  const options: MoveOptions = { lookup };
  for (let i = 0; i < rest.length; i += 2) {
    const key = rest[i];
    const value = rest[i + 1];
    if (!value) throw new Error(`Missing value for ${key}`);
    if (key === '--id') options.id = value;
    else if (key === '--path') options.path = value;
    else if (key === '--feature') options.feature = value;
    else throw new Error(`Unknown option: ${key}`);
  }

  if (!options.id && !options.path && !options.feature) {
    throw new Error('Provide at least one of --id, --path, or --feature.');
  }

  return options;
}

function extractString(body: string, key: string): string {
  const match = body.match(new RegExp(`${key}:\\s*'([^']+)'`));
  return match?.[1] ?? '';
}

function hasArrayValue(body: string, key: string, value: string): boolean {
  const match = body.match(new RegExp(`${key}:\\s*\\[([^\\]]*)\\]`));
  return Boolean(match?.[1]?.includes(`'${value}'`));
}

function addArrayValue(body: string, key: string, value: string, indent: string): string {
  if (!value || hasArrayValue(body, key, value)) return body;

  const arrayRegex = new RegExp(`${key}:\\s*\\[([^\\]]*)\\],?`);
  if (arrayRegex.test(body)) {
    return body.replace(arrayRegex, (_match, values: string) => {
      const trimmed = values.trim();
      const nextValues = trimmed ? `${trimmed}, '${value}'` : `'${value}'`;
      return `${key}: [${nextValues}],`;
    });
  }

  const updatedAtRegex = new RegExp(`(\\n${indent}updatedAt:\\s*'[^']+',)`);
  return body.replace(updatedAtRegex, `$1\n${indent}${key}: ['${value}'] as const,`);
}

function updateString(body: string, key: string, value: string): string {
  return body.replace(new RegExp(`${key}:\\s*'[^']+'`), `${key}: '${value}'`);
}

function updateIdentityInFile(filePath: string, options: MoveOptions): boolean {
  const content = readFileSync(filePath, 'utf-8');
  let changed = false;

  const nextContent = content.replace(
    /{\r?\n(\s*)uuid:\s*'([^']+)',\r?\n([\s\S]*?)\r?\n\s*}\s+as const/g,
    (fullMatch, indent: string, uuid: string, rest: string) => {
      const currentId = extractString(rest, 'id');
      const currentPath = extractString(rest, 'path');
      const matches = [uuid, currentId, currentPath].includes(options.lookup);
      if (!matches) return fullMatch;

      let nextRest = rest;
      if (options.id && options.id !== currentId) {
        nextRest = addArrayValue(nextRest, 'previousIds', currentId, indent);
        nextRest = updateString(nextRest, 'id', options.id);
      }
      if (options.path && options.path !== currentPath) {
        nextRest = addArrayValue(nextRest, 'previousPaths', currentPath, indent);
        nextRest = updateString(nextRest, 'path', options.path);
      }
      if (options.feature) {
        nextRest = updateString(nextRest, 'feature', options.feature);
      }

      changed = true;
      return `{\n${indent}uuid: '${uuid}',\n${nextRest}\n${indent.slice(0, -2)}} as const`;
    }
  );

  if (changed) {
    writeFileSync(filePath, nextContent, 'utf-8');
  }

  return changed;
}

function main() {
  const options = parseArgs();
  const changedFiles = REGISTRY_DIRS.flatMap((dir) => listTsFiles(dir)).filter((file) =>
    updateIdentityInFile(file, options)
  );

  if (changedFiles.length === 0) {
    throw new Error(`No UI identity matched "${options.lookup}".`);
  }

  execFileSync('cmd', ['/c', 'npx', 'tsx', 'scripts/registry-materialize-uuids.ts'], {
    stdio: 'inherit',
    cwd: ROOT,
  });

  console.log(`Updated ${changedFiles.length} registry file(s).`);
}

main();
