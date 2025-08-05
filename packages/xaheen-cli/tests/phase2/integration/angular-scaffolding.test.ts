/**
 * Phase 2 Integration Tests - Angular Project Scaffolding
 * Tests full scaffold → install → dev server flow for Angular
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

describe('Phase 2: Angular Integration Tests', () => {
  const config = getFrameworkConfig('angular')!;
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

  describe('Angular Project Scaffolding', () => {
    it('should scaffold an Angular project with TypeScript', async () => {
      const projectName = 'test-angular-app';
      
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

      // Check Angular-specific files
      const angularJsonPath = path.join(projectPath, 'angular.json');
      const angularJson = JSON.parse(await fs.readFile(angularJsonPath, 'utf-8'));
      expect(angularJson.projects[projectName]).toBeDefined();

      // Check app module
      const appModulePath = path.join(projectPath, 'src/app/app.module.ts');
      const appModule = await fs.readFile(appModulePath, 'utf-8');
      expect(appModule).toContain('@NgModule');
      expect(appModule).toContain('BrowserModule');

      // Check app component
      const appComponentPath = path.join(projectPath, 'src/app/app.component.ts');
      const appComponent = await fs.readFile(appComponentPath, 'utf-8');
      expect(appComponent).toContain('@Component');
    }, 30000);

    it('should install dependencies and run dev server', async () => {
      const projectName = 'test-angular-install';
      
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
      expect(html).toMatch(/Angular/i);
    }, 90000); // Angular takes longer to start

    it('should build Angular project successfully', async () => {
      const projectName = 'test-angular-build';
      
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

      // Check for built files
      const projectDistPath = path.join(distPath, projectName);
      const projectDistExists = await fs.access(projectDistPath).then(() => true).catch(() => false);
      expect(projectDistExists).toBe(true);
    }, 120000); // Angular builds can be slow
  });

  describe('Angular Features', () => {
    it('should configure Angular Material', async () => {
      const projectName = 'test-angular-material';
      
      const { projectPath } = await scaffoldProject(
        projectName,
        config.preset,
        testDir,
        { features: ['material'] }
      );

      const packageJson = JSON.parse(
        await fs.readFile(path.join(projectPath, 'package.json'), 'utf-8')
      );

      expect(packageJson.dependencies['@angular/material']).toBeDefined();
      expect(packageJson.dependencies['@angular/cdk']).toBeDefined();
    });

    it('should configure routing', async () => {
      const projectName = 'test-angular-routing';
      
      const { projectPath } = await scaffoldProject(
        projectName,
        config.preset,
        testDir,
        { features: ['routing'] }
      );

      const appRoutingPath = path.join(projectPath, 'src/app/app-routing.module.ts');
      const routingExists = await fs.access(appRoutingPath).then(() => true).catch(() => false);
      
      if (routingExists) {
        const routing = await fs.readFile(appRoutingPath, 'utf-8');
        expect(routing).toContain('RouterModule');
        expect(routing).toContain('Routes');
      }

      // Check app.component.html for router-outlet
      const appTemplatePath = path.join(projectPath, 'src/app/app.component.html');
      const appTemplate = await fs.readFile(appTemplatePath, 'utf-8');
      expect(appTemplate).toContain('<router-outlet>');
    });

    it('should configure strict TypeScript', async () => {
      const projectName = 'test-angular-strict';
      
      const { projectPath } = await scaffoldProject(
        projectName,
        config.preset,
        testDir,
        { typescript: true, strict: true }
      );

      const tsconfigPath = path.join(projectPath, 'tsconfig.json');
      const tsconfig = JSON.parse(await fs.readFile(tsconfigPath, 'utf-8'));
      
      expect(tsconfig.compilerOptions.strict).toBe(true);
      expect(tsconfig.angularCompilerOptions?.strictTemplates).toBe(true);
    });
  });
});