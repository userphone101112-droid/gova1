import type { InspectorRoutePath } from '../../inspector-routes';
import type { InspectElementSnapshot } from '../../UiInspectorFrameBridge';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export type SidebarSection =
  | 'dbAttributes'
  | 'dbManagement'
  | 'filters'
  | 'list'
  | 'details';

export type AttributeSettings = {
  enabled: boolean;
  attribute1: boolean;
  attribute2: boolean;
  attribute3: boolean;
};

export type ElementDatabaseSettings = {
  enabled: boolean;
  databaseId: string;
  tableId: string;
  fieldId: string;
};

export type ElementFormState = {
  databaseEnabled: boolean;
  inf1: string;
  inf2: string;
  inf3: string;
  attributesEnabled: boolean;
  attribute1: boolean;
  attribute2: boolean;
  attribute3: boolean;
};

export type ViewportSettings = {
  width: number;
  height: number;
  scale: number;
};

export interface InspectorDataEntry {
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
  updatedAt?: string;
}

export type InspectorDataMap = Record<string, InspectorDataEntry>;

export type InspectorElementConfig = {
  elementId: string;
  targetPage?: InspectorRoutePath;
  viewport?: ViewportSettings;
  database?: ElementDatabaseSettings;
  attributes?: AttributeSettings;
};

export type InspectorPersistPayload = {
  uiUuid: string;
  uiInstanceId: string;
  formState: ElementFormState;
};

export type { InspectElementSnapshot };
