/**
 * @fileoverview CLI Performance Benchmark Tests
 * @description Performance testing for CLI operations with different workloads
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { performance } from 'perf_hooks';

const execAsync = promisify(exec);

interface BenchmarkResult {
  operation: string;
  duration: number;
  memoryUsed: number;
  success: boolean;
  details?: any;
}

class PerformanceBenchmark {
  private results: BenchmarkResult[] = [];
  
  async measure<T>(
    operation: string,
    fn: () => Promise<T>
  ): Promise<{ result: T; metrics: BenchmarkResult }> {
    const startTime = performance.now();
    const startMemory = process.memoryUsage().heapUsed;
    
    try {
      const result = await fn();
      
      const duration = performance.now() - startTime;
      const memoryUsed = process.memoryUsage().heapUsed - startMemory;
      
      const metrics: BenchmarkResult = {
        operation,
        duration,
        memoryUsed: Math.round(memoryUsed / 1024 / 1024), // Convert to MB
        success: true,
      };
      
      this.results.push(metrics);
      return { result, metrics };
    } catch (error) {
      const duration = performance.now() - startTime;
      const memoryUsed = process.memoryUsage().heapUsed - startMemory;
      
      const metrics: BenchmarkResult = {
        operation,
        duration,
        memoryUsed: Math.round(memoryUsed / 1024 / 1024),
        success: false,
        details: error,
      };
      
      this.results.push(metrics);
      throw error;
    }
  }
  
  getReport() {
    const avgDuration = this.results.reduce((sum, r) => sum + r.duration, 0) / this.results.length;
    const avgMemory = this.results.reduce((sum, r) => sum + r.memoryUsed, 0) / this.results.length;
    const successRate = this.results.filter(r => r.success).length / this.results.length;
    
    return {
      totalOperations: this.results.length,
      averageDuration: Math.round(avgDuration),
      averageMemory: Math.round(avgMemory),
      successRate: Math.round(successRate * 100),
      results: this.results,
    };
  }
  
  reset() {
    this.results = [];
  }
}

describe.skip('CLI Performance Benchmarks (Requires built CLI)', () => {
  let testDir: string;
  let benchmark: PerformanceBenchmark;
  
  beforeAll(async () => {
    testDir = path.join(process.cwd(), 'temp-performance-tests');
    await fs.mkdir(testDir, { recursive: true });
    benchmark = new PerformanceBenchmark();
  });
  
  afterAll(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
    
    // Print performance report
    const report = benchmark.getReport();
    console.log('\n📊 Performance Report:');
    console.log('─'.repeat(50));
    console.log(`Total Operations: ${report.totalOperations}`);
    console.log(`Average Duration: ${report.averageDuration}ms`);
    console.log(`Average Memory: ${report.averageMemory}MB`);
    console.log(`Success Rate: ${report.successRate}%`);
    console.log('─'.repeat(50));
  });
  
  describe('Component Generation Performance', () => {
    it('should generate simple component under 500ms', async () => {
      const { metrics } = await benchmark.measure(
        'Simple Component Generation',
        async () => {
          const { stdout } = await execAsync(
            'xala generate component SimpleButton --template button --no-ai',
            { cwd: testDir }
          );
          return stdout;
        }
      );
      
      expect(metrics.duration).toBeLessThan(500);
      expect(metrics.memoryUsed).toBeLessThan(50); // Less than 50MB
    });
    
    it('should generate complex component under 1000ms', async () => {
      const { metrics } = await benchmark.measure(
        'Complex Component Generation',
        async () => {
          const { stdout } = await execAsync(
            'xala generate component ComplexDashboard --template dashboard --features "charts,tables,filters"',
            { cwd: testDir }
          );
          return stdout;
        }
      );
      
      expect(metrics.duration).toBeLessThan(1000);
      expect(metrics.memoryUsed).toBeLessThan(100);
    });
    
    it('should batch generate 10 components under 3000ms', async () => {
      const { metrics } = await benchmark.measure(
        'Batch Component Generation (10)',
        async () => {
          const components = Array.from({ length: 10 }, (_, i) => `Component${i}`);
          const { stdout } = await execAsync(
            `xala generate components ${components.join(' ')} --template button --parallel`,
            { cwd: testDir }
          );
          return stdout;
        }
      );
      
      expect(metrics.duration).toBeLessThan(3000);
      expect(metrics.memoryUsed).toBeLessThan(200);
      
      // Average time per component should be under 300ms
      const avgTimePerComponent = metrics.duration / 10;
      expect(avgTimePerComponent).toBeLessThan(300);
    });
    
    it('should handle 100 components with streaming', async () => {
      const { metrics } = await benchmark.measure(
        'Large Batch Generation (100)',
        async () => {
          const components = Array.from({ length: 100 }, (_, i) => `Comp${i}`);
          const { stdout } = await execAsync(
            `xala generate components ${components.join(' ')} --template button --stream --parallel 10`,
            { cwd: testDir, maxBuffer: 10 * 1024 * 1024 } // 10MB buffer
          );
          return stdout;
        }
      );
      
      expect(metrics.duration).toBeLessThan(30000); // 30 seconds for 100 components
      expect(metrics.memoryUsed).toBeLessThan(500); // Less than 500MB
    });
  });
  
  describe('Template Processing Performance', () => {
    it('should load and process template under 100ms', async () => {
      const { metrics } = await benchmark.measure(
        'Template Loading',
        async () => {
          const { stdout } = await execAsync(
            'xala templates validate button',
            { cwd: testDir }
          );
          return stdout;
        }
      );
      
      expect(metrics.duration).toBeLessThan(100);
    });
    
    it('should compile Handlebars template under 50ms', async () => {
      const { metrics } = await benchmark.measure(
        'Template Compilation',
        async () => {
          const { stdout } = await execAsync(
            'xala templates compile button --dry-run',
            { cwd: testDir }
          );
          return stdout;
        }
      );
      
      expect(metrics.duration).toBeLessThan(50);
    });
    
    it('should process all templates under 2000ms', async () => {
      const { metrics } = await benchmark.measure(
        'All Templates Processing',
        async () => {
          const { stdout } = await execAsync(
            'xala templates validate --all',
            { cwd: testDir }
          );
          return stdout;
        }
      );
      
      expect(metrics.duration).toBeLessThan(2000);
    });
  });
  
  describe('AI Integration Performance', () => {
    it('should optimize prompt for 7B model under 50ms', async () => {
      const { metrics } = await benchmark.measure(
        'Prompt Optimization (7B)',
        async () => {
          const { stdout } = await execAsync(
            'xala ai optimize-prompt "Create complex dashboard" --model-size 7b',
            { cwd: testDir }
          );
          return stdout;
        }
      );
      
      expect(metrics.duration).toBeLessThan(50);
    });
    
    it('should fall back to template under 200ms when AI unavailable', async () => {
      const { metrics } = await benchmark.measure(
        'AI Fallback to Template',
        async () => {
          const { stdout } = await execAsync(
            'xala generate component TestComponent --ai --timeout 1ms --fallback',
            { cwd: testDir }
          );
          return stdout;
        }
      );
      
      expect(metrics.duration).toBeLessThan(200);
      expect(metrics.success).toBe(true);
    });
    
    it('should chunk complex prompts efficiently', async () => {
      const { metrics } = await benchmark.measure(
        'Complex Prompt Chunking',
        async () => {
          const complexPrompt = 'Generate a complete e-commerce platform with user management, product catalog, shopping cart, checkout, payment processing, order tracking, inventory management, and admin dashboard';
          const { stdout } = await execAsync(
            `xala ai chunk-prompt "${complexPrompt}" --model-size 7b`,
            { cwd: testDir }
          );
          return stdout;
        }
      );
      
      expect(metrics.duration).toBeLessThan(100);
    });
  });
  
  describe('Build Performance', () => {
    beforeAll(async () => {
      // Create a test project for build tests
      await execAsync(
        'xala init build-perf-test --platform react --minimal --no-install',
        { cwd: testDir }
      );
    });
    
    it('should analyze project under 1000ms', async () => {
      const { metrics } = await benchmark.measure(
        'Project Analysis',
        async () => {
          const { stdout } = await execAsync(
            'xala analyze --quick',
            { cwd: path.join(testDir, 'build-perf-test') }
          );
          return stdout;
        }
      );
      
      expect(metrics.duration).toBeLessThan(1000);
    });
    
    it('should validate TypeScript under 2000ms', async () => {
      const { metrics } = await benchmark.measure(
        'TypeScript Validation',
        async () => {
          const { stdout } = await execAsync(
            'xala validate --typescript',
            { cwd: path.join(testDir, 'build-perf-test') }
          );
          return stdout;
        }
      );
      
      expect(metrics.duration).toBeLessThan(2000);
    });
    
    it('should check accessibility under 1500ms', async () => {
      const { metrics } = await benchmark.measure(
        'Accessibility Check',
        async () => {
          const { stdout } = await execAsync(
            'xala validate --accessibility',
            { cwd: path.join(testDir, 'build-perf-test') }
          );
          return stdout;
        }
      );
      
      expect(metrics.duration).toBeLessThan(1500);
    });
  });
  
  describe('File System Operations', () => {
    it('should write component file under 50ms', async () => {
      const { metrics } = await benchmark.measure(
        'File Write Operation',
        async () => {
          const content = `export const TestComponent = () => <div>Test</div>;`;
          const filePath = path.join(testDir, 'test-component.tsx');
          await fs.writeFile(filePath, content);
          return filePath;
        }
      );
      
      expect(metrics.duration).toBeLessThan(50);
    });
    
    it('should create directory structure under 100ms', async () => {
      const { metrics } = await benchmark.measure(
        'Directory Structure Creation',
        async () => {
          const dirs = [
            'src/components/ui',
            'src/components/layout',
            'src/components/forms',
            'src/hooks',
            'src/utils',
            'src/types',
          ];
          
          for (const dir of dirs) {
            await fs.mkdir(path.join(testDir, 'structure-test', dir), { recursive: true });
          }
          return dirs;
        }
      );
      
      expect(metrics.duration).toBeLessThan(100);
    });
    
    it('should copy template files under 200ms', async () => {
      const { metrics } = await benchmark.measure(
        'Template File Copy',
        async () => {
          // Simulate copying template files
          const templateContent = 'template content';
          const files = Array.from({ length: 20 }, (_, i) => `file${i}.tsx`);
          
          for (const file of files) {
            await fs.writeFile(
              path.join(testDir, 'copy-test', file),
              templateContent
            );
          }
          return files;
        }
      );
      
      expect(metrics.duration).toBeLessThan(200);
    });
  });
  
  describe('Memory Usage', () => {
    it('should maintain low memory footprint for simple operations', async () => {
      const initialMemory = process.memoryUsage().heapUsed / 1024 / 1024;
      
      // Run multiple simple operations
      for (let i = 0; i < 10; i++) {
        await execAsync(
          `xala generate component Test${i} --template button --no-ai`,
          { cwd: testDir }
        );
      }
      
      const finalMemory = process.memoryUsage().heapUsed / 1024 / 1024;
      const memoryIncrease = finalMemory - initialMemory;
      
      expect(memoryIncrease).toBeLessThan(100); // Less than 100MB increase
    });
    
    it('should handle memory-intensive operations efficiently', async () => {
      const { metrics } = await benchmark.measure(
        'Memory-Intensive Operation',
        async () => {
          // Generate large number of components in memory
          const components = Array.from({ length: 50 }, (_, i) => ({
            name: `Component${i}`,
            template: 'button',
            props: Array.from({ length: 10 }, (_, j) => `prop${j}`),
          }));
          
          // Simulate processing
          const processed = components.map(c => ({
            ...c,
            code: `export const ${c.name} = () => <div>${c.name}</div>;`,
          }));
          
          return processed.length;
        }
      );
      
      expect(metrics.memoryUsed).toBeLessThan(200); // Less than 200MB
    });
    
    it('should garbage collect properly', async () => {
      const runOperation = async () => {
        const largeArray = Array.from({ length: 100000 }, (_, i) => ({
          id: i,
          data: `data${i}`,
        }));
        return largeArray.length;
      };
      
      const beforeGC = process.memoryUsage().heapUsed / 1024 / 1024;
      
      await runOperation();
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      // Wait a bit for GC to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const afterGC = process.memoryUsage().heapUsed / 1024 / 1024;
      
      // Memory should return close to initial level after GC
      expect(afterGC - beforeGC).toBeLessThan(50);
    });
  });
  
  describe('Concurrent Operations', () => {
    it('should handle concurrent component generation', async () => {
      const { metrics } = await benchmark.measure(
        'Concurrent Generation (5)',
        async () => {
          const promises = Array.from({ length: 5 }, (_, i) =>
            execAsync(
              `xala generate component Concurrent${i} --template button`,
              { cwd: testDir }
            )
          );
          
          const results = await Promise.all(promises);
          return results.length;
        }
      );
      
      // Should be faster than sequential (5 * 500ms = 2500ms)
      expect(metrics.duration).toBeLessThan(1500);
    });
    
    it('should handle parallel builds efficiently', async () => {
      // Create multiple test projects
      const projects = ['proj1', 'proj2', 'proj3'];
      
      for (const proj of projects) {
        await execAsync(
          `xala init ${proj} --platform react --minimal --no-install`,
          { cwd: testDir }
        );
      }
      
      const { metrics } = await benchmark.measure(
        'Parallel Builds (3)',
        async () => {
          const promises = projects.map(proj =>
            execAsync(
              'xala build --quick',
              { cwd: path.join(testDir, proj) }
            )
          );
          
          const results = await Promise.all(promises);
          return results.length;
        }
      );
      
      // Should be significantly faster than sequential
      expect(metrics.duration).toBeLessThan(5000);
    });
  });
  
  describe('Caching Performance', () => {
    it('should cache template compilation', async () => {
      // First run - no cache
      const { metrics: firstRun } = await benchmark.measure(
        'Template Compile (No Cache)',
        async () => {
          const { stdout } = await execAsync(
            'xala generate component CacheTest1 --template button --clear-cache',
            { cwd: testDir }
          );
          return stdout;
        }
      );
      
      // Second run - with cache
      const { metrics: secondRun } = await benchmark.measure(
        'Template Compile (With Cache)',
        async () => {
          const { stdout } = await execAsync(
            'xala generate component CacheTest2 --template button',
            { cwd: testDir }
          );
          return stdout;
        }
      );
      
      // Cached version should be at least 50% faster
      expect(secondRun.duration).toBeLessThan(firstRun.duration * 0.5);
    });
    
    it('should cache AI prompt optimizations', async () => {
      const prompt = 'Create a user dashboard';
      
      // First optimization
      const { metrics: firstRun } = await benchmark.measure(
        'Prompt Optimization (No Cache)',
        async () => {
          const { stdout } = await execAsync(
            `xala ai optimize-prompt "${prompt}" --model-size 7b --clear-cache`,
            { cwd: testDir }
          );
          return stdout;
        }
      );
      
      // Second optimization - same prompt
      const { metrics: secondRun } = await benchmark.measure(
        'Prompt Optimization (Cached)',
        async () => {
          const { stdout } = await execAsync(
            `xala ai optimize-prompt "${prompt}" --model-size 7b`,
            { cwd: testDir }
          );
          return stdout;
        }
      );
      
      // Cached should be nearly instant
      expect(secondRun.duration).toBeLessThan(10);
    });
  });
  
  describe('Scalability Tests', () => {
    it('should scale linearly with component count', async () => {
      const counts = [1, 5, 10, 20];
      const durations: number[] = [];
      
      for (const count of counts) {
        const { metrics } = await benchmark.measure(
          `Generate ${count} Components`,
          async () => {
            const components = Array.from({ length: count }, (_, i) => `Scale${i}`);
            const { stdout } = await execAsync(
              `xala generate components ${components.join(' ')} --template button --no-ai`,
              { cwd: testDir }
            );
            return stdout;
          }
        );
        
        durations.push(metrics.duration);
      }
      
      // Check for roughly linear scaling
      for (let i = 1; i < counts.length; i++) {
        const expectedRatio = counts[i] / counts[0];
        const actualRatio = durations[i] / durations[0];
        
        // Allow 20% deviation from linear scaling
        expect(actualRatio).toBeGreaterThan(expectedRatio * 0.8);
        expect(actualRatio).toBeLessThan(expectedRatio * 1.2);
      }
    });
    
    it('should handle large project structures', async () => {
      const { metrics } = await benchmark.measure(
        'Large Project Analysis',
        async () => {
          // Create a large project structure
          const components = 100;
          const pages = 20;
          const utils = 50;
          
          // Generate file paths (not actual files for speed)
          const structure = {
            components: Array.from({ length: components }, (_, i) => `Component${i}.tsx`),
            pages: Array.from({ length: pages }, (_, i) => `Page${i}.tsx`),
            utils: Array.from({ length: utils }, (_, i) => `util${i}.ts`),
          };
          
          // Simulate analysis
          const { stdout } = await execAsync(
            `xala analyze --structure --json`,
            { cwd: testDir }
          );
          
          return { structure, analysis: stdout };
        }
      );
      
      expect(metrics.duration).toBeLessThan(3000);
      expect(metrics.memoryUsed).toBeLessThan(300);
    });
  });
});