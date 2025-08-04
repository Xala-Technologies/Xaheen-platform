// Core type definitions for the Xaheen CLI
import { z } from 'zod';

// Base CLI command structure
export interface CLICommand {
  domain: string;
  action: string;
  target?: string;
  options: Record<string, any>;
}

// Domain types - Comprehensive set for Xaheen CLI
export type CLIDomain = 
  // Artisan-inspired commands
  | 'make'        // Creation commands (make:model, make:controller, etc.)
  | 'migrate'     // Database migrations
  | 'db'          // Database operations  
  | 'route'       // Route management
  | 'cache'       // Cache management
  | 'queue'       // Queue operations
  | 'serve'       // Development server
  | 'tinker'      // Interactive REPL
  | 'test'        // Testing commands
  | 'optimize'    // Optimization commands
  // Original domains
  | 'project'     // Project management
  | 'app'         // App management (monorepo)
  | 'package'     // Package management (monorepo)
  | 'service'     // Service management
  | 'component'   // Component generation
  | 'page'        // Page generation
  | 'model'       // Model generation
  | 'theme'       // Theme management
  | 'ai'          // AI-enhanced features
  | 'validate'    // Validation
  | 'build'       // Build commands
  | 'mcp'         // Model Context Protocol
  | 'help';       // Help system

export type CLIAction = 
  | 'create' 
  | 'add' 
  | 'remove' 
  | 'update' 
  | 'list' 
  | 'generate' 
  | 'deploy' 
  | 'sync' 
  | 'validate' 
  | 'migrate'
  | 'scaffold'
  // Make-specific actions
  | 'model'
  | 'controller'
  | 'service'
  | 'component'
  | 'migration'
  | 'seeder'
  | 'factory'
  | 'crud'
  | 'analyze'
  // Help-specific actions
  | 'show'
  | 'search'
  | 'examples';

// Xaheen configuration schema
export const XaheenConfigSchema = z.object({
  version: z.string().default('3.0.0'),
  project: z.object({
    name: z.string(),
    framework: z.string(),
    packageManager: z.enum(['npm', 'yarn', 'pnpm', 'bun']).default('bun'),
  }),
  services: z.record(z.object({
    provider: z.string(),
    version: z.string().optional(),
    config: z.record(z.any()).optional(),
  })).optional(),
  design: z.object({
    platform: z.enum(['react', 'vue', 'angular', 'svelte', 'flutter', 'react-native']).optional(),
    theme: z.string().optional(),
    tokens: z.string().optional(),
  }).optional(),
  ai: z.object({
    provider: z.enum(['openai', 'anthropic', 'local']).optional(),
    model: z.string().optional(),
    apiKey: z.string().optional(),
  }).optional(),
  compliance: z.object({
    accessibility: z.enum(['A', 'AA', 'AAA']).default('AAA'),
    norwegian: z.boolean().default(false),
    gdpr: z.boolean().default(false),
  }).optional(),
});

export type XaheenConfig = z.infer<typeof XaheenConfigSchema>;

// Legacy configuration types for backward compatibility
export interface LegacyXaheenConfig {
  version: string;
  project: {
    name: string;
    framework: string;
    packageManager: string;
  };
  services: Record<string, {
    provider: string;
    version?: string;
  }>;
}

export interface XalaConfig {
  version: string;
  platform: string;
  theme?: string;
  tokens?: string;
  ai?: {
    provider: string;
    model?: string;
  };
}

// Service registry types
export interface ServiceTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  provider: string;
  version: string;
  dependencies: string[];
  files: TemplateFile[];
  config: Record<string, any>;
}

export interface ComponentTemplate {
  id: string;
  name: string;
  description: string;
  platform: string;
  category: string;
  props: ComponentProp[];
  files: TemplateFile[];
  examples: string[];
}

export interface TemplateFile {
  path: string;
  content: string;
  isTemplate: boolean;
}

export interface ComponentProp {
  name: string;
  type: string;
  required: boolean;
  description: string;
  default?: any;
}

// Plugin system types
export interface CLIPlugin {
  name: string;
  version: string;
  commands: PluginCommand[];
  providers: Provider[];
  templates: Template[];
  
  // Lifecycle hooks
  onInstall(): Promise<void>;
  onActivate(): Promise<void>;
  onCommand(cmd: string, args: any): Promise<void>;
}

export interface PluginCommand {
  name: string;
  description: string;
  domain: CLIDomain;
  action: CLIAction;
  handler: (args: any) => Promise<void>;
}

export interface Provider {
  name: string;
  type: 'auth' | 'database' | 'payment' | 'ai' | 'deployment';
  config: Record<string, any>;
}

export interface Template {
  id: string;
  name: string;
  type: 'service' | 'component' | 'project';
  files: TemplateFile[];
}

// Command routing types
export interface CommandRoute {
  pattern: string;
  domain: CLIDomain;
  action: CLIAction;
  handler: CommandHandler;
  legacy?: {
    xaheen?: string[];
    xala?: string[];
  };
}

export type CommandHandler = (args: CLICommand) => Promise<void>;

// Migration types
export interface MigrationResult {
  success: boolean;
  source: 'xaheen-cli' | 'xala-cli';
  migratedConfig: XaheenConfig;
  warnings: string[];
  errors: string[];
}

// Error types
export class CLIError extends Error {
  constructor(
    message: string,
    public code: string,
    public domain?: string,
    public action?: string
  ) {
    super(message);
    this.name = 'CLIError';
  }
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// Platform and Monorepo types
export type PlatformType = 'web' | 'mobile' | 'desktop' | 'server' | 'shared';
export type MonorepoTarget = 'apps' | 'packages';

export interface AppTemplate {
  id: string;
  name: string;
  description: string;
  platform: PlatformType;
  framework: string;
  targetPath: MonorepoTarget;
  dependencies: string[];
  files: TemplateFile[];
  config: Record<string, any>;
}

export interface MonorepoStructure {
  type: 'apps-packages' | 'workspaces' | 'nx';
  apps: string[];
  packages: string[];
  sharedDependencies: string[];
}

// Stack Adapter types
export type StackType = 'nextjs' | 'nestjs' | 'django' | 'laravel' | 'rails' | 'dotnet' | 'angular' | 'vue' | 'react' | 'unknown';

export interface StackAdapter {
  name: string;
  type: StackType;
  detect(projectPath: string): Promise<boolean>;
  generateModel(context: GeneratorContext): Promise<GeneratedFile[]>;
  generateController(context: GeneratorContext): Promise<GeneratedFile[]>;
  generateService(context: GeneratorContext): Promise<GeneratedFile[]>;
  generateMigration(context: GeneratorContext): Promise<GeneratedFile[]>;
  generateRoute(context: GeneratorContext): Promise<GeneratedFile[]>;
}

export interface GeneratorContext {
  name: string;
  fields?: Field[];
  options: Record<string, any>;
  projectPath: string;
  stackType: StackType;
}

export interface Field {
  name: string;
  type: string;
  required?: boolean;
  unique?: boolean;
  defaultValue?: any;
  validation?: string[];
}

export interface GeneratedFile {
  path: string;
  content: string;
  type: 'create' | 'update' | 'append';
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;