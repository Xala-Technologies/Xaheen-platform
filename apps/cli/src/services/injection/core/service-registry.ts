/**
 * Service Registry Implementation
 * Manages available service templates for injection
 */

import path from "node:path";
import fs from "fs-extra";
import consola from "consola";
import { globby } from "globby";
import type {
  ServiceRegistry,
  ServiceTemplate,
  ServiceType,
} from "../interfaces/service-injector";

export class CoreServiceRegistry implements ServiceRegistry {
  private readonly templates = new Map<string, ServiceTemplate>();
  private readonly templatePaths = new Map<string, string>();
  private initialized = false;

  constructor(private readonly basePath?: string) {
    this.basePath = basePath || this.getDefaultBasePath();
  }

  /**
   * Initialize the registry by scanning for service templates
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    consola.info("Initializing service registry...");
    
    try {
      await this.scanServiceTemplates();
      this.initialized = true;
      consola.success(`Service registry initialized with ${this.templates.size} templates`);
    } catch (error) {
      consola.error("Failed to initialize service registry:", error);
      throw new Error("Service registry initialization failed");
    }
  }

  /**
   * Register a service template
   */
  async registerTemplate(template: ServiceTemplate): Promise<void> {
    const validationErrors = await this.validateTemplate(template);
    if (validationErrors.length > 0) {
      throw new Error(`Template validation failed: ${validationErrors.join(", ")}`);
    }

    const key = this.getTemplateKey(template.type, template.provider);
    this.templates.set(key, template);
    consola.debug(`Registered service template: ${template.type}/${template.provider}`);
  }

  /**
   * Get registered template
   */
  async getTemplate(type: ServiceType, provider: string): Promise<ServiceTemplate | null> {
    await this.ensureInitialized();
    const key = this.getTemplateKey(type, provider);
    return this.templates.get(key) || null;
  }

  /**
   * List templates by type
   */
  async listTemplates(type?: ServiceType): Promise<readonly ServiceTemplate[]> {
    await this.ensureInitialized();
    
    const allTemplates = Array.from(this.templates.values());
    
    if (type) {
      return allTemplates.filter(template => template.type === type);
    }
    
    return allTemplates.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type.localeCompare(b.type);
      }
      return a.provider.localeCompare(b.provider);
    });
  }

  /**
   * Check if template exists
   */
  async hasTemplate(type: ServiceType, provider: string): Promise<boolean> {
    await this.ensureInitialized();
    const key = this.getTemplateKey(type, provider);
    return this.templates.has(key);
  }

  /**
   * Validate template
   */
  async validateTemplate(template: ServiceTemplate): Promise<readonly string[]> {
    const errors: string[] = [];

    // Validate basic properties
    if (!template.name || typeof template.name !== "string") {
      errors.push("Template name is required and must be a string");
    }

    if (!template.type || typeof template.type !== "string") {
      errors.push("Template type is required and must be a string");
    }

    if (!template.provider || typeof template.provider !== "string") {
      errors.push("Template provider is required and must be a string");
    }

    if (!template.version || typeof template.version !== "string") {
      errors.push("Template version is required and must be a string");
    }

    if (!template.description || typeof template.description !== "string") {
      errors.push("Template description is required and must be a string");
    }

    // Validate injection points
    if (!Array.isArray(template.injectionPoints)) {
      errors.push("Template injection points must be an array");
    } else {
      for (const [index, point] of template.injectionPoints.entries()) {
        if (!point.path || typeof point.path !== "string") {
          errors.push(`Injection point ${index}: path is required and must be a string`);
        }

        if (!point.type || !["file", "directory", "config"].includes(point.type)) {
          errors.push(`Injection point ${index}: type must be one of: file, directory, config`);
        }

        if (!point.strategy || !["replace", "merge", "append", "prepend"].includes(point.strategy)) {
          errors.push(`Injection point ${index}: strategy must be one of: replace, merge, append, prepend`);
        }
      }
    }

    // Validate environment variables
    if (!Array.isArray(template.envVariables)) {
      errors.push("Template environment variables must be an array");
    } else {
      for (const [index, envVar] of template.envVariables.entries()) {
        if (!envVar.name || typeof envVar.name !== "string") {
          errors.push(`Environment variable ${index}: name is required and must be a string`);
        }

        if (!envVar.description || typeof envVar.description !== "string") {
          errors.push(`Environment variable ${index}: description is required and must be a string`);
        }

        if (typeof envVar.required !== "boolean") {
          errors.push(`Environment variable ${index}: required must be a boolean`);
        }

        if (envVar.type && !["string", "number", "boolean", "url", "secret"].includes(envVar.type)) {
          errors.push(`Environment variable ${index}: type must be one of: string, number, boolean, url, secret`);
        }
      }
    }

    // Validate dependencies
    if (!Array.isArray(template.dependencies)) {
      errors.push("Template dependencies must be an array");
    } else {
      for (const [index, dep] of template.dependencies.entries()) {
        if (!dep.name || typeof dep.name !== "string") {
          errors.push(`Dependency ${index}: name is required and must be a string`);
        }

        if (!dep.version || typeof dep.version !== "string") {
          errors.push(`Dependency ${index}: version is required and must be a string`);
        }

        if (!dep.type || !["dev", "peer", "runtime"].includes(dep.type)) {
          errors.push(`Dependency ${index}: type must be one of: dev, peer, runtime`);
        }
      }
    }

    // Validate post-injection steps
    if (template.postInjectionSteps) {
      if (!Array.isArray(template.postInjectionSteps)) {
        errors.push("Template post-injection steps must be an array");
      } else {
        for (const [index, step] of template.postInjectionSteps.entries()) {
          if (!step.name || typeof step.name !== "string") {
            errors.push(`Post-injection step ${index}: name is required and must be a string`);
          }

          if (!step.command || typeof step.command !== "string") {
            errors.push(`Post-injection step ${index}: command is required and must be a string`);
          }

          if (!step.description || typeof step.description !== "string") {
            errors.push(`Post-injection step ${index}: description is required and must be a string`);
          }
        }
      }
    }

    return errors;
  }

  /**
   * Get template statistics
   */
  async getStatistics(): Promise<{
    totalTemplates: number;
    templatesByType: Record<ServiceType, number>;
    templatesByProvider: Record<string, number>;
  }> {
    await this.ensureInitialized();

    const allTemplates = Array.from(this.templates.values());
    const templatesByType: Record<string, number> = {};
    const templatesByProvider: Record<string, number> = {};

    for (const template of allTemplates) {
      templatesByType[template.type] = (templatesByType[template.type] || 0) + 1;
      templatesByProvider[template.provider] = (templatesByProvider[template.provider] || 0) + 1;
    }

    return {
      totalTemplates: allTemplates.length,
      templatesByType: templatesByType as Record<ServiceType, number>,
      templatesByProvider,
    };
  }

  /**
   * Scan for service templates in the base path
   */
  private async scanServiceTemplates(): Promise<void> {
    if (!(await fs.pathExists(this.basePath))) {
      consola.warn(`Service templates base path does not exist: ${this.basePath}`);
      return;
    }

    // Look for service.json files
    const templateConfigPaths = await globby("**/service.json", {
      cwd: this.basePath,
      absolute: true,
      onlyFiles: true,
    });

    consola.debug(`Found ${templateConfigPaths.length} service template configurations`);

    for (const configPath of templateConfigPaths) {
      try {
        await this.loadTemplateFromPath(configPath);
      } catch (error) {
        consola.warn(`Failed to load service template from ${configPath}:`, error);
      }
    }
  }

  /**
   * Load service template from file path
   */
  private async loadTemplateFromPath(configPath: string): Promise<void> {
    const configContent = await fs.readFile(configPath, "utf-8");
    const template = JSON.parse(configContent) as ServiceTemplate;
    
    await this.registerTemplate(template);
    
    const key = this.getTemplateKey(template.type, template.provider);
    this.templatePaths.set(key, path.dirname(configPath));
    
    consola.debug(`Loaded service template: ${template.type}/${template.provider} from ${configPath}`);
  }

  /**
   * Get template key for storage
   */
  private getTemplateKey(type: ServiceType, provider: string): string {
    return `${type}:${provider}`;
  }

  /**
   * Ensure registry is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  /**
   * Get default base path for service templates
   */
  private getDefaultBasePath(): string {
    return path.join(process.cwd(), "src", "services", "injection", "templates");
  }
}