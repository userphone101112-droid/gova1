/**
 * ESLint Rule: Design Token Enforcement
 * Rejects hardcoded colors, forbidden Tailwind palette classes, and undefined CSS variables.
 * Valid token registry is loaded dynamically from design-system CSS files.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const TOKEN_CSS_DIR = path.join(ROOT, 'src', 'design-system');

function loadValidCssVariables() {
  const vars = new Set();
  const files = ['primitive-tokens.css', 'semantic-tokens.css', 'component-tokens.css'];
  for (const file of files) {
    const fullPath = path.join(TOKEN_CSS_DIR, file);
    if (!fs.existsSync(fullPath)) continue;
    const content = fs.readFileSync(fullPath, 'utf-8');
    const matches = content.matchAll(/(--gova-[a-z0-9-]+)\s*:/g);
    for (const m of matches) {
      vars.add(m[1]);
    }
  }
  return vars;
}

const validCssVariables = loadValidCssVariables();

const FORBIDDEN_TAILWIND_COLOR =
  /\b(?:bg|text|border|ring|fill|stroke|from|to|via|decoration|outline|divide|placeholder)-(?:white|black|gray|grey|slate|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)(?:-\d+)?(?:\/\d+)?\b/;

const designTokenEnforcementRules = {
  rules: {
    'no-hardcoded-design-tokens': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Disallow hardcoded design token values, use design system tokens instead',
          recommended: true,
        },
        fixable: null,
        schema: [],
        messages: {
          hardcodedColor: "Hardcoded color value '{{ value }}' found. Use a design system token instead.",
          hardcodedSpacing: "Hardcoded spacing value '{{ value }}' found. Use a design system token instead.",
          hardcodedBorderRadius: "Hardcoded border-radius value '{{ value }}' found. Use a design system token instead.",
          hardcodedShadow: "Hardcoded shadow value '{{ value }}' found. Use a design system token instead.",
          arbitraryTailwindValue: "Tailwind arbitrary value '{{ value }}' found. Use design system tokens or predefined utilities instead.",
          forbiddenTailwindColor: "Forbidden Tailwind palette class '{{ value }}' found. Use theme token utilities (e.g. bg-primary, text-on-surface, bg-card).",
          inlineStyleAttribute: "Inline 'style' attribute detected. Use Tailwind classes instead.",
          invalidCssVariable: "CSS variable '{{ value }}' is not defined in the design system. Use a valid design system token.",
        },
      },
      create(context) {
        const filename = context.filename.replace(/\\/g, '/');
        if (filename.includes('/platform/ui/devtools/') || filename.includes('/scripts/')) {
          return {};
        }

        const hexColorRegex = /#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/;
        const rgbColorRegex = /rgba?\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+(?:\s*,\s*[\d.]+\s*)?\)/;
        const hslColorRegex = /hsla?\s*\(\s*\d+\s*,\s*\d+%?\s*,\s*\d+%?(?:\s*,\s*[\d.]+\s*)?\)/;
        const spacingValueRegex = /\b(\d+(?:\.\d+)?)(?:px|rem|em)\b/;
        const borderRadiusRegex = /borderRadius|border-radius/;
        const shadowRegex = /boxShadow|box-shadow|textShadow|text-shadow/;
        const arbitraryValueRegex = /-\[.*?\]/;
        const cssVariableRegex = /var\((--[^)]+)\)/g;

        const isHardcodedColor = (value) =>
          hexColorRegex.test(value) || rgbColorRegex.test(value) || hslColorRegex.test(value);

        const isHardcodedSpacing = (value) => spacingValueRegex.test(value);

        const isValidCssVariable = (value) => {
          const matches = [...value.matchAll(cssVariableRegex)];
          if (matches.length === 0) return true;
          return matches.every((m) => validCssVariables.has(m[1]));
        };

        const checkForbiddenTailwindColors = (node, classNameValue) => {
          const match = classNameValue.match(FORBIDDEN_TAILWIND_COLOR);
          if (match) {
            context.report({
              node,
              messageId: 'forbiddenTailwindColor',
              data: { value: match[0] },
            });
          }
        };

        const checkObjectExpression = (node, colorOnly = false) => {
          for (const property of node.properties) {
            if (property.type === 'Property' && property.value.type === 'Literal') {
              const propName = property.key.type === 'Identifier' ? property.key.name : property.key.value;
              const value = String(property.value.value);

              if (
                propName.toLowerCase().includes('color') ||
                propName.toLowerCase().includes('background') ||
                propName.toLowerCase().includes('fill') ||
                propName.toLowerCase().includes('stroke')
              ) {
                if (isHardcodedColor(value)) {
                  context.report({ node: property, messageId: 'hardcodedColor', data: { value } });
                } else if (!isValidCssVariable(value)) {
                  context.report({ node: property, messageId: 'invalidCssVariable', data: { value } });
                }
              }

              if (colorOnly) continue;

              if (
                propName.toLowerCase().includes('margin') ||
                propName.toLowerCase().includes('padding') ||
                propName.toLowerCase().includes('gap') ||
                propName.toLowerCase().includes('space')
              ) {
                if (isHardcodedSpacing(value)) {
                  context.report({ node: property, messageId: 'hardcodedSpacing', data: { value } });
                }
              }

              if (borderRadiusRegex.test(propName) && isHardcodedSpacing(value)) {
                context.report({ node: property, messageId: 'hardcodedBorderRadius', data: { value } });
              }

              if (shadowRegex.test(propName) && isHardcodedColor(value)) {
                context.report({ node: property, messageId: 'hardcodedShadow', data: { value } });
              }
            }
          }
        };

        const arbitraryDimensionRegex = /-\[(\d+(?:\.\d+)?(?:px|rem|em))\]/;

        const checkArbitraryDimensions = (node, classNameValue) => {
          const match = classNameValue.match(arbitraryDimensionRegex);
          if (match) {
            context.report({
              node,
              messageId: 'arbitraryTailwindValue',
              data: { value: match[0] },
            });
          }
        };

        const extractClassName = (node) => {
          if (!node.value) return '';
          if (node.value.type === 'Literal') return node.value.value || '';
          if (node.value.type === 'JSXExpressionContainer') {
            if (node.value.expression.type === 'TemplateLiteral') {
              return node.value.expression.quasis.map((q) => q.value.raw).join(' ');
            }
            if (node.value.expression.type === 'Literal') {
              return String(node.value.expression.value || '');
            }
          }
          return '';
        };

        const checkStyleAttribute = (node) => {
          const parent = node.parent;
          if (parent.type !== 'JSXOpeningElement') return;

          const elName = parent.name.name ?? parent.name.property?.name;
          if (elName === 'Image' || elName === 'img') return;
          if (elName && (String(elName).startsWith('Dev') || String(elName).includes('Dev'))) return;

          const value = node.value;
          if (!value || value.type !== 'JSXExpressionContainer') return;

          const expr = value.expression;
          if (expr.type === 'ObjectExpression') {
            checkObjectExpression(expr, true);
            return;
          }

          // Dynamic style expressions — flag as warning-level inline style
          context.report({ node, messageId: 'inlineStyleAttribute' });
        };

        return {
          ObjectExpression(node) {
            // Only check object expressions that are direct style props or variable assignments
            const parent = node.parent;
            if (
              parent?.type === 'JSXExpressionContainer' &&
              parent.parent?.type === 'JSXAttribute' &&
              parent.parent.name.name === 'style'
            ) {
              checkObjectExpression(node, true);
            }
          },

          JSXAttribute(node) {
            if (node.name.name === 'className') {
              const classNameValue = extractClassName(node);
              if (arbitraryValueRegex.test(classNameValue)) {
                const match = classNameValue.match(arbitraryValueRegex);
                // Allow dimension-only arbitrary values (not colors)
                const arbitraryVal = match ? match[0] : '';
                const isColorArbitrary = /(?:#|rgb|hsl|var\(--color)/i.test(arbitraryVal);
                if (isColorArbitrary) {
                  context.report({
                    node: node.value,
                    messageId: 'arbitraryTailwindValue',
                    data: { value: arbitraryVal || classNameValue },
                  });
                }
              }
              checkForbiddenTailwindColors(node.value ?? node, classNameValue);
              checkArbitraryDimensions(node.value ?? node, classNameValue);
            }

            if (node.name.name === 'style') {
              checkStyleAttribute(node);
            }
          },
        };
      },
    },
  },
};

export default designTokenEnforcementRules;
