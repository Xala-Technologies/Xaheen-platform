/**
 * Phase 0 Test Helpers
 * 
 * Utility functions for Phase 0 tests including process execution,
 * file system operations, and test assertion helpers.
 */

import { execaCommand } from 'execa';
import { promises as fs } from 'fs';
import { join, resolve } from 'path';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';
import { getTestConfig } from '../config/test-config';

const config = getTestConfig();

/**
 * Execute a command with proper error handling and timeout
 */
export async function executeCommand(
  command: string,
  options: {
    cwd?: string;
    timeout?: number;
    env?: Record<string, string>;
    expectFailure?: boolean;
  } = {}
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  const {
    cwd = process.cwd(),
    timeout = config.timeouts.default,
    env = {},
    expectFailure = false,
  } = options;

  try {
    const result = await execaCommand(command, {
      cwd,
      timeout,
      env: { ...process.env, ...env },
      reject: false, // Don't throw on non-zero exit codes
    });

    return {
      stdout: result.stdout,
      stderr: result.stderr,
      exitCode: result.exitCode,
    };
  } catch (error: any) {
    if (error.timedOut) {
      throw new Error(`Command timed out after ${timeout}ms: ${command}`);
    }

    if (expectFailure) {
      return {
        stdout: error.stdout || '',
        stderr: error.stderr || '',
        exitCode: error.exitCode || 1,
      };
    }

    throw new Error(`Command failed: ${command}\n${error.message}`);
  }
}

/**
 * Create a temporary directory for testing
 */
export async function createTempDir(prefix: string = 'xaheen-test'): Promise<string> {
  const tempPath = join(tmpdir(), `${prefix}-${randomUUID()}`);
  await fs.mkdir(tempPath, { recursive: true });
  
  // Track for cleanup
  if (global.__TEST_TEMP_DIRS__) {
    global.__TEST_TEMP_DIRS__.push(tempPath);
  } else {
    global.__TEST_TEMP_DIRS__ = [tempPath];
  }
  
  return tempPath;
}

/**
 * Clean up temporary directories
 */
export async function cleanupTempDirs(): Promise<void> {
  if (!global.__TEST_TEMP_DIRS__) return;
  
  const dirs = global.__TEST_TEMP_DIRS__ as string[];
  for (const dir of dirs) {
    try {
      await fs.rm(dir, { recursive: true, force: true });
    } catch (error) {
      console.warn(`Failed to cleanup temp dir ${dir}:`, error);
    }
  }
  
  global.__TEST_TEMP_DIRS__ = [];
}

/**
 * Check if a file exists
 */
export async function fileExists(path: string): Promise<boolean> {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * Read file content safely
 */
export async function readFile(path: string): Promise<string> {
  try {
    return await fs.readFile(path, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to read file ${path}: ${error}`);
  }
}

/**
 * Write file content safely
 */
export async function writeFile(path: string, content: string): Promise<void> {
  try {
    await fs.mkdir(resolve(path, '..'), { recursive: true });
    await fs.writeFile(path, content, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to write file ${path}: ${error}`);
  }
}

/**
 * Copy directory recursively
 */
export async function copyDirectory(src: string, dest: string): Promise<void> {
  try {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = join(src, entry.name);
      const destPath = join(dest, entry.name);
      
      if (entry.isDirectory()) {
        await copyDirectory(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  } catch (error) {
    throw new Error(`Failed to copy directory ${src} to ${dest}: ${error}`);
  }
}

/**
 * Wait for a condition to be true
 */
export async function waitFor(
  condition: () => Promise<boolean> | boolean,
  options: {
    timeout?: number;
    interval?: number;
    message?: string;
  } = {}
): Promise<void> {
  const {
    timeout = 10000,
    interval = 100,
    message = 'Condition not met within timeout',
  } = options;

  const start = Date.now();
  
  while (Date.now() - start < timeout) {
    if (await condition()) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  throw new Error(message);
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    retries?: number;
    delay?: number;
    backoff?: number;
  } = {}
): Promise<T> {
  const {
    retries = 3,
    delay = 1000,
    backoff = 2,
  } = options;

  let lastError: Error;
  
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (i === retries) {
        break;
      }
      
      const waitTime = delay * Math.pow(backoff, i);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw lastError!;
}

/**
 * Validate package.json structure
 */
export interface PackageJson {
  name: string;
  version: string;
  main?: string;
  bin?: Record<string, string> | string;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  publishConfig?: {
    access?: string;
    registry?: string;
  };
}

export async function readPackageJson(path: string): Promise<PackageJson> {
  const content = await readFile(join(path, 'package.json'));
  return JSON.parse(content);
}

/**
 * Validate CLI binary
 */
export async function validateCliBinary(binPath: string): Promise<{
  exists: boolean;
  executable: boolean;
  version?: string;
}> {
  try {
    const exists = await fileExists(binPath);
    if (!exists) {
      return { exists: false, executable: false };
    }

    // Check if executable
    const stats = await fs.stat(binPath);
    const executable = !!(stats.mode & parseInt('111', 8));

    // Try to get version
    let version: string | undefined;
    try {
      const result = await executeCommand(`${binPath} --version`, {
        timeout: 5000,
      });
      version = result.stdout.trim();
    } catch {
      // Version check failed, but binary might still be valid
    }

    return { exists, executable, version };
  } catch (error) {
    return { exists: false, executable: false };
  }
}

/**
 * Test assertion helpers
 */
export const assert = {
  /**
   * Assert that a value is truthy
   */
  ok(value: any, message?: string): asserts value {
    if (!value) {
      throw new Error(message || `Expected truthy value, got: ${value}`);
    }
  },

  /**
   * Assert that two values are equal
   */
  equal<T>(actual: T, expected: T, message?: string): void {
    if (actual !== expected) {
      throw new Error(
        message || `Expected ${expected}, got ${actual}`
      );
    }
  },

  /**
   * Assert that a string contains a substring
   */
  includes(haystack: string, needle: string, message?: string): void {
    if (!haystack.includes(needle)) {
      throw new Error(
        message || `Expected "${haystack}" to include "${needle}"`
      );
    }
  },

  /**
   * Assert that a string matches a regex
   */
  matches(text: string, pattern: RegExp, message?: string): void {
    if (!pattern.test(text)) {
      throw new Error(
        message || `Expected "${text}" to match ${pattern}`
      );
    }
  },

  /**
   * Assert that a promise rejects
   */
  async rejects(
    promise: Promise<any> | (() => Promise<any>),
    message?: string
  ): Promise<void> {
    try {
      if (typeof promise === 'function') {
        await promise();
      } else {
        await promise;
      }
      throw new Error(message || 'Expected promise to reject');
    } catch (error) {
      // Expected to throw
    }
  },

  /**
   * Assert that exit code is as expected
   */
  exitCode(actual: number, expected: number, message?: string): void {
    if (actual !== expected) {
      throw new Error(
        message || `Expected exit code ${expected}, got ${actual}`
      );
    }
  },
};