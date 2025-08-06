/**
 * Phase 2 E2E Tests - Framework Matrix
 * Runs the same test suite across all supported frameworks
 */

import { describe, it, expect } from 'bun:test';
import { promises as fs } from 'fs';
import path from 'path';
import tmp from 'tmp';
import { runMatrixTests, createMatrixTest } from '../utils/matrix-runner';
import {
  scaffoldProject,
  installDependencies,
  startDevServer,
  stopServer,
  buildProject,
  testServerResponse,
} from '../utils/framework-helpers';

// Promisify tmp directory creation
const createTmpDir = () => new Promise<string>((resolve, reject) => {
  tmp.dir({ unsafeCleanup: true }, (err, dirPath) => {
    if (err) reject(err);
    else resolve(dirPath);
  });
});

const matrixTests = [
  createMatrixTest(
    'should scaffold, install, and start dev server',
    async (config) => {
      const testDir = await createTmpDir();
      let serverProcess: any;

      try {
        process.chdir(testDir);
        const projectName = `test-${config.name}-e2e`;

        // Scaffold project
        console.log(`Scaffolding ${config.displayName} project...`);
        const { projectPath } = await scaffoldProject(
          projectName,
          config.preset,
          testDir,
          { typescript: true }
        );

        // Install dependencies
        console.log(`Installing dependencies for ${config.displayName}...`);
        await installDependencies(projectPath);

        // Start dev server
        console.log(`Starting ${config.displayName} dev server...`);
        serverProcess = await startDevServer(projectPath, config);

        // Test server response
        console.log(`Testing ${config.displayName} server response...`);
        const html = await testServerResponse(config.devPort);
        
        expect(html).toContain('<!DOCTYPE html');
        expect(html.length).toBeGreaterThan(100);

        // Framework-specific assertions
        switch (config.name) {
          case 'vue':
            expect(html).toMatch(/Vite|Vue/i);
            break;
          case 'svelte':
            expect(html).toMatch(/SvelteKit|Svelte/i);
            break;
          case 'angular':
            expect(html).toMatch(/Angular/i);
            break;
          case 'solid':
            expect(html).toMatch(/Solid/i);
            break;
          case 'remix':
            expect(html).toMatch(/Remix/i);
            break;
        }
      } finally {
        if (serverProcess) {
          await stopServer(serverProcess);
        }
        process.chdir('/tmp');
        await fs.rm(testDir, { recursive: true, force: true }).catch(() => {});
      }
    },
    90000 // 90 second timeout
  ),

  createMatrixTest(
    'should build project successfully',
    async (config) => {
      const testDir = await createTmpDir();

      try {
        process.chdir(testDir);
        const projectName = `test-${config.name}-build`;

        // Scaffold project
        console.log(`Scaffolding ${config.displayName} for build test...`);
        const { projectPath } = await scaffoldProject(
          projectName,
          config.preset,
          testDir,
          { typescript: true }
        );

        // Install dependencies
        console.log(`Installing dependencies for ${config.displayName} build...`);
        await installDependencies(projectPath);

        // Build project
        console.log(`Building ${config.displayName} project...`);
        await buildProject(projectPath, config);

        // Verify build output exists
        const expectedBuildDirs = ['dist', 'build', '.next', '.svelte-kit', '.output'];
        let buildDirFound = false;

        for (const dir of expectedBuildDirs) {
          const dirPath = path.join(projectPath, dir);
          const exists = await fs.access(dirPath).then(() => true).catch(() => false);
          if (exists) {
            buildDirFound = true;
            console.log(`Found build directory: ${dir}`);
            
            // Check for index.html or similar entry point
            const possibleEntryPoints = ['index.html', '.next/BUILD_ID', 'server/index.mjs'];
            let entryPointFound = false;
            
            for (const entry of possibleEntryPoints) {
              const entryPath = path.join(dirPath, entry);
              const entryExists = await fs.access(entryPath).then(() => true).catch(() => false);
              if (entryExists) {
                entryPointFound = true;
                break;
              }
            }
            
            if (dir !== '.next') { // Next.js doesn't have index.html
              expect(entryPointFound).toBe(true);
            }
            break;
          }
        }

        expect(buildDirFound).toBe(true);
      } finally {
        process.chdir('/tmp');
        await fs.rm(testDir, { recursive: true, force: true }).catch(() => {});
      }
    },
    120000 // 120 second timeout
  ),

  createMatrixTest(
    'should generate valid package.json with correct dependencies',
    async (config) => {
      const testDir = await createTmpDir();

      try {
        process.chdir(testDir);
        const projectName = `test-${config.name}-deps`;

        // Scaffold project
        const { projectPath } = await scaffoldProject(
          projectName,
          config.preset,
          testDir,
          { typescript: true }
        );

        // Read and validate package.json
        const packageJsonPath = path.join(projectPath, 'package.json');
        const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));

        // Common assertions
        expect(packageJson.name).toBe(projectName);
        expect(packageJson.version).toBeDefined();
        expect(packageJson.scripts).toBeDefined();
        expect(packageJson.dependencies).toBeDefined();
        expect(packageJson.devDependencies).toBeDefined();

        // Check for required scripts
        expect(packageJson.scripts[config.devCommand]).toBeDefined();
        expect(packageJson.scripts[config.buildCommand]).toBeDefined();

        // Check for framework-specific dependencies
        for (const dep of config.expectedDependencies) {
          expect(packageJson.dependencies[dep]).toBeDefined();
        }

        // Check for TypeScript in devDependencies
        expect(packageJson.devDependencies.typescript).toBeDefined();
      } finally {
        process.chdir('/tmp');
        await fs.rm(testDir, { recursive: true, force: true }).catch(() => {});
      }
    },
    30000 // 30 second timeout
  ),

  createMatrixTest(
    'should create TypeScript configuration',
    async (config) => {
      const testDir = await createTmpDir();

      try {
        process.chdir(testDir);
        const projectName = `test-${config.name}-ts`;

        // Scaffold project
        const { projectPath } = await scaffoldProject(
          projectName,
          config.preset,
          testDir,
          { typescript: true }
        );

        // Check for TypeScript config
        const tsconfigPath = path.join(projectPath, 'tsconfig.json');
        const tsconfigExists = await fs.access(tsconfigPath).then(() => true).catch(() => false);
        expect(tsconfigExists).toBe(true);

        if (tsconfigExists) {
          const tsconfig = JSON.parse(await fs.readFile(tsconfigPath, 'utf-8'));
          expect(tsconfig.compilerOptions).toBeDefined();
          expect(tsconfig.compilerOptions.strict).toBeDefined();
          
          // Framework-specific TypeScript checks
          switch (config.name) {
            case 'vue':
              expect(tsconfig.include).toContain('src/**/*.vue');
              break;
            case 'svelte':
              expect(tsconfig.include?.some((p: string) => p.includes('.svelte'))).toBe(true);
              break;
            case 'angular':
              expect(tsconfig.compilerOptions.experimentalDecorators).toBe(true);
              break;
            case 'solid':
              expect(tsconfig.compilerOptions.jsx).toBe('preserve');
              expect(tsconfig.compilerOptions.jsxImportSource).toBe('solid-js');
              break;
            case 'remix':
              expect(tsconfig.include).toContain('app/**/*.tsx');
              break;
          }
        }
      } finally {
        process.chdir('/tmp');
        await fs.rm(testDir, { recursive: true, force: true }).catch(() => {});
      }
    },
    30000 // 30 second timeout
  ),
];

// Run the matrix tests
runMatrixTests('Phase 2: Framework Matrix E2E Tests', matrixTests, {
  // Optionally skip certain frameworks during development
  // skipFrameworks: ['angular'], // Angular takes longer to scaffold
});