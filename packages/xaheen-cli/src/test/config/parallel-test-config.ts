/**
 * @fileoverview Parallel Test Execution Configuration - EPIC 14 Story 14.5 & EPIC 13 Story 13.7
 * @description Configuration and utilities for parallel test execution across test suites
 * @version 1.0.0
 * @compliance Enterprise Security, Norwegian NSM Standards
 */

import { cpus } from 'os';
import { WorkerOptions } from 'vitest';

/**
 * Parallel execution configuration
 */
export interface ParallelTestConfig {
  maxWorkers: number;
  minWorkers: number;
  isolateWorkers: boolean;
  poolOptions: {
    threads?: {
      minThreads?: number;
      maxThreads?: number;
      useAtomics?: boolean;
    };
    forks?: {
      minForks?: number;
      maxForks?: number;
    };
  };
  testTimeout: number;
  hookTimeout: number;
  bail: number;
  retry: number;
  fileParallelism: boolean;
  isolate: boolean;
}

/**
 * Test suite categorization for optimal parallel execution
 */
export interface TestSuiteCategory {
  name: string;
  patterns: string[];
  priority: 'high' | 'medium' | 'low';
  executionType: 'parallel' | 'sequential' | 'isolated';
  resourceRequirements: {
    memory: 'low' | 'medium' | 'high';
    cpu: 'low' | 'medium' | 'high';
    io: 'low' | 'medium' | 'high';
  };
  dependencies: string[];
  maxParallelism?: number;
}

/**
 * Resource allocation for different test types
 */
export interface ResourceAllocation {
  memoryLimit: number; // in MB
  cpuQuota: number; // percentage
  ioQuota: number; // operations per second
  networkLimit: number; // concurrent connections
}

/**
 * Test execution strategy
 */
export type TestExecutionStrategy = 
  | 'aggressive-parallel' 
  | 'conservative-parallel' 
  | 'sequential' 
  | 'adaptive';

/**
 * Get optimal parallel test configuration based on system resources
 */
export function getOptimalParallelConfig(strategy: TestExecutionStrategy = 'adaptive'): ParallelTestConfig {
  const totalCPUs = cpus().length;
  const totalMemoryGB = process.memoryUsage().heapTotal / (1024 * 1024 * 1024);

  const strategies = {
    'aggressive-parallel': {
      maxWorkers: Math.max(totalCPUs, 4),
      minWorkers: Math.min(totalCPUs - 1, 2),
      fileParallelism: true,
      isolate: false,
      testTimeout: 30000,
      retry: 1,
    },
    'conservative-parallel': {
      maxWorkers: Math.max(Math.floor(totalCPUs / 2), 2),
      minWorkers: 1,
      fileParallelism: true,
      isolate: true,
      testTimeout: 60000,
      retry: 2,
    },
    'sequential': {
      maxWorkers: 1,
      minWorkers: 1,
      fileParallelism: false,
      isolate: true,
      testTimeout: 120000,
      retry: 3,
    },
    'adaptive': {
      maxWorkers: totalMemoryGB > 8 ? Math.min(totalCPUs, 8) : Math.min(totalCPUs, 4),
      minWorkers: 1,
      fileParallelism: totalMemoryGB > 4,
      isolate: totalMemoryGB < 8,
      testTimeout: totalMemoryGB > 8 ? 30000 : 60000,
      retry: totalMemoryGB > 8 ? 1 : 2,
    },
  };

  const baseConfig = strategies[strategy];

  return {
    maxWorkers: baseConfig.maxWorkers,
    minWorkers: baseConfig.minWorkers,
    isolateWorkers: baseConfig.isolate,
    poolOptions: {
      threads: {
        minThreads: baseConfig.minWorkers,
        maxThreads: baseConfig.maxWorkers,
        useAtomics: true,
      },
      forks: {
        minForks: 1,
        maxForks: Math.max(2, Math.floor(baseConfig.maxWorkers / 2)),
      },
    },
    testTimeout: baseConfig.testTimeout,
    hookTimeout: Math.floor(baseConfig.testTimeout / 2),
    bail: 0, // Don't bail early for parallel execution
    retry: baseConfig.retry,
    fileParallelism: baseConfig.fileParallelism,
    isolate: baseConfig.isolate,
  };
}

/**
 * Test suite categories with execution preferences
 */
export const testSuiteCategories: TestSuiteCategory[] = [
  {
    name: 'unit-tests',
    patterns: ['**/*.unit.test.ts', '**/unit/**/*.test.ts'],
    priority: 'high',
    executionType: 'parallel',
    resourceRequirements: {
      memory: 'low',
      cpu: 'low',
      io: 'low',
    },
    dependencies: [],
    maxParallelism: 8,
  },
  {
    name: 'mcp-unit-tests',
    patterns: ['**/mcp-client.unit.test.ts', '**/mcp/**/*.unit.test.ts'],
    priority: 'high',
    executionType: 'parallel',
    resourceRequirements: {
      memory: 'medium',
      cpu: 'medium',
      io: 'low',
    },
    dependencies: [],
    maxParallelism: 4,
  },
  {
    name: 'frontend-unit-tests',
    patterns: ['**/generators.unit.test.ts', '**/frontend/**/*.unit.test.ts'],
    priority: 'high',
    executionType: 'parallel',
    resourceRequirements: {
      memory: 'medium',
      cpu: 'medium',
      io: 'medium',
    },
    dependencies: [],
    maxParallelism: 4,
  },
  {
    name: 'integration-tests',
    patterns: ['**/*.integration.test.ts', '**/integration/**/*.test.ts'],
    priority: 'medium',
    executionType: 'parallel',
    resourceRequirements: {
      memory: 'high',
      cpu: 'medium',
      io: 'high',
    },
    dependencies: ['unit-tests'],
    maxParallelism: 3,
  },
  {
    name: 'mcp-integration-tests',
    patterns: ['**/mcp-workflow.integration.test.ts', '**/mcp-error-handling.integration.test.ts'],
    priority: 'medium',
    executionType: 'isolated',
    resourceRequirements: {
      memory: 'high',
      cpu: 'high',
      io: 'medium',
    },
    dependencies: ['mcp-unit-tests'],
    maxParallelism: 2,
  },
  {
    name: 'frontend-integration-tests',
    patterns: ['**/frontend-browser.integration.test.ts'],
    priority: 'medium',
    executionType: 'isolated',
    resourceRequirements: {
      memory: 'high',
      cpu: 'high',
      io: 'high',
    },
    dependencies: ['frontend-unit-tests'],
    maxParallelism: 2,
  },
  {
    name: 'e2e-tests',
    patterns: ['**/*.e2e.test.ts', '**/e2e/**/*.test.ts'],
    priority: 'medium',
    executionType: 'sequential',
    resourceRequirements: {
      memory: 'high',
      cpu: 'high',
      io: 'high',
    },
    dependencies: ['integration-tests'],
    maxParallelism: 1,
  },
  {
    name: 'performance-tests',
    patterns: ['**/*.performance.test.ts', '**/performance/**/*.test.ts'],
    priority: 'low',
    executionType: 'isolated',
    resourceRequirements: {
      memory: 'high',
      cpu: 'high',
      io: 'medium',
    },
    dependencies: ['integration-tests'],
    maxParallelism: 1,
  },
  {
    name: 'error-scenario-tests',
    patterns: ['**/error-scenarios.test.ts', '**/scenarios/**/*.test.ts'],
    priority: 'low',
    executionType: 'parallel',
    resourceRequirements: {
      memory: 'medium',
      cpu: 'medium',
      io: 'low',
    },
    dependencies: ['unit-tests'],
    maxParallelism: 3,
  },
];

/**
 * Resource allocation by test category
 */
export const resourceAllocations: Record<string, ResourceAllocation> = {
  'unit-tests': {
    memoryLimit: 256, // 256MB
    cpuQuota: 25, // 25%
    ioQuota: 100, // 100 ops/sec
    networkLimit: 5,
  },
  'mcp-unit-tests': {
    memoryLimit: 512, // 512MB
    cpuQuota: 50, // 50%
    ioQuota: 200, // 200 ops/sec
    networkLimit: 10,
  },
  'frontend-unit-tests': {
    memoryLimit: 512, // 512MB
    cpuQuota: 50, // 50%
    ioQuota: 300, // 300 ops/sec
    networkLimit: 5,
  },
  'integration-tests': {
    memoryLimit: 1024, // 1GB
    cpuQuota: 75, // 75%
    ioQuota: 500, // 500 ops/sec
    networkLimit: 20,
  },
  'mcp-integration-tests': {
    memoryLimit: 1536, // 1.5GB
    cpuQuota: 100, // 100%
    ioQuota: 400, // 400 ops/sec
    networkLimit: 50,
  },
  'frontend-integration-tests': {
    memoryLimit: 2048, // 2GB
    cpuQuota: 100, // 100%
    ioQuota: 600, // 600 ops/sec
    networkLimit: 10,
  },
  'e2e-tests': {
    memoryLimit: 2048, // 2GB
    cpuQuota: 100, // 100%
    ioQuota: 1000, // 1000 ops/sec
    networkLimit: 30,
  },
  'performance-tests': {
    memoryLimit: 3072, // 3GB
    cpuQuota: 100, // 100%
    ioQuota: 200, // 200 ops/sec (controlled)
    networkLimit: 20,
  },
  'error-scenario-tests': {
    memoryLimit: 768, // 768MB
    cpuQuota: 50, // 50%
    ioQuota: 150, // 150 ops/sec
    networkLimit: 15,
  },
};

/**
 * Test execution orchestrator
 */
export class ParallelTestOrchestrator {
  private config: ParallelTestConfig;
  private categories: TestSuiteCategory[];
  private resourceAllocations: Record<string, ResourceAllocation>;

  constructor(
    strategy: TestExecutionStrategy = 'adaptive',
    customConfig?: Partial<ParallelTestConfig>
  ) {
    this.config = { ...getOptimalParallelConfig(strategy), ...customConfig };
    this.categories = testSuiteCategories;
    this.resourceAllocations = resourceAllocations;
  }

  /**
   * Get execution plan for test suites
   */
  getExecutionPlan(): {
    phases: Array<{
      name: string;
      categories: TestSuiteCategory[];
      parallelism: number;
      estimatedDuration: number;
    }>;
    totalEstimatedDuration: number;
  } {
    // Group categories by dependencies and priority
    const phases = this.planExecutionPhases();
    
    const executionPlan = phases.map(phase => ({
      name: phase.name,
      categories: phase.categories,
      parallelism: this.calculateOptimalParallelism(phase.categories),
      estimatedDuration: this.estimatePhaseDuration(phase.categories),
    }));

    const totalEstimatedDuration = executionPlan.reduce(
      (total, phase) => total + phase.estimatedDuration,
      0
    );

    return { phases: executionPlan, totalEstimatedDuration };
  }

  /**
   * Generate Vitest configuration for parallel execution
   */
  generateVitestConfig(): any {
    return {
      test: {
        pool: 'threads',
        poolOptions: this.config.poolOptions,
        fileParallelism: this.config.fileParallelism,
        isolate: this.config.isolate,
        maxWorkers: this.config.maxWorkers,
        minWorkers: this.config.minWorkers,
        testTimeout: this.config.testTimeout,
        hookTimeout: this.config.hookTimeout,
        bail: this.config.bail,
        retry: this.config.retry,
        sequence: {
          hooks: 'parallel',
          setupFiles: 'list',
        },
        coverage: {
          provider: 'v8',
          reporter: ['text', 'json', 'html'],
          reportsDirectory: './coverage',
          exclude: [
            'node_modules/',
            'test/',
            '**/*.test.ts',
            '**/*.spec.ts',
          ],
        },
        reporters: [
          'default',
          'junit',
          'json',
          'html',
        ],
        outputFile: {
          junit: './test-results/junit.xml',
          json: './test-results/results.json',
          html: './test-results/index.html',
        },
      },
    };
  }

  /**
   * Generate execution commands for different test categories
   */
  generateExecutionCommands(): Record<string, string> {
    const commands: Record<string, string> = {};

    for (const category of this.categories) {
      const patterns = category.patterns.join(' ');
      const maxParallelism = Math.min(
        category.maxParallelism || this.config.maxWorkers,
        this.config.maxWorkers
      );

      const baseCommand = `vitest run ${patterns}`;
      const parallelismFlag = category.executionType === 'sequential' 
        ? '--pool=forks --poolOptions.forks.singleFork=true'
        : `--pool=threads --poolOptions.threads.maxThreads=${maxParallelism}`;

      commands[category.name] = `${baseCommand} ${parallelismFlag}`;
    }

    return commands;
  }

  /**
   * Monitor resource usage during test execution
   */
  async monitorResourceUsage(callback: (usage: ResourceUsage) => void): Promise<void> {
    const interval = setInterval(() => {
      const usage = this.getCurrentResourceUsage();
      callback(usage);
    }, 1000); // Monitor every second

    // Clean up monitoring
    process.on('exit', () => clearInterval(interval));
    process.on('SIGINT', () => clearInterval(interval));
  }

  private planExecutionPhases(): Array<{
    name: string;
    categories: TestSuiteCategory[];
  }> {
    const phases: Array<{ name: string; categories: TestSuiteCategory[] }> = [];
    const processed = new Set<string>();
    
    // Phase 1: Independent unit tests (highest priority, fully parallel)
    const phase1Categories = this.categories.filter(
      cat => cat.dependencies.length === 0 && cat.priority === 'high'
    );
    if (phase1Categories.length > 0) {
      phases.push({ name: 'Unit Tests', categories: phase1Categories });
      phase1Categories.forEach(cat => processed.add(cat.name));
    }

    // Phase 2: Integration tests (depend on unit tests)
    const phase2Categories = this.categories.filter(
      cat => 
        !processed.has(cat.name) && 
        cat.dependencies.every(dep => processed.has(dep)) &&
        cat.priority === 'medium'
    );
    if (phase2Categories.length > 0) {
      phases.push({ name: 'Integration Tests', categories: phase2Categories });
      phase2Categories.forEach(cat => processed.add(cat.name));
    }

    // Phase 3: E2E and Performance tests (depend on integration tests)
    const phase3Categories = this.categories.filter(
      cat => 
        !processed.has(cat.name) && 
        cat.dependencies.every(dep => processed.has(dep))
    );
    if (phase3Categories.length > 0) {
      phases.push({ name: 'End-to-End & Performance Tests', categories: phase3Categories });
      phase3Categories.forEach(cat => processed.add(cat.name));
    }

    return phases;
  }

  private calculateOptimalParallelism(categories: TestSuiteCategory[]): number {
    const maxParallelism = Math.min(
      ...categories.map(cat => cat.maxParallelism || this.config.maxWorkers)
    );
    
    const totalResourceWeight = categories.reduce((weight, cat) => {
      const resourceLevel = cat.resourceRequirements.memory === 'high' ? 3 :
                           cat.resourceRequirements.memory === 'medium' ? 2 : 1;
      return weight + resourceLevel;
    }, 0);

    // Adjust parallelism based on resource requirements
    const adjustedParallelism = Math.floor(this.config.maxWorkers / (totalResourceWeight / categories.length));
    
    return Math.min(maxParallelism, adjustedParallelism, this.config.maxWorkers);
  }

  private estimatePhaseDuration(categories: TestSuiteCategory[]): number {
    // Base estimates in milliseconds
    const baseEstimates = {
      'unit-tests': 30000, // 30 seconds
      'mcp-unit-tests': 45000, // 45 seconds
      'frontend-unit-tests': 60000, // 1 minute
      'integration-tests': 120000, // 2 minutes
      'mcp-integration-tests': 180000, // 3 minutes
      'frontend-integration-tests': 300000, // 5 minutes
      'e2e-tests': 600000, // 10 minutes
      'performance-tests': 900000, // 15 minutes
      'error-scenario-tests': 240000, // 4 minutes
    };

    const maxDuration = Math.max(
      ...categories.map(cat => baseEstimates[cat.name as keyof typeof baseEstimates] || 60000)
    );

    // Adjust for parallelism
    const parallelism = this.calculateOptimalParallelism(categories);
    const adjustedDuration = maxDuration / Math.max(parallelism, 1);

    return adjustedDuration;
  }

  private getCurrentResourceUsage(): ResourceUsage {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    return {
      memory: {
        used: memUsage.heapUsed,
        total: memUsage.heapTotal,
        external: memUsage.external,
        rss: memUsage.rss,
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system,
      },
      timestamp: Date.now(),
    };
  }
}

/**
 * Resource usage interface
 */
interface ResourceUsage {
  memory: {
    used: number;
    total: number;
    external: number;
    rss: number;
  };
  cpu: {
    user: number;
    system: number;
  };
  timestamp: number;
}

/**
 * Utility functions for parallel test execution
 */
export const ParallelTestUtils = {
  /**
   * Create worker pool configuration
   */
  createWorkerPoolConfig(maxWorkers: number): WorkerOptions {
    return {
      pool: 'threads',
      poolOptions: {
        threads: {
          maxThreads: maxWorkers,
          minThreads: 1,
          useAtomics: true,
        },
      },
    };
  },

  /**
   * Calculate optimal chunk size for test batching
   */
  calculateOptimalChunkSize(totalTests: number, maxWorkers: number): number {
    const baseChunkSize = Math.ceil(totalTests / maxWorkers);
    
    // Ensure chunk size is not too small (minimum 5 tests per chunk)
    return Math.max(baseChunkSize, 5);
  },

  /**
   * Distribute tests across workers evenly
   */
  distributeTests(testFiles: string[], maxWorkers: number): string[][] {
    const chunks: string[][] = Array.from({ length: maxWorkers }, () => []);
    
    testFiles.forEach((file, index) => {
      const workerIndex = index % maxWorkers;
      chunks[workerIndex].push(file);
    });

    // Filter out empty chunks
    return chunks.filter(chunk => chunk.length > 0);
  },

  /**
   * Generate isolation configuration for sensitive tests
   */
  generateIsolationConfig(testCategory: string): any {
    const sensitiveCategories = ['e2e-tests', 'performance-tests', 'mcp-integration-tests'];
    
    if (sensitiveCategories.includes(testCategory)) {
      return {
        isolate: true,
        pool: 'forks',
        poolOptions: {
          forks: {
            singleFork: true,
          },
        },
      };
    }

    return {
      isolate: false,
      pool: 'threads',
    };
  },
};

// Export default orchestrator instance
export const defaultOrchestrator = new ParallelTestOrchestrator();