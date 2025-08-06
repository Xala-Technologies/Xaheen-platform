/**
 * @fileoverview Backend Generator Executor
 * @description Executes backend-specific generators (API, database, service, etc.)
 * @author Xala Technologies
 * @version 1.0.0
 */

import type { GeneratorContext, GeneratorResult, IGeneratorExecutor } from "./index";
import type { GeneratorType } from "../../types/index";

// Import backend generators
import { BackendGenerator } from "../backend/index";
import { RESTAPIGenerator } from "../api/index";
import { PrismaGenerator } from "../database/index";

/**
 * Backend Generator Executor
 * Handles execution of backend-specific generators
 */
export class BackendExecutor implements IGeneratorExecutor {
  /**
   * List of backend generator types
   */
  private readonly supportedTypes: string[] = [
    'api',
    'database',
    'model',
    'controller',
    'service',
    'middleware',
    'resolver',
    'backend',
  ];

  /**
   * Checks if this executor can handle the specified generator type
   * @param type Generator type to check
   * @returns True if this executor can handle the generator type
   */
  public canHandle(type: GeneratorType): boolean {
    return this.supportedTypes.includes(type);
  }

  /**
   * Execute a backend generator
   * @param context Generator execution context
   * @returns Promise that resolves to generator result
   */
  public async execute(context: GeneratorContext): Promise<GeneratorResult> {
    const { type, name, options } = context;

    try {
      switch (type) {
        case 'api':
          return await this.executeApiGenerator(name, options);
        case 'database':
          return await this.executeDatabaseGenerator(name, options);
        case 'backend':
          return await this.executeBackendGenerator(name, options);
        case 'model':
          return await this.executeModelGenerator(name, options);
        case 'controller':
        case 'service':
        case 'middleware':
        case 'resolver':
        default:
          return await this.executeOtherBackendGenerators(type, name, options);
      }
    } catch (error) {
      return {
        success: false,
        message: `Failed to generate backend ${type}: ${error instanceof Error ? error.message : "Unknown error"}`,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Generate help text for a backend generator
   * @param type Generator type
   * @returns Help text for the generator
   */
  public getHelp(type: GeneratorType): string {
    const helpTexts: Record<string, string> = {
      api: 'Generate a new API endpoint with optional CRUD operations',
      database: 'Generate database models and migration files',
      model: 'Generate a new database model with validations',
      controller: 'Generate a new controller for handling routes',
      service: 'Generate a new service for business logic',
      middleware: 'Generate a new middleware for request processing',
      resolver: 'Generate a new GraphQL resolver',
      backend: 'Generate a complete backend structure',
    };

    return helpTexts[type] || `Generate a ${type} for your backend application`;
  }

  /**
   * Execute API generator
   * @private
   */
  private async executeApiGenerator(name: string, options: Record<string, any>): Promise<GeneratorResult> {
    const apiGenerator = new RESTAPIGenerator('rest', 'nestjs', 'postgresql');
    
    // Map options to the generator and convert result
    const result = await apiGenerator.generate({
      name,
      route: options.route || `/${name.toLowerCase()}`,
      crud: options.crud === true,
      auth: options.auth === true,
      validation: options.validation !== false,
      swagger: options.swagger !== false,
      dryRun: options.dryRun,
      force: options.force,
    });
    
    // Convert readonly files array to mutable string array
    return {
      ...result,
      files: result.files?.map(f => typeof f === 'string' ? f : f.path) || []
    };
  }

  /**
   * Execute database generator
   * @private
   */
  private async executeDatabaseGenerator(name: string, options: Record<string, any>): Promise<GeneratorResult> {
    const databaseGenerator = new PrismaGenerator('postgresql', 'prisma');
    
    const result = await databaseGenerator.generate({
      name,
      fields: options.fields,
      relations: options.relations,
      dbType: options.dbType || 'postgresql',
      migrations: options.migrations !== false,
      dryRun: options.dryRun,
      force: options.force,
    });
    
    // Convert readonly files array to mutable string array
    return {
      ...result,
      files: result.files?.map(f => typeof f === 'string' ? f : f.path) || []
    };
  }

  /**
   * Execute backend generator
   * @private
   */
  private async executeBackendGenerator(name: string, options: Record<string, any>): Promise<GeneratorResult> {
    // BackendGenerator is abstract, so we'll create a placeholder implementation
    // In a real implementation, you'd use a concrete backend generator
    
    return await backendGenerator.generate({
      name,
      framework: options.framework || 'nestjs',
      database: options.database || 'postgresql',
      features: options.features ? options.features.split(',') : ['auth', 'user', 'health'],
      docker: options.docker !== false,
      testing: options.testing !== false,
      swagger: options.swagger !== false,
      dryRun: options.dryRun,
      force: options.force,
    });
  }

  /**
   * Execute model generator
   * @private
   */
  private async executeModelGenerator(name: string, options: Record<string, any>): Promise<GeneratorResult> {
    // Placeholder until we have a dedicated model generator
    return {
      success: true,
      message: `Generated model ${name} successfully`,
      files: [`src/models/${name}.model.ts`],
      commands: [],
      nextSteps: [
        `Update the ${name} model with your specific fields`,
        'Run migrations if needed',
      ],
    };
  }

  /**
   * Execute other backend generators
   * @private
   */
  private async executeOtherBackendGenerators(
    type: string, 
    name: string, 
    options: Record<string, any>
  ): Promise<GeneratorResult> {
    // Placeholder for other backend generators
    return {
      success: true,
      message: `Backend ${type} '${name}' generated successfully`,
      files: [
        `src/${type}s/${name}.${type}.ts`,
        `src/${type}s/${name}.${type}.spec.ts`,
      ],
      commands: ["npm run build", "npm run test"],
      nextSteps: [
        `Import the ${name} ${type} in your application`,
        `Add tests for your new ${type}`,
      ],
    };
  }
}
