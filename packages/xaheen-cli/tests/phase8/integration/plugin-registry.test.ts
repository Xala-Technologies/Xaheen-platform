/**
 * Phase 8: Plugin Registry Integration Tests
 * 
 * Tests plugin registry search, discovery, and integration functionality
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'fs-extra';
import { setupMockPluginRegistry } from '../mocks/plugin-registry.mock.js';
import { TEST_CONFIG, type PluginMetadata } from '../config/test-config.js';

interface CliCommandResult {
  readonly exitCode: number;
  readonly stdout: string;
  readonly stderr: string;
  readonly command: string;
}

interface PluginSearchResult {
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly author: string;
  readonly category: string;
  readonly rating: number;
  readonly downloads: number;
  readonly certified: boolean;
}

describe('Phase 8: Plugin Registry Integration', () => {
  let mockPluginRegistry: ReturnType<typeof setupMockPluginRegistry>;
  let testOutputDir: string;

  beforeAll(async () => {
    // Setup test environment
    testOutputDir = path.join(TEST_CONFIG.projects.outputDir, 'plugin-registry-tests');
    await fs.ensureDir(testOutputDir);

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
    // Reset environment variables
    process.env.XAHEEN_PLUGIN_REGISTRY_URL = TEST_CONFIG.registry.baseUrl;
  });

  afterEach(async () => {
    // Cleanup environment variables
    delete process.env.XAHEEN_PLUGIN_REGISTRY_URL;
  });

  describe('Plugin Search', () => {
    it('should search plugins by keyword', async () => {
      const result = await executeCliCommand('xaheen plugin search auth');

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/found.*plugins/i);
      expect(result.stdout).toMatch(/xaheen-auth-generator/i);
      expect(result.stdout).toMatch(/authentication/i);
    });

    it('should search plugins by category', async () => {
      const result = await executeCliCommand('xaheen plugin search --category=generator');

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/found.*plugins/i);
      expect(result.stdout).toMatch(/generator/i);
      expect(result.stdout).toMatch(/xaheen-auth-generator/i);
    });

    it('should search plugins by author', async () => {
      const result = await executeCliCommand('xaheen plugin search --author="Xaheen Team"');

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/found.*plugins/i);
      expect(result.stdout).toMatch(/xaheen team/i);
    });

    it('should filter certified plugins only', async () => {
      const result = await executeCliCommand('xaheen plugin search --certified');

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/found.*plugins/i);
      expect(result.stdout).toMatch(/certified/i);
      expect(result.stdout).not.toMatch(/xaheen-stripe-integration/i); // Not certified
    });

    it('should filter by minimum rating', async () => {
      const result = await executeCliCommand('xaheen plugin search --min-rating=4.5');

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/found.*plugins/i);
      // Should only show plugins with rating >= 4.5
      expect(result.stdout).toMatch(/4\.[5-9]|5\.0/); // Rating pattern
    });

    it('should sort search results', async () => {
      const result = await executeCliCommand('xaheen plugin search --sort=rating --order=desc');

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/found.*plugins/i);
      // Verify sorting by checking that higher rated plugins appear first
      const lines = result.stdout.split('\n');
      const ratingLines = lines.filter(line => line.includes('/5'));
      
      if (ratingLines.length > 1) {
        const firstRating = parseFloat(ratingLines[0].match(/(\d\.\d)\/5/)?.[1] || '0');
        const secondRating = parseFloat(ratingLines[1].match(/(\d\.\d)\/5/)?.[1] || '0');
        expect(firstRating).toBeGreaterThanOrEqual(secondRating);
      }
    });

    it('should limit search results', async () => {
      const result = await executeCliCommand('xaheen plugin search --limit=2');

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/found.*plugins/i);
      
      // Count the number of plugin entries
      const pluginEntries = (result.stdout.match(/xaheen-\w+-\w+/g) || []).length;
      expect(pluginEntries).toBeLessThanOrEqual(2);
    });

    it('should handle empty search results', async () => {
      const result = await executeCliCommand('xaheen plugin search nonexistentplugin');

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/no plugins found/i);
    });

    it('should show detailed search results', async () => {
      const result = await executeCliCommand('xaheen plugin search auth --detailed');

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/description/i);
      expect(result.stdout).toMatch(/keywords/i);
      expect(result.stdout).toMatch(/repository/i);
      expect(result.stdout).toMatch(/downloads/i);
    });
  });

  describe('Plugin Information', () => {
    it('should show detailed plugin information', async () => {
      const result = await executeCliCommand('xaheen plugin info xaheen-auth-generator');

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/xaheen-auth-generator/i);
      expect(result.stdout).toMatch(/version.*1\.0\.0/i);
      expect(result.stdout).toMatch(/generate authentication/i);
      expect(result.stdout).toMatch(/author.*xaheen team/i);
      expect(result.stdout).toMatch(/rating.*4\.8/i);
      expect(result.stdout).toMatch(/downloads/i);
      expect(result.stdout).toMatch(/certified.*yes/i);
    });

    it('should handle non-existent plugin info requests', async () => {
      const result = await executeCliCommand('xaheen plugin info nonexistent-plugin');

      expect(result.exitCode).not.toBe(0);
      expect(result.stderr).toMatch(/plugin.*not found/i);
    });

    it('should show plugin installation prompt', async () => {
      const result = await executeCliCommand('xaheen plugin info xaheen-tailwind-theme');

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/would you like to install/i);
    });
  });

  describe('Registry Statistics', () => {
    it('should show registry statistics', async () => {
      const result = await executeCliCommand('xaheen plugin registry stats');

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/total plugins/i);
      expect(result.stdout).toMatch(/total downloads/i);
      expect(result.stdout).toMatch(/categories/i);
      expect(result.stdout).toMatch(/certified/i);
      expect(result.stdout).toMatch(/featured/i);
    });

    it('should show registry health status', async () => {
      const result = await executeCliCommand('xaheen plugin registry health');

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/registry.*healthy/i);
      expect(result.stdout).toMatch(/response time/i);
    });
  });

  describe('Plugin Categories', () => {
    it('should list all plugin categories', async () => {
      const result = await executeCliCommand('xaheen plugin categories');

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/available categories/i);
      expect(result.stdout).toMatch(/generator/i);
      expect(result.stdout).toMatch(/template/i);
      expect(result.stdout).toMatch(/integration/i);
      expect(result.stdout).toMatch(/tool/i);
      expect(result.stdout).toMatch(/theme/i);
    });

    it('should show category statistics', async () => {
      const result = await executeCliCommand('xaheen plugin categories --stats');

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/generator.*\d+/i);
      expect(result.stdout).toMatch(/integration.*\d+/i);
      expect(result.stdout).toMatch(/theme.*\d+/i);
    });
  });

  describe('Featured Plugins', () => {
    it('should list featured plugins', async () => {
      const result = await executeCliCommand('xaheen plugin featured');

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/featured plugins/i);
      // Featured plugins should have high ratings and be certified
      expect(result.stdout).toMatch(/certified/i);
    });

    it('should show featured plugins by category', async () => {
      const result = await executeCliCommand('xaheen plugin featured --category=theme');

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/featured.*theme/i);
      expect(result.stdout).toMatch(/xaheen-tailwind-theme/i);
    });
  });

  describe('Plugin Recommendations', () => {
    it('should recommend plugins based on project type', async () => {
      // Create a sample project structure to base recommendations on
      const projectDir = path.join(testOutputDir, 'sample-nextjs-project');
      await fs.ensureDir(projectDir);
      await fs.writeJson(path.join(projectDir, 'package.json'), {
        name: 'sample-project',
        dependencies: {
          'next': '^14.0.0',
          'react': '^18.0.0',
        },
      });

      const result = await executeCliCommand(`xaheen plugin recommend`, {
        cwd: projectDir,
      });

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/recommended plugins/i);
      expect(result.stdout).toMatch(/based on.*project/i);
    });

    it('should recommend plugins for authentication setup', async () => {
      const result = await executeCliCommand('xaheen plugin recommend --for=auth');

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/authentication.*plugins/i);
      expect(result.stdout).toMatch(/xaheen-auth-generator/i);
    });
  });

  describe('Plugin Reviews and Ratings', () => {
    it('should show plugin reviews', async () => {
      const result = await executeCliCommand('xaheen plugin reviews xaheen-auth-generator');

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/reviews.*for/i);
      expect(result.stdout).toMatch(/rating/i);
    });

    it('should allow submitting plugin reviews', async () => {
      const result = await executeCliCommand('xaheen plugin review xaheen-auth-generator --rating=5 --comment="Great plugin!"');

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/review.*submitted/i);
    });
  });

  describe('Plugin Version History', () => {
    it('should show plugin version history', async () => {
      const result = await executeCliCommand('xaheen plugin versions xaheen-stripe-integration');

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/version history/i);
      expect(result.stdout).toMatch(/2\.1\.0/i);
      expect(result.stdout).toMatch(/latest/i);
    });

    it('should show version changelog', async () => {
      const result = await executeCliCommand('xaheen plugin changelog xaheen-stripe-integration');

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/changelog/i);
      expect(result.stdout).toMatch(/version.*2\.1\.0/i);
    });
  });

  describe('Registry Configuration', () => {
    it('should show current registry configuration', async () => {
      const result = await executeCliCommand('xaheen plugin registry config');

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/registry.*url/i);
      expect(result.stdout).toMatch(TEST_CONFIG.registry.baseUrl);
    });

    it('should allow switching registry URLs', async () => {
      const result = await executeCliCommand(`xaheen plugin registry set-url ${TEST_CONFIG.registry.baseUrl}`);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/registry.*url.*updated/i);
    });
  });

  describe('Error Handling', () => {
    it('should handle registry connection failures', async () => {
      // Stop the mock server to simulate network failure
      mockPluginRegistry.server.close();

      const result = await executeCliCommand('xaheen plugin search auth');

      expect(result.exitCode).not.toBe(0);
      expect(result.stderr).toMatch(/unable.*to.*connect/i);
      expect(result.stderr).toMatch(/registry.*unavailable/i);

      // Restart server for other tests
      mockPluginRegistry.server.listen();
    });

    it('should handle malformed search queries', async () => {
      const result = await executeCliCommand('xaheen plugin search --min-rating=invalid');

      expect(result.exitCode).not.toBe(0);
      expect(result.stderr).toMatch(/invalid.*rating/i);
    });

    it('should handle registry timeout', async () => {
      // This would be tested with a slow-responding mock server
      const result = await executeCliCommand('xaheen plugin search auth --timeout=1');

      // Depending on implementation, this might timeout or succeed quickly
      if (result.exitCode !== 0) {
        expect(result.stderr).toMatch(/timeout|timed out/i);
      }
    });
  });

  describe('Cache Management', () => {
    it('should cache search results', async () => {
      // First search should hit the registry
      const result1 = await executeCliCommand('xaheen plugin search auth');
      expect(result1.exitCode).toBe(0);

      // Second search should use cache (indicated in verbose output)
      const result2 = await executeCliCommand('xaheen plugin search auth --verbose');
      expect(result2.exitCode).toBe(0);
      expect(result2.stdout).toMatch(/using.*cache/i);
    });

    it('should clear search cache', async () => {
      const result = await executeCliCommand('xaheen plugin cache clear --search');

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/search.*cache.*cleared/i);
    });

    it('should refresh cached data', async () => {
      const result = await executeCliCommand('xaheen plugin search auth --refresh');

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/refreshing.*cache/i);
    });
  });

  // Helper functions
  async function executeCliCommand(
    command: string, 
    options: { cwd?: string } = {}
  ): Promise<CliCommandResult> {
    try {
      const stdout = execSync(command, {
        cwd: options.cwd || testOutputDir,
        encoding: 'utf-8',
        timeout: TEST_CONFIG.timeouts.registrySearch,
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