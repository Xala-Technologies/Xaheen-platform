{{!-- Template: testing.config.ts.hbs --}}
{{!-- Category: frontend --}}
{{!-- Type: config --}}
{{!-- Framework: next --}}
{{!-- Migrated from: /Volumes/Development/Xaheen Enterprise/xaheen/apps/cli/templates/frontend/react/next/testing.config.ts.hbs --}}
/**
 * Testing Configuration - Xala UI System Compliant
 * Generated with Xaheen CLI - Multi-Platform Testing Setup
 * 
 * MANDATORY COMPLIANCE RULES:
 * ❌ NO raw HTML elements (div, span, p, h1-h6, button, input, etc.) in pages
 * ✅ ONLY semantic components from @xaheen-ai/design-system
 * ❌ NO hardcoded styling (no style=placeholder, no arbitrary Tailwind values)
 * ✅ MANDATORY design token usage for all colors, spacing, typography
 * ✅ Enhanced 8pt Grid System - all spacing in 8px increments
 * ✅ WCAG 2.2 AAA compliance for accessibility
 * ❌ NO hardcoded user-facing text - ALL text must use t() function
 * ✅ MANDATORY localization: English, Norwegian Bokmål, French, Arabic
 * ✅ Explicit TypeScript return types (no 'any' types)
 * ✅ SOLID principles and component composition
 * ✅ Maximum 200 lines per file, 20 lines per function
 * 
 * Features:
 * - Platform-specific test configurations
 * - Accessibility testing setup
 * - Norwegian localization testing
 * - Performance testing configs
 * - Visual regression testing
 * - Cross-platform test utilities
 */

{{#if typescript}}
import type { Config } from '@jest/types';
import type { PlaywrightTestConfig } from '@playwright/test';
import type { StorybookConfig } from '@storybook/react-vite';

interface PlatformTestConfig {
  jest: Config.InitialOptions;
  playwright: PlaywrightTestConfig;
  storybook: StorybookConfig;
  accessibility: AccessibilityTestConfig;
  performance: PerformanceTestConfig;
  localization: LocalizationTestConfig;
}

interface AccessibilityTestConfig {
  wcagLevel: 'AA' | 'AAA';
  rules: string[];
  tags: string[];
  colorContrast: {
    normal: number;
    large: number;
  };
  norwegianCompliance: boolean;
}

interface PerformanceTestConfig {
  budgets: PerformanceBudget[];
  metrics: string[];
  thresholds: Record<string, number>;
  platforms: string[];
}

interface PerformanceBudget {
  resourceType: string;
  maximumSize: string;
  warning?: string;
}

interface LocalizationTestConfig {
  locales: string[];
  fallbackLocale: string;
  testKeys: string[];
  norwegianSpecific: boolean;
  rtlSupport: boolean;
}
{{else}}
// TypeScript interfaces would be here in TypeScript mode
{{/if}}

/**
 * Base Jest configuration for all platforms
 */
const baseJestConfig{{#if typescript}}: Config.InitialOptions{{/if}} = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@xaheen-ai/design-system$': '<rootDir>/node_modules/@xaheen-ai/design-system',
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{ts,tsx}',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/test/**/*',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
  },
};

/**
 * Platform-specific Jest configurations
 */
const platformJestConfigs = {
  web: {
    ...baseJestConfig,
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: [
      '<rootDir>/src/test/setup.ts',
      '<rootDir>/src/test/web-setup.ts',
    ],
    testMatch: [
      '<rootDir>/src/**/__tests__/**/*.web.{ts,tsx}',
      '<rootDir>/src/**/*.web.{test,spec}.{ts,tsx}',
      '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
      '<rootDir>/src/**/*.{test,spec}.{ts,tsx}',
    ],
  },
  
  mobile: {
    ...baseJestConfig,
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: [
      '<rootDir>/src/test/setup.ts',
      '<rootDir>/src/test/mobile-setup.ts',
    ],
    testMatch: [
      '<rootDir>/src/**/__tests__/**/*.mobile.{ts,tsx}',
      '<rootDir>/src/**/*.mobile.{test,spec}.{ts,tsx}',
    ],
    globals: {
      'ts-jest': {
        tsconfig: {
          jsx: 'react-jsx',
        },
      },
    },
  },
  
  desktop: {
    ...baseJestConfig,
    testEnvironment: 'node',
    setupFilesAfterEnv: [
      '<rootDir>/src/test/setup.ts',
      '<rootDir>/src/test/desktop-setup.ts',
    ],
    testMatch: [
      '<rootDir>/src/**/__tests__/**/*.desktop.{ts,tsx}',
      '<rootDir>/src/**/*.desktop.{test,spec}.{ts,tsx}',
    ],
  },
};

/**
 * Playwright configuration for E2E testing
 */
const playwrightConfig{{#if typescript}}: PlaywrightTestConfig{{/if}} = {
  testDir: './src/test/e2e',
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    // Desktop browsers
    {
      name: 'chromium-desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: 'firefox-desktop',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: 'webkit-desktop',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    
    // Mobile devices (Norwegian market focus)
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
      },
    },
    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 13'],
      },
    },
    {
      name: 'mobile-samsung',
      use: {
        ...devices['Galaxy S22'],
      },
    },
    
    // Tablet devices
    {
      name: 'tablet-ipad',
      use: {
        ...devices['iPad Pro'],
      },
    },
  ],
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
};

/**
 * Accessibility testing configuration
 */
const accessibilityConfig{{#if typescript}}: AccessibilityTestConfig{{/if}} = {
  wcagLevel: 'AAA',
  rules: [
    'wcag2a',
    'wcag2aa',
    'wcag2aaa',
    'wcag21aa',
    'wcag21aaa',
    'wcag22aa',
    'wcag22aaa',
  ],
  tags: [
    'wcag2a',
    'wcag2aa',
    'wcag2aaa',
    'wcag21aa',
    'wcag21aaa',
    'wcag22aa',
    'wcag22aaa',
    'best-practice',
  ],
  colorContrast: {
    normal: 7.0, // WCAG AAA
    large: 4.5,  // WCAG AAA for large text
  },
  norwegianCompliance: true,
};

/**
 * Performance testing configuration
 */
const performanceConfig{{#if typescript}}: PerformanceTestConfig{{/if}} = {
  budgets: [
    {
      resourceType: 'initial',
      maximumSize: '500kb',
      warning: '400kb',
    },
    {
      resourceType: 'anyComponentStyle',
      maximumSize: '50kb',
      warning: '40kb',
    },
    {
      resourceType: 'anyScript',
      maximumSize: '200kb',
      warning: '150kb',
    },
  ],
  metrics: [
    'first-contentful-paint',
    'largest-contentful-paint',
    'first-input-delay',
    'cumulative-layout-shift',
    'total-blocking-time',
  ],
  thresholds: {
    'first-contentful-paint': 1800,
    'largest-contentful-paint': 2500,
    'first-input-delay': 100,
    'cumulative-layout-shift': 0.1,
    'total-blocking-time': 300,
  },
  platforms: ['mobile', 'desktop', 'web'],
};

/**
 * Localization testing configuration
 */
const localizationConfig{{#if typescript}}: LocalizationTestConfig{{/if}} = {
  locales: ['en', 'nb', 'fr', 'ar'],
  fallbackLocale: 'en',
  testKeys: [
    'common.loading',
    'common.error',
    'common.success',
    'navigation.home',
    'navigation.dashboard',
    'form.submit',
    'form.cancel',
    'accessibility.skipToMain',
  ],
  norwegianSpecific: true,
  rtlSupport: true,
};

/**
 * Storybook configuration
 */
const storybookConfig{{#if typescript}}: StorybookConfig{{/if}} = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@storybook/addon-viewport',
    '@storybook/addon-docs',
    '@storybook/addon-controls',
    '@storybook/addon-actions',
    '@storybook/addon-backgrounds',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  features: {
    buildStoriesJson: true,
  },
  docs: {
    autodocs: 'tag',
  },
  typescript: {
    check: false,
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },
};

/**
 * Test utilities for platform-specific testing
 */
const testUtils = {
  /**
   * Mock platform detection for testing
   */
  mockPlatform: (platform{{#if typescript}}: 'mobile' | 'desktop' | 'web'{{/if}}) => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: platform === 'mobile' ? query.includes('max-width') : !query.includes('max-width'),
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  },

  /**
   * Mock device capabilities
   */
  mockDeviceCapabilities: (capabilities{{#if typescript}}: Partial<{
    touch: boolean;
    hover: boolean;
    keyboard: boolean;
    camera: boolean;
    geolocation: boolean;
  }>{{/if}}) => {
    // Mock touch capability
    if (capabilities.touch !== undefined) {
      Object.defineProperty(window, 'ontouchstart', {
        writable: true,
        value: capabilities.touch ? {} : undefined,
      });
    }

    // Mock hover capability
    if (capabilities.hover !== undefined) {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation((query) => ({
          matches: query.includes('hover') ? capabilities.hover : false,
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });
    }
  },

  /**
   * Test accessibility compliance
   */
  testAccessibility: {{#if typescript}}async (element: HTMLElement): Promise<void>{{/if}} => {
    const { axe, toHaveNoViolations } = await import('jest-axe');
    expect.extend(toHaveNoViolations);
    
    const results = await axe(element, {
      rules: accessibilityConfig.rules.reduce((acc, rule) => {
        acc[rule] = { enabled: true };
        return acc;
      }, {}),
    });
    
    expect(results).toHaveNoViolations();
  },

  /**
   * Test Norwegian localization
   */
  testNorwegianLocalization: (component{{#if typescript}}: any{{/if}}, key{{#if typescript}}: string{{/if}}) => {
    // Test Norwegian Bokmål
    const norwegianText = component.getByText(new RegExp(key, 'i'));
    expect(norwegianText).toBeInTheDocument();
    
    // Test proper Norwegian formatting
    if (key.includes('date') || key.includes('time')) {
      expect(norwegianText.textContent).toMatch(/\d{2}\.\d{2}\.\d{4}/); // DD.MM.YYYY format
    }
    
    if (key.includes('currency')) {
      expect(norwegianText.textContent).toMatch(/kr\s?\d+/); // Norwegian kroner format
    }
  },

  /**
   * Test performance metrics
   */
  testPerformance: {{#if typescript}}async (url: string): Promise<void>{{/if}} => {
    const lighthouse = await import('lighthouse');
    const chromeLauncher = await import('chrome-launcher');
    
    const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
    const options = { logLevel: 'info', output: 'json', onlyCategories: ['performance'], port: chrome.port };
    const runnerResult = await lighthouse(url, options);
    
    const performanceScore = runnerResult.lhr.categories.performance.score * 100;
    expect(performanceScore).toBeGreaterThanOrEqual(90); // Minimum 90% performance score
    
    await chrome.kill();
  },
};

/**
 * Complete platform testing configuration
 */
const platformTestConfig{{#if typescript}}: PlatformTestConfig{{/if}} = {
  jest: platformJestConfigs,
  playwright: playwrightConfig,
  storybook: storybookConfig,
  accessibility: accessibilityConfig,
  performance: performanceConfig,
  localization: localizationConfig,
};

export default platformTestConfig;
export {
  platformJestConfigs,
  playwrightConfig,
  storybookConfig,
  accessibilityConfig,
  performanceConfig,
  localizationConfig,
  testUtils,
};

{{#if includeExamples}}
// Example usage in test files:
/*
// Component test with platform detection
import { render, screen } from '@testing-library/react';
import { testUtils } from '@/config/testing.config';
import AdaptiveLayout from '@/layouts/AdaptiveLayout';

describe('AdaptiveLayout', () => {
  it('renders mobile layout on mobile platform', () => {
    testUtils.mockPlatform('mobile');
    testUtils.mockDeviceCapabilities({ touch: true, hover: false });
    
    render(<AdaptiveLayout><div>Content</div></AdaptiveLayout>);
    
    expect(screen.getByText('Content')).toBeInTheDocument();
    // Add mobile-specific assertions
  });

  it('meets accessibility standards', async () => {
    const { container } = render(<AdaptiveLayout><div>Content</div></AdaptiveLayout>);
    await testUtils.testAccessibility(container);
  });

  it('supports Norwegian localization', () => {
    render(
      <IntlProvider locale="nb">
        <AdaptiveLayout><div>Content</div></AdaptiveLayout>
      </IntlProvider>
    );
    
    testUtils.testNorwegianLocalization(screen, 'navigation.home');
  });
});

// E2E test example
import { test, expect } from '@playwright/test';

test('mobile navigation works correctly', async ({ page }) => {
  await page.goto('/');
  await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
  
  // Test mobile-specific interactions
  await page.tap('[data-testid="mobile-menu-button"]');
  await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
});

// Performance test example
import { testUtils } from '@/config/testing.config';

test('page performance meets standards', async () => {
  await testUtils.testPerformance('http://localhost:3000');
});
*/
{{/if}}
