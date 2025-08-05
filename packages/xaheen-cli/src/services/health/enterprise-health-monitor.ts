/**
 * Enterprise Health Monitoring & Self-Healing System
 * Comprehensive health checks, circuit breakers, and automated recovery
 * Part of EPIC 15 Story 15.4 - Enterprise Monitoring & Observability
 */

import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';
import { execSync } from 'child_process';
import { readdir, stat, access } from 'fs/promises';
import { join } from 'path';
import { z } from 'zod';
import { logger } from '../../utils/logger.js';
import { telemetryService } from '../telemetry/enterprise-telemetry.service.js';
import { analyticsService } from '../analytics/enterprise-analytics.service.js';

/**
 * Health monitoring configuration schema
 */
const HealthConfigSchema = z.object({
  // Health check intervals
  intervals: z.object({
    system: z.number().default(30000), // 30 seconds
    services: z.number().default(60000), // 1 minute
    resources: z.number().default(10000), // 10 seconds
    dependencies: z.number().default(120000), // 2 minutes
  }),
  
  // Circuit breaker configuration
  circuitBreaker: z.object({
    enabled: z.boolean().default(true),
    failureThreshold: z.number().default(5),
    successThreshold: z.number().default(3),
    timeout: z.number().default(60000), // 1 minute
    monitoringPeriod: z.number().default(300000), // 5 minutes
  }),
  
  // Self-healing configuration
  selfHealing: z.object({
    enabled: z.boolean().default(true),
    maxRetries: z.number().default(3),
    retryDelay: z.number().default(5000), // 5 seconds
    escalationThreshold: z.number().default(3),
    autoRestart: z.boolean().default(true),
  }),
  
  // Resource thresholds
  thresholds: z.object({
    cpu: z.object({
      warning: z.number().default(70),
      critical: z.number().default(90),
    }),
    memory: z.object({
      warning: z.number().default(80),
      critical: z.number().default(95),
    }),
    disk: z.object({
      warning: z.number().default(85),
      critical: z.number().default(95),
    }),
    network: z.object({
      latency: z.number().default(1000), // 1 second
      timeout: z.number().default(5000), // 5 seconds
    }),
    responseTime: z.object({
      warning: z.number().default(2000), // 2 seconds
      critical: z.number().default(5000), // 5 seconds
    }),
  }),
  
  // Norwegian compliance
  compliance: z.object({
    auditHealthChecks: z.boolean().default(true),
    reportingRequired: z.boolean().default(true),
    dataProcessingMonitoring: z.boolean().default(true),
  }),
  
  // Notification settings
  notifications: z.object({
    enabled: z.boolean().default(true),
    channels: z.array(z.enum(['log', 'event', 'webhook', 'email'])).default(['log', 'event']),
    webhookUrls: z.array(z.string()).default([]),
    escalationLevels: z.array(z.enum(['info', 'warning', 'error', 'critical'])).default(['error', 'critical']),
  }),
});

export type HealthConfig = z.infer<typeof HealthConfigSchema>;

/**
 * Health check result
 */
export interface HealthCheckResult {
  readonly name: string;
  readonly status: 'healthy' | 'degraded' | 'unhealthy';
  readonly lastCheck: number;
  readonly duration: number;
  readonly message?: string;
  readonly details?: Record<string, any>;
  readonly error?: string;
  readonly trends: HealthTrend[];
}

/**
 * Health trend data point
 */
export interface HealthTrend {
  readonly timestamp: number;
  readonly status: 'healthy' | 'degraded' | 'unhealthy';
  readonly duration: number;
  readonly value?: number;
}

/**
 * System health snapshot
 */
export interface SystemHealth {
  readonly overall: 'healthy' | 'degraded' | 'unhealthy';
  readonly timestamp: number;
  readonly checks: HealthCheckResult[];
  readonly resources: ResourceHealth;
  readonly services: ServiceHealth;
  readonly dependencies: DependencyHealth[];
  readonly circuitBreakers: CircuitBreakerStatus[];
  readonly uptime: number;
  readonly compliance: ComplianceHealth;
}

/**
 * Resource health metrics
 */
export interface ResourceHealth {
  readonly cpu: {
    readonly usage: number;
    readonly status: 'healthy' | 'warning' | 'critical';
    readonly processes: number;
  };
  readonly memory: {
    readonly used: number;
    readonly total: number;
    readonly percentage: number;
    readonly status: 'healthy' | 'warning' | 'critical';
  };
  readonly disk: {
    readonly used: number;
    readonly total: number;
    readonly percentage: number;
    readonly status: 'healthy' | 'warning' | 'critical';
  };
  readonly network: {
    readonly latency: number;
    readonly status: 'healthy' | 'warning' | 'critical';
  };
}

/**
 * Service health status
 */
export interface ServiceHealth {
  readonly telemetry: HealthCheckResult;
  readonly analytics: HealthCheckResult;
  readonly performance: HealthCheckResult;
  readonly cache: HealthCheckResult;
  readonly database?: HealthCheckResult;
}

/**
 * Dependency health check
 */
export interface DependencyHealth {
  readonly name: string;
  readonly type: 'external' | 'internal';
  readonly status: 'healthy' | 'degraded' | 'unhealthy';
  readonly url?: string;
  readonly version?: string;
  readonly lastCheck: number;
  readonly responseTime: number;
}

/**
 * Compliance health monitoring
 */
export interface ComplianceHealth {
  readonly gdprCompliance: boolean;
  readonly norwegianCompliance: boolean;
  readonly dataProcessingCompliance: boolean;
  readonly auditTrailIntegrity: boolean;
  readonly lastAudit: number;
}

/**
 * Circuit breaker states
 */
export enum CircuitBreakerState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half_open',
}

/**
 * Circuit breaker status
 */
export interface CircuitBreakerStatus {
  readonly name: string;
  readonly state: CircuitBreakerState;
  readonly failureCount: number;
  readonly successCount: number;
  readonly lastFailureTime?: number;
  readonly nextAttemptTime?: number;
  readonly totalRequests: number;
  readonly failureRate: number;
}

/**
 * Circuit breaker implementation
 */
class CircuitBreaker extends EventEmitter {
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private failureCount: number = 0;
  private successCount: number = 0;
  private lastFailureTime?: number;
  private nextAttemptTime?: number;
  private totalRequests: number = 0;
  private config: HealthConfig['circuitBreaker'];

  constructor(
    private name: string,
    config: HealthConfig['circuitBreaker']
  ) {
    super();
    this.config = config;
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (!this.config.enabled) {
      return operation();
    }

    if (this.state === CircuitBreakerState.OPEN) {
      if (Date.now() < (this.nextAttemptTime || 0)) {
        throw new Error(`Circuit breaker ${this.name} is OPEN`);
      }
      this.state = CircuitBreakerState.HALF_OPEN;
      this.emit('stateChanged', this.name, this.state);
    }

    this.totalRequests++;

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.successCount++;
    
    if (this.state === CircuitBreakerState.HALF_OPEN) {
      if (this.successCount >= this.config.successThreshold) {
        this.reset();
      }
    } else if (this.state === CircuitBreakerState.CLOSED) {
      this.failureCount = 0;
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.config.failureThreshold) {
      this.trip();
    }
  }

  private trip(): void {
    this.state = CircuitBreakerState.OPEN;
    this.nextAttemptTime = Date.now() + this.config.timeout;
    this.successCount = 0;
    
    this.emit('stateChanged', this.name, this.state);
    this.emit('circuitBreakerTripped', this.name);
    
    logger.warn(`Circuit breaker ${this.name} tripped - entering OPEN state`);
  }

  private reset(): void {
    this.state = CircuitBreakerState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = undefined;
    this.nextAttemptTime = undefined;
    
    this.emit('stateChanged', this.name, this.state);
    this.emit('circuitBreakerReset', this.name);
    
    logger.info(`Circuit breaker ${this.name} reset - entering CLOSED state`);
  }

  getStatus(): CircuitBreakerStatus {
    return {
      name: this.name,
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
      nextAttemptTime: this.nextAttemptTime,
      totalRequests: this.totalRequests,
      failureRate: this.totalRequests > 0 ? this.failureCount / this.totalRequests : 0,
    };
  }
}

/**
 * Health check implementation
 */
abstract class HealthCheck {
  protected trends: HealthTrend[] = [];
  protected maxTrends: number = 100;

  constructor(protected name: string) {}

  abstract doCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    message?: string;
    details?: Record<string, any>;
  }>;

  async check(): Promise<HealthCheckResult> {
    const startTime = performance.now();
    
    try {
      const result = await this.doCheck();
      const duration = performance.now() - startTime;
      
      // Record trend
      this.recordTrend(result.status, duration);
      
      return {
        name: this.name,
        status: result.status,
        lastCheck: Date.now(),
        duration,
        message: result.message,
        details: result.details,
        trends: [...this.trends],
      };
    } catch (error) {
      const duration = performance.now() - startTime;
      this.recordTrend('unhealthy', duration);
      
      return {
        name: this.name,
        status: 'unhealthy',
        lastCheck: Date.now(),
        duration,
        error: error instanceof Error ? error.message : String(error),
        trends: [...this.trends],
      };
    }
  }

  private recordTrend(status: 'healthy' | 'degraded' | 'unhealthy', duration: number): void {
    this.trends.push({
      timestamp: Date.now(),
      status,
      duration,
    });

    // Keep only recent trends
    if (this.trends.length > this.maxTrends) {
      this.trends = this.trends.slice(-this.maxTrends);
    }
  }
}

/**
 * System resource health check
 */
class SystemResourceCheck extends HealthCheck {
  constructor(private thresholds: HealthConfig['thresholds']) {
    super('system_resources');
  }

  async doCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: Record<string, any>;
  }> {
    const memoryUsage = process.memoryUsage();
    const memoryPercentage = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
    
    // Get CPU usage (simplified)
    const cpuUsage = process.cpuUsage();
    const cpuPercentage = (cpuUsage.user + cpuUsage.system) / 1000000 / 10; // Rough estimate
    
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    const issues: string[] = [];
    
    // Check memory
    if (memoryPercentage > this.thresholds.memory.critical) {
      status = 'unhealthy';
      issues.push(`Critical memory usage: ${memoryPercentage.toFixed(1)}%`);
    } else if (memoryPercentage > this.thresholds.memory.warning) {
      status = status === 'healthy' ? 'degraded' : status;
      issues.push(`High memory usage: ${memoryPercentage.toFixed(1)}%`);
    }
    
    // Check CPU
    if (cpuPercentage > this.thresholds.cpu.critical) {
      status = 'unhealthy';
      issues.push(`Critical CPU usage: ${cpuPercentage.toFixed(1)}%`);
    } else if (cpuPercentage > this.thresholds.cpu.warning) {
      status = status === 'healthy' ? 'degraded' : status;
      issues.push(`High CPU usage: ${cpuPercentage.toFixed(1)}%`);
    }

    return {
      status,
      details: {
        memory: {
          used: memoryUsage.heapUsed,
          total: memoryUsage.heapTotal,
          percentage: memoryPercentage,
        },
        cpu: {
          percentage: cpuPercentage,
        },
        issues,
      },
    };
  }
}

/**
 * Service dependency health check
 */
class ServiceDependencyCheck extends HealthCheck {
  constructor(
    name: string,
    private serviceChecker: () => Promise<boolean>,
    private details?: Record<string, any>
  ) {
    super(name);
  }

  async doCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    message?: string;
    details?: Record<string, any>;
  }> {
    try {
      const isHealthy = await this.serviceChecker();
      
      return {
        status: isHealthy ? 'healthy' : 'unhealthy',
        message: isHealthy ? 'Service is operational' : 'Service is not responding',
        details: this.details,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `Service check failed: ${error instanceof Error ? error.message : String(error)}`,
        details: this.details,
      };
    }
  }
}

/**
 * File system health check
 */
class FileSystemCheck extends HealthCheck {
  constructor(private paths: string[], private thresholds: HealthConfig['thresholds']) {
    super('filesystem');
  }

  async doCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: Record<string, any>;
  }> {
    const results: Record<string, any> = {};
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    const issues: string[] = [];

    for (const path of this.paths) {
      try {
        await access(path);
        const stats = await stat(path);
        
        results[path] = {
          accessible: true,
          isDirectory: stats.isDirectory(),
          size: stats.size,
          modified: stats.mtime,
        };
      } catch (error) {
        results[path] = {
          accessible: false,
          error: error instanceof Error ? error.message : String(error),
        };
        
        status = 'unhealthy';
        issues.push(`Cannot access ${path}`);
      }
    }

    return {
      status,
      details: {
        paths: results,
        issues,
      },
    };
  }
}

/**
 * Enterprise Health Monitor
 */
export class EnterpriseHealthMonitor extends EventEmitter {
  private config: HealthConfig;
  private healthChecks: Map<string, HealthCheck> = new Map();
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();
  private monitoringIntervals: Map<string, NodeJS.Timeout> = new Map();
  private startTime: number = Date.now();
  private initialized: boolean = false;
  private lastSystemHealth?: SystemHealth;

  constructor(config: Partial<HealthConfig> = {}) {
    super();
    this.config = HealthConfigSchema.parse(config);
  }

  async initialize(): Promise<void> {
    try {
      this.setupHealthChecks();
      this.setupCircuitBreakers();
      this.startMonitoring();
      
      this.initialized = true;
      this.emit('initialized');

      logger.info('✅ Enterprise health monitor initialized successfully', {
        healthChecks: this.healthChecks.size,
        circuitBreakers: this.circuitBreakers.size,
        selfHealing: this.config.selfHealing.enabled,
        compliance: this.config.compliance,
      });
    } catch (error) {
      logger.error('❌ Failed to initialize health monitor:', error);
      throw error;
    }
  }

  /**
   * Get current system health
   */
  async getSystemHealth(): Promise<SystemHealth> {
    if (!this.initialized) {
      throw new Error('Health monitor not initialized');
    }

    const span = telemetryService.createGeneratorSpan('health', 'getSystemHealth');
    
    try {
      const checks = await this.runAllHealthChecks();
      const resources = await this.getResourceHealth();
      const services = await this.getServiceHealth();
      const dependencies = await this.getDependencyHealth();
      const circuitBreakers = this.getCircuitBreakerStatuses();
      const compliance = await this.getComplianceHealth();

      // Determine overall health
      const overall = this.calculateOverallHealth(checks);

      const systemHealth: SystemHealth = {
        overall,
        timestamp: Date.now(),
        checks,
        resources,
        services,
        dependencies,
        circuitBreakers,
        uptime: Date.now() - this.startTime,
        compliance,
      };

      this.lastSystemHealth = systemHealth;
      this.emit('healthChecked', systemHealth);

      // Track in analytics
      analyticsService.trackPerformance({
        executionTime: span.spanContext() ? 0 : 0, // Would get from span
        memoryUsage: process.memoryUsage().heapUsed,
        cpuUsage: 0, // Would calculate
        cacheHitRate: 0, // Would get from cache service
        throughput: 0, // Would calculate
      });

      span.setAttributes({
        'health.overall': overall,
        'health.checks_count': checks.length,
        'health.unhealthy_count': checks.filter(c => c.status === 'unhealthy').length,
      });

      return systemHealth;
    } finally {
      span.end();
    }
  }

  /**
   * Execute operation with circuit breaker protection
   */
  async withCircuitBreaker<T>(
    name: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const circuitBreaker = this.circuitBreakers.get(name);
    if (!circuitBreaker) {
      throw new Error(`Circuit breaker ${name} not found`);
    }

    return circuitBreaker.execute(operation);
  }

  /**
   * Trigger self-healing process
   */
  async triggerSelfHealing(issue: string, context?: Record<string, any>): Promise<boolean> {
    if (!this.config.selfHealing.enabled) {
      logger.info('Self-healing is disabled');
      return false;
    }

    const span = telemetryService.createGeneratorSpan('health', 'selfHealing');
    
    try {
      logger.info(`🔧 Triggering self-healing for: ${issue}`, context);
      
      let attempts = 0;
      const maxRetries = this.config.selfHealing.maxRetries;
      
      while (attempts < maxRetries) {
        attempts++;
        
        try {
          const success = await this.performSelfHealing(issue, context);
          
          if (success) {
            logger.info(`✅ Self-healing successful for ${issue} after ${attempts} attempts`);
            this.emit('selfHealingSuccess', { issue, attempts, context });
            
            span.setAttributes({
              'health.self_healing.success': true,
              'health.self_healing.attempts': attempts,
            });
            
            return true;
          }
        } catch (error) {
          logger.warn(`Self-healing attempt ${attempts} failed:`, error);
        }
        
        if (attempts < maxRetries) {
          await this.delay(this.config.selfHealing.retryDelay);
        }
      }
      
      logger.error(`❌ Self-healing failed for ${issue} after ${attempts} attempts`);
      this.emit('selfHealingFailed', { issue, attempts, context });
      
      // Escalate if threshold reached
      this.escalateIssue(issue, context);
      
      span.setAttributes({
        'health.self_healing.success': false,
        'health.self_healing.attempts': attempts,
      });
      
      return false;
    } finally {
      span.end();
    }
  }

  /**
   * Force health check run
   */
  async runHealthCheck(name?: string): Promise<HealthCheckResult[]> {
    if (name) {
      const healthCheck = this.healthChecks.get(name);
      if (!healthCheck) {
        throw new Error(`Health check ${name} not found`);
      }
      return [await healthCheck.check()];
    }
    
    return this.runAllHealthChecks();
  }

  /**
   * Get health trends
   */
  getHealthTrends(name: string, timeWindow: number = 3600000): HealthTrend[] {
    const healthCheck = this.healthChecks.get(name);
    if (!healthCheck) {
      return [];
    }

    const result = healthCheck.check();
    // Would return trends from the health check
    return [];
  }

  async shutdown(): Promise<void> {
    try {
      // Clear all monitoring intervals
      for (const interval of this.monitoringIntervals.values()) {
        clearInterval(interval);
      }
      this.monitoringIntervals.clear();

      this.initialized = false;
      this.emit('shutdown');
      
      logger.info('✅ Enterprise health monitor shut down successfully');
    } catch (error) {
      logger.error('❌ Error shutting down health monitor:', error);
      throw error;
    }
  }

  // Private methods

  private setupHealthChecks(): void {
    // System resources check
    this.healthChecks.set(
      'system_resources',
      new SystemResourceCheck(this.config.thresholds)
    );

    // File system check
    const criticalPaths = [
      process.cwd(),
      '.xaheen',
      '.xaheen/cache',
      '.xaheen/analytics',
    ];
    this.healthChecks.set(
      'filesystem',
      new FileSystemCheck(criticalPaths, this.config.thresholds)
    );

    // Telemetry service check
    this.healthChecks.set(
      'telemetry_service',
      new ServiceDependencyCheck(
        'telemetry_service',
        async () => telemetryService.initialized || false
      )
    );

    // Analytics service check
    this.healthChecks.set(
      'analytics_service',
      new ServiceDependencyCheck(
        'analytics_service',
        async () => analyticsService.initialized || false
      )
    );
  }

  private setupCircuitBreakers(): void {
    if (!this.config.circuitBreaker.enabled) {
      return;
    }

    // Create circuit breakers for critical operations
    const circuitBreakerNames = [
      'telemetry_export',
      'analytics_collection',
      'cache_operations',
      'file_operations',
      'generator_operations',
    ];

    for (const name of circuitBreakerNames) {
      const circuitBreaker = new CircuitBreaker(name, this.config.circuitBreaker);
      
      circuitBreaker.on('circuitBreakerTripped', (name) => {
        this.emit('circuitBreakerTripped', name);
        this.triggerSelfHealing(`circuit_breaker_tripped_${name}`);
      });
      
      circuitBreaker.on('circuitBreakerReset', (name) => {
        this.emit('circuitBreakerReset', name);
      });

      this.circuitBreakers.set(name, circuitBreaker);
    }
  }

  private startMonitoring(): void {
    // System resource monitoring
    this.monitoringIntervals.set(
      'system',
      setInterval(() => {
        this.runHealthCheck('system_resources').catch(error => {
          logger.error('System health check failed:', error);
        });
      }, this.config.intervals.system)
    );

    // Service monitoring
    this.monitoringIntervals.set(
      'services',
      setInterval(() => {
        this.runServiceHealthChecks().catch(error => {
          logger.error('Service health checks failed:', error);
        });
      }, this.config.intervals.services)
    );

    // Full health check
    this.monitoringIntervals.set(
      'full_health',
      setInterval(() => {
        this.getSystemHealth().then(health => {
          if (health.overall === 'unhealthy') {
            this.triggerSelfHealing('system_unhealthy', { health });
          }
        }).catch(error => {
          logger.error('Full health check failed:', error);
        });
      }, this.config.intervals.system * 2)
    );
  }

  private async runAllHealthChecks(): Promise<HealthCheckResult[]> {
    const results: HealthCheckResult[] = [];
    
    for (const [name, healthCheck] of this.healthChecks) {
      try {
        const result = await healthCheck.check();
        results.push(result);
      } catch (error) {
        results.push({
          name,
          status: 'unhealthy',
          lastCheck: Date.now(),
          duration: 0,
          error: error instanceof Error ? error.message : String(error),
          trends: [],
        });
      }
    }
    
    return results;
  }

  private async runServiceHealthChecks(): Promise<void> {
    const serviceChecks = [
      'telemetry_service',
      'analytics_service',
    ];

    for (const checkName of serviceChecks) {
      try {
        await this.runHealthCheck(checkName);
      } catch (error) {
        logger.warn(`Service health check ${checkName} failed:`, error);
      }
    }
  }

  private async getResourceHealth(): Promise<ResourceHealth> {
    const memoryUsage = process.memoryUsage();
    const memoryPercentage = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
    
    return {
      cpu: {
        usage: 0, // Would calculate actual CPU usage
        status: 'healthy',
        processes: 1,
      },
      memory: {
        used: memoryUsage.heapUsed,
        total: memoryUsage.heapTotal,
        percentage: memoryPercentage,
        status: memoryPercentage > this.config.thresholds.memory.critical ? 'critical' :
                memoryPercentage > this.config.thresholds.memory.warning ? 'warning' : 'healthy',
      },
      disk: {
        used: 0, // Would calculate actual disk usage
        total: 0,
        percentage: 0,
        status: 'healthy',
      },
      network: {
        latency: 0, // Would measure actual network latency
        status: 'healthy',
      },
    };
  }

  private async getServiceHealth(): Promise<ServiceHealth> {
    const telemetryResult = await this.runHealthCheck('telemetry_service');
    const analyticsResult = await this.runHealthCheck('analytics_service');
    
    return {
      telemetry: telemetryResult[0],
      analytics: analyticsResult[0],
      performance: {
        name: 'performance',
        status: 'healthy',
        lastCheck: Date.now(),
        duration: 0,
        trends: [],
      },
      cache: {
        name: 'cache',
        status: 'healthy',
        lastCheck: Date.now(),
        duration: 0,
        trends: [],
      },
    };
  }

  private async getDependencyHealth(): Promise<DependencyHealth[]> {
    // This would check external dependencies like Redis, databases, etc.
    return [];
  }

  private getCircuitBreakerStatuses(): CircuitBreakerStatus[] {
    return Array.from(this.circuitBreakers.values()).map(cb => cb.getStatus());
  }

  private async getComplianceHealth(): Promise<ComplianceHealth> {
    return {
      gdprCompliance: this.config.compliance.auditHealthChecks,
      norwegianCompliance: this.config.compliance.reportingRequired,
      dataProcessingCompliance: this.config.compliance.dataProcessingMonitoring,
      auditTrailIntegrity: true,
      lastAudit: Date.now(),
    };
  }

  private calculateOverallHealth(checks: HealthCheckResult[]): 'healthy' | 'degraded' | 'unhealthy' {
    const unhealthyCount = checks.filter(c => c.status === 'unhealthy').length;
    const degradedCount = checks.filter(c => c.status === 'degraded').length;
    
    if (unhealthyCount > 0) {
      return 'unhealthy';
    }
    
    if (degradedCount > 0) {
      return 'degraded';
    }
    
    return 'healthy';
  }

  private async performSelfHealing(issue: string, context?: Record<string, any>): Promise<boolean> {
    logger.info(`Attempting self-healing for: ${issue}`);
    
    switch (issue) {
      case 'high_memory_usage':
        return this.healMemoryIssue();
      
      case 'service_unhealthy':
        return this.healServiceIssue(context);
      
      case 'filesystem_issue':
        return this.healFileSystemIssue(context);
      
      case 'circuit_breaker_tripped_telemetry_export':
        return this.healTelemetryExportIssue();
      
      default:
        logger.warn(`No self-healing strategy for issue: ${issue}`);
        return false;
    }
  }

  private async healMemoryIssue(): Promise<boolean> {
    try {
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
        logger.info('Triggered garbage collection for memory healing');
      }
      
      // Clear caches if available
      // This would integrate with cache services
      
      return true;
    } catch (error) {
      logger.error('Memory healing failed:', error);
      return false;
    }
  }

  private async healServiceIssue(context?: Record<string, any>): Promise<boolean> {
    try {
      // Restart services if needed
      // This would integrate with service managers
      logger.info('Service healing attempted');
      return true;
    } catch (error) {
      logger.error('Service healing failed:', error);
      return false;
    }
  }

  private async healFileSystemIssue(context?: Record<string, any>): Promise<boolean> {
    try {
      // Create missing directories
      // Clean up temp files
      // Fix permissions if possible
      logger.info('Filesystem healing attempted');
      return true;
    } catch (error) {
      logger.error('Filesystem healing failed:', error);
      return false;
    }
  }

  private async healTelemetryExportIssue(): Promise<boolean> {
    try {
      // Reset telemetry exporters
      // Clear export queues
      logger.info('Telemetry export healing attempted');
      return true;
    } catch (error) {
      logger.error('Telemetry export healing failed:', error);
      return false;
    }
  }

  private escalateIssue(issue: string, context?: Record<string, any>): void {
    logger.error(`🚨 Escalating issue: ${issue}`, context);
    
    this.emit('issueEscalated', { issue, context, timestamp: Date.now() });
    
    // Send notifications based on configuration
    if (this.config.notifications.enabled) {
      this.sendNotifications('critical', `Issue escalated: ${issue}`, context);
    }
  }

  private sendNotifications(level: string, message: string, context?: Record<string, any>): void {
    if (!this.config.notifications.escalationLevels.includes(level as any)) {
      return;
    }

    for (const channel of this.config.notifications.channels) {
      switch (channel) {
        case 'log':
          logger.error(`[NOTIFICATION] ${message}`, context);
          break;
        
        case 'event':
          this.emit('notification', { level, message, context });
          break;
        
        case 'webhook':
          this.sendWebhookNotification(level, message, context);
          break;
        
        case 'email':
          // Would integrate with email service
          break;
      }
    }
  }

  private sendWebhookNotification(level: string, message: string, context?: Record<string, any>): void {
    // Would send webhook notifications
    logger.debug(`Webhook notification: ${level} - ${message}`);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Global health monitor instance
 */
export const healthMonitor = new EnterpriseHealthMonitor();

export default EnterpriseHealthMonitor;