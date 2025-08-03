/**
 * Service Registry Core Exports
 * 
 * Centralized exports for all service registry core implementations.
 * Provides a clean interface for consuming the registry system.
 * 
 * @author Backend Expert Agent
 * @since 2025-01-03
 */

export { EnhancedServiceRegistry } from './enhanced-service-registry';

// Re-export the original registry for backward compatibility
export { CoreServiceRegistry } from '../../injection/core/service-registry';

// Export type definitions
export type {
  IServiceRegistry,
  ServiceRegistryQueryOptions,
  ServiceRegistryStatistics,
  TemplateRegistrationOptions,
  TemplateUpdateOptions
} from '../interfaces/service-registry.interface';

export type {
  IServiceResolver,
  DependencyResolutionOptions,
  ServiceSuggestionOptions
} from '../interfaces/service-resolver.interface';

export type {
  IServiceValidator,
  ValidationResult,
  ValidationIssue,
  ValidationOptions
} from '../interfaces/service-validator.interface';

export type {
  IServiceMetadataManager,
  MetadataQueryOptions,
  MetadataAggregationOptions
} from '../interfaces/service-metadata-manager.interface';