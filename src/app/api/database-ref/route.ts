import fs from 'fs/promises';
import path from 'path';

import { NextResponse } from 'next/server';

import {
  emptyDatabaseRefFile,
  normalizeDatabaseRefFile,
  type DatabaseRefFile,
} from '@/platform/ui/devtools/database-ref-types';
import { isUiInspectorEnabled } from '@/platform/ui/devtools/inspector-access';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'database_ref.json');

function notFoundResponse(): NextResponse {
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

async function readDatabaseRef(): Promise<DatabaseRefFile> {
  try {
    const raw = await fs.readFile(DATA_FILE_PATH, 'utf8');
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start === -1 || end === -1 || end <= start) {
      return emptyDatabaseRefFile();
    }
    const jsonSlice = raw.slice(start, end + 1);
    return normalizeDatabaseRefFile(JSON.parse(jsonSlice) as unknown);
  } catch {
    return emptyDatabaseRefFile();
  }
}

async function writeDatabaseRef(data: DatabaseRefFile): Promise<void> {
  await fs.writeFile(DATA_FILE_PATH, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

export async function GET() {
  if (!isUiInspectorEnabled()) {
    return notFoundResponse();
  }

  try {
    const data = await readDatabaseRef();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading database_ref.json:', error);
    return NextResponse.json({ error: 'Failed to read database reference' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!isUiInspectorEnabled()) {
    return notFoundResponse();
  }

  try {
    const body = await request.json();
    const data = normalizeDatabaseRefFile(body);
    await writeDatabaseRef(data);
    return NextResponse.json({ success: true, databases: data.databases.length });
  } catch (error) {
    console.error('Error writing database_ref.json:', error);
    return NextResponse.json({ error: 'Failed to save database reference' }, { status: 500 });
  }
}
