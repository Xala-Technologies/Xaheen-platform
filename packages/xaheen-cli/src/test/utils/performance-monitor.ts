/**
 * Performance Monitor Utility
 * 
 * Utility for monitoring performance metrics during testing,
 * including CPU usage, memory consumption, and operation timing.
 * 
 * @author Database Architect with Performance Engineering Expertise
 * @since 2025-01-03
 */

import { performance } from 'perf_hooks';
import { EventEmitter } from 'events';

export interface PerformanceMetric {
  timestamp: number;
  cpuUsage?: NodeJS.CpuUsage;
  memoryUsage: NodeJS.MemoryUsage;
  eventLoopDelay?: number;
  operationName?: string;
  duration?: number;
}

export interface PerformanceProfile {
  startTime: number;
  endTime: number;
  totalDuration: number;
  metrics: PerformanceMetric[];
  summary: {
    avgCpuUsage: number;
    peakMemoryUsage: number;
    avgMemoryUsage: number;
    operationCount: number;
    avgOperationTime: number;
    maxOperationTime: number;
    minOperationTime: number;
  };
}

export class PerformanceMonitor extends EventEmitter {
  private isRunning = false;
  private startTime = 0;
  private metrics: PerformanceMetric[] = [];
  private interval?: NodeJS.Timeout;
  private monitoringInterval = 100; // 100ms
  private operations: Map<string, number> = new Map();

  constructor(monitoringInterval = 100) {
    super();
    this.monitoringInterval = monitoringInterval;
  }

  /**
   * Start performance monitoring
   */
  start(): void {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.startTime = performance.now();
    this.metrics = [];
    this.operations.clear();

    this.interval = setInterval(() => {
      this.collectMetrics();
    }, this.monitoringInterval);

    this.emit('started');
  }

  /**
   * Stop performance monitoring and return profile
   */
  stop(): PerformanceProfile {
    if (!this.isRunning) {
      throw new Error('Performance monitor is not running');
    }

    this.isRunning = false;
    const endTime = performance.now();

    if (this.interval) {
      clearInterval(this.interval);
    }

    const profile = this.generateProfile(endTime);
    this.emit('stopped', profile);

    return profile;
  }

  /**
   * Mark the start of an operation
   */
  markOperationStart(operationName: string): void {
    this.operations.set(operationName, performance.now());
  }

  /**
   * Mark the end of an operation
   */
  markOperationEnd(operationName: string): void {
    const startTime = this.operations.get(operationName);
    if (!startTime) {
      return;
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    this.metrics.push({
      timestamp: endTime,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      operationName,
      duration
    });

    this.operations.delete(operationName);
    this.emit('operationCompleted', { operationName, duration });
  }

  /**
   * Get current performance snapshot
   */
  getSnapshot(): PerformanceMetric {
    return {
      timestamp: performance.now(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage()
    };
  }

  /**
   * Reset monitoring data
   */
  reset(): void {
    this.metrics = [];
    this.operations.clear();
    this.startTime = performance.now();
  }

  private collectMetrics(): void {
    const metric: PerformanceMetric = {
      timestamp: performance.now(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage()
    };

    this.metrics.push(metric);
    this.emit('metricCollected', metric);
  }

  private generateProfile(endTime: number): PerformanceProfile {
    const totalDuration = endTime - this.startTime;
    const operationMetrics = this.metrics.filter(m => m.operationName && m.duration);

    // Calculate CPU usage (microseconds to percentage approximation)
    const avgCpuUsage = this.metrics.reduce((sum, metric) => {
      if (metric.cpuUsage) {
        return sum + (metric.cpuUsage.user + metric.cpuUsage.system);
      }
      return sum;
    }, 0) / this.metrics.length / 1000; // Convert to milliseconds

    // Calculate memory statistics
    const memoryUsages = this.metrics.map(m => m.memoryUsage.heapUsed);
    const peakMemoryUsage = Math.max(...memoryUsages);
    const avgMemoryUsage = memoryUsages.reduce((sum, usage) => sum + usage, 0) / memoryUsages.length;

    // Calculate operation statistics
    const operationTimes = operationMetrics.map(m => m.duration!);
    const avgOperationTime = operationTimes.length > 0 
      ? operationTimes.reduce((sum, time) => sum + time, 0) / operationTimes.length 
      : 0;
    const maxOperationTime = operationTimes.length > 0 ? Math.max(...operationTimes) : 0;
    const minOperationTime = operationTimes.length > 0 ? Math.min(...operationTimes) : 0;

    return {
      startTime: this.startTime,
      endTime,
      totalDuration,
      metrics: this.metrics,
      summary: {
        avgCpuUsage,
        peakMemoryUsage,
        avgMemoryUsage,
        operationCount: operationMetrics.length,
        avgOperationTime,
        maxOperationTime,
        minOperationTime
      }
    };
  }
}

/**
 * Utility function to measure async operation performance
 */
export async function measurePerformance<T>(
  operation: () => Promise<T>,
  operationName?: string
): Promise<{ result: T; duration: number; memoryDelta: number }> {
  const startTime = performance.now();
  const startMemory = process.memoryUsage().heapUsed;

  try {
    const result = await operation();
    const endTime = performance.now();
    const endMemory = process.memoryUsage().heapUsed;

    return {
      result,
      duration: endTime - startTime,
      memoryDelta: endMemory - startMemory
    };
  } catch (error) {
    const endTime = performance.now();
    const endMemory = process.memoryUsage().heapUsed;

    // Still return performance data even if operation failed
    throw Object.assign(error, {
      performanceData: {
        duration: endTime - startTime,
        memoryDelta: endMemory - startMemory,
        operationName
      }
    });
  }
}

/**
 * Utility function to create performance benchmarks
 */
export function createBenchmark(name: string, targetMetrics: {
  maxDuration?: number;
  maxMemoryUsage?: number;
  maxMemoryDelta?: number;
}) {
  return {
    name,
    targetMetrics,
    async run<T>(operation: () => Promise<T>): Promise<{
      result: T;
      passed: boolean;
      metrics: { duration: number; memoryDelta: number };
      violations: string[];
    }> {
      const { result, duration, memoryDelta } = await measurePerformance(operation, name);
      const violations: string[] = [];

      if (targetMetrics.maxDuration && duration > targetMetrics.maxDuration) {
        violations.push(`Duration ${duration.toFixed(2)}ms exceeds target ${targetMetrics.maxDuration}ms`);
      }

      if (targetMetrics.maxMemoryDelta && memoryDelta > targetMetrics.maxMemoryDelta) {
        violations.push(`Memory delta ${(memoryDelta / 1024 / 1024).toFixed(2)}MB exceeds target ${(targetMetrics.maxMemoryDelta / 1024 / 1024).toFixed(2)}MB`);
      }

      const currentMemory = process.memoryUsage().heapUsed;
      if (targetMetrics.maxMemoryUsage && currentMemory > targetMetrics.maxMemoryUsage) {
        violations.push(`Memory usage ${(currentMemory / 1024 / 1024).toFixed(2)}MB exceeds target ${(targetMetrics.maxMemoryUsage / 1024 / 1024).toFixed(2)}MB`);
      }

      return {
        result,
        passed: violations.length === 0,
        metrics: { duration, memoryDelta },
        violations
      };
    }
  };
}