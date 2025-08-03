/**
 * Compatibility Matrix Interfaces
 * 
 * Defines interfaces for the service compatibility matrix system,
 * with specialized database compatibility checking capabilities.
 * 
 * @author Database Expert Agent
 * @since 2025-08-03
 */

import type { 
  CompatibilityCheckRequest,
  CompatibilityCheckResult,
  CompatibilityRule,
  ServiceCompatibilityMatrix,
  ServiceIdentifier,
  CompatibilityIssue,
  ServiceRecommendation
} from '../../schemas/service-compatibility.schema';

/**
 * Database-specific compatibility context
 */
export interface DatabaseCompatibilityContext {
  /** Database type and provider */
  database: {
    type: 'postgresql' | 'mysql' | 'sqlite' | 'mongodb' | 'redis' | 'other';
    provider: string;
    version?: string;
  };

  /** Multi-tenancy configuration */
  multiTenancy: {
    strategy: 'schema-per-tenant' | 'row-level-security' | 'database-per-tenant' | 'shared-database';
    isolation: 'strict' | 'relaxed' | 'none';
    maxTenants?: number;
  };

  /** Scaling requirements */
  scaling: {
    readReplicas: boolean;
    sharding: boolean;
    connectionPooling: boolean;
    caching: boolean;
  };

  /** Compliance requirements */
  compliance: {
    dataResidency: boolean;
    encryption: boolean;
    auditLogging: boolean;
    gdprCompliance: boolean;
  };

  /** Performance requirements */
  performance: {
    expectedLoad: 'low' | 'medium' | 'high' | 'enterprise';
    latencyRequirements: 'relaxed' | 'standard' | 'strict' | 'realtime';
    consistencyLevel: 'eventual' | 'session' | 'strong';
  };
}

/**
 * Extended compatibility checker interface with database-specific methods
 */
export interface ICompatibilityChecker {
  /**
   * Check basic service compatibility
   */
  checkCompatibility(request: CompatibilityCheckRequest): Promise<CompatibilityCheckResult>;

  /**
   * Check database-specific compatibility including multi-tenancy support
   */
  checkDatabaseCompatibility(
    services: ServiceIdentifier[],
    dbContext: DatabaseCompatibilityContext
  ): Promise<CompatibilityCheckResult>;

  /**
   * Validate multi-tenant architecture compatibility
   */
  validateMultiTenantArchitecture(
    services: ServiceIdentifier[],
    tenancyStrategy: DatabaseCompatibilityContext['multiTenancy']
  ): Promise<{
    compatible: boolean;
    issues: CompatibilityIssue[];
    recommendations: ServiceRecommendation[];
  }>;

  /**
   * Check scaling compatibility for database services
   */
  checkScalingCompatibility(
    services: ServiceIdentifier[],
    scalingRequirements: DatabaseCompatibilityContext['scaling']
  ): Promise<CompatibilityCheckResult>;

  /**
   * Validate SaaS service bundle compatibility
   */
  validateSaaSBundle(
    bundleServices: ServiceIdentifier[],
    dbContext: DatabaseCompatibilityContext
  ): Promise<CompatibilityCheckResult>;
}

/**
 * Database migration strategy interface
 */
export interface DatabaseMigrationStrategy {
  /** Migration type */
  type: 'zero-downtime' | 'maintenance-window' | 'blue-green' | 'rolling';

  /** Estimated downtime */
  estimatedDowntime: number; // in minutes

  /** Migration steps */
  steps: {
    id: string;
    name: string;
    description: string;
    estimatedTime: number; // in minutes
    reversible: boolean;
    riskLevel: 'low' | 'medium' | 'high';
  }[];

  /** Prerequisites */
  prerequisites: string[];

  /** Validation steps */
  validation: {
    preChecks: string[];
    postChecks: string[];
    rollbackChecks: string[];
  };
}

/**
 * Schema design compatibility interface
 */
export interface SchemaCompatibilityCheck {
  /** Schema design patterns */
  patterns: {
    multiTenant: boolean;
    eventSourcing: boolean;
    cqrs: boolean;
    microservices: boolean;
  };

  /** Data isolation validation */
  dataIsolation: {
    tenantSeparation: 'complete' | 'logical' | 'none';
    crossTenantQueries: boolean;
    sharedTables: string[];
  };

  /** Performance implications */
  performance: {
    indexingStrategy: string;
    partitioningRequired: boolean;
    estimatedQueryPerformance: 'excellent' | 'good' | 'acceptable' | 'poor';
  };
}

/**
 * Compatibility matrix manager interface
 */
export interface ICompatibilityMatrixManager {
  /**
   * Load compatibility matrix
   */
  loadMatrix(): Promise<ServiceCompatibilityMatrix>;

  /**
   * Update compatibility matrix with new rules
   */
  updateMatrix(rules: CompatibilityRule[]): Promise<void>;

  /**
   * Get compatibility rules for specific service types
   */
  getRulesForServices(
    sourceType: string,
    targetType?: string
  ): Promise<CompatibilityRule[]>;

  /**
   * Add database-specific compatibility rule
   */
  addDatabaseRule(rule: CompatibilityRule): Promise<void>;

  /**
   * Validate matrix integrity
   */
  validateMatrix(): Promise<{
    valid: boolean;
    issues: string[];
    warnings: string[];
  }>;
}

/**
 * Service dependency resolver interface
 */
export interface IServiceDependencyResolver {
  /**
   * Resolve service dependencies with database considerations
   */
  resolveDependencies(
    services: ServiceIdentifier[],
    dbContext: DatabaseCompatibilityContext
  ): Promise<{
    resolved: ServiceIdentifier[];
    missing: ServiceIdentifier[];
    conflicts: CompatibilityIssue[];
  }>;

  /**
   * Get optimal service configuration for SaaS requirements
   */
  getOptimalSaaSConfiguration(
    requirements: {
      expectedUsers: number;
      dataCompliance: string[];
      scalingRequirements: DatabaseCompatibilityContext['scaling'];
    }
  ): Promise<{
    recommendedServices: ServiceIdentifier[];
    architecture: string;
    estimatedCost: string;
  }>;
}

/**
 * Compatibility test result interface
 */
export interface CompatibilityTestResult {
  /** Test execution metadata */
  testId: string;
  executedAt: Date;
  duration: number; // in milliseconds

  /** Test configuration */
  configuration: {
    services: ServiceIdentifier[];
    environment: string;
    databaseContext: DatabaseCompatibilityContext;
  };

  /** Results */
  results: {
    overall: 'pass' | 'fail' | 'warning';
    compatibility: CompatibilityCheckResult;
    performance: {
      setupTime: number;
      queryPerformance: number;
      memoryUsage: number;
    };
    issues: CompatibilityIssue[];
  };

  /** Recommendations */
  recommendations: {
    immediate: ServiceRecommendation[];
    longTerm: ServiceRecommendation[];
    performance: ServiceRecommendation[];
  };
}