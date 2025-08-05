/**
 * Memory Profiler Utility
 * 
 * Utility for profiling memory usage patterns, detecting leaks,
 * and analyzing memory allocation behavior during testing.
 * 
 * @author Database Architect with Memory Profiling Expertise
 * @since 2025-01-03
 */

import { performance } from 'perf_hooks';
import { EventEmitter } from 'events';

export interface MemorySnapshot {
  timestamp: number;
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
  arrayBuffers: number;
  operationContext?: string;
}

export interface MemoryProfile {
  startTime: number;
  endTime: number;
  duration: number;
  snapshots: MemorySnapshot[];
  analysis: {
    initialMemory: number;
    finalMemory: number;
    peakMemory: number;
    averageMemory: number;
    memoryGrowth: number;
    memoryGrowthRate: number; // bytes per second
    suspectedLeaks: MemoryLeak[];
    allocationPatterns: AllocationPattern[];
    gcEvents: number;
  };
}

export interface MemoryLeak {
  startTime: number;
  endTime: number;
  growthRate: number; // bytes per second
  totalGrowth: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: string;
}

export interface AllocationPattern {
  pattern: 'steady' | 'burst' | 'sawtooth' | 'exponential';
  confidence: number;
  timeRange: { start: number; end: number };
  characteristics: string[];
}

export class MemoryProfiler extends EventEmitter {
  private isRunning = false;
  private startTime = 0;
  private snapshots: MemorySnapshot[] = [];
  private interval?: NodeJS.Timeout;
  private samplingInterval = 100; // 100ms
  private lastGcTime = 0;
  private gcEventCount = 0;

  constructor(samplingInterval = 100) {
    super();
    this.samplingInterval = samplingInterval;
    
    // Monitor GC events if available
    if (global.gc) {
      this.setupGcMonitoring();
    }
  }

  /**
   * Start memory profiling
   */
  start(context?: string): void {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.startTime = performance.now();
    this.snapshots = [];
    this.gcEventCount = 0;

    // Take initial snapshot
    this.takeSnapshot(context);

    this.interval = setInterval(() => {
      this.takeSnapshot();
    }, this.samplingInterval);

    this.emit('started', { context });
  }

  /**
   * Stop memory profiling and return profile
   */
  stop(): MemoryProfile {
    if (!this.isRunning) {
      throw new Error('Memory profiler is not running');
    }

    this.isRunning = false;
    const endTime = performance.now();

    if (this.interval) {
      clearInterval(this.interval);
    }

    // Take final snapshot
    this.takeSnapshot('final');

    const profile = this.generateProfile(endTime);
    this.emit('stopped', profile);

    return profile;
  }

  /**
   * Take a manual memory snapshot
   */
  takeSnapshot(context?: string): MemorySnapshot {
    const memoryUsage = process.memoryUsage();
    const snapshot: MemorySnapshot = {
      timestamp: performance.now(),
      heapUsed: memoryUsage.heapUsed,
      heapTotal: memoryUsage.heapTotal,
      external: memoryUsage.external,
      rss: memoryUsage.rss,
      arrayBuffers: memoryUsage.arrayBuffers,
      operationContext: context
    };

    this.snapshots.push(snapshot);
    this.emit('snapshotTaken', snapshot);

    return snapshot;
  }

  /**
   * Force garbage collection if available
   */
  forceGc(): boolean {
    if (global.gc) {
      global.gc();
      this.gcEventCount++;
      this.emit('gcForced');
      return true;
    }
    return false;
  }

  /**
   * Get current memory usage
   */
  getCurrentUsage(): MemorySnapshot {
    return this.takeSnapshot('current');
  }

  /**
   * Reset profiling data
   */
  reset(): void {
    this.snapshots = [];
    this.startTime = performance.now();
    this.gcEventCount = 0;
  }

  /**
   * Analyze memory patterns for potential leaks
   */
  analyzeLeaks(windowSize = 10): MemoryLeak[] {
    if (this.snapshots.length < windowSize * 2) {
      return [];
    }

    const leaks: MemoryLeak[] = [];
    const snapshots = this.snapshots;

    // Sliding window analysis
    for (let i = 0; i <= snapshots.length - windowSize; i++) {
      const window = snapshots.slice(i, i + windowSize);
      const startSnapshot = window[0];
      const endSnapshot = window[window.length - 1];
      
      const timeDelta = endSnapshot.timestamp - startSnapshot.timestamp;
      const memoryDelta = endSnapshot.heapUsed - startSnapshot.heapUsed;
      const growthRate = memoryDelta / (timeDelta / 1000); // bytes per second

      // Consider it a potential leak if consistent growth
      if (growthRate > 1024 * 100 && memoryDelta > 1024 * 1024) { // 100 bytes/sec and 1MB growth
        let severity: MemoryLeak['severity'] = 'low';
        
        if (growthRate > 1024 * 1024) { // 1MB/sec
          severity = 'critical';
        } else if (growthRate > 1024 * 500) { // 500KB/sec
          severity = 'high';
        } else if (growthRate > 1024 * 200) { // 200KB/sec
          severity = 'medium';
        }

        leaks.push({
          startTime: startSnapshot.timestamp,
          endTime: endSnapshot.timestamp,
          growthRate,
          totalGrowth: memoryDelta,
          severity,
          context: startSnapshot.operationContext
        });
      }
    }

    return leaks;
  }

  /**
   * Identify allocation patterns
   */
  identifyAllocationPatterns(): AllocationPattern[] {
    if (this.snapshots.length < 10) {
      return [];
    }

    const patterns: AllocationPattern[] = [];
    const heapValues = this.snapshots.map(s => s.heapUsed);
    
    // Calculate derivatives to identify patterns
    const derivatives = [];
    for (let i = 1; i < heapValues.length; i++) {
      derivatives.push(heapValues[i] - heapValues[i - 1]);
    }

    // Analyze different sections
    const sectionSize = Math.floor(derivatives.length / 4);
    
    for (let section = 0; section < 4; section++) {
      const start = section * sectionSize;
      const end = Math.min(start + sectionSize, derivatives.length);
      const sectionDerivatives = derivatives.slice(start, end);
      
      const pattern = this.classifyPattern(sectionDerivatives);
      if (pattern) {
        patterns.push({
          ...pattern,
          timeRange: {
            start: this.snapshots[start].timestamp,
            end: this.snapshots[end].timestamp
          }
        });
      }
    }

    return patterns;
  }

  private setupGcMonitoring(): void {
    // Override global.gc to count GC events
    const originalGc = global.gc;
    global.gc = () => {
      this.gcEventCount++;
      this.lastGcTime = performance.now();
      this.emit('gcEvent', { time: this.lastGcTime, count: this.gcEventCount });
      return originalGc();
    };
  }

  private generateProfile(endTime: number): MemoryProfile {
    const duration = endTime - this.startTime;
    const snapshots = this.snapshots;
    
    if (snapshots.length === 0) {
      throw new Error('No memory snapshots available');
    }

    const initialMemory = snapshots[0].heapUsed;
    const finalMemory = snapshots[snapshots.length - 1].heapUsed;
    const heapValues = snapshots.map(s => s.heapUsed);
    const peakMemory = Math.max(...heapValues);
    const averageMemory = heapValues.reduce((sum, val) => sum + val, 0) / heapValues.length;
    const memoryGrowth = finalMemory - initialMemory;
    const memoryGrowthRate = memoryGrowth / (duration / 1000); // bytes per second

    return {
      startTime: this.startTime,
      endTime,
      duration,
      snapshots,
      analysis: {
        initialMemory,
        finalMemory,
        peakMemory,
        averageMemory,
        memoryGrowth,
        memoryGrowthRate,
        suspectedLeaks: this.analyzeLeaks(),
        allocationPatterns: this.identifyAllocationPatterns(),
        gcEvents: this.gcEventCount
      }
    };
  }

  private classifyPattern(derivatives: number[]): Omit<AllocationPattern, 'timeRange'> | null {
    if (derivatives.length < 5) {
      return null;
    }

    const avgDerivative = derivatives.reduce((sum, val) => sum + val, 0) / derivatives.length;
    const variance = derivatives.reduce((sum, val) => sum + Math.pow(val - avgDerivative, 2), 0) / derivatives.length;
    const stdDev = Math.sqrt(variance);
    
    const characteristics: string[] = [];
    let pattern: AllocationPattern['pattern'] = 'steady';
    let confidence = 0.5;

    // Steady pattern: low variance, small average change
    if (stdDev < 1024 * 10 && Math.abs(avgDerivative) < 1024 * 5) {
      pattern = 'steady';
      confidence = 0.8;
      characteristics.push('Low variance in allocation rate');
      characteristics.push('Minimal average memory change');
    }
    // Burst pattern: high variance, occasional large spikes
    else if (stdDev > 1024 * 100) {
      const spikes = derivatives.filter(d => Math.abs(d) > stdDev * 2).length;
      if (spikes > derivatives.length * 0.1) {
        pattern = 'burst';
        confidence = 0.7;
        characteristics.push('High variance in allocation');
        characteristics.push(`${spikes} allocation spikes detected`);
      }
    }
    // Exponential pattern: consistently increasing derivatives
    else if (avgDerivative > 1024 * 50) {
      let increasing = 0;
      for (let i = 1; i < derivatives.length; i++) {
        if (derivatives[i] > derivatives[i - 1]) {
          increasing++;
        }
      }
      if (increasing > derivatives.length * 0.6) {
        pattern = 'exponential';
        confidence = 0.9;
        characteristics.push('Consistently increasing allocation rate');
        characteristics.push('Potential memory leak detected');
      }
    }
    // Sawtooth pattern: regular peaks and valleys
    else {
      const peaks = [];
      const valleys = [];
      
      for (let i = 1; i < derivatives.length - 1; i++) {
        if (derivatives[i] > derivatives[i - 1] && derivatives[i] > derivatives[i + 1]) {
          peaks.push(i);
        }
        if (derivatives[i] < derivatives[i - 1] && derivatives[i] < derivatives[i + 1]) {
          valleys.push(i);
        }
      }
      
      if (peaks.length > 2 && valleys.length > 2) {
        pattern = 'sawtooth';
        confidence = 0.6;
        characteristics.push(`${peaks.length} allocation peaks`);
        characteristics.push(`${valleys.length} deallocation valleys`);
        characteristics.push('Regular allocation/deallocation cycle');
      }
    }

    return {
      pattern,
      confidence,
      characteristics
    };
  }
}

/**
 * Utility function to profile memory usage of an async operation
 */
export async function profileMemoryUsage<T>(
  operation: () => Promise<T>,
  options: { samplingInterval?: number; context?: string } = {}
): Promise<{ result: T; profile: MemoryProfile }> {
  const profiler = new MemoryProfiler(options.samplingInterval);
  
  profiler.start(options.context);
  
  try {
    const result = await operation();
    const profile = profiler.stop();
    
    return { result, profile };
  } catch (error) {
    const profile = profiler.stop();
    throw Object.assign(error, { memoryProfile: profile });
  }
}

/**
 * Detect memory leaks in a series of operations
 */
export async function detectMemoryLeaks<T>(
  operations: (() => Promise<T>)[],
  options: { 
    samplingInterval?: number;
    gcBetweenOperations?: boolean;
    leakThreshold?: number; // bytes per operation
  } = {}
): Promise<{
  results: T[];
  leakDetected: boolean;
  leakAnalysis: {
    memoryGrowthPerOperation: number;
    totalMemoryGrowth: number;
    suspectedLeaks: MemoryLeak[];
  };
}> {
  const profiler = new MemoryProfiler(options.samplingInterval);
  const results: T[] = [];
  const { gcBetweenOperations = true, leakThreshold = 1024 * 100 } = options; // 100KB default threshold
  
  profiler.start('leak-detection');
  const initialSnapshot = profiler.getCurrentUsage();
  
  for (let i = 0; i < operations.length; i++) {
    profiler.takeSnapshot(`operation-${i}-start`);
    
    const result = await operations[i]();
    results.push(result);
    
    profiler.takeSnapshot(`operation-${i}-end`);
    
    if (gcBetweenOperations && global.gc) {
      global.gc();
      profiler.takeSnapshot(`operation-${i}-after-gc`);
    }
  }
  
  const finalSnapshot = profiler.getCurrentUsage();
  const profile = profiler.stop();
  
  const totalMemoryGrowth = finalSnapshot.heapUsed - initialSnapshot.heapUsed;
  const memoryGrowthPerOperation = totalMemoryGrowth / operations.length;
  const leakDetected = memoryGrowthPerOperation > leakThreshold;
  
  return {
    results,
    leakDetected,
    leakAnalysis: {
      memoryGrowthPerOperation,
      totalMemoryGrowth,
      suspectedLeaks: profile.analysis.suspectedLeaks
    }
  };
}