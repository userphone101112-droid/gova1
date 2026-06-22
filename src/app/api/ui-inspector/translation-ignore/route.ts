/* eslint-disable i18n-enforcement/no-hardcoded-text */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';

import { NextRequest, NextResponse } from 'next/server';

import { generateTranslationItemKey } from '@/platform/ui/devtools/ui-inspector/utils/translation-key';

type IgnoreRecord = {
  key: string;
  route: string;
  sourceFile: string;
  sourceLine: number;
  sourceColumn: number;
  tagName: string;
  domPath: string;
  textSnippet: string;
  ignoredAt: string;
};

const IGNORE_FILE = path.join(process.cwd(), 'data', 'ui-inspector', 'translation-ignore.json');

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Only available in development' }, { status: 403 });
  }

  return NextResponse.json(readIgnoreFile());
}

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Only available in development' }, { status: 403 });
  }

  const body = (await request.json()) as Partial<IgnoreRecord>;
  const record = normalizeRecord(body);
  if (!record) {
    return NextResponse.json({ error: 'Missing ignore record fields' }, { status: 400 });
  }

  const data = readIgnoreFile();
  data.records[record.key] = record;
  writeIgnoreFile(data);
  return NextResponse.json({ success: true, record, records: data.records });
}

export async function DELETE(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Only available in development' }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as { key?: string };
  const key = String(body.key ?? request.nextUrl.searchParams.get('key') ?? '');
  if (!key) {
    return NextResponse.json({ error: 'Missing ignore key' }, { status: 400 });
  }

  const data = readIgnoreFile();
  delete data.records[key];
  writeIgnoreFile(data);
  return NextResponse.json({ success: true, records: data.records });
}

function normalizeRecord(body: Partial<IgnoreRecord>): IgnoreRecord | null {
  const sourceFile = String(body.sourceFile ?? '');
  const sourceLine = Number(body.sourceLine ?? 0);
  const sourceColumn = Number(body.sourceColumn ?? 0);
  const textSnippet = String(body.textSnippet ?? '');
  const route = String(body.route ?? '');
  const tagName = String(body.tagName ?? '');
  const domPath = String(body.domPath ?? '');

  const hasSource = Boolean(sourceFile && sourceLine);
  const hasDomFallback = Boolean(domPath || textSnippet);
  if (!route || !tagName || (!hasSource && !hasDomFallback)) return null;

  return {
    key: generateTranslationItemKey({ sourceFile, sourceLine, sourceColumn, textSnippet, route, tagName, domPath }),
    route,
    sourceFile,
    sourceLine,
    sourceColumn,
    tagName,
    domPath,
    textSnippet,
    ignoredAt: new Date().toISOString(),
  };
}



function readIgnoreFile(): { records: Record<string, IgnoreRecord> } {
  if (!existsSync(IGNORE_FILE)) return { records: {} };
  return JSON.parse(readFileSync(IGNORE_FILE, 'utf-8')) as { records: Record<string, IgnoreRecord> };
}

function writeIgnoreFile(data: { records: Record<string, IgnoreRecord> }): void {
  mkdirSync(path.dirname(IGNORE_FILE), { recursive: true });
  writeFileSync(IGNORE_FILE, `${JSON.stringify(data, null, 2)}\n`, 'utf-8');
}
