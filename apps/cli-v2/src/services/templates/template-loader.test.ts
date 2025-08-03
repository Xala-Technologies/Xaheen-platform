/**
 * Template Loader Tests
 * 
 * Comprehensive test suite for the template loading system.
 * 
 * @author CLI Template Generator Agent
 * @since 2025-01-03
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs-extra';
import path from 'node:path';
import { TemplateLoader } from './template-loader.js';

describe('TemplateLoader', () => {
  let templateLoader: TemplateLoader;
  let tempDir: string;

  beforeEach(async () => {
    // Create a temporary directory for test templates
    tempDir = path.join(process.cwd(), 'test-templates');
    await fs.ensureDir(tempDir);
    
    // Mock the templates path
    templateLoader = new TemplateLoader();
    // @ts-ignore - accessing private property for testing
    templateLoader.templatesPath = tempDir;
  });

  afterEach(async () => {
    // Clean up temp directory
    await fs.remove(tempDir);
    templateLoader.clearCache();
  });

  describe('loadTemplate', () => {
    it('should load a simple template', async () => {
      const templateContent = 'Hello {{name}}!';
      const templatePath = 'test/simple.hbs';
      const fullPath = path.join(tempDir, templatePath);
      
      await fs.ensureDir(path.dirname(fullPath));
      await fs.writeFile(fullPath, templateContent);

      const template = await templateLoader.loadTemplate(templatePath);
      const result = template({ name: 'World' });
      
      expect(result).toBe('Hello World!');
    });

    it('should cache templates for performance', async () => {
      const templateContent = 'Cached {{value}}';
      const templatePath = 'test/cached.hbs';
      const fullPath = path.join(tempDir, templatePath);
      
      await fs.ensureDir(path.dirname(fullPath));
      await fs.writeFile(fullPath, templateContent);

      // First load
      const template1 = await templateLoader.loadTemplate(templatePath);
      const result1 = template1({ value: 'template' });
      
      // Second load (should be cached)
      const template2 = await templateLoader.loadTemplate(templatePath);
      const result2 = template2({ value: 'template' });
      
      expect(result1).toBe('Cached template');
      expect(result2).toBe('Cached template');
      expect(template1).toBe(template2); // Same cached instance
    });

    it('should reload template when file changes', async () => {
      const templatePath = 'test/changing.hbs';
      const fullPath = path.join(tempDir, templatePath);
      
      await fs.ensureDir(path.dirname(fullPath));
      await fs.writeFile(fullPath, 'Version 1: {{value}}');

      // First load
      const template1 = await templateLoader.loadTemplate(templatePath);
      const result1 = template1({ value: 'test' });
      expect(result1).toBe('Version 1: test');

      // Wait and change file
      await new Promise(resolve => setTimeout(resolve, 10));
      await fs.writeFile(fullPath, 'Version 2: {{value}}');

      // Second load should detect change
      const template2 = await templateLoader.loadTemplate(templatePath);
      const result2 = template2({ value: 'test' });
      expect(result2).toBe('Version 2: test');
    });

    it('should throw error for non-existent template', async () => {
      await expect(
        templateLoader.loadTemplate('non-existent/template.hbs')
      ).rejects.toThrow('Template not found: non-existent/template.hbs');
    });

    it('should handle templates with handlebars helpers', async () => {
      const templateContent = '{{capitalize name}} is {{uppercase status}}';
      const templatePath = 'test/helpers.hbs';
      const fullPath = path.join(tempDir, templatePath);
      
      await fs.ensureDir(path.dirname(fullPath));
      await fs.writeFile(fullPath, templateContent);

      const template = await templateLoader.loadTemplate(templatePath);
      const result = template({ name: 'john', status: 'active' });
      
      expect(result).toBe('John is ACTIVE');
    });
  });

  describe('renderTemplate', () => {
    it('should render template with context', async () => {
      const templateContent = 'Project: {{projectName}}, Framework: {{framework}}';
      const templatePath = 'test/context.hbs';
      const fullPath = path.join(tempDir, templatePath);
      
      await fs.ensureDir(path.dirname(fullPath));
      await fs.writeFile(fullPath, templateContent);

      const result = await templateLoader.renderTemplate(templatePath, {
        projectName: 'MyApp',
        framework: 'Next.js'
      });
      
      expect(result).toBe('Project: MyApp, Framework: Next.js');
    });

    it('should handle complex nested objects', async () => {
      const templateContent = `
{{#if config.auth}}
  Auth: {{config.auth.provider}}
  {{#each config.auth.providers}}
  - {{this}}
  {{/each}}
{{/if}}
`.trim();
      
      const templatePath = 'test/nested.hbs';
      const fullPath = path.join(tempDir, templatePath);
      
      await fs.ensureDir(path.dirname(fullPath));
      await fs.writeFile(fullPath, templateContent);

      const result = await templateLoader.renderTemplate(templatePath, {
        config: {
          auth: {
            provider: 'nextauth',
            providers: ['github', 'google', 'credentials']
          }
        }
      });
      
      expect(result).toContain('Auth: nextauth');
      expect(result).toContain('- github');
      expect(result).toContain('- google');
      expect(result).toContain('- credentials');
    });
  });

  describe('listTemplates', () => {
    it('should list all available templates', async () => {
      // Create test templates
      const templates = [
        'ai/files/openai.hbs',
        'ai/components/chat.hbs',
        'frontend/files/store.hbs',
        'backend/configs/server.hbs'
      ];

      for (const templatePath of templates) {
        const fullPath = path.join(tempDir, templatePath);
        await fs.ensureDir(path.dirname(fullPath));
        await fs.writeFile(fullPath, `// Template: ${templatePath}`);
      }

      const templateList = await templateLoader.listTemplates();
      
      expect(templateList).toHaveLength(4);
      expect(templateList.map(t => t.path)).toEqual(expect.arrayContaining(templates));
      
      // Check metadata
      const aiTemplate = templateList.find(t => t.path === 'ai/files/openai.hbs');
      expect(aiTemplate).toEqual({
        path: 'ai/files/openai.hbs',
        category: 'ai',
        type: 'files',
        lastModified: expect.any(Number)
      });
    });

    it('should handle empty template directory', async () => {
      const templateList = await templateLoader.listTemplates();
      expect(templateList).toHaveLength(0);
    });
  });

  describe('validateTemplate', () => {
    it('should validate correct template syntax', async () => {
      const templateContent = 'Hello {{name}}! {{#if active}}You are active{{/if}}';
      const templatePath = 'test/valid.hbs';
      const fullPath = path.join(tempDir, templatePath);
      
      await fs.ensureDir(path.dirname(fullPath));
      await fs.writeFile(fullPath, templateContent);

      const validation = await templateLoader.validateTemplate(templatePath);
      
      expect(validation.valid).toBe(true);
      expect(validation.error).toBeUndefined();
    });

    it('should detect invalid template syntax', async () => {
      const templateContent = 'Hello {{name! Missing closing brace';
      const templatePath = 'test/invalid.hbs';
      const fullPath = path.join(tempDir, templatePath);
      
      await fs.ensureDir(path.dirname(fullPath));
      await fs.writeFile(fullPath, templateContent);

      const validation = await templateLoader.validateTemplate(templatePath);
      
      expect(validation.valid).toBe(false);
      expect(validation.error).toBeDefined();
      expect(validation.error).toContain('Parse error');
    });
  });

  describe('Custom Handlebars Helpers', () => {
    it('should support string helpers', async () => {
      const templateContent = `
{{capitalize "hello world"}}
{{uppercase "quiet"}}
{{lowercase "LOUD"}}
{{camelCase "hello-world-test"}}
{{kebabCase "HelloWorldTest"}}
{{snakeCase "HelloWorldTest"}}
`.trim();
      
      const templatePath = 'test/string-helpers.hbs';
      const fullPath = path.join(tempDir, templatePath);
      
      await fs.ensureDir(path.dirname(fullPath));
      await fs.writeFile(fullPath, templateContent);

      const result = await templateLoader.renderTemplate(templatePath, {});
      const lines = result.split('\n');
      
      expect(lines[0]).toBe('Hello world');
      expect(lines[1]).toBe('QUIET');
      expect(lines[2]).toBe('loud');
      expect(lines[3]).toBe('helloWorldTest');
      expect(lines[4]).toBe('hello-world-test');
      expect(lines[5]).toBe('hello_world_test');
    });

    it('should support comparison helpers', async () => {
      const templateContent = `
{{#if (eq framework "react")}}React Framework{{/if}}
{{#if (gt version 2)}}Version > 2{{/if}}
{{#if (and isActive isPremium)}}Active Premium{{/if}}
{{#if (or isDev isStaging)}}Development Environment{{/if}}
`.trim();
      
      const templatePath = 'test/comparison-helpers.hbs';
      const fullPath = path.join(tempDir, templatePath);
      
      await fs.ensureDir(path.dirname(fullPath));
      await fs.writeFile(fullPath, templateContent);

      const result = await templateLoader.renderTemplate(templatePath, {
        framework: 'react',
        version: 3,
        isActive: true,
        isPremium: true,
        isDev: true,
        isStaging: false
      });
      
      expect(result).toContain('React Framework');
      expect(result).toContain('Version > 2');
      expect(result).toContain('Active Premium');
      expect(result).toContain('Development Environment');
    });

    it('should support JSON helpers', async () => {
      const templateContent = `
{{json config spaces=2}}
{{jsonPretty settings}}
`.trim();
      
      const templatePath = 'test/json-helpers.hbs';
      const fullPath = path.join(tempDir, templatePath);
      
      await fs.ensureDir(path.dirname(fullPath));
      await fs.writeFile(fullPath, templateContent);

      const result = await templateLoader.renderTemplate(templatePath, {
        config: { name: 'test', version: 1 },
        settings: { theme: 'dark', language: 'en' }
      });
      
      expect(result).toContain('"name": "test"');
      expect(result).toContain('"version": 1');
      expect(result).toContain('"theme": "dark"');
      expect(result).toContain('"language": "en"');
    });

    it('should support array helpers', async () => {
      const templateContent = `
{{join features ", "}}
Length: {{length items}}
`.trim();
      
      const templatePath = 'test/array-helpers.hbs';
      const fullPath = path.join(tempDir, templatePath);
      
      await fs.ensureDir(path.dirname(fullPath));
      await fs.writeFile(fullPath, templateContent);

      const result = await templateLoader.renderTemplate(templatePath, {
        features: ['auth', 'database', 'api'],
        items: [1, 2, 3, 4, 5]
      });
      
      expect(result).toContain('auth, database, api');
      expect(result).toContain('Length: 5');
    });

    it('should support framework helpers', async () => {
      const templateContent = `
{{#if (isFramework framework "next")}}Next.js Configuration{{/if}}
{{#if (hasFeature features "typescript")}}TypeScript Enabled{{/if}}
`.trim();
      
      const templatePath = 'test/framework-helpers.hbs';
      const fullPath = path.join(tempDir, templatePath);
      
      await fs.ensureDir(path.dirname(fullPath));
      await fs.writeFile(fullPath, templateContent);

      const result = await templateLoader.renderTemplate(templatePath, {
        framework: 'next',
        features: ['typescript', 'tailwind', 'eslint']
      });
      
      expect(result).toContain('Next.js Configuration');
      expect(result).toContain('TypeScript Enabled');
    });
  });

  describe('preloadTemplates', () => {
    it('should preload commonly used templates', async () => {
      const templates = [
        'ai/files/openai.hbs',
        'frontend/components/provider.hbs'
      ];

      for (const templatePath of templates) {
        const fullPath = path.join(tempDir, templatePath);
        await fs.ensureDir(path.dirname(fullPath));
        await fs.writeFile(fullPath, `Template: {{name}}`);
      }

      await templateLoader.preloadTemplates(templates);

      // Templates should now be cached
      // @ts-ignore - accessing private property for testing
      expect(templateLoader.templateCache.size).toBe(2);
    });
  });

  describe('saveTemplate', () => {
    it('should save template content and clear cache', async () => {
      const templatePath = 'test/saveable.hbs';
      const content = 'New template: {{value}}';

      await templateLoader.saveTemplate(templatePath, content);

      const fullPath = path.join(tempDir, templatePath);
      const savedContent = await fs.readFile(fullPath, 'utf-8');
      
      expect(savedContent).toBe(content);

      // Should be able to load and render
      const rendered = await templateLoader.renderTemplate(templatePath, { value: 'success' });
      expect(rendered).toBe('New template: success');
    });
  });

  describe('getTemplateContent', () => {
    it('should return raw template content', async () => {
      const content = 'Raw template: {{variable}}';
      const templatePath = 'test/raw.hbs';
      const fullPath = path.join(tempDir, templatePath);
      
      await fs.ensureDir(path.dirname(fullPath));
      await fs.writeFile(fullPath, content);

      const rawContent = await templateLoader.getTemplateContent(templatePath);
      
      expect(rawContent).toBe(content);
    });
  });

  describe('Error Handling', () => {
    it('should handle file system errors gracefully', async () => {
      const templatePath = 'non-existent-dir/template.hbs';
      
      await expect(
        templateLoader.loadTemplate(templatePath)
      ).rejects.toThrow();
    });

    it('should handle template compilation errors', async () => {
      const templateContent = '{{#if unclosed}}No closing tag';
      const templatePath = 'test/broken.hbs';
      const fullPath = path.join(tempDir, templatePath);
      
      await fs.ensureDir(path.dirname(fullPath));
      await fs.writeFile(fullPath, templateContent);

      await expect(
        templateLoader.loadTemplate(templatePath)
      ).rejects.toThrow();
    });
  });

  describe('Performance', () => {
    it('should handle large templates efficiently', async () => {
      const largeTemplate = 'Large template: {{value}}\n'.repeat(10000);
      const templatePath = 'test/large.hbs';
      const fullPath = path.join(tempDir, templatePath);
      
      await fs.ensureDir(path.dirname(fullPath));
      await fs.writeFile(fullPath, largeTemplate);

      const startTime = Date.now();
      const result = await templateLoader.renderTemplate(templatePath, { value: 'test' });
      const endTime = Date.now();

      expect(result).toContain('Large template: test');
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should cache improve performance on repeated loads', async () => {
      const templateContent = 'Performance test: {{value}}';
      const templatePath = 'test/performance.hbs';
      const fullPath = path.join(tempDir, templatePath);
      
      await fs.ensureDir(path.dirname(fullPath));
      await fs.writeFile(fullPath, templateContent);

      // First load (uncached)
      const start1 = Date.now();
      await templateLoader.loadTemplate(templatePath);
      const time1 = Date.now() - start1;

      // Second load (cached)
      const start2 = Date.now();
      await templateLoader.loadTemplate(templatePath);
      const time2 = Date.now() - start2;

      // Cached load should be significantly faster
      expect(time2).toBeLessThan(time1);
    });
  });
});