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
  maintenanceBypassed: boolean;
}

// Store Actions Interface
interface SettingsStoreActions {
  setSettings: (settings: PartialSettings) => void;
  setFeature: (key: FeatureFlagKey, value: boolean) => void;
  setMaintenanceBypass: (bypassed: boolean) => void;
  reset: () => void;
  isMaintenanceEnabled: () => boolean;
  isMaintenanceActive: () => boolean;
  getEffectiveLanguage: () => 'en' | 'ar';
}

// Combined Store Type
type SettingsStore = SettingsStoreState & SettingsStoreActions;

// Create the Zustand store
export const useSettingsStore = create<SettingsStore>((set, get) => ({
  // Initial state from config files
  settings: { ...DEFAULT_SETTINGS },
  features: { ...FEATURE_FLAGS },
  maintenanceBypassed: DEFAULT_SETTINGS.maintenanceBypassed,
  
  // Actions
  setSettings: (partialSettings) =>
    set((state) => ({
      settings: { ...state.settings, ...partialSettings },
    })),
  
  setFeature: (key, value) =>
    set((state) => ({
      features: { ...state.features, [key]: value },
    })),
    
  setMaintenanceBypass: (bypassed) =>
    set({ maintenanceBypassed: bypassed }),
  
  reset: () =>
    set({
      settings: { ...DEFAULT_SETTINGS },
      features: { ...FEATURE_FLAGS },
      maintenanceBypassed: DEFAULT_SETTINGS.maintenanceBypassed,
    }),

  // Helpers inside store
  isMaintenanceEnabled: () => {
    return get().settings.maintenance.enabled;
  },

  isMaintenanceActive: () => {
    const state = get();
    return state.settings.maintenance.enabled && !state.maintenanceBypassed;
  },

  getEffectiveLanguage: () => {
    const { languageMode } = get().settings;
    if (languageMode === 'system') {
      if (typeof window !== 'undefined') {
        const match = document.cookie.match(/(^| )locale=([^;]+)/);
        const val = match ? match[2] : null;
        if (val === 'en' || val === 'ar') {
          return val as 'en' | 'ar';
        }
        // Fallback to browser system language
        const navLang = navigator.language || '';
        return navLang.startsWith('ar') ? 'ar' : 'en';
      }
      return 'en';
    }
    return languageMode as 'en' | 'ar';
  }
}));

// Export helper functions for direct import compatibility
export function isMaintenanceEnabled(): boolean {
  return useSettingsStore.getState().isMaintenanceEnabled();
}

export function isMaintenanceActive(): boolean {
  return useSettingsStore.getState().isMaintenanceActive();
}

export function getEffectiveLanguage(): 'en' | 'ar' {
  return useSettingsStore.getState().getEffectiveLanguage();
}
