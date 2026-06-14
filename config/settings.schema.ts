/**
 * Settings Schema Types
 * Type-safe definitions for application settings and feature flags
 */

// Theme types
export type ThemeMode = 'light' | 'dark' | 'system';

// Language types
export type LanguageCode = 'en' | 'ar' | 'fr' | 'es' | 'de';
export type LanguageMode = 'system' | 'ar' | 'en';

export interface MaintenanceSettings {
  enabled: boolean;
  accessCode: string;
  message?: string;
}

// Application Settings Interface
export interface AppSettings {
  // UI Settings
  theme: ThemeMode;
  language: LanguageCode;
  languageMode: LanguageMode;
  
  // Maintenance
  maintenance: MaintenanceSettings;
  maintenanceBypassed: boolean;
  
  // Display Settings
  fontSize: number;
  density: 'compact' | 'comfortable' | 'spacious';
  
  // Accessibility
  highContrast: boolean;
  reducedMotion: boolean;
  
  // Notifications
  enableNotifications: boolean;
  notificationSound: boolean;
  
  // Privacy
  analyticsEnabled: boolean;
  crashReportingEnabled: boolean;
}

// Feature Flags Interface
export interface FeatureFlags {
  // Feature toggles
  darkMode: boolean;
  multiLanguage: boolean;
  advancedSearch: boolean;
  exportData: boolean;
  importData: boolean;
  
  // Experimental features
  experimentalUI: boolean;
  betaFeatures: boolean;
  
  // Integration features
  socialSharing: boolean;
  offlineMode: boolean;
}

// Partial update types
export type PartialSettings = Partial<AppSettings>;
export type FeatureFlagKey = keyof FeatureFlags;
