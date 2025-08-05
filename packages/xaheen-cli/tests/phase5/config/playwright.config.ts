import { defineConfig, devices } from '@playwright/test';
import { getTestConfig } from './test-config';

const testConfig = getTestConfig(process.env.CI ? 'ci' : 'default');

/**
 * Playwright configuration for Phase 5 E2E tests
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: '../e2e',
  
  /* Run tests in files in parallel */
  fullyParallel: !process.env.CI,
  
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI 
    ? [
        ['html', { outputFolder: '../../../test-results/phase5-playwright-report' }],
        ['junit', { outputFile: '../../../test-results/phase5-playwright-junit.xml' }],
        ['line']
      ]
    : [
        ['html', { outputFolder: '../../../test-results/phase5-playwright-report' }],
        ['list']
      ],
  
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: `http://localhost:${testConfig.ports.frontend}`,
    
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Take screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Record video on failure */
    video: 'retain-on-failure',
    
    /* Navigation timeout */
    navigationTimeout: 30000,
    
    /* Action timeout */
    actionTimeout: 15000,
    
    /* Test timeout */
    testTimeout: testConfig.timeout * 2, // E2E tests need more time
  },
  
  /* Global test timeout */
  globalTimeout: process.env.CI ? 600000 : 300000, // 10 minutes in CI, 5 minutes locally
  
  /* Test timeout per test */
  timeout: testConfig.timeout * 2,
  
  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    
    // Enable Firefox and Safari for comprehensive testing in CI
    ...(process.env.CI ? [
      {
        name: 'firefox',
        use: { ...devices['Desktop Firefox'] },
      },
      {
        name: 'webkit',
        use: { ...devices['Desktop Safari'] },
      },
    ] : []),
    
    /* Test against mobile viewports. */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
    
    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],
  
  /* Global setup files */
  globalSetup: require.resolve('../utils/global-setup.ts'),
  globalTeardown: require.resolve('../utils/global-teardown.ts'),
  
  /* Run your local dev server before starting the tests */
  webServer: [
    {
      command: 'bun run start:test-frontend',
      port: testConfig.ports.frontend,
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
      env: {
        NODE_ENV: 'test',
        PORT: testConfig.ports.frontend.toString(),
        API_URL: `http://localhost:${testConfig.ports.backend}`,
      },
    },
    {
      command: 'bun run start:test-backend',
      port: testConfig.ports.backend,
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
      env: {
        NODE_ENV: 'test',
        PORT: testConfig.ports.backend.toString(),
        DATABASE_URL: 'sqlite://memory',
      },
    },
  ],
  
  /* Expect configuration */
  expect: {
    /* Maximum time expect() should wait for the condition to be met. */
    timeout: 10000,
    
    /* Custom screenshot comparison threshold */
    toHaveScreenshot: { threshold: 0.2 },
  },
  
  /* Output directory for test results */
  outputDir: '../../../test-results/phase5-playwright-artifacts',
});