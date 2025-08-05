/**
 * Phase 2 Integration Tests - Vue (Vite) Project Scaffolding
 * Tests full scaffold → install → dev server flow for Vue
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

describe('Phase 2: Vue (Vite) Integration Tests', () => {
  const config = getFrameworkConfig('vite-vue')!;
  let testDir: string;
  let serverProcess: any;

  beforeAll(async () => {
    // Ensure CLI is built
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
    // Stop any running servers
    if (serverProcess) {
      await stopServer(serverProcess);
      serverProcess = null;
    }

    // Clean up test directory
    process.chdir('/tmp');
    await fs.rm(testDir, { recursive: true, force: true }).catch(() => {});
  });

  describe('Vue Project Scaffolding', () => {
    it('should scaffold a Vue + Vite project with TypeScript', async () => {
      const projectName = 'test-vue-app';
      
      // Scaffold project
      const { stdout, stderr, projectPath } = await scaffoldProject(
        projectName,
        config.preset,
        testDir,
        { typescript: true }
      );

      console.log('Scaffold output:', stdout);
      if (stderr) console.error('Scaffold errors:', stderr);

      // Validate project structure
      await validateProjectStructure(projectPath, config);
      await validatePackageJson(projectPath, config);

      // Check Vue-specific files
      const viteConfigPath = path.join(projectPath, 'vite.config.ts');
      const viteConfig = await fs.readFile(viteConfigPath, 'utf-8');
      expect(viteConfig).toContain('@vitejs/plugin-vue');

      // Check main.ts
      const mainPath = path.join(projectPath, 'src/main.ts');
      const mainContent = await fs.readFile(mainPath, 'utf-8');
      expect(mainContent).toContain("import { createApp } from 'vue'");
      expect(mainContent).toContain("createApp(App)");

      // Check App.vue
      const appPath = path.join(projectPath, 'src/App.vue');
      const appContent = await fs.readFile(appPath, 'utf-8');
      expect(appContent).toContain('<template>');
      expect(appContent).toContain('<script setup lang="ts">');
    }, 30000);

    it('should install dependencies and run dev server', async () => {
      const projectName = 'test-vue-install';
      
      // Scaffold project
      const { projectPath } = await scaffoldProject(
        projectName,
        config.preset,
        testDir
      );

      // Install dependencies
      await installDependencies(projectPath);

      // Verify node_modules exists
      const nodeModulesExists = await fs.access(
        path.join(projectPath, 'node_modules')
      ).then(() => true).catch(() => false);
      expect(nodeModulesExists).toBe(true);

      // Start dev server
      serverProcess = await startDevServer(projectPath, config);

      // Test server response
      const html = await testServerResponse(config.devPort);
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('Vite + Vue');
    }, 60000);

    it('should build Vue project successfully', async () => {
      const projectName = 'test-vue-build';
      
      // Scaffold and install
      const { projectPath } = await scaffoldProject(
        projectName,
        config.preset,
        testDir
      );
      await installDependencies(projectPath);

      // Build project
      await buildProject(projectPath, config);

      // Verify build output
      const distPath = path.join(projectPath, 'dist');
      const distExists = await fs.access(distPath).then(() => true).catch(() => false);
      expect(distExists).toBe(true);

      // Check for index.html in dist
      const indexPath = path.join(distPath, 'index.html');
      const indexExists = await fs.access(indexPath).then(() => true).catch(() => false);
      expect(indexExists).toBe(true);

      // Check for assets
      const assetsPath = path.join(distPath, 'assets');
      const assetsExist = await fs.access(assetsPath).then(() => true).catch(() => false);
      expect(assetsExist).toBe(true);
    }, 90000);
  });

  describe('Vue CLI Options', () => {
    it('should scaffold with Vue Router', async () => {
      const projectName = 'test-vue-router';
      
      const { projectPath } = await scaffoldProject(
        projectName,
        config.preset,
        testDir,
        { features: ['router'] }
      );

      // Check for router files
      const routerPath = path.join(projectPath, 'src/router/index.ts');
      const routerExists = await fs.access(routerPath).then(() => true).catch(() => false);
      expect(routerExists).toBe(true);

      if (routerExists) {
        const routerContent = await fs.readFile(routerPath, 'utf-8');
        expect(routerContent).toContain('createRouter');
        expect(routerContent).toContain('createWebHistory');
      }

      // Check package.json for vue-router
      const packageJson = JSON.parse(
        await fs.readFile(path.join(projectPath, 'package.json'), 'utf-8')
      );
      expect(packageJson.dependencies['vue-router']).toBeDefined();
    });

    it('should scaffold with Pinia state management', async () => {
      const projectName = 'test-vue-pinia';
      
      const { projectPath } = await scaffoldProject(
        projectName,
        config.preset,
        testDir,
        { features: ['pinia'] }
      );

      // Check for store files
      const storePath = path.join(projectPath, 'src/stores');
      const storeExists = await fs.access(storePath).then(() => true).catch(() => false);
      expect(storeExists).toBe(true);

      // Check package.json for pinia
      const packageJson = JSON.parse(
        await fs.readFile(path.join(projectPath, 'package.json'), 'utf-8')
      );
      expect(packageJson.dependencies.pinia).toBeDefined();
    });

    it('should handle dry-run mode', async () => {
      const projectName = 'test-vue-dryrun';
      
      const { stdout } = await scaffoldProject(
        projectName,
        config.preset,
        testDir,
        { dryRun: true }
      );

      expect(stdout).toContain('dry-run');
      
      // Verify no files were created
      const projectExists = await fs.access(
        path.join(testDir, projectName)
      ).then(() => true).catch(() => false);
      expect(projectExists).toBe(false);
    });
  });

  describe('Vue Component Generation', () => {
    it('should generate Vue components with TypeScript', async () => {
      const projectName = 'test-vue-components';
      
      const { projectPath } = await scaffoldProject(
        projectName,
        config.preset,
        testDir
      );

      // Check HelloWorld component
      const componentPath = path.join(projectPath, 'src/components/HelloWorld.vue');
      const componentExists = await fs.access(componentPath).then(() => true).catch(() => false);
      
      if (componentExists) {
        const componentContent = await fs.readFile(componentPath, 'utf-8');
        expect(componentContent).toContain('<script setup lang="ts">');
        expect(componentContent).toContain('defineProps');
        expect(componentContent).toContain('interface');
      }
    });
  });

  describe('Vue Error Handling', () => {
    it('should handle existing directory error', async () => {
      const projectName = 'existing-vue-project';
      
      // Create directory first
      await fs.mkdir(path.join(testDir, projectName));
      await fs.writeFile(
        path.join(testDir, projectName, 'file.txt'),
        'existing content'
      );

      // Try to scaffold in existing directory
      await expect(scaffoldProject(
        projectName,
        config.preset,
        testDir
      )).rejects.toThrow();
    });

    it('should handle missing project name', async () => {
      await expect(scaffoldProject(
        '',
        config.preset,
        testDir
      )).rejects.toThrow();
    });
  });
});