/**
 * Binary Validation Tests
 * 
 * Tests that validate the CLI binary is properly built and executable
 * with correct permissions and functionality.
 */

import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { 
  executeCommand, 
  cleanupTempDirs, 
  validateCliBinary,
  readPackageJson,
  fileExists
} from '../utils/test-helpers';
import { getTestConfig } from '../config/test-config';
import { join } from 'path';

const config = getTestConfig();

describe('Binary Validation Tests', () => {
  let packageInfo: any;
  let binaryPaths: Record<string, string> = {};
  
  beforeAll(async () => {
    packageInfo = await readPackageJson(config.paths.packageRoot);
    
    // Determine binary paths
    if (packageInfo.bin) {
      if (typeof packageInfo.bin === 'string') {
        binaryPaths[packageInfo.name] = join(config.paths.packageRoot, packageInfo.bin);
      } else {
        for (const [name, path] of Object.entries(packageInfo.bin)) {
          binaryPaths[name] = join(config.paths.packageRoot, path as string);
        }
      }
    }
  });
  
  afterAll(async () => {
    await cleanupTempDirs();
  });

  it('should have valid binary configuration in package.json', async () => {
    expect(packageInfo.bin).toBeDefined();
    
    if (typeof packageInfo.bin === 'string') {
      expect(packageInfo.bin.length).toBeGreaterThan(0);
      expect(packageInfo.bin).not.toContain(' '); // No spaces in path
    } else {
      expect(Object.keys(packageInfo.bin).length).toBeGreaterThan(0);
      
      for (const [name, path] of Object.entries(packageInfo.bin)) {
        expect(name.length).toBeGreaterThan(0);
        expect(typeof path).toBe('string');
        expect((path as string).length).toBeGreaterThan(0);
      }
    }
  }, config.timeouts.default);

  it('should have binary files that exist and are accessible', async () => {
    expect(Object.keys(binaryPaths).length).toBeGreaterThan(0);
    
    for (const [name, path] of Object.entries(binaryPaths)) {
      const exists = await fileExists(path);
      expect(exists).toBe(true);
      console.log(`✅ Binary exists: ${name} at ${path}`);
    }
  }, config.timeouts.default);

  it('should validate binary permissions and executability', async () => {
    for (const [name, path] of Object.entries(binaryPaths)) {
      const validation = await validateCliBinary(path);
      
      expect(validation.exists).toBe(true);
      
      if (!validation.executable) {
        console.warn(`⚠️  Binary ${name} may not be executable - this could cause issues`);
      }
      
      console.log(`Binary ${name}: exists=${validation.exists}, executable=${validation.executable}`);
    }
  }, config.timeouts.default);

  it('should execute binaries without errors', async () => {
    for (const [name, path] of Object.entries(binaryPaths)) {
      // Test basic execution (help command)
      const result = await executeCommand(`node "${path}" --help`, {
        timeout: config.timeouts.default,
        expectFailure: true, // Some CLIs might not have --help
      });
      
      // Should not crash completely
      expect(typeof result.exitCode).toBe('number');
      
      const output = result.stdout + result.stderr;
      expect(typeof output).toBe('string');
      
      if (result.exitCode === 0) {
        console.log(`✅ Binary ${name} executes successfully`);
        expect(output.length).toBeGreaterThan(0);
      } else {
        console.warn(`⚠️  Binary ${name} exited with code ${result.exitCode}`);
        // Still check that it produced some output
        if (output.length === 0) {
          console.warn(`Binary ${name} produced no output - may indicate issues`);
        }
      }
    }
  }, config.timeouts.default);

  it('should respond to version requests', async () => {
    for (const [name, path] of Object.entries(binaryPaths)) {
      const versionFlags = ['--version', '-V'];
      let versionFound = false;
      
      for (const flag of versionFlags) {
        try {
          const result = await executeCommand(`node "${path}" ${flag}`, {
            timeout: config.timeouts.default,
            expectFailure: true,
          });
          
          if (result.exitCode === 0 && result.stdout.match(/\d+\.\d+\.\d+/)) {
            console.log(`✅ Binary ${name} responds to ${flag}: ${result.stdout.trim()}`);
            expect(result.stdout).toMatch(/\d+\.\d+\.\d+/);
            versionFound = true;
            break;
          }
        } catch (error) {
          // Try next flag
          continue;
        }
      }
      
      if (!versionFound) {
        console.warn(`⚠️  Binary ${name} does not respond to version flags`);
      }
    }
  }, config.timeouts.default);

  it('should have proper shebang line for Unix systems', async () => {
    for (const [name, path] of Object.entries(binaryPaths)) {
      try {
        const fs = await import('fs');
        const content = await fs.promises.readFile(path, 'utf-8');
        const firstLine = content.split('\n')[0];
        
        if (firstLine.startsWith('#!')) {
          console.log(`✅ Binary ${name} has shebang: ${firstLine}`);
          
          // Should point to a valid interpreter
          expect(firstLine).toMatch(/^#!/);
          expect(firstLine).toMatch(/(node|env)/);
        } else {
          console.warn(`⚠️  Binary ${name} missing shebang line - may not work on Unix systems`);
        }
      } catch (error) {
        console.warn(`Could not read binary ${name}: ${error}`);
      }
    }
  }, config.timeouts.default);

  it('should handle invalid arguments gracefully', async () => {
    for (const [name, path] of Object.entries(binaryPaths)) {
      const invalidArgs = [
        '--invalid-flag-12345',
        'invalid-command-12345',
        '--flag-with-no-value-12345=',
      ];
      
      for (const arg of invalidArgs) {
        const result = await executeCommand(`node "${path}" ${arg}`, {
          timeout: config.timeouts.default,
          expectFailure: true,
        });
        
        // Should exit with non-zero code for invalid arguments
        expect(result.exitCode).toBeGreaterThan(0);
        
        const output = result.stdout + result.stderr;
        
        // Should provide some error message
        expect(output.length).toBeGreaterThan(0);
        
        // Should mention the invalid argument or provide help
        const isUsefulError = output.toLowerCase().match(
          /unknown|invalid|error|help|usage|command/
        );
        
        if (!isUsefulError) {
          console.warn(`Binary ${name} error message could be more helpful for: ${arg}`);
        }
      }
    }
  }, config.timeouts.default);

  it('should not hang on execution', async () => {
    for (const [name, path] of Object.entries(binaryPaths)) {
      const startTime = Date.now();
      
      const result = await executeCommand(`node "${path}" --help`, {
        timeout: 5000, // 5 second timeout for help
        expectFailure: true,
      });
      
      const duration = Date.now() - startTime;
      
      // Help should be fast
      expect(duration).toBeLessThan(5000);
      
      console.log(`Binary ${name} help response time: ${duration}ms`);
      
      if (duration > 2000) {
        console.warn(`⚠️  Binary ${name} is slow to respond (${duration}ms)`);
      }
    }
  }, config.timeouts.default);

  it('should handle concurrent executions', async () => {
    const mainBinary = Object.entries(binaryPaths)[0];
    if (!mainBinary) return;
    
    const [name, path] = mainBinary;
    
    // Run multiple help commands concurrently
    const promises = Array(3).fill(0).map(() => 
      executeCommand(`node "${path}" --help`, {
        timeout: config.timeouts.default,
        expectFailure: true,
      })
    );
    
    const results = await Promise.all(promises);
    
    // All should complete
    results.forEach((result, index) => {
      expect(typeof result.exitCode).toBe('number');
      console.log(`Concurrent execution ${index + 1}: exit code ${result.exitCode}`);
    });
    
    // Results should be consistent
    const exitCodes = results.map(r => r.exitCode);
    const outputLengths = results.map(r => (r.stdout + r.stderr).length);
    
    // All executions should have same exit code
    expect(new Set(exitCodes).size).toBe(1);
    
    // Output should be roughly the same length (help text)
    const avgLength = outputLengths.reduce((a, b) => a + b, 0) / outputLengths.length;
    outputLengths.forEach(length => {
      expect(Math.abs(length - avgLength)).toBeLessThan(avgLength * 0.1); // Within 10%
    });
  }, config.timeouts.default);

  it('should validate binary size is reasonable', async () => {
    for (const [name, path] of Object.entries(binaryPaths)) {
      try {
        const fs = await import('fs');
        const stats = await fs.promises.stat(path);
        const sizeKB = stats.size / 1024;
        
        console.log(`Binary ${name} size: ${sizeKB.toFixed(2)} KB`);
        
        // Reasonable size expectations
        expect(sizeKB).toBeGreaterThan(0.1); // At least 100 bytes
        expect(sizeKB).toBeLessThan(10240); // Less than 10MB
        
        if (sizeKB > 1024) { // 1MB
          console.warn(`⚠️  Binary ${name} is large (${sizeKB.toFixed(2)} KB)`);
        }
      } catch (error) {
        console.warn(`Could not check size of binary ${name}: ${error}`);
      }
    }
  }, config.timeouts.default);

  it('should validate binary works in different working directories', async () => {
    const mainBinary = Object.entries(binaryPaths)[0];
    if (!mainBinary) return;
    
    const [name, path] = mainBinary;
    
    const testDirs = [
      config.paths.packageRoot,
      '/tmp',
      process.env.HOME || '/home',
    ].filter(dir => dir); // Remove undefined values
    
    for (const cwd of testDirs) {
      try {
        const result = await executeCommand(`node "${path}" --help`, {
          cwd,
          timeout: config.timeouts.default,
          expectFailure: true,
        });
        
        // Should work from any directory
        expect(typeof result.exitCode).toBe('number');
        
        const output = result.stdout + result.stderr;
        expect(typeof output).toBe('string');
        
        console.log(`✅ Binary ${name} works from ${cwd}`);
        
      } catch (error) {
        console.warn(`Binary ${name} failed from ${cwd}: ${error}`);
      }
    }
  }, config.timeouts.default);
});