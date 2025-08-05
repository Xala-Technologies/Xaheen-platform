/**
 * Advanced Generator Features - Conditional generation, batch processing, and debugging tools
 * Provides sophisticated generation capabilities and developer experience enhancements
 */
import { EventEmitter } from 'events';
import { promises as fs } from 'fs';
import path from 'path';
import {
  GeneratorRegistryEntry,
  GeneratorRef,
  GeneratorComposition,
  MetaGeneratorOptions
} from './types';
import { GeneratorRegistry } from './generator-registry';
import { GeneratorComposer } from './generator-composer';
import { BaseGenerator, GeneratorResult } from '../base.generator';
import chalk from 'chalk';

export interface ConditionalGenerationOptions {
  readonly conditions: readonly GenerationCondition[];
  readonly defaultBehavior: 'skip' | 'error' | 'warn';
  readonly evaluationContext: Record<string, any>;
}

export interface GenerationCondition {
  readonly id: string;
  readonly expression: string;
  readonly description: string;
  readonly action: 'include' | 'exclude' | 'modify';
  readonly parameters?: Record<string, any>;
}

export interface BatchGenerationOptions {
  readonly targets: readonly BatchTarget[];
  readonly parallelism: number;
  readonly failureStrategy: 'continue' | 'stop' | 'rollback';
  readonly progressCallback?: (progress: BatchProgress) => void;
  readonly dryRun?: boolean;
}

export interface BatchTarget {
  readonly generatorId: string;
  readonly options: Record<string, any>;
  readonly outputPath?: string;
  readonly name?: string;
  readonly dependencies?: readonly string[];
}

export interface BatchProgress {
  readonly total: number;
  readonly completed: number;
  readonly failed: number;
  readonly current?: string;
  readonly stage: 'preparing' | 'executing' | 'finalizing' | 'completed';
  readonly startTime: Date;
  readonly estimatedCompletion?: Date;
}

export interface BatchResult {
  readonly success: boolean;
  readonly results: readonly BatchTargetResult[];
  readonly totalTime: number;
  readonly summary: BatchSummary;
}

export interface BatchTargetResult {
  readonly target: BatchTarget;
  readonly success: boolean;
  readonly result?: GeneratorResult;
  readonly error?: string;
  readonly executionTime: number;
}

export interface BatchSummary {
  readonly totalTargets: number;
  readonly successful: number;
  readonly failed: number;
  readonly skipped: number;
  readonly averageExecutionTime: number;
  readonly totalFilesGenerated: number;
}

export interface DebuggerOptions {
  readonly enabled: boolean;
  readonly breakpoints: readonly Breakpoint[];
  readonly logLevel: 'trace' | 'debug' | 'info' | 'warn' | 'error';
  readonly captureVariables: boolean;
  readonly captureTemplateContext: boolean;
  readonly outputDebugInfo: boolean;
}

export interface Breakpoint {
  readonly id: string;
  readonly type: 'template' | 'generator' | 'condition' | 'error';
  readonly location: string;
  readonly condition?: string;
  readonly actions: readonly BreakpointAction[];
}

export interface BreakpointAction {
  readonly type: 'log' | 'inspect' | 'modify' | 'stop';
  readonly parameters: Record<string, any>;
}

export interface DebugSession {
  readonly id: string;
  readonly generatorId: string;
  readonly startTime: Date;
  readonly state: 'running' | 'paused' | 'stopped' | 'error';
  readonly currentLocation?: string;
  readonly variables: Record<string, any>;
  readonly callStack: readonly DebugFrame[];
  readonly logs: readonly DebugLog[];
}

export interface DebugFrame {
  readonly function: string;
  readonly location: string;
  readonly variables: Record<string, any>;
  readonly templateContext?: Record<string, any>;
}

export interface DebugLog {
  readonly timestamp: Date;
  readonly level: string;
  readonly message: string;
  readonly location?: string;
  readonly data?: any;
}

export interface TemplateInspector {
  readonly variables: Record<string, any>;
  readonly partials: readonly string[];
  readonly helpers: readonly string[];
  readonly syntax: TemplateSyntaxInfo;
  readonly performance: TemplatePerformanceInfo;
}

export interface TemplateSyntaxInfo {
  readonly valid: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
  readonly complexity: number;
  readonly depth: number;
}

export interface TemplatePerformanceInfo {
  readonly renderTime: number;
  readonly memoryUsage: number;
  readonly cacheable: boolean;
  readonly optimizationSuggestions: readonly string[];
}

export class AdvancedGeneratorFeatures extends EventEmitter {
  private registry: GeneratorRegistry;
  private composer: GeneratorComposer;
  private debugSessions = new Map<string, DebugSession>();
  private templateInspectors = new Map<string, TemplateInspector>();

  constructor(registry: GeneratorRegistry, composer: GeneratorComposer) {
    super();
    this.registry = registry;
    this.composer = composer;
  }

  /**
   * Execute conditional generation
   */
  async executeConditionalGeneration(
    generatorId: string,
    baseOptions: Record<string, any>,
    conditionalOptions: ConditionalGenerationOptions
  ): Promise<GeneratorResult> {
    console.log(`🔀 Executing conditional generation: ${chalk.cyan(generatorId)}`);

    try {
      // Evaluate all conditions
      const evaluatedConditions = await this.evaluateConditions(
        conditionalOptions.conditions,
        conditionalOptions.evaluationContext
      );

      // Determine which conditions are met
      const metConditions = evaluatedConditions.filter(c => c.result);
      const failedConditions = evaluatedConditions.filter(c => !c.result);

      console.log(`   Met conditions: ${chalk.green(metConditions.length)}`);
      console.log(`   Failed conditions: ${chalk.yellow(failedConditions.length)}`);

      // Apply condition actions
      let finalOptions = { ...baseOptions };
      let shouldSkip = false;

      for (const condition of metConditions) {
        const original = conditionalOptions.conditions.find(c => c.id === condition.id);
        if (original) {
          switch (original.action) {
            case 'include':
              // Include additional parameters
              if (original.parameters) {
                finalOptions = { ...finalOptions, ...original.parameters };
              }
              break;
            case 'exclude':
              // Remove parameters or skip generation
              if (original.parameters) {
                for (const key of Object.keys(original.parameters)) {
                  delete finalOptions[key];
                }
              } else {
                shouldSkip = true;
              }
              break;
            case 'modify':
              // Modify existing parameters
              if (original.parameters) {
                for (const [key, value] of Object.entries(original.parameters)) {
                  if (typeof value === 'object' && finalOptions[key]) {
                    finalOptions[key] = { ...finalOptions[key], ...value };
                  } else {
                    finalOptions[key] = value;
                  }
                }
              }
              break;
          }
        }
      }

      // Handle failed conditions
      if (failedConditions.length > 0) {
        switch (conditionalOptions.defaultBehavior) {
          case 'skip':
            shouldSkip = true;
            break;
          case 'error':
            throw new Error(`Conditional generation failed: ${failedConditions.map(c => c.id).join(', ')}`);
          case 'warn':
            console.warn(`⚠️  Some conditions failed: ${failedConditions.map(c => c.id).join(', ')}`);
            break;
        }
      }

      if (shouldSkip) {
        console.log(`⏭️  Skipping generation due to conditions`);
        return {
          success: true,
          message: 'Generation skipped due to conditions',
          files: [],
          commands: []
        };
      }

      // Execute generator with final options
      const generator = await this.registry.loadGeneratorImplementation(generatorId);
      const result = await generator.generate(finalOptions);

      this.emit('conditional:generated', {
        generatorId,
        conditions: evaluatedConditions,
        result
      });

      return result;

    } catch (error: any) {
      console.error(`❌ Conditional generation failed: ${error.message}`);
      
      return {
        success: false,
        message: `Conditional generation failed: ${error.message}`,
        files: [],
        commands: []
      };
    }
  }

  /**
   * Execute batch generation
   */
  async executeBatchGeneration(options: BatchGenerationOptions): Promise<BatchResult> {
    console.log(`🔄 Starting batch generation: ${chalk.cyan(options.targets.length)} targets`);

    const startTime = Date.now();
    const progress: BatchProgress = {
      total: options.targets.length,
      completed: 0,
      failed: 0,
      stage: 'preparing',
      startTime: new Date()
    };

    const results: BatchTargetResult[] = [];

    try {
      // Update progress
      progress.stage = 'executing';
      options.progressCallback?.(progress);

      // Group targets by dependencies
      const dependencyGroups = this.groupTargetsByDependencies(options.targets);
      
      // Execute groups in order
      for (const group of dependencyGroups) {
        const groupPromises = group.map(async (target) => {
          const targetStartTime = Date.now();
          
          try {
            // Update progress
            progress.current = target.name || target.generatorId;
            options.progressCallback?.(progress);

            if (options.dryRun) {
              // Simulate execution for dry run
              await new Promise(resolve => setTimeout(resolve, 100));
              
              const result: BatchTargetResult = {
                target,
                success: true,
                result: {
                  success: true,
                  message: `[DRY RUN] Would generate ${target.generatorId}`,
                  files: [`${target.outputPath || 'output'}/generated-file.ts`],
                  commands: []
                },
                executionTime: Date.now() - targetStartTime
              };

              progress.completed++;
              return result;
            }

            // Execute actual generation
            const generator = await this.registry.loadGeneratorImplementation(target.generatorId);
            const generationResult = await generator.generate(target.options);

            const result: BatchTargetResult = {
              target,
              success: generationResult.success,
              result: generationResult,
              executionTime: Date.now() - targetStartTime
            };

            if (generationResult.success) {
              progress.completed++;
              console.log(`   ✅ ${target.name || target.generatorId} completed`);
            } else {
              progress.failed++;
              console.log(`   ❌ ${target.name || target.generatorId} failed`);
            }

            options.progressCallback?.(progress);
            return result;

          } catch (error: any) {
            progress.failed++;
            
            const result: BatchTargetResult = {
              target,
              success: false,
              error: error.message,
              executionTime: Date.now() - targetStartTime
            };

            console.log(`   ❌ ${target.name || target.generatorId} failed: ${error.message}`);
            
            // Handle failure strategy
            if (options.failureStrategy === 'stop') {
              throw error;
            } else if (options.failureStrategy === 'rollback') {
              console.log(`🔄 Rolling back due to failure...`);
              // Would implement rollback logic here
            }

            options.progressCallback?.(progress);
            return result;
          }
        });

        // Execute group with limited parallelism
        const groupResults = await this.executeWithConcurrency(groupPromises, options.parallelism);
        results.push(...groupResults);
      }

      // Finalize
      progress.stage = 'finalizing';
      options.progressCallback?.(progress);

      const totalTime = Date.now() - startTime;
      progress.stage = 'completed';
      
      // Calculate summary
      const summary: BatchSummary = {
        totalTargets: options.targets.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        skipped: 0,
        averageExecutionTime: results.reduce((sum, r) => sum + r.executionTime, 0) / results.length,
        totalFilesGenerated: results
          .filter(r => r.result?.files)
          .reduce((sum, r) => sum + (r.result?.files.length || 0), 0)
      };

      const batchResult: BatchResult = {
        success: summary.failed === 0,
        results,
        totalTime,
        summary
      };

      // Log summary
      this.logBatchSummary(batchResult);

      // Update final progress
      progress.estimatedCompletion = new Date();
      options.progressCallback?.(progress);

      this.emit('batch:completed', batchResult);

      return batchResult;

    } catch (error: any) {
      console.error(`❌ Batch generation failed: ${error.message}`);
      
      const summary: BatchSummary = {
        totalTargets: options.targets.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length + 1,
        skipped: options.targets.length - results.length - 1,
        averageExecutionTime: 0,
        totalFilesGenerated: 0
      };

      return {
        success: false,
        results,
        totalTime: Date.now() - startTime,
        summary
      };
    }
  }

  /**
   * Start debug session
   */
  async startDebugSession(
    generatorId: string,
    options: Record<string, any>,
    debugOptions: DebuggerOptions
  ): Promise<DebugSession> {
    const sessionId = `debug-${generatorId}-${Date.now()}`;
    
    const session: DebugSession = {
      id: sessionId,
      generatorId,
      startTime: new Date(),
      state: 'running',
      variables: { ...options },
      callStack: [],
      logs: []
    };

    this.debugSessions.set(sessionId, session);

    console.log(`🐛 Starting debug session: ${chalk.cyan(sessionId)}`);

    try {
      // Set up debugging instrumentation
      if (debugOptions.enabled) {
        await this.setupDebugInstrumentation(session, debugOptions);
      }

      // Execute generator with debugging
      const generator = await this.registry.loadGeneratorImplementation(generatorId);
      
      // Instrument the generator for debugging
      const instrumentedGenerator = this.instrumentGeneratorForDebugging(
        generator,
        session,
        debugOptions
      );

      // Start execution
      session.state = 'running';
      this.emit('debug:session-started', session);

      return session;

    } catch (error: any) {
      session.state = 'error';
      session.logs.push({
        timestamp: new Date(),
        level: 'error',
        message: `Debug session failed to start: ${error.message}`,
        data: { error: error.message }
      });

      console.error(`❌ Debug session failed: ${error.message}`);
      return session;
    }
  }

  /**
   * Inspect template
   */
  async inspectTemplate(templatePath: string): Promise<TemplateInspector> {
    console.log(`🔍 Inspecting template: ${chalk.cyan(templatePath)}`);

    try {
      const content = await fs.readFile(templatePath, 'utf-8');
      const startTime = Date.now();
      
      // Parse template
      const Handlebars = (await import('handlebars')).default;
      
      let syntaxInfo: TemplateSyntaxInfo;
      try {
        const ast = Handlebars.parse(content);
        syntaxInfo = {
          valid: true,
          errors: [],
          warnings: [],
          complexity: this.calculateTemplateComplexity(ast),
          depth: this.calculateTemplateDepth(ast)
        };
      } catch (error: any) {
        syntaxInfo = {
          valid: false,
          errors: [error.message],
          warnings: [],
          complexity: 0,
          depth: 0
        };
      }

      // Extract variables, partials, and helpers
      const variables = this.extractTemplateVariables(content);
      const partials = this.extractTemplatePartials(content);
      const helpers = this.extractTemplateHelpers(content);

      // Performance analysis
      const renderTime = Date.now() - startTime;
      const memoryUsage = process.memoryUsage().heapUsed;
      
      const performanceInfo: TemplatePerformanceInfo = {
        renderTime,
        memoryUsage,
        cacheable: this.isTemplateCacheable(content),
        optimizationSuggestions: this.generateOptimizationSuggestions(content, syntaxInfo)
      };

      const inspector: TemplateInspector = {
        variables,
        partials,
        helpers,
        syntax: syntaxInfo,
        performance: performanceInfo
      };

      this.templateInspectors.set(templatePath, inspector);

      // Log inspection results
      this.logTemplateInspection(templatePath, inspector);

      return inspector;

    } catch (error: any) {
      console.error(`❌ Template inspection failed: ${error.message}`);
      
      return {
        variables: {},
        partials: [],
        helpers: [],
        syntax: {
          valid: false,
          errors: [error.message],
          warnings: [],
          complexity: 0,
          depth: 0
        },
        performance: {
          renderTime: 0,
          memoryUsage: 0,
          cacheable: false,
          optimizationSuggestions: []
        }
      };
    }
  }

  /**
   * Private helper methods
   */
  private async evaluateConditions(
    conditions: readonly GenerationCondition[],
    context: Record<string, any>
  ): Promise<Array<{ id: string; result: boolean; error?: string }>> {
    const results = [];

    for (const condition of conditions) {
      try {
        // Simple expression evaluation - would use proper expression evaluator in production
        const result = new Function('context', `with(context) { return ${condition.expression}; }`)(context);
        results.push({ id: condition.id, result: Boolean(result) });
      } catch (error: any) {
        results.push({ id: condition.id, result: false, error: error.message });
      }
    }

    return results;
  }

  private groupTargetsByDependencies(targets: readonly BatchTarget[]): BatchTarget[][] {
    const groups: BatchTarget[][] = [];
    const processed = new Set<string>();
    const targetMap = new Map(targets.map(t => [t.generatorId, t]));

    const processTarget = (target: BatchTarget, currentGroup: BatchTarget[]) => {
      if (processed.has(target.generatorId)) return;

      // Process dependencies first
      if (target.dependencies) {
        for (const depId of target.dependencies) {
          const depTarget = targetMap.get(depId);
          if (depTarget && !processed.has(depId)) {
            processTarget(depTarget, currentGroup);
          }
        }
      }

      currentGroup.push(target);
      processed.add(target.generatorId);
    };

    for (const target of targets) {
      if (!processed.has(target.generatorId)) {
        const group: BatchTarget[] = [];
        processTarget(target, group);
        if (group.length > 0) {
          groups.push(group);
        }
      }
    }

    return groups;
  }

  private async executeWithConcurrency<T>(
    promises: Promise<T>[],
    concurrency: number
  ): Promise<T[]> {
    const results: T[] = [];
    const executing: Promise<void>[] = [];

    for (const promise of promises) {
      const executePromise = promise.then(result => {
        results.push(result);
      });

      executing.push(executePromise);

      if (executing.length >= concurrency) {
        await Promise.race(executing);
        executing.splice(executing.findIndex(p => p), 1);
      }
    }

    await Promise.all(executing);
    return results;
  }

  private async setupDebugInstrumentation(
    session: DebugSession,
    options: DebuggerOptions
  ): Promise<void> {
    // Set up breakpoints
    for (const breakpoint of options.breakpoints) {
      session.logs.push({
        timestamp: new Date(),
        level: 'debug',
        message: `Breakpoint set: ${breakpoint.type} at ${breakpoint.location}`,
        data: { breakpoint }
      });
    }
  }

  private instrumentGeneratorForDebugging(
    generator: BaseGenerator,
    session: DebugSession,
    options: DebuggerOptions
  ): BaseGenerator {
    // Create debugging wrapper
    const originalGenerate = generator.generate.bind(generator);
    
    generator.generate = async (opts: any) => {
      session.logs.push({
        timestamp: new Date(),
        level: 'info',
        message: 'Generator execution started',
        data: { options: opts }
      });

      try {
        const result = await originalGenerate(opts);
        
        session.logs.push({
          timestamp: new Date(),
          level: 'info',
          message: 'Generator execution completed',
          data: { result }
        });

        return result;
      } catch (error: any) {
        session.state = 'error';
        session.logs.push({
          timestamp: new Date(),
          level: 'error',
          message: `Generator execution failed: ${error.message}`,
          data: { error: error.message }
        });
        throw error;
      }
    };

    return generator;
  }

  private calculateTemplateComplexity(ast: any): number {
    // Simplified complexity calculation
    let complexity = 0;
    
    const visit = (node: any) => {
      if (node.type === 'BlockStatement') {
        complexity += 2;
      } else if (node.type === 'IfStatement') {
        complexity += 3;
      } else if (node.type === 'EachStatement') {
        complexity += 3;
      } else if (node.type === 'WithStatement') {
        complexity += 2;
      }

      if (node.program) visit(node.program);
      if (node.inverse) visit(node.inverse);
      if (node.body) {
        for (const child of node.body) {
          visit(child);
        }
      }
    };

    visit(ast);
    return complexity;
  }

  private calculateTemplateDepth(ast: any): number {
    let maxDepth = 0;
    
    const visit = (node: any, depth: number) => {
      maxDepth = Math.max(maxDepth, depth);
      
      if (node.program) visit(node.program, depth + 1);
      if (node.inverse) visit(node.inverse, depth + 1);
      if (node.body) {
        for (const child of node.body) {
          visit(child, depth + 1);
        }
      }
    };

    visit(ast, 0);
    return maxDepth;
  }

  private extractTemplateVariables(content: string): Record<string, any> {
    const variables: Record<string, any> = {};
    const variablePattern = /\{\{[\s]*([^}]+)[\s]*\}\}/g;
    let match;

    while ((match = variablePattern.exec(content)) !== null) {
      const variable = match[1].trim();
      if (!variable.startsWith('#') && !variable.startsWith('/') && !variable.startsWith('>')) {
        variables[variable] = 'unknown';
      }
    }

    return variables;
  }

  private extractTemplatePartials(content: string): string[] {
    const partials: string[] = [];
    const partialPattern = /\{\{>\s*([^}]+)\s*\}\}/g;
    let match;

    while ((match = partialPattern.exec(content)) !== null) {
      partials.push(match[1].trim());
    }

    return partials;
  }

  private extractTemplateHelpers(content: string): string[] {
    const helpers: string[] = [];
    const helperPattern = /\{\{[\s]*([a-zA-Z_][a-zA-Z0-9_]*)\s/g;
    let match;

    while ((match = helperPattern.exec(content)) !== null) {
      const helper = match[1];
      if (!['if', 'unless', 'each', 'with'].includes(helper)) {
        helpers.push(helper);
      }
    }

    return [...new Set(helpers)];
  }

  private isTemplateCacheable(content: string): boolean {
    // Template is cacheable if it doesn't have dynamic helpers or partials
    return !content.includes('{{>') && !content.includes('dynamicHelper');
  }

  private generateOptimizationSuggestions(
    content: string,
    syntaxInfo: TemplateSyntaxInfo
  ): string[] {
    const suggestions: string[] = [];

    if (syntaxInfo.complexity > 20) {
      suggestions.push('Consider breaking complex template into smaller partials');
    }

    if (syntaxInfo.depth > 5) {
      suggestions.push('Template has deep nesting - consider flattening structure');
    }

    if (content.length > 10000) {
      suggestions.push('Large template - consider using partials or conditional includes');
    }

    if (content.includes('{{#each')) {
      suggestions.push('Consider using pagination for large lists');
    }

    return suggestions;
  }

  private logBatchSummary(result: BatchResult): void {
    console.log(`\n📊 Batch Generation Summary:`);
    console.log(`   Total Targets: ${result.summary.totalTargets}`);
    console.log(`   Successful: ${chalk.green(result.summary.successful)}`);
    console.log(`   Failed: ${chalk.red(result.summary.failed)}`);
    console.log(`   Total Time: ${chalk.yellow(result.totalTime)}ms`);
    console.log(`   Files Generated: ${chalk.cyan(result.summary.totalFilesGenerated)}`);
    console.log(`   Average Execution Time: ${chalk.yellow(Math.round(result.summary.averageExecutionTime))}ms`);
  }

  private logTemplateInspection(templatePath: string, inspector: TemplateInspector): void {
    console.log(`\n🔍 Template Inspection Results for ${chalk.cyan(templatePath)}:`);
    console.log(`   Syntax Valid: ${inspector.syntax.valid ? chalk.green('✅') : chalk.red('❌')}`);
    console.log(`   Complexity: ${chalk.yellow(inspector.syntax.complexity)}`);
    console.log(`   Variables: ${chalk.cyan(Object.keys(inspector.variables).length)}`);
    console.log(`   Partials: ${chalk.cyan(inspector.partials.length)}`);
    console.log(`   Helpers: ${chalk.cyan(inspector.helpers.length)}`);
    console.log(`   Render Time: ${chalk.yellow(inspector.performance.renderTime)}ms`);
    
    if (inspector.performance.optimizationSuggestions.length > 0) {
      console.log(`   Optimization Suggestions:`);
      inspector.performance.optimizationSuggestions.forEach(suggestion => {
        console.log(`     • ${suggestion}`);
      });
    }
  }

  /**
   * Get debug session
   */
  getDebugSession(sessionId: string): DebugSession | null {
    return this.debugSessions.get(sessionId) || null;
  }

  /**
   * Stop debug session
   */
  stopDebugSession(sessionId: string): boolean {
    const session = this.debugSessions.get(sessionId);
    if (session) {
      session.state = 'stopped';
      this.debugSessions.delete(sessionId);
      this.emit('debug:session-stopped', session);
      return true;
    }
    return false;
  }

  /**
   * Get template inspector
   */
  getTemplateInspector(templatePath: string): TemplateInspector | null {
    return this.templateInspectors.get(templatePath) || null;
  }

  /**
   * Clear caches
   */
  clearCaches(): void {
    this.debugSessions.clear();
    this.templateInspectors.clear();
    console.log('🧹 Advanced features caches cleared');
  }

  /**
   * Dispose advanced features
   */
  async dispose(): Promise<void> {
    // Stop all debug sessions
    for (const sessionId of this.debugSessions.keys()) {
      this.stopDebugSession(sessionId);
    }

    this.clearCaches();
    console.log('🚀 Advanced Generator Features disposed');
  }
}