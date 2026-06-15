/**
 * MAOL — Live System Test Script
 *
 * Tests the full MAOL pipeline:
 *  1. Creates a test session directly in the SQLite store
 *  2. Inserts sample error + warning + DOM summary
 *  3. Reads the session back via the store
 *  4. Prints the full structured response
 *
 * Usage: npx tsx scripts/test-maol.ts
 */

import { storeError, storeWarning, storeDomSummary, getSessionData, purgeSession } from '../src/lib/maol-store';
import type { MaolErrorEvent, MaolWarningEvent, MaolDomSummary } from '../src/shared/maol/types';

const TEST_SESSION = 'maol_TESTsession1';

console.log('\n🔭 MAOL System Test\n' + '='.repeat(50));

// ─── Cleanup any previous test run ──────────────────
purgeSession(TEST_SESSION);
console.log(`✓ Purged previous test session: ${TEST_SESSION}`);

// ─── Insert a test error ─────────────────────────────
const testError: MaolErrorEvent = {
  type: 'error',
  message: 'TypeError: Cannot read properties of undefined (reading "map")',
  stack: 'at CuratedOffers.render (CuratedOffers.tsx:42)\n  at renderWithHooks',
  route: '/home',
  timestamp: Date.now(),
  uiContext: 'UI_HOME_CURATED_OFFERS_MORE',
  env: 'dev',
};
storeError(TEST_SESSION, testError);
console.log('✓ Stored test error');

// ─── Insert a test warning ───────────────────────────
const testWarning: MaolWarningEvent = {
  type: 'warning',
  message: '[UI Registry Deprecation] Legacy string-based UI identity "home.old-button" is deprecated.',
  route: '/home',
  component: 'PromoBanner',
  severity: 'high',
  timestamp: Date.now() + 100,
  env: 'dev',
};
storeWarning(TEST_SESSION, testWarning);
console.log('✓ Stored test warning');

// ─── Insert a test DOM summary ───────────────────────
const testDom: MaolDomSummary = {
  route: '/home',
  timestamp: Date.now() + 200,
  totalIdentified: 7,
  tree: {
    type: 'page',
    children: [
      {
        name: 'home',
        uiIds: [
          'UI_HOME_PROMO_BANNER_ACTION',
          'UI_HOME_CURATED_OFFERS_MORE',
          'UI_HOME_CURATED_OFFERS_ADD_TO_CART',
          'UI_HOME_CATEGORIES_GRID_TOGGLE',
          'UI_HOME_CATEGORIES_GRID_ITEM',
        ],
        tags: ['button'],
      },
      {
        name: 'shared-layout',
        uiIds: [
          'UI_SHARED_HEADER_MENU',
          'UI_SHARED_HEADER_BRAND_LINK',
        ],
        tags: ['button', 'a'],
      },
    ],
  },
};
storeDomSummary(TEST_SESSION, testDom);
console.log('✓ Stored test DOM summary');

// ─── Read back ───────────────────────────────────────
const result = getSessionData(TEST_SESSION);

console.log('\n' + '='.repeat(50));
console.log('📦 MAOL Agent Response\n');
console.log(JSON.stringify(result, null, 2));

console.log('\n' + '='.repeat(50));
console.log('📊 Summary:');
console.log(`  Session ID   : ${result?.sessionId}`);
console.log(`  Total Errors : ${result?.summary.totalErrors}`);
console.log(`  Total Warnings: ${result?.summary.totalWarnings}`);
console.log(`  Routes Visited: ${result?.summary.routesVisited.join(', ')}`);
console.log(`  Session Start : ${result?.summary.sessionStart}`);
console.log(`  DOM Summaries : ${result?.dom.length}`);
console.log('\n✅ MAOL is fully operational\n');

// ─── Print usage info ────────────────────────────────
console.log('='.repeat(50));
console.log('🌐 Endpoints (when dev server is running):');
console.log('\nPOST http://localhost:3001/api/maol/ingest');
console.log('  Body: { sessionId, events: [...] }');
console.log('\nGET  http://localhost:3001/api/maol/session/<sessionId>');
console.log('  Header: Authorization: Bearer FOJWLmzwq1RcPDrtbyk2H6ueQMsgvY4i');
console.log('\nYour current MAOL_SECRET: FOJWLmzwq1RcPDrtbyk2H6ueQMsgvY4i');
console.log('\nTo test live: Open browser → MAOL assigns cookie maol_<id>');
console.log('Then call GET /api/maol/session/<your-cookie-id> with the Bearer token');
console.log('='.repeat(50) + '\n');
