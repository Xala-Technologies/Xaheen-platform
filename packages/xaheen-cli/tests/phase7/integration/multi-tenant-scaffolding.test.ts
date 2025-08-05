/**
 * Phase 7: Multi-Tenant Project Scaffolding Tests
 * 
 * Tests the `xaheen scaffold --preset=multi-tenant` command and validates
 * the generated project structure, configuration, and multi-tenant setup.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { execSync, spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'fs-extra';
import { TEST_CONFIG } from '../config/test-config.js';
import { setupMockLicenseServer } from '../mocks/license-server.mock.js';
import { MockTenantDatabase } from '../mocks/tenant-database.mock.js';

interface ProjectStructure {
  readonly directories: readonly string[];
  readonly files: readonly string[];
  readonly configFiles: readonly string[];
  readonly migrationFiles: readonly string[];
}

interface ScaffoldResult {
  readonly exitCode: number;
  readonly stdout: string;
  readonly stderr: string;
  readonly projectPath: string;
  readonly duration: number;
}

describe('Phase 7: Multi-Tenant Project Scaffolding', () => {
  let testOutputDir: string;
  let mockLicenseServer: ReturnType<typeof setupMockLicenseServer>;
  let mockDatabase: MockTenantDatabase;

  beforeAll(async () => {
    // Setup test environment
    testOutputDir = path.join(TEST_CONFIG.projects.outputDir, 'scaffolding-tests');
    await fs.ensureDir(testOutputDir);

    // Setup mock services
    mockLicenseServer = setupMockLicenseServer();
    mockLicenseServer.server.listen();

    mockDatabase = new MockTenantDatabase();
    await mockDatabase.connect();
  });

  afterAll(async () => {
    // Cleanup
    mockLicenseServer.server.close();
    await mockDatabase.disconnect();
    await fs.remove(testOutputDir);
  });

  beforeEach(async () => {
    // Clean test directory before each test
    await fs.emptyDir(testOutputDir);
  });

  afterEach(async () => {
    // Cleanup after each test
    await mockDatabase.cleanup();
  });

  describe('Basic Multi-Tenant Scaffolding', () => {
    it('should scaffold a multi-tenant SaaS project successfully', async () => {
      const projectName = 'test-multi-tenant-saas';
      const projectPath = path.join(testOutputDir, projectName);

      const result = await scaffoldMultiTenantProject(projectName, {
        preset: 'multi-tenant',
        framework: 'nextjs',
        database: 'postgresql',
        features: ['auth', 'admin', 'billing'],
      });

      // Verify scaffolding succeeded
      expect(result.exitCode).toBe(0);
      expect(result.stderr).not.toMatch(/error|failed/i);
      expect(await fs.pathExists(projectPath)).toBe(true);

      // Verify project structure
      const structure = await analyzeProjectStructure(projectPath);
      
      expect(structure.directories).toContain('src/app/(tenant)');
      expect(structure.directories).toContain('src/app/admin');
      expect(structure.directories).toContain('src/lib/tenant');
      expect(structure.directories).toContain('src/middleware');
      expect(structure.directories).toContain('database/migrations');
      expect(structure.directories).toContain('database/seeds');

      // Verify essential files
      expect(structure.files).toContain('src/lib/tenant/resolver.ts');
      expect(structure.files).toContain('src/lib/tenant/database.ts');
      expect(structure.files).toContain('src/middleware/tenant.ts');
      expect(structure.files).toContain('src/app/admin/tenants/page.tsx');

      // Verify configuration files
      expect(structure.configFiles).toContain('tenant.config.js');
      expect(structure.configFiles).toContain('database.config.js');
      expect(structure.configFiles).toContain('.env.example');

      console.log(`✅ Multi-tenant project scaffolded in ${result.duration}ms`);
    }, TEST_CONFIG.timeouts.scaffolding);

    it('should generate proper database migrations for multi-tenancy', async () => {
      const projectName = 'test-migrations';
      const projectPath = path.join(testOutputDir, projectName);

      await scaffoldMultiTenantProject(projectName, {
        preset: 'multi-tenant',
        database: 'postgresql',
      });

      const migrationsDir = path.join(projectPath, 'database/migrations');
      expect(await fs.pathExists(migrationsDir)).toBe(true);

      const migrationFiles = await fs.readdir(migrationsDir);
      
      // Check for essential multi-tenant migrations
      const migrationNames = migrationFiles.map(file => file.toLowerCase());
      expect(migrationNames.some(name => name.includes('create_tenants'))).toBe(true);
      expect(migrationNames.some(name => name.includes('tenant_users'))).toBe(true);
      expect(migrationNames.some(name => name.includes('tenant_settings'))).toBe(true);
      expect(migrationNames.some(name => name.includes('tenant_subscriptions'))).toBe(true);

      // Verify migration content
      const createTenantsFile = migrationFiles.find(file => 
        file.toLowerCase().includes('create_tenants')
      );
      
      if (createTenantsFile) {
        const migrationContent = await fs.readFile(
          path.join(migrationsDir, createTenantsFile), 
          'utf-8'
        );
        
        expect(migrationContent).toMatch(/CREATE TABLE.*tenants/i);
        expect(migrationContent).toMatch(/domain.*VARCHAR/i);
        expect(migrationContent).toMatch(/status.*VARCHAR/i);
        expect(migrationContent).toMatch(/subscription_tier/i);
      }
    });

    it('should create tenant configuration files', async () => {
      const projectName = 'test-config';
      const projectPath = path.join(testOutputDir, projectName);

      await scaffoldMultiTenantProject(projectName, {
        preset: 'multi-tenant',
      });

      // Check tenant configuration
      const tenantConfigPath = path.join(projectPath, 'tenant.config.js');
      expect(await fs.pathExists(tenantConfigPath)).toBe(true);

      const configContent = await fs.readFile(tenantConfigPath, 'utf-8');
      
      expect(configContent).toMatch(/tenantResolver/);
      expect(configContent).toMatch(/databaseStrategy/);
      expect(configContent).toMatch(/schema.*separate/i);
      expect(configContent).toMatch(/domainStrategy/);

      // Check environment template
      const envExamplePath = path.join(projectPath, '.env.example');
      expect(await fs.pathExists(envExamplePath)).toBe(true);

      const envContent = await fs.readFile(envExamplePath, 'utf-8');
      
      expect(envContent).toMatch(/DATABASE_URL/);
      expect(envContent).toMatch(/TENANT_DOMAIN_STRATEGY/);
      expect(envContent).toMatch(/TENANT_DATABASE_STRATEGY/);
      expect(envContent).toMatch(/ADMIN_SECRET_KEY/);
    });
  });

  describe('Framework-Specific Multi-Tenant Scaffolding', () => {
    it.each([
      { framework: 'nextjs', router: 'app-router' },
      { framework: 'nuxt', router: 'nuxt-router' },
      { framework: 'remix', router: 'remix-router' },
    ])('should scaffold multi-tenant project for $framework', async ({ framework, router }) => {
      const projectName = `test-${framework}-multi-tenant`;
      const projectPath = path.join(testOutputDir, projectName);

      const result = await scaffoldMultiTenantProject(projectName, {
        preset: 'multi-tenant',
        framework,
        database: 'postgresql',
      });

      expect(result.exitCode).toBe(0);
      expect(await fs.pathExists(projectPath)).toBe(true);

      // Framework-specific checks
      if (framework === 'nextjs') {
        expect(await fs.pathExists(path.join(projectPath, 'src/app/(tenant)'))).toBe(true);
        expect(await fs.pathExists(path.join(projectPath, 'src/middleware.ts'))).toBe(true);
      } else if (framework === 'nuxt') {
        expect(await fs.pathExists(path.join(projectPath, 'plugins/tenant.client.ts'))).toBe(true);
        expect(await fs.pathExists(path.join(projectPath, 'middleware/tenant.ts'))).toBe(true);
      } else if (framework === 'remix') {
        expect(await fs.pathExists(path.join(projectPath, 'app/routes/__tenant'))).toBe(true);
        expect(await fs.pathExists(path.join(projectPath, 'app/lib/tenant.server.ts'))).toBe(true);
      }
    }, TEST_CONFIG.timeouts.scaffolding);
  });

  describe('Database Strategy Configuration', () => {
    it.each([
      { strategy: 'separate-schemas', description: 'separate schemas per tenant' },
      { strategy: 'shared-schema', description: 'shared schema with tenant_id column' },
      { strategy: 'separate-databases', description: 'separate databases per tenant' },
    ])('should configure $description', async ({ strategy }) => {
      const projectName = `test-${strategy}`;
      const projectPath = path.join(testOutputDir, projectName);

      await scaffoldMultiTenantProject(projectName, {
        preset: 'multi-tenant',
        databaseStrategy: strategy,
      });

      const configPath = path.join(projectPath, 'tenant.config.js');
      const configContent = await fs.readFile(configPath, 'utf-8');

      expect(configContent).toMatch(new RegExp(`databaseStrategy.*${strategy}`, 'i'));

      // Check strategy-specific files
      if (strategy === 'separate-schemas') {
        expect(await fs.pathExists(path.join(projectPath, 'src/lib/tenant/schema-manager.ts'))).toBe(true);
      } else if (strategy === 'shared-schema') {
        expect(await fs.pathExists(path.join(projectPath, 'src/lib/tenant/row-level-security.ts'))).toBe(true);
      } else if (strategy === 'separate-databases') {
        expect(await fs.pathExists(path.join(projectPath, 'src/lib/tenant/connection-manager.ts'))).toBe(true);
      }
    });
  });

  describe('Feature Integration', () => {
    it('should integrate authentication with multi-tenancy', async () => {
      const projectName = 'test-auth-integration';
      const projectPath = path.join(testOutputDir, projectName);

      await scaffoldMultiTenantProject(projectName, {
        preset: 'multi-tenant',
        features: ['auth', 'rbac'],
      });

      // Check auth integration files
      expect(await fs.pathExists(path.join(projectPath, 'src/lib/auth/tenant-auth.ts'))).toBe(true);
      expect(await fs.pathExists(path.join(projectPath, 'src/lib/auth/rbac.ts'))).toBe(true);
      expect(await fs.pathExists(path.join(projectPath, 'src/middleware/auth-tenant.ts'))).toBe(true);

      // Check for tenant-aware auth configuration
      const authConfigPath = path.join(projectPath, 'src/lib/auth/config.ts');
      if (await fs.pathExists(authConfigPath)) {
        const authContent = await fs.readFile(authConfigPath, 'utf-8');
        expect(authContent).toMatch(/tenantId/);
        expect(authContent).toMatch(/tenant.*context/i);
      }
    });

    it('should integrate billing with multi-tenancy', async () => {
      const projectName = 'test-billing-integration';
      const projectPath = path.join(testOutputDir, projectName);

      await scaffoldMultiTenantProject(projectName, {
        preset: 'multi-tenant',
        features: ['billing', 'subscriptions'],
      });

      // Check billing integration files
      expect(await fs.pathExists(path.join(projectPath, 'src/lib/billing/tenant-billing.ts'))).toBe(true);
      expect(await fs.pathExists(path.join(projectPath, 'src/app/admin/billing/page.tsx'))).toBe(true);
      expect(await fs.pathExists(path.join(projectPath, 'database/migrations'))).toBe(true);

      // Check for tenant billing migrations
      const migrationsDir = path.join(projectPath, 'database/migrations');
      const migrationFiles = await fs.readdir(migrationsDir);
      
      expect(migrationFiles.some(file => 
        file.toLowerCase().includes('tenant_subscriptions')
      )).toBe(true);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle invalid preset gracefully', async () => {
      const projectName = 'test-invalid-preset';

      const result = await scaffoldMultiTenantProject(projectName, {
        preset: 'invalid-preset' as any,
      });

      expect(result.exitCode).not.toBe(0);
      expect(result.stderr).toMatch(/invalid.*preset/i);
    });

    it('should handle existing directory', async () => {
      const projectName = 'test-existing-dir';
      const projectPath = path.join(testOutputDir, projectName);

      // Create directory first
      await fs.ensureDir(projectPath);
      await fs.writeFile(path.join(projectPath, 'existing-file.txt'), 'test');

      const result = await scaffoldMultiTenantProject(projectName, {
        preset: 'multi-tenant',
        force: false,
      });

      // Should ask for confirmation or fail
      expect(result.exitCode).not.toBe(0);
      expect(result.stderr).toMatch(/directory.*exists/i);
    });

    it('should overwrite with force flag', async () => {
      const projectName = 'test-force-overwrite';
      const projectPath = path.join(testOutputDir, projectName);

      // Create directory first
      await fs.ensureDir(projectPath);
      await fs.writeFile(path.join(projectPath, 'existing-file.txt'), 'test');

      const result = await scaffoldMultiTenantProject(projectName, {
        preset: 'multi-tenant',
        force: true,
      });

      expect(result.exitCode).toBe(0);
      expect(await fs.pathExists(projectPath)).toBe(true);
      
      // Original file should be gone
      expect(await fs.pathExists(path.join(projectPath, 'existing-file.txt'))).toBe(false);
    });
  });

  describe('Performance and Resource Usage', () => {
    it('should scaffold within performance thresholds', async () => {
      const projectName = 'test-performance';
      const startTime = Date.now();

      const result = await scaffoldMultiTenantProject(projectName, {
        preset: 'multi-tenant',
        framework: 'nextjs',
        database: 'postgresql',
        features: ['auth', 'billing', 'admin'],
      });

      const duration = Date.now() - startTime;

      expect(result.exitCode).toBe(0);
      expect(duration).toBeLessThan(TEST_CONFIG.timeouts.scaffolding);
      
      console.log(`✅ Scaffolding completed in ${duration}ms (under ${TEST_CONFIG.timeouts.scaffolding}ms threshold)`);
    });
  });

  // Helper functions
  async function scaffoldMultiTenantProject(
    projectName: string, 
    options: {
      preset?: string;
      framework?: string;
      database?: string;
      features?: string[];
      databaseStrategy?: string;
      force?: boolean;
    }
  ): Promise<ScaffoldResult> {
    const startTime = Date.now();
    const projectPath = path.join(testOutputDir, projectName);

    const args = [
      'create', projectName,
      '--preset', options.preset || 'multi-tenant',
    ];

    if (options.framework) {
      args.push('--framework', options.framework);
    }

    if (options.database) {
      args.push('--database', options.database);
    }

    if (options.features) {
      args.push('--features', options.features.join(','));
    }

    if (options.databaseStrategy) {
      args.push('--database-strategy', options.databaseStrategy);
    }

    if (options.force) {
      args.push('--force');
    }

    args.push('--dry-run'); // For testing, use dry-run mode

    try {
      const result = execSync(`xaheen ${args.join(' ')}`, {
        cwd: testOutputDir,
        encoding: 'utf-8',
        timeout: TEST_CONFIG.timeouts.scaffolding,
      });

      return {
        exitCode: 0,
        stdout: result,
        stderr: '',
        projectPath,
        duration: Date.now() - startTime,
      };
    } catch (error: any) {
      return {
        exitCode: error.status || 1,
        stdout: error.stdout || '',
        stderr: error.stderr || error.message,
        projectPath,
        duration: Date.now() - startTime,
      };
    }
  }

  async function analyzeProjectStructure(projectPath: string): Promise<ProjectStructure> {
    const directories: string[] = [];
    const files: string[] = [];
    const configFiles: string[] = [];
    const migrationFiles: string[] = [];

    const walkDir = async (dir: string, relativePath = '') => {
      if (!await fs.pathExists(dir)) return;
      
      const items = await fs.readdir(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const relativeItemPath = path.join(relativePath, item);
        const stat = await fs.stat(fullPath);

        if (stat.isDirectory()) {
          directories.push(relativeItemPath);
          await walkDir(fullPath, relativeItemPath);
        } else {
          files.push(relativeItemPath);
          
          // Categorize files
          if (item.includes('.config.') || item === '.env.example') {
            configFiles.push(relativeItemPath);
          }
          
          if (fullPath.includes('migrations') && item.endsWith('.sql')) {
            migrationFiles.push(relativeItemPath);
          }
        }
      }
    };

    await walkDir(projectPath);

    return {
      directories,
      files,
      configFiles,
      migrationFiles,
    };
  }
});