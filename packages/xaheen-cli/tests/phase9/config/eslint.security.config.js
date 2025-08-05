/**
 * ESLint Security Configuration for Phase 9 Testing
 * 
 * This configuration focuses on security-related linting rules
 * and integrates with the Phase 9 testing infrastructure.
 */

export default {
  root: true,
  env: {
    node: true,
    es2022: true,
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    '@typescript-eslint/recommended-requiring-type-checking',
    'plugin:security/recommended',
    'plugin:security-node/recommended',
    'plugin:@typescript-eslint/strict',
  ],
  plugins: [
    '@typescript-eslint',
    'security',
    'security-node',
    'no-unsanitized',
    'no-secrets',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: './tsconfig.json',
    tsconfigRootDir: '.',
  },
  rules: {
    // Security-critical rules
    'security/detect-unsafe-regex': 'error',
    'security/detect-buffer-noassert': 'error',
    'security/detect-child-process': 'error',
    'security/detect-disable-mustache-escape': 'error',
    'security/detect-eval-with-expression': 'error',
    'security/detect-no-csrf-before-method-override': 'error',
    'security/detect-non-literal-fs-filename': 'error',
    'security/detect-non-literal-regexp': 'error',
    'security/detect-non-literal-require': 'error',
    'security/detect-object-injection': 'error',
    'security/detect-possible-timing-attacks': 'error',
    'security/detect-pseudoRandomBytes': 'error',
    'security/detect-bidi-characters': 'error',

    // Node.js security rules
    'security-node/detect-crlf': 'error',
    'security-node/detect-runinthiscontext-script-injection': 'error',
    'security-node/detect-security-md5': 'error',
    'security-node/detect-insecure-randomness': 'error',
    'security-node/detect-unhandled-event-errors': 'error',
    'security-node/detect-unhandled-async-errors': 'error',

    // No unsanitized plugin rules
    'no-unsanitized/method': 'error',
    'no-unsanitized/property': 'error',

    // Prevent secrets in code
    'no-secrets/no-secrets': 'error',

    // TypeScript security rules
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unsafe-assignment': 'error',
    '@typescript-eslint/no-unsafe-call': 'error',
    '@typescript-eslint/no-unsafe-member-access': 'error',
    '@typescript-eslint/no-unsafe-return': 'error',
    '@typescript-eslint/no-unsafe-argument': 'error',
    '@typescript-eslint/restrict-template-expressions': 'error',
    '@typescript-eslint/no-base-to-string': 'error',
    '@typescript-eslint/no-confusing-void-expression': 'error',
    '@typescript-eslint/no-meaningless-void-operator': 'error',
    '@typescript-eslint/no-mixed-enums': 'error',
    '@typescript-eslint/no-non-null-asserted-nullish-coalescing': 'error',
    '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',
    '@typescript-eslint/no-unnecessary-condition': 'error',
    '@typescript-eslint/no-unnecessary-type-assertion': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/prefer-reduce-type-parameter': 'error',
    '@typescript-eslint/prefer-return-this-type': 'error',
    '@typescript-eslint/restrict-plus-operands': 'error',
    '@typescript-eslint/strict-boolean-expressions': [
      'error',
      {
        allowString: false,
        allowNumber: false,
        allowNullableObject: false,
        allowNullableBoolean: false,
        allowNullableString: false,
        allowNullableNumber: false,
        allowAny: false,
      },
    ],

    // Additional security-focused rules
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error',
    'no-proto': 'error',
    'no-iterator': 'error',
    'no-restricted-globals': [
      'error',
      {
        name: 'eval',
        message: 'eval() is potentially unsafe and should not be used.',
      },
      {
        name: 'Function',
        message: 'Function constructor is potentially unsafe.',
      },
    ],
    'no-restricted-syntax': [
      'error',
      {
        selector: "CallExpression[callee.name='eval']",
        message: 'eval() is potentially unsafe and should not be used.',
      },
      {
        selector: "NewExpression[callee.name='Function']",
        message: 'Function constructor is potentially unsafe.',
      },
    ],
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['child_process'],
            message: 'Direct child_process usage should be reviewed for security implications.',
          },
          {
            group: ['vm'],
            message: 'VM module usage should be reviewed for security implications.',
          },
        ],
      },
    ],

    // CLI-specific security rules
    'no-process-exit': 'error',
    'no-process-env': 'warn', // Allow but warn for environment variable usage
    'no-console': 'off', // Allow console in CLI context

    // Best practices for security
    'prefer-const': 'error',
    'no-var': 'error',
    'no-param-reassign': 'error',
    'no-shadow': 'error',
    'no-unused-vars': 'off', // Handled by TypeScript
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
  },
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.spec.ts'],
      rules: {
        // Relax some rules for test files
        'security/detect-non-literal-fs-filename': 'warn',
        'security/detect-child-process': 'warn',
        '@typescript-eslint/no-explicit-any': 'warn',
        'no-process-env': 'off',
      },
    },
    {
      files: ['**/generators/**/*.ts'],
      rules: {
        // Generator files may need dynamic requires
        'security/detect-non-literal-require': 'warn',
        'security/detect-non-literal-fs-filename': 'warn',
      },
    },
    {
      files: ['**/commands/**/*.ts'],
      rules: {
        // Command files may need child processes
        'security/detect-child-process': 'warn',
      },
    },
  ],
  ignorePatterns: [
    'dist/**',
    'node_modules/**',
    'coverage/**',
    '.turbo/**',
    'test-output/**',
    '*.js', // Ignore JS files, focus on TS
  ],
  settings: {
    'security-node': {
      allowChildProcess: false,
      allowEval: false,
      allowInlineScripts: false,
      allowUnsafeRegex: false,
    },
  },
};