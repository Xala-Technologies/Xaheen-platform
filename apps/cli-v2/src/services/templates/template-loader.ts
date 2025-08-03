/**
 * Template Loader Utility
 * 
 * Handles loading and caching of external Handlebars templates.
 * 
 * @author CLI Template Generator Agent
 * @since 2025-01-03
 */

import fs from 'fs-extra';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Handlebars from 'handlebars';
import { consola } from 'consola';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface TemplateMetadata {
  path: string;
  category: string;
  type: 'file' | 'component' | 'config';
  lastModified: number;
}

export class TemplateLoader {
  private templateCache: Map<string, HandlebarsTemplateDelegate> = new Map();
  private metadataCache: Map<string, TemplateMetadata> = new Map();
  private templatesPath: string;

  constructor() {
    this.templatesPath = path.resolve(__dirname, '../../templates');
    this.registerHelpers();
  }

  /**
   * Load a template by its path relative to templates directory
   */
  async loadTemplate(templatePath: string): Promise<HandlebarsTemplateDelegate> {
    const cacheKey = templatePath;
    
    // Check if template is cached and still valid
    const cached = this.templateCache.get(cacheKey);
    const metadata = this.metadataCache.get(cacheKey);
    
    if (cached && metadata) {
      const fullPath = path.join(this.templatesPath, templatePath);
      const stats = await fs.stat(fullPath);
      
      // Return cached template if file hasn't changed
      if (stats.mtimeMs === metadata.lastModified) {
        return cached;
      }
    }

    // Load template from disk
    const fullPath = path.join(this.templatesPath, templatePath);
    
    if (!(await fs.pathExists(fullPath))) {
      throw new Error(`Template not found: ${templatePath}`);
    }

    const templateContent = await fs.readFile(fullPath, 'utf-8');
    const compiledTemplate = Handlebars.compile(templateContent);
    
    // Cache the template
    this.templateCache.set(cacheKey, compiledTemplate);
    
    // Cache metadata
    const stats = await fs.stat(fullPath);
    const pathParts = templatePath.split('/');
    this.metadataCache.set(cacheKey, {
      path: templatePath,
      category: pathParts[0],
      type: pathParts[1] as 'file' | 'component' | 'config',
      lastModified: stats.mtimeMs
    });

    consola.debug(`Loaded template: ${templatePath}`);
    return compiledTemplate;
  }

  /**
   * Render a template with context
   */
  async renderTemplate(templatePath: string, context: any): Promise<string> {
    const template = await this.loadTemplate(templatePath);
    return template(context);
  }

  /**
   * Get template by service configuration
   */
  getTemplatePath(serviceType: string, templateType: 'file' | 'component' | 'config', filename: string): string {
    return `${serviceType}/${templateType}s/${filename}.hbs`;
  }

  /**
   * List all available templates
   */
  async listTemplates(): Promise<TemplateMetadata[]> {
    const templates: TemplateMetadata[] = [];
    
    const scanDirectory = async (dir: string, category = '') => {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const entryPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          const newCategory = category ? `${category}/${entry.name}` : entry.name;
          await scanDirectory(entryPath, newCategory);
        } else if (entry.name.endsWith('.hbs')) {
          const relativePath = path.relative(this.templatesPath, entryPath);
          const pathParts = relativePath.split('/');
          const stats = await fs.stat(entryPath);
          
          templates.push({
            path: relativePath,
            category: pathParts[0],
            type: pathParts[1] as 'file' | 'component' | 'config',
            lastModified: stats.mtimeMs
          });
        }
      }
    };

    await scanDirectory(this.templatesPath);
    return templates;
  }

  /**
   * Clear template cache
   */
  clearCache(): void {
    this.templateCache.clear();
    this.metadataCache.clear();
    consola.debug('Template cache cleared');
  }

  /**
   * Pre-load commonly used templates
   */
  async preloadTemplates(templatePaths: string[]): Promise<void> {
    const loadPromises = templatePaths.map(path => this.loadTemplate(path));
    await Promise.all(loadPromises);
    consola.debug(`Pre-loaded ${templatePaths.length} templates`);
  }

  /**
   * Register Handlebars helpers
   */
  private registerHelpers(): void {
    // Conditional helpers
    Handlebars.registerHelper('eq', (a, b) => a === b);
    Handlebars.registerHelper('ne', (a, b) => a !== b);
    Handlebars.registerHelper('lt', (a, b) => a < b);
    Handlebars.registerHelper('gt', (a, b) => a > b);
    Handlebars.registerHelper('lte', (a, b) => a <= b);
    Handlebars.registerHelper('gte', (a, b) => a >= b);
    
    // Logical helpers
    Handlebars.registerHelper('and', (...args) => {
      return Array.prototype.slice.call(args, 0, -1).every(Boolean);
    });
    Handlebars.registerHelper('or', (...args) => {
      return Array.prototype.slice.call(args, 0, -1).some(Boolean);
    });
    Handlebars.registerHelper('not', (value) => !value);
    
    // String helpers
    Handlebars.registerHelper('capitalize', (str) => {
      if (typeof str !== 'string') return '';
      return str.charAt(0).toUpperCase() + str.slice(1);
    });
    Handlebars.registerHelper('lowercase', (str) => {
      if (typeof str !== 'string') return '';
      return str.toLowerCase();
    });
    Handlebars.registerHelper('uppercase', (str) => {
      if (typeof str !== 'string') return '';
      return str.toUpperCase();
    });
    Handlebars.registerHelper('camelCase', (str) => {
      if (typeof str !== 'string') return '';
      return str.replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '');
    });
    Handlebars.registerHelper('kebabCase', (str) => {
      if (typeof str !== 'string') return '';
      return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    });
    Handlebars.registerHelper('snakeCase', (str) => {
      if (typeof str !== 'string') return '';
      return str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
    });
    
    // JSON helpers
    Handlebars.registerHelper('json', (context, options) => {
      const spaces = options?.hash?.spaces || 2;
      return JSON.stringify(context, null, spaces);
    });
    Handlebars.registerHelper('jsonPretty', (context) => {
      return JSON.stringify(context, null, 2);
    });
    
    // Array helpers
    Handlebars.registerHelper('join', (array, separator = ', ') => {
      if (Array.isArray(array)) {
        return array.join(separator);
      }
      return '';
    });
    Handlebars.registerHelper('length', (array) => {
      if (Array.isArray(array)) {
        return array.length;
      }
      return 0;
    });
    
    // Framework-specific helpers
    Handlebars.registerHelper('isFramework', (framework, expected) => {
      return framework === expected;
    });
    Handlebars.registerHelper('hasFeature', (features, feature) => {
      if (Array.isArray(features)) {
        return features.includes(feature);
      }
      return false;
    });
    
    // Environment helpers
    Handlebars.registerHelper('isDev', () => process.env.NODE_ENV === 'development');
    Handlebars.registerHelper('isProd', () => process.env.NODE_ENV === 'production');
    
    // Date helpers
    Handlebars.registerHelper('currentYear', () => new Date().getFullYear());
    Handlebars.registerHelper('currentDate', () => new Date().toISOString().split('T')[0]);
    
    consola.debug('Registered Handlebars helpers');
  }

  /**
   * Validate template syntax
   */
  async validateTemplate(templatePath: string): Promise<{ valid: boolean; error?: string }> {
    try {
      const fullPath = path.join(this.templatesPath, templatePath);
      const templateContent = await fs.readFile(fullPath, 'utf-8');
      
      // Try to compile the template
      Handlebars.compile(templateContent);
      
      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get template content without compilation (for editing)
   */
  async getTemplateContent(templatePath: string): Promise<string> {
    const fullPath = path.join(this.templatesPath, templatePath);
    return await fs.readFile(fullPath, 'utf-8');
  }

  /**
   * Save template content
   */
  async saveTemplate(templatePath: string, content: string): Promise<void> {
    const fullPath = path.join(this.templatesPath, templatePath);
    await fs.ensureDir(path.dirname(fullPath));
    await fs.writeFile(fullPath, content, 'utf-8');
    
    // Clear cached version
    this.templateCache.delete(templatePath);
    this.metadataCache.delete(templatePath);
    
    consola.debug(`Saved template: ${templatePath}`);
  }
}

// Singleton instance
export const templateLoader = new TemplateLoader();