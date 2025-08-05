/**
 * Refactored Generate Command Handler
 * Single Responsibility: Handles generate command execution
 * Dependency Inversion: Depends on abstractions, not concretions
 */

import type {
  ICommandHandler,
  ILogger,
  IDependencyInjector,
  CommandResult,
  CommandHelp,
} from '../../core/interfaces/index.js';
import type { ComponentGenerator } from '../../generators/component/component.generator.refactored.js';

export interface GenerateCommandOptions {
  readonly type: string;
  readonly name: string;
  readonly framework?: string;
  readonly dryRun?: boolean;
  readonly force?: boolean;
  readonly tests?: boolean;
  readonly stories?: boolean;
  readonly typescript?: boolean;
  readonly [key: string]: any;
}

export class GenerateCommandHandler implements ICommandHandler<GenerateCommandOptions> {
  private readonly generatorRegistry = new Map<string, symbol>();

  constructor(
    private readonly logger: ILogger,
    private readonly injector: IDependencyInjector
  ) {
    this.registerGenerators();
  }

  public async handle(options: GenerateCommandOptions): Promise<CommandResult> {
    try {
      await this.validate(options);

      this.logger.info(`Generating ${options.type}: ${options.name}`);

      const generator = this.resolveGenerator(options.type);
      const result = await generator.generate(options);

      if (result.success) {
        this.logger.success(result.message);
        this.logGeneratedFiles(result.files || []);
        this.logNextSteps(result.nextSteps || []);
      } else {
        this.logger.error(result.message);
      }

      return {
        success: result.success,
        message: result.message,
        data: result,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to generate ${options.type}:`, error);
      
      return {
        success: false,
        message: `Generation failed: ${message}`,
      };
    }
  }

  public async validate(options: GenerateCommandOptions): Promise<void> {
    if (!options.type) {
      throw new Error('Generator type is required');
    }

    if (!options.name) {
      throw new Error('Generator name is required');
    }

    if (!this.generatorRegistry.has(options.type)) {
      const availableTypes = Array.from(this.generatorRegistry.keys()).join(', ');
      throw new Error(`Unknown generator type: ${options.type}. Available: ${availableTypes}`);
    }

    // Delegate to specific generator validation
    const generator = this.resolveGenerator(options.type);
    await generator.validate(options);
  }

  public getHelp(): CommandHelp {
    const availableTypes = Array.from(this.generatorRegistry.keys());
    
    return {
      description: 'Generate code using Rails-inspired patterns',
      usage: 'xaheen generate <type> <name> [options]',
      examples: [
        'xaheen generate component UserCard',
        'xaheen generate service UserService --methods=findById,create,update',
        'xaheen generate controller UserController --model=User',
      ],
      options: [
        {
          name: 'type',
          description: `Generator type (${availableTypes.join(', ')})`,
          required: true,
          type: 'string',
        },
        {
          name: 'name',
          description: 'Name of the item to generate',
          required: true,
          type: 'string',
        },
        {
          name: 'dry-run',
          description: 'Preview changes without applying them',
          required: false,
          type: 'boolean',
        },
        {
          name: 'force',
          description: 'Overwrite existing files',
          required: false,
          type: 'boolean',
        },
      ],
    };
  }

  private registerGenerators(): void {
    // Register generator tokens with dependency injector
    this.generatorRegistry.set('component', Symbol('ComponentGenerator'));
    this.generatorRegistry.set('service', Symbol('ServiceGenerator'));
    this.generatorRegistry.set('controller', Symbol('ControllerGenerator'));
    this.generatorRegistry.set('model', Symbol('ModelGenerator'));
    // Add more generators as needed
  }

  private resolveGenerator(type: string): any {
    const token = this.generatorRegistry.get(type);
    if (!token) {
      throw new Error(`Generator not registered: ${type}`);
    }

    return this.injector.resolve(token);
  }

  private logGeneratedFiles(files: readonly string[]): void {
    if (files.length === 0) return;

    this.logger.info('Generated files:');
    for (const file of files) {
      this.logger.info(`  + ${file}`);
    }
  }

  private logNextSteps(steps: readonly string[]): void {
    if (steps.length === 0) return;

    this.logger.info('Next steps:');
    for (const step of steps) {
      this.logger.info(`  • ${step}`);
    }
  }
}

/**
 * Generator Registry for managing available generators
 * Follows Open/Closed Principle: Open for extension, closed for modification
 */
export class GeneratorRegistry {
  private readonly generators = new Map<string, GeneratorDescriptor>();

  public register(descriptor: GeneratorDescriptor): void {
    this.generators.set(descriptor.type, descriptor);
  }

  public unregister(type: string): void {
    this.generators.delete(type);
  }

  public has(type: string): boolean {
    return this.generators.has(type);
  }

  public get(type: string): GeneratorDescriptor | undefined {
    return this.generators.get(type);
  }

  public getAvailableTypes(): readonly string[] {
    return Array.from(this.generators.keys());
  }

  public getDescriptor(type: string): GeneratorDescriptor {
    const descriptor = this.generators.get(type);
    if (!descriptor) {
      throw new Error(`Generator not found: ${type}`);
    }
    return descriptor;
  }
}

export interface GeneratorDescriptor {
  readonly type: string;
  readonly description: string;
  readonly token: symbol;
  readonly options: readonly GeneratorOptionDescriptor[];
}

export interface GeneratorOptionDescriptor {
  readonly name: string;
  readonly description: string;
  readonly type: 'string' | 'boolean' | 'number' | 'array';
  readonly required: boolean;
  readonly defaultValue?: any;
}

/**
 * Command Builder for constructing commands with validation
 * Builder Pattern implementation
 */
export class GenerateCommandBuilder {
  private type?: string;
  private name?: string;
  private options: Record<string, any> = {};

  public setType(type: string): this {
    this.type = type;
    return this;
  }

  public setName(name: string): this {
    this.name = name;
    return this;
  }

  public setOption(key: string, value: any): this {
    this.options[key] = value;
    return this;
  }

  public setOptions(options: Record<string, any>): this {
    this.options = { ...this.options, ...options };
    return this;
  }

  public build(): GenerateCommandOptions {
    if (!this.type) {
      throw new Error('Type is required');
    }

    if (!this.name) {
      throw new Error('Name is required');
    }

    return {
      type: this.type,
      name: this.name,
      ...this.options,
    };
  }

  public reset(): this {
    this.type = undefined;
    this.name = undefined;
    this.options = {};
    return this;
  }
}