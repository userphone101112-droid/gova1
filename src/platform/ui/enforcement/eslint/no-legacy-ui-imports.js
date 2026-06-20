/**
 * ESLint rule: forbid legacy Ui* runtime components and factory imports.
 */

const LEGACY_UI_IMPORT = /\bUi(?:Button|Div|Input|Link|Image|Header|Label|Card|Section|Span|Main|Nav|Form|Select|Textarea|Checkbox|Radio|Switch|Modal|Badge|H[1-6]|P|A|Img)\b/;
const LEGACY_FACTORY = /\b(?:createUiComponent|createUiStyledComponent)\b/;
const LEGACY_RUNTIME_PATH = /@\/platform\/ui\/runtime/;

const noLegacyUiImports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Forbid legacy Ui* components and runtime factory imports',
      recommended: true,
    },
    schema: [],
    messages: {
      legacyUiImport:
        'Legacy Ui* component "{{name}}" is removed. Use native HTML with data-ui-uuid={REGISTRY.IDENTITY.uuid}.',
      legacyFactory:
        'Legacy factory "{{name}}" is removed. Use native HTML with data-ui-uuid={REGISTRY.IDENTITY.uuid}.',
      legacyRuntimePath:
        'Import from "@/platform/ui/runtime" is forbidden. The runtime layer has been removed.',
    },
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        const source = node.source.value;
        if (typeof source === 'string' && LEGACY_RUNTIME_PATH.test(source)) {
          context.report({ node, messageId: 'legacyRuntimePath' });
        }

        for (const spec of node.specifiers) {
          const imported =
            spec.type === 'ImportSpecifier'
              ? spec.imported.name
              : spec.type === 'ImportDefaultSpecifier'
                ? spec.local.name
                : null;
          if (!imported) continue;

          if (LEGACY_UI_IMPORT.test(imported)) {
            context.report({
              node: spec,
              messageId: 'legacyUiImport',
              data: { name: imported },
            });
          }
          if (LEGACY_FACTORY.test(imported)) {
            context.report({
              node: spec,
              messageId: 'legacyFactory',
              data: { name: imported },
            });
          }
        }
      },

      JSXOpeningElement(node) {
        if (node.name.type !== 'JSXIdentifier') return;
        const name = node.name.name;
        if (LEGACY_UI_IMPORT.test(name)) {
          context.report({
            node,
            messageId: 'legacyUiImport',
            data: { name },
          });
        }
      },
    };
  },
};

module.exports = { noLegacyUiImports };
