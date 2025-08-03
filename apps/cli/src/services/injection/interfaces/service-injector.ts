/**
 * Service Injector Interfaces
 * Defines the core interfaces for the service injection engine
 */

/**
 * Service types that can be injected
 */
export type ServiceType = 
  | "database"
  | "auth"
  | "payment"
  | "notification"
  | "analytics"
  | "monitoring"
  | "cache"
  | "storage"
  | "api"
  | "messaging"
  | "search"
  | "cdn"
  | "logger";

/**
 * Service injection context
 */
export type InjectionContext = "development" | "staging" | "production" | "test";

/**
 * Service configuration schema
 */
export interface ServiceConfig {
  readonly name: string;
  readonly type: ServiceType;
  readonly provider: string;
  readonly version?: string;
  readonly enabled: boolean;
  readonly config: Record<string, unknown>;
  readonly environment?: readonly InjectionContext[];
  readonly dependencies?: readonly string[];
  readonly conflicts?: readonly string[];
}

/**
 * Service injection metadata
 */
export interface ServiceInjectionMetadata {
  readonly id: string;
  readonly serviceConfig: ServiceConfig;
  readonly injectedAt: Date;
  readonly context: InjectionContext;
  readonly injectionPoint: string;
  readonly files: readonly string[];
  readonly envVars: readonly string[];
  readonly dependencies: readonly string[];
}

/**
 * Service injection result
 */
export interface ServiceInjectionResult {
  readonly success: boolean;
  readonly serviceId: string;
  readonly metadata: ServiceInjectionMetadata;
  readonly filesModified: readonly string[];
  readonly envVarsAdded: readonly string[];
  readonly dependenciesAdded: readonly string[];
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
}

/**
 * Service injection options
 */
export interface ServiceInjectionOptions {
  readonly dryRun?: boolean;
  readonly overwrite?: boolean;
  readonly skipValidation?: boolean;
  readonly backupFiles?: boolean;
  readonly context?: InjectionContext;
  readonly customConfig?: Record<string, unknown>;
}

/**
 * Service dependency resolution
 */
export interface ServiceDependency {
  readonly serviceId: string;
  readonly type: ServiceType;
  readonly provider: string;
  readonly required: boolean;
  readonly reason: string;
  readonly version?: string;
}

/**
 * Service compatibility check result
 */
export interface ServiceCompatibilityResult {
  readonly compatible: boolean;
  readonly conflicts: readonly {
    serviceA: string;
    serviceB: string;
    reason: string;
  }[];
  readonly missingDependencies: readonly ServiceDependency[];
  readonly suggestions: readonly string[];
}

/**
 * Service injection point
 */
export interface ServiceInjectionPoint {
  readonly path: string;
  readonly type: "file" | "directory" | "config";
  readonly strategy: "replace" | "merge" | "append" | "prepend";
  readonly condition?: string; // Handlebars condition
  readonly template?: string;
  readonly priority?: number;
}

/**
 * Service template definition
 */
export interface ServiceTemplate {
  readonly name: string;
  readonly type: ServiceType;
  readonly provider: string;
  readonly version: string;
  readonly description: string;
  readonly injectionPoints: readonly ServiceInjectionPoint[];
  readonly envVariables: readonly {
    name: string;
    description: string;
    required: boolean;
    defaultValue?: string;
    type: "string" | "number" | "boolean" | "url" | "secret";
  }[];
  readonly dependencies: readonly {
    name: string;
    version: string;
    type: "dev" | "peer" | "runtime";
    condition?: string;
  }[];
  readonly postInjectionSteps?: readonly {
    name: string;
    command: string;
    description: string;
    condition?: string;
  }[];
}

/**
 * Service injector core interface
 */
export interface ServiceInjector {
  /**
   * Inject a service into the project
   */
  injectService(
    serviceConfig: ServiceConfig,
    projectPath: string,
    options?: ServiceInjectionOptions
  ): Promise<ServiceInjectionResult>;

  /**
   * Remove a service from the project
   */
  removeService(
    serviceId: string,
    projectPath: string,
    options?: ServiceInjectionOptions
  ): Promise<ServiceInjectionResult>;

  /**
   * Update a service configuration
   */
  updateService(
    serviceId: string,
    newConfig: Partial<ServiceConfig>,
    projectPath: string,
    options?: ServiceInjectionOptions
  ): Promise<ServiceInjectionResult>;

  /**
   * List injected services
   */
  listServices(projectPath: string): Promise<readonly ServiceInjectionMetadata[]>;

  /**
   * Validate service compatibility
   */
  validateCompatibility(
    services: readonly ServiceConfig[],
    projectPath: string
  ): Promise<ServiceCompatibilityResult>;

  /**
   * Get service template
   */
  getServiceTemplate(type: ServiceType, provider: string): Promise<ServiceTemplate | null>;

  /**
   * List available service templates
   */
  listServiceTemplates(type?: ServiceType): Promise<readonly ServiceTemplate[]>;
}

/**
 * Service registry interface
 */
export interface ServiceRegistry {
  /**
   * Register a service template
   */
  registerTemplate(template: ServiceTemplate): Promise<void>;

  /**
   * Get registered template
   */
  getTemplate(type: ServiceType, provider: string): Promise<ServiceTemplate | null>;

  /**
   * List templates by type
   */
  listTemplates(type?: ServiceType): Promise<readonly ServiceTemplate[]>;

  /**
   * Check if template exists
   */
  hasTemplate(type: ServiceType, provider: string): Promise<boolean>;

  /**
   * Validate template
   */
  validateTemplate(template: ServiceTemplate): Promise<readonly string[]>;
}

/**
 * Service resolver interface for dependency management
 */
export interface ServiceResolver {
  /**
   * Resolve service dependencies
   */
  resolveDependencies(
    services: readonly ServiceConfig[],
    projectPath: string
  ): Promise<{
    resolved: readonly ServiceConfig[];
    missing: readonly ServiceDependency[];
    conflicts: readonly string[];
  }>;

  /**
   * Calculate injection order based on dependencies
   */
  calculateInjectionOrder(
    services: readonly ServiceConfig[]
  ): Promise<readonly string[]>;

  /**
   * Suggest additional services
   */
  suggestServices(
    currentServices: readonly ServiceConfig[],
    projectType?: string
  ): Promise<readonly string[]>;
}