/**
 * @fileoverview CLI Integration Test Suite
 * @description End-to-end integration tests for the Xala CLI
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
const execAsync = promisify(exec);

describe.skip('CLI Integration Tests (Requires built CLI)', () => {
  let testProjectDir: string;
  let originalCwd: string;

  beforeAll(async () => {
    // Store original working directory
    originalCwd = process.cwd();
    
    // Create test project directory
    testProjectDir = path.join(process.cwd(), 'temp-integration-test');
    await fs.mkdir(testProjectDir, { recursive: true });
  });

  afterAll(async () => {
    // Clean up test directory
    process.chdir(originalCwd);
    await fs.rm(testProjectDir, { recursive: true, force: true });
  });

  beforeEach(async () => {
    // Clear test directory for each test
    const files = await fs.readdir(testProjectDir);
    for (const file of files) {
      await fs.rm(path.join(testProjectDir, file), { recursive: true, force: true });
    }
  });

  describe('Project Initialization', () => {
    it('should initialize a new React project', async () => {
      const { stdout, stderr } = await execAsync(
        `xala init test-app --platform react --template saas --no-install`,
        { cwd: testProjectDir }
      );

      expect(stderr).toBe('');
      expect(stdout).toContain('Project initialized successfully');

      // Verify project structure
      const projectPath = path.join(testProjectDir, 'test-app');
      const stats = await fs.stat(projectPath);
      expect(stats.isDirectory()).toBe(true);

      // Check for essential files
      const packageJson = await fs.readFile(
        path.join(projectPath, 'package.json'),
        'utf-8'
      );
      const pkg = JSON.parse(packageJson);
      expect(pkg.name).toBe('test-app');
      expect(pkg.dependencies).toBeDefined();
    });

    it('should initialize with healthcare template', async () => {
      const { stdout } = await execAsync(
        `xala init medical-app --platform react --template healthcare --industry healthcare --no-install`,
        { cwd: testProjectDir }
      );

      expect(stdout).toContain('Healthcare template applied');

      // Check for healthcare-specific configurations
      const configPath = path.join(testProjectDir, 'medical-app', 'xala.config.js');
      const configContent = await fs.readFile(configPath, 'utf-8');
      expect(configContent).toContain('industry: "healthcare"');
      expect(configContent).toContain('accessibility');
    });

    it('should support multi-platform initialization', async () => {
      const platforms = ['react', 'vue', 'angular'];
      
      for (const platform of platforms) {
        const { stdout } = await execAsync(
          `xala init ${platform}-app --platform ${platform} --no-install`,
          { cwd: testProjectDir }
        );
        
        expect(stdout).toContain(`${platform} project initialized`);
      }
    });
  });

  describe('Component Generation', () => {
    beforeEach(async () => {
      // Initialize a test project for component generation
      await execAsync(
        `xala init test-project --platform react --no-install --quiet`,
        { cwd: testProjectDir }
      );
      process.chdir(path.join(testProjectDir, 'test-project'));
    });

    it('should generate a button component from template', async () => {
      const { stdout } = await execAsync('xala generate component Button --template button');
      
      expect(stdout).toContain('Button component generated');
      
      // Verify component file
      const componentPath = path.join(process.cwd(), 'src', 'components', 'Button.tsx');
      const componentContent = await fs.readFile(componentPath, 'utf-8');
      
      // Check for v5.0 architecture compliance
      expect(componentContent).toContain('forwardRef');
      expect(componentContent).toContain('buttonVariants');
      expect(componentContent).not.toContain('useState');
      expect(componentContent).not.toContain('useEffect');
      expect(componentContent).not.toContain('useTokens');
    });

    it('should generate multiple components in batch', async () => {
      const components = ['Button', 'Input', 'Card', 'Modal'];
      
      const { stdout } = await execAsync(
        `xala generate components ${components.join(' ')} --templates`
      );
      
      for (const component of components) {
        expect(stdout).toContain(`${component} generated`);
        
        const filePath = path.join(process.cwd(), 'src', 'components', `${component}.tsx`);
        const exists = await fs.access(filePath).then(() => true).catch(() => false);
        expect(exists).toBe(true);
      }
    });

    it('should generate component with AI assistance', async () => {
      const { stdout } = await execAsync(
        'xala ai generate "user profile card with avatar and edit button" --simple'
      );
      
      expect(stdout).toContain('Component generated');
      expect(stdout).toContain('UserProfileCard');
    });

    it('should generate form with validation', async () => {
      const { stdout } = await execAsync(
        'xala generate component LoginForm --template form --features validation,submit'
      );
      
      expect(stdout).toContain('LoginForm generated');
      
      const componentPath = path.join(process.cwd(), 'src', 'components', 'LoginForm.tsx');
      const content = await fs.readFile(componentPath, 'utf-8');
      
      expect(content).toContain('FormField');
      expect(content).toContain('validation');
      expect(content).toContain('onSubmit');
    });
  });

  describe('Theme Management', () => {
    beforeEach(async () => {
      await execAsync(
        `xala init theme-test --platform react --no-install --quiet`,
        { cwd: testProjectDir }
      );
      process.chdir(path.join(testProjectDir, 'theme-test'));
    });

    it('should create a custom theme', async () => {
      const { stdout } = await execAsync(
        'xala themes create custom-theme --colors primary=#0066cc,secondary=#ff6600'
      );
      
      expect(stdout).toContain('Theme "custom-theme" created');
      
      // Verify theme file
      const themePath = path.join(process.cwd(), 'src', 'themes', 'custom-theme.json');
      const themeContent = await fs.readFile(themePath, 'utf-8');
      const theme = JSON.parse(themeContent);
      
      expect(theme.colors.primary).toBe('#0066cc');
      expect(theme.colors.secondary).toBe('#ff6600');
    });

    it('should apply an existing theme', async () => {
      // First create a theme
      await execAsync('xala themes create test-theme --colors primary=#000000');
      
      // Then apply it
      const { stdout } = await execAsync('xala themes apply test-theme');
      
      expect(stdout).toContain('Theme "test-theme" applied');
      
      // Check that CSS variables are updated
      const cssPath = path.join(process.cwd(), 'src', 'styles', 'theme.css');
      const cssContent = await fs.readFile(cssPath, 'utf-8');
      expect(cssContent).toContain('--color-primary: #000000');
    });

    it('should create industry-specific theme', async () => {
      const { stdout } = await execAsync(
        'xala themes create healthcare-theme --industry healthcare --accessibility AAA'
      );
      
      expect(stdout).toContain('Healthcare theme created');
      expect(stdout).toContain('WCAG AAA compliant');
    });
  });

  describe('Build and Optimization', () => {
    beforeEach(async () => {
      await execAsync(
        `xala init build-test --platform react --no-install --quiet`,
        { cwd: testProjectDir }
      );
      process.chdir(path.join(testProjectDir, 'build-test'));
    });

    it('should build the project', async () => {
      const { stdout } = await execAsync('xala build --no-install');
      
      expect(stdout).toContain('Build completed');
      
      // Check for build output
      const distPath = path.join(process.cwd(), 'dist');
      const exists = await fs.access(distPath).then(() => true).catch(() => false);
      expect(exists).toBe(true);
    }, 30000); // Extended timeout for build

    it('should analyze bundle size', async () => {
      const { stdout } = await execAsync('xala build --analyze --no-install');
      
      expect(stdout).toContain('Bundle analysis');
      expect(stdout).toMatch(/Total size: \d+(\.\d+)?[KM]B/);
    }, 30000);

    it('should optimize for production', async () => {
      const { stdout } = await execAsync('xala build --optimize --production');
      
      expect(stdout).toContain('Production build');
      expect(stdout).toContain('Optimization complete');
      expect(stdout).toMatch(/Reduced size by \d+%/);
    }, 30000);
  });

  describe('Compliance and Validation', () => {
    beforeEach(async () => {
      await execAsync(
        `xala init compliance-test --platform react --no-install --quiet`,
        { cwd: testProjectDir }
      );
      process.chdir(path.join(testProjectDir, 'compliance-test'));
      
      // Generate some components for testing
      await execAsync('xala generate component TestButton --template button');
      await execAsync('xala generate component TestForm --template form');
    });

    it('should validate accessibility compliance', async () => {
      const { stdout } = await execAsync('xala analyze --accessibility');
      
      expect(stdout).toContain('Accessibility Analysis');
      expect(stdout).toContain('WCAG');
      expect(stdout).toMatch(/Compliance: (PASS|WARNING)/);
    });

    it('should validate Norwegian compliance', async () => {
      const { stdout } = await execAsync('xala analyze --compliance norwegian');
      
      expect(stdout).toContain('Norwegian Compliance Check');
      expect(stdout).toContain('NSM');
      expect(stdout).toContain('GDPR');
    });

    it('should validate TypeScript strict mode', async () => {
      const { stdout } = await execAsync('xala analyze --typescript');
      
      expect(stdout).toContain('TypeScript Analysis');
      expect(stdout).toContain('No "any" types found');
      expect(stdout).toContain('Strict mode: enabled');
    });

    it('should validate performance metrics', async () => {
      const { stdout } = await execAsync('xala analyze --performance');
      
      expect(stdout).toContain('Performance Analysis');
      expect(stdout).toMatch(/Bundle size: \d+(\.\d+)?[KM]B/);
      expect(stdout).toMatch(/Components: \d+/);
      expect(stdout).toContain('Recommendations');
    });
  });

  describe('Multi-Platform Support', () => {
    it('should generate React component', async () => {
      await execAsync(
        `xala init react-test --platform react --no-install --quiet`,
        { cwd: testProjectDir }
      );
      
      const { stdout } = await execAsync(
        'xala generate component Card --platform react',
        { cwd: path.join(testProjectDir, 'react-test') }
      );
      
      expect(stdout).toContain('React component generated');
      
      const componentPath = path.join(testProjectDir, 'react-test', 'src', 'components', 'Card.tsx');
      const content = await fs.readFile(componentPath, 'utf-8');
      expect(content).toContain('React.FC');
    });

    it('should generate Vue component', async () => {
      await execAsync(
        `xala init vue-test --platform vue --no-install --quiet`,
        { cwd: testProjectDir }
      );
      
      const { stdout } = await execAsync(
        'xala generate component Card --platform vue',
        { cwd: path.join(testProjectDir, 'vue-test') }
      );
      
      expect(stdout).toContain('Vue component generated');
      
      const componentPath = path.join(testProjectDir, 'vue-test', 'src', 'components', 'Card.vue');
      const content = await fs.readFile(componentPath, 'utf-8');
      expect(content).toContain('<template>');
      expect(content).toContain('<script setup>');
    });

    it('should generate Angular component', async () => {
      await execAsync(
        `xala init angular-test --platform angular --no-install --quiet`,
        { cwd: testProjectDir }
      );
      
      const { stdout } = await execAsync(
        'xala generate component Card --platform angular',
        { cwd: path.join(testProjectDir, 'angular-test') }
      );
      
      expect(stdout).toContain('Angular component generated');
      
      const componentPath = path.join(testProjectDir, 'angular-test', 'src', 'app', 'components', 'card', 'card.component.ts');
      const content = await fs.readFile(componentPath, 'utf-8');
      expect(content).toContain('@Component');
      expect(content).toContain('CardComponent');
    });

    it('should generate React Native component', async () => {
      await execAsync(
        `xala init rn-test --platform react-native --no-install --quiet`,
        { cwd: testProjectDir }
      );
      
      const { stdout } = await execAsync(
        'xala generate component Card --platform react-native',
        { cwd: path.join(testProjectDir, 'rn-test') }
      );
      
      expect(stdout).toContain('React Native component generated');
      
      const componentPath = path.join(testProjectDir, 'rn-test', 'src', 'components', 'Card.tsx');
      const content = await fs.readFile(componentPath, 'utf-8');
      expect(content).toContain('react-native');
      expect(content).toContain('StyleSheet');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing project gracefully', async () => {
      const { stderr } = await execAsync(
        'xala generate component Test',
        { cwd: testProjectDir }
      ).catch(e => e);
      
      expect(stderr).toContain('No xala.config.js found');
      expect(stderr).toContain('Run "xala init" first');
    });

    it('should handle invalid platform', async () => {
      const { stderr } = await execAsync(
        'xala init test --platform invalid-platform',
        { cwd: testProjectDir }
      ).catch(e => e);
      
      expect(stderr).toContain('Invalid platform');
      expect(stderr).toContain('Supported platforms:');
    });

    it('should handle network errors gracefully', async () => {
      // Simulate network error by using invalid API endpoint
      const { stderr } = await execAsync(
        'xala ai generate "test" --api-endpoint http://invalid.endpoint',
        { cwd: testProjectDir }
      ).catch(e => e);
      
      expect(stderr).toContain('Network error');
      expect(stderr).toContain('Falling back to template');
    });
  });

  describe('CLI Help and Documentation', () => {
    it('should show help information', async () => {
      const { stdout } = await execAsync('xala --help');
      
      expect(stdout).toContain('Usage: xala [command] [options]');
      expect(stdout).toContain('Commands:');
      expect(stdout).toContain('init');
      expect(stdout).toContain('generate');
      expect(stdout).toContain('build');
    });

    it('should show version information', async () => {
      const { stdout } = await execAsync('xala --version');
      
      expect(stdout).toMatch(/\d+\.\d+\.\d+/);
    });

    it('should show command-specific help', async () => {
      const { stdout } = await execAsync('xala generate --help');
      
      expect(stdout).toContain('Generate components');
      expect(stdout).toContain('Options:');
      expect(stdout).toContain('--template');
      expect(stdout).toContain('--platform');
    });

    it('should provide examples', async () => {
      const { stdout } = await execAsync('xala examples component');
      
      expect(stdout).toContain('Component Examples');
      expect(stdout).toContain('xala generate component');
    });
  });

  describe('Development Server', () => {
    it('should start development server', async () => {
      await execAsync(
        `xala init dev-test --platform react --no-install --quiet`,
        { cwd: testProjectDir }
      );
      
      // Start dev server in background
      const devProcess = exec(
        'xala dev --port 3456',
        { cwd: path.join(testProjectDir, 'dev-test') }
      );
      
      // Wait for server to start
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Check if server is running
      const response = await fetch('http://localhost:3456').catch(() => null);
      expect(response).toBeTruthy();
      
      // Clean up
      devProcess.kill();
    }, 10000);
  });

  describe('AI Integration', () => {
    it('should handle AI generation with fallback', async () => {
      await execAsync(
        `xala init ai-test --platform react --no-install --quiet`,
        { cwd: testProjectDir }
      );
      
      const { stdout } = await execAsync(
        'xala ai generate "complex dashboard" --model-size 7b --fallback',
        { cwd: path.join(testProjectDir, 'ai-test') }
      );
      
      expect(stdout).toContain('Generated');
      // Should either use AI or fallback to template
      expect(stdout).toMatch(/(AI generated|Template fallback)/);
    });

    it('should optimize prompts for model size', async () => {
      const { stdout } = await execAsync(
        'xala ai optimize-prompt "Create a complex real-time dashboard with WebSocket updates" --model-size 7b'
      );
      
      const optimized = JSON.parse(stdout);
      expect(optimized.optimizedPrompt).toBeTruthy();
      expect(optimized.optimizedPrompt.length).toBeLessThan(200); // Should be simplified
    });
  });
});