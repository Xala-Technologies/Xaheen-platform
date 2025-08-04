import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UnifiedConfigManager } from '../../src/core/config-manager/index.js';
import { UnifiedConfig, XaheenConfig, XalaConfig } from '../../src/types/index.js';
import * as fs from 'fs-extra';

// Mock fs-extra
vi.mock('fs-extra');

describe('Configuration Merger Integration', () => {
  let configManager: UnifiedConfigManager;
  const mockProjectPath = '/mock/project';

  beforeEach(() => {
    configManager = new UnifiedConfigManager(mockProjectPath);
    vi.clearAllMocks();
  });

  describe('Configuration Loading', () => {
    it('should load unified configuration if exists', async () => {
      const mockUnifiedConfig: UnifiedConfig = {
        version: '3.0.0',
        project: {
          name: 'test-app',
          framework: 'nextjs',
          packageManager: 'bun'
        },
        design: {
          platform: 'react',
          theme: 'default'
        },
        compliance: {
          accessibility: 'AAA',
          norwegian: false,
          gdpr: false
        }
      };

      vi.mocked(fs.pathExists).mockResolvedValue(true);
      vi.mocked(fs.readJson).mockResolvedValue(mockUnifiedConfig);

      const config = await configManager.loadConfig();

      expect(config).toEqual(mockUnifiedConfig);
      expect(fs.readJson).toHaveBeenCalledWith(
        expect.stringContaining('xaheen.config.json')
      );
    });

    it('should create default configuration if none exists', async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(false);
      vi.mocked(fs.readJson).mockResolvedValue({
        name: 'test-app',
        dependencies: { next: '14.0.0' }
      });

      const config = await configManager.loadConfig();

      expect(config.version).toBe('3.0.0');
      expect(config.project.name).toBe('test-app');
      expect(config.project.framework).toBe('nextjs');
    });
  });

  describe('Legacy Configuration Migration', () => {
    it('should migrate from xaheen-cli configuration', async () => {
      const mockXaheenConfig: XaheenConfig = {
        version: '2.0.2',
        project: {
          name: 'xaheen-app',
          framework: 'nextjs',
          packageManager: 'bun'
        },
        services: {
          auth: { provider: 'clerk', version: '5.0.0' },
          database: { provider: 'postgresql' }
        }
      };

      // Mock path existence checks
      vi.mocked(fs.pathExists).mockImplementation((path: string) => {
        if (path.includes('xaheen.config.json')) return Promise.resolve(false);
        if (path.includes('.xaheen/config.json')) return Promise.resolve(true);
        return Promise.resolve(false);
      });

      vi.mocked(fs.readJson).mockImplementation((path: string) => {
        if (path.includes('.xaheen/config.json')) {
          return Promise.resolve(mockXaheenConfig);
        }
        return Promise.resolve({ name: 'xaheen-app' });
      });

      const config = await configManager.loadConfig();

      expect(config.project.name).toBe('xaheen-app');
      expect(config.services).toEqual(mockXaheenConfig.services);
      expect(config.compliance?.norwegian).toBe(true); // xaheen-cli default
    });

    it('should migrate from xala-cli configuration', async () => {
      const mockXalaConfig: XalaConfig = {
        version: '2.0.0',
        platform: 'react',
        theme: 'healthcare-light',
        tokens: './design-tokens.json',
        ai: {
          provider: 'openai',
          model: 'gpt-4'
        }
      };

      // Mock path existence checks
      vi.mocked(fs.pathExists).mockImplementation((path: string) => {
        if (path.includes('xaheen.config.json')) return Promise.resolve(false);
        if (path.includes('.xaheen/config.json')) return Promise.resolve(false);
        if (path.includes('xala.config.js')) return Promise.resolve(true);
        return Promise.resolve(false);
      });

      // Mock require for JavaScript config file
      const originalRequire = require;
      require = vi.fn().mockReturnValue(mockXalaConfig);

      vi.mocked(fs.readJson).mockResolvedValue({
        name: 'xala-app'
      });

      const config = await configManager.loadConfig();

      expect(config.design?.platform).toBe('react');
      expect(config.design?.theme).toBe('healthcare-light');
      expect(config.ai).toEqual(mockXalaConfig.ai);
      expect(config.compliance?.accessibility).toBe('AAA'); // xala-cli default

      require = originalRequire;
    });
  });

  describe('Configuration Updates', () => {
    it('should add services correctly', async () => {
      const initialConfig: UnifiedConfig = {
        version: '3.0.0',
        project: {
          name: 'test-app',
          framework: 'nextjs',
          packageManager: 'bun'
        }
      };

      vi.mocked(fs.pathExists).mockResolvedValue(true);
      vi.mocked(fs.readJson).mockResolvedValue(initialConfig);
      vi.mocked(fs.writeJson).mockResolvedValue(undefined);
      vi.mocked(fs.ensureDir).mockResolvedValue(undefined);

      await configManager.addService('auth', {
        provider: 'clerk',
        version: '5.0.0'
      });

      expect(fs.writeJson).toHaveBeenCalledWith(
        expect.stringContaining('xaheen.config.json'),
        expect.objectContaining({
          services: {
            auth: {
              provider: 'clerk',
              version: '5.0.0'
            }
          }
        }),
        { spaces: 2 }
      );
    });

    it('should update design configuration', async () => {
      const initialConfig: UnifiedConfig = {
        version: '3.0.0',
        project: {
          name: 'test-app',
          framework: 'nextjs',
          packageManager: 'bun'
        }
      };

      vi.mocked(fs.pathExists).mockResolvedValue(true);
      vi.mocked(fs.readJson).mockResolvedValue(initialConfig);
      vi.mocked(fs.writeJson).mockResolvedValue(undefined);
      vi.mocked(fs.ensureDir).mockResolvedValue(undefined);

      await configManager.updateDesignConfig({
        platform: 'vue',
        theme: 'medical'
      });

      expect(fs.writeJson).toHaveBeenCalledWith(
        expect.stringContaining('xaheen.config.json'),
        expect.objectContaining({
          design: {
            platform: 'vue',
            theme: 'medical'
          }
        }),
        { spaces: 2 }
      );
    });
  });

  describe('Monorepo Detection', () => {
    it('should detect apps-packages monorepo structure', async () => {
      vi.mocked(fs.readJson).mockResolvedValue({
        name: 'monorepo',
        workspaces: ['apps/*', 'packages/*']
      });

      vi.mocked(fs.pathExists).mockImplementation((path: string) => {
        return Promise.resolve(path.includes('package.json'));
      });

      vi.mocked(fs.readdir).mockImplementation((path: string) => {
        if (path.includes('apps')) {
          return Promise.resolve([
            { name: 'web', isDirectory: () => true },
            { name: 'mobile', isDirectory: () => true }
          ] as any);
        }
        if (path.includes('packages')) {
          return Promise.resolve([
            { name: 'ui-system', isDirectory: () => true },
            { name: 'shared', isDirectory: () => true }
          ] as any);
        }
        return Promise.resolve([]);
      });

      const monorepoInfo = await configManager.getMonorepoInfo();

      expect(monorepoInfo.isMonorepo).toBe(true);
      expect(monorepoInfo.structure).toBe('apps-packages');
      expect(monorepoInfo.apps).toEqual(['web', 'mobile']);
      expect(monorepoInfo.packages).toEqual(['ui-system', 'shared']);
    });
  });

  describe('Configuration Validation', () => {
    it('should validate correct configuration', async () => {
      const validConfig: UnifiedConfig = {
        version: '3.0.0',
        project: {
          name: 'test-app',
          framework: 'nextjs',
          packageManager: 'bun'
        },
        compliance: {
          accessibility: 'AAA',
          norwegian: false,
          gdpr: false
        }
      };

      vi.mocked(fs.pathExists).mockResolvedValue(true);
      vi.mocked(fs.readJson).mockResolvedValue(validConfig);

      const validation = await configManager.validateConfig();

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect configuration errors', async () => {
      const invalidConfig = {
        version: '3.0.0',
        project: {
          // Missing required 'name' field
          framework: 'nextjs',
          packageManager: 'invalid-manager' // Invalid enum value
        }
      };

      vi.mocked(fs.pathExists).mockResolvedValue(true);
      vi.mocked(fs.readJson).mockResolvedValue(invalidConfig);

      const validation = await configManager.validateConfig();

      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });
});