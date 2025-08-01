import path from 'path';
import { promises as fs } from 'fs';
import { z } from 'zod';
import { logger } from '../utils/logger.js';
import { fileExists, ensureDir, writeFile, readFile } from '../utils/fs.js';
import { TemplateEngine, TemplateContext } from '../utils/template.js';
import { LocalizationConfig } from '../localization/core.js';

// Generator configuration
export interface GeneratorConfig {
  name: string;
  description: string;
  templateDir: string;
  outputDir: string;
  overwrite: boolean;
  backup: boolean;
  validate: boolean;
  hooks: GeneratorHooks;
}

// Generator hooks
export interface GeneratorHooks {
  beforeGenerate?: (context: GenerationContext) => Promise<void> | void;
  afterGenerate?: (context: GenerationContext, results: GenerationResult[]) => Promise<void> | void;
  beforeFileWrite?: (filePath: string, content: string, context: GenerationContext) => Promise<string> | string;
  afterFileWrite?: (filePath: string, context: GenerationContext) => Promise<void> | void;
  onError?: (error: Error, context: GenerationContext) => Promise<void> | void;
  onConflict?: (filePath: string, context: GenerationContext) => Promise<'overwrite' | 'skip' | 'rename'>;
}

// Generation context
export interface GenerationContext {
  templatePath: string;
  outputPath: string;
  variables: Record<string, any>;
  config: GeneratorConfig;
  localization?: LocalizationConfig;
  metadata: {
    timestamp: string;
    generator: string;
    version: string;
  };
}

// Generation result
export interface GenerationResult {
  filePath: string;
  template: string;
  success: boolean;
  skipped: boolean;
  error?: Error;
  metrics: {
    size: number;
    duration: number;
  };
}

// Template file info
export interface TemplateFile {
  path: string;
  relativePath: string;
  isTemplate: boolean;
  content?: string;
}

// Conflict resolution
export type ConflictResolution = 'overwrite' | 'skip' | 'rename' | 'merge';

// Base generator class
export abstract class BaseGenerator {
  protected config: GeneratorConfig;
  protected templateEngine: TemplateEngine;
  protected generatedFiles: Set<string> = new Set();
  
  constructor(config: Partial<GeneratorConfig> = {}) {
    this.config = {
      name: 'base-generator',
      description: 'Base code generator',
      templateDir: '',
      outputDir: '',
      overwrite: false,
      backup: true,
      validate: true,
      hooks: {},
      ...config,
    };
    
    this.templateEngine = new TemplateEngine();
  }
  
  // Abstract methods to be implemented by subclasses
  abstract validateInput(input: any): Promise<any>;
  abstract prepareContext(input: any): Promise<GenerationContext>;
  abstract getTemplateFiles(): Promise<TemplateFile[]>;
  
  // Generate files
  async generate(input: any): Promise<GenerationResult[]> {
    const startTime = Date.now();
    const results: GenerationResult[] = [];
    
    try {
      // Validate input
      const validatedInput = await this.validateInput(input);
      
      // Prepare context
      const context = await this.prepareContext(validatedInput);
      
      // Execute before generate hook
      if (this.config.hooks.beforeGenerate) {
        await this.config.hooks.beforeGenerate(context);
      }
      
      // Get template files
      const templateFiles = await this.getTemplateFiles();
      
      // Process each template file
      for (const templateFile of templateFiles) {
        const result = await this.processTemplate(templateFile, context);
        results.push(result);
      }
      
      // Execute after generate hook
      if (this.config.hooks.afterGenerate) {
        await this.config.hooks.afterGenerate(context, results);
      }
      
      const duration = Date.now() - startTime;
      logger.info(`Generation completed in ${duration}ms`);
      
      return results;
      
    } catch (error) {
      logger.error('Generation failed:', error);
      
      if (this.config.hooks.onError) {
        await this.config.hooks.onError(error as Error, {} as GenerationContext);
      }
      
      throw error;
    }
  }
  
  // Process single template file
  protected async processTemplate(
    templateFile: TemplateFile,
    context: GenerationContext
  ): Promise<GenerationResult> {
    const startTime = Date.now();
    const outputPath = this.resolveOutputPath(templateFile.relativePath, context);
    
    try {
      // Skip if not a template and file exists
      if (!templateFile.isTemplate && await fileExists(outputPath)) {
        logger.debug(`Skipping existing file: ${outputPath}`);
        return {
          filePath: outputPath,
          template: templateFile.path,
          success: true,
          skipped: true,
          metrics: {
            size: 0,
            duration: Date.now() - startTime,
          },
        };
      }
      
      // Read template content
      let content = templateFile.content || await readFile(templateFile.path);
      
      // Process template if it's a template file
      if (templateFile.isTemplate) {
        content = this.templateEngine.processTemplateString(content, context.variables);
      }
      
      // Execute before file write hook
      if (this.config.hooks.beforeFileWrite) {
        content = await this.config.hooks.beforeFileWrite(outputPath, content, context);
      }
      
      // Handle conflicts
      const shouldWrite = await this.handleConflict(outputPath, context);
      if (!shouldWrite) {
        return {
          filePath: outputPath,
          template: templateFile.path,
          success: true,
          skipped: true,
          metrics: {
            size: 0,
            duration: Date.now() - startTime,
          },
        };
      }
      
      // Create backup if needed
      if (this.config.backup && await fileExists(outputPath)) {
        await this.createBackup(outputPath);
      }
      
      // Write file
      await this.writeFile(outputPath, content);
      
      // Execute after file write hook
      if (this.config.hooks.afterFileWrite) {
        await this.config.hooks.afterFileWrite(outputPath, context);
      }
      
      // Validate generated file if needed
      if (this.config.validate) {
        await this.validateGeneratedFile(outputPath, content);
      }
      
      this.generatedFiles.add(outputPath);
      
      const size = Buffer.byteLength(content, 'utf8');
      logger.debug(`Generated: ${outputPath} (${size} bytes)`);
      
      return {
        filePath: outputPath,
        template: templateFile.path,
        success: true,
        skipped: false,
        metrics: {
          size,
          duration: Date.now() - startTime,
        },
      };
      
    } catch (error) {
      logger.error(`Failed to process template ${templateFile.path}:`, error);
      
      return {
        filePath: outputPath,
        template: templateFile.path,
        success: false,
        skipped: false,
        error: error as Error,
        metrics: {
          size: 0,
          duration: Date.now() - startTime,
        },
      };
    }
  }
  
  // Resolve output path from template path
  protected resolveOutputPath(templateRelativePath: string, context: GenerationContext): string {
    // Remove template extensions (.hbs, .mustache, .template)
    let cleanPath = templateRelativePath
      .replace(/\.(hbs|mustache|template)$/, '')
      .replace(/\.template\./, '.');
    
    // Process template variables in path
    cleanPath = this.templateEngine.processTemplateString(cleanPath, context.variables);
    
    return path.join(context.outputPath, cleanPath);
  }
  
  // Handle file conflicts
  protected async handleConflict(filePath: string, context: GenerationContext): Promise<boolean> {
    if (!await fileExists(filePath)) {
      return true;
    }
    
    if (this.config.overwrite) {
      return true;
    }
    
    // Use conflict hook if available
    if (this.config.hooks.onConflict) {
      const resolution = await this.config.hooks.onConflict(filePath, context);
      
      switch (resolution) {
        case 'overwrite':
          return true;
        case 'skip':
          return false;
        case 'rename':
          // Would need to modify the output path
          return true;
        default:
          return false;
      }
    }
    
    // Default behavior: skip existing files
    return false;
  }
  
  // Create backup of existing file
  protected async createBackup(filePath: string): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `${filePath}.backup.${timestamp}`;
    
    try {
      const content = await readFile(filePath);
      await writeFile(backupPath, content);
      logger.debug(`Created backup: ${backupPath}`);
    } catch (error) {
      logger.warn(`Failed to create backup for ${filePath}:`, error);
    }
  }
  
  // Write file with proper directory creation
  protected async writeFile(filePath: string, content: string): Promise<void> {
    await ensureDir(path.dirname(filePath));
    await writeFile(filePath, content);
  }
  
  // Validate generated file
  protected async validateGeneratedFile(filePath: string, content: string): Promise<void> {
    // Basic validation - check if file is valid syntax
    const ext = path.extname(filePath);
    
    switch (ext) {
      case '.json':
        try {
          JSON.parse(content);
        } catch (error) {
          throw new Error(`Invalid JSON in ${filePath}: ${error}`);
        }
        break;
      
      case '.js':
      case '.ts':
      case '.jsx':
      case '.tsx':
        // Basic syntax check - ensure it's parseable
        if (content.includes('{{') || content.includes('}}')) {
          throw new Error(`Unprocessed template variables in ${filePath}`);
        }
        break;
    }
  }
  
  // Scan directory for template files
  protected async scanTemplateDirectory(templateDir: string): Promise<TemplateFile[]> {
    const files: TemplateFile[] = [];
    const templateExtensions = ['.hbs', '.mustache', '.template'];
    
    async function scanDir(dir: string, baseDir: string): Promise<void> {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(baseDir, fullPath);
        
        if (entry.isDirectory()) {
          await scanDir(fullPath, baseDir);
        } else if (entry.isFile()) {
          const isTemplate = templateExtensions.some(ext => entry.name.endsWith(ext));
          
          files.push({
            path: fullPath,
            relativePath,
            isTemplate,
          });
        }
      }
    }
    
    if (await fileExists(templateDir)) {
      await scanDir(templateDir, templateDir);
    }
    
    return files;
  }
  
  // Load template files with content
  protected async loadTemplateFiles(templateFiles: TemplateFile[]): Promise<TemplateFile[]> {
    const loaded: TemplateFile[] = [];
    
    for (const file of templateFiles) {
      try {
        const content = await readFile(file.path);
        loaded.push({
          ...file,
          content,
        });
      } catch (error) {
        logger.error(`Failed to load template ${file.path}:`, error);
      }
    }
    
    return loaded;
  }
  
  // Get generation summary
  getSummary(): {
    generated: number;
    skipped: number;
    failed: number;
    files: string[];
  } {
    return {
      generated: this.generatedFiles.size,
      skipped: 0, // Would need to track this
      failed: 0,  // Would need to track this
      files: Array.from(this.generatedFiles),
    };
  }
  
  // Clean up generated files (for rollback)
  async cleanup(): Promise<void> {
    for (const filePath of this.generatedFiles) {
      try {
        if (await fileExists(filePath)) {
          await fs.unlink(filePath);
          logger.debug(`Cleaned up: ${filePath}`);
        }
      } catch (error) {
        logger.warn(`Failed to clean up ${filePath}:`, error);
      }
    }
    
    this.generatedFiles.clear();
  }
}

// Generation pipeline for multiple generators
export class GenerationPipeline {
  private generators: BaseGenerator[] = [];
  
  // Add generator to pipeline
  addGenerator(generator: BaseGenerator): this {
    this.generators.push(generator);
    return this;
  }
  
  // Execute all generators in sequence
  async execute(input: any): Promise<GenerationResult[][]> {
    const allResults: GenerationResult[][] = [];
    
    for (const generator of this.generators) {
      try {
        const results = await generator.generate(input);
        allResults.push(results);
      } catch (error) {
        logger.error(`Generator ${generator.config.name} failed:`, error);
        throw error;
      }
    }
    
    return allResults;
  }
  
  // Get combined summary from all generators
  getSummary(): {
    totalGenerated: number;
    totalSkipped: number;
    totalFailed: number;
    byGenerator: Array<{ name: string; generated: number; files: string[] }>;
  } {
    let totalGenerated = 0;
    let totalSkipped = 0;
    let totalFailed = 0;
    const byGenerator: Array<{ name: string; generated: number; files: string[] }> = [];
    
    for (const generator of this.generators) {
      const summary = generator.getSummary();
      totalGenerated += summary.generated;
      totalSkipped += summary.skipped;
      totalFailed += summary.failed;
      
      byGenerator.push({
        name: generator.config.name,
        generated: summary.generated,
        files: summary.files,
      });
    }
    
    return {
      totalGenerated,
      totalSkipped,
      totalFailed,
      byGenerator,
    };
  }
}

// Utility functions
export function createGenerationContext(
  templatePath: string,
  outputPath: string,
  variables: Record<string, any>,
  config: GeneratorConfig,
  localization?: LocalizationConfig
): GenerationContext {
  return {
    templatePath,
    outputPath,
    variables,
    config,
    localization,
    metadata: {
      timestamp: new Date().toISOString(),
      generator: config.name,
      version: '1.0.0',
    },
  };
}

export function mergeResults(resultArrays: GenerationResult[][]): GenerationResult[] {
  return resultArrays.flat();
}

export function filterResults(
  results: GenerationResult[],
  predicate: (result: GenerationResult) => boolean
): GenerationResult[] {
  return results.filter(predicate);
}

export function groupResultsByTemplate(results: GenerationResult[]): Map<string, GenerationResult[]> {
  const grouped = new Map<string, GenerationResult[]>();
  
  for (const result of results) {
    const template = result.template;
    if (!grouped.has(template)) {
      grouped.set(template, []);
    }
    grouped.get(template)!.push(result);
  }
  
  return grouped;
}