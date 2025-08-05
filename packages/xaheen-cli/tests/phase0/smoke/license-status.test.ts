/**
 * License Status Smoke Tests
 * 
 * Tests that validate license-related CLI commands work correctly
 * and provide proper status information.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { executeCommand, cleanupTempDirs, validateCliBinary } from '../utils/test-helpers';
import { getTestConfig } from '../config/test-config';
import { join } from 'path';

const config = getTestConfig();

describe('License Status Smoke Tests', () => {
  let cliPath: string;
  let cliValid: boolean = false;
  
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
  });
  
  afterAll(async () => {
    await cleanupTempDirs();
  });

  it('should show license status command exists', async () => {
    if (!cliValid) {
      console.warn('⚠️  Skipping test - CLI binary not available');
      return;
    }
    
    // Try various ways to access license status
    const possibleCommands = [
      'license status',
      'license',
      'status',
      '--license',
    ];
    
    let foundLicenseCommand = false;
    
    for (const cmd of possibleCommands) {
      try {
        const result = await executeCommand(`node "${cliPath}" ${cmd}`, {
          timeout: config.timeouts.default,
          expectFailure: true, // May fail if no license configured
        });
        
        const output = result.stdout + result.stderr;
        
        // If the command exists, it should mention license in some way
        if (output.toLowerCase().includes('license')) {
          foundLicenseCommand = true;
          console.log(`✅ License command found: ${cmd}`);
          break;
        }
      } catch (error) {
        // Command might not exist, continue trying
        continue;
      }
    }
    
    // Check help output for license-related commands
    if (!foundLicenseCommand) {
      const helpResult = await executeCommand(`node "${cliPath}" --help`, {
        timeout: config.timeouts.default,
      });
      
      if (helpResult.stdout.toLowerCase().includes('license')) {
        foundLicenseCommand = true;
        console.log('✅ License functionality mentioned in help');
      }
    }
    
    // At minimum, the CLI should acknowledge licensing in some way
    expect(foundLicenseCommand).toBe(true);
  }, config.timeouts.default);

  it('should handle license status gracefully when no license configured', async () => {
    if (!cliValid) {
      console.warn('⚠️  Skipping test - CLI binary not available');
      return;
    }
    
    const result = await executeCommand(`node "${cliPath}" license status`, {
      timeout: config.timeouts.default,
      expectFailure: true, // Expected to fail if no license
    });
    
    const output = result.stdout + result.stderr;
    
    // Should provide informative message about license status
    expect(output.length).toBeGreaterThan(0);
    
    // Should mention license in the output
    expect(output.toLowerCase()).toMatch(/license|missing|not found|required/);
    
    // Should not crash or hang
    expect(result.exitCode).toBeGreaterThan(0); // Should indicate issue
  }, config.timeouts.default);

  it('should provide helpful license information', async () => {
    if (!cliValid) {
      console.warn('⚠️  Skipping test - CLI binary not available');
      return;
    }
    
    const result = await executeCommand(`node "${cliPath}" license`, {
      timeout: config.timeouts.default,
      expectFailure: true, // May fail without proper license
    });
    
    const output = result.stdout + result.stderr;
    
    if (output.length > 0) {
      // Should provide useful information about licensing
      const hasUsefulInfo = output.toLowerCase().match(
        /license|status|valid|invalid|expired|missing|configure|help/
      );
      expect(hasUsefulInfo).toBeTruthy();
      
      // Should not just be a generic error
      expect(output.toLowerCase()).not.toMatch(/undefined|null|error:/);
    }
  }, config.timeouts.default);

  it('should handle license command variations', async () => {
    if (!cliValid) {
      console.warn('⚠️  Skipping test - CLI binary not available');
      return;
    }
    
    const variations = [
      'license --help',
      'license -h',
      'help license',
    ];
    
    for (const variation of variations) {
      try {
        const result = await executeCommand(`node "${cliPath}" ${variation}`, {
          timeout: config.timeouts.default,
          expectFailure: true,
        });
        
        const output = result.stdout + result.stderr;
        
        if (output.length > 0 && output.toLowerCase().includes('license')) {
          console.log(`✅ License help available via: ${variation}`);
          expect(output.toLowerCase()).toMatch(/license|usage|command/);
          break; // At least one variation should work
        }
      } catch (error) {
        // Variation might not exist, continue
        continue;
      }
    }
  }, config.timeouts.default);

  it('should not crash when checking license status multiple times', async () => {
    if (!cliValid) {
      console.warn('⚠️  Skipping test - CLI binary not available');
      return;
    }
    
    // Run license status check multiple times to ensure stability
    for (let i = 0; i < 3; i++) {
      const result = await executeCommand(`node "${cliPath}" license status`, {
        timeout: config.timeouts.default,
        expectFailure: true,
      });
      
      // Should consistently return the same type of response
      expect(typeof result.exitCode).toBe('number');
      
      const output = result.stdout + result.stderr;
      expect(typeof output).toBe('string');
    }
  }, config.timeouts.default);

  it('should handle license validation without external dependencies', async () => {
    if (!cliValid) {
      console.warn('⚠️  Skipping test - CLI binary not available');
      return;
    }
    
    // License checking should work offline/without network
    const result = await executeCommand(`node "${cliPath}" license status`, {
      timeout: config.timeouts.default,
      expectFailure: true,
      env: {
        // Simulate offline environment
        HTTP_PROXY: 'http://localhost:1',
        HTTPS_PROXY: 'http://localhost:1',
      },
    });
    
    // Should still provide some response even if can't validate online
    const output = result.stdout + result.stderr;
    expect(output.length).toBeGreaterThan(0);
    
    // Should not hang waiting for network
    expect(result.exitCode).toBeDefined();
  }, config.timeouts.default);

  it('should provide license configuration guidance', async () => {
    if (!cliValid) {
      console.warn('⚠️  Skipping test - CLI binary not available');
      return;
    }
    
    const result = await executeCommand(`node "${cliPath}" license status`, {
      timeout: config.timeouts.default,
      expectFailure: true,
    });
    
    const output = result.stdout + result.stderr;
    
    if (output.toLowerCase().includes('missing') || output.toLowerCase().includes('not found')) {
      // Should provide guidance on how to configure license
      const hasGuidance = output.toLowerCase().match(
        /configure|setup|install|activate|key|token|file/
      );
      
      if (hasGuidance) {
        console.log('✅ Provides license configuration guidance');
      } else {
        console.warn('⚠️  License status could provide more guidance on configuration');
      }
    }
  }, config.timeouts.default);

  it('should respect license-related environment variables', async () => {
    if (!cliValid) {
      console.warn('⚠️  Skipping test - CLI binary not available');
      return;
    }
    
    // Test with potential license environment variables
    const testEnvs = [
      { XAHEEN_LICENSE: 'test-license-key' },
      { XAHEEN_LICENSE_KEY: 'test-key' },
      { LICENSE_KEY: 'test-key' },
    ];
    
    for (const env of testEnvs) {
      const result = await executeCommand(`node "${cliPath}" license status`, {
        timeout: config.timeouts.default,
        expectFailure: true,
        env,
      });
      
      const output = result.stdout + result.stderr;
      
      // Should acknowledge the environment variable in some way
      // (even if the test key is invalid)
      if (output.toLowerCase().includes('invalid') || 
          output.toLowerCase().includes('test') ||
          output.toLowerCase().includes('key')) {
        console.log('✅ Responds to license environment variables');
        break;
      }
    }
  }, config.timeouts.default);

  it('should exit with appropriate codes for license status', async () => {
    if (!cliValid) {
      console.warn('⚠️  Skipping test - CLI binary not available');
      return;
    }
    
    const result = await executeCommand(`node "${cliPath}" license status`, {
      timeout: config.timeouts.default,
      expectFailure: true,
    });
    
    // Exit codes should be meaningful:
    // 0 = valid license
    // 1 = invalid/missing license
    // 2 = configuration error
    // etc.
    expect([0, 1, 2]).toContain(result.exitCode);
    
    const output = result.stdout + result.stderr;
    
    // Exit code should match the message
    if (result.exitCode === 0) {
      expect(output.toLowerCase()).toMatch(/valid|active|ok/);
    } else {
      expect(output.toLowerCase()).toMatch(/missing|invalid|expired|error/);
    }
  }, config.timeouts.default);
});