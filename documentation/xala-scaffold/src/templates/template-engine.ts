import path from 'path';
import { promises as fs } from 'fs';
import { logger } from '../utils/logger.js';
import { fileExists, readFile, writeFile, ensureDir } from '../utils/fs.js';

// Template engine configuration
export interface TemplateEngineConfig {
  templateDir: string;
  outputDir: string;
  partialDir?: string;
  helperDir?: string;
  defaultExtension: string;
  preserveExtensions: string[];
  globalContext: Record<string, any>;
  enableCaching: boolean;
  enablePartials: boolean;
  enableHelpers: boolean;
  customDelimiters: {
    open: string;
    close: string;
  };
}

// Template context interface
export interface TemplateContext {
  [key: string]: any;
  // Standard variables available in all templates
  projectName?: string;
  author?: string;
  timestamp?: string;
  version?: string;
  platform?: 'nextjs' | 'react' | 'nestjs' | 'library';
  styling?: 'tailwind' | 'styled-components' | 'css-modules';
  localization?: {
    defaultLocale: string;
    supportedLocales: string[];
    rtlLocales: string[];
  };
  compliance?: {
    nsm: boolean;
    gdpr: boolean;
    wcag: string;
  };
}

// Template metadata
export interface TemplateMetadata {
  name: string;
  description: string;
  category: string;
  tags: string[];
  requiredContext: string[];
  optionalContext: string[];
  dependencies: string[];
  platform: string[];
  version: string;
  author: string;
}

// Template processing result
export interface TemplateResult {
  content: string;
  metadata: TemplateMetadata;
  generatedFiles: string[];
  dependencies: string[];
  warnings: string[];
  errors: string[];
}

// Template helper function type
export type TemplateHelper = (context: TemplateContext, ...args: any[]) => string;

// Template partial type
export interface TemplatePartial {
  name: string;
  content: string;
  context?: Record<string, any>;
}

// Template engine implementation
export class TemplateEngine {
  private config: TemplateEngineConfig;
  private templateCache = new Map<string, string>();
  private partialCache = new Map<string, TemplatePartial>();
  private helpers = new Map<string, TemplateHelper>();
  private metadataCache = new Map<string, TemplateMetadata>();
  
  constructor(config: Partial<TemplateEngineConfig> = {}) {
    this.config = {
      templateDir: 'templates',
      outputDir: 'output',
      partialDir: 'templates/partials',
      helperDir: 'templates/helpers',
      defaultExtension: '.hbs',
      preserveExtensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.md'],
      globalContext: {},
      enableCaching: true,
      enablePartials: true,
      enableHelpers: true,
      customDelimiters: {
        open: '{{',
        close: '}}',
      },
      ...config,
    };
    
    this.registerBuiltinHelpers();
  }
  
  // Main template processing method
async renderTemplate(
    templateName: string,
    context: TemplateContext = {},
    outputPath?: string
  ): Promise<TemplateResult> {
    const startTime = Date.now();
    const result: TemplateResult = {
      content: '',
      metadata: {} as TemplateMetadata,
      generatedFiles: [],
      dependencies: [],
      warnings: [],
      errors: [],
    };
    
    try {
      logger.info(`Rendering template: ${templateName}`);
      
      // Load template content
      const templateContent = await this.loadTemplate(templateName);
      if (!templateContent) {
        throw new Error(`Template not found: ${templateName}`);
      }
      
      // Load template metadata
      result.metadata = await this.loadTemplateMetadata(templateName);
      
      // Validate required context
      const missingContext = this.validateContext(context, result.metadata);
      if (missingContext.length > 0) {
        result.warnings.push(`Missing context variables: ${missingContext.join(', ')}`);
      }
      
      // Merge context with global context
      const mergedContext = this.mergeContext(context);
      
      // Process template
      result.content = await this.processTemplate(templateContent, mergedContext);
      
      // Write output if path specified
      if (outputPath) {
        await this.writeOutput(outputPath, result.content, templateName);
        result.generatedFiles.push(outputPath);
      }
      
      logger.info(`Template rendered successfully in ${Date.now() - startTime}ms`);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      result.errors.push(errorMessage);
      logger.error(`Template rendering failed: ${errorMessage}`);
    }
    
    return result;
  }
  
  // Render multiple templates
  async renderTemplates(
    templates: Array<{ name: string; context: TemplateContext; outputPath?: string }>,
    globalContext: TemplateContext = {}
  ): Promise<TemplateResult[]> {
    const results: TemplateResult[] = [];
    
    for (const template of templates) {
      const mergedContext = { ...globalContext, ...template.context };
      const result = await this.renderTemplate(template.name, mergedContext, template.outputPath);
      results.push(result);
    }
    
    return results;
  }
  
  // Load template from file system
  private async loadTemplate(templateName: string): Promise<string | null> {
    // Check cache first
    if (this.config.enableCaching && this.templateCache.has(templateName)) {
      return this.templateCache.get(templateName)!;
    }
    
    // Resolve template path
    const templatePath = await this.resolveTemplatePath(templateName);
    if (!templatePath) {
      return null;
    }
    
    // Load template content
    const content = await readFile(templatePath);
    
    // Cache if enabled
    if (this.config.enableCaching) {
      this.templateCache.set(templateName, content);
    }
    
    return content;
  }
  
  // Resolve template file path
  private async resolveTemplatePath(templateName: string): Promise<string | null> {
    const extensions = [this.config.defaultExtension, ...this.config.preserveExtensions];
    
    for (const ext of extensions) {
      const templatePath = path.join(this.config.templateDir, `${templateName}${ext}`);
      
      if (await fileExists(templatePath)) {
        return templatePath;
      }
    }
    
    // Try without extension (in case it's already included)
    const directPath = path.join(this.config.templateDir, templateName);
    if (await fileExists(directPath)) {
      return directPath;
    }
    
    return null;
  }
  
  // Load template metadata
  private async loadTemplateMetadata(templateName: string): Promise<TemplateMetadata> {
    // Check cache first
    if (this.metadataCache.has(templateName)) {
      return this.metadataCache.get(templateName)!;
    }
    
    // Look for metadata file
    const metadataPath = path.join(
      this.config.templateDir,
      `${templateName}.meta.json`
    );
    
    let metadata: TemplateMetadata;
    
    if (await fileExists(metadataPath)) {
      const metadataContent = await readFile(metadataPath);
      metadata = JSON.parse(metadataContent);
    } else {
      // Default metadata
      metadata = {
        name: templateName,
        description: `Template: ${templateName}`,
        category: 'general',
        tags: [],
        requiredContext: [],
        optionalContext: [],
        dependencies: [],
        platform: ['all'],
        version: '1.0.0',
        author: 'Xala Scaffold',
      };
    }
    
    // Cache metadata
    this.metadataCache.set(templateName, metadata);
    
    return metadata;
  }
  
  // Process template content
  private async processTemplate(content: string, context: TemplateContext): Promise<string> {
    let processedContent = content;
    
    // Process partials first
    if (this.config.enablePartials) {
      processedContent = await this.processPartials(processedContent, context);
    }
    
    // Process variables and expressions
    processedContent = this.processVariables(processedContent, context);
    
    // Process helpers
    if (this.config.enableHelpers) {
      processedContent = this.processHelpers(processedContent, context);
    }
    
    // Process conditionals
    processedContent = this.processConditionals(processedContent, context);
    
    // Process loops
    processedContent = this.processLoops(processedContent, context);
    
    return processedContent;
  }
  
  // Process partials (included templates)
  private async processPartials(content: string, context: TemplateContext): Promise<string> {
    const partialRegex = new RegExp(
      `${this.escapeRegex(this.config.customDelimiters.open)}\\s*>\\s*([\\w\\-\\/]+)\\s*${this.escapeRegex(this.config.customDelimiters.close)}`,
      'g'
    );
    
    let processedContent = content;
    let match;
    
    while ((match = partialRegex.exec(content)) !== null) {
      const partialName = match[1];
      const partialContent = await this.loadPartial(partialName);
      
      if (partialContent) {
        const processedPartial = await this.processTemplate(partialContent.content, {
          ...context,
          ...partialContent.context,
        });
        
        processedContent = processedContent.replace(match[0], processedPartial);
      } else {
        logger.warn(`Partial not found: ${partialName}`);
        processedContent = processedContent.replace(match[0], `<!-- Partial not found: ${partialName} -->`);
      }
    }
    
    return processedContent;
  }
  
  // Load partial template
  private async loadPartial(partialName: string): Promise<TemplatePartial | null> {
    // Check cache first
    if (this.partialCache.has(partialName)) {
      return this.partialCache.get(partialName)!;
    }
    
    const partialPath = path.join(this.config.partialDir || 'templates/partials', `${partialName}${this.config.defaultExtension}`);
    
    if (await fileExists(partialPath)) {
      const content = await readFile(partialPath);
      const partial: TemplatePartial = {
        name: partialName,
        content,
      };
      
      // Cache partial
      this.partialCache.set(partialName, partial);
      
      return partial;
    }
    
    return null;
  }
  
  // Process variables and simple expressions
  private processVariables(content: string, context: TemplateContext): string {
    const variableRegex = new RegExp(
      `${this.escapeRegex(this.config.customDelimiters.open)}\\s*([\\w\\.\\[\\]]+)\\s*${this.escapeRegex(this.config.customDelimiters.close)}`,
      'g'
    );
    
    return content.replace(variableRegex, (match, variable) => {
      const value = this.resolveVariable(variable, context);
      return value !== undefined ? String(value) : match;
    });
  }
  
  // Process helper functions
  private processHelpers(content: string, context: TemplateContext): string {
    const helperRegex = new RegExp(
      `${this.escapeRegex(this.config.customDelimiters.open)}\\s*([\\w]+)\\s+([^}]+)\\s*${this.escapeRegex(this.config.customDelimiters.close)}`,
      'g'
    );
    
    return content.replace(helperRegex, (match, helperName, args) => {
      const helper = this.helpers.get(helperName);
      
      if (helper) {
        try {
          const parsedArgs = this.parseHelperArgs(args, context);
          return helper(context, ...parsedArgs);
        } catch (error) {
          logger.warn(`Helper execution failed: ${helperName} - ${error}`);
          return match;
        }
      }
      
      return match;
    });
  }
  
  // Process conditional statements
  private processConditionals(content: string, context: TemplateContext): string {
    const conditionalRegex = new RegExp(
      `${this.escapeRegex(this.config.customDelimiters.open)}#if\\s+([^}]+)${this.escapeRegex(this.config.customDelimiters.close)}([\\s\\S]*?)${this.escapeRegex(this.config.customDelimiters.open)}\\/if${this.escapeRegex(this.config.customDelimiters.close)}`,
      'g'
    );
    
    return content.replace(conditionalRegex, (match, condition, body) => {
      const conditionResult = this.evaluateCondition(condition, context);
      return conditionResult ? body : '';
    });
  }
  
  // Process loop statements
  private processLoops(content: string, context: TemplateContext): string {
    const loopRegex = new RegExp(
      `${this.escapeRegex(this.config.customDelimiters.open)}#each\\s+([\\w\\.\\[\\]]+)\\s+as\\s+(\\w+)(?:\\s+(\\w+))?${this.escapeRegex(this.config.customDelimiters.close)}([\\s\\S]*?)${this.escapeRegex(this.config.customDelimiters.open)}\\/each${this.escapeRegex(this.config.customDelimiters.close)}`,
      'g'
    );
    
    return content.replace(loopRegex, (match, arrayVar, itemVar, indexVar, body) => {
      const array = this.resolveVariable(arrayVar, context);
      
      if (!Array.isArray(array)) {
        return '';
      }
      
      return array.map((item, index) => {
        const loopContext = {
          ...context,
          [itemVar]: item,
          ...(indexVar && { [indexVar]: index }),
        };
        
        return this.processVariables(body, loopContext);
      }).join('');
    });
  }
  
  // Resolve variable from context using dot notation
  private resolveVariable(variable: string, context: TemplateContext): any {
    const parts = variable.split('.');
    let current = context;
    
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return undefined;
      }
    }
    
    return current;
  }
  
  // Evaluate condition expression
  private evaluateCondition(condition: string, context: TemplateContext): boolean {
    // Simple condition evaluation
    const trimmed = condition.trim();
    
    // Handle negation
    if (trimmed.startsWith('!')) {
      return !this.evaluateCondition(trimmed.slice(1), context);
    }
    
    // Handle equality
    if (trimmed.includes('===')) {
      const [left, right] = trimmed.split('===').map(s => s.trim());
      return this.resolveVariable(left, context) === this.parseValue(right, context);
    }
    
    if (trimmed.includes('!==')) {
      const [left, right] = trimmed.split('!==').map(s => s.trim());
      return this.resolveVariable(left, context) !== this.parseValue(right, context);
    }
    
    // Handle simple truthy check
    const value = this.resolveVariable(trimmed, context);
    return Boolean(value);
  }
  
  // Parse helper arguments
  private parseHelperArgs(args: string, context: TemplateContext): any[] {
    return args.split(/\s+/).map(arg => this.parseValue(arg, context));
  }
  
  // Parse value (string, number, boolean, or variable reference)
  private parseValue(value: string, context: TemplateContext): any {
    const trimmed = value.trim();
    
    // String literal
    if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
        (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
      return trimmed.slice(1, -1);
    }
    
    // Number
    if (/^\d+(\.\d+)?$/.test(trimmed)) {
      return parseFloat(trimmed);
    }
    
    // Boolean
    if (trimmed === 'true' || trimmed === 'false') {
      return trimmed === 'true';
    }
    
    // Variable reference
    return this.resolveVariable(trimmed, context);
  }
  
  // Validate required context variables
  private validateContext(context: TemplateContext, metadata: TemplateMetadata): string[] {
    const missing: string[] = [];
    
    for (const required of metadata.requiredContext) {
      if (this.resolveVariable(required, context) === undefined) {
        missing.push(required);
      }
    }
    
    return missing;
  }
  
  // Merge context with global context
  private mergeContext(context: TemplateContext): TemplateContext {
    return {
      ...this.config.globalContext,
      ...context,
      // Add standard variables
      timestamp: new Date().toISOString(),
    };
  }
  
  // Write output to file
  private async writeOutput(outputPath: string, content: string, templateName: string): Promise<void> {
    await ensureDir(path.dirname(outputPath));
    await writeFile(outputPath, content);
    logger.debug(`Template output written: ${outputPath}`);
  }
  
  // Register built-in helper functions
  private registerBuiltinHelpers(): void {
    // String helpers
    this.helpers.set('uppercase', (context, str) => String(str).toUpperCase());
    this.helpers.set('lowercase', (context, str) => String(str).toLowerCase());
    this.helpers.set('capitalize', (context, str) => {
      const s = String(str);
      return s.charAt(0).toUpperCase() + s.slice(1);
    });
    this.helpers.set('pascalCase', (context, str) => {
      return String(str).replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return word.toUpperCase();
      }).replace(/\s+/g, '');
    });
    this.helpers.set('camelCase', (context, str) => {
      const pascal = this.helpers.get('pascalCase')!(context, str);
      return pascal.charAt(0).toLowerCase() + pascal.slice(1);
    });
    this.helpers.set('kebabCase', (context, str) => {
      return String(str).replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    });
    
    // Array helpers
    this.helpers.set('join', (context, array, separator = ', ') => {
      return Array.isArray(array) ? array.join(separator) : '';
    });
    this.helpers.set('length', (context, array) => {
      return Array.isArray(array) ? array.length : 0;
    });
    
    // Conditional helpers
    this.helpers.set('eq', (context, a, b) => a === b ? 'true' : '');
    this.helpers.set('ne', (context, a, b) => a !== b ? 'true' : '');
    this.helpers.set('gt', (context, a, b) => a > b ? 'true' : '');
    this.helpers.set('lt', (context, a, b) => a < b ? 'true' : '');
    
    // Norwegian compliance helpers
    this.helpers.set('nsmClassification', (context, level = 'OPEN') => {
      const classifications = {
        'OPEN': 'NSM Classification: OPEN',
        'RESTRICTED': 'NSM Classification: RESTRICTED',
        'CONFIDENTIAL': 'NSM Classification: CONFIDENTIAL',
        'SECRET': 'NSM Classification: SECRET',
      };
      return classifications[level as keyof typeof classifications] || classifications.OPEN;
    });
    
    this.helpers.set('gdprNotice', (context) => {
      return '// GDPR Compliance: This component handles personal data according to GDPR requirements';
    });
    
    this.helpers.set('wcagLevel', (context, level = 'AAA') => {
      return `// WCAG ${level} Compliance: This component meets accessibility standards`;
    });
    
    // Date helpers
    this.helpers.set('formatDate', (context, date, format = 'YYYY-MM-DD') => {
      const d = new Date(date || new Date());
      return d.toISOString().split('T')[0]; // Simple ISO date format
    });
    
    // File helpers
    this.helpers.set('fileName', (context, filePath) => {
      return path.basename(String(filePath));
    });
    this.helpers.set('fileExt', (context, filePath) => {
      return path.extname(String(filePath));
    });
  }
  
  // Register custom helper
  registerHelper(name: string, helper: TemplateHelper): void {
    this.helpers.set(name, helper);
    logger.debug(`Registered template helper: ${name}`);
  }
  
  // Register multiple helpers
  registerHelpers(helpers: Record<string, TemplateHelper>): void {
    for (const [name, helper] of Object.entries(helpers)) {
      this.registerHelper(name, helper);
    }
  }
  
  // Clear template cache
  clearCache(): void {
    this.templateCache.clear();
    this.partialCache.clear();
    this.metadataCache.clear();
    logger.debug('Template cache cleared');
  }
  
  // List available templates
  async listTemplates(): Promise<string[]> {
    const templates: string[] = [];
    
    try {
      const files = await fs.readdir(this.config.templateDir);
      
      for (const file of files) {
        if (file.endsWith(this.config.defaultExtension)) {
          templates.push(path.basename(file, this.config.defaultExtension));
        }
      }
    } catch (error) {
      logger.error('Failed to list templates:', error);
    }
    
    return templates;
  }
  
  // Utility methods
  private escapeRegex(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

// Export utility functions
export function createTemplateEngine(config?: Partial<TemplateEngineConfig>): TemplateEngine {
  return new TemplateEngine(config);
}

export function getDefaultTemplateConfig(): TemplateEngineConfig {
  return {
    templateDir: 'templates',
    outputDir: 'output',
    partialDir: 'templates/partials',
    helperDir: 'templates/helpers',
    defaultExtension: '.hbs',
    preserveExtensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.md'],
    globalContext: {},
    enableCaching: true,
    enablePartials: true,
    enableHelpers: true,
    customDelimiters: {
      open: '{{',
      close: '}}',
    },
  };
}