/**
 * Service Compatibility Matrix System
 * 
 * Central export point for compatibility checking system.
 * Provides comprehensive service compatibility validation with special focus
 * on database-related compatibility rules and multi-tenant architectures.
 * 
 * @author Database Expert Agent
 * @since 2025-08-03
 */

// Core compatibility system
export * from './core/compatibility-matrix';
export * from './core/compatibility-checker';
export * from './core/database-compatibility-engine';
export * from './core/database-bundle-resolver';

// Compatibility rules
export * from './rules/database-rules';
export * from './rules/saas-compatibility-rules';
export * from './rules/multi-tenant-rules';

// Interfaces and types
export * from './interfaces/compatibility-matrix.interface';

// Utility functions
export * from './utils/compatibility-utils';

// Pre-computed compatibility matrices
export * from './matrices/database-compatibility-matrix';
export * from './matrices/saas-service-matrix';

// Re-export schemas for external use
export * from '../schemas/service-compatibility.schema';

// Main compatibility system exports for easy access
export { CompatibilityMatrixManager } from './core/compatibility-matrix';
export { CompatibilityChecker } from './core/compatibility-checker';
export { DatabaseCompatibilityEngine } from './core/database-compatibility-engine';
export { DatabaseBundleResolver } from './core/database-bundle-resolver';

export {
  ServiceIdentifierUtils,
  CompatibilityResultUtils,
  RuleEvaluationUtils,
  DatabaseContextUtils
} from './utils/compatibility-utils';

export {
  DATABASE_COMPATIBILITY_MATRIX,
  getDatabaseCompatibilityEntry,
  getRecommendedDatabaseForSaaS,
  validateDatabaseMultiTenancy
} from './matrices/database-compatibility-matrix';

export {
  SAAS_SERVICE_MATRIX,
  getSaaSBundleRecommendation,
  validateSaaSServiceCombination,
  calculateSaaSReadinessScore
} from './matrices/saas-service-matrix';