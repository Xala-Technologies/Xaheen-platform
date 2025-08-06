/**
 * Matrix Test Runner for Phase 2
 * Executes the same test suite across multiple frameworks
 */

import { describe, it, expect } from 'bun:test';
import { FRAMEWORK_CONFIGS, type FrameworkConfig } from '../config/frameworks.config';

export interface MatrixTest {
  readonly name: string;
  readonly testFn: (config: FrameworkConfig) => Promise<void>;
  readonly timeout?: number;
}

export interface MatrixOptions {
  readonly frameworks?: readonly string[];
  readonly skipFrameworks?: readonly string[];
  readonly parallel?: boolean;
}

export function runMatrixTests(
  suiteName: string,
  tests: readonly MatrixTest[],
  options: MatrixOptions = {}
): void {
  const frameworksToTest = FRAMEWORK_CONFIGS.filter(config => {
    if (options.frameworks && !options.frameworks.includes(config.name)) {
      return false;
    }
    if (options.skipFrameworks && options.skipFrameworks.includes(config.name)) {
      return false;
    }
    return true;
  });

  describe(suiteName, () => {
    frameworksToTest.forEach((config) => {
      describe(`${config.displayName} (${config.preset})`, () => {
        tests.forEach((test) => {
          it(test.name, async () => {
            await test.testFn(config);
          }, test.timeout || 60000);
        });
      });
    });
  });
}

export function createMatrixTest(
  name: string,
  testFn: (config: FrameworkConfig) => Promise<void>,
  timeout?: number
): MatrixTest {
  return { name, testFn, timeout };
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }
  
  throw lastError;
}

export function expectFrameworkFiles(
  actualFiles: readonly string[],
  expectedFiles: readonly string[]
): void {
  const missingFiles = expectedFiles.filter(file => !actualFiles.includes(file));
  const extraFiles = actualFiles.filter(file => !expectedFiles.includes(file));

  if (missingFiles.length > 0) {
    throw new Error(`Missing expected files: ${missingFiles.join(', ')}`);
  }

  expect(actualFiles.length).toBeGreaterThanOrEqual(expectedFiles.length);
}