/**
 * Database Bundle Resolver
 * 
 * Resolves and validates database-focused service bundles for SaaS applications,
 * with intelligent recommendations based on requirements and constraints.
 * 
 * @author Database Expert Agent
 * @since 2025-08-03
 */

import type {
  ServiceIdentifier,
  CompatibilityCheckResult
} from '../../schemas/service-compatibility.schema';
import type {
  DatabaseCompatibilityContext
} from '../interfaces/compatibility-matrix.interface';
import { CompatibilityChecker } from './compatibility-checker';
import { DatabaseCompatibilityEngine } from './database-compatibility-engine';
import { DatabaseContextUtils } from '../utils/compatibility-utils';

/**
 * Database bundle configuration
 */
export interface DatabaseBundle {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: 'starter' | 'professional' | 'enterprise' | 'development';
  services: {
    core: ServiceIdentifier[];
    optional: ServiceIdentifier[];
  };
  requirements: {
    minTenants: number;
    maxTenants: number;
    expectedLoad: 'low' | 'medium' | 'high' | 'enterprise';
    compliance: string[];
    budget: 'low' | 'medium' | 'high';
  };
  features: {
    multiTenancy: boolean;
    caching: boolean;
    monitoring: boolean;
    analytics: boolean;
    rbac: boolean;
    encryption: boolean;
  };
  deployment: {
    environments: string[];
    cloudProviders: string[];
    estimatedCost: string;
    setupComplexity: 'simple' | 'moderate' | 'complex';
  };
}

/**
 * Bundle recommendation request
 */
export interface BundleRecommendationRequest {
  businessModel: 'mvp' | 'freemium' | 'subscription' | 'enterprise';
  expectedUsers: number;
  expectedTenants: number;
  teamSize: 'solo' | 'small' | 'medium' | 'large';
  budget: 'low' | 'medium' | 'high';
  timeline: 'immediate' | 'weeks' | 'months';
  compliance: string[];
  features: string[];
  technicalConstraints: {
    cloudProvider?: string;
    preferredDatabase?: string;
    existingInfrastructure?: string[];
  };
}

/**
 * Bundle recommendation result
 */
export interface BundleRecommendationResult {
  recommended: DatabaseBundle;
  alternatives: DatabaseBundle[];
  reasoning: string[];
  migrationPath?: {
    from: string;
    to: string;
    effort: 'low' | 'medium' | 'high';
    steps: string[];
  };
  compatibility: CompatibilityCheckResult;
  estimatedSetup: {
    timeInHours: number;
    complexity: 'simple' | 'moderate' | 'complex';
    prerequisites: string[];
  };
}

/**
 * Database bundle resolver implementation
 */
export class DatabaseBundleResolver {
  private compatibilityChecker: CompatibilityChecker;
  private databaseEngine: DatabaseCompatibilityEngine;
  private bundles: Map<string, DatabaseBundle>;

  constructor() {
    this.compatibilityChecker = new CompatibilityChecker();
    this.databaseEngine = new DatabaseCompatibilityEngine();
    this.bundles = new Map();
    this.initializeBundles();
  }

  /**
   * Initialize predefined database bundles
   */
  private initializeBundles(): void {
    const bundles: DatabaseBundle[] = [
      {
        id: 'saas-db-starter',
        name: 'SaaS Database Starter',
        displayName: 'SaaS Database Starter Bundle',
        description: 'Essential database stack for SaaS MVP with PostgreSQL and basic authentication',
        category: 'starter',
        services: {
          core: [
            { type: 'database', provider: 'postgresql', tags: ['multi-tenant', 'mvp'] },
            { type: 'auth', provider: 'better-auth', tags: ['typescript', 'simple'] }
          ],
          optional: [
            { type: 'cache', provider: 'redis', tags: ['session-store'] }
          ]
        },
        requirements: {
          minTenants: 1,
          maxTenants: 100,
          expectedLoad: 'low',
          compliance: [],
          budget: 'low'
        },
        features: {
          multiTenancy: true,
          caching: false,
          monitoring: false,
          analytics: false,
          rbac: false,
          encryption: false
        },
        deployment: {
          environments: ['development', 'staging', 'production'],
          cloudProviders: ['aws', 'gcp', 'azure', 'digitalocean'],
          estimatedCost: '$50-150/month',
          setupComplexity: 'simple'
        }
      },
      {
        id: 'saas-db-professional',
        name: 'SaaS Database Professional',
        displayName: 'SaaS Database Professional Bundle',
        description: 'Production-ready database stack with advanced multi-tenancy, caching, and monitoring',
        category: 'professional',
        services: {
          core: [
            { type: 'database', provider: 'postgresql', tags: ['multi-tenant', 'production'] },
            { type: 'cache', provider: 'redis', tags: ['caching', 'session-store'] },
            { type: 'auth', provider: 'better-auth', tags: ['typescript', 'oauth'] },
            { type: 'rbac', provider: 'casbin', tags: ['tenant-aware'] }
          ],
          optional: [
            { type: 'monitoring', provider: 'sentry', tags: ['error-tracking'] },
            { type: 'analytics', provider: 'posthog', tags: ['product-analytics'] }
          ]
        },
        requirements: {
          minTenants: 50,
          maxTenants: 1000,
          expectedLoad: 'medium',
          compliance: ['gdpr'],
          budget: 'medium'
        },
        features: {
          multiTenancy: true,
          caching: true,
          monitoring: true,
          analytics: true,
          rbac: true,
          encryption: true
        },
        deployment: {
          environments: ['staging', 'production'],
          cloudProviders: ['aws', 'gcp', 'azure'],
          estimatedCost: '$200-500/month',
          setupComplexity: 'moderate'
        }
      },
      {
        id: 'saas-db-enterprise',
        name: 'SaaS Database Enterprise',
        displayName: 'SaaS Database Enterprise Bundle',
        description: 'Enterprise-grade database stack with advanced features, compliance, and global distribution',
        category: 'enterprise',
        services: {
          core: [
            { type: 'database', provider: 'postgresql', tags: ['multi-tenant', 'enterprise', 'encryption'] },
            { type: 'cache', provider: 'redis', tags: ['cluster', 'high-availability'] },
            { type: 'auth', provider: 'better-auth', tags: ['typescript', 'sso', 'mfa'] },
            { type: 'rbac', provider: 'casbin', tags: ['enterprise', 'complex-policies'] },
            { type: 'monitoring', provider: 'sentry', tags: ['enterprise'] },
            { type: 'analytics', provider: 'posthog', tags: ['enterprise'] }
          ],
          optional: [
            { type: 'search', provider: 'elasticsearch', tags: ['enterprise-search'] }
          ]
        },
        requirements: {
          minTenants: 1000,
          maxTenants: 50000,
          expectedLoad: 'enterprise',
          compliance: ['gdpr', 'hipaa', 'soc2'],
          budget: 'high'
        },
        features: {
          multiTenancy: true,
          caching: true,
          monitoring: true,
          analytics: true,
          rbac: true,
          encryption: true
        },
        deployment: {
          environments: ['staging', 'production', 'disaster-recovery'],
          cloudProviders: ['aws', 'gcp', 'azure'],
          estimatedCost: '$1000-5000/month',
          setupComplexity: 'complex'
        }
      },
      {
        id: 'saas-db-development',
        name: 'SaaS Database Development',
        displayName: 'SaaS Database Development Bundle',
        description: 'Lightweight database stack optimized for local development and testing',
        category: 'development',
        services: {
          core: [
            { type: 'database', provider: 'sqlite', tags: ['development', 'local'] },
            { type: 'auth', provider: 'better-auth', tags: ['simple', 'development'] }
          ],
          optional: []
        },
        requirements: {
          minTenants: 1,
          maxTenants: 10,
          expectedLoad: 'low',
          compliance: [],
          budget: 'low'
        },
        features: {
          multiTenancy: false,
          caching: false,
          monitoring: false,
          analytics: false,
          rbac: false,
          encryption: false
        },
        deployment: {
          environments: ['development'],
          cloudProviders: [],
          estimatedCost: '$0/month',
          setupComplexity: 'simple'
        }
      }
    ];

    bundles.forEach(bundle => this.bundles.set(bundle.id, bundle));
  }

  /**
   * Get bundle recommendation based on requirements
   */
  async getBundleRecommendation(
    request: BundleRecommendationRequest
  ): Promise<BundleRecommendationResult> {
    // Score all bundles based on requirements
    const scoredBundles = await this.scoreBundles(request);
    
    // Get the best match
    const recommended = scoredBundles[0].bundle;
    const alternatives = scoredBundles.slice(1, 3).map(scored => scored.bundle);

    // Generate reasoning
    const reasoning = this.generateRecommendationReasoning(recommended, request);

    // Check compatibility
    const allServices = [...recommended.services.core, ...recommended.services.optional];
    const dbContext = this.createDatabaseContext(request, recommended);
    const compatibility = await this.compatibilityChecker.checkDatabaseCompatibility(
      allServices,
      dbContext
    );

    // Determine migration path if applicable
    const migrationPath = this.determineMigrationPath(request, recommended);

    // Estimate setup complexity
    const estimatedSetup = this.estimateSetupComplexity(recommended, request);

    return {
      recommended,
      alternatives,
      reasoning,
      migrationPath,
      compatibility,
      estimatedSetup
    };
  }

  /**
   * Score bundles based on requirements
   */
  private async scoreBundles(
    request: BundleRecommendationRequest
  ): Promise<Array<{ bundle: DatabaseBundle; score: number; reasoning: string[] }>> {
    const scored: Array<{ bundle: DatabaseBundle; score: number; reasoning: string[] }> = [];

    for (const bundle of this.bundles.values()) {
      const score = await this.calculateBundleScore(bundle, request);
      const reasoning = this.generateScoringReasoning(bundle, request, score);
      scored.push({ bundle, score, reasoning });
    }

    return scored.sort((a, b) => b.score - a.score);
  }

  /**
   * Calculate bundle score based on requirements
   */
  private async calculateBundleScore(
    bundle: DatabaseBundle,
    request: BundleRecommendationRequest
  ): Promise<number> {
    let score = 0;

    // Business model alignment (25 points)
    score += this.scoreBusinessModelAlignment(bundle, request);

    // Scale requirements (25 points)
    score += this.scoreScaleRequirements(bundle, request);

    // Feature requirements (20 points)
    score += this.scoreFeatureRequirements(bundle, request);

    // Budget alignment (15 points)
    score += this.scoreBudgetAlignment(bundle, request);

    // Team size and complexity (10 points)
    score += this.scoreComplexityAlignment(bundle, request);

    // Compliance requirements (5 points)
    score += this.scoreComplianceAlignment(bundle, request);

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Score business model alignment
   */
  private scoreBusinessModelAlignment(
    bundle: DatabaseBundle,
    request: BundleRecommendationRequest
  ): number {
    const alignmentMap: Record<string, Record<string, number>> = {
      mvp: { development: 15, starter: 25, professional: 10, enterprise: 0 },
      freemium: { development: 5, starter: 20, professional: 25, enterprise: 15 },
      subscription: { development: 0, starter: 15, professional: 25, enterprise: 20 },
      enterprise: { development: 0, starter: 5, professional: 15, enterprise: 25 }
    };

    return alignmentMap[request.businessModel]?.[bundle.category] || 0;
  }

  /**
   * Score scale requirements
   */
  private scoreScaleRequirements(
    bundle: DatabaseBundle,
    request: BundleRecommendationRequest
  ): number {
    let score = 0;

    // Tenant count alignment
    if (request.expectedTenants >= bundle.requirements.minTenants &&
        request.expectedTenants <= bundle.requirements.maxTenants) {
      score += 15;
    } else if (request.expectedTenants > bundle.requirements.maxTenants) {
      score -= 10; // Over capacity
    }

    // User count considerations
    const userScore = Math.min(10, request.expectedUsers / 1000); // 1 point per 1000 users, max 10
    score += userScore;

    return score;
  }

  /**
   * Score feature requirements
   */
  private scoreFeatureRequirements(
    bundle: DatabaseBundle,
    request: BundleRecommendationRequest
  ): number {
    let score = 0;

    // Required features
    const requiredFeatures = request.features;
    const bundleFeatures = bundle.features;

    if (requiredFeatures.includes('multi-tenancy') && bundleFeatures.multiTenancy) score += 5;
    if (requiredFeatures.includes('caching') && bundleFeatures.caching) score += 3;
    if (requiredFeatures.includes('monitoring') && bundleFeatures.monitoring) score += 3;
    if (requiredFeatures.includes('analytics') && bundleFeatures.analytics) score += 3;
    if (requiredFeatures.includes('rbac') && bundleFeatures.rbac) score += 4;
    if (requiredFeatures.includes('encryption') && bundleFeatures.encryption) score += 2;

    return score;
  }

  /**
   * Score budget alignment
   */
  private scoreBudgetAlignment(
    bundle: DatabaseBundle,
    request: BundleRecommendationRequest
  ): number {
    const budgetMap: Record<string, Record<string, number>> = {
      low: { low: 15, medium: 5, high: 0 },
      medium: { low: 10, medium: 15, high: 10 },
      high: { low: 5, medium: 12, high: 15 }
    };

    return budgetMap[request.budget]?.[bundle.requirements.budget] || 0;
  }

  /**
   * Score complexity alignment with team
   */
  private scoreComplexityAlignment(
    bundle: DatabaseBundle,
    request: BundleRecommendationRequest
  ): number {
    const complexityMap: Record<string, Record<string, number>> = {
      solo: { simple: 10, moderate: 5, complex: 0 },
      small: { simple: 8, moderate: 10, complex: 3 },
      medium: { simple: 5, moderate: 10, complex: 8 },
      large: { simple: 3, moderate: 8, complex: 10 }
    };

    return complexityMap[request.teamSize]?.[bundle.deployment.setupComplexity] || 0;
  }

  /**
   * Score compliance alignment
   */
  private scoreComplianceAlignment(
    bundle: DatabaseBundle,
    request: BundleRecommendationRequest
  ): number {
    const requiredCompliance = request.compliance;
    const bundleCompliance = bundle.requirements.compliance;

    const alignedCount = requiredCompliance.filter(req => 
      bundleCompliance.includes(req)
    ).length;

    return Math.min(5, alignedCount * 2);
  }

  /**
   * Generate recommendation reasoning
   */
  private generateRecommendationReasoning(
    bundle: DatabaseBundle,
    request: BundleRecommendationRequest
  ): string[] {
    const reasoning: string[] = [];

    reasoning.push(`${bundle.displayName} is recommended for ${request.businessModel} applications`);
    
    if (request.expectedTenants <= bundle.requirements.maxTenants) {
      reasoning.push(`Supports up to ${bundle.requirements.maxTenants} tenants (you need ${request.expectedTenants})`);
    }

    if (bundle.features.multiTenancy) {
      reasoning.push('Includes robust multi-tenancy support');
    }

    if (bundle.deployment.setupComplexity === 'simple') {
      reasoning.push('Simple setup process suitable for quick deployment');
    }

    if (bundle.requirements.budget === request.budget) {
      reasoning.push(`Aligns with your ${request.budget} budget requirements`);
    }

    return reasoning;
  }

  /**
   * Generate scoring reasoning
   */
  private generateScoringReasoning(
    bundle: DatabaseBundle,
    request: BundleRecommendationRequest,
    score: number
  ): string[] {
    const reasoning: string[] = [];

    if (score >= 80) {
      reasoning.push('Excellent match for your requirements');
    } else if (score >= 60) {
      reasoning.push('Good match with minor trade-offs');
    } else if (score >= 40) {
      reasoning.push('Acceptable match but consider alternatives');
    } else {
      reasoning.push('Poor match - significant compromises required');
    }

    return reasoning;
  }

  /**
   * Create database context from request and bundle
   */
  private createDatabaseContext(
    request: BundleRecommendationRequest,
    bundle: DatabaseBundle
  ): DatabaseCompatibilityContext {
    const loadMap: Record<string, 'low' | 'medium' | 'high' | 'enterprise'> = {
      mvp: 'low',
      freemium: 'medium',
      subscription: 'medium',
      enterprise: 'enterprise'
    };

    return DatabaseContextUtils.createSaaSContext({
      tenancyStrategy: 'row-level-security',
      expectedLoad: loadMap[request.businessModel] || 'medium',
      maxTenants: request.expectedTenants,
      gdprCompliance: request.compliance.includes('gdpr'),
      dataResidency: request.compliance.includes('data-residency')
    });
  }

  /**
   * Determine migration path
   */
  private determineMigrationPath(
    request: BundleRecommendationRequest,
    bundle: DatabaseBundle
  ): BundleRecommendationResult['migrationPath'] {
    // Check if user has existing infrastructure
    const existing = request.technicalConstraints.existingInfrastructure;
    
    if (existing?.includes('sqlite')) {
      return {
        from: 'sqlite',
        to: bundle.id,
        effort: 'medium',
        steps: [
          'Export SQLite data',
          'Set up PostgreSQL instance',
          'Run database migrations',
          'Import data with tenant context',
          'Update application configuration'
        ]
      };
    }

    return undefined;
  }

  /**
   * Estimate setup complexity
   */
  private estimateSetupComplexity(
    bundle: DatabaseBundle,
    request: BundleRecommendationRequest
  ): BundleRecommendationResult['estimatedSetup'] {
    const baseHours = {
      simple: 4,
      moderate: 12,
      complex: 24
    };

    const hours = baseHours[bundle.deployment.setupComplexity];
    
    // Adjust based on team size
    const teamMultiplier = {
      solo: 1.5,
      small: 1.2,
      medium: 1.0,
      large: 0.8
    };

    const adjustedHours = hours * teamMultiplier[request.teamSize];

    const prerequisites = this.getSetupPrerequisites(bundle);

    return {
      timeInHours: Math.round(adjustedHours),
      complexity: bundle.deployment.setupComplexity,
      prerequisites
    };
  }

  /**
   * Get setup prerequisites
   */
  private getSetupPrerequisites(bundle: DatabaseBundle): string[] {
    const prerequisites: string[] = [];

    if (bundle.services.core.some(s => s.provider === 'postgresql')) {
      prerequisites.push('PostgreSQL database instance or cloud service');
    }

    if (bundle.services.core.some(s => s.provider === 'redis')) {
      prerequisites.push('Redis instance or cloud cache service');
    }

    if (bundle.requirements.compliance.includes('gdpr')) {
      prerequisites.push('GDPR compliance documentation and procedures');
    }

    if (bundle.deployment.setupComplexity === 'complex') {
      prerequisites.push('DevOps expertise for complex deployment');
    }

    return prerequisites;
  }

  /**
   * Get all available bundles
   */
  getAllBundles(): DatabaseBundle[] {
    return Array.from(this.bundles.values());
  }

  /**
   * Get bundle by ID
   */
  getBundle(id: string): DatabaseBundle | undefined {
    return this.bundles.get(id);
  }

  /**
   * Validate bundle compatibility
   */
  async validateBundle(
    bundle: DatabaseBundle,
    context: DatabaseCompatibilityContext
  ): Promise<CompatibilityCheckResult> {
    const allServices = [...bundle.services.core, ...bundle.services.optional];
    return this.compatibilityChecker.checkDatabaseCompatibility(allServices, context);
  }
}