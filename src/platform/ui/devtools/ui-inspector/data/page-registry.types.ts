import type { InspectorRoutePath } from '../../inspector-routes';

export type PageRegistryEntry = {
  path: InspectorRoutePath;
  label: string;
  feature: string;
};

export type PageRegistrySnapshot = {
  pages: PageRegistryEntry[];
  loadedAt: string;
};
