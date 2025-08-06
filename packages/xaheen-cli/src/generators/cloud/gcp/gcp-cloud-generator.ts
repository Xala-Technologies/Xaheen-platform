/**
 * Refactored GCP Cloud Generator
 * Following SOLID principles with modular service architecture
 */

import { GeneratedInfrastructureFile, InfrastructureGenerator, InfrastructureGeneratorOptions, InfrastructureGeneratorResult } from "../../infrastructure/index";
import { 
  GCPBaseConfig,
  GCPComputeConfig,
  GCPStorageConfig,
  GCPSecurityConfig,
  GCPNetworkingConfig,
  GCPObservabilityConfig
} from "./interfaces/index.js";
import {
  IGCPService,
  ValidationResult,
  ValidationError,
  IGCPCostCalculator,
  IGCPSecurityAnalyzer
} from "./interfaces/service-interfaces.js";
import { GCPServiceFactory } from "./factories/service-factory";
import { GCPCostCalculator } from "./services/cost-calculator";
import { GCPSecurityAnalyzer } from "./services/security-analyzer";

export interface GCPCloudOptions extends InfrastructureGeneratorOptions {
  readonly projectId: string;
  readonly region: string;
  readonly zone?: string;
  readonly environment: "development" | "staging" | "production" | "all";
  readonly billingAccountId?: string;
  readonly labels?: Record<string, string>;
  
  readonly compute: GCPComputeConfig;
  readonly storage: GCPStorageConfig;
  readonly security: GCPSecurityConfig;
  readonly networking: GCPNetworkingConfig;
  readonly observability: GCPObservabilityConfig;
}

/**
 * Refactored GCP Cloud Generator
 * 
 * This generator follows SOLID principles:
 * - Single Responsibility: Each service handles one domain
 * - Open/Closed: New services can be added without modifying existing code
 * - Liskov Substitution: All services implement common interfaces
 * - Interface Segregation: Small, focused interfaces for each service
 * - Dependency Inversion: Services are injected via factory pattern
 */
export class GCPCloudGenerator extends InfrastructureGenerator {
  private readonly serviceFactory: GCPServiceFactory;
  private readonly costCalculator: IGCPCostCalculator;
  private readonly securityAnalyzer: IGCPSecurityAnalyzer;
  private services: Record<string, IGCPService> = {};

  constructor() {
    super();
    // Dependencies will be injected in the generate method
    this.serviceFactory = null!;
    this.costCalculator = new GCPCostCalculator();
    this.securityAnalyzer = new GCPSecurityAnalyzer();
  }

  async generate(outputDir: string, options: GCPCloudOptions): Promise<InfrastructureGeneratorResult> {
    try {
      // Initialize services based on configuration
      this.initializeServices(options);

      // Validate all configurations
      const validationResult = await this.validateAllConfigurations();
      if (!validationResult.isValid) {
        throw new Error(`Configuration validation failed: ${validationResult.errors.map(e => e.message).join(', ')}`);
      }

      // Generate files from all enabled services
      const allFiles = await this.generateAllServiceFiles(outputDir);

      // Generate shared infrastructure files
      const sharedFiles = await this.generateSharedInfrastructure(outputDir, options);

      // Calculate costs and security analysis
      const costReport = await this.costCalculator.generateCostReport();
      const securityAnalysis = await this.securityAnalyzer.analyzeSecurityConfiguration(options);

      // Combine all generated files
      const files = [...allFiles, ...sharedFiles];

      return {
        files,
        nextSteps: this.generateNextSteps(options),
        estimatedCost: costReport.totalCost,
        securityLevel: this.calculateSecurityLevel(securityAnalysis.overallScore),
        complianceFeatures: this.getComplianceFeatures(options)
      };

    } catch (error) {
      console.error('GCP Cloud Generator error:', error);
      throw error;
    }
  }

  private initializeServices(options: GCPCloudOptions): void {
    const baseConfig: GCPBaseConfig = {
      projectId: options.projectId,
      region: options.region,
      zone: options.zone,
      environment: options.environment,
      labels: options.labels
    };

    // Initialize service factory with base configuration
    const factory = GCPServiceFactory.create(baseConfig);

    // Create enabled services
    const enabledServices = factory.createEnabledServices({
      compute: options.compute,
      storage: options.storage,
      security: options.security,
      networking: options.networking,
      observability: options.observability
    });

    // Store services for later use
    this.services = Object.fromEntries(
      Object.entries(enabledServices).filter(([_, service]) => service != null)
    ) as Record<string, IGCPService>;
  }

  private async validateAllConfigurations(): Promise<ValidationResult> {
    const allErrors: ValidationError[] = [];
    const allWarnings: any[] = [];

    // Validate each service
    for (const [serviceName, service] of Object.entries(this.services)) {
      const result = await service.validate();
      
      // Add service context to errors
      const serviceErrors = result.errors.map(error => ({
        ...error,
        field: `${serviceName}.${error.field}`
      }));
      
      allErrors.push(...serviceErrors);
      allWarnings.push(...result.warnings);
    }

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings
    };
  }

  private async generateAllServiceFiles(outputDir: string): Promise<GeneratedInfrastructureFile[]> {
    const allFiles: GeneratedInfrastructureFile[] = [];

    // Generate files from each service in parallel
    const serviceGenerationPromises = Object.entries(this.services).map(async ([serviceName, service]) => {
      try {
        console.log(`Generating files for ${serviceName}...`);
        return await service.generateFiles(outputDir);
      } catch (error) {
        console.error(`Error generating files for ${serviceName}:`, error);
        throw error;
      }
    });

    const serviceFiles = await Promise.all(serviceGenerationPromises);
    
    // Flatten all service files
    for (const files of serviceFiles) {
      allFiles.push(...files);
    }

    return allFiles;
  }

  private async generateSharedInfrastructure(outputDir: string, options: GCPCloudOptions): Promise<GeneratedInfrastructureFile[]> {
    const files: GeneratedInfrastructureFile[] = [];

    // Generate main Terraform configuration
    files.push({
      path: `${outputDir}/terraform/main.tf`,
      content: this.generateMainTerraform(options),
      type: "terraform",
      description: "Main Terraform configuration",
      dependencies: [],
      postInstallInstructions: [],
      estimatedCost: 0,
      securityLevel: "basic",
      complianceFeatures: []
    });

    // Generate variables
    files.push({
      path: `${outputDir}/terraform/variables.tf`,
      content: this.generateVariablesTerraform(options),
      type: "terraform",
      description: "Terraform variables",
      dependencies: [],
      postInstallInstructions: [],
      estimatedCost: 0,
      securityLevel: "basic",
      complianceFeatures: []
    });

    // Generate outputs
    files.push({
      path: `${outputDir}/terraform/outputs.tf`,
      content: this.generateOutputsTerraform(options),
      type: "terraform",
      description: "Terraform outputs",
      dependencies: [],
      postInstallInstructions: [],
      estimatedCost: 0,
      securityLevel: "basic",
      complianceFeatures: []
    });

    // Generate provider configuration
    files.push({
      path: `${outputDir}/terraform/providers.tf`,
      content: this.generateProvidersTerraform(options),
      type: "terraform",
      description: "Terraform providers configuration",
      dependencies: [],
      postInstallInstructions: [],
      estimatedCost: 0,
      securityLevel: "basic",
      complianceFeatures: []
    });

    // Generate deployment scripts
    files.push({
      path: `${outputDir}/scripts/deploy.sh`,
      content: this.generateDeploymentScript(options),
      type: "script",
      description: "Main deployment script",
      dependencies: [],
      postInstallInstructions: [],
      estimatedCost: 0,
      securityLevel: "basic",
      complianceFeatures: []
    });

    // Generate environment configuration
    files.push({
      path: `${outputDir}/.env.example`,
      content: this.generateEnvTemplate(options),
      type: "documentation",
      description: "Environment variables template",
      dependencies: [],
      postInstallInstructions: [],
      estimatedCost: 0,
      securityLevel: "basic",
      complianceFeatures: []
    });

    return files;
  }

  private generateMainTerraform(options: GCPCloudOptions): string {
    return `# Generated GCP Infrastructure
terraform {
  required_version = ">= 1.5"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
}

# Local values
locals {
  project_id  = var.project_id
  region      = var.region
  environment = var.environment
  
  common_labels = {
    project     = var.project_id
    environment = var.environment
    managed_by  = "terraform"
    ${options.labels ? Object.entries(options.labels).map(([k, v]) => `${k} = "${v}"`).join('\n    ') : ''}
  }
}

# Random suffix for unique resource names
resource "random_id" "suffix" {
  byte_length = 4
}

# Enable required APIs
resource "google_project_service" "required_apis" {
  for_each = toset([
    "cloudfunctions.googleapis.com",
    "run.googleapis.com",
    "firestore.googleapis.com",
    "storage.googleapis.com",
    "iam.googleapis.com",
    "compute.googleapis.com",
    "monitoring.googleapis.com",
    "logging.googleapis.com"
  ])
  
  service = each.value
  project = local.project_id
  
  disable_on_destroy = false
}
`;
  }

  private generateVariablesTerraform(options: GCPCloudOptions): string {
    return `# Generated Terraform Variables

variable "project_id" {
  description = "GCP Project ID"
  type        = string
  default     = "${options.projectId}"
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "${options.region}"
}

variable "zone" {
  description = "GCP Zone"
  type        = string
  default     = "${options.zone || options.region + '-a'}"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "${options.environment}"
  
  validation {
    condition     = contains(["development", "staging", "production"], var.environment)
    error_message = "Environment must be development, staging, or production."
  }
}

${options.billingAccountId ? `
variable "billing_account_id" {
  description = "GCP Billing Account ID"
  type        = string
  default     = "${options.billingAccountId}"
}
` : ''}

# Service-specific variables will be added by individual services
`;
  }

  private generateOutputsTerraform(options: GCPCloudOptions): string {
    return `# Generated Terraform Outputs

output "project_id" {
  description = "GCP Project ID"
  value       = var.project_id
}

output "region" {
  description = "GCP Region"
  value       = var.region
}

output "environment" {
  description = "Environment"
  value       = var.environment
}

# Service-specific outputs will be added by individual services
`;
  }

  private generateProvidersTerraform(options: GCPCloudOptions): string {
    return `# Generated Provider Configuration

provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

provider "random" {
  # Random provider configuration
}
`;
  }

  private generateDeploymentScript(options: GCPCloudOptions): string {
    return `#!/bin/bash
set -e

echo "Deploying GCP Infrastructure..."

# Set project
gcloud config set project ${options.projectId}

# Initialize Terraform
echo "Initializing Terraform..."
cd terraform
terraform init

# Plan deployment
echo "Planning Terraform deployment..."
terraform plan -out=tfplan

# Apply deployment
echo "Applying Terraform deployment..."
terraform apply tfplan

echo "Deployment completed successfully!"

# Show outputs
echo "Generated outputs:"
terraform output
`;
  }

  private generateEnvTemplate(options: GCPCloudOptions): string {
    return `# Generated Environment Configuration Template

# GCP Configuration
GCP_PROJECT_ID=${options.projectId}
GCP_REGION=${options.region}
GCP_ZONE=${options.zone || options.region + '-a'}
ENVIRONMENT=${options.environment}

# Service Configuration
${Object.keys(this.services).map(service => `
# ${service.toUpperCase()} Configuration
${service.toUpperCase()}_ENABLED=true`).join('')}

# Add service-specific environment variables as needed
`;
  }

  private generateNextSteps(options: GCPCloudOptions): string[] {
    const steps = [
      "Review the generated Terraform configuration files",
      "Set up your GCP credentials: `gcloud auth application-default login`",
      "Initialize Terraform: `cd terraform && terraform init`",
      "Review and customize variables in `terraform.tfvars`",
      "Plan the deployment: `terraform plan`",
      "Deploy the infrastructure: `terraform apply`"
    ];

    // Add service-specific next steps
    if (this.services.compute) {
      steps.push("Deploy Cloud Functions and Cloud Run services using the generated scripts");
    }
    
    if (this.services.storage) {
      steps.push("Configure Firestore security rules and indexes");
    }
    
    if (this.services.security) {
      steps.push("Review and configure IAM permissions and Firebase Auth settings");
    }

    return steps;
  }

  private calculateSecurityLevel(securityScore: number): "basic" | "enhanced" | "enterprise" {
    if (securityScore >= 90) return "enterprise";
    if (securityScore >= 70) return "enhanced";
    return "basic";
  }

  private getComplianceFeatures(options: GCPCloudOptions): string[] {
    const features: string[] = [];
    
    if (this.services.security) {
      features.push("IAM Best Practices", "Firebase Auth Integration");
    }
    
    if (this.services.observability) {
      features.push("Monitoring & Logging", "Audit Trails");
    }
    
    if (options.environment === "production") {
      features.push("Production Security Standards");
    }
    
    return features;
  }
}