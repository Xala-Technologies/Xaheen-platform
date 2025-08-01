import path from 'path';
import { promises as fs } from 'fs';
import { logger } from '../utils/logger.js';
import { fileExists, readFile } from '../utils/fs.js';
import { TemplateEngine, TemplateMetadata, TemplateContext } from './template-engine.js';

// Template category enum
export enum TemplateCategory {
  COMPONENT = 'component',
  PAGE = 'page',
  LAYOUT = 'layout',
  HOOK = 'hook',
  UTILITY = 'utility',
  CONFIG = 'config',
  TEST = 'test',
  STORY = 'story',
  API = 'api',
  MIDDLEWARE = 'middleware',
  SERVICE = 'service',
  MODEL = 'model',
  MIGRATION = 'migration',
  DOCUMENTATION = 'documentation',
}

// Template platform enum
export enum TemplatePlatform {
  NEXTJS = 'nextjs',
  REACT = 'react',
  NESTJS = 'nestjs',
  LIBRARY = 'library',
  ALL = 'all',
}

// Template information
export interface TemplateInfo {
  name: string;
  path: string;
  metadata: TemplateMetadata;
  content?: string;
  lastModified: Date;
  size: number;
  isActive: boolean;
}

// Template collection
export interface TemplateCollection {
  name: string;
  description: string;
  version: string;
  author: string;
  templates: TemplateInfo[];
  dependencies: string[];
  platform: TemplatePlatform[];
  category: TemplateCategory;
}

// Template search options
export interface TemplateSearchOptions {
  category?: TemplateCategory;
  platform?: TemplatePlatform;
  tags?: string[];
  author?: string;
  namePattern?: string;
  requiredContext?: string[];
  sortBy?: 'name' | 'category' | 'lastModified' | 'size';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// Template validation result
export interface TemplateValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

// Template registry implementation
export class TemplateRegistry {
  private templates = new Map<string, TemplateInfo>();
  private collections = new Map<string, TemplateCollection>();
  private templateEngine: TemplateEngine;
  private registryPath: string;
  private indexPath: string;
  
  constructor(
    templateEngine: TemplateEngine,
    registryPath: string = 'templates',
    indexPath: string = 'templates/index.json'
  ) {
    this.templateEngine = templateEngine;
    this.registryPath = registryPath;
    this.indexPath = indexPath;
  }
  
  // Initialize registry by scanning template directory
  async initialize(): Promise<void> {
    logger.info('Initializing template registry...');
    
    try {
      // Load existing index if available
      if (await fileExists(this.indexPath)) {
        await this.loadIndex();
      }
      
      // Scan template directory
      await this.scanTemplateDirectory();
      
      // Build collections
      await this.buildCollections();
      
      // Save updated index
      await this.saveIndex();
      
      logger.info(`Template registry initialized with ${this.templates.size} templates`);
      
    } catch (error) {
      logger.error('Failed to initialize template registry:', error);
      throw error;
    }
  }
  
  // Register a new template
  async registerTemplate(
    name: string,
    templatePath: string,
    metadata?: Partial<TemplateMetadata>
  ): Promise<void> {
    try {
      const fullPath = path.resolve(templatePath);
      
      if (!await fileExists(fullPath)) {
        throw new Error(`Template file not found: ${fullPath}`);
      }
      
      const stats = await fs.stat(fullPath);
      const content = await readFile(fullPath);
      
      // Load or create metadata
      const templateMetadata = metadata ? 
        { ...this.createDefaultMetadata(name), ...metadata } :
        await this.loadTemplateMetadata(fullPath);
      
      const templateInfo: TemplateInfo = {
        name,
        path: fullPath,
        metadata: templateMetadata,
        content,
        lastModified: stats.mtime,
        size: stats.size,
        isActive: true,
      };
      
      // Validate template
      const validation = await this.validateTemplate(templateInfo);
      if (!validation.isValid) {
        logger.warn(`Template validation issues for ${name}:`, validation.errors);
      }
      
      this.templates.set(name, templateInfo);
      logger.info(`Template registered: ${name}`);
      
    } catch (error) {
      logger.error(`Failed to register template ${name}:`, error);
      throw error;
    }
  }
  
  // Unregister a template
  unregisterTemplate(name: string): boolean {
    const removed = this.templates.delete(name);
    if (removed) {
      logger.info(`Template unregistered: ${name}`);
    }
    return removed;
  }
  
  // Get template by name
  getTemplate(name: string): TemplateInfo | undefined {
    return this.templates.get(name);
  }
  
  // Get all templates
  getAllTemplates(): TemplateInfo[] {
    return Array.from(this.templates.values());
  }
  
  // Search templates
  searchTemplates(options: TemplateSearchOptions = {}): TemplateInfo[] {
    let results = Array.from(this.templates.values());
    
    // Filter by category
    if (options.category) {
      results = results.filter(template => 
        template.metadata.category === options.category
      );
    }
    
    // Filter by platform
    if (options.platform) {
      results = results.filter(template => 
        template.metadata.platform.includes(options.platform!) ||
        template.metadata.platform.includes('all')
      );
    }
    
    // Filter by tags
    if (options.tags && options.tags.length > 0) {
      results = results.filter(template =>
        options.tags!.some(tag => template.metadata.tags.includes(tag))
      );
    }
    
    // Filter by author
    if (options.author) {
      results = results.filter(template =>
        template.metadata.author.toLowerCase().includes(options.author!.toLowerCase())
      );
    }
    
    // Filter by name pattern
    if (options.namePattern) {
      const regex = new RegExp(options.namePattern, 'i');
      results = results.filter(template => regex.test(template.name));
    }
    
    // Filter by required context
    if (options.requiredContext && options.requiredContext.length > 0) {
      results = results.filter(template =>
        options.requiredContext!.every(context =>
          template.metadata.requiredContext.includes(context)
        )
      );
    }
    
    // Sort results
    if (options.sortBy) {
      results.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (options.sortBy) {
          case 'name':
            aValue = a.name;
            bValue = b.name;
            break;
          case 'category':
            aValue = a.metadata.category;
            bValue = b.metadata.category;
            break;
          case 'lastModified':
            aValue = a.lastModified;
            bValue = b.lastModified;
            break;
          case 'size':
            aValue = a.size;
            bValue = b.size;
            break;
          default:
            return 0;
        }
        
        const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        return options.sortOrder === 'desc' ? -comparison : comparison;
      });
    }
    
    // Apply pagination
    if (options.offset || options.limit) {
      const start = options.offset || 0;
      const end = options.limit ? start + options.limit : undefined;
      results = results.slice(start, end);
    }
    
    return results;
  }
  
  // Get templates by category
  getTemplatesByCategory(category: TemplateCategory): TemplateInfo[] {
    return this.searchTemplates({ category });
  }
  
  // Get templates by platform
  getTemplatesByPlatform(platform: TemplatePlatform): TemplateInfo[] {
    return this.searchTemplates({ platform });
  }
  
  // Register template collection
  registerCollection(collection: TemplateCollection): void {
    this.collections.set(collection.name, collection);
    
    // Register individual templates from collection
    collection.templates.forEach(template => {
      this.templates.set(template.name, template);
    });
    
    logger.info(`Template collection registered: ${collection.name} (${collection.templates.length} templates)`);
  }
  
  // Get collection by name
  getCollection(name: string): TemplateCollection | undefined {
    return this.collections.get(name);
  }
  
  // Get all collections
  getAllCollections(): TemplateCollection[] {
    return Array.from(this.collections.values());
  }
  
  // Validate template
  async validateTemplate(template: TemplateInfo): Promise<TemplateValidationResult> {
    const result: TemplateValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: [],
    };
    
    try {
      // Check if template file exists
      if (!await fileExists(template.path)) {
        result.errors.push(`Template file not found: ${template.path}`);
        result.isValid = false;
      }
      
      // Validate metadata
      if (!template.metadata.name) {
        result.errors.push('Template metadata missing name');
        result.isValid = false;
      }
      
      if (!template.metadata.description) {
        result.warnings.push('Template metadata missing description');
      }
      
      if (!template.metadata.category) {
        result.errors.push('Template metadata missing category');
        result.isValid = false;
      }
      
      // Validate template syntax
      if (template.content) {
        const syntaxErrors = this.validateTemplateSyntax(template.content);
        result.errors.push(...syntaxErrors);
        
        if (syntaxErrors.length > 0) {
          result.isValid = false;
        }
      }
      
      // Check for Norwegian compliance
      if (template.content) {
        const complianceIssues = this.checkNorwegianCompliance(template.content);
        result.suggestions.push(...complianceIssues);
      }
      
      // Performance suggestions
      if (template.size > 100 * 1024) { // 100KB
        result.suggestions.push('Template is large, consider breaking into smaller templates');
      }
      
    } catch (error) {
      result.errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      result.isValid = false;
    }
    
    return result;
  }
  
  // Render template using registry
  async renderTemplate(
    name: string,
    context: TemplateContext = {},
    outputPath?: string
  ) {
    const template = this.getTemplate(name);
    
    if (!template) {
      throw new Error(`Template not found in registry: ${name}`);
    }
    
    // Add template metadata to context
    const enhancedContext = {
      ...context,
      _template: {
        name: template.name,
        category: template.metadata.category,
        version: template.metadata.version,
        author: template.metadata.author,
      },
    };
    
    return this.templateEngine.renderTemplate(name, enhancedContext, outputPath);
  }
  
  // Get template statistics
  getStatistics(): {
    totalTemplates: number;
    totalCollections: number;
    categoryCounts: Record<string, number>;
    platformCounts: Record<string, number>;
    averageSize: number;
    totalSize: number;
  } {
    const templates = Array.from(this.templates.values());
    const categoryCounts: Record<string, number> = {};
    const platformCounts: Record<string, number> = {};
    let totalSize = 0;
    
    templates.forEach(template => {
      // Count categories
      const category = template.metadata.category;
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      
      // Count platforms
      template.metadata.platform.forEach(platform => {
        platformCounts[platform] = (platformCounts[platform] || 0) + 1;
      });
      
      totalSize += template.size;
    });
    
    return {
      totalTemplates: templates.length,
      totalCollections: this.collections.size,
      categoryCounts,
      platformCounts,
      averageSize: templates.length > 0 ? Math.round(totalSize / templates.length) : 0,
      totalSize,
    };
  }
  
  // Export registry to JSON
  async exportRegistry(outputPath: string): Promise<void> {
    const registryData = {
      templates: Array.from(this.templates.entries()).map(([name, info]) => ({
        name,
        path: info.path,
        metadata: info.metadata,
        lastModified: info.lastModified,
        size: info.size,
        isActive: info.isActive,
      })),
      collections: Array.from(this.collections.entries()).map(([name, collection]) => ({
        name,
        ...collection,
      })),
      statistics: this.getStatistics(),
      exportedAt: new Date().toISOString(),
    };
    
    await fs.writeFile(outputPath, JSON.stringify(registryData, null, 2));
    logger.info(`Registry exported to: ${outputPath}`);
  }
  
  // Import registry from JSON
  async importRegistry(inputPath: string): Promise<void> {
    const registryData = JSON.parse(await readFile(inputPath));
    
    // Import templates
    for (const templateData of registryData.templates) {
      if (await fileExists(templateData.path)) {
        const stats = await fs.stat(templateData.path);
        const content = await readFile(templateData.path);
        
        const templateInfo: TemplateInfo = {
          name: templateData.name,
          path: templateData.path,
          metadata: templateData.metadata,
          content,
          lastModified: new Date(templateData.lastModified),
          size: stats.size,
          isActive: templateData.isActive,
        };
        
        this.templates.set(templateData.name, templateInfo);
      }
    }
    
    // Import collections
    for (const collectionData of registryData.collections) {
      this.collections.set(collectionData.name, collectionData);
    }
    
    logger.info(`Registry imported from: ${inputPath}`);
  }
  
  // Private methods
  private async scanTemplateDirectory(): Promise<void> {
    try {
      await this.scanDirectory(this.registryPath);
    } catch (error) {
      if ((error as any).code !== 'ENOENT') {
        throw error;
      }
      logger.warn(`Template directory not found: ${this.registryPath}`);
    }
  }
  
  private async scanDirectory(dirPath: string): Promise<void> {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        await this.scanDirectory(fullPath);
      } else if (entry.isFile() && this.isTemplateFile(entry.name)) {
        const templateName = this.getTemplateNameFromPath(fullPath);
        
        if (!this.templates.has(templateName)) {
          await this.registerTemplate(templateName, fullPath);
        }
      }
    }
  }
  
  private isTemplateFile(fileName: string): boolean {
    const templateExtensions = ['.hbs', '.handlebars', '.template'];
    return templateExtensions.some(ext => fileName.endsWith(ext));
  }
  
  private getTemplateNameFromPath(filePath: string): string {
    const relativePath = path.relative(this.registryPath, filePath);
    const parsed = path.parse(relativePath);
    return path.join(parsed.dir, parsed.name).replace(/\\/g, '/');
  }
  
  private async loadTemplateMetadata(templatePath: string): Promise<TemplateMetadata> {
    const metadataPath = templatePath.replace(/\.[^.]+$/, '.meta.json');
    
    if (await fileExists(metadataPath)) {
      const content = await readFile(metadataPath);
      return JSON.parse(content);
    }
    
    // Create default metadata
    const name = path.basename(templatePath, path.extname(templatePath));
    return this.createDefaultMetadata(name);
  }
  
  private createDefaultMetadata(name: string): TemplateMetadata {
    return {
      name,
      description: `Template: ${name}`,
      category: 'general',
      tags: [],
      requiredContext: [],
      optionalContext: [],
      dependencies: [],
      platform: ['all'],
      version: '1.0.0',
      author: 'Xala Scaffold',
    };
  }
  
  private validateTemplateSyntax(content: string): string[] {
    const errors: string[] = [];
    
    // Check for balanced delimiters
    const openDelimiters = (content.match(/\{\{/g) || []).length;
    const closeDelimiters = (content.match(/\}\}/g) || []).length;
    
    if (openDelimiters !== closeDelimiters) {
      errors.push('Unbalanced template delimiters');
    }
    
    // Check for unclosed conditionals
    const ifBlocks = (content.match(/\{\{#if/g) || []).length;
    const endIfBlocks = (content.match(/\{\{\/if\}\}/g) || []).length;
    
    if (ifBlocks !== endIfBlocks) {
      errors.push('Unclosed conditional blocks');
    }
    
    // Check for unclosed loops
    const eachBlocks = (content.match(/\{\{#each/g) || []).length;
    const endEachBlocks = (content.match(/\{\{\/each\}\}/g) || []).length;
    
    if (eachBlocks !== endEachBlocks) {
      errors.push('Unclosed loop blocks');
    }
    
    return errors;
  }
  
  private checkNorwegianCompliance(content: string): string[] {
    const suggestions: string[] = [];
    
    // Check for compliance comments
    if (!content.includes('NSM') && !content.includes('GDPR') && !content.includes('WCAG')) {
      suggestions.push('Consider adding Norwegian compliance documentation');
    }
    
    // Check for accessibility attributes
    if (content.includes('<') && !content.includes('aria-')) {
      suggestions.push('Consider adding ARIA attributes for accessibility');
    }
    
    // Check for localization support
    if (!content.includes('i18n') && !content.includes('locale')) {
      suggestions.push('Consider adding localization support');
    }
    
    return suggestions;
  }
  
  private async buildCollections(): Promise<void> {
    // Group templates by category to create collections
    const categoryGroups = new Map<string, TemplateInfo[]>();
    
    for (const template of this.templates.values()) {
      const category = template.metadata.category;
      
      if (!categoryGroups.has(category)) {
        categoryGroups.set(category, []);
      }
      
      categoryGroups.get(category)!.push(template);
    }
    
    // Create collections from category groups
    for (const [category, templates] of categoryGroups) {
      const collection: TemplateCollection = {
        name: `${category}-collection`,
        description: `Collection of ${category} templates`,
        version: '1.0.0',
        author: 'Xala Scaffold',
        templates,
        dependencies: [],
        platform: [TemplatePlatform.ALL],
        category: category as TemplateCategory,
      };
      
      this.collections.set(collection.name, collection);
    }
  }
  
  private async loadIndex(): Promise<void> {
    try {
      const indexContent = await readFile(this.indexPath);
      const indexData = JSON.parse(indexContent);
      
      // Load templates from index
      for (const templateData of indexData.templates || []) {
        if (await fileExists(templateData.path)) {
          const stats = await fs.stat(templateData.path);
          const content = await readFile(templateData.path);
          
          const template: TemplateInfo = {
            name: templateData.name,
            path: templateData.path,
            metadata: templateData.metadata,
            content,
            lastModified: new Date(templateData.lastModified),
            size: stats.size,
            isActive: templateData.isActive !== false,
          };
          
          this.templates.set(templateData.name, template);
        }
      }
      
      // Load collections from index
      for (const collectionData of indexData.collections || []) {
        this.collections.set(collectionData.name, collectionData);
      }
      
    } catch (error) {
      logger.debug('No existing template index found or failed to load');
    }
  }
  
  private async saveIndex(): Promise<void> {
    const indexData = {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      templates: Array.from(this.templates.entries()).map(([name, info]) => ({
        name,
        path: info.path,
        metadata: info.metadata,
        lastModified: info.lastModified,
        size: info.size,
        isActive: info.isActive,
      })),
      collections: Array.from(this.collections.entries()).map(([name, collection]) => ({
        name,
        ...collection,
      })),
    };
    
    await fs.writeFile(this.indexPath, JSON.stringify(indexData, null, 2));
  }
}

// Export utility functions
export function createTemplateRegistry(
  templateEngine: TemplateEngine,
  registryPath?: string,
  indexPath?: string
): TemplateRegistry {
  return new TemplateRegistry(templateEngine, registryPath, indexPath);
}

export function createDefaultCollection(
  name: string,
  description: string,
  category: TemplateCategory,
  platform: TemplatePlatform[] = [TemplatePlatform.ALL]
): Partial<TemplateCollection> {
  return {
    name,
    description,
    version: '1.0.0',
    author: 'Xala Scaffold',
    templates: [],
    dependencies: [],
    platform,
    category,
  };
}