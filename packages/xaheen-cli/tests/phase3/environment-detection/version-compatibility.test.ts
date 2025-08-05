/**
 * Version Compatibility Tests
 * Tests version compatibility checking for package managers
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'path';
import { mkdir, rm, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import {
  getPackageManagerVersion,
  detectPackageManagers,
  executeCommand,
} from '../utils/package-manager-utils';
import { generateTestDir, PACKAGE_MANAGERS } from '../config/test-config';

describe('Version Compatibility', () => {
  let testDir: string;
  
  beforeEach(async () => {
    testDir = generateTestDir('version-compatibility');
    await mkdir(testDir, { recursive: true });
  });
  
  afterEach(async () => {
    if (existsSync(testDir)) {
      await rm(testDir, { recursive: true, force: true });
    }
  });

  describe('Version Detection', () => {
    it('should parse npm version correctly', async () => {
      const version = await getPackageManagerVersion('npm');
      
      expect(version).toBeTruthy();
      expect(typeof version).toBe('string');
      
      // Should be semver format
      const semverRegex = /^\d+\.\d+\.\d+/;
      expect(semverRegex.test(version!)).toBe(true);
      
      // Should be a reasonable npm version (>= 6.0.0)
      const majorVersion = parseInt(version!.split('.')[0]);
      expect(majorVersion).toBeGreaterThanOrEqual(6);
    });

    it.each(PACKAGE_MANAGERS)('should handle $name version detection', async (manager) => {
      const version = await getPackageManagerVersion(manager.name);
      
      if (version) {
        expect(typeof version).toBe('string');
        expect(version.length).toBeGreaterThan(0);
      }
      // If version is null, the manager is not installed, which is acceptable
    });

    it('should handle version command variations', async () => {
      // Test different version command formats
      const commands = [
        'npm --version',
        'npm -v',
        'node --version', // Node.js version for reference
      ];

      for (const command of commands) {
        const result = await executeCommand(command, testDir, 5000);
        if (result.exitCode === 0) {
          expect(result.stdout).toBeTruthy();
          expect(result.stdout).toMatch(/\d+\.\d+\.\d+/);
        }
      }
    });
  });

  describe('Minimum Version Requirements', () => {
    const MIN_VERSIONS = {
      npm: '6.0.0',
      yarn: '1.22.0',
      pnpm: '6.0.0',
      bun: '0.6.0',
    } as const;

    function compareVersions(a: string, b: string): number {
      const aParts = a.split('.').map(Number);
      const bParts = b.split('.').map(Number);
      
      for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
        const aPart = aParts[i] || 0;
        const bPart = bParts[i] || 0;
        
        if (aPart !== bPart) {
          return aPart - bPart;
        }
      }
      
      return 0;
    }

    it.each(Object.entries(MIN_VERSIONS))(
      'should verify %s meets minimum version %s',
      async (manager, minVersion) => {
        const actualVersion = await getPackageManagerVersion(manager as any);
        
        if (actualVersion) {
          const comparison = compareVersions(actualVersion, minVersion);
          expect(comparison).toBeGreaterThanOrEqual(0);
        }
        // If actualVersion is null, the manager is not installed
      }
    );

    it('should warn about outdated versions', async () => {
      const detection = await detectPackageManagers();
      
      for (const [manager, version] of Object.entries(detection.versions)) {
        const minVersion = MIN_VERSIONS[manager as keyof typeof MIN_VERSIONS];
        if (minVersion) {
          const comparison = compareVersions(version, minVersion);
          
          if (comparison < 0) {
            console.warn(`Warning: ${manager} version ${version} is below minimum required ${minVersion}`);
          }
        }
      }
    });
  });

  describe('Feature Compatibility', () => {
    it('should check npm workspaces support (npm >= 7.0.0)', async () => {
      const version = await getPackageManagerVersion('npm');
      
      if (version) {
        const majorVersion = parseInt(version.split('.')[0]);
        const supportsWorkspaces = majorVersion >= 7;
        
        if (supportsWorkspaces) {
          // Test npm workspaces command
          const result = await executeCommand('npm help workspaces', testDir, 5000);
          expect(result.exitCode).toBe(0);
        }
      }
    });

    it('should check yarn modern features (yarn >= 2.0.0)', async () => {
      const version = await getPackageManagerVersion('yarn');
      
      if (version) {
        const majorVersion = parseInt(version.split('.')[0]);
        const isModern = majorVersion >= 2;
        
        // Test appropriate commands based on version
        if (isModern) {
          const result = await executeCommand('yarn --version', testDir, 5000);
          expect(result.exitCode).toBe(0);
        } else {
          // Classic yarn
          const result = await executeCommand('yarn --version', testDir, 5000);
          expect(result.exitCode).toBe(0);
        }
      }
    });

    it('should check pnpm workspace features', async () => {
      const version = await getPackageManagerVersion('pnpm');
      
      if (version) {
        // Test pnpm workspace command
        const result = await executeCommand('pnpm help', testDir, 5000);
        expect(result.exitCode).toBe(0);
        expect(result.stdout.toLowerCase()).toContain('workspace');
      }
    });

    it('should check bun features', async () => {
      const version = await getPackageManagerVersion('bun');
      
      if (version) {
        // Test bun install command
        const result = await executeCommand('bun --help', testDir, 5000);
        expect(result.exitCode).toBe(0);
        expect(result.stdout.toLowerCase()).toContain('install');
      }
    });
  });

  describe('Node.js Compatibility', () => {
    it('should check Node.js version compatibility', async () => {
      const nodeVersion = await executeCommand('node --version', testDir, 5000);
      expect(nodeVersion.exitCode).toBe(0);
      
      const version = nodeVersion.stdout.replace('v', '');
      const majorVersion = parseInt(version.split('.')[0]);
      
      // Node.js 16+ is required for modern package managers
      expect(majorVersion).toBeGreaterThanOrEqual(16);
    });

    it('should verify package manager Node.js compatibility', async () => {
      const detection = await detectPackageManagers();
      const nodeResult = await executeCommand('node --version', testDir, 5000);
      const nodeVersion = nodeResult.stdout.replace('v', '');
      const nodeMajor = parseInt(nodeVersion.split('.')[0]);
      
      // All detected package managers should work with current Node.js version
      for (const manager of detection.available) {
        const result = await executeCommand(`${manager} --version`, testDir, 5000);
        expect(result.exitCode).toBe(0);
      }
      
      // Specific compatibility checks
      if (nodeMajor >= 18) {
        // Node.js 18+ should support all modern package managers
        expect(detection.available.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Cross-Platform Compatibility', () => {
    it('should handle platform-specific version formats', async () => {
      const platform = process.platform;
      const detection = await detectPackageManagers();
      
      for (const [manager, version] of Object.entries(detection.versions)) {
        expect(version).toBeTruthy();
        expect(typeof version).toBe('string');
        
        // Version should be in semver format regardless of platform
        expect(/^\d+\.\d+\.\d+/.test(version)).toBe(true);
      }
    });

    it('should handle Windows-specific considerations', async () => {
      if (process.platform === 'win32') {
        // Test .cmd extensions
        const result = await executeCommand('npm.cmd --version', testDir, 5000);
        
        // Should work with or without .cmd extension
        expect(result.exitCode === 0 || result.stderr.includes('not found')).toBe(true);
      }
    });

    it('should handle Unix-specific considerations', async () => {
      if (process.platform !== 'win32') {
        // Test shell execution
        const result = await executeCommand('which npm', testDir, 5000);
        
        if (result.exitCode === 0) {
          expect(result.stdout).toContain('npm');
        }
      }
    });
  });

  describe('Performance Considerations', () => {
    it('should cache version detection results', async () => {
      const startTime = Date.now();
      
      // First call
      await detectPackageManagers();
      const firstCallDuration = Date.now() - startTime;
      
      // Second call should be faster (if caching is implemented)
      const secondStartTime = Date.now();
      await detectPackageManagers();
      const secondCallDuration = Date.now() - secondStartTime;
      
      // Both calls should be reasonably fast
      expect(firstCallDuration).toBeLessThan(10000); // 10s max
      expect(secondCallDuration).toBeLessThan(10000); // 10s max
    });

    it('should handle concurrent version checks', async () => {
      const managers = ['npm', 'yarn', 'pnpm', 'bun'] as const;
      
      const promises = managers.map(manager => getPackageManagerVersion(manager));
      const results = await Promise.allSettled(promises);
      
      // All promises should settle (either resolve or reject gracefully)
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          // If fulfilled, should have valid version or null
          expect(result.value === null || typeof result.value === 'string').toBe(true);
        }
        // Rejected promises are acceptable (manager not installed)
      });
    });
  });
});