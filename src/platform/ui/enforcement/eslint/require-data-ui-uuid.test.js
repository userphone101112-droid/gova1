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
      code: '<div data-ui-uuid={HOME.CURATED_OFFERS.SECTION_TITLE.uuid} />',
      filename: 'src/app/page.tsx',
    },
    {
      code: '<html><body><div data-ui-uuid={HOME.CURATED_OFFERS.SECTION_TITLE.uuid} /></body></html>',
      filename: 'src/app/layout.tsx',
    },
    {
      code: '<option data-ui-uuid={SETTINGS.LANGUAGE_REGION.CAIRO.uuid} />',
      filename: 'src/app/(app)/settings/page.tsx',
    },
    {
      code: 'const Icon = () => (<svg data-ui-uuid={HOME.CURATED_OFFERS.SECTION_TITLE.uuid}><path d="M0 0" /></svg>);',
      filename: 'src/components/Icon.tsx',
    },
    // UUIDs are now optional - elements without UUID are valid
    {
      code: '<div />',
      filename: 'src/app/page.tsx',
    },
    {
      code: '<html><body><div /></body></html>',
      filename: 'src/app/layout.tsx',
    },
    {
      code: '<div data-ui-uuid={HOME.CURATED_OFFERS.SECTION_TITLE.uuid}><option>x</option></div>',
      filename: 'src/app/(app)/settings/page.tsx',
    },
    {
      code: '<svg data-ui-uuid={HOME.CURATED_OFFERS.SECTION_TITLE.uuid}><path d="M0 0" /></svg>',
      filename: 'src/components/Icon.tsx',
    },
  ],
  invalid: [
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
      code: '<section {...props} />',
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
