# Types Module

## Overview

The Types module provides comprehensive TypeScript type definitions for the entire Xaheen CLI ecosystem. It ensures type safety across all modules, defines contracts between services, and provides strong typing for configuration, templates, generators, and external integrations. The module follows strict TypeScript principles with discriminated unions, branded types, and comprehensive interface definitions.

## Architecture

The types module is organized into logical categories with clear dependencies:

- **Core Types**: Fundamental types used across all modules
- **Service Types**: Service-specific type definitions
- **Generator Types**: Code generation type system
- **Template Types**: Template processing types
- **Configuration Types**: Configuration and settings types
- **External Types**: Third-party integration types
- **Utility Types**: Helper types and type utilities

## Core Type Categories

### 1. Core Types (`index.ts`)

Fundamental types that form the foundation of the CLI:

```typescript
// Base CLI Types
export interface CLIContext {
  readonly workingDirectory: string;
  readonly configPath?: string;
  readonly verbose: boolean;
  readonly dryRun: boolean;
  readonly environment: Environment;
}

export type Environment = 'development' | 'production' | 'test' | 'staging';

export interface CommandResult {
  readonly success: boolean;
  readonly message?: string;
  readonly data?: unknown;
  readonly error?: CLIError;
  readonly nextSteps?: readonly string[];
}

// Error Types
export interface CLIError {
  readonly code: string;
  readonly message: string;
  readonly details?: Record<string, unknown>;
  readonly cause?: Error;
  readonly stack?: string;
}

// Platform Types
export type Platform = 
  | 'react' 
  | 'nextjs' 
  | 'vue' 
  | 'angular' 
  | 'svelte' 
  | 'electron' 
  | 'react-native';

export type Framework = 
  | 'express' 
  | 'nestjs' 
  | 'fastify' 
  | 'koa' 
  | 'hapi' 
  | 'nuxt' 
  | 'gatsby';
```

### 2. Generator Types

Comprehensive type system for code generation:

```typescript
// Generator Configuration
export interface GeneratorConfig {
  readonly name: string;
  readonly type: GeneratorType;
  readonly platform?: Platform;
  readonly framework?: Framework;
  readonly options: GeneratorOptions;
  readonly outputPath: string;
  readonly templateOverrides?: TemplateOverrides;
  readonly features?: readonly string[];
}

// Generator Types Enum
export enum GeneratorType {
  COMPONENT = 'component',
  SERVICE = 'service',
  PAGE = 'page',
  LAYOUT = 'layout',
  MODEL = 'model',
  CONTROLLER = 'controller',
  MIDDLEWARE = 'middleware',
  TEST = 'test',
  DOCUMENTATION = 'documentation',
  DEPLOYMENT = 'deployment'
}

// Generator Options
export interface GeneratorOptions {
  readonly styling?: StylingOptions;
  readonly testing?: TestingOptions;
  readonly typescript?: boolean;
  readonly linting?: LintingOptions;
  readonly accessibility?: AccessibilityOptions;
  readonly internationalization?: I18nOptions;
  readonly compliance?: ComplianceOptions;
}

// Styling Configuration
export interface StylingOptions {
  readonly framework: StylingFramework;
  readonly theme?: string;
  readonly customProperties?: boolean;
  readonly responsive?: boolean;
  readonly darkMode?: boolean;
}

export type StylingFramework = 
  | 'tailwind' 
  | 'styled-components' 
  | 'emotion' 
  | 'css-modules' 
  | 'sass' 
  | 'less';

// Testing Configuration
export interface TestingOptions {
  readonly framework: TestingFramework;
  readonly coverage?: boolean;
  readonly e2e?: boolean;
  readonly visual?: boolean;
  readonly accessibility?: boolean;
  readonly performance?: boolean;
}

export type TestingFramework = 
  | 'jest' 
  | 'vitest' 
  | 'cypress' 
  | 'playwright' 
  | 'testing-library';
```

### 3. Service Types

Type definitions for all service modules:

```typescript
// Service Registry Types
export interface ServiceDescriptor<T = unknown> {
  readonly name: string;
  readonly instance: T;
  readonly metadata: ServiceMetadata;
  readonly lifecycle: ServiceLifecycle;
  readonly dependencies: readonly string[];
}

export type ServiceLifecycle = 'singleton' | 'transient' | 'scoped';

export interface ServiceMetadata {
  readonly version: string;
  readonly description: string;
  readonly category: ServiceCategory;
  readonly tags?: readonly string[];
  readonly healthCheck?: boolean;
}

export enum ServiceCategory {
  CORE = 'core',
  GENERATOR = 'generator',
  TEMPLATE = 'template',
  VALIDATION = 'validation',
  EXTERNAL = 'external',
  UTILITY = 'utility'
}

// AI Service Types
export interface AIServiceConfig {
  readonly provider: AIProvider;
  readonly apiKey: string;
  readonly model: string;
  readonly maxTokens?: number;
  readonly temperature?: number;
  readonly timeout?: number;
}

export type AIProvider = 'openai' | 'anthropic' | 'google' | 'azure' | 'local';

export interface CodeAnalysis {
  readonly complexity: ComplexityLevel;
  readonly maintainability: number;
  readonly testability: number;
  readonly suggestions: readonly Suggestion[];
  readonly patterns: readonly DetectedPattern[];
}

export type ComplexityLevel = 'low' | 'medium' | 'high' | 'very-high';

export interface Suggestion {
  readonly type: SuggestionType;
  readonly title: string;
  readonly description: string;
  readonly priority: Priority;
  readonly impact: Impact;
  readonly effort: Effort;
}

export enum SuggestionType {
  REFACTOR = 'refactor',
  OPTIMIZE = 'optimize',
  EXTRACT = 'extract',
  SIMPLIFY = 'simplify',
  MODERNIZE = 'modernize'
}

export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type Impact = 'low' | 'medium' | 'high';
export type Effort = 'low' | 'medium' | 'high';
```

### 4. Template Types

Template processing and validation types:

```typescript
// Template System Types
export interface Template {
  readonly path: string;
  readonly content: string;
  readonly metadata: TemplateMetadata;
  readonly dependencies: readonly string[];
}

export interface TemplateMetadata {
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly author: string;
  readonly category: TemplateCategory;
  readonly platform?: Platform;
  readonly framework?: Framework;
  readonly tags: readonly string[];
}

export enum TemplateCategory {
  COMPONENT = 'component',
  PAGE = 'page',
  LAYOUT = 'layout',
  SERVICE = 'service',
  MODEL = 'model',
  TEST = 'test',
  CONFIGURATION = 'configuration',
  DOCUMENTATION = 'documentation'
}

// Template Processing
export interface TemplateContext {
  readonly projectName: string;
  readonly projectPath: string;
  readonly platform: Platform;
  readonly framework?: Framework;
  readonly packageManager: PackageManager;
  readonly features: readonly string[];
  readonly config: Record<string, unknown>;
  readonly environment: Environment;
}

export type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun';

export interface CompiledTemplate {
  readonly template: HandlebarsTemplateDelegate;
  readonly metadata: TemplateMetadata;
  readonly compiledAt: Date;
}

// Template Validation
export interface TemplateValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ValidationError[];
  readonly warnings: readonly ValidationWarning[];
  readonly suggestions: readonly ValidationSuggestion[];
}

export interface ValidationError {
  readonly code: string;
  readonly message: string;
  readonly line?: number;
  readonly column?: number;
  readonly severity: 'error';
}

export interface ValidationWarning {
  readonly code: string;
  readonly message: string;
  readonly line?: number;
  readonly column?: number;
  readonly severity: 'warning';
}

export interface ValidationSuggestion {
  readonly code: string;
  readonly message: string;
  readonly line?: number;
  readonly column?: number;
  readonly severity: 'info';
}
```

### 5. Configuration Types

Configuration and settings type definitions:

```typescript
// CLI Configuration
export interface CLIConfig {
  readonly version: string;
  readonly defaultPlatform: Platform;
  readonly defaultFramework?: Framework;
  readonly templatePath: string;
  readonly outputPath: string;
  readonly features: FeatureConfig;
  readonly plugins: PluginConfig;
  readonly compliance: ComplianceConfig;
}

export interface FeatureConfig {
  readonly typescript: boolean;
  readonly testing: boolean;
  readonly linting: boolean;
  readonly formatting: boolean;
  readonly accessibility: boolean;
  readonly internationalization: boolean;
  readonly analytics: boolean;
}

export interface PluginConfig {
  readonly enabled: boolean;
  readonly autoLoad: boolean;
  readonly searchPaths: readonly string[];
  readonly allowedPlugins: readonly string[];
  readonly blockedPlugins: readonly string[];
}

// Norwegian Compliance Types
export interface ComplianceConfig {
  readonly nsm: NSMConfig;
  readonly gdpr: GDPRConfig;
  readonly accessibility: AccessibilityConfig;
}

export interface NSMConfig {
  readonly enabled: boolean;
  readonly classification: DataClassification;
  readonly auditLevel: AuditLevel;
  readonly encryptionRequired: boolean;
}

export enum DataClassification {
  OPEN = 'OPEN',
  RESTRICTED = 'RESTRICTED',
  CONFIDENTIAL = 'CONFIDENTIAL',
  SECRET = 'SECRET'
}

export enum AuditLevel {
  BASIC = 'basic',
  DETAILED = 'detailed',
  COMPREHENSIVE = 'comprehensive'
}

export interface GDPRConfig {
  readonly enabled: boolean;
  readonly consentRequired: boolean;
  readonly dataRetentionPeriod: number;
  readonly rightToBeErasure: boolean;
}

export interface AccessibilityConfig {
  readonly enabled: boolean;
  readonly level: AccessibilityLevel;
  readonly testing: boolean;
  readonly validation: boolean;
}

export enum AccessibilityLevel {
  A = 'A',
  AA = 'AA',
  AAA = 'AAA'
}
```

### 6. External Integration Types

Types for third-party service integrations:

```typescript
// MCP (Model Context Protocol) Types
export interface MCPConfig {
  readonly enabled: boolean;
  readonly serverUrl: string;
  readonly apiKey?: string;
  readonly timeout: number;
  readonly retries: number;
}

export interface MCPRequest {
  readonly method: string;
  readonly params?: Record<string, unknown>;
  readonly id?: string;
}

export interface MCPResponse {
  readonly result?: unknown;
  readonly error?: MCPError;
  readonly id?: string;
}

export interface MCPError {
  readonly code: number;
  readonly message: string;
  readonly data?: unknown;
}

// Database Types
export interface DatabaseConfig {
  readonly type: DatabaseType;
  readonly connection: DatabaseConnection;
  readonly migrations: MigrationConfig;
  readonly seeding: SeedingConfig;
}

export enum DatabaseType {
  POSTGRESQL = 'postgresql',
  MYSQL = 'mysql',
  SQLITE = 'sqlite',
  MONGODB = 'mongodb',
  REDIS = 'redis'
}

export interface DatabaseConnection {
  readonly host: string;
  readonly port: number;
  readonly database: string;
  readonly username: string;
  readonly password: string;
  readonly ssl?: boolean;
  readonly poolSize?: number;
}

// Cloud Provider Types
export interface CloudConfig {
  readonly provider: CloudProvider;
  readonly region: string;
  readonly credentials: CloudCredentials;
  readonly resources: CloudResources;
}

export enum CloudProvider {
  AWS = 'aws',
  AZURE = 'azure',
  GCP = 'gcp',
  VERCEL = 'vercel',
  NETLIFY = 'netlify'
}

export interface CloudCredentials {
  readonly accessKey?: string;
  readonly secretKey?: string;
  readonly token?: string;
  readonly profile?: string;
}

export interface CloudResources {
  readonly compute?: ComputeResource[];
  readonly storage?: StorageResource[];
  readonly database?: DatabaseResource[];
  readonly network?: NetworkResource[];
}
```

### 7. Utility Types

Helper types and type utilities:

```typescript
// Brand Types for Type Safety
export type Brand<T, B> = T & { readonly __brand: B };

export type ProjectPath = Brand<string, 'ProjectPath'>;
export type TemplatePath = Brand<string, 'TemplatePath'>;
export type ConfigPath = Brand<string, 'ConfigPath'>;

// Utility Type Helpers
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends (infer U)[]
    ? readonly DeepReadonly<U>[]
    : T[P] extends object
    ? DeepReadonly<T[P]>
    : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type NonEmptyArray<T> = [T, ...T[]];

// Result Types
export type Result<T, E = Error> = Success<T> | Failure<E>;

export interface Success<T> {
  readonly success: true;
  readonly data: T;
}

export interface Failure<E> {
  readonly success: false;
  readonly error: E;
}

// Async Result Types
export type AsyncResult<T, E = Error> = Promise<Result<T, E>>;

// Event Types
export interface Event<T = unknown> {
  readonly type: string;
  readonly payload: T;
  readonly timestamp: Date;
  readonly source: string;
}

export type EventHandler<T = unknown> = (event: Event<T>) => void;

// Plugin Types
export interface Plugin {
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly author: string;
  readonly initialize: (context: PluginContext) => Promise<void>;
  readonly destroy: () => Promise<void>;
}

export interface PluginContext {
  readonly cli: CLIContext;
  readonly logger: Logger;
  readonly config: CLIConfig;
  readonly services: ServiceRegistry;
}
```

### 8. Discriminated Union Types

Type-safe discriminated unions for complex scenarios:

```typescript
// Command Types with Discriminated Unions
export type Command = 
  | GenerateCommand
  | CreateCommand
  | DeployCommand
  | TestCommand
  | LicenseCommand
  | AICommand;

export interface GenerateCommand {
  readonly type: 'generate';
  readonly subType: GeneratorType;
  readonly name: string;
  readonly options: GeneratorOptions;
}

export interface CreateCommand {
  readonly type: 'create';
  readonly projectType: ProjectType;
  readonly name: string;
  readonly template?: string;
}

export interface DeployCommand {
  readonly type: 'deploy';
  readonly target: DeploymentTarget;
  readonly environment: Environment;
  readonly options: DeploymentOptions;
}

export interface TestCommand {
  readonly type: 'test';
  readonly testType: TestType;
  readonly files?: readonly string[];
  readonly options: TestOptions;
}

export interface LicenseCommand {
  readonly type: 'license';
  readonly action: LicenseAction;
  readonly options: LicenseOptions;
}

export interface AICommand {
  readonly type: 'ai';
  readonly action: AIAction;
  readonly prompt?: string;
  readonly options: AIOptions;
}

// Generator Result Types
export type GenerationResult = 
  | SuccessfulGeneration
  | FailedGeneration
  | PartialGeneration;

export interface SuccessfulGeneration {
  readonly status: 'success';
  readonly files: readonly GeneratedFile[];
  readonly duration: number;
  readonly metadata: GenerationMetadata;
}

export interface FailedGeneration {
  readonly status: 'failed';
  readonly error: GenerationError;
  readonly partialFiles?: readonly GeneratedFile[];
}

export interface PartialGeneration {
  readonly status: 'partial';
  readonly files: readonly GeneratedFile[];
  readonly warnings: readonly GenerationWarning[];
  readonly errors: readonly GenerationError[];
}

export interface GeneratedFile {
  readonly path: string;
  readonly content: string;
  readonly type: FileType;
  readonly metadata: FileMetadata;
}

export enum FileType {
  TYPESCRIPT = 'typescript',
  JAVASCRIPT = 'javascript',
  JSON = 'json',
  YAML = 'yaml',
  MARKDOWN = 'markdown',
  CSS = 'css',
  HTML = 'html',
  DOCKER = 'docker',
  CONFIG = 'config'
}
```

## Type Guards and Validation

Type-safe runtime validation functions:

```typescript
// Type Guards
export function isGenerateCommand(command: Command): command is GenerateCommand {
  return command.type === 'generate';
}

export function isSuccessfulGeneration(result: GenerationResult): result is SuccessfulGeneration {
  return result.status === 'success';
}

export function isPlatform(value: string): value is Platform {
  return ['react', 'nextjs', 'vue', 'angular', 'svelte', 'electron', 'react-native'].includes(value);
}

export function isFramework(value: string): value is Framework {
  return ['express', 'nestjs', 'fastify', 'koa', 'hapi', 'nuxt', 'gatsby'].includes(value);
}

// Validation Functions
export function validateGeneratorConfig(config: unknown): config is GeneratorConfig {
  if (typeof config !== 'object' || config === null) {
    return false;
  }

  const c = config as Record<string, unknown>;
  
  return (
    typeof c.name === 'string' &&
    typeof c.type === 'string' &&
    typeof c.outputPath === 'string' &&
    (c.platform === undefined || isPlatform(c.platform as string)) &&
    (c.framework === undefined || isFramework(c.framework as string))
  );
}

export function validateCLIConfig(config: unknown): config is CLIConfig {
  if (typeof config !== 'object' || config === null) {
    return false;
  }

  const c = config as Record<string, unknown>;
  
  return (
    typeof c.version === 'string' &&
    isPlatform(c.defaultPlatform as string) &&
    typeof c.templatePath === 'string' &&
    typeof c.outputPath === 'string'
  );
}
```

## Type Utilities and Helpers

Advanced TypeScript utilities for type manipulation:

```typescript
// Extract Types from Complex Unions
export type ExtractCommandType<T extends Command['type']> = Extract<Command, { type: T }>;

// Conditional Types for Configuration
export type ConfigForPlatform<P extends Platform> = P extends 'react'
  ? ReactConfig
  : P extends 'vue'
  ? VueConfig
  : P extends 'angular'
  ? AngularConfig
  : BaseConfig;

// Mapped Types for Feature Flags
export type FeatureFlags<T extends Record<string, boolean>> = {
  readonly [K in keyof T]: T[K] extends true ? K : never;
}[keyof T];

// Template Type Inference
export type InferTemplateContext<T extends Template> = T extends Template
  ? T['metadata']['platform'] extends Platform
    ? ConfigForPlatform<T['metadata']['platform']>
    : TemplateContext
  : never;

// Service Type Resolution
export type ResolveService<T extends string> = T extends keyof ServiceMap
  ? ServiceMap[T]
  : unknown;

export interface ServiceMap {
  'FileSystemService': FileSystemService;
  'LoggerService': LoggerService;
  'TemplateEngineService': TemplateEngineService;
  'ProjectAnalyzerService': ProjectAnalyzerService;
  'AIService': AIService;
  'ComplianceService': ComplianceService;
}
```

## Testing Types

Types specifically for testing scenarios:

```typescript
// Mock Types
export interface MockService<T> {
  readonly mockImplementation: T;
  readonly callHistory: readonly unknown[][];
  readonly resetMock: () => void;
}

export type MockedService<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer R
    ? jest.MockedFunction<(...args: A) => R>
    : T[K];
};

// Test Configuration
export interface TestConfig {
  readonly testFramework: TestingFramework;
  readonly coverage: boolean;
  readonly watchMode: boolean;
  readonly timeout: number;
  readonly setupFiles: readonly string[];
  readonly testMatch: readonly string[];
}

// Test Assertions
export interface TestAssertion {
  readonly type: AssertionType;
  readonly expected: unknown;
  readonly actual: unknown;
  readonly message?: string;
}

export enum AssertionType {
  EQUALS = 'equals',
  CONTAINS = 'contains',
  MATCHES = 'matches',
  THROWS = 'throws',
  RESOLVES = 'resolves',
  REJECTS = 'rejects'
}
```

## Future Enhancements

The types module is designed for extensibility:

```typescript
// Plugin Type Extensions
export interface ExtendedPlugin extends Plugin {
  readonly supportedPlatforms: readonly Platform[];
  readonly requiredServices: readonly string[];
  readonly optionalServices: readonly string[];
}

// AI Type Extensions
export interface AIEnhancedGenerator extends BaseGenerator {
  readonly aiCapabilities: AICapability[];
  readonly modelRequirements: ModelRequirements;
}

export enum AICapability {
  CODE_ANALYSIS = 'code-analysis',
  SUGGESTION_GENERATION = 'suggestion-generation',
  REFACTORING = 'refactoring',
  OPTIMIZATION = 'optimization',
  TESTING = 'testing'
}

// Compliance Extensions
export interface ExtendedComplianceConfig extends ComplianceConfig {
  readonly customRules: readonly ComplianceRule[];
  readonly reportingLevel: ReportingLevel;
  readonly automaticRemediation: boolean;
}
```

## Best Practices

1. **Strong Typing**: Use specific types instead of `any` or `unknown` where possible
2. **Immutability**: Prefer `readonly` properties and arrays
3. **Discriminated Unions**: Use discriminated unions for complex state management
4. **Brand Types**: Use branded types for domain-specific strings
5. **Type Guards**: Implement type guards for runtime type safety
6. **Generic Constraints**: Use generic constraints to limit type parameters
7. **Utility Types**: Leverage TypeScript's built-in utility types
8. **Documentation**: Document complex types with JSDoc comments

## Contributing

When adding new types:

1. Follow existing naming conventions
2. Use appropriate TypeScript features (unions, intersections, generics)
3. Add type guards for runtime validation
4. Include comprehensive JSDoc documentation
5. Add test cases for type validation
6. Consider backward compatibility
7. Update this documentation

The types module ensures type safety and provides a solid foundation for the entire Xaheen CLI ecosystem.