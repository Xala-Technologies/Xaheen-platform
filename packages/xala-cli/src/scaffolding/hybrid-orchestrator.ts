/**
 * @fileoverview Hybrid Scaffolding Orchestrator
 * @description Coordinates all three tiers of the scaffolding architecture
 */

import { Tree, formatFiles } from '@nx/devkit';
import { createFsFromVolume, Volume } from 'memfs';
import { join, resolve } from 'path';
import { logger } from '../utils/logger.js';
import { createVirtualFS, VirtualFS } from './virtual-fs.js';
import { YeomanIntegration } from './tier1-yeoman-integration.js';
import { ASTTransformationEngine } from './tier2-ast-transformations.js';
import { HygenIntegration } from './tier3-hygen-integration.js';
import {
  ScaffoldingContext,
  GenerationResult,
  HybridScaffoldingOptions,
  OrchestrationOptions,
  TierDependency,
  ScaffoldingError,
  ScaffoldingService,
  VirtualFileSystem
} from './types.js';

export class HybridScaffoldingOrchestrator {
  private readonly virtualFs: VirtualFileSystem;
  private readonly tree: Tree;
  private readonly tier1: YeomanIntegration;
  private readonly tier2: ASTTransformationEngine;
  private readonly tier3: HygenIntegration;
  private readonly services: Map<string, ScaffoldingService> = new Map();

  constructor(projectPath: string) {
    this.virtualFs = createVirtualFS(projectPath);
    
    // Create Nx Tree from virtual filesystem
    const volume = new Volume();
    const fs = createFsFromVolume(volume);
    this.tree = Tree.read(fs as any);

    // Initialize tier integrations
    this.tier1 = new YeomanIntegration(this.virtualFs);
    this.tier2 = new ASTTransformationEngine(this.tree, this.virtualFs);
    this.tier3 = new HygenIntegration(projectPath, this.virtualFs);
  }

  // ===== MAIN ORCHESTRATION METHODS =====

  async orchestrate(
    context: ScaffoldingContext,
    options: HybridScaffoldingOptions
  ): Promise<GenerationResult> {
    logger.info('Starting hybrid scaffolding orchestration');

    const orchestrationOptions = options.orchestration || {
      strategy: 'sequential',
      rollbackOnError: true,
      continueOnWarning: true
    };

    try {
      // Register built-in generators and services
      await this.initializeServices();

      // Validate dependencies
      await this.validateDependencies(context, options);

      // Execute based on strategy
      const result = await this.executeStrategy(context, options, orchestrationOptions);

      // Commit changes if successful
      if (result.success) {
        await this.commitChanges();
        logger.success('Hybrid scaffolding completed successfully');
      } else if (orchestrationOptions.rollbackOnError) {
        await this.rollbackChanges();
        logger.error('Scaffolding failed, changes rolled back');
      }

      return result;
    } catch (error) {
      if (orchestrationOptions.rollbackOnError) {
        await this.rollbackChanges();
      }
      
      throw new ScaffoldingError(
        `Orchestration failed: ${error instanceof Error ? error.message : String(error)}`,
        'ORCHESTRATION_FAILED',
        undefined,
        context
      );
    }
  }

  async generateProject(
    context: ScaffoldingContext,
    options: HybridScaffoldingOptions = {}
  ): Promise<GenerationResult> {
    logger.info(`Generating project with hybrid architecture: ${context.projectName}`);

    const defaultOptions: HybridScaffoldingOptions = {
      tier1: {
        skipInstall: context.dryRun,
        gitInit: true
      },
      tier2: {
        transformations: [],
        imports: [],
        interfaces: [],
        routes: []
      },
      tier3: {
        generatorName: 'component',
        dryRun: context.dryRun
      },
      orchestration: {
        strategy: 'sequential',
        rollbackOnError: true,
        continueOnWarning: true
      }
    };

    const mergedOptions = this.mergeOptions(defaultOptions, options);
    return await this.orchestrate(context, mergedOptions);
  }

  // ===== TIER EXECUTION =====

  async executeTier1(
    context: ScaffoldingContext,
    options: HybridScaffoldingOptions
  ): Promise<GenerationResult> {
    if (!options.tier1) {
      return { success: true, files: [], errors: [], warnings: [] };
    }

    logger.info('Executing Tier 1: Global Project Scaffolding');

    try {
      // Register built-in generators
      await this.tier1.registerBuiltinGenerators();

      // Generate project structure
      const result = await this.tier1.generateProject(context, options.tier1);
      
      logger.info(`Tier 1 completed: ${result.files.length} files generated`);
      return result;
    } catch (error) {
      return {
        success: false,
        files: [],
        errors: [error instanceof Error ? error.message : String(error)],
        warnings: []
      };
    }
  }

  async executeTier2(
    context: ScaffoldingContext,
    options: HybridScaffoldingOptions
  ): Promise<GenerationResult> {
    if (!options.tier2) {
      return { success: true, files: [], errors: [], warnings: [] };
    }

    logger.info('Executing Tier 2: TypeScript Code Manipulation');

    try {
      const results: GenerationResult[] = [];

      // Apply transformations
      if (options.tier2.transformations && options.tier2.transformations.length > 0) {
        const transformResult = await this.tier2.transformFiles(context, options.tier2.transformations);
        results.push(transformResult);
      }

      // Add imports
      if (options.tier2.imports && options.tier2.imports.length > 0) {
        for (const importStmt of options.tier2.imports) {
          try {
            await this.tier2.addImports('src/index.ts', [importStmt]);
          } catch (error) {
            logger.warn(`Failed to add import: ${error}`);
          }
        }
      }

      // Generate interfaces
      if (options.tier2.interfaces && options.tier2.interfaces.length > 0) {
        try {
          await this.tier2.generateInterfaces('src/types.ts', options.tier2.interfaces);
        } catch (error) {
          logger.warn(`Failed to generate interfaces: ${error}`);
        }
      }

      // Register routes
      if (options.tier2.routes && options.tier2.routes.length > 0) {
        try {
          await this.tier2.registerRoutes('src/router.ts', options.tier2.routes);
        } catch (error) {
          logger.warn(`Failed to register routes: ${error}`);
        }
      }

      // Perform refactoring
      if (options.tier2.refactoring && options.tier2.refactoring.length > 0) {
        const refactorResult = await this.tier2.performRefactoring(context, options.tier2.refactoring);
        results.push(refactorResult);
      }

      // Combine results
      const combinedResult = this.combineResults(results);
      logger.info(`Tier 2 completed: ${combinedResult.files.length} files processed`);
      
      return combinedResult;
    } catch (error) {
      return {
        success: false,
        files: [],
        errors: [error instanceof Error ? error.message : String(error)],
        warnings: []
      };
    }
  }

  async executeTier3(
    context: ScaffoldingContext,
    options: HybridScaffoldingOptions
  ): Promise<GenerationResult> {
    if (!options.tier3) {
      return { success: true, files: [], errors: [], warnings: [] };
    }

    logger.info('Executing Tier 3: Project-Local Generators');

    try {
      // Initialize local generators if not exists
      const generators = await this.tier3.listGenerators();
      if (generators.length === 0) {
        await this.tier3.initializeLocalGenerators();
      }

      // Generate using local generators
      const result = await this.tier3.generate(context, options.tier3);
      
      // Sync with virtual filesystem
      await this.tier3.syncWithVirtualFS();
      
      logger.info(`Tier 3 completed: ${result.files.length} files generated`);
      return result;
    } catch (error) {
      return {
        success: false,
        files: [],
        errors: [error instanceof Error ? error.message : String(error)],
        warnings: []
      };
    }
  }

  // ===== SERVICE MANAGEMENT =====

  registerService(service: ScaffoldingService): void {
    this.services.set(service.name, service);
    logger.debug(`Registered scaffolding service: ${service.name} (Tier ${service.tier})`);
  }

  async executeService(
    serviceName: string,
    context: ScaffoldingContext,
    options: unknown
  ): Promise<GenerationResult> {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new ScaffoldingError(
        `Service '${serviceName}' not found`,
        'SERVICE_NOT_FOUND'
      );
    }

    logger.info(`Executing service: ${serviceName} (Tier ${service.tier})`);

    try {
      // Validate service options
      const validationErrors = await service.validate(context, options);
      if (validationErrors.length > 0) {
        return {
          success: false,
          files: [],
          errors: validationErrors,
          warnings: []
        };
      }

      // Execute service
      const result = await service.generate(context, options);
      logger.info(`Service '${serviceName}' completed successfully`);
      
      return result;
    } catch (error) {
      return {
        success: false,
        files: [],
        errors: [error instanceof Error ? error.message : String(error)],
        warnings: []
      };
    }
  }

  // ===== STRATEGY EXECUTION =====

  private async executeStrategy(
    context: ScaffoldingContext,
    options: HybridScaffoldingOptions,
    orchestrationOptions: OrchestrationOptions
  ): Promise<GenerationResult> {
    switch (orchestrationOptions.strategy) {
      case 'sequential':
        return await this.executeSequentialStrategy(context, options);
      case 'parallel':
        return await this.executeParallelStrategy(context, options);
      case 'dependent':
        return await this.executeDependentStrategy(context, options, orchestrationOptions.dependencies || []);
      default:
        throw new ScaffoldingError(
          `Unknown orchestration strategy: ${orchestrationOptions.strategy}`,
          'UNKNOWN_STRATEGY'
        );
    }
  }

  private async executeSequentialStrategy(
    context: ScaffoldingContext,
    options: HybridScaffoldingOptions
  ): Promise<GenerationResult> {
    const results: GenerationResult[] = [];

    // Execute Tier 1
    const tier1Result = await this.executeTier1(context, options);
    results.push(tier1Result);

    if (!tier1Result.success) {
      return this.combineResults(results);
    }

    // Execute Tier 2
    const tier2Result = await this.executeTier2(context, options);
    results.push(tier2Result);

    if (!tier2Result.success) {
      return this.combineResults(results);
    }

    // Execute Tier 3
    const tier3Result = await this.executeTier3(context, options);
    results.push(tier3Result);

    return this.combineResults(results);
  }

  private async executeParallelStrategy(
    context: ScaffoldingContext,
    options: HybridScaffoldingOptions
  ): Promise<GenerationResult> {
    const promises = [
      this.executeTier1(context, options),
      this.executeTier2(context, options),
      this.executeTier3(context, options)
    ];

    const results = await Promise.all(promises);
    return this.combineResults(results);
  }

  private async executeDependentStrategy(
    context: ScaffoldingContext,
    options: HybridScaffoldingOptions,
    dependencies: readonly TierDependency[]
  ): Promise<GenerationResult> {
    const results: GenerationResult[] = [];
    const completed = new Set<number>();

    // Create execution order based on dependencies
    const executionOrder = this.calculateExecutionOrder(dependencies);

    for (const tier of executionOrder) {
      let result: GenerationResult;

      switch (tier) {
        case 1:
          result = await this.executeTier1(context, options);
          break;
        case 2:
          result = await this.executeTier2(context, options);
          break;
        case 3:
          result = await this.executeTier3(context, options);
          break;
        default:
          continue;
      }

      results.push(result);
      completed.add(tier);

      // Stop execution if tier failed and rollback is enabled
      if (!result.success) {
        break;
      }
    }

    return this.combineResults(results);
  }

  // ===== HELPER METHODS =====

  private async initializeServices(): Promise<void> {
    // Register built-in services - this could be extended
    logger.debug('Initializing scaffolding services');
  }

  private async validateDependencies(
    context: ScaffoldingContext,
    options: HybridScaffoldingOptions
  ): Promise<void> {
    // Validate that required dependencies are available
    if (options.tier1 && !options.tier1.templatePath) {
      // Check if built-in templates exist
    }

    if (options.tier2 && options.tier2.transformations) {
      // Validate transformation configurations
    }

    if (options.tier3 && options.tier3.generatorName) {
      // Check if generator exists
      const generators = await this.tier3.listGenerators();
      if (generators.length === 0 && !context.dryRun) {
        logger.warn('No local generators found, will initialize defaults');
      }
    }
  }

  private mergeOptions(
    defaults: HybridScaffoldingOptions,
    overrides: HybridScaffoldingOptions
  ): HybridScaffoldingOptions {
    return {
      tier1: { ...defaults.tier1, ...overrides.tier1 },
      tier2: { ...defaults.tier2, ...overrides.tier2 },
      tier3: { ...defaults.tier3, ...overrides.tier3 },
      orchestration: { ...defaults.orchestration, ...overrides.orchestration }
    };
  }

  private combineResults(results: readonly GenerationResult[]): GenerationResult {
    const allFiles = results.flatMap(r => r.files);
    const allErrors = results.flatMap(r => r.errors);
    const allWarnings = results.flatMap(r => r.warnings);

    return {
      success: allErrors.length === 0,
      files: [...new Set(allFiles)], // Remove duplicates
      errors: allErrors,
      warnings: allWarnings
    };
  }

  private calculateExecutionOrder(dependencies: readonly TierDependency[]): number[] {
    // Simple topological sort for execution order
    const order: number[] = [];
    const visited = new Set<number>();
    const visiting = new Set<number>();

    const visit = (tier: number) => {
      if (visiting.has(tier)) {
        throw new ScaffoldingError('Circular dependency detected', 'CIRCULAR_DEPENDENCY');
      }
      
      if (visited.has(tier)) {
        return;
      }

      visiting.add(tier);

      // Visit dependencies first
      for (const dep of dependencies) {
        if (dep.to === tier) {
          visit(dep.from);
        }
      }

      visiting.delete(tier);
      visited.add(tier);
      order.push(tier);
    };

    // Visit all tiers
    [1, 2, 3].forEach(tier => {
      if (!visited.has(tier)) {
        visit(tier);
      }
    });

    return order;
  }

  private async commitChanges(): Promise<void> {
    logger.info('Committing virtual filesystem changes');
    
    try {
      await this.virtualFs.commit();
      await formatFiles(this.tree);
      logger.success('All changes committed successfully');
    } catch (error) {
      throw new ScaffoldingError(
        `Failed to commit changes: ${error instanceof Error ? error.message : String(error)}`,
        'COMMIT_FAILED'
      );
    }
  }

  private async rollbackChanges(): Promise<void> {
    logger.warn('Rolling back virtual filesystem changes');
    
    try {
      this.virtualFs.rollback();
      logger.info('Rollback completed successfully');
    } catch (error) {
      logger.error(`Rollback failed: ${error}`);
    }
  }

  // ===== PUBLIC API METHODS =====

  async previewChanges(
    context: ScaffoldingContext,
    options: HybridScaffoldingOptions
  ): Promise<readonly string[]> {
    const dryRunContext = { ...context, dryRun: true };
    const result = await this.orchestrate(dryRunContext, options);
    
    return await this.virtualFs.getDiff();
  }

  async validateConfiguration(
    context: ScaffoldingContext,
    options: HybridScaffoldingOptions
  ): Promise<readonly string[]> {
    const errors: string[] = [];

    try {
      await this.validateDependencies(context, options);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }

    return errors;
  }

  getVirtualFileSystem(): VirtualFileSystem {
    return this.virtualFs;
  }

  getTier1Integration(): YeomanIntegration {
    return this.tier1;
  }

  getTier2Integration(): ASTTransformationEngine {
    return this.tier2;
  }

  getTier3Integration(): HygenIntegration {
    return this.tier3;
  }
}