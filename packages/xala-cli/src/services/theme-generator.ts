import { logger } from '../utils/logger.js';
import { ThemeDefinitionGenerator } from './theme/theme-definition-generator.js';
import { ThemeTokenGenerator } from './theme/theme-token-generator.js';
import { ThemeValidation } from './theme/theme-validation.js';

export interface ThemeConfig {
  readonly name: string;
  readonly brand: string;
  readonly industry: string;
  readonly colors: Record<string, string>;
  readonly accessibility: 'AA' | 'AAA';
  readonly features: ReadonlyArray<string>;
  readonly locales: ReadonlyArray<string>;
}

export interface GenerationOptions {
  readonly outputDir: string;
  readonly preview: boolean;
}

export interface ThemeInfo {
  readonly name: string;
  readonly description: string;
  readonly industry: string;
  readonly accessibility: string;
  readonly isActive: boolean;
}

export class ThemeGenerator {
  private readonly definitionGenerator: ThemeDefinitionGenerator;
  private readonly tokenGenerator: ThemeTokenGenerator;
  private readonly validation: ThemeValidation;

  constructor() {
    this.definitionGenerator = new ThemeDefinitionGenerator();
    this.tokenGenerator = new ThemeTokenGenerator();
    this.validation = new ThemeValidation();
  }

  async createTheme(config: ThemeConfig, options: GenerationOptions): Promise<void> {
    logger.info(`Creating theme: ${config.name}`);

    // Validate theme configuration
    await this.validation.validateConfig(config);

    // Generate theme definition
    await this.definitionGenerator.generate(config, options);
    
    // Generate design tokens
    await this.tokenGenerator.generate(config, options);
    
    logger.info(`Theme ${config.name} created successfully`);
  }

  async applyTheme(themeName: string, projectPath: string): Promise<void> {
    logger.info(`Applying theme: ${themeName}`);
    await this.definitionGenerator.apply(themeName, projectPath);
  }

  async listThemes(projectPath?: string): Promise<ThemeInfo[]> {
    return this.definitionGenerator.list(projectPath);
  }

  async validateTheme(themeName: string): Promise<boolean> {
    return this.validation.validateTheme(themeName);
  }

  async customizeTheme(themeName: string, customizations: Partial<ThemeConfig>): Promise<void> {
    logger.info(`Customizing theme: ${themeName}`);
    await this.definitionGenerator.customize(themeName, customizations);
  }

  async previewTheme(themeName: string): Promise<string> {
    return this.definitionGenerator.preview(themeName);
  }
}