/**
 * Service Compatibility Matrix Core Implementation
 * 
 * Central compatibility matrix that manages service compatibility rules,
 * with specialized focus on database services and multi-tenant architectures.
 * 
 * @author Database Expert Agent
 * @since 2025-08-03
 */

import { z } from 'zod';
import type {
  ServiceCompatibilityMatrix,
  CompatibilityRule,
  CompatibilityMatrixEntry,
  ServiceIdentifier,
  CompatibilityCheckRequest,
  CompatibilityCheckResult
} from '../../schemas/service-compatibility.schema';
import type {
  ICompatibilityMatrixManager,
  DatabaseCompatibilityContext
} from '../interfaces/compatibility-matrix.interface';

/**
 * Compatibility Matrix Manager Implementation
 */
export class CompatibilityMatrixManager implements ICompatibilityMatrixManager {
  private matrix: ServiceCompatibilityMatrix | null = null;
  private databaseRules: Map<string, CompatibilityRule[]> = new Map();
  private multiTenantRules: Map<string, CompatibilityRule[]> = new Map();

  constructor() {
    this.initializeMatrix();
  }

  /**
   * Initialize the compatibility matrix with default rules
   */
  private async initializeMatrix(): Promise<void> {
    this.matrix = {
      version: '1.0.0',
      description: 'Xaheen Service Compatibility Matrix with Database Focus',
      entries: [],
      rules: [],
      generatedAt: new Date(),
      statistics: {
        compatiblePairs: 0,
        incompatiblePairs: 0,
        conditionalPairs: 0,
        unknownPairs: 0,
        totalRules: 0,
        activeRules: 0
      }
    };

    // Load default database compatibility rules
    await this.loadDatabaseRules();
    await this.loadMultiTenantRules();
  }

  /**
   * Load default database compatibility rules
   */
  private async loadDatabaseRules(): Promise<void> {
    const databaseRules: CompatibilityRule[] = [
      // PostgreSQL compatibility rules
      {
        id: crypto.randomUUID(),
        name: 'PostgreSQL Multi-Tenant Compatibility',
        description: 'PostgreSQL works excellently with row-level security and schema-per-tenant patterns',
        type: 'recommend',
        severity: 'info',
        source: {
          type: 'database',
          provider: 'postgresql',
          tags: ['multi-tenant']
        },
        target: {
          type: 'auth',
          provider: 'better-auth',
          tags: ['enterprise']
        },
        reason: 'PostgreSQL RLS provides excellent tenant isolation with Better Auth',
        resolution: 'Use PostgreSQL row-level security for tenant data isolation',
        category: 'multi-tenancy',
        version: '1.0.0',
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['database', 'multi-tenant', 'security'],
        priority: 90,
        weight: 1.0,
        active: true,
        deprecated: false,
        conditions: [
          {
            type: 'configuration',
            key: 'multiTenant',
            operator: 'equals',
            value: true,
            description: 'Multi-tenancy is enabled'
          }
        ],
        conditionLogic: 'AND'
      },
      {
        id: crypto.randomUUID(),
        name: 'Database ORM Compatibility',
        description: 'Prisma and Drizzle ORM compatibility with PostgreSQL',
        type: 'enhance',
        severity: 'info',
        source: {
          type: 'database',
          provider: 'postgresql',
          tags: ['orm']
        },
        reason: 'Both ORMs provide excellent PostgreSQL support with type safety',
        category: 'orm-integration',
        version: '1.0.0',
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['database', 'orm', 'typescript'],
        priority: 85,
        weight: 0.9,
        active: true,
        deprecated: false,
        conditions: [],
        conditionLogic: 'AND'
      },
      // Redis caching compatibility
      {
        id: crypto.randomUUID(),
        name: 'Redis Session Store Compatibility',
        description: 'Redis works perfectly as a session store for Better Auth',
        type: 'recommend',
        severity: 'info',
        source: {
          type: 'cache',
          provider: 'redis',
          tags: ['session-store']
        },
        target: {
          type: 'auth',
          provider: 'better-auth',
          tags: ['sessions']
        },
        reason: 'Redis provides fast, scalable session storage for authentication',
        resolution: 'Configure Redis as the session store for Better Auth',
        category: 'performance',
        version: '1.0.0',
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['cache', 'auth', 'performance'],
        priority: 80,
        weight: 0.8,
        active: true,
        deprecated: false,
        conditions: [
          {
            type: 'configuration',
            key: 'enableSessions',
            operator: 'equals',
            value: true,
            description: 'Session management is enabled'
          }
        ],
        conditionLogic: 'AND'
      },
      // Database scaling conflicts
      {
        id: crypto.randomUUID(),
        name: 'SQLite Scaling Limitation',
        description: 'SQLite is not suitable for high-scale multi-tenant applications',
        type: 'conflict',
        severity: 'warning',
        source: {
          type: 'database',
          provider: 'sqlite',
          tags: ['single-file']
        },
        reason: 'SQLite does not support concurrent writes and horizontal scaling required for SaaS',
        resolution: 'Use PostgreSQL or MySQL for production SaaS applications',
        category: 'scaling',
        version: '1.0.0',
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['database', 'scaling', 'limitation'],
        priority: 95,
        weight: 1.0,
        active: true,
        deprecated: false,
        conditions: [
          {
            type: 'configuration',
            key: 'environment',
            operator: 'equals',
            value: 'production',
            description: 'Production environment'
          },
          {
            type: 'configuration',
            key: 'expectedLoad',
            operator: 'contains',
            value: ['high', 'enterprise'],
            description: 'High load expected'
          }
        ],
        conditionLogic: 'OR'
      }
    ];

    this.databaseRules.set('postgresql', databaseRules.filter(r => 
      r.source.provider === 'postgresql' || r.target?.provider === 'postgresql'
    ));
    this.databaseRules.set('redis', databaseRules.filter(r => 
      r.source.provider === 'redis' || r.target?.provider === 'redis'
    ));
    this.databaseRules.set('sqlite', databaseRules.filter(r => 
      r.source.provider === 'sqlite' || r.target?.provider === 'sqlite'
    ));

    if (this.matrix) {
      this.matrix.rules.push(...databaseRules);
      this.updateStatistics();
    }
  }

  /**
   * Load multi-tenant specific compatibility rules
   */
  private async loadMultiTenantRules(): Promise<void> {
    const multiTenantRules: CompatibilityRule[] = [
      {
        id: crypto.randomUUID(),
        name: 'Schema-per-Tenant Strategy Compatibility',
        description: 'PostgreSQL schema-per-tenant strategy with RBAC systems',
        type: 'require',
        severity: 'info',
        source: {
          type: 'database',
          provider: 'postgresql',
          tags: ['schema-per-tenant']
        },
        target: {
          type: 'rbac',
          provider: 'casbin',
          tags: ['tenant-aware']
        },
        reason: 'Schema-per-tenant requires tenant-aware RBAC for proper access control',
        resolution: 'Configure Casbin with tenant-aware policies',
        category: 'multi-tenancy',
        version: '1.0.0',
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['multi-tenant', 'rbac', 'security'],
        priority: 90,
        weight: 1.0,
        active: true,
        deprecated: false,
        conditions: [
          {
            type: 'configuration',
            key: 'tenancyStrategy',
            operator: 'equals',
            value: 'schema-per-tenant',
            description: 'Using schema-per-tenant strategy'
          }
        ],
        conditionLogic: 'AND'
      },
      {
        id: crypto.randomUUID(),
        name: 'Row-Level Security Best Practice',
        description: 'RLS with connection pooling requires careful configuration',
        type: 'recommend',
        severity: 'warning',
        source: {
          type: 'database',
          provider: 'postgresql',
          tags: ['row-level-security']
        },
        reason: 'RLS policies need to work correctly with connection pooling',
        resolution: 'Use SET ROLE or application-level tenant context with pooling',
        category: 'performance',
        version: '1.0.0',
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['multi-tenant', 'performance', 'pooling'],
        priority: 85,
        weight: 0.9,
        active: true,
        deprecated: false,
        conditions: [
          {
            type: 'configuration',
            key: 'tenancyStrategy',
            operator: 'equals',
            value: 'row-level-security',
            description: 'Using row-level security'
          },
          {
            type: 'configuration',
            key: 'connectionPooling',
            operator: 'equals',
            value: true,
            description: 'Connection pooling is enabled'
          }
        ],
        conditionLogic: 'AND'
      }
    ];

    this.multiTenantRules.set('schema-per-tenant', multiTenantRules.filter(r => 
      r.tags.includes('schema-per-tenant')
    ));
    this.multiTenantRules.set('row-level-security', multiTenantRules.filter(r => 
      r.tags.includes('row-level-security')
    ));

    if (this.matrix) {
      this.matrix.rules.push(...multiTenantRules);
      this.updateStatistics();
    }
  }

  /**
   * Load compatibility matrix from storage
   */
  async loadMatrix(): Promise<ServiceCompatibilityMatrix> {
    if (!this.matrix) {
      await this.initializeMatrix();
    }
    return this.matrix!;
  }

  /**
   * Update compatibility matrix with new rules
   */
  async updateMatrix(rules: CompatibilityRule[]): Promise<void> {
    if (!this.matrix) {
      await this.initializeMatrix();
    }

    // Validate rules before adding
    for (const rule of rules) {
      try {
        // Validation would happen here
        this.matrix!.rules.push(rule);
      } catch (error) {
        throw new Error(`Invalid rule ${rule.name}: ${error}`);
      }
    }

    this.updateStatistics();
  }

  /**
   * Get compatibility rules for specific service types
   */
  async getRulesForServices(
    sourceType: string,
    targetType?: string
  ): Promise<CompatibilityRule[]> {
    if (!this.matrix) {
      await this.initializeMatrix();
    }

    return this.matrix!.rules.filter(rule => {
      const sourceMatch = rule.source.type === sourceType;
      const targetMatch = !targetType || 
        (rule.target && rule.target.type === targetType);
      
      return sourceMatch && targetMatch && rule.active;
    });
  }

  /**
   * Add database-specific compatibility rule
   */
  async addDatabaseRule(rule: CompatibilityRule): Promise<void> {
    if (!this.matrix) {
      await this.initializeMatrix();
    }

    // Validate database rule
    if (!['database', 'cache', 'auth', 'rbac'].includes(rule.source.type)) {
      throw new Error('Database rules must involve database-related services');
    }

    this.matrix!.rules.push(rule);
    
    // Cache in appropriate maps
    if (rule.source.type === 'database') {
      const existing = this.databaseRules.get(rule.source.provider) || [];
      existing.push(rule);
      this.databaseRules.set(rule.source.provider, existing);
    }

    if (rule.tags.includes('multi-tenant')) {
      const strategy = rule.conditions.find(c => c.key === 'tenancyStrategy')?.value as string;
      if (strategy) {
        const existing = this.multiTenantRules.get(strategy) || [];
        existing.push(rule);
        this.multiTenantRules.set(strategy, existing);
      }
    }

    this.updateStatistics();
  }

  /**
   * Validate matrix integrity
   */
  async validateMatrix(): Promise<{
    valid: boolean;
    issues: string[];
    warnings: string[];
  }> {
    if (!this.matrix) {
      return {
        valid: false,
        issues: ['Matrix not initialized'],
        warnings: []
      };
    }

    const issues: string[] = [];
    const warnings: string[] = [];

    // Check for duplicate rules
    const ruleIds = new Set<string>();
    for (const rule of this.matrix.rules) {
      if (ruleIds.has(rule.id)) {
        issues.push(`Duplicate rule ID: ${rule.id}`);
      }
      ruleIds.add(rule.id);
    }

    // Check for circular dependencies
    const circularDeps = this.detectCircularDependencies();
    if (circularDeps.length > 0) {
      warnings.push(`Potential circular dependencies: ${circularDeps.join(', ')}`);
    }

    // Validate database-specific rules
    const dbRuleIssues = this.validateDatabaseRules();
    issues.push(...dbRuleIssues);

    return {
      valid: issues.length === 0,
      issues,
      warnings
    };
  }

  /**
   * Detect circular dependencies in rules
   */
  private detectCircularDependencies(): string[] {
    const dependencies = new Map<string, Set<string>>();
    
    // Build dependency graph
    for (const rule of this.matrix!.rules) {
      if (rule.type === 'require' || rule.type === 'depend') {
        const source = `${rule.source.type}:${rule.source.provider}`;
        const target = rule.target ? `${rule.target.type}:${rule.target.provider}` : '';
        
        if (target) {
          if (!dependencies.has(source)) {
            dependencies.set(source, new Set());
          }
          dependencies.get(source)!.add(target);
        }
      }
    }

    // Simple cycle detection (would need more sophisticated algorithm for complex cases)
    const cycles: string[] = [];
    for (const [source, targets] of dependencies) {
      for (const target of targets) {
        if (dependencies.get(target)?.has(source)) {
          cycles.push(`${source} <-> ${target}`);
        }
      }
    }

    return cycles;
  }

  /**
   * Validate database-specific rules
   */
  private validateDatabaseRules(): string[] {
    const issues: string[] = [];

    // Check that all database services have proper multi-tenant rules
    const databaseServices = new Set<string>();
    for (const rule of this.matrix!.rules) {
      if (rule.source.type === 'database') {
        databaseServices.add(rule.source.provider);
      }
    }

    for (const dbProvider of databaseServices) {
      const hasMultiTenantRule = this.matrix!.rules.some(rule => 
        rule.source.provider === dbProvider && 
        rule.tags.includes('multi-tenant')
      );
      
      if (!hasMultiTenantRule) {
        issues.push(`Database ${dbProvider} lacks multi-tenancy compatibility rules`);
      }
    }

    return issues;
  }

  /**
   * Update matrix statistics
   */
  private updateStatistics(): void {
    if (!this.matrix) return;

    const stats = {
      compatiblePairs: 0,
      incompatiblePairs: 0,
      conditionalPairs: 0,
      unknownPairs: 0,
      totalRules: this.matrix.rules.length,
      activeRules: this.matrix.rules.filter(r => r.active).length
    };

    // Count entries by compatibility status
    for (const entry of this.matrix.entries) {
      switch (entry.compatibility) {
        case 'compatible':
          stats.compatiblePairs++;
          break;
        case 'incompatible':
          stats.incompatiblePairs++;
          break;
        case 'conditional':
          stats.conditionalPairs++;
          break;
        case 'unknown':
          stats.unknownPairs++;
          break;
      }
    }

    this.matrix.statistics = stats;
  }

  /**
   * Get database-specific rules
   */
  getDatabaseRules(provider: string): CompatibilityRule[] {
    return this.databaseRules.get(provider) || [];
  }

  /**
   * Get multi-tenant rules for a specific strategy
   */
  getMultiTenantRules(strategy: string): CompatibilityRule[] {
    return this.multiTenantRules.get(strategy) || [];
  }
}