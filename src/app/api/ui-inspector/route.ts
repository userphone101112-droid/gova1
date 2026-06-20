import fs from 'fs/promises';
import path from 'path';

import { NextResponse } from 'next/server';

import {
  mergeInspectorEntry,
  normalizeInspectorDataMap,
  resolveInspectorIdentityKey,
} from '@/platform/ui/devtools/ui-inspector/data/inspector-config-storage';
import type { InspectorDataEntry } from '@/platform/ui/devtools/ui-inspector/data/inspector-config.types';
import { getUiIdentityUuid, getUiIdentityByUuid } from '@/platform/ui';
import { isUiInspectorEnabled } from '@/platform/ui/devtools/inspector-access';

type InspectorData = Record<string, InspectorDataEntry>;

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'ui-inspector-data.json');

function uiInspectorNotFoundResponse(): NextResponse {
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

async function readData(): Promise<InspectorData> {
  try {
    const data = await fs.readFile(DATA_FILE_PATH, 'utf8');
    return normalizeInspectorDataMap(JSON.parse(data) as InspectorData);
  } catch {
    return {};
  }
}

async function writeData(data: InspectorData): Promise<void> {
  const normalized = normalizeInspectorDataMap(data);
  await fs.writeFile(DATA_FILE_PATH, `${JSON.stringify(normalized, null, 2)}\n`, 'utf8');
}

export async function GET() {
  if (!isUiInspectorEnabled()) {
    return uiInspectorNotFoundResponse();
  }

  try {
    const data = await readData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading inspector data:', error);
    return NextResponse.json(
      { error: 'Failed to read data' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!isUiInspectorEnabled()) {
    return uiInspectorNotFoundResponse();
  }

  try {
    const body = await request.json();
    const {
      uiUuid,
      uiInstanceId,
      databaseEnabled,
      databaseName,
      tableName,
      columnName,
      inf1,
      inf2,
      inf3,
      storageEnabled,
      storageMainFile,
      storageSubFile,
      attributesEnabled,
      attribute1,
      attribute2,
      attribute3,
    } = body;

    if (!uiUuid) {
      return NextResponse.json(
        { error: 'Missing uiUuid parameter' },
        { status: 400 }
      );
    }

    const data = await readData();
    const identity = getUiIdentityByUuid(uiUuid);
    const resolvedUuid = identity ? getUiIdentityUuid(identity) : uiUuid || '';
    const resolvedInstanceId = uiInstanceId === undefined || uiInstanceId === null ? '' : String(uiInstanceId);
    const storageKey = resolveInspectorIdentityKey(resolvedUuid, resolvedInstanceId);
    const storageOn = storageEnabled ?? false;

    const entry: InspectorDataEntry = {
      databaseEnabled: databaseEnabled ?? false,
      databaseName: databaseName || '',
      tableName: tableName || '',
      columnName: columnName || '',
      inf1: inf1 || '',
      inf2: inf2 || '',
      inf3: inf3 || '',
      storageEnabled: storageOn,
      storageMainFile: storageOn ? storageMainFile || '' : '',
      storageSubFile: storageOn ? storageSubFile || '' : '',
      attributesEnabled: attributesEnabled ?? false,
      attribute1: attribute1 ?? false,
      attribute2: attribute2 ?? false,
      attribute3: attribute3 ?? false,
      dataUiPath: identity?.path || '',
      dataUiFeature: identity?.feature || '',
      dataUiUuid: resolvedUuid,
      dataUiInstanceId: resolvedInstanceId,
      dataUiIdentityKey: storageKey,
      updatedAt: new Date().toISOString(),
    };

    await writeData(mergeInspectorEntry(data, storageKey, entry));

    return NextResponse.json({ success: true, uiUuid: storageKey, id: identity?.id });
  } catch (error) {
    console.error('Error saving inspector data:', error);
    return NextResponse.json(
      { error: 'Failed to save data' },
      { status: 500 }
    );
  }
}
