/**
 * Enhanced Service Registry Core Implementation
 * 
 * Advanced service registry with comprehensive schema support, analytics,
 * and enterprise-grade features for the Xaheen platform.
 * 
 * @author Backend Expert Agent
 * @since 2025-01-03
 */

import path from "node:path";
import fs from "fs-extra";
import consola from "consola";
import { globby } from "globby";
import { EventEmitter } from "node:events";

import type {
  ServiceType,
  ServiceTemplate,
  ServiceTemplateEnhanced,
  ServiceMetadata,
  ServiceUsageAnalytics,
  TemplateRegistry
} from '../schemas';

import {
  ServiceTemplateSchema,
  ServiceTemplateEnhancedSchema,
  ServiceMetadataSchema,
  ServiceUsageAnalyticsSchema,
  TemplateRegistrySchema
} from '../schemas';

import type {
  IServiceRegistry,
  ServiceRegistryQueryOptions,
  ServiceRegistryStatistics,
  TemplateRegistrationOptions,
  TemplateUpdateOptions
} from '../interfaces';

/**
 * Enhanced Service Registry Implementation
 */
export class EnhancedServiceRegistry extends EventEmitter implements IServiceRegistry {
  private readonly templates = new Map<string, ServiceTemplateEnhanced>();
  private readonly metadata = new Map<string, ServiceMetadata>();
  private readonly analytics = new Map<string, ServiceUsageAnalytics>();
  private readonly templatePaths = new Map<string, string>();
  private readonly categories = new Map<string, Set<string>>();
  
  private initialized = false;
  private readonly version = '2.0.0';
  private lastHealthCheck?: Date;

  constructor(
    private readonly basePath?: string,
    private readonly options?: {
      enableAnalytics?: boolean;
      enableCache?: boolean;
      autoBackup?: boolean;
      backupInterval?: number; // in milliseconds
    }
  ) {
    super();
    this.basePath = basePath || this.getDefaultBasePath();
    
    // Setup auto-backup if enabled
    if (this.options?.autoBackup) {
      const interval = this.options.backupInterval || 24 * 60 * 60 * 1000; // 24 hours
      setInterval(() => this.autoBackup(), interval);
    }
  }

  /**
   * Initialize the enhanced registry
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    consola.info("Initializing enhanced service registry...");
    
    try {
      await this.ensureDirectoryStructure();
      await this.loadExistingData();
      await this.scanServiceTemplates();
      await this.validateRegistry();
      
      this.initialized = true;
      this.lastHealthCheck = new Date();
      
      consola.success(`Enhanced service registry initialized with ${this.templates.size} templates`);
      this.emit('registry-initialized', { templateCount: this.templates.size });
    } catch (error) {
      consola.error("Failed to initialize enhanced service registry:", error);
      throw new Error("Enhanced service registry initialization failed");
    }
  }

  /**
   * Check if registry is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Register a service template with enhanced features
   */
  async registerTemplate(
    template: ServiceTemplate | ServiceTemplateEnhanced,
    options: TemplateRegistrationOptions = {}
  ): Promise<void> {
    await this.ensureInitialized();

    const { validate = true, overwrite = false, backup = true, notify = true } = options;

    // Validate template if requested
    if (validate) {
      const validationErrors = await this.validateTemplate(template);
      if (validationErrors.length > 0) {
        throw new Error(`Template validation failed: ${validationErrors.join(", ")}`);
      }
    }

    // Enhance template if it's a basic template
    const enhancedTemplate = this.enhanceTemplate(template);
    const templateId = this.generateTemplateId(enhancedTemplate);
    const key = this.getTemplateKey(enhancedTemplate.type, enhancedTemplate.provider);

    // Check for existing template
    if (this.templates.has(key) && !overwrite) {
      throw new Error(`Template ${key} already exists. Use overwrite option to replace.`);
    }

    // Backup existing template if requested
    if (backup && this.templates.has(key)) {
      await this.backupTemplate(key);
    }

    // Register the template
    this.templates.set(key, enhancedTemplate);
    
    // Initialize metadata and analytics
    await this.initializeTemplateMetadata(templateId, enhancedTemplate);
    await this.initializeTemplateAnalytics(templateId);
    
    // Update categories
    if (enhancedTemplate.category) {
      this.addToCategory(enhancedTemplate.category, templateId);
    }

    // Persist to disk
    await this.persistTemplate(enhancedTemplate);

    consola.debug(`Registered enhanced template: ${enhancedTemplate.type}/${enhancedTemplate.provider}`);

    if (notify) {
      this.emit('template-added', { templateId, template: enhancedTemplate });
    }
  }

  /**
   * Update an existing template
   */
  async updateTemplate(
    templateId: string,
    updates: Partial<ServiceTemplate | ServiceTemplateEnhanced>,
    options: TemplateUpdateOptions = {}
  ): Promise<void> {
    await this.ensureInitialized();

    const existingTemplate = await this.getTemplateById(templateId);
    if (!existingTemplate) {
      throw new Error(`Template with ID ${templateId} not found`);
    }

    const { validate = true, notify = true } = options;

    // Create updated template
    const updatedTemplate = { ...existingTemplate, ...updates, updatedAt: new Date() };

    // Validate if requested
    if (validate) {
      const validationErrors = await this.validateTemplate(updatedTemplate);
      if (validationErrors.length > 0) {
        throw new Error(`Template validation failed: ${validationErrors.join(", ")}`);
      }
    }

    // Update version if provided
    if (options.version) {
      updatedTemplate.version = options.version;
    }

    // Add migration guide if provided
    if (options.migrationGuide && options.version) {
      const migrationGuide = {
        fromVersion: existingTemplate.version,
        toVersion: options.version,
        guide: options.migrationGuide,
        automated: false,
        breaking: options.breaking || false
      };
      
      updatedTemplate.migrationGuides = [
        ...(updatedTemplate.migrationGuides || []),
        migrationGuide
      ];
    }

    const key = this.getTemplateKey(updatedTemplate.type, updatedTemplate.provider);
    this.templates.set(key, updatedTemplate);

    // Update metadata
    await this.updateTemplateMetadata(templateId, {
      updatedAt: new Date(),
      versionInfo: {
        current: updatedTemplate.version,
        changelog: options.changelog
      }
    });

    // Persist changes
    await this.persistTemplate(updatedTemplate);

    consola.debug(`Updated template: ${updatedTemplate.type}/${updatedTemplate.provider}`);

    if (notify) {
      this.emit('template-updated', { templateId, template: updatedTemplate });
    }
  }

  /**
   * Get template by type and provider
   */
  async getTemplate(
    type: ServiceType,
    provider: string,
    version?: string
  ): Promise<ServiceTemplate | ServiceTemplateEnhanced | null> {
    await this.ensureInitialized();
    
    const key = this.getTemplateKey(type, provider);
    const template = this.templates.get(key);
    
    if (!template) {
      return null;
    }

    // If version is specified, check if it matches
    if (version && template.version !== version) {
      return null;
    }

    // Record usage if analytics are enabled
    if (this.options?.enableAnalytics) {
      await this.recordTemplateUsage(template.id);
    }

    return template;
  }

  /**
   * Get template by ID
   */
  async getTemplateById(templateId: string): Promise<ServiceTemplate | ServiceTemplateEnhanced | null> {
    await this.ensureInitialized();
    
    for (const template of this.templates.values()) {
      if (template.id === templateId) {
        return template;
      }
    }
    
    return null;
  }

  /**
   * List templates with advanced filtering
   */
  async listTemplates(
    options: ServiceRegistryQueryOptions = {}
  ): Promise<readonly (ServiceTemplate | ServiceTemplateEnhanced)[]> {
    await this.ensureInitialized();
    
    let templates = Array.from(this.templates.values());

    // Apply filters
    if (options.type) {
      templates = templates.filter(t => t.type === options.type);
    }
    
    if (options.provider) {
      templates = templates.filter(t => t.provider === options.provider);
    }
    
    if (options.framework) {
      templates = templates.filter(t => 
        t.frameworks?.some(f => f.name === options.framework)
      );
    }
    
    if (options.platform) {
      templates = templates.filter(t => 
        t.platforms?.some(p => p.name === options.platform)
      );
    }
    
    if (options.tags && options.tags.length > 0) {
      templates = templates.filter(t => 
        options.tags!.some(tag => t.tags.includes(tag))
      );
    }
    
    if (options.maturity) {
      templates = templates.filter(t => t.maturity === options.maturity);
    }
    
    if (options.supportLevel) {
      templates = templates.filter(t => t.supportLevel === options.supportLevel);
    }
    
    if (options.compliance && options.compliance.length > 0) {
      templates = templates.filter(t => 
        t.compliance && options.compliance!.some(c => t.compliance!.includes(c as any))
      );
    }
    
    if (options.multiTenant !== undefined) {
      templates = templates.filter(t => t.multiTenant === options.multiTenant);
    }
    
    if (options.search) {
      const searchLower = options.search.toLowerCase();
      templates = templates.filter(t => 
        t.name.toLowerCase().includes(searchLower) ||
        t.description.toLowerCase().includes(searchLower) ||
        t.keywords.some(k => k.toLowerCase().includes(searchLower))
      );
    }

    // Apply sorting
    if (options.sortBy) {
      templates.sort((a, b) => {
        let comparison = 0;
        
        switch (options.sortBy) {
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          case 'popularity':
            const aUsage = this.analytics.get(a.id)?.usageCount || 0;
            const bUsage = this.analytics.get(b.id)?.usageCount || 0;
            comparison = bUsage - aUsage;
            break;
          case 'rating':
            const aRating = this.analytics.get(a.id)?.userRating || 0;
            const bRating = this.analytics.get(b.id)?.userRating || 0;
            comparison = bRating - aRating;
            break;
          case 'updated':
            comparison = b.updatedAt.getTime() - a.updatedAt.getTime();
            break;
          case 'created':
            comparison = b.createdAt.getTime() - a.createdAt.getTime();
            break;
        }
        
        return options.sortOrder === 'desc' ? comparison : -comparison;
      });
    }

    // Apply pagination
    if (options.offset || options.limit) {
      const start = options.offset || 0;
      const end = options.limit ? start + options.limit : undefined;
      templates = templates.slice(start, end);
    }

    return templates;
  }

  /**
   * Search templates with full-text search
   */
  async searchTemplates(
    query: string,
    options: ServiceRegistryQueryOptions = {}
  ): Promise<readonly (ServiceTemplate | ServiceTemplateEnhanced)[]> {
    return this.listTemplates({ ...options, search: query });
  }

  /**
   * Check if template exists
   */
  async hasTemplate(type: ServiceType, provider: string, version?: string): Promise<boolean> {
    const template = await this.getTemplate(type, provider, version);
    return template !== null;
  }

  /**
   * Validate template definition
   */
  async validateTemplate(
    template: ServiceTemplate | ServiceTemplateEnhanced
  ): Promise<readonly string[]> {
    const errors: string[] = [];

    try {
      // Use Zod schema validation
      if ('id' in template) {
        ServiceTemplateEnhancedSchema.parse(template);
      } else {
        ServiceTemplateSchema.parse(template);
      }
    } catch (error: any) {
      if (error.errors) {
        errors.push(...error.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`));
      } else {
        errors.push(error.message);
      }
    }

    return errors;
  }

  /**
   * Remove template from registry
   */
  async removeTemplate(
    type: ServiceType,
    provider: string,
    version?: string
  ): Promise<boolean> {
    await this.ensureInitialized();
    
    const key = this.getTemplateKey(type, provider);
    const template = this.templates.get(key);
    
    if (!template || (version && template.version !== version)) {
      return false;
    }

    // Remove from maps
    this.templates.delete(key);
    this.metadata.delete(template.id);
    this.analytics.delete(template.id);
    this.templatePaths.delete(key);

    // Remove from categories
    if (template.category) {
      this.removeFromCategory(template.category, template.id);
    }

    // Remove from disk
    await this.removeTemplateFromDisk(template);

    consola.debug(`Removed template: ${type}/${provider}`);
    this.emit('template-removed', { templateId: template.id, template });

    return true;
  }

  /**
   * Get template metadata
   */
  async getTemplateMetadata(templateId: string): Promise<ServiceMetadata | null> {
    await this.ensureInitialized();
    return this.metadata.get(templateId) || null;
  }

  /**
   * Update template metadata
   */
  async updateTemplateMetadata(
    templateId: string,
    metadata: Partial<ServiceMetadata>
  ): Promise<void> {
    await this.ensureInitialized();
    
    const existing = this.metadata.get(templateId);
    if (!existing) {
      throw new Error(`Template metadata not found for ID: ${templateId}`);
    }

    const updated = { ...existing, ...metadata, updatedAt: new Date() };
    this.metadata.set(templateId, updated);

    // Persist metadata
    await this.persistMetadata(templateId, updated);
  }

  /**
   * Get template usage analytics
   */
  async getTemplateAnalytics(templateId: string): Promise<ServiceUsageAnalytics | null> {
    await this.ensureInitialized();
    return this.analytics.get(templateId) || null;
  }

  /**
   * Record template usage
   */
  async recordTemplateUsage(
    templateId: string,
    context?: Record<string, unknown>
  ): Promise<void> {
    if (!this.options?.enableAnalytics) {
      return;
    }

    await this.ensureInitialized();
    
    const existing = this.analytics.get(templateId) || {
      serviceId: templateId,
      usageCount: 0,
      popularityScore: 0,
      successRate: 100
    };

    const updated = {
      ...existing,
      usageCount: existing.usageCount + 1,
      lastUsed: new Date()
    };

    this.analytics.set(templateId, updated);
    await this.persistAnalytics(templateId, updated);
  }

  /**
   * Get registry statistics
   */
  async getStatistics(): Promise<ServiceRegistryStatistics> {
    await this.ensureInitialized();
    
    const templates = Array.from(this.templates.values());
    const templatesByType: Record<ServiceType, number> = {} as any;
    const templatesByProvider: Record<string, number> = {};
    const templatesByMaturity: Record<string, number> = {};
    
    let totalRating = 0;
    let ratedTemplates = 0;
    let totalUsage = 0;

    for (const template of templates) {
      // Count by type
      templatesByType[template.type] = (templatesByType[template.type] || 0) + 1;
      
      // Count by provider
      templatesByProvider[template.provider] = (templatesByProvider[template.provider] || 0) + 1;
      
      // Count by maturity
      templatesByMaturity[template.maturity] = (templatesByMaturity[template.maturity] || 0) + 1;
      
      // Calculate ratings and usage
      const analytics = this.analytics.get(template.id);
      if (analytics) {
        totalUsage += analytics.usageCount;
        if (analytics.userRating) {
          totalRating += analytics.userRating;
          ratedTemplates++;
        }
      }
    }

    // Get popular templates (top 10 by usage)
    const popularTemplates = templates
      .map(t => ({ id: t.id, usage: this.analytics.get(t.id)?.usageCount || 0 }))
      .sort((a, b) => b.usage - a.usage)
      .slice(0, 10)
      .map(t => t.id);

    // Get recently updated templates (last 10)
    const recentlyUpdated = templates
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 10)
      .map(t => t.id);

    // Get deprecated templates
    const deprecated = templates
      .filter(t => t.maturity === 'deprecated')
      .map(t => t.id);

    return {
      totalTemplates: templates.length,
      templatesByType,
      templatesByProvider,
      templatesByMaturity,
      averageRating: ratedTemplates > 0 ? totalRating / ratedTemplates : 0,
      totalUsage,
      popularTemplates,
      recentlyUpdated,
      deprecated
    };
  }

  /**
   * Get templates by category
   */
  async getTemplatesByCategory(category: string): Promise<readonly string[]> {
    await this.ensureInitialized();
    return Array.from(this.categories.get(category) || new Set());
  }

  /**
   * Get popular templates
   */
  async getPopularTemplates(limit = 10): Promise<readonly string[]> {
    await this.ensureInitialized();
    
    const templates = Array.from(this.templates.values());
    return templates
      .map(t => ({ id: t.id, usage: this.analytics.get(t.id)?.usageCount || 0 }))
      .sort((a, b) => b.usage - a.usage)
      .slice(0, limit)
      .map(t => t.id);
  }

  /**
   * Get recently updated templates
   */
  async getRecentlyUpdatedTemplates(limit = 10): Promise<readonly string[]> {
    await this.ensureInitialized();
    
    const templates = Array.from(this.templates.values());
    return templates
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, limit)
      .map(t => t.id);
  }

  /**
   * Export registry to JSON
   */
  async exportRegistry(): Promise<TemplateRegistry> {
    await this.ensureInitialized();
    
    const templates = Array.from(this.templates.values());
    const categories = Array.from(this.categories.entries()).map(([name, templateIds]) => ({
      name,
      description: `Category: ${name}`,
      templates: Array.from(templateIds)
    }));

    const statistics = await this.getStatistics();

    return {
      templates,
      categories,
      statistics,
      version: this.version,
      lastUpdated: new Date()
    };
  }

  /**
   * Import registry from JSON
   */
  async importRegistry(
    registry: TemplateRegistry,
    options: { merge?: boolean; overwrite?: boolean } = {}
  ): Promise<void> {
    const { merge = true, overwrite = false } = options;

    // Validate registry schema
    TemplateRegistrySchema.parse(registry);

    if (!merge) {
      // Clear existing data
      this.templates.clear();
      this.metadata.clear();
      this.analytics.clear();
      this.categories.clear();
    }

    // Import templates
    for (const template of registry.templates) {
      try {
        await this.registerTemplate(template, { overwrite, validate: false });
      } catch (error) {
        consola.warn(`Failed to import template ${template.name}:`, error);
      }
    }

    // Import categories
    for (const category of registry.categories) {
      for (const templateId of category.templates) {
        this.addToCategory(category.name, templateId);
      }
    }

    consola.info(`Imported ${registry.templates.length} templates from registry`);
  }

  /**
   * Backup registry
   */
  async backup(backupPath?: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const defaultPath = path.join(this.basePath, 'backups', `registry-backup-${timestamp}.json`);
    const finalPath = backupPath || defaultPath;

    await fs.ensureDir(path.dirname(finalPath));
    
    const registry = await this.exportRegistry();
    await fs.writeJson(finalPath, registry, { spaces: 2 });

    consola.debug(`Registry backed up to: ${finalPath}`);
    return finalPath;
  }

  /**
   * Restore registry from backup
   */
  async restore(backupPath: string): Promise<void> {
    if (!(await fs.pathExists(backupPath))) {
      throw new Error(`Backup file not found: ${backupPath}`);
    }

    const registry = await fs.readJson(backupPath);
    await this.importRegistry(registry, { merge: false, overwrite: true });

    consola.info(`Registry restored from: ${backupPath}`);
  }

  /**
   * Validate registry integrity
   */
  async validateRegistry(): Promise<{
    valid: boolean;
    errors: readonly string[];
    warnings: readonly string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate each template
    for (const template of this.templates.values()) {
      const templateErrors = await this.validateTemplate(template);
      if (templateErrors.length > 0) {
        errors.push(`Template ${template.name}: ${templateErrors.join(', ')}`);
      }

      // Check for missing metadata
      if (!this.metadata.has(template.id)) {
        warnings.push(`Missing metadata for template: ${template.name}`);
      }
    }

    // Check for orphaned metadata
    for (const [templateId, metadata] of this.metadata.entries()) {
      const template = Array.from(this.templates.values()).find(t => t.id === templateId);
      if (!template) {
        warnings.push(`Orphaned metadata for template ID: ${templateId}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Cleanup deprecated templates
   */
  async cleanup(options: {
    removeDeprecated?: boolean;
    removeBroken?: boolean;
    dryRun?: boolean;
  } = {}): Promise<{
    removed: readonly string[];
    errors: readonly string[];
  }> {
    const { removeDeprecated = false, removeBroken = false, dryRun = false } = options;
    const removed: string[] = [];
    const errors: string[] = [];

    for (const template of this.templates.values()) {
      let shouldRemove = false;

      if (removeDeprecated && template.maturity === 'deprecated') {
        shouldRemove = true;
      }

      if (removeBroken) {
        const validationErrors = await this.validateTemplate(template);
        if (validationErrors.length > 0) {
          shouldRemove = true;
        }
      }

      if (shouldRemove) {
        if (!dryRun) {
          try {
            await this.removeTemplate(template.type, template.provider);
            removed.push(`${template.type}/${template.provider}`);
          } catch (error) {
            errors.push(`Failed to remove ${template.type}/${template.provider}: ${error}`);
          }
        } else {
          removed.push(`${template.type}/${template.provider} (dry run)`);
        }
      }
    }

    return { removed, errors };
  }

  /**
   * Subscribe to registry events
   */
  subscribe(
    event: 'template-added' | 'template-updated' | 'template-removed',
    callback: (data: {
      templateId: string;
      template?: ServiceTemplate | ServiceTemplateEnhanced;
      metadata?: ServiceMetadata;
    }) => void
  ): () => void {
    this.on(event, callback);
    return () => this.off(event, callback);
  }

  /**
   * Get registry health status
   */
  async getHealth(): Promise<{
    status: 'healthy' | 'warning' | 'error';
    checks: readonly {
      name: string;
      status: 'pass' | 'fail' | 'warn';
      message?: string;
    }[];
    lastCheck: Date;
  }> {
    const checks: Array<{
      name: string;
      status: 'pass' | 'fail' | 'warn';
      message?: string;
    }> = [];

    // Check if initialized
    checks.push({
      name: 'initialization',
      status: this.initialized ? 'pass' : 'fail',
      message: this.initialized ? 'Registry is initialized' : 'Registry not initialized'
    });

    // Check base path exists
    checks.push({
      name: 'base-path',
      status: await fs.pathExists(this.basePath) ? 'pass' : 'warn',
      message: `Base path: ${this.basePath}`
    });

    // Check template count
    const templateCount = this.templates.size;
    checks.push({
      name: 'template-count',
      status: templateCount > 0 ? 'pass' : 'warn',
      message: `${templateCount} templates registered`
    });

    // Validate registry integrity
    const validation = await this.validateRegistry();
    checks.push({
      name: 'integrity',
      status: validation.valid ? 'pass' : (validation.errors.length > 0 ? 'fail' : 'warn'),
      message: validation.valid ? 'Registry integrity valid' : `${validation.errors.length} errors, ${validation.warnings.length} warnings`
    });

    // Determine overall status
    const hasFailures = checks.some(c => c.status === 'fail');
    const hasWarnings = checks.some(c => c.status === 'warn');
    const status = hasFailures ? 'error' : (hasWarnings ? 'warning' : 'healthy');

    this.lastHealthCheck = new Date();

    return {
      status,
      checks,
      lastCheck: this.lastHealthCheck
    };
  }

  /**
   * Refresh registry cache
   */
  async refresh(): Promise<void> {
    consola.info("Refreshing registry cache...");
    
    // Clear current data
    this.templates.clear();
    this.metadata.clear();
    this.analytics.clear();
    this.categories.clear();

    // Reload from disk
    await this.loadExistingData();
    await this.scanServiceTemplates();

    consola.success(`Registry refreshed with ${this.templates.size} templates`);
  }

  /**
   * Get registry version
   */
  getVersion(): string {
    return this.version;
  }

  // Private helper methods

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  private getDefaultBasePath(): string {
    return path.join(process.cwd(), "src", "services", "registry");
  }

  private async ensureDirectoryStructure(): Promise<void> {
    const dirs = [
      this.basePath,
      path.join(this.basePath, 'templates'),
      path.join(this.basePath, 'metadata'),
      path.join(this.basePath, 'analytics'),
      path.join(this.basePath, 'backups')
    ];

    for (const dir of dirs) {
      await fs.ensureDir(dir);
    }
  }

  private async loadExistingData(): Promise<void> {
    // Load metadata
    const metadataPath = path.join(this.basePath, 'metadata');
    if (await fs.pathExists(metadataPath)) {
      const metadataFiles = await globby('*.json', { cwd: metadataPath });
      for (const file of metadataFiles) {
        const templateId = path.basename(file, '.json');
        const metadata = await fs.readJson(path.join(metadataPath, file));
        this.metadata.set(templateId, metadata);
      }
    }

    // Load analytics
    const analyticsPath = path.join(this.basePath, 'analytics');
    if (await fs.pathExists(analyticsPath)) {
      const analyticsFiles = await globby('*.json', { cwd: analyticsPath });
      for (const file of analyticsFiles) {
        const templateId = path.basename(file, '.json');
        const analytics = await fs.readJson(path.join(analyticsPath, file));
        this.analytics.set(templateId, analytics);
      }
    }
  }

  private async scanServiceTemplates(): Promise<void> {
    const templatesPath = path.join(this.basePath, 'templates');
    if (!(await fs.pathExists(templatesPath))) {
      return;
    }

    // Look for template.json files
    const templateConfigPaths = await globby("**/template.json", {
      cwd: templatesPath,
      absolute: true,
      onlyFiles: true,
    });

    for (const configPath of templateConfigPaths) {
      try {
        await this.loadTemplateFromPath(configPath);
      } catch (error) {
        consola.warn(`Failed to load template from ${configPath}:`, error);
      }
    }
  }

  private async loadTemplateFromPath(configPath: string): Promise<void> {
    const configContent = await fs.readFile(configPath, "utf-8");
    const template = JSON.parse(configContent) as ServiceTemplate | ServiceTemplateEnhanced;
    
    const enhancedTemplate = this.enhanceTemplate(template);
    const key = this.getTemplateKey(enhancedTemplate.type, enhancedTemplate.provider);
    
    this.templates.set(key, enhancedTemplate);
    this.templatePaths.set(key, path.dirname(configPath));
    
    // Add to category if specified
    if (enhancedTemplate.category) {
      this.addToCategory(enhancedTemplate.category, enhancedTemplate.id);
    }
  }

  private enhanceTemplate(template: ServiceTemplate | ServiceTemplateEnhanced): ServiceTemplateEnhanced {
    if ('id' in template) {
      return template; // Already enhanced
    }

    // Convert basic template to enhanced template
    return {
      ...template,
      id: this.generateTemplateId(template),
      displayName: template.name,
      createdAt: new Date(),
      updatedAt: new Date(),
      frameworks: [],
      platforms: [],
      databases: [],
      runtimes: []
    };
  }

  private generateTemplateId(template: ServiceTemplate | ServiceTemplateEnhanced): string {
    return `${template.type}-${template.provider}-${Date.now()}`;
  }

  private getTemplateKey(type: ServiceType, provider: string): string {
    return `${type}:${provider}`;
  }

  private async initializeTemplateMetadata(templateId: string, template: ServiceTemplateEnhanced): Promise<void> {
    const metadata: ServiceMetadata = {
      serviceId: templateId,
      name: template.name,
      type: template.type,
      provider: template.provider,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
      lifecycle: 'development',
      tags: template.tags,
      labels: {},
      annotations: {}
    };

    this.metadata.set(templateId, metadata);
    await this.persistMetadata(templateId, metadata);
  }

  private async initializeTemplateAnalytics(templateId: string): Promise<void> {
    const analytics: ServiceUsageAnalytics = {
      serviceId: templateId,
      usageCount: 0,
      popularityScore: 0,
      successRate: 100,
      issues: []
    };

    this.analytics.set(templateId, analytics);
    await this.persistAnalytics(templateId, analytics);
  }

  private addToCategory(category: string, templateId: string): void {
    if (!this.categories.has(category)) {
      this.categories.set(category, new Set());
    }
    this.categories.get(category)!.add(templateId);
  }

  private removeFromCategory(category: string, templateId: string): void {
    const categorySet = this.categories.get(category);
    if (categorySet) {
      categorySet.delete(templateId);
      if (categorySet.size === 0) {
        this.categories.delete(category);
      }
    }
  }

  private async persistTemplate(template: ServiceTemplateEnhanced): Promise<void> {
    const templatePath = path.join(this.basePath, 'templates', template.type, template.provider);
    await fs.ensureDir(templatePath);
    await fs.writeJson(path.join(templatePath, 'template.json'), template, { spaces: 2 });
  }

  private async persistMetadata(templateId: string, metadata: ServiceMetadata): Promise<void> {
    const metadataPath = path.join(this.basePath, 'metadata', `${templateId}.json`);
    await fs.writeJson(metadataPath, metadata, { spaces: 2 });
  }

  private async persistAnalytics(templateId: string, analytics: ServiceUsageAnalytics): Promise<void> {
    const analyticsPath = path.join(this.basePath, 'analytics', `${templateId}.json`);
    await fs.writeJson(analyticsPath, analytics, { spaces: 2 });
  }

  private async backupTemplate(key: string): Promise<void> {
    const template = this.templates.get(key);
    if (!template) return;

    const backupPath = path.join(this.basePath, 'backups', 'templates');
    await fs.ensureDir(backupPath);
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupPath, `${key}-${timestamp}.json`);
    await fs.writeJson(backupFile, template, { spaces: 2 });
  }

  private async removeTemplateFromDisk(template: ServiceTemplateEnhanced): Promise<void> {
    const templatePath = path.join(this.basePath, 'templates', template.type, template.provider);
    if (await fs.pathExists(templatePath)) {
      await fs.remove(templatePath);
    }

    // Remove metadata file
    const metadataPath = path.join(this.basePath, 'metadata', `${template.id}.json`);
    if (await fs.pathExists(metadataPath)) {
      await fs.remove(metadataPath);
    }

    // Remove analytics file
    const analyticsPath = path.join(this.basePath, 'analytics', `${template.id}.json`);
    if (await fs.pathExists(analyticsPath)) {
      await fs.remove(analyticsPath);
    }
  }

  private async autoBackup(): Promise<void> {
    try {
      await this.backup();
      consola.debug("Auto-backup completed successfully");
    } catch (error) {
      consola.error("Auto-backup failed:", error);
    }
  }
}