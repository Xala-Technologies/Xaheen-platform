import { defineConfig } from 'vitest/config';
import { getTestConfig } from './test-config';

const config = getTestConfig();

export default defineConfig({
  test: {
    name: 'phase0-tests',
    testTimeout: config.timeouts.default,
    hookTimeout: config.timeouts.default,
    teardownTimeout: config.timeouts.default,
    
    // Test environment
    environment: 'node',
    
    // Global setup and teardown
    globalSetup: ['../scripts/setup-test-env.ts'],
    globalTeardown: ['../scripts/cleanup-test-env.ts'],
    
    // Test patterns
    include: [
      '../**/*.test.ts',
      '../**/*.spec.ts',
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.git/**',
    ],
    
    // Reporters
    reporters: process.env.CI 
      ? ['verbose', 'junit', 'json']
      : ['verbose'],
    
    // Output files
    outputFile: {
      junit: './test-output/phase0-junit.xml',
      json: './test-output/phase0-results.json',
    },
    
    // Coverage (optional for Phase 0)
    coverage: {
      enabled: false, // Phase 0 focuses on integration/e2e testing
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './test-output/coverage',
    },
    
    // Retry configuration
    retry: process.env.CI ? 2 : 0,
    
    // Sequential execution for Phase 0 (resource-heavy tests)
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true, // Sequential execution
      },
    },
    
    // Test context
    globals: true,
    
    // Setup files
    setupFiles: ['../utils/test-setup.ts'],
    
    // Watch mode (disabled for Phase 0 by default)
    watch: false,
    
    // Logging
    logHeapUsage: true,
    
    // Environment variables
    env: {
      NODE_ENV: 'test',
      FORCE_COLOR: '1',
      TEST_PHASE: '0',
      TEST_TYPE: 'integration',
    },
  },
  
  // Define test workspace
  define: {
    __TEST_CONFIG__: JSON.stringify(config),
  },
  
  // Resolve configuration
  resolve: {
    alias: {
      '@': '../../../src',
      '@tests': '..',
      '@utils': '../utils',
    },
  },
});