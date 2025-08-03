/**
 * Service Remover Tests
 * 
 * Comprehensive tests for the ServiceRemover implementation.
 * 
 * @author Backend Expert Agent
 * @since 2025-01-03
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ServiceRemover } from './service-remover.js';
import { createMockProject, createMockServiceRegistry, createMockProjectInfo } from '../../test/utils/test-helpers.js';
import fs from 'fs-extra';
import path from 'node:path';

describe('ServiceRemover', () => {
  let remover: ServiceRemover;
  let mockServiceRegistry: ReturnType<typeof createMockServiceRegistry>;
  let mockProject: Awaited<ReturnType<typeof createMockProject>>;

  beforeEach(async () => {
    mockServiceRegistry = createMockServiceRegistry();
    remover = new ServiceRemover(mockServiceRegistry);
  });

  afterEach(async () => {
    if (mockProject) {
      await mockProject.cleanup();
    }
    vi.restoreAllMocks();
  });

  describe('analyzeDependencies', () => {
    it('should detect dependent services', async () => {
      mockProject = await createMockProject();
      
      // Mock auth service that depends on database
      mockServiceRegistry.listTemplates.mockImplementation((serviceType) => {
        if (serviceType === 'auth') {
          return Promise.resolve([{
            name: 'better-auth',
            dependencies: [{ serviceType: 'database', required: true }]
          }]);
        }
        return Promise.resolve([]);
      });

      const analysis = await remover.analyzeDependencies(
        ['database'], // Trying to remove database
        ['auth', 'database'], // Existing services
        mockProject.path
      );

      expect(analysis.blockers).toHaveLength(1);
      expect(analysis.blockers[0].dependentService).toBe('auth');
      expect(analysis.blockers[0].requiredService).toBe('database');
    });

    it('should not block removal when no dependencies exist', async () => {
      mockProject = await createMockProject();
      
      mockServiceRegistry.listTemplates.mockResolvedValue([{
        name: 'standalone-service',
        dependencies: []
      }]);

      const analysis = await remover.analyzeDependencies(
        ['analytics'],
        ['auth', 'analytics'],
        mockProject.path
      );

      expect(analysis.blockers).toHaveLength(0);
    });

    it('should detect configuration dependencies', async () => {
      mockProject = await createMockProject({
        'next.config.js': `
          module.exports = {
            experimental: {
              serverComponents: true
            },
            // stripe configuration
            env: {
              STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY
            }
          }
        `
      });

      const analysis = await remover.analyzeDependencies(
        ['stripe'],
        ['auth', 'stripe'],
        mockProject.path
      );

      expect(analysis.warnings.length).toBeGreaterThan(0);
      const configWarning = analysis.warnings.find(w => 
        w.includes('next.config.js may reference stripe')
      );
      expect(configWarning).toBeDefined();
    });

    it('should handle projects without source code', async () => {
      mockProject = await createMockProject();
      await fs.remove(path.join(mockProject.path, 'src'));

      const analysis = await remover.analyzeDependencies(
        ['auth'],
        ['auth', 'payments'],
        mockProject.path
      );

      // Should not throw error and handle gracefully
      expect(analysis).toBeDefined();
      expect(analysis.blockers).toHaveLength(0);
    });
  });

  describe('createRemovalPlan', () => {
    it('should create comprehensive removal plan', async () => {
      mockProject = await createMockProject({
        'src/lib/auth.ts': '// Auth service',
        'src/lib/stripe.ts': '// Stripe integration'
      });

      // Mock service templates
      mockServiceRegistry.listTemplates.mockImplementation((serviceType) => {
        if (serviceType === 'auth') {
          return Promise.resolve([{
            name: 'better-auth',
            injectionPoints: [
              {
                type: 'file-create',
                target: 'src/lib/auth.ts',
                template: 'auth code'
              },
              {
                type: 'json-merge',
                target: 'package.json',
                template: JSON.stringify({
                  dependencies: { 'better-auth': '^1.0.0' }
                })
              }
            ],
            envVariables: [
              { name: 'AUTH_SECRET', required: true }
            ]
          }]);
        }
        return Promise.resolve([]);
      });

      const projectInfo = createMockProjectInfo({
        services: ['auth', 'payments']
      });

      const plan = await remover.createRemovalPlan(
        ['auth'],
        mockProject.path,
        projectInfo,
        { cleanup: false, keepConfig: false, force: false }
      );

      expect(plan.servicesToRemove).toContain('auth');
      expect(plan.filesToRemove).toContain('src/lib/auth.ts');
      expect(plan.dependenciesToRemove).toContain('better-auth');
      expect(plan.envVariablesToRemove).toContain('AUTH_SECRET');
    });

    it('should respect keepConfig option', async () => {
      mockProject = await createMockProject();

      mockServiceRegistry.listTemplates.mockResolvedValue([{
        name: 'test-service',
        injectionPoints: [
          {
            type: 'file-create',
            target: 'package.json',
            template: '{}'
          },
          {
            type: 'file-create',
            target: 'src/lib/service.ts',
            template: 'code'
          }
        ],
        envVariables: []
      }]);

      const projectInfo = createMockProjectInfo();

      const plan = await remover.createRemovalPlan(
        ['test'],
        mockProject.path,
        projectInfo,
        { cleanup: false, keepConfig: true, force: false }
      );

      // Should not remove config files
      expect(plan.filesToRemove).not.toContain('package.json');
      expect(plan.filesToRemove).toContain('src/lib/service.ts');
    });

    it('should add cleanup operations when requested', async () => {
      mockProject = await createMockProject({
        'src/lib/orphaned-auth.ts': '// Orphaned auth file',
        'src/lib/old-stripe.ts': '// Old stripe file'
      });

      mockServiceRegistry.listTemplates.mockResolvedValue([]);

      const projectInfo = createMockProjectInfo();

      const plan = await remover.createRemovalPlan(
        ['auth', 'payments'],
        mockProject.path,
        projectInfo,
        { cleanup: true, keepConfig: false, force: false }
      );

      // Should include orphaned files for cleanup
      expect(plan.filesToRemove.length).toBeGreaterThan(0);
    });
  });

  describe('executeRemoval', () => {
    it('should execute removal plan successfully', async () => {
      mockProject = await createMockProject({
        'src/lib/test-service.ts': '// Test service',
        'package.json': JSON.stringify({
          name: 'test-project',
          dependencies: {
            'test-package': '^1.0.0',
            'other-package': '^2.0.0'
          }
        }, null, 2)
      });

      const plan = {
        servicesToRemove: ['test'],
        filesToRemove: ['src/lib/test-service.ts'],
        filesToModify: [],
        dependenciesToRemove: ['test-package'],
        envVariablesToRemove: ['TEST_API_KEY'],
        configUpdates: []
      };

      const result = await remover.executeRemoval(
        plan,
        mockProject.path,
        { backup: true, cleanup: false }
      );

      expect(result.success).toBe(true);
      expect(result.removedServices).toContain('test');
      expect(result.removedFiles).toContain('src/lib/test-service.ts');
      expect(result.backupPath).toBeDefined();

      // Verify file was actually removed
      const fileExists = await fs.pathExists(
        path.join(mockProject.path, 'src/lib/test-service.ts')
      );
      expect(fileExists).toBe(false);

      // Verify dependency was removed from package.json
      const packageJson = await fs.readJson(
        path.join(mockProject.path, 'package.json')
      );
      expect(packageJson.dependencies['test-package']).toBeUndefined();
      expect(packageJson.dependencies['other-package']).toBeDefined();
    });

    it('should create backup when requested', async () => {
      mockProject = await createMockProject({
        'src/lib/important.ts': '// Important file'
      });

      const plan = {
        servicesToRemove: ['test'],
        filesToRemove: [],
        filesToModify: [],
        dependenciesToRemove: [],
        envVariablesToRemove: [],
        configUpdates: []
      };

      const result = await remover.executeRemoval(
        plan,
        mockProject.path,
        { backup: true, cleanup: false }
      );

      expect(result.backupPath).toBeDefined();
      
      if (result.backupPath) {
        const backupExists = await fs.pathExists(result.backupPath);
        expect(backupExists).toBe(true);
      }
    });

    it('should handle file removal errors gracefully', async () => {
      mockProject = await createMockProject();

      const plan = {
        servicesToRemove: ['test'],
        filesToRemove: ['non-existent-file.ts'],
        filesToModify: [],
        dependenciesToRemove: [],
        envVariablesToRemove: [],
        configUpdates: []
      };

      const result = await remover.executeRemoval(
        plan,
        mockProject.path,
        { backup: false, cleanup: false }
      );

      // Should still succeed even if file doesn't exist
      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should generate post-removal steps', async () => {
      mockProject = await createMockProject();

      const plan = {
        servicesToRemove: ['test'],
        filesToRemove: ['src/lib/test.ts'],
        filesToModify: [{ path: 'src/app/layout.tsx', changes: ['Remove test'] }],
        dependenciesToRemove: ['test-package'],
        envVariablesToRemove: ['TEST_KEY'],
        configUpdates: []
      };

      const result = await remover.executeRemoval(
        plan,
        mockProject.path,
        { backup: false, cleanup: false }
      );

      expect(result.postRemovalSteps.length).toBeGreaterThan(0);
      expect(result.postRemovalSteps).toContain('Run `npm install` to clean up removed dependencies');
      expect(result.postRemovalSteps).toContain('Review modified files for any remaining service references');
      expect(result.postRemovalSteps).toContain('Update .env files to remove unused environment variables');
    });

    it('should handle dependency removal errors', async () => {
      mockProject = await createMockProject();
      // Create invalid package.json
      await fs.writeFile(
        path.join(mockProject.path, 'package.json'),
        'invalid json content'
      );

      const plan = {
        servicesToRemove: ['test'],
        filesToRemove: [],
        filesToModify: [],
        dependenciesToRemove: ['test-package'],
        envVariablesToRemove: [],
        configUpdates: []
      };

      const result = await remover.executeRemoval(
        plan,
        mockProject.path,
        { backup: false, cleanup: false }
      );

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.includes('dependencies'))).toBe(true);
    });
  });
});