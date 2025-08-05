/**
 * Cache Analyzer Utility
 * 
 * Utility for analyzing cache performance, hit rates, and effectiveness
 * during template generation and testing operations.
 * 
 * @author Database Architect with Cache Performance Expertise
 * @since 2025-01-03
 */

import { performance } from 'perf_hooks';
import { EventEmitter } from 'events';

export interface CacheMetric {
  timestamp: number;
  operation: 'hit' | 'miss' | 'set' | 'evict' | 'clear';
  key?: string;
  size?: number;
  responseTime?: number;
  context?: string;
}

export interface CacheStats {
  totalOperations: number;
  hits: number;
  misses: number;
  sets: number;
  evictions: number;
  clears: number;
  hitRate: number;
  missRate: number;
  averageResponseTime: number;
  totalCacheSize: number;
  keyCount: number;
  hotKeys: Array<{ key: string; accessCount: number; avgResponseTime: number }>;
  coldKeys: Array<{ key: string; accessCount: number; lastAccess: number }>;
  evictionRate: number;
  timeRange: { start: number; end: number };
}

export interface CachePerformanceProfile {
  startTime: number;
  endTime: number;
  duration: number;
  metrics: CacheMetric[];
  stats: CacheStats;
  analysis: {
    efficiency: 'excellent' | 'good' | 'fair' | 'poor';
    bottlenecks: string[];
    recommendations: string[];
    patterns: CachePattern[];
  };
}

export interface CachePattern {
  type: 'burst' | 'steady' | 'periodic' | 'random';
  confidence: number;
  timeRange: { start: number; end: number };
  description: string;
  characteristics: string[];
}

export class CacheAnalyzer extends EventEmitter {
  private isMonitoring = false;
  private startTime = 0;
  private metrics: CacheMetric[] = [];
  private keyAccessCounts: Map<string, number> = new Map();
  private keyResponseTimes: Map<string, number[]> = new Map();
  private keyLastAccess: Map<string, number> = new Map();
  private totalCacheSize = 0;

  constructor() {
    super();
  }

  /**
   * Start monitoring cache operations
   */
  startMonitoring(): void {
    if (this.isMonitoring) {
      return;
    }

    this.isMonitoring = true;
    this.startTime = performance.now();
    this.metrics = [];
    this.keyAccessCounts.clear();
    this.keyResponseTimes.clear();
    this.keyLastAccess.clear();
    this.totalCacheSize = 0;

    this.emit('monitoringStarted');
  }

  /**
   * Stop monitoring and return performance profile
   */
  stopMonitoring(): CachePerformanceProfile {
    if (!this.isMonitoring) {
      throw new Error('Cache analyzer is not monitoring');
    }

    this.isMonitoring = false;
    const endTime = performance.now();

    const profile = this.generateProfile(endTime);
    this.emit('monitoringStopped', profile);

    return profile;
  }

  /**
   * Record a cache operation
   */
  recordOperation(
    operation: CacheMetric['operation'],
    key?: string,
    options: {
      size?: number;
      responseTime?: number;
      context?: string;
    } = {}
  ): void {
    const timestamp = performance.now();
    const metric: CacheMetric = {
      timestamp,
      operation,
      key,
      ...options
    };

    this.metrics.push(metric);

    // Update tracking data
    if (key) {
      this.keyAccessCounts.set(key, (this.keyAccessCounts.get(key) || 0) + 1);
      this.keyLastAccess.set(key, timestamp);

      if (options.responseTime !== undefined) {
        const times = this.keyResponseTimes.get(key) || [];
        times.push(options.responseTime);
        this.keyResponseTimes.set(key, times);
      }
    }

    if (operation === 'set' && options.size) {
      this.totalCacheSize += options.size;
    } else if (operation === 'evict' && options.size) {
      this.totalCacheSize -= options.size;
    } else if (operation === 'clear') {
      this.totalCacheSize = 0;
    }

    this.emit('operationRecorded', metric);
  }

  /**
   * Get current cache statistics
   */
  getStats(): CacheStats {
    const hits = this.metrics.filter(m => m.operation === 'hit').length;
    const misses = this.metrics.filter(m => m.operation === 'miss').length;
    const sets = this.metrics.filter(m => m.operation === 'set').length;
    const evictions = this.metrics.filter(m => m.operation === 'evict').length;
    const clears = this.metrics.filter(m => m.operation === 'clear').length;
    const totalOperations = this.metrics.length;

    const hitRate = totalOperations > 0 ? (hits / (hits + misses)) * 100 : 0;
    const missRate = 100 - hitRate;

    const responseTimes = this.metrics
      .filter(m => m.responseTime !== undefined)
      .map(m => m.responseTime!);
    const averageResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      : 0;

    // Calculate hot and cold keys
    const hotKeys = Array.from(this.keyAccessCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([key, accessCount]) => {
        const times = this.keyResponseTimes.get(key) || [];
        const avgResponseTime = times.length > 0
          ? times.reduce((sum, time) => sum + time, 0) / times.length
          : 0;
        return { key, accessCount, avgResponseTime };
      });

    const currentTime = performance.now();
    const coldKeys = Array.from(this.keyLastAccess.entries())
      .filter(([key]) => this.keyAccessCounts.get(key)! < 2) // Less than 2 accesses
      .sort(([, a], [, b]) => a - b) // Sort by last access time (oldest first)
      .slice(0, 10)
      .map(([key, lastAccess]) => ({
        key,
        accessCount: this.keyAccessCounts.get(key) || 0,
        lastAccess: currentTime - lastAccess
      }));

    const evictionRate = totalOperations > 0 ? (evictions / totalOperations) * 100 : 0;

    const timeRange = {
      start: this.startTime,
      end: performance.now()
    };

    return {
      totalOperations,
      hits,
      misses,
      sets,
      evictions,
      clears,
      hitRate,
      missRate,
      averageResponseTime,
      totalCacheSize: this.totalCacheSize,
      keyCount: this.keyAccessCounts.size,
      hotKeys,
      coldKeys,
      evictionRate,
      timeRange
    };
  }

  /**
   * Analyze cache access patterns
   */
  analyzePatterns(): CachePattern[] {
    if (this.metrics.length < 10) {
      return [];
    }

    const patterns: CachePattern[] = [];
    const hitMissMetrics = this.metrics.filter(m => m.operation === 'hit' || m.operation === 'miss');
    
    // Divide timeline into segments for pattern analysis
    const segmentCount = Math.min(4, Math.floor(hitMissMetrics.length / 5));
    const segmentSize = Math.floor(hitMissMetrics.length / segmentCount);

    for (let i = 0; i < segmentCount; i++) {
      const start = i * segmentSize;
      const end = Math.min(start + segmentSize, hitMissMetrics.length);
      const segment = hitMissMetrics.slice(start, end);

      if (segment.length < 3) continue;

      const pattern = this.identifySegmentPattern(segment);
      if (pattern) {
        patterns.push({
          ...pattern,
          timeRange: {
            start: segment[0].timestamp,
            end: segment[segment.length - 1].timestamp
          }
        });
      }
    }

    return patterns;
  }

  /**
   * Reset analyzer data
   */
  reset(): void {
    this.metrics = [];
    this.keyAccessCounts.clear();
    this.keyResponseTimes.clear();
    this.keyLastAccess.clear();
    this.totalCacheSize = 0;
    this.startTime = performance.now();
  }

  private generateProfile(endTime: number): CachePerformanceProfile {
    const duration = endTime - this.startTime;
    const stats = this.getStats();
    const patterns = this.analyzePatterns();

    // Determine efficiency
    let efficiency: CachePerformanceProfile['analysis']['efficiency'] = 'poor';
    if (stats.hitRate >= 90) {
      efficiency = 'excellent';
    } else if (stats.hitRate >= 75) {
      efficiency = 'good';
    } else if (stats.hitRate >= 50) {
      efficiency = 'fair';
    }

    // Identify bottlenecks
    const bottlenecks: string[] = [];
    if (stats.hitRate < 50) {
      bottlenecks.push('Low cache hit rate indicates poor cache utilization');
    }
    if (stats.averageResponseTime > 100) {
      bottlenecks.push('High average response time indicates slow cache operations');
    }
    if (stats.evictionRate > 20) {
      bottlenecks.push('High eviction rate indicates insufficient cache size or poor key management');
    }
    if (stats.keyCount > 1000 && stats.hotKeys.length < 10) {
      bottlenecks.push('Large number of keys with few hot keys indicates poor access locality');
    }

    // Generate recommendations
    const recommendations: string[] = [];
    if (stats.hitRate < 75) {
      recommendations.push('Consider increasing cache size or improving cache key strategy');
    }
    if (stats.averageResponseTime > 50) {
      recommendations.push('Optimize cache lookup operations or consider faster storage backend');
    }
    if (stats.evictionRate > 15) {
      recommendations.push('Increase cache capacity or implement smarter eviction policies');
    }
    if (stats.coldKeys.length > stats.hotKeys.length) {
      recommendations.push('Implement cache warming strategies for frequently accessed keys');
    }
    if (patterns.some(p => p.type === 'burst')) {
      recommendations.push('Consider implementing rate limiting or request batching for burst patterns');
    }

    return {
      startTime: this.startTime,
      endTime,
      duration,
      metrics: this.metrics,
      stats,
      analysis: {
        efficiency,
        bottlenecks,
        recommendations,
        patterns
      }
    };
  }

  private identifySegmentPattern(segment: CacheMetric[]): Omit<CachePattern, 'timeRange'> | null {
    const hits = segment.filter(m => m.operation === 'hit').length;
    const total = segment.length;
    const hitRate = (hits / total) * 100;

    // Calculate variance in hit/miss distribution
    const intervals = [];
    let currentRun = 1;
    let lastOperation = segment[0].operation;

    for (let i = 1; i < segment.length; i++) {
      if (segment[i].operation === lastOperation) {
        currentRun++;
      } else {
        intervals.push(currentRun);
        currentRun = 1;
        lastOperation = segment[i].operation;
      }
    }
    intervals.push(currentRun);

    const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
    const variance = intervals.reduce((sum, val) => sum + Math.pow(val - avgInterval, 2), 0) / intervals.length;

    let type: CachePattern['type'] = 'random';
    let confidence = 0.5;
    const characteristics: string[] = [];

    // Burst pattern: long runs of hits or misses
    if (variance > 4 && intervals.some(run => run > 5)) {
      type = 'burst';
      confidence = 0.8;
      characteristics.push('Long consecutive runs of hits/misses detected');
      characteristics.push(`Average run length: ${avgInterval.toFixed(1)}`);
    }
    // Steady pattern: consistent hit rate with low variance
    else if (variance < 2 && Math.abs(hitRate - 50) < 20) {
      type = 'steady';
      confidence = 0.7;
      characteristics.push('Consistent hit/miss distribution');
      characteristics.push(`Hit rate: ${hitRate.toFixed(1)}%`);
    }
    // Periodic pattern: regular alternation
    else if (intervals.length > 6 && variance < 3) {
      const periodicPattern = this.detectPeriodicity(segment);
      if (periodicPattern) {
        type = 'periodic';
        confidence = 0.6;
        characteristics.push('Regular alternating pattern detected');
        characteristics.push(`Period length: ~${periodicPattern} operations`);
      }
    }

    characteristics.push(`Hit rate: ${hitRate.toFixed(1)}%`);
    characteristics.push(`${intervals.length} distinct access runs`);

    return {
      type,
      confidence,
      description: this.getPatternDescription(type, hitRate),
      characteristics
    };
  }

  private detectPeriodicity(segment: CacheMetric[]): number | null {
    if (segment.length < 8) return null;

    // Look for repeating patterns in hit/miss sequence
    const operations = segment.map(m => m.operation === 'hit' ? 1 : 0);
    
    // Check for periods of length 2-8
    for (let period = 2; period <= Math.min(8, Math.floor(operations.length / 3)); period++) {
      let matches = 0;
      let comparisons = 0;
      
      for (let i = 0; i < operations.length - period; i++) {
        if (operations[i] === operations[i + period]) {
          matches++;
        }
        comparisons++;
      }
      
      const matchRate = matches / comparisons;
      if (matchRate > 0.7) { // 70% of positions match with period offset
        return period;
      }
    }
    
    return null;
  }

  private getPatternDescription(type: CachePattern['type'], hitRate: number): string {
    switch (type) {
      case 'burst':
        return `Bursty access pattern with ${hitRate.toFixed(1)}% hit rate - suggests batch operations or periodic workloads`;
      case 'steady':
        return `Steady access pattern with consistent ${hitRate.toFixed(1)}% hit rate - indicates regular workload`;
      case 'periodic':
        return `Periodic access pattern with ${hitRate.toFixed(1)}% hit rate - suggests cyclical operations`;
      case 'random':
        return `Random access pattern with ${hitRate.toFixed(1)}% hit rate - indicates unpredictable workload`;
      default:
        return `Unknown pattern with ${hitRate.toFixed(1)}% hit rate`;
    }
  }
}

/**
 * Utility function to analyze cache performance during an operation
 */
export async function analyzeCachePerformance<T>(
  operation: () => Promise<T>,
  cacheAnalyzer?: CacheAnalyzer
): Promise<{ result: T; cacheProfile: CachePerformanceProfile }> {
  const analyzer = cacheAnalyzer || new CacheAnalyzer();
  
  analyzer.startMonitoring();
  
  try {
    const result = await operation();
    const cacheProfile = analyzer.stopMonitoring();
    
    return { result, cacheProfile };
  } catch (error) {
    const cacheProfile = analyzer.stopMonitoring();
    throw Object.assign(error, { cacheProfile });
  }
}

/**
 * Create a mock cache that integrates with the analyzer
 */
export function createAnalyzedCache<K, V>(analyzer: CacheAnalyzer) {
  const cache = new Map<K, V>();
  
  return {
    get(key: K): V | undefined {
      const startTime = performance.now();
      const value = cache.get(key);
      const responseTime = performance.now() - startTime;
      
      analyzer.recordOperation(
        value !== undefined ? 'hit' : 'miss',
        String(key),
        { responseTime }
      );
      
      return value;
    },
    
    set(key: K, value: V): void {
      const startTime = performance.now();
      cache.set(key, value);
      const responseTime = performance.now() - startTime;
      
      // Estimate size (rough approximation)
      const size = JSON.stringify({ key, value }).length;
      
      analyzer.recordOperation('set', String(key), { responseTime, size });
    },
    
    delete(key: K): boolean {
      const startTime = performance.now();
      const existed = cache.has(key);
      const deleted = cache.delete(key);
      const responseTime = performance.now() - startTime;
      
      if (existed) {
        analyzer.recordOperation('evict', String(key), { responseTime });
      }
      
      return deleted;
    },
    
    clear(): void {
      const startTime = performance.now();
      cache.clear();
      const responseTime = performance.now() - startTime;
      
      analyzer.recordOperation('clear', undefined, { responseTime });
    },
    
    has(key: K): boolean {
      return cache.has(key);
    },
    
    size: cache.size,
    
    keys(): IterableIterator<K> {
      return cache.keys();
    },
    
    values(): IterableIterator<V> {
      return cache.values();
    },
    
    entries(): IterableIterator<[K, V]> {
      return cache.entries();
    }
  };
}