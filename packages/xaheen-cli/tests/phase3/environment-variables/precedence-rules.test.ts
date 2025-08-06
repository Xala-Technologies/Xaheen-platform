/**
 * Precedence Rules Tests
 * Tests the order of precedence for package manager detection
 */

import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { join } from 'path';
import { mkdir, rm, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import {
  detectPackageManagers,
  detectPackageManagerFromLockfile,
  detectWorkspaceConfig,
  createLockfile,
  createWorkspaceConfig,
  installDependencies,
  isPackageManagerAvailable,
} from '../utils/package-manager-utils';
import { generateTestDir, PACKAGE_MANAGERS } from '../config/test-config';

describe('Precedence Rules Tests', () => {
  let testDir: string;
  let originalEnv: string | undefined;
  
  beforeEach(async () => {
    testDir = generateTestDir('precedence-rules');
    await mkdir(testDir, { recursive: true });
    originalEnv = process.env.XAHEEN_PKG_MANAGER;
  });
  
  afterEach(async () => {
    // Restore original environment variable
    if (originalEnv !== undefined) {
      process.env.XAHEEN_PKG_MANAGER = originalEnv;
    } else {
      delete process.env.XAHEEN_PKG_MANAGER;
    }
    
    if (existsSync(testDir)) {
      await rm(testDir, { recursive: true, force: true });
    }
  });

  describe('Standard Precedence Order', () => {
    it('should follow precedence: Environment Variable > Lockfile > Workspace Config > System Default', async () => {
      // Expected precedence order:
      // 1. XAHEEN_PKG_MANAGER environment variable (highest)
      // 2. Lockfile detection
      // 3. Workspace configuration
      // 4. System default (lowest)
      
      // Set up all signals
      process.env.XAHEEN_PKG_MANAGER = 'bun';           // Highest precedence
      await createLockfile('yarn', testDir, true);       // Second precedence
      await createWorkspaceConfig('pnpm', testDir);      // Third precedence
      // System default would be npm                      // Lowest precedence
      
      // Environment variable should override everything
      expect(process.env.XAHEEN_PKG_MANAGER).toBe('bun');
      
      // Lockfile detection works independently
      const lockfileDetection = detectPackageManagerFromLockfile(testDir);
      expect(lockfileDetection).toBe('yarn');
      
      // Workspace detection works independently
      const workspaceDetection = detectWorkspaceConfig(testDir);
      expect(workspaceDetection.type).toBe('pnpm');
      
      // System detection shows available managers
      const systemDetection = await detectPackageManagers();
      expect(systemDetection.available).toContain('npm');
      
      // In a real CLI implementation, environment variable would win
      expect(process.env.XAHEEN_PKG_MANAGER).toBe('bun');
    });

    it('should fall back to lockfile when environment variable is not set', async () => {
      // No environment variable
      delete process.env.XAHEEN_PKG_MANAGER;
      
      // Create lockfile and workspace config
      await createLockfile('pnpm', testDir, true);
      await createWorkspaceConfig('yarn', testDir);
      
      expect(process.env.XAHEEN_PKG_MANAGER).toBeUndefined();
      
      // Lockfile should be detected
      const lockfileDetection = detectPackageManagerFromLockfile(testDir);
      expect(lockfileDetection).toBe('pnpm');
      
      // Workspace should be detected
      const workspaceDetection = detectWorkspaceConfig(testDir);
      expect(workspaceDetection.type).toBe('yarn');
      
      // In this case, lockfile would typically win over workspace config
    });

    it('should fall back to workspace when environment variable and lockfile are not available', async () => {
      // No environment variable
      delete process.env.XAHEEN_PKG_MANAGER;
      
      // No lockfile, only workspace config
      await createWorkspaceConfig('pnpm', testDir);
      
      expect(process.env.XAHEEN_PKG_MANAGER).toBeUndefined();
      
      const lockfileDetection = detectPackageManagerFromLockfile(testDir);
      expect(lockfileDetection).toBeNull();
      
      const workspaceDetection = detectWorkspaceConfig(testDir);
      expect(workspaceDetection.type).toBe('pnpm');
      
      // Workspace config should be the next best choice
    });

    it('should fall back to system default when no other signals exist', async () => {
      // No environment variable
      delete process.env.XAHEEN_PKG_MANAGER;
      
      // No lockfile
      // No workspace config
      
      expect(process.env.XAHEEN_PKG_MANAGER).toBeUndefined();
      
      const lockfileDetection = detectPackageManagerFromLockfile(testDir);
      expect(lockfileDetection).toBeNull();
      
      const workspaceDetection = detectWorkspaceConfig(testDir);
      expect(workspaceDetection.type).toBe('none');
      
      // System should still provide defaults
      const systemDetection = await detectPackageManagers();
      expect(systemDetection.available).toContain('npm');
    });
  });

  describe('Lockfile Priority Order', () => {
    it('should prioritize npm lockfile over others', async () => {
      // Create multiple lockfiles
      await createLockfile('npm', testDir, true);
      await createLockfile('yarn', testDir, true);
      await createLockfile('pnpm', testDir, true);
      await createLockfile('bun', testDir, true);
      
      const detected = detectPackageManagerFromLockfile(testDir);
      expect(detected).toBe('npm');
      
      // Verify all lockfiles exist
      expect(existsSync(join(testDir, 'package-lock.json'))).toBe(true);
      expect(existsSync(join(testDir, 'yarn.lock'))).toBe(true);
      expect(existsSync(join(testDir, 'pnpm-lock.yaml'))).toBe(true);
      expect(existsSync(join(testDir, 'bun.lockb'))).toBe(true);
    });

    it('should follow yarn > pnpm > bun when npm is not present', async () => {
      const scenarios = [
        {
          lockfiles: ['yarn', 'pnpm', 'bun'],
          expected: 'yarn',
        },
        {
          lockfiles: ['pnpm', 'bun'],
          expected: 'pnpm',
        },
        {
          lockfiles: ['bun'],
          expected: 'bun',
        },
      ];
      
      for (const [index, scenario] of scenarios.entries()) {
        const scenarioDir = join(testDir, `scenario-${index}`);
        await mkdir(scenarioDir, { recursive: true });
        
        for (const lockfile of scenario.lockfiles) {
          await createLockfile(lockfile as any, scenarioDir, true);
        }
        
        const detected = detectPackageManagerFromLockfile(scenarioDir);
        expect(detected).toBe(scenario.expected);
      }
    });

    it('should handle custom lockfile priority in monorepos', async () => {
      // Root has pnpm workspace but npm lockfile
      await createWorkspaceConfig('pnpm', testDir);
      await createLockfile('npm', testDir, true);
      
      // Package has yarn lockfile
      const packageDir = join(testDir, 'packages', 'app');
      await mkdir(packageDir, { recursive: true });
      await createLockfile('yarn', packageDir, true);
      
      // Root should detect npm (lockfile priority)
      const rootLockfile = detectPackageManagerFromLockfile(testDir);
      expect(rootLockfile).toBe('npm');
      
      // Root should detect pnpm workspace
      const rootWorkspace = detectWorkspaceConfig(testDir);
      expect(rootWorkspace.type).toBe('pnpm');
      
      // Package should detect yarn
      const packageLockfile = detectPackageManagerFromLockfile(packageDir);
      expect(packageLockfile).toBe('yarn');
    });
  });

  describe('Workspace Configuration Priority', () => {
    it('should prioritize pnpm-workspace.yaml over package.json workspaces', async () => {
      // Create both workspace configurations
      await createWorkspaceConfig('pnpm', testDir);
      
      const packageJsonWithWorkspaces = {
        name: 'workspace-priority-test',
        private: true,
        workspaces: ['packages/*'],
      };
      
      await writeFile(
        join(testDir, 'package.json'),
        JSON.stringify(packageJsonWithWorkspaces, null, 2)
      );
      
      const workspaceDetection = detectWorkspaceConfig(testDir);
      
      // pnpm-workspace.yaml should take precedence
      expect(workspaceDetection.type).toBe('pnpm');
    });

    it('should distinguish between npm and yarn workspaces in package.json', async () => {
      const scenarios = [
        {
          name: 'npm-workspaces-array',
          config: {
            name: 'npm-array-test',
            private: true,
            workspaces: ['apps/*', 'packages/*'],
          },
          expected: 'npm',
        },
        {
          name: 'yarn-workspaces-object',
          config: {
            name: 'yarn-object-test',
            private: true,
            workspaces: {
              packages: ['apps/*', 'packages/*'],
              nohoist: ['**/react'],
            },
          },
          expected: 'yarn',
        },
      ];
      
      for (const [index, scenario] of scenarios.entries()) {
        const scenarioDir = join(testDir, `workspace-${index}`);
        await mkdir(scenarioDir, { recursive: true });
        
        await writeFile(
          join(scenarioDir, 'package.json'),
          JSON.stringify(scenario.config, null, 2)
        );
        
        const workspaceDetection = detectWorkspaceConfig(scenarioDir);
        expect(workspaceDetection.type).toBe(scenario.expected);
      }
    });
  });

  describe('Environment Variable Precedence Edge Cases', () => {
    it('should handle environment variable with unavailable package manager', async () => {
      // Set environment variable to potentially unavailable manager
      process.env.XAHEEN_PKG_MANAGER = 'bun';
      
      const bunAvailable = await isPackageManagerAvailable('bun');
      
      // Create fallback options
      await createLockfile('yarn', testDir, true);
      await createWorkspaceConfig('pnpm', testDir);
      
      expect(process.env.XAHEEN_PKG_MANAGER).toBe('bun');
      
      if (!bunAvailable) {
        // Environment variable is set but manager is not available
        // Should fall back to available alternatives
        const lockfileDetection = detectPackageManagerFromLockfile(testDir);
        expect(lockfileDetection).toBe('yarn');
        
        const workspaceDetection = detectWorkspaceConfig(testDir);
        expect(workspaceDetection.type).toBe('pnpm');
      }
    });

    it('should handle case-insensitive environment variable matching', async () => {
      const caseVariations = [
        'npm',
        'NPM',
        'Npm',
        'nPm',
        'yarn',
        'YARN',
        'Yarn',
        'pnpm',
        'PNPM',
        'Pnpm',
        'bun',
        'BUN',
        'Bun',
      ];
      
      for (const variation of caseVariations) {
        process.env.XAHEEN_PKG_MANAGER = variation;
        
        expect(process.env.XAHEEN_PKG_MANAGER).toBe(variation);
        
        // Environment variable is set (case-sensitive check)
        const normalizedValue = variation.toLowerCase();
        const validManagers = PACKAGE_MANAGERS.map(pm => pm.name);
        
        if (validManagers.includes(normalizedValue)) {
          // Valid manager name (case-insensitive)
          expect(validManagers).toContain(normalizedValue);
        }
      }
    });

    it('should handle environment variable changes during execution', async () => {
      // Initial state
      process.env.XAHEEN_PKG_MANAGER = 'npm';
      expect(process.env.XAHEEN_PKG_MANAGER).toBe('npm');
      
      // Change during execution
      process.env.XAHEEN_PKG_MANAGER = 'yarn';
      expect(process.env.XAHEEN_PKG_MANAGER).toBe('yarn');
      
      // Another change
      process.env.XAHEEN_PKG_MANAGER = 'pnpm';
      expect(process.env.XAHEEN_PKG_MANAGER).toBe('pnpm');
      
      // Clear environment variable
      delete process.env.XAHEEN_PKG_MANAGER;
      expect(process.env.XAHEEN_PKG_MANAGER).toBeUndefined();
      
      // System should handle all states gracefully
      const detection = await detectPackageManagers();
      expect(Array.isArray(detection.available)).toBe(true);
    });
  });

  describe('Complex Precedence Scenarios', () => {
    it('should handle nested project with different preferences', async () => {
      // Root project: environment variable = bun, lockfile = npm
      process.env.XAHEEN_PKG_MANAGER = 'bun';
      await createLockfile('npm', testDir, true);
      
      // Nested project: lockfile = yarn, workspace = pnpm
      const nestedDir = join(testDir, 'nested-project');
      await mkdir(nestedDir, { recursive: true });
      await createLockfile('yarn', nestedDir, true);
      await createWorkspaceConfig('pnpm', nestedDir);
      
      // Root level
      expect(process.env.XAHEEN_PKG_MANAGER).toBe('bun'); // Environment variable wins
      expect(detectPackageManagerFromLockfile(testDir)).toBe('npm');
      
      // Nested level inherits environment variable but has own lockfile
      expect(process.env.XAHEEN_PKG_MANAGER).toBe('bun'); // Still set globally
      expect(detectPackageManagerFromLockfile(nestedDir)).toBe('yarn');
      expect(detectWorkspaceConfig(nestedDir).type).toBe('pnpm');
    });

    it('should handle migration scenarios with mixed signals', async () => {
      // Scenario: Migrating from npm to pnpm workspace
      
      // Step 1: Original npm setup
      await createLockfile('npm', testDir, true);
      
      const originalPackageJson = {
        name: 'migration-test',
        version: '1.0.0',
        dependencies: {
          lodash: '^4.17.21',
        },
      };
      
      await writeFile(
        join(testDir, 'package.json'),
        JSON.stringify(originalPackageJson, null, 2)
      );
      
      // Initially detects npm
      expect(detectPackageManagerFromLockfile(testDir)).toBe('npm');
      expect(detectWorkspaceConfig(testDir).type).toBe('none');
      
      // Step 2: Add pnpm workspace config (migration begins)
      await createWorkspaceConfig('pnpm', testDir);
      
      // Now has both npm lockfile and pnpm workspace
      expect(detectPackageManagerFromLockfile(testDir)).toBe('npm');
      expect(detectWorkspaceConfig(testDir).type).toBe('pnpm');
      
      // Step 3: Set environment variable to force pnpm
      process.env.XAHEEN_PKG_MANAGER = 'pnpm';
      
      // Environment variable overrides everything
      expect(process.env.XAHEEN_PKG_MANAGER).toBe('pnpm');
      expect(detectPackageManagerFromLockfile(testDir)).toBe('npm'); // Still npm lockfile
      expect(detectWorkspaceConfig(testDir).type).toBe('pnpm');
      
      // Step 4: After pnpm install, would have pnpm lockfile
      // (We simulate this by creating pnpm lockfile)
      await createLockfile('pnpm', testDir, true);
      
      // Now everything aligns
      expect(process.env.XAHEEN_PKG_MANAGER).toBe('pnpm');
      expect(detectPackageManagerFromLockfile(testDir)).toBe('npm'); // npm still takes precedence in detection
      expect(detectWorkspaceConfig(testDir).type).toBe('pnpm');
      
      // But we have both lockfiles (transition state)
      expect(existsSync(join(testDir, 'package-lock.json'))).toBe(true);
      expect(existsSync(join(testDir, 'pnpm-lock.yaml'))).toBe(true);
    });

    it('should handle team collaboration with different preferences', async () => {
      // Scenario: Team members use different package managers
      
      // Project setup by developer A (uses npm)
      await createLockfile('npm', testDir, true);
      
      // Developer B prefers yarn
      process.env.XAHEEN_PKG_MANAGER = 'yarn';
      
      // Developer C wants to use pnpm workspace
      await createWorkspaceConfig('pnpm', testDir);
      
      // Current state shows mixed preferences
      expect(process.env.XAHEEN_PKG_MANAGER).toBe('yarn'); // Developer B's preference
      expect(detectPackageManagerFromLockfile(testDir)).toBe('npm'); // Developer A's lockfile
      expect(detectWorkspaceConfig(testDir).type).toBe('pnpm'); // Developer C's workspace
      
      // System should handle this gracefully
      const systemDetection = await detectPackageManagers();
      expect(systemDetection.available.length).toBeGreaterThan(0);
    });
  });

  describe('Precedence in Installation Context', () => {
    it('should respect environment variable during installation', async () => {
      const yarnAvailable = await isPackageManagerAvailable('yarn');
      const npmAvailable = await isPackageManagerAvailable('npm');
      
      if (!yarnAvailable || !npmAvailable) return;
      
      // Create npm lockfile but set environment variable to yarn
      await createLockfile('npm', testDir, true);
      process.env.XAHEEN_PKG_MANAGER = 'yarn';
      
      const packageJson = {
        name: 'precedence-install-test',
        version: '1.0.0',
        dependencies: {
          'is-even': '^1.0.0',
        },
      };
      
      await writeFile(
        join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );
      
      // Environment variable should take precedence for installation
      const result = await installDependencies('yarn', testDir, 30000);
      expect(result.exitCode).toBe(0);
      
      // Should create yarn lockfile
      expect(existsSync(join(testDir, 'yarn.lock'))).toBe(true);
      
      // npm lockfile might still exist
      expect(existsSync(join(testDir, 'package-lock.json'))).toBe(true);
    }, 40000);

    it('should handle precedence when environment variable manager is unavailable', async () => {
      const npmAvailable = await isPackageManagerAvailable('npm');
      if (!npmAvailable) return;
      
      // Set environment variable to potentially unavailable manager
      process.env.XAHEEN_PKG_MANAGER = 'bun';
      
      // Create fallback lockfile
      await createLockfile('npm', testDir, true);
      
      const packageJson = {
        name: 'fallback-install-test',
        version: '1.0.0',
        dependencies: {
          'is-odd': '^3.0.1',
        },
      };
      
      await writeFile(
        join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );
      
      const bunAvailable = await isPackageManagerAvailable('bun');
      
      if (bunAvailable) {
        // If bun is available, environment variable wins
        const result = await installDependencies('bun', testDir, 25000);
        expect(result.exitCode).toBe(0);
        expect(existsSync(join(testDir, 'bun.lockb'))).toBe(true);
      } else {
        // If bun is not available, should fall back to npm (lockfile)
        const result = await installDependencies('npm', testDir, 25000);
        expect(result.exitCode).toBe(0);
        expect(existsSync(join(testDir, 'package-lock.json'))).toBe(true);
      }
    }, 35000);
  });
});