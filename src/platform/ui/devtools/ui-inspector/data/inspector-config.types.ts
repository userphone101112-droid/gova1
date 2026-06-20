import type { InspectorRoutePath } from '../../inspector-routes';
import type { InspectElementSnapshot } from '../../UiInspectorFrameBridge';

import type { ElementAttribute, ElementBinding } from './element-binding.types';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export type SidebarSection =
  | 'elementBindings'
  | 'databaseCatalog'
  | 'storageCatalog'
  | 'simulationInsights'
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
  databaseName: string;
  tableName: string;
  columnName: string;
};

export type ElementFormState = {
  bindings: ElementBinding[];
  activeBindingId: string;
  customAttributes: ElementAttribute[];
  databaseEnabled: boolean;
  databaseName: string;
  tableName: string;
  columnName: string;
  inf1: string;
  inf2: string;
  inf3: string;
  storageEnabled: boolean;
  storageMainFile: string;
  storageSubFile: string;
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
  bindings?: ElementBinding[];
  customAttributes?: ElementAttribute[];
  databaseEnabled: boolean;
  databaseName?: string;
  tableName?: string;
  columnName?: string;
  inf1: string;
  inf2: string;
  inf3: string;
  storageEnabled?: boolean;
  storageMainFile?: string;
  storageSubFile?: string;
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
