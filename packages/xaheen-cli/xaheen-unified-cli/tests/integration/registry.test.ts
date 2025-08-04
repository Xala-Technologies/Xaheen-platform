import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UnifiedServiceRegistry } from '../../src/core/registry/UnifiedServiceRegistry.js';
import * as fs from 'fs-extra';
import { glob } from 'glob';

// Mock dependencies
vi.mock('fs-extra');
vi.mock('glob');

describe('Unified Service Registry Integration', () => {
  let registry: UnifiedServiceRegistry;

  beforeEach(() => {
    registry = new UnifiedServiceRegistry({
      xaheenTemplatesPath: './mock-templates/xaheen',
      xalaTemplatesPath: './mock-templates/xala'
    });
    vi.clearAllMocks();
  });

  describe('Registry Initialization', () => {
    it('should initialize with predefined app templates', async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(false); // No template paths exist
      
      await registry.initialize();
      
      const stats = registry.getRegistryStats();
      
      // Should have predefined app templates
      expect(stats.apps).toBeGreaterThan(0);
      expect(stats.platforms).toContain('web');
      expect(stats.platforms).toContain('desktop');
      expect(stats.platforms).toContain('mobile');
      expect(stats.platforms).toContain('server');
    });

    it('should load service templates from xaheen-cli', async () => {
      // Mock xaheen templates path exists
      vi.mocked(fs.pathExists).mockImplementation((path: string) => {
        return Promise.resolve(path.includes('xaheen'));
      });

      vi.mocked(fs.readdir).mockImplementation((path: string, options?: any) => {
        if (path.includes('xaheen')) {
          return Promise.resolve([
            { name: 'auth', isDirectory: () => true },
            { name: 'database', isDirectory: () => true }
          ] as any);
        }
        return Promise.resolve([]);
      });

      vi.mocked(fs.readJson).mockImplementation((path: string) => {
        if (path.includes('template.json')) {
          return Promise.resolve({
            name: 'Authentication Service',
            description: 'User authentication and authorization',
            provider: 'clerk',
            version: '5.0.0'
          });
        }
        return Promise.resolve({});
      });

      vi.mocked(glob).mockResolvedValue(['files/auth.ts']);
      vi.mocked(fs.stat).mockResolvedValue({ isFile: () => true } as any);
      vi.mocked(fs.readFile).mockResolvedValue('// Auth service template');

      await registry.initialize();
      
      const authTemplate = registry.getServiceTemplate('auth');
      expect(authTemplate).toBeDefined();
      expect(authTemplate?.name).toBe('Authentication Service');
    });

    it('should load component templates from xala-cli', async () => {
      // Mock xala templates path exists
      vi.mocked(fs.pathExists).mockImplementation((path: string) => {
        return Promise.resolve(path.includes('xala'));
      });

      vi.mocked(fs.readdir).mockImplementation((path: string, options?: any) => {
        if (path.includes('xala')) {
          return Promise.resolve([
            { name: 'react', isDirectory: () => true },
            { name: 'vue', isDirectory: () => true }
          ] as any);
        }
        if (path.includes('components')) {
          return Promise.resolve(['button.hbs', 'card.hbs']);
        }
        return Promise.resolve([]);
      });

      vi.mocked(fs.readFile).mockImplementation((path: string) => {
        if (path.includes('button.hbs')) {
          return Promise.resolve(`
{{!-- @meta
@name Button Component
@description Interactive button component
@category ui
@prop {string} label - Button text
@prop {function} onClick - Click handler
--}}
<button onClick={{onClick}}>{{label}}</button>
          `);
        }
        return Promise.resolve('');
      });

      await registry.initialize();
      
      const buttonTemplate = registry.getComponentTemplate('react-button');
      expect(buttonTemplate).toBeDefined();
      expect(buttonTemplate?.props).toEqual([
        {
          name: 'label',
          type: 'string',
          required: true,
          description: 'Button text'
        },
        {
          name: 'onClick',
          type: 'function',
          required: true,
          description: 'Click handler'
        }
      ]);
    });
  });

  describe('Template Retrieval', () => {
    beforeEach(async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(false);
      await registry.initialize();
    });

    it('should get app templates by platform', () => {
      const webApps = registry.getAppTemplatesByPlatform('web');
      const desktopApps = registry.getAppTemplatesByPlatform('desktop');
      const mobileApps = registry.getAppTemplatesByPlatform('mobile');
      
      expect(webApps.length).toBeGreaterThan(0);
      expect(desktopApps.length).toBeGreaterThan(0);
      expect(mobileApps.length).toBeGreaterThan(0);
      
      // Verify platform consistency
      webApps.forEach(app => expect(app.platform).toBe('web'));
      desktopApps.forEach(app => expect(app.platform).toBe('desktop'));
      mobileApps.forEach(app => expect(app.platform).toBe('mobile'));
    });

    it('should get specific app templates', () => {
      const nextjsApp = registry.getAppTemplate('web-nextjs');
      const electronApp = registry.getAppTemplate('desktop-electron');
      const reactNativeApp = registry.getAppTemplate('mobile-react-native');
      
      expect(nextjsApp).toBeDefined();
      expect(nextjsApp?.framework).toBe('nextjs');
      expect(nextjsApp?.platform).toBe('web');
      
      expect(electronApp).toBeDefined();
      expect(electronApp?.framework).toBe('electron');
      expect(electronApp?.platform).toBe('desktop');
      
      expect(reactNativeApp).toBeDefined();
      expect(reactNativeApp?.framework).toBe('react-native');
      expect(reactNativeApp?.platform).toBe('mobile');
    });

    it('should verify app template files include UI system dependency', () => {
      const nextjsApp = registry.getAppTemplate('web-nextjs');
      
      expect(nextjsApp?.dependencies).toContain('@xala-technologies/ui-system');
      
      // Check if package.json template includes ui-system
      const packageJsonFile = nextjsApp?.files.find(f => f.path === 'package.json');
      expect(packageJsonFile).toBeDefined();
      expect(packageJsonFile?.content).toContain('@xala-technologies/ui-system');
    });
  });

  describe('Search Functionality', () => {
    beforeEach(async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(false);
      await registry.initialize();
    });

    it('should search across all template types', () => {
      const results = registry.searchTemplates('react');
      
      expect(results.apps.length).toBeGreaterThan(0);
      expect(results.apps.some(app => app.framework === 'react')).toBe(true);
      expect(results.apps.some(app => app.framework === 'react-native')).toBe(true);
    });

    it('should search by platform', () => {
      const results = registry.searchTemplates('desktop');
      
      expect(results.apps.length).toBeGreaterThan(0);
      results.apps.forEach(app => {
        expect(app.platform).toBe('desktop');
      });
    });

    it('should search by framework', () => {
      const results = registry.searchTemplates('electron');
      
      expect(results.apps.length).toBeGreaterThan(0);
      results.apps.forEach(app => {
        expect(app.framework).toBe('electron');
      });
    });
  });

  describe('Registry Stats', () => {
    beforeEach(async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(false);
      await registry.initialize();
    });

    it('should provide comprehensive stats', () => {
      const stats = registry.getRegistryStats();
      
      expect(stats).toHaveProperty('services');
      expect(stats).toHaveProperty('components');
      expect(stats).toHaveProperty('apps');
      expect(stats).toHaveProperty('platforms');
      expect(stats).toHaveProperty('frameworks');
      
      expect(stats.platforms).toEqual(
        expect.arrayContaining(['web', 'desktop', 'mobile', 'server'])
      );
      
      expect(stats.frameworks).toEqual(
        expect.arrayContaining(['nextjs', 'electron', 'react-native', 'nestjs'])
      );
    });

    it('should track available platforms correctly', () => {
      const platforms = registry.getAvailablePlatforms();
      
      expect(platforms).toContain('web');
      expect(platforms).toContain('desktop');
      expect(platforms).toContain('mobile');
      expect(platforms).toContain('server');
    });
  });

  describe('Monorepo Support', () => {
    beforeEach(async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(false);
      await registry.initialize();
    });

    it('should verify apps target apps directory', () => {
      const allApps = registry.getAllAppTemplates();
      
      allApps.forEach(app => {
        expect(app.targetPath).toBe('apps');
      });
    });

    it('should support adding apps to existing monorepo', () => {
      expect(registry.canAddAppToMonorepo('web-nextjs')).toBe(true);
      expect(registry.canAddAppToMonorepo('desktop-electron')).toBe(true);
      expect(registry.canAddAppToMonorepo('mobile-react-native')).toBe(true);
      expect(registry.canAddAppToMonorepo('nonexistent-app')).toBe(false);
    });
  });

  describe('Template File Processing', () => {
    beforeEach(async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(false);
      await registry.initialize();
    });

    it('should handle template variables in app files', () => {
      const nextjsApp = registry.getAppTemplate('web-nextjs');
      
      expect(nextjsApp).toBeDefined();
      
      const pageFile = nextjsApp?.files.find(f => f.path === 'src/app/page.tsx');
      expect(pageFile).toBeDefined();
      expect(pageFile?.isTemplate).toBe(true);
      expect(pageFile?.content).toContain('{{appName}}');
    });

    it('should identify non-template files correctly', () => {
      const nextjsApp = registry.getAppTemplate('web-nextjs');
      
      const configFile = nextjsApp?.files.find(f => f.path === 'next.config.mjs');
      expect(configFile).toBeDefined();
      expect(configFile?.isTemplate).toBe(false);
    });
  });
});