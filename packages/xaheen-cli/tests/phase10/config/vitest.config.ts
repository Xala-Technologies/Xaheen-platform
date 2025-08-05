/**
 * Vitest Configuration for Phase 10 Compliance Testing
 * 
 * Unit and integration test configuration for Norwegian government standards,
 * NSM security classifications, and GDPR compliance testing.
 */

import { defineConfig } from 'vitest/config';
import { loadPhase10Config } from './test-config';

const config = loadPhase10Config();

export default defineConfig({
  test: {
    // Test environment
    environment: 'node',
    
    // Test files
    include: [
      '../**/*.test.ts',
      '../**/*.spec.ts'
    ],
    
    exclude: [
      '../**/playwright/**',
      '../**/*.e2e.test.ts',
      '../**/*.browser.test.ts'
    ],
    
    // Global configuration
    globals: true,
    
    // Timeouts
    testTimeout: config.general.timeout,
    hookTimeout: 10000,
    
    // Retries
    retry: config.general.retries,
    
    // Parallel execution
    threads: config.general.parallelJobs,
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: `${config.general.outputDirectory}/coverage`,
      
      // Coverage thresholds for compliance
      thresholds: {
        global: {
          lines: 95,    // High coverage for compliance code
          branches: 90,
          functions: 95,
          statements: 95
        }
      },
      
      // Include compliance modules
      include: [
        'src/services/compliance/**',
        'src/generators/compliance/**',
        'src/services/authentication/**',
        'src/generators/integrations/**'
      ],
      
      // Exclude test files and mocks
      exclude: [
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/mocks/**',
        '**/fixtures/**'
      ]
    },
    
    // Reporters
    reporter: [
      'verbose',
      'json',
      ['junit', { outputFile: `${config.general.outputDirectory}/junit-results.xml` }],
      ['html', { outputFile: `${config.general.outputDirectory}/vitest-report.html` }]
    ],
    
    // Setup files
    setupFiles: [
      './utils/test-setup.ts',
      './utils/norwegian-test-setup.ts'
    ],
    
    // Global test configuration
    globalSetup: './utils/global-setup.ts',
    
    // Environment variables for testing
    env: {
      NODE_ENV: 'test',
      BANKID_TEST_MODE: 'true',
      ALTINN_TEST_MODE: 'true',
      DIGIPOST_TEST_MODE: 'true',
      NSM_TEST_MODE: 'true',
      GDPR_TEST_MODE: 'true',
      WCAG_TEST_MODE: 'true'
    },
    
    // Pool options
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        isolate: true
      }
    },
    
    // Output configuration
    outputFile: {
      json: `${config.general.outputDirectory}/vitest-results.json`,
      junit: `${config.general.outputDirectory}/vitest-junit.xml`
    },
    
    // Watch mode configuration
    watch: process.env.CI ? false : true,
    
    // Mocking configuration
    mockReset: true,
    clearMocks: true,
    restoreMocks: true,
    
    // Snapshot configuration
    snapshotFormat: {
      escapeString: true,
      printBasicPrototype: false
    }
  },
  
  // Resolve configuration
  resolve: {
    alias: {
      '@': '../../../src',
      '@tests': '../',
      '@fixtures': '../fixtures',
      '@mocks': '../mocks',
      '@utils': '../utils'
    }
  },
  
  // Define configuration for Norwegian compliance testing
  define: {
    __PHASE10_CONFIG__: JSON.stringify(config),
    __NORWEGIAN_COMPLIANCE__: true,
    __NSM_SECURITY_ENABLED__: true,
    __GDPR_COMPLIANCE_ENABLED__: true,
    __WCAG_AAA_REQUIRED__: true,
    
    // Norwegian service endpoints
    __BANKID_ENDPOINT__: JSON.stringify(config.bankid.testEndpoint),
    __ALTINN_ENDPOINT__: JSON.stringify(config.altinn.testEndpoint),
    __DIGIPOST_ENDPOINT__: JSON.stringify(config.digipost.testEndpoint),
    __DIGDIR_ENDPOINT__: JSON.stringify(config.digdir.reportingEndpoint),
    
    // Security classifications
    __NSM_CLASSIFICATIONS__: JSON.stringify(config.nsm.classifications),
    
    // Test mode flags
    __TEST_MODE__: true,
    __COMPLIANCE_TEST_MODE__: true
  },
  
  // Esbuild configuration for Norwegian character support
  esbuild: {
    target: 'node18',
    charset: 'utf8'
  }
});