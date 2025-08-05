/**
 * Package Manager Utilities for Phase 3 Testing
 */

import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { mkdir } from 'fs/promises';
import type { PackageManagerConfig, PackageManagerName } from '../config/test-config';
import { PACKAGE_MANAGERS } from '../config/test-config';

const execAsync = promisify(exec);

export interface CommandResult {
  readonly stdout: string;
  readonly stderr: string;
  readonly exitCode: number;
  readonly duration: number;
}

export interface PackageManagerDetection {
  readonly available: PackageManagerName[];
  readonly detected: PackageManagerName | null;
  readonly versions: Record<string, string>;
}

/**
 * Execute a command with timeout and capture metrics
 */
export async function executeCommand(
  command: string,
  cwd?: string,
  timeout = 30000
): Promise<CommandResult> {
  const startTime = Date.now();
  
  try {
    const { stdout, stderr } = await execAsync(command, {
      cwd,
      timeout,
      encoding: 'utf8',
    });
    
    return {
      stdout: stdout.trim(),
      stderr: stderr.trim(),
      exitCode: 0,
      duration: Date.now() - startTime,
    };
  } catch (error: any) {
    return {
      stdout: error.stdout?.trim() || '',
      stderr: error.stderr?.trim() || error.message,
      exitCode: error.code || 1,
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Check if a package manager is available on the system
 */
export async function isPackageManagerAvailable(manager: PackageManagerName): Promise<boolean> {
  try {
    const result = await executeCommand(`${manager} --version`, undefined, 5000);
    return result.exitCode === 0;
  } catch {
    return false;
  }
}

/**
 * Get package manager version
 */
export async function getPackageManagerVersion(manager: PackageManagerName): Promise<string | null> {
  try {
    const result = await executeCommand(`${manager} --version`, undefined, 5000);
    if (result.exitCode === 0) {
      // Clean up version output (some managers output extra info)
      const version = result.stdout.split('\n')[0].trim();
      return version.replace(/^v/, ''); // Remove 'v' prefix if present
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Detect available package managers and their versions
 */
export async function detectPackageManagers(): Promise<PackageManagerDetection> {
  const available: PackageManagerName[] = [];
  const versions: Record<string, string> = {};
  
  for (const manager of PACKAGE_MANAGERS) {
    if (await isPackageManagerAvailable(manager.name)) {
      available.push(manager.name);
      const version = await getPackageManagerVersion(manager.name);
      if (version) {
        versions[manager.name] = version;
      }
    }
  }
  
  return {
    available,
    detected: detectPackageManagerFromLockfile() || available[0] || null,
    versions,
  };
}

/**
 * Detect package manager from lockfiles in current directory
 */
export function detectPackageManagerFromLockfile(cwd = process.cwd()): PackageManagerName | null {
  const lockfileChecks: Array<{ file: string; manager: PackageManagerName }> = [
    { file: 'package-lock.json', manager: 'npm' },
    { file: 'yarn.lock', manager: 'yarn' },
    { file: 'pnpm-lock.yaml', manager: 'pnpm' },
    { file: 'bun.lockb', manager: 'bun' },
  ];
  
  // Check for lockfiles in order of precedence
  for (const { file, manager } of lockfileChecks) {
    if (existsSync(join(cwd, file))) {
      return manager;
    }
  }
  
  return null;
}

/**
 * Detect workspace configuration
 */
export function detectWorkspaceConfig(cwd = process.cwd()): {
  type: 'none' | 'npm' | 'yarn' | 'pnpm';
  config: any;
} {
  // Check for pnpm workspace
  const pnpmWorkspace = join(cwd, 'pnpm-workspace.yaml');
  if (existsSync(pnpmWorkspace)) {
    return {
      type: 'pnpm',
      config: readFileSync(pnpmWorkspace, 'utf8'),
    };
  }
  
  // Check for npm/yarn workspaces in package.json
  const packageJsonPath = join(cwd, 'package.json');
  if (existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
      if (packageJson.workspaces) {
        return {
          type: Array.isArray(packageJson.workspaces) ? 'npm' : 'yarn',
          config: packageJson.workspaces,
        };
      }
    } catch {
      // Invalid package.json
    }
  }
  
  return { type: 'none', config: null };
}

/**
 * Install dependencies using specified package manager
 */
export async function installDependencies(
  manager: PackageManagerName,
  cwd: string,
  timeout = 60000
): Promise<CommandResult> {
  const config = PACKAGE_MANAGERS.find(pm => pm.name === manager);
  if (!config) {
    throw new Error(`Unknown package manager: ${manager}`);
  }
  
  const command = `${config.command} ${config.installCmd}`;
  return executeCommand(command, cwd, timeout);
}

/**
 * Start development server
 */
export async function startDevServer(
  manager: PackageManagerName,
  cwd: string,
  port?: number
): Promise<{ process: any; ready: Promise<boolean> }> {
  const config = PACKAGE_MANAGERS.find(pm => pm.name === manager);
  if (!config) {
    throw new Error(`Unknown package manager: ${manager}`);
  }
  
  const env = { ...process.env };
  if (port) {
    env.PORT = port.toString();
  }
  
  const [command, ...args] = config.devCmd.split(' ');
  const devProcess = spawn(config.command, [command, ...args], {
    cwd,
    env,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  
  const ready = new Promise<boolean>((resolve) => {
    let output = '';
    const timeout = setTimeout(() => resolve(false), 30000); // 30s timeout
    
    const checkReady = (data: Buffer) => {
      output += data.toString();
      
      // Common patterns indicating server is ready
      const readyPatterns = [
        /ready/i,
        /started/i,
        /listening/i,
        /server running/i,
        /local:\s*http/i,
        /port \d+/i,
      ];
      
      if (readyPatterns.some(pattern => pattern.test(output))) {
        clearTimeout(timeout);
        resolve(true);
      }
    };
    
    devProcess.stdout?.on('data', checkReady);
    devProcess.stderr?.on('data', checkReady);
    
    devProcess.on('error', () => {
      clearTimeout(timeout);
      resolve(false);
    });
    
    devProcess.on('exit', (code) => {
      clearTimeout(timeout);
      resolve(code === 0);
    });
  });
  
  return { process: devProcess, ready };
}

/**
 * Create lockfile for testing
 */
export async function createLockfile(
  manager: PackageManagerName,
  cwd: string,
  minimal = true
): Promise<void> {
  const config = PACKAGE_MANAGERS.find(pm => pm.name === manager);
  if (!config) {
    throw new Error(`Unknown package manager: ${manager}`);
  }
  
  await mkdir(dirname(join(cwd, config.lockfile)), { recursive: true });
  
  let content = '';
  
  switch (manager) {
    case 'npm':
      content = minimal ? '{\n  "lockfileVersion": 3\n}' : JSON.stringify({
        name: 'test-project',
        lockfileVersion: 3,
        requires: true,
        packages: {
          "": {
            dependencies: {},
            devDependencies: {}
          }
        }
      }, null, 2);
      break;
      
    case 'yarn':
      content = minimal ? '# yarn lockfile v1\n' : `# THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.
# yarn lockfile v1

package@^1.0.0:
  version "1.0.0"
  resolved "https://registry.yarnpkg.com/package/-/package-1.0.0.tgz"
`;
      break;
      
    case 'pnpm':
      content = minimal ? 'lockfileVersion: \'6.0\'\n' : `lockfileVersion: '6.0'

settings:
  autoInstallPeers: true
  excludeLinksFromLockfile: false

dependencies: {}

devDependencies: {}
`;
      break;
      
    case 'bun':
      // Bun lockfile is binary, create minimal placeholder
      content = minimal ? 'bun-lockfile-format-v0\n' : 'bun-lockfile-format-v0\n[packages]\n';
      break;
  }
  
  writeFileSync(join(cwd, config.lockfile), content);
}

/**
 * Create workspace configuration
 */
export async function createWorkspaceConfig(
  type: 'npm' | 'yarn' | 'pnpm',
  cwd: string,
  packages = ['apps/*', 'packages/*']
): Promise<void> {
  switch (type) {
    case 'pnpm':
      const workspaceContent = `packages:\n${packages.map(pkg => `  - '${pkg}'`).join('\n')}`;
      writeFileSync(join(cwd, 'pnpm-workspace.yaml'), workspaceContent);
      break;
      
    case 'npm':
    case 'yarn':
      const packageJsonPath = join(cwd, 'package.json');
      const packageJson = existsSync(packageJsonPath) 
        ? JSON.parse(readFileSync(packageJsonPath, 'utf8'))
        : { name: 'test-workspace', private: true };
      
      packageJson.workspaces = packages;
      writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      break;
  }
}

/**
 * Cleanup test artifacts
 */
export function cleanup(processes: any[]): void {
  processes.forEach(proc => {
    if (proc && !proc.killed) {
      proc.kill('SIGTERM');
      // Force kill after 2 seconds
      setTimeout(() => {
        if (!proc.killed) {
          proc.kill('SIGKILL');
        }
      }, 2000);
    }
  });
}