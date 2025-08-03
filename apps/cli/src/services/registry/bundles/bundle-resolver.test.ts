/**
 * Bundle Resolver Tests
 * 
 * Tests for the bundle resolution system to ensure proper service
 * dependency resolution, compatibility checking, and configuration generation.
 * 
 * @author Backend Expert Agent
 * @since 2025-01-03
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BundleResolver } from './bundle-resolver';
import { EnhancedServiceRegistry } from '../core/enhanced-service-registry';
import type { ServiceBundle, ServiceTemplate, BundleResolutionOptions } from '../schemas';

// Mock service registry
const mockServiceRegistry = {
  initialize: vi.fn(),
  getTemplate: vi.fn(),
  hasTemplate: vi.fn(),
  listTemplates: vi.fn(),
  registerTemplate: vi.fn(),
  updateTemplate: vi.fn(),
  removeTemplate: vi.fn()
} as any;

describe('BundleResolver', () => {
  let resolver: BundleResolver;

  beforeEach(() => {
    vi.clearAllMocks();
    resolver = new BundleResolver(mockServiceRegistry);
  });

  describe('initialization', () => {
    it('should initialize successfully', async () => {
      mockServiceRegistry.initialize.mockResolvedValue(undefined);
      
      await resolver.initialize();
      
      expect(mockServiceRegistry.initialize).toHaveBeenCalled();
    });

    it('should handle initialization errors', async () => {
      mockServiceRegistry.initialize.mockRejectedValue(new Error('Registry init failed'));
      
      await expect(resolver.initialize()).rejects.toThrow('Bundle resolver initialization failed');
    });
  });

  describe('bundle resolution', () => {
    const mockBundle: ServiceBundle = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'test-bundle',
      displayName: 'Test Bundle',
      description: 'A test bundle',
      version: '1.0.0',
      type: 'saas-starter',
      author: 'Test Author',
      license: 'MIT',
      keywords: ['test'],
      tags: ['test'],
      services: [
        {
          serviceType: 'auth',
          provider: 'better-auth',
          version: '^1.0.0',
          required: true,
          priority: 100,
          config: {
            enableEmailVerification: true
          }
        },
        {
          serviceType: 'database',
          provider: 'postgresql',
          version: '^2.0.0',
          required: true,
          priority: 90,
          config: {
            orm: 'prisma'
          }
        }
      ],
      optionalServices: [],
      deploymentTargets: ['cloud-native'],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const mockAuthTemplate: ServiceTemplate = {
      name: 'better-auth',
      type: 'auth',
      provider: 'better-auth',
      version: '1.0.0',
      description: 'Modern authentication service',
      injectionPoints: [],
      envVariables: [
        {
          name: 'AUTH_SECRET',
          description: 'Authentication secret key',
          required: true,
          defaultValue: undefined,
          type: 'secret',
          sensitive: true
        }
      ],
      dependencies: [],
      postInjectionSteps: [],
      frameworks: ['next', 'react'],
      databases: [],
      platforms: ['web'],
      orms: [],
      styling: [],
      testing: [],
      minNodeVersion: undefined,
      compatibility: undefined,
      defaultConfiguration: {},
      configurationSchema: undefined,
      verificationSteps: [],
      tags: [],
      exampleRepositories: [],
      documentation: undefined,
      featureFlags: [],
      maturity: 'stable',
      supportLevel: 'community',
      lastUpdated: new Date(),
      statistics: undefined
    };

    const mockDatabaseTemplate: ServiceTemplate = {
      name: 'postgresql',
      type: 'database',
      provider: 'postgresql',
      version: '2.0.0',
      description: 'PostgreSQL database service',
      injectionPoints: [],
      envVariables: [
        {
          name: 'DATABASE_URL',
          description: 'Database connection URL',
          required: true,
          defaultValue: undefined,
          type: 'url',
          sensitive: true
        }
      ],
      dependencies: [],
      postInjectionSteps: [],
      frameworks: ['next', 'react'],
      databases: [],
      platforms: ['web'],
      orms: [],
      styling: [],
      testing: [],
      minNodeVersion: undefined,
      compatibility: undefined,
      defaultConfiguration: {},
      configurationSchema: undefined,
      verificationSteps: [],
      tags: [],
      exampleRepositories: [],
      documentation: undefined,
      featureFlags: [],
      maturity: 'stable',
      supportLevel: 'community',
      lastUpdated: new Date(),
      statistics: undefined
    };

    beforeEach(() => {
      mockServiceRegistry.initialize.mockResolvedValue(undefined);
      mockServiceRegistry.getTemplate
        .mockImplementation((type: string, provider: string) => {
          if (type === 'auth' && provider === 'better-auth') {
            return Promise.resolve(mockAuthTemplate);
          }
          if (type === 'database' && provider === 'postgresql') {
            return Promise.resolve(mockDatabaseTemplate);
          }
          return Promise.resolve(null);
        });
    });

    it('should resolve a simple bundle successfully', async () => {
      const options: BundleResolutionOptions = {
        targetFramework: 'next',
        environment: 'development'
      };

      const result = await resolver.resolveBundle(mockBundle, options);

      expect(result.status).toBe('success');
      expect(result.bundleName).toBe('test-bundle');
      expect(result.resolvedServices).toHaveLength(2);
      expect(result.errors).toHaveLength(0);
      
      // Check auth service
      const authService = result.resolvedServices.find(s => s.serviceType === 'auth');
      expect(authService).toBeDefined();
      expect(authService?.provider).toBe('better-auth');
      expect(authService?.configuration.enableEmailVerification).toBe(true);
      
      // Check database service
      const dbService = result.resolvedServices.find(s => s.serviceType === 'database');
      expect(dbService).toBeDefined();
      expect(dbService?.provider).toBe('postgresql');
      expect(dbService?.configuration.orm).toBe('prisma');
    });

    it('should handle missing service templates', async () => {
      mockServiceRegistry.getTemplate.mockResolvedValue(null);

      const result = await resolver.resolveBundle(mockBundle);

      expect(result.status).toBe('failed');
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Service template not found');
    });

    it('should check framework compatibility', async () => {
      const options: BundleResolutionOptions = {
        targetFramework: 'vue', // Not supported by mock templates
        environment: 'development'
      };

      const result = await resolver.resolveBundle(mockBundle, options);

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.includes('may not be fully compatible'))).toBe(true);
    });

    it('should generate deployment instructions', async () => {
      const result = await resolver.resolveBundle(mockBundle);

      expect(result.deploymentInstructions).toBeDefined();
      expect(result.deploymentInstructions.length).toBeGreaterThan(0);
      expect(result.deploymentInstructions.some(i => i.includes('Bundle:'))).toBe(true);
      expect(result.deploymentInstructions.some(i => i.includes('Services to Deploy'))).toBe(true);
    });

    it('should validate bundle schema', async () => {
      const invalidBundle = {
        ...mockBundle,
        name: '', // Invalid empty name
      };

      await expect(resolver.resolveBundle(invalidBundle as any))
        .rejects.toThrow('Invalid bundle or options');
    });

    it('should handle version compatibility checks', async () => {
      const bundleWithVersionConstraints: ServiceBundle = {
        ...mockBundle,
        services: [
          {
            serviceType: 'auth',
            provider: 'better-auth',
            version: '^2.0.0', // Higher version requirement
            required: true,
            priority: 100,
            config: {}
          }
        ]
      };

      const result = await resolver.resolveBundle(bundleWithVersionConstraints);

      expect(result.status).toBe('failed');
      expect(result.errors.some(e => e.includes('Version incompatible'))).toBe(true);
    });
  });

  describe('bundle recommendations', () => {
    beforeEach(() => {
      mockServiceRegistry.initialize.mockResolvedValue(undefined);
      
      // Mock loadBundleDefinition for recommendations
      vi.spyOn(resolver as any, 'loadBundleDefinition')
        .mockImplementation((bundleName: string) => {
          const mockBundles = {
            'saas-starter': {
              name: 'saas-starter',
              prerequisites: { frameworks: ['next', 'react'] },
              monetization: { limits: { users: 1000 } }
            },
            'saas-professional': {
              name: 'saas-professional',
              prerequisites: { frameworks: ['next', 'react'] },
              monetization: { limits: { users: 10000 } }
            },
            'saas-enterprise': {
              name: 'saas-enterprise',
              prerequisites: { frameworks: ['next'] },
              monetization: { limits: { users: 100000 } },
              complianceRequirements: { standards: ['gdpr', 'pci-dss'] }
            }
          };
          return Promise.resolve(mockBundles[bundleName as keyof typeof mockBundles] || null);
        });
    });

    it('should recommend bundles based on requirements', async () => {
      const requirements = {
        framework: 'next',
        expectedUsers: 5000,
        budget: 'medium' as const,
        compliance: ['gdpr']
      };

      const recommendations = await resolver.getBundleRecommendations(requirements);

      expect(recommendations).toBeDefined();
      expect(recommendations.length).toBeGreaterThan(0);
      
      // Should be sorted by score
      for (let i = 1; i < recommendations.length; i++) {
        expect(recommendations[i-1].score).toBeGreaterThanOrEqual(recommendations[i].score);
      }
    });

    it('should handle framework compatibility in recommendations', async () => {
      const requirements = {
        framework: 'vue', // Not widely supported
        expectedUsers: 1000
      };

      const recommendations = await resolver.getBundleRecommendations(requirements);

      expect(recommendations).toBeDefined();
      // Should still return recommendations but with lower compatibility scores
      recommendations.forEach(rec => {
        expect(rec.compatibility).toBeLessThan(100);
      });
    });
  });

  describe('compatibility checking', () => {
    it('should check if bundle can be resolved', async () => {
      mockServiceRegistry.initialize.mockResolvedValue(undefined);
      mockServiceRegistry.getTemplate.mockResolvedValue({
        name: 'test-service',
        type: 'auth',
        provider: 'test-provider',
        version: '1.0.0'
      });

      const bundle: ServiceBundle = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'test-bundle',
        displayName: 'Test Bundle',
        description: 'Test',
        version: '1.0.0',
        type: 'saas-starter',
        services: [
          {
            serviceType: 'auth',
            provider: 'test-provider',
            required: true,
            priority: 100,
            config: {}
          }
        ],
        optionalServices: [],
        deploymentTargets: ['cloud-native'],
        prerequisites: {
          frameworks: ['next'],
          platforms: ['web']
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const options: BundleResolutionOptions = {
        targetFramework: 'next',
        targetPlatform: 'web'
      };

      const result = await resolver.canResolveBundle(bundle, options);

      expect(result.canResolve).toBe(true);
      expect(result.missingServices).toHaveLength(0);
      expect(result.incompatibilities).toHaveLength(0);
    });

    it('should detect missing services', async () => {
      mockServiceRegistry.initialize.mockResolvedValue(undefined);
      mockServiceRegistry.getTemplate.mockResolvedValue(null); // No services found

      const bundle: ServiceBundle = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'test-bundle',
        displayName: 'Test Bundle',
        description: 'Test',
        version: '1.0.0',
        type: 'saas-starter',
        services: [
          {
            serviceType: 'auth',
            provider: 'missing-provider',
            required: true,
            priority: 100,
            config: {}
          }
        ],
        optionalServices: [],
        deploymentTargets: ['cloud-native'],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await resolver.canResolveBundle(bundle);

      expect(result.canResolve).toBe(false);
      expect(result.missingServices).toContain('auth:missing-provider');
    });

    it('should detect framework incompatibilities', async () => {
      const bundle: ServiceBundle = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'test-bundle',
        displayName: 'Test Bundle',
        description: 'Test',
        version: '1.0.0',
        type: 'saas-starter',
        services: [],
        optionalServices: [],
        deploymentTargets: ['cloud-native'],
        prerequisites: {
          frameworks: ['react'], // Only supports React
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const options: BundleResolutionOptions = {
        targetFramework: 'vue' // Requesting Vue
      };

      const result = await resolver.canResolveBundle(bundle, options);

      expect(result.canResolve).toBe(false);
      expect(result.incompatibilities).toContain('Framework vue not supported');
    });
  });

  describe('deployment plan generation', () => {
    it('should generate deployment plan for successful resolution', async () => {
      const mockResult: any = {
        status: 'success',
        resolvedServices: [
          { serviceType: 'database', provider: 'postgresql' },
          { serviceType: 'auth', provider: 'better-auth' },
          { serviceType: 'cache', provider: 'redis' }
        ]
      };

      const plan = await resolver.generateDeploymentPlan(mockResult, 'development');

      expect(plan.phases).toBeDefined();
      expect(plan.phases.length).toBeGreaterThan(0);
      expect(plan.totalEstimatedTime).toBeDefined();
      expect(plan.prerequisites).toBeDefined();
      expect(plan.risks).toBeDefined();

      // Should have proper phase ordering
      const phaseNames = plan.phases.map(p => p.name);
      expect(phaseNames).toContain('Infrastructure Setup');
      expect(phaseNames).toContain('Core Services');
    });

    it('should reject deployment plan for failed resolution', async () => {
      const mockResult: any = {
        status: 'failed',
        resolvedServices: []
      };

      await expect(resolver.generateDeploymentPlan(mockResult))
        .rejects.toThrow('Cannot generate deployment plan for failed resolution');
    });
  });
});

describe('BundleResolver Integration', () => {
  let resolver: BundleResolver;
  let registry: any;

  beforeEach(() => {
    registry = new EnhancedServiceRegistry();
    resolver = new BundleResolver(registry);
  });

  it('should integrate with real service registry', async () => {
    // This would be an integration test with actual registry
    // For now, just verify the resolver can be constructed with a real registry
    expect(resolver).toBeDefined();
    expect(registry).toBeDefined();
  });
});