/**
 * Playwright Configuration for Phase 10 Compliance Testing
 * 
 * Specialized configuration for Norwegian government standards compliance,
 * WCAG accessibility testing, and automated browser testing.
 */

import { defineConfig, devices } from '@playwright/test';
import { loadPhase10Config } from './test-config';

const config = loadPhase10Config();

export default defineConfig({
  // Test directory
  testDir: '../',
  
  // Test files pattern
  testMatch: [
    '**/bankid-altinn/**/*.test.ts',
    '**/wcag-accessibility/**/*.test.ts',
    '**/gdpr-compliance/**/*.test.ts'
  ],
  
  // Global timeout
  timeout: config.general.timeout,
  
  // Test execution
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? config.general.retries : 0,
  workers: process.env.CI ? config.general.parallelJobs : undefined,
  
  // Reporter configuration
  reporter: [
    ['html', { outputFolder: `${config.general.outputDirectory}/playwright-report` }],
    ['junit', { outputFile: `${config.general.outputDirectory}/playwright-results.xml` }],
    ['json', { outputFile: `${config.general.outputDirectory}/playwright-results.json` }],
    // Custom Norwegian compliance reporter
    ['./utils/norwegian-compliance-reporter.ts']
  ],
  
  // Global test configuration
  use: {
    // Base URL for Norwegian test services
    baseURL: 'https://eid-exttest.difi.no/',
    
    // Browser settings
    headless: process.env.CI ? true : false,
    viewport: { width: 1920, height: 1080 },
    
    // Screenshots and videos
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Trace collection
    trace: 'retain-on-failure',
    
    // Norwegian locale settings
    locale: 'nb-NO',
    timezoneId: 'Europe/Oslo',
    
    // Accessibility testing
    actionTimeout: 10000,
    navigationTimeout: 30000,
    
    // HTTPS and security
    ignoreHTTPSErrors: false, // Strict HTTPS for compliance
    acceptDownloads: true,
    
    // Custom user agent for Norwegian testing
    userAgent: 'Xaheen-CLI-Phase10-Compliance-Test/1.0.0'
  },
  
  // Browser projects for comprehensive testing
  projects: [
    // Desktop browsers - Primary Norwegian browser support
    {
      name: 'Desktop Chrome - Norwegian',
      use: {
        ...devices['Desktop Chrome'],
        locale: 'nb-NO',
        timezoneId: 'Europe/Oslo'
      }
    },
    
    {
      name: 'Desktop Firefox - Norwegian',
      use: {
        ...devices['Desktop Firefox'],
        locale: 'nb-NO',
        timezoneId: 'Europe/Oslo'
      }
    },
    
    {
      name: 'Desktop Safari - Norwegian',
      use: {
        ...devices['Desktop Safari'],
        locale: 'nb-NO',
        timezoneId: 'Europe/Oslo'
      }
    },
    
    // Mobile browsers - Norwegian mobile users
    {
      name: 'Mobile Chrome - Norwegian',
      use: {
        ...devices['Pixel 5'],
        locale: 'nb-NO',
        timezoneId: 'Europe/Oslo'
      }
    },
    
    {
      name: 'Mobile Safari - Norwegian',
      use: {
        ...devices['iPhone 12'],
        locale: 'nb-NO',
        timezoneId: 'Europe/Oslo'
      }
    },
    
    // Accessibility testing with specific configurations
    {
      name: 'Accessibility - High Contrast',
      use: {
        ...devices['Desktop Chrome'],
        locale: 'nb-NO',
        colorScheme: 'dark',
        reducedMotion: 'reduce',
        forcedColors: 'active'
      }
    },
    
    {
      name: 'Accessibility - Screen Reader',
      use: {
        ...devices['Desktop Chrome'],
        locale: 'nb-NO',
        hasTouch: false,
        // Simulate screen reader navigation patterns
        extraHTTPHeaders: {
          'User-Agent': 'Xaheen-CLI-ScreenReader-Test/1.0.0'
        }
      }
    }
  ],
  
  // Local development server
  webServer: process.env.CI ? undefined : {
    command: 'npm run dev:test-server',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    env: {
      NODE_ENV: 'test',
      BANKID_TEST_MODE: 'true',
      ALTINN_TEST_MODE: 'true'
    }
  },
  
  // Global setup and teardown
  globalSetup: require.resolve('./global-setup.ts'),
  globalTeardown: require.resolve('./global-teardown.ts'),
  
  // Test output directories
  outputDir: `${config.general.outputDirectory}/playwright-artifacts`,
  
  // Norwegian compliance specific settings
  expect: {
    // Screenshots for Norwegian UI compliance
    toHaveScreenshot: {
      threshold: 0.2,
      mode: 'strict'
    },
    
    // Accessibility assertions timeout
    timeout: 15000
  },
  
  // Metadata for Norwegian compliance reporting
  metadata: {
    testSuite: 'Phase 10 - Norwegian Government Compliance',
    version: '1.0.0',
    standards: [
      'BankID Integration',
      'Altinn Service Integration',
      'WCAG 2.2 Level AAA',
      'GDPR Article 7 (Consent)',
      'GDPR Article 17 (Right to Erasure)',
      'Norwegian Personal Data Act'
    ],
    testEnvironment: 'Norwegian Government Test Infrastructure',
    complianceFramework: 'NSM Security Framework',
    accessibilityStandard: 'WCAG 2.2 AAA',
    dataProtectionStandard: 'GDPR + Norwegian Personal Data Act'
  }
});