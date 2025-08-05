/**
 * Phase 1 Integration Tests - Next.js Project Scaffolding
 * Tests full scaffold → install → dev server flow
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import tmp from 'tmp';
import { execa, execaCommand } from 'execa';
import treeKill from 'tree-kill';
import stripAnsi from 'strip-ansi';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI_PATH = path.resolve(__dirname, '../../../dist/index.js');

// Promisify tmp directory creation
const createTmpDir = () => new Promise<string>((resolve, reject) => {
  tmp.dir({ unsafeCleanup: true }, (err, dirPath) => {
    if (err) reject(err);
    else resolve(dirPath);
  });
});

describe('Phase 1: Next.js Integration Tests', () => {
  let testDir: string;
  let serverProcess: any;

  beforeAll(async () => {
    // Ensure CLI is built
    console.log('Building CLI...');
    await execaCommand('bun run build', { 
      cwd: path.resolve(__dirname, '../../..'),
      stdio: 'inherit'
    });
  });

  beforeEach(async () => {
    testDir = await createTmpDir();
    process.chdir(testDir);
  });

  afterEach(async () => {
    // Kill any running server processes
    if (serverProcess?.pid) {
      await new Promise<void>((resolve) => {
        treeKill(serverProcess.pid, 'SIGKILL', () => {
          resolve();
        });
      });
    }

    // Clean up test directory
    process.chdir(__dirname);
    await fs.rm(testDir, { recursive: true, force: true }).catch(() => {});
  });

  describe('Project Scaffolding', () => {
    it('should scaffold a Next.js project with TypeScript', async () => {
      const projectName = 'test-nextjs-app';
      
      // Run scaffold command
      const { stdout, stderr } = await execa('node', [
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
        env: {
          ...process.env,
          XAHEEN_NO_BANNER: 'true',
        }
      });

      console.log('Scaffold output:', stripAnsi(stdout));
      if (stderr) console.error('Scaffold errors:', stripAnsi(stderr));

      // Verify project structure
      const projectPath = path.join(testDir, projectName);
      const expectedFiles = [
        'package.json',
        'tsconfig.json',
        'next.config.js',
        'src/app/page.tsx',
        'src/app/layout.tsx',
        'src/app/globals.css',
        'public/favicon.ico',
      ];

      for (const file of expectedFiles) {
        const filePath = path.join(projectPath, file);
        const exists = await fs.access(filePath).then(() => true).catch(() => false);
        expect(exists).toBe(true);
      }

      // Verify package.json content
      const packageJson = JSON.parse(
        await fs.readFile(path.join(projectPath, 'package.json'), 'utf-8')
      );

      expect(packageJson.name).toBe(projectName);
      expect(packageJson.scripts).toMatchObject({
        dev: expect.stringContaining('next dev'),
        build: expect.stringContaining('next build'),
        start: expect.stringContaining('next start'),
      });
      expect(packageJson.dependencies).toMatchObject({
        next: expect.any(String),
        react: expect.any(String),
        'react-dom': expect.any(String),
      });
      expect(packageJson.devDependencies).toMatchObject({
        '@types/node': expect.any(String),
        '@types/react': expect.any(String),
        typescript: expect.any(String),
      });
    }, 30000);

    it('should install dependencies and run dev server', async () => {
      const projectName = 'test-install-app';
      
      // Scaffold without install
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

      const projectPath = path.join(testDir, projectName);

      // Install dependencies with Bun
      console.log('Installing dependencies...');
      const installResult = await execaCommand('bun install', {
        cwd: projectPath,
        stdio: 'pipe'
      });

      expect(installResult.exitCode).toBe(0);

      // Verify node_modules exists
      const nodeModulesExists = await fs.access(
        path.join(projectPath, 'node_modules')
      ).then(() => true).catch(() => false);
      
      expect(nodeModulesExists).toBe(true);

      // Start dev server
      console.log('Starting dev server...');
      serverProcess = execaCommand('bun run dev --port=4000', {
        cwd: projectPath,
        stdio: 'pipe',
        env: {
          ...process.env,
          NODE_ENV: 'development',
        }
      });

      // Wait for server to be ready
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Server startup timeout'));
        }, 30000);

        serverProcess.stdout?.on('data', (data: Buffer) => {
          const output = data.toString();
          console.log('Server output:', output);
          
          if (output.includes('ready') || output.includes('started server') || output.includes('localhost:4000')) {
            clearTimeout(timeout);
            resolve();
          }
        });

        serverProcess.stderr?.on('data', (data: Buffer) => {
          console.error('Server error:', data.toString());
        });

        serverProcess.on('error', (error: Error) => {
          clearTimeout(timeout);
          reject(error);
        });
      });

      // Test server response
      const response = await fetch('http://localhost:4000');
      expect(response.status).toBe(200);
      
      const html = await response.text();
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html');
    }, 60000);
  });

  describe('CLI Options', () => {
    it('should respect --dry-run flag', async () => {
      const projectName = 'dry-run-project';
      
      const { stdout } = await execa('node', [
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

      // Verify dry-run output
      expect(stripAnsi(stdout)).toContain('dry-run');
      
      // Verify no files were created
      const projectExists = await fs.access(
        path.join(testDir, projectName)
      ).then(() => true).catch(() => false);
      
      expect(projectExists).toBe(false);
    });

    it('should handle --ci flag for CI environments', async () => {
      const projectName = 'ci-project';
      
      const { stdout, exitCode } = await execa('node', [
        CLI_PATH,
        'project',
        'create',
        projectName,
        '--preset=nextjs',
        '--ci=github',
        '--no-install',
        '--skip-git'
      ], {
        cwd: testDir,
        env: { XAHEEN_NO_BANNER: 'true' }
      });

      expect(exitCode).toBe(0);

      // Verify GitHub Actions workflow was created
      const workflowPath = path.join(testDir, projectName, '.github/workflows/ci.yml');
      const workflowExists = await fs.access(workflowPath).then(() => true).catch(() => false);
      
      expect(workflowExists).toBe(true);

      if (workflowExists) {
        const workflowContent = await fs.readFile(workflowPath, 'utf-8');
        expect(workflowContent).toContain('name: CI');
        expect(workflowContent).toContain('on:');
        expect(workflowContent).toContain('push:');
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle missing project name', async () => {
      await expect(execa('node', [
        CLI_PATH,
        'project',
        'create',
        '--preset=nextjs'
      ], {
        cwd: testDir,
        env: { XAHEEN_NO_BANNER: 'true' }
      })).rejects.toThrow();
    });

    it('should handle existing directory', async () => {
      const projectName = 'existing-project';
      
      // Create directory first
      await fs.mkdir(path.join(testDir, projectName));
      await fs.writeFile(
        path.join(testDir, projectName, 'file.txt'),
        'existing content'
      );

      // Try to scaffold in existing directory
      await expect(execa('node', [
        CLI_PATH,
        'project',
        'create',
        projectName,
        '--preset=nextjs'
      ], {
        cwd: testDir,
        env: { XAHEEN_NO_BANNER: 'true' }
      })).rejects.toThrow();
    });
  });
});

describe('Smoke Test Validation', () => {
  it('should validate Next.js build output', async () => {
    const testDir = await createTmpDir();
    const projectName = 'build-test-app';

    try {
      // Scaffold project
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

      const projectPath = path.join(testDir, projectName);

      // Install and build
      await execaCommand('bun install', { cwd: projectPath });
      const buildResult = await execaCommand('bun run build', { 
        cwd: projectPath,
        stdio: 'pipe'
      });

      expect(buildResult.exitCode).toBe(0);

      // Verify build output
      const buildDir = path.join(projectPath, '.next');
      const buildExists = await fs.access(buildDir).then(() => true).catch(() => false);
      expect(buildExists).toBe(true);

      // Check for static files
      const staticDir = path.join(buildDir, 'static');
      const staticExists = await fs.access(staticDir).then(() => true).catch(() => false);
      expect(staticExists).toBe(true);
    } finally {
      await fs.rm(testDir, { recursive: true, force: true }).catch(() => {});
    }
  }, 90000);
});