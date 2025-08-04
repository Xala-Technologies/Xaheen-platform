/**
 * Performance Tests for CLI Operations
 * 
 * Tests CLI performance including cold vs warm starts, command execution speed,
 * memory usage, and concurrent operations.
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { execa } from "execa";
import fs from "fs-extra";
import path from "node:path";
import { testUtils } from "../test-helpers.js";
import tmp from "tmp";

describe("CLI Performance Tests", () => {
  let testDir: string;
  let originalCwd: string;
  let cleanup: () => void;
  let cliPath: string;
  let perf: testUtils.perf.PerformanceTracker;

  beforeAll(async () => {
    // Ensure CLI is built
    cliPath = path.resolve(__dirname, "../../../dist/index.js");
    const exists = await fs.pathExists(cliPath);
    if (!exists) {
      throw new Error("CLI not built. Run 'npm run build' first.");
    }
  });

  beforeEach(async () => {
    originalCwd = process.cwd();
    perf = new testUtils.perf.PerformanceTracker();
    
    // Create temporary test directory
    const result = tmp.dirSync({ prefix: "xaheen-perf-test-", unsafeCleanup: true });
    testDir = result.name;
    cleanup = result.removeCallback;
    
    process.chdir(testDir);
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    
    if (cleanup) {
      cleanup();
    }
    
    // Log performance stats
    const stats = perf.getAllStats();
    console.log("Performance Stats:", JSON.stringify(stats, null, 2));
  });

  describe("Startup Performance", () => {
    it("should measure cold start performance", async () => {
      const coldStartTimes: number[] = [];
      
      for (let i = 0; i < 5; i++) {
        const endMeasure = perf.startMeasurement(`cold-start-${i}`);
        
        const result = await execa("node", [cliPath, "--help"], {
          cwd: testDir,
          env: {
            ...process.env,
            XAHEEN_NO_BANNER: "true",
          },
        });
        
        const duration = endMeasure();
        coldStartTimes.push(duration);
        
        expect(result.exitCode).toBe(0);
        expect(duration).toBeLessThan(5000); // Should start within 5 seconds
      }
      
      const avgColdStart = coldStartTimes.reduce((a, b) => a + b, 0) / coldStartTimes.length;
      const maxColdStart = Math.max(...coldStartTimes);
      const minColdStart = Math.min(...coldStartTimes);
      
      console.log(`Cold start performance:
        Average: ${avgColdStart.toFixed(2)}ms
        Min: ${minColdStart.toFixed(2)}ms
        Max: ${maxColdStart.toFixed(2)}ms
      `);
      
      // Performance expectations
      expect(avgColdStart).toBeLessThan(3000); // Average under 3s
      expect(maxColdStart).toBeLessThan(5000); // Max under 5s
    }, 30000);

    it("should measure warm start performance", async () => {
      // First run to "warm up"
      await execa("node", [cliPath, "--version"], {
        cwd: testDir,
        env: { XAHEEN_NO_BANNER: "true" },
      });
      
      const warmStartTimes: number[] = [];
      
      for (let i = 0; i < 10; i++) {
        const endMeasure = perf.startMeasurement(`warm-start-${i}`);
        
        const result = await execa("node", [cliPath, "--version"], {
          cwd: testDir,
          env: { XAHEEN_NO_BANNER: "true" },
        });
        
        const duration = endMeasure();
        warmStartTimes.push(duration);
        
        expect(result.exitCode).toBe(0);
      }
      
      const avgWarmStart = warmStartTimes.reduce((a, b) => a + b, 0) / warmStartTimes.length;
      const maxWarmStart = Math.max(...warmStartTimes);
      
      console.log(`Warm start performance:
        Average: ${avgWarmStart.toFixed(2)}ms
        Max: ${maxWarmStart.toFixed(2)}ms
      `);
      
      // Warm starts should be faster
      expect(avgWarmStart).toBeLessThan(2000); // Average under 2s
      expect(maxWarmStart).toBeLessThan(3000); // Max under 3s
    }, 25000);

    it("should compare command parsing overhead", async () => {
      const commands = [
        ["--help"],
        ["--version"],
        ["project", "create", "--help"],
        ["service", "add", "--help"],
        ["ai", "generate", "--help"],
        ["make:model", "--help"],
      ];
      
      const commandTimes: Record<string, number[]> = {};
      
      for (const command of commands) {
        const commandKey = command.join(" ");
        commandTimes[commandKey] = [];
        
        for (let i = 0; i < 3; i++) {
          const endMeasure = perf.startMeasurement(`command-${commandKey}-${i}`);
          
          const result = await execa("node", [cliPath, ...command], {
            cwd: testDir,
            env: { XAHEEN_NO_BANNER: "true" },
          });
          
          const duration = endMeasure();
          commandTimes[commandKey].push(duration);
          
          expect(result.exitCode).toBe(0);
        }
      }
      
      // Analyze command parsing overhead
      for (const [command, times] of Object.entries(commandTimes)) {
        const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
        console.log(`${command}: ${avgTime.toFixed(2)}ms average`);
        
        // All commands should parse quickly
        expect(avgTime).toBeLessThan(2000);
      }
    }, 30000);
  });

  describe("Command Execution Performance", () => {
    it("should benchmark project creation", async () => {
      const presets = ["simple", "saas-starter"];
      const projectSizes: Record<string, number> = {};
      
      for (const preset of presets) {
        const projectName = `perf-test-${preset}`;
        
        const endMeasure = perf.startMeasurement(`create-${preset}`);
        
        const result = await execa("node", [
          cliPath,
          "project", "create", projectName,
          "--preset", preset,
          "--skip-install" // Skip npm install for pure CLI performance
        ], {
          cwd: testDir,
          env: { XAHEEN_NO_BANNER: "true" },
          timeout: 60000,
        });
        
        const duration = endMeasure();
        
        expect(result.exitCode).toBe(0);
        expect(duration).toBeLessThan(30000); // Should complete within 30s
        
        // Measure project size
        const projectPath = path.join(testDir, projectName);
        const stats = await getDirectorySize(projectPath);
        projectSizes[preset] = stats.totalSize;
        
        console.log(`Project creation performance (${preset}):
          Duration: ${duration.toFixed(2)}ms
          Files created: ${stats.fileCount}
          Total size: ${(stats.totalSize / 1024).toFixed(2)}KB
        `);
      }
      
      // Simple preset should be faster than saas-starter
      const simpleStats = perf.getStats("create-simple");
      const saasStats = perf.getStats("create-saas-starter");
      
      if (simpleStats && saasStats) {
        expect(simpleStats.avg).toBeLessThan(saasStats.avg);
      }
    }, 90000);

    it("should benchmark component generation", async () => {
      // First create a base project
      const projectName = "perf-component-test";
      
      await execa("node", [
        cliPath,
        "project", "create", projectName,
        "--preset", "simple",
        "--skip-install"
      ], {
        cwd: testDir,
        env: { XAHEEN_NO_BANNER: "true" },
        timeout: 30000,
      });
      
      const projectPath = path.join(testDir, projectName);
      process.chdir(projectPath);
      
      // Benchmark different component types
      const componentTypes = [
        { name: "Button", type: "component" },
        { name: "UserCard", type: "component" },
        { name: "DataTable", type: "component" },
      ];
      
      for (const { name, type } of componentTypes) {
        const endMeasure = perf.startMeasurement(`generate-${type}-${name}`);
        
        const result = await execa("node", [
          cliPath,
          "make:component", name,
          "--test",
          "--stories"
        ], {
          cwd: projectPath,
          env: { XAHEEN_NO_BANNER: "true" },
          timeout: 20000,
        });
        
        const duration = endMeasure();
        
        expect(result.exitCode).toBe(0);
        expect(duration).toBeLessThan(10000); // Should complete within 10s
        
        console.log(`Component generation (${name}): ${duration.toFixed(2)}ms`);
      }
    }, 60000);

    it("should benchmark service addition", async () => {
      // Create base project
      const projectName = "perf-service-test";
      
      await execa("node", [
        cliPath,
        "project", "create", projectName,
        "--preset", "simple",
        "--skip-install"
      ], {
        cwd: testDir,
        env: { XAHEEN_NO_BANNER: "true" },
        timeout: 30000,
      });
      
      const projectPath = path.join(testDir, projectName);
      process.chdir(projectPath);
      
      // Benchmark different services
      const services = ["auth", "database", "payments"];
      
      for (const service of services) {
        const endMeasure = perf.startMeasurement(`add-service-${service}`);
        
        const result = await execa("node", [
          cliPath,
          "service", "add", service
        ], {
          cwd: projectPath,
          env: { XAHEEN_NO_BANNER: "true" },
          timeout: 20000,
        });
        
        const duration = endMeasure();
        
        expect(result.exitCode).toBe(0);
        expect(duration).toBeLessThan(15000); // Should complete within 15s
        
        console.log(`Service addition (${service}): ${duration.toFixed(2)}ms`);
      }
    }, 75000);
  });

  describe("Concurrent Operations", () => {
    it("should handle parallel project creation", async () => {
      const concurrency = 3;
      const promises: Promise<any>[] = [];
      const startTime = Date.now();
      
      for (let i = 0; i < concurrency; i++) {
        const promise = execa("node", [
          cliPath,
          "project", "create", `parallel-project-${i}`,
          "--preset", "simple",
          "--skip-install"
        ], {
          cwd: testDir,
          env: { XAHEEN_NO_BANNER: "true" },
          timeout: 45000,
        });
        
        promises.push(promise);
      }
      
      const results = await Promise.all(promises);
      const totalTime = Date.now() - startTime;
      
      // All projects should be created successfully
      results.forEach((result, index) => {
        expect(result.exitCode).toBe(0);
        
        // Verify project was created
        const projectPath = path.join(testDir, `parallel-project-${index}`);
        expect(fs.pathExistsSync(projectPath)).toBe(true);
      });
      
      console.log(`Parallel project creation:
        Concurrency: ${concurrency}
        Total time: ${totalTime}ms
        Average per project: ${(totalTime / concurrency).toFixed(2)}ms
      `);
      
      // Parallel execution should be more efficient than sequential
      expect(totalTime).toBeLessThan(concurrency * 20000); // Better than 20s per project
    }, 60000);

    it("should maintain performance under load", async () => {
      // Create a base project first
      const projectName = "load-test-project";
      
      await execa("node", [
        cliPath,
        "project", "create", projectName,
        "--preset", "simple",
        "--skip-install"
      ], {
        cwd: testDir,
        env: { XAHEEN_NO_BANNER: "true" },
        timeout: 30000,
      });
      
      const projectPath = path.join(testDir, projectName);
      process.chdir(projectPath);
      
      // Generate multiple components concurrently
      const componentCount = 5;
      const promises: Promise<any>[] = [];
      const startTime = Date.now();
      
      for (let i = 0; i < componentCount; i++) {
        const promise = execa("node", [
          cliPath,
          "make:component", `LoadTestComponent${i}`,
          "--test"
        ], {
          cwd: projectPath,
          env: { XAHEEN_NO_BANNER: "true" },
          timeout: 30000,
        });
        
        promises.push(promise);
      }
      
      const results = await Promise.all(promises);
      const totalTime = Date.now() - startTime;
      
      // All components should be generated successfully
      results.forEach((result, index) => {
        expect(result.exitCode).toBe(0);
        
        // Verify component was created
        const componentPath = path.join(
          projectPath, 
          "src", 
          "components", 
          `LoadTestComponent${index}.tsx`
        );
        expect(fs.pathExistsSync(componentPath)).toBe(true);
      });
      
      console.log(`Load test results:
        Components generated: ${componentCount}
        Total time: ${totalTime}ms
        Average per component: ${(totalTime / componentCount).toFixed(2)}ms
      `);
      
      // Should maintain reasonable performance under load
      expect(totalTime / componentCount).toBeLessThan(8000); // Average under 8s per component
    }, 75000);
  });

  describe("Memory Usage", () => {
    it("should monitor memory usage during large operations", async () => {
      const projectName = "memory-test-project";
      
      // Monitor memory usage
      const initialMemory = process.memoryUsage();
      
      const result = await execa("node", [
        cliPath,
        "project", "create", projectName,
        "--preset", "saas-enterprise",
        "--skip-install"
      ], {
        cwd: testDir,
        env: { XAHEEN_NO_BANNER: "true" },
        timeout: 60000,
      });
      
      const finalMemory = process.memoryUsage();
      
      expect(result.exitCode).toBe(0);
      
      const memoryIncrease = {
        rss: finalMemory.rss - initialMemory.rss,
        heapUsed: finalMemory.heapUsed - initialMemory.heapUsed,
        heapTotal: finalMemory.heapTotal - initialMemory.heapTotal,
        external: finalMemory.external - initialMemory.external,
      };
      
      console.log(`Memory usage for large project creation:
        RSS increase: ${(memoryIncrease.rss / 1024 / 1024).toFixed(2)}MB
        Heap used increase: ${(memoryIncrease.heapUsed / 1024 / 1024).toFixed(2)}MB
        Heap total increase: ${(memoryIncrease.heapTotal / 1024 / 1024).toFixed(2)}MB
        External increase: ${(memoryIncrease.external / 1024 / 1024).toFixed(2)}MB
      `);
      
      // Memory increases should be reasonable
      expect(memoryIncrease.rss / 1024 / 1024).toBeLessThan(500); // Less than 500MB RSS increase
      expect(memoryIncrease.heapUsed / 1024 / 1024).toBeLessThan(200); // Less than 200MB heap increase
    }, 90000);
  });

  describe("File System Performance", () => {
    it("should benchmark file creation speed", async () => {
      const fileCount = 100;
      const testProjectPath = path.join(testDir, "fs-perf-test");
      
      await fs.ensureDir(testProjectPath);
      
      const endMeasure = perf.startMeasurement("file-creation");
      
      // Create multiple files
      const promises: Promise<void>[] = [];
      for (let i = 0; i < fileCount; i++) {
        const promise = fs.writeFile(
          path.join(testProjectPath, `test-file-${i}.txt`),
          `This is test file ${i}\n`.repeat(10)
        );
        promises.push(promise);
      }
      
      await Promise.all(promises);
      const duration = endMeasure();
      
      console.log(`File creation performance:
        Files created: ${fileCount}
        Total time: ${duration.toFixed(2)}ms
        Average per file: ${(duration / fileCount).toFixed(2)}ms
      `);
      
      // Verify all files were created
      for (let i = 0; i < fileCount; i++) {
        const filePath = path.join(testProjectPath, `test-file-${i}.txt`);
        expect(await fs.pathExists(filePath)).toBe(true);
      }
      
      // Should create files efficiently
      expect(duration / fileCount).toBeLessThan(50); // Less than 50ms per file on average
    }, 30000);

    it("should benchmark directory traversal", async () => {
      // Create a deep directory structure
      const baseDir = path.join(testDir, "traversal-test");
      await fs.ensureDir(baseDir);
      
      // Create nested directories and files
      for (let depth = 0; depth < 5; depth++) {
        for (let width = 0; width < 3; width++) {
          const dirPath = path.join(baseDir, ...Array(depth + 1).fill(0).map((_, i) => `level-${i}`), `dir-${width}`);
          await fs.ensureDir(dirPath);
          
          // Add some files in each directory
          for (let file = 0; file < 2; file++) {
            await fs.writeFile(
              path.join(dirPath, `file-${file}.txt`),
              `Content at depth ${depth}, width ${width}, file ${file}`
            );
          }
        }
      }
      
      const endMeasure = perf.startMeasurement("directory-traversal");
      
      // Traverse the directory structure
      const allFiles: string[] = [];
      
      async function traverse(dir: string): Promise<void> {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          
          if (entry.isDirectory()) {
            await traverse(fullPath);
          } else {
            allFiles.push(fullPath);
          }
        }
      }
      
      await traverse(baseDir);
      const duration = endMeasure();
      
      console.log(`Directory traversal performance:
        Files found: ${allFiles.length}
        Traversal time: ${duration.toFixed(2)}ms
        Average per file: ${(duration / allFiles.length).toFixed(2)}ms
      `);
      
      // Should traverse efficiently
      expect(allFiles.length).toBeGreaterThan(0);
      expect(duration / allFiles.length).toBeLessThan(10); // Less than 10ms per file
    }, 20000);
  });
});

// Helper function to calculate directory size
async function getDirectorySize(dirPath: string): Promise<{
  totalSize: number;
  fileCount: number;
}> {
  let totalSize = 0;
  let fileCount = 0;
  
  async function traverse(currentPath: string): Promise<void> {
    const entries = await fs.readdir(currentPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      
      if (entry.isDirectory()) {
        await traverse(fullPath);
      } else {
        const stats = await fs.stat(fullPath);
        totalSize += stats.size;
        fileCount++;
      }
    }
  }
  
  await traverse(dirPath);
  
  return { totalSize, fileCount };
}