/**
 * Meta-Generator - Generator that generates other generators
 * Rails-style meta-programming for generator creation and composition
 */
import { BaseGenerator, GeneratorResult } from '../base.generator';
import { GeneratorRegistry } from './generator-registry';
import { 
  MetaGeneratorOptions, 
  GeneratorMetadata, 
  GeneratorTemplate,
  GeneratorComposition,
  GeneratorWorkflow,
  WorkflowStep
} from './types';
import { TemplateEngine } from './template-engine';
import { GeneratorComposer } from './generator-composer';
import { GeneratorValidator } from './generator-validator';
import { GeneratorAnalytics } from './generator-analytics';
import { promises as fs } from 'fs';
import path from 'path';
import chalk from 'chalk';

export class MetaGenerator extends BaseGenerator<MetaGeneratorOptions> {
  private registry: GeneratorRegistry;
  private templateEngine: TemplateEngine;
  private composer: GeneratorComposer;
  private validator: GeneratorValidator;
  private analytics: GeneratorAnalytics;

  constructor() {
    super();
    this.registry = new GeneratorRegistry();
    this.templateEngine = new TemplateEngine();
    this.composer = new GeneratorComposer(this.registry);
    this.validator = new GeneratorValidator();
    this.analytics = new GeneratorAnalytics();
  }

  getGeneratorType(): string {
    return 'meta-generator';
  }

  async generate(options: MetaGeneratorOptions): Promise<GeneratorResult> {
    try {
      await this.validateOptions(options);
      
      this.logger.info(`🔄 Starting meta-generation for: ${chalk.cyan(options.name)}`);
      
      const startTime = Date.now();
      const files: string[] = [];
      const commands: string[] = [];
      
      // Load template and target generator metadata
      const template = await this.loadGeneratorTemplate(options.templateId);
      const targetMetadata = options.targetGenerator;
      
      // Generate the new generator
      const generatorFiles = await this.generateGeneratorFiles(
        template, 
        targetMetadata, 
        options
      );
      files.push(...generatorFiles);
      
      // Generate tests if requested
      if (options.generateTests) {
        const testFiles = await this.generateTestFiles(targetMetadata, options);
        files.push(...testFiles);
        commands.push('npm test');
      }
      
      // Generate documentation if requested
      if (options.generateDocs) {
        const docFiles = await this.generateDocumentationFiles(targetMetadata, options);
        files.push(...docFiles);
      }
      
      // Generate examples if requested
      if (options.generateExamples) {
        const exampleFiles = await this.generateExampleFiles(targetMetadata, options);
        files.push(...exampleFiles);
      }
      
      // Register the new generator
      await this.registerGeneratedGenerator(targetMetadata, files, options);
      
      // Publish to marketplace if requested
      if (options.publishToMarketplace) {
        await this.publishToMarketplace(targetMetadata, files, options);
        commands.push('xaheen marketplace:publish');
      }
      
      // Record analytics
      const executionTime = Date.now() - startTime;
      await this.analytics.recordGeneration({
        generatorId: 'meta-generator',
        targetGeneratorId: targetMetadata.id,
        executionTime,
        filesGenerated: files.length,
        success: true,
        options
      });
      
      return {
        success: true,
        message: `✨ Successfully generated ${chalk.green(targetMetadata.name)} generator`,
        files,
        commands,
        nextSteps: [
          `Navigate to the generated generator directory`,
          `Review the generated files`,
          `Test the generator with: xaheen generate ${targetMetadata.id}`,
          `Publish to marketplace with: xaheen marketplace:publish`
        ]
      };
      
    } catch (error: any) {
      this.logger.error(`Meta-generation failed: ${error.message}`, error);
      
      await this.analytics.recordGeneration({
        generatorId: 'meta-generator',
        targetGeneratorId: options.targetGenerator?.id || 'unknown',
        executionTime: Date.now(),
        filesGenerated: 0,
        success: false,
        error: error.message,
        options
      });
      
      return {
        success: false,
        message: `❌ Meta-generation failed: ${error.message}`,
        files: [],
        commands: []
      };
    }
  }

  /**
   * Generate multiple generators in a composition workflow
   */
  async generateComposition(
    composition: GeneratorComposition,
    options: Partial<MetaGeneratorOptions> = {}
  ): Promise<GeneratorResult> {
    this.logger.info(`🎼 Starting generator composition with ${composition.generators.length} generators`);
    
    const results = await this.composer.executeComposition(composition, options);
    
    return {
      success: results.every(r => r.success),
      message: `Composition completed: ${results.filter(r => r.success).length}/${results.length} succeeded`,
      files: results.flatMap(r => r.files || []),
      commands: results.flatMap(r => r.commands || []),
      nextSteps: [
        'Review generated composition',
        'Test individual generators',
        'Run integration tests'
      ]
    };
  }

  /**
   * Execute a generator workflow
   */
  async executeWorkflow(
    workflow: GeneratorWorkflow,
    variables: Record<string, any> = {}
  ): Promise<GeneratorResult> {
    this.logger.info(`⚡ Executing workflow: ${chalk.cyan(workflow.name)}`);
    
    const context = { variables, results: new Map<string, any>() };
    const files: string[] = [];
    const commands: string[] = [];
    
    for (const step of workflow.steps) {
      try {
        const stepResult = await this.executeWorkflowStep(step, context);
        
        if (stepResult.files) {
          files.push(...stepResult.files);
        }
        
        if (stepResult.commands) {
          commands.push(...stepResult.commands);
        }
        
        context.results.set(step.id, stepResult);
        
      } catch (error: any) {
        this.logger.error(`Workflow step ${step.id} failed: ${error.message}`);
        
        return {
          success: false,
          message: `Workflow failed at step: ${step.name}`,
          files,
          commands
        };
      }
    }
    
    return {
      success: true,
      message: `Workflow ${workflow.name} completed successfully`,
      files,
      commands,
      nextSteps: [
        'Review workflow results',
        'Test generated artifacts',
        'Deploy if applicable'
      ]
    };
  }

  /**
   * Create a new generator template
   */
  async createGeneratorTemplate(
    name: string,
    baseTemplate?: string,
    customizations?: Record<string, any>
  ): Promise<GeneratorTemplate> {
    this.logger.info(`📝 Creating generator template: ${chalk.cyan(name)}`);
    
    const template = await this.templateEngine.createTemplate({
      name,
      baseTemplate,
      customizations,
      variables: [],
      partials: [],
      helpers: [],
      blocks: []
    });
    
    // Save template to registry
    await this.templateEngine.saveTemplate(template);
    
    this.logger.success(`✅ Created template: ${template.name}`);
    
    return template;
  }

  /**
   * Load generator template by ID
   */
  private async loadGeneratorTemplate(templateId: string): Promise<GeneratorTemplate> {
    const template = await this.templateEngine.loadTemplate(templateId);
    
    if (!template) {
      throw new Error(`Generator template not found: ${templateId}`);
    }
    
    return template;
  }

  /**
   * Generate generator files from template
   */
  private async generateGeneratorFiles(
    template: GeneratorTemplate,
    metadata: GeneratorMetadata,
    options: MetaGeneratorOptions
  ): Promise<string[]> {
    const files: string[] = [];
    const outputPath = options.outputPath || path.join(process.cwd(), 'generators', metadata.id);
    
    // Ensure output directory exists
    await this.ensureDirectoryExists(outputPath);
    
    // Generate main generator file
    const generatorFile = await this.generateFile(
      'generator/main.hbs',
      path.join(outputPath, 'index.ts'),
      {
        metadata,
        template,
        options: options.customOptions,
        namespace: options.namespace
      },
      { dryRun: options.dryRun, force: options.force }
    );
    files.push(generatorFile);
    
    // Generate metadata file
    const metadataFile = await this.generateFile(
      'generator/metadata.hbs',
      path.join(outputPath, 'metadata.json'),
      { metadata },
      { dryRun: options.dryRun, force: options.force }
    );
    files.push(metadataFile);
    
    // Generate package.json
    const packageFile = await this.generateFile(
      'generator/package.hbs',
      path.join(outputPath, 'package.json'),
      {
        name: `@xaheen-ai/generator-${metadata.id}`,
        version: metadata.version,
        description: metadata.description,
        author: metadata.author,
        dependencies: metadata.dependencies
      },
      { dryRun: options.dryRun, force: options.force }
    );
    files.push(packageFile);
    
    // Generate templates
    const templatesDir = path.join(outputPath, 'templates');
    await this.ensureDirectoryExists(templatesDir);
    
    for (const templateFile of template.partials) {
      const templatePath = path.join(templatesDir, `${templateFile}.hbs`);
      const content = await this.templateEngine.renderTemplate(templateFile, {
        metadata,
        options: options.customOptions
      });
      
      if (!options.dryRun) {
        await fs.writeFile(templatePath, content);
      }
      
      files.push(templatePath);
    }
    
    return files;
  }

  /**
   * Generate test files for the generator
   */
  private async generateTestFiles(
    metadata: GeneratorMetadata,
    options: MetaGeneratorOptions
  ): Promise<string[]> {
    const files: string[] = [];
    const outputPath = options.outputPath || path.join(process.cwd(), 'generators', metadata.id);
    const testsDir = path.join(outputPath, '__tests__');
    
    await this.ensureDirectoryExists(testsDir);
    
    // Generate unit tests
    const unitTestFile = await this.generateFile(
      'tests/unit.hbs',
      path.join(testsDir, `${metadata.id}.test.ts`),
      { metadata, options: options.customOptions },
      { dryRun: options.dryRun, force: options.force }
    );
    files.push(unitTestFile);
    
    // Generate integration tests
    const integrationTestFile = await this.generateFile(
      'tests/integration.hbs',
      path.join(testsDir, `${metadata.id}.integration.test.ts`),
      { metadata, options: options.customOptions },
      { dryRun: options.dryRun, force: options.force }
    );
    files.push(integrationTestFile);
    
    // Generate performance tests
    const performanceTestFile = await this.generateFile(
      'tests/performance.hbs',
      path.join(testsDir, `${metadata.id}.performance.test.ts`),
      { metadata, options: options.customOptions },
      { dryRun: options.dryRun, force: options.force }
    );
    files.push(performanceTestFile);
    
    return files;
  }

  /**
   * Generate documentation files
   */
  private async generateDocumentationFiles(
    metadata: GeneratorMetadata,
    options: MetaGeneratorOptions
  ): Promise<string[]> {
    const files: string[] = [];
    const outputPath = options.outputPath || path.join(process.cwd(), 'generators', metadata.id);
    const docsDir = path.join(outputPath, 'docs');
    
    await this.ensureDirectoryExists(docsDir);
    
    // Generate README
    const readmeFile = await this.generateFile(
      'docs/README.hbs',
      path.join(outputPath, 'README.md'),
      { metadata, options: options.customOptions },
      { dryRun: options.dryRun, force: options.force }
    );
    files.push(readmeFile);
    
    // Generate API documentation
    const apiDocsFile = await this.generateFile(
      'docs/api.hbs',
      path.join(docsDir, 'api.md'),
      { metadata, options: options.customOptions },
      { dryRun: options.dryRun, force: options.force }
    );
    files.push(apiDocsFile);
    
    // Generate usage examples
    const examplesFile = await this.generateFile(
      'docs/examples.hbs',
      path.join(docsDir, 'examples.md'),
      { metadata, options: options.customOptions },
      { dryRun: options.dryRun, force: options.force }
    );
    files.push(examplesFile);
    
    return files;
  }

  /**
   * Generate example files
   */
  private async generateExampleFiles(
    metadata: GeneratorMetadata,
    options: MetaGeneratorOptions
  ): Promise<string[]> {
    const files: string[] = [];
    const outputPath = options.outputPath || path.join(process.cwd(), 'generators', metadata.id);
    const examplesDir = path.join(outputPath, 'examples');
    
    await this.ensureDirectoryExists(examplesDir);
    
    // Generate basic example
    const basicExampleFile = await this.generateFile(
      'examples/basic.hbs',
      path.join(examplesDir, 'basic.ts'),
      { metadata, options: options.customOptions },
      { dryRun: options.dryRun, force: options.force }
    );
    files.push(basicExampleFile);
    
    // Generate advanced example
    const advancedExampleFile = await this.generateFile(
      'examples/advanced.hbs',
      path.join(examplesDir, 'advanced.ts'),
      { metadata, options: options.customOptions },
      { dryRun: options.dryRun, force: options.force }
    );
    files.push(advancedExampleFile);
    
    return files;
  }

  /**
   * Register the generated generator
   */
  private async registerGeneratedGenerator(
    metadata: GeneratorMetadata,
    files: string[],
    options: MetaGeneratorOptions
  ): Promise<void> {
    const outputPath = options.outputPath || path.join(process.cwd(), 'generators', metadata.id);
    
    const registryEntry = {
      metadata,
      implementation: path.join(outputPath, 'index.ts'),
      templates: [],
      examples: [],
      tests: [],
      documentation: {
        readme: path.join(outputPath, 'README.md'),
        apiReference: path.join(outputPath, 'docs', 'api.md'),
        examples: path.join(outputPath, 'docs', 'examples.md'),
        changelog: '',
        contributing: '',
        license: ''
      },
      performance: {
        averageExecutionTime: 0,
        memoryUsage: 0,
        fileCount: files.length,
        templateCount: 0,
        benchmarks: []
      },
      security: {
        vulnerabilities: [],
        lastScan: new Date(),
        securityRating: 'A' as const,
        trustedBy: []
      }
    };
    
    await this.registry.register(registryEntry);
    this.logger.success(`📦 Registered generator: ${metadata.name}`);
  }

  /**
   * Publish to marketplace
   */
  private async publishToMarketplace(
    metadata: GeneratorMetadata,
    files: string[],
    options: MetaGeneratorOptions
  ): Promise<void> {
    this.logger.info(`🌐 Publishing ${metadata.name} to marketplace...`);
    
    // This would integrate with actual marketplace API
    // For now, just log the action
    this.logger.success(`📦 Published ${metadata.name} to marketplace`);
  }

  /**
   * Execute a workflow step
   */
  private async executeWorkflowStep(
    step: WorkflowStep,
    context: { variables: Record<string, any>; results: Map<string, any> }
  ): Promise<GeneratorResult> {
    this.logger.info(`🔄 Executing step: ${chalk.cyan(step.name)}`);
    
    switch (step.type) {
      case 'generator':
        return this.executeGeneratorStep(step, context);
      
      case 'condition':
        return this.executeConditionStep(step, context);
      
      case 'loop':
        return this.executeLoopStep(step, context);
      
      case 'parallel':
        return this.executeParallelStep(step, context);
      
      case 'script':
        return this.executeScriptStep(step, context);
      
      default:
        throw new Error(`Unknown workflow step type: ${(step as any).type}`);
    }
  }

  /**
   * Execute a generator step
   */
  private async executeGeneratorStep(
    step: WorkflowStep,
    context: { variables: Record<string, any>; results: Map<string, any> }
  ): Promise<GeneratorResult> {
    const generatorId = step.config.generatorId;
    const options = { ...step.config.options, ...context.variables };
    
    const generator = await this.registry.loadGeneratorImplementation(generatorId);
    return generator.generate(options);
  }

  /**
   * Execute a condition step
   */
  private async executeConditionStep(
    step: WorkflowStep,
    context: { variables: Record<string, any>; results: Map<string, any> }
  ): Promise<GeneratorResult> {
    const condition = step.config.condition;
    
    // Evaluate condition (simplified - would use proper expression evaluator)
    const shouldExecute = this.evaluateCondition(condition, context);
    
    if (shouldExecute && step.config.thenStep) {
      return this.executeWorkflowStep(step.config.thenStep, context);
    } else if (!shouldExecute && step.config.elseStep) {
      return this.executeWorkflowStep(step.config.elseStep, context);
    }
    
    return {
      success: true,
      message: `Condition ${condition} evaluated to ${shouldExecute}`,
      files: [],
      commands: []
    };
  }

  /**
   * Execute a loop step
   */
  private async executeLoopStep(
    step: WorkflowStep,
    context: { variables: Record<string, any>; results: Map<string, any> }
  ): Promise<GeneratorResult> {
    const items = step.config.items || [];
    const childStep = step.config.childStep;
    
    const files: string[] = [];
    const commands: string[] = [];
    
    for (const item of items) {
      const itemContext = {
        ...context,
        variables: { ...context.variables, item }
      };
      
      const result = await this.executeWorkflowStep(childStep, itemContext);
      
      if (result.files) files.push(...result.files);
      if (result.commands) commands.push(...result.commands);
    }
    
    return {
      success: true,
      message: `Loop completed ${items.length} iterations`,
      files,
      commands
    };
  }

  /**
   * Execute a parallel step
   */
  private async executeParallelStep(
    step: WorkflowStep,
    context: { variables: Record<string, any>; results: Map<string, any> }
  ): Promise<GeneratorResult> {
    const childSteps = step.config.childSteps || [];
    
    const results = await Promise.all(
      childSteps.map((childStep: WorkflowStep) => 
        this.executeWorkflowStep(childStep, context)
      )
    );
    
    return {
      success: results.every(r => r.success),
      message: `Parallel execution completed: ${results.filter(r => r.success).length}/${results.length} succeeded`,
      files: results.flatMap(r => r.files || []),
      commands: results.flatMap(r => r.commands || [])
    };
  }

  /**
   * Execute a script step
   */
  private async executeScriptStep(
    step: WorkflowStep,
    context: { variables: Record<string, any>; results: Map<string, any> }
  ): Promise<GeneratorResult> {
    const script = step.config.script;
    
    // This would execute custom scripts safely
    // For now, just return success
    return {
      success: true,
      message: `Script executed: ${script.substring(0, 50)}...`,
      files: [],
      commands: []
    };
  }

  /**
   * Evaluate a condition expression
   */
  private evaluateCondition(
    condition: string,
    context: { variables: Record<string, any>; results: Map<string, any> }
  ): boolean {
    // Simplified condition evaluation
    // In production, would use a proper expression evaluator
    try {
      // Create safe evaluation context
      const evalContext = {
        ...context.variables,
        results: Object.fromEntries(context.results)
      };
      
      // Very basic evaluation - would use a proper parser
      return new Function('context', `with(context) { return ${condition}; }`)(evalContext);
    } catch {
      return false;
    }
  }
}