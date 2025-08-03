/**
 * Service Registry Schema System
 * 
 * Comprehensive schema definitions for the Xaheen service registry system.
 * Provides TypeScript interfaces and Zod validation schemas for all service definitions.
 * 
 * @author Backend Expert Agent
 * @since 2025-01-03
 */

export * from './service-definition.schema';
export * from './service-metadata.schema';
export * from './service-bundle.schema';
export * from './service-compatibility.schema';
export * from './service-template.schema';
export * from './service-injection.schema';
export * from './service-environment.schema';
export * from './service-dependency.schema';

// Re-export core types for backward compatibility
export type {
  ServiceType,
  ServiceConfig,
  ServiceTemplate,
  ServiceInjectionPoint,
  ServiceDependency,
  ServiceCompatibilityResult,
  ServiceInjectionResult,
  ServiceInjectionMetadata
} from './service-definition.schema';