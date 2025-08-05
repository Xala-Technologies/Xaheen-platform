/**
 * Phase 1 Performance Benchmarks - Scaffolding Performance
 * Measures performance of scaffold operations
 */

import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest';
import { performance } from 'perf_hooks';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import tmp from 'tmp';
import { execa } from 'execa';
import { cpus, totalmem, freemem } from 'os';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI_PATH = path.resolve(__dirname, '../../../dist/index.js');

// Performance thresholds (in milliseconds)
const PERFORMANCE_THRESHOLDS = {
  dryRun: 500,        // < 500ms for dry-run
  fullScaffold: 2000, // < 2s for full scaffold
  minimalProject: 1000, // < 1s for minimal project
  complexProject: 3000, // < 3s for complex project with many features
};

// Helper to create temp directory
const createTmpDir = () => new Promise<string>((resolve, reject) => {
  tmp.dir({ unsafeCleanup: true }, (err, dirPath) => {
    if (err) reject(err);
    else resolve(dirPath);
  });
});

// Helper to measure execution time
async function measureExecutionTime<T>(
  fn: () => Promise<T>
): Promise<{ result: T; duration: number }> {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  return { result, duration: end - start };
}

// Helper to get system info
function getSystemInfo() {
  return {
    cpus: cpus().length,
    cpuModel: cpus()[0]?.model || 'Unknown',
    totalMemory: Math.round(totalmem() / 1024 / 1024 / 1024), // GB
    freeMemory: Math.round(freemem() / 1024 / 1024 / 1024), // GB
    platform: process.platform,
    nodeVersion: process.version,
  };
}

describe('Phase 1: Scaffolding Performance Benchmarks', () => {
  let testDir: string;

  beforeAll(async () => {
    // Ensure CLI is built
    console.log('Building CLI...');
    await execa('bun', ['run', 'build'], {
      cwd: path.resolve(__dirname, '../../..'),
      stdio: 'inherit'
    });

    // Log system info
    console.log('\nSystem Information:');
    const sysInfo = getSystemInfo();
    console.log(`  CPUs: ${sysInfo.cpus}x ${sysInfo.cpuModel}`);
    console.log(`  Memory: ${sysInfo.freeMemory}GB / ${sysInfo.totalMemory}GB`);
    console.log(`  Platform: ${sysInfo.platform}`);
    console.log(`  Node: ${sysInfo.nodeVersion}\n`);
  });

  beforeEach(async () => {
    testDir = await createTmpDir();
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true }).catch(() => {});
  });

  describe('Dry-Run Performance', () => {
    it('should complete dry-run in less than 500ms', async () => {
      const measurements: number[] = [];
      const iterations = 5;

      // Run multiple iterations for more accurate measurement
      for (let i = 0; i < iterations; i++) {
        const { duration } = await measureExecutionTime(async () => {
          const projectName = `dry-run-perf-${i}`;
          
          return await execa('node', [
            CLI_PATH,
            'project',
            'create',
            projectName,
            '--preset=nextjs',
            '--dry-run'
          ], {
            cwd: testDir,
            env: { XAHEEN_NO_BANNER: 'true' }
          });
        });

        measurements.push(duration);
        console.log(`  Iteration ${i + 1}: ${duration.toFixed(2)}ms`);
      }

      // Calculate statistics
      const avgDuration = measurements.reduce((a, b) => a + b, 0) / measurements.length;
      const minDuration = Math.min(...measurements);
      const maxDuration = Math.max(...measurements);

      console.log(`\n  Average: ${avgDuration.toFixed(2)}ms`);
      console.log(`  Min: ${minDuration.toFixed(2)}ms`);
      console.log(`  Max: ${maxDuration.toFixed(2)}ms`);

      // Assert average is within threshold
      expect(avgDuration).toBeLessThan(PERFORMANCE_THRESHOLDS.dryRun);
    });

    it('should handle multiple concurrent dry-runs efficiently', async () => {
      const concurrentRuns = 5;
      const projectNames = Array.from({ length: concurrentRuns }, (_, i) => `concurrent-dry-${i}`);

      const { duration } = await measureExecutionTime(async () => {
        return await Promise.all(
          projectNames.map(name =>
            execa('node', [
              CLI_PATH,
              'project',
              'create',
              name,
              '--preset=nextjs',
              '--dry-run'
            ], {
              cwd: testDir,
              env: { XAHEEN_NO_BANNER: 'true' }
            })
          )
        );
      });

      console.log(`  ${concurrentRuns} concurrent dry-runs: ${duration.toFixed(2)}ms`);
      console.log(`  Average per run: ${(duration / concurrentRuns).toFixed(2)}ms`);

      // Should not take much longer than sequential runs
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.dryRun * concurrentRuns * 0.5);
    });
  });

  describe('Full Scaffold Performance', () => {
    it('should complete minimal Next.js scaffold in less than 2s', async () => {
      const { duration } = await measureExecutionTime(async () => {
        const projectName = 'minimal-nextjs-perf';
        
        return await execa('node', [
          CLI_PATH,
          'project',
          'create',
          projectName,
          '--preset=nextjs',
          '--minimal',
          '--no-install',
          '--skip-git'
        ], {
          cwd: testDir,
          env: { XAHEEN_NO_BANNER: 'true' }
        });
      });

      console.log(`  Minimal scaffold: ${duration.toFixed(2)}ms`);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.fullScaffold);

      // Verify files were created
      const projectPath = path.join(testDir, 'minimal-nextjs-perf');
      const files = await fs.readdir(projectPath);
      expect(files.length).toBeGreaterThan(0);
    });

    it('should scale efficiently with project complexity', async () => {
      const configurations = [
        { 
          name: 'minimal',
          flags: ['--minimal'],
          expectedFiles: 10
        },
        { 
          name: 'standard',
          flags: ['--typescript'],
          expectedFiles: 15
        },
        { 
          name: 'full-featured',
          flags: ['--typescript', '--tailwind', '--eslint', '--prettier'],
          expectedFiles: 20
        }
      ];

      const results: any[] = [];

      for (const config of configurations) {
        const { duration } = await measureExecutionTime(async () => {
          const projectName = `${config.name}-perf-test`;
          
          return await execa('node', [
            CLI_PATH,
            'project',
            'create',
            projectName,
            '--preset=nextjs',
            '--no-install',
            '--skip-git',
            ...config.flags
          ], {
            cwd: testDir,
            env: { XAHEEN_NO_BANNER: 'true' }
          });
        });

        // Count generated files
        const projectPath = path.join(testDir, `${config.name}-perf-test`);
        const fileCount = await countFiles(projectPath);

        results.push({
          name: config.name,
          duration,
          fileCount,
          filesPerSecond: (fileCount / duration) * 1000
        });

        console.log(`  ${config.name}: ${duration.toFixed(2)}ms (${fileCount} files)`);
      }

      // Verify performance scales reasonably
      const minimalTime = results.find(r => r.name === 'minimal')?.duration || 0;
      const fullTime = results.find(r => r.name === 'full-featured')?.duration || 0;

      // Full-featured should not take more than 2x minimal time
      expect(fullTime).toBeLessThan(minimalTime * 2);
    });
  });

  describe('File I/O Performance', () => {
    it('should efficiently generate template files', async () => {
      const fileCount = 50; // Generate many files to test I/O
      const projectName = 'io-perf-test';

      // Create a custom scaffold that generates many files
      const { duration } = await measureExecutionTime(async () => {
        await execa('node', [
          CLI_PATH,
          'project',
          'create',
          projectName,
          '--preset=nextjs',
          '--no-install',
          '--skip-git'
        ], {
          cwd: testDir,
          env: { XAHEEN_NO_BANNER: 'true' }
        });

        // Generate additional components
        const projectPath = path.join(testDir, projectName);
        process.chdir(projectPath);

        const componentPromises = Array.from({ length: fileCount }, (_, i) => 
          execa('node', [
            CLI_PATH,
            'generate',
            'component',
            `TestComponent${i}`,
            '--no-interactive'
          ], {
            cwd: projectPath,
            env: { XAHEEN_NO_BANNER: 'true' }
          })
        );

        return await Promise.all(componentPromises);
      });

      const filesPerSecond = (fileCount / duration) * 1000;
      console.log(`  Generated ${fileCount} components in ${duration.toFixed(2)}ms`);
      console.log(`  Rate: ${filesPerSecond.toFixed(2)} files/second`);

      // Should generate at least 10 files per second
      expect(filesPerSecond).toBeGreaterThan(10);
    });
  });

  describe('Memory Usage', () => {
    it('should maintain reasonable memory usage during scaffold', async () => {
      const projectName = 'memory-test';
      const memorySnapshots: number[] = [];

      // Take memory snapshots during execution
      const interval = setInterval(() => {
        if (global.gc) global.gc(); // Force GC if available
        const usage = process.memoryUsage();
        memorySnapshots.push(usage.heapUsed / 1024 / 1024); // MB
      }, 100);

      try {
        await execa('node', [
          CLI_PATH,
          'project',
          'create',
          projectName,
          '--preset=nextjs',
          '--typescript',
          '--no-install',
          '--skip-git'
        ], {
          cwd: testDir,
          env: { XAHEEN_NO_BANNER: 'true' }
        });
      } finally {
        clearInterval(interval);
      }

      const maxMemory = Math.max(...memorySnapshots);
      const avgMemory = memorySnapshots.reduce((a, b) => a + b, 0) / memorySnapshots.length;

      console.log(`  Peak memory: ${maxMemory.toFixed(2)}MB`);
      console.log(`  Average memory: ${avgMemory.toFixed(2)}MB`);

      // Should not exceed 200MB for a simple scaffold
      expect(maxMemory).toBeLessThan(200);
    });
  });

  describe('Caching Performance', () => {
    it('should cache templates for faster subsequent runs', async () => {
      const projectBaseName = 'cache-test';
      
      // First run (cold cache)
      const { duration: coldDuration } = await measureExecutionTime(async () => {
        return await execa('node', [
          CLI_PATH,
          'project',
          'create',
          `${projectBaseName}-1`,
          '--preset=nextjs',
          '--no-install',
          '--skip-git'
        ], {
          cwd: testDir,
          env: { XAHEEN_NO_BANNER: 'true' }
        });
      });

      // Second run (warm cache)
      const { duration: warmDuration } = await measureExecutionTime(async () => {
        return await execa('node', [
          CLI_PATH,
          'project',
          'create',
          `${projectBaseName}-2`,
          '--preset=nextjs',
          '--no-install',
          '--skip-git'
        ], {
          cwd: testDir,
          env: { XAHEEN_NO_BANNER: 'true' }
        });
      });

      console.log(`  Cold cache: ${coldDuration.toFixed(2)}ms`);
      console.log(`  Warm cache: ${warmDuration.toFixed(2)}ms`);
      console.log(`  Improvement: ${((1 - warmDuration / coldDuration) * 100).toFixed(1)}%`);

      // Warm cache should be faster
      expect(warmDuration).toBeLessThan(coldDuration);
    });
  });
});

// Helper function to count files recursively
async function countFiles(dir: string): Promise<number> {
  let count = 0;
  
  async function traverse(currentPath: string) {
    const entries = await fs.readdir(currentPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        await traverse(fullPath);
      } else if (entry.isFile()) {
        count++;
      }
    }
  }
  
  await traverse(dir);
  return count;
}

// Performance reporting
describe('Performance Report', () => {
  it('should generate performance report', async () => {
    const report = {
      timestamp: new Date().toISOString(),
      system: getSystemInfo(),
      thresholds: PERFORMANCE_THRESHOLDS,
      results: {
        dryRun: { target: PERFORMANCE_THRESHOLDS.dryRun, unit: 'ms' },
        fullScaffold: { target: PERFORMANCE_THRESHOLDS.fullScaffold, unit: 'ms' },
        minimalProject: { target: PERFORMANCE_THRESHOLDS.minimalProject, unit: 'ms' },
        complexProject: { target: PERFORMANCE_THRESHOLDS.complexProject, unit: 'ms' },
      }
    };

    const reportPath = path.join(__dirname, '../../../../test-output/phase1-performance-report.json');
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    console.log(`\nPerformance report saved to: ${reportPath}`);
  });
});