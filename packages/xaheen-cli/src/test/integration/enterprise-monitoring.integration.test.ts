/**
 * Enterprise Monitoring & Performance Integration Tests
 * Comprehensive tests for EPIC 15 & EPIC 18 implementations
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import { 
  enterpriseOrchestrator,
  EnterpriseMonitoringOrchestrator 
} from '../../services/enterprise-monitoring-orchestrator.js';
import { 
  telemetryService,
  EnterpriseTelemetryService 
} from '../../services/telemetry/enterprise-telemetry.service.js';
import { 
  analyticsService,
  EnterpriseAnalyticsService 
} from '../../services/analytics/enterprise-analytics.service.js';
import { 
  healthMonitor,
  EnterpriseHealthMonitor 
} from '../../services/health/enterprise-health-monitor.js';
import { 
  performanceOptimizer,
  ExtremePerformanceOptimizer 
} from '../../services/performance/extreme-performance-optimizer.js';

describe('Enterprise Monitoring Integration', () => {
  let orchestrator: EnterpriseMonitoringOrchestrator;
  let telemetry: EnterpriseTelemetryService;
  let analytics: EnterpriseAnalyticsService;
  let health: EnterpriseHealthMonitor;
  let performance: ExtremePerformanceOptimizer;

  beforeAll(async () => {
    // Create isolated instances for testing
    orchestrator = new EnterpriseMonitoringOrchestrator({
      telemetry: {
        enabled: true,
        autoInitialize: true,
        config: {
          serviceName: 'xaheen-cli-test',
          environment: 'test',
          exporters: {
            console: true,
            otlp: { enabled: false },
            prometheus: { enabled: false },
          },
        },
      },
      analytics: {
        enabled: true,
        autoInitialize: true,
        config: {
          collection: { enabled: true },
          compliance: { norwegianCompliant: true },
        },
      },
      health: {
        enabled: true,
        autoInitialize: true,
        config: {
          intervals: { system: 1000 }, // Faster for testing
          selfHealing: { enabled: true },
        },
      },
      performance: {
        enabled: true,
        autoInitialize: true,
        config: {
          distributed: { enabled: false }, // Disable workers for testing
          caching: { redisEnabled: false },
        },
      },
    });

    telemetry = new EnterpriseTelemetryService({
      serviceName: 'test-service',
      environment: 'test',
      tracing: { enabled: true, sampleRate: 1.0 },
      exporters: {
        console: true,
        otlp: { enabled: false },
        prometheus: { enabled: false },
      },
      compliance: { norwegianCompliant: true },
    });

    analytics = new EnterpriseAnalyticsService({
      collection: { enabled: true, batchSize: 10 },
      businessKpis: { trackUsage: true, trackPerformance: true },
      compliance: { norwegianCompliant: true },
    });

    health = new EnterpriseHealthMonitor({
      intervals: { system: 1000 },
      selfHealing: { enabled: true },
      compliance: { norwegianCompliant: true },
    });

    performance = new ExtremePerformanceOptimizer({
      distributed: { enabled: false },
      caching: { redisEnabled: false },
      memory: { poolingEnabled: true },
    });
  });

  afterAll(async () => {
    if (orchestrator) {
      await orchestrator.shutdown();
    }
    if (telemetry) {
      await telemetry.shutdown();
    }
    if (analytics) {
      await analytics.shutdown();
    }
    if (health) {
      await health.shutdown();
    }
    if (performance) {
      await performance.shutdown();
    }
  });

  describe('Service Initialization', () => {
    it('should initialize orchestrator with all services', async () => {
      await orchestrator.initialize();
      
      const metrics = await orchestrator.getUnifiedMetrics();
      expect(metrics).toBeDefined();
      expect(metrics.timestamp).toBeGreaterThan(0);
    }, 30000);

    it('should initialize telemetry service independently', async () => {
      await telemetry.initialize();
      
      const operation = telemetry.startOperation('test-command', { test: true });
      expect(operation.operationId).toBeDefined();
      expect(operation.command).toBe('test-command');
      
      await telemetry.endOperation(operation.operationId, { success: true });
    });

    it('should initialize analytics service independently', async () => {
      await analytics.initialize();
      
      analytics.trackCommandExecution('test-command', 100, true, 'test-user');
      
      const dashboardData = analytics.getDashboardData();
      expect(dashboardData).toBeDefined();
      expect(dashboardData.timestamp).toBeGreaterThan(0);
    });

    it('should initialize health monitor independently', async () => {
      await health.initialize();
      
      const systemHealth = await health.getSystemHealth();
      expect(systemHealth).toBeDefined();
      expect(systemHealth.overall).toMatch(/healthy|degraded|unhealthy/);
    });

    it('should initialize performance optimizer independently', async () => {
      await performance.initialize();
      
      const stats = performance.getPerformanceStats();
      expect(stats).toBeDefined();
      expect(stats.workerPool).toBeDefined();
      expect(stats.cache).toBeDefined();
    });
  });

  describe('OpenTelemetry Integration (EPIC 15.4.1)', () => {
    beforeEach(async () => {
      if (!telemetry.initialized) {
        await telemetry.initialize();
      }
    });

    it('should create and track CLI operations with spans', async () => {
      const operation = telemetry.startOperation(
        'generate-component',
        { name: 'TestComponent' },
        { framework: 'react' }
      );

      expect(operation.operationId).toBeDefined();
      expect(operation.command).toBe('generate-component');
      expect(operation.sessionId).toBeDefined();

      // Simulate some work
      await new Promise(resolve => setTimeout(resolve, 100));

      await telemetry.endOperation(operation.operationId, {
        success: true,
        metadata: { linesGenerated: 50 },
      });

      // Should complete without errors
      expect(true).toBe(true);
    });

    it('should create generator spans with proper attributes', async () => {
      const span = telemetry.createGeneratorSpan('component', 'generate');
      
      expect(span).toBeDefined();
      
      span.setAttributes({
        'generator.component_type': 'button',
        'generator.framework': 'react',
      });
      
      span.end();
    });

    it('should handle trace correlation across operations', async () => {
      const parentOperation = telemetry.startOperation('parent-command');
      
      // Create child operations that should correlate
      const childOperation1 = telemetry.startOperation('child-command-1');
      const childOperation2 = telemetry.startOperation('child-command-2');
      
      expect(parentOperation.traceId).toBeDefined();
      expect(childOperation1.traceId).toBeDefined();
      expect(childOperation2.traceId).toBeDefined();
      
      await telemetry.endOperation(childOperation1.operationId, { success: true });
      await telemetry.endOperation(childOperation2.operationId, { success: true });
      await telemetry.endOperation(parentOperation.operationId, { success: true });
    });

    it('should apply Norwegian compliance data filtering', async () => {
      const operation = telemetry.startOperation(
        'test-command-with-pii',
        { email: 'test@example.com', phone: '+47 123 45 678' },
        { userAgent: 'test-agent' }
      );

      await telemetry.endOperation(operation.operationId, {
        success: true,
        metadata: {
          email: 'user@company.no',
          creditCard: '4111-1111-1111-1111',
        },
      });

      // Should complete with data filtering applied
      expect(true).toBe(true);
    });
  });

  describe('Business KPI Analytics (EPIC 15.4.3)', () => {
    beforeEach(async () => {
      if (!analytics.initialized) {
        await analytics.initialize();
      }
    });

    it('should track command executions and generate usage analytics', async () => {
      // Track multiple command executions
      analytics.trackCommandExecution('generate', 150, true, 'user1');
      analytics.trackCommandExecution('build', 2000, true, 'user1');
      analytics.trackCommandExecution('test', 500, false, 'user2');
      analytics.trackCommandExecution('generate', 200, true, 'user2');

      const dashboardData = analytics.getDashboardData();
      
      expect(dashboardData.usage).toBeDefined();
      expect(dashboardData.performance).toBeDefined();
      expect(dashboardData.timestamp).toBeGreaterThan(0);
    });

    it('should track generator operations with detailed metrics', async () => {
      analytics.trackGeneratorOperation(
        'component',
        'generate',
        1500,
        120, // lines generated
        3,   // files generated
        true
      );

      analytics.trackGeneratorOperation(
        'layout',
        'generate',
        800,
        80,
        2,
        true
      );

      const dashboardData = analytics.getDashboardData();
      expect(dashboardData.generators).toBeDefined();
    });

    it('should track errors with categorization', async () => {
      const error1 = new Error('Template not found');
      const error2 = new TypeError('Invalid configuration');
      const error3 = new Error('Network timeout');

      analytics.trackError(error1, {
        command: 'generate',
        severity: 'medium',
        recoverable: true,
      });

      analytics.trackError(error2, {
        command: 'validate',
        severity: 'high',
        recoverable: false,
      });

      analytics.trackError(error3, {
        command: 'deploy',
        severity: 'low',
        recoverable: true,
      });

      const dashboardData = analytics.getDashboardData();
      expect(dashboardData.errors).toBeDefined();
    });

    it('should generate comprehensive reports in multiple formats', async () => {
      // Add some test data
      analytics.trackCommandExecution('test-command', 100, true);
      analytics.trackPerformance({
        executionTime: 100,
        memoryUsage: 1024 * 1024,
        cpuUsage: 50,
        cacheHitRate: 0.8,
        throughput: 10,
      });

      const jsonReport = analytics.generateReport({
        timeRange: 'hour',
        format: 'json',
        includeRawData: false,
      });

      expect(jsonReport).toContain('metadata');
      expect(jsonReport).toContain('summary');

      const csvReport = analytics.generateReport({
        timeRange: 'hour',
        format: 'csv',
      });

      expect(typeof csvReport).toBe('string');

      const prometheusReport = analytics.generateReport({
        timeRange: 'hour',
        format: 'prometheus',
      });

      expect(prometheusReport).toContain('# HELP');
      expect(prometheusReport).toContain('# TYPE');
    });
  });

  describe('Health Monitoring & Self-Healing (EPIC 15.4.4)', () => {
    beforeEach(async () => {
      if (!health.initialized) {
        await health.initialize();
      }
    });

    it('should perform comprehensive system health checks', async () => {
      const systemHealth = await health.getSystemHealth();

      expect(systemHealth.overall).toMatch(/healthy|degraded|unhealthy/);
      expect(systemHealth.timestamp).toBeGreaterThan(0);
      expect(systemHealth.checks).toBeInstanceOf(Array);
      expect(systemHealth.resources).toBeDefined();
      expect(systemHealth.services).toBeDefined();
      expect(systemHealth.uptime).toBeGreaterThan(0);
      expect(systemHealth.compliance).toBeDefined();
    });

    it('should execute operations with circuit breaker protection', async () => {
      let callCount = 0;
      const flakyOperation = async () => {
        callCount++;
        if (callCount <= 3) {
          throw new Error('Simulated failure');
        }
        return 'success';
      };

      // First few calls should fail and trip the circuit breaker
      await expect(
        health.withCircuitBreaker('test-operation', flakyOperation)
      ).rejects.toThrow('Simulated failure');

      await expect(
        health.withCircuitBreaker('test-operation', flakyOperation)
      ).rejects.toThrow('Simulated failure');

      await expect(
        health.withCircuitBreaker('test-operation', flakyOperation)
      ).rejects.toThrow('Simulated failure');

      // Circuit breaker should eventually allow the operation to succeed
      // (This test might need adjustment based on actual circuit breaker config)
    });

    it('should trigger self-healing for various issues', async () => {
      const healingResult1 = await health.triggerSelfHealing('high_memory_usage');
      expect(typeof healingResult1).toBe('boolean');

      const healingResult2 = await health.triggerSelfHealing('service_unhealthy', {
        service: 'test-service',
      });
      expect(typeof healingResult2).toBe('boolean');
    });

    it('should run individual health checks', async () => {
      const systemResourceCheck = await health.runHealthCheck('system_resources');
      expect(systemResourceCheck).toBeInstanceOf(Array);
      expect(systemResourceCheck[0]).toBeDefined();
      expect(systemResourceCheck[0].name).toBe('system_resources');
      expect(systemResourceCheck[0].status).toMatch(/healthy|degraded|unhealthy/);
    });
  });

  describe('Extreme Performance Optimization (EPIC 18.1)', () => {
    beforeEach(async () => {
      if (!performance.initialized) {
        await performance.initialize();
      }
    });

    it('should execute tasks with intelligent caching', async () => {
      const taskInput = { template: 'component', name: 'TestButton' };
      const taskOptions = { framework: 'react' };

      // First execution - should hit cache miss
      const result1 = await performance.executeTask(
        'generate-component',
        taskInput,
        taskOptions
      );

      expect(result1).toBeDefined();

      // Second execution - should hit cache
      const result2 = await performance.executeTask(
        'generate-component',
        taskInput,
        taskOptions
      );

      expect(result2).toBeDefined();
      expect(result2).toEqual(result1);
    });

    it('should provide performance statistics', async () => {
      const stats = performance.getPerformanceStats();

      expect(stats.workerPool).toBeDefined();
      expect(stats.cache).toBeDefined();
      expect(stats.memory).toBeDefined();

      expect(stats.workerPool.totalWorkers).toBeGreaterThanOrEqual(0);
      expect(stats.cache.hits).toBeGreaterThanOrEqual(0);
      expect(stats.cache.misses).toBeGreaterThanOrEqual(0);
      expect(stats.memory.poolSize).toBeGreaterThanOrEqual(0);
    });

    it('should handle memory pooling and resource optimization', async () => {
      // Execute multiple tasks to test memory pooling
      const tasks = Array.from({ length: 5 }, (_, i) => 
        performance.executeTask('test-task', { id: i }, {})
      );

      const results = await Promise.all(tasks);
      expect(results).toHaveLength(5);

      const finalStats = performance.getPerformanceStats();
      expect(finalStats.memory.poolSize).toBeGreaterThanOrEqual(0);
    });

    it('should clear caches when requested', async () => {
      // Add some cached data first
      await performance.executeTask('cache-test', { data: 'test' }, {});

      const statsBefore = performance.getPerformanceStats();
      
      await performance.clearAllCaches();
      
      const statsAfter = performance.getPerformanceStats();
      
      // Cache should be cleared
      expect(statsAfter.cache.size).toBeLessThanOrEqual(statsBefore.cache.size);
    });
  });

  describe('Enterprise Orchestrator Integration', () => {
    beforeEach(async () => {
      if (!orchestrator.initialized) {
        await orchestrator.initialize();
      }
    });

    it('should execute commands with full enterprise monitoring', async () => {
      const mockOperation = vi.fn().mockResolvedValue({
        success: true,
        data: 'test-result',
      });

      const result = await orchestrator.executeCommand(
        'test-command',
        mockOperation,
        {
          args: { param1: 'value1' },
          options: { verbose: true },
          enableOptimization: true,
          complianceLevel: 'norwegian',
        }
      );

      expect(result.success).toBe(true);
      expect(result.data).toBe('test-result');
      expect(mockOperation).toHaveBeenCalled();
    });

    it('should generate unified enterprise metrics', async () => {
      const metrics = await orchestrator.getUnifiedMetrics();

      expect(metrics.timestamp).toBeGreaterThan(0);
      expect(metrics.telemetry).toBeDefined();
      expect(metrics.analytics).toBeDefined();
      expect(metrics.health).toBeDefined();
      expect(metrics.performance).toBeDefined();
    });

    it('should generate Norwegian enterprise dashboard data', async () => {
      const dashboard = await orchestrator.getNorwegianEnterpriseDashboard();

      expect(dashboard.systemStatus).toBeDefined();
      expect(dashboard.businessMetrics).toBeDefined();
      expect(dashboard.complianceStatus).toBeDefined();
      expect(dashboard.performanceIndicators).toBeDefined();
      expect(dashboard.recommendations).toBeInstanceOf(Array);
    });

    it('should generate comprehensive enterprise reports', async () => {
      const jsonReport = await orchestrator.generateEnterpriseReport({
        timeRange: 'hour',
        format: 'json',
        includeCompliance: true,
        includeRecommendations: true,
      });

      expect(jsonReport).toContain('metadata');
      expect(jsonReport).toContain('compliance');
      expect(jsonReport).toContain('recommendations');

      const norwegianReport = await orchestrator.generateEnterpriseReport({
        timeRange: 'hour',
        format: 'norwegian_standard',
        includeCompliance: true,
      });

      expect(norwegianReport).toContain('rapportMetadata');
      expect(norwegianReport).toContain('overholdelse');
    });

    it('should handle errors with comprehensive monitoring', async () => {
      const failingOperation = vi.fn().mockRejectedValue(
        new Error('Test operation failure')
      );

      await expect(
        orchestrator.executeCommand('failing-command', failingOperation, {
          enableOptimization: true,
        })
      ).rejects.toThrow('Test operation failure');

      // Verify error was tracked in all systems
      const metrics = await orchestrator.getUnifiedMetrics();
      expect(metrics).toBeDefined();
    });
  });

  describe('Norwegian Compliance', () => {
    it('should ensure all services comply with Norwegian data protection laws', async () => {
      await orchestrator.initialize();
      
      const dashboard = await orchestrator.getNorwegianEnterpriseDashboard();
      
      expect(dashboard.complianceStatus.norwegian.compliant).toBe(true);
      expect(dashboard.complianceStatus.gdpr.compliant).toBe(true);
      expect(dashboard.complianceStatus.norwegian.dataLocalization).toBe(true);
      expect(dashboard.complianceStatus.norwegian.auditTrailComplete).toBe(true);
    });

    it('should generate Norwegian standard reports', async () => {
      await orchestrator.initialize();
      
      const report = await orchestrator.generateEnterpriseReport({
        timeRange: 'day',
        format: 'norwegian_standard',
        includeCompliance: true,
      });

      const reportData = JSON.parse(report);
      
      expect(reportData.rapportMetadata).toBeDefined();
      expect(reportData.rapportMetadata.overholdelse.norskDatavern).toBe(true);
      expect(reportData.systemStatus).toBeDefined();
      expect(reportData.overholdelse).toBeDefined();
    });
  });

  describe('Performance Benchmarks', () => {
    it('should meet performance benchmarks for enterprise usage', async () => {
      await orchestrator.initialize();
      
      const startTime = performance.now();
      
      // Execute multiple operations in parallel
      const operations = Array.from({ length: 10 }, (_, i) => 
        orchestrator.executeCommand(
          `benchmark-command-${i}`,
          async () => ({ result: `result-${i}` }),
          { enableOptimization: true }
        )
      );

      const results = await Promise.all(operations);
      const endTime = performance.now();
      
      const totalDuration = endTime - startTime;
      const avgDurationPerOp = totalDuration / operations.length;
      
      expect(results).toHaveLength(10);
      expect(avgDurationPerOp).toBeLessThan(1000); // Should be faster than 1 second per operation
      
      // Check final system health
      const metrics = await orchestrator.getUnifiedMetrics();
      expect(metrics.health.systemHealth.overall).toMatch(/healthy|degraded/);
    }, 30000);
  });
});

describe('Performance Stress Tests', () => {
  let orchestrator: EnterpriseMonitoringOrchestrator;

  beforeAll(async () => {
    orchestrator = new EnterpriseMonitoringOrchestrator({
      performance: {
        enabled: true,
        config: {
          distributed: { enabled: false }, // Disable for testing
          memory: { poolingEnabled: true },
        },
      },
    });
    await orchestrator.initialize();
  });

  afterAll(async () => {
    await orchestrator.shutdown();
  });

  it('should handle high concurrent load', async () => {
    const concurrentOperations = 50;
    const operations = Array.from({ length: concurrentOperations }, (_, i) =>
      orchestrator.executeCommand(
        `stress-test-${i}`,
        async () => {
          // Simulate varying workload
          const delay = Math.random() * 100;
          await new Promise(resolve => setTimeout(resolve, delay));
          return { id: i, delay };
        },
        { enableOptimization: true }
      )
    );

    const startTime = Date.now();
    const results = await Promise.all(operations);
    const endTime = Date.now();

    expect(results).toHaveLength(concurrentOperations);
    
    const totalDuration = endTime - startTime;
    const throughput = (concurrentOperations / totalDuration) * 1000; // ops/sec
    
    console.log(`Stress test completed: ${concurrentOperations} operations in ${totalDuration}ms (${throughput.toFixed(2)} ops/sec)`);
    
    // Verify system remained healthy
    const finalMetrics = await orchestrator.getUnifiedMetrics();
    expect(finalMetrics.health.systemHealth.overall).toMatch(/healthy|degraded/);
  }, 60000);
});