/**
 * Database Compatibility System Tests
 * 
 * Comprehensive tests for the database compatibility matrix system,
 * including multi-tenant scenarios and SaaS bundle recommendations.
 * 
 * @author Database Expert Agent
 * @since 2025-08-03
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  CompatibilityChecker,
  DatabaseCompatibilityEngine,
  DatabaseBundleResolver,
  ServiceIdentifierUtils,
  DatabaseContextUtils
} from '../index';
import type {
  ServiceIdentifier,
  CompatibilityCheckRequest,
  DatabaseCompatibilityContext
} from '../index';

describe('Database Compatibility System', () => {
  let compatibilityChecker: CompatibilityChecker;
  let databaseEngine: DatabaseCompatibilityEngine;
  let bundleResolver: DatabaseBundleResolver;

  beforeEach(() => {
    compatibilityChecker = new CompatibilityChecker();
    databaseEngine = new DatabaseCompatibilityEngine();
    bundleResolver = new DatabaseBundleResolver();
  });

  describe('Service Identifier Utils', () => {
    it('should create service identifiers correctly', () => {
      const postgresql = ServiceIdentifierUtils.create(
        'database',
        'postgresql',
        ['multi-tenant', 'rls']
      );

      expect(postgresql.type).toBe('database');
      expect(postgresql.provider).toBe('postgresql');
      expect(postgresql.tags).toContain('multi-tenant');
      expect(postgresql.tags).toContain('rls');
    });

    it('should match service identifiers correctly', () => {
      const pattern = ServiceIdentifierUtils.create('database', 'postgresql', ['multi-tenant']);
      const service = ServiceIdentifierUtils.create('database', 'postgresql', ['multi-tenant', 'rls']);

      expect(ServiceIdentifierUtils.matches(pattern, service)).toBe(true);
    });

    it('should identify database services', () => {
      const postgresql = ServiceIdentifierUtils.create('database', 'postgresql');
      const redis = ServiceIdentifierUtils.create('cache', 'redis');
      const auth = ServiceIdentifierUtils.create('auth', 'better-auth');

      expect(ServiceIdentifierUtils.isDatabaseService(postgresql)).toBe(true);
      expect(ServiceIdentifierUtils.isDatabaseService(redis)).toBe(true);
      expect(ServiceIdentifierUtils.isDatabaseService(auth)).toBe(false);
    });

    it('should detect multi-tenancy support', () => {
      const multiTenantDb = ServiceIdentifierUtils.create('database', 'postgresql', ['multi-tenant']);
      const regularDb = ServiceIdentifierUtils.create('database', 'sqlite');

      expect(ServiceIdentifierUtils.supportsMultiTenancy(multiTenantDb)).toBe(true);
      expect(ServiceIdentifierUtils.supportsMultiTenancy(regularDb)).toBe(false);
    });
  });

  describe('Database Context Utils', () => {
    it('should create SaaS context correctly', () => {
      const context = DatabaseContextUtils.createSaaSContext({
        tenancyStrategy: 'row-level-security',
        expectedLoad: 'high',
        maxTenants: 1000,
        gdprCompliance: true
      });

      expect(context.multiTenancy.strategy).toBe('row-level-security');
      expect(context.performance.expectedLoad).toBe('high');
      expect(context.multiTenancy.maxTenants).toBe(1000);
      expect(context.compliance.gdprCompliance).toBe(true);
    });

    it('should create development context', () => {
      const context = DatabaseContextUtils.createDevelopmentContext();

      expect(context.database.provider).toBe('sqlite');
      expect(context.multiTenancy.strategy).toBe('shared-database');
      expect(context.performance.expectedLoad).toBe('low');
      expect(context.scaling.readReplicas).toBe(false);
    });

    it('should validate context consistency', () => {
      const validContext = DatabaseContextUtils.createSaaSContext();
      const validation = DatabaseContextUtils.validateContext(validContext);

      expect(validation.valid).toBe(true);
      expect(validation.issues).toHaveLength(0);
    });

    it('should detect context inconsistencies', () => {
      const invalidContext = DatabaseContextUtils.createSaaSContext({
        tenancyStrategy: 'row-level-security'
      });
      // Manually set incompatible database
      invalidContext.database.provider = 'sqlite';

      const validation = DatabaseContextUtils.validateContext(invalidContext);

      expect(validation.valid).toBe(false);
      expect(validation.issues.length).toBeGreaterThan(0);
    });
  });

  describe('Compatibility Checker', () => {
    it('should check basic service compatibility', async () => {
      const services: ServiceIdentifier[] = [
        ServiceIdentifierUtils.create('database', 'postgresql', ['multi-tenant']),
        ServiceIdentifierUtils.create('auth', 'better-auth', ['typescript'])
      ];

      const request: CompatibilityCheckRequest = {
        services,
        environment: 'production',
        includeRecommendations: true,
        includeWarnings: true,
        context: {}
      };

      const result = await compatibilityChecker.checkCompatibility(request);

      expect(result.compatible).toBe(true);
      expect(result.overallScore).toBeGreaterThan(70);
      expect(result.issues).toBeInstanceOf(Array);
      expect(result.recommendations).toBeInstanceOf(Array);
    });

    it('should detect incompatible combinations', async () => {
      const services: ServiceIdentifier[] = [
        ServiceIdentifierUtils.create('database', 'sqlite'),
        ServiceIdentifierUtils.create('payment', 'stripe', ['production'])
      ];

      const request: CompatibilityCheckRequest = {
        services,
        environment: 'production',
        includeRecommendations: true,
        includeWarnings: true,
        context: { expectedLoad: 'high' }
      };

      const result = await compatibilityChecker.checkCompatibility(request);

      expect(result.compatible).toBe(false);
      expect(result.criticalIssues.length).toBeGreaterThan(0);
      expect(result.overallScore).toBeLessThan(50);
    });

    it('should check database-specific compatibility', async () => {
      const services: ServiceIdentifier[] = [
        ServiceIdentifierUtils.create('database', 'postgresql', ['multi-tenant']),
        ServiceIdentifierUtils.create('cache', 'redis', ['session-store'])
      ];

      const dbContext = DatabaseContextUtils.createSaaSContext({
        tenancyStrategy: 'row-level-security',
        expectedLoad: 'medium'
      });

      const result = await compatibilityChecker.checkDatabaseCompatibility(services, dbContext);

      expect(result.compatible).toBe(true);
      expect(result.overallScore).toBeGreaterThan(80);
    });

    it('should validate multi-tenant architecture', async () => {
      const services: ServiceIdentifier[] = [
        ServiceIdentifierUtils.create('database', 'postgresql', ['multi-tenant']),
        ServiceIdentifierUtils.create('auth', 'better-auth', ['multi-tenant']),
        ServiceIdentifierUtils.create('rbac', 'casbin', ['tenant-aware'])
      ];

      const tenancyStrategy = {
        strategy: 'row-level-security' as const,
        isolation: 'strict' as const,
        maxTenants: 1000
      };

      const result = await compatibilityChecker.validateMultiTenantArchitecture(
        services,
        tenancyStrategy
      );

      expect(result.compatible).toBe(true);
      expect(result.issues).toHaveLength(0);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('should validate SaaS bundle compatibility', async () => {
      const bundleServices: ServiceIdentifier[] = [
        ServiceIdentifierUtils.create('frontend', 'next', ['ssr', 'saas']),
        ServiceIdentifierUtils.create('database', 'postgresql', ['multi-tenant']),
        ServiceIdentifierUtils.create('auth', 'better-auth', ['typescript']),
        ServiceIdentifierUtils.create('payment', 'stripe', ['subscription']),
        ServiceIdentifierUtils.create('cache', 'redis', ['performance'])
      ];

      const dbContext = DatabaseContextUtils.createSaaSContext({
        tenancyStrategy: 'row-level-security',
        expectedLoad: 'medium'
      });

      const result = await compatibilityChecker.validateSaaSBundle(bundleServices, dbContext);

      expect(result.compatible).toBe(true);
      expect(result.overallScore).toBeGreaterThan(85);
    });
  });

  describe('Database Compatibility Engine', () => {
    it('should validate PostgreSQL for SaaS', async () => {
      const postgresql = ServiceIdentifierUtils.create('database', 'postgresql', ['multi-tenant']);
      const context = DatabaseContextUtils.createSaaSContext({
        tenancyStrategy: 'row-level-security',
        expectedLoad: 'medium'
      });

      const result = await databaseEngine.validateDatabaseForSaaS(postgresql, context);

      expect(result.compatible).toBe(true);
      expect(result.score).toBeGreaterThan(80);
      expect(result.issues).toHaveLength(0);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('should reject SQLite for production SaaS', async () => {
      const sqlite = ServiceIdentifierUtils.create('database', 'sqlite');
      const context = DatabaseContextUtils.createSaaSContext({
        tenancyStrategy: 'row-level-security',
        expectedLoad: 'high'
      });

      const result = await databaseEngine.validateDatabaseForSaaS(sqlite, context);

      expect(result.compatible).toBe(false);
      expect(result.score).toBeLessThan(50);
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it('should validate schema compatibility', async () => {
      const postgresql = ServiceIdentifierUtils.create('database', 'postgresql');
      const context = DatabaseContextUtils.createSaaSContext();

      const schemaCompatibility = await databaseEngine.validateSchemaCompatibility(
        {}, // Mock schema
        postgresql,
        context
      );

      expect(schemaCompatibility.patterns.multiTenant).toBe(true);
      expect(schemaCompatibility.dataIsolation.tenantSeparation).toBe('logical');
      expect(schemaCompatibility.performance.estimatedQueryPerformance).toBeOneOf([
        'excellent', 'good', 'acceptable', 'poor'
      ]);
    });
  });

  describe('Database Bundle Resolver', () => {
    it('should recommend appropriate bundle for MVP', async () => {
      const request = {
        businessModel: 'mvp' as const,
        expectedUsers: 1000,
        expectedTenants: 50,
        teamSize: 'small' as const,
        budget: 'low' as const,
        timeline: 'immediate' as const,
        compliance: [],
        features: ['multi-tenancy'],
        technicalConstraints: {}
      };

      const result = await bundleResolver.getBundleRecommendation(request);

      expect(result.recommended.category).toBe('starter');
      expect(result.recommended.requirements.budget).toBe('low');
      expect(result.compatibility.compatible).toBe(true);
      expect(result.reasoning.length).toBeGreaterThan(0);
    });

    it('should recommend enterprise bundle for large scale', async () => {
      const request = {
        businessModel: 'enterprise' as const,
        expectedUsers: 100000,
        expectedTenants: 5000,
        teamSize: 'large' as const,
        budget: 'high' as const,
        timeline: 'months' as const,
        compliance: ['gdpr', 'soc2'],
        features: ['multi-tenancy', 'rbac', 'monitoring', 'encryption'],
        technicalConstraints: {}
      };

      const result = await bundleResolver.getBundleRecommendation(request);

      expect(result.recommended.category).toBe('enterprise');
      expect(result.recommended.features.rbac).toBe(true);
      expect(result.recommended.features.encryption).toBe(true);
      expect(result.compatibility.compatible).toBe(true);
    });

    it('should provide migration path when appropriate', async () => {
      const request = {
        businessModel: 'subscription' as const,
        expectedUsers: 5000,
        expectedTenants: 200,
        teamSize: 'medium' as const,
        budget: 'medium' as const,
        timeline: 'weeks' as const,
        compliance: [],
        features: ['multi-tenancy', 'caching'],
        technicalConstraints: {
          existingInfrastructure: ['sqlite']
        }
      };

      const result = await bundleResolver.getBundleRecommendation(request);

      expect(result.migrationPath).toBeDefined();
      expect(result.migrationPath?.from).toBe('sqlite');
      expect(result.migrationPath?.steps.length).toBeGreaterThan(0);
    });

    it('should get all available bundles', () => {
      const bundles = bundleResolver.getAllBundles();

      expect(bundles.length).toBeGreaterThan(0);
      expect(bundles.every(bundle => bundle.id && bundle.name)).toBe(true);
    });

    it('should validate bundle compatibility', async () => {
      const bundles = bundleResolver.getAllBundles();
      const starterBundle = bundles.find(b => b.category === 'starter');
      
      expect(starterBundle).toBeDefined();
      
      if (starterBundle) {
        const context = DatabaseContextUtils.createSaaSContext();
        const result = await bundleResolver.validateBundle(starterBundle, context);

        expect(result.compatible).toBe(true);
        expect(result.overallScore).toBeGreaterThan(60);
      }
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete SaaS compatibility workflow', async () => {
      // 1. Get bundle recommendation
      const request = {
        businessModel: 'subscription' as const,
        expectedUsers: 10000,
        expectedTenants: 500,
        teamSize: 'medium' as const,
        budget: 'medium' as const,
        timeline: 'weeks' as const,
        compliance: ['gdpr'],
        features: ['multi-tenancy', 'caching', 'monitoring'],
        technicalConstraints: {}
      };

      const bundleResult = await bundleResolver.getBundleRecommendation(request);
      expect(bundleResult.recommended).toBeDefined();

      // 2. Validate the recommended services
      const services = [
        ...bundleResult.recommended.services.core,
        ...bundleResult.recommended.services.optional
      ];

      const dbContext = DatabaseContextUtils.createSaaSContext({
        tenancyStrategy: 'row-level-security',
        expectedLoad: 'medium',
        gdprCompliance: true
      });

      const compatibilityResult = await compatibilityChecker.checkDatabaseCompatibility(
        services,
        dbContext
      );

      expect(compatibilityResult.compatible).toBe(true);

      // 3. Validate multi-tenant architecture
      const tenancyResult = await compatibilityChecker.validateMultiTenantArchitecture(
        services,
        dbContext.multiTenancy
      );

      expect(tenancyResult.compatible).toBe(true);

      // 4. Check individual database validation
      const databaseService = services.find(s => s.type === 'database');
      if (databaseService) {
        const dbValidation = await databaseEngine.validateDatabaseForSaaS(
          databaseService,
          dbContext
        );

        expect(dbValidation.compatible).toBe(true);
        expect(dbValidation.score).toBeGreaterThan(70);
      }
    });

    it('should detect and warn about problematic configurations', async () => {
      // Test SQLite with high-scale requirements
      const problematicServices: ServiceIdentifier[] = [
        ServiceIdentifierUtils.create('database', 'sqlite'),
        ServiceIdentifierUtils.create('auth', 'better-auth'),
        ServiceIdentifierUtils.create('payment', 'stripe'),
        ServiceIdentifierUtils.create('rbac', 'casbin')
      ];

      const highScaleContext = DatabaseContextUtils.createSaaSContext({
        tenancyStrategy: 'row-level-security',
        expectedLoad: 'enterprise',
        maxTenants: 10000
      });

      const result = await compatibilityChecker.checkDatabaseCompatibility(
        problematicServices,
        highScaleContext
      );

      expect(result.compatible).toBe(false);
      expect(result.criticalIssues.length).toBeGreaterThan(0);
      expect(result.recommendations.some(r => 
        r.service.provider === 'postgresql'
      )).toBe(true);
    });
  });
});