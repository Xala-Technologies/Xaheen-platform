/**
 * Phase 2 Performance Tests - Framework Scaffolding Benchmarks
 * Measures scaffolding performance across all frameworks
 */

import { describe, it, expect } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import tmp from 'tmp';
import { performance } from 'perf_hooks';
import { runMatrixTests, createMatrixTest } from '../utils/matrix-runner';
import { scaffoldProject } from '../utils/framework-helpers';

// Promisify tmp directory creation
const createTmpDir = () => new Promise<string>((resolve, reject) => {
  tmp.dir({ unsafeCleanup: true }, (err, dirPath) => {
    if (err) reject(err);
    else resolve(dirPath);
  });
});

interface BenchmarkResult {
  readonly framework: string;
  readonly dryRunTime: number;
  readonly scaffoldTime: number;
  readonly filesGenerated: number;
  readonly directorySize: number;
}

const benchmarkResults: BenchmarkResult[] = [];

const performanceTests = [
  createMatrixTest(
    'should scaffold within performance thresholds',
    async (config) => {
      const testDir = await createTmpDir();

      try {
        process.chdir(testDir);
        const projectName = `perf-${config.name}`;

        // Benchmark dry-run performance
        console.log(`Benchmarking ${config.displayName} dry-run...`);
        const dryRunStart = performance.now();
        
        await scaffoldProject(
          `${projectName}-dryrun`,
          config.preset,
          testDir,
          { typescript: true, dryRun: true }
        );
        
        const dryRunTime = performance.now() - dryRunStart;

        // Benchmark actual scaffolding
        console.log(`Benchmarking ${config.displayName} scaffolding...`);
        const scaffoldStart = performance.now();
        
        const { projectPath } = await scaffoldProject(
          projectName,
          config.preset,
          testDir,
          { typescript: true }
        );
        
        const scaffoldTime = performance.now() - scaffoldStart;

        // Measure directory size and file count
        const { fileCount, totalSize } = await measureDirectorySize(projectPath);

        const result: BenchmarkResult = {
          framework: config.displayName,
          dryRunTime,
          scaffoldTime,
          filesGenerated: fileCount,
          directorySize: totalSize,
        };

        benchmarkResults.push(result);

        console.log(`${config.displayName} Performance:`, {
          'Dry-run': `${dryRunTime.toFixed(2)}ms`,
          'Scaffolding': `${scaffoldTime.toFixed(2)}ms`,
          'Files': fileCount,
          'Size': `${(totalSize / 1024).toFixed(2)}KB`,
        });

        // Performance assertions
        expect(dryRunTime).toBeLessThan(1000); // < 1 second for dry-run
        expect(scaffoldTime).toBeLessThan(5000); // < 5 seconds for scaffolding
        expect(fileCount).toBeGreaterThan(5); // At least 5 files generated
        expect(totalSize).toBeGreaterThan(1000); // At least 1KB of content
      } finally {
        process.chdir('/tmp');
        await fs.rm(testDir, { recursive: true, force: true }).catch(() => {});
      }
    },
    30000 // 30 second timeout
  ),

  createMatrixTest(
    'should have reasonable memory usage during scaffolding',
    async (config) => {
      const testDir = await createTmpDir();

      try {
        process.chdir(testDir);
        const projectName = `memory-${config.name}`;

        // Measure memory before scaffolding
        const memBefore = process.memoryUsage();

        await scaffoldProject(
          projectName,
          config.preset,
          testDir,
          { typescript: true }
        );

        // Force garbage collection if available
        if (global.gc) {
          global.gc();
        }

        // Measure memory after scaffolding
        const memAfter = process.memoryUsage();

        const heapUsedDiff = memAfter.heapUsed - memBefore.heapUsed;
        const heapUsedMB = heapUsedDiff / 1024 / 1024;

        console.log(`${config.displayName} Memory Usage:`, {
          'Heap Used': `${heapUsedMB.toFixed(2)}MB`,
          'RSS': `${(memAfter.rss / 1024 / 1024).toFixed(2)}MB`,
        });

        // Memory usage should be reasonable (< 100MB heap increase)
        expect(heapUsedMB).toBeLessThan(100);
      } finally {
        process.chdir('/tmp');
        await fs.rm(testDir, { recursive: true, force: true }).catch(() => {});
      }
    },
    30000 // 30 second timeout
  ),
];

async function measureDirectorySize(dirPath: string): Promise<{
  fileCount: number;
  totalSize: number;
}> {
  let fileCount = 0;
  let totalSize = 0;

  async function traverse(currentPath: string): Promise<void> {
    const entries = await fs.readdir(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        // Skip node_modules and other large directories
        if (!['node_modules', '.git', 'dist', 'build'].includes(entry.name)) {
          await traverse(fullPath);
        }
      } else {
        fileCount++;
        try {
          const stats = await fs.stat(fullPath);
          totalSize += stats.size;
        } catch {
          // Ignore files we can't read
        }
      }
    }
  }

  await traverse(dirPath);
  return { fileCount, totalSize };
}

// Run the performance tests
runMatrixTests('Phase 2: Framework Performance Benchmarks', performanceTests);

// Additional test to compare all frameworks
describe('Phase 2: Cross-Framework Performance Comparison', () => {
  it('should generate performance comparison report', async () => {
    // Wait for all matrix tests to complete
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (benchmarkResults.length === 0) {
      console.warn('No benchmark results available for comparison');
      return;
    }

    // Sort by scaffolding time
    const sortedResults = [...benchmarkResults].sort((a, b) => a.scaffoldTime - b.scaffoldTime);

    console.log('\n=== Framework Performance Comparison ===');
    console.table(sortedResults.map(result => ({
      Framework: result.framework,
      'Dry-run (ms)': result.dryRunTime.toFixed(2),
      'Scaffolding (ms)': result.scaffoldTime.toFixed(2),
      'Files': result.filesGenerated,
      'Size (KB)': (result.directorySize / 1024).toFixed(2),
    })));

    // Find fastest and slowest
    const fastest = sortedResults[0];
    const slowest = sortedResults[sortedResults.length - 1];

    console.log(`\nFastest: ${fastest.framework} (${fastest.scaffoldTime.toFixed(2)}ms)`);
    console.log(`Slowest: ${slowest.framework} (${slowest.scaffoldTime.toFixed(2)}ms)`);
    console.log(`Performance difference: ${((slowest.scaffoldTime - fastest.scaffoldTime) / fastest.scaffoldTime * 100).toFixed(1)}%`);

    // Performance regression detection
    const avgTime = sortedResults.reduce((sum, r) => sum + r.scaffoldTime, 0) / sortedResults.length;
    const maxAcceptableTime = avgTime * 2; // 2x average is the threshold

    for (const result of sortedResults) {
      if (result.scaffoldTime > maxAcceptableTime) {
        console.warn(`⚠️  ${result.framework} scaffolding time (${result.scaffoldTime.toFixed(2)}ms) exceeds threshold (${maxAcceptableTime.toFixed(2)}ms)`);
      }
    }

    // Verify we have results for all expected frameworks
    const expectedFrameworks = ['Vue 3 + Vite', 'SvelteKit', 'Angular', 'Solid + Vite', 'Remix'];
    const actualFrameworks = benchmarkResults.map(r => r.framework);
    const missingFrameworks = expectedFrameworks.filter(f => !actualFrameworks.includes(f));

    if (missingFrameworks.length > 0) {
      console.warn(`Missing benchmark results for: ${missingFrameworks.join(', ')}`);
    }

    expect(benchmarkResults.length).toBeGreaterThan(0);
  });

  it('should maintain consistent performance standards', () => {
    if (benchmarkResults.length === 0) return;

    for (const result of benchmarkResults) {
      // Performance standards
      expect(result.dryRunTime).toBeLessThan(1000); // < 1s for dry-run
      expect(result.scaffoldTime).toBeLessThan(10000); // < 10s for scaffolding
      expect(result.filesGenerated).toBeGreaterThan(3); // At least 3 files
      expect(result.directorySize).toBeGreaterThan(100); // At least 100 bytes
    }
  });
});