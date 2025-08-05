/**
 * Template Engine Service Implementation
 * Single Responsibility: Handles template compilation and rendering
 */

import Handlebars from 'handlebars';
import path from 'path';
import type {
  ITemplateEngine,
  IFileSystem,
  ILogger,
  TemplateFunction,
} from '../interfaces/index.js';

export class TemplateEngine implements ITemplateEngine {
  private readonly compiledTemplates = new Map<string, TemplateFunction>();
  private readonly handlebars = Handlebars.create();

  constructor(
    private readonly fileSystem: IFileSystem,
    private readonly logger: ILogger
  ) {
    this.registerDefaultHelpers();
  }

  public async compile(template: string): Promise<TemplateFunction> {
    try {
      return this.handlebars.compile(template);
    } catch (error) {
      this.logger.error('Failed to compile template', error);
      throw new Error(`Template compilation failed: ${error}`);
    }
  }

  public async render(templatePath: string, data: any): Promise<string> {
    try {
      // Check cache first
      let compiledTemplate = this.compiledTemplates.get(templatePath);
      
      if (!compiledTemplate) {
        // Load and compile template
        const templateContent = await this.loadTemplate(templatePath);
        compiledTemplate = await this.compile(templateContent);
        
        // Cache compiled template
        this.compiledTemplates.set(templatePath, compiledTemplate);
      }

      return compiledTemplate(data);
    } catch (error) {
      this.logger.error(`Failed to render template: ${templatePath}`, error);
      throw new Error(`Template rendering failed: ${templatePath}`);
    }
  }

  public registerHelper(name: string, helper: Function): void {
    this.handlebars.registerHelper(name, helper);
    this.logger.info(`Registered template helper: ${name}`);
  }

  public registerPartial(name: string, partial: string): void {
    this.handlebars.registerPartial(name, partial);
    this.logger.info(`Registered template partial: ${name}`);
  }

  public clearCache(): void {
    this.compiledTemplates.clear();
    this.logger.info('Template cache cleared');
  }

  private async loadTemplate(templatePath: string): Promise<string> {
    const fullPath = path.resolve(templatePath);
    const exists = await this.fileSystem.exists(fullPath);
    
    if (!exists) {
      throw new Error(`Template not found: ${templatePath}`);
    }

    return await this.fileSystem.readFile(fullPath);
  }

  private registerDefaultHelpers(): void {
    // String manipulation helpers
    this.registerHelper('toLowerCase', (str: string) => str.toLowerCase());
    this.registerHelper('toUpperCase', (str: string) => str.toUpperCase());
    this.registerHelper('capitalize', (str: string) => 
      str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
    );

    // Pascal case helper
    this.registerHelper('toPascalCase', (str: string) =>
      str.replace(/[-_](.)/g, (_, char) => char.toUpperCase())
         .replace(/^(.)/, (char) => char.toUpperCase())
    );

    // Camel case helper
    this.registerHelper('toCamelCase', (str: string) =>
      str.replace(/[-_](.)/g, (_, char) => char.toUpperCase())
         .replace(/^(.)/, (char) => char.toLowerCase())
    );

    // Kebab case helper
    this.registerHelper('toKebabCase', (str: string) =>
      str.replace(/([A-Z])/g, '-$1')
         .replace(/[-_\s]+/g, '-')
         .toLowerCase()
         .replace(/^-/, '')
    );

    // Conditional helpers
    this.registerHelper('eq', (a: any, b: any) => a === b);
    this.registerHelper('ne', (a: any, b: any) => a !== b);
    this.registerHelper('gt', (a: any, b: any) => a > b);
    this.registerHelper('lt', (a: any, b: any) => a < b);
    this.registerHelper('gte', (a: any, b: any) => a >= b);
    this.registerHelper('lte', (a: any, b: any) => a <= b);

    // Array helpers
    this.registerHelper('join', (array: any[], separator: string = ', ') =>
      Array.isArray(array) ? array.join(separator) : ''
    );

    this.registerHelper('length', (array: any[]) =>
      Array.isArray(array) ? array.length : 0
    );

    // Date helpers
    this.registerHelper('formatDate', (date: Date | string, format: string = 'YYYY-MM-DD') => {
      const d = date instanceof Date ? date : new Date(date);
      return d.toISOString().split('T')[0]; // Simple ISO date format
    });

    this.registerHelper('currentYear', () => new Date().getFullYear());

    // Utility helpers
    this.registerHelper('json', (obj: any) => JSON.stringify(obj, null, 2));
    
    this.registerHelper('indent', (str: string, spaces: number = 2) =>
      str.split('\n').map(line => ' '.repeat(spaces) + line).join('\n')
    );

    // Framework-specific helpers
    this.registerHelper('reactImport', (framework: string) =>
      framework === 'react' ? "import React from 'react';" : ''
    );

    this.registerHelper('typeScriptInterface', (props: any[], componentName: string) => {
      if (!Array.isArray(props) || props.length === 0) return '';
      
      const propsInterface = props
        .map(prop => `  readonly ${prop.name}: ${prop.type};`)
        .join('\n');
      
      return `interface ${componentName}Props {\n${propsInterface}\n}`;
    });

    this.logger.info('Default template helpers registered');
  }
}

/**
 * Template Helper Registry
 * Allows dynamic registration of template helpers
 */
export class TemplateHelperRegistry {
  private readonly helpers = new Map<string, Function>();

  public register(name: string, helper: Function): void {
    this.helpers.set(name, helper);
  }

  public unregister(name: string): void {
    this.helpers.delete(name);
  }

  public get(name: string): Function | undefined {
    return this.helpers.get(name);
  }

  public getAll(): ReadonlyMap<string, Function> {
    return this.helpers;
  }

  public applyToEngine(engine: ITemplateEngine): void {
    for (const [name, helper] of this.helpers) {
      engine.registerHelper(name, helper);
    }
  }
}