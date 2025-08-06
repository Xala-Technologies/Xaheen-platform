/**
 * Phase 8: Plugin Publishing Tests
 * 
 * Tests plugin publishing workflow, validation, and registry submission
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'fs-extra';
import { setupMockPluginRegistry } from '../mocks/plugin-registry.mock.js';
import { TEST_CONFIG, type PluginPackage } from '../config/test-config.js';

interface PluginPublishResult {
  readonly success: boolean;
  readonly pluginId: string;
  readonly version: string;
  readonly downloadUrl: string;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
}

interface CliCommandResult {
  readonly exitCode: number;
  readonly stdout: string;
  readonly stderr: string;
  readonly command: string;
}

describe('Phase 8: Plugin Publishing', () => {
  let mockPluginRegistry: ReturnType<typeof setupMockPluginRegistry>;
  let testOutputDir: string;
  let samplePluginsDir: string;

  beforeAll(async () => {
    // Setup test environment
    testOutputDir = path.join(TEST_CONFIG.projects.outputDir, 'plugin-publish-tests');
    samplePluginsDir = path.join(testOutputDir, 'sample-plugins');
    await fs.ensureDir(testOutputDir);
    await fs.ensureDir(samplePluginsDir);

    // Setup mock plugin registry
    mockPluginRegistry = setupMockPluginRegistry();
    mockPluginRegistry.server.listen();

    // Create sample plugin directories for testing
    await createSamplePlugins();
  });

  afterAll(async () => {
    // Cleanup
    mockPluginRegistry.server.close();
    await fs.remove(testOutputDir);
  });

  beforeEach(async () => {
    // Reset environment variables
    process.env.XAHEEN_PLUGIN_REGISTRY_URL = TEST_CONFIG.registry.baseUrl;
    process.env.XAHEEN_REGISTRY_API_KEY = TEST_CONFIG.registry.apiKey;
  });

  afterEach(async () => {
    // Cleanup environment variables
    delete process.env.XAHEEN_PLUGIN_REGISTRY_URL;
    delete process.env.XAHEEN_REGISTRY_API_KEY;
  });

  describe('Plugin Publishing Workflow', () => {
    it('should publish a valid plugin successfully', async () => {
      const pluginDir = path.join(samplePluginsDir, 'valid-plugin');
      
      const result = await executeCliCommand(`xaheen plugin publish ${pluginDir}`);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/successfully published/i);
      expect(result.stdout).toMatch(/valid-plugin/i);
      expect(result.stdout).toMatch(/version.*1\.0\.0/i);
    });

    it('should validate plugin before publishing', async () => {
      const pluginDir = path.join(samplePluginsDir, 'invalid-plugin');
      
      const result = await executeCliCommand(`xaheen plugin publish ${pluginDir}`);

      expect(result.exitCode).not.toBe(0);
      expect(result.stderr).toMatch(/validation.*failed/i);
      expect(result.stderr).toMatch(/plugin name.*required/i);
    });

    it('should show warnings for plugin best practices', async () => {
      const pluginDir = path.join(samplePluginsDir, 'plugin-with-warnings');
      
      const result = await executeCliCommand(`xaheen plugin publish ${pluginDir}`);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/successfully published/i);
      expect(result.stdout).toMatch(/warnings/i);
      expect(result.stdout).toMatch(/consider.*adding.*homepage/i);
    });

    it('should handle dry-run mode', async () => {
      const pluginDir = path.join(samplePluginsDir, 'valid-plugin');
      
      const result = await executeCliCommand(`xaheen plugin publish ${pluginDir} --dry-run`);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/dry.*run.*mode/i);
      expect(result.stdout).toMatch(/would.*publish/i);
      expect(result.stdout).not.toMatch(/successfully published/i);
    });
  });

  describe('Plugin Validation', () => {
    it('should validate required package.json fields', async () => {
      const pluginDir = path.join(samplePluginsDir, 'missing-package-json');
      
      const result = await executeCliCommand(`xaheen plugin publish ${pluginDir}`);

      expect(result.exitCode).not.toBe(0);
      expect(result.stderr).toMatch(/package\.json.*not found/i);
    });

    it('should validate plugin name format', async () => {
      const pluginDir = path.join(samplePluginsDir, 'invalid-name-plugin');
      
      const result = await executeCliCommand(`xaheen plugin publish ${pluginDir}`);

      expect(result.exitCode).not.toBe(0);
      expect(result.stderr).toMatch(/plugin name.*invalid/i);
      expect(result.stderr).toMatch(/must.*include.*xaheen/i);
    });

    it('should validate semantic versioning', async () => {
      const pluginDir = path.join(samplePluginsDir, 'invalid-version-plugin');
      
      const result = await executeCliCommand(`xaheen plugin publish ${pluginDir}`);

      expect(result.exitCode).not.toBe(0);
      expect(result.stderr).toMatch(/version.*invalid/i);
      expect(result.stderr).toMatch(/semantic.*versioning/i);
    });
  });

  describe('Authentication and Authorization', () => {
    it('should require API key for publishing', async () => {
      delete process.env.XAHEEN_REGISTRY_API_KEY;
      
      const pluginDir = path.join(samplePluginsDir, 'valid-plugin');
      const result = await executeCliCommand(`xaheen plugin publish ${pluginDir}`);

      expect(result.exitCode).not.toBe(0);
      expect(result.stderr).toMatch(/api.*key.*required/i);
      expect(result.stderr).toMatch(/XAHEEN_REGISTRY_API_KEY/i);
    });
  });

  // Helper functions
  async function executeCliCommand(command: string): Promise<CliCommandResult> {
    try {
      const stdout = execSync(command, {
        cwd: testOutputDir,
        encoding: 'utf-8',
        timeout: TEST_CONFIG.timeouts.pluginPublish,
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

  async function createSamplePlugins(): Promise<void> {
    // Valid plugin
    await createPluginDirectory('valid-plugin', {
      name: 'xaheen-valid-plugin',
      version: '1.0.0',
      description: 'A valid test plugin for publishing',
      author: 'Test Author',
      category: 'tool',
      keywords: ['test', 'valid'],
      xaheenVersion: '^2.0.0',
      license: 'MIT',
    });

    // Invalid plugin (missing required fields)
    await createPluginDirectory('invalid-plugin', {
      version: '1.0.0',
      description: 'Invalid plugin missing name',
    });

    // Plugin with warnings
    await createPluginDirectory('plugin-with-warnings', {
      name: 'xaheen-warning-plugin',
      version: '1.0.0',
      description: 'Short desc', // Too short
      author: 'Test Author',
      category: 'tool',
      keywords: ['test'], // Too few keywords
      xaheenVersion: '^2.0.0',
      license: 'MIT',
    });

    // Missing package.json (directory without package.json)
    const missingPackageDir = path.join(samplePluginsDir, 'missing-package-json');
    await fs.ensureDir(missingPackageDir);
    await fs.writeFile(path.join(missingPackageDir, 'index.js'), 'module.exports = {};');

    // Invalid name plugin
    await createPluginDirectory('invalid-name-plugin', {
      name: 'bad-plugin-name', // Doesn't include 'xaheen'
      version: '1.0.0',
      description: 'Plugin with invalid name format',
      author: 'Test Author',
      category: 'tool',
      keywords: ['test'],
      xaheenVersion: '^2.0.0',
      license: 'MIT',
    });

    // Invalid version plugin
    await createPluginDirectory('invalid-version-plugin', {
      name: 'xaheen-invalid-version-plugin',
      version: '1.0', // Not semantic versioning
      description: 'Plugin with invalid version format',
      author: 'Test Author',
      category: 'tool',
      keywords: ['test'],
      xaheenVersion: '^2.0.0',
      license: 'MIT',
    });
  }

  async function createPluginDirectory(
    dirName: string, 
    packageJson: Record<string, any>,
    additionalFiles: Record<string, string> = {}
  ): Promise<void> {
    const pluginDir = path.join(samplePluginsDir, dirName);
    await fs.ensureDir(pluginDir);

    // Create package.json
    await fs.writeJson(
      path.join(pluginDir, 'package.json'),
      {
        main: 'index.js',
        ...packageJson,
      },
      { spaces: 2 }
    );

    // Create main entry file
    await fs.writeFile(
      path.join(pluginDir, 'index.js'),
      `
module.exports = {
  name: '${packageJson.name || 'unnamed'}',
  description: '${packageJson.description || 'No description'}',
  execute: async (options) => {
    console.log('Plugin executed with options:', options);
    return { success: true };
  }
};
      `.trim()
    );

    // Create README.md
    await fs.writeFile(
      path.join(pluginDir, 'README.md'),
      `# ${packageJson.name || 'Plugin'}\n\n${packageJson.description || 'No description provided.'}`
    );

    // Create additional files
    for (const [filePath, content] of Object.entries(additionalFiles)) {
      const fullPath = path.join(pluginDir, filePath);
      await fs.ensureDir(path.dirname(fullPath));
      await fs.writeFile(fullPath, content);
    }
  }
});