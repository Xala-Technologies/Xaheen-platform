/**
 * Meta-Generator System Types
 * Advanced generator composition and meta-programming capabilities
 */
import { BaseGeneratorOptions, GeneratorResult } from '../base.generator';

export interface GeneratorMetadata {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly author: string;
  readonly category: GeneratorCategory;
  readonly tags: readonly string[];
  readonly dependencies: readonly GeneratorDependency[];
  readonly conflicts: readonly string[];
  readonly platforms: readonly Platform[];
  readonly framework: readonly Framework[];
  readonly license: string;
  readonly repository?: string;
  readonly homepage?: string;
  readonly documentation?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly downloads: number;
  readonly rating: number;
  readonly reviews: number;
  readonly certified: boolean;
  readonly deprecated: boolean;
  readonly experimental: boolean;
}

export interface GeneratorDependency {
  readonly id: string;
  readonly version: string;
  readonly required: boolean;
  readonly reason: string;
}

export type GeneratorCategory = 
  | 'component'
  | 'layout' 
  | 'page'
  | 'service'
  | 'infrastructure'
  | 'devops'
  | 'testing'
  | 'documentation'
  | 'security'
  | 'ai'
  | 'compliance'
  | 'integration'
  | 'meta';

export type Platform = 
  | 'react'
  | 'nextjs'
  | 'vue'
  | 'angular'
  | 'svelte'
  | 'electron'
  | 'react-native'
  | 'node'
  | 'deno'
  | 'bun';

export type Framework = 
  | 'xaheen'
  | 'xala'
  | 'tailwind'
  | 'chakra'
  | 'mui'
  | 'antd'
  | 'mantine'
  | 'headless';

export interface GeneratorTemplate {
  readonly id: string;
  readonly name: string;
  readonly path: string;
  readonly content: string;
  readonly variables: readonly TemplateVariable[];
  readonly partials: readonly string[];
  readonly helpers: readonly string[];
  readonly parent?: string; // Template inheritance
  readonly blocks: readonly TemplateBlock[];
}

export interface TemplateVariable {
  readonly name: string;
  readonly type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  readonly required: boolean;
  readonly default?: any;
  readonly description: string;
  readonly validation?: string; // Regex pattern
}

export interface TemplateBlock {
  readonly name: string;
  readonly content: string;
  readonly overridable: boolean;
  readonly description: string;
}

export interface GeneratorComposition {
  readonly generators: readonly GeneratorRef[];
  readonly execution: ExecutionStrategy;
  readonly errorHandling: ErrorHandlingStrategy;
  readonly rollback: RollbackStrategy;
  readonly conditions: readonly GeneratorCondition[];
}

export interface GeneratorRef {
  readonly id: string;
  readonly version?: string;
  readonly options: Record<string, any>;
  readonly order: number;
  readonly parallel: boolean;
  readonly optional: boolean;
  readonly condition?: string; // JavaScript expression
}

export type ExecutionStrategy = 'sequential' | 'parallel' | 'conditional' | 'pipeline';
export type ErrorHandlingStrategy = 'fail-fast' | 'continue' | 'rollback' | 'skip';
export type RollbackStrategy = 'none' | 'files' | 'full' | 'custom';

export interface GeneratorCondition {
  readonly name: string;
  readonly expression: string;
  readonly description: string;
}

export interface MetaGeneratorOptions extends BaseGeneratorOptions {
  readonly templateId: string;
  readonly targetGenerator: GeneratorMetadata;
  readonly customOptions: Record<string, any>;
  readonly outputPath?: string;
  readonly namespace?: string;
  readonly publishToMarketplace?: boolean;
  readonly generateTests?: boolean;
  readonly generateDocs?: boolean;
  readonly generateExamples?: boolean;
}

export interface GeneratorRegistryEntry {
  readonly metadata: GeneratorMetadata;
  readonly implementation: string; // Path to generator implementation
  readonly templates: readonly GeneratorTemplate[];
  readonly examples: readonly GeneratorExample[];
  readonly tests: readonly GeneratorTest[];
  readonly documentation: GeneratorDocumentation;
  readonly performance: GeneratorPerformance;
  readonly security: GeneratorSecurity;
}

export interface GeneratorExample {
  readonly name: string;
  readonly description: string;
  readonly options: Record<string, any>;
  readonly expectedOutput: readonly string[];
  readonly category: string;
}

export interface GeneratorTest {
  readonly name: string;
  readonly type: 'unit' | 'integration' | 'performance' | 'security';
  readonly description: string;
  readonly options: Record<string, any>;
  readonly assertions: readonly TestAssertion[];
}

export interface TestAssertion {
  readonly type: 'file-exists' | 'file-content' | 'performance' | 'security';
  readonly target: string;
  readonly expected: any;
  readonly message: string;
}

export interface GeneratorDocumentation {
  readonly readme: string;
  readonly apiReference: string;
  readonly examples: string;
  readonly changelog: string;
  readonly contributing: string;
  readonly license: string;
}

export interface GeneratorPerformance {
  readonly averageExecutionTime: number;
  readonly memoryUsage: number;
  readonly fileCount: number;
  readonly templateCount: number;
  readonly benchmarks: readonly PerformanceBenchmark[];
}

export interface PerformanceBenchmark {
  readonly name: string;
  readonly executionTime: number;
  readonly memoryUsage: number;
  readonly timestamp: Date;
  readonly version: string;
}

export interface GeneratorSecurity {
  readonly vulnerabilities: readonly SecurityVulnerability[];
  readonly lastScan: Date;
  readonly securityRating: 'A' | 'B' | 'C' | 'D' | 'F';
  readonly trustedBy: readonly string[];
}

export interface SecurityVulnerability {
  readonly id: string;
  readonly severity: 'low' | 'medium' | 'high' | 'critical';
  readonly description: string;
  readonly affectedVersions: readonly string[];
  readonly fixedIn?: string;
  readonly cve?: string;
}

export interface GeneratorMarketplace {
  readonly featured: readonly GeneratorMetadata[];
  readonly trending: readonly GeneratorMetadata[];
  readonly newReleases: readonly GeneratorMetadata[];
  readonly categories: readonly CategoryStats[];
  readonly totalGenerators: number;
  readonly totalDownloads: number;
}

export interface CategoryStats {
  readonly category: GeneratorCategory;
  readonly count: number;
  readonly downloads: number;
  readonly featured: readonly string[];
}

export interface GeneratorAnalytics {
  readonly generatorId: string;
  readonly usage: UsageStats;
  readonly performance: PerformanceStats;
  readonly errors: ErrorStats;
  readonly feedback: FeedbackStats;
}

export interface UsageStats {
  readonly totalExecutions: number;
  readonly uniqueUsers: number;
  readonly popularOptions: readonly OptionUsage[];
  readonly platformBreakdown: Record<Platform, number>;
  readonly frameworkBreakdown: Record<Framework, number>;
  readonly timeSeriesData: readonly TimeSeriesPoint[];
}

export interface OptionUsage {
  readonly option: string;
  readonly frequency: number;
  readonly values: Record<string, number>;
}

export interface TimeSeriesPoint {
  readonly timestamp: Date;
  readonly executions: number;
  readonly errors: number;
  readonly users: number;
}

export interface PerformanceStats {
  readonly averageExecutionTime: number;
  readonly p95ExecutionTime: number;
  readonly p99ExecutionTime: number;
  readonly memoryUsage: MemoryUsageStats;
  readonly throughput: number;
}

export interface MemoryUsageStats {
  readonly average: number;
  readonly peak: number;
  readonly min: number;
  readonly max: number;
}

export interface ErrorStats {
  readonly totalErrors: number;
  readonly errorRate: number;
  readonly commonErrors: readonly ErrorFrequency[];
  readonly errorTrends: readonly ErrorTrend[];
}

export interface ErrorFrequency {
  readonly error: string;
  readonly count: number;
  readonly percentage: number;
  readonly lastOccurrence: Date;
}

export interface ErrorTrend {
  readonly date: Date;
  readonly errors: number;
  readonly rate: number;
}

export interface FeedbackStats {
  readonly averageRating: number;
  readonly totalReviews: number;
  readonly ratingDistribution: Record<number, number>;
  readonly commonFeedback: readonly FeedbackTheme[];
  readonly sentimentAnalysis: SentimentAnalysis;
}

export interface FeedbackTheme {
  readonly theme: string;
  readonly count: number;
  readonly sentiment: 'positive' | 'negative' | 'neutral';
  readonly examples: readonly string[];
}

export interface SentimentAnalysis {
  readonly positive: number;
  readonly negative: number;
  readonly neutral: number;
  readonly confidence: number;
}

export interface GeneratorWorkflow {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly steps: readonly WorkflowStep[];
  readonly triggers: readonly WorkflowTrigger[];
  readonly variables: readonly WorkflowVariable[];
}

export interface WorkflowStep {
  readonly id: string;
  readonly name: string;
  readonly type: 'generator' | 'condition' | 'loop' | 'parallel' | 'script';
  readonly config: Record<string, any>;
  readonly dependencies: readonly string[];
  readonly timeout?: number;
  readonly retries?: number;
}

export interface WorkflowTrigger {
  readonly type: 'manual' | 'event' | 'schedule' | 'webhook';
  readonly config: Record<string, any>;
}

export interface WorkflowVariable {
  readonly name: string;
  readonly type: string;
  readonly value?: any;
  readonly secret: boolean;
}

export interface GeneratorPlugin {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly hooks: readonly PluginHook[];
  readonly commands: readonly PluginCommand[];
  readonly middleware: readonly PluginMiddleware[];
}

export interface PluginHook {
  readonly event: string;
  readonly handler: string;
  readonly priority: number;
  readonly async: boolean;
}

export interface PluginCommand {
  readonly name: string;
  readonly description: string;
  readonly handler: string;
  readonly options: readonly CommandOption[];
}

export interface CommandOption {
  readonly name: string;
  readonly type: string;
  readonly required: boolean;
  readonly description: string;
}

export interface PluginMiddleware {
  readonly name: string;
  readonly handler: string;
  readonly order: number;
}