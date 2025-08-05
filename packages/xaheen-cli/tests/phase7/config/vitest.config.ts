/**
 * Vitest Configuration for Phase 7: SaaS & Multi-Tenancy Tests
 */

import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    name: 'phase7-saas-multi-tenancy',
    testTimeout: 60000, // 60 seconds for scaffolding tests
    hookTimeout: 30000, // 30 seconds for setup/teardown
    teardownTimeout: 15000,
    
    // Test environment setup
    environment: 'node',
    
    // Global test setup and teardown
    globalSetup: [
      './utils/global-setup.ts',
    ],
    globalTeardown: [
      './utils/global-teardown.ts',
    ],
    
    // Test file patterns
    include: [
      './integration/**/*.test.ts',
      './unit/**/*.test.ts',
      './e2e/**/*.test.ts'
    ],
    
    // Exclude patterns
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '**/.{git,cache,output,temp}/**'
    ],
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'coverage/**',
        'dist/**',
        '**/node_modules/**',
        '**/test/**',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/mocks/**',
        '**/fixtures/**',
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
    },
    
    // Reporter configuration
    reporter: [
      'verbose',
      'json',
      ['html', { outputFile: './test-results/phase7-report.html' }],
      ['junit', { outputFile: './test-results/phase7-junit.xml' }],
    ],
    
    // Retry configuration
    retry: 2,
    
    // Concurrent execution
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        maxThreads: 4,
        minThreads: 1,
      },
    },
    
    // Test setup files
    setupFiles: [
      './utils/test-setup.ts',
    ],
    
    // Environment variables
    env: {
      NODE_ENV: 'test',
      TEST_PHASE: 'phase7',
      LOG_LEVEL: 'error', // Reduce noise in tests
    },
  },
  
  // Resolve configuration
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../../../src'),
      '@test': path.resolve(__dirname, '../'),
      '@mocks': path.resolve(__dirname, '../mocks'),
      '@fixtures': path.resolve(__dirname, '../fixtures'),
      '@utils': path.resolve(__dirname, '../utils'),
    },
  },
  
  // Define configuration
  define: {
    __TEST_PHASE__: '"phase7"',
    __TEST_ENV__: '"test"',
  },
});