/**
 * @fileoverview Hybrid Scaffolding Architecture Types
 * @description Core types for the three-tier generator system
 */

import { Tree } from '@nx/devkit';

// ===== COMMON TYPES =====

export interface ScaffoldingContext {
  readonly projectPath: string;
  readonly projectName: string;
  readonly framework: string;
  readonly variant?: string;
  readonly features: readonly string[];
  readonly dryRun: boolean;
  readonly verbose: boolean;
  readonly metadata?: Record<string, unknown>;
}

export interface GenerationResult {
  readonly success: boolean;
  readonly files: readonly string[];
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
  readonly metadata?: Record<string, unknown>;
}

export interface ScaffoldingOperation {
  readonly type: 'create' | 'update' | 'delete';
  readonly path: string;
  readonly content?: string;
  readonly backup?: boolean;
}

// ===== TIER 1: GLOBAL PROJECT SCAFFOLDING =====

export interface GlobalScaffoldingOptions {
  readonly templatePath?: string;
  readonly customizations?: Record<string, unknown>;
  readonly skipInstall?: boolean;
  readonly gitInit?: boolean;
}

export interface YeomanGeneratorConfig {
  readonly name: string;
  readonly namespace: string;
  readonly templatePath: string;
  readonly prompts: readonly YeomanPrompt[];
  readonly dependencies: readonly string[];
}

export interface YeomanPrompt {
  readonly type: 'input' | 'confirm' | 'list' | 'checkbox';
  readonly name: string;
  readonly message: string;
  readonly default?: unknown;
  readonly choices?: readonly string[];
  readonly validate?: (input: unknown) => boolean | string;
}

// ===== TIER 2: TYPESCRIPT CODE MANIPULATION =====

export interface ASTTransformationOptions {
  readonly preserveComments?: boolean;
  readonly preserveWhitespace?: boolean;
  readonly validateTypes?: boolean;
  readonly backup?: boolean;
}

export interface ImportStatement {
  readonly moduleSpecifier: string;
  readonly namedImports?: readonly string[];
  readonly defaultImport?: string;
  readonly namespaceImport?: string;
  readonly isTypeOnly?: boolean;
}

export interface TypeScriptInterface {
  readonly name: string;
  readonly properties: readonly InterfaceProperty[];
  readonly extends?: readonly string[];
  readonly exported?: boolean;
  readonly readonly?: boolean;
}

export interface InterfaceProperty {
  readonly name: string;
  readonly type: string;
  readonly optional?: boolean;
  readonly readonly?: boolean;
  readonly description?: string;
}

export interface RouteConfiguration {
  readonly path: string;
  readonly component: string;
  readonly name?: string;
  readonly children?: readonly RouteConfiguration[];
  readonly meta?: Record<string, unknown>;
}

export interface VirtualFileSystem {
  readonly files: Map<string, string>;
  readonly operations: readonly ScaffoldingOperation[];
  writeFile(path: string, content: string): void;
  readFile(path: string): string | undefined;
  deleteFile(path: string): void;
  hasFile(path: string): boolean;
  commit(): Promise<void>;
  rollback(): void;
}

// ===== TIER 3: PROJECT-LOCAL GENERATORS =====

export interface HygenGeneratorConfig {
  readonly name: string;
  readonly description: string;
  readonly templates: readonly HygenTemplate[];
  readonly prompts?: readonly HygenPrompt[];
  readonly dependencies?: readonly string[];
}

export interface HygenTemplate {
  readonly name: string;
  readonly path: string;
  readonly condition?: string;
  readonly inject?: readonly HygenInjection[];
}

export interface HygenPrompt {
  readonly type: 'input' | 'select' | 'multiselect' | 'confirm';
  readonly name: string;
  readonly message: string;
  readonly initial?: unknown;
  readonly choices?: readonly string[];
}

export interface HygenInjection {
  readonly after: string;
  readonly before?: string;
  readonly skip_if?: string;
  readonly template: string;
}

export interface LocalGeneratorOptions {
  readonly generatorName: string;
  readonly targetPath?: string;
  readonly variables?: Record<string, unknown>;
  readonly dryRun?: boolean;
}

// ===== HYBRID ORCHESTRATION =====

export interface HybridScaffoldingOptions {
  readonly tier1?: GlobalScaffoldingOptions;
  readonly tier2?: CodeManipulationOptions;
  readonly tier3?: LocalGeneratorOptions;
  readonly orchestration?: OrchestrationOptions;
}

export interface CodeManipulationOptions {
  readonly transformations?: readonly ASTTransformation[];
  readonly imports?: readonly ImportStatement[];
  readonly interfaces?: readonly TypeScriptInterface[];
  readonly routes?: readonly RouteConfiguration[];
  readonly refactoring?: readonly RefactoringOperation[];
}

export interface ASTTransformation {
  readonly type: 'add-property' | 'remove-property' | 'rename-symbol' | 'extract-interface' | 'inline-type';
  readonly target: string;
  readonly options: Record<string, unknown>;
}

export interface RefactoringOperation {
  readonly type: 'extract-component' | 'move-file' | 'rename-file' | 'split-file';
  readonly source: string;
  readonly target?: string;
  readonly options?: Record<string, unknown>;
}

export interface OrchestrationOptions {
  readonly strategy: 'sequential' | 'parallel' | 'dependent';
  readonly dependencies?: readonly TierDependency[];
  readonly rollbackOnError?: boolean;
  readonly continueOnWarning?: boolean;
}

export interface TierDependency {
  readonly from: 1 | 2 | 3;
  readonly to: 1 | 2 | 3;
  readonly condition?: string;
}

// ===== SERVICE INTEGRATION =====

export interface ServiceRegistration {
  readonly name: string;
  readonly type: 'singleton' | 'transient' | 'scoped';
  readonly factory: () => unknown;
  readonly dependencies?: readonly string[];
}

export interface ScaffoldingService {
  readonly name: string;
  readonly tier: 1 | 2 | 3;
  generate(context: ScaffoldingContext, options: unknown): Promise<GenerationResult>;
  validate(context: ScaffoldingContext, options: unknown): Promise<readonly string[]>;
  preview(context: ScaffoldingContext, options: unknown): Promise<readonly string[]>;
}

// ===== ERROR HANDLING =====

export class ScaffoldingError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly tier?: 1 | 2 | 3,
    public readonly context?: ScaffoldingContext
  ) {
    super(message);
    this.name = 'ScaffoldingError';
  }
}

// ===== CONFIGURATION =====

export interface ScaffoldingConfiguration {
  readonly globalTemplatesPath: string;
  readonly localGeneratorsPath: string;
  readonly backupEnabled: boolean;
  readonly maxConcurrentOperations: number;
  readonly defaultFramework: string;
  readonly supportedFrameworks: readonly string[];
  readonly tier1: {
    readonly enabled: boolean;
    readonly yeomanConfig: YeomanGeneratorConfig;
  };
  readonly tier2: {
    readonly enabled: boolean;
    readonly astOptions: ASTTransformationOptions;
    readonly virtualFs: boolean;
  };
  readonly tier3: {
    readonly enabled: boolean;
    readonly hygenConfig: HygenGeneratorConfig;
    readonly autoDiscovery: boolean;
  };
}