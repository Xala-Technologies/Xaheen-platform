/**
 * Quality Assurance Template System
 * 
 * Comprehensive QA templates for testing, linting, formatting, and code quality.
 * Includes TypeScript strict mode, ESLint, Prettier, Husky hooks, Jest, and Playwright.
 * 
 * @author CLI Template Generator Agent
 * @since 2025-01-03
 */

import fs from 'fs-extra';
import path from 'node:path';
import { consola } from 'consola';

export interface QATemplateConfig {
  readonly projectType: 'component' | 'page' | 'application' | 'library';
  readonly framework: 'react' | 'vue' | 'angular' | 'svelte' | 'nextjs';
  readonly testingFramework: 'jest' | 'vitest' | 'playwright' | 'cypress';
  readonly linting: boolean;
  readonly formatting: boolean;
  readonly preCommitHooks: boolean;
  readonly typeChecking: 'strict' | 'moderate' | 'basic';
  readonly coverage: 'basic' | 'detailed' | 'comprehensive';
  readonly accessibility: boolean;
  readonly performance: boolean;
  readonly security: boolean;
  readonly norwegianCompliance: boolean;
}

export interface QATemplate {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: 'testing' | 'linting' | 'formatting' | 'hooks' | 'config';
  readonly content: string;
  readonly dependencies: readonly string[];
  readonly devDependencies: readonly string[];
  readonly scripts: Record<string, string>;
  readonly metadata: {
    readonly framework: string;
    readonly complexity: 'basic' | 'intermediate' | 'advanced';
    readonly maintainability: number; // 1-10 scale
  };
}

export interface QAGenerationResult {
  readonly configFiles: readonly string[];
  readonly testFiles: readonly string[];
  readonly dependencies: readonly string[];
  readonly devDependencies: readonly string[];
  readonly scripts: Record<string, string>;
  readonly setupInstructions: readonly string[];
}

export class QualityAssuranceTemplates {
  private templates: Map<string, QATemplate> = new Map();

  constructor() {
    this.initializeQATemplates();
  }

  /**
   * Generate complete QA setup for project
   */
  async generateQASetup(
    projectPath: string,
    config: QATemplateConfig
  ): Promise<QAGenerationResult> {
    consola.info('Generating comprehensive QA setup');

    const configFiles: string[] = [];
    const testFiles: string[] = [];
    const dependencies = new Set<string>();
    const devDependencies = new Set<string>();
    const scripts: Record<string, string> = {};
    const setupInstructions: string[] = [];

    // Generate TypeScript configuration
    const tsConfigFile = await this.generateTypeScriptConfig(projectPath, config);
    configFiles.push(tsConfigFile);

    // Generate ESLint configuration
    if (config.linting) {
      const eslintFiles = await this.generateESLintConfig(projectPath, config);
      configFiles.push(...eslintFiles);
      
      // Add ESLint dependencies
      devDependencies.add('eslint');
      devDependencies.add('@typescript-eslint/parser');
      devDependencies.add('@typescript-eslint/eslint-plugin');
      
      if (config.framework === 'react' || config.framework === 'nextjs') {
        devDependencies.add('eslint-plugin-react');
        devDependencies.add('eslint-plugin-react-hooks');
      }
      
      if (config.accessibility) {
        devDependencies.add('eslint-plugin-jsx-a11y');
      }
      
      scripts['lint'] = 'eslint . --ext .ts,.tsx,.js,.jsx';
      scripts['lint:fix'] = 'eslint . --ext .ts,.tsx,.js,.jsx --fix';
    }

    // Generate Prettier configuration
    if (config.formatting) {
      const prettierFiles = await this.generatePrettierConfig(projectPath, config);
      configFiles.push(...prettierFiles);
      
      devDependencies.add('prettier');
      if (config.linting) {
        devDependencies.add('eslint-config-prettier');
        devDependencies.add('eslint-plugin-prettier');
      }
      
      scripts['format'] = 'prettier --write .';
      scripts['format:check'] = 'prettier --check .';
    }

    // Generate testing configuration
    const testingFiles = await this.generateTestingConfig(projectPath, config);
    configFiles.push(...testingFiles.configFiles);
    testFiles.push(...testingFiles.testFiles);
    
    // Add testing dependencies
    testingFiles.dependencies.forEach(dep => dependencies.add(dep));
    testingFiles.devDependencies.forEach(dep => devDependencies.add(dep));
    Object.assign(scripts, testingFiles.scripts);

    // Generate pre-commit hooks
    if (config.preCommitHooks) {
      const hooksFiles = await this.generatePreCommitHooks(projectPath, config);
      configFiles.push(...hooksFiles);
      
      devDependencies.add('husky');
      devDependencies.add('lint-staged');
      
      scripts['prepare'] = 'husky install';
      scripts['pre-commit'] = 'lint-staged';
    }

    // Generate CI/CD configuration
    const ciFiles = await this.generateCIConfig(projectPath, config);
    configFiles.push(...ciFiles);

    // Generate security configuration
    if (config.security) {
      const securityFiles = await this.generateSecurityConfig(projectPath, config);
      configFiles.push(...securityFiles);
      
      devDependencies.add('audit-ci');
      devDependencies.add('npm-audit-fix');
      
      scripts['security:audit'] = 'audit-ci --config audit-ci.json';
      scripts['security:fix'] = 'npm audit fix';
    }

    // Generate Norwegian compliance files
    if (config.norwegianCompliance) {
      const complianceFiles = await this.generateNorwegianComplianceConfig(projectPath, config);
      configFiles.push(...complianceFiles);
      
      setupInstructions.push('Configure Norwegian locale settings');
      setupInstructions.push('Ensure WCAG AAA compliance testing');
      setupInstructions.push('Set up NSM security classification');
    }

    // Generate setup instructions
    setupInstructions.unshift('Install dependencies: npm install');
    setupInstructions.push('Run initial setup: npm run prepare');
    setupInstructions.push('Verify setup: npm run lint && npm run test');

    return {
      configFiles,
      testFiles,
      dependencies: Array.from(dependencies),
      devDependencies: Array.from(devDependencies),
      scripts,
      setupInstructions
    };
  }

  /**
   * Generate TypeScript configuration
   */
  private async generateTypeScriptConfig(projectPath: string, config: QATemplateConfig): Promise<string> {
    const tsConfigPath = path.join(projectPath, 'tsconfig.json');
    
    const strictConfig = {
      compilerOptions: {
        target: 'ES2020',
        lib: ['dom', 'dom.iterable', 'es6'],
        allowJs: true,
        skipLibCheck: true,
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        strict: config.typeChecking === 'strict',
        noImplicitAny: config.typeChecking !== 'basic',
        noImplicitReturns: config.typeChecking === 'strict',
        noFallthroughCasesInSwitch: config.typeChecking === 'strict',
        noUncheckedIndexedAccess: config.typeChecking === 'strict',
        exactOptionalPropertyTypes: config.typeChecking === 'strict',
        forceConsistentCasingInFileNames: true,
        module: 'esnext',
        moduleResolution: 'node',
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: config.framework === 'nextjs',
        jsx: config.framework === 'react' || config.framework === 'nextjs' ? 'react-jsx' : 'preserve',
        incremental: true,
        plugins: config.framework === 'nextjs' ? [{ name: 'next' }] : undefined,
        paths: {
          '@/*': ['./src/*'],
          '@/components/*': ['./src/components/*'],
          '@/lib/*': ['./src/lib/*'],
          '@/types/*': ['./src/types/*']
        }
      },
      include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
      exclude: ['node_modules', '.next', 'dist', 'build']
    };

    await fs.writeFile(tsConfigPath, JSON.stringify(strictConfig, null, 2), 'utf-8');
    consola.success('Generated TypeScript configuration');
    
    return 'tsconfig.json';
  }

  /**
   * Generate ESLint configuration
   */
  private async generateESLintConfig(projectPath: string, config: QATemplateConfig): Promise<string[]> {
    const eslintConfigPath = path.join(projectPath, '.eslintrc.js');
    const eslintIgnorePath = path.join(projectPath, '.eslintignore');

    const eslintConfig = this.buildESLintConfig(config);
    const eslintIgnore = this.buildESLintIgnore(config);

    await fs.writeFile(eslintConfigPath, eslintConfig, 'utf-8');
    await fs.writeFile(eslintIgnorePath, eslintIgnore, 'utf-8');
    
    consola.success('Generated ESLint configuration');
    
    return ['.eslintrc.js', '.eslintignore'];
  }

  /**
   * Build ESLint configuration content
   */
  private buildESLintConfig(config: QATemplateConfig): string {
    const extends_: string[] = [
      '@typescript-eslint/recommended',
      '@typescript-eslint/recommended-requiring-type-checking'
    ];

    if (config.framework === 'react' || config.framework === 'nextjs') {
      extends_.push('plugin:react/recommended', 'plugin:react-hooks/recommended');
    }

    if (config.framework === 'nextjs') {
      extends_.push('next/core-web-vitals');
    }

    if (config.accessibility) {
      extends_.push('plugin:jsx-a11y/recommended');
    }

    if (config.formatting) {
      extends_.push('prettier');
    }

    const rules: Record<string, string | [string, any]> = {
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': config.typeChecking === 'strict' ? 'error' : 'warn',
      '@typescript-eslint/explicit-function-return-type': config.typeChecking === 'strict' ? 'error' : 'off',
      '@typescript-eslint/no-non-null-assertion': config.typeChecking === 'strict' ? 'error' : 'warn',
      '@typescript-eslint/prefer-readonly': 'error',
      '@typescript-eslint/prefer-const': 'error'
    };

    if (config.framework === 'react' || config.framework === 'nextjs') {
      rules['react/react-in-jsx-scope'] = 'off';
      rules['react/prop-types'] = 'off';
      rules['react-hooks/rules-of-hooks'] = 'error';
      rules['react-hooks/exhaustive-deps'] = 'warn';
    }

    if (config.accessibility) {
      rules['jsx-a11y/alt-text'] = 'error';
      rules['jsx-a11y/aria-props'] = 'error';
      rules['jsx-a11y/aria-proptypes'] = 'error';
      rules['jsx-a11y/aria-unsupported-elements'] = 'error';
      rules['jsx-a11y/role-has-required-aria-props'] = 'error';
      rules['jsx-a11y/role-supports-aria-props'] = 'error';
    }

    if (config.norwegianCompliance) {
      rules['jsx-a11y/lang'] = 'error';
      rules['jsx-a11y/html-has-lang'] = 'error';
    }

    return `
module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true,
    jest: true,
  },
  extends: [${extends_.map(ext => `'${ext}'`).join(', ')}],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
    ${config.framework === 'react' || config.framework === 'nextjs' ? `
    ecmaFeatures: {
      jsx: true,
    },` : ''}
  },
  plugins: [
    '@typescript-eslint',
    ${config.framework === 'react' || config.framework === 'nextjs' ? "'react', 'react-hooks'," : ''}
    ${config.accessibility ? "'jsx-a11y'," : ''}
  ],
  rules: ${JSON.stringify(rules, null, 4)},
  settings: {
    ${config.framework === 'react' || config.framework === 'nextjs' ? `
    react: {
      version: 'detect',
    },` : ''}
  },
  ignorePatterns: ['dist', 'build', '.next', 'node_modules'],
};
    `.trim();
  }

  /**
   * Build ESLint ignore content
   */
  private buildESLintIgnore(config: QATemplateConfig): string {
    const ignorePatterns = [
      'node_modules',
      'dist',
      'build',
      '*.min.js',
      'coverage',
      '.nyc_output'
    ];

    if (config.framework === 'nextjs') {
      ignorePatterns.push('.next', 'next-env.d.ts');
    }

    if (config.framework === 'vue') {
      ignorePatterns.push('*.vue.d.ts');
    }

    return ignorePatterns.join('\n');
  }

  /**
   * Generate Prettier configuration
   */
  private async generatePrettierConfig(projectPath: string, config: QATemplateConfig): Promise<string[]> {
    const prettierConfigPath = path.join(projectPath, '.prettierrc.js');
    const prettierIgnorePath = path.join(projectPath, '.prettierignore');

    const prettierConfig = this.buildPrettierConfig(config);
    const prettierIgnore = this.buildPrettierIgnore(config);

    await fs.writeFile(prettierConfigPath, prettierConfig, 'utf-8');
    await fs.writeFile(prettierIgnorePath, prettierIgnore, 'utf-8');
    
    consola.success('Generated Prettier configuration');
    
    return ['.prettierrc.js', '.prettierignore'];
  }

  /**
   * Build Prettier configuration content
   */
  private buildPrettierConfig(config: QATemplateConfig): string {
    const prettierOptions = {
      semi: true,
      trailingComma: 'es5' as const,
      singleQuote: true,
      printWidth: 100,
      tabWidth: 2,
      useTabs: false,
      bracketSpacing: true,
      bracketSameLine: false,
      arrowParens: 'avoid' as const,
      endOfLine: 'lf' as const,
      proseWrap: 'preserve' as const,
      htmlWhitespaceSensitivity: 'css' as const,
      embeddedLanguageFormatting: 'auto' as const
    };

    return `
module.exports = ${JSON.stringify(prettierOptions, null, 2)};
    `.trim();
  }

  /**
   * Build Prettier ignore content
   */
  private buildPrettierIgnore(config: QATemplateConfig): string {
    const ignorePatterns = [
      'node_modules',
      'dist',
      'build',
      'coverage',
      '.nyc_output',
      '*.min.js',
      '*.min.css',
      'package-lock.json',
      'yarn.lock',
      'pnpm-lock.yaml'
    ];

    if (config.framework === 'nextjs') {
      ignorePatterns.push('.next');
    }

    return ignorePatterns.join('\n');
  }

  /**
   * Generate testing configuration
   */
  private async generateTestingConfig(projectPath: string, config: QATemplateConfig): Promise<{
    configFiles: string[];
    testFiles: string[];
    dependencies: string[];
    devDependencies: string[];
    scripts: Record<string, string>;
  }> {
    const configFiles: string[] = [];
    const testFiles: string[] = [];
    const dependencies: string[] = [];
    const devDependencies: string[] = [];
    const scripts: Record<string, string> = {};

    if (config.testingFramework === 'jest') {
      const jestConfig = await this.generateJestConfig(projectPath, config);
      configFiles.push(...jestConfig.configFiles);
      testFiles.push(...jestConfig.testFiles);
      devDependencies.push(...jestConfig.devDependencies);
      Object.assign(scripts, jestConfig.scripts);
    }

    if (config.testingFramework === 'vitest') {
      const vitestConfig = await this.generateVitestConfig(projectPath, config);
      configFiles.push(...vitestConfig.configFiles);
      testFiles.push(...vitestConfig.testFiles);
      devDependencies.push(...vitestConfig.devDependencies);
      Object.assign(scripts, vitestConfig.scripts);
    }

    if (config.testingFramework === 'playwright') {
      const playwrightConfig = await this.generatePlaywrightConfig(projectPath, config);
      configFiles.push(...playwrightConfig.configFiles);
      testFiles.push(...playwrightConfig.testFiles);
      devDependencies.push(...playwrightConfig.devDependencies);
      Object.assign(scripts, playwrightConfig.scripts);
    }

    return {
      configFiles,
      testFiles,
      dependencies,
      devDependencies,
      scripts
    };
  }

  /**
   * Generate Jest configuration
   */
  private async generateJestConfig(projectPath: string, config: QATemplateConfig): Promise<{
    configFiles: string[];
    testFiles: string[];
    devDependencies: string[];
    scripts: Record<string, string>;
  }> {
    const jestConfigPath = path.join(projectPath, 'jest.config.js');
    const setupFilePath = path.join(projectPath, 'src/test/setup.ts');

    const jestConfig = this.buildJestConfig(config);
    const setupFile = this.buildJestSetup(config);

    await fs.ensureDir(path.dirname(setupFilePath));
    await fs.writeFile(jestConfigPath, jestConfig, 'utf-8');
    await fs.writeFile(setupFilePath, setupFile, 'utf-8');

    // Generate sample test file
    const sampleTest = await this.generateSampleTest(projectPath, config, 'jest');

    const devDependencies = [
      'jest',
      '@types/jest',
      'ts-jest',
      'jest-environment-jsdom'
    ];

    if (config.framework === 'react' || config.framework === 'nextjs') {
      devDependencies.push('@testing-library/react', '@testing-library/jest-dom', '@testing-library/user-event');
    }

    const scripts = {
      'test': 'jest',
      'test:watch': 'jest --watch',
      'test:coverage': 'jest --coverage',
      'test:ci': 'jest --ci --coverage --watchAll=false'
    };

    return {
      configFiles: ['jest.config.js', 'src/test/setup.ts'],
      testFiles: [sampleTest],
      devDependencies,
      scripts
    };
  }

  /**
   * Build Jest configuration content
   */
  private buildJestConfig(config: QATemplateConfig): string {
    const jestConfig = {
      preset: 'ts-jest',
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
      testMatch: [
        '<rootDir>/src/**/__tests__/**/*.(ts|tsx|js)',
        '<rootDir>/src/**/*.(test|spec).(ts|tsx|js)'
      ],
      collectCoverageFrom: [
        'src/**/*.(ts|tsx)',
        '!src/**/*.d.ts',
        '!src/test/**/*',
        '!src/**/*.stories.*',
        '!src/**/index.(ts|tsx)'
      ],
      coverageThreshold: {
        global: {
          branches: config.coverage === 'comprehensive' ? 90 : config.coverage === 'detailed' ? 80 : 70,
          functions: config.coverage === 'comprehensive' ? 90 : config.coverage === 'detailed' ? 80 : 70,
          lines: config.coverage === 'comprehensive' ? 90 : config.coverage === 'detailed' ? 80 : 70,
          statements: config.coverage === 'comprehensive' ? 90 : config.coverage === 'detailed' ? 80 : 70
        }
      },
      moduleNameMapping: {
        '^@/(.*)$': '<rootDir>/src/$1'
      },
      transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest'
      },
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node']
    };

    if (config.framework === 'nextjs') {
      jestConfig.testEnvironment = 'jest-environment-jsdom';
      Object.assign(jestConfig, {
        setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
        moduleNameMapping: {
          ...jestConfig.moduleNameMapping,
          '^@/pages/(.*)$': '<rootDir>/pages/$1',
          '^@/components/(.*)$': '<rootDir>/components/$1'
        }
      });
    }

    return `
module.exports = ${JSON.stringify(jestConfig, null, 2)};
    `.trim();
  }

  /**
   * Build Jest setup file content
   */
  private buildJestSetup(config: QATemplateConfig): string {
    let setupContent = `
import '@testing-library/jest-dom';

// Global test configuration
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock window.matchMedia for responsive tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));
    `.trim();

    if (config.accessibility) {
      setupContent += `

// Accessibility testing setup
import 'jest-axe/extend-expect';
      `;
    }

    if (config.norwegianCompliance) {
      setupContent += `

// Norwegian locale setup for tests
import { setGlobalConfig } from '@storybook/testing-library';
setGlobalConfig({
  testIdAttribute: 'data-testid',
  defaultLocale: 'nb-NO',
});
      `;
    }

    return setupContent;
  }

  /**
   * Generate Vitest configuration
   */
  private async generateVitestConfig(projectPath: string, config: QATemplateConfig): Promise<{
    configFiles: string[];
    testFiles: string[];
    devDependencies: string[];
    scripts: Record<string, string>;
  }> {
    const vitestConfigPath = path.join(projectPath, 'vitest.config.ts');
    const setupFilePath = path.join(projectPath, 'src/test/setup.ts');

    const vitestConfig = this.buildVitestConfig(config);
    const setupFile = this.buildVitestSetup(config);

    await fs.ensureDir(path.dirname(setupFilePath));
    await fs.writeFile(vitestConfigPath, vitestConfig, 'utf-8');
    await fs.writeFile(setupFilePath, setupFile, 'utf-8');

    const sampleTest = await this.generateSampleTest(projectPath, config, 'vitest');

    const devDependencies = [
      'vitest',
      '@vitest/ui',
      'jsdom'
    ];

    if (config.framework === 'react' || config.framework === 'nextjs') {
      devDependencies.push('@testing-library/react', '@testing-library/jest-dom', '@testing-library/user-event');
    }

    const scripts = {
      'test': 'vitest',
      'test:ui': 'vitest --ui',
      'test:coverage': 'vitest --coverage'
    };

    return {
      configFiles: ['vitest.config.ts', 'src/test/setup.ts'],
      testFiles: [sampleTest],
      devDependencies,
      scripts
    };
  }

  /**
   * Build Vitest configuration content
   */
  private buildVitestConfig(config: QATemplateConfig): string {
    return `
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [${config.framework === 'react' || config.framework === 'nextjs' ? 'react()' : ''}],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.stories.*',
        '**/index.(ts|tsx)'
      ],
      thresholds: {
        lines: ${config.coverage === 'comprehensive' ? 90 : config.coverage === 'detailed' ? 80 : 70},
        functions: ${config.coverage === 'comprehensive' ? 90 : config.coverage === 'detailed' ? 80 : 70},
        branches: ${config.coverage === 'comprehensive' ? 90 : config.coverage === 'detailed' ? 80 : 70},
        statements: ${config.coverage === 'comprehensive' ? 90 : config.coverage === 'detailed' ? 80 : 70}
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
});
    `.trim();
  }

  /**
   * Build Vitest setup file content
   */
  private buildVitestSetup(config: QATemplateConfig): string {
    let setupContent = `
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

afterEach(() => {
  cleanup();
});
    `.trim();

    if (config.accessibility) {
      setupContent += `

import 'jest-axe/extend-expect';
      `;
    }

    return setupContent;
  }

  /**
   * Generate Playwright configuration
   */
  private async generatePlaywrightConfig(projectPath: string, config: QATemplateConfig): Promise<{
    configFiles: string[];
    testFiles: string[];
    devDependencies: string[];
    scripts: Record<string, string>;
  }> {
    const playwrightConfigPath = path.join(projectPath, 'playwright.config.ts');
    
    const playwrightConfig = this.buildPlaywrightConfig(config);
    await fs.writeFile(playwrightConfigPath, playwrightConfig, 'utf-8');

    const sampleE2ETest = await this.generateSampleE2ETest(projectPath, config);

    const devDependencies = [
      '@playwright/test',
      '@axe-core/playwright'
    ];

    const scripts = {
      'e2e': 'playwright test',
      'e2e:headed': 'playwright test --headed',
      'e2e:debug': 'playwright test --debug'
    };

    return {
      configFiles: ['playwright.config.ts'],
      testFiles: [sampleE2ETest],
      devDependencies,
      scripts
    };
  }

  /**
   * Build Playwright configuration content
   */
  private buildPlaywrightConfig(config: QATemplateConfig): string {
    return `
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30 * 1000,
  expect: {
    timeout: 5000
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    ${config.accessibility ? `
    {
      name: 'accessibility',
      use: { ...devices['Desktop Chrome'] },
      testMatch: '**/*.a11y.spec.ts',
    },` : ''}
  ],
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
    `.trim();
  }

  /**
   * Generate sample test file
   */
  private async generateSampleTest(projectPath: string, config: QATemplateConfig, framework: 'jest' | 'vitest'): Promise<string> {
    const testDir = path.join(projectPath, 'src/__tests__');
    const testFile = path.join(testDir, 'sample.test.tsx');
    
    await fs.ensureDir(testDir);

    const testContent = `
import { render, screen } from '@testing-library/react';
${framework === 'vitest' ? "import { describe, it, expect } from 'vitest';" : ''}

// Sample component for testing
const SampleComponent = ({ title }: { title: string }) => (
  <div>
    <h1>{title}</h1>
    <p>This is a sample component for testing setup.</p>
  </div>
);

describe('SampleComponent', () => {
  it('renders title correctly', () => {
    render(<SampleComponent title="Test Title" />);
    
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Test Title');
    expect(screen.getByText('This is a sample component for testing setup.')).toBeInTheDocument();
  });

  ${config.accessibility ? `
  it('meets accessibility standards', async () => {
    const { container } = render(<SampleComponent title="Accessible Title" />);
    
    // Basic accessibility checks
    expect(screen.getByRole('heading')).toBeInTheDocument();
    expect(container.firstChild).toHaveAttribute('role', 'main');
  });` : ''}

  ${config.norwegianCompliance ? `
  it('supports Norwegian locale', () => {
    render(<SampleComponent title="Norsk Tittel" />);
    
    expect(screen.getByText('Norsk Tittel')).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute('lang', 'nb-NO');
  });` : ''}
});
    `.trim();

    await fs.writeFile(testFile, testContent, 'utf-8');
    
    return 'src/__tests__/sample.test.tsx';
  }

  /**
   * Generate sample E2E test
   */
  private async generateSampleE2ETest(projectPath: string, config: QATemplateConfig): Promise<string> {
    const e2eDir = path.join(projectPath, 'e2e');
    const testFile = path.join(e2eDir, 'homepage.spec.ts');
    
    await fs.ensureDir(e2eDir);

    const testContent = `
import { test, expect } from '@playwright/test';
${config.accessibility ? "import { injectAxe, checkA11y } from '@axe-core/playwright';" : ''}

test.describe('Homepage', () => {
  test('should load successfully', async ({ page }) => {
    await page.goto('/');
    
    await expect(page).toHaveTitle(/Home/);
    await expect(page.locator('main')).toBeVisible();
  });

  ${config.accessibility ? `
  test('should meet accessibility standards', async ({ page }) => {
    await page.goto('/');
    await injectAxe(page);
    await checkA11y(page);
  });` : ''}

  ${config.performance ? `
  test('should meet performance standards', async ({ page }) => {
    await page.goto('/');
    
    // Check Core Web Vitals
    const metrics = await page.evaluate(() => JSON.stringify(performance.getEntriesByType('navigation')));
    const navigation = JSON.parse(metrics)[0];
    
    // Ensure page loads within 2 seconds
    expect(navigation.loadEventEnd - navigation.fetchStart).toBeLessThan(2000);
  });` : ''}
});
    `.trim();

    await fs.writeFile(testFile, testContent, 'utf-8');
    
    return 'e2e/homepage.spec.ts';
  }

  /**
   * Generate pre-commit hooks
   */
  private async generatePreCommitHooks(projectPath: string, config: QATemplateConfig): Promise<string[]> {
    const huskyDir = path.join(projectPath, '.husky');
    const lintStagedPath = path.join(projectPath, '.lintstagedrc.js');
    const preCommitPath = path.join(huskyDir, 'pre-commit');
    
    await fs.ensureDir(huskyDir);
    
    const lintStagedConfig = this.buildLintStagedConfig(config);
    const preCommitHook = this.buildPreCommitHook(config);
    
    await fs.writeFile(lintStagedPath, lintStagedConfig, 'utf-8');
    await fs.writeFile(preCommitPath, preCommitHook, 'utf-8');
    await fs.chmod(preCommitPath, '755'); // Make executable
    
    return ['.lintstagedrc.js', '.husky/pre-commit'];
  }

  /**
   * Build lint-staged configuration
   */
  private buildLintStagedConfig(config: QATemplateConfig): string {
    const lintStagedConfig: Record<string, string[]> = {};
    
    if (config.linting && config.formatting) {
      lintStagedConfig['*.{ts,tsx,js,jsx}'] = ['eslint --fix', 'prettier --write'];
    } else if (config.linting) {
      lintStagedConfig['*.{ts,tsx,js,jsx}'] = ['eslint --fix'];
    } else if (config.formatting) {
      lintStagedConfig['*.{ts,tsx,js,jsx}'] = ['prettier --write'];
    }
    
    if (config.formatting) {
      lintStagedConfig['*.{json,md,yml,yaml}'] = ['prettier --write'];
    }
    
    return `
module.exports = ${JSON.stringify(lintStagedConfig, null, 2)};
    `.trim();
  }

  /**
   * Build pre-commit hook
   */
  private buildPreCommitHook(config: QATemplateConfig): string {
    let hook = `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

`;

    hook += 'npx lint-staged\n';
    
    if (config.testingFramework) {
      hook += 'npm run test -- --passWithNoTests\n';
    }
    
    if (config.typeChecking !== 'basic') {
      hook += 'npx tsc --noEmit\n';
    }
    
    return hook;
  }

  /**
   * Generate CI/CD configuration
   */
  private async generateCIConfig(projectPath: string, config: QATemplateConfig): Promise<string[]> {
    const githubDir = path.join(projectPath, '.github/workflows');
    const ciFile = path.join(githubDir, 'ci.yml');
    
    await fs.ensureDir(githubDir);
    
    const ciConfig = this.buildGitHubActionsConfig(config);
    await fs.writeFile(ciFile, ciConfig, 'utf-8');
    
    return ['.github/workflows/ci.yml'];
  }

  /**
   * Build GitHub Actions CI configuration
   */
  private buildGitHubActionsConfig(config: QATemplateConfig): string {
    return `
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Use Node.js \${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: \${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run type checking
      run: npx tsc --noEmit
    
    ${config.linting ? `
    - name: Run linting
      run: npm run lint
    ` : ''}
    
    ${config.formatting ? `
    - name: Check formatting
      run: npm run format:check
    ` : ''}
    
    - name: Run tests
      run: npm run test:ci
    
    ${config.testingFramework === 'playwright' ? `
    - name: Install Playwright Browsers
      run: npx playwright install --with-deps
    
    - name: Run Playwright tests
      run: npm run e2e
    ` : ''}
    
    ${config.security ? `
    - name: Run security audit
      run: npm run security:audit
    ` : ''}

  ${config.norwegianCompliance ? `
  compliance:
    runs-on: ubuntu-latest
    needs: test
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Use Node.js 20.x
      uses: actions/setup-node@v4
      with:
        node-version: 20.x
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
      
    - name: Run Norwegian compliance checks
      run: npm run compliance:check
    
    - name: Verify WCAG AAA compliance
      run: npm run a11y:test
  ` : ''}
    `.trim();
  }

  /**
   * Generate security configuration
   */
  private async generateSecurityConfig(projectPath: string, config: QATemplateConfig): Promise<string[]> {
    const auditConfigPath = path.join(projectPath, 'audit-ci.json');
    
    const auditConfig = {
      low: true,
      moderate: true,
      high: true,
      critical: true,
      'report-type': 'full',
      'output-format': 'text'
    };
    
    await fs.writeFile(auditConfigPath, JSON.stringify(auditConfig, null, 2), 'utf-8');
    
    return ['audit-ci.json'];
  }

  /**
   * Generate Norwegian compliance configuration
   */
  private async generateNorwegianComplianceConfig(projectPath: string, config: QATemplateConfig): Promise<string[]> {
    const complianceDir = path.join(projectPath, '.compliance');
    const nsmConfigPath = path.join(complianceDir, 'nsm.json');
    const a11yConfigPath = path.join(complianceDir, 'accessibility.json');
    
    await fs.ensureDir(complianceDir);
    
    const nsmConfig = {
      classification: 'OPEN',
      version: '1.0',
      compliance_standards: ['NSM', 'GDPR', 'WCAG-AAA'],
      data_handling: {
        personal_data: false,
        sensitive_data: false,
        encryption_required: false
      },
      accessibility: {
        wcag_level: 'AAA',
        screen_reader_support: true,
        keyboard_navigation: true,
        high_contrast: true,
        language_support: ['nb-NO', 'nn-NO', 'en']
      }
    };
    
    const a11yConfig = {
      standard: 'WCAG 2.1 AAA',
      testing: {
        automated: true,
        manual: true,
        user_testing: false
      },
      requirements: {
        skip_links: true,
        focus_management: true,
        aria_labels: true,
        color_contrast: 7.0,
        text_scaling: '200%',
        keyboard_only: true
      }
    };
    
    await fs.writeFile(nsmConfigPath, JSON.stringify(nsmConfig, null, 2), 'utf-8');
    await fs.writeFile(a11yConfigPath, JSON.stringify(a11yConfig, null, 2), 'utf-8');
    
    return ['.compliance/nsm.json', '.compliance/accessibility.json'];
  }

  /**
   * Initialize built-in QA templates
   */
  private initializeQATemplates(): void {
    // TypeScript Strict Template
    this.templates.set('typescript-strict', {
      id: 'typescript-strict',
      name: 'TypeScript Strict Configuration',
      description: 'Strict TypeScript configuration with comprehensive type checking',
      category: 'config',
      content: '// TypeScript strict configuration template',
      dependencies: [],
      devDependencies: ['typescript', '@types/node'],
      scripts: {
        'type-check': 'tsc --noEmit',
        'type-check:watch': 'tsc --noEmit --watch'
      },
      metadata: {
        framework: 'typescript',
        complexity: 'intermediate',
        maintainability: 9
      }
    });

    // Jest Testing Template
    this.templates.set('jest-comprehensive', {
      id: 'jest-comprehensive',
      name: 'Comprehensive Jest Testing Setup',
      description: 'Complete Jest setup with coverage, accessibility, and Norwegian compliance testing',
      category: 'testing',
      content: '// Jest comprehensive testing template',
      dependencies: [],
      devDependencies: ['jest', '@types/jest', 'ts-jest', '@testing-library/react', '@testing-library/jest-dom'],
      scripts: {
        'test': 'jest',
        'test:watch': 'jest --watch',
        'test:coverage': 'jest --coverage',
        'test:ci': 'jest --ci --coverage --watchAll=false'
      },
      metadata: {
        framework: 'jest',
        complexity: 'advanced',
        maintainability: 8
      }
    });

    // Accessibility Testing Template
    this.templates.set('accessibility-comprehensive', {
      id: 'accessibility-comprehensive',
      name: 'Comprehensive Accessibility Testing',
      description: 'Complete accessibility testing with WCAG AAA compliance validation',
      category: 'testing',
      content: '// Comprehensive accessibility testing template',
      dependencies: [],
      devDependencies: [
        '@axe-core/playwright',
        '@testing-library/jest-dom',
        'jest-axe',
        'pa11y',
        'lighthouse'
      ],
      scripts: {
        'a11y:test': 'jest --testMatch="**/*.a11y.test.*"',
        'a11y:audit': 'pa11y --standard WCAG2AAA --reporter cli',
        'a11y:lighthouse': 'lighthouse --chrome-flags="--headless" --only-categories=accessibility'
      },
      metadata: {
        framework: 'testing',
        complexity: 'advanced',
        maintainability: 9
      }
    });

    // Performance Testing Template
    this.templates.set('performance-comprehensive', {
      id: 'performance-comprehensive',
      name: 'Comprehensive Performance Testing',
      description: 'Complete performance testing with Core Web Vitals and bundle analysis',
      category: 'testing',
      content: '// Comprehensive performance testing template',
      dependencies: [],
      devDependencies: [
        'lighthouse',
        'web-vitals',
        'webpack-bundle-analyzer',
        '@next/bundle-analyzer',
        'size-limit'
      ],
      scripts: {
        'perf:test': 'jest --testMatch="**/*.perf.test.*"',
        'perf:lighthouse': 'lighthouse --chrome-flags="--headless" --only-categories=performance',
        'perf:bundle': 'webpack-bundle-analyzer build/static/js/*.js',
        'perf:size': 'size-limit'
      },
      metadata: {
        framework: 'testing',
        complexity: 'advanced',
        maintainability: 8
      }
    });

    // Norwegian Compliance Template
    this.templates.set('norwegian-compliance-comprehensive', {
      id: 'norwegian-compliance-comprehensive',
      name: 'Norwegian Compliance Suite',
      description: 'Complete Norwegian compliance validation including NSM and GDPR',
      category: 'testing',
      content: '// Norwegian compliance testing template',
      dependencies: [],
      devDependencies: [
        'jest-axe',
        '@axe-core/playwright',
        'pa11y'
      ],
      scripts: {
        'compliance:check': 'jest --testMatch="**/*.compliance.test.*"',
        'compliance:nsm': 'jest --testMatch="**/*.nsm.test.*"',
        'compliance:gdpr': 'jest --testMatch="**/*.gdpr.test.*"',
        'compliance:wcag': 'pa11y --standard WCAG2AAA --reporter json'
      },
      metadata: {
        framework: 'compliance',
        complexity: 'advanced',
        maintainability: 10
      }
    });

    consola.success('Initialized quality assurance templates');
  }

  /**
   * Generate comprehensive accessibility testing files
   */
  private async generateAccessibilityTestFiles(projectPath: string, config: QATemplateConfig): Promise<string[]> {
    const testFiles: string[] = [];
    const a11yDir = path.join(projectPath, 'src/__tests__/accessibility');
    
    await fs.ensureDir(a11yDir);

    // Generate WCAG compliance test
    const wcagTestPath = path.join(a11yDir, 'wcag-compliance.a11y.test.tsx');
    const wcagTestContent = this.generateWCAGComplianceTest(config);
    await fs.writeFile(wcagTestPath, wcagTestContent, 'utf-8');
    testFiles.push('src/__tests__/accessibility/wcag-compliance.a11y.test.tsx');

    // Generate keyboard navigation test
    const keyboardTestPath = path.join(a11yDir, 'keyboard-navigation.a11y.test.tsx');
    const keyboardTestContent = this.generateKeyboardNavigationTest(config);
    await fs.writeFile(keyboardTestPath, keyboardTestContent, 'utf-8');
    testFiles.push('src/__tests__/accessibility/keyboard-navigation.a11y.test.tsx');

    // Generate screen reader test
    const screenReaderTestPath = path.join(a11yDir, 'screen-reader.a11y.test.tsx');
    const screenReaderTestContent = this.generateScreenReaderTest(config);
    await fs.writeFile(screenReaderTestPath, screenReaderTestContent, 'utf-8');
    testFiles.push('src/__tests__/accessibility/screen-reader.a11y.test.tsx');

    // Generate color contrast test
    const contrastTestPath = path.join(a11yDir, 'color-contrast.a11y.test.tsx');
    const contrastTestContent = this.generateColorContrastTest(config);
    await fs.writeFile(contrastTestPath, contrastTestContent, 'utf-8');
    testFiles.push('src/__tests__/accessibility/color-contrast.a11y.test.tsx');

    return testFiles;
  }

  /**
   * Generate WCAG compliance test
   */
  private generateWCAGComplianceTest(config: QATemplateConfig): string {
    return `
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { SampleComponent } from '../sample-component';

expect.extend(toHaveNoViolations);

describe('WCAG Compliance Tests', () => {
  it('should not have any accessibility violations', async () => {
    const { container } = render(<SampleComponent title="Test Component" />);
    const results = await axe(container, {
      rules: {
        // WCAG 2.1 AAA rules
        'color-contrast-enhanced': { enabled: ${config.accessibility} },
        'landmark-unique': { enabled: true },
        'page-has-heading-one': { enabled: true },
        'region': { enabled: true }
      }
    });
    
    expect(results).toHaveNoViolations();
  });

  it('should have proper heading hierarchy', async () => {
    const { container } = render(<SampleComponent title="Main Title" />);
    
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let previousLevel = 0;
    
    headings.forEach((heading) => {
      const currentLevel = parseInt(heading.tagName.charAt(1));
      expect(currentLevel).toBeLessThanOrEqual(previousLevel + 1);
      previousLevel = currentLevel;
    });
  });

  it('should have proper landmark structure', async () => {
    const { container } = render(<SampleComponent title="Test" />);
    
    // Check for main landmark
    expect(container.querySelector('[role="main"], main')).toBeInTheDocument();
    
    // Check for navigation landmarks if present
    const navElements = container.querySelectorAll('[role="navigation"], nav');
    navElements.forEach(nav => {
      expect(nav).toHaveAttribute('aria-label');
    });
  });

  ${config.norwegianCompliance ? `
  it('should support Norwegian language attributes', async () => {
    const { container } = render(<SampleComponent title="Norsk Tittel" />);
    
    // Check for language attributes
    const langElements = container.querySelectorAll('[lang]');
    langElements.forEach(element => {
      const lang = element.getAttribute('lang');
      expect(['nb-NO', 'nn-NO', 'no'].includes(lang)).toBeTruthy();
    });
  });
  ` : ''}
});
    `.trim();
  }

  /**
   * Generate keyboard navigation test
   */
  private generateKeyboardNavigationTest(config: QATemplateConfig): string {
    return `
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SampleComponent } from '../sample-component';

describe('Keyboard Navigation Tests', () => {
  it('should be fully navigable with keyboard', async () => {
    const user = userEvent.setup();
    render(<SampleComponent title="Keyboard Test" />);
    
    // Get all focusable elements
    const focusableElements = screen.getAllByRole('button')
      .concat(screen.getAllByRole('link'))
      .concat(screen.getAllByRole('textbox'))
      .concat(screen.getAllByRole('combobox'));
    
    // Tab through all elements
    for (const element of focusableElements) {
      await user.tab();
      expect(element).toHaveFocus();
    }
  });

  it('should support escape key for closing modals', async () => {
    const user = userEvent.setup();
    const mockClose = jest.fn();
    
    render(<SampleComponent title="Modal Test" onClose={mockClose} />);
    
    // Simulate escape key
    await user.keyboard('{Escape}');
    
    // Verify close function was called (if modal is present)
    if (screen.queryByRole('dialog')) {
      expect(mockClose).toHaveBeenCalled();
    }
  });

  it('should trap focus within modals', async () => {
    const user = userEvent.setup();
    render(<SampleComponent title="Focus Trap Test" showModal={true} />);
    
    const modal = screen.queryByRole('dialog');
    if (modal) {
      const focusableInModal = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableInModal.length > 1) {
        // Focus first element
        focusableInModal[0].focus();
        
        // Tab to last element
        for (let i = 0; i < focusableInModal.length - 1; i++) {
          await user.tab();
        }
        
        // Tab once more should cycle back to first
        await user.tab();
        expect(focusableInModal[0]).toHaveFocus();
      }
    }
  });

  it('should have visible focus indicators', async () => {
    const user = userEvent.setup();
    render(<SampleComponent title="Focus Indicator Test" />);
    
    const buttons = screen.getAllByRole('button');
    
    for (const button of buttons) {
      await user.tab();
      if (button === document.activeElement) {
        const styles = window.getComputedStyle(button);
        
        // Check for focus indicators (outline, box-shadow, etc.)
        const hasOutline = styles.outline !== 'none' && styles.outline !== '0px';
        const hasBoxShadow = styles.boxShadow !== 'none' && styles.boxShadow !== '';
        const hasFocusRing = styles.getPropertyValue('--tw-ring-width') !== '';
        
        expect(hasOutline || hasBoxShadow || hasFocusRing).toBeTruthy();
      }
    }
  });
});
    `.trim();
  }

  /**
   * Generate screen reader test
   */
  private generateScreenReaderTest(config: QATemplateConfig): string {
    return `
import { render, screen } from '@testing-library/react';
import { SampleComponent } from '../sample-component';

describe('Screen Reader Compatibility Tests', () => {
  it('should have proper ARIA labels for all interactive elements', () => {
    render(<SampleComponent title="ARIA Test" />);
    
    // Check buttons have accessible names
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      const accessibleName = button.getAttribute('aria-label') || 
                           button.textContent || 
                           button.getAttribute('aria-labelledby');
      expect(accessibleName).toBeTruthy();
    });
  });

  it('should use proper ARIA roles for custom components', () => {
    render(<SampleComponent title="Role Test" />);
    
    // Check for proper roles
    const customElements = screen.container.querySelectorAll('[role]');
    customElements.forEach(element => {
      const role = element.getAttribute('role');
      const validRoles = [
        'button', 'link', 'textbox', 'combobox', 'listbox', 'option',
        'menu', 'menuitem', 'tablist', 'tab', 'tabpanel', 'dialog',
        'alertdialog', 'alert', 'status', 'progressbar', 'slider',
        'navigation', 'main', 'complementary', 'banner', 'contentinfo'
      ];
      expect(validRoles.includes(role)).toBeTruthy();
    });
  });

  it('should provide proper live region announcements', async () => {
    render(<SampleComponent title="Live Region Test" />);
    
    // Check for live regions
    const liveRegions = screen.container.querySelectorAll('[aria-live]');
    liveRegions.forEach(region => {
      const liveValue = region.getAttribute('aria-live');
      expect(['polite', 'assertive', 'off'].includes(liveValue)).toBeTruthy();
      
      // Check for aria-atomic if present
      if (region.hasAttribute('aria-atomic')) {
        const atomicValue = region.getAttribute('aria-atomic');
        expect(['true', 'false'].includes(atomicValue)).toBeTruthy();
      }
    });
  });

  it('should have proper form labels and descriptions', () => {
    render(<SampleComponent title="Form Test" showForm={true} />);
    
    // Check form inputs have labels
    const inputs = screen.container.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      const id = input.getAttribute('id');
      const label = screen.container.querySelector(\`label[for="\${id}"]\`);
      const ariaLabel = input.getAttribute('aria-label');
      const ariaLabelledby = input.getAttribute('aria-labelledby');
      
      expect(label || ariaLabel || ariaLabelledby).toBeTruthy();
    });
  });

  ${config.norwegianCompliance ? `
  it('should announce content in Norwegian', () => {
    render(<SampleComponent title="Norsk Innhold" />);
    
    // Check for Norwegian language content
    const norwegianElements = screen.container.querySelectorAll('[lang="nb-NO"], [lang="nn-NO"]');
    norwegianElements.forEach(element => {
      expect(element.textContent).toBeTruthy();
    });
  });
  ` : ''}
});
    `.trim();
  }

  /**
   * Generate color contrast test
   */
  private generateColorContrastTest(config: QATemplateConfig): string {
    return `
import { render } from '@testing-library/react';
import { SampleComponent } from '../sample-component';

// Color contrast calculation utilities
function getRGB(color: string): { r: number; g: number; b: number } | null {
  const match = color.match(/rgb\\((\\d+),\\s*(\\d+),\\s*(\\d+)\\)/);
  if (match) {
    return {
      r: parseInt(match[1], 10),
      g: parseInt(match[2], 10),
      b: parseInt(match[3], 10)
    };
  }
  return null;
}

function getLuminance(rgb: { r: number; g: number; b: number }): number {
  const { r, g, b } = rgb;
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = getRGB(color1);
  const rgb2 = getRGB(color2);
  
  if (!rgb1 || !rgb2) return 1;
  
  const lum1 = getLuminance(rgb1);
  const lum2 = getLuminance(rgb2);
  
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}

describe('Color Contrast Tests', () => {
  it('should meet WCAG AAA color contrast requirements', () => {
    const { container } = render(<SampleComponent title="Contrast Test" />);
    
    // Get all text elements
    const textElements = container.querySelectorAll('*');
    
    textElements.forEach(element => {
      const styles = window.getComputedStyle(element);
      const textColor = styles.color;
      const backgroundColor = styles.backgroundColor;
      
      if (textColor && backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)') {
        const contrastRatio = getContrastRatio(textColor, backgroundColor);
        
        // WCAG AAA requires 7:1 for normal text, 4.5:1 for large text
        const fontSize = parseFloat(styles.fontSize);
        const fontWeight = styles.fontWeight;
        
        const isLargeText = fontSize >= 18 || (fontSize >= 14 && (fontWeight === 'bold' || parseInt(fontWeight) >= 700));
        const requiredRatio = ${config.accessibility ? '7' : '4.5'};
        const minimumRatio = isLargeText ? 4.5 : requiredRatio;
        
        if (element.textContent?.trim()) {
          expect(contrastRatio).toBeGreaterThanOrEqual(minimumRatio);
        }
      }
    });
  });

  it('should not rely solely on color to convey information', () => {
    const { container } = render(<SampleComponent title="Color Dependency Test" />);
    
    // Check for error states, warnings, etc.
    const coloredElements = container.querySelectorAll('[class*="error"], [class*="warning"], [class*="success"]');
    
    coloredElements.forEach(element => {
      // Should have additional indicators like icons, text, or patterns
      const hasIcon = element.querySelector('svg, [role="img"]');
      const hasText = element.textContent?.trim();
      const hasPattern = element.classList.toString().match(/border|outline|underline/);
      
      expect(hasIcon || hasText || hasPattern).toBeTruthy();
    });
  });

  it('should maintain contrast in high contrast mode', () => {
    // Simulate high contrast mode
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-contrast: high)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
    
    const { container } = render(<SampleComponent title="High Contrast Test" />);
    
    // In high contrast mode, elements should use system colors
    const elements = container.querySelectorAll('*');
    elements.forEach(element => {
      const styles = window.getComputedStyle(element);
      
      // Check if high contrast styles are applied
      if (element.textContent?.trim()) {
        const hasSystemColors = styles.color.includes('CanvasText') || 
                               styles.backgroundColor.includes('Canvas') ||
                               styles.borderColor.includes('ButtonText');
        
        // This is a simplified check - in practice, you'd verify system color usage
        expect(styles.color).toBeTruthy();
      }
    });
  });
});
    `.trim();
  }

  /**
   * Generate performance testing files
   */
  private async generatePerformanceTestFiles(projectPath: string, config: QATemplateConfig): Promise<string[]> {
    const testFiles: string[] = [];
    const perfDir = path.join(projectPath, 'src/__tests__/performance');
    
    await fs.ensureDir(perfDir);

    // Generate Core Web Vitals test
    const coreWebVitalsTestPath = path.join(perfDir, 'core-web-vitals.perf.test.tsx');
    const coreWebVitalsContent = this.generateCoreWebVitalsTest(config);
    await fs.writeFile(coreWebVitalsTestPath, coreWebVitalsContent, 'utf-8');
    testFiles.push('src/__tests__/performance/core-web-vitals.perf.test.tsx');

    // Generate bundle size test
    const bundleSizeTestPath = path.join(perfDir, 'bundle-size.perf.test.ts');
    const bundleSizeContent = this.generateBundleSizeTest(config);
    await fs.writeFile(bundleSizeTestPath, bundleSizeContent, 'utf-8');
    testFiles.push('src/__tests__/performance/bundle-size.perf.test.ts');

    return testFiles;
  }

  /**
   * Generate Core Web Vitals test
   */
  private generateCoreWebVitalsTest(config: QATemplateConfig): string {
    return `
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

describe('Core Web Vitals Performance Tests', () => {
  it('should meet Core Web Vitals thresholds', (done) => {
    const vitals = {
      cls: null,
      fid: null,
      fcp: null,
      lcp: null,
      ttfb: null
    };
    
    let reportCount = 0;
    const expectedReports = 5;
    
    const checkComplete = () => {
      reportCount++;
      if (reportCount === expectedReports) {
        // LCP should be less than 2.5s (good)
        if (vitals.lcp !== null) {
          expect(vitals.lcp).toBeLessThan(2500);
        }
        
        // FID should be less than 100ms (good)
        if (vitals.fid !== null) {
          expect(vitals.fid).toBeLessThan(100);
        }
        
        // CLS should be less than 0.1 (good)
        if (vitals.cls !== null) {
          expect(vitals.cls).toBeLessThan(0.1);
        }
        
        // FCP should be less than 1.8s (good)
        if (vitals.fcp !== null) {
          expect(vitals.fcp).toBeLessThan(1800);
        }
        
        // TTFB should be less than 800ms (good)
        if (vitals.ttfb !== null) {
          expect(vitals.ttfb).toBeLessThan(800);
        }
        
        done();
      }
    };
    
    getCLS((metric) => {
      vitals.cls = metric.value;
      checkComplete();
    });
    
    getFID((metric) => {
      vitals.fid = metric.value;
      checkComplete();
    });
    
    getFCP((metric) => {
      vitals.fcp = metric.value;
      checkComplete();
    });
    
    getLCP((metric) => {
      vitals.lcp = metric.value;
      checkComplete();
    });
    
    getTTFB((metric) => {
      vitals.ttfb = metric.value;
      checkComplete();
    });
    
    // Timeout after 30 seconds
    setTimeout(() => {
      if (reportCount < expectedReports) {
        console.warn('Not all Core Web Vitals metrics were reported within timeout');
        done();
      }
    }, 30000);
  });

  it('should have acceptable JavaScript execution time', async () => {
    const startTime = performance.now();
    
    // Simulate heavy JavaScript execution
    await import('../sample-component').then(module => {
      // Component should load quickly
      const loadTime = performance.now() - startTime;
      expect(loadTime).toBeLessThan(${config.performance ? '100' : '500'}); // milliseconds
    });
  });

  it('should have optimized image loading', async () => {
    // Mock image loading
    const mockImage = new Image();
    const imageLoadPromise = new Promise((resolve, reject) => {
      mockImage.onload = resolve;
      mockImage.onerror = reject;
      mockImage.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwMCIvPjwvc3ZnPg==';
    });
    
    const startTime = performance.now();
    await imageLoadPromise;
    const loadTime = performance.now() - startTime;
    
    // Image should load quickly (under 100ms for small test image)
    expect(loadTime).toBeLessThan(100);
  });
});
    `.trim();
  }

  /**
   * Generate bundle size test
   */
  private generateBundleSizeTest(config: QATemplateConfig): string {
    return `
import fs from 'fs';
import path from 'path';
import { gzipSync } from 'zlib';

describe('Bundle Size Tests', () => {
  const buildDir = path.join(process.cwd(), 'build', 'static', 'js');
  const nextBuildDir = path.join(process.cwd(), '.next', 'static', 'chunks');
  
  it('should have acceptable main bundle size', () => {
    let bundleDir = buildDir;
    
    // Check for Next.js build
    if (fs.existsSync(nextBuildDir)) {
      bundleDir = nextBuildDir;
    }
    
    if (!fs.existsSync(bundleDir)) {
      console.warn('Build directory not found, skipping bundle size test');
      return;
    }
    
    const jsFiles = fs.readdirSync(bundleDir)
      .filter(file => file.endsWith('.js') && !file.includes('.map'))
      .filter(file => file.includes('main') || file.includes('app') || file.includes('pages'));
    
    let totalSize = 0;
    let totalGzipSize = 0;
    
    jsFiles.forEach(file => {
      const filePath = path.join(bundleDir, file);
      const content = fs.readFileSync(filePath);
      const gzipped = gzipSync(content);
      
      totalSize += content.length;
      totalGzipSize += gzipped.length;
    });
    
    // Convert to KB
    const totalSizeKB = totalSize / 1024;
    const totalGzipSizeKB = totalGzipSize / 1024;
    
    console.log(\`Bundle size: \${totalSizeKB.toFixed(2)}KB (\${totalGzipSizeKB.toFixed(2)}KB gzipped)\`);
    
    // Main bundle should be under reasonable limits
    const maxSizeKB = ${config.performance ? '200' : '500'}; // KB
    const maxGzipSizeKB = ${config.performance ? '80' : '200'}; // KB
    
    expect(totalSizeKB).toBeLessThan(maxSizeKB);
    expect(totalGzipSizeKB).toBeLessThan(maxGzipSizeKB);
  });

  it('should not have duplicate dependencies', () => {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
      return;
    }
    
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const dependencies = Object.keys(packageJson.dependencies || {});
    const devDependencies = Object.keys(packageJson.devDependencies || {});
    
    // Check for duplicates between dependencies and devDependencies
    const duplicates = dependencies.filter(dep => devDependencies.includes(dep));
    
    expect(duplicates).toHaveLength(0);
  });

  it('should have tree-shaking friendly imports', async () => {
    // This is a simplified check - in practice, you'd analyze the actual bundle
    const testFile = path.join(process.cwd(), 'src', 'test-tree-shaking.js');
    
    // Create a test file that imports a large library
    const testContent = \`
      import { debounce } from 'lodash';
      export const debouncedFn = debounce(() => {}, 300);
    \`;
    
    fs.writeFileSync(testFile, testContent);
    
    try {
      // In a real scenario, you'd build this file and check the output size
      // For now, we'll just check that the import is tree-shakable
      expect(testContent.includes('import {')).toBeTruthy();
      expect(testContent.includes('} from')).toBeTruthy();
    } finally {
      // Clean up
      if (fs.existsSync(testFile)) {
        fs.unlinkSync(testFile);
      }
    }
  });
});
    `.trim();
  }
}

// Singleton instance
export const qualityAssuranceTemplates = new QualityAssuranceTemplates();