/**
 * Service Injection Engine - Main Export File
 * Provides a unified interface for all service injection components
 */

// Core interfaces
export type {
  ServiceType,
  InjectionContext,
  ServiceConfig,
  ServiceInjectionMetadata,
  ServiceInjectionResult,
  ServiceInjectionOptions,
  ServiceDependency,
  ServiceCompatibilityResult,
  ServiceInjectionPoint,
  ServiceTemplate,
  ServiceInjector,
  ServiceRegistry,
  ServiceResolver,
} from "./interfaces/service-injector";

// Core implementations
export { CoreServiceRegistry } from "./core/service-registry";
export { CoreServiceInjector } from "./core/service-injector-core";
export { CoreServiceResolver } from "./core/service-resolver";

// Main service
export { ServiceInjectionService, serviceInjectionService } from "./injection-service";

// Utilities
export { generateId, generateServiceId } from "../utils/id-generator";

// Re-export for convenience
export const createServiceInjectionService = (basePath?: string) => 
  new ServiceInjectionService(basePath);