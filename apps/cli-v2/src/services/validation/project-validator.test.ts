/**
 * Project Validator Tests
 * 
 * Comprehensive tests for the ProjectValidator implementation.
 * 
 * @author Backend Expert Agent
 * @since 2025-01-03
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ProjectValidator } from './project-validator.js';
import { createMockProject, createMockServiceRegistry, createMockProjectInfo } from '../../test/utils/test-helpers.js';
import fs from 'fs-extra';
import path from 'node:path';

describe('ProjectValidator', () => {
  let validator: ProjectValidator;
  let mockServiceRegistry: ReturnType<typeof createMockServiceRegistry>;
  let mockProject: Awaited<ReturnType<typeof createMockProject>>;

  beforeEach(async () => {
    mockServiceRegistry = createMockServiceRegistry();
    validator = new ProjectValidator(mockServiceRegistry);
  });

  afterEach(async () => {
    if (mockProject) {
      await mockProject.cleanup();
    }
    vi.restoreAllMocks();
  });

  describe('validateProject', () => {
    it('should validate a healthy project without issues', async () => {
      mockProject = await createMockProject();
      const projectInfo = createMockProjectInfo({
        services: [],
        dependencies: { next: '^14.0.0', react: '^18.0.0' }
      });

      // Mock service registry responses
      mockServiceRegistry.listTemplates.mockResolvedValue([]);

      const result = await validator.validateProject(
        mockProject.path,
        projectInfo,
        {
          validateServices: true,
          validateDependencies: true,
          validateEnvironment: true,
          validateLinting: false,
          validateTypes: false,
          autoFix: false
        }
      );

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.validatedAt).toBeInstanceOf(Date);
    });

    it('should detect missing service files', async () => {
      mockProject = await createMockProject();
      const projectInfo = createMockProjectInfo({
        services: ['auth', 'payments']
      });

      // Mock service templates
      mockServiceRegistry.listTemplates
        .mockResolvedValueOnce([{ name: 'better-auth' }]) // auth
        .mockResolvedValueOnce([{ name: 'stripe' }]); // payments

      const result = await validator.validateProject(
        mockProject.path,
        projectInfo,
        {
          validateServices: true,
          validateDependencies: false,
          validateEnvironment: false,
          validateLinting: false,
          validateTypes: false,
          autoFix: false
        }
      );

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      
      const authError = result.errors.find(e => e.message.includes('src/lib/auth.ts'));
      expect(authError).toBeDefined();
    });

    it('should detect orphaned service files', async () => {
      mockProject = await createMockProject({
        'src/lib/stripe.ts': '// Stripe integration'
      });
      
      const projectInfo = createMockProjectInfo({
        services: [] // No services configured, but stripe file exists
      });

      const result = await validator.validateProject(
        mockProject.path,
        projectInfo,
        {
          validateServices: true,
          validateDependencies: false,
          validateEnvironment: false,
          validateLinting: false,
          validateTypes: false,
          autoFix: false
        }
      );

      const orphanedWarning = result.warnings.find(w => 
        w.message.includes('Orphaned service file detected')
      );
      expect(orphanedWarning).toBeDefined();
      expect(orphanedWarning?.fixable).toBe(true);
    });

    it('should validate missing package.json', async () => {
      mockProject = await createMockProject();
      await fs.remove(path.join(mockProject.path, 'package.json'));
      
      const projectInfo = createMockProjectInfo();

      const result = await validator.validateProject(
        mockProject.path,
        projectInfo,
        {
          validateServices: false,
          validateDependencies: true,
          validateEnvironment: false,
          validateLinting: false,
          validateTypes: false,
          autoFix: false
        }
      );

      expect(result.isValid).toBe(false);
      const packageJsonError = result.errors.find(e => 
        e.message.includes('package.json not found')
      );
      expect(packageJsonError).toBeDefined();
    });

    it('should detect missing .env.example', async () => {
      mockProject = await createMockProject();
      await fs.remove(path.join(mockProject.path, '.env.example'));
      
      const projectInfo = createMockProjectInfo();

      const result = await validator.validateProject(
        mockProject.path,
        projectInfo,
        {
          validateServices: false,
          validateDependencies: false,
          validateEnvironment: true,
          validateLinting: false,
          validateTypes: false,
          autoFix: false
        }
      );

      const envWarning = result.warnings.find(w => 
        w.message.includes('Missing .env.example file')
      );
      expect(envWarning).toBeDefined();
      expect(envWarning?.fixable).toBe(true);
    });

    it('should validate environment variables', async () => {
      mockProject = await createMockProject({
        '.env.example': 'DATABASE_URL=\nSTRIPE_SECRET_KEY=\nNEXTAUTH_SECRET=',
        '.env': 'DATABASE_URL=postgresql://...\n# Missing STRIPE_SECRET_KEY and NEXTAUTH_SECRET'
      });
      
      const projectInfo = createMockProjectInfo();

      const result = await validator.validateProject(
        mockProject.path,
        projectInfo,
        {
          validateServices: false,
          validateDependencies: false,
          validateEnvironment: true,
          validateLinting: false,
          validateTypes: false,
          autoFix: false
        }
      );

      const missingVars = result.warnings.filter(w => 
        w.message.includes('Missing environment variable')
      );
      expect(missingVars.length).toBeGreaterThan(0);
    });

    it('should detect missing linting configuration', async () => {
      mockProject = await createMockProject();
      
      // Remove any linting config files that might exist
      const lintConfigs = ['.eslintrc.js', '.eslintrc.json', 'biome.json'];
      for (const config of lintConfigs) {
        const configPath = path.join(mockProject.path, config);
        if (await fs.pathExists(configPath)) {
          await fs.remove(configPath);
        }
      }
      
      const projectInfo = createMockProjectInfo();

      const result = await validator.validateProject(
        mockProject.path,
        projectInfo,
        {
          validateServices: false,
          validateDependencies: false,
          validateEnvironment: false,
          validateLinting: true,
          validateTypes: false,
          autoFix: false
        }
      );

      const lintWarning = result.warnings.find(w => 
        w.message.includes('No linting configuration found')
      );
      expect(lintWarning).toBeDefined();
      expect(lintWarning?.fixable).toBe(true);
    });

    it('should validate TypeScript configuration', async () => {
      mockProject = await createMockProject();
      await fs.remove(path.join(mockProject.path, 'tsconfig.json'));
      
      const projectInfo = createMockProjectInfo({ typescript: true });

      const result = await validator.validateProject(
        mockProject.path,
        projectInfo,
        {
          validateServices: false,
          validateDependencies: false,
          validateEnvironment: false,
          validateLinting: false,
          validateTypes: true,
          autoFix: false
        }
      );

      expect(result.isValid).toBe(false);
      const tsconfigError = result.errors.find(e => 
        e.message.includes('tsconfig.json not found')
      );
      expect(tsconfigError).toBeDefined();
      expect(tsconfigError?.fixable).toBe(true);
    });

    it('should skip TypeScript validation for JavaScript projects', async () => {
      mockProject = await createMockProject();
      await fs.remove(path.join(mockProject.path, 'tsconfig.json'));
      
      const projectInfo = createMockProjectInfo({ typescript: false });

      const result = await validator.validateProject(
        mockProject.path,
        projectInfo,
        {
          validateServices: false,
          validateDependencies: false,
          validateEnvironment: false,
          validateLinting: false,
          validateTypes: true,
          autoFix: false
        }
      );

      // Should not have TypeScript-related errors for JS projects
      const tsconfigError = result.errors.find(e => 
        e.message.includes('tsconfig.json')
      );
      expect(tsconfigError).toBeUndefined();
    });

    it('should handle validation errors gracefully', async () => {
      mockProject = await createMockProject();
      const projectInfo = createMockProjectInfo({
        services: ['invalid-service']
      });

      // Mock service registry to throw error
      mockServiceRegistry.listTemplates.mockRejectedValue(
        new Error('Service registry error')
      );

      const result = await validator.validateProject(
        mockProject.path,
        projectInfo,
        {
          validateServices: true,
          validateDependencies: false,
          validateEnvironment: false,
          validateLinting: false,
          validateTypes: false,
          autoFix: false
        }
      );

      expect(result.isValid).toBe(false);
      const validationError = result.errors.find(e => 
        e.message.includes('Validation failed')
      );
      expect(validationError).toBeDefined();
    });

    it('should calculate metrics correctly', async () => {
      mockProject = await createMockProject();
      const projectInfo = createMockProjectInfo({
        dependencies: { next: '^14.0.0', react: '^18.0.0' },
        devDependencies: { typescript: '^5.0.0' }
      });

      const result = await validator.validateProject(
        mockProject.path,
        projectInfo,
        {
          validateServices: false,
          validateDependencies: true,
          validateEnvironment: false,
          validateLinting: false,
          validateTypes: false,
          autoFix: false
        }
      );

      expect(result.metrics).toBeDefined();
      expect(result.metrics?.dependencies).toBeDefined();
      expect(result.metrics?.dependencies?.total).toBe(3); // next + react + typescript
    });
  });

  describe('applyFixes', () => {
    it('should apply automatic fixes', async () => {
      mockProject = await createMockProject();
      
      const mockResult = {
        isValid: false,
        errors: [],
        warnings: [
          {
            id: 'env-no-example',
            category: 'environment',
            severity: 'warning' as const,
            message: 'Missing .env.example file',
            fixable: true
          }
        ],
        fixableIssues: 1,
        validatedAt: new Date(),
        metrics: undefined
      };

      const fixResult = await validator.applyFixes(mockResult);
      
      expect(fixResult.fixedCount).toBe(1);
      expect(fixResult.appliedFixes).toHaveLength(1);
      expect(fixResult.appliedFixes[0].success).toBe(true);
      expect(fixResult.errors).toHaveLength(0);
    });

    it('should handle fix failures', async () => {
      const mockResult = {
        isValid: false,
        errors: [
          {
            id: 'unfixable-error',
            category: 'custom',
            severity: 'error' as const,
            message: 'Cannot fix this error',
            fixable: true
          }
        ],
        warnings: [],
        fixableIssues: 1,
        validatedAt: new Date(),
        metrics: undefined
      };

      const fixResult = await validator.applyFixes(mockResult);
      
      expect(fixResult.fixedCount).toBe(0);
      expect(fixResult.appliedFixes).toHaveLength(1);
      expect(fixResult.appliedFixes[0].success).toBe(false);
    });

    it('should not attempt to fix non-fixable issues', async () => {
      const mockResult = {
        isValid: false,
        errors: [
          {
            id: 'non-fixable-error',
            category: 'custom',
            severity: 'error' as const,
            message: 'Cannot fix this error',
            fixable: false
          }
        ],
        warnings: [],
        fixableIssues: 0,
        validatedAt: new Date(),
        metrics: undefined
      };

      const fixResult = await validator.applyFixes(mockResult);
      
      expect(fixResult.fixedCount).toBe(0);
      expect(fixResult.appliedFixes).toHaveLength(0);
    });
  });
});