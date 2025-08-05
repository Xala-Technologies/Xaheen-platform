/**
 * Core Interfaces for Xaheen CLI
 * Defines contracts for all major services following Interface Segregation Principle
 */

export interface ILogger {
  readonly info: (message: string, ...args: any[]) => void;
  readonly success: (message: string, ...args: any[]) => void;
  readonly warn: (message: string, ...args: any[]) => void;
  readonly error: (message: string, error?: any) => void;
}

export interface IFileSystem {
  readonly exists: (path: string) => Promise<boolean>;
  readonly readFile: (path: string) => Promise<string>;
  readonly writeFile: (path: string, content: string) => Promise<void>;
  readonly ensureDirectory: (path: string) => Promise<void>;
  readonly deleteFile: (path: string) => Promise<void>;
}

export interface ITemplateEngine {
  readonly compile: (template: string) => Promise<TemplateFunction>;
  readonly render: (templatePath: string, data: any) => Promise<string>;
  readonly registerHelper: (name: string, helper: Function) => void;
  readonly registerPartial: (name: string, partial: string) => void;
}

export interface INamingService {
  readonly toPascalCase: (str: string) => string;
  readonly toCamelCase: (str: string) => string;
  readonly toKebabCase: (str: string) => string;
  readonly toSnakeCase: (str: string) => string;
  readonly toConstantCase: (str: string) => string;
  readonly getNamingConvention: (name: string) => NamingConvention;
}

export interface IProjectAnalyzer {
  readonly detectFramework: () => Promise<FrameworkType>;
  readonly detectTypeScript: () => Promise<boolean>;
  readonly detectStructure: () => Promise<ProjectStructure>;
  readonly validateProject: () => Promise<ProjectValidation>;
}

export interface ICodeGenerator<TOptions extends GeneratorOptions> {
  readonly generate: (options: TOptions) => Promise<GeneratorResult>;
  readonly validate: (options: TOptions) => Promise<void>;
  readonly getType: () => string;
}

export interface ICommandHandler<TOptions = any> {
  readonly handle: (options: TOptions) => Promise<CommandResult>;
  readonly validate: (options: TOptions) => Promise<void>;
  readonly getHelp: () => CommandHelp;
}

export interface IDependencyInjector {
  readonly register: <T>(token: string | symbol, implementation: new (...args: any[]) => T) => void;
  readonly registerSingleton: <T>(token: string | symbol, implementation: new (...args: any[]) => T) => void;
  readonly registerInstance: <T>(token: string | symbol, instance: T) => void;
  readonly resolve: <T>(token: string | symbol) => T;
  readonly create: <T>(constructor: new (...args: any[]) => T) => T;
}

export interface IServiceRegistry {
  readonly get: <T>(name: string) => T;
  readonly has: (name: string) => boolean;
  readonly register: <T>(name: string, service: T) => void;
  readonly unregister: (name: string) => void;
}

// Type definitions
export interface TemplateFunction {
  (data: any): string;
}

export interface GeneratorOptions {
  readonly name: string;
  readonly dryRun?: boolean;
  readonly force?: boolean;
  readonly typescript?: boolean;
}

export interface GeneratorResult {
  readonly success: boolean;
  readonly message: string;
  readonly files?: readonly string[];
  readonly commands?: readonly string[];
  readonly nextSteps?: readonly string[];
}

export interface CommandResult {
  readonly success: boolean;
  readonly message: string;
  readonly data?: any;
}

export interface CommandHelp {
  readonly description: string;
  readonly usage: string;
  readonly examples: readonly string[];
  readonly options: readonly CommandOption[];
}

export interface CommandOption {
  readonly name: string;
  readonly description: string;
  readonly required: boolean;
  readonly type: 'string' | 'boolean' | 'number';
}

export interface NamingConvention {
  readonly className: string;
  readonly fileName: string;
  readonly variableName: string;
  readonly constantName: string;
  readonly kebabCase: string;
  readonly snakeCase: string;
}

export interface ProjectStructure {
  readonly framework: FrameworkType;
  readonly usesTypeScript: boolean;
  readonly usesStorybook: boolean;
  readonly usesJest: boolean;
  readonly componentsDir: string;
  readonly pagesDir?: string;
}

export interface ProjectValidation {
  readonly isValid: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
}

export type FrameworkType = 'next' | 'react' | 'vue' | 'angular' | 'svelte' | 'unknown';

// Service tokens for dependency injection
export const SERVICE_TOKENS = {
  LOGGER: Symbol('ILogger'),
  FILE_SYSTEM: Symbol('IFileSystem'),
  TEMPLATE_ENGINE: Symbol('ITemplateEngine'),
  NAMING_SERVICE: Symbol('INamingService'),
  PROJECT_ANALYZER: Symbol('IProjectAnalyzer'),
  DEPENDENCY_INJECTOR: Symbol('IDependencyInjector'),
  SERVICE_REGISTRY: Symbol('IServiceRegistry'),
} as const;