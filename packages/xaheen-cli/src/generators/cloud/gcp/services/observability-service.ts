/**
 * GCP Observability Service Implementation
 * Handles Monitoring, Logging, and Tracing following Single Responsibility Principle
 */

import { GeneratedInfrastructureFile } from "../../../infrastructure/index";
import { 
  IGCPObservabilityService, 
  ValidationResult,
  IGCPTemplateGenerator,
  IGCPConfigurationManager
} from "../interfaces/service-interfaces.js";
import { 
  GCPBaseConfig, 
  GCPObservabilityConfig
} from "../interfaces/index.js";
import { BaseGCPService } from "./base-service";

export class GCPObservabilityService extends BaseGCPService implements IGCPObservabilityService {
  private readonly observabilityConfig: GCPObservabilityConfig;

  constructor(
    baseConfig: GCPBaseConfig,
    observabilityConfig: GCPObservabilityConfig,
    templateGenerator: IGCPTemplateGenerator,
    configManager: IGCPConfigurationManager
  ) {
    super(baseConfig, templateGenerator, configManager);
    this.observabilityConfig = observabilityConfig;
  }

  get name(): string {
    return "gcp-observability";
  }

  isEnabled(): boolean {
    return this.observabilityConfig.monitoring.enabled || 
           this.observabilityConfig.logging.enabled ||
           this.observabilityConfig.tracing.enabled;
  }

  async generateFiles(outputDir: string): Promise<GeneratedInfrastructureFile[]> {
    const files: GeneratedInfrastructureFile[] = [];

    if (this.observabilityConfig.monitoring.enabled) {
      files.push(...await this.generateMonitoring(outputDir));
    }

    if (this.observabilityConfig.logging.enabled) {
      files.push(...await this.generateLogging(outputDir));
    }

    if (this.observabilityConfig.tracing.enabled) {
      files.push(...await this.generateTracing(outputDir));
    }

    return files;
  }

  async generateMonitoring(outputDir: string): Promise<GeneratedInfrastructureFile[]> {
    return [
      this.createFile(
        `${outputDir}/terraform/monitoring.tf`,
        "# Monitoring Terraform configuration (placeholder)",
        "terraform"
      )
    ];
  }

  async generateLogging(outputDir: string): Promise<GeneratedInfrastructureFile[]> {
    return [
      this.createFile(
        `${outputDir}/terraform/logging.tf`,
        "# Logging Terraform configuration (placeholder)",
        "terraform"
      )
    ];
  }

  async generateTracing(outputDir: string): Promise<GeneratedInfrastructureFile[]> {
    return [
      this.createFile(
        `${outputDir}/terraform/tracing.tf`,
        "# Tracing Terraform configuration (placeholder)",
        "terraform"
      )
    ];
  }

  async validateObservabilityConfig(): Promise<ValidationResult> {
    return {
      isValid: true,
      errors: [],
      warnings: []
    };
  }

  protected async validateServiceConfig(): Promise<ValidationResult> {
    return this.validateObservabilityConfig();
  }
}