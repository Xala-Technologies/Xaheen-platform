/**
 * Test Setup Utilities
 * Global setup and teardown for Phase 3 tests
 */

import { beforeAll, afterAll, beforeEach, afterEach } from 'bun:test';
import { mkdir, rm } from 'fs/promises';
import { existsSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { TEST_ENV } from '../config/test-config';
import { detectPackageManagers } from './package-manager-utils';

let globalSetupComplete = false;
const activeProcesses: any[] = [];

/**
 * Global setup for all Phase 3 tests
 */
export async function setupPhase3Tests(): Promise<void> {
  if (globalSetupComplete) return;
  
  console.log('🚀 Setting up Phase 3 test environment...');
  
  // Create test directory
  if (!existsSync(TEST_ENV.tmpDir)) {
    await mkdir(TEST_ENV.tmpDir, { recursive: true });
  }
  
  // Detect available package managers
  const detection = await detectPackageManagers();
  console.log('📦 Available package managers:', detection.available.join(', '));
  
  if (detection.available.length === 0) {
    throw new Error('No package managers detected. At least npm should be available.');
  }
  
  // Log versions for debugging
  for (const [manager, version] of Object.entries(detection.versions)) {
    console.log(`   ${manager}: ${version}`);
  }
  
  globalSetupComplete = true;
  console.log('✅ Phase 3 test environment ready');
}

/**
 * Global teardown for all Phase 3 tests
 */
export async function teardownPhase3Tests(): Promise<void> {
  console.log('🧹 Cleaning up Phase 3 test environment...');
  
  // Kill any remaining processes
  if (activeProcesses.length > 0) {
    console.log(`Terminating ${activeProcesses.length} active processes...`);
    
    for (const process of activeProcesses) {
      if (process && !process.killed) {
        try {
          process.kill('SIGTERM');
          
          // Force kill after 2 seconds
          setTimeout(() => {
            if (!process.killed) {
              process.kill('SIGKILL');
            }
          }, 2000);
        } catch (error) {
          console.warn('Failed to kill process:', error);
        }
      }
    }
    
    activeProcesses.length = 0;
  }
  
  // Clean up test directories if configured
  if (TEST_ENV.cleanup && existsSync(TEST_ENV.tmpDir)) {
    try {
      await rm(TEST_ENV.tmpDir, { recursive: true, force: true });
      console.log('🗑️  Cleaned up test directories');
    } catch (error) {
      console.warn('Failed to clean up test directories:', error);
    }
  }
  
  console.log('✅ Phase 3 test cleanup complete');
}

/**
 * Register a process for cleanup
 */
export function registerProcess(process: any): void {
  activeProcesses.push(process);
}

/**
 * Unregister a process from cleanup
 */
export function unregisterProcess(process: any): void {
  const index = activeProcesses.indexOf(process);
  if (index > -1) {
    activeProcesses.splice(index, 1);
  }
}

/**
 * Create a unique test directory
 */
export function createTestDir(prefix = 'test'): string {
  const randomId = Math.random().toString(36).substring(2, 8);
  return join(TEST_ENV.tmpDir, `${prefix}-${randomId}-${Date.now()}`);
}

/**
 * Check if we're running in a CI environment
 */
export function isCI(): boolean {
  return !!(
    process.env.CI ||
    process.env.CONTINUOUS_INTEGRATION ||
    process.env.BUILD_NUMBER ||
    process.env.GITHUB_ACTIONS ||
    process.env.GITLAB_CI ||
    process.env.CIRCLECI ||
    process.env.JENKINS_URL ||
    process.env.TRAVIS
  );
}

/**
 * Get appropriate timeout for current environment
 */
export function getTestTimeout(baseTimeout: number): number {
  if (isCI()) {
    // Increase timeout in CI environments
    return baseTimeout * 2;
  }
  
  return baseTimeout;
}

/**
 * Skip test if package manager is not available
 */
export function requirePackageManager(manager: string): void {
  const available = process.env[`${manager.toUpperCase()}_AVAILABLE`];
  if (available === 'false') {
    throw new Error(`Test requires ${manager} but it's not available`);
  }
}

/**
 * Set up individual test with common configuration
 */
export async function setupTest(testName: string): Promise<{
  testDir: string;
  cleanup: () => Promise<void>;
}> {
  const testDir = createTestDir(testName.replace(/\s+/g, '-').toLowerCase());
  await mkdir(testDir, { recursive: true });
  
  const cleanup = async () => {
    if (existsSync(testDir)) {
      await rm(testDir, { recursive: true, force: true });
    }
  };
  
  return { testDir, cleanup };
}

/**
 * Wait for a condition to be true
 */
export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  timeout = 10000,
  interval = 100
): Promise<void> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return;
    }
    
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  throw new Error(`Condition not met within ${timeout}ms`);
}

/**
 * Retry an async operation
 */
export async function retry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms...`, lastError.message);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

/**
 * Measure execution time
 */
export async function measureTime<T>(operation: () => Promise<T>): Promise<{
  result: T;
  duration: number;
}> {
  const startTime = Date.now();
  const result = await operation();
  const duration = Date.now() - startTime;
  
  return { result, duration };
}

/**
 * Create a performance benchmark
 */
export async function benchmark(
  name: string,
  operation: () => Promise<void>,
  iterations = 1
): Promise<{
  name: string;
  iterations: number;
  totalTime: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
}> {
  const times: number[] = [];
  
  for (let i = 0; i < iterations; i++) {
    const { duration } = await measureTime(operation);
    times.push(duration);
  }
  
  const totalTime = times.reduce((sum, time) => sum + time, 0);
  const averageTime = totalTime / iterations;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  
  return {
    name,
    iterations,
    totalTime,
    averageTime,
    minTime,
    maxTime,
  };
}

/**
 * Log test results in a structured format
 */
export function logTestResults(results: {
  testName: string;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
}): void {
  const { testName, passed, failed, skipped, duration } = results;
  const total = passed + failed + skipped;
  
  console.log(`\n📊 ${testName} Results:`);
  console.log(`   Total: ${total}`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ⏱️  Duration: ${duration}ms`);
  
  if (failed > 0) {
    console.log(`   📉 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  }
}

/**
 * Environment validation
 */
export async function validateTestEnvironment(): Promise<{
  valid: boolean;
  issues: string[];
}> {
  const issues: string[] = [];
  
  // Check Node.js version
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  if (majorVersion < 16) {
    issues.push(`Node.js ${nodeVersion} is too old. Node.js 16+ is required.`);
  }
  
  // Check available package managers
  const detection = await detectPackageManagers();
  
  if (detection.available.length === 0) {
    issues.push('No package managers detected');
  }
  
  if (!detection.available.includes('npm')) {
    issues.push('npm is not available but is required for tests');
  }
  
  // Check disk space (if possible)
  try {
    const stats = await import('fs').then(fs => fs.promises.stat(tmpdir()));
    if (stats) {
      // Basic check passed
    }
  } catch (error) {
    issues.push('Cannot access temporary directory');
  }
  
  // Check permissions
  try {
    const testFile = join(tmpdir(), 'xaheen-test-permissions');
    await import('fs').then(fs => fs.promises.writeFile(testFile, 'test'));
    await import('fs').then(fs => fs.promises.unlink(testFile));
  } catch (error) {
    issues.push('Insufficient permissions to create temporary files');
  }
  
  return {
    valid: issues.length === 0,
    issues,
  };
}

/**
 * Default setup and teardown hooks
 */
export function setupPhase3TestHooks(): void {
  beforeAll(async () => {
    await setupPhase3Tests();
  });
  
  afterAll(async () => {
    await teardownPhase3Tests();
  });
}

// Auto-setup if this module is imported
if (typeof globalThis !== 'undefined' && !globalThis.__PHASE3_SETUP_COMPLETE__) {
  globalThis.__PHASE3_SETUP_COMPLETE__ = true;
  setupPhase3TestHooks();
}