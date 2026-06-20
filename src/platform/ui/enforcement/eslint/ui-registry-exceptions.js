/**
 * UUID ESLint exceptions — test files only. No DOM tag exemptions.
 */

const PROVIDER_COMPONENTS = new Set([
  'Suspense',
  'I18nProvider',
  'LocaleProvider',
  'QueryClientProvider',
  'ThemeProvider',
  'FormProvider',
  'ErrorBoundary',
]);

function normalizeFilename(filename) {
  return filename.replace(/\\/g, '/');
}

function isTestFile(filename) {
  return (
    filename.includes('.test.') ||
    filename.includes('.spec.') ||
    filename.includes('.stories.') ||
    filename.includes('__tests__') ||
    filename.includes('__stories__')
  );
}

function isSkippedFile(filename) {
  return isTestFile(normalizeFilename(filename));
}

function isFragmentElement(node) {
  if (!node.name) return false;
  if (node.name.type === 'JSXIdentifier' && node.name.name === 'Fragment') return true;
  return node.name.type === 'JSXFragment';
}

function isProviderComponent(node) {
  if (node.name?.type !== 'JSXIdentifier') return false;
  return PROVIDER_COMPONENTS.has(node.name.name);
}

module.exports = {
  PROVIDER_COMPONENTS,
  normalizeFilename,
  isTestFile,
  isSkippedFile,
  isFragmentElement,
  isProviderComponent,
};
