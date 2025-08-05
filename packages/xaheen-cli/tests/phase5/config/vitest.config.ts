import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    name: 'phase5-integration',
    root: path.resolve(__dirname, '..'),
    testTimeout: 60000,
    hookTimeout: 30000,
    teardownTimeout: 10000,
    
    // Test environment configuration
    environment: 'node',
    
    // Global test setup
    setupFiles: ['./utils/test-setup.ts'],
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: '../../../coverage/phase5',
      include: [
        'src/**/*.ts',
        '!src/**/*.test.ts',
        '!src/**/*.spec.ts',
      ],
      exclude: [
        'node_modules',
        'dist',
        'coverage',
        '**/*.d.ts',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
    
    // Test file patterns
    include: [
      'integration/**/*.test.ts',
      'e2e/**/*.test.ts',
    ],
    
    // Global test configuration
    globals: true,
    
    // Parallel execution
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        minThreads: 1,
        maxThreads: process.env.CI ? 2 : 4,
      },
    },
    
    // Retry configuration
    retry: process.env.CI ? 2 : 0,
    
    // Reporter configuration
    reporter: process.env.CI 
      ? ['verbose', 'junit'] 
      : ['verbose'],
    
    outputFile: {
      junit: '../../../test-results/phase5-junit.xml',
    },
    
    // Watch mode configuration (for local development)
    watch: false,
    
    // Workspace configuration
    workspace: path.resolve(__dirname, '../../../..'),
    
    // Test isolation
    isolate: true,
    
    // Performance settings
    logHeapUsage: true,
    
    // Custom matchers and test utilities
    expect: {
      // Add custom matchers if needed
    },
  },
  
  // Resolve configuration for test dependencies
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../../../src'),
      '@test-utils': path.resolve(__dirname, '../utils'),
      '@fixtures': path.resolve(__dirname, '../fixtures'),
      '@mocks': path.resolve(__dirname, '../mocks'),
    },
  },
});