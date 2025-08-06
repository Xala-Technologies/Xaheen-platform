/**
 * Comprehensive Tests for Component Domain Handler
 * 
 * Tests all component-related functionality including generation, creation,
 * building, and platform-specific template handling.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ComponentDomain from './index';
import type { CLICommand } from '../../types/index';
import { CLIError } from '../../types/index';

// Mock all external dependencies
vi.mock('chalk', () => ({
  default: {
    cyan: vi.fn(str => str),
    green: vi.fn(str => str),
    yellow: vi.fn(str => str)
  }
}));

vi.mock('../../types/index', () => ({
  CLIError: class CLIError extends Error {
    constructor(
      message: string,
      public code: string,
      public domain?: string,
      public action?: string
    ) {
      super(message);
      this.name = 'CLIError';
    }
  }
}));

vi.mock('../../utils/logger', () => ({
  cliLogger: {
    info: vi.fn(),
    ai: vi.fn(),
    warn: vi.fn(),
    success: vi.fn(),
    step: vi.fn(),
    error: vi.fn()
  }
}));

describe('ComponentDomain', () => {
  let componentDomain: ComponentDomain;
  let mockLogger: any;
  let mockConfigManager: any;
  let mockRegistry: any;
  let mockConsoleLog: any;

  const mockGlobal = {
    __xaheen_cli: {
      configManager: {
        loadConfig: vi.fn(),
        getMonorepoInfo: vi.fn()
      },
      registry: {
        getComponentTemplatesByPlatform: vi.fn()
      }
    }
  };

  const mockConfig = {
    design: {
      platform: 'react'
    },
    project: {
      name: 'test-project',
      framework: 'nextjs'
    }
  };

  const mockTemplates = [
    {
      id: 'button',
      description: 'Interactive button component',
      platform: 'react'
    },
    {
      id: 'card',
      description: 'Flexible card component',
      platform: 'react'
    },
    {
      id: 'modal',
      description: 'Accessible modal dialog',
      platform: 'react'
    }
  ];

  const mockMonorepoInfo = {
    isMonorepo: true,
    apps: ['web', 'mobile', 'admin'],
    packages: ['ui', 'shared']
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup mocks
    mockLogger = vi.mocked(require('../../utils/logger')).cliLogger;
    mockConsoleLog = vi.fn();
    console.log = mockConsoleLog;
    
    // Setup global mock
    global.__xaheen_cli = mockGlobal.__xaheen_cli as any;
    mockConfigManager = mockGlobal.__xaheen_cli.configManager;
    mockRegistry = mockGlobal.__xaheen_cli.registry;
    
    // Default mock implementations
    mockConfigManager.loadConfig.mockResolvedValue(mockConfig);
    mockConfigManager.getMonorepoInfo.mockResolvedValue(mockMonorepoInfo);
    mockRegistry.getComponentTemplatesByPlatform.mockReturnValue(mockTemplates);
    
    componentDomain = new ComponentDomain();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Component Generation', () => {
    const generateCommand: CLICommand = {
      domain: 'component',
      action: 'generate',
      target: 'Create a responsive login form with validation',
      arguments: { target: 'Create a responsive login form with validation' },
      options: {}
    };

    it('should start AI component generation', async () => {
      await componentDomain.generate(generateCommand);

      expect(mockLogger.ai).toHaveBeenCalledWith(
        'Generating component from description: "Create a responsive login form with validation"'
      );
      expect(mockLogger.info).toHaveBeenCalledWith('AI component generation coming soon...');
      expect(mockLogger.info).toHaveBeenCalledWith('For now, use: xaheen component create <name>');
    });

    it('should throw error if description is missing', async () => {
      const command = { ...generateCommand, target: undefined };

      await expect(componentDomain.generate(command)).rejects.toThrow(CLIError);
      await expect(componentDomain.generate(command)).rejects.toThrow('Component description is required');
    });

    it('should throw error if description is empty string', async () => {
      const command = { ...generateCommand, target: '' };

      await expect(componentDomain.generate(command)).rejects.toThrow(CLIError);
      await expect(componentDomain.generate(command)).rejects.toThrow('Component description is required');
    });

    it('should have correct error code and domain info', async () => {
      const command = { ...generateCommand, target: undefined };

      try {
        await componentDomain.generate(command);
      } catch (error) {
        expect(error).toBeInstanceOf(CLIError);
        expect((error as CLIError).code).toBe('MISSING_DESCRIPTION');
        expect((error as CLIError).domain).toBe('component');
        expect((error as CLIError).action).toBe('generate');
      }
    });

    it('should handle generation errors gracefully', async () => {
      // Mock an error during generation
      const originalInfo = mockLogger.info;
      mockLogger.info.mockImplementation(() => {
        throw new Error('AI service unavailable');
      });

      await expect(componentDomain.generate(generateCommand)).rejects.toThrow(CLIError);
      await expect(componentDomain.generate(generateCommand)).rejects.toThrow('Failed to generate component');

      // Restore original mock
      mockLogger.info = originalInfo;
    });

    it('should handle various description formats', async () => {
      const descriptions = [
        'Simple button',
        'Create a complex data table with sorting, filtering, and pagination',
        'Navigation menu with dropdown support and accessibility features',
        'Form with multiple input types and validation'
      ];

      for (const description of descriptions) {
        const command = { ...generateCommand, target: description };
        await componentDomain.generate(command);

        expect(mockLogger.ai).toHaveBeenCalledWith(
          `Generating component from description: "${description}"`
        );
      }
    });
  });

  describe('Component Creation', () => {
    const createCommand: CLICommand = {
      domain: 'component',
      action: 'create',
      target: 'Button',
      arguments: { target: 'Button' },
      options: {}
    };

    it('should create component successfully', async () => {
      await componentDomain.create(createCommand);

      expect(mockLogger.info).toHaveBeenCalledWith('Creating component: Button');
      expect(mockConfigManager.loadConfig).toHaveBeenCalled();
      expect(mockRegistry.getComponentTemplatesByPlatform).toHaveBeenCalledWith('react');
      expect(mockLogger.info).toHaveBeenCalledWith('Available templates for react:');
    });

    it('should display available templates', async () => {
      await componentDomain.create(createCommand);

      expect(mockConsoleLog).toHaveBeenCalledWith('  button - Interactive button component');
      expect(mockConsoleLog).toHaveBeenCalledWith('  card - Flexible card component');
      expect(mockConsoleLog).toHaveBeenCalledWith('  modal - Accessible modal dialog');
    });

    it('should throw error if component name is missing', async () => {
      const command = { ...createCommand, target: undefined };

      await expect(componentDomain.create(command)).rejects.toThrow(CLIError);
      await expect(componentDomain.create(command)).rejects.toThrow('Component name is required');
    });

    it('should handle different platforms', async () => {
      const platforms = ['react', 'vue', 'angular', 'svelte'];

      for (const platform of platforms) {
        const config = { design: { platform }, project: { name: 'test' } };
        mockConfigManager.loadConfig.mockResolvedValueOnce(config);
        
        const templates = [
          { id: `${platform}-button`, description: `${platform} button`, platform }
        ];
        mockRegistry.getComponentTemplatesByPlatform.mockReturnValueOnce(templates);

        await componentDomain.create(createCommand);

        expect(mockRegistry.getComponentTemplatesByPlatform).toHaveBeenCalledWith(platform);
        expect(mockLogger.info).toHaveBeenCalledWith(`Available templates for ${platform}:`);
      }
    });

    it('should default to react platform when not configured', async () => {
      const configWithoutPlatform = {
        project: { name: 'test' }
        // No design.platform specified
      };
      mockConfigManager.loadConfig.mockResolvedValue(configWithoutPlatform);

      await componentDomain.create(createCommand);

      expect(mockRegistry.getComponentTemplatesByPlatform).toHaveBeenCalledWith('react');
    });

    it('should warn when no templates are available', async () => {
      mockRegistry.getComponentTemplatesByPlatform.mockReturnValue([]);

      await componentDomain.create(createCommand);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'No component templates found for platform: react'
      );
      expect(mockConsoleLog).not.toHaveBeenCalled();
    });

    it('should handle config loading errors', async () => {
      mockConfigManager.loadConfig.mockRejectedValue(new Error('Config not found'));

      await expect(componentDomain.create(createCommand)).rejects.toThrow(CLIError);
      await expect(componentDomain.create(createCommand)).rejects.toThrow('Failed to create component');
    });

    it('should handle registry errors', async () => {
      mockRegistry.getComponentTemplatesByPlatform.mockImplementation(() => {
        throw new Error('Registry unavailable');
      });

      await expect(componentDomain.create(createCommand)).rejects.toThrow(CLIError);
      await expect(componentDomain.create(createCommand)).rejects.toThrow('Failed to create component');
    });

    it('should validate component names', async () => {
      const componentNames = ['Button', 'NavBar', 'DataTable', 'user-profile', 'modal_dialog'];

      for (const name of componentNames) {
        const command = { ...createCommand, target: name };
        await componentDomain.create(command);

        expect(mockLogger.info).toHaveBeenCalledWith(`Creating component: ${name}`);
      }
    });
  });

  describe('Component Building', () => {
    const buildCommand: CLICommand = {
      domain: 'component',
      action: 'build',
      arguments: {},
      options: {}
    };

    it('should build components in monorepo', async () => {
      await componentDomain.build(buildCommand);

      expect(mockLogger.info).toHaveBeenCalledWith('Building multi-platform components...');
      expect(mockConfigManager.loadConfig).toHaveBeenCalled();
      expect(mockConfigManager.getMonorepoInfo).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith('Building 3 apps...');
      expect(mockLogger.success).toHaveBeenCalledWith('Build completed!');
    });

    it('should build each app with progress steps', async () => {
      await componentDomain.build(buildCommand);

      expect(mockLogger.step).toHaveBeenCalledWith(1, 3, 'Building web');
      expect(mockLogger.step).toHaveBeenCalledWith(2, 3, 'Building mobile');
      expect(mockLogger.step).toHaveBeenCalledWith(3, 3, 'Building admin');
    });

    it('should handle non-monorepo projects', async () => {
      const singleAppInfo = {
        isMonorepo: false,
        apps: [],
        packages: []
      };
      mockConfigManager.getMonorepoInfo.mockResolvedValue(singleAppInfo);

      await componentDomain.build(buildCommand);

      expect(mockLogger.info).toHaveBeenCalledWith('Building multi-platform components...');
      expect(mockLogger.info).not.toHaveBeenCalledWith(expect.stringContaining('apps...'));
      expect(mockLogger.step).not.toHaveBeenCalled();
      expect(mockLogger.success).toHaveBeenCalledWith('Build completed!');
    });

    it('should handle empty monorepo', async () => {
      const emptyMonorepoInfo = {
        isMonorepo: true,
        apps: [],
        packages: []
      };
      mockConfigManager.getMonorepoInfo.mockResolvedValue(emptyMonorepoInfo);

      await componentDomain.build(buildCommand);

      expect(mockLogger.info).toHaveBeenCalledWith('Building 0 apps...');
      expect(mockLogger.step).not.toHaveBeenCalled();
      expect(mockLogger.success).toHaveBeenCalledWith('Build completed!');
    });

    it('should handle large monorepos', async () => {
      const largeMonorepoInfo = {
        isMonorepo: true,
        apps: Array.from({ length: 10 }, (_, i) => `app-${i + 1}`),
        packages: Array.from({ length: 5 }, (_, i) => `package-${i + 1}`)
      };
      mockConfigManager.getMonorepoInfo.mockResolvedValue(largeMonorepoInfo);

      await componentDomain.build(buildCommand);

      expect(mockLogger.info).toHaveBeenCalledWith('Building 10 apps...');
      expect(mockLogger.step).toHaveBeenCalledTimes(10);
      
      // Check first and last step calls
      expect(mockLogger.step).toHaveBeenCalledWith(1, 10, 'Building app-1');
      expect(mockLogger.step).toHaveBeenCalledWith(10, 10, 'Building app-10');
    });

    it('should handle config loading errors during build', async () => {
      mockConfigManager.loadConfig.mockRejectedValue(new Error('Config error'));

      await expect(componentDomain.build(buildCommand)).rejects.toThrow(CLIError);
      await expect(componentDomain.build(buildCommand)).rejects.toThrow('Build failed');
    });

    it('should handle monorepo info errors during build', async () => {
      mockConfigManager.getMonorepoInfo.mockRejectedValue(new Error('Monorepo info error'));

      await expect(componentDomain.build(buildCommand)).rejects.toThrow(CLIError);
      await expect(componentDomain.build(buildCommand)).rejects.toThrow('Build failed');
    });

    it('should have correct error code for build failures', async () => {
      mockConfigManager.loadConfig.mockRejectedValue(new Error('Build error'));

      try {
        await componentDomain.build(buildCommand);
      } catch (error) {
        expect(error).toBeInstanceOf(CLIError);
        expect((error as CLIError).code).toBe('BUILD_FAILED');
        expect((error as CLIError).domain).toBe('component');
        expect((error as CLIError).action).toBe('build');
      }
    });
  });

  describe('Global Context Access', () => {
    it('should access config manager from global context', async () => {
      const command: CLICommand = {
        domain: 'component',
        action: 'create',
        target: 'Button',
        arguments: {},
        options: {}
      };

      await componentDomain.create(command);

      expect(mockConfigManager.loadConfig).toHaveBeenCalled();
    });

    it('should access registry from global context', async () => {
      const command: CLICommand = {
        domain: 'component',
        action: 'create',
        target: 'Button',
        arguments: {},
        options: {}
      };

      await componentDomain.create(command);

      expect(mockRegistry.getComponentTemplatesByPlatform).toHaveBeenCalled();
    });

    it('should handle missing global context gracefully', async () => {
      // Temporarily remove global context
      const originalGlobal = global.__xaheen_cli;
      delete (global as any).__xaheen_cli;

      const command: CLICommand = {
        domain: 'component',
        action: 'create',
        target: 'Button',
        arguments: {},
        options: {}
      };

      await expect(componentDomain.create(command)).rejects.toThrow();

      // Restore global context
      global.__xaheen_cli = originalGlobal;
    });
  });

  describe('Error Code Coverage', () => {
    it('should have consistent error codes for all actions', async () => {
      const testCases = [
        {
          action: 'generate',
          command: { domain: 'component', action: 'generate', target: undefined, arguments: {}, options: {} },
          expectedCode: 'MISSING_DESCRIPTION'
        },
        {
          action: 'create', 
          command: { domain: 'component', action: 'create', target: undefined, arguments: {}, options: {} },
          expectedCode: 'MISSING_COMPONENT_NAME'
        }
      ];

      for (const testCase of testCases) {
        try {
          await componentDomain[testCase.action](testCase.command);
        } catch (error) {
          expect(error).toBeInstanceOf(CLIError);
          expect((error as CLIError).code).toBe(testCase.expectedCode);
          expect((error as CLIError).domain).toBe('component');
          expect((error as CLIError).action).toBe(testCase.action);
        }
      }
    });
  });

  describe('Platform-Specific Template Handling', () => {
    it('should handle templates with no results', async () => {
      const platforms = ['react', 'vue', 'angular', 'svelte'];

      for (const platform of platforms) {
        const config = { design: { platform }, project: { name: 'test' } };
        mockConfigManager.loadConfig.mockResolvedValueOnce(config);
        mockRegistry.getComponentTemplatesByPlatform.mockReturnValueOnce([]);

        const command: CLICommand = {
          domain: 'component',
          action: 'create',
          target: 'Button',
          arguments: {},
          options: {}
        };

        await componentDomain.create(command);

        expect(mockLogger.warn).toHaveBeenCalledWith(
          `No component templates found for platform: ${platform}`
        );
      }
    });

    it('should handle templates with different structures', async () => {
      const complexTemplates = [
        {
          id: 'advanced-button',
          description: 'Advanced button with multiple variants',
          platform: 'react',
          category: 'interactive',
          complexity: 'high'
        },
        {
          id: 'simple-card',
          description: 'Basic card component',
          platform: 'react',
          category: 'layout',
          complexity: 'low'
        }
      ];

      mockRegistry.getComponentTemplatesByPlatform.mockReturnValue(complexTemplates);

      const command: CLICommand = {
        domain: 'component',
        action: 'create',
        target: 'TestComponent',
        arguments: {},
        options: {}
      };

      await componentDomain.create(command);

      expect(mockConsoleLog).toHaveBeenCalledWith('  advanced-button - Advanced button with multiple variants');
      expect(mockConsoleLog).toHaveBeenCalledWith('  simple-card - Basic card component');
    });
  });

  describe('Build Process Edge Cases', () => {
    it('should handle apps with special characters in names', async () => {
      const specialAppsInfo = {
        isMonorepo: true,
        apps: ['web-app', 'mobile_app', 'admin.panel', 'api-gateway'],
        packages: []
      };
      mockConfigManager.getMonorepoInfo.mockResolvedValue(specialAppsInfo);

      const command: CLICommand = {
        domain: 'component',
        action: 'build',
        arguments: {},
        options: {}
      };

      await componentDomain.build(command);

      expect(mockLogger.step).toHaveBeenCalledWith(1, 4, 'Building web-app');
      expect(mockLogger.step).toHaveBeenCalledWith(2, 4, 'Building mobile_app');
      expect(mockLogger.step).toHaveBeenCalledWith(3, 4, 'Building admin.panel');
      expect(mockLogger.step).toHaveBeenCalledWith(4, 4, 'Building api-gateway');
    });

    it('should maintain correct step counting even with errors', async () => {
      // Mock an error during step execution
      const apps = ['app1', 'app2', 'app3'];
      const appsInfo = {
        isMonorepo: true,
        apps,
        packages: []
      };
      mockConfigManager.getMonorepoInfo.mockResolvedValue(appsInfo);

      const command: CLICommand = {
        domain: 'component',
        action: 'build',
        arguments: {},
        options: {}
      };

      await componentDomain.build(command);

      // Should still call all steps even if individual steps might fail
      expect(mockLogger.step).toHaveBeenCalledTimes(3);
      expect(mockLogger.step).toHaveBeenCalledWith(1, 3, 'Building app1');
      expect(mockLogger.step).toHaveBeenCalledWith(2, 3, 'Building app2');
      expect(mockLogger.step).toHaveBeenCalledWith(3, 3, 'Building app3');
    });
  });
});