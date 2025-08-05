/**
 * Template Engine - Advanced template system with inheritance and composition
 * Supports Handlebars with custom helpers and template inheritance
 */
import Handlebars from 'handlebars';
import { promises as fs } from 'fs';
import path from 'path';
import chalk from 'chalk';
import { 
  GeneratorTemplate, 
  TemplateVariable, 
  TemplateBlock 
} from './types';

export interface TemplateEngineOptions {
  readonly templatesDir: string;
  readonly partialsDir: string;
  readonly helpersDir: string;
  readonly cacheEnabled: boolean;
  readonly hotReload: boolean;
}

export interface TemplateCreateOptions {
  readonly name: string;
  readonly baseTemplate?: string;
  readonly customizations?: Record<string, any>;
  readonly variables: readonly TemplateVariable[];
  readonly partials: readonly string[];
  readonly helpers: readonly string[];
  readonly blocks: readonly TemplateBlock[];
}

export class TemplateEngine {
  private handlebars: typeof Handlebars;
  private options: TemplateEngineOptions;
  private templateCache = new Map<string, HandlebarsTemplateDelegate>();
  private partialCache = new Map<string, string>();
  private templates = new Map<string, GeneratorTemplate>();
  private watchers = new Map<string, any>();

  constructor(options: Partial<TemplateEngineOptions> = {}) {
    this.options = {
      templatesDir: path.join(__dirname, '../templates'),
      partialsDir: path.join(__dirname, '../templates/partials'),
      helpersDir: path.join(__dirname, '../templates/helpers'),
      cacheEnabled: true,
      hotReload: process.env.NODE_ENV === 'development',
      ...options
    };

    this.handlebars = Handlebars.create();
    this.setupTemplateEngine();
  }

  /**
   * Setup the template engine with helpers and partials
   */
  private async setupTemplateEngine(): Promise<void> {
    await this.loadHelpers();
    await this.loadPartials();
    
    if (this.options.hotReload) {
      await this.setupHotReload();
    }
  }

  /**
   * Load custom Handlebars helpers
   */
  private async loadHelpers(): Promise<void> {
    try {
      const helpersDir = this.options.helpersDir;
      await fs.access(helpersDir);
      
      const helperFiles = await fs.readdir(helpersDir);
      
      for (const helperFile of helperFiles) {
        if (helperFile.endsWith('.js') || helperFile.endsWith('.ts')) {
          const helperPath = path.join(helpersDir, helperFile);
          const helpers = await import(helperPath);
          
          for (const [name, helper] of Object.entries(helpers)) {
            if (typeof helper === 'function') {
              this.handlebars.registerHelper(name, helper);
            }
          }
        }
      }
      
      console.log(`📝 Loaded template helpers from ${helpersDir}`);
    } catch {
      // Helpers directory doesn't exist, create default helpers
      await this.createDefaultHelpers();
    }
  }

  /**
   * Create default Handlebars helpers
   */
  private async createDefaultHelpers(): Promise<void> {
    // String manipulation helpers
    this.handlebars.registerHelper('pascalCase', (str: string) => {
      return str
        .replace(/[-_](.)/g, (_, char) => char.toUpperCase())
        .replace(/^(.)/, (char) => char.toUpperCase());
    });

    this.handlebars.registerHelper('camelCase', (str: string) => {
      return str
        .replace(/[-_](.)/g, (_, char) => char.toUpperCase())
        .replace(/^(.)/, (char) => char.toLowerCase());
    });

    this.handlebars.registerHelper('kebabCase', (str: string) => {
      return str
        .replace(/([A-Z])/g, '-$1')
        .replace(/[-_\s]+/g, '-')
        .toLowerCase()
        .replace(/^-/, '');
    });

    this.handlebars.registerHelper('snakeCase', (str: string) => {
      return str
        .replace(/([A-Z])/g, '_$1')
        .replace(/[-\s]+/g, '_')
        .toLowerCase()
        .replace(/^_/, '');
    });

    this.handlebars.registerHelper('constantCase', (str: string) => {
      return str
        .replace(/([A-Z])/g, '_$1')
        .replace(/[-\s]+/g, '_')
        .toUpperCase()
        .replace(/^_/, '');
    });

    // Array helpers
    this.handlebars.registerHelper('join', (array: any[], separator = ', ') => {
      return Array.isArray(array) ? array.join(separator) : '';
    });

    this.handlebars.registerHelper('first', (array: any[]) => {
      return Array.isArray(array) && array.length > 0 ? array[0] : null;
    });

    this.handlebars.registerHelper('last', (array: any[]) => {
      return Array.isArray(array) && array.length > 0 ? array[array.length - 1] : null;
    });

    // Logic helpers
    this.handlebars.registerHelper('eq', (a: any, b: any) => a === b);
    this.handlebars.registerHelper('ne', (a: any, b: any) => a !== b);
    this.handlebars.registerHelper('lt', (a: any, b: any) => a < b);
    this.handlebars.registerHelper('gt', (a: any, b: any) => a > b);
    this.handlebars.registerHelper('and', (...args: any[]) => {
      const values = args.slice(0, -1); // Remove Handlebars options
      return values.every(Boolean);
    });
    this.handlebars.registerHelper('or', (...args: any[]) => {
      const values = args.slice(0, -1); // Remove Handlebars options
      return values.some(Boolean);
    });

    // Date helpers
    this.handlebars.registerHelper('now', () => new Date().toISOString());
    this.handlebars.registerHelper('year', () => new Date().getFullYear());
    this.handlebars.registerHelper('formatDate', (date: Date, format = 'YYYY-MM-DD') => {
      // Simple date formatting - would use proper date library in production
      const d = new Date(date);
      return d.toISOString().split('T')[0];
    });

    // File system helpers
    this.handlebars.registerHelper('basename', (filePath: string) => {
      return path.basename(filePath);
    });

    this.handlebars.registerHelper('dirname', (filePath: string) => {
      return path.dirname(filePath);
    });

    this.handlebars.registerHelper('extname', (filePath: string) => {
      return path.extname(filePath);
    });

    // JSON helpers
    this.handlebars.registerHelper('json', (obj: any, indent = 2) => {
      return JSON.stringify(obj, null, indent);
    });

    // Conditional rendering helpers
    this.handlebars.registerHelper('ifPlatform', function(platform: string, expected: string, options: any) {
      return platform === expected ? options.fn(this) : options.inverse(this);
    });

    this.handlebars.registerHelper('ifFramework', function(framework: string, expected: string, options: any) {
      return framework === expected ? options.fn(this) : options.inverse(this);
    });

    // Code generation helpers
    this.handlebars.registerHelper('indent', (str: string, spaces = 2) => {
      const indent = ' '.repeat(spaces);
      return str.split('\n').map(line => line ? indent + line : line).join('\n');
    });

    this.handlebars.registerHelper('comment', (str: string, style = '//') => {
      return str.split('\n').map(line => `${style} ${line}`).join('\n');
    });

    // Norwegian localization helpers
    this.handlebars.registerHelper('norwegianText', (key: string, fallback?: string) => {
      const translations: Record<string, string> = {
        'button.save': 'Lagre',
        'button.cancel': 'Avbryt',
        'button.delete': 'Slett',
        'button.edit': 'Rediger',
        'label.name': 'Navn',
        'label.email': 'E-post',
        'label.phone': 'Telefon',
        'error.required': 'Dette feltet er påkrevd',
        'error.invalid': 'Ugyldig verdi'
      };
      
      return translations[key] || fallback || key;
    });
  }

  /**
   * Load template partials
   */
  private async loadPartials(): Promise<void> {
    try {
      const partialsDir = this.options.partialsDir;
      await fs.access(partialsDir);
      
      const partialFiles = await fs.readdir(partialsDir, { recursive: true });
      
      for (const partialFile of partialFiles) {
        if (typeof partialFile === 'string' && partialFile.endsWith('.hbs')) {
          const partialPath = path.join(partialsDir, partialFile);
          const partialName = partialFile.replace('.hbs', '').replace(/[\/\\]/g, '.');
          const partialContent = await fs.readFile(partialPath, 'utf-8');
          
          this.handlebars.registerPartial(partialName, partialContent);
          this.partialCache.set(partialName, partialContent);
        }
      }
      
      console.log(`🧩 Loaded ${this.partialCache.size} template partials`);
    } catch {
      console.log('No partials directory found, skipping partial loading');
    }
  }

  /**
   * Setup hot reload for development
   */
  private async setupHotReload(): Promise<void> {
    const { watch } = await import('chokidar');
    
    // Watch templates directory
    const templateWatcher = watch(this.options.templatesDir, {
      ignored: /node_modules/,
      persistent: true
    });

    templateWatcher.on('change', (filePath: string) => {
      console.log(`🔄 Template changed: ${chalk.yellow(filePath)}`);
      this.invalidateCache(filePath);
    });

    this.watchers.set('templates', templateWatcher);

    // Watch partials directory
    const partialWatcher = watch(this.options.partialsDir, {
      ignored: /node_modules/,
      persistent: true
    });

    partialWatcher.on('change', async (filePath: string) => {
      console.log(`🔄 Partial changed: ${chalk.yellow(filePath)}`);
      await this.reloadPartial(filePath);
    });

    this.watchers.set('partials', partialWatcher);
  }

  /**
   * Create a new template
   */
  async createTemplate(options: TemplateCreateOptions): Promise<GeneratorTemplate> {
    const template: GeneratorTemplate = {
      id: this.generateTemplateId(options.name),
      name: options.name,
      path: path.join(this.options.templatesDir, `${options.name}.hbs`),
      content: '',
      variables: options.variables,
      partials: options.partials,
      helpers: options.helpers,
      parent: options.baseTemplate,
      blocks: options.blocks
    };

    // Generate template content
    template.content = await this.generateTemplateContent(template, options);

    // Cache the template
    this.templates.set(template.id, template);

    return template;
  }

  /**
   * Load a template by ID
   */
  async loadTemplate(templateId: string): Promise<GeneratorTemplate | null> {
    // Check cache first
    if (this.templates.has(templateId)) {
      return this.templates.get(templateId)!;
    }

    // Try to load from disk
    const templatePath = path.join(this.options.templatesDir, `${templateId}.json`);
    
    try {
      const templateData = JSON.parse(await fs.readFile(templatePath, 'utf-8'));
      const template: GeneratorTemplate = {
        ...templateData,
        path: path.join(this.options.templatesDir, `${templateId}.hbs`)
      };

      // Load template content
      template.content = await fs.readFile(template.path, 'utf-8');

      // Cache the template
      this.templates.set(templateId, template);

      return template;
    } catch {
      return null;
    }
  }

  /**
   * Save a template to disk
   */
  async saveTemplate(template: GeneratorTemplate): Promise<void> {
    const templateDir = path.dirname(template.path);
    await fs.mkdir(templateDir, { recursive: true });

    // Save template content
    await fs.writeFile(template.path, template.content);

    // Save template metadata
    const metadataPath = path.join(
      this.options.templatesDir,
      `${template.id}.json`
    );
    
    const { content, ...metadata } = template;
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

    console.log(`💾 Saved template: ${chalk.green(template.name)}`);
  }

  /**
   * Render a template with data
   */
  async renderTemplate(
    templateId: string,
    data: Record<string, any>,
    options: { useCache?: boolean } = {}
  ): Promise<string> {
    const useCache = options.useCache ?? this.options.cacheEnabled;
    
    // Get compiled template
    let compiledTemplate: HandlebarsTemplateDelegate;
    
    if (useCache && this.templateCache.has(templateId)) {
      compiledTemplate = this.templateCache.get(templateId)!;
    } else {
      const template = await this.loadTemplate(templateId);
      if (!template) {
        throw new Error(`Template not found: ${templateId}`);
      }

      // Process template inheritance
      const processedContent = await this.processTemplateInheritance(template);
      
      compiledTemplate = this.handlebars.compile(processedContent);
      
      if (useCache) {
        this.templateCache.set(templateId, compiledTemplate);
      }
    }

    // Render template
    try {
      return compiledTemplate(data);
    } catch (error: any) {
      throw new Error(`Template rendering failed for ${templateId}: ${error.message}`);
    }
  }

  /**
   * Process template inheritance
   */
  private async processTemplateInheritance(template: GeneratorTemplate): Promise<string> {
    let content = template.content;

    // If template has a parent, process inheritance
    if (template.parent) {
      const parentTemplate = await this.loadTemplate(template.parent);
      if (!parentTemplate) {
        throw new Error(`Parent template not found: ${template.parent}`);
      }

      // Process parent template first
      const parentContent = await this.processTemplateInheritance(parentTemplate);

      // Replace blocks in parent with child blocks
      content = this.replaceTemplateBlocks(parentContent, template.blocks);
    }

    return content;
  }

  /**
   * Replace template blocks
   */
  private replaceTemplateBlocks(
    parentContent: string,
    blocks: readonly TemplateBlock[]
  ): string {
    let content = parentContent;

    for (const block of blocks) {
      const blockRegex = new RegExp(
        `{{#block\\s+"${block.name}"}}[\\s\\S]*?{{/block}}`,
        'g'
      );
      
      const replacement = `{{#block "${block.name}"}}${block.content}{{/block}}`;
      content = content.replace(blockRegex, replacement);
    }

    return content;
  }

  /**
   * Generate template content from options
   */
  private async generateTemplateContent(
    template: GeneratorTemplate,
    options: TemplateCreateOptions
  ): Promise<string> {
    let content = '';

    // If base template specified, extend it
    if (options.baseTemplate) {
      content += `{{!-- Extends: ${options.baseTemplate} --}}\n\n`;
    }

    // Add template header
    content += `{{!-- Template: ${template.name} --}}\n`;
    content += `{{!-- Generated: ${new Date().toISOString()} --}}\n\n`;

    // Add variable documentation
    if (options.variables.length > 0) {
      content += '{{!-- Variables:\n';
      for (const variable of options.variables) {
        content += `  - ${variable.name} (${variable.type}): ${variable.description}\n`;
      }
      content += '--}}\n\n';
    }

    // Add basic template structure
    content += '{{!-- Main template content --}}\n';
    content += '{{#with this}}\n';
    content += '  {{!-- Add your template content here --}}\n';
    content += '{{/with}}\n';

    // Add blocks if specified
    for (const block of options.blocks) {
      content += `\n{{#block "${block.name}"}}\n`;
      content += block.content || `  {{!-- ${block.description} --}}\n`;
      content += '{{/block}}\n';
    }

    return content;
  }

  /**
   * Generate unique template ID
   */
  private generateTemplateId(name: string): string {
    const timestamp = Date.now();
    const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    return `${cleanName}-${timestamp}`;
  }

  /**
   * Invalidate template cache
   */
  private invalidateCache(filePath: string): void {
    const templateId = path.basename(filePath, '.hbs');
    this.templateCache.delete(templateId);
    this.templates.delete(templateId);
  }

  /**
   * Reload a partial
   */
  private async reloadPartial(filePath: string): Promise<void> {
    const partialName = path.basename(filePath, '.hbs');
    const partialContent = await fs.readFile(filePath, 'utf-8');
    
    this.handlebars.registerPartial(partialName, partialContent);
    this.partialCache.set(partialName, partialContent);
    
    // Clear template cache as partials may have changed
    this.templateCache.clear();
  }

  /**
   * List available templates
   */
  async listTemplates(): Promise<readonly GeneratorTemplate[]> {
    const templates: GeneratorTemplate[] = [];
    
    try {
      const templateFiles = await fs.readdir(this.options.templatesDir);
      
      for (const templateFile of templateFiles) {
        if (templateFile.endsWith('.json')) {
          const templateId = templateFile.replace('.json', '');
          const template = await this.loadTemplate(templateId);
          if (template) {
            templates.push(template);
          }
        }
      }
    } catch {
      // Templates directory doesn't exist
    }
    
    return templates;
  }

  /**
   * Validate template
   */
  async validateTemplate(template: GeneratorTemplate): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate required fields
    if (!template.id) errors.push('Template ID is required');
    if (!template.name) errors.push('Template name is required');
    if (!template.content) errors.push('Template content is required');

    // Validate Handlebars syntax
    try {
      this.handlebars.compile(template.content);
    } catch (error: any) {
      errors.push(`Invalid Handlebars syntax: ${error.message}`);
    }

    // Check for undefined partials
    const partialMatches = template.content.match(/{{>\s*(\w+)/g);
    if (partialMatches) {
      for (const match of partialMatches) {
        const partialName = match.replace(/{{>\s*/, '');
        if (!this.partialCache.has(partialName)) {
          warnings.push(`Undefined partial: ${partialName}`);
        }
      }
    }

    // Validate parent template exists
    if (template.parent) {
      const parentExists = await this.loadTemplate(template.parent);
      if (!parentExists) {
        errors.push(`Parent template not found: ${template.parent}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Clean up resources
   */
  async dispose(): Promise<void> {
    // Close file watchers
    for (const [name, watcher] of this.watchers) {
      await watcher.close();
      console.log(`🛑 Stopped watching ${name}`);
    }

    // Clear caches
    this.templateCache.clear();
    this.partialCache.clear();
    this.templates.clear();
    this.watchers.clear();
  }
}