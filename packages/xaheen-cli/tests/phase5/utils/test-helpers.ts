import { execSync, spawn, ChildProcess } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { rimraf } from 'rimraf';
import type { Phase5TestConfig, TestScenario } from '../config/test-config';

export interface ProcessManager {
  pid: number;
  kill: () => Promise<void>;
}

export interface TestContext {
  tempDir: string;
  config: Phase5TestConfig;
  cleanup: () => Promise<void>;
}

/**
 * Create a temporary test directory with unique name
 */
export async function createTempTestDir(prefix: string = 'xaheen-phase5'): Promise<string> {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), `${prefix}-`));
  return tempDir;
}

/**
 * Clean up test directory and all its contents
 */
export async function cleanupTestDir(tempDir: string): Promise<void> {
  try {
    await rimraf(tempDir);
  } catch (error) {
    console.warn(`Failed to cleanup test directory ${tempDir}:`, error);
  }
}

/**
 * Execute a command and return the result
 */
export async function execCommand(
  command: string,
  options: {
    cwd?: string;
    timeout?: number;
    env?: Record<string, string>;
  } = {}
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  return new Promise((resolve, reject) => {
    const { cwd = process.cwd(), timeout = 30000, env = {} } = options;
    
    try {
      const result = execSync(command, {
        cwd,
        timeout,
        env: { ...process.env, ...env },
        encoding: 'utf8',
        stdio: 'pipe',
      });
      
      resolve({
        stdout: result.toString(),
        stderr: '',
        exitCode: 0,
      });
    } catch (error: any) {
      resolve({
        stdout: error.stdout?.toString() || '',
        stderr: error.stderr?.toString() || '',
        exitCode: error.status || 1,
      });
    }
  });
}

/**
 * Spawn a long-running process and return a manager
 */
export async function spawnProcess(
  command: string,
  args: string[] = [],
  options: {
    cwd?: string;
    env?: Record<string, string>;
    detached?: boolean;
  } = {}
): Promise<ProcessManager> {
  const { cwd = process.cwd(), env = {}, detached = false } = options;
  
  const child = spawn(command, args, {
    cwd,
    env: { ...process.env, ...env },
    detached,
    stdio: 'pipe',
  });
  
  return {
    pid: child.pid!,
    kill: async () => {
      if (!child.killed) {
        child.kill('SIGTERM');
        
        // Wait for graceful shutdown, then force kill if needed
        await new Promise<void>((resolve) => {
          const timeout = setTimeout(() => {
            if (!child.killed) {
              child.kill('SIGKILL');
            }
            resolve();
          }, 5000);
          
          child.on('exit', () => {
            clearTimeout(timeout);
            resolve();
          });
        });
      }
    },
  };
}

/**
 * Wait for a port to be available
 */
export async function waitForPort(
  port: number,
  host: string = 'localhost',
  timeout: number = 30000
): Promise<boolean> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    try {
      const response = await fetch(`http://${host}:${port}/health`);
      if (response.ok) {
        return true;
      }
    } catch (error) {
      // Port not ready yet, continue waiting
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return false;
}

/**
 * Check if a port is currently in use
 */
export async function isPortInUse(port: number): Promise<boolean> {
  try {
    const result = await execCommand(`lsof -i :${port}`);
    return result.exitCode === 0 && result.stdout.trim().length > 0;
  } catch {
    return false;
  }
}

/**
 * Find an available port starting from a given port
 */
export async function findAvailablePort(startPort: number = 3000): Promise<number> {
  let port = startPort;
  
  while (await isPortInUse(port)) {
    port++;
    if (port > 65535) {
      throw new Error('No available ports found');
    }
  }
  
  return port;
}

/**
 * Create a test workspace directory structure
 */
export async function createTestWorkspace(
  baseDir: string,
  config: Phase5TestConfig
): Promise<string> {
  const workspaceDir = path.join(baseDir, config.workspace.workspaceRoot);
  
  // Create workspace structure
  await fs.mkdir(workspaceDir, { recursive: true });
  await fs.mkdir(path.join(workspaceDir, config.workspace.packages.frontend), { recursive: true });
  await fs.mkdir(path.join(workspaceDir, config.workspace.packages.backend), { recursive: true });
  await fs.mkdir(path.join(workspaceDir, config.workspace.packages.shared), { recursive: true });
  
  // Create workspace package.json
  const workspacePackageJson = {
    name: 'test-workspace',
    version: '1.0.0',
    private: true,
    workspaces: [
      config.workspace.packages.frontend,
      config.workspace.packages.backend,
      config.workspace.packages.shared,
    ],
    scripts: {
      'dev:frontend': `cd ${config.workspace.packages.frontend} && bun run dev`,
      'dev:backend': `cd ${config.workspace.packages.backend} && bun run dev`,
      'build': 'bun run build:shared && bun run build:frontend && bun run build:backend',
      'build:frontend': `cd ${config.workspace.packages.frontend} && bun run build`,
      'build:backend': `cd ${config.workspace.packages.backend} && bun run build`,
      'build:shared': `cd ${config.workspace.packages.shared} && bun run build`,
      'test': 'bun run test:shared && bun run test:frontend && bun run test:backend',
      'test:frontend': `cd ${config.workspace.packages.frontend} && bun test`,
      'test:backend': `cd ${config.workspace.packages.backend} && bun test`,
      'test:shared': `cd ${config.workspace.packages.shared} && bun test`,
    },
    devDependencies: {
      '@types/node': '^20.0.0',
      'typescript': '^5.0.0',
    },
  };
  
  await fs.writeFile(
    path.join(workspaceDir, 'package.json'),
    JSON.stringify(workspacePackageJson, null, 2)
  );
  
  return workspaceDir;
}

/**
 * Validate that a generated project has the expected structure
 */
export async function validateProjectStructure(
  projectDir: string,
  expectedFiles: string[]
): Promise<{ valid: boolean; missing: string[]; extra: string[] }> {
  const actualFiles: string[] = [];
  
  async function walkDir(dir: string, basePath: string = ''): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const relativePath = path.join(basePath, entry.name);
      
      if (entry.isDirectory()) {
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
          await walkDir(path.join(dir, entry.name), relativePath);
        }
      } else {
        actualFiles.push(relativePath);
      }
    }
  }
  
  await walkDir(projectDir);
  
  const actualFileSet = new Set(actualFiles);
  const expectedFileSet = new Set(expectedFiles);
  
  const missing = expectedFiles.filter(file => !actualFileSet.has(file));
  const extra = actualFiles.filter(file => !expectedFileSet.has(file) && !file.includes('node_modules'));
  
  return {
    valid: missing.length === 0,
    missing,
    extra,
  };
}

/**
 * Read and parse a JSON file
 */
export async function readJsonFile<T = any>(filePath: string): Promise<T> {
  const content = await fs.readFile(filePath, 'utf8');
  return JSON.parse(content);
}

/**
 * Write a JSON file
 */
export async function writeJsonFile(filePath: string, data: any): Promise<void> {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

/**
 * Create a test context with cleanup functionality
 */
export async function createTestContext(
  config: Phase5TestConfig,
  scenario?: TestScenario
): Promise<TestContext> {
  const tempDir = await createTempTestDir();
  
  const context: TestContext = {
    tempDir,
    config,
    cleanup: async () => {
      await cleanupTestDir(tempDir);
    },
  };
  
  // Run scenario setup if provided
  if (scenario?.setup) {
    await scenario.setup();
  }
  
  return context;
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    baseDelay?: number;
    maxDelay?: number;
    backoffFactor?: number;
  } = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
  } = options;
  
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts) {
        break;
      }
      
      const delay = Math.min(
        baseDelay * Math.pow(backoffFactor, attempt - 1),
        maxDelay
      );
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

/**
 * Assert that a file exists and has expected content
 */
export async function assertFileContent(
  filePath: string,
  expectedContent: string | RegExp | ((content: string) => boolean)
): Promise<void> {
  const actualContent = await fs.readFile(filePath, 'utf8');
  
  if (typeof expectedContent === 'string') {
    if (!actualContent.includes(expectedContent)) {
      throw new Error(`File ${filePath} does not contain expected content: ${expectedContent}`);
    }
  } else if (expectedContent instanceof RegExp) {
    if (!expectedContent.test(actualContent)) {
      throw new Error(`File ${filePath} does not match expected pattern: ${expectedContent}`);
    }
  } else if (typeof expectedContent === 'function') {
    if (!expectedContent(actualContent)) {
      throw new Error(`File ${filePath} does not pass content validation function`);
    }
  }
}

/**
 * Get performance metrics for a function execution
 */
export async function measurePerformance<T>(
  fn: () => Promise<T>
): Promise<{ result: T; duration: number; memoryUsage: NodeJS.MemoryUsage }> {
  const startTime = process.hrtime.bigint();
  const startMemory = process.memoryUsage();
  
  const result = await fn();
  
  const endTime = process.hrtime.bigint();
  const endMemory = process.memoryUsage();
  
  const duration = Number(endTime - startTime) / 1_000_000; // Convert to milliseconds
  
  return {
    result,
    duration,
    memoryUsage: {
      rss: endMemory.rss - startMemory.rss,
      heapTotal: endMemory.heapTotal - startMemory.heapTotal,
      heapUsed: endMemory.heapUsed - startMemory.heapUsed,
      external: endMemory.external - startMemory.external,
      arrayBuffers: endMemory.arrayBuffers - startMemory.arrayBuffers,
    },
  };
}