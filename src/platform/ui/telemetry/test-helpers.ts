/**
 * Playwright Testing Utilities for Persistent UI Identity Platform
 * 
 * These helpers allow test scripts to select DOM elements using stable UI IDs 
 * instead of fragile CSS selectors or layout-dependent xpath queries.
 * 
 * @example
 * import { getByUiId } from '@/shared/ui-test-helpers';
 * 
 * test('should submit login form', async ({ page }) => {
 *   await page.goto('/login');
 *   await getByUiId(page, 'UI_AUTH_LOGIN_EMAIL_INPUT').fill('user@example.com');
 *   await getByUiId(page, 'UI_AUTH_LOGIN_PASSWORD_INPUT').fill('password123');
 *   await getByUiId(page, 'UI_AUTH_LOGIN_SUBMIT_BUTTON').click();
 * });
 */

/**
 * Locate a DOM element by its stable UI Identity ID.
 * 
 * @param page Playwright Page object (typed as any to prevent build dependencies)
 * @param id Stable UI Identity ID (e.g., 'UI_AUTH_LOGIN_SUBMIT_BUTTON')
 * @returns Playwright Locator
 */
export function getByUiId(page: any, id: string): any {
  if (!page || typeof page.locator !== 'function') {
    throw new Error('[UI Test Helpers] Invalid Page object passed to getByUiId.');
  }
  return page.locator(`[data-ui-id="${id}"]`);
}

/**
 * Locate a DOM element by its hierarchical UI Path.
 * Useful as a secondary fallback or for validation assertions.
 * 
 * @param page Playwright Page object
 * @param path Hierarchical UI Path (e.g., 'auth.login.form.submit-button')
 * @returns Playwright Locator
 */
export function getByUiPath(page: any, path: string): any {
  if (!page || typeof page.locator !== 'function') {
    throw new Error('[UI Test Helpers] Invalid Page object passed to getByUiPath.');
  }
  return page.locator(`[data-ui-path="${path}"]`);
}

/**
 * Locate all DOM elements belonging to a specific feature area.
 * 
 * @param page Playwright Page object
 * @param feature Feature name (e.g., 'auth', 'shared-layout')
 * @returns Playwright Locator
 */
export function getByUiFeature(page: any, feature: string): any {
  if (!page || typeof page.locator !== 'function') {
    throw new Error('[UI Test Helpers] Invalid Page object passed to getByUiFeature.');
  }
  return page.locator(`[data-ui-feature="${feature}"]`);
}
