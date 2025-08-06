/**
 * Monorepo Detection Tests
 * Tests workspace and monorepo configuration detection
 */

import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { join } from 'path';
import { mkdir, rm, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import {
  detectWorkspaceConfig,
  createWorkspaceConfig,
  detectPackageManagerFromLockfile,
  createLockfile,
  installDependencies,
  isPackageManagerAvailable,
} from '../utils/package-manager-utils';
import { generateTestDir, MONOREPO_CONFIGS } from '../config/test-config';

describe('Monorepo Detection', () => {
  let testDir: string;
  
  beforeEach(async () => {
    testDir = generateTestDir('monorepo-detection');
    await mkdir(testDir, { recursive: true });
  });
  
  afterEach(async () => {
    if (existsSync(testDir)) {
      await rm(testDir, { recursive: true, force: true });
    }
  });

  describe('PNPM Workspace Detection', () => {
    it('should detect pnpm-workspace.yaml', async () => {
      await createWorkspaceConfig('pnpm', testDir);
      
      const workspace = detectWorkspaceConfig(testDir);
      expect(workspace.type).toBe('pnpm');
      expect(workspace.config).toContain('packages:');
      expect(workspace.config).toContain('apps/*');
      expect(workspace.config).toContain('packages/*');
    });

    it('should detect pnpm workspace with custom patterns', async () => {
      const customPatterns = ['frontend/*', 'backend/*', 'libs/*', 'tools/*'];
      await createWorkspaceConfig('pnpm', testDir, customPatterns);
      
      const workspace = detectWorkspaceConfig(testDir);
      expect(workspace.type).toBe('pnpm');
      
      for (const pattern of customPatterns) {
        expect(workspace.config).toContain(pattern);
      }
    });

    it('should handle pnpm workspace with comments and complex structure', async () => {
      const complexWorkspace = `# PNPM Workspace Configuration
# This file defines the workspace structure

packages:
  # Frontend applications
  - 'apps/web'
  - 'apps/mobile'
  
  # Backend services
  - 'services/*'
  
  # Shared libraries
  - 'packages/*'
  - 'libs/*'
  
  # Development tools
  - 'tools/*'

# Exclude test directories
exclude:
  - '**/test/**'
  - '**/tests/**'
`;
      
      await writeFile(join(testDir, 'pnpm-workspace.yaml'), complexWorkspace);
      
      const workspace = detectWorkspaceConfig(testDir);
      expect(workspace.type).toBe('pnpm');
      expect(workspace.config).toContain('packages:');
      expect(workspace.config).toContain('apps/web');
      expect(workspace.config).toContain('services/*');
    });
  });

  describe('Yarn Workspace Detection', () => {
    it('should detect yarn workspaces in package.json', async () => {
      await createWorkspaceConfig('yarn', testDir);
      
      const workspace = detectWorkspaceConfig(testDir);
      expect(workspace.type).toBe('yarn');
      expect(Array.isArray(workspace.config) || typeof workspace.config === 'object').toBe(true);
    });

    it('should handle yarn workspaces with object format', async () => {
      const packageJson = {
        name: 'yarn-workspace-object',
        private: true,
        workspaces: {
          packages: ['apps/*', 'packages/*'],
          nohoist: ['**/react', '**/react-dom'],
        },
      };
      
      await writeFile(
        join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );
      
      const workspace = detectWorkspaceConfig(testDir);
      expect(workspace.type).toBe('yarn');
      expect(workspace.config.packages).toContain('apps/*');
      expect(workspace.config.nohoist).toContain('**/react');
    });

    it('should handle yarn workspaces with array format', async () => {
      const packageJson = {
        name: 'yarn-workspace-array',
        private: true,
        workspaces: ['frontend/*', 'backend/*', 'shared/*'],
      };
      
      await writeFile(
        join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );
      
      const workspace = detectWorkspaceConfig(testDir);
      expect(workspace.type).toBe('npm'); // Arrays are treated as npm workspaces
      expect(workspace.config).toContain('frontend/*');
      expect(workspace.config).toContain('backend/*');
    });
  });

  describe('NPM Workspace Detection', () => {
    it('should detect npm workspaces in package.json', async () => {
      await createWorkspaceConfig('npm', testDir);
      
      const workspace = detectWorkspaceConfig(testDir);
      expect(workspace.type).toBe('npm');
      expect(Array.isArray(workspace.config)).toBe(true);
    });

    it('should handle npm workspaces with detailed configuration', async () => {
      const packageJson = {
        name: 'npm-workspace-detailed',
        version: '1.0.0',
        private: true,
        workspaces: [
          'apps/*',
          'packages/*',
          'services/api',
          'services/worker',
        ],
        scripts: {
          'build:all': 'npm run build --workspaces',
          'test:all': 'npm run test --workspaces',
        },
      };
      
      await writeFile(
        join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );
      
      const workspace = detectWorkspaceConfig(testDir);
      expect(workspace.type).toBe('npm');
      expect(workspace.config).toContain('apps/*');
      expect(workspace.config).toContain('services/api');
      expect(workspace.config).toContain('services/worker');
    });
  });

  describe('Complex Monorepo Scenarios', () => {
    it('should handle monorepo with mixed package managers', async () => {
      // Create PNPM workspace config
      await createWorkspaceConfig('pnpm', testDir);
      
      // But also create npm lockfile (common in transitioning projects)
      await createLockfile('npm', testDir, true);
      
      const workspace = detectWorkspaceConfig(testDir);
      const lockfileManager = detectPackageManagerFromLockfile(testDir);
      
      expect(workspace.type).toBe('pnpm');
      expect(lockfileManager).toBe('npm');
      
      // This scenario indicates a transition period or mixed setup
    });

    it('should handle nested workspaces', async () => {
      // Root workspace
      await createWorkspaceConfig('pnpm', testDir, ['apps/*', 'packages/*']);
      
      // Nested workspace in apps directory
      const appsDir = join(testDir, 'apps', 'frontend');
      await mkdir(appsDir, { recursive: true });
      await createWorkspaceConfig('npm', appsDir, ['components/*', 'utils/*']);
      
      // Root should detect pnpm workspace
      const rootWorkspace = detectWorkspaceConfig(testDir);
      expect(rootWorkspace.type).toBe('pnpm');
      
      // Nested should detect npm workspace
      const nestedWorkspace = detectWorkspaceConfig(appsDir);
      expect(nestedWorkspace.type).toBe('npm');
    });

    it('should handle large-scale monorepo structure', async () => {
      const largeMonorepoStructure = [
        'apps/web-admin',
        'apps/web-client',
        'apps/mobile-ios',
        'apps/mobile-android',
        'services/api-gateway',
        'services/auth-service',
        'services/notification-service',
        'packages/ui-components',
        'packages/shared-utils',
        'packages/business-logic',
        'libs/database',
        'libs/logging',
        'libs/monitoring',
        'tools/build-scripts',
        'tools/deployment',
        'docs/api-docs',
        'docs/user-guides',
      ];
      
      await createWorkspaceConfig('pnpm', testDir, largeMonorepoStructure);
      
      const workspace = detectWorkspaceConfig(testDir);
      expect(workspace.type).toBe('pnpm');
      
      // Check that all patterns are included
      for (const pattern of largeMonorepoStructure.slice(0, 5)) { // Check first 5
        expect(workspace.config).toContain(pattern);
      }
    });
  });

  describe('Monorepo Package Installation', () => {
    it('should install dependencies in pnpm monorepo', async () => {
      const pnpmAvailable = await isPackageManagerAvailable('pnpm');
      if (!pnpmAvailable) return;
      
      // Create pnpm monorepo structure
      await createWorkspaceConfig('pnpm', testDir, ['apps/*', 'packages/*']);
      
      const rootPackageJson = {
        name: 'pnpm-monorepo-test',
        private: true,
        devDependencies: {
          'is-even': '^1.0.0',
        },
      };
      
      // Create app package
      const appDir = join(testDir, 'apps', 'web');
      await mkdir(appDir, { recursive: true });
      
      const appPackageJson = {
        name: '@monorepo/web',
        version: '1.0.0',
        dependencies: {
          'is-odd': '^3.0.1',
        },
      };
      
      await writeFile(
        join(testDir, 'package.json'),
        JSON.stringify(rootPackageJson, null, 2)
      );
      
      await writeFile(
        join(appDir, 'package.json'),
        JSON.stringify(appPackageJson, null, 2)
      );
      
      // Install dependencies
      const result = await installDependencies('pnpm', testDir, 45000);
      expect(result.exitCode).toBe(0);
      
      // Verify installation
      expect(existsSync(join(testDir, 'node_modules'))).toBe(true);
      expect(existsSync(join(testDir, 'pnpm-lock.yaml'))).toBe(true);
    }, 55000);

    it('should handle workspace dependencies', async () => {
      const pnpmAvailable = await isPackageManagerAvailable('pnpm');
      if (!pnpmAvailable) return;
      
      await createWorkspaceConfig('pnpm', testDir, ['packages/*', 'apps/*']);
      
      // Create shared package
      const libDir = join(testDir, 'packages', 'shared-lib');
      await mkdir(libDir, { recursive: true });
      
      const libPackageJson = {
        name: '@monorepo/shared-lib',
        version: '1.0.0',
        main: 'index.js',
      };
      
      // Create app that depends on shared package
      const appDir = join(testDir, 'apps', 'web');
      await mkdir(appDir, { recursive: true });
      
      const appPackageJson = {
        name: '@monorepo/web-app',
        version: '1.0.0',
        dependencies: {
          '@monorepo/shared-lib': 'workspace:*',
        },
      };
      
      const rootPackageJson = {
        name: 'workspace-deps-test',
        private: true,
      };
      
      await writeFile(
        join(testDir, 'package.json'),
        JSON.stringify(rootPackageJson, null, 2)
      );
      
      await writeFile(
        join(libDir, 'package.json'),
        JSON.stringify(libPackageJson, null, 2)
      );
      
      await writeFile(
        join(appDir, 'package.json'),
        JSON.stringify(appPackageJson, null, 2)
      );
      
      // Create lib entry point
      await writeFile(
        join(libDir, 'index.js'),
        'module.exports = { message: "Hello from shared lib" };'
      );
      
      const result = await installDependencies('pnpm', testDir, 40000);
      expect(result.exitCode).toBe(0);
      
      // Verify workspace linking
      expect(existsSync(join(testDir, 'pnpm-lock.yaml'))).toBe(true);
    }, 50000);
  });

  describe('Workspace Configuration Validation', () => {
    it('should handle invalid pnpm-workspace.yaml', async () => {
      const invalidWorkspace = `invalid yaml content
        - missing proper structure
      packages
        invalid syntax`;
      
      await writeFile(join(testDir, 'pnpm-workspace.yaml'), invalidWorkspace);
      
      const workspace = detectWorkspaceConfig(testDir);
      expect(workspace.type).toBe('pnpm'); // Still detects as pnpm based on file presence
      expect(workspace.config).toContain('invalid yaml content');
    });

    it('should handle corrupted package.json with workspaces', async () => {
      await writeFile(join(testDir, 'package.json'), '{ invalid json content }');
      
      const workspace = detectWorkspaceConfig(testDir);
      expect(workspace.type).toBe('none');
      expect(workspace.config).toBeNull();
    });

    it('should handle empty workspace configurations', async () => {
      const emptyWorkspaces = [
        {
          name: 'empty-array',
          private: true,
          workspaces: [],
        },
        {
          name: 'empty-object',
          private: true,
          workspaces: {
            packages: [],
          },
        },
      ];
      
      for (const [index, config] of emptyWorkspaces.entries()) {
        const configDir = join(testDir, `empty-${index}`);
        await mkdir(configDir, { recursive: true });
        
        await writeFile(
          join(configDir, 'package.json'),
          JSON.stringify(config, null, 2)
        );
        
        const workspace = detectWorkspaceConfig(configDir);
        
        if (config.workspaces && Array.isArray(config.workspaces)) {
          expect(workspace.type).toBe('npm');
          expect(workspace.config).toEqual([]);
        } else {
          expect(workspace.type).toBe('yarn');
          expect(workspace.config.packages).toEqual([]);
        }
      }
    });
  });

  describe('Workspace Pattern Matching', () => {
    it('should validate glob patterns in workspace config', async () => {
      const patterns = [
        'apps/*',           // Basic glob
        'packages/**',      // Recursive glob
        'libs/*/src',       // Nested path
        'tools/build',      // Specific directory
        '!**/test/**',      // Exclusion pattern
      ];
      
      await createWorkspaceConfig('pnpm', testDir, patterns);
      
      const workspace = detectWorkspaceConfig(testDir);
      expect(workspace.type).toBe('pnpm');
      
      for (const pattern of patterns) {
        expect(workspace.config).toContain(pattern);
      }
    });

    it('should handle complex workspace hierarchies', async () => {
      // Create actual directory structure
      const directories = [
        'apps/web/frontend',
        'apps/web/backend',
        'apps/mobile/ios',
        'apps/mobile/android',
        'packages/ui-core',
        'packages/ui-components',
        'services/api',
        'services/worker',
      ];
      
      for (const dir of directories) {
        await mkdir(join(testDir, dir), { recursive: true });
        
        // Create package.json in each directory
        const packageJson = {
          name: `@monorepo/${dir.replace(/\//g, '-')}`,
          version: '1.0.0',
        };
        
        await writeFile(
          join(testDir, dir, 'package.json'),
          JSON.stringify(packageJson, null, 2)
        );
      }
      
      // Create workspace config that matches the structure
      const workspacePatterns = [
        'apps/*/frontend',
        'apps/*/backend',
        'apps/mobile/*',
        'packages/*',
        'services/*',
      ];
      
      await createWorkspaceConfig('pnpm', testDir, workspacePatterns);
      
      const workspace = detectWorkspaceConfig(testDir);
      expect(workspace.type).toBe('pnpm');
      
      for (const pattern of workspacePatterns) {
        expect(workspace.config).toContain(pattern);
      }
    });
  });

  describe('Migration Scenarios', () => {
    it('should detect transition from npm to pnpm workspace', async () => {
      // Start with npm workspace
      const npmPackageJson = {
        name: 'migration-test',
        private: true,
        workspaces: ['apps/*', 'packages/*'],
      };
      
      await writeFile(
        join(testDir, 'package.json'),
        JSON.stringify(npmPackageJson, null, 2)
      );
      
      await createLockfile('npm', testDir, true);
      
      // Initial state
      let workspace = detectWorkspaceConfig(testDir);
      let lockfile = detectPackageManagerFromLockfile(testDir);
      
      expect(workspace.type).toBe('npm');
      expect(lockfile).toBe('npm');
      
      // Add pnpm workspace config (migration step)
      await createWorkspaceConfig('pnpm', testDir, ['apps/*', 'packages/*']);
      
      // After adding pnpm config
      workspace = detectWorkspaceConfig(testDir);
      lockfile = detectPackageManagerFromLockfile(testDir);
      
      expect(workspace.type).toBe('pnpm'); // pnpm-workspace.yaml takes precedence
      expect(lockfile).toBe('npm'); // But npm lockfile still exists
    });

    it('should handle gradual workspace adoption', async () => {
      // Start with regular package.json (no workspaces)
      const regularPackageJson = {
        name: 'gradual-adoption',
        version: '1.0.0',
        dependencies: {
          lodash: '^4.17.21',
        },
      };
      
      await writeFile(
        join(testDir, 'package.json'),
        JSON.stringify(regularPackageJson, null, 2)
      );
      
      // No workspace detected initially
      let workspace = detectWorkspaceConfig(testDir);
      expect(workspace.type).toBe('none');
      
      // Add workspace configuration
      const workspacePackageJson = {
        ...regularPackageJson,
        private: true,
        workspaces: ['packages/*'],
      };
      
      await writeFile(
        join(testDir, 'package.json'),
        JSON.stringify(workspacePackageJson, null, 2)
      );
      
      // Now workspace should be detected
      workspace = detectWorkspaceConfig(testDir);
      expect(workspace.type).toBe('npm');
      expect(workspace.config).toContain('packages/*');
    });
  });
});