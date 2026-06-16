/**
 * ESLint Rule: Design Token Enforcement
 * Detects hardcoded design token values, use centralized design system instead.
 */

const designTokenEnforcementRules = {
  rules: {
    "no-hardcoded-design-tokens": {
      meta: {
        type: "suggestion",
        docs: {
          description: "Disallow hardcoded design token values, use design system tokens instead",
          recommended: true,
        },
        fixable: null,
        schema: [],
        messages: {
          hardcodedColor: "Hardcoded color value '{{ value }}' found. Use a design system token instead.",
          hardcodedSpacing: "Hardcoded spacing value '{{ value }}' found. Use a design system token instead.",
          hardcodedBorderRadius: "Hardcoded border-radius value '{{ value }}' found. Use a design system token instead.",
          hardcodedShadow: "Hardcoded shadow value '{{ value }}' found. Use a design system token instead.",
        },
      },
      create(context) {
        // Regex patterns for detection
        const hexColorRegex = /#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/;
        const rgbColorRegex = /rgba?\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+(?:\s*,\s*[\d.]+\s*)?\)/;
        const hslColorRegex = /hsla?\s*\(\s*\d+\s*,\s*\d+%?\s*,\s*\d+%?(?:\s*,\s*[\d.]+\s*)?\)/;
        const spacingValueRegex = /\b(\d+(?:\.\d+)?)(?:px|rem|em)\b/;
        const borderRadiusRegex = /borderRadius|border-radius/;
        const shadowRegex = /boxShadow|box-shadow|textShadow|text-shadow/;

        // Helper to check if value should be flagged
        const isHardcodedColor = (value) => {
          return hexColorRegex.test(value) || rgbColorRegex.test(value) || hslColorRegex.test(value);
        };

        const isHardcodedSpacing = (value) => {
          return spacingValueRegex.test(value);
        };

        // Check CSS-in-JS or inline styles
        const checkObjectExpression = (node) => {
          for (const property of node.properties) {
            if (property.type === "Property" && property.value.type === "Literal") {
              const propName = property.key.type === "Identifier" ? property.key.name : property.key.value;
              const value = String(property.value.value);
              
              // Check for colors
              if (
                propName.toLowerCase().includes("color") ||
                propName.toLowerCase().includes("background") ||
                propName.toLowerCase().includes("fill") ||
                propName.toLowerCase().includes("stroke")
              ) {
                if (isHardcodedColor(value)) {
                  context.report({
                    node: property,
                    messageId: "hardcodedColor",
                    data: { value },
                  });
                }
              }
              
              // Check for spacing
              if (
                propName.toLowerCase().includes("margin") ||
                propName.toLowerCase().includes("padding") ||
                propName.toLowerCase().includes("gap") ||
                propName.toLowerCase().includes("space")
              ) {
                if (isHardcodedSpacing(value)) {
                  context.report({
                    node: property,
                    messageId: "hardcodedSpacing",
                    data: { value },
                  });
                }
              }
              
              // Check for border radius
              if (borderRadiusRegex.test(propName)) {
                if (isHardcodedSpacing(value)) {
                  context.report({
                    node: property,
                    messageId: "hardcodedBorderRadius",
                    data: { value },
                  });
                }
              }
              
              // Check for shadows
              if (shadowRegex.test(propName)) {
                context.report({
                  node: property,
                  messageId: "hardcodedShadow",
                  data: { value },
                });
              }
            }
          }
        };

        return {
          ObjectExpression(node) {
            checkObjectExpression(node);
          },
        };
      },
    },
  },
};

export default designTokenEnforcementRules;
