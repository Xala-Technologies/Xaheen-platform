/**
 * Performance Helpers for Phase 3 Testing
 * Utilities for measuring and analyzing performance
 */

import { performance } from 'perf_hooks';
import { join } from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import type { PackageManagerName } from '../config/test-config';
import { PERFORMANCE_THRESHOLDS } from '../config/test-config';

export interface PerformanceMetric {
  readonly name: string;
  readonly value: number;
  readonly unit: string;
  readonly timestamp: number;
  readonly metadata?: Record<string, any>;
}

export interface PerformanceBenchmark {
  readonly name: string;
  readonly packageManager: PackageManagerName;
  readonly operation: string;
  readonly metrics: PerformanceMetric[];
  readonly duration: number;
  readonly success: boolean;
  readonly threshold?: number;
  readonly passed?: boolean;
}

export interface PerformanceReport {
  readonly testSuite: string;
  readonly timestamp: number;
  readonly environment: {
    readonly nodeVersion: string;
    readonly platform: string;
    readonly arch: string;
    readonly memory: number;
    readonly cpus: number;
  };
  readonly benchmarks: PerformanceBenchmark[];
  readonly summary: {
    readonly totalTests: number;
    readonly passed: number;
    readonly failed: number;
    readonly averageDuration: number;
  };
}

/**
 * Performance measurement utilities
 */
export class PerformanceMeasurer {
  private startTime: number = 0;
  private metrics: PerformanceMetric[] = [];
  
  start(): void {
    this.startTime = performance.now();
  }
  
  stop(): number {
    const duration = performance.now() - this.startTime;
    return duration;
  }
  
  measure<T>(name: string, operation: () => T): T;
  measure<T>(name: string, operation: () => Promise<T>): Promise<T>;
  measure<T>(name: string, operation: () => T | Promise<T>): T | Promise<T> {
    const start = performance.now();
    
    try {
      const result = operation();
      
      if (result instanceof Promise) {
        return result.then(
          (value) => {
            const duration = performance.now() - start;
            this.addMetric(name, duration, 'ms');
            return value;
          },
          (error) => {
            const duration = performance.now() - start;
            this.addMetric(name, duration, 'ms', { error: true });
            throw error;
          }
        );
      } else {
        const duration = performance.now() - start;
        this.addMetric(name, duration, 'ms');
        return result;
      }
    } catch (error) {
      const duration = performance.now() - start;
      this.addMetric(name, duration, 'ms', { error: true });
      throw error;
    }
  }
  
  addMetric(name: string, value: number, unit: string, metadata?: Record<string, any>): void {
    this.metrics.push({
      name,
      value,
      unit,
      timestamp: Date.now(),
      metadata,
    });
  }
  
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }
  
  clear(): void {
    this.metrics = [];
  }
}

/**
 * Memory usage tracker
 */
export class MemoryTracker {
  private samples: Array<{ timestamp: number; usage: NodeJS.MemoryUsage }> = [];
  private interval: NodeJS.Timeout | null = null;
  
  start(intervalMs = 1000): void {
    this.samples = [];
    this.interval = setInterval(() => {
      this.samples.push({
        timestamp: Date.now(),
        usage: process.memoryUsage(),
      });
    }, intervalMs);
  }
  
  stop(): Array<{ timestamp: number; usage: NodeJS.MemoryUsage }> {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    
    return [...this.samples];
  }
  
  getMemoryStats(): {
    peak: NodeJS.MemoryUsage;
    average: NodeJS.MemoryUsage;
    samples: number;
  } {
    if (this.samples.length === 0) {
      const current = process.memoryUsage();
      return { peak: current, average: current, samples: 0 };
    }
    
    const peak = this.samples.reduce((max, sample) => ({
      rss: Math.max(max.rss, sample.usage.rss),
      heapTotal: Math.max(max.heapTotal, sample.usage.heapTotal),
      heapUsed: Math.max(max.heapUsed, sample.usage.heapUsed),
      external: Math.max(max.external, sample.usage.external),
      arrayBuffers: Math.max(max.arrayBuffers, sample.usage.arrayBuffers),
    }), this.samples[0].usage);
    
    const sums = this.samples.reduce((acc, sample) => ({
      rss: acc.rss + sample.usage.rss,
      heapTotal: acc.heapTotal + sample.usage.heapTotal,
      heapUsed: acc.heapUsed + sample.usage.heapUsed,
      external: acc.external + sample.usage.external,
      arrayBuffers: acc.arrayBuffers + sample.usage.arrayBuffers,
    }), { rss: 0, heapTotal: 0, heapUsed: 0, external: 0, arrayBuffers: 0 });
    
    const count = this.samples.length;
    const average = {
      rss: sums.rss / count,
      heapTotal: sums.heapTotal / count,
      heapUsed: sums.heapUsed / count,
      external: sums.external / count,
      arrayBuffers: sums.arrayBuffers / count,
    };
    
    return { peak, average, samples: count };
  }
}

/**
 * Benchmark runner for package manager operations
 */
export async function benchmarkPackageManagerOperation(
  name: string,
  packageManager: PackageManagerName,
  operation: () => Promise<{ success: boolean; error?: string }>,
  threshold?: number
): Promise<PerformanceBenchmark> {
  const measurer = new PerformanceMeasurer();
  const memoryTracker = new MemoryTracker();
  
  // Start monitoring
  measurer.start();
  memoryTracker.start(500); // Sample every 500ms
  
  let success = false;
  let error: string | undefined;
  
  try {
    const result = await operation();
    success = result.success;
    error = result.error;
  } catch (e) {
    success = false;
    error = e instanceof Error ? e.message : String(e);
  }
  
  const duration = measurer.stop();
  const memoryStats = memoryTracker.getMemoryStats();
  memoryTracker.stop();
  
  // Add performance metrics
  measurer.addMetric('duration', duration, 'ms');
  measurer.addMetric('memory-peak-rss', memoryStats.peak.rss, 'bytes');
  measurer.addMetric('memory-peak-heap', memoryStats.peak.heapUsed, 'bytes');
  measurer.addMetric('memory-average-rss', memoryStats.average.rss, 'bytes');
  measurer.addMetric('memory-average-heap', memoryStats.average.heapUsed, 'bytes');
  
  const benchmark: PerformanceBenchmark = {
    name,
    packageManager,
    operation: 'install',
    metrics: measurer.getMetrics(),
    duration,
    success,
    threshold,
    passed: threshold ? duration <= threshold : undefined,
  };
  
  return benchmark;
}

/**
 * Compare performance across package managers
 */
export async function comparePackageManagerPerformance(
  operation: string,
  operations: Array<{
    name: string;
    packageManager: PackageManagerName;
    operation: () => Promise<{ success: boolean; error?: string }>;
  }>
): Promise<{
  results: PerformanceBenchmark[];
  fastest: PerformanceBenchmark;
  slowest: PerformanceBenchmark;
  comparison: Array<{
    packageManager: PackageManagerName;
    duration: number;
    relativeSpeed: number; // Compared to fastest
    success: boolean;
  }>;
}> {
  const results: PerformanceBenchmark[] = [];
  
  for (const op of operations) {
    const threshold = PERFORMANCE_THRESHOLDS[`${op.packageManager}Install` as keyof typeof PERFORMANCE_THRESHOLDS];
    const benchmark = await benchmarkPackageManagerOperation(
      op.name,
      op.packageManager,
      op.operation,
      threshold
    );
    results.push(benchmark);
  }
  
  const successfulResults = results.filter(r => r.success);
  
  if (successfulResults.length === 0) {
    throw new Error('No successful operations to compare');
  }
  
  const fastest = successfulResults.reduce((min, current) => 
    current.duration < min.duration ? current : min
  );
  
  const slowest = successfulResults.reduce((max, current) => 
    current.duration > max.duration ? current : max
  );
  
  const comparison = results.map(result => ({
    packageManager: result.packageManager,
    duration: result.duration,
    relativeSpeed: result.duration / fastest.duration,
    success: result.success,
  }));
  
  return { results, fastest, slowest, comparison };
}

/**
 * Generate performance report
 */
export function generatePerformanceReport(
  testSuite: string,
  benchmarks: PerformanceBenchmark[]
): PerformanceReport {
  const totalTests = benchmarks.length;
  const passed = benchmarks.filter(b => b.success).length;
  const failed = totalTests - passed;
  const averageDuration = benchmarks.reduce((sum, b) => sum + b.duration, 0) / totalTests;
  
  return {
    testSuite,
    timestamp: Date.now(),
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      memory: require('os').totalmem(),
      cpus: require('os').cpus().length,
    },
    benchmarks,
    summary: {
      totalTests,
      passed,
      failed,
      averageDuration,
    },
  };
}

/**
 * Save performance report to file
 */
export async function savePerformanceReport(
  report: PerformanceReport,
  outputDir: string
): Promise<string> {
  if (!existsSync(outputDir)) {
    await mkdir(outputDir, { recursive: true });
  }
  
  const filename = `performance-report-${report.testSuite}-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  const filepath = join(outputDir, filename);
  
  await writeFile(filepath, JSON.stringify(report, null, 2));
  
  return filepath;
}

/**
 * Analyze performance trends
 */
export function analyzePerformanceTrends(benchmarks: PerformanceBenchmark[]): {
  packageManagerRanking: Array<{
    packageManager: PackageManagerName;
    averageTime: number;
    successRate: number;
    testCount: number;
  }>;
  operationInsights: Array<{
    operation: string;
    fastest: PackageManagerName;
    slowest: PackageManagerName;
    speedDifference: number;
  }>;
} {
  // Group by package manager
  const byPackageManager = benchmarks.reduce((acc, benchmark) => {
    if (!acc[benchmark.packageManager]) {
      acc[benchmark.packageManager] = [];
    }
    acc[benchmark.packageManager].push(benchmark);
    return acc;
  }, {} as Record<PackageManagerName, PerformanceBenchmark[]>);
  
  // Calculate package manager rankings
  const packageManagerRanking = Object.entries(byPackageManager).map(([manager, benchmarks]) => {
    const successfulBenchmarks = benchmarks.filter(b => b.success);
    const averageTime = successfulBenchmarks.length > 0
      ? successfulBenchmarks.reduce((sum, b) => sum + b.duration, 0) / successfulBenchmarks.length
      : Infinity;
    const successRate = benchmarks.length > 0 ? successfulBenchmarks.length / benchmarks.length : 0;
    
    return {
      packageManager: manager as PackageManagerName,
      averageTime,
      successRate,
      testCount: benchmarks.length,
    };
  }).sort((a, b) => a.averageTime - b.averageTime);
  
  // Group by operation
  const byOperation = benchmarks.reduce((acc, benchmark) => {
    if (!acc[benchmark.operation]) {
      acc[benchmark.operation] = [];
    }
    acc[benchmark.operation].push(benchmark);
    return acc;
  }, {} as Record<string, PerformanceBenchmark[]>);
  
  // Analyze operation insights
  const operationInsights = Object.entries(byOperation).map(([operation, benchmarks]) => {
    const successfulBenchmarks = benchmarks.filter(b => b.success);
    
    if (successfulBenchmarks.length < 2) {
      return null;
    }
    
    const fastest = successfulBenchmarks.reduce((min, current) => 
      current.duration < min.duration ? current : min
    );
    
    const slowest = successfulBenchmarks.reduce((max, current) => 
      current.duration > max.duration ? current : max
    );
    
    return {
      operation,
      fastest: fastest.packageManager,
      slowest: slowest.packageManager,
      speedDifference: slowest.duration / fastest.duration,
    };
  }).filter(Boolean) as Array<{
    operation: string;
    fastest: PackageManagerName;
    slowest: PackageManagerName;
    speedDifference: number;
  }>;
  
  return { packageManagerRanking, operationInsights };
}

/**
 * Format performance metrics for console output
 */
export function formatPerformanceMetrics(benchmark: PerformanceBenchmark): string {
  const lines = [
    `📊 ${benchmark.name} (${benchmark.packageManager})`,
    `   Duration: ${benchmark.duration.toFixed(2)}ms`,
    `   Success: ${benchmark.success ? '✅' : '❌'}`,
  ];
  
  if (benchmark.threshold) {
    const passed = benchmark.duration <= benchmark.threshold;
    lines.push(`   Threshold: ${benchmark.threshold}ms ${passed ? '✅' : '❌'}`);
  }
  
  const memoryMetric = benchmark.metrics.find(m => m.name === 'memory-peak-rss');
  if (memoryMetric) {
    const memoryMB = (memoryMetric.value / 1024 / 1024).toFixed(2);
    lines.push(`   Peak Memory: ${memoryMB}MB`);
  }
  
  return lines.join('\n');
}

/**
 * Create performance comparison table
 */
export function createPerformanceComparisonTable(
  comparison: Array<{
    packageManager: PackageManagerName;
    duration: number;
    relativeSpeed: number;
    success: boolean;
  }>
): string {
  const rows = comparison
    .sort((a, b) => a.duration - b.duration)
    .map(item => {
      const duration = item.duration.toFixed(2);
      const relative = item.relativeSpeed.toFixed(2);
      const status = item.success ? '✅' : '❌';
      
      return `| ${item.packageManager.padEnd(8)} | ${duration.padStart(10)}ms | ${relative.padStart(8)}x | ${status} |`;
    });
  
  const header = [
    '| Manager  | Duration   | Relative | Status |',
    '|----------|------------|----------|--------|',
  ];
  
  return [...header, ...rows].join('\n');
}