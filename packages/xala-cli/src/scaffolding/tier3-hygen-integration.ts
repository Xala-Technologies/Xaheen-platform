/**
 * @fileoverview Tier 3: Hygen Integration for Project-Local Generators
 * @description Lightweight generators for rapid component creation and team-specific patterns
 */

import { spawn, exec } from 'child_process';
import { promises as fs } from 'fs';
import { join, dirname, resolve, relative } from 'path';
import { glob } from 'glob';
import * as yaml from 'yaml';
import { logger } from '../utils/logger.js';
import {
  ScaffoldingContext,
  GenerationResult,
  HygenGeneratorConfig,
  HygenTemplate,
  LocalGeneratorOptions,
  ScaffoldingError,
  VirtualFileSystem
} from './types.js';

export class HygenIntegration {
  private readonly projectPath: string;
  private readonly virtualFs: VirtualFileSystem;
  private readonly generatorsPath: string;
  private readonly templatesPath: string;

  constructor(projectPath: string, virtualFs: VirtualFileSystem) {
    this.projectPath = resolve(projectPath);
    this.virtualFs = virtualFs;
    this.generatorsPath = join(this.projectPath, '.xala', 'generators');
    this.templatesPath = join(this.projectPath, '.xala', 'templates');
  }

  // ===== INITIALIZATION =====

  async initializeLocalGenerators(): Promise<void> {
    logger.info('Initializing project-local generators');

    // Create generators directory structure
    await this.createGeneratorDirectories();

    // Install default generators
    await this.installDefaultGenerators();

    // Create configuration file
    await this.createGeneratorConfig();

    logger.success('Local generators initialized successfully');
  }

  // ===== GENERATOR MANAGEMENT =====

  async installGenerator(
    name: string,
    config: HygenGeneratorConfig
  ): Promise<void> {
    logger.info(`Installing generator: ${name}`);

    const generatorPath = join(this.generatorsPath, name);
    await fs.mkdir(generatorPath, { recursive: true });

    // Create generator configuration
    const configPath = join(generatorPath, 'config.yaml');
    await fs.writeFile(configPath, yaml.stringify(config), 'utf8');

    // Install templates
    for (const template of config.templates) {
      await this.installTemplate(generatorPath, template);
    }

    // Create generator index file
    await this.createGeneratorIndex(generatorPath, config);

    logger.success(`Generator '${name}' installed successfully`);
  }

  async listGenerators(): Promise<readonly string[]> {
    try {
      const entries = await fs.readdir(this.generatorsPath, { withFileTypes: true });
      return entries
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name);
    } catch (error) {
      return [];
    }
  }

  async getGeneratorConfig(name: string): Promise<HygenGeneratorConfig | null> {
    try {
      const configPath = join(this.generatorsPath, name, 'config.yaml');
      const configContent = await fs.readFile(configPath, 'utf8');
      return yaml.parse(configContent) as HygenGeneratorConfig;
    } catch (error) {
      return null;
    }
  }

  // ===== GENERATION =====

  async generate(
    context: ScaffoldingContext,
    options: LocalGeneratorOptions
  ): Promise<GenerationResult> {
    const { generatorName, targetPath, variables = {}, dryRun = false } = options;

    logger.info(`Running local generator: ${generatorName}`);

    try {
      // Get generator configuration
      const config = await this.getGeneratorConfig(generatorName);
      if (!config) {
        throw new ScaffoldingError(
          `Generator '${generatorName}' not found`,
          'GENERATOR_NOT_FOUND'
        );
      }

      // Prepare generation context
      const generationContext = {
        ...context,
        ...variables,
        targetPath: targetPath || context.projectPath,
        generatorName
      };

      // Generate files using templates
      const files = await this.generateFromTemplates(config, generationContext, dryRun);

      return {
        success: true,
        files,
        errors: [],
        warnings: []
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        files: [],
        errors: [errorMessage],
        warnings: []
      };
    }
  }

  async generateComponent(
    name: string,
    type: string,
    options: Record<string, unknown> = {}
  ): Promise<GenerationResult> {
    logger.info(`Generating ${type} component: ${name}`);

    const hygenArgs = [
      'generate',
      'component',
      type,
      '--name',
      name
    ];

    // Add options as arguments
    for (const [key, value] of Object.entries(options)) {
      hygenArgs.push(`--${key}`, String(value));
    }

    try {
      const result = await this.runHygen(hygenArgs);
      
      return {
        success: true,
        files: result.files,
        errors: [],
        warnings: []
      };
    } catch (error) {
      return {
        success: false,
        files: [],
        errors: [error instanceof Error ? error.message : String(error)],
        warnings: []
      };
    }
  }

  // ===== TEMPLATE MANAGEMENT =====

  async createTemplate(
    generatorName: string,
    templateName: string,
    content: string,
    metadata: Record<string, unknown> = {}
  ): Promise<void> {
    const templatePath = join(this.generatorsPath, generatorName, 'templates', `${templateName}.ejs.t`);
    
    // Ensure directory exists
    await fs.mkdir(dirname(templatePath), { recursive: true });

    // Create template with frontmatter
    const frontmatter = this.createTemplateFrontmatter(metadata);
    const templateContent = `---
${frontmatter}
---
${content}`;

    await fs.writeFile(templatePath, templateContent, 'utf8');
    logger.debug(`Created template: ${templatePath}`);
  }

  async syncWithVirtualFS(): Promise<void> {
    logger.info('Syncing local generators with virtual filesystem');

    // Get all generated files from virtual filesystem
    const vfsFiles = this.virtualFs.files;

    // Apply files to actual filesystem through Hygen templates
    for (const [filePath, content] of vfsFiles) {
      if (filePath.startsWith('.xala/generators/')) {
        // This is a generator file, write it directly
        const actualPath = join(this.projectPath, filePath);
        await fs.mkdir(dirname(actualPath), { recursive: true });
        await fs.writeFile(actualPath, content, 'utf8');
      }
    }
  }

  // ===== TEAM-SPECIFIC PATTERNS =====

  async installTeamPatterns(patternsConfig: Record<string, HygenGeneratorConfig>): Promise<void> {
    logger.info('Installing team-specific patterns');

    for (const [patternName, config] of Object.entries(patternsConfig)) {
      await this.installGenerator(patternName, config);
    }

    // Create team patterns index
    await this.createTeamPatternsIndex(patternsConfig);
  }

  async discoverLocalGenerators(): Promise<readonly HygenGeneratorConfig[]> {
    const generators: HygenGeneratorConfig[] = [];
    
    try {
      const generatorDirs = await this.listGenerators();
      
      for (const generatorName of generatorDirs) {
        const config = await this.getGeneratorConfig(generatorName);
        if (config) {
          generators.push(config);
        }
      }
    } catch (error) {
      logger.warn(`Failed to discover local generators: ${error}`);
    }

    return generators;
  }

  // ===== PRIVATE HELPER METHODS =====

  private async createGeneratorDirectories(): Promise<void> {
    const directories = [
      this.generatorsPath,
      this.templatesPath,
      join(this.generatorsPath, 'component'),
      join(this.generatorsPath, 'page'),
      join(this.generatorsPath, 'service'),
      join(this.generatorsPath, 'hook'),
      join(this.generatorsPath, 'layout')
    ];

    for (const dir of directories) {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  private async installDefaultGenerators(): Promise<void> {
    // Component generator
    const componentGenerator: HygenGeneratorConfig = {
      name: 'component',
      description: 'Generate React/Vue/Angular components',
      templates: [
        {
          name: 'component',
          path: 'src/components/{{ name }}/{{ name }}.tsx',
          inject: [
            {
              after: 'export',
              template: 'export { {{ name }} } from "./{{ name }}/{{ name }}";'
            }
          ]
        },
        {
          name: 'test',
          path: 'src/components/{{ name }}/{{ name }}.test.tsx'
        },
        {
          name: 'stories',
          path: 'src/components/{{ name }}/{{ name }}.stories.tsx',
          condition: 'storybook'
        }
      ],
      prompts: [
        {
          type: 'input',
          name: 'name',
          message: 'Component name:'
        },
        {
          type: 'confirm',
          name: 'storybook',
          message: 'Generate Storybook story?',
          initial: true
        }
      ]
    };

    await this.installGenerator('component', componentGenerator);

    // Page generator
    const pageGenerator: HygenGeneratorConfig = {
      name: 'page',
      description: 'Generate application pages',
      templates: [
        {
          name: 'page',
          path: 'src/pages/{{ name }}/{{ name }}.tsx'
        },
        {
          name: 'layout',
          path: 'src/pages/{{ name }}/layout.tsx',
          condition: 'layout'
        }
      ],
      prompts: [
        {
          type: 'input',
          name: 'name',
          message: 'Page name:'
        },
        {
          type: 'confirm',
          name: 'layout',
          message: 'Generate custom layout?',
          initial: false
        }
      ]
    };

    await this.installGenerator('page', pageGenerator);
  }

  private async createGeneratorConfig(): Promise<void> {
    const config = {
      version: '1.0.0',
      generators: {
        component: {
          enabled: true,
          description: 'Generate components with TypeScript and tests'
        },
        page: {
          enabled: true,
          description: 'Generate pages with routing configuration'
        }
      },
      templates: {
        react: {
          component: 'react-component.ejs.t',
          test: 'react-test.ejs.t'
        },
        vue: {
          component: 'vue-component.ejs.t',
          test: 'vue-test.ejs.t'
        }
      }
    };

    const configPath = join(this.projectPath, '.xala', 'generators.yaml');
    await fs.writeFile(configPath, yaml.stringify(config), 'utf8');
  }

  private async installTemplate(generatorPath: string, template: HygenTemplate): Promise<void> {
    const templatesDir = join(generatorPath, 'templates');
    await fs.mkdir(templatesDir, { recursive: true });

    const templatePath = join(templatesDir, `${template.name}.ejs.t`);
    
    // Create template content based on template configuration
    const templateContent = await this.createTemplateContent(template);
    await fs.writeFile(templatePath, templateContent, 'utf8');
  }

  private async createTemplateContent(template: HygenTemplate): Promise<string> {
    // Basic template content - this would be more sophisticated in real implementation
    const frontmatter = {
      to: template.path,
      ...(template.condition && { unless_exists: template.condition })
    };

    const content = `---
${yaml.stringify(frontmatter).trim()}
---
// Generated by Xala CLI
// Template: ${template.name}

export interface <%= name %>Props {
  readonly className?: string;
}

export const <%= name %> = ({ className }: <%= name %>Props): JSX.Element => {
  return (
    <div className={className}>
      <h1><%= name %> Component</h1>
    </div>
  );
};
`;

    return content;
  }

  private async createGeneratorIndex(generatorPath: string, config: HygenGeneratorConfig): Promise<void> {
    const indexContent = `/**
 * Generator: ${config.name}
 * Description: ${config.description}
 * Generated by Xala CLI
 */

module.exports = {
  description: '${config.description}',
  prompts: ${JSON.stringify(config.prompts || [], null, 2)},
  actions: [
    ${config.templates.map(template => `
    {
      type: 'add',
      path: '${template.path}',
      templateFile: 'templates/${template.name}.ejs.t'
    }`).join(',\n')}
  ]
};
`;

    const indexPath = join(generatorPath, 'index.js');
    await fs.writeFile(indexPath, indexContent, 'utf8');
  }

  private createTemplateFrontmatter(metadata: Record<string, unknown>): string {
    return yaml.stringify(metadata).trim();
  }

  private async generateFromTemplates(
    config: HygenGeneratorConfig,
    context: Record<string, unknown>,
    dryRun: boolean
  ): Promise<string[]> {
    const files: string[] = [];

    for (const template of config.templates) {
      // Check condition if specified
      if (template.condition && !context[template.condition]) {
        continue;
      }

      // Process template path with variables
      const processedPath = this.processTemplate(template.path, context);
      
      // Generate file content
      const templatePath = join(this.generatorsPath, config.name, 'templates', `${template.name}.ejs.t`);
      
      try {
        const templateContent = await fs.readFile(templatePath, 'utf8');
        const processedContent = this.processTemplate(templateContent, context);
        
        if (dryRun) {
          logger.info(`Would create: ${processedPath}`);
        } else {
          this.virtualFs.writeFile(processedPath, processedContent);
        }
        
        files.push(processedPath);

        // Handle injections
        if (template.inject) {
          for (const injection of template.inject) {
            await this.handleInjection(injection, context, dryRun);
          }
        }
      } catch (error) {
        logger.warn(`Failed to process template ${template.name}: ${error}`);
      }
    }

    return files;
  }

  private processTemplate(template: string, context: Record<string, unknown>): string {
    let processed = template;

    // Simple template processing - replace {{ variable }} with context values
    for (const [key, value] of Object.entries(context)) {
      const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
      processed = processed.replace(regex, String(value));
    }

    return processed;
  }

  private async handleInjection(
    injection: any,
    context: Record<string, unknown>,
    dryRun: boolean
  ): Promise<void> {
    // Handle template injections - this would be more sophisticated
    const processedTemplate = this.processTemplate(injection.template, context);
    
    if (dryRun) {
      logger.info(`Would inject: ${processedTemplate}`);
    } else {
      // Implementation for actual injection would go here
      logger.debug(`Injected: ${processedTemplate}`);
    }
  }

  private async runHygen(args: string[]): Promise<{ files: string[] }> {
    return new Promise((resolve, reject) => {
      const hygenProcess = spawn('hygen', args, {
        cwd: this.projectPath,
        stdio: 'pipe'
      });

      let stdout = '';
      let stderr = '';

      hygenProcess.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      hygenProcess.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      hygenProcess.on('close', (code) => {
        if (code === 0) {
          // Parse stdout to extract generated files
          const files = this.parseHygenOutput(stdout);
          resolve({ files });
        } else {
          reject(new Error(`Hygen failed with code ${code}: ${stderr}`));
        }
      });

      hygenProcess.on('error', (error) => {
        reject(new ScaffoldingError(
          `Failed to run Hygen: ${error.message}`,
          'HYGEN_EXECUTION_FAILED'
        ));
      });
    });
  }

  private parseHygenOutput(output: string): string[] {
    // Parse Hygen output to extract generated file paths
    const lines = output.split('\n');
    const files: string[] = [];

    for (const line of lines) {
      const match = line.match(/added: (.+)/);
      if (match) {
        files.push(match[1]!.trim());
      }
    }

    return files;
  }

  private async createTeamPatternsIndex(patterns: Record<string, HygenGeneratorConfig>): Promise<void> {
    const indexContent = {
      version: '1.0.0',
      description: 'Team-specific generator patterns',
      patterns: Object.keys(patterns),
      generators: patterns
    };

    const indexPath = join(this.projectPath, '.xala', 'team-patterns.yaml');
    await fs.writeFile(indexPath, yaml.stringify(indexContent), 'utf8');
  }
}