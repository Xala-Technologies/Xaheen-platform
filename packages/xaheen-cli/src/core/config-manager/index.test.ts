/**
 * Comprehensive Tests for ConfigManager
 * 
 * Tests all configuration management functionality including loading, saving,
 * migration from legacy configs, validation, and monorepo detection.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ConfigManager, type ConfigPaths } from './index';
import type { XaheenConfig, LegacyXaheenConfig, XalaConfig } from '../../types/index';
import { z } from 'zod';

// Mock all external dependencies
vi.mock('node:fs', () => ({
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  existsSync: vi.fn(),
  mkdirSync: vi.fn()
}));

vi.mock('path', () => ({
  join: vi.fn((...paths) => paths.join('/')),
  dirname: vi.fn(path => path.split('/').slice(0, -1).join('/'))
}));

vi.mock('fs-extra', () => ({
  pathExists: vi.fn(),
  readJson: vi.fn(),
  writeJson: vi.fn(),
  ensureDir: vi.fn(),
  readdir: vi.fn()
}));

vi.mock('../../utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    warn: vi.fn()
  }
}));

vi.mock('../../types/index', () => ({
  XaheenConfigSchema: {
    parse: vi.fn()
  }
}));

describe('ConfigManager', () => {
  let configManager: ConfigManager;
  let mockFs: any;
  let mockLogger: any;
  let mockSchema: any;

  const mockProjectPath = '/test/project';
  const mockPackageJson = {
    name: 'test-project',
    dependencies: {
      next: '^14.0.0',
      react: '^18.0.0'
    },
    workspaces: ['apps/*', 'packages/*']
  };

  const mockXaheenConfig: XaheenConfig = {
    version: '3.0.0',
    project: {
      name: 'test-project',
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

  const mockLegacyXaheenConfig: LegacyXaheenConfig = {
    project: {
      name: 'legacy-project',
      framework: 'nextjs',
      packageManager: 'npm'
    },
    services: {
      auth: { provider: 'supabase' }
    }
  };

  const mockXalaConfig: XalaConfig = {
    platform: 'react',
    theme: 'enterprise',
    tokens: { primary: '#007bff' },
    ai: {
      provider: 'openai',
      model: 'gpt-4'
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup mocks
    mockFs = {
      ...vi.mocked(require('fs-extra')),
      ...vi.mocked(require('node:fs'))
    };
    mockLogger = vi.mocked(require('../../utils/logger')).logger;
    mockSchema = vi.mocked(require('../../types/index')).XaheenConfigSchema;
    
    // Default mock implementations
    mockFs.pathExists.mockResolvedValue(false);
    mockFs.readJson.mockResolvedValue(mockPackageJson);
    mockFs.writeJson.mockResolvedValue(undefined);
    mockFs.ensureDir.mockResolvedValue(undefined);
    mockFs.existsSync.mockReturnValue(false);
    mockFs.readdir.mockResolvedValue([]);
    mockSchema.parse.mockImplementation((config: any) => config);
    
    configManager = new ConfigManager(mockProjectPath);
  });

  afterEach(() => {
    vi.resetAllMocks();
    vi.clearAllTimers();
  });

  describe('Initialization', () => {
    it('should initialize with custom project path', () => {
      const customPath = '/custom/path';
      const customConfigManager = new ConfigManager(customPath);
      
      const paths = customConfigManager.getConfigPaths();
      expect(paths.unified).toBe('/custom/path/xaheen.config.json');
      expect(paths.packageJson).toBe('/custom/path/package.json');
    });

    it('should initialize with default current working directory', () => {
      vi.spyOn(process, 'cwd').mockReturnValue('/current/dir');
      const defaultConfigManager = new ConfigManager();
      
      const paths = defaultConfigManager.getConfigPaths();
      expect(paths.unified).toBe('/current/dir/xaheen.config.json');
    });

    it('should set correct config paths', () => {
      const paths = configManager.getConfigPaths();
      
      expect(paths.unified).toBe('/test/project/xaheen.config.json');
      expect(paths.xaheen).toBe('/test/project/.xaheen/config.json');
      expect(paths.xala).toBe('/test/project/xala.config.js');
      expect(paths.packageJson).toBe('/test/project/package.json');
    });
  });

  describe('Config Loading', () => {
    it('should load existing unified config', async () => {
      mockFs.pathExists.mockImplementation((path) => 
        path.includes('xaheen.config.json')
      );
      mockFs.readJson.mockResolvedValue(mockXaheenConfig);
      
      const config = await configManager.loadConfig();
      
      expect(config).toEqual(mockXaheenConfig);
      expect(mockLogger.debug).toHaveBeenCalledWith('Found CLI configuration file');
      expect(mockSchema.parse).toHaveBeenCalledWith(mockXaheenConfig);
    });

    it('should cache loaded config', async () => {
      mockFs.pathExists.mockImplementation((path) => 
        path.includes('xaheen.config.json')
      );
      mockFs.readJson.mockResolvedValue(mockXaheenConfig);
      
      // Load twice
      const config1 = await configManager.loadConfig();
      const config2 = await configManager.loadConfig();
      
      expect(config1).toEqual(config2);
      expect(mockFs.readJson).toHaveBeenCalledTimes(1);
    });

    it('should create default config when none exists', async () => {
      mockFs.pathExists.mockResolvedValue(false);
      
      const config = await configManager.loadConfig();
      
      expect(config.version).toBe('3.0.0');
      expect(config.project.name).toBe('test-project');
      expect(config.project.framework).toBe('nextjs');
      expect(mockLogger.info).toHaveBeenCalledWith(
        'No existing configuration found, creating default config'
      );
    });

    it('should handle config loading errors', async () => {
      mockFs.pathExists.mockImplementation((path) => 
        path.includes('xaheen.config.json')
      );
      mockFs.readJson.mockRejectedValue(new Error('File read error'));
      
      await expect(configManager.loadConfig()).rejects.toThrow('File read error');
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to load CLI configuration:', 
        expect.any(Error)
      );
    });
  });

  describe('Config Migration', () => {
    describe('Xaheen CLI Migration', () => {
      it('should migrate from legacy xaheen config', async () => {
        mockFs.pathExists.mockImplementation((path) => {
          if (path.includes('xaheen.config.json')) return false;
          if (path.includes('.xaheen/config.json')) return true;
          return false;
        });
        mockFs.readJson
          .mockResolvedValueOnce(mockLegacyXaheenConfig) // xaheen config
          .mockResolvedValueOnce(mockPackageJson); // package.json
        
        const config = await configManager.loadConfig();
        
        expect(config.project.name).toBe('legacy-project');
        expect(config.project.framework).toBe('nextjs');
        expect(config.services).toEqual({ auth: { provider: 'supabase' } });
        expect(config.compliance.norwegian).toBe(true);
        expect(config.compliance.gdpr).toBe(true);
        
        expect(mockLogger.info).toHaveBeenCalledWith(
          'Migrating from xaheen-cli configuration...'
        );
        expect(mockLogger.info).toHaveBeenCalledWith(
          'Successfully migrated from xaheen-cli to CLI config'
        );
      });

      it('should handle xaheen migration errors', async () => {
        mockFs.pathExists.mockImplementation((path) => {
          if (path.includes('xaheen.config.json')) return false;
          if (path.includes('.xaheen/config.json')) return true;
          return false;
        });
        mockFs.readJson.mockRejectedValue(new Error('Migration error'));
        
        const config = await configManager.loadConfig();
        
        // Should fall back to default config
        expect(config.version).toBe('3.0.0');
        expect(mockLogger.info).toHaveBeenCalledWith(
          'No existing configuration found, creating default config'
        );
      });
    });

    describe('Xala CLI Migration', () => {
      it('should migrate from xala config', async () => {
        mockFs.pathExists.mockImplementation((path) => {
          if (path.includes('xaheen.config.json')) return false;
          if (path.includes('.xaheen/config.json')) return false;
          if (path.includes('xala.config.js')) return true;
          return false;
        });
        
        // Mock require for xala config
        const originalRequire = require;
        const mockRequire = vi.fn().mockReturnValue(mockXalaConfig);
        global.require = mockRequire as any;
        global.require.cache = {};
        global.require.resolve = vi.fn().mockReturnValue('/test/project/xala.config.js');
        
        const config = await configManager.loadConfig();
        
        expect(config.project.name).toBe('test-project');
        expect(config.design.platform).toBe('react');
        expect(config.design.theme).toBe('enterprise');
        expect(config.ai?.provider).toBe('openai');
        expect(config.compliance.accessibility).toBe('AAA');
        
        expect(mockLogger.info).toHaveBeenCalledWith(
          'Migrating from xala-cli configuration...'
        );
        expect(mockLogger.info).toHaveBeenCalledWith(
          'Successfully migrated from xala-cli to CLI config'
        );
        
        // Restore require
        global.require = originalRequire;
      });

      it('should handle xala migration errors', async () => {
        mockFs.pathExists.mockImplementation((path) => {
          if (path.includes('xaheen.config.json')) return false;
          if (path.includes('.xaheen/config.json')) return false;
          if (path.includes('xala.config.js')) return true;
          return false;
        });
        
        // Mock require to throw error
        const mockRequire = vi.fn().mockImplementation(() => {
          throw new Error('Require error');
        });
        global.require = mockRequire as any;
        global.require.resolve = vi.fn();
        
        const config = await configManager.loadConfig();
        
        // Should fall back to default config
        expect(config.version).toBe('3.0.0');
      });
    });
  });

  describe('Config Saving', () => {
    it('should save config successfully', async () => {
      await configManager.saveConfig(mockXaheenConfig);
      
      expect(mockSchema.parse).toHaveBeenCalledWith(mockXaheenConfig);
      expect(mockFs.ensureDir).toHaveBeenCalledWith('/test/project');
      expect(mockFs.writeJson).toHaveBeenCalledWith(
        '/test/project/xaheen.config.json',
        mockXaheenConfig,
        { spaces: 2 }
      );
      expect(mockLogger.success).toHaveBeenCalledWith('Configuration saved successfully');
    });

    it('should validate config before saving', async () => {
      const invalidConfig = { invalid: true } as any;
      mockSchema.parse.mockImplementation(() => {
        throw new z.ZodError([]);
      });
      
      await expect(configManager.saveConfig(invalidConfig)).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to save configuration:', 
        expect.any(Error)
      );
    });

    it('should handle save errors', async () => {
      mockFs.writeJson.mockRejectedValue(new Error('Write error'));
      
      await expect(configManager.saveConfig(mockXaheenConfig)).rejects.toThrow('Write error');
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to save configuration:', 
        expect.any(Error)
      );
    });
  });

  describe('Config Updates', () => {
    it('should update config with partial changes', async () => {
      mockFs.pathExists.mockImplementation((path) => 
        path.includes('xaheen.config.json')
      );
      mockFs.readJson.mockResolvedValue(mockXaheenConfig);
      
      const updates = {
        design: { theme: 'dark' },
        compliance: { norwegian: true }
      };
      
      const updatedConfig = await configManager.updateConfig(updates);
      
      expect(updatedConfig.design.theme).toBe('dark');
      expect(updatedConfig.design.platform).toBe('react'); // preserved
      expect(updatedConfig.compliance.norwegian).toBe(true);
      expect(updatedConfig.compliance.accessibility).toBe('AAA'); // preserved
    });

    it('should merge nested objects correctly', async () => {
      mockFs.pathExists.mockImplementation((path) => 
        path.includes('xaheen.config.json')
      );
      mockFs.readJson.mockResolvedValue(mockXaheenConfig);
      
      const updates = {
        project: { packageManager: 'pnpm' as any }
      };
      
      const updatedConfig = await configManager.updateConfig(updates);
      
      expect(updatedConfig.project.packageManager).toBe('pnpm');
      expect(updatedConfig.project.name).toBe('test-project'); // preserved
      expect(updatedConfig.project.framework).toBe('nextjs'); // preserved
    });
  });

  describe('Service Management', () => {
    it('should add service to config', async () => {
      mockFs.pathExists.mockImplementation((path) => 
        path.includes('xaheen.config.json')
      );
      mockFs.readJson.mockResolvedValue(mockXaheenConfig);
      
      await configManager.addService('database', {
        provider: 'postgres',
        version: '15',
        config: { host: 'localhost' }
      });
      
      expect(mockFs.writeJson).toHaveBeenCalledWith(
        '/test/project/xaheen.config.json',
        expect.objectContaining({
          services: {
            database: {
              provider: 'postgres',
              version: '15',
              config: { host: 'localhost' }
            }
          }
        }),
        { spaces: 2 }
      );
      expect(mockLogger.success).toHaveBeenCalledWith('Added service: database');
    });

    it('should remove service from config', async () => {
      const configWithServices = {
        ...mockXaheenConfig,
        services: {
          auth: { provider: 'supabase' },
          database: { provider: 'postgres' }
        }
      };
      
      mockFs.pathExists.mockImplementation((path) => 
        path.includes('xaheen.config.json')
      );
      mockFs.readJson.mockResolvedValue(configWithServices);
      
      await configManager.removeService('database');
      
      expect(mockFs.writeJson).toHaveBeenCalledWith(
        '/test/project/xaheen.config.json',
        expect.objectContaining({
          services: { auth: { provider: 'supabase' } }
        }),
        { spaces: 2 }
      );
      expect(mockLogger.success).toHaveBeenCalledWith('Removed service: database');
    });

    it('should warn when removing non-existent service', async () => {
      mockFs.pathExists.mockImplementation((path) => 
        path.includes('xaheen.config.json')
      );
      mockFs.readJson.mockResolvedValue(mockXaheenConfig);
      
      await configManager.removeService('nonexistent');
      
      expect(mockLogger.warn).toHaveBeenCalledWith('Service not found: nonexistent');
    });
  });

  describe('Design Config Updates', () => {
    it('should update design configuration', async () => {
      mockFs.pathExists.mockImplementation((path) => 
        path.includes('xaheen.config.json')
      );
      mockFs.readJson.mockResolvedValue(mockXaheenConfig);
      
      await configManager.updateDesignConfig({
        theme: 'dark',
        tokens: { primary: '#ff0000' }
      });
      
      expect(mockFs.writeJson).toHaveBeenCalledWith(
        '/test/project/xaheen.config.json',
        expect.objectContaining({
          design: {
            platform: 'react', // preserved
            theme: 'dark',
            tokens: { primary: '#ff0000' }
          }
        }),
        { spaces: 2 }
      );
      expect(mockLogger.success).toHaveBeenCalledWith('Design configuration updated');
    });
  });

  describe('AI Config Updates', () => {
    it('should update AI configuration', async () => {
      mockFs.pathExists.mockImplementation((path) => 
        path.includes('xaheen.config.json')
      );
      mockFs.readJson.mockResolvedValue(mockXaheenConfig);
      
      await configManager.updateAIConfig({
        provider: 'openai',
        model: 'gpt-4-turbo'
      });
      
      expect(mockFs.writeJson).toHaveBeenCalledWith(
        '/test/project/xaheen.config.json',
        expect.objectContaining({
          ai: {
            provider: 'openai',
            model: 'gpt-4-turbo'
          }
        }),
        { spaces: 2 }
      );
      expect(mockLogger.success).toHaveBeenCalledWith('AI configuration updated');
    });
  });

  describe('Framework Detection', () => {
    it('should detect Next.js from dependencies', async () => {
      mockFs.readJson.mockResolvedValue({
        name: 'nextjs-app',
        dependencies: { next: '^14.0.0', react: '^18.0.0' }
      });
      
      const config = await configManager.loadConfig();
      expect(config.project.framework).toBe('nextjs');
    });

    it('should detect React from dependencies', async () => {
      mockFs.readJson.mockResolvedValue({
        name: 'react-app',
        dependencies: { react: '^18.0.0', 'react-dom': '^18.0.0' }
      });
      
      const config = await configManager.loadConfig();
      expect(config.project.framework).toBe('react');
    });

    it('should detect Vue from dependencies', async () => {
      mockFs.readJson.mockResolvedValue({
        name: 'vue-app',
        dependencies: { vue: '^3.0.0' }
      });
      
      const config = await configManager.loadConfig();
      expect(config.project.framework).toBe('vue');
    });

    it('should detect Angular from dependencies', async () => {
      mockFs.readJson.mockResolvedValue({
        name: 'angular-app',
        dependencies: { '@angular/core': '^17.0.0' }
      });
      
      const config = await configManager.loadConfig();
      expect(config.project.framework).toBe('angular');
    });

    it('should detect Svelte from dependencies', async () => {
      mockFs.readJson.mockResolvedValue({
        name: 'svelte-app',
        dependencies: { svelte: '^4.0.0' }
      });
      
      const config = await configManager.loadConfig();
      expect(config.project.framework).toBe('svelte');
    });

    it('should default to nextjs when no framework detected', async () => {
      mockFs.readJson.mockResolvedValue({
        name: 'unknown-app',
        dependencies: { lodash: '^4.0.0' }
      });
      
      const config = await configManager.loadConfig();
      expect(config.project.framework).toBe('nextjs');
    });
  });

  describe('Package Manager Detection', () => {
    it('should detect Bun from lockfile', async () => {
      mockFs.existsSync.mockImplementation((path) => 
        path.includes('bun.lockb')
      );
      
      const config = await configManager.loadConfig();
      expect(config.project.packageManager).toBe('bun');
    });

    it('should detect PNPM from lockfile', async () => {
      mockFs.existsSync.mockImplementation((path) => 
        path.includes('pnpm-lock.yaml')
      );
      
      const config = await configManager.loadConfig();
      expect(config.project.packageManager).toBe('pnpm');
    });

    it('should detect Yarn from lockfile', async () => {
      mockFs.existsSync.mockImplementation((path) => 
        path.includes('yarn.lock')
      );
      
      const config = await configManager.loadConfig();
      expect(config.project.packageManager).toBe('yarn');
    });

    it('should detect NPM from lockfile', async () => {
      mockFs.existsSync.mockImplementation((path) => 
        path.includes('package-lock.json')
      );
      
      const config = await configManager.loadConfig();
      expect(config.project.packageManager).toBe('npm');
    });

    it('should default to bun when no lockfile found', async () => {
      mockFs.existsSync.mockReturnValue(false);
      
      const config = await configManager.loadConfig();
      expect(config.project.packageManager).toBe('bun');
    });
  });

  describe('Monorepo Detection', () => {
    it('should detect apps-packages monorepo structure', async () => {
      mockFs.readJson.mockImplementation((path) => {
        if (path.includes('package.json')) {
          return { workspaces: ['apps/*', 'packages/*'] };
        }
        return {};
      });
      
      mockFs.pathExists.mockImplementation((path) => 
        path.includes('apps') || path.includes('packages')
      );
      
      mockFs.readdir
        .mockResolvedValueOnce([
          { name: 'web', isDirectory: () => true },
          { name: 'mobile', isDirectory: () => true }
        ])
        .mockResolvedValueOnce([
          { name: 'ui', isDirectory: () => true },
          { name: 'shared', isDirectory: () => true }
        ]);
      
      const monorepoInfo = await configManager.getMonorepoInfo();
      
      expect(monorepoInfo.isMonorepo).toBe(true);
      expect(monorepoInfo.structure).toBe('apps-packages');
      expect(monorepoInfo.apps).toEqual(['web', 'mobile']);
      expect(monorepoInfo.packages).toEqual(['ui', 'shared']);
    });

    it('should detect workspaces monorepo structure', async () => {
      mockFs.readJson.mockImplementation((path) => {
        if (path.includes('package.json')) {
          return { workspaces: ['packages/*'] };
        }
        return {};
      });
      
      mockFs.pathExists.mockImplementation((path) => {
        if (path.includes('apps')) return false;
        if (path.includes('packages')) return true;
        return false;
      });
      
      mockFs.readdir
        .mockResolvedValueOnce([]) // apps
        .mockResolvedValueOnce([
          { name: 'lib1', isDirectory: () => true },
          { name: 'lib2', isDirectory: () => true }
        ]);
      
      const monorepoInfo = await configManager.getMonorepoInfo();
      
      expect(monorepoInfo.isMonorepo).toBe(true);
      expect(monorepoInfo.structure).toBe('workspaces');
      expect(monorepoInfo.apps).toEqual([]);
      expect(monorepoInfo.packages).toEqual(['lib1', 'lib2']);
    });

    it('should detect Nx monorepo structure', async () => {
      mockFs.readJson.mockResolvedValue({ name: 'nx-workspace' });
      mockFs.pathExists.mockImplementation((path) => 
        path.includes('nx.json')
      );
      
      mockFs.readdir
        .mockResolvedValueOnce([
          { name: 'app1', isDirectory: () => true }
        ])
        .mockResolvedValueOnce([
          { name: 'lib1', isDirectory: () => true }
        ]);
      
      const monorepoInfo = await configManager.getMonorepoInfo();
      
      expect(monorepoInfo.isMonorepo).toBe(true);
      expect(monorepoInfo.structure).toBe('nx');
      expect(monorepoInfo.apps).toEqual(['app1']);
      expect(monorepoInfo.packages).toEqual(['lib1']);
    });

    it('should handle non-monorepo projects', async () => {
      mockFs.readJson.mockResolvedValue({ name: 'single-app' });
      mockFs.pathExists.mockResolvedValue(false);
      
      const monorepoInfo = await configManager.getMonorepoInfo();
      
      expect(monorepoInfo.isMonorepo).toBe(false);
      expect(monorepoInfo.structure).toBe(null);
      expect(monorepoInfo.apps).toEqual([]);
      expect(monorepoInfo.packages).toEqual([]);
    });

    it('should handle monorepo detection errors', async () => {
      mockFs.readJson.mockRejectedValue(new Error('File not found'));
      
      const monorepoInfo = await configManager.getMonorepoInfo();
      
      expect(monorepoInfo.isMonorepo).toBe(false);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Could not determine monorepo structure:', 
        expect.any(Error)
      );
    });
  });

  describe('Config Validation', () => {
    it('should validate config successfully', async () => {
      mockFs.pathExists.mockImplementation((path) => 
        path.includes('xaheen.config.json')
      );
      mockFs.readJson.mockResolvedValue(mockXaheenConfig);
      mockSchema.parse.mockReturnValue(mockXaheenConfig);
      
      const validation = await configManager.validateConfig();
      
      expect(validation.valid).toBe(true);
      expect(validation.errors).toEqual([]);
    });

    it('should handle validation errors from Zod', async () => {
      mockFs.pathExists.mockImplementation((path) => 
        path.includes('xaheen.config.json')
      );
      mockFs.readJson.mockResolvedValue(mockXaheenConfig);
      
      const zodError = new z.ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'number',
          path: ['project', 'name'],
          message: 'Expected string, received number'
        }
      ]);
      
      mockSchema.parse.mockImplementation(() => {
        throw zodError;
      });
      
      const validation = await configManager.validateConfig();
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toEqual([
        'project.name: Expected string, received number'
      ]);
    });

    it('should handle generic validation errors', async () => {
      mockFs.pathExists.mockImplementation((path) => 
        path.includes('xaheen.config.json')
      );
      mockFs.readJson.mockRejectedValue(new Error('Config load error'));
      
      const validation = await configManager.validateConfig();
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toEqual(['Config load error']);
    });
  });

  describe('Cache Management', () => {
    it('should clear cached config', async () => {
      mockFs.pathExists.mockImplementation((path) => 
        path.includes('xaheen.config.json')
      );
      mockFs.readJson.mockResolvedValue(mockXaheenConfig);
      
      // Load config to cache it
      await configManager.loadConfig();
      
      // Clear cache
      configManager.clearCache();
      
      // Load again - should read from file again
      await configManager.loadConfig();
      
      expect(mockFs.readJson).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error Handling', () => {
    it('should handle package.json read errors gracefully', async () => {
      mockFs.readJson.mockImplementation((path) => {
        if (path.includes('package.json')) {
          throw new Error('Package.json not found');
        }
        return {};
      });
      
      const config = await configManager.loadConfig();
      
      // Should use fallback values
      expect(config.project.name).toBe('my-app');
      expect(config.project.framework).toBe('nextjs');
      expect(config.project.packageManager).toBe('bun');
    });

    it('should handle directory reading errors in monorepo detection', async () => {
      mockFs.readJson.mockResolvedValue({ workspaces: ['apps/*'] });
      mockFs.pathExists.mockResolvedValue(true);
      mockFs.readdir.mockRejectedValue(new Error('Permission denied'));
      
      const monorepoInfo = await configManager.getMonorepoInfo();
      
      expect(monorepoInfo.apps).toEqual([]);
      expect(monorepoInfo.packages).toEqual([]);
    });
  });

  describe('Platform Inference', () => {
    it('should infer correct platform from framework', async () => {
      const frameworkPlatformMap = [
        ['nextjs', 'react'],
        ['react', 'react'],
        ['vue', 'vue'],
        ['angular', 'angular'],
        ['svelte', 'svelte'],
        ['unknown', 'react']
      ];

      for (const [framework, expectedPlatform] of frameworkPlatformMap) {
        mockFs.readJson.mockResolvedValue({
          name: 'test-app',
          dependencies: { [framework]: '^1.0.0' }
        });

        const config = await configManager.loadConfig();
        
        if (framework !== 'unknown') {
          expect(config.design.platform).toBe(expectedPlatform);
        }
        
        // Clear cache for next iteration
        configManager.clearCache();
      }
    });
  });
});