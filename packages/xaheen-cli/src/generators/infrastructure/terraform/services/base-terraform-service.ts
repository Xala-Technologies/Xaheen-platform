/**
 * Base Terraform Service Implementation
 * Following Single Responsibility and Open/Closed Principles
 */

import { GeneratedInfrastructureFile } from "../../index.js";
import { 
  ITerraformService, 
  TerraformValidationResult, 
  TerraformValidationError, 
  TerraformValidationWarning,
  ITerraformTemplateGenerator,
  ITerraformConfigurationManager
} from "../interfaces/service-interfaces.js";
import { TerraformBaseConfig } from "../interfaces/index.js";

export abstract class BaseTerraformService implements ITerraformService {
  protected readonly config: TerraformBaseConfig;
  protected readonly templateGenerator: ITerraformTemplateGenerator;
  protected readonly configManager: ITerraformConfigurationManager;

  constructor(
    config: TerraformBaseConfig,
    templateGenerator: ITerraformTemplateGenerator,
    configManager: ITerraformConfigurationManager
  ) {
    this.config = config;
    this.templateGenerator = templateGenerator;
    this.configManager = configManager;
  }

  abstract get name(): string;
  abstract get cloudProvider(): string;
  abstract isEnabled(): boolean;
  abstract generateFiles(outputDir: string): Promise<GeneratedInfrastructureFile[]>;

  async validate(): Promise<TerraformValidationResult> {
    const errors: TerraformValidationError[] = [];
    const warnings: TerraformValidationWarning[] = [];

    // Base validation
    if (!this.config.cloudProvider) {
      errors.push({
        field: "cloudProvider",
        message: "Cloud provider is required",
        severity: "error",
        code: "MISSING_CLOUD_PROVIDER"
      });
    }

    if (!this.config.region) {
      errors.push({
        field: "region",
        message: "Region is required",
        severity: "error",
        code: "MISSING_REGION"
      });
    }

    if (!this.config.projectName) {
      errors.push({
        field: "projectName",
        message: "Project name is required",
        severity: "error",
        code: "MISSING_PROJECT_NAME"
      });
    }

    // Validate cloud provider
    const validProviders = ["aws", "azure", "gcp", "multi-cloud"];
    if (this.config.cloudProvider && !validProviders.includes(this.config.cloudProvider)) {
      errors.push({
        field: "cloudProvider",
        message: `Invalid cloud provider. Must be one of: ${validProviders.join(", ")}`,
        severity: "error",
        code: "INVALID_CLOUD_PROVIDER"
      });
    }

    // Validate environment
    const validEnvironments = ["development", "staging", "production", "all"];
    if (this.config.environment && !validEnvironments.includes(this.config.environment)) {
      errors.push({
        field: "environment",
        message: `Invalid environment. Must be one of: ${validEnvironments.join(", ")}`,
        severity: "error",
        code: "INVALID_ENVIRONMENT"
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

  protected abstract validateServiceConfig(): Promise<TerraformValidationResult>;

  protected createFile(
    path: string, 
    content: string, 
    type: "terraform" | "yaml" | "json" | "script" | "documentation" = "terraform",
    description?: string
  ): GeneratedInfrastructureFile {
    return {
      path,
      content,
      type,
      description: description || `Generated ${type} file for ${this.name}`,
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
    code?: string,
    message?: string
  ): TerraformValidationError | null {
    if (!value) {
      return {
        field: fieldName,
        message: message || `${fieldName} is required`,
        severity: "error",
        code: code || `MISSING_${fieldName.toUpperCase()}`
      };
    }
    return null;
  }

  protected validateEnum<T extends string>(
    value: T, 
    allowedValues: readonly T[], 
    fieldName: string,
    code?: string
  ): TerraformValidationError | null {
    if (!allowedValues.includes(value)) {
      return {
        field: fieldName,
        message: `${fieldName} must be one of: ${allowedValues.join(", ")}`,
        severity: "error",
        code: code || `INVALID_${fieldName.toUpperCase()}`
      };
    }
    return null;
  }

  protected validateRange(
    value: number, 
    min: number, 
    max: number, 
    fieldName: string,
    code?: string
  ): TerraformValidationError | null {
    if (value < min || value > max) {
      return {
        field: fieldName,
        message: `${fieldName} must be between ${min} and ${max}`,
        severity: "error",
        code: code || `INVALID_RANGE_${fieldName.toUpperCase()}`
      };
    }
    return null;
  }

  protected validateCidr(
    cidr: string, 
    fieldName: string,
    code?: string
  ): TerraformValidationError | null {
    const cidrRegex = /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/;
    if (!cidrRegex.test(cidr)) {
      return {
        field: fieldName,
        message: `${fieldName} must be a valid CIDR block (e.g., 10.0.0.0/16)`,
        severity: "error",
        code: code || `INVALID_CIDR_${fieldName.toUpperCase()}`
      };
    }
    return null;
  }

  protected createWarning(
    field: string, 
    message: string, 
    recommendation: string
  ): TerraformValidationWarning {
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
    return `${prefix}-${this.config.projectName}-${baseName}`;
  }

  protected addTags(tags: Record<string, string> = {}): Record<string, string> {
    return {
      Environment: this.config.environment,
      Project: this.config.projectName,
      Service: this.name,
      ManagedBy: "terraform",
      CloudProvider: this.config.cloudProvider,
      ...this.config.tags,
      ...tags
    };
  }

  protected generateTerraformVariable(
    name: string, 
    type: string, 
    description: string, 
    defaultValue?: unknown,
    validation?: Record<string, unknown>
  ): string {
    let variable = `variable "${name}" {\n`;
    variable += `  description = "${description}"\n`;
    variable += `  type        = ${type}\n`;
    
    if (defaultValue !== undefined) {
      const defaultStr = typeof defaultValue === "string" 
        ? `"${defaultValue}"` 
        : JSON.stringify(defaultValue);
      variable += `  default     = ${defaultStr}\n`;
    }
    
    if (validation) {
      variable += `  validation {\n`;
      variable += `    condition     = ${validation.condition}\n`;
      variable += `    error_message = "${validation.error_message}"\n`;
      variable += `  }\n`;
    }
    
    variable += `}\n`;
    return variable;
  }

  protected generateTerraformOutput(
    name: string, 
    value: string, 
    description: string,
    sensitive = false
  ): string {
    let output = `output "${name}" {\n`;
    output += `  description = "${description}"\n`;
    output += `  value       = ${value}\n`;
    
    if (sensitive) {
      output += `  sensitive   = true\n`;
    }
    
    output += `}\n`;
    return output;
  }

  protected generateTerraformLocal(name: string, value: string): string {
    return `  ${name} = ${value}\n`;
  }

  protected generateTerraformResource(
    resourceType: string, 
    resourceName: string, 
    config: Record<string, unknown>
  ): string {
    let resource = `resource "${resourceType}" "${resourceName}" {\n`;
    
    for (const [key, value] of Object.entries(config)) {
      if (value !== undefined && value !== null) {
        const formattedValue = this.formatTerraformValue(value);
        resource += `  ${key} = ${formattedValue}\n`;
      }
    }
    
    resource += `}\n`;
    return resource;
  }

  protected generateTerraformDataSource(
    dataSourceType: string, 
    dataSourceName: string, 
    config: Record<string, unknown>
  ): string {
    let dataSource = `data "${dataSourceType}" "${dataSourceName}" {\n`;
    
    for (const [key, value] of Object.entries(config)) {
      if (value !== undefined && value !== null) {
        const formattedValue = this.formatTerraformValue(value);
        dataSource += `  ${key} = ${formattedValue}\n`;
      }
    }
    
    dataSource += `}\n`;
    return dataSource;
  }

  private formatTerraformValue(value: unknown): string {
    if (typeof value === "string") {
      return `"${value}"`;
    } else if (typeof value === "number" || typeof value === "boolean") {
      return String(value);
    } else if (Array.isArray(value)) {
      const items = value.map(item => this.formatTerraformValue(item)).join(", ");
      return `[${items}]`;
    } else if (typeof value === "object" && value !== null) {
      const entries = Object.entries(value)
        .map(([k, v]) => `${k} = ${this.formatTerraformValue(v)}`)
        .join("\n    ");
      return `{\n    ${entries}\n  }`;
    }
    return String(value);
  }

  protected async readTemplate(templatePath: string): Promise<string> {
    // In a real implementation, this would read from template files
    // For now, we'll generate templates programmatically
    return "";
  }

  protected replaceTemplateVariables(
    template: string, 
    variables: Record<string, string>
  ): string {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      result = result.replace(regex, value);
    }
    return result;
  }
}