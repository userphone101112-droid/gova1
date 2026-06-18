/**
 * Settings Store
 * App-level settings (maintenance, feature flags) — persisted separately from user SSOT preferences.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { DEFAULT_SETTINGS } from '../../config/default-settings';
import { FEATURE_FLAGS } from '../../config/feature-flags';
import { AppSettings, FeatureFlags, PartialSettings, FeatureFlagKey } from '../../config/settings.schema';
import { useGlobalSSOTStore } from './global-ssot.store';

interface SettingsStoreState {
  settings: AppSettings;
  features: FeatureFlags;
  maintenanceBypassed: boolean;
}

interface SettingsStoreActions {
  setSettings: (settings: PartialSettings) => void;
  setFeature: (key: FeatureFlagKey, value: boolean) => void;
  setMaintenanceBypass: (bypassed: boolean) => void;
  reset: () => void;
  isMaintenanceEnabled: () => boolean;
  isMaintenanceActive: () => boolean;
  getEffectiveLanguage: () => 'en' | 'ar';
}

type SettingsStore = SettingsStoreState & SettingsStoreActions;

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      settings: { ...DEFAULT_SETTINGS },
      features: { ...FEATURE_FLAGS },
      maintenanceBypassed: DEFAULT_SETTINGS.maintenanceBypassed,

      setSettings: (partialSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...partialSettings },
        })),

      setFeature: (key, value) => {
        set((state) => ({
          features: { ...state.features, [key]: value },
        }));
        if (key === 'darkMode' && !value) {
          useGlobalSSOTStore.getState().setThemeMode('light');
        }
      },

      setMaintenanceBypass: (bypassed) => set({ maintenanceBypassed: bypassed }),

      reset: () =>
        set({
          settings: { ...DEFAULT_SETTINGS },
          features: { ...FEATURE_FLAGS },
          maintenanceBypassed: DEFAULT_SETTINGS.maintenanceBypassed,
        }),

      isMaintenanceEnabled: () => get().settings.maintenance.enabled,

      isMaintenanceActive: () => {
        const state = get();
        return state.settings.maintenance.enabled && !state.maintenanceBypassed;
      },

      getEffectiveLanguage: () => {
        if (typeof window !== 'undefined') {
          const ssotLang = useGlobalSSOTStore.getState().language;
          if (ssotLang === 'en' || ssotLang === 'ar') {
            return ssotLang;
          }
        }
        return 'en';
      },
    }),
    {
      name: 'gova-app-settings',
      partialize: (state) => ({
        settings: state.settings,
        features: state.features,
        maintenanceBypassed: state.maintenanceBypassed,
      }),
    }
  )
);

export function isMaintenanceEnabled(): boolean {
  return useSettingsStore.getState().isMaintenanceEnabled();
}

export function isMaintenanceActive(): boolean {
  return useSettingsStore.getState().isMaintenanceActive();
}

export function getEffectiveLanguage(): 'en' | 'ar' {
  return useSettingsStore.getState().getEffectiveLanguage();
}
