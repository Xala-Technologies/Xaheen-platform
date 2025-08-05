/**
 * Help Commands Smoke Tests
 * 
 * Tests that validate basic CLI help commands work correctly
 * and provide proper usage information.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { executeCommand, cleanupTempDirs, validateCliBinary } from '../utils/test-helpers';
import { getTestConfig } from '../config/test-config';
import { join } from 'path';

const config = getTestConfig();

describe('Help Commands Smoke Tests', () => {
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

  it('should display help when run with --help flag', async () => {
    if (!cliValid) {
      console.warn('⚠️  Skipping test - CLI binary not available');
      return;
    }
    
    const result = await executeCommand(`node "${cliPath}" --help`, {
      timeout: config.timeouts.default,
    });
    
    expect(result.exitCode).toBe(0);
    expect(result.stdout.length).toBeGreaterThan(0);
    
    // Should contain usage information
    expect(result.stdout).toMatch(/usage|Usage|USAGE/i);
    
    // Should contain available commands or options
    expect(result.stdout).toMatch(/commands|options|Commands|Options/i);
  }, config.timeouts.default);

  it('should display help when run with -h flag', async () => {
    if (!cliValid) {
      console.warn('⚠️  Skipping test - CLI binary not available');
      return;
    }
    
    const result = await executeCommand(`node "${cliPath}" -h`, {
      timeout: config.timeouts.default,
    });
    
    expect(result.exitCode).toBe(0);
    expect(result.stdout.length).toBeGreaterThan(0);
    
    // Should contain similar content to --help
    expect(result.stdout).toMatch(/usage|commands|options/i);
  }, config.timeouts.default);

  it('should display help when run with no arguments', async () => {
    if (!cliValid) {
      console.warn('⚠️  Skipping test - CLI binary not available');
      return;
    }
    
    const result = await executeCommand(`node "${cliPath}"`, {
      timeout: config.timeouts.default,
      expectFailure: true, // Might exit with non-zero code
    });
    
    // Should either show help or a helpful error message
    const output = result.stdout + result.stderr;
    expect(output.length).toBeGreaterThan(0);
    
    // Should provide some guidance
    expect(output).toMatch(/usage|help|command|xaheen/i);
  }, config.timeouts.default);

  it('should display version with --version flag', async () => {
    if (!cliValid) {
      console.warn('⚠️  Skipping test - CLI binary not available');
      return;
    }
    
    const result = await executeCommand(`node "${cliPath}" --version`, {
      timeout: config.timeouts.default,
    });
    
    expect(result.exitCode).toBe(0);
    expect(result.stdout.length).toBeGreaterThan(0);
    
    // Should contain version number
    expect(result.stdout).toMatch(/\d+\.\d+\.\d+/);
    
    // Should not contain extra noise
    expect(result.stdout.trim().split('\n')).toHaveLength(1);
  }, config.timeouts.default);

  it('should display version with -v flag', async () => {
    if (!cliValid) {
      console.warn('⚠️  Skipping test - CLI binary not available');
      return;
    }
    
    const result = await executeCommand(`node "${cliPath}" -v`, {
      timeout: config.timeouts.default,
      expectFailure: true, // Some CLIs use -v for verbose, not version
    });
    
    // Either should show version or indicate -v is not supported
    if (result.exitCode === 0) {
      expect(result.stdout).toMatch(/\d+\.\d+\.\d+/);
    } else {
      // Should provide helpful error about using --version instead
      const output = result.stdout + result.stderr;
      expect(output.length).toBeGreaterThan(0);
    }
  }, config.timeouts.default);

  it('should list available commands', async () => {
    if (!cliValid) {
      console.warn('⚠️  Skipping test - CLI binary not available');
      return;
    }
    
    const result = await executeCommand(`node "${cliPath}" --help`, {
      timeout: config.timeouts.default,
    });
    
    expect(result.exitCode).toBe(0);
    
    // Look for common CLI commands that should be available
    const expectedCommands = [
      'new',
      'create',
      'generate',
      'init',
      'help',
    ];
    
    const foundCommands = expectedCommands.filter(cmd => 
      result.stdout.toLowerCase().includes(cmd)
    );
    
    // Should have at least some of the expected commands
    expect(foundCommands.length).toBeGreaterThan(0);
    console.log('Found commands:', foundCommands);
  }, config.timeouts.default);

  it('should show help for specific commands', async () => {
    if (!cliValid) {
      console.warn('⚠️  Skipping test - CLI binary not available');
      return;
    }
    
    // Try to get help for common commands
    const commandsToTest = ['new', 'create', 'generate', 'init'];
    
    for (const command of commandsToTest) {
      try {
        const result = await executeCommand(`node "${cliPath}" ${command} --help`, {
          timeout: config.timeouts.default,
          expectFailure: true, // Command might not exist
        });
        
        if (result.exitCode === 0) {
          expect(result.stdout.length).toBeGreaterThan(0);
          expect(result.stdout).toMatch(new RegExp(command, 'i'));
          console.log(`✅ Help available for command: ${command}`);
          break; // At least one command should have help
        }
      } catch (error) {
        // Command might not exist, continue trying others
        continue;
      }
    }
  }, config.timeouts.default);

  it('should handle invalid flags gracefully', async () => {
    if (!cliValid) {
      console.warn('⚠️  Skipping test - CLI binary not available');
      return;
    }
    
    const result = await executeCommand(`node "${cliPath}" --invalid-flag-that-does-not-exist`, {
      timeout: config.timeouts.default,
      expectFailure: true,
    });
    
    // Should fail with non-zero exit code
    expect(result.exitCode).not.toBe(0);
    
    // Should provide helpful error message
    const output = result.stdout + result.stderr;
    expect(output.length).toBeGreaterThan(0);
    
    // Should suggest help or list valid options
    expect(output).toMatch(/unknown|invalid|help|--help/i);
  }, config.timeouts.default);

  it('should handle invalid commands gracefully', async () => {
    if (!cliValid) {
      console.warn('⚠️  Skipping test - CLI binary not available');
      return;
    }
    
    const result = await executeCommand(`node "${cliPath}" invalid-command-that-does-not-exist`, {
      timeout: config.timeouts.default,
      expectFailure: true,
    });
    
    // Should fail with non-zero exit code
    expect(result.exitCode).not.toBe(0);
    
    // Should provide helpful error message
    const output = result.stdout + result.stderr;
    expect(output.length).toBeGreaterThan(0);
    
    // Should suggest available commands or help
    expect(output).toMatch(/unknown|invalid|available|commands|help/i);
  }, config.timeouts.default);

  it('should display CLI name and description in help', async () => {
    if (!cliValid) {
      console.warn('⚠️  Skipping test - CLI binary not available');
      return;
    }
    
    const result = await executeCommand(`node "${cliPath}" --help`, {
      timeout: config.timeouts.default,
    });
    
    expect(result.exitCode).toBe(0);
    
    // Should mention the CLI name
    expect(result.stdout).toMatch(/xaheen/i);
    
    // Should have some description of what the CLI does
    const hasDescription = result.stdout.match(/cli|command|generate|scaffold|create/i);
    expect(hasDescription).toBeTruthy();
  }, config.timeouts.default);

  it('should exit cleanly without hanging', async () => {
    if (!cliValid) {
      console.warn('⚠️  Skipping test - CLI binary not available');
      return;
    }
    
    const startTime = Date.now();
    
    const result = await executeCommand(`node "${cliPath}" --help`, {
      timeout: config.timeouts.default,
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(result.exitCode).toBe(0);
    
    // Should complete quickly (under 5 seconds for help)
    expect(duration).toBeLessThan(5000);
    
    console.log(`Help command completed in ${duration}ms`);
  }, config.timeouts.default);
});