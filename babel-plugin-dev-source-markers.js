/**
 * Babel plugin to add dev-only source markers to JSX elements.
 * This plugin adds data-gova-source-* attributes to help the UI Inspector
 * locate the source file and line for elements without UUID.
 * 
 * Only runs in development mode.
 */

module.exports = function (babel) {
  const { types: t } = babel;

  return {
    name: 'dev-source-markers',
    visitor: {
      JSXElement(path, state) {
        // Skip if not in development
        if (process.env.NODE_ENV !== 'development') return;

        const openingElement = path.node.openingElement;
        if (
          !t.isJSXIdentifier(openingElement.name) ||
          openingElement.name.name !== openingElement.name.name.toLowerCase()
        ) {
          return;
        }
        
        // Skip if element already has data-ui-uuid (it's already tracked)
        const hasUuidAttr = openingElement.attributes.some(attr =>
          t.isJSXAttribute(attr) &&
          t.isJSXIdentifier(attr.name) &&
          attr.name.name === 'data-ui-uuid'
        );
        if (hasUuidAttr) return;

        // Skip if element already has source markers
        const hasSourceMarkers = openingElement.attributes.some(attr =>
          t.isJSXAttribute(attr) &&
          t.isJSXIdentifier(attr.name) &&
          attr.name.name.startsWith('data-gova-source-')
        );
        if (hasSourceMarkers) return;

        // Get source location
        const { line, column } = path.node.loc.start;
        const filename = state.file.opts.filename || '';

        // Skip if no filename
        if (!filename) return;

        // Extract component name from filename
        const componentName = filename.split(/[/\\]/).pop()?.replace(/\.(tsx?|jsx?)$/, '') || '';

        // Add dev-only source markers (will be stripped by a runtime check if not in inspect mode)
        const sourceAttrs = [
          t.jsxAttribute(
            t.jsxIdentifier('data-gova-source-file'),
            t.stringLiteral(filename)
          ),
          t.jsxAttribute(
            t.jsxIdentifier('data-gova-source-line'),
            t.stringLiteral(String(line))
          ),
          t.jsxAttribute(
            t.jsxIdentifier('data-gova-source-column'),
            t.stringLiteral(String(column))
          ),
          t.jsxAttribute(
            t.jsxIdentifier('data-gova-source-component'),
            t.stringLiteral(componentName)
          ),
        ];

        // Add attributes to opening element
        openingElement.attributes.push(...sourceAttrs);
      },
    },
  };
};
