/**
 * RuleTester for require-data-ui-uuid absolute mode (run: npm run test:eslint-ui)
 */
const { RuleTester } = require('eslint');

const { requireDataUiUuid } = require('./require-data-ui-uuid.js');

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

ruleTester.run('require-data-ui-uuid', requireDataUiUuid, {
  valid: [
    {
      code: '<div data-ui-uuid={HOME.CURATED_OFFERS.CONTAINER.uuid} />',
      filename: 'src/app/page.tsx',
    },
    {
      code: '<html data-ui-uuid={SHARED_LAYOUT.ROOT.HTML.uuid}><body data-ui-uuid={SHARED_LAYOUT.ROOT.BODY.uuid}><div data-ui-uuid={HOME.CURATED_OFFERS.CONTAINER.uuid} /></body></html>',
      filename: 'src/app/layout.tsx',
    },
    {
      code: '<option data-ui-uuid={SETTINGS.LANGUAGE_REGION.CAIRO_OPTION.uuid} />',
      filename: 'src/app/(shell)/settings/page.tsx',
    },
    {
      code: 'const Icon = () => (<svg data-ui-uuid={HOME.CURATED_OFFERS.CONTAINER.uuid}><path data-ui-uuid={HOME.CURATED_OFFERS.HEADER.uuid} d="M0 0" /></svg>);',
      filename: 'src/components/Icon.tsx',
    },
  ],
  invalid: [
    {
      code: '<div />',
      filename: 'src/app/page.tsx',
      errors: [{ messageId: 'missingUuid' }],
    },
    {
      code: '<html><body><div data-ui-uuid={HOME.CURATED_OFFERS.CONTAINER.uuid} /></body></html>',
      filename: 'src/app/layout.tsx',
      errors: [{ messageId: 'missingUuid' }, { messageId: 'missingUuid' }],
    },
    {
      code: '<div data-ui-uuid={HOME.CURATED_OFFERS.CONTAINER.uuid}><option>x</option></div>',
      filename: 'src/app/(shell)/settings/page.tsx',
      errors: [{ messageId: 'missingUuid' }],
    },
    {
      code: '<svg data-ui-uuid={HOME.CURATED_OFFERS.CONTAINER.uuid}><path d="M0 0" /></svg>',
      filename: 'src/components/Icon.tsx',
      errors: [{ messageId: 'missingUuid' }],
    },
    {
      code: '<div data-ui-uuid={COMMON_LAYOUT.SECTION.uuid} />',
      filename: 'src/app/page.tsx',
      errors: [{ messageId: 'bannedGeneric' }],
    },
    {
      code: '<main data-ui-uuid={COMMON_LAYOUT.MAIN.uuid} />',
      filename: 'src/app/page.tsx',
      errors: [{ messageId: 'bannedGeneric' }],
    },
    {
      code: '<section {...uiUuid(HOME.PROMO_BANNER.CONTAINER)} />',
      filename: 'src/app/page.tsx',
      errors: [{ messageId: 'forbiddenSpread' }],
    },
    {
      code: '<div data-ui-uuid={someVar.uuid} />',
      filename: 'src/app/page.tsx',
      errors: [{ messageId: 'unknownPath' }],
    },
  ],
});

console.log('require-data-ui-uuid RuleTester passed');
