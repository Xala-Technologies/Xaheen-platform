/**
 * Terraform Service Interfaces
 * Following Interface Segregation Principle
 */

import { GeneratedInfrastructureFile } from "../../index.js";

// Base service interface
export interface ITerraformService {
  readonly name: string;
  readonly cloudProvider: string;
  isEnabled(): boolean;
  validate(): Promise<TerraformValidationResult>;
  generateFiles(outputDir: string): Promise<GeneratedInfrastructureFile[]>;
}

// Service-specific interfaces
export interface ITerraformNetworkingService extends ITerraformService {
  generateVPC(outputDir: string): Promise<GeneratedInfrastructureFile[]>;
  generateSubnets(outputDir: string): Promise<GeneratedInfrastructureFile[]>;
  generateRouting(outputDir: string): Promise<GeneratedInfrastructureFile[]>;
  generateSecurityGroups(outputDir: string): Promise<GeneratedInfrastructureFile[]>;
  validateNetworkingConfig(): Promise<TerraformValidationResult>;
}

export interface ITerraformComputeService extends ITerraformService {
  generateInstances(outputDir: string): Promise<GeneratedInfrastructureFile[]>;
  generateLoadBalancers(outputDir: string): Promise<GeneratedInfrastructureFile[]>;
  generateAutoScaling(outputDir: string): Promise<GeneratedInfrastructureFile[]>;
  generateContainerServices(outputDir: string): Promise<GeneratedInfrastructureFile[]>;
  validateComputeConfig(): Promise<TerraformValidationResult>;
}

export interface ITerraformStorageService extends ITerraformService {
  generateDatabases(outputDir: string): Promise<GeneratedInfrastructureFile[]>;
  generateObjectStorage(outputDir: string): Promise<GeneratedInfrastructureFile[]>;
  generateFileStorage(outputDir: string): Promise<GeneratedInfrastructureFile[]>;
  generateCaching(outputDir: string): Promise<GeneratedInfrastructureFile[]>;
  validateStorageConfig(): Promise<TerraformValidationResult>;
}

export interface ITerraformSecurityService extends ITerraformService {
  generateIAM(outputDir: string): Promise<GeneratedInfrastructureFile[]>;
  generateEncryption(outputDir: string): Promise<GeneratedInfrastructureFile[]>;
  generateSecrets(outputDir: string): Promise<GeneratedInfrastructureFile[]>;
  generateCertificates(outputDir: string): Promise<GeneratedInfrastructureFile[]>;
  generateWAF(outputDir: string): Promise<GeneratedInfrastructureFile[]>;
  validateSecurityConfig(): Promise<TerraformValidationResult>;
}

export interface ITerraformObservabilityService extends ITerraformService {
  generateMonitoring(outputDir: string): Promise<GeneratedInfrastructureFile[]>;
  generateLogging(outputDir: string): Promise<GeneratedInfrastructureFile[]>;
  generateAlerting(outputDir: string): Promise<GeneratedInfrastructureFile[]>;
  generateTracing(outputDir: string): Promise<GeneratedInfrastructureFile[]>;
  validateObservabilityConfig(): Promise<TerraformValidationResult>;
}

// Template generation interfaces
export interface ITerraformTemplateGenerator {
  generateProviderConfig(cloudProvider: string, config: unknown): string;
  generateResource(resourceType: string, config: unknown): string;
  generateVariable(name: string, config: unknown): string;
  generateOutput(name: string, config: unknown): string;
  generateDataSource(name: string, config: unknown): string;
}

export interface ITerraformCodeGenerator {
  generateMainTf(config: unknown): string;
  generateVariablesTf(config: unknown): string;
  generateOutputsTf(config: unknown): string;
  generateProvidersTf(config: unknown): string;
  generateVersionsTf(config: unknown): string;
}

// Factory interfaces
export interface ITerraformServiceFactory {
  createNetworkingService(cloudProvider: string, config: unknown): ITerraformNetworkingService;
  createComputeService(cloudProvider: string, config: unknown): ITerraformComputeService;
  createStorageService(cloudProvider: string, config: unknown): ITerraformStorageService;
  createSecurityService(cloudProvider: string, config: unknown): ITerraformSecurityService;
  createObservabilityService(cloudProvider: string, config: unknown): ITerraformObservabilityService;
}

export interface ITerraformTemplateFactory {
  createTemplateGenerator(cloudProvider: string): ITerraformTemplateGenerator;
  createCodeGenerator(cloudProvider: string): ITerraformCodeGenerator;
}

// Configuration and validation interfaces
export interface ITerraformConfigurationManager {
  loadConfiguration(configPath: string): Promise<unknown>;
  validateConfiguration(config: unknown): Promise<TerraformValidationResult>;
  mergeConfigurations(configs: unknown[]): unknown;
  getEnvironmentConfig(environment: string): unknown;
  generateTerraformVars(config: unknown): string;
}

export interface ITerraformStateManager {
  configureRemoteState(backend: string, config: unknown): string;
  generateBackendConfig(backend: string, config: unknown): string;
  validateStateConfiguration(config: unknown): Promise<TerraformValidationResult>;
}

export interface ITerraformCostEstimator {
  estimateServiceCost(serviceType: string, config: unknown): Promise<TerraformCostEstimate>;
  estimateTotalCost(config: unknown): Promise<TerraformCostReport>;
  generateCostOptimizationReport(): Promise<TerraformCostOptimization[]>;
}

export interface ITerraformSecurityAnalyzer {
  analyzeSecurityConfiguration(config: unknown): Promise<TerraformSecurityAnalysis>;
  validateCompliance(standards: readonly string[]): Promise<TerraformComplianceReport>;
  generateSecurityRecommendations(): Promise<TerraformSecurityRecommendation[]>;
}

// Cloud provider specific interfaces
export interface IAWSService extends ITerraformService {
  generateAWSResources(outputDir: string): Promise<GeneratedInfrastructureFile[]>;
}

export interface IAzureService extends ITerraformService {
  generateAzureResources(outputDir: string): Promise<GeneratedInfrastructureFile[]>;
}

export interface IGCPService extends ITerraformService {
  generateGCPResources(outputDir: string): Promise<GeneratedInfrastructureFile[]>;
}

// Result and validation types
export interface TerraformValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly TerraformValidationError[];
  readonly warnings: readonly TerraformValidationWarning[];
}

export interface TerraformValidationError {
  readonly field: string;
  readonly message: string;
  readonly severity: "error" | "warning" | "info";
  readonly code?: string;
}

export interface TerraformValidationWarning {
  readonly field: string;
  readonly message: string;
  readonly recommendation: string;
}

export interface TerraformCostEstimate {
  readonly service: string;
  readonly monthlyEstimate: number;
  readonly currency: string;
  readonly breakdown: readonly TerraformCostBreakdown[];
  readonly assumptions: readonly string[];
}

export interface TerraformCostBreakdown {
  readonly component: string;
  readonly cost: number;
  readonly unit: string;
  readonly quantity: number;
  readonly pricePerUnit: number;
}

export interface TerraformCostReport {
  readonly totalCost: number;
  readonly currency: string;
  readonly services: readonly TerraformCostEstimate[];
  readonly optimizations: readonly TerraformCostOptimization[];
  readonly assumptions: readonly string[];
}

export interface TerraformCostOptimization {
  readonly service: string;
  readonly recommendation: string;
  readonly potentialSavings: number;
  readonly implementationComplexity: "low" | "medium" | "high";
  readonly riskLevel: "low" | "medium" | "high";
}

export interface TerraformSecurityAnalysis {
  readonly overallScore: number;
  readonly vulnerabilities: readonly TerraformSecurityVulnerability[];
  readonly recommendations: readonly TerraformSecurityRecommendation[];
  readonly complianceStatus: readonly TerraformComplianceStatus[];
}

export interface TerraformSecurityVulnerability {
  readonly id: string;
  readonly severity: "critical" | "high" | "medium" | "low";
  readonly title: string;
  readonly description: string;
  readonly remediation: string;
  readonly affectedResources: readonly string[];
  readonly cveIds?: readonly string[];
}

export interface TerraformSecurityRecommendation {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly impact: "high" | "medium" | "low";
  readonly implementationEffort: "low" | "medium" | "high";
  readonly category: "access-control" | "encryption" | "network" | "monitoring" | "compliance";
}

export interface TerraformComplianceStatus {
  readonly standard: string;
  readonly compliant: boolean;
  readonly coverage: number;
  readonly gaps: readonly TerraformComplianceGap[];
}

export interface TerraformComplianceGap {
  readonly requirement: string;
  readonly status: "missing" | "partial" | "non-compliant";
  readonly remediation: string;
  readonly priority: "high" | "medium" | "low";
}

export interface TerraformComplianceReport {
  readonly standards: readonly TerraformComplianceStatus[];
  readonly overallCompliance: number;
  readonly recommendations: readonly TerraformComplianceRecommendation[];
}

export interface TerraformComplianceRecommendation {
  readonly standard: string;
  readonly requirement: string;
  readonly recommendation: string;
  readonly priority: "high" | "medium" | "low";
  readonly estimatedEffort: string;
}

// Resource management interfaces
export interface ITerraformResourceManager {
  generateResource(type: string, name: string, config: unknown): string;
  generateDataSource(type: string, name: string, config: unknown): string;
  generateModule(name: string, source: string, config: unknown): string;
  validateResourceConfiguration(type: string, config: unknown): TerraformValidationResult;
}

export interface ITerraformModuleManager {
  generateModule(name: string, config: unknown): Promise<GeneratedInfrastructureFile[]>;
  validateModuleConfiguration(config: unknown): Promise<TerraformValidationResult>;
  getModuleDependencies(name: string): readonly string[];
}

// Environment and workspace management
export interface ITerraformWorkspaceManager {
  generateWorkspaceConfiguration(environment: string): string;
  validateWorkspaceConfiguration(config: unknown): TerraformValidationResult;
  generateEnvironmentVariables(environment: string, config: unknown): Record<string, string>;
}

// Testing and validation interfaces
export interface ITerraformTestGenerator {
  generateTerratestFiles(config: unknown): Promise<GeneratedInfrastructureFile[]>;
  generateValidationTests(config: unknown): Promise<GeneratedInfrastructureFile[]>;
  generateIntegrationTests(config: unknown): Promise<GeneratedInfrastructureFile[]>;
}

export interface ITerraformLinter {
  lintConfiguration(files: readonly string[]): Promise<TerraformLintResult>;
  formatConfiguration(files: readonly string[]): Promise<void>;
  validateSyntax(content: string): TerraformValidationResult;
}

export interface TerraformLintResult {
  readonly isValid: boolean;
  readonly issues: readonly TerraformLintIssue[];
  readonly suggestions: readonly TerraformLintSuggestion[];
}

export interface TerraformLintIssue {
  readonly file: string;
  readonly line: number;
  readonly column: number;
  readonly message: string;
  readonly severity: "error" | "warning" | "info";
  readonly rule: string;
}

export interface TerraformLintSuggestion {
  readonly file: string;
  readonly line: number;
  readonly message: string;
  readonly suggestion: string;
  readonly autoFixable: boolean;
}