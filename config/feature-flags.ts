/**
 * Feature Flags
 * Feature toggle configuration for the application
 */

import { FeatureFlags } from './settings.schema';

export const FEATURE_FLAGS: FeatureFlags = {
  // Feature toggles
  darkMode: true,
  multiLanguage: true,
  advancedSearch: false,
  exportData: true,
  importData: true,
  
  // Experimental features
  experimentalUI: false,
  betaFeatures: false,
  
  // Integration features
  socialSharing: true,
  offlineMode: false,
};
