/**
 * Service Metadata Manager Interface
 * 
 * Interface for managing comprehensive service metadata including analytics,
 * health monitoring, and lifecycle management.
 * 
 * @author Backend Expert Agent
 * @since 2025-01-03
 */

import type {
  ServiceMetadata,
  ServiceUsageAnalytics,
  ServiceHealthStatus,
  ServiceComplianceInfo,
  ServiceCostInfo,
  ServiceVersionInfo
} from '../schemas';

/**
 * Metadata query options
 */
export interface MetadataQueryOptions {
  readonly serviceIds?: readonly string[];
  readonly types?: readonly string[];
  readonly providers?: readonly string[];
  readonly lifecycles?: readonly string[];
  readonly tags?: readonly string[];
  readonly labels?: Record<string, string>;
  readonly dateRange?: {
    from: Date;
    to: Date;
  };
  readonly limit?: number;
  readonly offset?: number;
}

/**
 * Metadata aggregation options
 */
export interface MetadataAggregationOptions {
  readonly groupBy?: 'type' | 'provider' | 'lifecycle' | 'tag';
  readonly metrics?: readonly ('count' | 'usage' | 'health' | 'cost')[];
  readonly timeWindow?: '1h' | '24h' | '7d' | '30d' | '90d';
}

/**
 * Service Metadata Manager Interface
 */
export interface IServiceMetadataManager {
  /**
   * Get service metadata by ID
   */
  getMetadata(serviceId: string): Promise<ServiceMetadata | null>;

  /**
   * Get multiple service metadata
   */
  getMultipleMetadata(serviceIds: readonly string[]): Promise<readonly ServiceMetadata[]>;

  /**
   * Query metadata with filtering options
   */
  queryMetadata(options?: MetadataQueryOptions): Promise<readonly ServiceMetadata[]>;

  /**
   * Create or update service metadata
   */
  setMetadata(serviceId: string, metadata: ServiceMetadata): Promise<void>;

  /**
   * Update partial metadata
   */
  updateMetadata(
    serviceId: string,
    updates: Partial<ServiceMetadata>
  ): Promise<void>;

  /**
   * Delete service metadata
   */
  deleteMetadata(serviceId: string): Promise<boolean>;

  /**
   * Get service usage analytics
   */
  getUsageAnalytics(serviceId: string): Promise<ServiceUsageAnalytics | null>;

  /**
   * Update usage analytics
   */
  updateUsageAnalytics(
    serviceId: string,
    analytics: Partial<ServiceUsageAnalytics>
  ): Promise<void>;

  /**
   * Record service usage event
   */
  recordUsage(
    serviceId: string,
    context?: {
      operation?: string;
      duration?: number;
      success?: boolean;
      metadata?: Record<string, unknown>;
    }
  ): Promise<void>;

  /**
   * Get service health status
   */
  getHealthStatus(serviceId: string): Promise<ServiceHealthStatus | null>;

  /**
   * Update service health status
   */
  updateHealthStatus(
    serviceId: string,
    health: ServiceHealthStatus
  ): Promise<void>;

  /**
   * Perform health check for service
   */
  performHealthCheck(
    serviceId: string,
    checks?: readonly {
      name: string;
      check: () => Promise<{ status: 'pass' | 'fail' | 'warn'; message?: string }>;
    }[]
  ): Promise<ServiceHealthStatus>;

  /**
   * Get service compliance information
   */
  getComplianceInfo(serviceId: string): Promise<ServiceComplianceInfo | null>;

  /**
   * Update compliance information
   */
  updateComplianceInfo(
    serviceId: string,
    compliance: ServiceComplianceInfo
  ): Promise<void>;

  /**
   * Get service cost information
   */
  getCostInfo(serviceId: string): Promise<ServiceCostInfo | null>;

  /**
   * Update cost information
   */
  updateCostInfo(serviceId: string, cost: ServiceCostInfo): Promise<void>;

  /**
   * Get service version information
   */
  getVersionInfo(serviceId: string): Promise<ServiceVersionInfo | null>;

  /**
   * Update version information
   */
  updateVersionInfo(serviceId: string, version: ServiceVersionInfo): Promise<void>;

  /**
   * Add tags to service
   */
  addTags(serviceId: string, tags: readonly string[]): Promise<void>;

  /**
   * Remove tags from service
   */
  removeTags(serviceId: string, tags: readonly string[]): Promise<void>;

  /**
   * Set labels for service
   */
  setLabels(serviceId: string, labels: Record<string, string>): Promise<void>;

  /**
   * Add annotations to service
   */
  addAnnotations(serviceId: string, annotations: Record<string, string>): Promise<void>;

  /**
   * Search metadata by text
   */
  searchMetadata(
    query: string,
    options?: MetadataQueryOptions
  ): Promise<readonly ServiceMetadata[]>;

  /**
   * Get metadata aggregations
   */
  getAggregations(
    options?: MetadataAggregationOptions
  ): Promise<Record<string, unknown>>;

  /**
   * Export metadata to JSON
   */
  exportMetadata(
    serviceIds?: readonly string[],
    format?: 'json' | 'csv' | 'yaml'
  ): Promise<string>;

  /**
   * Import metadata from JSON
   */
  importMetadata(
    data: string,
    format?: 'json' | 'csv' | 'yaml',
    options?: { merge?: boolean; overwrite?: boolean }
  ): Promise<{
    imported: number;
    updated: number;
    errors: readonly string[];
  }>;

  /**
   * Get metadata history for service
   */
  getMetadataHistory(
    serviceId: string,
    limit?: number
  ): Promise<readonly {
    timestamp: Date;
    changes: Record<string, { from: unknown; to: unknown }>;
    version: string;
  }[]>;

  /**
   * Validate metadata against schema
   */
  validateMetadata(metadata: ServiceMetadata): Promise<{
    valid: boolean;
    errors: readonly string[];
    warnings: readonly string[];
  }>;

  /**
   * Cleanup expired metadata
   */
  cleanup(options?: {
    removeExpired?: boolean;
    removeOrphaned?: boolean;
    retentionPeriod?: string; // e.g., '90d', '1y'
    dryRun?: boolean;
  }): Promise<{
    removed: readonly string[];
    errors: readonly string[];
  }>;

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
  ): () => void; // Returns unsubscribe function

  /**
   * Get metadata statistics
   */
  getStatistics(): Promise<{
    totalServices: number;
    servicesByType: Record<string, number>;
    servicesByProvider: Record<string, number>;
    servicesByLifecycle: Record<string, number>;
    averageHealth: number;
    totalUsage: number;
    topTags: readonly { tag: string; count: number }[];
  }>;
}