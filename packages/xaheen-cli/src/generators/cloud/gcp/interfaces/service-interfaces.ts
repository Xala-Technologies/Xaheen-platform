/**
 * GCP Service Interfaces
 * Following Interface Segregation Principle - small, focused interfaces
 */

import { GeneratedInfrastructureFile } from "../../../infrastructure/index.js";

// Base service interface following Single Responsibility Principle
export interface IGCPService {
  readonly name: string;
  isEnabled(): boolean;
  validate(): Promise<ValidationResult>;
  generateFiles(outputDir: string): Promise<GeneratedInfrastructureFile[]>;
}

// Service-specific interfaces
export interface IGCPComputeService extends IGCPService {
  generateCloudFunctions(outputDir: string): Promise<GeneratedInfrastructureFile[]>;
  generateCloudRun(outputDir: string): Promise<GeneratedInfrastructureFile[]>;
  validateComputeConfig(): Promise<ValidationResult>;
}

export interface IGCPStorageService extends IGCPService {
  generateCloudStorage(outputDir: string): Promise<GeneratedInfrastructureFile[]>;
  generateFirestore(outputDir: string): Promise<GeneratedInfrastructureFile[]>;
  validateStorageConfig(): Promise<ValidationResult>;
}

export interface IGCPSecurityService extends IGCPService {
  generateFirebaseAuth(outputDir: string): Promise<GeneratedInfrastructureFile[]>;
  generateIAM(outputDir: string): Promise<GeneratedInfrastructureFile[]>;
  generateSecretManager(outputDir: string): Promise<GeneratedInfrastructureFile[]>;
  validateSecurityConfig(): Promise<ValidationResult>;
}

export interface IGCPNetworkingService extends IGCPService {
  generateVPC(outputDir: string): Promise<GeneratedInfrastructureFile[]>;
  generateLoadBalancer(outputDir: string): Promise<GeneratedInfrastructureFile[]>;
  generateFirewall(outputDir: string): Promise<GeneratedInfrastructureFile[]>;
  validateNetworkingConfig(): Promise<ValidationResult>;
}

export interface IGCPObservabilityService extends IGCPService {
  generateMonitoring(outputDir: string): Promise<GeneratedInfrastructureFile[]>;
  generateLogging(outputDir: string): Promise<GeneratedInfrastructureFile[]>;
  generateTracing(outputDir: string): Promise<GeneratedInfrastructureFile[]>;
  validateObservabilityConfig(): Promise<ValidationResult>;
}

// Template generation interfaces
export interface IGCPTemplateGenerator {
  generateTerraformTemplate(config: unknown): string;
  generateConfigurationTemplate(config: unknown): string;
  generateDocumentationTemplate(config: unknown): string;
}

export interface IGCPTerraformGenerator extends IGCPTemplateGenerator {
  generateMainTf(): string;
  generateVariablesTf(): string;
  generateOutputsTf(): string;
  generateProviderTf(): string;
}

// Factory interfaces following Dependency Inversion Principle
export interface IGCPServiceFactory {
  createComputeService(config: unknown): IGCPComputeService;
  createStorageService(config: unknown): IGCPStorageService;
  createSecurityService(config: unknown): IGCPSecurityService;
  createNetworkingService(config: unknown): IGCPNetworkingService;
  createObservabilityService(config: unknown): IGCPObservabilityService;
}

export interface IGCPTemplateFactory {
  createTerraformGenerator(serviceType: string): IGCPTerraformGenerator;
  createConfigurationGenerator(serviceType: string): IGCPTemplateGenerator;
  createDocumentationGenerator(serviceType: string): IGCPTemplateGenerator;
}

// Configuration interfaces
export interface IGCPConfigurationManager {
  loadConfiguration(configPath: string): Promise<unknown>;
  validateConfiguration(config: unknown): Promise<ValidationResult>;
  mergeConfigurations(configs: unknown[]): unknown;
  getEnvironmentConfig(environment: string): unknown;
}

export interface IGCPCostCalculator {
  calculateServiceCost(serviceType: string, config: unknown): Promise<CostEstimate>;
  calculateTotalCost(config: unknown): Promise<CostEstimate>;
  generateCostReport(): Promise<CostReport>;
}

export interface IGCPSecurityAnalyzer {
  analyzeSecurityConfiguration(config: unknown): Promise<SecurityAnalysis>;
  validateCompliance(standards: readonly string[]): Promise<ComplianceReport>;
  generateSecurityRecommendations(): Promise<SecurityRecommendation[]>;
}

// Result types
export interface ValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly ValidationError[];
  readonly warnings: readonly ValidationWarning[];
}

export interface ValidationError {
  readonly field: string;
  readonly message: string;
  readonly severity: "error" | "warning" | "info";
}

export interface ValidationWarning {
  readonly field: string;
  readonly message: string;
  readonly recommendation: string;
}

export interface CostEstimate {
  readonly service: string;
  readonly monthlyEstimate: number;
  readonly currency: string;
  readonly breakdown: readonly CostBreakdown[];
}

export interface CostBreakdown {
  readonly component: string;
  readonly cost: number;
  readonly unit: string;
  readonly quantity: number;
}

export interface CostReport {
  readonly totalCost: number;
  readonly currency: string;
  readonly services: readonly CostEstimate[];
  readonly recommendations: readonly CostOptimization[];
}

export interface CostOptimization {
  readonly service: string;
  readonly recommendation: string;
  readonly potentialSavings: number;
  readonly implementationComplexity: "low" | "medium" | "high";
}

export interface SecurityAnalysis {
  readonly overallScore: number;
  readonly vulnerabilities: readonly SecurityVulnerability[];
  readonly recommendations: readonly SecurityRecommendation[];
  readonly complianceStatus: readonly ComplianceStatus[];
}

export interface SecurityVulnerability {
  readonly id: string;
  readonly severity: "critical" | "high" | "medium" | "low";
  readonly description: string;
  readonly remediation: string;
  readonly affectedServices: readonly string[];
}

export interface SecurityRecommendation {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly impact: "high" | "medium" | "low";
  readonly implementationEffort: "low" | "medium" | "high";
}

export interface ComplianceStatus {
  readonly standard: string;
  readonly compliant: boolean;
  readonly coverage: number;
  readonly gaps: readonly ComplianceGap[];
}

export interface ComplianceGap {
  readonly requirement: string;
  readonly status: "missing" | "partial" | "non-compliant";
  readonly remediation: string;
}

export interface ComplianceReport {
  readonly standards: readonly ComplianceStatus[];
  readonly overallCompliance: number;
  readonly recommendations: readonly ComplianceRecommendation[];
}

export interface ComplianceRecommendation {
  readonly standard: string;
  readonly requirement: string;
  readonly recommendation: string;
  readonly priority: "high" | "medium" | "low";
}