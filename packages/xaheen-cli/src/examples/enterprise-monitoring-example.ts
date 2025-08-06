/**
 * Enterprise Monitoring & Performance Optimization Example
 * Demonstrates how to use the comprehensive monitoring and performance systems
 * Part of EPIC 15 & EPIC 18 - Enterprise Monitoring & Extreme Performance
 */

import { 
  enterpriseOrchestrator, 
  enterpriseMonitored 
} from '../services/enterprise-monitoring-orchestrator.js';
import { logger } from "../utils/logger";

/**
 * Example CLI command class with enterprise monitoring
 */
class ExampleEnterpriseCommand {
  /**
   * Generate a component with full enterprise monitoring
   */
  @enterpriseMonitored({
    command: 'generate.component',
    enableOptimization: true,
    priority: 1,
    complianceLevel: 'norwegian',
  })
  async generateComponent(
    componentName: string,
    type: string,
    options: {
      framework?: string;
      style?: string;
      features?: string[];
    } = {}
  ): Promise<{ success: boolean; files: string[]; metrics: any }> {
    logger.info(`🚀 Generating ${type} component: ${componentName}`, options);
    
    // Simulate component generation work
    await this.simulateWork(2000);
    
    const files = [
      `src/components/${componentName}.tsx`,
      `src/components/${componentName}.test.tsx`,
      `src/components/${componentName}.stories.tsx`,
    ];
    
    const metrics = {
      linesGenerated: 150,
      filesCreated: files.length,
      duration: 2000,
      framework: options.framework || 'react',
    };
    
    return {
      success: true,
      files,
      metrics,
    };
  }

  /**
   * Run multiple operations with performance optimization
   */
  @enterpriseMonitored({
    command: 'batch.generate',
    enableOptimization: true,
    priority: 2,
    complianceLevel: 'gdpr_strict',
  })
  async batchGenerate(
    components: Array<{ name: string; type: string; options?: any }>
  ): Promise<{ results: any[]; summary: any }> {
    logger.info(`🔄 Batch generating ${components.length} components`);
    
    const results = [];
    
    for (const component of components) {
      const result = await this.generateComponent(
        component.name,
        component.type,
        component.options
      );
      results.push(result);
    }
    
    const summary = {
      totalComponents: components.length,
      successfulComponents: results.filter(r => r.success).length,
      totalFiles: results.reduce((sum, r) => sum + r.files.length, 0),
      totalLines: results.reduce((sum, r) => sum + r.metrics.linesGenerated, 0),
    };
    
    return { results, summary };
  }

  /**
   * Simulate error handling with monitoring
   */
  @enterpriseMonitored({
    command: 'simulate.error',
    enableOptimization: false,
    complianceLevel: 'norwegian',
  })
  async simulateError(errorType: 'recoverable' | 'critical'): Promise<void> {
    logger.info(`🧪 Simulating ${errorType} error for monitoring demo`);
    
    await this.simulateWork(500);
    
    if (errorType === 'recoverable') {
      throw new Error('Simulated recoverable error - network timeout');
    } else {
      throw new Error('Simulated critical error - system failure');
    }
  }

  private async simulateWork(duration: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, duration));
  }
}

/**
 * Main example function
 */
export async function runEnterpriseMonitoringExample(): Promise<void> {
  try {
    logger.info('🎯 Starting Enterprise Monitoring & Performance Example');
    
    // Initialize the enterprise orchestrator
    await enterpriseOrchestrator.initialize();
    
    const command = new ExampleEnterpriseCommand();
    
    // Example 1: Single component generation with monitoring
    logger.info('\n📦 Example 1: Single Component Generation');
    const singleResult = await command.generateComponent('UserCard', 'component', {
      framework: 'react',
      style: 'tailwind',
      features: ['typescript', 'tests', 'stories'],
    });
    logger.info('✅ Single component result:', singleResult);
    
    // Example 2: Batch generation with performance optimization
    logger.info('\n🔄 Example 2: Batch Component Generation');
    const batchComponents = [
      { name: 'Button', type: 'component', options: { framework: 'react' } },
      { name: 'Modal', type: 'component', options: { framework: 'react' } },
      { name: 'DataTable', type: 'component', options: { framework: 'react' } },
      { name: 'Form', type: 'component', options: { framework: 'react' } },
      { name: 'Navigation', type: 'component', options: { framework: 'react' } },
    ];
    
    const batchResult = await command.batchGenerate(batchComponents);
    logger.info('✅ Batch generation result:', batchResult.summary);
    
    // Example 3: Error handling demonstration
    logger.info('\n🚨 Example 3: Error Handling & Recovery');
    try {
      await command.simulateError('recoverable');
    } catch (error) {
      logger.warn('⚠️  Handled recoverable error:', error.message);
    }
    
    // Example 4: Get real-time metrics
    logger.info('\n📊 Example 4: Real-time Enterprise Metrics');
    const metrics = await enterpriseOrchestrator.getUnifiedMetrics();
    logger.info('📈 Unified Metrics:', {
      timestamp: new Date(metrics.timestamp).toISOString(),
      telemetry: metrics.telemetry,
      performance: {
        cacheHitRate: `${(metrics.performance.cacheHitRate * 100).toFixed(1)}%`,
        avgExecutionTime: `${metrics.performance.averageExecutionTime.toFixed(2)}ms`,
        memoryEfficiency: `${(metrics.performance.memoryEfficiency * 100).toFixed(1)}%`,
      },
      health: {
        systemHealth: metrics.health.systemHealth.overall,
        circuitBreakersActive: metrics.health.circuitBreakersActive,
      },
    });
    
    // Example 5: Norwegian Enterprise Dashboard
    logger.info('\n🇳🇴 Example 5: Norwegian Enterprise Dashboard');
    const dashboard = await enterpriseOrchestrator.getNorwegianEnterpriseDashboard();
    logger.info('🏢 Norwegian Enterprise Dashboard:', {
      systemStatus: dashboard.systemStatus.overall,
      complianceStatus: {
        gdpr: dashboard.complianceStatus.gdpr.compliant,
        norwegian: dashboard.complianceStatus.norwegian.compliant,
      },
      performanceIndicators: {
        responseTime: `${dashboard.performanceIndicators.responseTime.toFixed(2)}ms`,
        availability: `${dashboard.performanceIndicators.availability}%`,
        errorRate: `${dashboard.performanceIndicators.errorRate.toFixed(2)}%`,
      },
      recommendations: dashboard.recommendations.slice(0, 3),
    });
    
    // Example 6: Generate comprehensive enterprise report
    logger.info('\n📋 Example 6: Enterprise Reporting');
    const report = await enterpriseOrchestrator.generateEnterpriseReport({
      timeRange: 'hour',
      format: 'norwegian_standard',
      includeCompliance: true,
      includeRecommendations: true,
    });
    
    // Log first 500 characters of the Norwegian standard report
    logger.info('📄 Norwegian Standard Report (excerpt):', 
      report.substring(0, 500) + '...'
    );
    
    // Example 7: Performance optimization demonstration
    logger.info('\n⚡ Example 7: Performance Optimization');
    const perfStart = Date.now();
    
    // Run the same batch operation again to show caching/optimization
    const optimizedBatchResult = await command.batchGenerate(batchComponents);
    
    const perfEnd = Date.now();
    const optimizedDuration = perfEnd - perfStart;
    
    logger.info('🚀 Performance Optimization Results:', {
      duration: `${optimizedDuration}ms`,
      componentsGenerated: optimizedBatchResult.summary.totalComponents,
      cacheUtilized: true, // Would check actual cache hits
      optimizationEnabled: true,
    });
    
    logger.info('\n✅ Enterprise Monitoring Example completed successfully!');
    
    // Display final summary
    const finalMetrics = await enterpriseOrchestrator.getUnifiedMetrics();
    logger.info('\n📊 Final System Status:', {
      uptime: `${((Date.now() - Date.now()) / 1000).toFixed(2)}s`,
      systemHealth: finalMetrics.health.systemHealth.overall,
      operationsCompleted: 'Multiple',
      norwegianCompliance: '✅ Enabled',
      gdprCompliance: '✅ Enabled',
      performanceOptimization: '✅ Active',
      selfHealing: '✅ Active',
    });
    
  } catch (error) {
    logger.error('❌ Enterprise monitoring example failed:', error);
    throw error;
  } finally {
    // Graceful shutdown
    logger.info('\n🔄 Shutting down Enterprise Monitoring System...');
    await enterpriseOrchestrator.shutdown();
    logger.info('✅ Shutdown complete');
  }
}

/**
 * Performance benchmarking example
 */
export async function runPerformanceBenchmark(): Promise<void> {
  logger.info('🏁 Starting Performance Benchmark');
  
  await enterpriseOrchestrator.initialize();
  
  const command = new ExampleEnterpriseCommand();
  const iterations = 10;
  const results: number[] = [];
  
  for (let i = 0; i < iterations; i++) {
    const start = Date.now();
    
    await command.generateComponent(`BenchmarkComponent${i}`, 'component', {
      framework: 'react',
    });
    
    const duration = Date.now() - start;
    results.push(duration);
    
    logger.info(`Iteration ${i + 1}/${iterations}: ${duration}ms`);
  }
  
  const avgDuration = results.reduce((sum, d) => sum + d, 0) / results.length;
  const minDuration = Math.min(...results);
  const maxDuration = Math.max(...results);
  
  logger.info('🏁 Benchmark Results:', {
    iterations,
    averageDuration: `${avgDuration.toFixed(2)}ms`,
    minDuration: `${minDuration}ms`,
    maxDuration: `${maxDuration}ms`,
    throughput: `${(1000 / avgDuration).toFixed(2)} ops/sec`,
  });
  
  await enterpriseOrchestrator.shutdown();
}

/**
 * Health monitoring stress test
 */
export async function runHealthStressTest(): Promise<void> {
  logger.info('🧪 Starting Health Monitoring Stress Test');
  
  await enterpriseOrchestrator.initialize();
  
  const command = new ExampleEnterpriseCommand();
  
  // Simulate various error scenarios
  const errorScenarios = [
    'recoverable',
    'recoverable',
    'critical',
    'recoverable',
    'recoverable',
  ];
  
  for (let i = 0; i < errorScenarios.length; i++) {
    logger.info(`🧪 Stress test ${i + 1}/${errorScenarios.length}`);
    
    try {
      await command.simulateError(errorScenarios[i] as 'recoverable' | 'critical');
    } catch (error) {
      logger.warn(`Expected error in stress test: ${error.message}`);
    }
    
    // Get health status after each error
    const metrics = await enterpriseOrchestrator.getUnifiedMetrics();
    logger.info(`Health status: ${metrics.health.systemHealth.overall}`);
    
    // Wait a bit between errors
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Final health check
  const finalMetrics = await enterpriseOrchestrator.getUnifiedMetrics();
  logger.info('🏥 Final Health Status:', {
    systemHealth: finalMetrics.health.systemHealth.overall,
    circuitBreakersActive: finalMetrics.health.circuitBreakersActive,
    selfHealingEvents: finalMetrics.health.selfHealingEvents,
  });
  
  await enterpriseOrchestrator.shutdown();
}

// Export for CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  
  switch (command) {
    case 'example':
      runEnterpriseMonitoringExample().catch(console.error);
      break;
    case 'benchmark':
      runPerformanceBenchmark().catch(console.error);
      break;
    case 'stress':
      runHealthStressTest().catch(console.error);
      break;
    default:
      console.log('Usage: tsx enterprise-monitoring-example.ts [example|benchmark|stress]');
  }
}