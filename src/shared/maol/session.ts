/**
 * MAOL — Session ID Management
 *
 * Manages the MAOL session ID using a browser cookie.
 * Session ID format: maol_<10-char nanoid>
 * TTL: 24 hours
 *
 * This module is browser-only. All functions are no-ops on server.
 */

const COOKIE_NAME = 'maol_session';
const COOKIE_TTL_SECONDS = 60 * 60 * 24; // 24 hours
const SESSION_PREFIX = 'maol_';

/**
 * Read a cookie value by name from document.cookie.
 */
function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const pairs = document.cookie.split(';');
  for (const pair of pairs) {
    const [key, val] = pair.trim().split('=');
    if (key === name) return decodeURIComponent(val || '');
  }
  return null;
}

/**
 * Write a cookie with SameSite=Strict for security.
 */
function writeCookie(name: string, value: string, maxAgeSeconds: number): void {
  if (typeof document === 'undefined') return;
  document.cookie = [
    `${name}=${encodeURIComponent(value)}`,
    `Max-Age=${maxAgeSeconds}`,
    'Path=/',
    'SameSite=Strict',
  ].join('; ');
}

/**
 * Generate a short random session ID without external dependencies.
 * Format: maol_XXXXXXXXXX (10 alphanumeric chars)
 */
function generateSessionId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = SESSION_PREFIX;
  const array = new Uint8Array(10);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
    for (const byte of array) {
      result += chars[byte % chars.length];
    }
  } else {
    // Fallback for environments without crypto
    for (let i = 0; i < 10; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
  }
  return result;
}

/**
 * Validate that a session ID matches the expected MAOL format.
 */
export function isValidMaolSessionId(id: string): boolean {
  return typeof id === 'string' && id.startsWith(SESSION_PREFIX) && id.length >= 11;
}

/**
 * Get the current MAOL session ID from cookie, or create a new one.
 * Always returns a valid session ID string.
 *
 * Browser-only. Returns 'maol_server' on server-side execution.
 */
export function getMaolSessionId(): string {
  if (typeof document === 'undefined') return `${SESSION_PREFIX}server`;

  const existing = readCookie(COOKIE_NAME);
  if (existing && isValidMaolSessionId(existing)) {
    // Refresh TTL on each access
    writeCookie(COOKIE_NAME, existing, COOKIE_TTL_SECONDS);
    return existing;
  }

  const newId = generateSessionId();
  writeCookie(COOKIE_NAME, newId, COOKIE_TTL_SECONDS);
  return newId;
}

/**
 * Clear the MAOL session cookie (e.g., on logout or explicit reset).
 */
export function clearMaolSession(): void {
  if (typeof document === 'undefined') return;
  writeCookie(COOKIE_NAME, '', 0);
}
