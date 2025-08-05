/**
 * Global test setup for Phase 0 tests
 * 
 * This file is automatically loaded by Vitest before running tests.
 * It sets up global utilities and environment validation.
 */

import { validateEnvironment, validateTestEnvironment } from '../config/test-config';
import { cleanupTempDirs } from './test-helpers';

// Validate environment before running tests
validateEnvironment();
validateTestEnvironment();

// Global test timeout increase for Phase 0 (integration tests)
const originalTimeout = setTimeout;
global.setTimeout = ((fn: Function, delay: number) => {
  // Ensure minimum timeout for Phase 0 tests
  const minDelay = Math.max(delay, 1000);
  return originalTimeout(fn, minDelay);
}) as any;

// Global cleanup handler
process.on('exit', () => {
  cleanupTempDirs().catch(console.error);
});

process.on('SIGINT', () => {
  cleanupTempDirs().catch(console.error);
  process.exit(0);
});

process.on('SIGTERM', () => {
  cleanupTempDirs().catch(console.error);
  process.exit(0);
});

// Enhanced error handling for tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit in test environment, let the test framework handle it
});

// Global test utilities
declare global {
  var __TEST_TEMP_DIRS__: string[];
}

// Initialize global state
global.__TEST_TEMP_DIRS__ = [];

console.log('✅ Phase 0 test environment initialized');