/**
 * Base GCP Service Implementation
 * Following Single Responsibility and Open/Closed Principles
 */

import { GeneratedInfrastructureFile } from "../../../infrastructure/index.js";
import { 
  IGCPService, 
  ValidationResult, 
  ValidationError, 
  ValidationWarning,
  IGCPTemplateGenerator,
  IGCPConfigurationManager
} from "../interfaces/service-interfaces.js";
import { GCPBaseConfig } from "../interfaces/index.js";

export abstract class BaseGCPService implements IGCPService {
  protected readonly config: GCPBaseConfig;
  protected readonly templateGenerator: IGCPTemplateGenerator;
  protected readonly configManager: IGCPConfigurationManager;

  constructor(
    config: GCPBaseConfig,
    templateGenerator: IGCPTemplateGenerator,
    configManager: IGCPConfigurationManager
  ) {
    this.config = config;
    this.templateGenerator = templateGenerator;
    this.configManager = configManager;
  }

  abstract get name(): string;
  abstract isEnabled(): boolean;
  abstract generateFiles(outputDir: string): Promise<GeneratedInfrastructureFile[]>;

  async validate(): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Base validation
    if (!this.config.projectId) {
      errors.push({
        field: "projectId",
        message: "Project ID is required",
        severity: "error"
      });
    }

    if (!this.config.region) {
      errors.push({
        field: "region",
        message: "Region is required",
        severity: "error"
      });
    }

    // Service-specific validation
    const serviceValidation = await this.validateServiceConfig();
    errors.push(...serviceValidation.errors);
    warnings.push(...serviceValidation.warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  protected abstract validateServiceConfig(): Promise<ValidationResult>;

  protected createFile(
    path: string, 
    content: string, 
    type: "terraform" | "yaml" | "json" | "script" | "documentation" = "terraform"
  ): GeneratedInfrastructureFile {
    return {
      path,
      content,
      type,
      description: `Generated ${type} file for ${this.name}`,
      dependencies: [],
      postInstallInstructions: [],
      estimatedCost: 0,
      securityLevel: "basic",
      complianceFeatures: []
    };
  }

  protected validateRequired<T>(
    value: T | undefined, 
    fieldName: string, 
    message?: string
  ): ValidationError | null {
    if (!value) {
      return {
        field: fieldName,
        message: message || `${fieldName} is required`,
        severity: "error"
      };
    }
    return null;
  }

  protected validateEnum<T extends string>(
    value: T, 
    allowedValues: readonly T[], 
    fieldName: string
  ): ValidationError | null {
    if (!allowedValues.includes(value)) {
      return {
        field: fieldName,
        message: `${fieldName} must be one of: ${allowedValues.join(", ")}`,
        severity: "error"
      };
    }
    return null;
  }

  protected validateRange(
    value: number, 
    min: number, 
    max: number, 
    fieldName: string
  ): ValidationError | null {
    if (value < min || value > max) {
      return {
        field: fieldName,
        message: `${fieldName} must be between ${min} and ${max}`,
        severity: "error"
      };
    }
    return null;
  }

  protected createWarning(field: string, message: string, recommendation: string): ValidationWarning {
    return {
      field,
      message,
      recommendation
    };
  }

  protected getEnvironmentPrefix(): string {
    switch (this.config.environment) {
      case "development":
        return "dev";
      case "staging":
        return "staging";
      case "production":
        return "prod";
      default:
        return "all";
    }
  }

  protected getResourceName(baseName: string): string {
    const prefix = this.getEnvironmentPrefix();
    return `${prefix}-${this.config.projectId}-${baseName}`;
  }

  protected addLabels(labels: Record<string, string> = {}): Record<string, string> {
    return {
      environment: this.config.environment,
      project: this.config.projectId,
      service: this.name,
      ...this.config.labels,
      ...labels
    };
  }

  protected async readTemplate(templatePath: string): Promise<string> {
    // In a real implementation, this would read from a template file
    // For now, we'll generate templates programmatically
    return "";
  }

  protected replaceTemplateVariables(template: string, variables: Record<string, string>): string {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      result = result.replace(regex, value);
    }
    return result;
  }
}