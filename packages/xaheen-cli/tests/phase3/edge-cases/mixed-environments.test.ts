/**
 * Mixed Environment Tests
 * Tests scenarios with different package managers in parent/child directories
 */

import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { join } from 'path';
import { mkdir, rm, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import {
  detectPackageManagerFromLockfile,
  detectWorkspaceConfig,
  createLockfile,
  createWorkspaceConfig,
  installDependencies,
  isPackageManagerAvailable,
} from '../utils/package-manager-utils';
import { generateTestDir } from '../config/test-config';

describe('Mixed Environment Tests', () => {
  let testDir: string;
  
  beforeEach(async () => {
    testDir = generateTestDir('mixed-environments');
    await mkdir(testDir, { recursive: true });
  });
  
  afterEach(async () => {
    if (existsSync(testDir)) {
      await rm(testDir, { recursive: true, force: true });
    }
  });

  describe('Parent-Child Package Manager Conflicts', () => {
    it('should handle npm root with yarn subdirectory', async () => {
      // Create npm lockfile in root
      await createLockfile('npm', testDir, true);
      
      // Create subdirectory with yarn lockfile
      const subDir = join(testDir, 'frontend');
      await mkdir(subDir, { recursive: true });
      await createLockfile('yarn', subDir, true);
      
      // Root should detect npm
      const rootDetected = detectPackageManagerFromLockfile(testDir);
      expect(rootDetected).toBe('npm');
      
      // Subdirectory should detect yarn
      const subDetected = detectPackageManagerFromLockfile(subDir);
      expect(subDetected).toBe('yarn');
    });

    it('should handle pnpm monorepo with npm package', async () => {
      // Create pnpm workspace at root
      await createWorkspaceConfig('pnpm', testDir, ['packages/*']);
      await createLockfile('pnpm', testDir, true);
      
      // Create package with npm lockfile
      const packageDir = join(testDir, 'packages', 'legacy-package');
      await mkdir(packageDir, { recursive: true });
      await createLockfile('npm', packageDir, true);
      
      // Root should detect pnpm
      const rootWorkspace = detectWorkspaceConfig(testDir);
      const rootLockfile = detectPackageManagerFromLockfile(testDir);
      
      expect(rootWorkspace.type).toBe('pnpm');
      expect(rootLockfile).toBe('pnpm');
      
      // Package should detect npm locally
      const packageLockfile = detectPackageManagerFromLockfile(packageDir);
      expect(packageLockfile).toBe('npm');
    });

    it('should handle deeply nested mixed environments', async () => {
      const structure = [
        { path: '', manager: 'pnpm', workspace: true },
        { path: 'apps/web', manager: 'yarn', workspace: false },
        { path: 'apps/web/components', manager: 'npm', workspace: false },
        { path: 'packages/ui', manager: 'bun', workspace: false },
      ];
      
      for (const item of structure) {
        const fullPath = join(testDir, item.path);
        await mkdir(fullPath, { recursive: true });
        
        if (item.workspace && item.path === '') {
          await createWorkspaceConfig('pnpm', fullPath, ['apps/*', 'packages/*']);
        }
        
        await createLockfile(item.manager as any, fullPath, true);
      }
      
      // Verify each level detects correctly
      for (const item of structure) {
        const fullPath = join(testDir, item.path);
        const detected = detectPackageManagerFromLockfile(fullPath);
        expect(detected).toBe(item.manager);
      }
    });
  });

  describe('Workspace Boundary Conflicts', () => {
    it('should handle workspace with conflicting package managers', async () => {
      // Create pnpm workspace config
      await createWorkspaceConfig('pnpm', testDir, ['frontend/*', 'backend/*']);
      
      // But use npm lockfile at root
      await createLockfile('npm', testDir, true);
      
      // Create workspace packages with different managers
      const frontendDir = join(testDir, 'frontend', 'web');
      const backendDir = join(testDir, 'backend', 'api');
      
      await mkdir(frontendDir, { recursive: true });
      await mkdir(backendDir, { recursive: true });
      
      await createLockfile('yarn', frontendDir, true);
      await createLockfile('bun', backendDir, true);
      
      // Root should detect workspace configuration vs lockfile
      const workspace = detectWorkspaceConfig(testDir);
      const lockfile = detectPackageManagerFromLockfile(testDir);
      
      expect(workspace.type).toBe('pnpm');
      expect(lockfile).toBe('npm');
      
      // Packages should detect their own managers
      expect(detectPackageManagerFromLockfile(frontendDir)).toBe('yarn');
      expect(detectPackageManagerFromLockfile(backendDir)).toBe('bun');
    });

    it('should handle overlapping workspace configurations', async () => {
      // Root pnpm workspace
      await createWorkspaceConfig('pnpm', testDir, ['projects/*']);
      
      // Nested npm workspace
      const projectDir = join(testDir, 'projects', 'web-app');
      await mkdir(projectDir, { recursive: true });
      await createWorkspaceConfig('npm', projectDir, ['packages/*']);
      
      // Verify both workspaces are detected correctly
      const rootWorkspace = detectWorkspaceConfig(testDir);
      const nestedWorkspace = detectWorkspaceConfig(projectDir);
      
      expect(rootWorkspace.type).toBe('pnpm');
      expect(nestedWorkspace.type).toBe('npm');
      
      expect(rootWorkspace.config).toContain('projects/*');
      expect(nestedWorkspace.config).toContain('packages/*');
    });

    it('should handle workspace with non-workspace subdirectories', async () => {
      // Create workspace at root
      await createWorkspaceConfig('pnpm', testDir, ['packages/*']);
      await createLockfile('pnpm', testDir, true);
      
      // Create workspace package
      const packageDir = join(testDir, 'packages', 'core');
      await mkdir(packageDir, { recursive: true });
      
      const packageJson = {
        name: '@workspace/core',
        version: '1.0.0',
      };
      
      await writeFile(
        join(packageDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );
      
      // Create non-workspace subdirectory with its own setup
      const toolsDir = join(testDir, 'tools', 'build-scripts');
      await mkdir(toolsDir, { recursive: true });
      await createLockfile('npm', toolsDir, true);
      
      const toolsPackageJson = {
        name: 'build-scripts',
        version: '1.0.0',
        private: true,
      };
      
      await writeFile(
        join(toolsDir, 'package.json'),
        JSON.stringify(toolsPackageJson, null, 2)
      );
      
      // Root should detect workspace
      const rootWorkspace = detectWorkspaceConfig(testDir);
      expect(rootWorkspace.type).toBe('pnpm');
      
      // Tools directory should not inherit workspace (not in workspace patterns)
      const toolsLockfile = detectPackageManagerFromLockfile(toolsDir);
      expect(toolsLockfile).toBe('npm');
    });
  });

  describe('Migration Scenarios', () => {
    it('should handle partial migration from npm to pnpm', async () => {
      // Initial state: npm monorepo
      const initialPackageJson = {
        name: 'migration-test',
        private: true,
        workspaces: ['apps/*', 'packages/*'],
        scripts: {
          'build:all': 'npm run build --workspaces',
        },
      };
      
      await writeFile(
        join(testDir, 'package.json'),
        JSON.stringify(initialPackageJson, null, 2)
      );
      
      await createLockfile('npm', testDir, true);
      
      // Create some workspace packages
      const webAppDir = join(testDir, 'apps', 'web');
      const coreLibDir = join(testDir, 'packages', 'core');
      
      await mkdir(webAppDir, { recursive: true });
      await mkdir(coreLibDir, { recursive: true });
      
      // Web app already migrated to pnpm
      await createLockfile('pnpm', webAppDir, true);
      
      // Core lib still using npm
      await createLockfile('npm', coreLibDir, true);
      
      // Check current state
      expect(detectWorkspaceConfig(testDir).type).toBe('npm');
      expect(detectPackageManagerFromLockfile(testDir)).toBe('npm');
      expect(detectPackageManagerFromLockfile(webAppDir)).toBe('pnpm');
      expect(detectPackageManagerFromLockfile(coreLibDir)).toBe('npm');
      
      // Start migration: add pnpm workspace config
      await createWorkspaceConfig('pnpm', testDir, ['apps/*', 'packages/*']);
      
      // After adding pnpm workspace config
      expect(detectWorkspaceConfig(testDir).type).toBe('pnpm');
      expect(detectPackageManagerFromLockfile(testDir)).toBe('npm'); // Still old lockfile
    });

    it('should handle stale lockfiles after manager switch', async () => {
      // Create project with multiple lockfiles (common during transition)
      await createLockfile('npm', testDir, true);
      await createLockfile('yarn', testDir, true);
      await createLockfile('pnpm', testDir, true);
      
      const packageJson = {
        name: 'stale-lockfiles-test',
        version: '1.0.0',
        dependencies: {
          lodash: '^4.17.21',
        },
      };
      
      await writeFile(
        join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );
      
      // Detection should prioritize npm (first in priority order)
      const detected = detectPackageManagerFromLockfile(testDir);
      expect(detected).toBe('npm');
      
      // Verify all lockfiles exist
      expect(existsSync(join(testDir, 'package-lock.json'))).toBe(true);
      expect(existsSync(join(testDir, 'yarn.lock'))).toBe(true);
      expect(existsSync(join(testDir, 'pnpm-lock.yaml'))).toBe(true);
    });
  });

  describe('Development Workflow Conflicts', () => {
    it('should handle team with different package manager preferences', async () => {
      // Scenario: Team members use different package managers
      // Create project structure that accommodates this
      
      const projectStructure = [
        {
          path: 'team-member-1',
          manager: 'npm',
          packageJson: {
            name: 'member-1-workspace',
            dependencies: { lodash: '^4.17.21' },
          },
        },
        {
          path: 'team-member-2',
          manager: 'yarn',
          packageJson: {
            name: 'member-2-workspace',
            dependencies: { axios: '^1.4.0' },
          },
        },
        {
          path: 'team-member-3',
          manager: 'pnpm',
          packageJson: {
            name: 'member-3-workspace',
            dependencies: { 'is-even': '^1.0.0' },
          },
        },
      ];
      
      for (const member of projectStructure) {
        const memberDir = join(testDir, member.path);
        await mkdir(memberDir, { recursive: true });
        
        await writeFile(
          join(memberDir, 'package.json'),
          JSON.stringify(member.packageJson, null, 2)
        );
        
        await createLockfile(member.manager as any, memberDir, true);
      }
      
      // Each member's directory should detect their preferred manager
      for (const member of projectStructure) {
        const memberDir = join(testDir, member.path);
        const detected = detectPackageManagerFromLockfile(memberDir);
        expect(detected).toBe(member.manager);
      }
    });

    it('should handle CI/CD with multiple package managers', async () => {
      // Simulate CI environment with different services using different managers
      const ciServices = [
        { name: 'frontend-build', manager: 'yarn' },
        { name: 'backend-build', manager: 'npm' },
        { name: 'e2e-tests', manager: 'pnpm' },
        { name: 'deployment', manager: 'bun' },
      ];
      
      for (const service of ciServices) {
        const serviceDir = join(testDir, 'ci', service.name);
        await mkdir(serviceDir, { recursive: true });
        
        const packageJson = {
          name: service.name,
          version: '1.0.0',
          scripts: {
            build: `echo "Building with ${service.manager}"`,
            test: `echo "Testing with ${service.manager}"`,
          },
          dependencies: {
            'is-odd': '^3.0.1',
          },
        };
        
        await writeFile(
          join(serviceDir, 'package.json'),
          JSON.stringify(packageJson, null, 2)
        );
        
        await createLockfile(service.manager as any, serviceDir, true);
      }
      
      // Each service should detect its manager correctly
      for (const service of ciServices) {
        const serviceDir = join(testDir, 'ci', service.name);
        const detected = detectPackageManagerFromLockfile(serviceDir);
        expect(detected).toBe(service.manager);
      }
    });
  });

  describe('Real-world Complex Scenarios', () => {
    it('should handle enterprise monorepo with mixed technologies', async () => {
      // Enterprise scenario: Main monorepo with legacy and modern projects
      
      // Root: PNPM monorepo
      await createWorkspaceConfig('pnpm', testDir, [
        'apps/*',
        'packages/*',
        'services/*',
        'legacy/*',
      ]);
      await createLockfile('pnpm', testDir, true);
      
      // Modern apps using pnpm
      const modernApps = ['web-admin', 'mobile-app'];
      for (const app of modernApps) {
        const appDir = join(testDir, 'apps', app);
        await mkdir(appDir, { recursive: true });
        
        const appPackageJson = {
          name: `@enterprise/${app}`,
          version: '2.0.0',
          dependencies: {
            '@enterprise/shared': 'workspace:*',
          },
        };
        
        await writeFile(
          join(appDir, 'package.json'),
          JSON.stringify(appPackageJson, null, 2)
        );
      }
      
      // Legacy services using npm
      const legacyServices = ['old-api', 'legacy-worker'];
      for (const service of legacyServices) {
        const serviceDir = join(testDir, 'legacy', service);
        await mkdir(serviceDir, { recursive: true });
        
        await createLockfile('npm', serviceDir, true);
        
        const servicePackageJson = {
          name: service,
          version: '1.0.0',
          dependencies: {
            express: '^4.18.0',
          },
        };
        
        await writeFile(
          join(serviceDir, 'package.json'),
          JSON.stringify(servicePackageJson, null, 2)
        );
      }
      
      // Microservices using different managers
      const microservices = [
        { name: 'auth-service', manager: 'yarn' },
        { name: 'notification-service', manager: 'bun' },
      ];
      
      for (const service of microservices) {
        const serviceDir = join(testDir, 'services', service.name);
        await mkdir(serviceDir, { recursive: true });
        
        await createLockfile(service.manager as any, serviceDir, true);
        
        const servicePackageJson = {
          name: `@enterprise/${service.name}`,
          version: '1.0.0',
          dependencies: {
            fastify: '^4.0.0',
          },
        };
        
        await writeFile(
          join(serviceDir, 'package.json'),
          JSON.stringify(servicePackageJson, null, 2)
        );
      }
      
      // Verify root workspace
      const rootWorkspace = detectWorkspaceConfig(testDir);
      expect(rootWorkspace.type).toBe('pnpm');
      
      // Verify each service detects correctly
      for (const service of legacyServices) {
        const serviceDir = join(testDir, 'legacy', service);
        expect(detectPackageManagerFromLockfile(serviceDir)).toBe('npm');
      }
      
      for (const service of microservices) {
        const serviceDir = join(testDir, 'services', service.name);
        expect(detectPackageManagerFromLockfile(serviceDir)).toBe(service.manager);
      }
    });

    it('should handle gradual workspace adoption in existing project', async () => {
      // Simulate existing project being converted to workspace
      
      // Phase 1: Standalone project
      const standalonePackageJson = {
        name: 'existing-project',
        version: '1.0.0',
        dependencies: {
          express: '^4.18.0',
        },
      };
      
      await writeFile(
        join(testDir, 'package.json'),
        JSON.stringify(standalonePackageJson, null, 2)
      );
      
      await createLockfile('npm', testDir, true);
      
      // Should detect no workspace
      let workspace = detectWorkspaceConfig(testDir);
      expect(workspace.type).toBe('none');
      
      // Phase 2: Add first package to separate directory
      const firstPackageDir = join(testDir, 'packages', 'shared-utils');
      await mkdir(firstPackageDir, { recursive: true });
      
      const firstPackageJson = {
        name: '@project/shared-utils',
        version: '1.0.0',
      };
      
      await writeFile(
        join(firstPackageDir, 'package.json'),
        JSON.stringify(firstPackageJson, null, 2)
      );
      
      // Phase 3: Convert to workspace
      const workspacePackageJson = {
        ...standalonePackageJson,
        private: true,
        workspaces: ['packages/*'],
      };
      
      await writeFile(
        join(testDir, 'package.json'),
        JSON.stringify(workspacePackageJson, null, 2)
      );
      
      // Now should detect workspace
      workspace = detectWorkspaceConfig(testDir);
      expect(workspace.type).toBe('npm');
      expect(workspace.config).toContain('packages/*');
      
      // Phase 4: Add more packages and consider migration to pnpm
      const additionalPackages = ['ui-components', 'business-logic'];
      for (const pkg of additionalPackages) {
        const pkgDir = join(testDir, 'packages', pkg);
        await mkdir(pkgDir, { recursive: true });
        
        const pkgJson = {
          name: `@project/${pkg}`,
          version: '1.0.0',
        };
        
        await writeFile(
          join(pkgDir, 'package.json'),
          JSON.stringify(pkgJson, null, 2)
        );
      }
      
      // Consider pnpm migration
      await createWorkspaceConfig('pnpm', testDir, ['packages/*']);
      
      // Should now detect pnpm workspace (pnpm-workspace.yaml takes precedence)
      workspace = detectWorkspaceConfig(testDir);
      expect(workspace.type).toBe('pnpm');
      
      // But npm lockfile still exists
      expect(detectPackageManagerFromLockfile(testDir)).toBe('npm');
    });
  });

  describe('Installation in Mixed Environments', () => {
    it('should handle installation in workspace with mixed managers', async () => {
      const pnpmAvailable = await isPackageManagerAvailable('pnpm');
      const npmAvailable = await isPackageManagerAvailable('npm');
      
      if (!pnpmAvailable || !npmAvailable) return;
      
      // Create pnpm workspace
      await createWorkspaceConfig('pnpm', testDir, ['packages/*']);
      
      const rootPackageJson = {
        name: 'mixed-install-test',
        private: true,
        devDependencies: {
          'is-even': '^1.0.0',
        },
      };
      
      await writeFile(
        join(testDir, 'package.json'),
        JSON.stringify(rootPackageJson, null, 2)
      );
      
      // Create package with npm lockfile (not recommended but possible)
      const packageDir = join(testDir, 'packages', 'legacy');
      await mkdir(packageDir, { recursive: true });
      
      const packageJson = {
        name: '@mixed/legacy',
        version: '1.0.0',
        dependencies: {
          'is-odd': '^3.0.1',
        },
      };
      
      await writeFile(
        join(packageDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );
      
      await createLockfile('npm', packageDir, true);
      
      // Install at root using pnpm (workspace manager)
      const rootInstall = await installDependencies('pnpm', testDir, 30000);
      expect(rootInstall.exitCode).toBe(0);
      
      // Install at package level using npm
      const packageInstall = await installDependencies('npm', packageDir, 20000);
      expect(packageInstall.exitCode).toBe(0);
      
      // Both should have their respective lockfiles
      expect(existsSync(join(testDir, 'pnpm-lock.yaml'))).toBe(true);
      expect(existsSync(join(packageDir, 'package-lock.json'))).toBe(true);
    }, 60000);
  });
});