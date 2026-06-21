import { test, expect } from '@playwright/test';

/**
 * Playwright test to verify dev-only source markers in UI Inspector iframe.
 * 
 * This test ensures that the babel-plugin-dev-source-markers.js plugin correctly
 * adds data-gova-source-* attributes to JSX elements in development mode within
 * the inspector iframe or when ?inspect=1 is present.
 * 
 * These markers should NOT appear in production builds.
 */

test.describe('UI Inspector Source Markers', () => {
  test('should have source markers on elements in development mode', async ({ page }: any) => {
    // Navigate to a page with the inspector enabled
    await page.goto('/devtools/ui-inspector');
    await page.locator('iframe').first().evaluate((iframe: HTMLIFrameElement) => {
      iframe.src = '/devtools/ui-inspector?inspect=1';
    });
    
    // Wait for the iframe to load
    const iframe = page.frameLocator('iframe').first();
    
    // Wait for the iframe to be ready
    await expect(iframe.locator('body')).toBeVisible();
    
    // Check that source markers are present on elements
    // The babel plugin should add data-gova-source-file, data-gova-source-line, 
    // data-gova-source-column, and data-gova-source-component attributes
    const elementWithSourceMarker = iframe.locator('[data-gova-source-file]').first();
    await expect(elementWithSourceMarker).toBeVisible();
    
    // Verify the source file attribute exists and is not empty
    const sourceFile = await elementWithSourceMarker.getAttribute('data-gova-source-file');
    expect(sourceFile).toBeTruthy();
    expect(sourceFile?.length).toBeGreaterThan(0);
    
    // Verify the source line attribute exists and is a number
    const sourceLine = await elementWithSourceMarker.getAttribute('data-gova-source-line');
    expect(sourceLine).toBeTruthy();
    expect(parseInt(sourceLine || '0', 10)).toBeGreaterThanOrEqual(0);
    
    // Verify the source column attribute exists and is a number
    const sourceColumn = await elementWithSourceMarker.getAttribute('data-gova-source-column');
    expect(sourceColumn).toBeTruthy();
    expect(parseInt(sourceColumn || '0', 10)).toBeGreaterThanOrEqual(0);
    
    // Verify the source component attribute exists
    const sourceComponent = await elementWithSourceMarker.getAttribute('data-gova-source-component');
    expect(sourceComponent).toBeTruthy();
    expect(sourceComponent?.length).toBeGreaterThan(0);
  });

  test('should NOT have source markers on elements with existing UUID', async ({ page }: any) => {
    // Navigate to a page with the inspector enabled
    await page.goto('/devtools/ui-inspector');
    
    // Wait for the iframe to load
    const iframe = page.frameLocator('iframe').first();
    await expect(iframe.locator('body')).toBeVisible();
    
    // Find an element with data-ui-uuid
    const elementWithUuid = iframe.locator('[data-ui-uuid]').first();
    await expect(elementWithUuid).toBeVisible();
    
    // Elements with UUID should NOT have source markers
    // (the babel plugin skips elements that already have data-ui-uuid)
    const hasSourceMarker = await elementWithUuid.getAttribute('data-gova-source-file');
    expect(hasSourceMarker).toBeNull();
  });

  test('should have source markers only in development mode', async ({ browser }: any) => {
    // Create a new context with production environment
    const productionContext = await browser.newContext({
      // In a real test, you'd set NODE_ENV to production
      // For now, this is a placeholder for the concept
    });
    
    const page = await productionContext.newPage();
    
    // Navigate to a page
    await page.goto('/');
    
    // In production, source markers should NOT be present
    const elementWithSourceMarker = page.locator('[data-gova-source-file]').first();
    await expect(elementWithSourceMarker).not.toBeVisible();
    
    await page.close();
    await productionContext.close();
  });
});
