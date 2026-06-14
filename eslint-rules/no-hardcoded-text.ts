import { Rule } from 'eslint';

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow hardcoded text strings in JSX elements',
      category: 'Best Practices',
      recommended: false,
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowedStrings: {
            type: 'array',
            items: { type: 'string' },
          },
          ignoreAttributes: {
            type: 'array',
            items: { type: 'string' },
          },
          ignoreComponents: {
            type: 'array',
            items: { type: 'string' },
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const options = context.options[0] || {};
    const allowedStrings = options.allowedStrings || [];
    const ignoreAttributes = options.ignoreAttributes || ['aria-*', 'data-*', 'id', 'className'];
    const ignoreComponents = options.ignoreComponents || [];

    function isAllowedString(text: string): boolean {
      // Allow empty strings
      if (!text.trim()) return true;
      
      // Allow numbers
      if (/^\d+$/.test(text.trim())) return true;
      
      // Allow strings in the allowed list
      if (allowedStrings.includes(text.trim())) return true;
      
      // Allow single characters (like icons)
      if (text.trim().length === 1) return true;
      
      return false;
    }

    function isIgnoredAttribute(attributeName: string): boolean {
      return ignoreAttributes.some((pattern: string) => {
        if (pattern.endsWith('*')) {
          return attributeName.startsWith(pattern.slice(0, -1));
        }
        return attributeName === pattern;
      });
    }

    function isIgnoredComponent(componentName: string): boolean {
      return ignoreComponents.includes(componentName);
    }

    function checkJSXText(node: any) {
      const text = node.value;
      
      // Skip empty text or whitespace-only text
      if (!text || !text.trim()) return;
      
      // Skip if it's an allowed string
      if (isAllowedString(text)) return;
      
      context.report({
        node,
        message: 'Hardcoded text detected. Use translation function instead: t("key")',
      });
    }

    function checkLiteral(node: any) {
      const value = node.value;
      
      // Only check string literals
      if (typeof value !== 'string') return;
      
      // Skip if it's an allowed string
      if (isAllowedString(value)) return;
      
      context.report({
        node,
        message: 'Hardcoded text detected. Use translation function instead: t("key")',
      });
    }

    return {
      JSXText(node: any) {
        checkJSXText(node);
      },
      
      'JSXAttribute > Literal'(node: any) {
        const attribute = node.parent as any;
        
        // Skip ignored attributes
        if (attribute.name && isIgnoredAttribute(attribute.name.name)) {
          return;
        }
        
        checkLiteral(node);
      },
      
      'JSXElement'(node: any) {
        const openingElement = node.openingElement;
        const componentName = openingElement.name?.name;
        
        // Skip ignored components
        if (componentName && isIgnoredComponent(componentName)) {
          return;
        }
      },
    };
  },
};

export default rule;
