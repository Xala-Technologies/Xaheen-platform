/**
 * Service Resolver Implementation
 * Handles dependency resolution and service ordering for injection
 */

import consola from "consola";
import type {
  ServiceResolver,
  ServiceConfig,
  ServiceDependency,
  ServiceRegistry,
} from "../interfaces/service-injector";

export class CoreServiceResolver implements ServiceResolver {
  constructor(private readonly registry: ServiceRegistry) {}

  /**
   * Resolve service dependencies
   */
  async resolveDependencies(
    services: readonly ServiceConfig[],
    projectPath: string
  ): Promise<{
    resolved: readonly ServiceConfig[];
    missing: readonly ServiceDependency[];
    conflicts: readonly string[];
  }> {
    consola.info(`Resolving dependencies for ${services.length} services...`);

    const resolved: ServiceConfig[] = [...services];
    const missing: ServiceDependency[] = [];
    const conflicts: string[] = [];
    const processedServices = new Set<string>();

    // Build dependency graph
    const dependencyGraph = new Map<string, string[]>();
    for (const service of services) {
      dependencyGraph.set(service.name, service.dependencies || []);
      processedServices.add(service.name);
    }

    // Recursively resolve dependencies
    for (const service of services) {
      await this.resolveDependenciesRecursive(
        service,
        resolved,
        missing,
        conflicts,
        processedServices,
        new Set() // visited set for cycle detection
      );
    }

    // Check for conflicts
    const conflictCheck = this.checkServiceConflicts(resolved);
    conflicts.push(...conflictCheck);

    return {
      resolved: this.deduplicateServices(resolved),
      missing: this.deduplicateDependencies(missing),
      conflicts: [...new Set(conflicts)], // Remove duplicates
    };
  }

  /**
   * Calculate injection order based on dependencies
   */
  async calculateInjectionOrder(services: readonly ServiceConfig[]): Promise<readonly string[]> {
    consola.debug("Calculating service injection order...");

    const dependencyGraph = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    // Build dependency graph and calculate in-degrees
    for (const service of services) {
      dependencyGraph.set(service.name, service.dependencies || []);
      inDegree.set(service.name, 0);
    }

    // Calculate in-degrees
    for (const service of services) {
      const dependencies = service.dependencies || [];
      for (const dep of dependencies) {
        if (inDegree.has(dep)) {
          inDegree.set(dep, (inDegree.get(dep) || 0) + 1);
        }
      }
    }

    // Topological sort using Kahn's algorithm
    const result: string[] = [];
    const queue: string[] = [];

    // Find all services with no dependencies
    for (const [serviceName, degree] of inDegree) {
      if (degree === 0) {
        queue.push(serviceName);
      }
    }

    while (queue.length > 0) {
      const current = queue.shift()!;
      result.push(current);

      // Process dependencies
      const currentDependencies = dependencyGraph.get(current) || [];
      for (const dep of currentDependencies) {
        if (inDegree.has(dep)) {
          const newDegree = (inDegree.get(dep) || 0) - 1;
          inDegree.set(dep, newDegree);

          if (newDegree === 0) {
            queue.push(dep);
          }
        }
      }
    }

    // Check for circular dependencies
    if (result.length !== services.length) {
      const remaining = services
        .map(s => s.name)
        .filter(name => !result.includes(name));
      
      throw new Error(`Circular dependency detected among services: ${remaining.join(", ")}`);
    }

    consola.debug(`Injection order: ${result.join(" -> ")}`);
    return result;
  }

  /**
   * Suggest additional services based on current selection
   */
  async suggestServices(
    currentServices: readonly ServiceConfig[],
    projectType?: string
  ): Promise<readonly string[]> {
    const suggestions = new Set<string>();
    const currentServiceNames = new Set(currentServices.map(s => s.name));
    const currentServiceTypes = new Set(currentServices.map(s => s.type));

    // Get all available templates
    const allTemplates = await this.registry.listTemplates();

    // Service type-based suggestions
    const serviceSuggestions = this.getServiceTypeSuggestions(currentServiceTypes, projectType);
    for (const suggestion of serviceSuggestions) {
      suggestions.add(suggestion);
    }

    // Provider-based suggestions
    for (const service of currentServices) {
      const template = await this.registry.getTemplate(service.type, service.provider);
      if (template) {
        // Add complementary services based on common patterns
        const complementary = this.getComplementaryServices(service, allTemplates);
        for (const comp of complementary) {
          if (!currentServiceNames.has(comp)) {
            suggestions.add(comp);
          }
        }
      }
    }

    // Project type specific suggestions
    if (projectType) {
      const projectSuggestions = this.getProjectTypeSuggestions(projectType, currentServiceTypes);
      for (const suggestion of projectSuggestions) {
        suggestions.add(suggestion);
      }
    }

    return Array.from(suggestions).sort();
  }

  /**
   * Recursively resolve dependencies for a service
   */
  private async resolveDependenciesRecursive(
    service: ServiceConfig,
    resolved: ServiceConfig[],
    missing: ServiceDependency[],
    conflicts: string[],
    processedServices: Set<string>,
    visited: Set<string>
  ): Promise<void> {
    if (visited.has(service.name)) {
      conflicts.push(`Circular dependency detected: ${service.name}`);
      return;
    }

    visited.add(service.name);

    if (service.dependencies) {
      for (const depName of service.dependencies) {
        if (!processedServices.has(depName)) {
          // Check if we have a template for this dependency
          const availableTemplates = await this.registry.listTemplates();
          const matchingTemplate = availableTemplates.find(
            t => t.name === depName || t.provider === depName
          );

          if (matchingTemplate) {
            // Create a basic service config for the dependency
            const depService: ServiceConfig = {
              name: depName,
              type: matchingTemplate.type,
              provider: matchingTemplate.provider,
              enabled: true,
              config: {},
            };

            resolved.push(depService);
            processedServices.add(depName);

            // Recursively resolve dependencies of this dependency
            await this.resolveDependenciesRecursive(
              depService,
              resolved,
              missing,
              conflicts,
              processedServices,
              new Set(visited)
            );
          } else {
            missing.push({
              serviceId: depName,
              type: service.type, // Best guess
              provider: depName,
              required: true,
              reason: `Required by ${service.name}`,
            });
          }
        }
      }
    }

    visited.delete(service.name);
  }

  /**
   * Check for conflicts between services
   */
  private checkServiceConflicts(services: readonly ServiceConfig[]): string[] {
    const conflicts: string[] = [];
    
    // Check for multiple services of exclusive types
    const exclusiveTypes = ["database", "auth"];
    for (const type of exclusiveTypes) {
      const servicesOfType = services.filter(s => s.type === type);
      if (servicesOfType.length > 1) {
        const serviceNames = servicesOfType.map(s => s.name);
        conflicts.push(`Multiple ${type} services not supported: ${serviceNames.join(", ")}`);
      }
    }

    // Check explicit conflicts
    for (const service of services) {
      if (service.conflicts) {
        for (const conflict of service.conflicts) {
          const conflictingService = services.find(s => s.name === conflict);
          if (conflictingService) {
            conflicts.push(`${service.name} conflicts with ${conflict}`);
          }
        }
      }
    }

    return conflicts;
  }

  /**
   * Deduplicate services
   */
  private deduplicateServices(services: readonly ServiceConfig[]): readonly ServiceConfig[] {
    const serviceMap = new Map<string, ServiceConfig>();
    
    for (const service of services) {
      if (!serviceMap.has(service.name)) {
        serviceMap.set(service.name, service);
      }
    }

    return Array.from(serviceMap.values());
  }

  /**
   * Deduplicate dependencies
   */
  private deduplicateDependencies(dependencies: readonly ServiceDependency[]): readonly ServiceDependency[] {
    const depMap = new Map<string, ServiceDependency>();
    
    for (const dep of dependencies) {
      const key = `${dep.serviceId}:${dep.provider}`;
      if (!depMap.has(key)) {
        depMap.set(key, dep);
      }
    }

    return Array.from(depMap.values());
  }

  /**
   * Get service type suggestions based on current services
   */
  private getServiceTypeSuggestions(
    currentTypes: Set<string>,
    projectType?: string
  ): string[] {
    const suggestions: string[] = [];

    // Common service patterns
    if (currentTypes.has("auth") && !currentTypes.has("notification")) {
      suggestions.push("resend-notifications");
    }

    if (currentTypes.has("database") && !currentTypes.has("auth")) {
      suggestions.push("better-auth");
    }

    if (currentTypes.has("auth") && !currentTypes.has("payment")) {
      suggestions.push("stripe-payments");
    }

    if (currentTypes.has("payment") && !currentTypes.has("notification")) {
      suggestions.push("resend-notifications");
    }

    if (!currentTypes.has("monitoring")) {
      suggestions.push("sentry-monitoring");
    }

    if (!currentTypes.has("analytics")) {
      suggestions.push("posthog-analytics");
    }

    return suggestions;
  }

  /**
   * Get complementary services for a given service
   */
  private getComplementaryServices(
    service: ServiceConfig,
    allTemplates: readonly any[]
  ): string[] {
    const complementary: string[] = [];

    // Auth services often work well with user management and notifications
    if (service.type === "auth") {
      complementary.push("user-management", "resend-notifications");
    }

    // Payment services often work well with notifications and analytics
    if (service.type === "payment") {
      complementary.push("resend-notifications", "posthog-analytics");
    }

    // Database services often work well with auth and monitoring
    if (service.type === "database") {
      complementary.push("better-auth", "sentry-monitoring");
    }

    return complementary;
  }

  /**
   * Get project type specific suggestions
   */
  private getProjectTypeSuggestions(
    projectType: string,
    currentTypes: Set<string>
  ): string[] {
    const suggestions: string[] = [];

    switch (projectType.toLowerCase()) {
      case "saas":
      case "webapp":
        if (!currentTypes.has("auth")) suggestions.push("better-auth");
        if (!currentTypes.has("payment")) suggestions.push("stripe-payments");
        if (!currentTypes.has("notification")) suggestions.push("resend-notifications");
        if (!currentTypes.has("analytics")) suggestions.push("posthog-analytics");
        if (!currentTypes.has("monitoring")) suggestions.push("sentry-monitoring");
        break;

      case "ecommerce":
        if (!currentTypes.has("payment")) suggestions.push("stripe-payments");
        if (!currentTypes.has("notification")) suggestions.push("resend-notifications");
        if (!currentTypes.has("analytics")) suggestions.push("posthog-analytics");
        break;

      case "api":
      case "backend":
        if (!currentTypes.has("monitoring")) suggestions.push("sentry-monitoring");
        if (!currentTypes.has("logger")) suggestions.push("winston-logger");
        if (!currentTypes.has("cache")) suggestions.push("redis-cache");
        break;

      default:
        // Generic suggestions for unknown project types
        if (!currentTypes.has("monitoring")) suggestions.push("sentry-monitoring");
        break;
    }

    return suggestions;
  }
}