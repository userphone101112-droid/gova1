/**
 * Default Settings
 * Default values for application settings
 */

import { AppSettings } from './settings.schema';

export const DEFAULT_SETTINGS: AppSettings = {
  // UI Settings
  theme: 'system',
  language: 'en',
  
  // Display Settings
  fontSize: 16,
  density: 'comfortable',
  
  // Accessibility
  highContrast: false,
  reducedMotion: false,
  
  // Notifications
  enableNotifications: true,
  notificationSound: true,
  
  // Privacy
  analyticsEnabled: true,
  crashReportingEnabled: true,
};
