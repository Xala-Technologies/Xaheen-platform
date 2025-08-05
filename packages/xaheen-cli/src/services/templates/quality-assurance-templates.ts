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

    consola.success('Initialized quality assurance templates');
  }
}

// Singleton instance
export const qualityAssuranceTemplates = new QualityAssuranceTemplates();