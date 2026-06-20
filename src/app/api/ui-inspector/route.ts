import { NextResponse } from 'next/server';

import { getUiIdentityUuid, getUiIdentityByUuid } from '@/platform/ui';
import { isUiInspectorEnabled } from '@/platform/ui/devtools/inspector-access';
import {
  normalizeBindings,
  syncLegacyFieldsFromBindings,
} from '@/platform/ui/devtools/ui-inspector/data/element-binding-utils';
import type { ElementAttribute } from '@/platform/ui/devtools/ui-inspector/data/element-binding.types';
import {
  mergeInspectorEntry,
  resolveInspectorIdentityKey,
} from '@/platform/ui/devtools/ui-inspector/data/inspector-config-storage';
import type { InspectorDataEntry } from '@/platform/ui/devtools/ui-inspector/data/inspector-config.types';
import {
  loadInspectorDataMapFromLayout,
  saveInspectorEntryToLayout,
} from '@/platform/ui/devtools/ui-inspector/services/inspector-persistence.service';

function uiInspectorNotFoundResponse(): NextResponse {
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

export async function GET() {
  if (!isUiInspectorEnabled()) {
    return uiInspectorNotFoundResponse();
  }

  try {
    const data = await loadInspectorDataMapFromLayout();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading inspector data:', error);
    return NextResponse.json({ error: 'Failed to read data' }, { status: 500 });
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
      bindings,
      customAttributes,
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
      route,
    } = body;

    if (!uiUuid) {
      return NextResponse.json({ error: 'Missing uiUuid parameter' }, { status: 400 });
    }

    const identity = getUiIdentityByUuid(uiUuid);
    const resolvedUuid = identity ? getUiIdentityUuid(identity) : uiUuid || '';
    const resolvedInstanceId = uiInstanceId === undefined || uiInstanceId === null ? '' : String(uiInstanceId);
    const storageKey = resolveInspectorIdentityKey(resolvedUuid, resolvedInstanceId);

    const normalizedBindings = Array.isArray(bindings) ? normalizeBindings(bindings) : [];
    const normalizedAttributes: ElementAttribute[] = Array.isArray(customAttributes) ? customAttributes : [];

    let entry: InspectorDataEntry = {
      bindings: normalizedBindings,
      customAttributes: normalizedAttributes,
      databaseEnabled: databaseEnabled ?? false,
      databaseName: databaseName || '',
      tableName: tableName || '',
      columnName: columnName || '',
      inf1: inf1 || '',
      inf2: inf2 || '',
      inf3: inf3 || '',
      storageEnabled: storageEnabled ?? false,
      storageMainFile: storageMainFile || '',
      storageSubFile: storageSubFile || '',
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

    entry = syncLegacyFieldsFromBindings(entry, normalizedBindings);
    entry.bindings = normalizedBindings;
    entry.customAttributes = normalizedAttributes;
    entry.inf1 = inf1 || '';
    entry.inf2 = inf2 || '';
    entry.inf3 = inf3 || '';

    const merged = await saveInspectorEntryToLayout(entry, {
      ...(typeof route === 'string' ? { route } : {}),
    });

    return NextResponse.json({
      success: true,
      uiUuid: storageKey,
      id: identity?.id,
      data: mergeInspectorEntry(merged, storageKey, entry),
    });
  } catch (error) {
    console.error('Error saving inspector data:', error);
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
  }
}
