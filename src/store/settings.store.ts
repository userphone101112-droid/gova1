/**
 * Settings Store
 * Zustand store for application settings and feature flags
 * Pure in-memory state management - no persistence, no API calls, no DB
 */

import { create } from 'zustand';
import { DEFAULT_SETTINGS } from '../../config/default-settings';
import { FEATURE_FLAGS } from '../../config/feature-flags';
import { AppSettings, FeatureFlags, PartialSettings, FeatureFlagKey } from '../../config/settings.schema';

// Store State Interface
interface SettingsStoreState {
  settings: AppSettings;
  features: FeatureFlags;
}

// Store Actions Interface
interface SettingsStoreActions {
  setSettings: (settings: PartialSettings) => void;
  setFeature: (key: FeatureFlagKey, value: boolean) => void;
  reset: () => void;
}

// Combined Store Type
type SettingsStore = SettingsStoreState & SettingsStoreActions;

// Create the Zustand store
export const useSettingsStore = create<SettingsStore>((set) => ({
  // Initial state from config files
  settings: { ...DEFAULT_SETTINGS },
  features: { ...FEATURE_FLAGS },
  
  // Actions
  setSettings: (partialSettings) =>
    set((state) => ({
      settings: { ...state.settings, ...partialSettings },
    })),
  
  setFeature: (key, value) =>
    set((state) => ({
      features: { ...state.features, [key]: value },
    })),
  
  reset: () =>
    set({
      settings: { ...DEFAULT_SETTINGS },
      features: { ...FEATURE_FLAGS },
    }),
}));
