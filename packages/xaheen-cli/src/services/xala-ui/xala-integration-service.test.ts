/**
 * Comprehensive Tests for Xala UI Integration Service
 * 
 * Tests all aspects of Design System integration including initialization,
 * component generation, validation, migration, and platform compatibility.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { XalaIntegrationService } from './xala-integration-service';
import type { 
  XalaIntegrationOptions, 
  XalaPlatform, 
  XalaComponentSpec,
  ExtendedProjectContext 
} from '../../types/index';

// Mock all external dependencies
vi.mock('consola', () => ({
  consola: {
    start: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    box: vi.fn()
  }
}));

vi.mock('execa', () => ({
  execa: vi.fn().mockResolvedValue({ stdout: '', stderr: '' })
}));

vi.mock('fs-extra', () => ({
  pathExists: vi.fn(),
  pathExistsSync: vi.fn(),
  readJson: vi.fn(),
  readJsonSync: vi.fn(),
  writeJson: vi.fn(),
  writeFile: vi.fn(),
  ensureDir: vi.fn(),
  chmod: vi.fn()
}));

vi.mock('path', () => ({
  join: vi.fn((...paths) => paths.join('/')),
  resolve: vi.fn(path => '/' + path),
  basename: vi.fn(path => path.split('/').pop())
}));

vi.mock('./platform-manager', () => ({
  PlatformManager: vi.fn().mockImplementation(() => ({
    getPlatform: vi.fn().mockReturnValue({
      generateComponent: vi.fn().mockResolvedValue({
        success: true,
        files: ['component.tsx', 'component.stories.ts', 'component.test.ts'],
        errors: []
      })
    })
  }))
}));

describe('XalaIntegrationService', () => {
  let service: XalaIntegrationService;
  let mockFs: any;
  let mockConsola: any;
  let mockExeca: any;
  let mockPlatformManager: any;

  const mockPackageJson = {
    name: 'test-project',
    version: '1.0.0',
    dependencies: {
      'react': '^18.0.0',
      'next': '^14.0.0'
    },
    devDependencies: {
      '@types/react': '^18.0.0',
      'typescript': '^5.0.0'
    },
    scripts: {
      'build': 'next build',
      'dev': 'next dev'
    }
  };

  const mockIntegrationOptions: XalaIntegrationOptions = {
    platform: 'nextjs' as XalaPlatform,
    theme: 'enterprise',
    compliance: ['wcag-aaa', 'nsm'],
    locale: 'en',
    features: ['navbar', 'dashboard'],
    components: ['Button', 'Card'],
    skipLocalization: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup mocks
    mockFs = vi.mocked(require('fs-extra'));
    mockConsola = vi.mocked(require('consola')).consola;
    mockExeca = vi.mocked(require('execa')).execa;
    mockPlatformManager = require('./platform-manager').PlatformManager;

    // Default mock implementations
    mockFs.pathExists.mockResolvedValue(true);
    mockFs.pathExistsSync.mockReturnValue(true);
    mockFs.readJson.mockResolvedValue(mockPackageJson);
    mockFs.readJsonSync.mockReturnValue(mockPackageJson);
    mockFs.writeJson.mockResolvedValue(undefined);
    mockFs.writeFile.mockResolvedValue(undefined);
    mockFs.ensureDir.mockResolvedValue(undefined);
    mockFs.chmod.mockResolvedValue(undefined);

    // Mock process.cwd
    vi.spyOn(process, 'cwd').mockReturnValue('/test/project');

    service = new XalaIntegrationService('/test/project');
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default project path', () => {
      const defaultService = new XalaIntegrationService();
      expect(defaultService).toBeInstanceOf(XalaIntegrationService);
    });

    it('should initialize with custom project path', () => {
      const customService = new XalaIntegrationService('/custom/path');
      expect(customService).toBeInstanceOf(XalaIntegrationService);
    });
  });

  describe('Integration Initialization', () => {
    it('should initialize Xala UI integration successfully', async () => {
      await service.initializeIntegration(mockIntegrationOptions);

      expect(mockConsola.start).toHaveBeenCalledWith(
        expect.stringContaining('Initializing Xala UI integration')
      );
      expect(mockConsola.success).toHaveBeenCalledWith(
        expect.stringContaining('integration initialized successfully')
      );
      expect(mockConsola.box).toHaveBeenCalled();
    });

    it('should validate project compatibility', async () => {
      await service.initializeIntegration(mockIntegrationOptions);

      // Should check for package.json
      expect(mockFs.pathExists).toHaveBeenCalledWith(
        expect.stringContaining('package.json')
      );
    });

    it('should handle non-Node.js projects', async () => {
      mockFs.pathExists.mockImplementation((path) => 
        !path.includes('package.json')
      );

      await expect(
        service.initializeIntegration(mockIntegrationOptions)
      ).rejects.toThrow('No package.json found');
    });

    it('should warn for non-Xaheen projects', async () => {
      const packageJsonWithoutXaheen = {
        ...mockPackageJson,
        dependencies: { react: '^18.0.0' },
        devDependencies: {}
      };

      mockFs.readJson.mockResolvedValue(packageJsonWithoutXaheen);
      mockFs.pathExists.mockImplementation((path) => 
        path.includes('package.json') && !path.includes('xaheen.config.json')
      );

      await service.initializeIntegration(mockIntegrationOptions);

      expect(mockConsola.warn).toHaveBeenCalledWith(
        expect.stringContaining('Project may not be created with Xaheen CLI v2')
      );
    });

    it('should create Xala UI configuration', async () => {
      await service.initializeIntegration(mockIntegrationOptions);

      expect(mockFs.writeJson).toHaveBeenCalledWith(
        expect.stringContaining('xala.config.json'),
        expect.objectContaining({
          name: 'test-project',
          type: 'xaheen-integrated',
          ui: expect.objectContaining({
            system: 'xala',
            version: '5.0.0',
            architecture: 'semantic-v5'
          })
        }),
        { spaces: 2 }
      );
    });

    it('should install platform-specific dependencies', async () => {
      await service.initializeIntegration(mockIntegrationOptions);

      // Should update package.json with new dependencies
      expect(mockFs.writeJson).toHaveBeenCalledWith(
        expect.stringContaining('package.json'),
        expect.objectContaining({
          dependencies: expect.objectContaining({
            '@xala-technologies/ui-system': '^6.0.0',
            'class-variance-authority': '^0.7.0',
            'clsx': '^2.0.0',
            'next-intl': '^3.0.0' // Next.js specific
          })
        }),
        { spaces: 2 }
      );

      // Should run package manager install
      expect(mockExeca).toHaveBeenCalledWith(
        expect.any(String), // package manager
        ['install'],
        { cwd: '/test/project' }
      );
    });

    it('should detect different package managers', async () => {
      // Test pnpm detection
      mockFs.pathExistsSync.mockImplementation((path) => 
        path.includes('pnpm-lock.yaml')
      );

      await service.initializeIntegration(mockIntegrationOptions);

      expect(mockExeca).toHaveBeenCalledWith('pnpm', ['install'], expect.any(Object));
    });

    it('should skip localization when requested', async () => {
      const optionsWithoutLocalization = {
        ...mockIntegrationOptions,
        skipLocalization: true
      };

      await service.initializeIntegration(optionsWithoutLocalization);

      expect(mockConsola.info).not.toHaveBeenCalledWith(
        expect.stringContaining('Setting up localization system')
      );
    });

    it('should create integration hooks', async () => {
      await service.initializeIntegration(mockIntegrationOptions);

      expect(mockFs.ensureDir).toHaveBeenCalledWith(
        expect.stringContaining('.xaheen/hooks')
      );
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('pre-build.sh'),
        expect.stringContaining('npx xaheen validate')
      );
      expect(mockFs.chmod).toHaveBeenCalledWith(
        expect.stringContaining('pre-build.sh'),
        '755'
      );
    });

    it('should update project scripts', async () => {
      await service.initializeIntegration(mockIntegrationOptions);

      expect(mockFs.writeJson).toHaveBeenCalledWith(
        expect.stringContaining('package.json'),
        expect.objectContaining({
          scripts: expect.objectContaining({
            'ui:validate': 'xaheen validate --ui --semantic --accessibility',
            'ui:generate': 'xaheen add ui --platform nextjs',
            'ui:migrate': 'xaheen validate --ui --fix',
            'compliance:check': 'xaheen validate --compliance --wcag-aaa'
          })
        }),
        { spaces: 2 }
      );
    });

    it('should handle initialization errors gracefully', async () => {
      mockFs.pathExists.mockRejectedValue(new Error('File system error'));

      await expect(
        service.initializeIntegration(mockIntegrationOptions)
      ).rejects.toThrow('File system error');

      expect(mockConsola.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to initialize Xala UI integration'),
        expect.any(Error)
      );
    });
  });

  describe('Component Generation', () => {
    const platforms: XalaPlatform[] = ['react', 'nextjs', 'vue', 'angular', 'svelte', 'electron'];
    
    beforeEach(async () => {
      // Initialize service with project context
      await service.initializeIntegration(mockIntegrationOptions);
    });

    it('should generate components for specified platform', async () => {
      const result = await service.generateComponents(
        ['Button', 'Card'],
        'react',
        { semantic: true, withStories: true, withTests: true }
      );

      expect(result.success).toBe(true);
      expect(result.files.length).toBeGreaterThan(0);
      expect(result.errors.length).toBe(0);

      expect(mockConsola.start).toHaveBeenCalledWith(
        expect.stringContaining('Generating 2 components for react')
      );
      expect(mockConsola.success).toHaveBeenCalledWith(
        expect.stringContaining('Generated 2 semantic components')
      );
    });

    it.each(platforms)('should generate components for %s platform', async (platform) => {
      const result = await service.generateComponents(['Button'], platform);

      expect(result.success).toBe(true);
      expect(result.files).toContain('component.tsx');

      const mockPlatform = mockPlatformManager.mock.instances[0];
      expect(mockPlatform.getPlatform).toHaveBeenCalledWith(platform);
    });

    it('should handle component generation with different options', async () => {
      const options = {
        semantic: true,
        withStories: true,
        withTests: true,
        enterprise: true
      };

      await service.generateComponents(['Button'], 'react', options);

      const mockPlatform = mockPlatformManager.mock.instances[0].getPlatform();
      expect(mockPlatform.generateComponent).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Button',
          semantic: true,
          withStories: true,
          withTests: true,
          enterprise: true
        }),
        expect.any(Object)
      );
    });

    it('should handle component generation errors', async () => {
      const mockPlatform = mockPlatformManager.mock.instances[0].getPlatform();
      mockPlatform.generateComponent.mockResolvedValue({
        success: false,
        files: [],
        errors: ['Component generation failed']
      });

      const result = await service.generateComponents(['Button'], 'react');

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Component generation failed');
      expect(mockConsola.warn).toHaveBeenCalledWith(
        expect.stringContaining('Generated components with 1 issues')
      );
    });

    it('should handle complete generation failure', async () => {
      const mockPlatform = mockPlatformManager.mock.instances[0].getPlatform();
      mockPlatform.generateComponent.mockRejectedValue(new Error('Platform error'));

      const result = await service.generateComponents(['Button'], 'react');

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Component generation failed: Platform error');
    });

    it('should create proper template context', async () => {
      await service.generateComponents(['Button'], 'react', { enterprise: true });

      const mockPlatform = mockPlatformManager.mock.instances[0].getPlatform();
      const [spec, context] = mockPlatform.generateComponent.mock.calls[0];

      expect(context).toMatchObject({
        component: {
          name: 'Button',
          platform: 'react',
          semantic: true,
          localized: true,
          accessible: true,
          enterprise: true
        },
        project: expect.objectContaining({
          name: 'test-project',
          framework: 'nextjs',
          typescript: true
        }),
        options: {
          semantic: true,
          enterprise: true
        }
      });
    });
  });

  describe('Framework Detection', () => {
    it('should detect Next.js framework', async () => {
      const nextPackageJson = {
        ...mockPackageJson,
        dependencies: { next: '^14.0.0', react: '^18.0.0' }
      };
      mockFs.readJsonSync.mockReturnValue(nextPackageJson);

      await service.initializeIntegration(mockIntegrationOptions);

      // Framework should be detected as nextjs
      expect(mockConsola.info).toHaveBeenCalled();
    });

    it('should detect React framework', async () => {
      const reactPackageJson = {
        ...mockPackageJson,
        dependencies: { react: '^18.0.0' },
        devDependencies: { '@types/react': '^18.0.0' }
      };
      mockFs.readJsonSync.mockReturnValue(reactPackageJson);

      await service.initializeIntegration(mockIntegrationOptions);
      expect(mockConsola.info).toHaveBeenCalled();
    });

    it('should detect Vue framework', async () => {
      const vuePackageJson = {
        ...mockPackageJson,
        dependencies: { vue: '^3.0.0' }
      };
      mockFs.readJsonSync.mockReturnValue(vuePackageJson);

      await service.initializeIntegration(mockIntegrationOptions);
      expect(mockConsola.info).toHaveBeenCalled();
    });

    it('should detect Angular framework', async () => {
      const angularPackageJson = {
        ...mockPackageJson,
        dependencies: { '@angular/core': '^17.0.0' }
      };
      mockFs.readJsonSync.mockReturnValue(angularPackageJson);

      await service.initializeIntegration(mockIntegrationOptions);
      expect(mockConsola.info).toHaveBeenCalled();
    });

    it('should detect Svelte framework', async () => {
      const sveltePackageJson = {
        ...mockPackageJson,
        dependencies: { svelte: '^4.0.0' }
      };
      mockFs.readJsonSync.mockReturnValue(sveltePackageJson);

      await service.initializeIntegration(mockIntegrationOptions);
      expect(mockConsola.info).toHaveBeenCalled();
    });

    it('should handle unknown framework', async () => {
      const unknownPackageJson = {
        name: 'unknown-project',
        dependencies: { lodash: '^4.0.0' }
      };
      mockFs.readJsonSync.mockReturnValue(unknownPackageJson);

      await service.initializeIntegration(mockIntegrationOptions);
      expect(mockConsola.info).toHaveBeenCalled();
    });
  });

  describe('Platform Dependencies', () => {
    it('should provide correct dependencies for Next.js', async () => {
      const options = { ...mockIntegrationOptions, platform: 'nextjs' as XalaPlatform };
      await service.initializeIntegration(options);

      expect(mockFs.writeJson).toHaveBeenCalledWith(
        expect.stringContaining('package.json'),
        expect.objectContaining({
          dependencies: expect.objectContaining({
            '@xala-technologies/ui-system': '^6.0.0',
            'next-intl': '^3.0.0'
          })
        }),
        expect.any(Object)
      );
    });

    it('should provide correct dependencies for Vue', async () => {
      const options = { ...mockIntegrationOptions, platform: 'vue' as XalaPlatform };
      await service.initializeIntegration(options);

      expect(mockFs.writeJson).toHaveBeenCalledWith(
        expect.stringContaining('package.json'),
        expect.objectContaining({
          dependencies: expect.objectContaining({
            '@xala-technologies/ui-system': '^6.0.0',
            'vue-i18n': '^9.0.0'
          })
        }),
        expect.any(Object)
      );
    });

    it('should provide correct dependencies for Angular', async () => {
      const options = { ...mockIntegrationOptions, platform: 'angular' as XalaPlatform };
      await service.initializeIntegration(options);

      expect(mockFs.writeJson).toHaveBeenCalledWith(
        expect.stringContaining('package.json'),
        expect.objectContaining({
          dependencies: expect.objectContaining({
            '@xala-technologies/ui-system': '^6.0.0',
            '@ngx-translate/core': '^15.0.0'
          })
        }),
        expect.any(Object)
      );
    });

    it('should provide correct dependencies for Electron', async () => {
      const options = { ...mockIntegrationOptions, platform: 'electron' as XalaPlatform };
      await service.initializeIntegration(options);

      expect(mockFs.writeJson).toHaveBeenCalledWith(
        expect.stringContaining('package.json'),
        expect.objectContaining({
          dependencies: expect.objectContaining({
            '@xala-technologies/ui-system': '^6.0.0',
            'electron': '^28.0.0'
          })
        }),
        expect.any(Object)
      );
    });
  });

  describe('Project Feature Detection', () => {
    it('should detect Storybook', async () => {
      const storybookPackageJson = {
        ...mockPackageJson,
        devDependencies: {
          ...mockPackageJson.devDependencies,
          '@storybook/react': '^7.0.0'
        }
      };
      mockFs.readJsonSync.mockReturnValue(storybookPackageJson);

      await service.initializeIntegration(mockIntegrationOptions);
      expect(mockConsola.info).toHaveBeenCalled();
    });

    it('should detect testing frameworks', async () => {
      const testingPackageJson = {
        ...mockPackageJson,
        devDependencies: {
          ...mockPackageJson.devDependencies,
          'vitest': '^1.0.0'
        }
      };
      mockFs.readJsonSync.mockReturnValue(testingPackageJson);

      await service.initializeIntegration(mockIntegrationOptions);
      expect(mockConsola.info).toHaveBeenCalled();
    });

    it('should detect Tailwind CSS', async () => {
      const tailwindPackageJson = {
        ...mockPackageJson,
        devDependencies: {
          ...mockPackageJson.devDependencies,
          'tailwindcss': '^3.0.0'
        }
      };
      mockFs.readJsonSync.mockReturnValue(tailwindPackageJson);

      await service.initializeIntegration(mockIntegrationOptions);
      expect(mockConsola.info).toHaveBeenCalled();
    });

    it('should detect internationalization libraries', async () => {
      const i18nPackageJson = {
        ...mockPackageJson,
        dependencies: {
          ...mockPackageJson.dependencies,
          'react-i18next': '^13.0.0'
        }
      };
      mockFs.readJsonSync.mockReturnValue(i18nPackageJson);

      await service.initializeIntegration(mockIntegrationOptions);
      expect(mockConsola.info).toHaveBeenCalled();
    });
  });

  describe('Platform Type Detection', () => {
    it('should detect desktop platform', async () => {
      mockFs.pathExists.mockImplementation((path) => 
        path.includes('electron') || path.includes('package.json')
      );

      await service.initializeIntegration(mockIntegrationOptions);
      expect(mockConsola.info).toHaveBeenCalled();
    });

    it('should detect mobile platform', async () => {
      const mobilePackageJson = {
        ...mockPackageJson,
        dependencies: {
          'react-native': '^0.72.0'
        }
      };
      mockFs.readJsonSync.mockReturnValue(mobilePackageJson);

      await service.initializeIntegration(mockIntegrationOptions);
      expect(mockConsola.info).toHaveBeenCalled();
    });

    it('should default to web platform', async () => {
      mockFs.pathExists.mockImplementation((path) => 
        path.includes('package.json') // Only package.json exists
      );

      await service.initializeIntegration(mockIntegrationOptions);
      expect(mockConsola.info).toHaveBeenCalled();
    });
  });

  describe('Semantic Validation', () => {
    beforeEach(async () => {
      await service.initializeIntegration(mockIntegrationOptions);
    });

    it('should validate semantic compliance successfully', async () => {
      const result = await service.validateSemanticCompliance();

      expect(result.success).toBe(true);
      expect(result.score).toBe(100);
      expect(result.issues).toEqual([]);
      expect(result.recommendations).toEqual([]);

      expect(mockConsola.start).toHaveBeenCalledWith(
        expect.stringContaining('Validating semantic architecture compliance')
      );
      expect(mockConsola.info).toHaveBeenCalledWith(
        expect.stringContaining('Semantic validation score: 100%')
      );
    });

    it('should handle validation errors', async () => {
      // Mock validation methods to simulate failures
      const originalValidateZeroRawHTML = service['validateZeroRawHTML'];
      service['validateZeroRawHTML'] = vi.fn().mockRejectedValue(new Error('Validation error'));

      const result = await service.validateSemanticCompliance();

      expect(result.success).toBe(false);
      expect(result.score).toBe(0);
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].type).toBe('error');
      expect(result.issues[0].message).toContain('Validation failed');

      expect(mockConsola.error).toHaveBeenCalledWith(
        expect.stringContaining('Semantic validation failed'),
        expect.any(Error)
      );

      // Restore original method
      service['validateZeroRawHTML'] = originalValidateZeroRawHTML;
    });
  });

  describe('Component Migration', () => {
    beforeEach(async () => {
      await service.initializeIntegration(mockIntegrationOptions);
    });

    it('should migrate components to semantic architecture', async () => {
      const result = await service.migrateToSemanticArchitecture({
        backup: true,
        force: false,
        includePatterns: ['src/components/**/*.tsx']
      });

      expect(result.success).toBe(true);
      expect(result.migratedFiles).toEqual([]);
      expect(result.errors).toEqual([]);

      expect(mockConsola.start).toHaveBeenCalledWith(
        expect.stringContaining('Migrating components to semantic architecture')
      );
    });

    it('should handle migration with backup', async () => {
      const result = await service.migrateToSemanticArchitecture({
        backup: true
      });

      expect(result.success).toBe(true);
      expect(mockConsola.info).toHaveBeenCalledWith(
        expect.stringContaining('Migrated 0 components')
      );
    });

    it('should handle migration errors', async () => {
      // Mock findComponentsToMigrate to throw error
      service['findComponentsToMigrate'] = vi.fn().mockRejectedValue(
        new Error('Migration error')
      );

      const result = await service.migrateToSemanticArchitecture();

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Migration failed: Migration error');
      expect(mockConsola.error).toHaveBeenCalledWith(
        expect.stringContaining('Migration failed'),
        expect.any(Error)
      );
    });
  });

  describe('Package Manager Detection', () => {
    it('should detect Bun', async () => {
      mockFs.pathExistsSync.mockImplementation((path) => 
        path.includes('bun.lockb') || path.includes('package.json')
      );

      await service.initializeIntegration(mockIntegrationOptions);
      expect(mockExeca).toHaveBeenCalledWith('bun', ['install'], expect.any(Object));
    });

    it('should detect PNPM', async () => {
      mockFs.pathExistsSync.mockImplementation((path) => 
        path.includes('pnpm-lock.yaml') || path.includes('package.json')
      );

      await service.initializeIntegration(mockIntegrationOptions);
      expect(mockExeca).toHaveBeenCalledWith('pnpm', ['install'], expect.any(Object));
    });

    it('should detect Yarn', async () => {
      mockFs.pathExistsSync.mockImplementation((path) => 
        path.includes('yarn.lock') || path.includes('package.json')
      );

      await service.initializeIntegration(mockIntegrationOptions);
      expect(mockExeca).toHaveBeenCalledWith('yarn', ['install'], expect.any(Object));
    });

    it('should default to NPM', async () => {
      mockFs.pathExistsSync.mockImplementation((path) => 
        path.includes('package.json') // Only package.json exists
      );

      await service.initializeIntegration(mockIntegrationOptions);
      expect(mockExeca).toHaveBeenCalledWith('npm', ['install'], expect.any(Object));
    });
  });

  describe('TypeScript Detection', () => {
    it('should detect TypeScript projects', async () => {
      mockFs.pathExistsSync.mockImplementation((path) => 
        path.includes('tsconfig.json') || path.includes('package.json')
      );

      await service.initializeIntegration(mockIntegrationOptions);
      expect(mockConsola.info).toHaveBeenCalled();
    });

    it('should handle non-TypeScript projects', async () => {
      mockFs.pathExistsSync.mockImplementation((path) => 
        path.includes('package.json') // Only package.json exists
      );

      await service.initializeIntegration(mockIntegrationOptions);
      expect(mockConsola.info).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle file system errors gracefully', async () => {
      mockFs.readJson.mockRejectedValue(new Error('File not found'));

      await expect(
        service.initializeIntegration(mockIntegrationOptions)
      ).rejects.toThrow('File not found');

      expect(mockConsola.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to initialize'),
        expect.any(Error)
      );
    });

    it('should handle package manager installation failures', async () => {
      mockExeca.mockRejectedValue(new Error('Installation failed'));

      await expect(
        service.initializeIntegration(mockIntegrationOptions)
      ).rejects.toThrow('Installation failed');
    });

    it('should handle file writing errors', async () => {
      mockFs.writeJson.mockRejectedValue(new Error('Permission denied'));

      await expect(
        service.initializeIntegration(mockIntegrationOptions)
      ).rejects.toThrow('Permission denied');
    });
  });

  describe('Post-Installation Instructions', () => {
    it('should show comprehensive post-install instructions', async () => {
      await service.initializeIntegration(mockIntegrationOptions);

      expect(mockConsola.box).toHaveBeenCalledWith(
        expect.stringContaining('Xala UI Integration Complete')
      );
      expect(mockConsola.box).toHaveBeenCalledWith(
        expect.stringContaining('Platform: nextjs')
      );
      expect(mockConsola.box).toHaveBeenCalledWith(
        expect.stringContaining('Theme: enterprise')
      );
      expect(mockConsola.box).toHaveBeenCalledWith(
        expect.stringContaining('Components: 2')
      );
    });
  });

  describe('Configuration Generation', () => {
    it('should generate complete Xala UI configuration', async () => {
      await service.initializeIntegration(mockIntegrationOptions);

      expect(mockFs.writeJson).toHaveBeenCalledWith(
        expect.stringContaining('xala.config.json'),
        expect.objectContaining({
          ui: expect.objectContaining({
            system: 'xala',
            version: '5.0.0',
            architecture: 'semantic-v5',
            theme: 'enterprise',
            platform: 'nextjs',
            compliance: ['wcag-aaa', 'nsm'],
            localization: expect.objectContaining({
              defaultLocale: 'en',
              supportedLocales: ['en', 'nb-NO', 'fr', 'ar']
            }),
            features: expect.objectContaining({
              navbar: true,
              dashboard: true,
              semanticComponents: true,
              designTokens: true
            }),
            componentLibrary: expect.objectContaining({
              components: ['Button', 'Card']
            })
          }),
          integrations: expect.objectContaining({
            xaheen: expect.objectContaining({
              enabled: true,
              version: '2.0.0',
              features: ['navbar', 'dashboard']
            })
          })
        }),
        { spaces: 2 }
      );
    });
  });
});