/**
 * Service Injector Core Implementation
 * 
 * Handles the injection of services into project templates based on
 * service definitions, injection points, and project configuration.
 * 
 * @author CLI Template Generator Agent
 * @since 2025-01-03
 */

import path from 'node:path';
import fs from 'fs-extra';
import consola from 'consola';
import { EventEmitter } from 'node:events';
import Handlebars from 'handlebars';
import * as tsmorph from 'ts-morph';

import type {
  ServiceTemplate,
  ServiceInjectionPoint,
  ServiceConfiguration,
  ServiceInjectionResult,
  ServiceInjectionMetadata
} from '../registry/schemas';

import type { IServiceRegistry } from '../registry/interfaces';
import type { ProjectContext } from '../../types';

/**
 * Service injection options
 */
export interface ServiceInjectionOptions {
  dryRun?: boolean;
  force?: boolean;
  interactive?: boolean;
  skipValidation?: boolean;
  skipDependencies?: boolean;
  preserveExisting?: boolean;
  generateTests?: boolean;
  generateDocs?: boolean;
}

/**
 * Injection context for tracking state
 */
export interface InjectionContext {
  projectPath: string;
  projectContext: ProjectContext;
  injectedServices: Map<string, ServiceInjectionMetadata>;
  modifiedFiles: Set<string>;
  createdFiles: Set<string>;
  errors: string[];
  warnings: string[];
  startTime: number;
}

/**
 * Service Injector Implementation
 */
export class ServiceInjector extends EventEmitter {
  private readonly serviceRegistry: IServiceRegistry;
  private readonly templateCache: Map<string, CompiledTemplate> = new Map();
  private project?: tsmorph.Project;

  constructor(serviceRegistry: IServiceRegistry) {
    super();
    this.serviceRegistry = serviceRegistry;
  }

  /**
   * Inject a service into a project
   */
  async injectService(
    service: ServiceConfiguration,
    template: ServiceTemplate,
    projectPath: string,
    projectContext: ProjectContext,
    options: ServiceInjectionOptions = {}
  ): Promise<ServiceInjectionResult> {
    const startTime = Date.now();
    consola.info(`Injecting service: ${service.serviceType}:${service.provider}`);

    const context: InjectionContext = {
      projectPath,
      projectContext,
      injectedServices: new Map(),
      modifiedFiles: new Set(),
      createdFiles: new Set(),
      errors: [],
      warnings: [],
      startTime
    };

    try {
      // Initialize TypeScript project for AST manipulation
      if (!this.project) {
        this.project = new tsmorph.Project({
          tsConfigFilePath: path.join(projectPath, 'tsconfig.json'),
          skipAddingFilesFromTsConfig: true
        });
      }

      // Validate injection compatibility
      if (!options.skipValidation) {
        const validationResult = await this.validateInjection(service, template, context);
        if (!validationResult.isValid) {
          throw new Error(`Injection validation failed: ${validationResult.errors.join(', ')}`);
        }
      }

      // Process injection points
      for (const injectionPoint of template.injectionPoints) {
        await this.processInjectionPoint(injectionPoint, service, template, context, options);
      }

      // Process environment variables
      await this.injectEnvironmentVariables(template.envVariables, context);

      // Process post-injection steps
      for (const step of template.postInjectionSteps) {
        await this.executePostInjectionStep(step, context);
      }

      // Generate tests if requested
      if (options.generateTests) {
        await this.generateServiceTests(service, template, context);
      }

      // Generate documentation if requested
      if (options.generateDocs) {
        await this.generateServiceDocumentation(service, template, context);
      }

      const injectionTime = Date.now() - startTime;

      const result: ServiceInjectionResult = {
        serviceId: service.serviceId,
        serviceType: service.serviceType,
        provider: service.provider,
        status: context.errors.length > 0 ? 'failed' : 'success',
        injectedFiles: Array.from(context.modifiedFiles),
        createdFiles: Array.from(context.createdFiles),
        environmentVariables: template.envVariables.map(env => ({
          name: env.name,
          value: env.defaultValue || '',
          required: env.required
        })),
        postInstallSteps: template.postInjectionSteps.map(step => step.description),
        errors: context.errors,
        warnings: context.warnings,
        injectionTime,
        injectedAt: new Date()
      };

      this.emit('service-injected', result);
      
      if (result.status === 'success') {
        consola.success(`Service injected successfully in ${injectionTime}ms`);
      } else {
        consola.error(`Service injection failed with ${context.errors.length} errors`);
      }

      return result;

    } catch (error) {
      context.errors.push(error instanceof Error ? error.message : String(error));
      
      return {
        serviceId: service.serviceId,
        serviceType: service.serviceType,
        provider: service.provider,
        status: 'failed',
        injectedFiles: [],
        createdFiles: [],
        environmentVariables: [],
        postInstallSteps: [],
        errors: context.errors,
        warnings: context.warnings,
        injectionTime: Date.now() - startTime,
        injectedAt: new Date()
      };
    }
  }

  /**
   * Inject multiple services with dependency resolution
   */
  async injectServices(
    services: ServiceConfiguration[],
    projectPath: string,
    projectContext: ProjectContext,
    options: ServiceInjectionOptions = {}
  ): Promise<ServiceInjectionResult[]> {
    consola.info(`Injecting ${services.length} services into project`);

    // Sort services by priority and dependencies
    const sortedServices = await this.sortServicesByDependencies(services);
    const results: ServiceInjectionResult[] = [];

    for (const service of sortedServices) {
      try {
        const template = await this.serviceRegistry.getTemplate(service.serviceType, service.provider);
        if (!template) {
          throw new Error(`Template not found for ${service.serviceType}:${service.provider}`);
        }

        const result = await this.injectService(service, template, projectPath, projectContext, options);
        results.push(result);

        if (result.status === 'failed' && service.required) {
          consola.error(`Required service ${service.serviceType} failed to inject`);
          break;
        }
      } catch (error) {
        results.push({
          serviceId: service.serviceId,
          serviceType: service.serviceType,
          provider: service.provider,
          status: 'failed',
          injectedFiles: [],
          createdFiles: [],
          environmentVariables: [],
          postInstallSteps: [],
          errors: [error instanceof Error ? error.message : String(error)],
          warnings: [],
          injectionTime: 0,
          injectedAt: new Date()
        });

        if (service.required) {
          break;
        }
      }
    }

    return results;
  }

  /**
   * Process a single injection point
   */
  private async processInjectionPoint(
    injectionPoint: ServiceInjectionPoint,
    service: ServiceConfiguration,
    template: ServiceTemplate,
    context: InjectionContext,
    options: ServiceInjectionOptions
  ): Promise<void> {
    consola.debug(`Processing injection point: ${injectionPoint.type} at ${injectionPoint.target}`);

    switch (injectionPoint.type) {
      case 'file-create':
        await this.injectFileCreate(injectionPoint, service, context, options);
        break;
      
      case 'file-append':
        await this.injectFileAppend(injectionPoint, service, context, options);
        break;
      
      case 'file-prepend':
        await this.injectFilePrepend(injectionPoint, service, context, options);
        break;
      
      case 'file-replace':
        await this.injectFileReplace(injectionPoint, service, context, options);
        break;
      
      case 'ast-modify':
        await this.injectAstModify(injectionPoint, service, context, options);
        break;
      
      case 'json-merge':
        await this.injectJsonMerge(injectionPoint, service, context, options);
        break;
      
      case 'config-update':
        await this.injectConfigUpdate(injectionPoint, service, context, options);
        break;
      
      default:
        context.warnings.push(`Unknown injection type: ${injectionPoint.type}`);
    }
  }

  /**
   * Create a new file
   */
  private async injectFileCreate(
    injectionPoint: ServiceInjectionPoint,
    service: ServiceConfiguration,
    context: InjectionContext,
    options: ServiceInjectionOptions
  ): Promise<void> {
    const targetPath = path.join(context.projectPath, injectionPoint.target);
    
    if (await fs.pathExists(targetPath) && !options.force) {
      if (options.preserveExisting) {
        context.warnings.push(`File already exists, preserving: ${injectionPoint.target}`);
        return;
      }
      throw new Error(`File already exists: ${injectionPoint.target}`);
    }

    const content = await this.processTemplate(injectionPoint.template, {
      ...context.projectContext,
      service,
      config: service.configuration
    });

    if (options.dryRun) {
      consola.info(`[DRY RUN] Would create file: ${injectionPoint.target}`);
      return;
    }

    await fs.ensureDir(path.dirname(targetPath));
    await fs.writeFile(targetPath, content);
    
    context.createdFiles.add(injectionPoint.target);
    consola.success(`Created file: ${injectionPoint.target}`);
  }

  /**
   * Append content to an existing file
   */
  private async injectFileAppend(
    injectionPoint: ServiceInjectionPoint,
    service: ServiceConfiguration,
    context: InjectionContext,
    options: ServiceInjectionOptions
  ): Promise<void> {
    const targetPath = path.join(context.projectPath, injectionPoint.target);
    
    if (!(await fs.pathExists(targetPath))) {
      throw new Error(`Target file not found: ${injectionPoint.target}`);
    }

    const existingContent = await fs.readFile(targetPath, 'utf-8');
    const newContent = await this.processTemplate(injectionPoint.template, {
      ...context.projectContext,
      service,
      config: service.configuration
    });

    if (options.dryRun) {
      consola.info(`[DRY RUN] Would append to file: ${injectionPoint.target}`);
      return;
    }

    await fs.writeFile(targetPath, existingContent + '\n' + newContent);
    
    context.modifiedFiles.add(injectionPoint.target);
    consola.success(`Appended to file: ${injectionPoint.target}`);
  }

  /**
   * Prepend content to an existing file
   */
  private async injectFilePrepend(
    injectionPoint: ServiceInjectionPoint,
    service: ServiceConfiguration,
    context: InjectionContext,
    options: ServiceInjectionOptions
  ): Promise<void> {
    const targetPath = path.join(context.projectPath, injectionPoint.target);
    
    if (!(await fs.pathExists(targetPath))) {
      throw new Error(`Target file not found: ${injectionPoint.target}`);
    }

    const existingContent = await fs.readFile(targetPath, 'utf-8');
    const newContent = await this.processTemplate(injectionPoint.template, {
      ...context.projectContext,
      service,
      config: service.configuration
    });

    if (options.dryRun) {
      consola.info(`[DRY RUN] Would prepend to file: ${injectionPoint.target}`);
      return;
    }

    await fs.writeFile(targetPath, newContent + '\n' + existingContent);
    
    context.modifiedFiles.add(injectionPoint.target);
    consola.success(`Prepended to file: ${injectionPoint.target}`);
  }

  /**
   * Replace content in a file
   */
  private async injectFileReplace(
    injectionPoint: ServiceInjectionPoint,
    service: ServiceConfiguration,
    context: InjectionContext,
    options: ServiceInjectionOptions
  ): Promise<void> {
    const targetPath = path.join(context.projectPath, injectionPoint.target);
    
    if (!(await fs.pathExists(targetPath))) {
      throw new Error(`Target file not found: ${injectionPoint.target}`);
    }

    const existingContent = await fs.readFile(targetPath, 'utf-8');
    const searchPattern = injectionPoint.searchPattern;
    const replacement = await this.processTemplate(injectionPoint.template, {
      ...context.projectContext,
      service,
      config: service.configuration
    });

    if (!searchPattern || !existingContent.includes(searchPattern)) {
      throw new Error(`Search pattern not found in ${injectionPoint.target}`);
    }

    if (options.dryRun) {
      consola.info(`[DRY RUN] Would replace in file: ${injectionPoint.target}`);
      return;
    }

    const newContent = existingContent.replace(searchPattern, replacement);
    await fs.writeFile(targetPath, newContent);
    
    context.modifiedFiles.add(injectionPoint.target);
    consola.success(`Replaced content in file: ${injectionPoint.target}`);
  }

  /**
   * Modify TypeScript AST
   */
  private async injectAstModify(
    injectionPoint: ServiceInjectionPoint,
    service: ServiceConfiguration,
    context: InjectionContext,
    options: ServiceInjectionOptions
  ): Promise<void> {
    if (!this.project) {
      throw new Error('TypeScript project not initialized');
    }

    const targetPath = path.join(context.projectPath, injectionPoint.target);
    const sourceFile = this.project.addSourceFileAtPath(targetPath);

    const astConfig = injectionPoint.astConfig;
    if (!astConfig) {
      throw new Error('AST configuration missing for ast-modify injection');
    }

    if (options.dryRun) {
      consola.info(`[DRY RUN] Would modify AST in file: ${injectionPoint.target}`);
      return;
    }

    // Handle different AST operations
    switch (astConfig.operation) {
      case 'add-import':
        this.addImport(sourceFile, astConfig);
        break;
      
      case 'add-export':
        this.addExport(sourceFile, astConfig);
        break;
      
      case 'add-function':
        this.addFunction(sourceFile, astConfig, service);
        break;
      
      case 'add-class':
        this.addClass(sourceFile, astConfig, service);
        break;
      
      case 'add-interface':
        this.addInterface(sourceFile, astConfig, service);
        break;
      
      case 'modify-function':
        this.modifyFunction(sourceFile, astConfig, service);
        break;
      
      default:
        throw new Error(`Unknown AST operation: ${astConfig.operation}`);
    }

    await sourceFile.save();
    context.modifiedFiles.add(injectionPoint.target);
    consola.success(`Modified AST in file: ${injectionPoint.target}`);
  }

  /**
   * Merge JSON configuration
   */
  private async injectJsonMerge(
    injectionPoint: ServiceInjectionPoint,
    service: ServiceConfiguration,
    context: InjectionContext,
    options: ServiceInjectionOptions
  ): Promise<void> {
    const targetPath = path.join(context.projectPath, injectionPoint.target);
    
    if (!(await fs.pathExists(targetPath))) {
      throw new Error(`Target file not found: ${injectionPoint.target}`);
    }

    const existingJson = await fs.readJson(targetPath);
    const templateContent = await this.processTemplate(injectionPoint.template, {
      ...context.projectContext,
      service,
      config: service.configuration
    });
    const mergeJson = JSON.parse(templateContent);

    if (options.dryRun) {
      consola.info(`[DRY RUN] Would merge JSON in file: ${injectionPoint.target}`);
      return;
    }

    const mergedJson = this.deepMerge(existingJson, mergeJson);
    await fs.writeJson(targetPath, mergedJson, { spaces: 2 });
    
    context.modifiedFiles.add(injectionPoint.target);
    consola.success(`Merged JSON in file: ${injectionPoint.target}`);
  }

  /**
   * Update configuration files
   */
  private async injectConfigUpdate(
    injectionPoint: ServiceInjectionPoint,
    service: ServiceConfiguration,
    context: InjectionContext,
    options: ServiceInjectionOptions
  ): Promise<void> {
    // Implementation depends on config file type
    const targetPath = path.join(context.projectPath, injectionPoint.target);
    const ext = path.extname(targetPath);

    switch (ext) {
      case '.json':
        await this.injectJsonMerge(injectionPoint, service, context, options);
        break;
      
      case '.yaml':
      case '.yml':
        await this.updateYamlConfig(injectionPoint, service, context, options);
        break;
      
      case '.toml':
        await this.updateTomlConfig(injectionPoint, service, context, options);
        break;
      
      case '.env':
        await this.updateEnvConfig(injectionPoint, service, context, options);
        break;
      
      default:
        throw new Error(`Unsupported config file type: ${ext}`);
    }
  }

  /**
   * Process Handlebars template
   */
  private async processTemplate(template: string, context: any): Promise<string> {
    const cacheKey = template.substring(0, 100); // Use first 100 chars as cache key
    
    let compiledTemplate = this.templateCache.get(cacheKey);
    if (!compiledTemplate) {
      compiledTemplate = Handlebars.compile(template);
      this.templateCache.set(cacheKey, compiledTemplate);
    }

    return compiledTemplate(context);
  }

  /**
   * Validate injection compatibility
   */
  private async validateInjection(
    service: ServiceConfiguration,
    template: ServiceTemplate,
    context: InjectionContext
  ): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Check framework compatibility
    if (template.frameworks.length > 0) {
      const projectFramework = context.projectContext.framework;
      if (!template.frameworks.includes(projectFramework)) {
        errors.push(`Service ${service.serviceType} not compatible with framework ${projectFramework}`);
      }
    }

    // Check platform compatibility
    if (template.platforms.length > 0) {
      const projectPlatform = context.projectContext.platform || 'web';
      if (!template.platforms.includes(projectPlatform)) {
        errors.push(`Service ${service.serviceType} not compatible with platform ${projectPlatform}`);
      }
    }

    // Check for existing service conflicts
    for (const injectionPoint of template.injectionPoints) {
      if (injectionPoint.conflictsWith) {
        for (const conflict of injectionPoint.conflictsWith) {
          if (context.injectedServices.has(conflict)) {
            errors.push(`Service ${service.serviceType} conflicts with ${conflict}`);
          }
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Sort services by dependencies
   */
  private async sortServicesByDependencies(services: ServiceConfiguration[]): Promise<ServiceConfiguration[]> {
    // Simple topological sort
    const sorted: ServiceConfiguration[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (service: ServiceConfiguration) => {
      if (visited.has(service.serviceId)) return;
      if (visiting.has(service.serviceId)) {
        throw new Error(`Circular dependency detected for service ${service.serviceId}`);
      }

      visiting.add(service.serviceId);

      // Visit dependencies first
      for (const dep of service.dependencies) {
        const depService = services.find(s => s.serviceType === dep.requiredService);
        if (depService) {
          visit(depService);
        }
      }

      visiting.delete(service.serviceId);
      visited.add(service.serviceId);
      sorted.push(service);
    };

    // Sort by priority first
    const prioritySorted = [...services].sort((a, b) => (b.priority || 0) - (a.priority || 0));
    
    for (const service of prioritySorted) {
      visit(service);
    }

    return sorted;
  }

  /**
   * Inject environment variables
   */
  private async injectEnvironmentVariables(
    envVariables: ServiceTemplate['envVariables'],
    context: InjectionContext
  ): Promise<void> {
    if (envVariables.length === 0) return;

    const envPath = path.join(context.projectPath, '.env.example');
    const envLocalPath = path.join(context.projectPath, '.env.local');
    
    let envContent = '';
    if (await fs.pathExists(envPath)) {
      envContent = await fs.readFile(envPath, 'utf-8');
    }

    const newVars: string[] = [];
    for (const envVar of envVariables) {
      const envLine = `${envVar.name}=${envVar.defaultValue || ''}`;
      if (!envContent.includes(envVar.name)) {
        newVars.push(`# ${envVar.description}`);
        newVars.push(envLine);
        newVars.push('');
      }
    }

    if (newVars.length > 0) {
      envContent += '\n' + newVars.join('\n');
      await fs.writeFile(envPath, envContent);
      context.modifiedFiles.add('.env.example');
      
      // Also update .env.local if it exists
      if (await fs.pathExists(envLocalPath)) {
        const localContent = await fs.readFile(envLocalPath, 'utf-8');
        await fs.writeFile(envLocalPath, localContent + '\n' + newVars.join('\n'));
        context.modifiedFiles.add('.env.local');
      }
    }
  }

  /**
   * Execute post-injection step
   */
  private async executePostInjectionStep(
    step: ServiceTemplate['postInjectionSteps'][0],
    context: InjectionContext
  ): Promise<void> {
    if (step.type === 'command' && step.command) {
      consola.info(`Executing: ${step.command}`);
      // Command execution would be handled by a separate service
      context.warnings.push(`Manual step required: ${step.description}`);
    } else {
      context.warnings.push(`Manual step required: ${step.description}`);
    }
  }

  /**
   * Generate service tests
   */
  private async generateServiceTests(
    service: ServiceConfiguration,
    template: ServiceTemplate,
    context: InjectionContext
  ): Promise<void> {
    // Implementation would generate test files based on service type
    consola.info(`Generating tests for ${service.serviceType}`);
    context.warnings.push('Test generation not yet implemented');
  }

  /**
   * Generate service documentation
   */
  private async generateServiceDocumentation(
    service: ServiceConfiguration,
    template: ServiceTemplate,
    context: InjectionContext
  ): Promise<void> {
    // Implementation would generate documentation files
    consola.info(`Generating documentation for ${service.serviceType}`);
    context.warnings.push('Documentation generation not yet implemented');
  }

  // Helper methods for AST operations
  
  private addImport(sourceFile: tsmorph.SourceFile, config: any): void {
    sourceFile.addImportDeclaration({
      moduleSpecifier: config.moduleSpecifier,
      namedImports: config.namedImports,
      defaultImport: config.defaultImport
    });
  }

  private addExport(sourceFile: tsmorph.SourceFile, config: any): void {
    if (config.namedExports) {
      sourceFile.addExportDeclaration({
        namedExports: config.namedExports,
        moduleSpecifier: config.moduleSpecifier
      });
    }
  }

  private addFunction(sourceFile: tsmorph.SourceFile, config: any, service: ServiceConfiguration): void {
    const functionDeclaration = sourceFile.addFunction({
      name: config.name,
      isExported: config.isExported || false,
      isAsync: config.isAsync || false,
      parameters: config.parameters || [],
      returnType: config.returnType,
      statements: config.statements || []
    });
  }

  private addClass(sourceFile: tsmorph.SourceFile, config: any, service: ServiceConfiguration): void {
    const classDeclaration = sourceFile.addClass({
      name: config.name,
      isExported: config.isExported || false,
      extends: config.extends,
      implements: config.implements || [],
      properties: config.properties || [],
      methods: config.methods || []
    });
  }

  private addInterface(sourceFile: tsmorph.SourceFile, config: any, service: ServiceConfiguration): void {
    const interfaceDeclaration = sourceFile.addInterface({
      name: config.name,
      isExported: config.isExported || false,
      extends: config.extends || [],
      properties: config.properties || []
    });
  }

  private modifyFunction(sourceFile: tsmorph.SourceFile, config: any, service: ServiceConfiguration): void {
    const functionDeclaration = sourceFile.getFunction(config.functionName);
    if (!functionDeclaration) {
      throw new Error(`Function ${config.functionName} not found`);
    }

    // Modify function based on config
    if (config.addParameter) {
      functionDeclaration.addParameter(config.addParameter);
    }

    if (config.addStatements) {
      functionDeclaration.addStatements(config.addStatements);
    }
  }

  // Helper methods for config updates

  private async updateYamlConfig(
    injectionPoint: ServiceInjectionPoint,
    service: ServiceConfiguration,
    context: InjectionContext,
    options: ServiceInjectionOptions
  ): Promise<void> {
    // YAML update implementation
    context.warnings.push('YAML config update not yet implemented');
  }

  private async updateTomlConfig(
    injectionPoint: ServiceInjectionPoint,
    service: ServiceConfiguration,
    context: InjectionContext,
    options: ServiceInjectionOptions
  ): Promise<void> {
    // TOML update implementation
    context.warnings.push('TOML config update not yet implemented');
  }

  private async updateEnvConfig(
    injectionPoint: ServiceInjectionPoint,
    service: ServiceConfiguration,
    context: InjectionContext,
    options: ServiceInjectionOptions
  ): Promise<void> {
    const targetPath = path.join(context.projectPath, injectionPoint.target);
    
    if (!(await fs.pathExists(targetPath))) {
      await fs.writeFile(targetPath, '');
    }

    const existingContent = await fs.readFile(targetPath, 'utf-8');
    const templateContent = await this.processTemplate(injectionPoint.template, {
      ...context.projectContext,
      service,
      config: service.configuration
    });

    if (options.dryRun) {
      consola.info(`[DRY RUN] Would update .env file: ${injectionPoint.target}`);
      return;
    }

    await fs.writeFile(targetPath, existingContent + '\n' + templateContent);
    context.modifiedFiles.add(injectionPoint.target);
  }

  /**
   * Deep merge objects
   */
  private deepMerge(target: any, source: any): any {
    const result = { ...target };

    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
          result[key] = this.deepMerge(result[key] || {}, source[key]);
        } else {
          result[key] = source[key];
        }
      }
    }

    return result;
  }
}

// Type for compiled Handlebars template
type CompiledTemplate = (context: any) => string;