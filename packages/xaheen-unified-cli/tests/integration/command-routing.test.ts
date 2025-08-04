import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UnifiedCommandParser } from '../../src/core/command-parser/index.js';
import { UnifiedServiceRegistry } from '../../src/core/registry/UnifiedServiceRegistry.js';
import { UnifiedConfigManager } from '../../src/core/config-manager/index.js';

// Mock external dependencies
vi.mock('fs-extra');
vi.mock('glob');
vi.mock('@clack/prompts');

describe('Command Routing Integration', () => {
  let parser: UnifiedCommandParser;
  let registry: UnifiedServiceRegistry;
  let configManager: UnifiedConfigManager;

  beforeEach(async () => {
    // Initialize core systems
    registry = new UnifiedServiceRegistry({
      xaheenTemplatesPath: './mock-templates/xaheen',
      xalaTemplatesPath: './mock-templates/xala'
    });
    
    configManager = new UnifiedConfigManager('./mock-project');
    parser = new UnifiedCommandParser();

    // Set up global context
    global.__xaheen_cli = {
      configManager,
      registry,
      commandParser: parser
    };

    // Mock registry initialization
    vi.spyOn(registry, 'initialize').mockResolvedValue(undefined);
  });

  describe('Unified Command Structure', () => {
    it('should parse project create command correctly', () => {
      const routes = parser.getRoutes();
      const createRoute = Array.from(routes.values()).find(
        route => route.domain === 'project' && route.action === 'create'
      );
      
      expect(createRoute).toBeDefined();
      expect(createRoute?.pattern).toBe('project create <name>');
    });

    it('should parse service add command correctly', () => {
      const routes = parser.getRoutes();
      const addRoute = Array.from(routes.values()).find(
        route => route.domain === 'service' && route.action === 'add'
      );
      
      expect(addRoute).toBeDefined();
      expect(addRoute?.pattern).toBe('service add <service>');
    });

    it('should parse component generate command correctly', () => {
      const routes = parser.getRoutes();
      const generateRoute = Array.from(routes.values()).find(
        route => route.domain === 'component' && route.action === 'generate'
      );
      
      expect(generateRoute).toBeDefined();
      expect(generateRoute?.pattern).toBe('component generate <description>');
    });
  });

  describe('Legacy Command Support', () => {
    it('should support xaheen-cli legacy commands', () => {
      const routes = parser.getRoutes();
      
      // Check if legacy mapping exists
      const projectCreateRoute = Array.from(routes.values()).find(
        route => route.domain === 'project' && route.action === 'create'
      );
      
      expect(projectCreateRoute?.legacy?.xaheen).toContain('create');
    });

    it('should support xala-cli legacy commands', () => {
      const routes = parser.getRoutes();
      
      const projectCreateRoute = Array.from(routes.values()).find(
        route => route.domain === 'project' && route.action === 'create'
      );
      
      expect(projectCreateRoute?.legacy?.xala).toContain('init');
    });
  });

  describe('Platform-Specific Commands', () => {
    it('should support monorepo app templates', async () => {
      await registry.initialize();
      
      const webApps = registry.getAppTemplatesByPlatform('web');
      const desktopApps = registry.getAppTemplatesByPlatform('desktop');
      const mobileApps = registry.getAppTemplatesByPlatform('mobile');
      
      expect(webApps.length).toBeGreaterThan(0);
      expect(desktopApps.length).toBeGreaterThan(0);
      expect(mobileApps.length).toBeGreaterThan(0);
    });

    it('should provide platform enumeration', async () => {
      await registry.initialize();
      
      const platforms = registry.getAvailablePlatforms();
      expect(platforms).toContain('web');
      expect(platforms).toContain('desktop');
      expect(platforms).toContain('mobile');
      expect(platforms).toContain('server');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing command arguments', async () => {
      const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('Process exit called');
      });

      try {
        await parser.parse(['node', 'cli', 'project', 'create']);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toContain('Process exit called');
      }

      mockExit.mockRestore();
    });
  });
});