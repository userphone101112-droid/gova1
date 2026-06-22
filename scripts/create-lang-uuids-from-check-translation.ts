import { randomUUID } from 'crypto';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';

type CheckTranslationItem = {
  key: string;
  uuid?: string;
  sourceFile?: string;
  sourceLine?: number;
  updatedAt?: string;
  skippedReason?: string;
  [key: string]: unknown;
};

type CheckTranslationFile = {
  savedAt?: string | null;
  updatedAt?: string;
  items?: CheckTranslationItem[];
};

const CHECK_FILE = path.join(process.cwd(), 'data', 'ui-inspector', 'check-translation.json');

function main(): void {
  if (!existsSync(CHECK_FILE)) {
    console.log(`No check translation file found at ${CHECK_FILE}`);
    return;
  }

  const data = JSON.parse(readFileSync(CHECK_FILE, 'utf-8')) as CheckTranslationFile;
  const items = Array.isArray(data.items) ? data.items : [];
  let created = 0;
  let skipped = 0;

  for (const item of items) {
    const uuid = typeof item.uuid === 'string' ? item.uuid.trim() : '';
    if (uuid.startsWith('lang-')) continue;

    const langUuid = `lang-${randomUUID()}`;
    const result = addLangUuidToSource(item, langUuid);
    if (!result.ok) {
      item.skippedReason = result.reason;
      item.updatedAt = new Date().toISOString();
      skipped += 1;
      continue;
    }

    item.uuid = langUuid;
    delete item.skippedReason;
    item.updatedAt = new Date().toISOString();
    created += 1;
  }

  if (created > 0 || skipped > 0) {
    data.items = items;
    data.updatedAt = new Date().toISOString();
    writeFileSync(CHECK_FILE, `${JSON.stringify(data, null, 2)}\n`, 'utf-8');
  }

  console.log(
    `Created ${created} lang UUID${created === 1 ? '' : 's'} in ${CHECK_FILE}. Skipped ${skipped}.`
  );
}

function addLangUuidToSource(
  item: CheckTranslationItem,
  langUuid: string
): { ok: true } | { ok: false; reason: string } {
  const sourceFile = typeof item.sourceFile === 'string' ? item.sourceFile : '';
  const sourceLine = typeof item.sourceLine === 'number' ? item.sourceLine : 0;
  if (!sourceFile || !sourceLine) return { ok: false, reason: 'missing-source-location' };

  const absolutePath = resolveProjectFile(sourceFile);
  if (!absolutePath) return { ok: false, reason: 'source-file-not-found' };

  const content = readFileSync(absolutePath, 'utf-8');
  const lines = content.split(/\r?\n/);
  const lineIndex = sourceLine - 1;
  const line = lines[lineIndex] ?? '';
  if (!line) return { ok: false, reason: 'source-line-not-found' };
  if (line.includes('data-ui-lang-uuid=')) {
    return { ok: false, reason: 'source-already-has-data-ui-lang-uuid' };
  }

  const updatedLine = line.replace(/(<[a-z][a-z0-9-]*)(\s|>)/i, `$1 data-ui-lang-uuid="${langUuid}"$2`);
  if (updatedLine === line) return { ok: false, reason: 'jsx-open-tag-not-found' };

  lines[lineIndex] = updatedLine;
  writeFileSync(absolutePath, lines.join('\n'), 'utf-8');
  return { ok: true };
}

function resolveProjectFile(input: string): string | null {
  const root = process.cwd();
  const normalizedInput = input.replace(/^file:\/+/, '').replace(/\\/g, path.sep);
  const candidate = path.isAbsolute(normalizedInput)
    ? path.normalize(normalizedInput)
    : path.normalize(path.join(root, normalizedInput.replace(/^\/+/, '')));
  const relative = path.relative(root, candidate);
  if (relative.startsWith('..') || path.isAbsolute(relative)) return null;
  if (!existsSync(candidate)) return null;
  return candidate;
}

main();
