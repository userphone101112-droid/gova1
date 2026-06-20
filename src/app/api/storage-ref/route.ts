import fs from 'fs/promises';
import path from 'path';

import { NextResponse } from 'next/server';

import { isUiInspectorEnabled } from '@/platform/ui/devtools/inspector-access';
import {
  emptyStorageRefFile,
  normalizeStorageRefFile,
} from '@/platform/ui/devtools/ui-inspector/data/storage-ref-utils';
import type { StorageRefFile } from '@/platform/ui/devtools/ui-inspector/data/storage-ref.types';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'storage.json');

function notFoundResponse(): NextResponse {
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

async function readStorageRef(): Promise<StorageRefFile> {
  try {
    const raw = await fs.readFile(DATA_FILE_PATH, 'utf8');
    return normalizeStorageRefFile(JSON.parse(raw) as unknown);
  } catch {
    return emptyStorageRefFile();
  }
}

async function writeStorageRef(data: StorageRefFile): Promise<void> {
  await fs.writeFile(DATA_FILE_PATH, `${JSON.stringify(normalizeStorageRefFile(data), null, 2)}\n`, 'utf8');
}

export async function GET() {
  if (!isUiInspectorEnabled()) {
    return notFoundResponse();
  }

  try {
    const data = await readStorageRef();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading storage.json:', error);
    return NextResponse.json({ error: 'Failed to read storage reference' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!isUiInspectorEnabled()) {
    return notFoundResponse();
  }

  try {
    const body = await request.json();
    const data = normalizeStorageRefFile(body);
    await writeStorageRef(data);
    return NextResponse.json({ success: true, folders: data.folders.length });
  } catch (error) {
    console.error('Error writing storage.json:', error);
    return NextResponse.json({ error: 'Failed to save storage reference' }, { status: 500 });
  }
}
