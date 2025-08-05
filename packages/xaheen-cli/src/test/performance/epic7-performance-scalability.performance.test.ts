/**
 * EPIC 7: Integration and Testing - Performance and Scalability Tests
 * 
 * Comprehensive performance testing suite for validating template generation speed,
 * scalability under load, memory usage, caching effectiveness, and overall system
 * performance under various conditions.
 * 
 * @author Database Architect with Performance Engineering and Scalability Expertise
 * @since 2025-01-03
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import path from 'node:path';
import fs from 'fs-extra';
import { execa } from 'execa';
import { performance } from 'perf_hooks';
import { Worker } from 'worker_threads';

// Test utilities and helpers
import { createTestProject, cleanupTestProject } from '../utils/test-helpers';

// Performance monitoring utilities
import { PerformanceMonitor } from '../utils/performance-monitor';
import { MemoryProfiler } from '../utils/memory-profiler';
import { CacheAnalyzer } from '../utils/cache-analyzer';

// Services for testing
import { TemplateOrchestrator } from '../../services/templates/template-orchestrator';
import { TemplateCache } from '../../utils/template-cache';
import { McpClient } from '../../services/mcp/mcp-client';

interface PerformanceMetrics {
  generationTime: number;
  memoryUsage: {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
  };
  cacheHitRate: number;
  throughput: number; // operations per second
  cpuUsage?: number;
  diskIO?: {
    reads: number;
    writes: number;
  };
}

interface ScalabilityTestResult {
  concurrent: number;
  averageTime: number;
  totalTime: number;
  successRate: number;
  errorRate: number;
  memoryPeak: number;
  throughput: number;
}

class PerformanceTestHelper {
  static async measureTemplateGeneration(
    command: string[], 
    projectPath: string,
    iterations: number = 1
  ): Promise<PerformanceMetrics> {
    const metrics: PerformanceMetrics[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      const startMemory = process.memoryUsage();
      
      await execa('xaheen', command, { cwd: projectPath });
      
      const endTime = performance.now();
      const endMemory = process.memoryUsage();
      
      metrics.push({
        generationTime: endTime - startTime,
        memoryUsage: {
          heapUsed: endMemory.heapUsed - startMemory.heapUsed,
          heapTotal: endMemory.heapTotal - startMemory.heapTotal,
          external: endMemory.external - startMemory.external,
          rss: endMemory.rss - startMemory.rss
        },
        cacheHitRate: 0, // Will be calculated separately
        throughput: 1000 / (endTime - startTime) // ops per second
      });
    }
    
    // Calculate averages
    return {
      generationTime: metrics.reduce((sum, m) => sum + m.generationTime, 0) / metrics.length,
      memoryUsage: {
        heapUsed: metrics.reduce((sum, m) => sum + m.memoryUsage.heapUsed, 0) / metrics.length,
        heapTotal: metrics.reduce((sum, m) => sum + m.memoryUsage.heapTotal, 0) / metrics.length,
        external: metrics.reduce((sum, m) => sum + m.memoryUsage.external, 0) / metrics.length,
        rss: metrics.reduce((sum, m) => sum + m.memoryUsage.rss, 0) / metrics.length
      },
      cacheHitRate: 0,
      throughput: metrics.reduce((sum, m) => sum + m.throughput, 0) / metrics.length
    };
  }

  static async runConcurrentGeneration(
    command: string[],
    projectPath: string,
    concurrency: number,
    iterations: number = 10
  ): Promise<ScalabilityTestResult> {
    const startTime = performance.now();
    const promises: Promise<any>[] = [];
    const results: { success: boolean; time: number }[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const taskPromises: Promise<any>[] = [];
      
      for (let j = 0; j < concurrency; j++) {
        const taskStartTime = performance.now();
        const taskCommand = [...command, `${command[command.length - 1]}${i}_${j}`];
        
        const promise = execa('xaheen', taskCommand, { cwd: projectPath })
          .then(() => ({
            success: true,
            time: performance.now() - taskStartTime
          }))
          .catch(() => ({
            success: false,
            time: performance.now() - taskStartTime
          }));
        
        taskPromises.push(promise);
      }
      
      const batchResults = await Promise.all(taskPromises);
      results.push(...batchResults);
    }
    
    const totalTime = performance.now() - startTime;
    const successfulResults = results.filter(r => r.success);
    const failedResults = results.filter(r => !r.success);
    
    return {
      concurrent: concurrency,
      averageTime: successfulResults.reduce((sum, r) => sum + r.time, 0) / successfulResults.length,
      totalTime,
      successRate: (successfulResults.length / results.length) * 100,
      errorRate: (failedResults.length / results.length) * 100,
      memoryPeak: process.memoryUsage().heapUsed,
      throughput: (results.length / totalTime) * 1000 // ops per second
    };
  }

  static async runMemoryStressTest(
    command: string[],
    projectPath: string,
    duration: number = 60000 // 1 minute
  ): Promise<{ memoryStats: any[]; finalMemory: NodeJS.MemoryUsage }> {
    const memoryStats: any[] = [];
    const startTime = performance.now();
    let iteration = 0;
    
    const memoryInterval = setInterval(() => {
      memoryStats.push({
        timestamp: performance.now() - startTime,
        memory: process.memoryUsage(),
        iteration
      });
    }, 1000);
    
    while (performance.now() - startTime < duration) {
      const iterationCommand = [...command, `MemoryTest_${iteration++}`];
      await execa('xaheen', iterationCommand, { cwd: projectPath });
      
      // Force garbage collection periodically
      if (iteration % 10 === 0 && global.gc) {
        global.gc();
      }
    }
    
    clearInterval(memoryInterval);
    
    return {
      memoryStats,
      finalMemory: process.memoryUsage()
    };
  }
}

describe('EPIC 7: Performance and Scalability Tests', () => {
  let testProjectPath: string;
  let performanceMonitor: PerformanceMonitor;
  let memoryProfiler: MemoryProfiler;
  let cacheAnalyzer: CacheAnalyzer;

  beforeEach(async () => {
    testProjectPath = await createTestProject('performance-test');
    performanceMonitor = new PerformanceMonitor();
    memoryProfiler = new MemoryProfiler();
    cacheAnalyzer = new CacheAnalyzer();
    
    // Clear template cache
    await TemplateCache.clear();
  });

  afterEach(async () => {
    await cleanupTestProject(testProjectPath);
    performanceMonitor.stop();
    memoryProfiler.stop();
  });

  describe('Story 5.3.1: Template Generation Speed Under Normal Conditions', () => {
    it('should generate simple components within performance benchmarks', async () => {
      const metrics = await PerformanceTestHelper.measureTemplateGeneration(
        ['generate', 'component', 'SimpleComponent', '--platform=react'],
        testProjectPath,
        5
      );
      
      // Performance benchmarks
      expect(metrics.generationTime).toBeLessThan(2000); // 2 seconds
      expect(metrics.memoryUsage.heapUsed).toBeLessThan(50 * 1024 * 1024); // 50MB
      expect(metrics.throughput).toBeGreaterThan(0.5); // 0.5 ops/second minimum
      
      // Verify component was generated
      const componentPath = path.join(testProjectPath, 'src/components/SimpleComponent.tsx');
      expect(await fs.pathExists(componentPath)).toBe(true);
    });

    it('should generate forms within performance benchmarks', async () => {
      const metrics = await PerformanceTestHelper.measureTemplateGeneration(
        ['generate', 'form', 'UserForm', '--fields=name,email,password'],
        testProjectPath,
        3
      );
      
      expect(metrics.generationTime).toBeLessThan(3000); // 3 seconds for forms
      expect(metrics.memoryUsage.heapUsed).toBeLessThan(75 * 1024 * 1024); // 75MB
      
      const formPath = path.join(testProjectPath, 'src/forms/UserForm.tsx');
      expect(await fs.pathExists(formPath)).toBe(true);
    });

    it('should generate pages within performance benchmarks', async () => {
      const metrics = await PerformanceTestHelper.measureTemplateGeneration(
        ['generate', 'page', 'Dashboard', '--template=dashboard'],
        testProjectPath,
        3
      );
      
      expect(metrics.generationTime).toBeLessThan(5000); // 5 seconds for complex pages
      expect(metrics.memoryUsage.heapUsed).toBeLessThan(100 * 1024 * 1024); // 100MB
      
      const pagePath = path.join(testProjectPath, 'src/pages/Dashboard.tsx');
      expect(await fs.pathExists(pagePath)).toBe(true);
    });

    it('should maintain consistent performance across multiple generations', async () => {
      const iterations = 10;
      const generationTimes: number[] = [];
      
      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        await execa('xaheen', [
          'generate', 'component', `Component${i}`, '--platform=react'
        ], { cwd: testProjectPath });
        const endTime = performance.now();
        
        generationTimes.push(endTime - startTime);
      }
      
      // Calculate standard deviation to check consistency
      const mean = generationTimes.reduce((sum, time) => sum + time, 0) / iterations;
      const variance = generationTimes.reduce((sum, time) => sum + Math.pow(time - mean, 2), 0) / iterations;
      const stdDev = Math.sqrt(variance);
      
      // Standard deviation should be less than 20% of mean (consistent performance)
      expect(stdDev / mean).toBeLessThan(0.2);
    });

    it('should show performance improvement with warm cache', async () => {
      // First generation (cold cache)
      const coldMetrics = await PerformanceTestHelper.measureTemplateGeneration(
        ['generate', 'component', 'CachedComponent1', '--platform=react'],
        testProjectPath,
        1
      );
      
      // Second generation (warm cache)
      const warmMetrics = await PerformanceTestHelper.measureTemplateGeneration(
        ['generate', 'component', 'CachedComponent2', '--platform=react'],
        testProjectPath,
        1
      );
      
      // Warm cache should be faster
      expect(warmMetrics.generationTime).toBeLessThan(coldMetrics.generationTime);
    });
  });

  describe('Story 5.3.2: Template Generation Performance with Large Templates', () => {
    it('should handle complex templates with multiple components', async () => {
      const metrics = await PerformanceTestHelper.measureTemplateGeneration([
        'generate', 'layout', 'ComplexLayout',
        '--slots=header,sidebar,content,footer',
        '--components=20',
        '--responsive',
        '--accessibility'
      ], testProjectPath, 3);
      
      expect(metrics.generationTime).toBeLessThan(10000); // 10 seconds for complex layouts
      expect(metrics.memoryUsage.heapUsed).toBeLessThan(200 * 1024 * 1024); // 200MB
      
      const layoutPath = path.join(testProjectPath, 'src/layouts/ComplexLayout.tsx');
      expect(await fs.pathExists(layoutPath)).toBe(true);
    });

    it('should handle large forms with many fields efficiently', async () => {
      const largeFieldList = Array.from({ length: 50 }, (_, i) => `field${i}:string`).join(',');
      
      const metrics = await PerformanceTestHelper.measureTemplateGeneration([
        'generate', 'form', 'LargeForm',
        `--fields=${largeFieldList}`,
        '--validation',
        '--accessibility'
      ], testProjectPath, 2);
      
      expect(metrics.generationTime).toBeLessThan(15000); // 15 seconds for large forms
      expect(metrics.memoryUsage.heapUsed).toBeLessThan(300 * 1024 * 1024); // 300MB
    });

    it('should handle template inheritance chains efficiently', async () => {
      // Generate base template
      await execa('xaheen', [
        'generate', 'component', 'BaseComponent', '--platform=react'
      ], { cwd: testProjectPath });
      
      // Generate extended template
      const metrics = await PerformanceTestHelper.measureTemplateGeneration([
        'generate', 'component', 'ExtendedComponent',
        '--extends=BaseComponent',
        '--additional-features=10'
      ], testProjectPath, 3);
      
      expect(metrics.generationTime).toBeLessThan(8000); // 8 seconds with inheritance
    });

    it('should optimize large template compilation', async () => {
      const startTime = performance.now();
      const templateOrchestrator = new TemplateOrchestrator();
      
      // Simulate large template compilation
      const largeTemplate = {
        name: 'LargeTemplate',
        content: 'x'.repeat(100000), // 100KB template
        context: {
          components: Array.from({ length: 100 }, (_, i) => `Component${i}`),
          props: Array.from({ length: 50 }, (_, i) => ({ name: `prop${i}`, type: 'string' }))
        }
      };
      
      await templateOrchestrator.compileTemplate(largeTemplate);
      const compilationTime = performance.now() - startTime;
      
      expect(compilationTime).toBeLessThan(5000); // 5 seconds for large template compilation
    });
  });

  describe('Story 5.3.3: MCP Integration Performance Impact', () => {
    it('should measure MCP connection overhead', async () => {
      // Without MCP
      const withoutMcpMetrics = await PerformanceTestHelper.measureTemplateGeneration(
        ['generate', 'component', 'WithoutMcpComponent', '--platform=react'],
        testProjectPath,
        5
      );
      
      // With MCP
      const withMcpMetrics = await PerformanceTestHelper.measureTemplateGeneration(
        ['generate', 'component', 'WithMcpComponent', '--platform=react', '--mcp-recommendations'],
        testProjectPath,
        5
      );
      
      // MCP overhead should be reasonable (less than 2x)
      const overhead = withMcpMetrics.generationTime / withoutMcpMetrics.generationTime;
      expect(overhead).toBeLessThan(2.0);
    });

    it('should test MCP response caching effectiveness', async () => {
      // Mock MCP responses for consistent testing
      vi.mocked(McpClient.getComponentSpecification).mockResolvedValue({
        name: 'TestComponent',
        props: { title: { type: 'string' } }
      });
      
      // First call (should cache)
      const firstCallTime = performance.now();
      await McpClient.getComponentSpecification('TestComponent');
      const firstDuration = performance.now() - firstCallTime;
      
      // Second call (should use cache)
      const secondCallTime = performance.now();
      await McpClient.getComponentSpecification('TestComponent');
      const secondDuration = performance.now() - secondCallTime;
      
      // Cached call should be significantly faster
      expect(secondDuration).toBeLessThan(firstDuration * 0.1); // 90% faster
    });

    it('should handle MCP timeout gracefully without affecting performance', async () => {
      // Mock slow MCP response
      vi.mocked(McpClient.getComponentSpecification).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(null), 10000))
      );
      
      const metrics = await PerformanceTestHelper.measureTemplateGeneration(
        ['generate', 'component', 'TimeoutComponent', '--mcp-recommendations', '--mcp-timeout=2000'],
        testProjectPath,
        1
      );
      
      // Should fallback quickly and not wait for full timeout
      expect(metrics.generationTime).toBeLessThan(5000); // 5 seconds including fallback
    });

    it('should test MCP batch request performance', async () => {
      const componentNames = ['Button', 'Input', 'Card', 'Modal', 'Table'];
      
      const startTime = performance.now();
      
      // Mock batch responses
      vi.mocked(McpClient.getComponentSpecifications).mockResolvedValue(
        componentNames.reduce((acc, name) => {
          acc[name] = { name, props: {} };
          return acc;
        }, {} as any)
      );
      
      await McpClient.getComponentSpecifications(componentNames);
      const batchTime = performance.now() - startTime;
      
      // Batch request should be faster than individual requests
      expect(batchTime).toBeLessThan(1000); // 1 second for batch
    });
  });

  describe('Story 5.3.4: Template Compilation Performance', () => {
    it('should compile templates efficiently', async () => {
      const templateOrchestrator = new TemplateOrchestrator();
      const compilationTimes: number[] = [];
      
      for (let i = 0; i < 10; i++) {
        const template = {
          name: `Template${i}`,
          content: `
            <div className="component">
              <h1>{{title}}</h1>
              <p>{{description}}</p>
              {{#each items}}
                <div key="{{@index}}">{{this}}</div>
              {{/each}}
            </div>
          `,
          context: {
            title: `Template ${i}`,
            description: 'Test description',
            items: Array.from({ length: 10 }, (_, j) => `Item ${j}`)
          }
        };
        
        const startTime = performance.now();
        await templateOrchestrator.compileTemplate(template);
        compilationTimes.push(performance.now() - startTime);
      }
      
      const averageCompilationTime = compilationTimes.reduce((sum, time) => sum + time, 0) / compilationTimes.length;
      expect(averageCompilationTime).toBeLessThan(100); // Average under 100ms
    });

    it('should handle template compilation parallelization', async () => {
      const templateOrchestrator = new TemplateOrchestrator();
      const templates = Array.from({ length: 5 }, (_, i) => ({
        name: `ParallelTemplate${i}`,
        content: `<div>Template ${i}</div>`,
        context: { index: i }
      }));
      
      const startTime = performance.now();
      await Promise.all(templates.map(template => 
        templateOrchestrator.compileTemplate(template)
      ));
      const parallelTime = performance.now() - startTime;
      
      // Parallel compilation should be efficient
      expect(parallelTime).toBeLessThan(500); // 500ms for 5 templates in parallel
    });

    it('should optimize template compilation with caching', async () => {
      const templateOrchestrator = new TemplateOrchestrator();
      const template = {
        name: 'CachedTemplate',
        content: '<div>{{content}}</div>',
        context: { content: 'Test content' }
      };
      
      // First compilation (should cache)
      const firstTime = performance.now();
      await templateOrchestrator.compileTemplate(template);
      const firstDuration = performance.now() - firstTime;
      
      // Second compilation (should use cache)
      const secondTime = performance.now();
      await templateOrchestrator.compileTemplate(template);
      const secondDuration = performance.now() - secondTime;
      
      // Cached compilation should be faster
      expect(secondDuration).toBeLessThan(firstDuration * 0.5); // 50% faster
    });
  });

  describe('Story 5.3.5: Template Validation Performance', () => {
    it('should validate templates efficiently', async () => {
      const validationTimes: number[] = [];
      
      for (let i = 0; i < 20; i++) {
        const componentPath = path.join(testProjectPath, `src/components/Component${i}.tsx`);
        await fs.ensureFile(componentPath);
        await fs.writeFile(componentPath, `
          export const Component${i} = (): JSX.Element => {
            return <div>Component ${i}</div>;
          };
        `);
        
        const startTime = performance.now();
        await execa('xaheen', ['validate', 'component', `Component${i}`], { cwd: testProjectPath });
        validationTimes.push(performance.now() - startTime);
      }
      
      const averageValidationTime = validationTimes.reduce((sum, time) => sum + time, 0) / validationTimes.length;
      expect(averageValidationTime).toBeLessThan(1000); // Average under 1 second
    });

    it('should handle batch validation efficiently', async () => {
      // Create multiple components
      const componentCount = 10;
      for (let i = 0; i < componentCount; i++) {
        await execa('xaheen', [
          'generate', 'component', `BatchComponent${i}`, '--platform=react'
        ], { cwd: testProjectPath });
      }
      
      const startTime = performance.now();
      await execa('xaheen', ['validate', 'all'], { cwd: testProjectPath });
      const batchValidationTime = performance.now() - startTime;
      
      // Batch validation should be efficient
      expect(batchValidationTime).toBeLessThan(componentCount * 500); // Less than 500ms per component
    });

    it('should optimize validation with incremental checks', async () => {
      // Generate a component
      await execa('xaheen', [
        'generate', 'component', 'IncrementalComponent', '--platform=react'
      ], { cwd: testProjectPath });
      
      // First validation
      const firstTime = performance.now();
      await execa('xaheen', ['validate', 'component', 'IncrementalComponent'], { cwd: testProjectPath });
      const firstDuration = performance.now() - firstTime;
      
      // Second validation (unchanged file)
      const secondTime = performance.now();
      await execa('xaheen', ['validate', 'component', 'IncrementalComponent'], { cwd: testProjectPath });
      const secondDuration = performance.now() - secondTime;
      
      // Second validation should be faster (incremental)
      expect(secondDuration).toBeLessThan(firstDuration * 0.3); // 70% faster
    });
  });

  describe('Story 5.3.6: Template Caching Effectiveness', () => {
    it('should demonstrate cache hit rate improvement', async () => {
      await cacheAnalyzer.startMonitoring();
      
      // Generate same type of components multiple times
      for (let i = 0; i < 10; i++) {
        await execa('xaheen', [
          'generate', 'component', `CacheTestComponent${i}`, '--platform=react'
        ], { cwd: testProjectPath });
      }
      
      const cacheStats = await cacheAnalyzer.getStats();
      expect(cacheStats.hitRate).toBeGreaterThan(0.7); // 70% hit rate
      expect(cacheStats.totalHits).toBeGreaterThan(5);
    });

    it('should measure cache performance impact', async () => {
      // Clear cache
      await TemplateCache.clear();
      
      // Generate without cache
      const withoutCacheMetrics = await PerformanceTestHelper.measureTemplateGeneration(
        ['generate', 'component', 'NoCacheComponent', '--platform=react', '--no-cache'],
        testProjectPath,
        1
      );
      
      // Generate with cache
      const withCacheMetrics = await PerformanceTestHelper.measureTemplateGeneration(
        ['generate', 'component', 'CacheComponent', '--platform=react'],
        testProjectPath,
        1
      );
      
      // Second generation should be faster due to cache
      const secondCacheMetrics = await PerformanceTestHelper.measureTemplateGeneration(
        ['generate', 'component', 'CacheComponent2', '--platform=react'],
        testProjectPath,
        1
      );
      
      expect(secondCacheMetrics.generationTime).toBeLessThan(withoutCacheMetrics.generationTime);
    });

    it('should handle cache eviction efficiently', async () => {
      // Fill cache to capacity
      for (let i = 0; i < 100; i++) {
        await TemplateCache.set(`template_${i}`, { content: `Template ${i}` });
      }
      
      const startTime = performance.now();
      
      // Add more items (should trigger eviction)
      for (let i = 100; i < 110; i++) {
        await TemplateCache.set(`template_${i}`, { content: `Template ${i}` });
      }
      
      const evictionTime = performance.now() - startTime;
      expect(evictionTime).toBeLessThan(1000); // Eviction should be fast
    });

    it('should optimize cache memory usage', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Add many cached items
      for (let i = 0; i < 1000; i++) {
        await TemplateCache.set(`large_template_${i}`, {
          content: 'x'.repeat(1000), // 1KB per template
          metadata: { size: 1000, type: 'component' }
        });
      }
      
      const afterCacheMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = afterCacheMemory - initialMemory;
      
      // Memory increase should be reasonable (less than 2x the data size)
      expect(memoryIncrease).toBeLessThan(2 * 1000 * 1000); // Less than 2MB for 1MB of data
    });
  });

  describe('Story 5.3.7: Memory Usage During Template Generation', () => {
    it('should maintain reasonable memory usage during generation', async () => {
      const memoryTest = await PerformanceTestHelper.runMemoryStressTest(
        ['generate', 'component', 'MemoryTestComponent', '--platform=react'],
        testProjectPath,
        30000 // 30 seconds
      );
      
      const memoryGrowth = memoryTest.finalMemory.heapUsed - memoryTest.memoryStats[0].memory.heapUsed;
      const maxMemoryUsed = Math.max(...memoryTest.memoryStats.map(stat => stat.memory.heapUsed));
      
      // Memory growth should be bounded
      expect(memoryGrowth).toBeLessThan(500 * 1024 * 1024); // Less than 500MB growth
      expect(maxMemoryUsed).toBeLessThan(1024 * 1024 * 1024); // Less than 1GB peak
    });

    it('should handle memory cleanup after generation', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Generate many components
      for (let i = 0; i < 50; i++) {
        await execa('xaheen', [
          'generate', 'component', `CleanupTestComponent${i}`, '--platform=react'
        ], { cwd: testProjectPath });
      }
      
      // Force garbage collection
      if (global.gc) {
        global.gc();
        global.gc(); // Run twice to ensure cleanup
      }
      
      // Wait for cleanup
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryRetained = finalMemory - initialMemory;
      
      // Should not retain excessive memory
      expect(memoryRetained).toBeLessThan(200 * 1024 * 1024); // Less than 200MB retained
    });

    it('should handle concurrent generation memory usage', async () => {
      const scalabilityResult = await PerformanceTestHelper.runConcurrentGeneration(
        ['generate', 'component', 'ConcurrentComponent', '--platform=react'],
        testProjectPath,
        5, // 5 concurrent
        10 // 10 iterations
      );
      
      expect(scalabilityResult.successRate).toBeGreaterThan(95); // 95% success rate
      expect(scalabilityResult.errorRate).toBeLessThan(5); // Less than 5% errors
      expect(scalabilityResult.memoryPeak).toBeLessThan(2 * 1024 * 1024 * 1024); // Less than 2GB peak
    });

    it('should detect memory leaks during extended operation', async () => {
      const memorySnapshots: number[] = [];
      const iterations = 100;
      
      for (let i = 0; i < iterations; i++) {
        await execa('xaheen', [
          'generate', 'component', `LeakTestComponent${i}`, '--platform=react'
        ], { cwd: testProjectPath });
        
        if (i % 10 === 0) {
          if (global.gc) global.gc();
          memorySnapshots.push(process.memoryUsage().heapUsed);
        }
      }
      
      // Check for consistent memory growth (potential leak)
      const memoryGrowthRate = (memorySnapshots[memorySnapshots.length - 1] - memorySnapshots[0]) / memorySnapshots.length;
      
      // Memory growth rate should be minimal (no significant leaks)
      expect(memoryGrowthRate).toBeLessThan(1024 * 1024); // Less than 1MB per 10 operations
    });
  });

  describe('Scalability Testing', () => {
    it('should handle high-concurrency template generation', async () => {
      const concurrencyLevels = [1, 5, 10, 20];
      const results: ScalabilityTestResult[] = [];
      
      for (const concurrency of concurrencyLevels) {
        const result = await PerformanceTestHelper.runConcurrentGeneration(
          ['generate', 'component', 'ScalabilityTestComponent', '--platform=react'],
          testProjectPath,
          concurrency,
          5 // 5 iterations per concurrency level
        );
        results.push(result);
      }
      
      // Verify scalability characteristics
      results.forEach(result => {
        expect(result.successRate).toBeGreaterThan(90); // 90% success rate
        expect(result.errorRate).toBeLessThan(10); // Less than 10% errors
      });
      
      // Throughput should scale reasonably with concurrency
      const throughputImprovement = results[2].throughput / results[0].throughput; // 10 vs 1 concurrent
      expect(throughputImprovement).toBeGreaterThan(2); // At least 2x improvement
    });

    it('should maintain performance under load', async () => {
      const loadTestDuration = 60000; // 1 minute
      const targetThroughput = 2; // 2 generations per second
      
      const startTime = performance.now();
      let operationsCompleted = 0;
      const errors: Error[] = [];
      
      while (performance.now() - startTime < loadTestDuration) {
        try {
          await execa('xaheen', [
            'generate', 'component', `LoadTestComponent${operationsCompleted}`, '--platform=react'
          ], { cwd: testProjectPath });
          operationsCompleted++;
        } catch (error) {
          errors.push(error as Error);
        }
      }
      
      const actualThroughput = (operationsCompleted / loadTestDuration) * 1000;
      const errorRate = (errors.length / (operationsCompleted + errors.length)) * 100;
      
      expect(actualThroughput).toBeGreaterThan(targetThroughput * 0.8); // Within 20% of target
      expect(errorRate).toBeLessThan(5); // Less than 5% error rate
    });
  });
});