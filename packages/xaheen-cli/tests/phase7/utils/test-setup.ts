/**
 * Phase 7: Test Setup Utilities
 * 
 * Common setup functions for individual tests
 */

import { beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import path from 'node:path';
import { TEST_CONFIG } from '../config/test-config.js';

// Global test setup that runs before each test
beforeEach(async () => {
  // Ensure clean test directory for each test
  const testDir = path.join(TEST_CONFIG.projects.outputDir, 'current-test');
  if (await fs.pathExists(testDir)) {
    await fs.remove(testDir);
  }
  await fs.ensureDir(testDir);

  // Set test-specific environment variables
  process.env.CURRENT_TEST_DIR = testDir;
});

// Global test cleanup that runs after each test
afterEach(async () => {
  // Clean up test-specific directories
  const testDir = process.env.CURRENT_TEST_DIR;
  if (testDir && await fs.pathExists(testDir)) {
    await fs.remove(testDir);
  }

  // Clean up test-specific environment variables
  delete process.env.CURRENT_TEST_DIR;
});

/**
 * Test utilities for Phase 7
 */
export class Phase7TestUtils {
  static async createTempProject(name: string): Promise<string> {
    const testDir = process.env.CURRENT_TEST_DIR || '/tmp/xaheen-tests';
    const projectPath = path.join(testDir, name);
    await fs.ensureDir(projectPath);
    return projectPath;
  }

  static async cleanupTempProject(projectPath: string): Promise<void> {
    if (await fs.pathExists(projectPath)) {
      await fs.remove(projectPath);
    }
  }

  static async waitForCondition(
    condition: () => Promise<boolean>,
    timeoutMs: number = 10000,
    intervalMs: number = 100
  ): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      if (await condition()) {
        return;
      }
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
    
    throw new Error(`Condition not met within ${timeoutMs}ms`);
  }

  static async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static generateRandomString(length: number = 8): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  static generateTestEmail(prefix: string = 'test'): string {
    return `${prefix}-${this.generateRandomString()}@test.com`;
  }

  static async createTestConfigFile(
    filePath: string,
    config: Record<string, unknown>
  ): Promise<void> {
    await fs.ensureDir(path.dirname(filePath));
    await fs.writeJson(filePath, config, { spaces: 2 });
  }

  static async readTestConfigFile<T = Record<string, unknown>>(
    filePath: string
  ): Promise<T> {
    return await fs.readJson(filePath);
  }
}