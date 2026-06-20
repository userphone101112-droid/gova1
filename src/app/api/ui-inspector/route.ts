import fs from 'fs/promises';
import path from 'path';

import { NextResponse } from 'next/server';

import { getUiIdentityUuid, getUiIdentityByUuid } from '@/platform/ui';

// Define the type for our inspector data
interface InspectorData {
  [uiId: string]: {
    databaseEnabled: boolean;
    inf1: string;
    inf2: string;
    inf3: string;
    attributesEnabled: boolean;
    attribute1: boolean;
    attribute2: boolean;
    attribute3: boolean;
    dataUiPath: string;
    dataUiFeature: string;
    dataUiUuid: string;
    dataUiInstanceId: string;
    dataUiIdentityKey: string;
    updatedAt: string;
  };
}

// Path to our JSON file
const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'ui-inspector-data.json');

// Helper function to read data
async function readData(): Promise<InspectorData> {
  try {
    const data = await fs.readFile(DATA_FILE_PATH, 'utf8');
    return JSON.parse(data) as InspectorData;
  } catch {
    // If file doesn't exist, return empty object
    return {};
  }
}

// Helper function to write data
async function writeData(data: InspectorData): Promise<void> {
  await fs.writeFile(DATA_FILE_PATH, JSON.stringify(data, null, 2));
}

// GET: Fetch all inspector data
export async function GET() {
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

// POST: Save or update inspector data for a specific UI element
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      uiUuid,
      uiInstanceId,
      databaseEnabled, 
      inf1, 
      inf2, 
      inf3, 
      attributesEnabled, 
      attribute1, 
      attribute2, 
      attribute3 
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
    const storageKey = resolvedUuid && resolvedInstanceId
      ? `${resolvedUuid}:${resolvedInstanceId}`
      : resolvedUuid;
    
    // Update the data
    data[storageKey] = {
      databaseEnabled: databaseEnabled ?? false,
      inf1: inf1 || '',
      inf2: inf2 || '',
      inf3: inf3 || '',
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

    await writeData(data);

    return NextResponse.json({ success: true, uiUuid: storageKey, id: identity?.id });
  } catch (error) {
    console.error('Error saving inspector data:', error);
    return NextResponse.json(
      { error: 'Failed to save data' },
      { status: 500 }
    );
  }
}
