/**
 * Service Metadata Manager Implementation
 * 
 * Manages comprehensive service metadata including analytics, health monitoring,
 * and lifecycle management for the Xaheen platform.
 * 
 * @author Backend Expert Agent
 * @since 2025-01-03
 */

import path from "node:path";
import fs from "fs-extra";
import consola from "consola";
import { EventEmitter } from "node:events";

import type {
  ServiceMetadata,
  ServiceUsageAnalytics,
  ServiceHealthStatus,
  ServiceComplianceInfo,
  ServiceCostInfo,
  ServiceVersionInfo
} from '../schemas';

import {
  ServiceMetadataSchema,
  ServiceUsageAnalyticsSchema,
  ServiceHealthStatusSchema,
  ServiceComplianceInfoSchema,
  ServiceCostInfoSchema,
  ServiceVersionInfoSchema
} from '../schemas';

import type {
  IServiceMetadataManager,
  MetadataQueryOptions,
  MetadataAggregationOptions
} from '../interfaces';

/**
 * Service Metadata Manager Implementation
 */
export class ServiceMetadataManager extends EventEmitter implements IServiceMetadataManager {
  private readonly metadata = new Map<string, ServiceMetadata>();
  private readonly analytics = new Map<string, ServiceUsageAnalytics>();
  private readonly healthStatus = new Map<string, ServiceHealthStatus>();
  private readonly compliance = new Map<string, ServiceComplianceInfo>();
  private readonly costInfo = new Map<string, ServiceCostInfo>();
  private readonly versionInfo = new Map<string, ServiceVersionInfo>();
  
  private readonly metadataHistory = new Map<string, Array<{
    timestamp: Date;
    changes: Record<string, { from: unknown; to: unknown }>;
    version: string;
  }>>();

  private initialized = false;

  constructor(
    private readonly basePath?: string,
    private readonly options?: {
      enablePersistence?: boolean;
      enableHistory?: boolean;
      historyLimit?: number;
      autoCleanup?: boolean;
      cleanupInterval?: number; // in milliseconds
    }
  ) {
    super();
    this.basePath = basePath || this.getDefaultBasePath();
    
    // Setup auto-cleanup if enabled
    if (this.options?.autoCleanup) {
      const interval = this.options.cleanupInterval || 24 * 60 * 60 * 1000; // 24 hours
      setInterval(() => this.performAutoCleanup(), interval);
    }
  }

  /**
   * Initialize the metadata manager
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    consola.info("Initializing service metadata manager...");
    
    try {
      if (this.options?.enablePersistence) {
        await this.ensureDirectoryStructure();
        await this.loadPersistedData();
      }
      
      this.initialized = true;
      consola.success("Service metadata manager initialized");
    } catch (error) {
      consola.error("Failed to initialize service metadata manager:", error);
      throw new Error("Service metadata manager initialization failed");
    }
  }

  /**
   * Get service metadata by ID
   */
  async getMetadata(serviceId: string): Promise<ServiceMetadata | null> {
    await this.ensureInitialized();
    return this.metadata.get(serviceId) || null;
  }

  /**
   * Get multiple service metadata
   */
  async getMultipleMetadata(serviceIds: readonly string[]): Promise<readonly ServiceMetadata[]> {
    await this.ensureInitialized();
    
    const results: ServiceMetadata[] = [];
    for (const serviceId of serviceIds) {
      const metadata = this.metadata.get(serviceId);
      if (metadata) {
        results.push(metadata);
      }
    }
    
    return results;
  }

  /**
   * Query metadata with filtering options
   */
  async queryMetadata(options: MetadataQueryOptions = {}): Promise<readonly ServiceMetadata[]> {
    await this.ensureInitialized();
    
    let results = Array.from(this.metadata.values());

    // Apply filters
    if (options.serviceIds && options.serviceIds.length > 0) {
      results = results.filter(m => options.serviceIds!.includes(m.serviceId));
    }

    if (options.types && options.types.length > 0) {
      results = results.filter(m => options.types!.includes(m.type));
    }

    if (options.providers && options.providers.length > 0) {
      results = results.filter(m => options.providers!.includes(m.provider));
    }

    if (options.lifecycles && options.lifecycles.length > 0) {
      results = results.filter(m => options.lifecycles!.includes(m.lifecycle));
    }

    if (options.tags && options.tags.length > 0) {
      results = results.filter(m => 
        options.tags!.some(tag => m.tags.includes(tag))
      );
    }

    if (options.labels) {
      results = results.filter(m => {
        for (const [key, value] of Object.entries(options.labels!)) {
          if (m.labels[key] !== value) return false;
        }
        return true;
      });
    }

    if (options.dateRange) {
      results = results.filter(m => 
        m.updatedAt >= options.dateRange!.from && 
        m.updatedAt <= options.dateRange!.to
      );
    }

    // Apply pagination
    if (options.offset || options.limit) {
      const start = options.offset || 0;
      const end = options.limit ? start + options.limit : undefined;
      results = results.slice(start, end);
    }

    return results;
  }

  /**
   * Create or update service metadata
   */
  async setMetadata(serviceId: string, metadata: ServiceMetadata): Promise<void> {
    await this.ensureInitialized();

    // Validate metadata
    try {
      ServiceMetadataSchema.parse(metadata);
    } catch (error) {
      throw new Error(`Invalid metadata for service ${serviceId}: ${error}`);
    }

    const existing = this.metadata.get(serviceId);
    const changes: Record<string, { from: unknown; to: unknown }> = {};

    // Track changes for history
    if (existing && this.options?.enableHistory) {
      for (const [key, value] of Object.entries(metadata)) {
        const existingValue = (existing as any)[key];
        if (JSON.stringify(existingValue) !== JSON.stringify(value)) {
          changes[key] = { from: existingValue, to: value };
        }
      }
    }

    // Set metadata
    this.metadata.set(serviceId, metadata);

    // Record history
    if (this.options?.enableHistory && Object.keys(changes).length > 0) {
      this.recordMetadataHistory(serviceId, changes, metadata.updatedAt.toISOString());
    }

    // Persist if enabled
    if (this.options?.enablePersistence) {
      await this.persistMetadata(serviceId, metadata);
    }

    // Emit event
    this.emit('metadata-created', { serviceId, metadata });
  }

  /**
   * Update partial metadata
   */
  async updateMetadata(
    serviceId: string,
    updates: Partial<ServiceMetadata>
  ): Promise<void> {
    await this.ensureInitialized();

    const existing = this.metadata.get(serviceId);
    if (!existing) {
      throw new Error(`Service metadata not found: ${serviceId}`);
    }

    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date()
    };

    await this.setMetadata(serviceId, updated);
    this.emit('metadata-updated', { serviceId, metadata: updated, changes: updates });
  }

  /**
   * Delete service metadata
   */
  async deleteMetadata(serviceId: string): Promise<boolean> {
    await this.ensureInitialized();

    if (!this.metadata.has(serviceId)) {
      return false;
    }

    const metadata = this.metadata.get(serviceId);
    
    // Remove from all maps
    this.metadata.delete(serviceId);
    this.analytics.delete(serviceId);
    this.healthStatus.delete(serviceId);
    this.compliance.delete(serviceId);
    this.costInfo.delete(serviceId);
    this.versionInfo.delete(serviceId);
    this.metadataHistory.delete(serviceId);

    // Remove persisted data
    if (this.options?.enablePersistence) {
      await this.removePersistedData(serviceId);
    }

    this.emit('metadata-deleted', { serviceId, metadata });
    return true;
  }

  /**
   * Get service usage analytics
   */
  async getUsageAnalytics(serviceId: string): Promise<ServiceUsageAnalytics | null> {
    await this.ensureInitialized();
    return this.analytics.get(serviceId) || null;
  }

  /**
   * Update usage analytics
   */
  async updateUsageAnalytics(
    serviceId: string,
    analytics: Partial<ServiceUsageAnalytics>
  ): Promise<void> {
    await this.ensureInitialized();

    const existing = this.analytics.get(serviceId) || {
      serviceId,
      usageCount: 0,
      popularityScore: 0,
      successRate: 100,
      issues: []
    };

    const updated = { ...existing, ...analytics };
    
    try {
      ServiceUsageAnalyticsSchema.parse(updated);
    } catch (error) {
      throw new Error(`Invalid analytics for service ${serviceId}: ${error}`);
    }

    this.analytics.set(serviceId, updated);

    if (this.options?.enablePersistence) {
      await this.persistAnalytics(serviceId, updated);
    }
  }

  /**
   * Record service usage event
   */
  async recordUsage(
    serviceId: string,
    context?: {
      operation?: string;
      duration?: number;
      success?: boolean;
      metadata?: Record<string, unknown>;
    }
  ): Promise<void> {
    await this.ensureInitialized();

    const existing = this.analytics.get(serviceId) || {
      serviceId,
      usageCount: 0,
      popularityScore: 0,
      successRate: 100,
      issues: []
    };

    const updated = {
      ...existing,
      usageCount: existing.usageCount + 1,
      lastUsed: new Date()
    };

    // Update average setup time if duration provided
    if (context?.duration) {
      updated.averageSetupTime = existing.averageSetupTime 
        ? (existing.averageSetupTime + context.duration) / 2
        : context.duration;
    }

    // Update success rate if success information provided
    if (context?.success !== undefined) {
      const totalOperations = existing.usageCount + 1;
      const successfulOperations = Math.round(existing.successRate * existing.usageCount / 100) + (context.success ? 1 : 0);
      updated.successRate = (successfulOperations / totalOperations) * 100;
    }

    // Update popularity score based on recent usage
    updated.popularityScore = Math.min(100, updated.usageCount * 0.1);

    await this.updateUsageAnalytics(serviceId, updated);
  }

  /**
   * Get service health status
   */
  async getHealthStatus(serviceId: string): Promise<ServiceHealthStatus | null> {
    await this.ensureInitialized();
    return this.healthStatus.get(serviceId) || null;
  }

  /**
   * Update service health status
   */
  async updateHealthStatus(
    serviceId: string,
    health: ServiceHealthStatus
  ): Promise<void> {
    await this.ensureInitialized();

    try {
      ServiceHealthStatusSchema.parse(health);
    } catch (error) {
      throw new Error(`Invalid health status for service ${serviceId}: ${error}`);
    }

    const previous = this.healthStatus.get(serviceId);
    this.healthStatus.set(serviceId, health);

    if (this.options?.enablePersistence) {
      await this.persistHealthStatus(serviceId, health);
    }

    // Emit health change event if status changed
    if (!previous || previous.status !== health.status) {
      this.emit('health-changed', { serviceId, health });
    }
  }

  /**
   * Perform health check for service
   */
  async performHealthCheck(
    serviceId: string,
    checks?: readonly {
      name: string;
      check: () => Promise<{ status: 'pass' | 'fail' | 'warn'; message?: string }>;
    }[]
  ): Promise<ServiceHealthStatus> {
    await this.ensureInitialized();

    const healthChecks: Array<{
      name: string;
      status: 'pass' | 'fail' | 'warn';
      message?: string;
      checkedAt: Date;
    }> = [];

    let overallStatus: 'healthy' | 'warning' | 'error' = 'healthy';

    if (checks && checks.length > 0) {
      for (const check of checks) {
        try {
          const result = await check.check();
          healthChecks.push({
            name: check.name,
            status: result.status,
            message: result.message,
            checkedAt: new Date()
          });

          // Update overall status
          if (result.status === 'fail') {
            overallStatus = 'error';
          } else if (result.status === 'warn' && overallStatus !== 'error') {
            overallStatus = 'warning';
          }
        } catch (error) {
          healthChecks.push({
            name: check.name,
            status: 'fail',
            message: `Health check failed: ${error}`,
            checkedAt: new Date()
          });
          overallStatus = 'error';
        }
      }
    }

    const healthStatus: ServiceHealthStatus = {
      status: overallStatus,
      lastHealthCheck: new Date(),
      checks: healthChecks
    };

    await this.updateHealthStatus(serviceId, healthStatus);
    return healthStatus;
  }

  /**
   * Get service compliance information
   */
  async getComplianceInfo(serviceId: string): Promise<ServiceComplianceInfo | null> {
    await this.ensureInitialized();
    return this.compliance.get(serviceId) || null;
  }

  /**
   * Update compliance information
   */
  async updateComplianceInfo(
    serviceId: string,
    compliance: ServiceComplianceInfo
  ): Promise<void> {
    await this.ensureInitialized();

    try {
      ServiceComplianceInfoSchema.parse(compliance);
    } catch (error) {
      throw new Error(`Invalid compliance info for service ${serviceId}: ${error}`);
    }

    this.compliance.set(serviceId, compliance);

    if (this.options?.enablePersistence) {
      await this.persistComplianceInfo(serviceId, compliance);
    }
  }

  /**
   * Get service cost information
   */
  async getCostInfo(serviceId: string): Promise<ServiceCostInfo | null> {
    await this.ensureInitialized();
    return this.costInfo.get(serviceId) || null;
  }

  /**
   * Update cost information
   */
  async updateCostInfo(serviceId: string, cost: ServiceCostInfo): Promise<void> {
    await this.ensureInitialized();

    try {
      ServiceCostInfoSchema.parse(cost);
    } catch (error) {
      throw new Error(`Invalid cost info for service ${serviceId}: ${error}`);
    }

    this.costInfo.set(serviceId, cost);

    if (this.options?.enablePersistence) {
      await this.persistCostInfo(serviceId, cost);
    }
  }

  /**
   * Get service version information
   */
  async getVersionInfo(serviceId: string): Promise<ServiceVersionInfo | null> {
    await this.ensureInitialized();
    return this.versionInfo.get(serviceId) || null;
  }

  /**
   * Update version information
   */
  async updateVersionInfo(serviceId: string, version: ServiceVersionInfo): Promise<void> {
    await this.ensureInitialized();

    try {
      ServiceVersionInfoSchema.parse(version);
    } catch (error) {
      throw new Error(`Invalid version info for service ${serviceId}: ${error}`);
    }

    this.versionInfo.set(serviceId, version);

    if (this.options?.enablePersistence) {
      await this.persistVersionInfo(serviceId, version);
    }
  }

  /**
   * Add tags to service
   */
  async addTags(serviceId: string, tags: readonly string[]): Promise<void> {
    const metadata = await this.getMetadata(serviceId);
    if (!metadata) {
      throw new Error(`Service metadata not found: ${serviceId}`);
    }

    const existingTags = new Set(metadata.tags);
    for (const tag of tags) {
      existingTags.add(tag);
    }

    await this.updateMetadata(serviceId, {
      tags: Array.from(existingTags)
    });
  }

  /**
   * Remove tags from service
   */
  async removeTags(serviceId: string, tags: readonly string[]): Promise<void> {
    const metadata = await this.getMetadata(serviceId);
    if (!metadata) {
      throw new Error(`Service metadata not found: ${serviceId}`);
    }

    const updatedTags = metadata.tags.filter(tag => !tags.includes(tag));

    await this.updateMetadata(serviceId, {
      tags: updatedTags
    });
  }

  /**
   * Set labels for service
   */
  async setLabels(serviceId: string, labels: Record<string, string>): Promise<void> {
    await this.updateMetadata(serviceId, { labels });
  }

  /**
   * Add annotations to service
   */
  async addAnnotations(serviceId: string, annotations: Record<string, string>): Promise<void> {
    const metadata = await this.getMetadata(serviceId);
    if (!metadata) {
      throw new Error(`Service metadata not found: ${serviceId}`);
    }

    const updatedAnnotations = {
      ...metadata.annotations,
      ...annotations
    };

    await this.updateMetadata(serviceId, {
      annotations: updatedAnnotations
    });
  }

  /**
   * Search metadata by text
   */
  async searchMetadata(
    query: string,
    options?: MetadataQueryOptions
  ): Promise<readonly ServiceMetadata[]> {
    const allResults = await this.queryMetadata(options);
    const queryLower = query.toLowerCase();

    return allResults.filter(metadata => 
      metadata.name.toLowerCase().includes(queryLower) ||
      metadata.type.toLowerCase().includes(queryLower) ||
      metadata.provider.toLowerCase().includes(queryLower) ||
      metadata.tags.some(tag => tag.toLowerCase().includes(queryLower)) ||
      Object.values(metadata.labels).some(label => label.toLowerCase().includes(queryLower))
    );
  }

  /**
   * Get metadata aggregations
   */
  async getAggregations(
    options?: MetadataAggregationOptions
  ): Promise<Record<string, unknown>> {
    await this.ensureInitialized();

    const metadata = Array.from(this.metadata.values());
    const result: Record<string, unknown> = {};

    if (!options?.groupBy) {
      return result;
    }

    // Group by specified field
    const groups: Record<string, ServiceMetadata[]> = {};
    for (const item of metadata) {
      const groupKey = (item as any)[options.groupBy];
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
    }

    // Calculate metrics for each group
    for (const [groupKey, items] of Object.entries(groups)) {
      const groupMetrics: Record<string, unknown> = {};

      if (options.metrics?.includes('count')) {
        groupMetrics.count = items.length;
      }

      if (options.metrics?.includes('usage')) {
        const totalUsage = items.reduce((sum, item) => {
          const analytics = this.analytics.get(item.serviceId);
          return sum + (analytics?.usageCount || 0);
        }, 0);
        groupMetrics.usage = totalUsage;
      }

      if (options.metrics?.includes('health')) {
        const healthyCount = items.reduce((count, item) => {
          const health = this.healthStatus.get(item.serviceId);
          return count + (health?.status === 'healthy' ? 1 : 0);
        }, 0);
        groupMetrics.healthPercentage = (healthyCount / items.length) * 100;
      }

      result[groupKey] = groupMetrics;
    }

    return result;
  }

  /**
   * Export metadata to JSON
   */
  async exportMetadata(
    serviceIds?: readonly string[],
    format: 'json' | 'csv' | 'yaml' = 'json'
  ): Promise<string> {
    await this.ensureInitialized();

    const metadata = serviceIds 
      ? await this.getMultipleMetadata(serviceIds)
      : Array.from(this.metadata.values());

    switch (format) {
      case 'json':
        return JSON.stringify(metadata, null, 2);
      case 'csv':
        return this.exportToCsv(metadata);
      case 'yaml':
        return this.exportToYaml(metadata);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Import metadata from JSON
   */
  async importMetadata(
    data: string,
    format: 'json' | 'csv' | 'yaml' = 'json',
    options: { merge?: boolean; overwrite?: boolean } = {}
  ): Promise<{
    imported: number;
    updated: number;
    errors: readonly string[];
  }> {
    await this.ensureInitialized();

    const { merge = true, overwrite = false } = options;
    const errors: string[] = [];
    let imported = 0;
    let updated = 0;

    try {
      let metadata: ServiceMetadata[];

      switch (format) {
        case 'json':
          metadata = JSON.parse(data);
          break;
        default:
          throw new Error(`Import format ${format} not yet implemented`);
      }

      for (const item of metadata) {
        try {
          const existing = await this.getMetadata(item.serviceId);
          
          if (existing && !overwrite) {
            if (merge) {
              await this.updateMetadata(item.serviceId, item);
              updated++;
            } else {
              errors.push(`Service ${item.serviceId} already exists`);
            }
          } else {
            await this.setMetadata(item.serviceId, item);
            if (existing) {
              updated++;
            } else {
              imported++;
            }
          }
        } catch (error) {
          errors.push(`Failed to import ${item.serviceId}: ${error}`);
        }
      }
    } catch (error) {
      errors.push(`Failed to parse data: ${error}`);
    }

    return { imported, updated, errors };
  }

  /**
   * Get metadata history for service
   */
  async getMetadataHistory(
    serviceId: string,
    limit = 50
  ): Promise<readonly {
    timestamp: Date;
    changes: Record<string, { from: unknown; to: unknown }>;
    version: string;
  }[]> {
    await this.ensureInitialized();

    const history = this.metadataHistory.get(serviceId) || [];
    return history.slice(-limit);
  }

  /**
   * Validate metadata against schema
   */
  async validateMetadata(metadata: ServiceMetadata): Promise<{
    valid: boolean;
    errors: readonly string[];
    warnings: readonly string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      ServiceMetadataSchema.parse(metadata);
    } catch (error: any) {
      if (error.errors) {
        errors.push(...error.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`));
      } else {
        errors.push(error.message);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Cleanup expired metadata
   */
  async cleanup(options: {
    removeExpired?: boolean;
    removeOrphaned?: boolean;
    retentionPeriod?: string;
    dryRun?: boolean;
  } = {}): Promise<{
    removed: readonly string[];
    errors: readonly string[];
  }> {
    await this.ensureInitialized();

    const { removeExpired = false, removeOrphaned = false, dryRun = false } = options;
    const removed: string[] = [];
    const errors: string[] = [];

    // Parse retention period (e.g., "90d", "1y")
    let retentionMs = 90 * 24 * 60 * 60 * 1000; // Default 90 days
    if (options.retentionPeriod) {
      // Simple parser for common patterns
      const match = options.retentionPeriod.match(/^(\d+)([dwmy])$/);
      if (match) {
        const value = parseInt(match[1]);
        const unit = match[2];
        switch (unit) {
          case 'd': retentionMs = value * 24 * 60 * 60 * 1000; break;
          case 'w': retentionMs = value * 7 * 24 * 60 * 60 * 1000; break;
          case 'm': retentionMs = value * 30 * 24 * 60 * 60 * 1000; break;
          case 'y': retentionMs = value * 365 * 24 * 60 * 60 * 1000; break;
        }
      }
    }

    const cutoffDate = new Date(Date.now() - retentionMs);

    for (const [serviceId, metadata] of this.metadata.entries()) {
      let shouldRemove = false;

      if (removeExpired && metadata.updatedAt < cutoffDate) {
        shouldRemove = true;
      }

      // Add more cleanup criteria as needed
      
      if (shouldRemove) {
        if (!dryRun) {
          try {
            await this.deleteMetadata(serviceId);
            removed.push(serviceId);
          } catch (error) {
            errors.push(`Failed to remove ${serviceId}: ${error}`);
          }
        } else {
          removed.push(`${serviceId} (dry run)`);
        }
      }
    }

    return { removed, errors };
  }

  /**
   * Subscribe to metadata events
   */
  subscribe(
    event: 'metadata-created' | 'metadata-updated' | 'metadata-deleted' | 'health-changed',
    callback: (data: {
      serviceId: string;
      metadata?: ServiceMetadata;
      changes?: Record<string, { from: unknown; to: unknown }>;
    }) => void
  ): () => void {
    this.on(event, callback);
    return () => this.off(event, callback);
  }

  /**
   * Get metadata statistics
   */
  async getStatistics(): Promise<{
    totalServices: number;
    servicesByType: Record<string, number>;
    servicesByProvider: Record<string, number>;
    servicesByLifecycle: Record<string, number>;
    averageHealth: number;
    totalUsage: number;
    topTags: readonly { tag: string; count: number }[];
  }> {
    await this.ensureInitialized();

    const metadata = Array.from(this.metadata.values());
    const servicesByType: Record<string, number> = {};
    const servicesByProvider: Record<string, number> = {};
    const servicesByLifecycle: Record<string, number> = {};
    const tagCounts: Record<string, number> = {};

    let totalUsage = 0;
    let healthyCount = 0;

    for (const item of metadata) {
      // Count by type
      servicesByType[item.type] = (servicesByType[item.type] || 0) + 1;
      
      // Count by provider
      servicesByProvider[item.provider] = (servicesByProvider[item.provider] || 0) + 1;
      
      // Count by lifecycle
      servicesByLifecycle[item.lifecycle] = (servicesByLifecycle[item.lifecycle] || 0) + 1;
      
      // Count tags
      for (const tag of item.tags) {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      }

      // Aggregate usage
      const analytics = this.analytics.get(item.serviceId);
      if (analytics) {
        totalUsage += analytics.usageCount;
      }

      // Count healthy services
      const health = this.healthStatus.get(item.serviceId);
      if (health?.status === 'healthy') {
        healthyCount++;
      }
    }

    // Get top tags
    const topTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));

    return {
      totalServices: metadata.length,
      servicesByType,
      servicesByProvider,
      servicesByLifecycle,
      averageHealth: metadata.length > 0 ? (healthyCount / metadata.length) * 100 : 0,
      totalUsage,
      topTags
    };
  }

  // Private helper methods

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  private getDefaultBasePath(): string {
    return path.join(process.cwd(), "src", "services", "registry", "metadata");
  }

  private async ensureDirectoryStructure(): Promise<void> {
    const dirs = [
      this.basePath,
      path.join(this.basePath, 'metadata'),
      path.join(this.basePath, 'analytics'),
      path.join(this.basePath, 'health'),
      path.join(this.basePath, 'compliance'),
      path.join(this.basePath, 'cost'),
      path.join(this.basePath, 'version')
    ];

    for (const dir of dirs) {
      await fs.ensureDir(dir);
    }
  }

  private async loadPersistedData(): Promise<void> {
    // Load metadata
    await this.loadDataType('metadata', this.metadata);
    await this.loadDataType('analytics', this.analytics);
    await this.loadDataType('health', this.healthStatus);
    await this.loadDataType('compliance', this.compliance);
    await this.loadDataType('cost', this.costInfo);
    await this.loadDataType('version', this.versionInfo);
  }

  private async loadDataType(type: string, targetMap: Map<string, any>): Promise<void> {
    const dataPath = path.join(this.basePath, type);
    if (!(await fs.pathExists(dataPath))) {
      return;
    }

    const files = await fs.readdir(dataPath);
    for (const file of files) {
      if (file.endsWith('.json')) {
        const serviceId = path.basename(file, '.json');
        try {
          const data = await fs.readJson(path.join(dataPath, file));
          targetMap.set(serviceId, data);
        } catch (error) {
          consola.warn(`Failed to load ${type} for ${serviceId}:`, error);
        }
      }
    }
  }

  private async persistMetadata(serviceId: string, metadata: ServiceMetadata): Promise<void> {
    const filePath = path.join(this.basePath, 'metadata', `${serviceId}.json`);
    await fs.writeJson(filePath, metadata, { spaces: 2 });
  }

  private async persistAnalytics(serviceId: string, analytics: ServiceUsageAnalytics): Promise<void> {
    const filePath = path.join(this.basePath, 'analytics', `${serviceId}.json`);
    await fs.writeJson(filePath, analytics, { spaces: 2 });
  }

  private async persistHealthStatus(serviceId: string, health: ServiceHealthStatus): Promise<void> {
    const filePath = path.join(this.basePath, 'health', `${serviceId}.json`);
    await fs.writeJson(filePath, health, { spaces: 2 });
  }

  private async persistComplianceInfo(serviceId: string, compliance: ServiceComplianceInfo): Promise<void> {
    const filePath = path.join(this.basePath, 'compliance', `${serviceId}.json`);
    await fs.writeJson(filePath, compliance, { spaces: 2 });
  }

  private async persistCostInfo(serviceId: string, cost: ServiceCostInfo): Promise<void> {
    const filePath = path.join(this.basePath, 'cost', `${serviceId}.json`);
    await fs.writeJson(filePath, cost, { spaces: 2 });
  }

  private async persistVersionInfo(serviceId: string, version: ServiceVersionInfo): Promise<void> {
    const filePath = path.join(this.basePath, 'version', `${serviceId}.json`);
    await fs.writeJson(filePath, version, { spaces: 2 });
  }

  private async removePersistedData(serviceId: string): Promise<void> {
    const types = ['metadata', 'analytics', 'health', 'compliance', 'cost', 'version'];
    
    for (const type of types) {
      const filePath = path.join(this.basePath, type, `${serviceId}.json`);
      if (await fs.pathExists(filePath)) {
        await fs.remove(filePath);
      }
    }
  }

  private recordMetadataHistory(
    serviceId: string,
    changes: Record<string, { from: unknown; to: unknown }>,
    version: string
  ): void {
    if (!this.metadataHistory.has(serviceId)) {
      this.metadataHistory.set(serviceId, []);
    }

    const history = this.metadataHistory.get(serviceId)!;
    history.push({
      timestamp: new Date(),
      changes,
      version
    });

    // Limit history size
    const limit = this.options?.historyLimit || 100;
    if (history.length > limit) {
      history.splice(0, history.length - limit);
    }
  }

  private exportToCsv(metadata: readonly ServiceMetadata[]): string {
    // Simple CSV export implementation
    const headers = ['serviceId', 'name', 'type', 'provider', 'lifecycle', 'createdAt', 'updatedAt'];
    const rows = metadata.map(item => [
      item.serviceId,
      item.name,
      item.type,
      item.provider,
      item.lifecycle,
      item.createdAt.toISOString(),
      item.updatedAt.toISOString()
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  private exportToYaml(metadata: readonly ServiceMetadata[]): string {
    // Simple YAML export - in production you'd use a proper YAML library
    return `# Service Metadata Export\nservices:\n${metadata.map(item => 
      `  - serviceId: ${item.serviceId}\n    name: ${item.name}\n    type: ${item.type}\n    provider: ${item.provider}`
    ).join('\n')}`;
  }

  private async performAutoCleanup(): Promise<void> {
    try {
      await this.cleanup({
        removeExpired: true,
        retentionPeriod: '90d'
      });
      consola.debug("Auto-cleanup completed successfully");
    } catch (error) {
      consola.error("Auto-cleanup failed:", error);
    }
  }
}