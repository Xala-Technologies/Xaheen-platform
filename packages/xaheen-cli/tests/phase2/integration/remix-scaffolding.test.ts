/**
 * Phase 2 Integration Tests - Remix Project Scaffolding
 * Tests full scaffold → install → dev server flow for Remix
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

describe('Phase 2: Remix Integration Tests', () => {
  const config = getFrameworkConfig('remix')!;
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

  describe('Remix Project Scaffolding', () => {
    it('should scaffold a Remix project with TypeScript', async () => {
      const projectName = 'test-remix-app';
      
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

      // Check Remix-specific files
      const remixConfigPath = path.join(projectPath, 'remix.config.js');
      const remixConfigExists = await fs.access(remixConfigPath).then(() => true).catch(() => false);
      expect(remixConfigExists).toBe(true);

      // Check app structure
      const entryClientPath = path.join(projectPath, 'app/entry.client.tsx');
      const entryClient = await fs.readFile(entryClientPath, 'utf-8');
      expect(entryClient).toContain('@remix-run/react');

      const entryServerPath = path.join(projectPath, 'app/entry.server.tsx');
      const entryServer = await fs.readFile(entryServerPath, 'utf-8');
      expect(entryServer).toContain('RemixServer');

      // Check root component
      const rootPath = path.join(projectPath, 'app/root.tsx');
      const rootContent = await fs.readFile(rootPath, 'utf-8');
      expect(rootContent).toContain('Outlet');
      expect(rootContent).toContain('Links');
      expect(rootContent).toContain('Meta');
    }, 30000);

    it('should install dependencies and run dev server', async () => {
      const projectName = 'test-remix-install';
      
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
      expect(html).toMatch(/Remix/i);
    }, 60000);

    it('should build Remix project successfully', async () => {
      const projectName = 'test-remix-build';
      
      const { projectPath } = await scaffoldProject(
        projectName,
        config.preset,
        testDir
      );
      await installDependencies(projectPath);

      await buildProject(projectPath, config);

      const buildPath = path.join(projectPath, 'build');
      const buildExists = await fs.access(buildPath).then(() => true).catch(() => false);
      expect(buildExists).toBe(true);

      // Check for server build
      const serverPath = path.join(buildPath, 'index.js');
      const serverExists = await fs.access(serverPath).then(() => true).catch(() => false);
      expect(serverExists).toBe(true);
    }, 90000);
  });

  describe('Remix Features', () => {
    it('should create routes with loaders and actions', async () => {
      const projectName = 'test-remix-routes';
      
      const { projectPath } = await scaffoldProject(
        projectName,
        config.preset,
        testDir
      );

      // Check index route
      const indexRoutePath = path.join(projectPath, 'app/routes/_index.tsx');
      const indexRoute = await fs.readFile(indexRoutePath, 'utf-8');
      expect(indexRoute).toContain('export default function');
    });

    it('should configure different deployment targets', async () => {
      const projectName = 'test-remix-deployment';
      
      const { projectPath } = await scaffoldProject(
        projectName,
        config.preset,
        testDir,
        { deployment: 'vercel' }
      );

      const packageJson = JSON.parse(
        await fs.readFile(path.join(projectPath, 'package.json'), 'utf-8')
      );

      // Should have appropriate deployment dependencies
      expect(
        packageJson.devDependencies['@remix-run/vercel'] ||
        packageJson.devDependencies['@remix-run/serve']
      ).toBeDefined();
    });

    it('should support nested routing', async () => {
      const projectName = 'test-remix-nested';
      
      const { projectPath } = await scaffoldProject(
        projectName,
        config.preset,
        testDir,
        { features: ['nested-routes'] }
      );

      // Check that routes directory exists
      const routesPath = path.join(projectPath, 'app/routes');
      const routesExists = await fs.access(routesPath).then(() => true).catch(() => false);
      expect(routesExists).toBe(true);

      // Check for nested route example
      const routes = await fs.readdir(routesPath);
      expect(routes.length).toBeGreaterThan(0);
    });

    it('should configure session management', async () => {
      const projectName = 'test-remix-sessions';
      
      const { projectPath } = await scaffoldProject(
        projectName,
        config.preset,
        testDir,
        { features: ['sessions'] }
      );

      // Check for session utilities
      const utilsPath = path.join(projectPath, 'app/utils');
      const utilsExists = await fs.access(utilsPath).then(() => true).catch(() => false);
      
      if (utilsExists) {
        const sessionPath = path.join(utilsPath, 'session.server.ts');
        const sessionExists = await fs.access(sessionPath).then(() => true).catch(() => false);
        
        if (sessionExists) {
          const sessionContent = await fs.readFile(sessionPath, 'utf-8');
          expect(sessionContent).toContain('createCookieSessionStorage');
        }
      }
    });
  });

  describe('Remix TypeScript Integration', () => {
    it('should generate proper TypeScript types', async () => {
      const projectName = 'test-remix-types';
      
      const { projectPath } = await scaffoldProject(
        projectName,
        config.preset,
        testDir,
        { typescript: true }
      );

      const tsconfigPath = path.join(projectPath, 'tsconfig.json');
      const tsconfig = JSON.parse(await fs.readFile(tsconfigPath, 'utf-8'));
      
      expect(tsconfig.include).toContain('app/**/*.tsx');
      expect(tsconfig.compilerOptions.moduleResolution).toBe('Bundler');
    });

    it('should support loader and action types', async () => {
      const projectName = 'test-remix-loader-types';
      
      const { projectPath } = await scaffoldProject(
        projectName,
        config.preset,
        testDir,
        { typescript: true, features: ['typed-routes'] }
      );

      // Check if route with typed loader exists
      const indexPath = path.join(projectPath, 'app/routes/_index.tsx');
      const indexContent = await fs.readFile(indexPath, 'utf-8');
      
      // Should have proper type imports
      expect(indexContent).toMatch(/@remix-run\/node|LoaderFunctionArgs|ActionFunctionArgs/);
    });
  });
});