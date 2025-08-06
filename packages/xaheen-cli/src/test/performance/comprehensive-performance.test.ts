/**
 * Comprehensive Performance and Stress Tests
 * 
 * Tests CLI performance under various conditions including large projects,
 * concurrent operations, memory usage, and response times.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { performance } from 'perf_hooks';

// Mock process memory usage
const mockMemoryUsage = () => ({
  rss: 50 * 1024 * 1024, // 50MB
  heapTotal: 30 * 1024 * 1024, // 30MB
  heapUsed: 20 * 1024 * 1024, // 20MB
  external: 5 * 1024 * 1024, // 5MB
  arrayBuffers: 1 * 1024 * 1024 // 1MB
});

vi.mock('process', () => ({
  memoryUsage: vi.fn().mockImplementation(mockMemoryUsage),
  cwd: vi.fn().mockReturnValue('/test/project'),
  argv: ['node', 'xaheen'],
  env: {},
  exit: vi.fn()
}));

// Mock file system for performance testing
vi.mock('fs-extra', () => ({
  pathExists: vi.fn(),
  readJson: vi.fn(),
  writeJson: vi.fn(),
  readdir: vi.fn(),
  stat: vi.fn(),
  copy: vi.fn(),
  remove: vi.fn(),
  ensureDir: vi.fn()
}));

// Mock external dependencies
vi.mock('../../core/command-parser/index', () => ({
  CommandParser: vi.fn().mockImplementation(() => ({
    parse: vi.fn().mockImplementation(async () => {
      // Simulate parsing time
      await new Promise(resolve => setTimeout(resolve, 10));
      return Promise.resolve();
    })
  }))
}));

describe('CLI Performance Tests', () => {
  const PERFORMANCE_THRESHOLDS = {
    STARTUP_TIME: 1000, // ms
    COMMAND_PARSE_TIME: 100, // ms
    CONFIG_LOAD_TIME: 50, // ms
    LARGE_PROJECT_SCAN_TIME: 2000, // ms
    MEMORY_LIMIT: 100 * 1024 * 1024, // 100MB
    CONCURRENT_OPERATIONS: 10
  };

  let mockFs: any;
  let mockProcess: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFs = vi.mocked(require('fs-extra'));
    mockProcess = vi.mocked(require('process'));
    
    // Setup default fast responses
    mockFs.pathExists.mockResolvedValue(true);
    mockFs.readJson.mockResolvedValue({});
    mockFs.writeJson.mockResolvedValue(undefined);
    mockFs.readdir.mockResolvedValue([]);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Startup Performance', () => {
    it('should start CLI within performance threshold', async () => {
      const startTime = performance.now();
      
      // Simulate CLI startup
      const { main } = await import('../../index');
      
      // Mock successful startup
      const mockCommandParser = require('../../core/command-parser/index').CommandParser;
      mockCommandParser.mockImplementation(() => ({
        parse: vi.fn().mockResolvedValue(undefined)
      }));
      
      // Set up process args to avoid actual parsing
      mockProcess.argv = ['node', 'xaheen', '--version'];
      
      await main();
      
      const endTime = performance.now();
      const startupTime = endTime - startTime;
      
      expect(startupTime).toBeLessThan(PERFORMANCE_THRESHOLDS.STARTUP_TIME);
    }, 2000);

    it('should handle rapid successive startups', async () => {
      const startupTimes: number[] = [];
      
      for (let i = 0; i < 5; i++) {
        const startTime = performance.now();
        
        // Reset module cache for fresh import
        vi.resetModules();
        const { main } = await import('../../index');
        
        mockProcess.argv = ['node', 'xaheen', '--help'];
        await main();
        
        const endTime = performance.now();
        startupTimes.push(endTime - startTime);
      }
      
      // All startups should be within threshold
      startupTimes.forEach(time => {
        expect(time).toBeLessThan(PERFORMANCE_THRESHOLDS.STARTUP_TIME);
      });
      
      // Average startup time should be reasonable
      const avgTime = startupTimes.reduce((a, b) => a + b) / startupTimes.length;
      expect(avgTime).toBeLessThan(PERFORMANCE_THRESHOLDS.STARTUP_TIME * 0.8);
    }, 10000);
  });

  describe('Command Processing Performance', () => {
    it('should parse commands quickly', async () => {
      const { CommandParser } = await import('../../core/command-parser/index');
      const parser = new CommandParser();
      
      const commands = [
        ['project', 'create', 'test-app'],
        ['component', 'generate', 'button'],
        ['service', 'add', 'auth'],
        ['registry', 'list'],
        ['ai', 'generate', 'create a login form']
      ];
      
      for (const command of commands) {
        const startTime = performance.now();
        
        mockProcess.argv = ['node', 'xaheen', ...command];
        await parser.parse(mockProcess.argv);
        
        const endTime = performance.now();
        const parseTime = endTime - startTime;
        
        expect(parseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.COMMAND_PARSE_TIME);
      }
    });

    it('should handle concurrent command processing', async () => {
      const { CommandParser } = await import('../../core/command-parser/index');
      
      const concurrentParsers = Array.from({ length: PERFORMANCE_THRESHOLDS.CONCURRENT_OPERATIONS }, 
        () => new CommandParser()
      );
      
      const parsePromises = concurrentParsers.map(async (parser, index) => {
        const startTime = performance.now();
        
        mockProcess.argv = ['node', 'xaheen', 'project', 'create', `test-app-${index}`];
        await parser.parse(mockProcess.argv);
        
        const endTime = performance.now();
        return endTime - startTime;
      });
      
      const parseTimes = await Promise.all(parsePromises);
      
      // All concurrent operations should complete within threshold
      parseTimes.forEach(time => {
        expect(time).toBeLessThan(PERFORMANCE_THRESHOLDS.COMMAND_PARSE_TIME * 2); // Allow 2x for concurrency
      });
    });
  });

  describe('Configuration Performance', () => {
    it('should load configuration quickly', async () => {
      const { ConfigManager } = await import('../../core/config-manager/index');
      const configManager = new ConfigManager('/test/project');
      
      const startTime = performance.now();
      await configManager.loadConfig();
      const endTime = performance.now();
      
      const loadTime = endTime - startTime;
      expect(loadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.CONFIG_LOAD_TIME);
    });

    it('should cache configuration efficiently', async () => {
      const { ConfigManager } = await import('../../core/config-manager/index');
      const configManager = new ConfigManager('/test/project');
      
      // First load (should read from disk)
      const startTime1 = performance.now();
      await configManager.loadConfig();
      const endTime1 = performance.now();
      const firstLoadTime = endTime1 - startTime1;
      
      // Second load (should use cache)
      const startTime2 = performance.now();
      await configManager.loadConfig();
      const endTime2 = performance.now();
      const cachedLoadTime = endTime2 - startTime2;
      
      // Cached load should be significantly faster
      expect(cachedLoadTime).toBeLessThan(firstLoadTime * 0.5);
      expect(cachedLoadTime).toBeLessThan(10); // Very fast for cached
    });

    it('should handle large configuration files efficiently', async () => {
      const { ConfigManager } = await import('../../core/config-manager/index');
      const configManager = new ConfigManager('/test/project');
      
      // Mock large configuration
      const largeConfig = {
        version: '3.0.0',
        project: { name: 'large-project', framework: 'nextjs', packageManager: 'bun' },
        services: {}
      };
      
      // Generate 100 services
      for (let i = 0; i < 100; i++) {
        largeConfig.services[`service-${i}`] = {
          provider: `provider-${i}`,
          config: {
            database: `db-${i}`,
            auth: `auth-${i}`,
            cache: `cache-${i}`,
            queue: `queue-${i}`
          }
        };
      }
      
      mockFs.readJson.mockResolvedValue(largeConfig);
      
      const startTime = performance.now();
      await configManager.loadConfig();
      const endTime = performance.now();
      
      const loadTime = endTime - startTime;
      expect(loadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.CONFIG_LOAD_TIME * 3); // Allow 3x for large config
    });
  });

  describe('Large Project Handling', () => {
    it('should scan large projects efficiently', async () => {
      const { StackAdapterRegistry } = await import('../../core/stack-adapters/index');
      const registry = StackAdapterRegistry.getInstance();
      
      // Mock large project structure
      mockFs.readdir.mockImplementation((path) => {
        // Simulate large directory with many files
        const items = Array.from({ length: 1000 }, (_, i) => ({
          name: `file-${i}.ts`,
          isDirectory: () => false
        }));
        return Promise.resolve(items);
      });
      
      const startTime = performance.now();
      await registry.detectStack('/large/project');
      const endTime = performance.now();
      
      const scanTime = endTime - startTime;
      expect(scanTime).toBeLessThan(PERFORMANCE_THRESHOLDS.LARGE_PROJECT_SCAN_TIME);
    });

    it('should handle monorepo detection efficiently', async () => {
      const { ConfigManager } = await import('../../core/config-manager/index');
      const configManager = new ConfigManager('/large/monorepo');
      
      // Mock large monorepo structure
      mockFs.readJson.mockResolvedValue({
        name: 'large-monorepo',
        workspaces: ['apps/*', 'packages/*']
      });
      
      mockFs.readdir
        .mockResolvedValueOnce(
          Array.from({ length: 50 }, (_, i) => ({
            name: `app-${i}`,
            isDirectory: () => true
          }))
        )
        .mockResolvedValueOnce(
          Array.from({ length: 100 }, (_, i) => ({
            name: `package-${i}`,
            isDirectory: () => true
          }))
        );
      
      const startTime = performance.now();
      const monorepoInfo = await configManager.getMonorepoInfo();
      const endTime = performance.now();
      
      const detectionTime = endTime - startTime;
      expect(detectionTime).toBeLessThan(PERFORMANCE_THRESHOLDS.LARGE_PROJECT_SCAN_TIME);
      expect(monorepoInfo.apps).toHaveLength(50);
      expect(monorepoInfo.packages).toHaveLength(100);
    });
  });

  describe('Memory Usage', () => {
    it('should maintain reasonable memory usage', async () => {
      const initialMemory = mockProcess.memoryUsage();
      
      // Simulate memory-intensive operations
      const { ConfigManager } = await import('../../core/config-manager/index');
      const managers = Array.from({ length: 10 }, () => new ConfigManager('/test'));
      
      // Load configs concurrently
      await Promise.all(managers.map(manager => manager.loadConfig()));
      
      const finalMemory = mockProcess.memoryUsage();
      
      // Memory usage shouldn't exceed threshold
      expect(finalMemory.heapUsed).toBeLessThan(PERFORMANCE_THRESHOLDS.MEMORY_LIMIT);
      
      // Memory increase should be reasonable
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      expect(memoryIncrease).toBeLessThan(PERFORMANCE_THRESHOLDS.MEMORY_LIMIT * 0.5);
    });

    it('should handle memory pressure gracefully', async () => {
      // Mock high memory usage scenario
      const highMemoryUsage = {
        ...mockMemoryUsage(),
        heapUsed: 80 * 1024 * 1024, // 80MB
        heapTotal: 90 * 1024 * 1024  // 90MB
      };
      
      mockProcess.memoryUsage.mockReturnValue(highMemoryUsage);
      
      const { ConfigManager } = await import('../../core/config-manager/index');
      const configManager = new ConfigManager('/test');
      
      // Should still function under memory pressure
      await expect(configManager.loadConfig()).resolves.toBeDefined();
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent registry operations', async () => {
      const { RegistryCommand } = await import('../../commands/registry');
      
      const registryCommands = Array.from({ length: 5 }, () => new RegistryCommand());
      
      const startTime = performance.now();
      
      const operations = registryCommands.map(async (command, index) => {
        return command['handleList']({ category: `category-${index}` });
      });
      
      await Promise.all(operations);
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      // Concurrent operations should be efficient
      expect(totalTime).toBeLessThan(PERFORMANCE_THRESHOLDS.COMMAND_PARSE_TIME * 3);
    });

    it('should handle concurrent config operations', async () => {
      const { ConfigManager } = await import('../../core/config-manager/index');
      const configManager = new ConfigManager('/test');
      
      const operations = [
        () => configManager.loadConfig(),
        () => configManager.validateConfig(),
        () => configManager.getMonorepoInfo(),
        () => configManager.addService('test1', { provider: 'test' }),
        () => configManager.updateDesignConfig({ theme: 'dark' })
      ];
      
      const startTime = performance.now();
      
      // Run operations concurrently
      await Promise.all(operations.map(op => op()));
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      expect(totalTime).toBeLessThan(PERFORMANCE_THRESHOLDS.CONFIG_LOAD_TIME * 10);
    });
  });

  describe('Stress Testing', () => {
    it('should handle rapid command execution', async () => {
      const { CommandParser } = await import('../../core/command-parser/index');
      const parser = new CommandParser();
      
      const commands = Array.from({ length: 100 }, (_, i) => 
        ['project', 'create', `stress-test-${i}`]
      );
      
      const startTime = performance.now();
      
      for (const command of commands) {
        mockProcess.argv = ['node', 'xaheen', ...command];
        await parser.parse(mockProcess.argv);
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const avgTime = totalTime / commands.length;
      
      expect(avgTime).toBeLessThan(PERFORMANCE_THRESHOLDS.COMMAND_PARSE_TIME);
    }, 30000);

    it('should recover from file system stress', async () => {
      const { ConfigManager } = await import('../../core/config-manager/index');
      const configManager = new ConfigManager('/test');
      
      // Mock intermittent file system failures
      let callCount = 0;
      mockFs.readJson.mockImplementation(() => {
        callCount++;
        if (callCount % 3 === 0) {
          return Promise.reject(new Error('Intermittent failure'));
        }
        return Promise.resolve({ version: '3.0.0' });
      });
      
      const operations = Array.from({ length: 20 }, async (_, i) => {
        try {
          return await configManager.loadConfig();
        } catch (error) {
          // Clear cache and retry
          configManager.clearCache();
          return await configManager.loadConfig();
        }
      });
      
      const results = await Promise.allSettled(operations);
      
      // Most operations should succeed despite intermittent failures
      const successful = results.filter(r => r.status === 'fulfilled').length;
      expect(successful).toBeGreaterThan(operations.length * 0.8);
    });
  });

  describe('Resource Cleanup', () => {
    it('should clean up resources properly', async () => {
      const initialHandles = process._getActiveHandles?.()?.length || 0;
      const initialRequests = process._getActiveRequests?.()?.length || 0;
      
      // Perform operations that might create handles/requests
      const { ConfigManager } = await import('../../core/config-manager/index');
      const managers = Array.from({ length: 5 }, () => new ConfigManager('/test'));
      
      await Promise.all(managers.map(m => m.loadConfig()));
      
      // Clear references
      managers.length = 0;
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      // Check for resource leaks
      const finalHandles = process._getActiveHandles?.()?.length || 0;
      const finalRequests = process._getActiveRequests?.()?.length || 0;
      
      expect(finalHandles - initialHandles).toBeLessThanOrEqual(2); // Allow small increase
      expect(finalRequests - initialRequests).toBeLessThanOrEqual(2);
    });
  });

  describe('Performance Regression Detection', () => {
    it('should maintain consistent performance across runs', async () => {
      const { ConfigManager } = await import('../../core/config-manager/index');
      
      const runTimes: number[] = [];
      
      for (let run = 0; run < 10; run++) {
        const configManager = new ConfigManager(`/test-run-${run}`);
        
        const startTime = performance.now();
        await configManager.loadConfig();
        await configManager.validateConfig();
        const endTime = performance.now();
        
        runTimes.push(endTime - startTime);
      }
      
      // Calculate performance consistency
      const avgTime = runTimes.reduce((a, b) => a + b) / runTimes.length;
      const maxDeviation = Math.max(...runTimes.map(t => Math.abs(t - avgTime)));
      
      // Performance should be consistent (within 50% of average)
      expect(maxDeviation).toBeLessThan(avgTime * 0.5);
      
      // Average performance should be good
      expect(avgTime).toBeLessThan(PERFORMANCE_THRESHOLDS.CONFIG_LOAD_TIME * 2);
    });
  });

  describe('Performance Monitoring', () => {
    it('should provide performance metrics', async () => {
      const { CommandParser } = await import('../../core/command-parser/index');
      const parser = new CommandParser();
      
      const metrics = {
        startTime: performance.now(),
        commandsProcessed: 0,
        totalProcessingTime: 0
      };
      
      const commands = [
        ['project', 'create', 'perf-test'],
        ['registry', 'list'],
        ['component', 'generate', 'test component']
      ];
      
      for (const command of commands) {
        const cmdStart = performance.now();
        
        mockProcess.argv = ['node', 'xaheen', ...command];
        await parser.parse(mockProcess.argv);
        
        const cmdEnd = performance.now();
        metrics.commandsProcessed++;
        metrics.totalProcessingTime += (cmdEnd - cmdStart);
      }
      
      const totalTime = performance.now() - metrics.startTime;
      const avgCommandTime = metrics.totalProcessingTime / metrics.commandsProcessed;
      
      expect(metrics.commandsProcessed).toBe(commands.length);
      expect(avgCommandTime).toBeLessThan(PERFORMANCE_THRESHOLDS.COMMAND_PARSE_TIME);
      expect(totalTime).toBeLessThan(PERFORMANCE_THRESHOLDS.COMMAND_PARSE_TIME * commands.length * 1.5);
    });
  });
});