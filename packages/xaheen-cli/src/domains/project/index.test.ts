/**
 * Comprehensive Tests for Project Domain Handler
 * 
 * Tests all project-related functionality including creation, validation,
 * configuration management, and monorepo structure handling.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ProjectDomain from './index';
import type { CLICommand, UnifiedConfig } from '../../types/index';
import { CLIError } from '../../types/index';

// Mock all external dependencies
vi.mock('@clack/prompts', () => ({
  group: vi.fn()
}));

vi.mock('chalk', () => ({
  default: {
    bold: {
      green: vi.fn(str => str),
      white: vi.fn(str => str)
    },
    cyan: vi.fn(str => str),
    green: vi.fn(str => str),
    yellow: vi.fn(str => str)
  }
}));

vi.mock('fs-extra', () => ({
  pathExists: vi.fn(),
  ensureDir: vi.fn(),
  writeJson: vi.fn(),
  writeFile: vi.fn(),
  readJson: vi.fn()
}));

vi.mock('path', () => ({
  resolve: vi.fn((...paths) => paths.join('/')),
  join: vi.fn((...paths) => paths.join('/'))
}));

vi.mock('../../services/registry/app-template-registry', () => ({
  appTemplateRegistry: {
    generateAppFromTemplate: vi.fn().mockResolvedValue(undefined)
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
    success: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    step: vi.fn()
  }
}));

describe('ProjectDomain', () => {
  let projectDomain: ProjectDomain;
  let mockFs: any;
  let mockPrompts: any;
  let mockLogger: any;
  let mockConfigManager: any;
  let mockRegistry: any;
  let mockAppTemplateRegistry: any;
  let mockConsoleLog: any;

  const mockGlobal = {
    __xaheen_cli: {
      configManager: {
        clearCache: vi.fn(),
        saveConfig: vi.fn(),
        validateConfig: vi.fn(),
        loadConfig: vi.fn(),
        getMonorepoInfo: vi.fn()
      },
      registry: {
        getServiceTemplate: vi.fn()
      }
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup mocks
    mockFs = vi.mocked(require('fs-extra'));
    mockPrompts = vi.mocked(require('@clack/prompts'));
    mockLogger = vi.mocked(require('../../utils/logger')).cliLogger;
    mockAppTemplateRegistry = vi.mocked(require('../../services/registry/app-template-registry')).appTemplateRegistry;
    mockConsoleLog = vi.fn();
    console.log = mockConsoleLog;
    
    // Setup global mock
    global.__xaheen_cli = mockGlobal.__xaheen_cli as any;
    mockConfigManager = mockGlobal.__xaheen_cli.configManager;
    mockRegistry = mockGlobal.__xaheen_cli.registry;
    
    // Default mock implementations
    mockFs.pathExists.mockResolvedValue(false); // Default: paths don't exist
    mockFs.ensureDir.mockResolvedValue(undefined);
    mockFs.writeJson.mockResolvedValue(undefined);
    mockFs.writeFile.mockResolvedValue(undefined);
    mockConfigManager.validateConfig.mockResolvedValue({ valid: true, errors: [] });
    mockConfigManager.loadConfig.mockResolvedValue({
      project: { name: 'test-project', framework: 'nextjs', packageManager: 'bun' },
      services: {}
    });
    mockConfigManager.getMonorepoInfo.mockResolvedValue({
      isMonorepo: true,
      structure: 'standard',
      apps: ['web'],
      packages: []
    });
    
    // Mock process methods
    vi.spyOn(process, 'cwd').mockReturnValue('/current/dir');
    vi.spyOn(process, 'chdir').mockImplementation(() => undefined);
    
    projectDomain = new ProjectDomain();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Project Creation', () => {
    const baseCommand: CLICommand = {
      domain: 'project',
      action: 'create',
      target: 'test-project',
      arguments: { target: 'test-project' },
      options: {}
    };

    it('should create project with CLI options', async () => {
      const command = {
        ...baseCommand,
        options: {
          framework: 'nextjs',
          platform: 'react',
          packageManager: 'bun',
          theme: 'enterprise',
          norwegian: true,
          gdpr: true
        }
      };

      await projectDomain.create(command);

      expect(mockLogger.info).toHaveBeenCalledWith('Creating new project: test-project');
      expect(mockFs.ensureDir).toHaveBeenCalledWith('test-project/apps');
      expect(mockFs.ensureDir).toHaveBeenCalledWith('test-project/packages');
      expect(mockFs.ensureDir).toHaveBeenCalledWith('test-project/apps/web');
      
      expect(mockFs.writeJson).toHaveBeenCalledWith(
        'test-project/package.json',
        expect.objectContaining({
          name: 'test-project',
          private: true,
          workspaces: ['apps/*', 'packages/*']
        }),
        { spaces: 2 }
      );
      
      expect(mockConfigManager.saveConfig).toHaveBeenCalledWith(
        expect.objectContaining({
          version: '3.0.0',
          project: {
            name: 'test-project',
            framework: 'nextjs',
            packageManager: 'bun'
          },
          compliance: {
            accessibility: 'AAA',
            norwegian: true,
            gdpr: true
          }
        })
      );
      
      expect(mockLogger.success).toHaveBeenCalledWith(
        'Project "test-project" created successfully!'
      );
    });

    it('should create project with interactive prompts', async () => {
      mockPrompts.group.mockResolvedValue({
        framework: 'nextjs',
        packageManager: 'pnpm',
        bundle: 'saas-starter',
        norwegian: false,
        gdpr: true
      });

      await projectDomain.create(baseCommand);

      expect(mockPrompts.group).toHaveBeenCalledWith({
        framework: expect.objectContaining({
          type: 'select',
          message: 'Choose your framework:',
          options: expect.arrayContaining([
            { value: 'nextjs', label: 'Next.js (Recommended)' },
            { value: 'react', label: 'React with Vite' },
            { value: 'vue', label: 'Vue.js' },
            { value: 'angular', label: 'Angular' },
            { value: 'svelte', label: 'SvelteKit' }
          ])
        }),
        packageManager: expect.objectContaining({
          type: 'select',
          options: expect.arrayContaining([
            { value: 'bun', label: 'Bun (Recommended)' },
            { value: 'pnpm', label: 'pnpm' },
            { value: 'yarn', label: 'Yarn' },
            { value: 'npm', label: 'npm' }
          ])
        }),
        bundle: expect.objectContaining({
          type: 'select',
          options: expect.arrayContaining([
            { value: '', label: 'None (manual setup)' },
            { value: 'saas-starter', label: 'SaaS Starter (Auth, DB, Payments)' },
            { value: 'e-commerce', label: 'E-commerce (Products, Cart, Orders)' },
            { value: 'cms', label: 'CMS (Content, Media, Admin)' },
            { value: 'dashboard', label: 'Analytics Dashboard' }
          ])
        }),
        norwegian: expect.objectContaining({
          type: 'confirm',
          message: 'Enable Norwegian compliance features?'
        }),
        gdpr: expect.objectContaining({
          type: 'confirm',
          message: 'Enable GDPR compliance features?'
        })
      });
    });

    it('should throw error if project name is missing', async () => {
      const command = { ...baseCommand, target: undefined };

      await expect(projectDomain.create(command)).rejects.toThrow(CLIError);
      await expect(projectDomain.create(command)).rejects.toThrow('Project name is required');
    });

    it('should throw error if directory already exists', async () => {
      mockFs.pathExists.mockResolvedValue(true);

      await expect(projectDomain.create(baseCommand)).rejects.toThrow(CLIError);
      await expect(projectDomain.create(baseCommand)).rejects.toThrow('Directory "test-project" already exists');
    });

    it('should create turbo.json configuration', async () => {
      const command = {
        ...baseCommand,
        options: { framework: 'nextjs', packageManager: 'bun' }
      };

      await projectDomain.create(command);

      expect(mockFs.writeJson).toHaveBeenCalledWith(
        'test-project/turbo.json',
        expect.objectContaining({
          $schema: 'https://turbo.build/schema.json',
          tasks: expect.objectContaining({
            dev: { cache: false, persistent: true },
            build: {
              dependsOn: ['^build'],
              outputs: ['.next/**', '!.next/cache/**', 'dist/**']
            },
            lint: {},
            'type-check': {}
          })
        }),
        { spaces: 2 }
      );
    });

    it('should generate web app from template', async () => {
      const command = {
        ...baseCommand,
        options: { framework: 'nextjs', packageManager: 'bun' }
      };

      await projectDomain.create(command);

      expect(mockAppTemplateRegistry.generateAppFromTemplate).toHaveBeenCalledWith(
        'test-project/apps/web',
        'nextjs',
        expect.objectContaining({
          name: 'web',
          title: 'test-project',
          description: 'Web application for test-project',
          appName: 'web',
          port: 3000,
          features: ['dashboard', 'navbar'],
          framework: 'nextjs',
          packageManager: 'bun'
        })
      );
    });

    it('should create README.md file', async () => {
      const command = {
        ...baseCommand,
        options: { framework: 'nextjs', packageManager: 'bun' }
      };

      await projectDomain.create(command);

      expect(mockFs.writeFile).toHaveBeenCalledWith(
        'test-project/README.md',
        expect.stringContaining('# test-project')
      );
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        'test-project/README.md',
        expect.stringContaining('bun install')
      );
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        'test-project/README.md',
        expect.stringContaining('bun dev')
      );
    });

    it('should handle different frameworks correctly', async () => {
      const frameworks = ['react', 'vue', 'angular', 'svelte'];

      for (const framework of frameworks) {
        const command = {
          ...baseCommand,
          target: `test-${framework}`,
          options: { framework, packageManager: 'npm' }
        };

        await projectDomain.create(command);

        expect(mockAppTemplateRegistry.generateAppFromTemplate).toHaveBeenCalledWith(
          expect.any(String),
          framework,
          expect.objectContaining({ framework })
        );
      }
    });

    it('should show next steps after creation', async () => {
      const command = {
        ...baseCommand,
        options: { framework: 'nextjs', packageManager: 'bun', bundle: 'saas-starter' }
      };

      await projectDomain.create(command);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('🎉 Project created successfully!')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('cd test-project')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('bun install')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('bun dev')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Service bundle added: saas-starter')
      );
    });

    it('should handle creation errors gracefully', async () => {
      mockFs.ensureDir.mockRejectedValue(new Error('Permission denied'));

      await expect(projectDomain.create(baseCommand)).rejects.toThrow(CLIError);
      await expect(projectDomain.create(baseCommand)).rejects.toThrow('Failed to create project');
    });

    it('should clear config cache and change directory', async () => {
      const command = {
        ...baseCommand,
        options: { framework: 'nextjs', packageManager: 'bun' }
      };

      await projectDomain.create(command);

      expect(mockConfigManager.clearCache).toHaveBeenCalled();
      expect(process.chdir).toHaveBeenCalledWith('/current/dir/test-project');
    });

    it('should add service bundle if specified', async () => {
      const command = {
        ...baseCommand,
        options: { framework: 'nextjs', packageManager: 'bun', bundle: 'saas-starter' }
      };

      await projectDomain.create(command);

      expect(mockLogger.info).toHaveBeenCalledWith('Adding service bundle: saas-starter');
    });
  });

  describe('Project Validation', () => {
    const validateCommand: CLICommand = {
      domain: 'project',
      action: 'validate',
      arguments: {},
      options: {}
    };

    it('should validate project successfully', async () => {
      mockFs.pathExists.mockResolvedValue(true); // All required files exist

      await projectDomain.validate(validateCommand);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Validating project configuration and structure...'
      );
      expect(mockConfigManager.validateConfig).toHaveBeenCalled();
      expect(mockConfigManager.loadConfig).toHaveBeenCalled();
      expect(mockConfigManager.getMonorepoInfo).toHaveBeenCalled();
      expect(mockLogger.success).toHaveBeenCalledWith('Project validation passed! ✨');
    });

    it('should display project information after successful validation', async () => {
      mockFs.pathExists.mockResolvedValue(true);
      mockConfigManager.loadConfig.mockResolvedValue({
        project: {
          name: 'test-project',
          framework: 'nextjs',
          packageManager: 'bun'
        },
        services: {
          auth: { type: 'authentication' },
          database: { type: 'database' }
        }
      });

      await projectDomain.validate(validateCommand);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Project Information:')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Name: test-project')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Framework: nextjs')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Package Manager: bun')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Services: 2 configured')
      );
    });

    it('should display monorepo information', async () => {
      mockFs.pathExists.mockResolvedValue(true);
      mockConfigManager.getMonorepoInfo.mockResolvedValue({
        isMonorepo: true,
        structure: 'standard',
        apps: ['web', 'mobile'],
        packages: ['ui', 'shared']
      });

      await projectDomain.validate(validateCommand);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Monorepo: Yes (standard)')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Apps: 2 (web, mobile)')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Packages: 2 (ui, shared)')
      );
    });

    it('should handle configuration validation errors', async () => {
      mockConfigManager.validateConfig.mockResolvedValue({
        valid: false,
        errors: ['Missing required field: project.name', 'Invalid framework specified']
      });

      await projectDomain.validate(validateCommand);

      expect(mockLogger.error).toHaveBeenCalledWith('Configuration validation failed:');
      expect(mockLogger.error).toHaveBeenCalledWith('  • Missing required field: project.name');
      expect(mockLogger.error).toHaveBeenCalledWith('  • Invalid framework specified');
    });

    it('should validate project structure and report issues', async () => {
      mockFs.pathExists.mockImplementation((path) => {
        return !path.toString().includes('package.json'); // Missing package.json
      });

      await projectDomain.validate(validateCommand);

      expect(mockLogger.warn).toHaveBeenCalledWith('Project validation found issues:');
      expect(mockLogger.warn).toHaveBeenCalledWith('  • Missing required file: package.json');
    });

    it('should validate monorepo structure', async () => {
      mockFs.pathExists.mockImplementation((path) => {
        const pathStr = path.toString();
        if (pathStr.includes('package.json') || pathStr.includes('xaheen.config.json')) {
          return true;
        }
        if (pathStr === 'apps' || pathStr === 'packages') {
          return false; // Missing monorepo directories
        }
        return false;
      });

      await projectDomain.validate(validateCommand);

      expect(mockLogger.warn).toHaveBeenCalledWith('Project validation found issues:');
      expect(mockLogger.warn).toHaveBeenCalledWith('  • Missing apps directory for monorepo structure');
      expect(mockLogger.warn).toHaveBeenCalledWith('  • Missing packages directory for monorepo structure');
    });

    it('should validate services against registry', async () => {
      mockFs.pathExists.mockResolvedValue(true);
      mockConfigManager.loadConfig.mockResolvedValue({
        project: { name: 'test-project', framework: 'nextjs', packageManager: 'bun' },
        services: {
          'unknown-service': { type: 'unknown' },
          'valid-service': { type: 'authentication' }
        }
      });
      mockRegistry.getServiceTemplate.mockImplementation((id) => {
        return id === 'valid-service' ? { name: 'Valid Service' } : null;
      });

      await projectDomain.validate(validateCommand);

      expect(mockLogger.warn).toHaveBeenCalledWith('Project validation found issues:');
      expect(mockLogger.warn).toHaveBeenCalledWith('  • Unknown service template: unknown-service');
    });

    it('should handle validation errors gracefully', async () => {
      mockConfigManager.validateConfig.mockRejectedValue(new Error('Config error'));

      await expect(projectDomain.validate(validateCommand)).rejects.toThrow(CLIError);
      await expect(projectDomain.validate(validateCommand)).rejects.toThrow('Project validation failed');
    });

    it('should handle non-monorepo projects', async () => {
      mockFs.pathExists.mockResolvedValue(true);
      mockConfigManager.getMonorepoInfo.mockResolvedValue({
        isMonorepo: false,
        structure: 'single',
        apps: [],
        packages: []
      });

      await projectDomain.validate(validateCommand);

      expect(mockConsoleLog).not.toHaveBeenCalledWith(
        expect.stringContaining('Monorepo:')
      );
    });
  });

  describe('Platform Mapping', () => {
    it('should map frameworks to correct platforms', async () => {
      const frameworkPlatformMap = [
        ['nextjs', 'react'],
        ['react', 'react'],
        ['vue', 'vue'],
        ['angular', 'angular'],
        ['svelte', 'svelte'],
        ['unknown', 'react'] // fallback
      ];

      for (const [framework, expectedPlatform] of frameworkPlatformMap) {
        const command = {
          ...baseCommand,
          target: `test-${framework}`,
          options: { framework, packageManager: 'npm' }
        };

        await projectDomain.create(command);

        expect(mockConfigManager.saveConfig).toHaveBeenCalledWith(
          expect.objectContaining({
            design: expect.objectContaining({
              platform: expectedPlatform
            })
          })
        );
      }
    });
  });

  describe('Package Manager Support', () => {
    it('should support different package managers', async () => {
      const packageManagers = ['bun', 'pnpm', 'yarn', 'npm'];

      for (const packageManager of packageManagers) {
        const command = {
          ...baseCommand,
          target: `test-${packageManager}`,
          options: { framework: 'nextjs', packageManager }
        };

        await projectDomain.create(command);

        expect(mockFs.writeJson).toHaveBeenCalledWith(
          expect.stringContaining('package.json'),
          expect.objectContaining({
            packageManager: `${packageManager}@latest`
          }),
          { spaces: 2 }
        );

        expect(mockFs.writeFile).toHaveBeenCalledWith(
          expect.stringContaining('README.md'),
          expect.stringContaining(`${packageManager} install`)
        );
      }
    });
  });

  describe('Service Bundle Integration', () => {
    it('should handle service bundle addition', async () => {
      mockPrompts.group.mockResolvedValue({
        framework: 'nextjs',
        packageManager: 'bun',
        bundle: 'saas-starter',
        norwegian: false,
        gdpr: true
      });

      await projectDomain.create(baseCommand);

      expect(mockLogger.info).toHaveBeenCalledWith('Adding service bundle: saas-starter');
    });

    it('should skip service bundle when not specified', async () => {
      mockPrompts.group.mockResolvedValue({
        framework: 'nextjs',
        packageManager: 'bun',
        bundle: '',
        norwegian: false,
        gdpr: true
      });

      await projectDomain.create(baseCommand);

      expect(mockLogger.info).not.toHaveBeenCalledWith(
        expect.stringContaining('Adding service bundle')
      );
    });
  });

  describe('Error Handling', () => {
    it('should preserve CLIError instances', async () => {
      const originalError = new CLIError('Test error', 'TEST_CODE', 'project', 'create');
      mockFs.ensureDir.mockRejectedValue(originalError);

      await expect(projectDomain.create(baseCommand)).rejects.toThrow(originalError);
    });

    it('should wrap generic errors in CLIError', async () => {
      const genericError = new Error('Generic error');
      mockFs.ensureDir.mockRejectedValue(genericError);

      await expect(projectDomain.create(baseCommand)).rejects.toThrow(CLIError);
      await expect(projectDomain.create(baseCommand)).rejects.toThrow('Failed to create project');
    });

    it('should handle prompt cancellation', async () => {
      mockPrompts.group.mockRejectedValue(new Error('User cancelled'));

      await expect(projectDomain.create(baseCommand)).rejects.toThrow(CLIError);
    });
  });

  describe('Step Progress Logging', () => {
    it('should log creation steps in order', async () => {
      const command = {
        ...baseCommand,
        options: { framework: 'nextjs', packageManager: 'bun' }
      };

      await projectDomain.create(command);

      expect(mockLogger.step).toHaveBeenCalledWith(1, 4, 'Creating project directory structure...');
      expect(mockLogger.step).toHaveBeenCalledWith(2, 4, 'Setting up monorepo configuration...');
      expect(mockLogger.step).toHaveBeenCalledWith(3, 4, 'Creating initial web application...');
      expect(mockLogger.step).toHaveBeenCalledWith(4, 4, 'Finalizing project setup...');
    });
  });

  describe('Global Context Access', () => {
    it('should access config manager from global context', async () => {
      await projectDomain.create({
        ...baseCommand,
        options: { framework: 'nextjs', packageManager: 'bun' }
      });

      expect(mockConfigManager.clearCache).toHaveBeenCalled();
      expect(mockConfigManager.saveConfig).toHaveBeenCalled();
    });

    it('should access registry from global context', async () => {
      mockFs.pathExists.mockResolvedValue(true);
      mockConfigManager.loadConfig.mockResolvedValue({
        project: { name: 'test-project', framework: 'nextjs', packageManager: 'bun' },
        services: { auth: { type: 'authentication' } }
      });

      await projectDomain.validate(validateCommand);

      expect(mockRegistry.getServiceTemplate).toHaveBeenCalledWith('auth');
    });
  });
});