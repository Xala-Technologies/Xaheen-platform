/**
 * Service Injection Service - Main Entry Point
 * Provides a unified interface for the Service Injection Engine
 */

import consola from "consola";
import type {
  ServiceConfig,
  ServiceInjectionOptions,
  ServiceInjectionResult,
  ServiceInjectionMetadata,
  ServiceTemplate,
  ServiceType,
  ServiceCompatibilityResult,
  ServiceDependency,
  InjectionContext,
} from "./interfaces/service-injector";
import { CoreServiceRegistry } from "./core/service-registry";
import { CoreServiceInjector } from "./core/service-injector-core";
import { CoreServiceResolver } from "./core/service-resolver";

export class ServiceInjectionService {
  private readonly registry: CoreServiceRegistry;
  private readonly injector: CoreServiceInjector;
  private readonly resolver: CoreServiceResolver;
  private initialized = false;

  constructor(serviceTemplatesPath?: string) {
    this.registry = new CoreServiceRegistry(serviceTemplatesPath);
    this.injector = new CoreServiceInjector(this.registry);
    this.resolver = new CoreServiceResolver(this.registry);
  }

  /**
   * Initialize the service injection system
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    consola.info("Initializing Service Injection Engine...");
    
    try {
      await this.registry.initialize();
      this.initialized = true;
      consola.success("Service Injection Engine initialized successfully");
    } catch (error) {
      consola.error("Failed to initialize Service Injection Engine:", error);
      throw error;
    }
  }

  /**
   * Inject a single service into the project
   */
  async injectService(options: {
    serviceConfig: ServiceConfig;
    projectPath: string;
    injectionOptions?: ServiceInjectionOptions;
  }): Promise<ServiceInjectionResult> {
    await this.ensureInitialized();

    return this.injector.injectService(
      options.serviceConfig,
      options.projectPath,
      options.injectionOptions
    );
  }

  /**
   * Inject multiple services with dependency resolution
   */
  async injectServices(options: {
    serviceConfigs: readonly ServiceConfig[];
    projectPath: string;
    injectionOptions?: ServiceInjectionOptions;
    resolveDependencies?: boolean;
  }): Promise<{
    results: readonly ServiceInjectionResult[];
    totalSuccessful: number;
    totalFailed: number;
    dependencies: readonly ServiceDependency[];
    conflicts: readonly string[];
  }> {
    await this.ensureInitialized();

    let servicesToInject = [...options.serviceConfigs];

    // Resolve dependencies if requested
    if (options.resolveDependencies !== false) {
      consola.info("Resolving service dependencies...");
      const resolution = await this.resolver.resolveDependencies(servicesToInject, options.projectPath);
      
      if (resolution.conflicts.length > 0) {
        consola.warn("Service conflicts detected:", resolution.conflicts);
        if (!options.injectionOptions?.overwrite) {
          return {
            results: [],
            totalSuccessful: 0,
            totalFailed: servicesToInject.length,
            dependencies: [],
            conflicts: resolution.conflicts,
          };
        }
      }

      if (resolution.missing.length > 0) {
        consola.warn("Missing dependencies detected:", resolution.missing.map(d => d.serviceId));
      }

      servicesToInject = [...resolution.resolved];
    }

    // Calculate injection order
    const injectionOrder = await this.resolver.calculateInjectionOrder(servicesToInject);
    consola.info(`Injecting services in order: ${injectionOrder.join(" -> ")}`);

    const results: ServiceInjectionResult[] = [];
    let totalSuccessful = 0;
    let totalFailed = 0;

    // Inject services in dependency order
    for (const serviceName of injectionOrder) {
      const serviceConfig = servicesToInject.find(s => s.name === serviceName);
      if (!serviceConfig) {
        consola.warn(`Service not found in injection list: ${serviceName}`);
        continue;
      }

      try {
        consola.info(`Injecting service: ${serviceName}`);
        const result = await this.injector.injectService(
          serviceConfig,
          options.projectPath,
          options.injectionOptions
        );

        results.push(result);

        if (result.success) {
          totalSuccessful++;
          consola.success(`Service ${serviceName} injected successfully`);
        } else {
          totalFailed++;
          consola.error(`Service ${serviceName} injection failed:`, result.errors);
        }

      } catch (error) {
        totalFailed++;
        const errorMessage = error instanceof Error ? error.message : String(error);
        consola.error(`Service ${serviceName} injection failed:`, error);
        
        results.push({
          success: false,
          serviceId: serviceName,
          metadata: {} as ServiceInjectionMetadata,
          filesModified: [],
          envVarsAdded: [],
          dependenciesAdded: [],
          errors: [errorMessage],
          warnings: [],
        });
      }
    }

    return {
      results,
      totalSuccessful,
      totalFailed,
      dependencies: [], // TODO: Collect all dependencies from results
      conflicts: [],
    };
  }

  /**
   * Remove a service from the project
   */
  async removeService(options: {
    serviceId: string;
    projectPath: string;
    injectionOptions?: ServiceInjectionOptions;
  }): Promise<ServiceInjectionResult> {
    await this.ensureInitialized();

    return this.injector.removeService(
      options.serviceId,
      options.projectPath,
      options.injectionOptions
    );
  }

  /**
   * Update a service configuration
   */
  async updateService(options: {
    serviceId: string;
    newConfig: Partial<ServiceConfig>;
    projectPath: string;
    injectionOptions?: ServiceInjectionOptions;
  }): Promise<ServiceInjectionResult> {
    await this.ensureInitialized();

    return this.injector.updateService(
      options.serviceId,
      options.newConfig,
      options.projectPath,
      options.injectionOptions
    );
  }

  /**
   * List all injected services in a project
   */
  async listServices(projectPath: string): Promise<readonly ServiceInjectionMetadata[]> {
    await this.ensureInitialized();
    return this.injector.listServices(projectPath);
  }

  /**
   * Get available service templates
   */
  async listServiceTemplates(type?: ServiceType): Promise<readonly ServiceTemplate[]> {
    await this.ensureInitialized();
    return this.registry.listTemplates(type);
  }

  /**
   * Get detailed information about a service template
   */
  async getServiceTemplate(type: ServiceType, provider: string): Promise<ServiceTemplate | null> {
    await this.ensureInitialized();
    return this.registry.getTemplate(type, provider);
  }

  /**
   * Validate service compatibility
   */
  async validateCompatibility(options: {
    serviceConfigs: readonly ServiceConfig[];
    projectPath: string;
  }): Promise<ServiceCompatibilityResult> {
    await this.ensureInitialized();

    return this.injector.validateCompatibility(options.serviceConfigs, options.projectPath);
  }

  /**
   * Get service suggestions based on current project
   */
  async getServiceSuggestions(options: {
    projectPath: string;
    projectType?: string;
  }): Promise<readonly string[]> {
    await this.ensureInitialized();

    const currentServices = await this.listServices(options.projectPath);
    const serviceConfigs = currentServices.map(s => s.serviceConfig);

    return this.resolver.suggestServices(serviceConfigs, options.projectType);
  }

  /**
   * Preview service injection (dry run)
   */
  async previewServiceInjection(options: {
    serviceConfigs: readonly ServiceConfig[];
    projectPath: string;
    resolveDependencies?: boolean;
  }): Promise<{
    injectionOrder: readonly string[];
    filesAffected: readonly string[];
    envVarsRequired: readonly string[];
    dependenciesAdded: readonly string[];
    conflicts: readonly string[];
    suggestions: readonly string[];
  }> {
    await this.ensureInitialized();

    let servicesToInject = [...options.serviceConfigs];
    const conflicts: string[] = [];

    // Resolve dependencies if requested
    if (options.resolveDependencies !== false) {
      const resolution = await this.resolver.resolveDependencies(servicesToInject, options.projectPath);
      servicesToInject = [...resolution.resolved];
      conflicts.push(...resolution.conflicts);
    }

    // Calculate injection order
    const injectionOrder = await this.resolver.calculateInjectionOrder(servicesToInject);

    // Collect preview information
    const filesAffected: string[] = [];
    const envVarsRequired: string[] = [];
    const dependenciesAdded: string[] = [];

    for (const serviceName of injectionOrder) {
      const serviceConfig = servicesToInject.find(s => s.name === serviceName);
      if (!serviceConfig) continue;

      const template = await this.registry.getTemplate(serviceConfig.type, serviceConfig.provider);
      if (!template) continue;

      // Collect files that would be affected
      for (const point of template.injectionPoints) {
        filesAffected.push(point.path);
      }

      // Collect environment variables
      for (const envVar of template.envVariables) {
        if (envVar.required) {
          envVarsRequired.push(envVar.name);
        }
      }

      // Collect dependencies
      for (const dep of template.dependencies) {
        dependenciesAdded.push(`${dep.name}@${dep.version}`);
      }
    }

    // Get suggestions
    const suggestions = await this.resolver.suggestServices(servicesToInject, options.projectType);

    return {
      injectionOrder,
      filesAffected: [...new Set(filesAffected)],
      envVarsRequired: [...new Set(envVarsRequired)],
      dependenciesAdded: [...new Set(dependenciesAdded)],
      conflicts,
      suggestions,
    };
  }

  /**
   * Register a custom service template
   */
  async registerServiceTemplate(template: ServiceTemplate): Promise<void> {
    await this.ensureInitialized();
    await this.registry.registerTemplate(template);
  }

  /**
   * Get service injection statistics
   */
  async getStatistics(): Promise<{
    totalTemplates: number;
    templatesByType: Record<ServiceType, number>;
    templatesByProvider: Record<string, number>;
  }> {
    await this.ensureInitialized();
    return this.registry.getStatistics();
  }

  /**
   * Resolve service dependencies without injection
   */
  async resolveDependencies(options: {
    serviceConfigs: readonly ServiceConfig[];
    projectPath: string;
  }): Promise<{
    resolved: readonly ServiceConfig[];
    missing: readonly ServiceDependency[];
    conflicts: readonly string[];
    injectionOrder: readonly string[];
  }> {
    await this.ensureInitialized();

    const resolution = await this.resolver.resolveDependencies(
      options.serviceConfigs,
      options.projectPath
    );

    const injectionOrder = await this.resolver.calculateInjectionOrder(resolution.resolved);

    return {
      ...resolution,
      injectionOrder,
    };
  }

  /**
   * Ensure the service is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }
}

// Export singleton instance for convenience
export const serviceInjectionService = new ServiceInjectionService();