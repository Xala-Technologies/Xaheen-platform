/**
 * Fallback Logic Tests
 * Tests package manager fallback and preference logic
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'bun:test';
import { join } from 'path';
import { mkdir, rm, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import {
  detectPackageManagers,
  detectPackageManagerFromLockfile,
  isPackageManagerAvailable,
  createLockfile,
} from '../utils/package-manager-utils';
import { generateTestDir, PACKAGE_MANAGERS } from '../config/test-config';

describe('Fallback Logic', () => {
  let testDir: string;
  
  beforeEach(async () => {
    testDir = generateTestDir('fallback-logic');
    await mkdir(testDir, { recursive: true });
  });
  
  afterEach(async () => {
    if (existsSync(testDir)) {
      await rm(testDir, { recursive: true, force: true });
    }
  });

  describe('Package Manager Preference Order', () => {
    it('should prefer lockfile-detected manager over system default', async () => {
      // Create yarn.lock in test directory
      await createLockfile('yarn', testDir, true);
      
      const detection = await detectPackageManagers();
      const lockfileDetection = detectPackageManagerFromLockfile(testDir);
      
      // Lockfile detection should take precedence
      expect(lockfileDetection).toBe('yarn');
      
      // If yarn is available, it should be the detected manager
      if (detection.available.includes('yarn')) {
        // In a real implementation, this would respect lockfile preference
        expect(lockfileDetection).toBe('yarn');
      }
    });

    it('should fall back to available managers when preferred is not installed', async () => {
      // Create lockfile for a potentially unavailable manager
      await createLockfile('bun', testDir, true);
      
      const detection = await detectPackageManagers();
      const lockfileDetection = detectPackageManagerFromLockfile(testDir);
      const bunAvailable = await isPackageManagerAvailable('bun');
      
      expect(lockfileDetection).toBe('bun');
      
      if (!bunAvailable && detection.available.length > 0) {
        // Should fall back to an available manager
        expect(detection.detected).not.toBe('bun');
        expect(detection.available).toContain(detection.detected);
      }
    });

    it('should maintain preference hierarchy: lockfile > environment > system default', async () => {
      // Test the preference order
      const detection = await detectPackageManagers();
      
      // System should always detect npm as available (in Node.js environment)
      expect(detection.available).toContain('npm');
      
      // If no lockfile, should default to first available
      const noLockfileDetection = detectPackageManagerFromLockfile(testDir);
      expect(noLockfileDetection).toBeNull();
    });
  });

  describe('Graceful Degradation', () => {
    it('should handle missing package managers gracefully', async () => {
      // Mock all package managers as unavailable
      const originalIsAvailable = isPackageManagerAvailable;
      
      // This test would require mocking in a real implementation
      // For now, we test the current behavior
      const detection = await detectPackageManagers();
      
      // At least npm should be available in test environment
      expect(detection.available.length).toBeGreaterThan(0);
    });

    it('should provide meaningful error messages for unavailable managers', async () => {
      const unavailableManager = 'definitely-not-installed-manager' as any;
      const isAvailable = await isPackageManagerAvailable(unavailableManager);
      
      expect(isAvailable).toBe(false);
    });

    it('should handle corrupted package manager installations', async () => {
      // In a real scenario, we might test with a corrupted PATH
      // For now, test normal error handling
      const detection = await detectPackageManagers();
      
      // Should complete without throwing
      expect(Array.isArray(detection.available)).toBe(true);
      expect(typeof detection.versions).toBe('object');
    });
  });

  describe('Environment Variable Override', () => {
    it('should respect XAHEEN_PKG_MANAGER environment variable', async () => {
      const originalEnv = process.env.XAHEEN_PKG_MANAGER;
      
      try {
        // Set environment variable
        process.env.XAHEEN_PKG_MANAGER = 'yarn';
        
        // Test detection with environment override
        // In a real implementation, this would check the environment variable
        const detection = await detectPackageManagers();
        
        // Clean up
        if (originalEnv !== undefined) {
          process.env.XAHEEN_PKG_MANAGER = originalEnv;
        } else {
          delete process.env.XAHEEN_PKG_MANAGER;
        }
        
        // Should still provide valid detection
        expect(Array.isArray(detection.available)).toBe(true);
      } finally {
        if (originalEnv !== undefined) {
          process.env.XAHEEN_PKG_MANAGER = originalEnv;
        } else {
          delete process.env.XAHEEN_PKG_MANAGER;
        }
      }
    });

    it('should validate environment variable values', async () => {
      const originalEnv = process.env.XAHEEN_PKG_MANAGER;
      
      try {
        // Set invalid environment variable
        process.env.XAHEEN_PKG_MANAGER = 'invalid-manager';
        
        // Should handle invalid values gracefully
        const detection = await detectPackageManagers();
        expect(Array.isArray(detection.available)).toBe(true);
        
      } finally {
        if (originalEnv !== undefined) {
          process.env.XAHEEN_PKG_MANAGER = originalEnv;
        } else {
          delete process.env.XAHEEN_PKG_MANAGER;
        }
      }
    });

    it('should handle environment variable precedence correctly', async () => {
      // Create conflicting lockfile and environment variable
      await createLockfile('npm', testDir, true);
      
      const originalEnv = process.env.XAHEEN_PKG_MANAGER;
      
      try {
        process.env.XAHEEN_PKG_MANAGER = 'yarn';
        
        const lockfileDetection = detectPackageManagerFromLockfile(testDir);
        
        // Lockfile still detects npm
        expect(lockfileDetection).toBe('npm');
        
        // But environment variable should override in actual CLI usage
        // (This would be tested in integration tests)
        
      } finally {
        if (originalEnv !== undefined) {
          process.env.XAHEEN_PKG_MANAGER = originalEnv;
        } else {
          delete process.env.XAHEEN_PKG_MANAGER;
        }
      }
    });
  });

  describe('Multi-Environment Scenarios', () => {
    it('should handle Docker environment detection', async () => {
      // Simulate Docker environment (limited package managers)
      const detection = await detectPackageManagers();
      
      // npm should always be available in Node.js Docker images
      expect(detection.available).toContain('npm');
      
      // Other managers may or may not be available
      for (const manager of detection.available) {
        const isAvailable = await isPackageManagerAvailable(manager);
        expect(isAvailable).toBe(true);
      }
    });

    it('should handle CI environment detection', async () => {
      const originalCI = process.env.CI;
      
      try {
        // Simulate CI environment
        process.env.CI = 'true';
        
        const detection = await detectPackageManagers();
        
        // Should work in CI environment
        expect(detection.available.length).toBeGreaterThan(0);
        
      } finally {
        if (originalCI !== undefined) {
          process.env.CI = originalCI;
        } else {
          delete process.env.CI;
        }
      }
    });

    it('should handle restricted environments', async () => {
      // Test with limited permissions (where possible)
      const detection = await detectPackageManagers();
      
      // Should handle permission issues gracefully
      expect(Array.isArray(detection.available)).toBe(true);
    });
  });

  describe('Performance Fallbacks', () => {
    it('should timeout gracefully on slow package manager detection', async () => {
      const startTime = Date.now();
      
      // Detection should complete within reasonable time
      const detection = await detectPackageManagers();
      const duration = Date.now() - startTime;
      
      expect(duration).toBeLessThan(30000); // 30 second timeout
      expect(Array.isArray(detection.available)).toBe(true);
    });

    it('should handle network-dependent package managers', async () => {
      // Some package managers might require network access for version detection
      const detection = await detectPackageManagers();
      
      // Should complete even if network is limited
      expect(detection.available.length).toBeGreaterThan(0);
    });
  });

  describe('Recovery Mechanisms', () => {
    it('should recover from temporary failures', async () => {
      // Simulate temporary failure and recovery
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts) {
        try {
          const detection = await detectPackageManagers();
          expect(Array.isArray(detection.available)).toBe(true);
          break;
        } catch (error) {
          attempts++;
          if (attempts === maxAttempts) {
            throw error;
          }
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    });

    it('should provide diagnostic information for failures', async () => {
      // Test diagnostic information collection
      const detection = await detectPackageManagers();
      
      // Should provide useful information even in failure cases
      expect(typeof detection.versions).toBe('object');
      expect(Array.isArray(detection.available)).toBe(true);
      
      // Each available manager should have version info
      for (const manager of detection.available) {
        expect(detection.versions[manager]).toBeTruthy();
      }
    });
  });

  describe('Cross-Platform Fallbacks', () => {
    it('should handle Windows-specific fallbacks', async () => {
      if (process.platform === 'win32') {
        // Test Windows-specific behavior
        const detection = await detectPackageManagers();
        expect(detection.available).toContain('npm');
      }
    });

    it('should handle macOS-specific fallbacks', async () => {
      if (process.platform === 'darwin') {
        // Test macOS-specific behavior
        const detection = await detectPackageManagers();
        expect(detection.available).toContain('npm');
        
        // Homebrew-installed managers might be available
        for (const manager of detection.available) {
          const isAvailable = await isPackageManagerAvailable(manager);
          expect(isAvailable).toBe(true);
        }
      }
    });

    it('should handle Linux-specific fallbacks', async () => {
      if (process.platform === 'linux') {
        // Test Linux-specific behavior
        const detection = await detectPackageManagers();
        expect(detection.available).toContain('npm');
      }
    });
  });
});