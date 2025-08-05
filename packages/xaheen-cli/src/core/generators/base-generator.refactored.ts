/**
 * Refactored Base Generator following SOLID principles
 * Single Responsibility: Coordinates generation workflow using injected services
 */

import type {
  ICodeGenerator,
  ILogger,
  IFileSystem,
  INamingService,
  IProjectAnalyzer,
  GeneratorOptions,
  GeneratorResult,
} from '../interfaces/index.js';

export abstract class BaseGenerator<TOptions extends GeneratorOptions> 
  implements ICodeGenerator<TOptions> {
  
  constructor(
    protected readonly logger: ILogger,
    protected readonly fileSystem: IFileSystem,
    protected readonly namingService: INamingService,
    protected readonly projectAnalyzer: IProjectAnalyzer
  ) {}

  // Abstract methods - Template Method Pattern
  public abstract generate(options: TOptions): Promise<GeneratorResult>;
  public abstract getType(): string;
  protected abstract validateOptions(options: TOptions): Promise<void>;
  protected abstract buildTemplateData(options: TOptions): Promise<any>;

  // Public validation method
  public async validate(options: TOptions): Promise<void> {
    this.validateBasicOptions(options);
    await this.validateOptions(options);
  }

  // Protected template methods for subclasses
  protected async generateFile(
    templatePath: string,
    outputPath: string,
    data: any,
    options: { dryRun?: boolean; force?: boolean } = {}
  ): Promise<string> {
    if (options.dryRun) {
      this.logger.info(`[DRY RUN] Would generate: ${outputPath}`);
      return outputPath;
    }

    const shouldProceed = await this.confirmOverwrite(outputPath, options.force);
    if (!shouldProceed) {
      this.logger.warn(`Skipped: ${outputPath}`);
      return outputPath;
    }

    // Delegate to template service (to be injected)
    await this.fileSystem.writeFile(outputPath, data);
    return outputPath;
  }

  protected async confirmOverwrite(filePath: string, force?: boolean): Promise<boolean> {
    if (force) return true;
    
    const exists = await this.fileSystem.exists(filePath);
    if (!exists) return true;

    // TODO: Integrate with prompt service
    this.logger.warn(`File ${filePath} already exists. Use --force to overwrite.`);
    return false;
  }

  protected getFilePlacement(type: string, name: string): FilePlacement {
    const naming = this.namingService.getNamingConvention(name);
    
    const placements: Record<string, FilePlacement> = {
      component: {
        filePath: `src/components/${naming.className}.tsx`,
        testPath: `src/components/__tests__/${naming.className}.test.tsx`,
        storyPath: `src/components/${naming.className}.stories.tsx`,
      },
      service: {
        filePath: `src/services/${naming.kebabCase}.service.ts`,
        testPath: `src/services/__tests__/${naming.kebabCase}.service.test.ts`,
        interfacePath: `src/interfaces/${naming.kebabCase}.interface.ts`,
      },
      model: {
        filePath: `src/types/${naming.kebabCase}.types.ts`,
        testPath: `src/types/__tests__/${naming.kebabCase}.test.ts`,
      },
    };

    return placements[type] || {
      filePath: `src/${type}s/${naming.kebabCase}.ts`,
    };
  }

  private validateBasicOptions(options: TOptions): void {
    if (!options.name) {
      throw new Error(`${this.getType()} name is required`);
    }

    const nameValidation = this.namingService.validateName(options.name);
    if (!nameValidation.isValid) {
      throw new Error(`Invalid name: ${nameValidation.errors.join(', ')}`);
    }
  }
}

interface FilePlacement {
  readonly filePath: string;
  readonly testPath?: string;
  readonly storyPath?: string;
  readonly interfacePath?: string;
}

/**
 * Factory for creating generators with proper dependency injection
 */
export class GeneratorFactory {
  constructor(
    private readonly logger: ILogger,
    private readonly fileSystem: IFileSystem,
    private readonly namingService: INamingService,
    private readonly projectAnalyzer: IProjectAnalyzer
  ) {}

  public create<T extends BaseGenerator<any>>(
    GeneratorClass: new (...args: any[]) => T
  ): T {
    return new GeneratorClass(
      this.logger,
      this.fileSystem,
      this.namingService,
      this.projectAnalyzer
    );
  }
}