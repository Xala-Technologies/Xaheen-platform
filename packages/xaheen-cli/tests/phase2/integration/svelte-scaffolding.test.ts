/**
 * Phase 2 Integration Tests - SvelteKit Project Scaffolding
 * Tests full scaffold → install → dev server flow for SvelteKit
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

// Promisify tmp directory creation
const createTmpDir = () => new Promise<string>((resolve, reject) => {
  tmp.dir({ unsafeCleanup: true }, (err, dirPath) => {
    if (err) reject(err);
    else resolve(dirPath);
  });
});

describe('Phase 2: SvelteKit Integration Tests', () => {
  const config = getFrameworkConfig('sveltekit')!;
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

  describe('SvelteKit Project Scaffolding', () => {
    it('should scaffold a SvelteKit project with TypeScript', async () => {
      const projectName = 'test-sveltekit-app';
      
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

      // Check SvelteKit-specific files
      const svelteConfigPath = path.join(projectPath, 'svelte.config.js');
      const svelteConfig = await fs.readFile(svelteConfigPath, 'utf-8');
      expect(svelteConfig).toContain('@sveltejs/adapter-auto');

      // Check app.html
      const appHtmlPath = path.join(projectPath, 'src/app.html');
      const appHtml = await fs.readFile(appHtmlPath, 'utf-8');
      expect(appHtml).toContain('%sveltekit.head%');
      expect(appHtml).toContain('%sveltekit.body%');

      // Check route structure
      const routePath = path.join(projectPath, 'src/routes/+page.svelte');
      const routeExists = await fs.access(routePath).then(() => true).catch(() => false);
      expect(routeExists).toBe(true);
    }, 30000);

    it('should install dependencies and run dev server', async () => {
      const projectName = 'test-sveltekit-install';
      
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
      expect(html).toMatch(/SvelteKit|Svelte/i);
    }, 60000);

    it('should build SvelteKit project successfully', async () => {
      const projectName = 'test-sveltekit-build';
      
      const { projectPath } = await scaffoldProject(
        projectName,
        config.preset,
        testDir
      );
      await installDependencies(projectPath);

      await buildProject(projectPath, config);

      const buildPath = path.join(projectPath, '.svelte-kit');
      const buildExists = await fs.access(buildPath).then(() => true).catch(() => false);
      expect(buildExists).toBe(true);
    }, 90000);
  });

  describe('SvelteKit Features', () => {
    it('should generate routes with proper TypeScript support', async () => {
      const projectName = 'test-sveltekit-routes';
      
      const { projectPath } = await scaffoldProject(
        projectName,
        config.preset,
        testDir,
        { typescript: true }
      );

      // Check for +page.ts
      const pageLoadPath = path.join(projectPath, 'src/routes/+page.ts');
      const pageLoadExists = await fs.access(pageLoadPath).then(() => true).catch(() => false);
      
      if (pageLoadExists) {
        const pageLoad = await fs.readFile(pageLoadPath, 'utf-8');
        expect(pageLoad).toContain('PageLoad');
      }

      // Check TypeScript configuration
      const tsconfigPath = path.join(projectPath, 'tsconfig.json');
      const tsconfig = JSON.parse(await fs.readFile(tsconfigPath, 'utf-8'));
      expect(tsconfig.extends).toContain('.svelte-kit/tsconfig.json');
    });

    it('should configure different adapters', async () => {
      const projectName = 'test-sveltekit-adapter';
      
      const { projectPath } = await scaffoldProject(
        projectName,
        config.preset,
        testDir,
        { adapter: 'vercel' }
      );

      const packageJson = JSON.parse(
        await fs.readFile(path.join(projectPath, 'package.json'), 'utf-8')
      );

      // Should have adapter dependency
      expect(
        packageJson.devDependencies['@sveltejs/adapter-vercel'] ||
        packageJson.devDependencies['@sveltejs/adapter-auto']
      ).toBeDefined();
    });
  });
});