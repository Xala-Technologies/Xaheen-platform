import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    name: 'phase3-multi-package-manager',
    root: resolve(__dirname, '..'),
    testTimeout: 120000, // 2 minutes per test
    hookTimeout: 30000, // 30 seconds for setup/teardown
    teardownTimeout: 30000,
    maxConcurrency: 4,
    sequence: {
      concurrent: true,
    },
    env: {
      NODE_ENV: 'test',
      XAHEEN_TEST_MODE: 'true',
      XAHEEN_LOG_LEVEL: 'error',
    },
    setupFiles: [
      './utils/test-setup.ts'
    ],
    globalSetup: [
      './utils/global-setup.ts'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/fixtures/**',
        '**/test-helpers.ts',
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
    reporters: [
      'default',
      'json',
      'html',
    ],
    outputFile: {
      json: './test-results/phase3-results.json',
      html: './test-results/phase3-report.html',
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '../../../src'),
      '@tests': resolve(__dirname, '..'),
      '@fixtures': resolve(__dirname, '../fixtures'),
      '@utils': resolve(__dirname, '../utils'),
    },
  },
});