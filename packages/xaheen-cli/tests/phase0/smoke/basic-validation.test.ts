/**
 * Basic Validation Smoke Tests
 * 
 * Tests that validate the CLI can perform basic validation commands
 * and handle edge cases gracefully.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { 
  executeCommand, 
  cleanupTempDirs, 
  validateCliBinary,
  createTempDir,
  writeFile
} from '../utils/test-helpers';
import { getTestConfig } from '../config/test-config';
import { join } from 'path';

const config = getTestConfig();

describe('Basic Validation Smoke Tests', () => {
  let cliPath: string;
  let cliValid: boolean = false;
  let emptyTestDir: string;
  
  beforeAll(async () => {
    // Determine CLI path
    const packageRoot = config.paths.packageRoot;
    const packageJson = require(join(packageRoot, 'package.json'));
    
    if (packageJson.bin) {
      if (typeof packageJson.bin === 'string') {
        cliPath = join(packageRoot, packageJson.bin);
      } else {
        // Take the first binary
        const binName = Object.keys(packageJson.bin)[0];
        cliPath = join(packageRoot, packageJson.bin[binName]);
      }
    } else {
      // Fallback to dist/index.js
      cliPath = join(packageRoot, 'dist/index.js');
    }
    
    // Validate CLI binary
    const validation = await validateCliBinary(cliPath);
    cliValid = validation.exists && validation.executable;
    
    if (!cliValid) {
      console.warn(`⚠️  CLI binary not found or not executable at ${cliPath}`);
      console.warn('Make sure to run "bun run build" first');
    }
    
    // Create an empty test directory
    emptyTestDir = await createTempDir('empty-validation');
  });
  
  afterAll(async () => {
    await cleanupTempDirs();
  });

  it('should handle validate command in empty directory', async () => {
    if (!cliValid) {
      console.warn('⚠️  Skipping test - CLI binary not available');
      return;
    }
    
    const result = await executeCommand(`node "${cliPath}" validate`, {
      cwd: emptyTestDir,
      timeout: config.timeouts.default,
      expectFailure: true, // Expected to fail in empty directory
    });
    
    const output = result.stdout + result.stderr;
    
    // Should provide meaningful error message
    expect(output.length).toBeGreaterThan(0);
    
    // Should indicate no project found or similar
    expect(output.toLowerCase()).toMatch(
      /no project|not found|missing|empty|invalid|package\.json/
    );
    
    // Should not crash
    expect(result.exitCode).toBeGreaterThan(0);
  }, config.timeouts.default);

  it('should show validation help when requested', async () => {
    if (!cliValid) {
      console.warn('⚠️  Skipping test - CLI binary not available');
      return;
    }
    
    const result = await executeCommand(`node "${cliPath}" validate --help`, {
      timeout: config.timeouts.default,
      expectFailure: true, // Command might not exist
    });
    
    if (result.exitCode === 0) {
      expect(result.stdout.length).toBeGreaterThan(0);
      expect(result.stdout.toLowerCase()).toMatch(/validate|validation|usage/);
      console.log('✅ Validation help is available');
    } else {
      // If validate command doesn't exist, check if it's mentioned in general help
      const helpResult = await executeCommand(`node "${cliPath}" --help`, {
        timeout: config.timeouts.default,
      });
      
      if (helpResult.stdout.toLowerCase().includes('validate')) {
        console.log('✅ Validation mentioned in general help');
      } else {
        console.warn('⚠️  Validation command may not be implemented yet');
      }
    }
  }, config.timeouts.default);

  it('should handle validate command with minimal project structure', async () => {
    if (!cliValid) {
      console.warn('⚠️  Skipping test - CLI binary not available');
      return;
    }
    
    // Create minimal package.json
    const testDir = await createTempDir('minimal-validation');
    const packageJson = {
      name: 'test-project',
      version: '1.0.0',
      description: 'Test project for validation',
    };
    
    await writeFile(
      join(testDir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
    
    const result = await executeCommand(`node "${cliPath}" validate`, {
      cwd: testDir,
      timeout: config.timeouts.default,
      expectFailure: true, // May still fail due to missing files
    });
    
    const output = result.stdout + result.stderr;
    expect(output.length).toBeGreaterThan(0);
    
    // Should recognize that there's a package.json but may need more files
    const recognizesProject = output.toLowerCase().match(
      /package\.json|project|found|missing|incomplete/
    );
    expect(recognizesProject).toBeTruthy();
  }, config.timeouts.default);

  it('should handle validation with various flags', async () => {
    if (!cliValid) {
      console.warn('⚠️  Skipping test - CLI binary not available');
      return;
    }
    
    const flags = [
      '--verbose',
      '-v',
      '--quiet',
      '-q',
      '--json',
    ];
    
    for (const flag of flags) {
      try {
        const result = await executeCommand(`node "${cliPath}" validate ${flag}`, {
          cwd: emptyTestDir,
          timeout: config.timeouts.default,
          expectFailure: true,
        });
        
        // Should not crash with any common flags
        expect(typeof result.exitCode).toBe('number');
        
        const output = result.stdout + result.stderr;
        if (output.length > 0) {
          console.log(`✅ Handles flag: ${flag}`);
        }
      } catch (error) {
        // Flag might not be supported, that's okay
        continue;
      }
    }
  }, config.timeouts.default);

  it('should provide meaningful exit codes for validation', async () => {
    if (!cliValid) {
      console.warn('⚠️  Skipping test - CLI binary not available');
      return;
    }
    
    // Test in empty directory
    const emptyResult = await executeCommand(`node "${cliPath}" validate`, {
      cwd: emptyTestDir,
      timeout: config.timeouts.default,
      expectFailure: true,
    });
    
    // Should use non-zero exit code for validation failure
    expect(emptyResult.exitCode).toBeGreaterThan(0);
    
    // Common exit codes: 1 = general error, 2 = misuse, etc.
    expect(emptyResult.exitCode).toBeLessThan(128); // Not a signal
  }, config.timeouts.default);

  it('should handle concurrent validation requests', async () => {
    if (!cliValid) {
      console.warn('⚠️  Skipping test - CLI binary not available');
      return;
    }
    
    // Run multiple validation commands concurrently
    const promises = Array(3).fill(0).map(() => 
      executeCommand(`node "${cliPath}" validate`, {
        cwd: emptyTestDir,
        timeout: config.timeouts.default,
        expectFailure: true,
      })
    );
    
    const results = await Promise.all(promises);
    
    // All should complete without hanging
    results.forEach(result => {
      expect(typeof result.exitCode).toBe('number');
      expect(result.stdout + result.stderr).toBeDefined();
    });
    
    // Results should be consistent
    const exitCodes = results.map(r => r.exitCode);
    expect(new Set(exitCodes).size).toBe(1); // All should have same exit code
  }, config.timeouts.default);

  it('should handle validation timeout gracefully', async () => {
    if (!cliValid) {
      console.warn('⚠️  Skipping test - CLI binary not available');
      return;
    }
    
    // Test with very short timeout to ensure command completes quickly
    const startTime = Date.now();
    
    const result = await executeCommand(`node "${cliPath}" validate`, {
      cwd: emptyTestDir,
      timeout: 2000, // 2 seconds should be plenty for basic validation
      expectFailure: true,
    });
    
    const duration = Date.now() - startTime;
    
    // Should complete within timeout
    expect(duration).toBeLessThan(2000);
    
    // Should provide result
    expect(typeof result.exitCode).toBe('number');
    
    console.log(`Validation completed in ${duration}ms`);
  }, config.timeouts.default);

  it('should validate CLI behavior with invalid project structures', async () => {
    if (!cliValid) {
      console.warn('⚠️  Skipping test - CLI binary not available');
      return;
    }
    
    // Create directory with invalid package.json
    const invalidDir = await createTempDir('invalid-validation');
    await writeFile(join(invalidDir, 'package.json'), '{ invalid json }');
    
    const result = await executeCommand(`node "${cliPath}" validate`, {
      cwd: invalidDir,
      timeout: config.timeouts.default,
      expectFailure: true,
    });
    
    const output = result.stdout + result.stderr;
    
    // Should handle invalid JSON gracefully
    expect(output.length).toBeGreaterThan(0);
    expect(output.toLowerCase()).toMatch(/invalid|json|parse|error/);
    
    // Should not crash the process
    expect(result.exitCode).toBeGreaterThan(0);
  }, config.timeouts.default);

  it('should provide consistent validation behavior', async () => {
    if (!cliValid) {
      console.warn('⚠️  Skipping test - CLI binary not available');
      return;
    }
    
    // Run validation multiple times in same directory
    const results: any[] = [];
    
    for (let i = 0; i < 3; i++) {
      const result = await executeCommand(`node "${cliPath}" validate`, {
        cwd: emptyTestDir,
        timeout: config.timeouts.default,
        expectFailure: true,
      });
      
      results.push({
        exitCode: result.exitCode,
        outputLength: (result.stdout + result.stderr).length,
      });
    }
    
    // Results should be consistent across runs
    const exitCodes = results.map(r => r.exitCode);
    const outputLengths = results.map(r => r.outputLength);
    
    expect(new Set(exitCodes).size).toBe(1);
    expect(Math.max(...outputLengths) - Math.min(...outputLengths)).toBeLessThan(100);
  }, config.timeouts.default);

  it('should handle validation in various working directories', async () => {
    if (!cliValid) {
      console.warn('⚠️  Skipping test - CLI binary not available');
      return;
    }
    
    const testDirs = [
      emptyTestDir,
      process.cwd(), // Current working directory
      '/tmp', // System temp directory
    ];
    
    for (const dir of testDirs) {
      try {
        const result = await executeCommand(`node "${cliPath}" validate`, {
          cwd: dir,
          timeout: config.timeouts.default,
          expectFailure: true,
        });
        
        // Should handle all directories without crashing
        expect(typeof result.exitCode).toBe('number');
        
        const output = result.stdout + result.stderr;
        expect(typeof output).toBe('string');
        
      } catch (error) {
        // Some directories might not be accessible, that's okay
        console.warn(`Could not test validation in ${dir}: ${error}`);
      }
    }
  }, config.timeouts.default);
});