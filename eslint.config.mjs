import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import uiIdentificationRules from "./src/platform/ui/enforcement/eslint/ui-identification.js";
import { requireDataUiUuid } from "./src/platform/ui/enforcement/eslint/require-data-ui-uuid.js";
import { noLegacyUiImports } from "./src/platform/ui/enforcement/eslint/no-legacy-ui-imports.js";
import i18nEnforcementRules from "./src/platform/ui/enforcement/eslint/i18n-enforcement.js";
import designTokenEnforcementRules from "./.eslint-rules/design-token-enforcement.js";

const uiIdentificationPlugin = {
  meta: {
    name: 'ui-identification',
  },
  rules: uiIdentificationRules.rules,
};

const uiRegistryPlugin = {
  meta: {
    name: 'ui-registry',
  },
  rules: {
    'require-data-ui-uuid': requireDataUiUuid,
    'no-legacy-ui-imports': noLegacyUiImports,
    'validate-registry-uniqueness': uiIdentificationRules.rules['validate-registry-uniqueness'],
  },
};

const i18nEnforcementPlugin = {
  meta: {
    name: 'i18n-enforcement',
  },
  rules: i18nEnforcementRules.rules,
};

const designTokenEnforcementPlugin = {
  meta: {
    name: 'design-token-enforcement',
  },
  rules: designTokenEnforcementRules.rules,
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
      'ui-identification': uiIdentificationPlugin,
      'ui-registry': uiRegistryPlugin,
      'i18n-enforcement': i18nEnforcementPlugin,
      'design-token-enforcement': designTokenEnforcementPlugin,
    },
    rules: {
      // UI Registry — UUID-first DOM identity
      'ui-registry/require-data-ui-uuid': 'error',
      'ui-registry/no-legacy-ui-imports': 'error',
      'ui-registry/validate-registry-uniqueness': 'error',
      // i18n Enforcement rules
      'i18n-enforcement/validate-translation-keys': 'error',
      'i18n-enforcement/no-hardcoded-text': 'error',
      'i18n-enforcement/no-decorative-with-text': 'error',
      'i18n-enforcement/validate-ui-i18n-alignment': 'error',
      'i18n-enforcement/require-ui-i18n-binding': 'error',
      'i18n-enforcement/no-orphan-translations': 'warn',
      'i18n-enforcement/enforce-ui-translation-coupling': 'warn',
      'i18n-enforcement/no-directional-violations': 'error',
      // Design Token Enforcement rules
        'design-token-enforcement/no-hardcoded-design-tokens': 'error',
    },
  },
  {
    files: ['src/platform/ui/devtools/**/*.{ts,tsx}'],
    rules: {
      'i18n-enforcement/no-hardcoded-text': 'off',
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  {
    files: ['src/platform/ui/devtools/ui-inspector/**/*.{ts,tsx}'],
    rules: {
      // Internal inspector primitives use shared layout components; not app-facing registry DOM.
      'ui-registry/require-data-ui-uuid': 'off',
    },
  },
  {
    files: ['src/app/api/ui-inspector/route.ts'],
    rules: {
      'import/order': 'off',
    },
  },
  {
    files: [
      'src/platform/ui/enforcement/eslint/**/*.js',
      'src/platform/ui/enforcement/scripts/**/*.ts',
    ],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    files: ['src/providers/SSOTProvider.tsx', 'src/platform/ui/i18n/LocaleProvider.tsx'],
    rules: {
      'react-hooks/refs': 'off',
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  {
    files: ['src/platform/ui/i18n/core/getDictionary.ts'],
    rules: {
      '@next/next/no-assign-module-variable': 'off',
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "node_modules/**",
    ".git/**",
    "dist/**",
    "coverage/**",
  ]),
  {
    rules: {
      // TypeScript rules
      "@typescript-eslint/no-unused-vars": ["error", { 
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_"
      }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      
      // Import rules
      "import/order": ["error", {
        groups: [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index"
        ],
        "newlines-between": "always",
        alphabetize: {
          order: "asc",
          caseInsensitive: true
        }
      }],
      
      // General rules
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "error",
      "no-var": "error",
    }
  }
]);

export default eslintConfig;
