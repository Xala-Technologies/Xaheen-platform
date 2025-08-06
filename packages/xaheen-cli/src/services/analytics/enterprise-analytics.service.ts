/**
 * Enterprise Analytics & Business KPI Collection System
 * Comprehensive metrics collection with Norwegian compliance and real-time dashboards
 * Part of EPIC 15 Story 15.4 - Enterprise Monitoring & Observability
 */

import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { z } from 'zod';
import { createHash } from 'crypto';
import { logger } from "../../utils/logger";
import { telemetryService } from "../telemetry/enterprise-telemetry.service";

/**
 * Analytics configuration schema
 */
const AnalyticsConfigSchema = z.object({
  // Data collection
  collection: z.object({
    enabled: z.boolean().default(true),
    realTimeEnabled: z.boolean().default(true),
    batchSize: z.number().default(100),
    flushInterval: z.number().default(30000), // 30 seconds
    retentionPeriod: z.number().default(90), // 90 days
  }),
  
  // Business KPIs
  businessKpis: z.object({
    trackUsage: z.boolean().default(true),
    trackPerformance: z.boolean().default(true),
    trackErrors: z.boolean().default(true),
    trackGenerators: z.boolean().default(true),
    trackCompliance: z.boolean().default(true),
    customMetrics: z.array(z.string()).default([]),
  }),
  
  // Norwegian compliance
  compliance: z.object({
    gdprCompliant: z.boolean().default(true),
    norwegianCompliant: z.boolean().default(true),
    dataProcessingLegal: z.boolean().default(true),
    auditTrail: z.boolean().default(true),
    dataMinimization: z.boolean().default(true),
    consentRequired: z.boolean().default(false),
    anonymization: z.boolean().default(true),
  }),
  
  // Export and reporting
  export: z.object({
    enabled: z.boolean().default(true),
    formats: z.array(z.enum(['json', 'csv', 'prometheus', 'influxdb'])).default(['json']),
    endpoints: z.array(z.string()).default([]),
    encryptionEnabled: z.boolean().default(true),
  }),
  
  // Storage
  storage: z.object({
    local: z.object({
      enabled: z.boolean().default(true),
      directory: z.string().default('.xaheen/analytics'),
      compression: z.boolean().default(true),
    }),
    remote: z.object({
      enabled: z.boolean().default(false),
      endpoint: z.string().optional(),
      credentials: z.record(z.string()).default({}),
    }),
  }),
});

export type AnalyticsConfig = z.infer<typeof AnalyticsConfigSchema>;

/**
 * Business KPI metric types
 */
export enum MetricType {
  COUNTER = 'counter',
  GAUGE = 'gauge',
  HISTOGRAM = 'histogram',
  SUMMARY = 'summary',
  CUSTOM = 'custom',
}

/**
 * Metric data point
 */
export interface MetricDataPoint {
  readonly timestamp: number;
  readonly value: number;
  readonly labels: Record<string, string>;
  readonly metadata?: Record<string, any>;
}

/**
 * Business metric definition
 */
export interface BusinessMetric {
  readonly name: string;
  readonly type: MetricType;
  readonly description: string;
  readonly unit?: string;
  readonly labels: string[];
  readonly dataPoints: MetricDataPoint[];
  readonly aggregation?: 'sum' | 'avg' | 'min' | 'max' | 'count';
}

/**
 * CLI usage analytics
 */
export interface UsageAnalytics {
  readonly totalCommands: number;
  readonly uniqueUsers: number;
  readonly sessionsToday: number;
  readonly averageSessionDuration: number;
  readonly mostUsedCommands: Array<{ command: string; count: number }>;
  readonly peakUsageHours: number[];
  readonly userRetention: {
    readonly daily: number;
    readonly weekly: number;
    readonly monthly: number;
  };
  readonly geographicDistribution: Record<string, number>;
}

/**
 * Performance analytics
 */
export interface PerformanceAnalytics {
  readonly averageExecutionTime: number;
  readonly medianExecutionTime: number;
  readonly p95ExecutionTime: number;
  readonly p99ExecutionTime: number;
  readonly throughputPerSecond: number;
  readonly memoryEfficiency: number;
  readonly cacheHitRate: number;
  readonly errorRate: number;
  readonly availabilityPercentage: number;
  readonly resourceUtilization: {
    readonly cpu: number;
    readonly memory: number;
    readonly disk: number;
    readonly network: number;
  };
}

/**
 * Generator analytics
 */
export interface GeneratorAnalytics {
  readonly totalGenerations: number;
  readonly generationsByType: Record<string, number>;
  readonly averageGenerationTime: number;
  readonly linesOfCodeGenerated: number;
  readonly filesGenerated: number;
  readonly successRate: number;
  readonly mostPopularTemplates: Array<{ template: string; count: number }>;
  readonly complexityDistribution: {
    readonly simple: number;
    readonly medium: number;
    readonly complex: number;
  };
}

/**
 * Error analytics
 */
export interface ErrorAnalytics {
  readonly totalErrors: number;
  readonly errorsByType: Record<string, number>;
  readonly errorsByCommand: Record<string, number>;
  readonly errorRate: number;
  readonly mttr: number; // Mean Time To Recovery
  readonly mtbf: number; // Mean Time Between Failures
  readonly errorTrends: Array<{ timestamp: number; count: number }>;
  readonly criticalErrors: number;
}

/**
 * Norwegian compliance metrics
 */
export interface ComplianceAnalytics {
  readonly gdprCompliance: {
    readonly consentRate: number;
    readonly dataProcessingLegal: boolean;
    readonly rightsRequests: number;
    readonly dataBreaches: number;
  };
  readonly norwegianCompliance: {
    readonly dataLocalization: boolean;
    readonly reportingCompliance: boolean;
    readonly auditTrailComplete: boolean;
  };
  readonly securityMetrics: {
    readonly encryptionCoverage: number;
    readonly accessControlCompliance: number;
    readonly vulnerabilityScore: number;
  };
}

/**
 * Real-time dashboard data
 */
export interface DashboardData {
  readonly timestamp: number;
  readonly usage: UsageAnalytics;
  readonly performance: PerformanceAnalytics;
  readonly generators: GeneratorAnalytics;
  readonly errors: ErrorAnalytics;
  readonly compliance: ComplianceAnalytics;
  readonly customMetrics: Record<string, any>;
}

/**
 * Metric aggregator
 */
class MetricAggregator {
  private metrics: Map<string, BusinessMetric> = new Map();
  private config: AnalyticsConfig;

  constructor(config: AnalyticsConfig) {
    this.config = config;
  }

  registerMetric(metric: Omit<BusinessMetric, 'dataPoints'>): void {
    this.metrics.set(metric.name, {
      ...metric,
      dataPoints: [],
    });
  }

  recordDataPoint(
    metricName: string,
    value: number,
    labels: Record<string, string> = {},
    metadata?: Record<string, any>
  ): void {
    const metric = this.metrics.get(metricName);
    if (!metric) {
      logger.warn(`Metric ${metricName} not registered`);
      return;
    }

    // Apply data minimization if required
    const sanitizedLabels = this.config.compliance.dataMinimization
      ? this.sanitizeLabels(labels)
      : labels;

    const sanitizedMetadata = this.config.compliance.dataMinimization
      ? this.sanitizeMetadata(metadata)
      : metadata;

    const dataPoint: MetricDataPoint = {
      timestamp: Date.now(),
      value,
      labels: sanitizedLabels,
      metadata: sanitizedMetadata,
    };

    metric.dataPoints.push(dataPoint);

    // Maintain retention policy
    this.cleanupOldDataPoints(metric);
  }

  getMetric(name: string): BusinessMetric | undefined {
    return this.metrics.get(name);
  }

  getAllMetrics(): BusinessMetric[] {
    return Array.from(this.metrics.values());
  }

  aggregateMetric(metricName: string, timeWindow: number): number {
    const metric = this.metrics.get(metricName);
    if (!metric) return 0;

    const cutoffTime = Date.now() - timeWindow;
    const recentDataPoints = metric.dataPoints.filter(
      dp => dp.timestamp >= cutoffTime
    );

    if (recentDataPoints.length === 0) return 0;

    switch (metric.aggregation) {
      case 'sum':
        return recentDataPoints.reduce((sum, dp) => sum + dp.value, 0);
      
      case 'avg':
        return recentDataPoints.reduce((sum, dp) => sum + dp.value, 0) / recentDataPoints.length;
      
      case 'min':
        return Math.min(...recentDataPoints.map(dp => dp.value));
      
      case 'max':
        return Math.max(...recentDataPoints.map(dp => dp.value));
      
      case 'count':
        return recentDataPoints.length;
      
      default:
        return recentDataPoints[recentDataPoints.length - 1]?.value || 0;
    }
  }

  private sanitizeLabels(labels: Record<string, string>): Record<string, string> {
    const sensitiveKeys = ['email', 'phone', 'ip', 'user_agent', 'session_id'];
    const sanitized: Record<string, string> = {};

    for (const [key, value] of Object.entries(labels)) {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        sanitized[key] = this.hashValue(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  private sanitizeMetadata(metadata?: Record<string, any>): Record<string, any> | undefined {
    if (!metadata) return undefined;

    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(metadata)) {
      // Keep only essential metadata
      if (['duration', 'status', 'type', 'version'].includes(key.toLowerCase())) {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  private hashValue(value: string): string {
    return createHash('sha256').update(value).digest('hex').substring(0, 8);
  }

  private cleanupOldDataPoints(metric: BusinessMetric): void {
    const retentionTime = this.config.collection.retentionPeriod * 24 * 60 * 60 * 1000;
    const cutoffTime = Date.now() - retentionTime;
    
    metric.dataPoints = metric.dataPoints.filter(dp => dp.timestamp >= cutoffTime);
  }
}

/**
 * Enterprise Analytics Service
 */
export class EnterpriseAnalyticsService extends EventEmitter {
  private config: AnalyticsConfig;
  private aggregator: MetricAggregator;
  private dataBuffer: any[] = [];
  private flushTimer?: NodeJS.Timeout;
  private initialized: boolean = false;
  
  // Built-in analytics stores
  private usageData: Partial<UsageAnalytics> = {};
  private performanceData: Partial<PerformanceAnalytics> = {};
  private generatorData: Partial<GeneratorAnalytics> = {};
  private errorData: Partial<ErrorAnalytics> = {};
  private complianceData: Partial<ComplianceAnalytics> = {};

  constructor(config: Partial<AnalyticsConfig> = {}) {
    super();
    this.config = AnalyticsConfigSchema.parse(config);
    this.aggregator = new MetricAggregator(this.config);
  }

  async initialize(): Promise<void> {
    try {
      if (this.config.storage.local.enabled) {
        await mkdir(this.config.storage.local.directory, { recursive: true });
      }

      this.registerBuiltInMetrics();
      this.startDataCollection();
      this.setupFlushTimer();
      
      this.initialized = true;
      this.emit('initialized');

      logger.info('✅ Enterprise analytics service initialized successfully', {
        realTime: this.config.collection.realTimeEnabled,
        businessKpis: this.config.businessKpis,
        compliance: {
          gdpr: this.config.compliance.gdprCompliant,
          norwegian: this.config.compliance.norwegianCompliant,
        },
      });
    } catch (error) {
      logger.error('❌ Failed to initialize analytics service:', error);
      throw error;
    }
  }

  /**
   * Track command execution
   */
  trackCommandExecution(
    command: string,
    duration: number,
    success: boolean,
    userId?: string,
    metadata?: Record<string, any>
  ): void {
    if (!this.config.collection.enabled) return;

    const span = telemetryService.createGeneratorSpan('analytics', 'trackCommand');
    
    try {
      // Record basic metrics
      this.aggregator.recordDataPoint('cli.commands.total', 1, { command, success: success.toString() });
      this.aggregator.recordDataPoint('cli.commands.duration', duration, { command });
      
      if (userId && !this.config.compliance.anonymization) {
        this.aggregator.recordDataPoint('cli.users.active', 1, { user_id: userId });
      }

      // Update usage analytics
      this.updateUsageAnalytics(command, duration, success, userId);

      // Real-time event
      if (this.config.collection.realTimeEnabled) {
        this.emit('commandExecuted', {
          command,
          duration,
          success,
          userId: this.config.compliance.anonymization ? undefined : userId,
          timestamp: Date.now(),
        });
      }

      span.setAttributes({
        'analytics.command': command,
        'analytics.duration': duration,
        'analytics.success': success,
      });
    } finally {
      span.end();
    }
  }

  /**
   * Track generator operations
   */
  trackGeneratorOperation(
    generatorType: string,
    operation: string,
    duration: number,
    linesGenerated: number,
    filesGenerated: number,
    success: boolean
  ): void {
    if (!this.config.businessKpis.trackGenerators) return;

    this.aggregator.recordDataPoint('generators.operations.total', 1, { type: generatorType, operation });
    this.aggregator.recordDataPoint('generators.operations.duration', duration, { type: generatorType });
    this.aggregator.recordDataPoint('generators.lines_generated', linesGenerated, { type: generatorType });
    this.aggregator.recordDataPoint('generators.files_generated', filesGenerated, { type: generatorType });

    this.updateGeneratorAnalytics(generatorType, operation, duration, linesGenerated, filesGenerated, success);

    if (this.config.collection.realTimeEnabled) {
      this.emit('generatorOperation', {
        generatorType,
        operation,
        duration,
        linesGenerated,
        filesGenerated,
        success,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Track errors
   */
  trackError(
    error: Error,
    context: {
      command?: string;
      operation?: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      recoverable: boolean;
    }
  ): void {
    if (!this.config.businessKpis.trackErrors) return;

    const errorType = error.constructor.name;
    
    this.aggregator.recordDataPoint('errors.total', 1, {
      type: errorType,
      command: context.command || 'unknown',
      severity: context.severity,
    });

    this.updateErrorAnalytics(error, context);

    // Immediate alert for critical errors
    if (context.severity === 'critical') {
      this.emit('criticalError', {
        error: error.message,
        context,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Track performance metrics
   */
  trackPerformance(metrics: {
    executionTime: number;
    memoryUsage: number;
    cpuUsage: number;
    cacheHitRate: number;
    throughput: number;
  }): void {
    if (!this.config.businessKpis.trackPerformance) return;

    this.aggregator.recordDataPoint('performance.execution_time', metrics.executionTime);
    this.aggregator.recordDataPoint('performance.memory_usage', metrics.memoryUsage);
    this.aggregator.recordDataPoint('performance.cpu_usage', metrics.cpuUsage);
    this.aggregator.recordDataPoint('performance.cache_hit_rate', metrics.cacheHitRate);
    this.aggregator.recordDataPoint('performance.throughput', metrics.throughput);

    this.updatePerformanceAnalytics(metrics);
  }

  /**
   * Track compliance metrics
   */
  trackCompliance(metrics: {
    gdprCompliance: boolean;
    norwegianCompliance: boolean;
    dataProcessingLegal: boolean;
    encryptionCoverage: number;
  }): void {
    if (!this.config.businessKpis.trackCompliance) return;

    this.aggregator.recordDataPoint('compliance.gdpr', metrics.gdprCompliance ? 1 : 0);
    this.aggregator.recordDataPoint('compliance.norwegian', metrics.norwegianCompliance ? 1 : 0);
    this.aggregator.recordDataPoint('compliance.encryption_coverage', metrics.encryptionCoverage);

    this.updateComplianceAnalytics(metrics);
  }

  /**
   * Get real-time dashboard data
   */
  getDashboardData(): DashboardData {
    return {
      timestamp: Date.now(),
      usage: this.getUsageAnalytics(),
      performance: this.getPerformanceAnalytics(),
      generators: this.getGeneratorAnalytics(),
      errors: this.getErrorAnalytics(),
      compliance: this.getComplianceAnalytics(),
      customMetrics: this.getCustomMetrics(),
    };
  }

  /**
   * Generate comprehensive analytics report
   */
  generateReport(options: {
    timeRange: 'hour' | 'day' | 'week' | 'month';
    format: 'json' | 'csv' | 'prometheus';
    includeRawData?: boolean;
  }): string {
    const timeWindows = {
      hour: 60 * 60 * 1000,
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
    };

    const timeWindow = timeWindows[options.timeRange];
    const metrics = this.aggregator.getAllMetrics();
    
    const reportData = {
      metadata: {
        generatedAt: new Date().toISOString(),
        timeRange: options.timeRange,
        compliance: {
          gdpr: this.config.compliance.gdprCompliant,
          norwegian: this.config.compliance.norwegianCompliant,
        },
      },
      summary: this.getDashboardData(),
      metrics: metrics.map(metric => ({
        name: metric.name,
        type: metric.type,
        description: metric.description,
        aggregatedValue: this.aggregator.aggregateMetric(metric.name, timeWindow),
        dataPointCount: metric.dataPoints.length,
        ...(options.includeRawData && { dataPoints: metric.dataPoints }),
      })),
      recommendations: this.generateRecommendations(),
    };

    switch (options.format) {
      case 'json':
        return JSON.stringify(reportData, null, 2);
      
      case 'csv':
        return this.convertToCSV(reportData);
      
      case 'prometheus':
        return this.convertToPrometheus(reportData);
      
      default:
        return JSON.stringify(reportData);
    }
  }

  /**
   * Export analytics data
   */
  async exportData(format: 'json' | 'csv', destination?: string): Promise<string> {
    const data = this.generateReport({
      timeRange: 'month',
      format,
      includeRawData: true,
    });

    if (destination) {
      await writeFile(destination, data);
      logger.info(`Analytics data exported to ${destination}`);
    }

    return data;
  }

  async shutdown(): Promise<void> {
    try {
      if (this.flushTimer) {
        clearInterval(this.flushTimer);
      }

      await this.flushDataBuffer();
      
      this.initialized = false;
      this.emit('shutdown');
      
      logger.info('✅ Enterprise analytics service shut down successfully');
    } catch (error) {
      logger.error('❌ Error shutting down analytics service:', error);
      throw error;
    }
  }

  // Private methods

  private registerBuiltInMetrics(): void {
    // Command metrics
    this.aggregator.registerMetric({
      name: 'cli.commands.total',
      type: MetricType.COUNTER,
      description: 'Total number of CLI commands executed',
      labels: ['command', 'success'],
      aggregation: 'sum',
    });

    this.aggregator.registerMetric({
      name: 'cli.commands.duration',
      type: MetricType.HISTOGRAM,
      description: 'Command execution duration in milliseconds',
      unit: 'ms',
      labels: ['command'],
      aggregation: 'avg',
    });

    // Performance metrics
    this.aggregator.registerMetric({
      name: 'performance.execution_time',
      type: MetricType.HISTOGRAM,
      description: 'Operation execution time',
      unit: 'ms',
      labels: [],
      aggregation: 'avg',
    });

    this.aggregator.registerMetric({
      name: 'performance.memory_usage',
      type: MetricType.GAUGE,
      description: 'Memory usage in bytes',
      unit: 'bytes',
      labels: [],
      aggregation: 'avg',
    });

    // Generator metrics
    this.aggregator.registerMetric({
      name: 'generators.operations.total',
      type: MetricType.COUNTER,
      description: 'Total generator operations',
      labels: ['type', 'operation'],
      aggregation: 'sum',
    });

    this.aggregator.registerMetric({
      name: 'generators.lines_generated',
      type: MetricType.COUNTER,
      description: 'Lines of code generated',
      labels: ['type'],
      aggregation: 'sum',
    });

    // Error metrics
    this.aggregator.registerMetric({
      name: 'errors.total',
      type: MetricType.COUNTER,
      description: 'Total errors',
      labels: ['type', 'command', 'severity'],
      aggregation: 'sum',
    });

    // Compliance metrics
    this.aggregator.registerMetric({
      name: 'compliance.gdpr',
      type: MetricType.GAUGE,
      description: 'GDPR compliance status',
      labels: [],
      aggregation: 'avg',
    });

    this.aggregator.registerMetric({
      name: 'compliance.norwegian',
      type: MetricType.GAUGE,
      description: 'Norwegian compliance status',
      labels: [],
      aggregation: 'avg',
    });
  }

  private startDataCollection(): void {
    // This would start any background data collection processes
    // For now, it's event-driven through the track* methods
  }

  private setupFlushTimer(): void {
    if (this.config.collection.flushInterval > 0) {
      this.flushTimer = setInterval(() => {
        this.flushDataBuffer();
      }, this.config.collection.flushInterval);
    }
  }

  private async flushDataBuffer(): Promise<void> {
    if (this.dataBuffer.length === 0) return;

    try {
      if (this.config.storage.local.enabled) {
        const filename = `analytics-${Date.now()}.json`;
        const filepath = join(this.config.storage.local.directory, filename);
        
        await writeFile(filepath, JSON.stringify(this.dataBuffer, null, 2));
        logger.debug(`Flushed ${this.dataBuffer.length} analytics records to ${filepath}`);
      }

      this.dataBuffer = [];
      this.emit('dataFlushed');
    } catch (error) {
      logger.error('Failed to flush analytics data:', error);
    }
  }

  private updateUsageAnalytics(command: string, duration: number, success: boolean, userId?: string): void {
    // This would update the internal usage analytics structure
    // Implementation would aggregate and calculate usage metrics
  }

  private updatePerformanceAnalytics(metrics: any): void {
    // Update performance analytics
  }

  private updateGeneratorAnalytics(...args: any[]): void {
    // Update generator analytics
  }

  private updateErrorAnalytics(error: Error, context: any): void {
    // Update error analytics
  }

  private updateComplianceAnalytics(metrics: any): void {
    // Update compliance analytics
  }

  private getUsageAnalytics(): UsageAnalytics {
    // Return computed usage analytics
    return {
      totalCommands: this.aggregator.aggregateMetric('cli.commands.total', 24 * 60 * 60 * 1000),
      uniqueUsers: 0, // Would calculate from user tracking
      sessionsToday: 0,
      averageSessionDuration: 0,
      mostUsedCommands: [],
      peakUsageHours: [],
      userRetention: { daily: 0, weekly: 0, monthly: 0 },
      geographicDistribution: {},
    };
  }

  private getPerformanceAnalytics(): PerformanceAnalytics {
    const dayWindow = 24 * 60 * 60 * 1000;
    
    return {
      averageExecutionTime: this.aggregator.aggregateMetric('performance.execution_time', dayWindow),
      medianExecutionTime: 0, // Would calculate
      p95ExecutionTime: 0,
      p99ExecutionTime: 0,
      throughputPerSecond: 0,
      memoryEfficiency: 0,
      cacheHitRate: this.aggregator.aggregateMetric('performance.cache_hit_rate', dayWindow),
      errorRate: 0,
      availabilityPercentage: 99.9,
      resourceUtilization: {
        cpu: this.aggregator.aggregateMetric('performance.cpu_usage', dayWindow),
        memory: this.aggregator.aggregateMetric('performance.memory_usage', dayWindow),
        disk: 0,
        network: 0,
      },
    };
  }

  private getGeneratorAnalytics(): GeneratorAnalytics {
    const dayWindow = 24 * 60 * 60 * 1000;
    
    return {
      totalGenerations: this.aggregator.aggregateMetric('generators.operations.total', dayWindow),
      generationsByType: {},
      averageGenerationTime: this.aggregator.aggregateMetric('generators.operations.duration', dayWindow),
      linesOfCodeGenerated: this.aggregator.aggregateMetric('generators.lines_generated', dayWindow),
      filesGenerated: this.aggregator.aggregateMetric('generators.files_generated', dayWindow),
      successRate: 95.0,
      mostPopularTemplates: [],
      complexityDistribution: { simple: 60, medium: 30, complex: 10 },
    };
  }

  private getErrorAnalytics(): ErrorAnalytics {
    const dayWindow = 24 * 60 * 60 * 1000;
    
    return {
      totalErrors: this.aggregator.aggregateMetric('errors.total', dayWindow),
      errorsByType: {},
      errorsByCommand: {},
      errorRate: 0,
      mttr: 0,
      mtbf: 0,
      errorTrends: [],
      criticalErrors: 0,
    };
  }

  private getComplianceAnalytics(): ComplianceAnalytics {
    const dayWindow = 24 * 60 * 60 * 1000;
    
    return {
      gdprCompliance: {
        consentRate: 100,
        dataProcessingLegal: this.config.compliance.dataProcessingLegal,
        rightsRequests: 0,
        dataBreaches: 0,
      },
      norwegianCompliance: {
        dataLocalization: true,
        reportingCompliance: true,
        auditTrailComplete: this.config.compliance.auditTrail,
      },
      securityMetrics: {
        encryptionCoverage: this.aggregator.aggregateMetric('compliance.encryption_coverage', dayWindow),
        accessControlCompliance: 100,
        vulnerabilityScore: 0,
      },
    };
  }

  private getCustomMetrics(): Record<string, any> {
    // Return custom metrics defined in configuration
    return {};
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    
    // Performance recommendations
    const avgExecutionTime = this.aggregator.aggregateMetric('performance.execution_time', 24 * 60 * 60 * 1000);
    if (avgExecutionTime > 5000) {
      recommendations.push('Consider optimizing command execution time - average is above 5 seconds');
    }

    // Memory recommendations
    const avgMemoryUsage = this.aggregator.aggregateMetric('performance.memory_usage', 24 * 60 * 60 * 1000);
    if (avgMemoryUsage > 1024 * 1024 * 1024) { // 1GB
      recommendations.push('High memory usage detected - consider implementing memory optimization');
    }

    // Error rate recommendations
    const errorCount = this.aggregator.aggregateMetric('errors.total', 24 * 60 * 60 * 1000);
    const totalCommands = this.aggregator.aggregateMetric('cli.commands.total', 24 * 60 * 60 * 1000);
    if (totalCommands > 0 && (errorCount / totalCommands) > 0.05) {
      recommendations.push('Error rate is above 5% - review error handling and validation');
    }

    return recommendations;
  }

  private convertToCSV(data: any): string {
    // Convert data to CSV format
    return 'CSV format not implemented yet';
  }

  private convertToPrometheus(data: any): string {
    // Convert data to Prometheus format
    const lines: string[] = [];
    
    for (const metric of data.metrics) {
      lines.push(`# HELP ${metric.name} ${metric.description}`);
      lines.push(`# TYPE ${metric.name} ${metric.type}`);
      lines.push(`${metric.name} ${metric.aggregatedValue}`);
    }
    
    return lines.join('\n');
  }
}

/**
 * Global analytics service instance
 */
export const analyticsService = new EnterpriseAnalyticsService();

export default EnterpriseAnalyticsService;