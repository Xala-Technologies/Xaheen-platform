/**
 * @fileoverview Frontend Scaffold E2E Tests - EPIC 13 Story 13.7
 * @description E2E-test full 'xaheen scaffold frontend' workflow
 * @version 1.0.0
 * @compliance Enterprise Security, Norwegian NSM Standards
 */

import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { join } from 'path';
import fs from 'fs-extra';
import { execSync } from 'child_process';
import { TestFileSystem, CLITestRunner, PerformanceTracker } from "../test-helpers";

// Mock external CLI dependencies
vi.mock('execa', async () => {
  const actual = await vi.importActual('execa');
  return {
    ...actual,
    execa: vi.fn().mockImplementation(async (command, args, options) => {
      // Mock npm/yarn commands
      if (command === 'npm' || command === 'yarn') {
        if (args?.includes('install')) {
          return { stdout: 'Dependencies installed successfully', stderr: '', exitCode: 0 };
        }
        if (args?.includes('run')) {
          if (args.includes('build')) {
            return { stdout: 'Build completed successfully', stderr: '', exitCode: 0 };
          }
          if (args.includes('test')) {
            return { stdout: 'All tests passed', stderr: '', exitCode: 0 };
          }
          if (args.includes('dev')) {
            return { stdout: 'Development server started', stderr: '', exitCode: 0 };
          }
        }
      }
      
      // Mock git commands
      if (command === 'git') {
        if (args?.includes('init')) {
          return { stdout: 'Initialized git repository', stderr: '', exitCode: 0 };
        }
        if (args?.includes('add')) {
          return { stdout: '', stderr: '', exitCode: 0 };
        }
        if (args?.includes('commit')) {
          return { stdout: 'Changes committed', stderr: '', exitCode: 0 };
        }
      }

      // Default mock
      return { stdout: 'Command executed', stderr: '', exitCode: 0 };
    }),
  };
});

describe('Frontend Scaffold E2E Tests', () => {
  let testFs: TestFileSystem;
  let testDir: string;
  let cliRunner: CLITestRunner;
  let perfTracker: PerformanceTracker;

  beforeEach(async () => {
    testFs = new TestFileSystem();
    testDir = await testFs.createTempDir('frontend-e2e-');
    cliRunner = new CLITestRunner();
    perfTracker = new PerformanceTracker();

    // Ensure CLI is built
    try {
      execSync('npm run build', { 
        cwd: join(__dirname, '../../../..'),
        stdio: 'pipe'
      });
    } catch (error) {
      console.warn('CLI build failed, using existing build');
    }
  });

  afterEach(async () => {
    await testFs.restore();
    vi.clearAllMocks();
  });

  describe('Complete Frontend Scaffold Workflow', () => {
    it('should scaffold a complete React frontend project', async () => {
      const endMeasurement = perfTracker.startMeasurement('complete-scaffold');

      // Step 1: Initialize project
      const initResult = await cliRunner.runCommand(['scaffold', 'frontend', 'react-app'], {
        cwd: testDir,
        env: {
          XAHEEN_NO_INTERACTIVE: 'true',
          XAHEEN_NO_INSTALL: 'true', // Skip npm install for faster testing
        },
      });

      expect(initResult.exitCode).toBe(0);
      expect(initResult.stdout).toContain('Frontend project scaffolded');

      // Verify project structure
      const projectPath = join(testDir, 'react-app');
      
      await expect(fs.pathExists(join(projectPath, 'package.json'))).resolves.toBe(true);
      await expect(fs.pathExists(join(projectPath, 'src/App.tsx'))).resolves.toBe(true);
      await expect(fs.pathExists(join(projectPath, 'src/index.tsx'))).resolves.toBe(true);
      await expect(fs.pathExists(join(projectPath, 'public/index.html'))).resolves.toBe(true);

      // Step 2: Generate components
      const componentResult = await cliRunner.runCommand([
        'generate', 'component', 'UserCard',
        '--type', 'card',
        '--features', 'accessible,responsive,interactive'
      ], {
        cwd: projectPath,
      });

      expect(componentResult.exitCode).toBe(0);
      expect(componentResult.stdout).toContain('UserCard component generated');

      // Verify component files
      await expect(fs.pathExists(join(projectPath, 'src/components/UserCard.tsx'))).resolves.toBe(true);
      await expect(fs.pathExists(join(projectPath, 'src/components/UserCard.test.tsx'))).resolves.toBe(true);
      await expect(fs.pathExists(join(projectPath, 'src/components/UserCard.stories.tsx'))).resolves.toBe(true);

      // Step 3: Generate layout
      const layoutResult = await cliRunner.runCommand([
        'generate', 'layout', 'AdminLayout',
        '--type', 'admin',
        '--features', 'sidebar,header,footer'
      ], {
        cwd: projectPath,
      });

      expect(layoutResult.exitCode).toBe(0);
      expect(layoutResult.stdout).toContain('AdminLayout layout generated');

      // Verify layout files
      await expect(fs.pathExists(join(projectPath, 'src/layouts/AdminLayout.tsx'))).resolves.toBe(true);

      // Step 4: Generate pages
      const pageResult = await cliRunner.runCommand([
        'generate', 'page', 'DashboardPage',
        '--template', 'dashboard',
        '--sections', 'header,stats,charts'
      ], {
        cwd: projectPath,
      });

      expect(pageResult.exitCode).toBe(0);
      expect(pageResult.stdout).toContain('DashboardPage page generated');

      // Verify page files
      await expect(fs.pathExists(join(projectPath, 'src/pages/DashboardPage.tsx'))).resolves.toBe(true);

      // Step 5: Run build (mocked)
      const buildResult = await cliRunner.runCommand(['build'], {
        cwd: projectPath,
      });

      expect(buildResult.exitCode).toBe(0);

      // Step 6: Run tests (mocked)
      const testResult = await cliRunner.runCommand(['test'], {
        cwd: projectPath,
      });

      expect(testResult.exitCode).toBe(0);

      const totalTime = endMeasurement();
      expect(totalTime).toBeLessThan(30000); // Should complete within 30 seconds

      // Verify final project structure
      const finalStructure = await getProjectStructure(projectPath);
      expect(finalStructure).toMatchObject({
        'package.json': expect.any(Object),
        src: {
          'App.tsx': expect.any(String),
          'index.tsx': expect.any(String),
          components: {
            'UserCard.tsx': expect.any(String),
            'UserCard.test.tsx': expect.any(String),
            'UserCard.stories.tsx': expect.any(String),
          },
          layouts: {
            'AdminLayout.tsx': expect.any(String),
          },
          pages: {
            'DashboardPage.tsx': expect.any(String),
          },
        },
        public: {
          'index.html': expect.any(String),
        },
      });
    });

    it('should scaffold Next.js project with TypeScript', async () => {
      const initResult = await cliRunner.runCommand([
        'scaffold', 'frontend', 'nextjs-app',
        '--framework', 'nextjs',
        '--typescript',
        '--tailwind',
        '--eslint'
      ], {
        cwd: testDir,
        env: {
          XAHEEN_NO_INTERACTIVE: 'true',
          XAHEEN_NO_INSTALL: 'true',
        },
      });

      expect(initResult.exitCode).toBe(0);
      expect(initResult.stdout).toContain('Next.js project scaffolded');

      const projectPath = join(testDir, 'nextjs-app');

      // Verify Next.js specific files
      await expect(fs.pathExists(join(projectPath, 'next.config.js'))).resolves.toBe(true);
      await expect(fs.pathExists(join(projectPath, 'tsconfig.json'))).resolves.toBe(true);
      await expect(fs.pathExists(join(projectPath, 'tailwind.config.js'))).resolves.toBe(true);
      await expect(fs.pathExists(join(projectPath, '.eslintrc.json'))).resolves.toBe(true);

      // Verify Next.js app directory structure
      await expect(fs.pathExists(join(projectPath, 'src/app/layout.tsx'))).resolves.toBe(true);
      await expect(fs.pathExists(join(projectPath, 'src/app/page.tsx'))).resolves.toBe(true);

      // Generate Next.js specific components
      const componentResult = await cliRunner.runCommand([
        'generate', 'component', 'ServerComponent',
        '--nextjs',
        '--server-component'
      ], {
        cwd: projectPath,
      });

      expect(componentResult.exitCode).toBe(0);

      // Verify server component
      const serverComponentContent = await fs.readFile(
        join(projectPath, 'src/components/ServerComponent.tsx'),
        'utf-8'
      );
      expect(serverComponentContent).toContain('// Server Component');
      expect(serverComponentContent).not.toContain('useState');
      expect(serverComponentContent).not.toContain('useEffect');
    });

    it('should scaffold Vue.js project with Composition API', async () => {
      const initResult = await cliRunner.runCommand([
        'scaffold', 'frontend', 'vue-app',
        '--framework', 'vue',
        '--composition-api',
        '--typescript'
      ], {
        cwd: testDir,
        env: {
          XAHEEN_NO_INTERACTIVE: 'true',
          XAHEEN_NO_INSTALL: 'true',
        },
      });

      expect(initResult.exitCode).toBe(0);
      expect(initResult.stdout).toContain('Vue.js project scaffolded');

      const projectPath = join(testDir, 'vue-app');

      // Verify Vue.js specific files
      await expect(fs.pathExists(join(projectPath, 'vite.config.ts'))).resolves.toBe(true);
      await expect(fs.pathExists(join(projectPath, 'src/App.vue'))).resolves.toBe(true);
      await expect(fs.pathExists(join(projectPath, 'src/main.ts'))).resolves.toBe(true);

      // Generate Vue component
      const componentResult = await cliRunner.runCommand([
        'generate', 'component', 'VueCard',
        '--type', 'card'
      ], {
        cwd: projectPath,
      });

      expect(componentResult.exitCode).toBe(0);

      // Verify Vue component structure
      const vueComponentContent = await fs.readFile(
        join(projectPath, 'src/components/VueCard.vue'),
        'utf-8'
      );
      expect(vueComponentContent).toContain('<template>');
      expect(vueComponentContent).toContain('<script setup lang="ts">');
      expect(vueComponentContent).toContain('</script>');
    });

    it('should handle Norwegian localization setup', async () => {
      const initResult = await cliRunner.runCommand([
        'scaffold', 'frontend', 'norsk-app',
        '--locale', 'nb-NO',
        '--i18n'
      ], {
        cwd: testDir,
        env: {
          XAHEEN_NO_INTERACTIVE: 'true',
          XAHEEN_NO_INSTALL: 'true',
        },
      });

      expect(initResult.exitCode).toBe(0);
      expect(initResult.stdout).toContain('Norwegian localization configured');

      const projectPath = join(testDir, 'norsk-app');

      // Verify i18n setup
      await expect(fs.pathExists(join(projectPath, 'src/locales/nb-NO.json'))).resolves.toBe(true);
      await expect(fs.pathExists(join(projectPath, 'src/i18n/index.ts'))).resolves.toBe(true);

      // Verify Norwegian locale configuration
      const localeContent = await fs.readFile(
        join(projectPath, 'src/locales/nb-NO.json'),
        'utf-8'
      );
      const locale = JSON.parse(localeContent);
      expect(locale).toHaveProperty('common');
      expect(locale.common.welcome).toBe('Velkommen');

      // Generate component with Norwegian localization
      const componentResult = await cliRunner.runCommand([
        'generate', 'component', 'NorskKnapp',
        '--locale', 'nb-NO'
      ], {
        cwd: projectPath,
      });

      expect(componentResult.exitCode).toBe(0);

      const componentContent = await fs.readFile(
        join(projectPath, 'src/components/NorskKnapp.tsx'),
        'utf-8'
      );
      expect(componentContent).toContain('useTranslation');
      expect(componentContent).toContain('nb-NO');
    });
  });

  describe('Interactive Scaffold Workflows', () => {
    it('should handle interactive project setup', async () => {
      const interactiveInputs = [
        'react-interactive',      // Project name
        '2',                      // React framework (option 2)
        'y',                      // TypeScript
        'y',                      // Tailwind CSS
        'y',                      // ESLint
        'y',                      // Prettier
        'n',                      // Storybook (skip for speed)
        'y',                      // Git initialization
      ];

      const result = await cliRunner.runInteractiveCommand(
        ['scaffold', 'frontend'],
        interactiveInputs,
        {
          cwd: testDir,
          env: {
            XAHEEN_NO_INSTALL: 'true',
          },
        }
      );

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Project setup complete');

      const projectPath = join(testDir, 'react-interactive');
      
      // Verify all selected features were configured
      await expect(fs.pathExists(join(projectPath, 'tsconfig.json'))).resolves.toBe(true);
      await expect(fs.pathExists(join(projectPath, 'tailwind.config.js'))).resolves.toBe(true);
      await expect(fs.pathExists(join(projectPath, '.eslintrc.json'))).resolves.toBe(true);
      await expect(fs.pathExists(join(projectPath, '.prettierrc'))).resolves.toBe(true);
      await expect(fs.pathExists(join(projectPath, '.git'))).resolves.toBe(true);
    });

    it('should validate user inputs during interactive setup', async () => {
      const invalidInputs = [
        '',                       // Empty project name (invalid)
        'valid-project',          // Valid project name
        '99',                     // Invalid framework option
        '1',                      // Valid framework option (React)
        'maybe',                  // Invalid boolean response
        'y',                      // Valid boolean response
      ];

      const result = await cliRunner.runInteractiveCommand(
        ['scaffold', 'frontend'],
        invalidInputs,
        {
          cwd: testDir,
          env: {
            XAHEEN_NO_INSTALL: 'true',
          },
        }
      );

      expect(result.stdout).toContain('Please enter a valid project name');
      expect(result.stdout).toContain('Please select a valid option');
      expect(result.stdout).toContain('Please enter y or n');
    });
  });

  describe('Template Integration Tests', () => {
    it('should integrate with custom templates', async () => {
      // Create custom template directory
      const customTemplatesDir = join(testDir, 'custom-templates');
      await fs.ensureDir(customTemplatesDir);

      // Create custom component template
      const customComponentTemplate = `import React from 'react';

interface {{pascalCase name}}Props {
  readonly customProp: string;
  readonly children: React.ReactNode;
}

export const {{pascalCase name}} = ({ customProp, children }: {{pascalCase name}}Props): JSX.Element => {
  return (
    <div className="custom-component" data-custom-prop={customProp}>
      <h2>Custom: {customProp}</h2>
      {children}
    </div>
  );
};`;

      await fs.writeFile(
        join(customTemplatesDir, 'custom-component.hbs'),
        customComponentTemplate
      );

      // Scaffold project with custom templates
      const initResult = await cliRunner.runCommand([
        'scaffold', 'frontend', 'custom-app',
        '--templates', customTemplatesDir
      ], {
        cwd: testDir,
        env: {
          XAHEEN_NO_INTERACTIVE: 'true',
          XAHEEN_NO_INSTALL: 'true',
        },
      });

      expect(initResult.exitCode).toBe(0);

      const projectPath = join(testDir, 'custom-app');

      // Generate component using custom template
      const componentResult = await cliRunner.runCommand([
        'generate', 'component', 'CustomWidget',
        '--template', 'custom-component'
      ], {
        cwd: projectPath,
      });

      expect(componentResult.exitCode).toBe(0);

      // Verify custom template was used
      const componentContent = await fs.readFile(
        join(projectPath, 'src/components/CustomWidget.tsx'),
        'utf-8'
      );
      expect(componentContent).toContain('data-custom-prop={customProp}');
      expect(componentContent).toContain('Custom: {customProp}');
    });

    it('should handle template inheritance and composition', async () => {
      const baseTemplateDir = join(testDir, 'base-templates');
      const extendedTemplateDir = join(testDir, 'extended-templates');
      
      await fs.ensureDir(baseTemplateDir);
      await fs.ensureDir(extendedTemplateDir);

      // Create base template
      const baseTemplate = `import React from 'react';

// Base component template
export const {{pascalCase name}} = (): JSX.Element => {
  return (
    <div className="base-component">
      {{#block "content"}}
      Default content
      {{/block}}
    </div>
  );
};`;

      await fs.writeFile(join(baseTemplateDir, 'base.hbs'), baseTemplate);

      // Create extended template
      const extendedTemplate = `{{#extend "base"}}
  {{#content "content"}}
  <h1>Extended Component: {{name}}</h1>
  <p>This extends the base template.</p>
  {{/content}}
{{/extend}}`;

      await fs.writeFile(join(extendedTemplateDir, 'extended.hbs'), extendedTemplate);

      // Test template composition
      const initResult = await cliRunner.runCommand([
        'scaffold', 'frontend', 'composition-app',
        '--base-templates', baseTemplateDir,
        '--templates', extendedTemplateDir
      ], {
        cwd: testDir,
        env: {
          XAHEEN_NO_INTERACTIVE: 'true',
          XAHEEN_NO_INSTALL: 'true',
        },
      });

      expect(initResult.exitCode).toBe(0);
    });
  });

  describe('Plugin System Integration', () => {
    it('should integrate with CLI plugins', async () => {
      // Create mock plugin
      const pluginDir = join(testDir, 'test-plugin');
      await fs.ensureDir(pluginDir);

      const pluginContent = `
module.exports = {
  name: 'test-plugin',
  version: '1.0.0',
  generators: {
    'special-component': {
      description: 'Generate a special component',
      template: 'special-component.hbs',
      outputPath: 'src/components/special'
    }
  },
  hooks: {
    beforeGenerate: (context) => {
      context.pluginData = 'from test plugin';
    }
  }
};`;

      await fs.writeFile(join(pluginDir, 'index.js'), pluginContent);

      // Install plugin
      const pluginResult = await cliRunner.runCommand([
        'plugin', 'install', pluginDir
      ], {
        cwd: testDir,
      });

      expect(pluginResult.exitCode).toBe(0);

      // Scaffold project
      const initResult = await cliRunner.runCommand([
        'scaffold', 'frontend', 'plugin-app'
      ], {
        cwd: testDir,
        env: {
          XAHEEN_NO_INTERACTIVE: 'true',
          XAHEEN_NO_INSTALL: 'true',
        },
      });

      expect(initResult.exitCode).toBe(0);

      const projectPath = join(testDir, 'plugin-app');

      // Use plugin generator
      const generateResult = await cliRunner.runCommand([
        'generate', 'special-component', 'PluginComponent'
      ], {
        cwd: projectPath,
      });

      expect(generateResult.exitCode).toBe(0);
      expect(generateResult.stdout).toContain('PluginComponent generated');
    });
  });

  describe('Error Recovery and Rollback', () => {
    it('should rollback on scaffold failure', async () => {
      // Create scenario that will fail during scaffold
      const result = await cliRunner.runCommand([
        'scaffold', 'frontend', 'failing-app',
        '--framework', 'nonexistent-framework'
      ], {
        cwd: testDir,
        expectError: true,
        env: {
          XAHEEN_NO_INTERACTIVE: 'true',
        },
      });

      expect(result.exitCode).not.toBe(0);
      expect(result.stderr).toContain('Unsupported framework');

      // Verify no partial project was left behind
      const projectPath = join(testDir, 'failing-app');
      const exists = await fs.pathExists(projectPath);
      expect(exists).toBe(false);
    });

    it('should handle filesystem permission errors', async () => {
      // Create read-only directory to trigger permission error
      const readOnlyDir = join(testDir, 'readonly');
      await fs.ensureDir(readOnlyDir);
      await fs.chmod(readOnlyDir, 0o444); // Read-only

      const result = await cliRunner.runCommand([
        'scaffold', 'frontend', 'permission-test'
      ], {
        cwd: readOnlyDir,
        expectError: true,
        env: {
          XAHEEN_NO_INTERACTIVE: 'true',
        },
      });

      expect(result.exitCode).not.toBe(0);
      expect(result.stderr).toContain('permission denied');
    });

    it('should recover from network failures during dependency installation', async () => {
      // Mock network failure during npm install
      const { execa } = await import('execa');
      (execa as any).mockImplementation(async (command: string, args: string[]) => {
        if (command === 'npm' && args?.includes('install')) {
          throw new Error('Network error: ENOTFOUND registry.npmjs.org');
        }
        return { stdout: 'Command executed', stderr: '', exitCode: 0 };
      });

      const result = await cliRunner.runCommand([
        'scaffold', 'frontend', 'network-fail-app'
      ], {
        cwd: testDir,
        expectError: true,
        env: {
          XAHEEN_NO_INTERACTIVE: 'true',
        },
      });

      expect(result.exitCode).not.toBe(0);
      expect(result.stderr).toContain('Failed to install dependencies');
      expect(result.stderr).toContain('You can install them manually');

      // Project structure should still be created
      const projectPath = join(testDir, 'network-fail-app');
      await expect(fs.pathExists(join(projectPath, 'package.json'))).resolves.toBe(true);
    });
  });

  describe('Performance and Scale Tests', () => {
    it('should handle large project scaffolding efficiently', async () => {
      const startTime = Date.now();

      const result = await cliRunner.runCommand([
        'scaffold', 'frontend', 'large-app',
        '--preset', 'enterprise',
        '--components', '50',
        '--pages', '20',
        '--layouts', '10'
      ], {
        cwd: testDir,
        timeout: 60000, // 60 second timeout
        env: {
          XAHEEN_NO_INTERACTIVE: 'true',
          XAHEEN_NO_INSTALL: 'true',
        },
      });

      const duration = Date.now() - startTime;

      expect(result.exitCode).toBe(0);
      expect(duration).toBeLessThan(45000); // Should complete within 45 seconds

      const projectPath = join(testDir, 'large-app');

      // Verify large project structure
      const componentsDir = join(projectPath, 'src/components');
      const componentFiles = await fs.readdir(componentsDir);
      expect(componentFiles.length).toBeGreaterThan(40);

      const pagesDir = join(projectPath, 'src/pages');
      const pageFiles = await fs.readdir(pagesDir);
      expect(pageFiles.length).toBeGreaterThan(15);
    });

    it('should maintain performance during concurrent scaffolding', async () => {
      const concurrentPromises = [];

      for (let i = 0; i < 5; i++) {
        concurrentPromises.push(
          cliRunner.runCommand([
            'scaffold', 'frontend', `concurrent-app-${i}`,
            '--framework', i % 2 === 0 ? 'react' : 'vue'
          ], {
            cwd: testDir,
            env: {
              XAHEEN_NO_INTERACTIVE: 'true',
              XAHEEN_NO_INSTALL: 'true',
            },
          })
        );
      }

      const startTime = Date.now();
      const results = await Promise.all(concurrentPromises);
      const duration = Date.now() - startTime;

      // All should succeed
      results.forEach((result, index) => {
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain(`concurrent-app-${index}`);
      });

      // Should handle concurrency efficiently
      expect(duration).toBeLessThan(60000); // Within 60 seconds for 5 concurrent scaffolds
    });
  });

  // Helper function to get project structure
  async function getProjectStructure(projectPath: string): Promise<any> {
    const structure: any = {};

    async function traverse(currentPath: string, currentStructure: any): Promise<void> {
      const items = await fs.readdir(currentPath);

      for (const item of items) {
        const itemPath = join(currentPath, item);
        const stat = await fs.stat(itemPath);

        if (stat.isDirectory()) {
          currentStructure[item] = {};
          await traverse(itemPath, currentStructure[item]);
        } else {
          try {
            const content = await fs.readFile(itemPath, 'utf-8');
            
            // For JSON files, parse them
            if (item.endsWith('.json')) {
              currentStructure[item] = JSON.parse(content);
            } else {
              currentStructure[item] = content;
            }
          } catch {
            // Binary or problematic files
            currentStructure[item] = '<binary>';
          }
        }
      }
    }

    await traverse(projectPath, structure);
    return structure;
  }
});