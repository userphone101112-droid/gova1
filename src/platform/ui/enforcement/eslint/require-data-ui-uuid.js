/**
 * ESLint rule: absolute data-ui-uuid on every intrinsic JSX element.
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
      description: 'Require absolute registry-backed data-ui-uuid on every JSX intrinsic element',
      recommended: true,
    },
    schema: [],
    messages: {
      missingUuid:
        'Intrinsic <{{tag}}> requires data-ui-uuid={REGISTRY.IDENTITY.uuid}. No inherited UUID from parent.',
      invalidUuid:
        'data-ui-uuid must be data-ui-uuid={REGISTRY.PATH.uuid}. No variables, spreads, or literals.',
      unknownPath: 'Unknown registry path "{{path}}". Register via registry:add.',
      bannedGeneric:
        'Banned generic identity "{{path}}". Use a dedicated element identity (not COMMON_*, DECORATIVE.*, STRUCTURE.*).',
      forbiddenSpread: 'JSX spread props are forbidden on intrinsics. Use data-ui-uuid={REGISTRY.PATH.uuid} only.',
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

        if (!result.valid) {
          if (result.reason === 'missing') {
            context.report({ node, messageId: 'missingUuid', data: { tag: tagName } });
          } else if (result.reason === 'bannedGeneric') {
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
