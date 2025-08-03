/**
 * Enhanced Service Registry Interface
 * 
 * Comprehensive interface for service registry operations with enhanced capabilities.
 * Supports metadata management, analytics, and enterprise features.
 * 
 * @author Backend Expert Agent
 * @since 2025-01-03
 */

import type {
  ServiceType,
  ServiceTemplate,
  ServiceMetadata,
  ServiceTemplateEnhanced,
  ServiceUsageAnalytics,
  TemplateRegistry
} from '../schemas';

/**
 * Registry query options for filtering and sorting
 */
export interface ServiceRegistryQueryOptions {
  readonly type?: ServiceType;
  readonly provider?: string;
  readonly framework?: string;
  readonly platform?: string;
  readonly tags?: readonly string[];
  readonly maturity?: 'alpha' | 'beta' | 'stable' | 'deprecated';
  readonly supportLevel?: 'community' | 'commercial' | 'enterprise';
  readonly compliance?: readonly string[];
  readonly multiTenant?: boolean;
  readonly search?: string;
  readonly limit?: number;
  readonly offset?: number;
  readonly sortBy?: 'name' | 'popularity' | 'rating' | 'updated' | 'created';
  readonly sortOrder?: 'asc' | 'desc';
}

/**
 * Registry statistics and analytics
 */
export interface ServiceRegistryStatistics {
  readonly totalTemplates: number;
  readonly templatesByType: Record<ServiceType, number>;
  readonly templatesByProvider: Record<string, number>;
  readonly templatesByMaturity: Record<string, number>;
  readonly averageRating: number;
  readonly totalUsage: number;
  readonly popularTemplates: readonly string[]; // Template IDs
  readonly recentlyUpdated: readonly string[]; // Template IDs
  readonly deprecated: readonly string[]; // Template IDs
}

/**
 * Template registration options
 */
export interface TemplateRegistrationOptions {
  readonly validate?: boolean;
  readonly overwrite?: boolean;
  readonly backup?: boolean;
  readonly notify?: boolean;
  readonly metadata?: Record<string, unknown>;
}

/**
 * Template update options
 */
export interface TemplateUpdateOptions {
  readonly version?: string;
  readonly changelog?: string;
  readonly migrationGuide?: string;
  readonly breaking?: boolean;
  readonly validate?: boolean;
  readonly notify?: boolean;
}

/**
 * Enhanced Service Registry Interface
 */
export interface IServiceRegistry {
  /**
   * Initialize the registry
   */
  initialize(): Promise<void>;

  /**
   * Check if registry is initialized
   */
  isInitialized(): boolean;

  /**
   * Register a service template
   */
  registerTemplate(
    template: ServiceTemplate | ServiceTemplateEnhanced,
    options?: TemplateRegistrationOptions
  ): Promise<void>;

  /**
   * Update an existing service template
   */
  updateTemplate(
    templateId: string,
    updates: Partial<ServiceTemplate | ServiceTemplateEnhanced>,
    options?: TemplateUpdateOptions
  ): Promise<void>;

  /**
   * Get a service template by type and provider
   */
  getTemplate(
    type: ServiceType,
    provider: string,
    version?: string
  ): Promise<ServiceTemplate | ServiceTemplateEnhanced | null>;

  /**
   * Get template by ID
   */
  getTemplateById(templateId: string): Promise<ServiceTemplate | ServiceTemplateEnhanced | null>;

  /**
   * List templates with advanced filtering
   */
  listTemplates(
    options?: ServiceRegistryQueryOptions
  ): Promise<readonly (ServiceTemplate | ServiceTemplateEnhanced)[]>;

  /**
   * Search templates with full-text search
   */
  searchTemplates(
    query: string,
    options?: ServiceRegistryQueryOptions
  ): Promise<readonly (ServiceTemplate | ServiceTemplateEnhanced)[]>;

  /**
   * Check if template exists
   */
  hasTemplate(type: ServiceType, provider: string, version?: string): Promise<boolean>;

  /**
   * Validate template definition
   */
  validateTemplate(
    template: ServiceTemplate | ServiceTemplateEnhanced
  ): Promise<readonly string[]>;

  /**
   * Remove a template from registry
   */
  removeTemplate(
    type: ServiceType,
    provider: string,
    version?: string
  ): Promise<boolean>;

  /**
   * Get template metadata
   */
  getTemplateMetadata(templateId: string): Promise<ServiceMetadata | null>;

  /**
   * Update template metadata
   */
  updateTemplateMetadata(
    templateId: string,
    metadata: Partial<ServiceMetadata>
  ): Promise<void>;

  /**
   * Get template usage analytics
   */
  getTemplateAnalytics(templateId: string): Promise<ServiceUsageAnalytics | null>;

  /**
   * Record template usage
   */
  recordTemplateUsage(
    templateId: string,
    context?: Record<string, unknown>
  ): Promise<void>;

  /**
   * Get registry statistics
   */
  getStatistics(): Promise<ServiceRegistryStatistics>;

  /**
   * Get templates by category
   */
  getTemplatesByCategory(category: string): Promise<readonly string[]>; // Template IDs

  /**
   * Get popular templates
   */
  getPopularTemplates(limit?: number): Promise<readonly string[]>; // Template IDs

  /**
   * Get recently updated templates
   */
  getRecentlyUpdatedTemplates(limit?: number): Promise<readonly string[]>; // Template IDs

  /**
   * Export registry to JSON
   */
  exportRegistry(): Promise<TemplateRegistry>;

  /**
   * Import registry from JSON
   */
  importRegistry(
    registry: TemplateRegistry,
    options?: { merge?: boolean; overwrite?: boolean }
  ): Promise<void>;

  /**
   * Backup registry
   */
  backup(path?: string): Promise<string>; // Returns backup path

  /**
   * Restore registry from backup
   */
  restore(backupPath: string): Promise<void>;

  /**
   * Validate registry integrity
   */
  validateRegistry(): Promise<{
    valid: boolean;
    errors: readonly string[];
    warnings: readonly string[];
  }>;

  /**
   * Cleanup deprecated templates
   */
  cleanup(options?: {
    removeDeprecated?: boolean;
    removeBroken?: boolean;
    dryRun?: boolean;
  }): Promise<{
    removed: readonly string[];
    errors: readonly string[];
  }>;

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
  ): () => void; // Returns unsubscribe function

  /**
   * Get registry health status
   */
  getHealth(): Promise<{
    status: 'healthy' | 'warning' | 'error';
    checks: readonly {
      name: string;
      status: 'pass' | 'fail' | 'warn';
      message?: string;
    }[];
    lastCheck: Date;
  }>;

  /**
   * Refresh registry cache
   */
  refresh(): Promise<void>;

  /**
   * Get registry version
   */
  getVersion(): string;
}