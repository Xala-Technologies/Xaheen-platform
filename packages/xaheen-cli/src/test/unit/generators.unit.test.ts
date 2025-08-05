/**
 * @fileoverview Generator Unit Tests - EPIC 13 Story 13.7
 * @description Unit-test each generator and template helper with Jest/Vitest
 * @version 1.0.0
 * @compliance Enterprise Security, Norwegian NSM Standards
 */

import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { join } from 'path';
import fs from 'fs-extra';
import { ComponentGenerator } from '../../generators/component.generator.js';
import { LayoutGenerator } from '../../generators/layout.generator.js';
import { PageGenerator } from '../../generators/page.generator.js';
import { BaseGenerator } from '../../generators/base.generator.js';
import { TestFileSystem, MockBuilder } from '../test-helpers.js';

// Mock filesystem operations
vi.mock('fs-extra', async () => {
  const actual = await vi.importActual('fs-extra');
  return {
    ...actual,
    ensureDir: vi.fn(),
    writeFile: vi.fn(),
    readFile: vi.fn(),
    pathExists: vi.fn(),
    copy: vi.fn(),
    move: vi.fn(),
    remove: vi.fn(),
  };
});

// Mock template engine
vi.mock('handlebars', () => ({
  compile: vi.fn().mockImplementation((template) => {
    return vi.fn().mockImplementation((context) => {
      // Simple template replacement for testing
      return template.replace(/\{\{(\w+)\}\}/g, (match: string, key: string) => {
        return context[key] || match;
      });
    });
  }),
  registerHelper: vi.fn(),
  registerPartial: vi.fn(),
}));

// Mock CLI logger
vi.mock('../../utils/logger.js', () => ({
  logger: {
    info: vi.fn(),
    success: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('Generator Unit Tests', () => {
  let testFs: TestFileSystem;
  let testDir: string;

  beforeEach(async () => {
    testFs = new TestFileSystem();
    testDir = await testFs.createTempDir('generator-test-');
    
    // Reset mocks
    vi.clearAllMocks();
    
    // Setup default mock implementations
    (fs.ensureDir as any).mockResolvedValue(undefined);
    (fs.writeFile as any).mockResolvedValue(undefined);
    (fs.pathExists as any).mockResolvedValue(false);
    (fs.readFile as any).mockResolvedValue('{"name": "test-project", "version": "1.0.0"}');
  });

  afterEach(async () => {
    await testFs.restore();
    vi.clearAllMocks();
  });

  describe('BaseGenerator', () => {
    let generator: BaseGenerator;

    beforeEach(() => {
      generator = new BaseGenerator({
        name: 'TestGenerator',
        description: 'Test generator for unit testing',
        type: 'component',
        templatePath: join(testDir, 'templates'),
        outputPath: join(testDir, 'output'),
      });
    });

    it('should initialize with correct configuration', () => {
      expect(generator.name).toBe('TestGenerator');
      expect(generator.description).toBe('Test generator for unit testing');
      expect(generator.type).toBe('component');
    });

    it('should validate required options', async () => {
      const options = {
        name: 'TestComponent',
        type: 'button',
        platform: 'react',
      };

      const validation = await generator.validateOptions(options);
      expect(validation.isValid).toBe(true);
    });

    it('should reject invalid options', async () => {
      const options = {
        // Missing required 'name' field
        type: 'button',
        platform: 'react',
      };

      const validation = await generator.validateOptions(options);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Name is required');
    });

    it('should generate context from options', async () => {
      const options = {
        name: 'TestComponent',
        type: 'button',
        platform: 'react',
        features: {
          accessible: true,
          interactive: true,
        },
      };

      const context = await generator.generateContext(options);
      
      expect(context).toMatchObject({
        name: 'TestComponent',
        type: 'button',
        platform: 'react',
        className: 'TestComponent',
        fileName: 'test-component',
        features: {
          accessible: true,
          interactive: true,
        },
      });
    });

    it('should apply Norwegian naming conventions', async () => {
      const options = {
        name: 'BrukerveiledningKnapp',
        type: 'button',
        platform: 'react',
        locale: 'nb-NO',
      };

      const context = await generator.generateContext(options);
      
      expect(context.className).toBe('BrukerveiledningKnapp');
      expect(context.fileName).toBe('brukerveiledning-knapp');
      expect(context.displayName).toBe('Brukerveiledning Knapp');
    });

    it('should handle template rendering', async () => {
      const template = 'export const {{name}} = () => <{{type}}>{{name}}</{{type}}>;';
      const context = { name: 'TestButton', type: 'button' };

      const result = await generator.renderTemplate(template, context);
      
      expect(result).toBe('export const TestButton = () => <button>TestButton</button>;');
    });

    it('should ensure output directories', async () => {
      const outputPath = join(testDir, 'output', 'components');
      
      await generator.ensureOutputDirectory(outputPath);
      
      expect(fs.ensureDir).toHaveBeenCalledWith(outputPath);
    });

    it('should write files with proper encoding', async () => {
      const filePath = join(testDir, 'test.tsx');
      const content = 'export const Test = () => <div>Test</div>;';

      await generator.writeFile(filePath, content);
      
      expect(fs.writeFile).toHaveBeenCalledWith(filePath, content, 'utf-8');
    });

    it('should handle file conflicts', async () => {
      (fs.pathExists as any).mockResolvedValue(true);

      const filePath = join(testDir, 'existing.tsx');
      const content = 'new content';

      // Should not overwrite by default
      await expect(
        generator.writeFile(filePath, content, { overwrite: false })
      ).rejects.toThrow('File already exists');

      // Should overwrite when explicitly allowed
      await generator.writeFile(filePath, content, { overwrite: true });
      expect(fs.writeFile).toHaveBeenCalledWith(filePath, content, 'utf-8');
    });
  });

  describe('ComponentGenerator', () => {
    let generator: ComponentGenerator;

    beforeEach(() => {
      generator = new ComponentGenerator({
        templatePath: join(testDir, 'templates'),
        outputPath: join(testDir, 'output'),
      });
    });

    it('should generate React functional component', async () => {
      const options = {
        name: 'TestButton',
        type: 'button',
        platform: 'react',
        features: {
          accessible: true,
          interactive: true,
        },
        styling: {
          variant: 'primary',
          size: 'md',
        },
      };

      const result = await generator.generate(options);

      expect(result.success).toBe(true);
      expect(result.files).toHaveLength(3); // Component, test, story
      expect(result.files[0].path).toContain('TestButton.tsx');
      expect(result.files[0].content).toContain('export const TestButton');
      expect(result.files[0].content).toContain('JSX.Element');
    });

    it('should generate TypeScript interfaces', async () => {
      const options = {
        name: 'CustomInput',
        type: 'input',
        platform: 'react',
        features: {
          validation: true,
          clearable: true,
        },
      };

      const result = await generator.generate(options);
      const componentFile = result.files.find(f => f.path.includes('.tsx'));

      expect(componentFile?.content).toContain('interface CustomInputProps');
      expect(componentFile?.content).toContain('readonly ');
      expect(componentFile?.content).toContain('?: '); // Optional props
    });

    it('should include accessibility features', async () => {
      const options = {
        name: 'AccessibleModal',
        type: 'modal',
        platform: 'react',
        features: {
          accessible: true,
          focusManagement: true,
          escapeKey: true,
        },
      };

      const result = await generator.generate(options);
      const componentFile = result.files.find(f => f.path.includes('.tsx'));

      expect(componentFile?.content).toContain('aria-');
      expect(componentFile?.content).toContain('role=');
      expect(componentFile?.content).toContain('useEffect');
      expect(componentFile?.content).toContain('keydown');
    });

    it('should generate proper Tailwind CSS classes', async () => {
      const options = {
        name: 'StyledCard',
        type: 'card',
        platform: 'react',
        styling: {
          variant: 'elevated',
          borderRadius: 'lg',
          shadow: 'xl',
          padding: 'lg',
        },
      };

      const result = await generator.generate(options);
      const componentFile = result.files.find(f => f.path.includes('.tsx'));

      expect(componentFile?.content).toContain('className=');
      expect(componentFile?.content).toContain('rounded-lg');
      expect(componentFile?.content).toContain('shadow-xl');
      expect(componentFile?.content).toContain('p-8'); // Large padding
    });

    it('should generate component tests', async () => {
      const options = {
        name: 'TestableButton',
        type: 'button',
        platform: 'react',
        features: {
          testable: true,
        },
      };

      const result = await generator.generate(options);
      const testFile = result.files.find(f => f.path.includes('.test.'));

      expect(testFile).toBeDefined();
      expect(testFile?.content).toContain("describe('TestableButton'");
      expect(testFile?.content).toContain('render(');
      expect(testFile?.content).toContain('expect(');
      expect(testFile?.content).toContain('toBeInTheDocument');
    });

    it('should generate Storybook stories', async () => {
      const options = {
        name: 'StorybookButton',
        type: 'button',
        platform: 'react',
        features: {
          stories: true,
        },
      };

      const result = await generator.generate(options);
      const storyFile = result.files.find(f => f.path.includes('.stories.'));

      expect(storyFile).toBeDefined();
      expect(storyFile?.content).toContain('Meta<typeof StorybookButton>');
      expect(storyFile?.content).toContain('export default meta');
      expect(storyFile?.content).toContain('Primary: Story');
    });

    it('should support different platforms', async () => {
      const platforms = ['react', 'vue', 'angular', 'svelte'];

      for (const platform of platforms) {
        const options = {
          name: `${platform}Component`,
          type: 'button',
          platform,
        };

        const result = await generator.generate(options);
        expect(result.success).toBe(true);
        
        const componentFile = result.files[0];
        
        switch (platform) {
          case 'react':
            expect(componentFile.content).toContain('JSX.Element');
            break;
          case 'vue':
            expect(componentFile.content).toContain('<template>');
            break;
          case 'angular':
            expect(componentFile.content).toContain('@Component');
            break;
          case 'svelte':
            expect(componentFile.content).toContain('<script>');
            break;
        }
      }
    });

    it('should handle Norwegian localization', async () => {
      const options = {
        name: 'NorskKnapp',
        type: 'button',
        platform: 'react',
        locale: 'nb-NO',
        features: {
          localization: true,
        },
      };

      const result = await generator.generate(options);
      const componentFile = result.files.find(f => f.path.includes('.tsx'));

      expect(componentFile?.content).toContain('nb-NO');
      expect(componentFile?.content).toContain('useTranslation');
    });
  });

  describe('LayoutGenerator', () => {
    let generator: LayoutGenerator;

    beforeEach(() => {
      generator = new LayoutGenerator({
        templatePath: join(testDir, 'templates'),
        outputPath: join(testDir, 'output'),
      });
    });

    it('should generate admin layout', async () => {
      const options = {
        name: 'AdminLayout',
        layoutType: 'admin',
        features: {
          sidebar: true,
          header: true,
          footer: true,
          breadcrumbs: true,
        },
      };

      const result = await generator.generate(options);

      expect(result.success).toBe(true);
      expect(result.files).toHaveLength(4); // Layout, sidebar, header, footer
      
      const layoutFile = result.files.find(f => f.path.includes('AdminLayout'));
      expect(layoutFile?.content).toContain('sidebar');
      expect(layoutFile?.content).toContain('header');
      expect(layoutFile?.content).toContain('footer');
    });

    it('should generate responsive layout', async () => {
      const options = {
        name: 'ResponsiveLayout',
        layoutType: 'web',
        features: {
          responsive: true,
          mobileFirst: true,
        },
      };

      const result = await generator.generate(options);
      const layoutFile = result.files[0];

      expect(layoutFile.content).toContain('md:');
      expect(layoutFile.content).toContain('lg:');
      expect(layoutFile.content).toContain('xl:');
    });

    it('should include navigation structure', async () => {
      const options = {
        name: 'NavigationLayout',
        layoutType: 'admin',
        navigation: {
          type: 'vertical',
          items: [
            { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
            { key: 'users', label: 'Users', href: '/users' },
            { key: 'settings', label: 'Settings', href: '/settings' },
          ],
        },
      };

      const result = await generator.generate(options);
      const navigationFile = result.files.find(f => f.path.includes('navigation'));

      expect(navigationFile?.content).toContain('Dashboard');
      expect(navigationFile?.content).toContain('/dashboard');
      expect(navigationFile?.content).toContain('Users');
    });

    it('should support different layout types', async () => {
      const layoutTypes = ['admin', 'web', 'mobile', 'desktop'];

      for (const layoutType of layoutTypes) {
        const options = {
          name: `${layoutType}Layout`,
          layoutType,
        };

        const result = await generator.generate(options);
        expect(result.success).toBe(true);
        
        const layoutFile = result.files[0];
        expect(layoutFile.path).toContain(`${layoutType}Layout`);
      }
    });
  });

  describe('PageGenerator', () => {
    let generator: PageGenerator;

    beforeEach(() => {
      generator = new PageGenerator({
        templatePath: join(testDir, 'templates'),
        outputPath: join(testDir, 'output'),
      });
    });

    it('should generate dashboard page', async () => {
      const options = {
        name: 'DashboardPage',
        template: 'dashboard',
        sections: [
          'header',
          'stats',
          'charts',
          'recent-activity',
        ],
      };

      const result = await generator.generate(options);

      expect(result.success).toBe(true);
      expect(result.files).toHaveLength(2); // Page component and styles
      
      const pageFile = result.files[0];
      expect(pageFile.content).toContain('DashboardPage');
      expect(pageFile.content).toContain('stats');
      expect(pageFile.content).toContain('charts');
    });

    it('should generate landing page', async () => {
      const options = {
        name: 'LandingPage',
        template: 'landing',
        sections: [
          'hero',
          'features',
          'testimonials',
          'cta',
        ],
      };

      const result = await generator.generate(options);
      const pageFile = result.files[0];

      expect(pageFile.content).toContain('hero');
      expect(pageFile.content).toContain('features');
      expect(pageFile.content).toContain('testimonials');
    });

    it('should generate authentication pages', async () => {
      const options = {
        name: 'LoginPage',
        template: 'auth',
        authType: 'login',
        features: {
          socialLogin: true,
          forgotPassword: true,
          rememberMe: true,
        },
      };

      const result = await generator.generate(options);
      const pageFile = result.files[0];

      expect(pageFile.content).toContain('login');
      expect(pageFile.content).toContain('password');
      expect(pageFile.content).toContain('socialLogin');
    });

    it('should include SEO optimization', async () => {
      const options = {
        name: 'SEOPage',
        template: 'landing',
        seo: {
          title: 'Test Page Title',
          description: 'Test page description',
          keywords: ['test', 'page', 'seo'],
        },
      };

      const result = await generator.generate(options);
      const pageFile = result.files[0];

      expect(pageFile.content).toContain('Test Page Title');
      expect(pageFile.content).toContain('Test page description');
      expect(pageFile.content).toContain('Head');
    });

    it('should support Norwegian content', async () => {
      const options = {
        name: 'NorskSide',
        template: 'landing',
        locale: 'nb-NO',
        content: {
          title: 'Velkommen til vår tjeneste',
          description: 'En fantastisk norsk tjeneste',
        },
      };

      const result = await generator.generate(options);
      const pageFile = result.files[0];

      expect(pageFile.content).toContain('Velkommen til vår tjeneste');
      expect(pageFile.content).toContain('lang="nb-NO"');
    });
  });

  describe('Template Helpers', () => {
    let generator: BaseGenerator;

    beforeEach(() => {
      generator = new BaseGenerator({
        name: 'HelperTest',
        description: 'Test helper functions',
        type: 'component',
        templatePath: testDir,
        outputPath: testDir,
      });
    });

    it('should register and use custom helpers', async () => {
      const handlebars = await import('handlebars');
      
      // Verify helper registration
      expect(handlebars.registerHelper).toHaveBeenCalled();

      // Test helper usage
      const template = '{{pascalCase name}}';
      const context = { name: 'test-component' };
      
      const result = await generator.renderTemplate(template, context);
      expect(result).toBe('TestComponent');
    });

    it('should format names correctly', async () => {
      const testCases = [
        { input: 'test-component', expected: 'TestComponent', helper: 'pascalCase' },
        { input: 'TestComponent', expected: 'test-component', helper: 'kebabCase' },
        { input: 'test_component', expected: 'testComponent', helper: 'camelCase' },
        { input: 'TestComponent', expected: 'TEST_COMPONENT', helper: 'constantCase' },
      ];

      for (const testCase of testCases) {
        const template = `{{${testCase.helper} name}}`;
        const context = { name: testCase.input };
        
        const result = await generator.renderTemplate(template, context);
        expect(result).toBe(testCase.expected);
      }
    });

    it('should handle conditional rendering', async () => {
      const template = '{{#if features.accessible}}aria-label="{{name}}"{{/if}}';
      const context = {
        name: 'TestButton',
        features: { accessible: true },
      };

      const result = await generator.renderTemplate(template, context);
      expect(result).toBe('aria-label="TestButton"');
    });

    it('should handle loops in templates', async () => {
      const template = '{{#each items}}{{name}}: {{value}}\n{{/each}}';
      const context = {
        items: [
          { name: 'width', value: '100px' },
          { name: 'height', value: '50px' },
        ],
      };

      const result = await generator.renderTemplate(template, context);
      expect(result).toContain('width: 100px');
      expect(result).toContain('height: 50px');
    });

    it('should format dates correctly', async () => {
      const template = '{{formatDate date "YYYY-MM-DD"}}';
      const context = {
        date: new Date('2024-01-15'),
      };

      const result = await generator.renderTemplate(template, context);
      expect(result).toBe('2024-01-15');
    });

    it('should handle Norwegian formatting', async () => {
      const template = '{{formatCurrency amount "NOK"}}';
      const context = {
        amount: 1234.56,
      };

      const result = await generator.renderTemplate(template, context);
      expect(result).toContain('kr');
      expect(result).toContain('1 234,56'); // Norwegian number format
    });
  });

  describe('Error Handling', () => {
    let generator: ComponentGenerator;

    beforeEach(() => {
      generator = new ComponentGenerator({
        templatePath: join(testDir, 'templates'),
        outputPath: join(testDir, 'output'),
      });
    });

    it('should handle template rendering errors', async () => {
      const invalidTemplate = '{{#invalidHelper}}content{{/invalidHelper}}';
      const context = { name: 'Test' };

      await expect(
        generator.renderTemplate(invalidTemplate, context)
      ).rejects.toThrow();
    });

    it('should handle file write errors', async () => {
      (fs.writeFile as any).mockRejectedValue(new Error('Permission denied'));

      const options = {
        name: 'ErrorTest',
        type: 'button',
        platform: 'react',
      };

      await expect(generator.generate(options)).rejects.toThrow('Permission denied');
    });

    it('should validate template existence', async () => {
      (fs.pathExists as any).mockResolvedValue(false);

      const options = {
        name: 'MissingTemplate',
        type: 'nonexistent-type',
        platform: 'react',
      };

      await expect(generator.generate(options)).rejects.toThrow(
        /Template not found/
      );
    });

    it('should handle invalid platform', async () => {
      const options = {
        name: 'InvalidPlatform',
        type: 'button',
        platform: 'unsupported-platform',
      };

      const validation = await generator.validateOptions(options);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Unsupported platform');
    });

    it('should provide detailed error context', async () => {
      (fs.ensureDir as any).mockRejectedValue(
        new Error('EACCES: permission denied, mkdir')
      );

      const options = {
        name: 'PermissionTest',
        type: 'button',
        platform: 'react',
      };

      try {
        await generator.generate(options);
      } catch (error) {
        expect(error.message).toContain('permission denied');
        expect(error.context).toMatchObject({
          generator: 'ComponentGenerator',
          operation: 'ensureOutputDirectory',
          options: expect.objectContaining({
            name: 'PermissionTest',
          }),
        });
      }
    });
  });

  describe('Performance', () => {
    let generator: ComponentGenerator;

    beforeEach(() => {
      generator = new ComponentGenerator({
        templatePath: join(testDir, 'templates'),
        outputPath: join(testDir, 'output'),
      });
    });

    it('should generate components efficiently', async () => {
      const startTime = Date.now();

      const options = {
        name: 'PerformanceTest',
        type: 'button',
        platform: 'react',
      };

      await generator.generate(options);

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle batch generation efficiently', async () => {
      const startTime = Date.now();

      const batchPromises = [];
      for (let i = 0; i < 10; i++) {
        batchPromises.push(
          generator.generate({
            name: `BatchComponent${i}`,
            type: 'button',
            platform: 'react',
          })
        );
      }

      await Promise.all(batchPromises);

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should cache template compilation', async () => {
      const options1 = {
        name: 'CacheTest1',
        type: 'button',
        platform: 'react',
      };

      const options2 = {
        name: 'CacheTest2',
        type: 'button', // Same type, should use cached template
        platform: 'react',
      };

      const startTime1 = Date.now();
      await generator.generate(options1);
      const duration1 = Date.now() - startTime1;

      const startTime2 = Date.now();
      await generator.generate(options2);
      const duration2 = Date.now() - startTime2;

      // Second generation should be faster due to caching
      expect(duration2).toBeLessThan(duration1);
    });
  });
});