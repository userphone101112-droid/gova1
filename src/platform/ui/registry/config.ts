/**
 * UI Registry Configuration
 * 
 * Configuration for the UI Registry system, including production settings.
 */

export const UI_REGISTRY_CONFIG = {
  /**
   * Enable/disable runtime validation
   * In production, validation is disabled for performance
   */
  enableValidation: process.env.NODE_ENV === 'development',

  /**
   * Enable/disable strict mode
   * In strict mode, all UI elements must have UI identities
   */
  strictMode: true,

  /**
   * Enable/disable warnings for deprecated identities
   */
  warnDeprecated: process.env.NODE_ENV === 'development',

  /**
   * Enable/disable warnings for legacy string-based identities
   */
  warnLegacy: process.env.NODE_ENV === 'development',

  /**
   * Enable/disable auto-fix for common issues
   */
  autoFix: false,

  /**
   * Log level for registry operations
   * 'error' | 'warn' | 'info' | 'debug'
   */
  logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'error',
} as const;
