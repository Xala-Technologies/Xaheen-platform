/**
 * Core Service Injector Implementation
 * Handles the injection, removal, and management of services in projects
 */

import path from "node:path";
import fs from "fs-extra";
import consola from "consola";
import handlebars from "handlebars";
import { generateId } from "../../utils/id-generator";
import type {
  ServiceInjector,
  ServiceConfig,
  ServiceInjectionOptions,
  ServiceInjectionResult,
  ServiceInjectionMetadata,
  ServiceTemplate,
  ServiceType,
  ServiceCompatibilityResult,
  ServiceDependency,
  InjectionContext,
} from "../interfaces/service-injector";
import type { ServiceRegistry } from "../interfaces/service-injector";

export class CoreServiceInjector implements ServiceInjector {
  private readonly handlebarsInstance: typeof handlebars;
  private readonly metadataFile = ".xaheen/services.json";

  constructor(private readonly registry: ServiceRegistry) {
    this.handlebarsInstance = handlebars.create();
    this.registerHandlebarsHelpers();
  }

  /**
   * Inject a service into the project
   */
  async injectService(
    serviceConfig: ServiceConfig,
    projectPath: string,
    options: ServiceInjectionOptions = {}
  ): Promise<ServiceInjectionResult> {
    consola.info(`Injecting service: ${serviceConfig.name} (${serviceConfig.provider})`);

    const serviceId = generateId();
    const metadata: ServiceInjectionMetadata = {
      id: serviceId,
      serviceConfig,
      injectedAt: new Date(),
      context: options.context || "development",
      injectionPoint: projectPath,
      files: [],
      envVars: [],
      dependencies: [],
    };

    const result: ServiceInjectionResult = {
      success: false,
      serviceId,
      metadata,
      filesModified: [],
      envVarsAdded: [],
      dependenciesAdded: [],
      errors: [],
      warnings: [],
    };

    try {
      // Get service template
      const template = await this.registry.getTemplate(serviceConfig.type, serviceConfig.provider);
      if (!template) {
        result.errors.push(`Service template not found: ${serviceConfig.type}/${serviceConfig.provider}`);
        return result;
      }

      // Validate service if not skipped
      if (!options.skipValidation) {
        const validationErrors = await this.validateServiceInjection(serviceConfig, projectPath, template);
        if (validationErrors.length > 0) {
          result.errors.push(...validationErrors);
          return result;
        }
      }

      // Check for existing services and conflicts
      const existingServices = await this.listServices(projectPath);
      const compatibilityCheck = await this.validateCompatibility([
        ...existingServices.map(s => s.serviceConfig),
        serviceConfig
      ], projectPath);

      if (!compatibilityCheck.compatible) {
        const conflictMessages = compatibilityCheck.conflicts.map(
          c => `${c.serviceA} conflicts with ${c.serviceB}: ${c.reason}`
        );
        result.errors.push(...conflictMessages);
        
        if (!options.overwrite) {
          return result;
        } else {
          result.warnings.push("Proceeding with injection despite conflicts due to overwrite option");
        }
      }

      if (options.dryRun) {
        result.success = true;
        return result;
      }

      // Create backup if requested
      if (options.backupFiles) {
        await this.createBackup(projectPath, serviceId);
      }

      // Process injection points
      const processedFiles: string[] = [];
      const envVarsAdded: string[] = [];
      const dependenciesAdded: string[] = [];

      // Sort injection points by priority
      const sortedInjectionPoints = [...template.injectionPoints].sort((a, b) => 
        (b.priority || 0) - (a.priority || 0)
      );

      for (const injectionPoint of sortedInjectionPoints) {
        try {
          const shouldInject = await this.evaluateCondition(
            injectionPoint.condition,
            serviceConfig,
            projectPath
          );

          if (!shouldInject) {
            continue;
          }

          const targetPath = path.join(projectPath, injectionPoint.path);
          const injectionResult = await this.processInjectionPoint(
            injectionPoint,
            template,
            serviceConfig,
            targetPath,
            options
          );

          if (injectionResult.success) {
            processedFiles.push(targetPath);
          } else if (injectionResult.error) {
            result.warnings.push(`Injection point ${injectionPoint.path}: ${injectionResult.error}`);
          }

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          result.warnings.push(`Failed to process injection point ${injectionPoint.path}: ${errorMessage}`);
        }
      }

      // Add environment variables
      for (const envVar of template.envVariables) {
        if (envVar.required || serviceConfig.config[envVar.name] !== undefined) {
          envVarsAdded.push(envVar.name);
        }
      }

      // Add dependencies
      for (const dep of template.dependencies) {
        const shouldInclude = await this.evaluateCondition(
          dep.condition,
          serviceConfig,
          projectPath
        );

        if (shouldInclude) {
          dependenciesAdded.push(`${dep.name}@${dep.version}`);
        }
      }

      // Update metadata
      metadata.files = processedFiles;
      metadata.envVars = envVarsAdded;
      metadata.dependencies = dependenciesAdded;

      // Save service metadata
      await this.saveServiceMetadata(projectPath, metadata);

      // Execute post-injection steps
      if (template.postInjectionSteps) {
        await this.executePostInjectionSteps(template.postInjectionSteps, serviceConfig, projectPath);
      }

      result.success = true;
      result.filesModified = processedFiles;
      result.envVarsAdded = envVarsAdded;
      result.dependenciesAdded = dependenciesAdded;

      consola.success(`Service ${serviceConfig.name} injected successfully`);
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      result.errors.push(`Service injection failed: ${errorMessage}`);
      consola.error(`Error injecting service ${serviceConfig.name}:`, error);
      return result;
    }
  }

  /**
   * Remove a service from the project
   */
  async removeService(
    serviceId: string,
    projectPath: string,
    options: ServiceInjectionOptions = {}
  ): Promise<ServiceInjectionResult> {
    consola.info(`Removing service: ${serviceId}`);

    const services = await this.listServices(projectPath);
    const serviceMetadata = services.find(s => s.id === serviceId);

    if (!serviceMetadata) {
      return {
        success: false,
        serviceId,
        metadata: {} as ServiceInjectionMetadata,
        filesModified: [],
        envVarsAdded: [],
        dependenciesAdded: [],
        errors: [`Service not found: ${serviceId}`],
        warnings: [],
      };
    }

    const result: ServiceInjectionResult = {
      success: false,
      serviceId,
      metadata: serviceMetadata,
      filesModified: [],
      envVarsAdded: [],
      dependenciesAdded: [],
      errors: [],
      warnings: [],
    };

    try {
      if (options.dryRun) {
        result.success = true;
        return result;
      }

      // Remove files created by the service
      const removedFiles: string[] = [];
      for (const filePath of serviceMetadata.files) {
        if (await fs.pathExists(filePath)) {
          if (options.backupFiles) {
            await this.backupFile(filePath, serviceId);
          }
          await fs.remove(filePath);
          removedFiles.push(filePath);
        }
      }

      // Remove service metadata
      await this.removeServiceMetadata(projectPath, serviceId);

      result.success = true;
      result.filesModified = removedFiles;

      consola.success(`Service ${serviceMetadata.serviceConfig.name} removed successfully`);
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      result.errors.push(`Service removal failed: ${errorMessage}`);
      consola.error(`Error removing service ${serviceId}:`, error);
      return result;
    }
  }

  /**
   * Update a service configuration
   */
  async updateService(
    serviceId: string,
    newConfig: Partial<ServiceConfig>,
    projectPath: string,
    options: ServiceInjectionOptions = {}
  ): Promise<ServiceInjectionResult> {
    // Remove old service and inject updated one
    const removeResult = await this.removeService(serviceId, projectPath, options);
    if (!removeResult.success) {
      return removeResult;
    }

    const services = await this.listServices(projectPath);
    const oldMetadata = services.find(s => s.id === serviceId);
    if (!oldMetadata) {
      return {
        ...removeResult,
        errors: [`Service metadata not found: ${serviceId}`],
      };
    }

    const updatedConfig: ServiceConfig = {
      ...oldMetadata.serviceConfig,
      ...newConfig,
    };

    return this.injectService(updatedConfig, projectPath, options);
  }

  /**
   * List injected services
   */
  async listServices(projectPath: string): Promise<readonly ServiceInjectionMetadata[]> {
    const metadataPath = path.join(projectPath, this.metadataFile);
    
    if (!(await fs.pathExists(metadataPath))) {
      return [];
    }

    try {
      const content = await fs.readFile(metadataPath, "utf-8");
      const data = JSON.parse(content);
      return Array.isArray(data.services) ? data.services : [];
    } catch {
      return [];
    }
  }

  /**
   * Validate service compatibility
   */
  async validateCompatibility(
    services: readonly ServiceConfig[],
    projectPath: string
  ): Promise<ServiceCompatibilityResult> {
    const conflicts: Array<{ serviceA: string; serviceB: string; reason: string }> = [];
    const missingDependencies: ServiceDependency[] = [];
    const suggestions: string[] = [];

    // Check for conflicts between services
    for (let i = 0; i < services.length; i++) {
      for (let j = i + 1; j < services.length; j++) {
        const serviceA = services[i];
        const serviceB = services[j];

        // Check explicit conflicts
        if (serviceA.conflicts?.includes(serviceB.name) || serviceB.conflicts?.includes(serviceA.name)) {
          conflicts.push({
            serviceA: serviceA.name,
            serviceB: serviceB.name,
            reason: "Explicitly defined conflict",
          });
        }

        // Check same type conflicts (e.g., multiple databases)
        if (serviceA.type === serviceB.type && ["database", "auth"].includes(serviceA.type)) {
          conflicts.push({
            serviceA: serviceA.name,
            serviceB: serviceB.name,
            reason: `Multiple ${serviceA.type} services not supported`,
          });
        }
      }
    }

    // Check dependencies
    for (const service of services) {
      if (service.dependencies) {
        for (const depName of service.dependencies) {
          const dependencyExists = services.some(s => s.name === depName);
          if (!dependencyExists) {
            missingDependencies.push({
              serviceId: service.name,
              type: service.type,
              provider: depName,
              required: true,
              reason: `Required by ${service.name}`,
            });
          }
        }
      }
    }

    return {
      compatible: conflicts.length === 0 && missingDependencies.length === 0,
      conflicts,
      missingDependencies,
      suggestions,
    };
  }

  /**
   * Get service template
   */
  async getServiceTemplate(type: ServiceType, provider: string): Promise<ServiceTemplate | null> {
    return this.registry.getTemplate(type, provider);
  }

  /**
   * List available service templates
   */
  async listServiceTemplates(type?: ServiceType): Promise<readonly ServiceTemplate[]> {
    return this.registry.listTemplates(type);
  }

  /**
   * Process an injection point
   */
  private async processInjectionPoint(
    injectionPoint: any,
    template: ServiceTemplate,
    serviceConfig: ServiceConfig,
    targetPath: string,
    options: ServiceInjectionOptions
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await fs.ensureDir(path.dirname(targetPath));

      const templateContext = {
        service: serviceConfig,
        config: serviceConfig.config,
        template,
        projectPath: path.dirname(targetPath),
      };

      switch (injectionPoint.strategy) {
        case "replace":
          if (injectionPoint.template) {
            const content = this.handlebarsInstance.compile(injectionPoint.template)(templateContext);
            await fs.writeFile(targetPath, content, "utf-8");
          }
          break;

        case "merge":
          // For now, simple append - can be enhanced for JSON/YAML merging
          if (injectionPoint.template) {
            const content = this.handlebarsInstance.compile(injectionPoint.template)(templateContext);
            await fs.appendFile(targetPath, content, "utf-8");
          }
          break;

        case "append":
          if (injectionPoint.template) {
            const content = this.handlebarsInstance.compile(injectionPoint.template)(templateContext);
            await fs.appendFile(targetPath, content, "utf-8");
          }
          break;

        case "prepend":
          if (injectionPoint.template) {
            const content = this.handlebarsInstance.compile(injectionPoint.template)(templateContext);
            const existing = await fs.pathExists(targetPath) ? await fs.readFile(targetPath, "utf-8") : "";
            await fs.writeFile(targetPath, content + existing, "utf-8");
          }
          break;

        default:
          return { success: false, error: `Unknown injection strategy: ${injectionPoint.strategy}` };
      }

      return { success: true };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Save service metadata
   */
  private async saveServiceMetadata(
    projectPath: string,
    metadata: ServiceInjectionMetadata
  ): Promise<void> {
    const metadataPath = path.join(projectPath, this.metadataFile);
    await fs.ensureDir(path.dirname(metadataPath));

    let data: { services: ServiceInjectionMetadata[] } = { services: [] };
    
    if (await fs.pathExists(metadataPath)) {
      try {
        const content = await fs.readFile(metadataPath, "utf-8");
        data = JSON.parse(content);
      } catch {
        // Use default empty data if parsing fails
      }
    }

    if (!Array.isArray(data.services)) {
      data.services = [];
    }

    data.services.push(metadata);
    await fs.writeFile(metadataPath, JSON.stringify(data, null, 2), "utf-8");
  }

  /**
   * Remove service metadata
   */
  private async removeServiceMetadata(projectPath: string, serviceId: string): Promise<void> {
    const metadataPath = path.join(projectPath, this.metadataFile);
    
    if (!(await fs.pathExists(metadataPath))) {
      return;
    }

    try {
      const content = await fs.readFile(metadataPath, "utf-8");
      const data = JSON.parse(content);
      
      if (Array.isArray(data.services)) {
        data.services = data.services.filter((s: ServiceInjectionMetadata) => s.id !== serviceId);
        await fs.writeFile(metadataPath, JSON.stringify(data, null, 2), "utf-8");
      }
    } catch (error) {
      consola.warn("Failed to update service metadata:", error);
    }
  }

  /**
   * Validate service injection
   */
  private async validateServiceInjection(
    serviceConfig: ServiceConfig,
    projectPath: string,
    template: ServiceTemplate
  ): Promise<string[]> {
    const errors: string[] = [];

    // Check if project directory exists
    if (!(await fs.pathExists(projectPath))) {
      errors.push(`Project path does not exist: ${projectPath}`);
    }

    // Validate service config
    if (!serviceConfig.name) {
      errors.push("Service name is required");
    }

    if (!serviceConfig.provider) {
      errors.push("Service provider is required");
    }

    // Check for required configuration
    for (const envVar of template.envVariables) {
      if (envVar.required && !serviceConfig.config[envVar.name]) {
        errors.push(`Required configuration missing: ${envVar.name}`);
      }
    }

    return errors;
  }

  /**
   * Evaluate Handlebars condition
   */
  private async evaluateCondition(
    condition: string | undefined,
    serviceConfig: ServiceConfig,
    projectPath: string
  ): Promise<boolean> {
    if (!condition) {
      return true;
    }

    try {
      const template = this.handlebarsInstance.compile(`{{#if (${condition})}}true{{else}}false{{/if}}`);
      const result = template({
        service: serviceConfig,
        config: serviceConfig.config,
        projectPath,
      });
      return result.trim() === "true";
    } catch {
      return true; // Default to true if evaluation fails
    }
  }

  /**
   * Execute post-injection steps
   */
  private async executePostInjectionSteps(
    steps: readonly any[],
    serviceConfig: ServiceConfig,
    projectPath: string
  ): Promise<void> {
    for (const step of steps) {
      try {
        const shouldExecute = await this.evaluateCondition(step.condition, serviceConfig, projectPath);
        if (shouldExecute) {
          consola.info(`Executing post-injection step: ${step.name}`);
          // For now, just log - can be enhanced to actually execute commands
          consola.debug(`Command: ${step.command}`);
        }
      } catch (error) {
        consola.warn(`Failed to execute post-injection step ${step.name}:`, error);
      }
    }
  }

  /**
   * Create backup
   */
  private async createBackup(projectPath: string, serviceId: string): Promise<void> {
    const backupDir = path.join(projectPath, ".xaheen", "backups", serviceId);
    await fs.ensureDir(backupDir);
    // Backup implementation would go here
  }

  /**
   * Backup file
   */
  private async backupFile(filePath: string, serviceId: string): Promise<void> {
    const projectPath = path.dirname(filePath);
    const backupDir = path.join(projectPath, ".xaheen", "backups", serviceId);
    await fs.ensureDir(backupDir);
    
    const relativePath = path.relative(projectPath, filePath);
    const backupPath = path.join(backupDir, relativePath);
    await fs.ensureDir(path.dirname(backupPath));
    await fs.copy(filePath, backupPath);
  }

  /**
   * Register Handlebars helpers
   */
  private registerHandlebarsHelpers(): void {
    this.handlebarsInstance.registerHelper("eq", (a, b) => a === b);
    this.handlebarsInstance.registerHelper("ne", (a, b) => a !== b);
    this.handlebarsInstance.registerHelper("and", (a, b) => a && b);
    this.handlebarsInstance.registerHelper("or", (a, b) => a || b);
    this.handlebarsInstance.registerHelper("not", (a) => !a);
    this.handlebarsInstance.registerHelper("includes", (array, value) => 
      Array.isArray(array) && array.includes(value)
    );
  }
}