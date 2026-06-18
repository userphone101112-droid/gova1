/**
 * Custom ESLint rules for UI Identification System
 */

const noDirectNativeInteractiveElements = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow direct usage of native interactive HTML elements',
      category: 'Best Practices',
      recommended: true,
    },
    schema: [],
    messages: {
      useUiComponent: 'Use Ui{{componentName}} component instead of native <{{tagName}}> element. Every interactive element must have a unique identifier via the ui prop.',
    },
  },
  create(context) {
    const nativeElements = new Set(['button', 'input', 'select', 'textarea', 'a']);
    const sourceCode = context.sourceCode || context.getSourceCode();
    const filename = (context.filename || context.getFilename()).replace(/\\/g, '/');
    
    // Skip internal runtime primitives and Ui* implementations
    if (filename.includes('runtime/primitives/') || filename.includes('runtime/components/')) {
      return {};
    }
    
    let ancestors = [];
    
    return {
      Program() {
        ancestors = [];
      },
      ':matches(FunctionDeclaration, FunctionExpression, ArrowFunctionExpression)'(node) {
        ancestors.push(node);
      },
      ':matches(FunctionDeclaration, FunctionExpression, ArrowFunctionExpression):exit'(node) {
        ancestors.pop();
      },
      JSXOpeningElement(node) {
        const tagName = node.name.name;
        
        if (nativeElements.has(tagName)) {
          // Check if this is inside a Ui* component implementation
          const parentFunction = ancestors.find(
            ancestor => ancestor.type === 'FunctionDeclaration' || 
                       ancestor.type === 'FunctionExpression' ||
                       ancestor.type === 'ArrowFunctionExpression'
          );
          
          // Allow native elements in Ui* component implementations
          if (parentFunction) {
            const functionName = parentFunction.id?.name || '';
            if (functionName.startsWith('Ui')) {
              return;
            }
          }
          
          context.report({
            node,
            messageId: 'useUiComponent',
            data: {
              componentName: tagName.charAt(0).toUpperCase() + tagName.slice(1),
              tagName,
            },
          });
        }
      },
    };
  },
};

const noBaseUiComponents = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow direct usage of base UI components. Use Ui* components instead.',
      category: 'Best Practices',
      recommended: true,
    },
    schema: [],
    messages: {
      useUiComponent: 'Use Ui{{componentName}} component instead of {{componentName}}. Every interactive element must have a unique identifier via the ui prop.',
      forbiddenImport: 'Direct import of base UI component "{{componentName}}" is forbidden. Use Ui{{componentName}} from @/platform/ui instead.',
    },
  },
  create(context) {
    const baseComponents = new Set(['Button', 'Input', 'Select', 'Textarea', 'Checkbox', 'Radio', 'Switch', 'Link']);
    const baseComponentPaths = new Set([
      '@/platform/ui/runtime/primitives/button',
      '@/platform/ui/runtime/primitives/input',
      '@/platform/ui/runtime/primitives/select',
      '@/platform/ui/runtime/primitives/textarea',
      '@/platform/ui/runtime/primitives/checkbox',
      '@/platform/ui/runtime/primitives/radio',
      '@/platform/ui/runtime/primitives/switch',
      '@/platform/ui/runtime/primitives/link',
    ]);
    const filename = (context.filename || context.getFilename()).replace(/\\/g, '/');
    
    // Skip internal runtime primitives and Ui* implementations
    if (filename.includes('runtime/primitives/') || filename.includes('runtime/components/')) {
      return {};
    }
    
    let ancestors = [];
    
    return {
      Program() {
        ancestors = [];
      },
      ':matches(FunctionDeclaration, FunctionExpression, ArrowFunctionExpression)'(node) {
        ancestors.push(node);
      },
      ':matches(FunctionDeclaration, FunctionExpression, ArrowFunctionExpression):exit'(node) {
        ancestors.pop();
      },
      JSXOpeningElement(node) {
        const componentName = node.name.name;
        
        if (baseComponents.has(componentName)) {
          // Check if this is inside a Ui* component implementation
          const parentFunction = ancestors.find(
            ancestor => ancestor.type === 'FunctionDeclaration' || 
                       ancestor.type === 'FunctionExpression' ||
                       ancestor.type === 'ArrowFunctionExpression'
          );
          
          // Allow base components in Ui* component implementations
          if (parentFunction) {
            const functionName = parentFunction.id?.name || '';
            if (functionName.startsWith('Ui')) {
              return;
            }
          }
          
          context.report({
            node,
            messageId: 'useUiComponent',
            data: {
              componentName,
            },
          });
        }
      },
      
      ImportDeclaration(node) {
        const source = node.source.value;
        
        // Check if importing from base UI components
        if (baseComponentPaths.has(source)) {
          const importedNames = node.specifiers
            .filter(spec => spec.type === 'ImportSpecifier')
            .map(spec => spec.imported.name);
          
          importedNames.forEach(name => {
            if (baseComponents.has(name)) {
              context.report({
                node,
                messageId: 'forbiddenImport',
                data: {
                  componentName: name,
                },
              });
            }
          });
        }
      },
    };
  },
};

const requireUiProp = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require ui prop on all Ui* components and validate against naming convention',
      category: 'Best Practices',
      recommended: true,
    },
    schema: [],
    messages: {
      missingUiProp: 'Ui{{componentName}} component requires a "ui" prop with a unique identifier from the registry following the format: page.section.component.element',
      invalidUiFormat: 'Ui{{componentName}} component "ui" prop value "{{value}}" does not follow the required naming convention: page.section.component.element (regex: ^[a-z0-9-]+\\.[a-z0-9-]+\\.[a-z0-9-]+\\.[a-z0-9-]+$)',
      notRegistered: 'Ui{{componentName}} component "ui" prop value "{{value}}" is not registered in the UI Registry. Add it to src/platform/ui/registry/registry.ts',
      useRegistryConstant: 'Ui{{componentName}} component "ui" prop must use a constant from the UI Registry, not a raw string. Import from @/platform/ui',
    },
  },
  create(context) {
    const namingConventionRegex = /^[a-z0-9-]+\.[a-z0-9-]+\.[a-z0-9-]+\.[a-z0-9-]+$/;
    
    return {
      JSXOpeningElement(node) {
        const componentName = node.name.name;
        
        if (componentName && componentName.startsWith('Ui')) {
          const uiAttr = node.attributes.find(
            attr => attr.type === 'JSXAttribute' && attr.name.name === 'ui'
          );
          
          if (!uiAttr) {
            context.report({
              node,
              messageId: 'missingUiProp',
              data: {
                componentName: componentName.slice(2), // Remove 'Ui' prefix
              },
            });
            return;
          }
          
          // Check if ui prop is using a raw string literal (forbidden)
          if (uiAttr.value && uiAttr.value.type === 'Literal' && typeof uiAttr.value.value === 'string') {
            const uiValue = uiAttr.value.value;
            
            // Validate naming convention
            if (!namingConventionRegex.test(uiValue)) {
              context.report({
                node: uiAttr,
                messageId: 'invalidUiFormat',
                data: {
                  componentName: componentName.slice(2),
                  value: uiValue,
                },
              });
            } else {
              // Even if format is correct, raw strings are not allowed
              context.report({
                node: uiAttr,
                messageId: 'useRegistryConstant',
                data: {
                  componentName: componentName.slice(2),
                  value: uiValue,
                },
              });
            }
          }
        }
      },
    };
  },
};

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
      duplicateIdentifier: 'Duplicate UI identifier found in registry: "{{identifier}}". All identifiers must be unique.',
    },
  },
  create(context) {
    return {
      Program(node) {
        // Only run on registry source files
        const filename = (context.filename || context.getFilename()).replace(/\\/g, '/');
        if (!filename.endsWith('registry/registry.ts') && !filename.includes('registry/categories/')) {
          return;
        }
        
        // Extract all string literals that look like UI identifiers
        const identifiers = [];
        const sourceCode = context.sourceCode || context.getSourceCode();
        
        sourceCode.ast.tokens.forEach(token => {
          if (token.type === 'String' && token.value.includes('.')) {
            const value = token.value.replace(/'/g, '').replace(/"/g, '');
            if (/^[a-z0-9-]+(\.[a-z0-9-]+){2,3}$/.test(value)) {
              identifiers.push({ value, token });
            }
          }
        });
        
        // Check for duplicates
        const seen = new Set();
        identifiers.forEach(({ value, token }) => {
          if (seen.has(value)) {
            context.report({
              loc: token.loc.start,
              messageId: 'duplicateIdentifier',
              data: {
                identifier: value,
              },
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
    'no-direct-native-interactive-elements': noDirectNativeInteractiveElements,
    'no-base-ui-components': noBaseUiComponents,
    'require-ui-prop': requireUiProp,
    'validate-registry-uniqueness': validateRegistryUniqueness,
  },
};
