/**
 * Global test setup for Phase 5 integration tests
 */

import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import * as os from 'os';
import * as path from 'path';
import { getTestConfig } from '../config/test-config';
import { cleanupTestDir } from './test-helpers';

// Global test configuration
const config = getTestConfig(process.env.CI ? 'ci' : 'default');

// Global state tracking
const globalState = {
  tempDirs: new Set<string>(),
  runningServers: new Set<any>(),
  activePorts: new Set<number>(),
  testStartTime: 0,
};

/**
 * Global setup - runs once before all tests
 */
beforeAll(async () => {
  console.log('🚀 Starting Phase 5 Integration Tests');
  console.log(`📁 Temp directory: ${config.tempDir}`);
  console.log(`🌐 Test ports: ${JSON.stringify(config.ports)}`);
  
  globalState.testStartTime = Date.now();
  
  // Ensure test directories exist
  const fs = await import('fs/promises');
  await fs.mkdir(config.tempDir, { recursive: true });
  
  // Set environment variables for tests
  process.env.NODE_ENV = 'test';
  process.env.TEST_TIMEOUT = config.timeout.toString();
  process.env.XAHEEN_TEST_MODE = 'true';
  
  // Disable console.log in production mode for cleaner test output
  if (process.env.CI) {
    const originalLog = console.log;
    console.log = (...args) => {
      if (args[0]?.includes?.('[Test]') || args[0]?.includes?.('Phase 5')) {
        originalLog(...args);
      }
    };
  }
}, 60000); // 60 second timeout for global setup

/**
 * Global teardown - runs once after all tests
 */
afterAll(async () => {
  const testDuration = Date.now() - globalState.testStartTime;
  console.log(`✅ Phase 5 Integration Tests completed in ${testDuration}ms`);
  
  // Cleanup all temporary directories
  console.log(`🧹 Cleaning up ${globalState.tempDirs.size} temporary directories`);
  for (const tempDir of globalState.tempDirs) {
    try {
      await cleanupTestDir(tempDir);
    } catch (error) {
      console.warn(`Warning: Failed to cleanup ${tempDir}:`, error);
    }
  }
  
  // Stop any remaining servers
  console.log(`🛑 Stopping ${globalState.runningServers.size} remaining servers`);
  for (const server of globalState.runningServers) {
    try {
      if (server.stop) {
        await server.stop();
      } else if (server.kill) {
        await server.kill();
      }
    } catch (error) {
      console.warn('Warning: Failed to stop server:', error);
    }
  }
  
  // Clear global state
  globalState.tempDirs.clear();
  globalState.runningServers.clear();
  globalState.activePorts.clear();
  
  console.log('🎉 All Phase 5 tests completed and cleaned up');
}, 30000); // 30 second timeout for global teardown

/**
 * Per-test setup - runs before each test
 */
beforeEach(async (context) => {
  // Set test timeout from config
  if (context.timeout) {
    context.timeout(config.timeout);
  }
  
  // Log test start (in verbose mode)
  if (process.env.VERBOSE_TESTS) {
    console.log(`[Test] Starting: ${context.task?.name || 'Unknown test'}`);
  }
});

/**
 * Per-test teardown - runs after each test
 */
afterEach(async (context) => {
  // Log test completion (in verbose mode)
  if (process.env.VERBOSE_TESTS) {
    const result = context.task?.result?.state || 'unknown';
    console.log(`[Test] Completed: ${context.task?.name || 'Unknown test'} (${result})`);
  }
  
  // Force garbage collection if available (helps with memory leaks in tests)
  if (global.gc) {
    global.gc();
  }
});

/**
 * Register a temporary directory for cleanup
 */
export function registerTempDir(tempDir: string): void {
  globalState.tempDirs.add(tempDir);
}

/**
 * Register a server for cleanup
 */
export function registerServer(server: any): void {
  globalState.runningServers.add(server);
}

/**
 * Register a port as in use
 */
export function registerPort(port: number): void {
  globalState.activePorts.add(port);
}

/**
 * Unregister a temporary directory (when manually cleaned up)
 */
export function unregisterTempDir(tempDir: string): void {
  globalState.tempDirs.delete(tempDir);
}

/**
 * Unregister a server (when manually stopped)
 */
export function unregisterServer(server: any): void {
  globalState.runningServers.delete(server);
}

/**
 * Unregister a port (when server is stopped)
 */
export function unregisterPort(port: number): void {
  globalState.activePorts.delete(port);
}

/**
 * Get global test state (for debugging)
 */
export function getGlobalState() {
  return {
    tempDirs: Array.from(globalState.tempDirs),
    runningServers: globalState.runningServers.size,
    activePorts: Array.from(globalState.activePorts),
    testStartTime: globalState.testStartTime,
  };
}

/**
 * Custom matchers for Vitest
 */
declare module 'vitest' {
  interface Assertion<T = any> {
    toBeValidUrl(): T;
    toBeWorkingDirectory(): T;
    toBeRunningOnPort(port: number): T;
  }
}

// Extend Vitest with custom matchers
expect.extend({
  toBeValidUrl(received: string) {
    try {
      const url = new URL(received);
      return {
        pass: url.protocol === 'http:' || url.protocol === 'https:',
        message: () => `Expected ${received} to be a valid URL`,
      };
    } catch {
      return {
        pass: false,
        message: () => `Expected ${received} to be a valid URL`,
      };
    }
  },
  
  async toBeWorkingDirectory(received: string) {
    try {
      const fs = await import('fs/promises');
      const stats = await fs.stat(received);
      return {
        pass: stats.isDirectory(),
        message: () => `Expected ${received} to be a working directory`,
      };
    } catch {
      return {
        pass: false,
        message: () => `Expected ${received} to be a working directory`,
      };
    }
  },
  
  async toBeRunningOnPort(received: any, port: number) {
    try {
      const response = await fetch(`http://localhost:${port}/health`);
      return {
        pass: response.ok,
        message: () => `Expected service to be running on port ${port}`,
      };
    } catch {
      return {
        pass: false,
        message: () => `Expected service to be running on port ${port}`,
      };
    }
  },
});

/**
 * Test utilities available globally
 */
declare global {
  var __PHASE5_CONFIG__: typeof config;
  var __PHASE5_STATE__: typeof globalState;
}

// Make config available globally
global.__PHASE5_CONFIG__ = config;
global.__PHASE5_STATE__ = globalState;

// Handle unhandled rejections in tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit in test mode, just log the error
});

// Handle uncaught exceptions in tests
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit in test mode, just log the error
});

// Increase max listeners to avoid warnings during tests
process.setMaxListeners(50);

export { config as testConfig, globalState };