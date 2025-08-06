/**
 * Package Manager Detection Tests
 * Tests automatic detection of available package managers
 */

import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { tmpdir } from 'os';
import { join } from 'path';
import { mkdir, rm, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import {
  detectPackageManagers,
  detectPackageManagerFromLockfile,
  detectWorkspaceConfig,
  isPackageManagerAvailable,
  getPackageManagerVersion,
  createLockfile,
  createWorkspaceConfig,
} from '../utils/package-manager-utils';
import { generateTestDir, PACKAGE_MANAGERS, LOCKFILE_SCENARIOS } from '../config/test-config';

describe('Package Manager Detection', () => {
  let testDir: string;
  
  beforeEach(async () => {
    testDir = generateTestDir('manager-detection');
    await mkdir(testDir, { recursive: true });
  });
  
  afterEach(async () => {
    if (existsSync(testDir)) {
      await rm(testDir, { recursive: true, force: true });
    }
  });

  describe('System Package Manager Availability', () => {
    it('should detect npm availability', async () => {
      const isAvailable = await isPackageManagerAvailable('npm');
      expect(isAvailable).toBe(true); // npm should always be available in Node.js environment
    });

    it('should detect package manager versions', async () => {
      const npmVersion = await getPackageManagerVersion('npm');
      expect(npmVersion).toBeTruthy();
      expect(typeof npmVersion).toBe('string');
      expect(/^\d+\.\d+\.\d+/.test(npmVersion!)).toBe(true);
    });

    it('should handle non-existent package managers gracefully', async () => {
      const isAvailable = await isPackageManagerAvailable('non-existent-manager' as any);
      expect(isAvailable).toBe(false);
      
      const version = await getPackageManagerVersion('non-existent-manager' as any);
      expect(version).toBeNull();
    });

    it('should detect all available package managers', async () => {
      const detection = await detectPackageManagers();
      
      expect(detection.available).toContain('npm');
      expect(detection.versions.npm).toBeTruthy();
      expect(Array.isArray(detection.available)).toBe(true);
      expect(typeof detection.versions).toBe('object');
    });
  });

  describe('Lockfile-based Detection', () => {
    it('should detect npm from package-lock.json', async () => {
      await createLockfile('npm', testDir, true);
      
      const detected = detectPackageManagerFromLockfile(testDir);
      expect(detected).toBe('npm');
    });

    it('should detect yarn from yarn.lock', async () => {
      await createLockfile('yarn', testDir, true);
      
      const detected = detectPackageManagerFromLockfile(testDir);
      expect(detected).toBe('yarn');
    });

    it('should detect pnpm from pnpm-lock.yaml', async () => {
      await createLockfile('pnpm', testDir, true);
      
      const detected = detectPackageManagerFromLockfile(testDir);
      expect(detected).toBe('pnpm');
    });

    it('should detect bun from bun.lockb', async () => {
      await createLockfile('bun', testDir, true);
      
      const detected = detectPackageManagerFromLockfile(testDir);
      expect(detected).toBe('bun');
    });

    it('should handle no lockfile gracefully', async () => {
      const detected = detectPackageManagerFromLockfile(testDir);
      expect(detected).toBeNull();
    });

    it('should prioritize npm when multiple lockfiles exist', async () => {
      // Create multiple lockfiles
      await createLockfile('npm', testDir, true);
      await createLockfile('yarn', testDir, true);
      await createLockfile('pnpm', testDir, true);
      
      const detected = detectPackageManagerFromLockfile(testDir);
      expect(detected).toBe('npm'); // npm should take precedence
    });
  });

  describe('Lockfile Scenarios', () => {
    it.each(LOCKFILE_SCENARIOS)('should handle $name scenario correctly', async (scenario) => {
      // Create the specified lockfiles
      for (const file of scenario.files) {
        const managerConfig = PACKAGE_MANAGERS.find(pm => pm.lockfile === file);
        if (managerConfig) {
          await createLockfile(managerConfig.name, testDir, true);
        }
      }
      
      const detected = detectPackageManagerFromLockfile(testDir);
      expect(detected).toBe(scenario.expectedManager);
    });
  });

  describe('Workspace Configuration Detection', () => {
    it('should detect pnpm workspace', async () => {
      await createWorkspaceConfig('pnpm', testDir);
      
      const workspace = detectWorkspaceConfig(testDir);
      expect(workspace.type).toBe('pnpm');
      expect(workspace.config).toContain('packages:');
    });

    it('should detect npm workspace', async () => {
      await createWorkspaceConfig('npm', testDir);
      
      const workspace = detectWorkspaceConfig(testDir);
      expect(workspace.type).toBe('npm');
      expect(Array.isArray(workspace.config)).toBe(true);
    });

    it('should detect yarn workspace', async () => {
      await createWorkspaceConfig('yarn', testDir);
      
      const workspace = detectWorkspaceConfig(testDir);
      expect(workspace.type).toBe('yarn');
      expect(workspace.config).toBeTruthy();
    });

    it('should handle no workspace configuration', async () => {
      const workspace = detectWorkspaceConfig(testDir);
      expect(workspace.type).toBe('none');
      expect(workspace.config).toBeNull();
    });

    it('should handle invalid package.json gracefully', async () => {
      await writeFile(join(testDir, 'package.json'), 'invalid json content');
      
      const workspace = detectWorkspaceConfig(testDir);
      expect(workspace.type).toBe('none');
      expect(workspace.config).toBeNull();
    });
  });

  describe('Full Detection Pipeline', () => {
    it('should provide comprehensive package manager detection', async () => {
      // Create a realistic project structure
      await createLockfile('yarn', testDir, false);
      await createWorkspaceConfig('yarn', testDir);
      
      const detection = await detectPackageManagers();
      const lockfileDetection = detectPackageManagerFromLockfile(testDir);
      const workspaceDetection = detectWorkspaceConfig(testDir);
      
      // System detection
      expect(detection.available.length).toBeGreaterThan(0);
      expect(detection.versions).toBeTruthy();
      
      // Lockfile detection
      expect(lockfileDetection).toBe('yarn');
      
      // Workspace detection
      expect(workspaceDetection.type).toBe('yarn');
    });

    it('should handle complex monorepo scenarios', async () => {
      // Create pnpm monorepo structure
      await mkdir(join(testDir, 'apps', 'web'), { recursive: true });
      await mkdir(join(testDir, 'packages', 'ui'), { recursive: true });
      
      await createLockfile('pnpm', testDir, false);
      await createWorkspaceConfig('pnpm', testDir, ['apps/*', 'packages/*']);
      
      // Add package.json files
      const rootPackageJson = {
        name: 'test-monorepo',
        private: true,
        scripts: {
          dev: 'pnpm -r dev',
        },
      };
      await writeFile(join(testDir, 'package.json'), JSON.stringify(rootPackageJson, null, 2));
      
      // Test detection
      const lockfileDetection = detectPackageManagerFromLockfile(testDir);
      const workspaceDetection = detectWorkspaceConfig(testDir);
      
      expect(lockfileDetection).toBe('pnpm');
      expect(workspaceDetection.type).toBe('pnpm');
      expect(workspaceDetection.config).toContain('apps/*');
      expect(workspaceDetection.config).toContain('packages/*');
    });
  });

  describe('Detection Performance', () => {
    it('should detect package managers within reasonable time', async () => {
      const startTime = Date.now();
      await detectPackageManagers();
      const duration = Date.now() - startTime;
      
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should handle concurrent detection requests', async () => {
      const promises = Array.from({ length: 5 }, () => detectPackageManagers());
      
      const results = await Promise.all(promises);
      
      // All results should be identical
      const first = results[0];
      results.forEach(result => {
        expect(result.available).toEqual(first.available);
        expect(result.versions).toEqual(first.versions);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle permission errors gracefully', async () => {
      // Create directory without read permissions (Unix only)
      if (process.platform !== 'win32') {
        const restrictedDir = join(testDir, 'restricted');
        await mkdir(restrictedDir, { mode: 0o000 });
        
        try {
          const detected = detectPackageManagerFromLockfile(restrictedDir);
          expect(detected).toBeNull();
        } finally {
          // Restore permissions to clean up
          await mkdir(restrictedDir, { mode: 0o755 });
        }
      }
    });

    it('should handle corrupted lockfiles gracefully', async () => {
      // Create corrupted package-lock.json
      await writeFile(join(testDir, 'package-lock.json'), 'corrupted content');
      
      const detected = detectPackageManagerFromLockfile(testDir);
      expect(detected).toBe('npm'); // Should still detect based on filename
    });
  });
});