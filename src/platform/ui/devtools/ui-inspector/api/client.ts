import type { DatabaseRefFile } from '../data/database-ref.types';
import type { InspectorDataMap } from '../data/inspector-config.types';

async function readJson<T>(url: string): Promise<T | null> {
  const response = await fetch(url);
  if (!response.ok) return null;
  return (await response.json()) as T;
}

async function writeJson<T>(url: string, method: 'POST' | 'PUT', body: T): Promise<void> {
  const response = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`Request failed: ${url}`);
  }
}

export const inspectorApiClient = {
  fetchInspectorData(): Promise<InspectorDataMap | null> {
    return readJson<InspectorDataMap>('/api/ui-inspector');
  },

  saveInspectorElement(payload: Record<string, unknown>): Promise<void> {
    return writeJson('/api/ui-inspector', 'POST', payload);
  },

  fetchDatabaseRef(): Promise<DatabaseRefFile | null> {
    return readJson<DatabaseRefFile>('/api/database-ref');
  },

  saveDatabaseRef(data: DatabaseRefFile): Promise<void> {
    return writeJson('/api/database-ref', 'PUT', data);
  },
};
