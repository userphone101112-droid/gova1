/* eslint-disable i18n-enforcement/no-hardcoded-text */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';

import { NextRequest, NextResponse } from 'next/server';

type CheckTranslationItem = {
  key: string;
  route: string;
  scanKey: string;
  textSnippet: string;
  tagName: string;
  uuid: string;
  sourceFile: string;
  sourceLine: number;
  sourceColumn: number;
  domPath: string;
  reason: 'hardcoded-text' | 'lang-uuid-incomplete';
  savedAt: string;
};

const CHECK_FILE = path.join(process.cwd(), 'data', 'ui-inspector', 'check-translation.json');

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Only available in development' }, { status: 403 });
  }

  return NextResponse.json(readCheckFile());
}

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Only available in development' }, { status: 403 });
  }

  const body = (await request.json()) as { items?: Partial<CheckTranslationItem>[] };
  const items = (body.items ?? [])
    .map(normalizeItem)
    .filter((item): item is CheckTranslationItem => Boolean(item));

  const data = {
    savedAt: new Date().toISOString(),
    items,
  };
  writeCheckFile(data);

  return NextResponse.json({ success: true, count: items.length, items });
}

function normalizeItem(body: Partial<CheckTranslationItem>): CheckTranslationItem | null {
  const route = String(body.route ?? '');
  const textSnippet = String(body.textSnippet ?? '');
  const tagName = String(body.tagName ?? '');
  const sourceFile = String(body.sourceFile ?? '');
  const sourceLine = Number(body.sourceLine ?? 0);
  const sourceColumn = Number(body.sourceColumn ?? 0);
  const domPath = String(body.domPath ?? '');
  const uuid = String(body.uuid ?? '');
  const reason = body.reason === 'lang-uuid-incomplete' ? 'lang-uuid-incomplete' : 'hardcoded-text';
  const key = String(body.key ?? createItemKey({ route, sourceFile, sourceLine, sourceColumn, tagName, domPath, textSnippet }));

  if (!route || !tagName || (!textSnippet && !uuid)) return null;

  return {
    key,
    route,
    scanKey: String(body.scanKey ?? ''),
    textSnippet,
    tagName,
    uuid,
    sourceFile,
    sourceLine,
    sourceColumn,
    domPath,
    reason,
    savedAt: new Date().toISOString(),
  };
}

function createItemKey(input: {
  route: string;
  sourceFile: string;
  sourceLine: number;
  sourceColumn: number;
  tagName: string;
  domPath: string;
  textSnippet: string;
}): string {
  return [
    input.route,
    input.sourceFile.replace(/\\/g, '/'),
    input.sourceLine,
    input.sourceColumn,
    input.tagName,
    input.domPath,
    input.textSnippet.trim(),
  ].join('|');
}

function readCheckFile(): { savedAt: string | null; items: CheckTranslationItem[] } {
  if (!existsSync(CHECK_FILE)) return { savedAt: null, items: [] };
  return JSON.parse(readFileSync(CHECK_FILE, 'utf-8')) as { savedAt: string | null; items: CheckTranslationItem[] };
}

function writeCheckFile(data: { savedAt: string; items: CheckTranslationItem[] }): void {
  mkdirSync(path.dirname(CHECK_FILE), { recursive: true });
  writeFileSync(CHECK_FILE, `${JSON.stringify(data, null, 2)}\n`, 'utf-8');
}
