/**
 * Type definitions for the End-to-End Testing Framework
 */

export interface TestScenario {
  readonly name: string;
  readonly description: string;
  readonly category: 'project-creation' | 'design-system' | 'compliance' | 'code-quality' | 'performance';
  readonly framework?: string;
  readonly template?: string;
  readonly features?: readonly string[];
  readonly expectedOutcome: 'pass' | 'warning' | 'fail';
  readonly timeout?: number;
}

export interface TestResult {
  readonly name: string;
  readonly status: 'passed' | 'failed' | 'warning' | 'skipped';
  readonly duration: number;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
  readonly details: any;
}

export interface TestSuite {
  readonly tests: readonly TestResult[];
  readonly passed: number;
  readonly failed: number;
  readonly warnings: number;
}

export interface ComplianceResult {
  readonly success: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
  readonly score?: number;
  readonly details?: any;
}

export interface E2ETestConfig {
  readonly outputDir?: string;
  readonly cliPath?: string;
  readonly timeout?: number;
  readonly parallel?: boolean;
  readonly skipCleanup?: boolean;
  readonly generateReport?: boolean;
  readonly reportFormat?: 'json' | 'html' | 'both';
  readonly frameworks?: readonly string[];
  readonly templates?: readonly string[];
}

export interface TestReport {
  readonly timestamp: string;
  readonly environment: any;
  readonly totalTests: number;
  readonly passedTests: number;
  readonly failedTests: number;
  readonly warningTests: number;
  readonly duration: number;
  readonly suites: {
    readonly projectCreation: TestSuite;
    readonly designSystemIntegration: TestSuite;
    readonly complianceValidation: TestSuite;
    readonly codeQuality: TestSuite;
    readonly performance: TestSuite;
  };
  readonly compliance: {
    readonly claudeMdCompliance: number;
    readonly nsmCompliance: number;
    readonly wcagCompliance: number;
    readonly designSystemUsage: number;
  };
  readonly recommendations: readonly string[];
}

export interface ProjectCreationTest {
  readonly name: string;
  readonly framework: 'react' | 'vue' | 'nextjs' | 'angular' | 'svelte' | 'electron' | 'react-native';
  readonly template: string;
  readonly features: readonly string[];
}

export interface DesignSystemTest {
  readonly name: string;
  readonly validations: readonly DesignSystemValidation[];
}

export interface DesignSystemValidation {
  readonly type: 'import' | 'usage' | 'styling' | 'component';
  readonly pattern: string;
  readonly expected: boolean;
  readonly message: string;
}

export interface ComplianceTest {
  readonly name: string;
  readonly type: 'claude-md' | 'nsm' | 'wcag' | 'gdpr';
  readonly validations: readonly ComplianceValidation[];
}

export interface ComplianceValidation {
  readonly rule: string;
  readonly pattern: string;
  readonly severity: 'error' | 'warning' | 'info';
  readonly message: string;
}

export interface CodeQualityTest {
  readonly name: string;
  readonly checks: readonly CodeQualityCheck[];
}

export interface CodeQualityCheck {
  readonly type: 'typescript' | 'react-patterns' | 'accessibility' | 'security';
  readonly rule: string;
  readonly severity: 'error' | 'warning';
}

export interface PerformanceTest {
  readonly name: string;
  readonly metrics: readonly PerformanceMetric[];
}

export interface PerformanceMetric {
  readonly name: string;
  readonly type: 'build-time' | 'bundle-size' | 'startup-time' | 'memory-usage';
  readonly threshold: number;
  readonly unit: 'ms' | 'mb' | 'kb' | 'bytes';
}

export interface ValidationResult {
  readonly success: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
  readonly details?: any;
  readonly duration?: number;
}

export interface FileValidation {
  readonly filePath: string;
  readonly exists: boolean;
  readonly content?: string;
  readonly validations: readonly ContentValidation[];
}

export interface ContentValidation {
  readonly type: 'contains' | 'matches' | 'not-contains' | 'structure';
  readonly pattern: string | RegExp;
  readonly message: string;
  readonly severity: 'error' | 'warning';
  readonly result?: boolean;
}

export interface ProjectStructure {
  readonly framework: string;
  readonly template: string;
  readonly requiredFiles: readonly string[];
  readonly requiredDirectories: readonly string[];
  readonly packageJsonChecks: readonly PackageJsonCheck[];
  readonly codeChecks: readonly CodeCheck[];
}

export interface PackageJsonCheck {
  readonly field: string;
  readonly expected: any;
  readonly type: 'equals' | 'contains' | 'exists' | 'version-range';
  readonly message: string;
}

export interface CodeCheck {
  readonly filePattern: string;
  readonly validations: readonly ContentValidation[];
}

export interface CLAUDEComplianceRules {
  readonly typescript: readonly TypeScriptRule[];
  readonly react: readonly ReactRule[];
  readonly tailwind: readonly TailwindRule[];
  readonly accessibility: readonly AccessibilityRule[];
  readonly sizing: readonly SizingRule[];
}

export interface TypeScriptRule {
  readonly rule: string;
  readonly pattern: string | RegExp;
  readonly antiPattern?: string | RegExp;
  readonly severity: 'error' | 'warning';
  readonly message: string;
}

export interface ReactRule {
  readonly rule: string;
  readonly pattern: string | RegExp;
  readonly antiPattern?: string | RegExp;
  readonly severity: 'error' | 'warning';
  readonly message: string;
}

export interface TailwindRule {
  readonly rule: string;
  readonly pattern: string | RegExp;
  readonly antiPattern?: string | RegExp;
  readonly severity: 'error' | 'warning';
  readonly message: string;
}

export interface AccessibilityRule {
  readonly rule: string;
  readonly pattern: string | RegExp;
  readonly antiPattern?: string | RegExp;
  readonly severity: 'error' | 'warning';
  readonly wcagLevel: 'A' | 'AA' | 'AAA';
  readonly message: string;
}

export interface SizingRule {
  readonly rule: string;
  readonly minHeight?: string;
  readonly minWidth?: string;
  readonly pattern: string | RegExp;
  readonly severity: 'error' | 'warning';
  readonly message: string;
}

export interface NSMComplianceRules {
  readonly classification: readonly ClassificationRule[];
  readonly dataHandling: readonly DataHandlingRule[];
  readonly security: readonly SecurityRule[];
  readonly localization: readonly LocalizationRule[];
}

export interface ClassificationRule {
  readonly level: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
  readonly requirements: readonly string[];
  readonly validations: readonly ContentValidation[];
}

export interface DataHandlingRule {
  readonly type: 'personal-data' | 'sensitive-data' | 'financial-data';
  readonly pattern: string | RegExp;
  readonly requirements: readonly string[];
  readonly severity: 'error' | 'warning';
}

export interface SecurityRule {
  readonly rule: string;
  readonly pattern: string | RegExp;
  readonly severity: 'error' | 'warning';
  readonly nsmRequirement: string;
}

export interface LocalizationRule {
  readonly locale: 'nb-NO' | 'en-US';
  readonly requirement: string;
  readonly pattern: string | RegExp;
  readonly severity: 'error' | 'warning';
}

export interface WCAGComplianceRules {
  readonly levelA: readonly WCAGRule[];
  readonly levelAA: readonly WCAGRule[];
  readonly levelAAA: readonly WCAGRule[];
}

export interface WCAGRule {
  readonly guideline: string;
  readonly criterion: string;
  readonly pattern: string | RegExp;
  readonly antiPattern?: string | RegExp;
  readonly severity: 'error' | 'warning';
  readonly message: string;
  readonly techniques: readonly string[];
}

export interface TestEnvironment {
  readonly node: string;
  readonly platform: string;
  readonly arch: string;
  readonly cwd: string;
  readonly timestamp: string;
  readonly cli?: {
    readonly version: string;
    readonly path: string;
  };
  readonly designSystem?: {
    readonly version: string;
    readonly path: string;
  };
}