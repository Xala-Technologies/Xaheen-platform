/**
 * Phase 2 Integration Tests - Solid + Vite Project Scaffolding
 * Tests full scaffold → install → dev server flow for Solid
 */

import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import tmp from 'tmp';
import { getFrameworkConfig } from '../config/frameworks.config';
import {
  scaffoldProject,
  installDependencies,
  startDevServer,
  stopServer,
  buildProject,
  validateProjectStructure,
  validatePackageJson,
  testServerResponse,
  CLI_PATH,
} from '../utils/framework-helpers';

const createTmpDir = () => new Promise<string>((resolve, reject) => {
  tmp.dir({ unsafeCleanup: true }, (err, dirPath) => {
    if (err) reject(err);
    else resolve(dirPath);
  });
});

describe('Phase 2: Solid + Vite Integration Tests', () => {
  const config = getFrameworkConfig('solid-vite')!;
  let testDir: string;
  let serverProcess: any;

  beforeAll(async () => {
    console.log('Ensuring CLI is built...');
    const cliExists = await fs.access(CLI_PATH).then(() => true).catch(() => false);
    if (!cliExists) {
      throw new Error('CLI not built. Run "bun run build" first.');
    }
  });

  beforeEach(async () => {
    testDir = await createTmpDir();
    process.chdir(testDir);
  });

  afterEach(async () => {
    if (serverProcess) {
      await stopServer(serverProcess);
      serverProcess = null;
    }

    process.chdir('/tmp');
    await fs.rm(testDir, { recursive: true, force: true }).catch(() => {});
  });

  describe('Solid Project Scaffolding', () => {
    it('should scaffold a Solid + Vite project with TypeScript', async () => {
      const projectName = 'test-solid-app';
      
      const { stdout, stderr, projectPath } = await scaffoldProject(
        projectName,
        config.preset,
        testDir,
        { typescript: true }
      );

      console.log('Scaffold output:', stdout);
      if (stderr) console.error('Scaffold errors:', stderr);

      await validateProjectStructure(projectPath, config);
      await validatePackageJson(projectPath, config);

      // Check Solid-specific files
      const viteConfigPath = path.join(projectPath, 'vite.config.ts');
      const viteConfig = await fs.readFile(viteConfigPath, 'utf-8');
      expect(viteConfig).toContain('vite-plugin-solid');

      // Check index.tsx
      const indexPath = path.join(projectPath, 'src/index.tsx');
      const indexContent = await fs.readFile(indexPath, 'utf-8');
      expect(indexContent).toContain('render');
      expect(indexContent).toContain('solid-js');

      // Check App.tsx
      const appPath = path.join(projectPath, 'src/App.tsx');
      const appContent = await fs.readFile(appPath, 'utf-8');
      expect(appContent).toContain('Component');
      expect(appContent).toContain('createSignal');
    }, 30000);

    it('should install dependencies and run dev server', async () => {
      const projectName = 'test-solid-install';
      
      const { projectPath } = await scaffoldProject(
        projectName,
        config.preset,
        testDir
      );

      await installDependencies(projectPath);

      const nodeModulesExists = await fs.access(
        path.join(projectPath, 'node_modules')
      ).then(() => true).catch(() => false);
      expect(nodeModulesExists).toBe(true);

      serverProcess = await startDevServer(projectPath, config);

      const html = await testServerResponse(config.devPort);
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toMatch(/Solid|Vite/i);
    }, 60000);

    it('should build Solid project successfully', async () => {
      const projectName = 'test-solid-build';
      
      const { projectPath } = await scaffoldProject(
        projectName,
        config.preset,
        testDir
      );
      await installDependencies(projectPath);

      await buildProject(projectPath, config);

      const distPath = path.join(projectPath, 'dist');
      const distExists = await fs.access(distPath).then(() => true).catch(() => false);
      expect(distExists).toBe(true);

      // Check for assets
      const assetsPath = path.join(distPath, 'assets');
      const assetsExist = await fs.access(assetsPath).then(() => true).catch(() => false);
      expect(assetsExist).toBe(true);
    }, 90000);
  });

  describe('Solid Features', () => {
    it('should configure Solid Router', async () => {
      const projectName = 'test-solid-router';
      
      const { projectPath } = await scaffoldProject(
        projectName,
        config.preset,
        testDir,
        { features: ['router'] }
      );

      const packageJson = JSON.parse(
        await fs.readFile(path.join(projectPath, 'package.json'), 'utf-8')
      );

      expect(packageJson.dependencies['@solidjs/router']).toBeDefined();
    });

    it('should configure TypeScript with JSX preserve', async () => {
      const projectName = 'test-solid-ts';
      
      const { projectPath } = await scaffoldProject(
        projectName,
        config.preset,
        testDir,
        { typescript: true }
      );

      const tsconfigPath = path.join(projectPath, 'tsconfig.json');
      const tsconfig = JSON.parse(await fs.readFile(tsconfigPath, 'utf-8'));
      
      expect(tsconfig.compilerOptions.jsx).toBe('preserve');
      expect(tsconfig.compilerOptions.jsxImportSource).toBe('solid-js');
    });

    it('should create fine-grained reactive components', async () => {
      const projectName = 'test-solid-reactivity';
      
      const { projectPath } = await scaffoldProject(
        projectName,
        config.preset,
        testDir
      );

      const appPath = path.join(projectPath, 'src/App.tsx');
      const appContent = await fs.readFile(appPath, 'utf-8');
      
      // Should use Solid's reactive primitives
      expect(appContent).toMatch(/createSignal|createMemo|createEffect/);
      
      // Should use JSX without React import
      expect(appContent).not.toContain("import React");
      expect(appContent).toContain('return (');
    });
  });
});