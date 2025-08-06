/**
 * Phase 8: Plugin Installation & Uninstallation Tests
 * 
 * Tests plugin installation, uninstallation, command registration,
 * and dependency resolution workflows.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'bun:test';
import { execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'fs-extra';
import { setupMockPluginRegistry } from '../mocks/plugin-registry.mock.js';
import { TEST_CONFIG, type PluginPackage } from '../config/test-config.js';

interface PluginInstallResult {
  readonly success: boolean;
  readonly pluginName: string;
  readonly version: string;
  readonly installedPath: string;
  readonly registeredCommands: readonly string[];
  readonly warnings: readonly string[];
  readonly errors: readonly string[];
}

interface CliCommandResult {
  readonly exitCode: number;
  readonly stdout: string;
  readonly stderr: string;
  readonly command: string;
}

describe('Phase 8: Plugin Installation & Uninstallation', () => {
  let mockPluginRegistry: ReturnType<typeof setupMockPluginRegistry>;
  let testOutputDir: string;
  let pluginsDir: string;

  beforeAll(async () => {
    // Setup test environment
    testOutputDir = path.join(TEST_CONFIG.projects.outputDir, 'plugin-install-tests');
    pluginsDir = path.join(testOutputDir, 'plugins');
    await fs.ensureDir(testOutputDir);
    await fs.ensureDir(pluginsDir);

    // Setup mock plugin registry
    mockPluginRegistry = setupMockPluginRegistry();
    mockPluginRegistry.server.listen();
  });

  afterAll(async () => {
    // Cleanup
    mockPluginRegistry.server.close();
    await fs.remove(testOutputDir);
  });

  beforeEach(async () => {
    // Clean plugins directory before each test
    await fs.emptyDir(pluginsDir);
    
    // Reset environment variables
    process.env.XAHEEN_PLUGIN_REGISTRY_URL = TEST_CONFIG.registry.baseUrl;
    process.env.XAHEEN_PLUGINS_DIR = pluginsDir;
  });

  afterEach(async () => {
    // Cleanup environment variables
    delete process.env.XAHEEN_PLUGIN_REGISTRY_URL;
    delete process.env.XAHEEN_PLUGINS_DIR;
  });

  describe('Plugin Installation', () => {
    it('should install a plugin successfully', async () => {
      const pluginName = 'xaheen-auth-generator';
      
      const result = await executeCliCommand(`xaheen plugin install ${pluginName}`);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/successfully installed/i);
      expect(result.stdout).toMatch(new RegExp(pluginName));

      // Verify plugin files were installed
      const pluginDir = path.join(pluginsDir, pluginName);
      expect(await fs.pathExists(pluginDir)).toBe(true);
      expect(await fs.pathExists(path.join(pluginDir, 'package.json'))).toBe(true);
      expect(await fs.pathExists(path.join(pluginDir, 'index.js'))).toBe(true);

      // Verify plugin is registered
      const configPath = path.join(pluginsDir, TEST_CONFIG.pluginSystem.configFile);
      expect(await fs.pathExists(configPath)).toBe(true);
      
      const config = await fs.readJson(configPath);
      expect(config.plugins).toContainEqual(
        expect.objectContaining({ name: pluginName })
      );
    });

    it('should install plugin with specific version', async () => {
      const pluginName = 'xaheen-stripe-integration';
      const version = '2.1.0';
      
      const result = await executeCliCommand(`xaheen plugin install ${pluginName}@${version}`);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/successfully installed/i);
      expect(result.stdout).toMatch(new RegExp(`${pluginName}@${version}`));

      // Verify correct version was installed
      const packageJsonPath = path.join(pluginsDir, pluginName, 'package.json');
      const packageJson = await fs.readJson(packageJsonPath);
      expect(packageJson.version).toBe(version);
    });

    it('should handle plugin installation failure gracefully', async () => {
      const nonExistentPlugin = 'xaheen-nonexistent-plugin';
      
      const result = await executeCliCommand(`xaheen plugin install ${nonExistentPlugin}`);

      expect(result.exitCode).not.toBe(0);
      expect(result.stderr).toMatch(/plugin not found/i);
      expect(result.stderr).toMatch(new RegExp(nonExistentPlugin));

      // Verify nothing was installed
      const pluginDir = path.join(pluginsDir, nonExistentPlugin);
      expect(await fs.pathExists(pluginDir)).toBe(false);
    });

    it('should prevent installing incompatible plugins', async () => {
      const incompatiblePlugin = 'xaheen-outdated-plugin';
      
      const result = await executeCliCommand(`xaheen plugin install ${incompatiblePlugin}`);

      expect(result.exitCode).not.toBe(0);
      expect(result.stderr).toMatch(/incompatible.*version/i);
      expect(result.stderr).toMatch(/requires.*cli.*v1/i);

      // Verify plugin was not installed
      const pluginDir = path.join(pluginsDir, incompatiblePlugin);
      expect(await fs.pathExists(pluginDir)).toBe(false);
    });

    it('should force install incompatible plugins with --force flag', async () => {
      const incompatiblePlugin = 'xaheen-outdated-plugin';
      
      const result = await executeCliCommand(`xaheen plugin install ${incompatiblePlugin} --force`);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/force.*installed/i);
      expect(result.stdout).toMatch(/warning.*incompatible/i);

      // Verify plugin was installed despite incompatibility
      const pluginDir = path.join(pluginsDir, incompatiblePlugin);
      expect(await fs.pathExists(pluginDir)).toBe(true);
    });

    it('should install plugin globally with --global flag', async () => {
      const pluginName = 'xaheen-tailwind-theme';
      
      const result = await executeCliCommand(`xaheen plugin install ${pluginName} --global`);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/globally.*installed/i);

      // For testing, we simulate global installation by using a different directory
      const globalPluginsDir = path.join(testOutputDir, 'global-plugins');
      process.env.XAHEEN_GLOBAL_PLUGINS_DIR = globalPluginsDir;

      // The plugin should be available globally
      const listResult = await executeCliCommand('xaheen plugin list --global');
      expect(listResult.stdout).toMatch(new RegExp(pluginName));
    });

    it('should handle plugin with dependencies', async () => {
      const pluginName = 'xaheen-stripe-integration';
      
      const result = await executeCliCommand(`xaheen plugin install ${pluginName}`);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/installing dependencies/i);
      expect(result.stdout).toMatch(/stripe.*installed/i);

      // Verify dependencies were installed
      const nodeModulesPath = path.join(pluginsDir, pluginName, 'node_modules');
      expect(await fs.pathExists(nodeModulesPath)).toBe(true);
    });
  });

  describe('Plugin Command Registration', () => {
    beforeEach(async () => {
      // Install a plugin for command registration tests
      await executeCliCommand('xaheen plugin install xaheen-auth-generator');
    });

    it('should register plugin commands after installation', async () => {
      const result = await executeCliCommand('xaheen --help');

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/generate.*auth/i);
    });

    it('should execute plugin commands successfully', async () => {
      const result = await executeCliCommand('xaheen generate auth --provider=local');

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/generating auth module/i);
    });

    it('should pass options to plugin commands', async () => {
      const result = await executeCliCommand('xaheen generate auth --provider=oauth --with-signup=false');

      expect(result.exitCode).toBe(0);
      // The mock plugin should reflect the options passed
      expect(result.stdout).toMatch(/auth.*oauth/i);
    });

    it('should show plugin command help', async () => {
      const result = await executeCliCommand('xaheen generate auth --help');

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/generate authentication module/i);
      expect(result.stdout).toMatch(/--provider/i);
      expect(result.stdout).toMatch(/--with-signup/i);
    });
  });

  describe('Plugin Uninstallation', () => {
    beforeEach(async () => {
      // Install plugins for uninstallation tests
      await executeCliCommand('xaheen plugin install xaheen-auth-generator');
      await executeCliCommand('xaheen plugin install xaheen-tailwind-theme');
    });

    it('should uninstall a plugin successfully', async () => {
      const pluginName = 'xaheen-auth-generator';
      
      const result = await executeCliCommand(`xaheen plugin remove ${pluginName}`);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/successfully.*uninstalled/i);
      expect(result.stdout).toMatch(new RegExp(pluginName));

      // Verify plugin files were removed
      const pluginDir = path.join(pluginsDir, pluginName);
      expect(await fs.pathExists(pluginDir)).toBe(false);

      // Verify plugin is unregistered
      const configPath = path.join(pluginsDir, TEST_CONFIG.pluginSystem.configFile);
      const config = await fs.readJson(configPath);
      expect(config.plugins).not.toContainEqual(
        expect.objectContaining({ name: pluginName })
      );
    });

    it('should deregister plugin commands after uninstallation', async () => {
      const pluginName = 'xaheen-auth-generator';
      
      // Verify command exists before uninstallation
      let result = await executeCliCommand('xaheen --help');
      expect(result.stdout).toMatch(/generate.*auth/i);

      // Uninstall plugin
      await executeCliCommand(`xaheen plugin remove ${pluginName}`);

      // Verify command is gone after uninstallation
      result = await executeCliCommand('xaheen --help');
      expect(result.stdout).not.toMatch(/generate.*auth/i);
    });

    it('should handle uninstalling non-existent plugin gracefully', async () => {
      const nonExistentPlugin = 'xaheen-nonexistent-plugin';
      
      const result = await executeCliCommand(`xaheen plugin remove ${nonExistentPlugin}`);

      expect(result.exitCode).not.toBe(0);
      expect(result.stderr).toMatch(/plugin.*not.*installed/i);
      expect(result.stderr).toMatch(new RegExp(nonExistentPlugin));
    });

    it('should require confirmation for plugin removal', async () => {
      const pluginName = 'xaheen-tailwind-theme';
      
      // Test without confirmation (should prompt)
      const result = await executeCliCommand(`xaheen plugin remove ${pluginName}`);

      expect(result.exitCode).not.toBe(0);
      expect(result.stderr).toMatch(/confirmation.*required/i);

      // Test with --yes flag (should proceed)
      const confirmResult = await executeCliCommand(`xaheen plugin remove ${pluginName} --yes`);
      expect(confirmResult.exitCode).toBe(0);
    });

    it('should force remove plugin with --force flag', async () => {
      const pluginName = 'xaheen-tailwind-theme';
      
      const result = await executeCliCommand(`xaheen plugin remove ${pluginName} --force`);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/force.*removed/i);

      // Verify plugin was removed
      const pluginDir = path.join(pluginsDir, pluginName);
      expect(await fs.pathExists(pluginDir)).toBe(false);
    });
  });

  describe('Plugin Management Commands', () => {
    beforeEach(async () => {
      // Install multiple plugins for management tests
      await executeCliCommand('xaheen plugin install xaheen-auth-generator');
      await executeCliCommand('xaheen plugin install xaheen-stripe-integration');
    });

    it('should list installed plugins', async () => {
      const result = await executeCliCommand('xaheen plugin list');

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/installed plugins/i);
      expect(result.stdout).toMatch(/xaheen-auth-generator/i);
      expect(result.stdout).toMatch(/xaheen-stripe-integration/i);
    });

    it('should show detailed plugin information', async () => {
      const result = await executeCliCommand('xaheen plugin list --detailed');

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/description/i);
      expect(result.stdout).toMatch(/version/i);
      expect(result.stdout).toMatch(/author/i);
      expect(result.stdout).toMatch(/generate authentication module/i);
    });

    it('should show plugin info for specific plugin', async () => {
      const pluginName = 'xaheen-auth-generator';
      
      const result = await executeCliCommand(`xaheen plugin info ${pluginName}`);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(new RegExp(pluginName));
      expect(result.stdout).toMatch(/version.*1\.0\.0/i);
      expect(result.stdout).toMatch(/generate authentication module/i);
      expect(result.stdout).toMatch(/certified.*yes/i);
    });

    it('should validate installed plugins', async () => {
      const result = await executeCliCommand('xaheen plugin validate');

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/validating.*plugins/i);
      expect(result.stdout).toMatch(/valid.*2/i); // 2 plugins installed
    });

    it('should update all plugins', async () => {
      const result = await executeCliCommand('xaheen plugin update');

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/updating.*plugins/i);
      expect(result.stdout).toMatch(/up.*to.*date/i);
    });

    it('should update specific plugin', async () => {
      const pluginName = 'xaheen-stripe-integration';
      
      const result = await executeCliCommand(`xaheen plugin update ${pluginName}`);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/updating.*stripe/i);
    });
  });

  describe('Plugin Cache Management', () => {
    it('should cache downloaded plugins', async () => {
      const pluginName = 'xaheen-auth-generator';
      const cacheDir = path.join(testOutputDir, 'plugin-cache');
      process.env.XAHEEN_PLUGIN_CACHE_DIR = cacheDir;
      
      // First install should download and cache
      const result1 = await executeCliCommand(`xaheen plugin install ${pluginName}`);
      expect(result1.exitCode).toBe(0);
      expect(result1.stdout).toMatch(/downloading/i);

      // Verify cache directory exists
      expect(await fs.pathExists(cacheDir)).toBe(true);

      // Remove and reinstall - should use cache
      await executeCliCommand(`xaheen plugin remove ${pluginName} --force`);
      
      const result2 = await executeCliCommand(`xaheen plugin install ${pluginName}`);
      expect(result2.exitCode).toBe(0);
      expect(result2.stdout).toMatch(/using.*cache/i);
    });

    it('should clear plugin cache', async () => {
      const cacheDir = path.join(testOutputDir, 'plugin-cache');
      process.env.XAHEEN_PLUGIN_CACHE_DIR = cacheDir;
      
      // Install plugin to populate cache
      await executeCliCommand('xaheen plugin install xaheen-auth-generator');
      expect(await fs.pathExists(cacheDir)).toBe(true);

      // Clear cache
      const result = await executeCliCommand('xaheen plugin cache clear');
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/cache.*cleared/i);

      // Verify cache is empty
      const cacheContents = await fs.readdir(cacheDir);
      expect(cacheContents).toHaveLength(0);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle network failures gracefully', async () => {
      // Stop the mock server to simulate network failure
      mockPluginRegistry.server.close();

      const result = await executeCliCommand('xaheen plugin install xaheen-auth-generator');

      expect(result.exitCode).not.toBe(0);
      expect(result.stderr).toMatch(/network.*error/i);
      expect(result.stderr).toMatch(/unable.*to.*connect/i);

      // Restart server for other tests
      mockPluginRegistry.server.listen();
    });

    it('should handle corrupted plugin packages', async () => {
      // This would be tested with a corrupted package in the mock registry
      const result = await executeCliCommand('xaheen plugin install corrupted-plugin');

      expect(result.exitCode).not.toBe(0);
      expect(result.stderr).toMatch(/corrupted.*package/i);
    });

    it('should handle insufficient disk space', async () => {
      // Simulate by creating a readonly plugins directory
      const readonlyDir = path.join(testOutputDir, 'readonly-plugins');
      await fs.ensureDir(readonlyDir);
      await fs.chmod(readonlyDir, 0o444); // Read-only

      process.env.XAHEEN_PLUGINS_DIR = readonlyDir;

      const result = await executeCliCommand('xaheen plugin install xaheen-auth-generator');

      expect(result.exitCode).not.toBe(0);
      expect(result.stderr).toMatch(/permission.*denied|read.*only/i);

      // Restore permissions for cleanup
      await fs.chmod(readonlyDir, 0o755);
    });
  });

  // Helper functions
  async function executeCliCommand(command: string): Promise<CliCommandResult> {
    try {
      const stdout = execSync(command, {
        cwd: testOutputDir,
        encoding: 'utf-8',
        timeout: TEST_CONFIG.timeouts.pluginInstall,
        env: {
          ...process.env,
          NODE_ENV: 'test',
        },
      });

      return {
        exitCode: 0,
        stdout,
        stderr: '',
        command,
      };
    } catch (error: any) {
      return {
        exitCode: error.status || 1,
        stdout: error.stdout || '',
        stderr: error.stderr || error.message,
        command,
      };
    }
  }
});