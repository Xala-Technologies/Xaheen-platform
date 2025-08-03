/**
 * Service Registry Interface Definitions
 * 
 * Enhanced interfaces that integrate with the comprehensive schema system.
 * Provides type-safe interfaces for service registry operations.
 * 
 * @author Backend Expert Agent
 * @since 2025-01-03
 */

export * from './service-registry.interface';
export * from './service-resolver.interface';
export * from './service-validator.interface';
export * from './service-metadata-manager.interface';
export * from './service-bundle-manager.interface';
export * from './service-compatibility-checker.interface';

// Re-export key types from schemas for convenience
export type {
  ServiceType,
  ServiceConfig,
  ServiceTemplate,
  ServiceBundle,
  ServiceMetadata,
  ServiceDependencyGraph,
  CompatibilityCheckResult,
  DependencyResolutionResult
} from '../schemas';