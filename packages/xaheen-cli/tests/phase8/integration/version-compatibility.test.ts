/**
 * Phase 8: Version Compatibility Tests
 * 
 * Tests version compatibility between CLI and plugins, including
 * compatibility matrix validation and migration workflows.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'fs-extra';
import { setupMockPluginRegistry } from '../mocks/plugin-registry.mock.js';
import { TEST_CONFIG, type VersionCompatibility } from '../config/test-config.js';

interface CliCommandResult {
  readonly exitCode: number;
  readonly stdout: string;
  readonly stderr: string;
  readonly command: string;
}

interface CompatibilityReport {
  readonly cliVersion: string;
  readonly pluginName: string;
  readonly pluginVersion: string;
  readonly compatible: boolean;
  readonly warnings: readonly string[];
  readonly breaking: readonly string[];
  readonly recommendation: string;
}

describe('Phase 8: Version Compatibility', () => {
  let mockPluginRegistry: ReturnType<typeof setupMockPluginRegistry>;
  let testOutputDir: string;
  let pluginsDir: string;

  beforeAll(async () => {
    // Setup test environment
    testOutputDir = path.join(TEST_CONFIG.projects.outputDir, 'version-compatibility-tests');
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
    // Clean plugins directory and reset environment variables
    await fs.emptyDir(pluginsDir);
    process.env.XAHEEN_PLUGIN_REGISTRY_URL = TEST_CONFIG.registry.baseUrl;
    process.env.XAHEEN_PLUGINS_DIR = pluginsDir;
    process.env.XAHEEN_CLI_VERSION = TEST_CONFIG.cliVersion;
  });

  afterEach(async () => {
    // Cleanup environment variables
    delete process.env.XAHEEN_PLUGIN_REGISTRY_URL;
    delete process.env.XAHEEN_PLUGINS_DIR;
    delete process.env.XAHEEN_CLI_VERSION;
  });

  describe('Compatibility Checking', () => {
    it('should check CLI-plugin compatibility before installation', async () => {
      const result = await executeCliCommand('xaheen plugin install xaheen-auth-generator --check-compatibility');

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/compatibility.*check/i);
      expect(result.stdout).toMatch(/compatible.*with.*cli/i);
      expect(result.stdout).toMatch(/xaheen.*v2\.0\.0/i);
    });

    it('should warn about incompatible plugins', async () => {
      const result = await executeCliCommand('xaheen plugin install xaheen-outdated-plugin --check-compatibility');

      expect(result.exitCode).not.toBe(0);
      expect(result.stderr).toMatch(/incompatible/i);
      expect(result.stderr).toMatch(/requires.*cli.*v1/i);
      expect(result.stderr).toMatch(/current.*cli.*v2/i);
    });

    it('should show compatibility matrix', async () => {
      const result = await executeCliCommand('xaheen plugin compatibility-matrix');

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/compatibility.*matrix/i);
      expect(result.stdout).toMatch(/cli.*version/i);
      expect(result.stdout).toMatch(/plugin.*version/i);
      expect(result.stdout).toMatch(/compatible/i);
    });

    it('should check specific plugin compatibility', async () => {
      const result = await executeCliCommand('xaheen plugin check-compatibility xaheen-stripe-integration');

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/checking.*compatibility/i);
      expect(result.stdout).toMatch(/xaheen-stripe-integration/i);
      expect(result.stdout).toMatch(/version.*2\.1\.0/i);
      expect(result.stdout).toMatch(/compatible.*yes/i);
    });
  });

  describe('Version Range Support', () => {
    it('should handle semantic version ranges', async () => {
      // Test plugin that supports CLI versions ^2.0.0
      const result = await executeCliCommand('xaheen plugin check-compatibility xaheen-auth-generator');

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/supports.*cli.*\^2\.0\.0/i);
      expect(result.stdout).toMatch(/current.*2\.0\.0.*satisfies/i);
    });

    it('should detect version range violations', async () => {
      // Mock CLI version 1.9.0 to test range violation
      process.env.XAHEEN_CLI_VERSION = '1.9.0';

      const result = await executeCliCommand('xaheen plugin check-compatibility xaheen-auth-generator');

      expect(result.exitCode).not.toBe(0);
      expect(result.stderr).toMatch(/version.*range.*violation/i);
      expect(result.stderr).toMatch(/requires.*2\.0\.0/i);
      expect(result.stderr).toMatch(/current.*1\.9\.0/i);
    });

    it('should handle pre-release versions', async () => {
      process.env.XAHEEN_CLI_VERSION = '2.1.0-beta.1';

      const result = await executeCliCommand('xaheen plugin check-compatibility xaheen-auth-generator');

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/pre-release.*version/i);
      expect(result.stdout).toMatch(/beta.*detected/i);
    });
  });

  describe('Breaking Changes Detection', () => {
    it('should detect breaking changes between versions', async () => {
      const result = await executeCliCommand('xaheen plugin breaking-changes --from=2.0.0 --to=2.1.0');

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/breaking.*changes/i);
      expect(result.stdout).toMatch(/version.*2\.0\.0.*to.*2\.1\.0/i);
    });

    it('should show plugin-specific breaking changes', async () => {
      const result = await executeCliCommand('xaheen plugin breaking-changes xaheen-outdated-plugin');

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/breaking.*changes.*for/i);
      expect(result.stdout).toMatch(/command.*api.*changed/i);
    });

    it('should suggest migration paths for breaking changes', async () => {
      const result = await executeCliCommand('xaheen plugin migration-guide xaheen-outdated-plugin');

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/migration.*guide/i);
      expect(result.stdout).toMatch(/upgrade.*from.*v1.*to.*v2/i);
    });
  });

  describe('Plugin Installation with Version Constraints', () => {
    it('should install compatible plugin versions', async () => {
      const result = await executeCliCommand('xaheen plugin install xaheen-stripe-integration@2.1.0');

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/successfully.*installed/i);
      expect(result.stdout).toMatch(/version.*2\.1\.0/i);
      expect(result.stdout).toMatch(/compatible.*with.*cli/i);
    });

    it('should prevent installation of incompatible versions', async () => {
      const result = await executeCliCommand('xaheen plugin install xaheen-outdated-plugin@0.5.0');

      expect(result.exitCode).not.toBe(0);
      expect(result.stderr).toMatch(/incompatible.*version/i);
      expect(result.stderr).toMatch(/plugin.*requires.*cli.*v1/i);
    });

    it('should suggest compatible versions when installation fails', async () => {
      const result = await executeCliCommand('xaheen plugin install xaheen-outdated-plugin');

      expect(result.exitCode).not.toBe(0);
      expect(result.stderr).toMatch(/incompatible/i);
      expect(result.stderr).toMatch(/try.*installing.*version/i);
      expect(result.stderr).toMatch(/xaheen plugin list-versions/i);
    });
  });

  describe('Installed Plugin Compatibility Auditing', () => {
    beforeEach(async () => {
      // Install some plugins for auditing tests
      await executeCliCommand('xaheen plugin install xaheen-auth-generator --force');
      await executeCliCommand('xaheen plugin install xaheen-outdated-plugin --force');
    });

    it('should audit all installed plugins for compatibility', async () => {
      const result = await executeCliCommand('xaheen plugin audit-compatibility');

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/auditing.*compatibility/i);
      expect(result.stdout).toMatch(/xaheen-auth-generator.*compatible/i);
      expect(result.stdout).toMatch(/xaheen-outdated-plugin.*incompatible/i);
    });

    it('should show detailed compatibility report', async () => {
      const result = await executeCliCommand('xaheen plugin audit-compatibility --detailed');

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/compatibility.*report/i);
      expect(result.stdout).toMatch(/warnings/i);
      expect(result.stdout).toMatch(/breaking.*changes/i);
      expect(result.stdout).toMatch(/recommendations/i);
    });

    it('should identify plugins needing updates', async () => {
      const result = await executeCliCommand('xaheen plugin audit-compatibility --show-updates');

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/plugins.*needing.*updates/i);
      expect(result.stdout).toMatch(/xaheen-outdated-plugin/i);
    });
  });

  describe('CLI Version Upgrade Scenarios', () => {
    it('should check impact of CLI upgrade on installed plugins', async () => {
      // Install a plugin first
      await executeCliCommand('xaheen plugin install xaheen-auth-generator --force');

      // Check impact of upgrading to hypothetical v2.2.0
      const result = await executeCliCommand('xaheen plugin upgrade-impact --cli-version=2.2.0');

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/upgrade.*impact/i);
      expect(result.stdout).toMatch(/cli.*2\.2\.0/i);
      expect(result.stdout).toMatch(/compatible.*plugins/i);
    });

    it('should simulate CLI downgrade compatibility', async () => {
      const result = await executeCliCommand('xaheen plugin upgrade-impact --cli-version=1.9.0');

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/downgrade.*impact/i);
      expect(result.stdout).toMatch(/incompatible.*plugins/i);
    });
  });

  describe('Plugin Version Pinning', () => {
    it('should allow pinning plugin versions', async () => {
      await executeCliCommand('xaheen plugin install xaheen-stripe-integration --force');
      
      const result = await executeCliCommand('xaheen plugin pin xaheen-stripe-integration@2.1.0');

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/pinned.*version/i);
      expect(result.stdout).toMatch(/2\.1\.0/i);
    });

    it('should respect pinned versions during updates', async () => {
      await executeCliCommand('xaheen plugin install xaheen-stripe-integration --force');
      await executeCliCommand('xaheen plugin pin xaheen-stripe-integration@2.1.0');

      const result = await executeCliCommand('xaheen plugin update xaheen-stripe-integration');

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/version.*pinned/i);
      expect(result.stdout).toMatch(/skipping.*update/i);
    });

    it('should allow unpinning versions', async () => {
      await executeCliCommand('xaheen plugin install xaheen-stripe-integration --force');
      await executeCliCommand('xaheen plugin pin xaheen-stripe-integration@2.1.0');

      const result = await executeCliCommand('xaheen plugin unpin xaheen-stripe-integration');

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/unpinned.*version/i);
    });
  });

  describe('Version Lock File', () => {
    it('should generate version lock file', async () => {
      await executeCliCommand('xaheen plugin install xaheen-auth-generator --force');
      await executeCliCommand('xaheen plugin install xaheen-stripe-integration --force');

      const result = await executeCliCommand('xaheen plugin lock');

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/generated.*lock.*file/i);

      // Verify lock file exists
      const lockFilePath = path.join(pluginsDir, 'xaheen-plugins.lock');
      expect(await fs.pathExists(lockFilePath)).toBe(true);

      const lockFile = await fs.readJson(lockFilePath);
      expect(lockFile).toHaveProperty('plugins');
      expect(lockFile.plugins).toHaveProperty('xaheen-auth-generator');
    });

    it('should install from lock file', async () => {
      // Create a lock file
      const lockFile = {
        version: '1.0.0',
        cliVersion: '2.0.0',
        plugins: {
          'xaheen-auth-generator': {
            version: '1.0.0',
            resolved: `${TEST_CONFIG.registry.baseUrl}/plugins/xaheen-auth-generator/download`,
          },
        },
      };

      const lockFilePath = path.join(pluginsDir, 'xaheen-plugins.lock');
      await fs.writeJson(lockFilePath, lockFile);

      const result = await executeCliCommand('xaheen plugin install --from-lock');

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/installing.*from.*lock/i);
      expect(result.stdout).toMatch(/xaheen-auth-generator.*1\.0\.0/i);
    });
  });

  describe('Compatibility Warnings and Errors', () => {
    it('should show warnings for soon-to-be-deprecated features', async () => {
      const result = await executeCliCommand('xaheen plugin check-compatibility xaheen-auth-generator --verbose');

      expect(result.exitCode).toBe(0);
      if (result.stdout.includes('warning')) {
        expect(result.stdout).toMatch(/warning/i);
        expect(result.stdout).toMatch(/deprecated/i);
      }
    });

    it('should handle graceful degradation for minor incompatibilities', async () => {
      // This would test plugins that have minor API changes but can still work
      const result = await executeCliCommand('xaheen plugin install xaheen-auth-generator --allow-warnings');

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/installed.*with.*warnings/i);
    });
  });

  describe('Error Handling', () => {
    it('should handle registry unavailable during compatibility check', async () => {
      mockPluginRegistry.server.close();

      const result = await executeCliCommand('xaheen plugin check-compatibility xaheen-auth-generator');

      expect(result.exitCode).not.toBe(0);
      expect(result.stderr).toMatch(/unable.*to.*check/i);
      expect(result.stderr).toMatch(/registry.*unavailable/i);

      mockPluginRegistry.server.listen();
    });

    it('should handle malformed version strings', async () => {
      process.env.XAHEEN_CLI_VERSION = 'invalid-version';

      const result = await executeCliCommand('xaheen plugin check-compatibility xaheen-auth-generator');

      expect(result.exitCode).not.toBe(0);
      expect(result.stderr).toMatch(/invalid.*version/i);
    });
  });

  // Helper functions
  async function executeCliCommand(command: string): Promise<CliCommandResult> {
    try {
      const stdout = execSync(command, {
        cwd: testOutputDir,
        encoding: 'utf-8',
        timeout: TEST_CONFIG.timeouts.compatibilityCheck,
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