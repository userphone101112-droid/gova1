/**
 * ESLint rule: validate data-ui-uuid if present on intrinsic JSX elements.
 * UUIDs are now optional - this rule only validates that if a UUID is present,
 * it must be valid and registered in the registry.
 */

const {
  isSkippedFile,
  isFragmentElement,
  isProviderComponent,
  normalizeFilename,
} = require('./ui-registry-exceptions');
const {
  loadRegistryMemberPaths,
  loadRegistryMeta,
  getJsxTagName,
  isIntrinsicElement,
  validateOpeningElement,
  getAttribute,
} = require('./uuid-dom-validation');

const requireDataUiUuid = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Validate data-ui-uuid if present on JSX intrinsic elements. UUIDs are now optional.',
      recommended: true,
    },
    schema: [],
    messages: {
      invalidUuid:
        'data-ui-uuid must be data-ui-uuid={REGISTRY.PATH.uuid}. No variables, spreads, or literals.',
      unknownPath: 'Unknown registry path "{{path}}". Register via registry:add.',
      bannedGeneric:
        'Banned generic identity "{{path}}". Use a dedicated element identity (not COMMON_*, DECORATIVE.*, STRUCTURE.*).',
      forbiddenSpread: 'JSX spread props are forbidden on intrinsics when using data-ui-uuid. Use data-ui-uuid={REGISTRY.PATH.uuid} only.',
      duplicateUuid:
        'Registry path "{{path}}" appears {{count}} times in this file without repeatable:true.',
      missingInstanceId:
        'Repeatable identity "{{path}}" requires data-ui-instance-id on <{{tag}}>.',
    },
  },
  create(context) {
    const filename = normalizeFilename(context.filename || context.getFilename());
    if (isSkippedFile(filename)) return {};

    const registryPaths = loadRegistryMemberPaths();
    const { repeatableByPath } = loadRegistryMeta();
    const pathNodes = new Map();

    return {
      JSXOpeningElement(node) {
        if (isFragmentElement(node) || isProviderComponent(node)) return;
        if (!isIntrinsicElement(node)) return;

        const tagName = getJsxTagName(node.name);
        const result = validateOpeningElement(node, registryPaths, filename);

        // Skip elements without data-ui-uuid - they're now allowed
        if (!result.valid && result.reason === 'missing') {
          return;
        }

        if (!result.valid) {
          if (result.reason === 'bannedGeneric') {
            context.report({ node, messageId: 'bannedGeneric', data: { path: result.path } });
          } else if (result.reason === 'unknownPath') {
            context.report({ node, messageId: 'unknownPath', data: { path: result.path || '?' } });
          } else if (result.reason === 'forbiddenSpread') {
            context.report({ node, messageId: 'forbiddenSpread' });
          } else {
            context.report({ node, messageId: 'invalidUuid' });
          }
          return;
        }

        const list = pathNodes.get(result.path) || [];
        list.push({ node, tagName });
        pathNodes.set(result.path, list);

        if (repeatableByPath.get(result.path) || registryPaths.repeatablePaths.has(result.path)) {
          const instanceAttr = getAttribute(node, 'data-ui-instance-id');
          if (!instanceAttr) {
            context.report({
              node,
              messageId: 'missingInstanceId',
              data: { path: result.path, tag: tagName },
            });
          }
        }
      },

      'Program:exit'() {
        for (const [path, nodes] of pathNodes.entries()) {
          if (repeatableByPath.get(path) || registryPaths.repeatablePaths.has(path)) continue;
          if (nodes.length > 1) {
            nodes.forEach(({ node }) => {
              context.report({
                node,
                messageId: 'duplicateUuid',
                data: { path, count: String(nodes.length) },
              });
            });
          }
        }
      },
    };
  },
};

module.exports = { requireDataUiUuid };
