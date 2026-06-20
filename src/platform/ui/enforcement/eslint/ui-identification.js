/**
 * Registry validation ESLint rules (UUID-first).
 */

const validateRegistryUniqueness = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Validate that all UI identifiers in the registry are unique',
      category: 'Best Practices',
      recommended: true,
    },
    schema: [],
    messages: {
      duplicateIdentifier:
        'Duplicate UI identifier found in registry: "{{identifier}}". All identifiers must be unique.',
    },
  },
  create(context) {
    return {
      Program(node) {
        const filename = (context.filename || context.getFilename()).replace(/\\/g, '/');
        if (!filename.endsWith('registry/registry.ts') && !filename.includes('registry/categories/') && !filename.includes('registry/features/')) {
          return;
        }

        const identifiers = [];

        function collectPathProperties(current) {
          if (!current || typeof current !== 'object') {
            return;
          }

          if (
            current.type === 'Property' &&
            current.key?.type === 'Identifier' &&
            current.key.name === 'path' &&
            current.value?.type === 'Literal' &&
            typeof current.value.value === 'string' &&
            /^[a-z0-9-]+(\.[a-z0-9-]+){2,3}$/.test(current.value.value)
          ) {
            identifiers.push({ value: current.value.value, node: current.value });
          }

          for (const [childKey, value] of Object.entries(current)) {
            if (childKey === 'parent') {
              continue;
            }
            if (Array.isArray(value)) {
              value.forEach(collectPathProperties);
            } else if (value && typeof value === 'object') {
              collectPathProperties(value);
            }
          }
        }

        collectPathProperties(node);

        const seen = new Set();
        identifiers.forEach(({ value, node: valueNode }) => {
          if (seen.has(value)) {
            context.report({
              node: valueNode,
              messageId: 'duplicateIdentifier',
              data: { identifier: value },
            });
          }
          seen.add(value);
        });
      },
    };
  },
};

module.exports = {
  rules: {
    'validate-registry-uniqueness': validateRegistryUniqueness,
  },
};
