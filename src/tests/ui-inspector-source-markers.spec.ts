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
  test('should persist check translation and ignore records', async ({ request }: any) => {
    const payload = {
      key: `test|translation|${Date.now()}`,
      route: '/home',
      scanKey: 'scan-test',
      sourceFile: 'src/tests/fixtures/translation-ignore-fixture.tsx',
      sourceLine: 7,
      sourceColumn: 4,
      tagName: 'span',
      uuid: '',
      domPath: 'main > span',
      textSnippet: `Translation fixture ${Date.now()}`,
      reason: 'hardcoded-text',
    };

    const saveResponse = await request.post('/api/ui-inspector/check-translation', {
      data: { items: [payload] },
    });
    expect(saveResponse.ok()).toBeTruthy();
    const saveJson = await saveResponse.json();
    expect(saveJson.success).toBe(true);
    expect(saveJson.count).toBe(1);

    const checkResponse = await request.get('/api/ui-inspector/check-translation');
    expect(checkResponse.ok()).toBeTruthy();
    const checkJson = await checkResponse.json();
    expect(checkJson.items[0].key).toBe(payload.key);

    const createResponse = await request.post('/api/ui-inspector/translation-ignore', {
      data: payload,
    });
    expect(createResponse.ok()).toBeTruthy();

    const createJson = await createResponse.json();
    expect(createJson.success).toBe(true);
    expect(createJson.record.key).toContain(payload.textSnippet);

    const listResponse = await request.get('/api/ui-inspector/translation-ignore');
    expect(listResponse.ok()).toBeTruthy();
    const listJson = await listResponse.json();
    expect(listJson.records[createJson.record.key].textSnippet).toBe(payload.textSnippet);

    const deleteResponse = await request.delete('/api/ui-inspector/translation-ignore', {
      data: { key: createJson.record.key },
    });
    expect(deleteResponse.ok()).toBeTruthy();
    const deleteJson = await deleteResponse.json();
    expect(deleteJson.records[createJson.record.key]).toBeUndefined();
  });

  test('should show working back and forward controls next to route selector', async ({ page }: any) => {
    await page.goto('/devtools/ui-inspector');

    const routeSelector = page.locator('select').first();
    const backButton = page.getByRole('button', { name: 'Back' }).first();
    const forwardButton = page.getByRole('button', { name: 'Forward' }).first();

    await expect(routeSelector).toBeVisible();
    await expect(backButton).toBeVisible();
    await expect(forwardButton).toBeVisible();
    await expect(backButton).toBeDisabled();
    await expect(forwardButton).toBeDisabled();

    await routeSelector.selectOption('/settings');
    await expect(backButton).toBeEnabled();
    await expect(forwardButton).toBeDisabled();

    await backButton.click();
    await expect(routeSelector).toHaveValue('/home');
    await expect(forwardButton).toBeEnabled();

    await forwardButton.click();
    await expect(routeSelector).toHaveValue('/settings');
  });

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

  test('should expose source markers on normal dev pages after UUID pruning', async ({ page }: any) => {
    await page.goto('/home?inspect=1');

    const elementWithSourceMarker = page.locator('[data-gova-source-file]').first();
    await expect(elementWithSourceMarker).toBeVisible();
  });
});
