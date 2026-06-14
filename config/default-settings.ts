/**
 * Default Settings
 * Default values for application settings
 */

import { AppSettings } from './settings.schema';

export const DEFAULT_SETTINGS: AppSettings = {
  // UI Settings
  theme: 'system',
  language: 'en',
  languageMode: 'system',
  maintenance: {
    enabled: false,
    accessCode: '1234',
    message: 'The application is under maintenance. / التطبيق حالياً قيد الصيانة.'
  },
  maintenanceBypassed: false,
  
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
