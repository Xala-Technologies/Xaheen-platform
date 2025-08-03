/**
 * Compatibility Utility Functions
 * 
 * Helper functions for service compatibility checking and validation.
 * 
 * @author Database Expert Agent
 * @since 2025-08-03
 */

import type {
  ServiceIdentifier,
  CompatibilityRule,
  CompatibilityCheckResult,
  CompatibilityIssue,
  ServiceRecommendation
} from '../../schemas/service-compatibility.schema';
import type {
  DatabaseCompatibilityContext
} from '../interfaces/compatibility-matrix.interface';

/**
 * Service identifier utilities
 */
export class ServiceIdentifierUtils {
  /**
   * Create a service identifier
   */
  static create(
    type: string,
    provider: string,
    tags: string[] = [],
    versionConstraint?: { operator: string; version: string }
  ): ServiceIdentifier {
    return {
      type,
      provider,
      tags,
      versionConstraint,
      environment: []
    };
  }

  /**
   * Check if two service identifiers match
   */
  static matches(pattern: ServiceIdentifier, service: ServiceIdentifier): boolean {
    // Exact type and provider match
    if (pattern.provider !== '*' && pattern.provider !== service.provider) {
      return false;
    }
    
    if (pattern.type !== '*' && pattern.type !== service.type) {
      return false;
    }

    // Tag matching - pattern tags must be subset of service tags
    if (pattern.tags.length > 0) {
      const hasMatchingTags = pattern.tags.some(tag => service.tags.includes(tag));
      if (!hasMatchingTags) return false;
    }

    // Environment matching
    if (pattern.environment.length > 0) {
      const hasMatchingEnv = pattern.environment.some(env => service.environment.includes(env));
      if (!hasMatchingEnv) return false;
    }

    return true;
  }

  /**
   * Get service display name
   */
  static getDisplayName(service: ServiceIdentifier): string {
    const provider = service.provider === '*' ? 'Any' : service.provider;
    const type = service.type === '*' ? 'Any' : service.type;
    return `${provider} (${type})`;
  }

  /**
   * Check if service is a database service
   */
  static isDatabaseService(service: ServiceIdentifier): boolean {
    return service.type === 'database' || service.type === 'cache';
  }

  /**
   * Check if service supports multi-tenancy
   */
  static supportsMultiTenancy(service: ServiceIdentifier): boolean {
    return service.tags.includes('multi-tenant') || 
           service.tags.includes('tenant-aware') ||
           service.tags.includes('rls') ||
           service.tags.includes('schema-per-tenant');
  }

  /**
   * Get service compatibility score
   */
  static getCompatibilityScore(
    service: ServiceIdentifier,
    context: DatabaseCompatibilityContext
  ): number {
    let score = 50; // Base score

    // Database-specific scoring
    if (this.isDatabaseService(service)) {
      score += this.getDatabaseScore(service, context);
    }

    // Multi-tenancy scoring
    if (context.multiTenancy.strategy !== 'shared-database') {
      if (this.supportsMultiTenancy(service)) {
        score += 20;
      } else {
        score -= 15;
      }
    }

    // Performance scoring
    if (context.performance.expectedLoad === 'high' || context.performance.expectedLoad === 'enterprise') {
      if (service.tags.includes('high-performance') || service.tags.includes('enterprise')) {
        score += 15;
      }
      if (service.provider === 'sqlite') {
        score -= 30;
      }
    }

    // Compliance scoring
    if (context.compliance.gdprCompliance) {
      if (service.tags.includes('gdpr') || service.tags.includes('compliance')) {
        score += 10;
      }
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Get database-specific score
   */
  private static getDatabaseScore(
    service: ServiceIdentifier,
    context: DatabaseCompatibilityContext
  ): number {
    let score = 0;

    switch (service.provider) {
      case 'postgresql':
        score += 25; // Excellent for most use cases
        if (context.multiTenancy.strategy === 'row-level-security') score += 15;
        if (context.scaling.readReplicas) score += 10;
        if (context.compliance.encryption) score += 10;
        break;

      case 'mysql':
        score += 15; // Good for many use cases
        if (context.multiTenancy.strategy === 'schema-per-tenant') score += 10;
        if (context.scaling.readReplicas) score += 8;
        break;

      case 'mongodb':
        score += 10; // Good for specific use cases
        if (context.scaling.sharding) score += 15;
        if (service.tags.includes('document')) score += 5;
        break;

      case 'redis':
        score += 20; // Excellent for caching
        if (context.scaling.caching) score += 15;
        if (service.tags.includes('session-store')) score += 10;
        break;

      case 'sqlite':
        score -= 10; // Limited for production
        if (context.performance.expectedLoad === 'low') score += 15;
        break;
    }

    return score;
  }
}

/**
 * Compatibility result utilities
 */
export class CompatibilityResultUtils {
  /**
   * Merge multiple compatibility results
   */
  static mergeResults(results: CompatibilityCheckResult[]): CompatibilityCheckResult {
    if (results.length === 0) {
      throw new Error('Cannot merge empty results array');
    }

    if (results.length === 1) {
      return results[0];
    }

    const merged: CompatibilityCheckResult = {
      requestId: crypto.randomUUID(),
      compatible: results.every(r => r.compatible),
      overallScore: Math.round(results.reduce((sum, r) => sum + r.overallScore, 0) / results.length),
      issues: [],
      criticalIssues: [],
      warnings: [],
      missingDependencies: [],
      missingRequirements: [],
      recommendations: [],
      alternatives: [],
      checkedAt: new Date(),
      rulesApplied: 0,
      confidence: Math.min(...results.map(r => r.confidence))
    };

    // Merge all arrays
    for (const result of results) {
      merged.issues.push(...result.issues);
      merged.criticalIssues.push(...result.criticalIssues);
      merged.warnings.push(...result.warnings);
      merged.missingDependencies.push(...result.missingDependencies);
      merged.missingRequirements.push(...result.missingRequirements);
      merged.recommendations.push(...result.recommendations);
      merged.alternatives.push(...result.alternatives);
      merged.rulesApplied += result.rulesApplied;
    }

    // Remove duplicates
    merged.issues = this.deduplicateIssues(merged.issues);
    merged.recommendations = this.deduplicateRecommendations(merged.recommendations);

    // Update summary
    merged.summary = {
      totalServices: Math.max(...results.map(r => r.summary?.totalServices || 0)),
      compatiblePairs: results.reduce((sum, r) => sum + (r.summary?.compatiblePairs || 0), 0),
      conflictingPairs: results.reduce((sum, r) => sum + (r.summary?.conflictingPairs || 0), 0),
      missingPairs: results.reduce((sum, r) => sum + (r.summary?.missingPairs || 0), 0),
      recommendationCount: merged.recommendations.length
    };

    return merged;
  }

  /**
   * Remove duplicate issues
   */
  private static deduplicateIssues(issues: CompatibilityIssue[]): CompatibilityIssue[] {
    const seen = new Set<string>();
    return issues.filter(issue => {
      const key = `${issue.type}-${issue.message}-${issue.sourceService.provider}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * Remove duplicate recommendations
   */
  private static deduplicateRecommendations(recommendations: ServiceRecommendation[]): ServiceRecommendation[] {
    const seen = new Set<string>();
    return recommendations.filter(rec => {
      const key = `${rec.type}-${rec.service.provider}-${rec.reason}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * Filter results by severity
   */
  static filterBySeverity(
    result: CompatibilityCheckResult,
    severity: 'critical' | 'error' | 'warning' | 'info'
  ): CompatibilityIssue[] {
    return result.issues.filter(issue => issue.severity === severity);
  }

  /**
   * Get top recommendations by priority
   */
  static getTopRecommendations(
    result: CompatibilityCheckResult,
    limit: number = 5
  ): ServiceRecommendation[] {
    return result.recommendations
      .sort((a, b) => b.priority - a.priority)
      .slice(0, limit);
  }

  /**
   * Check if result has blocking issues
   */
  static hasBlockingIssues(result: CompatibilityCheckResult): boolean {
    return result.issues.some(issue => 
      issue.severity === 'critical' || 
      (issue.severity === 'error' && issue.type === 'conflict')
    );
  }

  /**
   * Generate compatibility summary
   */
  static generateSummary(result: CompatibilityCheckResult): string {
    const parts: string[] = [];

    if (result.compatible) {
      parts.push(`✅ Compatible (Score: ${result.overallScore}/100)`);
    } else {
      parts.push(`❌ Incompatible (Score: ${result.overallScore}/100)`);
    }

    if (result.criticalIssues.length > 0) {
      parts.push(`${result.criticalIssues.length} critical issue(s)`);
    }

    if (result.warnings.length > 0) {
      parts.push(`${result.warnings.length} warning(s)`);
    }

    if (result.recommendations.length > 0) {
      parts.push(`${result.recommendations.length} recommendation(s)`);
    }

    return parts.join(', ');
  }
}

/**
 * Rule evaluation utilities
 */
export class RuleEvaluationUtils {
  /**
   * Evaluate rule conditions
   */
  static evaluateConditions(
    rule: CompatibilityRule,
    context: Record<string, any>
  ): boolean {
    if (rule.conditions.length === 0) return true;

    const results = rule.conditions.map(condition => 
      this.evaluateCondition(condition, context)
    );

    return rule.conditionLogic === 'OR' 
      ? results.some(result => result)
      : results.every(result => result);
  }

  /**
   * Evaluate single condition
   */
  private static evaluateCondition(
    condition: any,
    context: Record<string, any>
  ): boolean {
    const contextValue = this.getNestedValue(context, condition.key);
    
    if (contextValue === undefined) return false;

    switch (condition.operator) {
      case 'equals':
        return contextValue === condition.value;
      
      case 'not_equals':
        return contextValue !== condition.value;
      
      case 'contains':
        if (Array.isArray(condition.value)) {
          return condition.value.includes(contextValue);
        }
        return String(contextValue).includes(String(condition.value));
      
      case 'not_contains':
        if (Array.isArray(condition.value)) {
          return !condition.value.includes(contextValue);
        }
        return !String(contextValue).includes(String(condition.value));
      
      case 'regex':
        const regex = new RegExp(String(condition.value));
        return regex.test(String(contextValue));
      
      case 'version':
        return this.compareVersions(String(contextValue), String(condition.value));
      
      default:
        return false;
    }
  }

  /**
   * Get nested object value by key path
   */
  private static getNestedValue(obj: Record<string, any>, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Compare version strings
   */
  private static compareVersions(actual: string, expected: string): boolean {
    // Handle numeric comparisons for maxTenants, etc.
    const numericActual = parseInt(actual.replace(/[^\d]/g, ''));
    const numericExpected = parseInt(expected.replace(/[^\d]/g, ''));
    
    if (!isNaN(numericActual) && !isNaN(numericExpected)) {
      if (expected.startsWith('>')) {
        return numericActual > numericExpected;
      }
      if (expected.startsWith('>=')) {
        return numericActual >= numericExpected;
      }
      if (expected.startsWith('<')) {
        return numericActual < numericExpected;
      }
      if (expected.startsWith('<=')) {
        return numericActual <= numericExpected;
      }
      return numericActual === numericExpected;
    }

    // Fallback to string comparison
    return actual === expected;
  }

  /**
   * Calculate rule weight based on context
   */
  static calculateRuleWeight(
    rule: CompatibilityRule,
    context: Record<string, any>
  ): number {
    let weight = rule.weight;

    // Increase weight for critical rules
    if (rule.severity === 'critical') {
      weight *= 1.5;
    }

    // Increase weight for rules that match context closely
    const matchingConditions = rule.conditions.filter(condition =>
      this.evaluateCondition(condition, context)
    );
    
    if (matchingConditions.length > 0) {
      weight *= 1 + (matchingConditions.length * 0.1);
    }

    return Math.min(2.0, weight); // Cap at 2.0
  }
}

/**
 * Database context utilities
 */
export class DatabaseContextUtils {
  /**
   * Create database context for SaaS application
   */
  static createSaaSContext(options: {
    tenancyStrategy?: 'schema-per-tenant' | 'row-level-security' | 'database-per-tenant' | 'shared-database';
    expectedLoad?: 'low' | 'medium' | 'high' | 'enterprise';
    maxTenants?: number;
    gdprCompliance?: boolean;
    dataResidency?: boolean;
  } = {}): DatabaseCompatibilityContext {
    return {
      database: {
        type: 'postgresql',
        provider: 'postgresql'
      },
      multiTenancy: {
        strategy: options.tenancyStrategy || 'row-level-security',
        isolation: 'strict',
        maxTenants: options.maxTenants || 1000
      },
      scaling: {
        readReplicas: (options.expectedLoad === 'high' || options.expectedLoad === 'enterprise'),
        sharding: options.expectedLoad === 'enterprise',
        connectionPooling: true,
        caching: (options.expectedLoad !== 'low')
      },
      compliance: {
        dataResidency: options.dataResidency || false,
        encryption: true,
        auditLogging: true,
        gdprCompliance: options.gdprCompliance || false
      },
      performance: {
        expectedLoad: options.expectedLoad || 'medium',
        latencyRequirements: 'standard',
        consistencyLevel: 'strong'
      }
    };
  }

  /**
   * Create development context
   */
  static createDevelopmentContext(): DatabaseCompatibilityContext {
    return {
      database: {
        type: 'sqlite',
        provider: 'sqlite'
      },
      multiTenancy: {
        strategy: 'shared-database',
        isolation: 'relaxed',
        maxTenants: 10
      },
      scaling: {
        readReplicas: false,
        sharding: false,
        connectionPooling: false,
        caching: false
      },
      compliance: {
        dataResidency: false,
        encryption: false,
        auditLogging: false,
        gdprCompliance: false
      },
      performance: {
        expectedLoad: 'low',
        latencyRequirements: 'relaxed',
        consistencyLevel: 'eventual'
      }
    };
  }

  /**
   * Create enterprise context
   */
  static createEnterpriseContext(): DatabaseCompatibilityContext {
    return {
      database: {
        type: 'postgresql',
        provider: 'postgresql'
      },
      multiTenancy: {
        strategy: 'schema-per-tenant',
        isolation: 'strict',
        maxTenants: 10000
      },
      scaling: {
        readReplicas: true,
        sharding: true,
        connectionPooling: true,
        caching: true
      },
      compliance: {
        dataResidency: true,
        encryption: true,
        auditLogging: true,
        gdprCompliance: true
      },
      performance: {
        expectedLoad: 'enterprise',
        latencyRequirements: 'strict',
        consistencyLevel: 'strong'
      }
    };
  }

  /**
   * Validate context consistency
   */
  static validateContext(context: DatabaseCompatibilityContext): {
    valid: boolean;
    issues: string[];
    warnings: string[];
  } {
    const issues: string[] = [];
    const warnings: string[] = [];

    // Check database and tenancy strategy compatibility
    if (context.database.provider === 'sqlite' && 
        context.multiTenancy.strategy !== 'database-per-tenant' &&
        context.multiTenancy.strategy !== 'shared-database') {
      issues.push('SQLite only supports database-per-tenant or shared-database strategies');
    }

    // Check scaling expectations
    if (context.performance.expectedLoad === 'enterprise' && 
        !context.scaling.readReplicas) {
      warnings.push('Enterprise load typically requires read replicas');
    }

    // Check compliance requirements
    if (context.compliance.gdprCompliance && !context.compliance.auditLogging) {
      warnings.push('GDPR compliance typically requires audit logging');
    }

    // Check tenant count vs strategy
    if (context.multiTenancy.maxTenants && context.multiTenancy.maxTenants > 1000 &&
        context.multiTenancy.strategy === 'schema-per-tenant') {
      warnings.push('Schema-per-tenant may not scale well beyond 1000 tenants');
    }

    return {
      valid: issues.length === 0,
      issues,
      warnings
    };
  }
}