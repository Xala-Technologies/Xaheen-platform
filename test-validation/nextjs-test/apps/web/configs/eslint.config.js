{{!-- Template: eslint.config.js.hbs --}}
{{!-- Category: frontend --}}
{{!-- Type: config --}}
{{!-- Framework: next --}}
{{!-- Migrated from: /Volumes/Development/Xaheen Enterprise/xaheen/apps/cli/templates/frontend/react/next/eslint.config.js.hbs --}}
/**
 * ESLint Configuration for Xala UI System Compliance
 * Generated with Xaheen CLI
 * 
 * Features:
 * - Enforces semantic component usage only
 * - Prevents raw HTML elements and hardcoded styling
 * - WCAG 2.2 AAA accessibility rules
 * - Norwegian localization compliance
 * - TypeScript strict mode enforcement
 * - Professional code quality standards
 * - SOLID principles validation
 */

import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import importPlugin from 'eslint-plugin-import';
import tailwindcss from 'eslint-plugin-tailwindcss';
import xalaUi from 'eslint-plugin-xala-ui'; // Custom plugin for Xala UI compliance

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
        project: ['./tsconfig.json'],
      },
      globals: {
        React: 'readonly',
        JSX: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      'react': react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
      'import': importPlugin,
      'tailwindcss': tailwindcss,
      'xala-ui': xalaUi,
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
    },
    rules: {
      // TypeScript Strict Rules (Zero Tolerance)
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/strict-boolean-expressions': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/require-await': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/promise-function-async': 'error',

      // React Rules
      'react/react-in-jsx-scope': 'off', // Next.js doesn't require React import
      'react/prop-types': 'off', // Using TypeScript for prop validation
      'react/jsx-uses-react': 'off',
      'react/jsx-uses-vars': 'error',
      'react/jsx-key': ['error', { checkFragmentShorthand: true }],
      'react/jsx-no-duplicate-props': 'error',
      'react/jsx-no-undef': 'error',
      'react/jsx-pascal-case': 'error',
      'react/no-children-prop': 'error',
      'react/no-danger-with-children': 'error',
      'react/no-deprecated': 'error',
      'react/no-direct-mutation-state': 'error',
      'react/no-find-dom-node': 'error',
      'react/no-is-mounted': 'error',
      'react/no-render-return-value': 'error',
      'react/no-string-refs': 'error',
      'react/no-unescaped-entities': 'error',
      'react/no-unknown-property': 'error',
      'react/require-render-return': 'error',
      'react/self-closing-comp': 'error',
      'react/jsx-fragments': ['error', 'syntax'],
      'react/jsx-no-useless-fragment': 'error',

      // React Hooks Rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Accessibility Rules (WCAG 2.2 AAA)
      'jsx-a11y/accessible-emoji': 'error',
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/anchor-has-content': 'error',
      'jsx-a11y/anchor-is-valid': 'error',
      'jsx-a11y/aria-activedescendant-has-tabindex': 'error',
      'jsx-a11y/aria-props': 'error',
      'jsx-a11y/aria-proptypes': 'error',
      'jsx-a11y/aria-role': 'error',
      'jsx-a11y/aria-unsupported-elements': 'error',
      'jsx-a11y/autocomplete-valid': 'error',
      'jsx-a11y/click-events-have-key-events': 'error',
      'jsx-a11y/control-has-associated-label': 'error',
      'jsx-a11y/heading-has-content': 'error',
      'jsx-a11y/html-has-lang': 'error',
      'jsx-a11y/iframe-has-title': 'error',
      'jsx-a11y/img-redundant-alt': 'error',
      'jsx-a11y/interactive-supports-focus': 'error',
      'jsx-a11y/label-has-associated-control': 'error',
      'jsx-a11y/lang': 'error',
      'jsx-a11y/media-has-caption': 'error',
      'jsx-a11y/mouse-events-have-key-events': 'error',
      'jsx-a11y/no-access-key': 'error',
      'jsx-a11y/no-autofocus': 'error',
      'jsx-a11y/no-distracting-elements': 'error',
      'jsx-a11y/no-interactive-element-to-noninteractive-role': 'error',
      'jsx-a11y/no-noninteractive-element-interactions': 'error',
      'jsx-a11y/no-noninteractive-element-to-interactive-role': 'error',
      'jsx-a11y/no-noninteractive-tabindex': 'error',
      'jsx-a11y/no-redundant-roles': 'error',
      'jsx-a11y/no-static-element-interactions': 'error',
      'jsx-a11y/role-has-required-aria-props': 'error',
      'jsx-a11y/role-supports-aria-props': 'error',
      'jsx-a11y/scope': 'error',
      'jsx-a11y/tabindex-no-positive': 'error',

      // Import Rules
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      'import/no-unresolved': 'error',
      'import/no-cycle': 'error',
      'import/no-unused-modules': 'error',
      'import/no-deprecated': 'warn',

      // Tailwind CSS Rules
      'tailwindcss/classnames-order': 'error',
      'tailwindcss/enforces-negative-arbitrary-values': 'error',
      'tailwindcss/enforces-shorthand': 'error',
      'tailwindcss/migration-from-tailwind-2': 'error',
      'tailwindcss/no-arbitrary-value': 'error', // Prevent hardcoded values
      'tailwindcss/no-custom-classname': 'error', // Only allow Tailwind classes
      'tailwindcss/no-contradicting-classname': 'error',

      // Custom Xala UI Rules (Hypothetical - would be implemented in custom plugin)
      'xala-ui/no-raw-html-elements': 'error', // Prevent div, span, p, h1-h6, etc.
      'xala-ui/require-semantic-components': 'error', // Require Box, Stack, Typography, etc.
      'xala-ui/no-hardcoded-styles': 'error', // Prevent style=placeholder and arbitrary classes
      'xala-ui/require-design-tokens': 'error', // Require token usage
      'xala-ui/enforce-8pt-grid': 'error', // Enforce 8pt grid spacing
      'xala-ui/require-accessibility-props': 'warn', // Require ARIA props
      'xala-ui/no-hardcoded-text': 'error', // MANDATORY: No hardcoded user-facing text
      'xala-ui/require-localization': 'error', // MANDATORY: All text must use t() function
      'xala-ui/enforce-supported-languages': 'error', // MANDATORY: English, Norwegian, French, Arabic only
      'xala-ui/no-missing-translations': 'error', // Require i18n keys
      'xala-ui/enforce-component-variants': 'error', // Use proper variants
      'xala-ui/require-explicit-return-types': 'error', // TypeScript return types
      'xala-ui/max-file-length': ['error', { max: 200 }], // 200 line limit
      'xala-ui/max-function-length': ['error', { max: 20 }], // 20 line function limit
      'xala-ui/require-jsdoc': 'error', // Require JSDoc for public methods

      // Code Quality Rules
      'complexity': ['error', 10], // Cyclomatic complexity limit
      'max-depth': ['error', 4], // Maximum nesting depth
      'max-params': ['error', 4], // Maximum function parameters
      'no-console': 'warn', // Warn on console usage
      'no-debugger': 'error', // No debugger statements
      'no-alert': 'error', // No alert usage
      'no-eval': 'error', // No eval usage
      'no-implied-eval': 'error', // No implied eval
      'no-new-func': 'error', // No Function constructor
      'no-script-url': 'error', // No javascript: URLs
      'no-var': 'error', // Use let/const instead of var
      'prefer-const': 'error', // Prefer const when possible
      'prefer-arrow-callback': 'error', // Prefer arrow functions
      'prefer-template': 'error', // Prefer template literals
      'prefer-destructuring': 'error', // Prefer destructuring
      'prefer-spread': 'error', // Prefer spread operator
      'prefer-rest-params': 'error', // Prefer rest parameters
      'object-shorthand': 'error', // Use object shorthand
      'array-callback-return': 'error', // Require return in array callbacks
      'consistent-return': 'error', // Consistent return statements
      'default-case': 'error', // Require default case in switch
      'dot-notation': 'error', // Use dot notation when possible
      'eqeqeq': ['error', 'always'], // Require === and !==
      'guard-for-in': 'error', // Require for-in guard
      'no-case-declarations': 'error', // No declarations in case clauses
      'no-empty-pattern': 'error', // No empty destructuring patterns
      'no-fallthrough': 'error', // No fallthrough in switch cases
      'no-global-assign': 'error', // No global variable assignment
      'no-implicit-coercion': 'error', // No implicit type coercion
      'no-implicit-globals': 'error', // No implicit globals
      'no-loop-func': 'error', // No functions in loops
      'no-magic-numbers': ['warn', { ignore: [0, 1, -1] }], // No magic numbers
      'no-multi-assign': 'error', // No multiple assignments
      'no-new': 'error', // No new without assignment
      'no-new-wrappers': 'error', // No primitive wrapper instances
      'no-octal-escape': 'error', // No octal escapes
      'no-param-reassign': 'error', // No parameter reassignment
      'no-proto': 'error', // No __proto__ usage
      'no-redeclare': 'error', // No variable redeclaration
      'no-return-assign': 'error', // No assignment in return
      'no-return-await': 'error', // No return await
      'no-self-assign': 'error', // No self assignment
      'no-self-compare': 'error', // No self comparison
      'no-sequences': 'error', // No comma operator
      'no-throw-literal': 'error', // No throwing literals
      'no-unmodified-loop-condition': 'error', // No unmodified loop conditions
      'no-unused-expressions': 'error', // No unused expressions
      'no-useless-call': 'error', // No useless call
      'no-useless-concat': 'error', // No useless concatenation
      'no-useless-return': 'error', // No useless return
      'no-void': 'error', // No void operator
      'no-with': 'error', // No with statement
      'radix': 'error', // Require radix in parseInt
      'require-await': 'error', // Require await in async functions
      'vars-on-top': 'error', // Require var declarations at top
      'wrap-iife': 'error', // Wrap IIFEs
      'yoda': 'error', // No yoda conditions

      // Style Rules
      'camelcase': ['error', { properties: 'never' }], // Camelcase naming
      'new-cap': 'error', // Require capital letters for constructors
      'no-array-constructor': 'error', // No Array constructor
      'no-new-object': 'error', // No Object constructor
      'no-underscore-dangle': 'error', // No dangling underscores
      'one-var': ['error', 'never'], // One variable declaration per line
      'operator-assignment': 'error', // Require operator assignment shorthand
      'prefer-exponentiation-operator': 'error', // Prefer ** over Math.pow
      'spaced-comment': 'error', // Require spaced comments
    },
  },
  {
    // Configuration files
    files: ['**/*.config.{js,ts}', '**/.*rc.{js,ts}'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-var-requires': 'off',
    },
  },
  {
    // Test files
    files: ['**/*.{test,spec}.{js,jsx,ts,tsx}', '**/__tests__/**/*.{js,jsx,ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-magic-numbers': 'off',
      'max-lines-per-function': 'off',
    },
  },
  {
    // Storybook files
    files: ['**/*.stories.{js,jsx,ts,tsx}'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      'xala-ui/require-jsdoc': 'off',
    },
  },
  {
    // Next.js specific files
    files: ['**/pages/**/*.{js,jsx,ts,tsx}', '**/app/**/*.{js,jsx,ts,tsx}'],
    rules: {
      'import/no-default-export': 'off', // Next.js requires default exports for pages
    },
  },
  // Ignore patterns
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '.turbo/**',
      '**/*.d.ts',
      'public/**',
      '.storybook/**',
      'storybook-static/**',
    ],
  },
];

{{#if includeCustomRules}}
/**
 * Custom ESLint Rules for Xala UI Compliance
 * These would be implemented in a separate eslint-plugin-xala-ui package
 */

// Example custom rule implementations (pseudo-code):
/*
const xalaUiRules = {
  'no-raw-html-elements': {
    meta: {
      type: 'error',
      docs: {
        description: 'Disallow raw HTML elements in favor of semantic components',
      },
    },
    create(context) {
      const bannedElements = ['div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'button', 'input', 'form', 'section', 'article', 'aside', 'nav', 'header', 'footer', 'main'];
      
      return {
        JSXElement(node) {
          const elementName = node.openingElement.name.name;
          if (bannedElements.includes(elementName)) {
            context.report({
              node,
              message: "template string",
            });
          }
        },
      };
    },
  },
  
  'require-semantic-components': {
    meta: {
      type: 'error',
      docs: {
        description: 'Require usage of semantic components from Xala UI System',
      },
    },
    create(context) {
      const allowedComponents = ['Box', 'Stack', 'Typography', 'Button', 'Input', 'Card', 'Container', 'Grid', 'Flex', 'Icon', 'Badge', 'Avatar', 'Dialog', 'Modal', 'Tooltip', 'Popover', 'Select', 'Checkbox', 'Radio', 'Switch', 'Slider', 'Progress', 'Spinner', 'Alert', 'Toast', 'Breadcrumb', 'Pagination', 'Table', 'Tabs', 'Accordion', 'Drawer', 'Sheet', 'Separator', 'Skeleton', 'Command', 'Calendar', 'DatePicker', 'TimePicker', 'ColorPicker', 'FileUpload', 'DropZone', 'Chart', 'DataTable', 'Form', 'FormField', 'FormLabel', 'FormMessage', 'FormDescription'];
      
      return {
        JSXElement(node) {
          const elementName = node.openingElement.name.name;
          if (!allowedComponents.includes(elementName) && /^[A-Z]/.test(elementName)) {
            // Check if it's imported from @xaheen-ai/design-system
            const sourceCode = context.getSourceCode();
            const imports = sourceCode.ast.body.filter(node => node.type === 'ImportDeclaration');
            const xalaImports = imports.find(imp => imp.source.value === '@xaheen-ai/design-system');
            
            if (!xalaImports || !xalaImports.specifiers.some(spec => spec.imported.name === elementName)) {
              context.report({
                node,
                message: "template string",
              });
            }
          }
        },
      };
    },
  },
  
  'no-hardcoded-styles': {
    meta: {
      type: 'error',
      docs: {
        description: 'Disallow hardcoded styles and arbitrary Tailwind values',
      },
    },
    create(context) {
      return {
        JSXAttribute(node) {
          if (node.name.name === 'style') {
            context.report({
              node,
              message: 'Inline styles are not allowed. Use design tokens and semantic components instead.',
            });
          }
          
          if (node.name.name === 'className' && node.value) {
            const classValue = node.value.value || node.value.expression?.value;
            if (typeof classValue === 'string') {
              // Check for arbitrary values like text-[18px] or bg-[#f0f0f0]
              const arbitraryValueRegex = /\[[^\]]+\]/;
              if (arbitraryValueRegex.test(classValue)) {
                context.report({
                  node,
                  message: 'Arbitrary Tailwind values are not allowed. Use design tokens instead.',
                });
              }
            }
          }
        },
      };
    },
  },
};
*/
{{/if}}
