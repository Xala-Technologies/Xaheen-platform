/**
 * Service Compatibility Checker
 * 
 * Core compatibility checking engine that validates service combinations
 * with special focus on database services and multi-tenant architectures.
 * 
 * @author Database Expert Agent
 * @since 2025-08-03
 */

import { z } from 'zod';
import type {
  CompatibilityCheckRequest,
  CompatibilityCheckResult,
  CompatibilityIssue,
  ServiceRecommendation,
  ServiceIdentifier,
  CompatibilityRule,
  CompatibilitySeverity
} from '../../schemas/service-compatibility.schema';
import type {
  ICompatibilityChecker,
  DatabaseCompatibilityContext
} from '../interfaces/compatibility-matrix.interface';
import { CompatibilityMatrixManager } from './compatibility-matrix';

/**
 * Enhanced compatibility checker with database expertise
 */
export class CompatibilityChecker implements ICompatibilityChecker {
  private matrixManager: CompatibilityMatrixManager;

  constructor() {
    this.matrixManager = new CompatibilityMatrixManager();
  }

  /**
   * Check basic service compatibility
   */
  async checkCompatibility(request: CompatibilityCheckRequest): Promise<CompatibilityCheckResult> {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();

    const result: CompatibilityCheckResult = {
      requestId,
      compatible: true,
      overallScore: 100,
      issues: [],
      criticalIssues: [],
      warnings: [],
      missingDependencies: [],
      missingRequirements: [],
      recommendations: [],
      alternatives: [],
      checkedAt: new Date(),
      analysisTime: 0,
      rulesApplied: 0,
      confidence: 1.0,
      summary: {
        totalServices: request.services.length,
        compatiblePairs: 0,
        conflictingPairs: 0,
        missingPairs: 0,
        recommendationCount: 0
      }
    };

    try {
      // Load compatibility matrix
      const matrix = await this.matrixManager.loadMatrix();
      
      // Check pairwise compatibility
      for (let i = 0; i < request.services.length; i++) {
        for (let j = i + 1; j < request.services.length; j++) {
          const serviceA = request.services[i];
          const serviceB = request.services[j];
          
          const pairResult = await this.checkServicePair(serviceA, serviceB, matrix.rules);
          
          result.issues.push(...pairResult.issues);
          result.warnings.push(...pairResult.warnings);
          result.recommendations.push(...pairResult.recommendations);
          result.rulesApplied += pairResult.rulesApplied;
          
          if (pairResult.compatible) {
            result.summary!.compatiblePairs++;
          } else {
            result.summary!.conflictingPairs++;
          }
        }
      }

      // Check for missing dependencies
      const dependencyResult = await this.checkDependencies(request.services);
      result.missingDependencies = dependencyResult.missing;
      
      // Generate overall assessment
      result.criticalIssues = result.issues.filter(issue => issue.severity === 'critical');
      result.compatible = result.criticalIssues.length === 0;
      result.overallScore = this.calculateCompatibilityScore(result);
      result.summary!.recommendationCount = result.recommendations.length;

      // Analysis metadata
      result.analysisTime = Date.now() - startTime;
      result.matrixVersion = matrix.version;
      result.confidence = this.calculateConfidence(result);

    } catch (error) {
      result.compatible = false;
      result.overallScore = 0;
      result.issues.push({
        id: crypto.randomUUID(),
        type: 'conflict',
        severity: 'critical',
        message: `Compatibility check failed: ${error}`,
        sourceService: request.services[0],
        context: { error: String(error) }
      });
    }

    return result;
  }

  /**
   * Check database-specific compatibility including multi-tenancy support
   */
  async checkDatabaseCompatibility(
    services: ServiceIdentifier[],
    dbContext: DatabaseCompatibilityContext
  ): Promise<CompatibilityCheckResult> {
    const request: CompatibilityCheckRequest = {
      services,
      environment: 'production', // Assume production for database checks
      includeRecommendations: true,
      includeWarnings: true,
      context: { databaseContext: dbContext }
    };

    const result = await this.checkCompatibility(request);

    // Add database-specific checks
    const dbSpecificIssues = await this.performDatabaseSpecificChecks(services, dbContext);
    result.issues.push(...dbSpecificIssues.issues);
    result.recommendations.push(...dbSpecificIssues.recommendations);

    // Multi-tenancy validation
    const tenancyResult = await this.validateMultiTenantArchitecture(
      services,
      dbContext.multiTenancy
    );
    result.issues.push(...tenancyResult.issues);
    result.recommendations.push(...tenancyResult.recommendations);

    // Scaling compatibility
    const scalingResult = await this.checkScalingCompatibility(services, dbContext.scaling);
    result.issues.push(...scalingResult.issues);
    result.recommendations.push(...scalingResult.recommendations);

    // Recalculate scores
    result.criticalIssues = result.issues.filter(issue => issue.severity === 'critical');
    result.compatible = result.criticalIssues.length === 0;
    result.overallScore = this.calculateCompatibilityScore(result);

    return result;
  }

  /**
   * Validate multi-tenant architecture compatibility
   */
  async validateMultiTenantArchitecture(
    services: ServiceIdentifier[],
    tenancyStrategy: DatabaseCompatibilityContext['multiTenancy']
  ): Promise<{
    compatible: boolean;
    issues: CompatibilityIssue[];
    recommendations: ServiceRecommendation[];
  }> {
    const issues: CompatibilityIssue[] = [];
    const recommendations: ServiceRecommendation[] = [];

    // Check database supports multi-tenancy
    const databaseService = services.find(s => s.type === 'database');
    if (databaseService) {
      if (databaseService.provider === 'sqlite' && tenancyStrategy.strategy !== 'database-per-tenant') {
        issues.push({
          id: crypto.randomUUID(),
          type: 'conflict',
          severity: 'critical',
          message: 'SQLite does not support multi-tenant strategies except database-per-tenant',
          sourceService: databaseService,
          resolution: {
            possible: true,
            automatic: false,
            steps: [
              'Switch to PostgreSQL or MySQL for better multi-tenancy support',
              'Or use database-per-tenant strategy with SQLite (not recommended for production)'
            ],
            alternatives: [
              { type: 'database', provider: 'postgresql', tags: ['multi-tenant'] },
              { type: 'database', provider: 'mysql', tags: ['multi-tenant'] }
            ],
            cost: 'medium'
          }
        });
      }

      // Validate schema-per-tenant strategy
      if (tenancyStrategy.strategy === 'schema-per-tenant') {
        if (databaseService.provider !== 'postgresql') {
          issues.push({
            id: crypto.randomUUID(),
            type: 'conflict',
            severity: 'warning',
            message: 'Schema-per-tenant works best with PostgreSQL',
            sourceService: databaseService,
            resolution: {
              possible: true,
              automatic: false,
              steps: ['Consider using PostgreSQL for better schema-per-tenant support'],
              alternatives: [
                { type: 'database', provider: 'postgresql', tags: ['schema-per-tenant'] }
              ],
              cost: 'medium'
            }
          });
        } else {
          recommendations.push({
            type: 'configure',
            service: databaseService,
            reason: 'Enable PostgreSQL schema-per-tenant optimizations',
            benefits: [
              'Better tenant isolation',
              'Easier tenant-specific migrations',
              'Simplified backup/restore per tenant'
            ],
            effort: 'medium',
            impact: 'high',
            priority: 80,
            implementation: {
              automated: false,
              steps: [
                'Configure dynamic schema selection in ORM',
                'Set up tenant-aware connection pooling',
                'Implement schema migration system'
              ],
              estimatedTime: 120,
              dependencies: ['orm-configuration', 'connection-pooling']
            }
          });
        }
      }

      // Validate row-level security strategy
      if (tenancyStrategy.strategy === 'row-level-security') {
        if (databaseService.provider !== 'postgresql') {
          issues.push({
            id: crypto.randomUUID(),
            type: 'conflict',
            severity: 'critical',
            message: 'Row-level security is primarily supported by PostgreSQL',
            sourceService: databaseService,
            resolution: {
              possible: true,
              automatic: false,
              steps: ['Switch to PostgreSQL for row-level security support'],
              alternatives: [
                { type: 'database', provider: 'postgresql', tags: ['row-level-security'] }
              ],
              cost: 'high'
            }
          });
        }
      }
    }

    // Check auth service supports multi-tenancy
    const authService = services.find(s => s.type === 'auth');
    if (authService && !authService.tags.includes('multi-tenant')) {
      recommendations.push({
        type: 'configure',
        service: authService,
        reason: 'Configure authentication for multi-tenant support',
        benefits: [
          'Proper tenant context in authentication',
          'Tenant-aware session management',
          'Secure tenant isolation'
        ],
        effort: 'medium',
        impact: 'high',
        priority: 85
      });
    }

    // Check RBAC service compatibility
    const rbacService = services.find(s => s.type === 'rbac');
    if (rbacService) {
      recommendations.push({
        type: 'configure',
        service: rbacService,
        reason: 'Configure RBAC for tenant-aware permissions',
        benefits: [
          'Tenant-specific role management',
          'Cross-tenant access prevention',
          'Scalable permission system'
        ],
        effort: 'high',
        impact: 'high',
        priority: 90
      });
    }

    return {
      compatible: issues.filter(i => i.severity === 'critical').length === 0,
      issues,
      recommendations
    };
  }

  /**
   * Check scaling compatibility for database services
   */
  async checkScalingCompatibility(
    services: ServiceIdentifier[],
    scalingRequirements: DatabaseCompatibilityContext['scaling']
  ): Promise<CompatibilityCheckResult> {
    const issues: CompatibilityIssue[] = [];
    const recommendations: ServiceRecommendation[] = [];

    const databaseService = services.find(s => s.type === 'database');
    const cacheService = services.find(s => s.type === 'cache');

    // Check read replicas support
    if (scalingRequirements.readReplicas && databaseService) {
      if (databaseService.provider === 'sqlite') {
        issues.push({
          id: crypto.randomUUID(),
          type: 'conflict',
          severity: 'critical',
          message: 'SQLite does not support read replicas',
          sourceService: databaseService,
          resolution: {
            possible: true,
            automatic: false,
            steps: ['Use PostgreSQL or MySQL for read replica support'],
            alternatives: [
              { type: 'database', provider: 'postgresql', tags: ['read-replicas'] },
              { type: 'database', provider: 'mysql', tags: ['read-replicas'] }
            ],
            cost: 'high'
          }
        });
      }
    }

    // Check sharding support
    if (scalingRequirements.sharding && databaseService) {
      if (['sqlite', 'mysql'].includes(databaseService.provider)) {
        recommendations.push({
          type: 'replace',
          service: { type: 'database', provider: 'postgresql', tags: ['sharding'] },
          reason: 'PostgreSQL provides better sharding support',
          benefits: [
            'Native partitioning support',
            'Better shard management',
            'Transparent sharding options'
          ],
          effort: 'high',
          impact: 'high',
          priority: 70
        });
      }
    }

    // Check caching requirements
    if (scalingRequirements.caching && !cacheService) {
      recommendations.push({
        type: 'add',
        service: { type: 'cache', provider: 'redis', tags: ['scaling'] },
        reason: 'Add Redis for improved scaling and performance',
        benefits: [
          'Reduced database load',
          'Faster response times',
          'Session and data caching'
        ],
        effort: 'medium',
        impact: 'high',
        priority: 85,
        implementation: {
          automated: true,
          steps: [
            'Add Redis service configuration',
            'Configure caching layer',
            'Update application code for cache usage'
          ],
          estimatedTime: 60,
          dependencies: ['redis-client']
        }
      });
    }

    // Check connection pooling
    if (scalingRequirements.connectionPooling && databaseService) {
      recommendations.push({
        type: 'configure',
        service: databaseService,
        reason: 'Configure connection pooling for better scaling',
        benefits: [
          'Efficient connection management',
          'Better resource utilization',
          'Improved performance under load'
        ],
        effort: 'low',
        impact: 'medium',
        priority: 75
      });
    }

    return {
      requestId: crypto.randomUUID(),
      compatible: issues.filter(i => i.severity === 'critical').length === 0,
      overallScore: issues.length === 0 ? 90 : 60,
      issues,
      criticalIssues: issues.filter(i => i.severity === 'critical'),
      warnings: issues.filter(i => i.severity === 'warning'),
      missingDependencies: [],
      missingRequirements: [],
      recommendations,
      alternatives: [],
      checkedAt: new Date(),
      rulesApplied: issues.length + recommendations.length,
      confidence: 0.9
    };
  }

  /**
   * Validate SaaS service bundle compatibility
   */
  async validateSaaSBundle(
    bundleServices: ServiceIdentifier[],
    dbContext: DatabaseCompatibilityContext
  ): Promise<CompatibilityCheckResult> {
    // Essential SaaS services validation
    const essentialServices = [
      'database',
      'auth',
      'payment',
      'notification',
      'monitoring'
    ];

    const missingServices = essentialServices.filter(serviceType => 
      !bundleServices.some(s => s.type === serviceType)
    );

    const recommendations: ServiceRecommendation[] = [];
    
    for (const missingType of missingServices) {
      let recommendedProvider = '';
      let benefits: string[] = [];

      switch (missingType) {
        case 'database':
          recommendedProvider = 'postgresql';
          benefits = ['ACID compliance', 'Multi-tenant support', 'JSON capabilities'];
          break;
        case 'auth':
          recommendedProvider = 'better-auth';
          benefits = ['Type-safe authentication', 'OAuth support', 'Session management'];
          break;
        case 'payment':
          recommendedProvider = 'stripe';
          benefits = ['Secure payment processing', 'Subscription management', 'Global support'];
          break;
        case 'notification':
          recommendedProvider = 'resend';
          benefits = ['Reliable email delivery', 'Template management', 'Analytics'];
          break;
        case 'monitoring':
          recommendedProvider = 'sentry';
          benefits = ['Error tracking', 'Performance monitoring', 'Real-time alerts'];
          break;
      }

      recommendations.push({
        type: 'add',
        service: { type: missingType, provider: recommendedProvider, tags: ['saas', 'essential'] },
        reason: `${missingType} service is essential for SaaS applications`,
        benefits,
        effort: 'medium',
        impact: 'high',
        priority: 95
      });
    }

    const result = await this.checkDatabaseCompatibility(bundleServices, dbContext);
    result.recommendations.push(...recommendations);
    
    return result;
  }

  /**
   * Check service pair compatibility
   */
  private async checkServicePair(
    serviceA: ServiceIdentifier,
    serviceB: ServiceIdentifier,
    rules: CompatibilityRule[]
  ): Promise<{
    compatible: boolean;
    issues: CompatibilityIssue[];
    warnings: CompatibilityIssue[];
    recommendations: ServiceRecommendation[];
    rulesApplied: number;
  }> {
    const issues: CompatibilityIssue[] = [];
    const warnings: CompatibilityIssue[] = [];
    const recommendations: ServiceRecommendation[] = [];
    let rulesApplied = 0;

    // Find applicable rules
    const applicableRules = rules.filter(rule => 
      this.isRuleApplicable(rule, serviceA, serviceB)
    );

    for (const rule of applicableRules) {
      rulesApplied++;

      if (rule.type === 'conflict') {
        issues.push({
          id: crypto.randomUUID(),
          type: rule.type,
          severity: rule.severity,
          message: rule.description,
          sourceService: serviceA,
          targetService: serviceB,
          ruleId: rule.id,
          ruleName: rule.name,
          resolution: rule.resolution ? {
            possible: true,
            automatic: false,
            steps: [rule.resolution],
            alternatives: [],
            cost: 'medium'
          } : undefined
        });
      } else if (rule.type === 'recommend') {
        recommendations.push({
          type: 'configure',
          service: serviceA,
          reason: rule.reason,
          benefits: [rule.description],
          effort: 'medium',
          impact: 'medium',
          priority: rule.priority
        });
      } else if (rule.severity === 'warning') {
        warnings.push({
          id: crypto.randomUUID(),
          type: rule.type,
          severity: rule.severity,
          message: rule.description,
          sourceService: serviceA,
          targetService: serviceB,
          ruleId: rule.id,
          ruleName: rule.name
        });
      }
    }

    return {
      compatible: issues.filter(i => i.severity === 'critical').length === 0,
      issues,
      warnings,
      recommendations,
      rulesApplied
    };
  }

  /**
   * Check if a rule is applicable to a service pair
   */
  private isRuleApplicable(
    rule: CompatibilityRule,
    serviceA: ServiceIdentifier,
    serviceB: ServiceIdentifier
  ): boolean {
    // Check source matches
    const sourceMatch = this.serviceMatches(rule.source, serviceA) || 
                       this.serviceMatches(rule.source, serviceB);
    
    // Check target matches (if specified)
    let targetMatch = true;
    if (rule.target) {
      targetMatch = this.serviceMatches(rule.target, serviceA) || 
                   this.serviceMatches(rule.target, serviceB);
    }

    return sourceMatch && targetMatch && rule.active;
  }

  /**
   * Check if a service matches a service identifier pattern
   */
  private serviceMatches(pattern: ServiceIdentifier, service: ServiceIdentifier): boolean {
    const typeMatch = pattern.type === service.type;
    const providerMatch = pattern.provider === service.provider;
    
    // Check tag overlap
    const tagMatch = pattern.tags.length === 0 || 
                    pattern.tags.some(tag => service.tags.includes(tag));

    return typeMatch && providerMatch && tagMatch;
  }

  /**
   * Check service dependencies
   */
  private async checkDependencies(services: ServiceIdentifier[]): Promise<{
    missing: ServiceIdentifier[];
  }> {
    const missing: ServiceIdentifier[] = [];

    // Database dependency checks
    const hasDatabase = services.some(s => s.type === 'database');
    const hasAuth = services.some(s => s.type === 'auth');

    if (hasAuth && !hasDatabase) {
      missing.push({
        type: 'database',
        provider: 'postgresql',
        tags: ['auth-required']
      });
    }

    return { missing };
  }

  /**
   * Perform database-specific compatibility checks
   */
  private async performDatabaseSpecificChecks(
    services: ServiceIdentifier[],
    dbContext: DatabaseCompatibilityContext
  ): Promise<{
    issues: CompatibilityIssue[];
    recommendations: ServiceRecommendation[];
  }> {
    const issues: CompatibilityIssue[] = [];
    const recommendations: ServiceRecommendation[] = [];

    // Check compliance requirements
    if (dbContext.compliance.gdprCompliance) {
      const auditService = services.find(s => s.type === 'monitoring' || s.tags.includes('audit'));
      if (!auditService) {
        recommendations.push({
          type: 'add',
          service: { type: 'monitoring', provider: 'sentry', tags: ['audit', 'gdpr'] },
          reason: 'GDPR compliance requires audit logging capabilities',
          benefits: ['GDPR compliance', 'Audit trail', 'Data protection monitoring'],
          effort: 'medium',
          impact: 'high',
          priority: 95
        });
      }
    }

    // Check encryption requirements
    if (dbContext.compliance.encryption) {
      const databaseService = services.find(s => s.type === 'database');
      if (databaseService && !databaseService.tags.includes('encryption')) {
        recommendations.push({
          type: 'configure',
          service: databaseService,
          reason: 'Enable database encryption for compliance',
          benefits: ['Data protection', 'Compliance', 'Security'],
          effort: 'low',
          impact: 'high',
          priority: 90
        });
      }
    }

    return { issues, recommendations };
  }

  /**
   * Calculate overall compatibility score
   */
  private calculateCompatibilityScore(result: CompatibilityCheckResult): number {
    let score = 100;

    // Deduct points for issues
    for (const issue of result.issues) {
      switch (issue.severity) {
        case 'critical':
          score -= 25;
          break;
        case 'error':
          score -= 15;
          break;
        case 'warning':
          score -= 5;
          break;
      }
    }

    // Add points for positive recommendations
    score += Math.min(result.recommendations.length * 2, 10);

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate confidence level
   */
  private calculateConfidence(result: CompatibilityCheckResult): number {
    let confidence = 1.0;

    // Reduce confidence if many unknown pairs
    if (result.summary?.missingPairs) {
      const totalPairs = result.summary.compatiblePairs + 
                        result.summary.conflictingPairs + 
                        result.summary.missingPairs;
      const unknownRatio = result.summary.missingPairs / totalPairs;
      confidence -= unknownRatio * 0.3;
    }

    // Reduce confidence if few rules applied
    if (result.rulesApplied < result.summary!.totalServices) {
      confidence -= 0.1;
    }

    return Math.max(0.5, Math.min(1.0, confidence));
  }
}