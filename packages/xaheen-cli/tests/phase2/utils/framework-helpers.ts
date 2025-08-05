/**
 * Framework-specific helpers for Phase 2 Testing
 */

import { promises as fs } from 'fs';
import path from 'path';
import { execa, execaCommand } from 'execa';
import { fileURLToPath } from 'url';
import treeKill from 'tree-kill';
import type { FrameworkConfig } from '../config/frameworks.config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const CLI_PATH = path.resolve(__dirname, '../../../../dist/index.js');

export interface ServerProcess {
  process: any;
  port: number;
  framework: string;
}

export async function scaffoldProject(
  projectName: string,
  preset: string,
  testDir: string,
  options: {
    typescript?: boolean;
    skipInstall?: boolean;
    skipGit?: boolean;
    ci?: string;
  } = {}
): Promise<{ stdout: string; stderr: string; projectPath: string }> {
  const args = [
    CLI_PATH,
    'project',
    'create',
    projectName,
    `--preset=${preset}`,
  ];

  if (options.typescript !== false) {
    args.push('--typescript');
  }
  if (options.skipInstall !== false) {
    args.push('--no-install');
  }
  if (options.skipGit !== false) {
    args.push('--skip-git');
  }
  if (options.ci) {
    args.push(`--ci=${options.ci}`);
  }

  const result = await execa('node', args, {
    cwd: testDir,
    env: {
      ...process.env,
      XAHEEN_NO_BANNER: 'true',
    },
  });

  return {
    stdout: result.stdout,
    stderr: result.stderr,
    projectPath: path.join(testDir, projectName),
  };
}

export async function installDependencies(
  projectPath: string,
  packageManager: 'bun' | 'npm' | 'yarn' | 'pnpm' = 'bun'
): Promise<void> {
  console.log(`Installing dependencies with ${packageManager}...`);
  
  const commands = {
    bun: 'bun install',
    npm: 'npm install',
    yarn: 'yarn install',
    pnpm: 'pnpm install',
  };

  const result = await execaCommand(commands[packageManager], {
    cwd: projectPath,
    stdio: 'pipe',
  });

  if (result.exitCode !== 0) {
    throw new Error(`Failed to install dependencies: ${result.stderr}`);
  }
}

export async function startDevServer(
  projectPath: string,
  config: FrameworkConfig,
  packageManager: 'bun' | 'npm' | 'yarn' | 'pnpm' = 'bun'
): Promise<ServerProcess> {
  console.log(`Starting ${config.displayName} dev server...`);

  const command = `${packageManager} run ${config.devCommand} --port=${config.devPort}`;
  
  const serverProcess = execaCommand(command, {
    cwd: projectPath,
    stdio: 'pipe',
    env: {
      ...process.env,
      NODE_ENV: 'development',
      PORT: config.devPort.toString(),
    },
  });

  // Wait for server to be ready
  await waitForServer(serverProcess, config.serverReadyPattern, config.devPort);

  return {
    process: serverProcess,
    port: config.devPort,
    framework: config.name,
  };
}

export async function waitForServer(
  serverProcess: any,
  readyPattern: RegExp,
  port: number,
  timeout: number = 30000
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Server startup timeout for port ${port}`));
    }, timeout);

    let output = '';

    const checkOutput = (data: Buffer): void => {
      const chunk = data.toString();
      output += chunk;
      console.log(`Server output: ${chunk}`);

      if (readyPattern.test(output)) {
        clearTimeout(timeoutId);
        resolve();
      }
    };

    serverProcess.stdout?.on('data', checkOutput);
    serverProcess.stderr?.on('data', (data: Buffer) => {
      console.error(`Server error: ${data.toString()}`);
    });

    serverProcess.on('error', (error: Error) => {
      clearTimeout(timeoutId);
      reject(error);
    });

    serverProcess.on('exit', (code: number) => {
      clearTimeout(timeoutId);
      reject(new Error(`Server process exited with code ${code}`));
    });
  });
}

export async function stopServer(serverProcess: ServerProcess): Promise<void> {
  if (serverProcess.process?.pid) {
    await new Promise<void>((resolve) => {
      treeKill(serverProcess.process.pid, 'SIGKILL', () => {
        resolve();
      });
    });
  }
}

export async function buildProject(
  projectPath: string,
  config: FrameworkConfig,
  packageManager: 'bun' | 'npm' | 'yarn' | 'pnpm' = 'bun'
): Promise<void> {
  console.log(`Building ${config.displayName} project...`);

  const command = `${packageManager} run ${config.buildCommand}`;
  
  const result = await execaCommand(command, {
    cwd: projectPath,
    stdio: 'pipe',
    env: {
      ...process.env,
      NODE_ENV: 'production',
    },
  });

  if (result.exitCode !== 0) {
    throw new Error(`Build failed: ${result.stderr}`);
  }
}

export async function validateProjectStructure(
  projectPath: string,
  config: FrameworkConfig
): Promise<void> {
  const actualFiles: string[] = [];

  async function scanDir(dir: string, baseDir: string = projectPath): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(baseDir, fullPath);
      
      if (entry.isDirectory()) {
        if (!['node_modules', '.git', 'dist', 'build', '.next'].includes(entry.name)) {
          await scanDir(fullPath, baseDir);
        }
      } else {
        actualFiles.push(relativePath);
      }
    }
  }

  await scanDir(projectPath);

  // Check for expected files
  for (const expectedFile of config.expectedFiles) {
    const exists = actualFiles.some(file => file === expectedFile || file.endsWith(expectedFile));
    if (!exists) {
      throw new Error(`Missing expected file: ${expectedFile}`);
    }
  }
}

export async function validatePackageJson(
  projectPath: string,
  config: FrameworkConfig
): Promise<void> {
  const packageJsonPath = path.join(projectPath, 'package.json');
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));

  // Check dependencies
  for (const dep of config.expectedDependencies) {
    if (!packageJson.dependencies?.[dep]) {
      throw new Error(`Missing expected dependency: ${dep}`);
    }
  }

  // Check devDependencies
  for (const devDep of config.expectedDevDependencies) {
    if (!packageJson.devDependencies?.[devDep]) {
      throw new Error(`Missing expected devDependency: ${devDep}`);
    }
  }

  // Check scripts
  if (!packageJson.scripts?.[config.devCommand]) {
    throw new Error(`Missing dev script: ${config.devCommand}`);
  }
  if (!packageJson.scripts?.[config.buildCommand]) {
    throw new Error(`Missing build script: ${config.buildCommand}`);
  }
}

export async function testServerResponse(port: number): Promise<string> {
  const maxRetries = 3;
  let lastError: Error | undefined;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(`http://localhost:${port}`);
      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }
      return await response.text();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  throw lastError || new Error('Failed to connect to server');
}