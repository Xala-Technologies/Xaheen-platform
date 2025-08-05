/**
 * Generator Composer - Orchestrates complex generator workflows and compositions
 * Handles dependency resolution, parallel execution, and error handling
 */
import { EventEmitter } from 'events';
import { GeneratorRegistry } from './generator-registry';
import { 
  GeneratorComposition, 
  GeneratorRef, 
  ExecutionStrategy,
  ErrorHandlingStrategy,
  RollbackStrategy,
  MetaGeneratorOptions
} from './types';
import { BaseGenerator, GeneratorResult } from '../base.generator';
import chalk from 'chalk';

export interface CompositionExecutionContext {
  readonly variables: Record<string, any>;
  readonly results: Map<string, GeneratorResult>;
  readonly executionOrder: string[];
  readonly startTime: number;
  readonly rollbackActions: RollbackAction[];
}

export interface RollbackAction {
  readonly type: 'file-delete' | 'file-restore' | 'command-undo' | 'custom';
  readonly target: string;
  readonly data?: any;
  readonly undoCommand?: () => Promise<void>;
}

export interface CompositionResult {
  readonly success: boolean;
  readonly results: readonly GeneratorResult[];
  readonly executionTime: number;
  readonly executionOrder: readonly string[];
  readonly errors: readonly CompositionError[];
  readonly rollbackActions: readonly RollbackAction[];
}

export interface CompositionError {
  readonly generatorId: string;
  readonly error: Error;
  readonly step: number;
  readonly recoverable: boolean;
}

export class GeneratorComposer extends EventEmitter {
  private registry: GeneratorRegistry;
  private executionContext: CompositionExecutionContext | null = null;

  constructor(registry: GeneratorRegistry) {
    super();
    this.registry = registry;
  }

  /**
   * Execute a generator composition
   */
  async executeComposition(
    composition: GeneratorComposition,
    options: Partial<MetaGeneratorOptions> = {}
  ): Promise<CompositionResult> {
    const startTime = Date.now();
    
    this.logger.info(`🎼 Starting composition with ${composition.generators.length} generators`);
    this.logger.info(`📋 Execution strategy: ${chalk.cyan(composition.execution)}`);
    
    // Initialize execution context
    const context: CompositionExecutionContext = {
      variables: options.customOptions || {},
      results: new Map(),
      executionOrder: [],
      startTime,
      rollbackActions: []
    };
    
    this.executionContext = context;
    
    try {
      // Validate composition
      await this.validateComposition(composition);
      
      // Resolve dependencies
      const resolvedGenerators = await this.resolveCompositionDependencies(composition);
      
      // Execute based on strategy
      const results = await this.executeByStrategy(
        composition.execution,
        resolvedGenerators,
        context,
        composition
      );
      
      const executionTime = Date.now() - startTime;
      
      this.logger.success(`🎉 Composition completed in ${chalk.yellow(executionTime)}ms`);
      
      return {
        success: results.every(r => r.success),
        results,
        executionTime,
        executionOrder: context.executionOrder,
        errors: [],
        rollbackActions: context.rollbackActions
      };
      
    } catch (error: any) {
      this.logger.error(`❌ Composition failed: ${error.message}`);
      
      // Handle rollback if configured
      if (composition.rollback !== 'none') {
        await this.executeRollback(context, composition.rollback);
      }
      
      return {
        success: false,
        results: Array.from(context.results.values()),
        executionTime: Date.now() - startTime,
        executionOrder: context.executionOrder,
        errors: [{
          generatorId: 'composition',
          error,
          step: context.executionOrder.length,
          recoverable: false
        }],
        rollbackActions: context.rollbackActions
      };
    } finally {
      this.executionContext = null;
    }
  }

  /**
   * Execute generators based on strategy
   */
  private async executeByStrategy(
    strategy: ExecutionStrategy,
    generators: GeneratorRef[],
    context: CompositionExecutionContext,
    composition: GeneratorComposition
  ): Promise<GeneratorResult[]> {
    switch (strategy) {
      case 'sequential':
        return this.executeSequential(generators, context, composition);
      
      case 'parallel':
        return this.executeParallel(generators, context, composition);
      
      case 'conditional':
        return this.executeConditional(generators, context, composition);
      
      case 'pipeline':
        return this.executePipeline(generators, context, composition);
      
      default:
        throw new Error(`Unknown execution strategy: ${strategy}`);
    }
  }

  /**
   * Execute generators sequentially
   */
  private async executeSequential(
    generators: GeneratorRef[],
    context: CompositionExecutionContext,
    composition: GeneratorComposition
  ): Promise<GeneratorResult[]> {
    const results: GeneratorResult[] = [];
    
    // Sort by execution order
    const sortedGenerators = [...generators].sort((a, b) => a.order - b.order);
    
    for (const generatorRef of sortedGenerators) {
      try {
        // Check if generator should be skipped
        if (generatorRef.optional && !this.shouldExecuteGenerator(generatorRef, context)) {
          this.logger.info(`⏭️  Skipping optional generator: ${chalk.yellow(generatorRef.id)}`);
          continue;
        }
        
        this.logger.info(`▶️  Executing: ${chalk.cyan(generatorRef.id)}`);
        
        const result = await this.executeGenerator(generatorRef, context);
        results.push(result);
        
        context.results.set(generatorRef.id, result);
        context.executionOrder.push(generatorRef.id);
        
        // Add rollback actions
        if (result.files) {
          for (const file of result.files) {
            context.rollbackActions.push({
              type: 'file-delete',
              target: file
            });
          }
        }
        
        if (!result.success) {
          await this.handleExecutionError(generatorRef, result, composition.errorHandling, context);
        }
        
        this.emit('generator:completed', { generatorRef, result, context });
        
      } catch (error: any) {
        const errorResult: GeneratorResult = {
          success: false,
          message: `Generator ${generatorRef.id} failed: ${error.message}`,
          files: [],
          commands: []
        };
        
        results.push(errorResult);
        context.results.set(generatorRef.id, errorResult);
        
        await this.handleExecutionError(generatorRef, errorResult, composition.errorHandling, context);
      }
    }
    
    return results;
  }

  /**
   * Execute generators in parallel
   */
  private async executeParallel(
    generators: GeneratorRef[],
    context: CompositionExecutionContext,
    composition: GeneratorComposition
  ): Promise<GeneratorResult[]> {
    this.logger.info(`🚀 Executing ${generators.length} generators in parallel`);
    
    // Group generators by parallelism
    const parallelGroups = this.groupGeneratorsByParallelism(generators);
    const results: GeneratorResult[] = [];
    
    for (const group of parallelGroups) {
      const groupPromises = group.map(async (generatorRef) => {
        try {
          if (generatorRef.optional && !this.shouldExecuteGenerator(generatorRef, context)) {
            return {
              success: true,
              message: `Skipped optional generator: ${generatorRef.id}`,
              files: [],
              commands: []
            };
          }
          
          this.logger.info(`▶️  Executing: ${chalk.cyan(generatorRef.id)}`);
          
          const result = await this.executeGenerator(generatorRef, context);
          
          context.results.set(generatorRef.id, result);
          context.executionOrder.push(generatorRef.id);
          
          this.emit('generator:completed', { generatorRef, result, context });
          
          return result;
          
        } catch (error: any) {
          const errorResult: GeneratorResult = {
            success: false,
            message: `Generator ${generatorRef.id} failed: ${error.message}`,
            files: [],
            commands: []
          };
          
          context.results.set(generatorRef.id, errorResult);
          
          return errorResult;
        }
      });
      
      const groupResults = await Promise.all(groupPromises);
      results.push(...groupResults);
      
      // Check for failures and handle according to strategy
      const failures = groupResults.filter(r => !r.success);
      if (failures.length > 0 && composition.errorHandling === 'fail-fast') {
        throw new Error(`Parallel execution failed: ${failures.length} generators failed`);
      }
    }
    
    return results;
  }

  /**
   * Execute generators conditionally
   */
  private async executeConditional(
    generators: GeneratorRef[],
    context: CompositionExecutionContext,
    composition: GeneratorComposition
  ): Promise<GeneratorResult[]> {
    const results: GeneratorResult[] = [];
    
    for (const generatorRef of generators) {
      // Evaluate condition
      const shouldExecute = generatorRef.condition 
        ? this.evaluateCondition(generatorRef.condition, context)
        : true;
      
      if (!shouldExecute) {
        this.logger.info(`⏭️  Skipping ${chalk.yellow(generatorRef.id)} (condition not met)`);
        continue;
      }
      
      try {
        this.logger.info(`▶️  Executing: ${chalk.cyan(generatorRef.id)}`);
        
        const result = await this.executeGenerator(generatorRef, context);
        results.push(result);
        
        context.results.set(generatorRef.id, result);
        context.executionOrder.push(generatorRef.id);
        
        this.emit('generator:completed', { generatorRef, result, context });
        
      } catch (error: any) {
        const errorResult: GeneratorResult = {
          success: false,
          message: `Generator ${generatorRef.id} failed: ${error.message}`,
          files: [],
          commands: []
        };
        
        results.push(errorResult);
        context.results.set(generatorRef.id, errorResult);
        
        await this.handleExecutionError(generatorRef, errorResult, composition.errorHandling, context);
      }
    }
    
    return results;
  }

  /**
   * Execute generators as a pipeline
   */
  private async executePipeline(
    generators: GeneratorRef[],
    context: CompositionExecutionContext,
    composition: GeneratorComposition
  ): Promise<GeneratorResult[]> {
    const results: GeneratorResult[] = [];
    let pipelineData = context.variables;
    
    // Sort by execution order
    const sortedGenerators = [...generators].sort((a, b) => a.order - b.order);
    
    for (const generatorRef of sortedGenerators) {
      try {
        this.logger.info(`🔄 Pipeline step: ${chalk.cyan(generatorRef.id)}`);
        
        // Merge pipeline data with generator options
        const enhancedOptions = {
          ...generatorRef.options,
          ...pipelineData,
          _pipelineData: pipelineData
        };
        
        const result = await this.executeGenerator(
          { ...generatorRef, options: enhancedOptions },
          context
        );
        
        results.push(result);
        context.results.set(generatorRef.id, result);
        context.executionOrder.push(generatorRef.id);
        
        // Update pipeline data for next generator
        if (result.success && result.files) {
          pipelineData = {
            ...pipelineData,
            [`${generatorRef.id}_files`]: result.files,
            [`${generatorRef.id}_result`]: result
          };
        }
        
        if (!result.success && composition.errorHandling === 'fail-fast') {
          throw new Error(`Pipeline failed at step: ${generatorRef.id}`);
        }
        
        this.emit('generator:completed', { generatorRef, result, context });
        
      } catch (error: any) {
        const errorResult: GeneratorResult = {
          success: false,
          message: `Pipeline step ${generatorRef.id} failed: ${error.message}`,
          files: [],
          commands: []
        };
        
        results.push(errorResult);
        context.results.set(generatorRef.id, errorResult);
        
        if (composition.errorHandling === 'fail-fast') {
          throw error;
        }
      }
    }
    
    return results;
  }

  /**
   * Execute a single generator
   */
  private async executeGenerator(
    generatorRef: GeneratorRef,
    context: CompositionExecutionContext
  ): Promise<GeneratorResult> {
    const generator = await this.registry.loadGeneratorImplementation(generatorRef.id);
    
    // Merge context variables with generator options
    const options = {
      ...generatorRef.options,
      ...context.variables
    };
    
    // Execute generator
    const result = await generator.generate(options);
    
    return result;
  }

  /**
   * Handle execution error based on strategy
   */
  private async handleExecutionError(
    generatorRef: GeneratorRef,
    result: GeneratorResult,
    errorHandling: ErrorHandlingStrategy,
    context: CompositionExecutionContext
  ): Promise<void> {
    switch (errorHandling) {
      case 'fail-fast':
        throw new Error(`Generator ${generatorRef.id} failed: ${result.message}`);
      
      case 'continue':
        this.logger.warn(`⚠️  Generator ${generatorRef.id} failed, continuing: ${result.message}`);
        break;
      
      case 'rollback':
        this.logger.warn(`🔄 Generator ${generatorRef.id} failed, initiating rollback`);
        await this.executeRollback(context, 'full');
        throw new Error(`Generator ${generatorRef.id} failed, rollback completed`);
      
      case 'skip':
        this.logger.info(`⏭️  Skipping failed generator: ${generatorRef.id}`);
        break;
    }
  }

  /**
   * Execute rollback actions
   */
  private async executeRollback(
    context: CompositionExecutionContext,
    strategy: RollbackStrategy
  ): Promise<void> {
    if (strategy === 'none') return;

    this.logger.info(`🔄 Executing rollback strategy: ${chalk.yellow(strategy)}`);

    const actions = [...context.rollbackActions].reverse(); // Execute in reverse order

    for (const action of actions) {
      try {
        await this.executeRollbackAction(action);
        this.logger.info(`✅ Rollback action completed: ${action.type} - ${action.target}`);
      } catch (error: any) {
        this.logger.error(`❌ Rollback action failed: ${action.type} - ${action.target}: ${error.message}`);
      }
    }
  }

  /**
   * Execute a single rollback action
   */
  private async executeRollbackAction(action: RollbackAction): Promise<void> {
    const { promises: fs } = await import('fs');

    switch (action.type) {
      case 'file-delete':
        try {
          await fs.unlink(action.target);
        } catch (error: any) {
          if (error.code !== 'ENOENT') {
            throw error;
          }
        }
        break;

      case 'file-restore':
        if (action.data) {
          await fs.writeFile(action.target, action.data);
        }
        break;

      case 'command-undo':
        if (action.undoCommand) {
          await action.undoCommand();
        }
        break;

      case 'custom':
        if (action.undoCommand) {
          await action.undoCommand();
        }
        break;
    }
  }

  /**
   * Validate composition
   */
  private async validateComposition(composition: GeneratorComposition): Promise<void> {
    // Check for circular dependencies
    const dependencies = new Map<string, Set<string>>();
    
    for (const generatorRef of composition.generators) {
      const generatorEntry = await this.registry.getGenerator(generatorRef.id);
      if (generatorEntry) {
        const deps = new Set<string>();
        for (const dep of generatorEntry.metadata.dependencies) {
          deps.add(dep.id);
        }
        dependencies.set(generatorRef.id, deps);
      }
    }

    // Simple cycle detection
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (generatorId: string): void => {
      if (visited.has(generatorId)) return;
      if (visiting.has(generatorId)) {
        throw new Error(`Circular dependency detected involving: ${generatorId}`);
      }

      visiting.add(generatorId);
      
      const deps = dependencies.get(generatorId);
      if (deps) {
        for (const dep of deps) {
          visit(dep);
        }
      }

      visiting.delete(generatorId);
      visited.add(generatorId);
    };

    for (const generatorRef of composition.generators) {
      visit(generatorRef.id);
    }

    // Validate generator existence
    for (const generatorRef of composition.generators) {
      const exists = await this.registry.getGenerator(generatorRef.id, generatorRef.version);
      if (!exists) {
        throw new Error(`Generator not found: ${generatorRef.id}@${generatorRef.version || 'latest'}`);
      }
    }
  }

  /**
   * Resolve composition dependencies
   */
  private async resolveCompositionDependencies(
    composition: GeneratorComposition
  ): Promise<GeneratorRef[]> {
    const resolved: GeneratorRef[] = [];
    const processed = new Set<string>();

    for (const generatorRef of composition.generators) {
      if (processed.has(generatorRef.id)) continue;

      // Get dependencies for this generator
      const dependencies = await this.registry.resolveDependencies(generatorRef.id);
      
      // Add dependencies first
      for (const dep of dependencies) {
        if (!processed.has(dep.metadata.id)) {
          resolved.push({
            id: dep.metadata.id,
            version: dep.metadata.version,
            options: {},
            order: generatorRef.order - 1,
            parallel: false,
            optional: false
          });
          processed.add(dep.metadata.id);
        }
      }

      // Add the generator itself
      resolved.push(generatorRef);
      processed.add(generatorRef.id);
    }

    return resolved;
  }

  /**
   * Group generators by parallelism
   */
  private groupGeneratorsByParallelism(generators: GeneratorRef[]): GeneratorRef[][] {
    const groups: GeneratorRef[][] = [];
    const parallelGroup: GeneratorRef[] = [];
    const sequentialGenerators: GeneratorRef[] = [];

    for (const generator of generators) {
      if (generator.parallel) {
        parallelGroup.push(generator);
      } else {
        if (parallelGroup.length > 0) {
          groups.push([...parallelGroup]);
          parallelGroup.length = 0;
        }
        sequentialGenerators.push(generator);
      }
    }

    // Add remaining parallel generators
    if (parallelGroup.length > 0) {
      groups.push(parallelGroup);
    }

    // Add sequential generators as individual groups
    for (const generator of sequentialGenerators) {
      groups.push([generator]);
    }

    return groups;
  }

  /**
   * Check if generator should be executed
   */
  private shouldExecuteGenerator(
    generatorRef: GeneratorRef,
    context: CompositionExecutionContext
  ): boolean {
    if (generatorRef.condition) {
      return this.evaluateCondition(generatorRef.condition, context);
    }
    return true;
  }

  /**
   * Evaluate a condition expression
   */
  private evaluateCondition(
    condition: string,
    context: CompositionExecutionContext
  ): boolean {
    try {
      // Create safe evaluation context
      const evalContext = {
        ...context.variables,
        results: Object.fromEntries(context.results.entries())
      };

      // Simple condition evaluation - would use proper expression evaluator in production
      return new Function('context', `with(context) { return ${condition}; }`)(evalContext);
    } catch (error: any) {
      this.logger.warn(`⚠️  Condition evaluation failed: ${condition} - ${error.message}`);
      return false;
    }
  }

  /**
   * Logger interface
   */
  private logger = {
    info: (message: string, ...args: any[]) => console.log(`[INFO] ${message}`, ...args),
    success: (message: string, ...args: any[]) => console.log(`[SUCCESS] ${message}`, ...args),
    warn: (message: string, ...args: any[]) => console.warn(`[WARN] ${message}`, ...args),
    error: (message: string, error?: any) => {
      console.error(`[ERROR] ${message}`);
      if (error) console.error(error);
    }
  };
}