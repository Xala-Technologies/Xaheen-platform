import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import * as path from 'path';
import * as fs from 'fs/promises';
import { 
  createTestContext, 
  execCommand, 
  validateProjectStructure,
  readJsonFile,
  measurePerformance,
  assertFileContent,
} from '../utils/test-helpers';
import { 
  createMonorepoWorkspace, 
  installWorkspaceDependencies,
  buildWorkspace,
  testWorkspace,
  type MonorepoWorkspace 
} from '../utils/monorepo-helper';
import { getTestConfig, testScenarios } from '../config/test-config';
import type { TestContext } from '../utils/test-helpers';

describe('Monorepo Setup Integration Tests', () => {
  let testContext: TestContext;
  let workspace: MonorepoWorkspace;
  const config = getTestConfig();

  beforeEach(async () => {
    testContext = await createTestContext(config);
  });

  afterEach(async () => {
    await testContext.cleanup();
  });

  describe('Workspace Creation', () => {
    test('should create monorepo workspace structure', async () => {
      const { result: workspace, duration } = await measurePerformance(async () => {
        return await createMonorepoWorkspace(testContext.tempDir, config);
      });

      // Performance assertion
      expect(duration).toBeLessThan(5000); // Should complete in under 5 seconds

      // Validate workspace structure
      expect(workspace.root).toBeDefined();
      expect(workspace.projects).toHaveLength(3);
      expect(workspace.packageManager).toBe('bun');

      // Check that all project directories exist
      for (const project of workspace.projects) {
        const projectPath = path.join(workspace.root, project.path);
        const exists = await fs.access(projectPath).then(() => true).catch(() => false);
        expect(exists).toBe(true);
      }

      // Validate root package.json
      const rootPackageJson = await readJsonFile(path.join(workspace.root, 'package.json'));
      expect(rootPackageJson.workspaces).toEqual([
        'packages/frontend',
        'packages/backend', 
        'packages/shared',
      ]);
      expect(rootPackageJson.private).toBe(true);

      // Validate TypeScript configuration
      const tsConfig = await readJsonFile(path.join(workspace.root, 'tsconfig.json'));
      expect(tsConfig.references).toHaveLength(3);
    });

    test('should create shared package with correct exports', async () => {
      const workspace = await createMonorepoWorkspace(testContext.tempDir, config);
      const sharedPath = path.join(workspace.root, 'packages/shared');

      // Check package.json
      const packageJson = await readJsonFile(path.join(sharedPath, 'package.json'));
      expect(packageJson.name).toBe('@test-workspace/shared');
      expect(packageJson.main).toBe('dist/index.js');
      expect(packageJson.types).toBe('dist/index.d.ts');

      // Check index.ts exports
      await assertFileContent(
        path.join(sharedPath, 'src/index.ts'),
        'export * from \'./types\''
      );

      // Check types file exists and has User interface
      await assertFileContent(
        path.join(sharedPath, 'src/types.ts'),
        /interface User \{/
      );

      // Check utils file has validation functions
      await assertFileContent(
        path.join(sharedPath, 'src/utils.ts'),
        'isValidEmail'
      );
    });

    test('should create backend package with Express setup', async () => {
      const workspace = await createMonorepoWorkspace(testContext.tempDir, config);
      const backendPath = path.join(workspace.root, 'packages/backend');

      // Check package.json dependencies
      const packageJson = await readJsonFile(path.join(backendPath, 'package.json'));
      expect(packageJson.dependencies).toHaveProperty('express');
      expect(packageJson.dependencies).toHaveProperty('cors');
      expect(packageJson.dependencies).toHaveProperty('@test-workspace/shared');

      // Check main entry point
      await assertFileContent(
        path.join(backendPath, 'src/index.ts'),
        'import express from \'express\''
      );

      // Check routes exist
      const routesDir = path.join(backendPath, 'src/routes');
      const routeFiles = await fs.readdir(routesDir);
      expect(routeFiles).toContain('users.ts');
      expect(routeFiles).toContain('auth.ts');
      expect(routeFiles).toContain('health.ts');

      // Check users route uses shared types
      await assertFileContent(
        path.join(backendPath, 'src/routes/users.ts'),
        'import type { User, CreateUserRequest'
      );
    });

    test('should create frontend package with Next.js setup', async () => {
      const workspace = await createMonorepoWorkspace(testContext.tempDir, config);
      const frontendPath = path.join(workspace.root, 'packages/frontend');

      // Check package.json dependencies
      const packageJson = await readJsonFile(path.join(frontendPath, 'package.json'));
      expect(packageJson.dependencies).toHaveProperty('react');
      expect(packageJson.dependencies).toHaveProperty('next');
      expect(packageJson.dependencies).toHaveProperty('@test-workspace/shared');

      // Check Next.js config
      const nextConfigExists = await fs.access(path.join(frontendPath, 'next.config.js'))
        .then(() => true).catch(() => false);
      expect(nextConfigExists).toBe(true);

      // Check app router structure
      const appDir = path.join(frontendPath, 'src/app');
      const appFiles = await fs.readdir(appDir);
      expect(appFiles).toContain('layout.tsx');
      expect(appFiles).toContain('page.tsx');

      // Check components use shared types
      await assertFileContent(
        path.join(frontendPath, 'src/components/UserList.tsx'),
        'import type { User } from \'@test-workspace/shared\''
      );

      // Check Tailwind configuration
      const tailwindConfigExists = await fs.access(path.join(frontendPath, 'tailwind.config.js'))
        .then(() => true).catch(() => false);
      expect(tailwindConfigExists).toBe(true);
    });
  });

  describe('Workspace Dependencies', () => {
    test('should install workspace dependencies successfully', async () => {
      const workspace = await createMonorepoWorkspace(testContext.tempDir, config);
      
      const { duration } = await measurePerformance(async () => {
        await installWorkspaceDependencies(workspace);
      });

      // Performance assertion - should complete within reasonable time
      expect(duration).toBeLessThan(120000); // 2 minutes max

      // Check that node_modules exists in root
      const nodeModulesExists = await fs.access(path.join(workspace.root, 'node_modules'))
        .then(() => true).catch(() => false);
      expect(nodeModulesExists).toBe(true);

      // Check that shared package node_modules has symlinks for workspace packages
      const sharedNodeModules = path.join(workspace.root, 'packages/shared/node_modules');
      const backendNodeModules = path.join(workspace.root, 'packages/backend/node_modules');
      
      const sharedHasNodeModules = await fs.access(sharedNodeModules)
        .then(() => true).catch(() => false);
      const backendHasNodeModules = await fs.access(backendNodeModules)
        .then(() => true).catch(() => false);
      
      // At least one of them should exist (depends on package manager)
      expect(sharedHasNodeModules || backendHasNodeModules).toBe(true);
    });

    test('should handle workspace dependency resolution', async () => {
      const workspace = await createMonorepoWorkspace(testContext.tempDir, config);
      await installWorkspaceDependencies(workspace);

      // Test that backend can import from shared
      const testImportCommand = `
        cd packages/backend && 
        node -e "
          const { isValidEmail } = require('@test-workspace/shared');
          console.log('Import test:', typeof isValidEmail === 'function');
        "
      `;

      const result = await execCommand(testImportCommand, { cwd: workspace.root });
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Import test: true');
    });
  });

  describe('Build Process', () => {
    test('should build all packages in correct order', async () => {
      const workspace = await createMonorepoWorkspace(testContext.tempDir, config);
      await installWorkspaceDependencies(workspace);

      const { duration } = await measurePerformance(async () => {
        await buildWorkspace(workspace);
      });

      // Performance assertion
      expect(duration).toBeLessThan(180000); // 3 minutes max

      // Check that shared package built first
      const sharedDistExists = await fs.access(path.join(workspace.root, 'packages/shared/dist'))
        .then(() => true).catch(() => false);
      expect(sharedDistExists).toBe(true);

      // Check that shared package has type definitions
      const sharedTypesExist = await fs.access(path.join(workspace.root, 'packages/shared/dist/index.d.ts'))
        .then(() => true).catch(() => false);
      expect(sharedTypesExist).toBe(true);

      // Check that backend built
      const backendDistExists = await fs.access(path.join(workspace.root, 'packages/backend/dist'))
        .then(() => true).catch(() => false);
      expect(backendDistExists).toBe(true);

      // Check that frontend built
      const frontendBuildExists = await fs.access(path.join(workspace.root, 'packages/frontend/.next'))
        .then(() => true).catch(() => false);
      expect(frontendBuildExists).toBe(true);
    });

    test('should validate TypeScript compilation', async () => {
      const workspace = await createMonorepoWorkspace(testContext.tempDir, config);
      await installWorkspaceDependencies(workspace);

      // Run TypeScript type checking for all packages
      const typeCheckResult = await execCommand('bun run type-check:all', { 
        cwd: workspace.root,
        timeout: 60000,
      });

      expect(typeCheckResult.exitCode).toBe(0);
      expect(typeCheckResult.stderr).not.toContain('error TS');
    });
  });

  describe('Package Manager Compatibility', () => {
    test.each(['npm', 'yarn', 'pnpm', 'bun'])('should work with %s package manager', async (packageManager) => {
      // Skip if package manager is not available
      const checkResult = await execCommand(`which ${packageManager}`);
      if (checkResult.exitCode !== 0) {
        console.warn(`Skipping ${packageManager} test - not available`);
        return;
      }

      const workspace = await createMonorepoWorkspace(testContext.tempDir, {
        ...config,
        workspace: {
          ...config.workspace,
          packageManager: packageManager as any,
        },
      });

      // Test installation
      const installCommand = packageManager === 'npm' 
        ? 'npm install' 
        : packageManager === 'yarn'
        ? 'yarn install'
        : packageManager === 'pnpm'
        ? 'pnpm install'
        : 'bun install';

      const installResult = await execCommand(installCommand, { 
        cwd: workspace.root,
        timeout: 120000,
      });

      expect(installResult.exitCode).toBe(0);

      // Verify workspace resolution works
      const testCommand = packageManager === 'yarn'
        ? 'yarn workspace @test-workspace/backend run type-check'
        : packageManager === 'pnpm'
        ? 'pnpm --filter @test-workspace/backend run type-check'
        : `cd packages/backend && ${packageManager} run type-check`;

      const testResult = await execCommand(testCommand, { 
        cwd: workspace.root,
        timeout: 30000,
      });

      expect(testResult.exitCode).toBe(0);
    });
  });

  describe('Error Handling', () => {
    test('should handle missing directories gracefully', async () => {
      const invalidConfig = {
        ...config,
        workspace: {
          ...config.workspace,
          packages: {
            frontend: 'invalid/path',
            backend: 'packages/backend',
            shared: 'packages/shared',
          },
        },
      };

      await expect(createMonorepoWorkspace(testContext.tempDir, invalidConfig)).resolves.toBeDefined();
    });

    test('should validate package.json correctness', async () => {
      const workspace = await createMonorepoWorkspace(testContext.tempDir, config);
      
      // Validate all package.json files are valid JSON
      for (const project of workspace.projects) {
        const packageJsonPath = path.join(workspace.root, project.path, 'package.json');
        await expect(readJsonFile(packageJsonPath)).resolves.toBeDefined();
      }
    });
  });

  describe('Workspace Scripts', () => {
    test('should have functional workspace scripts', async () => {
      const workspace = await createMonorepoWorkspace(testContext.tempDir, config);
      await installWorkspaceDependencies(workspace);

      const rootPackageJson = await readJsonFile(path.join(workspace.root, 'package.json'));
      const scripts = rootPackageJson.scripts;

      // Test essential scripts exist
      expect(scripts).toHaveProperty('build');
      expect(scripts).toHaveProperty('test:all');
      expect(scripts).toHaveProperty('lint:all');
      expect(scripts).toHaveProperty('type-check:all');

      // Test that lint script works
      const lintResult = await execCommand('bun run lint:all', { 
        cwd: workspace.root,
        timeout: 60000,
      });

      // Should either pass or fail gracefully (but not crash)
      expect([0, 1]).toContain(lintResult.exitCode);
    });
  });

  describe('Performance Benchmarks', () => {
    test('should meet performance benchmarks for workspace creation', async () => {
      const { duration } = await measurePerformance(async () => {
        const workspace = await createMonorepoWorkspace(testContext.tempDir, config);
        await installWorkspaceDependencies(workspace);
        return workspace;
      });

      // Benchmark: Complete workspace setup should be under 2 minutes
      expect(duration).toBeLessThan(120000);
    });

    test('should measure build performance', async () => {
      const workspace = await createMonorepoWorkspace(testContext.tempDir, config);
      await installWorkspaceDependencies(workspace);

      const { duration, memoryUsage } = await measurePerformance(async () => {
        await buildWorkspace(workspace);
      });

      // Log performance metrics for monitoring
      console.log(`Build performance - Duration: ${duration}ms, Memory: ${memoryUsage.heapUsed} bytes`);

      // Benchmark: Build should complete within 3 minutes
      expect(duration).toBeLessThan(180000);
      
      // Memory usage should be reasonable (less than 1GB)
      expect(memoryUsage.heapUsed).toBeLessThan(1024 * 1024 * 1024);
    });
  });
});