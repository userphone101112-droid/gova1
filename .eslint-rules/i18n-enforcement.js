/**
 * Custom ESLint rules for i18n Enforcement
 */

const { readFileSync, existsSync } = require('fs');
const { join } = require('path');

// Check if migration mode is enabled
const MIGRATION_MODE = process.env.MIGRATION_MODE === 'true';

/**
 * Load all translation keys from the generated translation keys type file
 */
function loadTranslationKeys() {
  const translationKeysPath = join(process.cwd(), 'src', 'shared', 'i18n', 'translation-keys.d.ts');
  
  if (!existsSync(translationKeysPath)) {
    // If the file doesn't exist, return empty set
    return new Set();
  }
  
  const content = readFileSync(translationKeysPath, 'utf-8');
  const keys = new Set();
  
  // Extract translation keys from the type definition file
  // Pattern: 'feature.path.key'
  const keyRegex = /'([a-z0-9-]+(?:\.[a-z0-9-]+)*)'/g;
  let match;
  
  while ((match = keyRegex.exec(content)) !== null) {
    keys.add(match[1]);
  }
  
  return keys;
}

/**
 * Rule: Validate translation keys
 * Ensures all t("...") calls use valid translation keys that exist in the registry
 */
const validateTranslationKeys = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Validate that all translation keys used in t() calls exist in the translation registry',
      category: 'Best Practices',
      recommended: true,
    },
    schema: [],
    messages: {
      invalidTranslationKey: 'Translation key "{{key}}" does not exist in the translation registry. Available keys are loaded from src/shared/i18n/translation-keys.d.ts. Run "npm run i18n:generate-keys" to update the registry.',
    },
  },
  create(context) {
    const translationKeys = loadTranslationKeys();
    const filename = (context.filename || context.getFilename()).replace(/\\/g, '/');
    
    // Skip test files and storybook files
    if (filename.includes('.test.') || 
        filename.includes('.spec.') || 
        filename.includes('.stories.') ||
        filename.includes('__tests__') ||
        filename.includes('__stories__')) {
      return {};
    }
    
    // In migration mode, downgrade errors to warnings
    const severity = MIGRATION_MODE ? 'warn' : 'error';
    
    return {
      CallExpression(node) {
        // Check for t("...") calls
        if (node.callee.type === 'Identifier' && node.callee.name === 't') {
          const firstArg = node.arguments[0];
          
          // Check if the argument is a string literal
          if (firstArg && firstArg.type === 'Literal' && typeof firstArg.value === 'string') {
            const key = firstArg.value;
            
            // Validate the key exists in the translation registry
            if (!translationKeys.has(key)) {
              context.report({
                node: firstArg,
                messageId: 'invalidTranslationKey',
                data: {
                  key,
                },
                severity,
              });
            }
          }
        }
      },
    };
  },
};

/**
 * Rule: No hardcoded text in JSX
 * Ensures all visible text in JSX comes from i18n translations
 */
const noHardcodedText = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow hardcoded text in JSX. All visible text must come from i18n translations.',
      category: 'Best Practices',
      recommended: true,
    },
    schema: [],
    messages: {
      hardcodedText: 'Hardcoded text "{{text}}" found in JSX. Use translation function t("...") instead. Visible text must be internationalized.',
    },
  },
  create(context) {
    const filename = (context.filename || context.getFilename()).replace(/\\/g, '/');
    
    // Skip test files, storybook files, and translation JSON files
    if (filename.includes('.test.') || 
        filename.includes('.spec.') || 
        filename.includes('.stories.') ||
        filename.includes('__tests__') ||
        filename.includes('__stories__') ||
        filename.endsWith('.json')) {
      return {};
    }
    
    // In migration mode, downgrade errors to warnings
    const severity = MIGRATION_MODE ? 'warn' : 'error';
    
    return {
      JSXText(node) {
        const text = node.value.trim();
        
        // Skip empty text and whitespace-only text
        if (!text) {
          return;
        }
        
        // Skip numbers-only text
        if (/^\d+$/.test(text)) {
          return;
        }
        
        // Skip text that looks like CSS classes (contains hyphens, spaces, common CSS patterns)
        if (/^[\w\s\-:]+$/.test(text) && (text.includes('-') || text.includes(' ') || text.includes(':'))) {
          return;
        }
        
        // Skip text that looks like code/technical content
        if (/^[a-zA-Z0-9_\-\.]+$/.test(text) && text.length < 3) {
          return;
        }
        
        // Skip if parent is a JSXAttribute (className, etc.)
        if (node.parent && node.parent.type === 'JSXAttribute') {
          return;
        }
        
        // Skip if parent is a JSXExpressionContainer
        if (node.parent && node.parent.type === 'JSXExpressionContainer') {
          return;
        }
        
        // Skip if grandparent is a JSXAttribute (nested in attribute)
        if (node.parent && node.parent.parent && node.parent.parent.type === 'JSXAttribute') {
          return;
        }
        
        // Report hardcoded text
        context.report({
          node,
          messageId: 'hardcodedText',
          data: {
            text: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
          },
          severity,
        });
      },
      
      JSXAttribute(node) {
        // Check for hardcoded text in attributes that should use translations
        if (node.value && node.value.type === 'Literal' && typeof node.value.value === 'string') {
          const attrName = node.name.name;
          const value = node.value.value.trim();
          
          // Skip aria-* attributes, data-* attributes, and technical attributes
          if (attrName && (
            attrName.startsWith('aria-') ||
            attrName.startsWith('data-') ||
            attrName === 'id' ||
            attrName === 'className' ||
            attrName === 'href' ||
            attrName === 'src' ||
            attrName === 'alt' ||
            attrName === 'type' ||
            attrName === 'name' ||
            attrName === 'placeholder' // placeholder should also use translations
          )) {
            // Allow aria-* and data-* attributes
            if (attrName.startsWith('aria-') || attrName.startsWith('data-')) {
              return;
            }
            
            // For placeholder, it should use translations but we'll be lenient for now
            if (attrName === 'placeholder') {
              return;
            }
            
            // Skip technical values
            if (!value || /^[a-zA-Z0-9_\-\.]+$/.test(value)) {
              return;
            }
          }
          
          // Check if this looks like user-facing text
          if (value.length > 2 && /[a-zA-Z]{2,}/.test(value)) {
            context.report({
              node: node.value,
              messageId: 'hardcodedText',
              data: {
                text: value.substring(0, 50) + (value.length > 50 ? '...' : ''),
              },
              severity,
            });
          }
        }
      },
    };
  },
};

/**
 * Rule: Validate UI identifier ↔ i18n namespace alignment
 * Ensures UI identifiers and translation keys belong to the same feature namespace
 */
const validateUiI18nAlignment = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Validate that UI identifiers and translation keys belong to the same feature namespace',
      category: 'Best Practices',
      recommended: true,
    },
    schema: [],
    messages: {
      namespaceMismatch: 'UI identifier "{{uiIdentifier}}" belongs to feature "{{uiFeature}}" but translation key "{{translationKey}}" belongs to feature "{{translationFeature}}". Both must belong to the same feature namespace.',
    },
  },
  create(context) {
    const filename = (context.filename || context.getFilename()).replace(/\\/g, '/');
    
    // Skip test files and storybook files
    if (filename.includes('.test.') || 
        filename.includes('.spec.') || 
        filename.includes('.stories.') ||
        filename.includes('__tests__') ||
        filename.includes('__stories__')) {
      return {};
    }
    
    // In migration mode, downgrade errors to warnings
    const severity = MIGRATION_MODE ? 'warn' : 'error';
    
    // Extract feature from UI identifier (e.g., "home.hero.start-button" -> "home")
    function extractFeatureFromUiIdentifier(identifier) {
      if (typeof identifier !== 'string') {
        return null;
      }
      const parts = identifier.split('.');
      return parts.length > 0 ? parts[0] : null;
    }
    
    // Extract feature from translation key (e.g., "home.title" -> "home")
    function extractFeatureFromTranslationKey(key) {
      if (typeof key !== 'string') {
        return null;
      }
      const parts = key.split('.');
      return parts.length > 0 ? parts[0] : null;
    }
    
    let uiIdentifierValues = new Map(); // Store UI identifier values by JSX element
    
    return {
      JSXOpeningElement(node) {
        const componentName = node.name.name;
        
        // Check if this is a Ui* component
        if (componentName && componentName.startsWith('Ui')) {
          const uiAttr = node.attributes.find(
            attr => attr.type === 'JSXAttribute' && attr.name.name === 'ui'
          );
          
          if (uiAttr && uiAttr.value) {
            let uiValue = null;
            
            // Extract the UI identifier value
            if (uiAttr.value.type === 'Literal') {
              uiValue = uiAttr.value.value;
            } else if (uiAttr.value.type === 'JSXExpressionContainer') {
              // Try to evaluate simple member expressions
              if (uiAttr.value.expression.type === 'MemberExpression') {
                // This is complex to evaluate statically, so we'll skip for now
                // In a real implementation, you'd want to resolve the constant
                return;
              }
            }
            
            if (uiValue && typeof uiValue === 'string') {
              uiIdentifierValues.set(node, uiValue);
            }
          }
        }
      },
      
      CallExpression(node) {
        // Check for t("...") calls
        if (node.callee.type === 'Identifier' && node.callee.name === 't') {
          const firstArg = node.arguments[0];
          
          // Check if the argument is a string literal
          if (firstArg && firstArg.type === 'Literal' && typeof firstArg.value === 'string') {
            const translationKey = firstArg.value;
            
            // Find the parent JSX element to check for UI identifier
            let parent = node.parent;
            let jsxElement = null;
            
            while (parent) {
              if (parent.type === 'JSXOpeningElement') {
                jsxElement = parent;
                break;
              }
              parent = parent.parent;
            }
            
            if (jsxElement && uiIdentifierValues.has(jsxElement)) {
              const uiIdentifier = uiIdentifierValues.get(jsxElement);
              const uiFeature = extractFeatureFromUiIdentifier(uiIdentifier);
              const translationFeature = extractFeatureFromTranslationKey(translationKey);
              
              // Allow common translations
              if (translationFeature === 'common') {
                return;
              }
              
              // Check if features match
              if (uiFeature && translationFeature && uiFeature !== translationFeature) {
                context.report({
                  node: firstArg,
                  messageId: 'namespaceMismatch',
                  data: {
                    uiIdentifier,
                    uiFeature,
                    translationKey,
                    translationFeature,
                  },
                  severity,
                });
              }
            }
          }
        }
      },
      
      // Clean up stored values when leaving elements
      'JSXOpeningElement:exit'(node) {
        uiIdentifierValues.delete(node);
      },
    };
  },
};

/**
 * Rule: Require UI-i18n binding
 * Ensures that UI identifiers have corresponding translation keys
 */
const requireUiI18nBinding = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require that UI identifiers have corresponding translation keys in the binding registry',
      category: 'Best Practices',
      recommended: true,
    },
    schema: [],
    messages: {
      missingBinding: 'UI identifier "{{uiIdentifier}}" does not have a corresponding translation key binding. Add the translation key to your i18n files and binding registry.',
    },
  },
  create(context) {
    const filename = (context.filename || context.getFilename()).replace(/\\/g, '/');
    
    // Skip test files and storybook files
    if (filename.includes('.test.') || 
        filename.includes('.spec.') || 
        filename.includes('.stories.') ||
        filename.includes('__tests__') ||
        filename.includes('__stories__')) {
      return {};
    }
    
    // In migration mode, downgrade errors to warnings
    const severity = MIGRATION_MODE ? 'warn' : 'error';
    
    const translationKeys = loadTranslationKeys();
    
    return {
      JSXOpeningElement(node) {
        const componentName = node.name.name;
        
        // Check if this is a Ui* component
        if (componentName && componentName.startsWith('Ui')) {
          const uiAttr = node.attributes.find(
            attr => attr.type === 'JSXAttribute' && attr.name.name === 'ui'
          );
          
          if (uiAttr && uiAttr.value) {
            let uiValue = null;
            
            // Extract the UI identifier value
            if (uiAttr.value.type === 'Literal') {
              uiValue = uiAttr.value.value;
            } else if (uiAttr.value.type === 'JSXExpressionContainer') {
              // For member expressions, we can't statically validate
              return;
            }
            
            if (uiValue && typeof uiValue === 'string') {
              // Generate expected translation key
              const parts = uiValue.split('.');
              if (parts.length >= 4) {
                const feature = parts[0];
                const section = parts[1];
                const element = parts[3];
                
                // Convert kebab-case to camelCase
                const camelCaseElement = element.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
                const expectedKey = `${feature}.${section}.${camelCaseElement}`;
                
                // Check if the translation key exists
                if (!translationKeys.has(expectedKey)) {
                  context.report({
                    node: uiAttr,
                    messageId: 'missingBinding',
                    data: {
                      uiIdentifier: uiValue,
                    },
                    severity,
                  });
                }
              }
            }
          }
        }
      },
    };
  },
};

/**
 * Rule: No orphan translations
 * Detects translation keys that are defined but never used
 */
const noOrphanTranslations = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Detect translation keys that are defined but never used in the codebase',
      category: 'Best Practices',
      recommended: true,
    },
    schema: [],
    messages: {
      orphanTranslation: 'Translation key "{{key}}" is defined but never used. Remove it from your i18n files or use it in a component.',
    },
  },
  create(context) {
    const filename = (context.filename || context.getFilename()).replace(/\\/g, '/');
    
    // Skip this rule for now - it requires full project scan
    // This should be run as a separate audit script
    return {};
  },
};

/**
 * Rule: Enforce UI-translation coupling
 * Ensures that translation keys are used within proper UI context
 */
const enforceUiTranslationCoupling = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce that translation keys are used within proper UI component context',
      category: 'Best Practices',
      recommended: true,
    },
    schema: [],
    messages: {
      missingUiContext: 'Translation key "{{key}}" is used without UI context. Wrap it in a Ui* component with proper ui prop.',
    },
  },
  create(context) {
    const filename = (context.filename || context.getFilename()).replace(/\\/g, '/');
    
    // Skip test files and storybook files
    if (filename.includes('.test.') || 
        filename.includes('.spec.') || 
        filename.includes('.stories.') ||
        filename.includes('__tests__') ||
        filename.includes('__stories__')) {
      return {};
    }
    
    // In migration mode, downgrade errors to warnings
    const severity = MIGRATION_MODE ? 'warn' : 'error';
    
    let hasUiContext = false;
    
    return {
      JSXOpeningElement(node) {
        const componentName = node.name.name;
        
        // Check if this is a Ui* component
        if (componentName && componentName.startsWith('Ui')) {
          hasUiContext = true;
        }
      },
      
      'JSXOpeningElement:exit'(node) {
        const componentName = node.name.name;
        if (componentName && componentName.startsWith('Ui')) {
          hasUiContext = false;
        }
      },
      
      CallExpression(node) {
        // Check for t("...") calls
        if (node.callee.type === 'Identifier' && node.callee.name === 't') {
          const firstArg = node.arguments[0];
          
          // Check if the argument is a string literal
          if (firstArg && firstArg.type === 'Literal' && typeof firstArg.value === 'string') {
            const key = firstArg.value;
            
            // Allow common translations
            if (key.startsWith('common.')) {
              return;
            }
            
            // Check if we're in a UI context
            if (!hasUiContext) {
              context.report({
                node: firstArg,
                messageId: 'missingUiContext',
                data: {
                  key,
                },
                severity,
              });
            }
          }
        }
      },
    };
  },
};

/**
 * Rule: No Directional Violations (enforce logical properties)
 * Blocks all physical directional properties (ml, mr, left, right, text-left, text-right)
 * and enforces use of logical properties (ms, me, start, end, text-start, text-end)
 */
const noDirectionalViolations = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow physical directional properties (ml, mr, left, right, text-left, text-right). Use logical properties (ms, me, start, end, text-start, text-end) instead for RTL/LTR compatibility.',
      category: 'Best Practices',
      recommended: true,
    },
    schema: [],
    messages: {
      directionalViolation: 'Physical directional property "{{property}}" found. Use logical property "{{replacement}}" instead for RTL/LTR compatibility.',
    },
  },
  create(context) {
    const filename = (context.filename || context.getFilename()).replace(/\\/g, '/');
    
    // Skip test files and storybook files
    if (filename.includes('.test.') || 
        filename.includes('.spec.') || 
        filename.includes('.stories.') ||
        filename.includes('__tests__') ||
        filename.includes('__stories__')) {
      return {};
    }
    
    // In migration mode, downgrade errors to warnings
    const severity = MIGRATION_MODE ? 'warn' : 'error';
    
    // Define violation patterns and their replacements
    const violations = {
      'ml-': 'ms-',
      'mr-': 'me-',
      'text-left': 'text-start',
      'text-right': 'text-end',
      'left-': 'start-',
      'right-': 'end-',
    };
    
    return {
      // Check className attributes in JSX
      JSXAttribute(node) {
        if (node.name.name === 'className' && node.value) {
          let classNameValue = '';
          
          if (node.value.type === 'Literal') {
            classNameValue = node.value.value || '';
          } else if (node.value.type === 'JSXExpressionContainer') {
            // Handle template literals and simple expressions
            if (node.value.expression.type === 'TemplateLiteral') {
              classNameValue = node.value.expression.quasis.map(q => q.value.raw).join(' ');
            }
          }
          
          // Check for violations in className
          for (const [violation, replacement] of Object.entries(violations)) {
            if (classNameValue.includes(violation)) {
              context.report({
                node: node.value,
                messageId: 'directionalViolation',
                data: {
                  property: violation,
                  replacement: replacement,
                },
                severity,
              });
            }
          }
        }
      },
      
      // Check inline styles in JSX
      JSXAttribute(node) {
        if (node.name.name === 'style' && node.value) {
          if (node.value.type === 'JSXExpressionContainer') {
            const expression = node.value.expression;
            
            // Check for style objects with left/right properties
            if (expression.type === 'ObjectExpression') {
              expression.properties.forEach(prop => {
                if (prop.type === 'ObjectProperty') {
                  const keyName = prop.key.type === 'Identifier' 
                    ? prop.key.name 
                    : prop.key.type === 'Literal' 
                      ? prop.key.value 
                      : '';
                  
                  if (keyName === 'left' || keyName === 'right' || 
                      keyName === 'marginLeft' || keyName === 'marginRight') {
                    context.report({
                      node: prop,
                      messageId: 'directionalViolation',
                      data: {
                        property: keyName,
                        replacement: keyName.replace('left', 'Start').replace('right', 'End').replace('Left', 'Start').replace('Right', 'End'),
                      },
                      severity,
                    });
                  }
                }
              });
            }
          }
        }
      },
    };
  },
};

module.exports = {
  rules: {
    'validate-translation-keys': validateTranslationKeys,
    'no-hardcoded-text': noHardcodedText,
    'validate-ui-i18n-alignment': validateUiI18nAlignment,
    'require-ui-i18n-binding': requireUiI18nBinding,
    'no-orphan-translations': noOrphanTranslations,
    'enforce-ui-translation-coupling': enforceUiTranslationCoupling,
    'no-directional-violations': noDirectionalViolations,
  },
};
