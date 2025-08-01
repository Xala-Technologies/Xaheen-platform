import { promises as fs } from 'fs';
import path from 'path';
import { logger } from './logger.js';
import { fileExists, readFile, processTemplate } from './fs.js';

// Template metadata interface
interface TemplateMetadata {
  name: string;
  description: string;
  version: string;
  author?: string;
  tags?: string[];
  variables?: Record<string, TemplateVariable>;
  files?: string[];
  scripts?: TemplateScript[];
}

// Template variable definition
interface TemplateVariable {
  type: 'string' | 'boolean' | 'number' | 'select' | 'multiselect';
  description: string;
  default?: any;
  required?: boolean;
  options?: string[] | { label: string; value: any }[];
  validate?: (value: any) => boolean | string;
}

// Template script definition
interface TemplateScript {
  name: string;
  description: string;
  command: string;
  when?: string; // Condition expression
}

// Template context
export interface TemplateContext {
  // User-provided variables
  [key: string]: any;
  
  // Built-in variables
  projectName: string;
  projectPath: string;
  timestamp: string;
  year: number;
  locale: string;
  platform: 'web' | 'mobile' | 'desktop';
  author?: string;
  email?: string;
  license?: string;
}

// Template engine class
export class TemplateEngine {
  private templateCache = new Map<string, TemplateMetadata>();
  private helperFunctions: Map<string, Function> = new Map();
  
  constructor() {
    // Register built-in helpers
    this.registerBuiltInHelpers();
  }
  
  private registerBuiltInHelpers(): void {
    // String helpers
    this.registerHelper('capitalize', (str: string) => 
      str.charAt(0).toUpperCase() + str.slice(1)
    );
    
    this.registerHelper('camelCase', (str: string) => 
      str.replace(/[-_\s]+(\w)/g, (_, char) => char.toUpperCase())
    );
    
    this.registerHelper('pascalCase', (str: string) => {
      const camel = this.helperFunctions.get('camelCase')!(str);
      return camel.charAt(0).toUpperCase() + camel.slice(1);
    });
    
    this.registerHelper('kebabCase', (str: string) => 
      str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)
        .replace(/^-/, '')
        .replace(/\s+/g, '-')
        .toLowerCase()
    );
    
    this.registerHelper('snakeCase', (str: string) => 
      str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
        .replace(/^_/, '')
        .replace(/\s+/g, '_')
        .toLowerCase()
    );
    
    // Conditional helpers
    this.registerHelper('if', (condition: any, truthy: any, falsy?: any) => 
      condition ? truthy : (falsy || '')
    );
    
    this.registerHelper('unless', (condition: any, truthy: any, falsy?: any) => 
      !condition ? truthy : (falsy || '')
    );
    
    // Array helpers
    this.registerHelper('join', (arr: any[], separator = ', ') => 
      Array.isArray(arr) ? arr.join(separator) : ''
    );
    
    this.registerHelper('first', (arr: any[]) => 
      Array.isArray(arr) && arr.length > 0 ? arr[0] : ''
    );
    
    this.registerHelper('last', (arr: any[]) => 
      Array.isArray(arr) && arr.length > 0 ? arr[arr.length - 1] : ''
    );
    
    // Date helpers
    this.registerHelper('date', (format?: string) => {
      const now = new Date();
      if (!format) return now.toISOString();
      
      return format
        .replace('YYYY', String(now.getFullYear()))
        .replace('MM', String(now.getMonth() + 1).padStart(2, '0'))
        .replace('DD', String(now.getDate()).padStart(2, '0'))
        .replace('HH', String(now.getHours()).padStart(2, '0'))
        .replace('mm', String(now.getMinutes()).padStart(2, '0'))
        .replace('ss', String(now.getSeconds()).padStart(2, '0'));
    });
    
    // Localization helpers
    this.registerHelper('rtl', (locale: string) => 
      ['ar', 'he', 'fa', 'ur'].some(rtl => locale.startsWith(rtl))
    );
    
    this.registerHelper('langCode', (locale: string) => 
      locale.split('-')[0]
    );
  }
  
  // Register custom helper function
  registerHelper(name: string, fn: Function): void {
    this.helperFunctions.set(name, fn);
    logger.debug(`Registered template helper: ${name}`);
  }
  
  // Load template metadata
  async loadTemplate(templatePath: string): Promise<TemplateMetadata> {
    // Check cache first
    if (this.templateCache.has(templatePath)) {
      return this.templateCache.get(templatePath)!;
    }
    
    const metadataPath = path.join(templatePath, 'template.json');
    
    if (!(await fileExists(metadataPath))) {
      throw new Error(`Template metadata not found: ${metadataPath}`);
    }
    
    try {
      const metadata = JSON.parse(await readFile(metadataPath));
      this.templateCache.set(templatePath, metadata);
      logger.debug(`Loaded template: ${metadata.name}`);
      return metadata;
    } catch (error) {
      logger.error(`Failed to load template metadata: ${metadataPath}`, error);
      throw error;
    }
  }
  
  // Process template string with context
  processTemplateString(template: string, context: TemplateContext): string {
    let result = template;
    
    // Process conditional blocks {{#if condition}}...{{/if}}
    result = this.processConditionals(result, context);
    
    // Process loops {{#each array}}...{{/each}}
    result = this.processLoops(result, context);
    
    // Process helper functions {{helper arg1 arg2}}
    result = this.processHelpers(result, context);
    
    // Process variables {{variable}}
    result = this.processVariables(result, context);
    
    return result;
  }
  
  private processConditionals(template: string, context: TemplateContext): string {
    const ifRegex = /\{\{#if\s+([^}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
    const unlessRegex = /\{\{#unless\s+([^}]+)\}\}([\s\S]*?)\{\{\/unless\}\}/g;
    
    // Process if blocks
    template = template.replace(ifRegex, (match, condition, content) => {
      const value = this.evaluateExpression(condition, context);
      return value ? content : '';
    });
    
    // Process unless blocks
    template = template.replace(unlessRegex, (match, condition, content) => {
      const value = this.evaluateExpression(condition, context);
      return !value ? content : '';
    });
    
    return template;
  }
  
  private processLoops(template: string, context: TemplateContext): string {
    const eachRegex = /\{\{#each\s+([^}]+)\}\}([\s\S]*?)\{\{\/each\}\}/g;
    
    return template.replace(eachRegex, (match, arrayPath, content) => {
      const array = this.getValueFromPath(arrayPath, context);
      
      if (!Array.isArray(array)) {
        logger.warn(`Expected array for {{#each ${arrayPath}}}, got ${typeof array}`);
        return '';
      }
      
      return array.map((item, index) => {
        const itemContext = {
          ...context,
          item,
          index,
          first: index === 0,
          last: index === array.length - 1,
        };
        
        return this.processTemplateString(content, itemContext);
      }).join('');
    });
  }
  
  private processHelpers(template: string, context: TemplateContext): string {
    const helperRegex = /\{\{(\w+)\s+([^}]+)\}\}/g;
    
    return template.replace(helperRegex, (match, helperName, args) => {
      const helper = this.helperFunctions.get(helperName);
      
      if (!helper) {
        // Not a helper, return original
        return match;
      }
      
      try {
        // Parse arguments
        const parsedArgs = this.parseHelperArgs(args, context);
        const result = helper(...parsedArgs);
        return String(result);
      } catch (error) {
        logger.warn(`Helper ${helperName} failed:`, error);
        return match;
      }
    });
  }
  
  private processVariables(template: string, context: TemplateContext): string {
    const variableRegex = /\{\{([^}]+)\}\}/g;
    
    return template.replace(variableRegex, (match, variable) => {
      const trimmed = variable.trim();
      
      // Skip if it's a helper or block
      if (trimmed.startsWith('#') || trimmed.startsWith('/') || trimmed.includes(' ')) {
        return match;
      }
      
      const value = this.getValueFromPath(trimmed, context);
      return value !== undefined ? String(value) : match;
    });
  }
  
  private evaluateExpression(expression: string, context: TemplateContext): any {
    try {
      // Simple expression evaluation
      const trimmed = expression.trim();
      
      // Handle simple comparisons
      if (trimmed.includes('===')) {
        const [left, right] = trimmed.split('===').map(s => s.trim());
        return this.getValueFromPath(left, context) === this.getValueFromPath(right, context);
      }
      
      if (trimmed.includes('!==')) {
        const [left, right] = trimmed.split('!==').map(s => s.trim());
        return this.getValueFromPath(left, context) !== this.getValueFromPath(right, context);
      }
      
      // Handle negation
      if (trimmed.startsWith('!')) {
        return !this.getValueFromPath(trimmed.slice(1), context);
      }
      
      // Simple variable lookup
      return this.getValueFromPath(trimmed, context);
    } catch (error) {
      logger.warn(`Failed to evaluate expression: ${expression}`, error);
      return false;
    }
  }
  
  private getValueFromPath(path: string, context: any): any {
    const keys = path.split('.');
    let value = context;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return undefined;
      }
    }
    
    return value;
  }
  
  private parseHelperArgs(argsString: string, context: TemplateContext): any[] {
    const args: any[] = [];
    const regex = /(['"])((?:\\.|(?!\1).)*?)\1|([^\s]+)/g;
    let match;
    
    while ((match = regex.exec(argsString)) !== null) {
      const arg = match[2] || match[3];
      
      // Try to parse as number
      if (/^\d+$/.test(arg)) {
        args.push(parseInt(arg, 10));
      } else if (/^\d+\.\d+$/.test(arg)) {
        args.push(parseFloat(arg));
      } else if (arg === 'true') {
        args.push(true);
      } else if (arg === 'false') {
        args.push(false);
      } else if (arg === 'null') {
        args.push(null);
      } else if (match[2]) {
        // Quoted string
        args.push(match[2]);
      } else {
        // Variable reference
        args.push(this.getValueFromPath(arg, context));
      }
    }
    
    return args;
  }
  
  // Process file path templates
  processFilePath(filePath: string, context: TemplateContext): string {
    // Replace template variables in file paths
    return filePath.replace(/\[([^\]]+)\]/g, (match, variable) => {
      const value = this.getValueFromPath(variable, context);
      return value !== undefined ? String(value) : match;
    });
  }
  
  // Validate template variables
  async validateVariables(
    metadata: TemplateMetadata,
    providedVars: Record<string, any>
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    if (!metadata.variables) {
      return { valid: true, errors: [] };
    }
    
    for (const [name, varDef] of Object.entries(metadata.variables)) {
      const value = providedVars[name];
      
      // Check required
      if (varDef.required && value === undefined) {
        errors.push(`Variable "${name}" is required`);
        continue;
      }
      
      // Skip if not provided and not required
      if (value === undefined) {
        continue;
      }
      
      // Type validation
      const actualType = typeof value;
      if (varDef.type === 'number' && actualType !== 'number') {
        errors.push(`Variable "${name}" must be a number`);
      } else if (varDef.type === 'boolean' && actualType !== 'boolean') {
        errors.push(`Variable "${name}" must be a boolean`);
      } else if (varDef.type === 'string' && actualType !== 'string') {
        errors.push(`Variable "${name}" must be a string`);
      }
      
      // Options validation
      if (varDef.options && varDef.type === 'select') {
        const validOptions = varDef.options.map(opt => 
          typeof opt === 'object' ? opt.value : opt
        );
        if (!validOptions.includes(value)) {
          errors.push(`Variable "${name}" must be one of: ${validOptions.join(', ')}`);
        }
      }
      
      // Custom validation
      if (varDef.validate) {
        const result = varDef.validate(value);
        if (typeof result === 'string') {
          errors.push(`Variable "${name}": ${result}`);
        } else if (!result) {
          errors.push(`Variable "${name}" failed validation`);
        }
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// Create default instance
export const templateEngine = new TemplateEngine();

// Export convenience functions
export function processTemplateString(template: string, context: TemplateContext): string {
  return templateEngine.processTemplateString(template, context);
}

export function processFilePath(filePath: string, context: TemplateContext): string {
  return templateEngine.processFilePath(filePath, context);
}

export async function loadTemplate(templatePath: string): Promise<TemplateMetadata> {
  return templateEngine.loadTemplate(templatePath);
}

export async function validateTemplateVariables(
  metadata: TemplateMetadata,
  variables: Record<string, any>
): Promise<{ valid: boolean; errors: string[] }> {
  return templateEngine.validateVariables(metadata, variables);
}