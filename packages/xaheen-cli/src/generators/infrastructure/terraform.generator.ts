/**
 * Terraform Infrastructure Generator
 * Generates production-ready Terraform configurations for AWS, Azure, and GCP
 * Follows infrastructure-as-code best practices with remote state management
 */

import { InfrastructureGenerator, InfrastructureGeneratorOptions, InfrastructureGeneratorResult, GeneratedInfrastructureFile } from "./index.js";

export interface TerraformOptions extends InfrastructureGeneratorOptions {
	readonly cloudProvider: "aws" | "azure" | "gcp" | "multi-cloud";
	readonly region: string;
	readonly environment: "development" | "staging" | "production" | "all";
	readonly remoteState: {
		readonly backend: "s3" | "azurerm" | "gcs" | "local";
		readonly bucket?: string;
		readonly container?: string;
		readonly prefix?: string;
		readonly region?: string;
	};
	readonly networking: {
		readonly vpc: boolean;
		readonly subnets: "public" | "private" | "both";
		readonly availabilityZones: number;
		readonly enableNatGateway: boolean;
		readonly enableVpnGateway: boolean;
	};
	readonly compute: {
		readonly instances: readonly ComputeInstance[];
		readonly loadBalancer: boolean;
		readonly autoScaling: boolean;
	};
	readonly storage: {
		readonly databases: readonly DatabaseConfig[];
		readonly objectStorage: boolean;
		readonly fileSystem: boolean;
	};
	readonly security: {
		readonly waf: boolean;
		readonly certificateManager: boolean;
		readonly keyManagement: boolean;
		readonly secretsManager: boolean;
		readonly iamRoles: readonly string[];
	};
	readonly monitoring: {
		readonly cloudWatch: boolean;
		readonly logging: boolean;
		readonly alerting: boolean;
		readonly tracing: boolean;
	};
	readonly compliance: {
		readonly encryption: boolean;
		readonly backup: boolean;
		readonly retention: number;
		readonly auditLogs: boolean;
	};
}

export interface ComputeInstance {
	readonly name: string;
	readonly type: string;
	readonly instanceType: string;
	readonly minSize: number;
	readonly maxSize: number;
	readonly desiredCapacity: number;
	readonly userData?: string;
	readonly keyPair?: string;
	readonly securityGroups: readonly string[];
	readonly subnets: readonly string[];
}

export interface DatabaseConfig {
	readonly name: string;
	readonly engine: "postgresql" | "mysql" | "mariadb" | "oracle" | "sqlserver" | "mongodb" | "redis" | "elasticsearch";
	readonly version: string;
	readonly instanceClass: string;
	readonly allocatedStorage: number;
	readonly encrypted: boolean;
	readonly multiAz: boolean;
	readonly backupRetention: number;
	readonly maintenanceWindow: string;
	readonly backupWindow: string;
}

/**
 * Terraform Infrastructure Generator
 * Generates comprehensive Terraform configurations for cloud infrastructure
 */
export class TerraformGenerator extends InfrastructureGenerator {
	readonly type = "terraform";
	readonly supportedPlatforms = ["aws", "azure", "gcp", "multi-cloud"] as const;

	async generate(
		projectPath: string,
		options: TerraformOptions,
	): Promise<InfrastructureGeneratorResult> {
		const files: GeneratedInfrastructureFile[] = [];
		const commands: string[] = [];

		try {
			// Generate base Terraform files
			files.push(...this.generateBaseTerraformFiles(options));

			// Generate provider configurations
			files.push(...this.generateProviderConfigurations(options));

			// Generate networking infrastructure
			if (options.networking.vpc) {
				files.push(...this.generateNetworkingInfrastructure(options));
			}

			// Generate compute infrastructure
			if (options.compute.instances.length > 0) {
				files.push(...this.generateComputeInfrastructure(options));
			}

			// Generate storage infrastructure
			if (options.storage.databases.length > 0 || options.storage.objectStorage) {
				files.push(...this.generateStorageInfrastructure(options));
			}

			// Generate security infrastructure
			files.push(...this.generateSecurityInfrastructure(options));

			// Generate monitoring infrastructure
			if (options.monitoring.cloudWatch || options.monitoring.logging) {
				files.push(...this.generateMonitoringInfrastructure(options));
			}

			// Generate environment-specific configurations
			if (options.environment === "all") {
				files.push(...this.generateEnvironmentConfigurations(options, "development"));
				files.push(...this.generateEnvironmentConfigurations(options, "staging"));
				files.push(...this.generateEnvironmentConfigurations(options, "production"));
			} else {
				files.push(...this.generateEnvironmentConfigurations(options, options.environment));
			}

			// Generate Terraform commands
			commands.push(
				"terraform init",
				"terraform validate",
				"terraform plan",
				"terraform apply -auto-approve"
			);

			const nextSteps = this.generateNextSteps(options);

			return {
				success: true,
				files,
				commands,
				message: `Terraform infrastructure generated successfully for ${options.cloudProvider}`,
				nextSteps,
			};
		} catch (error) {
			return {
				success: false,
				files: [],
				commands: [],
				message: `Failed to generate Terraform infrastructure: ${error instanceof Error ? error.message : "Unknown error"}`,
				nextSteps: ["Check the error message and try again"],
			};
		}
	}

	/**
	 * Generate base Terraform files (main.tf, variables.tf, outputs.tf)
	 */
	private generateBaseTerraformFiles(options: TerraformOptions): GeneratedInfrastructureFile[] {
		const files: GeneratedInfrastructureFile[] = [];

		// Generate main.tf
		files.push({
			path: "terraform/main.tf",
			content: this.generateMainTf(options),
			type: "config",
			language: "terraform",
		});

		// Generate variables.tf
		files.push({
			path: "terraform/variables.tf",
			content: this.generateVariablesTf(options),
			type: "config",
			language: "terraform",
		});

		// Generate outputs.tf
		files.push({
			path: "terraform/outputs.tf",
			content: this.generateOutputsTf(options),
			type: "config",
			language: "terraform",
		});

		// Generate terraform.tfvars.example
		files.push({
			path: "terraform/terraform.tfvars.example",
			content: this.generateTfVarsExample(options),
			type: "config",
			language: "terraform",
		});

		// Generate versions.tf
		files.push({
			path: "terraform/versions.tf",
			content: this.generateVersionsTf(options),
			type: "config",
			language: "terraform",
		});

		return files;
	}

	/**
	 * Generate provider configurations
	 */
	private generateProviderConfigurations(options: TerraformOptions): GeneratedInfrastructureFile[] {
		const files: GeneratedInfrastructureFile[] = [];

		switch (options.cloudProvider) {
			case "aws":
				files.push({
					path: "terraform/providers.tf",
					content: this.generateAWSProvider(options),
					type: "config",
					language: "terraform",
				});
				break;
			case "azure":
				files.push({
					path: "terraform/providers.tf",
					content: this.generateAzureProvider(options),
					type: "config",
					language: "terraform",
				});
				break;
			case "gcp":
				files.push({
					path: "terraform/providers.tf",
					content: this.generateGCPProvider(options),
					type: "config",
					language: "terraform",
				});
				break;
			case "multi-cloud":
				files.push({
					path: "terraform/providers.tf",
					content: this.generateMultiCloudProvider(options),
					type: "config",
					language: "terraform",
				});
				break;
		}

		return files;
	}

	/**
	 * Generate networking infrastructure
	 */
	private generateNetworkingInfrastructure(options: TerraformOptions): GeneratedInfrastructureFile[] {
		const files: GeneratedInfrastructureFile[] = [];

		switch (options.cloudProvider) {
			case "aws":
				files.push({
					path: "terraform/modules/networking/vpc.tf",
					content: this.generateAWSVPC(options),
					type: "config",
					language: "terraform",
				});
				files.push({
					path: "terraform/modules/networking/subnets.tf",
					content: this.generateAWSSubnets(options),
					type: "config",
					language: "terraform",
				});
				files.push({
					path: "terraform/modules/networking/security_groups.tf",
					content: this.generateAWSSecurityGroups(options),
					type: "config",
					language: "terraform",
				});
				break;
			case "azure":
				files.push({
					path: "terraform/modules/networking/vnet.tf",
					content: this.generateAzureVNet(options),
					type: "config",
					language: "terraform",
				});
				files.push({
					path: "terraform/modules/networking/nsg.tf",
					content: this.generateAzureNSG(options),
					type: "config",
					language: "terraform",
				});
				break;
			case "gcp":
				files.push({
					path: "terraform/modules/networking/vpc.tf",
					content: this.generateGCPVPC(options),
					type: "config",
					language: "terraform",
				});
				files.push({
					path: "terraform/modules/networking/firewall.tf",
					content: this.generateGCPFirewall(options),
					type: "config",
					language: "terraform",
				});
				break;
		}

		return files;
	}

	/**
	 * Generate compute infrastructure
	 */
	private generateComputeInfrastructure(options: TerraformOptions): GeneratedInfrastructureFile[] {
		const files: GeneratedInfrastructureFile[] = [];

		switch (options.cloudProvider) {
			case "aws":
				files.push({
					path: "terraform/modules/compute/ec2.tf",
					content: this.generateAWSEC2(options),
					type: "config",
					language: "terraform",
				});
				if (options.compute.loadBalancer) {
					files.push({
						path: "terraform/modules/compute/alb.tf",
						content: this.generateAWSALB(options),
						type: "config",
						language: "terraform",
					});
				}
				if (options.compute.autoScaling) {
					files.push({
						path: "terraform/modules/compute/asg.tf",
						content: this.generateAWSASG(options),
						type: "config",
						language: "terraform",
					});
				}
				break;
			case "azure":
				files.push({
					path: "terraform/modules/compute/vm.tf",
					content: this.generateAzureVM(options),
					type: "config",
					language: "terraform",
				});
				if (options.compute.loadBalancer) {
					files.push({
						path: "terraform/modules/compute/lb.tf",
						content: this.generateAzureLB(options),
						type: "config",
						language: "terraform",
					});
				}
				break;
			case "gcp":
				files.push({
					path: "terraform/modules/compute/instances.tf",
					content: this.generateGCPInstances(options),
					type: "config",
					language: "terraform",
				});
				if (options.compute.loadBalancer) {
					files.push({
						path: "terraform/modules/compute/lb.tf",
						content: this.generateGCPLB(options),
						type: "config",
						language: "terraform",
					});
				}
				break;
		}

		return files;
	}

	/**
	 * Generate storage infrastructure
	 */
	private generateStorageInfrastructure(options: TerraformOptions): GeneratedInfrastructureFile[] {
		const files: GeneratedInfrastructureFile[] = [];

		if (options.storage.databases.length > 0) {
			switch (options.cloudProvider) {
				case "aws":
					files.push({
						path: "terraform/modules/storage/rds.tf",
						content: this.generateAWSRDS(options),
						type: "config",
						language: "terraform",
					});
					break;
				case "azure":
					files.push({
						path: "terraform/modules/storage/sql.tf",
						content: this.generateAzureSQL(options),
						type: "config",
						language: "terraform",
					});
					break;
				case "gcp":
					files.push({
						path: "terraform/modules/storage/sql.tf",
						content: this.generateGCPSQL(options),
						type: "config",
						language: "terraform",
					});
					break;
			}
		}

		if (options.storage.objectStorage) {
			switch (options.cloudProvider) {
				case "aws":
					files.push({
						path: "terraform/modules/storage/s3.tf",
						content: this.generateAWSS3(options),
						type: "config",
						language: "terraform",
					});
					break;
				case "azure":
					files.push({
						path: "terraform/modules/storage/blob.tf",
						content: this.generateAzureBlob(options),
						type: "config",
						language: "terraform",
					});
					break;
				case "gcp":
					files.push({
						path: "terraform/modules/storage/gcs.tf",
						content: this.generateGCPStorage(options),
						type: "config",
						language: "terraform",
					});
					break;
			}
		}

		return files;
	}

	/**
	 * Generate security infrastructure
	 */
	private generateSecurityInfrastructure(options: TerraformOptions): GeneratedInfrastructureFile[] {
		const files: GeneratedInfrastructureFile[] = [];

		switch (options.cloudProvider) {
			case "aws":
				files.push({
					path: "terraform/modules/security/iam.tf",
					content: this.generateAWSIAM(options),
					type: "config",
					language: "terraform",
				});
				if (options.security.keyManagement) {
					files.push({
						path: "terraform/modules/security/kms.tf",
						content: this.generateAWSKMS(options),
						type: "config",
						language: "terraform",
					});
				}
				if (options.security.secretsManager) {
					files.push({
						path: "terraform/modules/security/secrets.tf",
						content: this.generateAWSSecrets(options),
						type: "config",
						language: "terraform",
					});
				}
				break;
			case "azure":
				files.push({
					path: "terraform/modules/security/rbac.tf",
					content: this.generateAzureRBAC(options),
					type: "config",
					language: "terraform",
				});
				if (options.security.keyManagement) {
					files.push({
						path: "terraform/modules/security/keyvault.tf",
						content: this.generateAzureKeyVault(options),
						type: "config",
						language: "terraform",
					});
				}
				break;
			case "gcp":
				files.push({
					path: "terraform/modules/security/iam.tf",
					content: this.generateGCPIAM(options),
					type: "config",
					language: "terraform",
				});
				if (options.security.keyManagement) {
					files.push({
						path: "terraform/modules/security/kms.tf",
						content: this.generateGCPKMS(options),
						type: "config",
						language: "terraform",
					});
				}
				break;
		}

		return files;
	}

	/**
	 * Generate monitoring infrastructure
	 */
	private generateMonitoringInfrastructure(options: TerraformOptions): GeneratedInfrastructureFile[] {
		const files: GeneratedInfrastructureFile[] = [];

		switch (options.cloudProvider) {
			case "aws":
				if (options.monitoring.cloudWatch) {
					files.push({
						path: "terraform/modules/monitoring/cloudwatch.tf",
						content: this.generateAWSCloudWatch(options),
						type: "config",
						language: "terraform",
					});
				}
				if (options.monitoring.logging) {
					files.push({
						path: "terraform/modules/monitoring/logs.tf",
						content: this.generateAWSLogs(options),
						type: "config",
						language: "terraform",
					});
				}
				break;
			case "azure":
				if (options.monitoring.logging) {
					files.push({
						path: "terraform/modules/monitoring/monitor.tf",
						content: this.generateAzureMonitor(options),
						type: "config",
						language: "terraform",
					});
				}
				break;
			case "gcp":
				if (options.monitoring.logging) {
					files.push({
						path: "terraform/modules/monitoring/logging.tf",
						content: this.generateGCPLogging(options),
						type: "config",
						language: "terraform",
					});
				}
				break;
		}

		return files;
	}

	/**
	 * Generate environment-specific configurations
	 */
	private generateEnvironmentConfigurations(
		options: TerraformOptions,
		environment: "development" | "staging" | "production"
	): GeneratedInfrastructureFile[] {
		const files: GeneratedInfrastructureFile[] = [];

		files.push({
			path: `terraform/environments/${environment}/terraform.tfvars`,
			content: this.generateEnvironmentTfVars(options, environment),
			type: "config",
			language: "terraform",
		});

		files.push({
			path: `terraform/environments/${environment}/backend.tf`,
			content: this.generateEnvironmentBackend(options, environment),
			type: "config",
			language: "terraform",
		});

		return files;
	}

	/**
	 * Generate main.tf content
	 */
	private generateMainTf(options: TerraformOptions): string {
		return `# Main Terraform configuration
# Generated by Xaheen CLI Terraform Generator

terraform {
  required_version = ">= 1.0"
  
  backend "${options.remoteState.backend}" {
    # Backend configuration will be provided via backend.tf files
  }
}

# Data sources for current configuration
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}
data "aws_availability_zones" "available" {
  state = "available"
}

# Local values for resource naming and tagging
locals {
  name_prefix = "\${var.project_name}-\${var.environment}"
  
  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
    CreatedBy   = "xaheen-cli"
    Owner       = var.owner
  }
}

# Networking module
${options.networking.vpc ? `
module "networking" {
  source = "./modules/networking"
  
  project_name = var.project_name
  environment  = var.environment
  vpc_cidr     = var.vpc_cidr
  
  availability_zones = var.availability_zones
  public_subnets     = var.public_subnets
  private_subnets    = var.private_subnets
  
  enable_nat_gateway = var.enable_nat_gateway
  enable_vpn_gateway = var.enable_vpn_gateway
  
  tags = local.common_tags
}
` : "# Networking module disabled"}

# Compute module
${options.compute.instances.length > 0 ? `
module "compute" {
  source = "./modules/compute"
  
  project_name = var.project_name
  environment  = var.environment
  
  vpc_id          = module.networking.vpc_id
  private_subnets = module.networking.private_subnets
  public_subnets  = module.networking.public_subnets
  
  instance_type     = var.instance_type
  min_size          = var.min_size
  max_size          = var.max_size
  desired_capacity  = var.desired_capacity
  
  enable_load_balancer = var.enable_load_balancer
  enable_auto_scaling  = var.enable_auto_scaling
  
  tags = local.common_tags
}
` : "# Compute module disabled"}

# Storage module
${options.storage.databases.length > 0 || options.storage.objectStorage ? `
module "storage" {
  source = "./modules/storage"
  
  project_name = var.project_name
  environment  = var.environment
  
  vpc_id          = module.networking.vpc_id
  private_subnets = module.networking.private_subnets
  
  db_engine            = var.db_engine
  db_version           = var.db_version
  db_instance_class    = var.db_instance_class
  db_allocated_storage = var.db_allocated_storage
  
  enable_object_storage = var.enable_object_storage
  enable_file_system   = var.enable_file_system
  
  tags = local.common_tags
}
` : "# Storage module disabled"}

# Security module
module "security" {
  source = "./modules/security"
  
  project_name = var.project_name
  environment  = var.environment
  
  enable_kms            = var.enable_kms
  enable_secrets_manager = var.enable_secrets_manager
  enable_waf            = var.enable_waf
  
  iam_roles = var.iam_roles
  
  tags = local.common_tags
}

# Monitoring module
${options.monitoring.cloudWatch || options.monitoring.logging ? `
module "monitoring" {
  source = "./modules/monitoring"
  
  project_name = var.project_name
  environment  = var.environment
  
  enable_cloudwatch = var.enable_cloudwatch
  enable_logging    = var.enable_logging
  enable_alerting   = var.enable_alerting
  enable_tracing    = var.enable_tracing
  
  tags = local.common_tags
}
` : "# Monitoring module disabled"}`;
	}

	/**
	 * Generate variables.tf content
	 */
	private generateVariablesTf(options: TerraformOptions): string {
		return `# Terraform variables configuration
# Generated by Xaheen CLI Terraform Generator

# Project configuration
variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Environment name (development, staging, production)"
  type        = string
  validation {
    condition     = contains(["development", "staging", "production"], var.environment)
    error_message = "Environment must be one of: development, staging, production."
  }
}

variable "region" {
  description = "AWS region"
  type        = string
  default     = "${options.region}"
}

variable "owner" {
  description = "Project owner"
  type        = string
}

# Networking variables
${options.networking.vpc ? `
variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "List of availability zones"
  type        = list(string)
  default     = []
}

variable "public_subnets" {
  description = "List of public subnet CIDR blocks"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

variable "private_subnets" {
  description = "List of private subnet CIDR blocks"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.20.0/24", "10.0.30.0/24"]
}

variable "enable_nat_gateway" {
  description = "Enable NAT Gateway for private subnets"
  type        = bool
  default     = ${options.networking.enableNatGateway}
}

variable "enable_vpn_gateway" {
  description = "Enable VPN Gateway"
  type        = bool
  default     = ${options.networking.enableVpnGateway}
}
` : ""}

# Compute variables
${options.compute.instances.length > 0 ? `
variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "${options.compute.instances[0]?.instanceType || "t3.micro"}"
}

variable "min_size" {
  description = "Minimum number of instances"
  type        = number
  default     = ${options.compute.instances[0]?.minSize || 1}
}

variable "max_size" {
  description = "Maximum number of instances"
  type        = number
  default     = ${options.compute.instances[0]?.maxSize || 3}
}

variable "desired_capacity" {
  description = "Desired number of instances"
  type        = number
  default     = ${options.compute.instances[0]?.desiredCapacity || 2}
}

variable "enable_load_balancer" {
  description = "Enable Application Load Balancer"
  type        = bool
  default     = ${options.compute.loadBalancer}
}

variable "enable_auto_scaling" {
  description = "Enable Auto Scaling Group"
  type        = bool
  default     = ${options.compute.autoScaling}
}
` : ""}

# Storage variables
${options.storage.databases.length > 0 ? `
variable "db_engine" {
  description = "Database engine"
  type        = string
  default     = "${options.storage.databases[0]?.engine || "postgresql"}"
}

variable "db_version" {
  description = "Database engine version"
  type        = string
  default     = "${options.storage.databases[0]?.version || "15"}"
}

variable "db_instance_class" {
  description = "Database instance class"
  type        = string
  default     = "${options.storage.databases[0]?.instanceClass || "db.t3.micro"}"
}

variable "db_allocated_storage" {
  description = "Database allocated storage in GB"
  type        = number
  default     = ${options.storage.databases[0]?.allocatedStorage || 20}
}
` : ""}

variable "enable_object_storage" {
  description = "Enable object storage (S3)"
  type        = bool
  default     = ${options.storage.objectStorage}
}

variable "enable_file_system" {
  description = "Enable managed file system"
  type        = bool
  default     = ${options.storage.fileSystem}
}

# Security variables
variable "enable_kms" {
  description = "Enable KMS key management"
  type        = bool
  default     = ${options.security.keyManagement}
}

variable "enable_secrets_manager" {
  description = "Enable AWS Secrets Manager"
  type        = bool
  default     = ${options.security.secretsManager}
}

variable "enable_waf" {
  description = "Enable Web Application Firewall"
  type        = bool
  default     = ${options.security.waf}
}

variable "iam_roles" {
  description = "List of IAM roles to create"
  type        = list(string)
  default     = ${JSON.stringify(options.security.iamRoles)}
}

# Monitoring variables
variable "enable_cloudwatch" {
  description = "Enable CloudWatch monitoring"
  type        = bool
  default     = ${options.monitoring.cloudWatch}
}

variable "enable_logging" {
  description = "Enable centralized logging"
  type        = bool
  default     = ${options.monitoring.logging}
}

variable "enable_alerting" {
  description = "Enable alerting"
  type        = bool
  default     = ${options.monitoring.alerting}
}

variable "enable_tracing" {
  description = "Enable distributed tracing"
  type        = bool
  default     = ${options.monitoring.tracing}
}

# Compliance variables
variable "encryption_enabled" {
  description = "Enable encryption at rest and in transit"
  type        = bool
  default     = ${options.compliance.encryption}
}

variable "backup_enabled" {
  description = "Enable automated backups"
  type        = bool
  default     = ${options.compliance.backup}
}

variable "backup_retention_days" {
  description = "Backup retention period in days"
  type        = number
  default     = ${options.compliance.retention}
}

variable "audit_logs_enabled" {
  description = "Enable audit logging"
  type        = bool
  default     = ${options.compliance.auditLogs}
}`;
	}

	/**
	 * Generate outputs.tf content
	 */
	private generateOutputsTf(options: TerraformOptions): string {
		return `# Terraform outputs configuration
# Generated by Xaheen CLI Terraform Generator

# Account information
output "account_id" {
  description = "AWS Account ID"
  value       = data.aws_caller_identity.current.account_id
}

output "region" {
  description = "AWS Region"
  value       = data.aws_region.current.name
}

# Networking outputs
${options.networking.vpc ? `
output "vpc_id" {
  description = "ID of the VPC"
  value       = module.networking.vpc_id
}

output "vpc_cidr_block" {
  description = "CIDR block of the VPC"
  value       = module.networking.vpc_cidr_block
}

output "public_subnets" {
  description = "List of IDs of the public subnets"
  value       = module.networking.public_subnets
}

output "private_subnets" {
  description = "List of IDs of the private subnets"
  value       = module.networking.private_subnets
}

output "internet_gateway_id" {
  description = "Internet Gateway ID"
  value       = module.networking.internet_gateway_id
}

output "nat_gateway_ids" {
  description = "List of NAT Gateway IDs"
  value       = module.networking.nat_gateway_ids
}
` : ""}

# Compute outputs
${options.compute.instances.length > 0 ? `
output "instance_ids" {
  description = "List of EC2 instance IDs"
  value       = module.compute.instance_ids
}

output "instance_public_ips" {
  description = "List of public IP addresses assigned to the instances"
  value       = module.compute.instance_public_ips
}

output "instance_private_ips" {
  description = "List of private IP addresses assigned to the instances"
  value       = module.compute.instance_private_ips
}
` : ""}

${options.compute.loadBalancer ? `
output "load_balancer_dns_name" {
  description = "DNS name of the load balancer"
  value       = module.compute.load_balancer_dns_name
}

output "load_balancer_zone_id" {
  description = "Canonical hosted zone ID of the load balancer"
  value       = module.compute.load_balancer_zone_id
}
` : ""}

# Storage outputs
${options.storage.databases.length > 0 ? `
output "database_endpoint" {
  description = "Database endpoint"
  value       = module.storage.database_endpoint
  sensitive   = true
}

output "database_port" {
  description = "Database port"
  value       = module.storage.database_port
}

output "database_name" {
  description = "Database name"
  value       = module.storage.database_name
}
` : ""}

${options.storage.objectStorage ? `
output "s3_bucket_id" {
  description = "S3 bucket ID"
  value       = module.storage.s3_bucket_id
}

output "s3_bucket_domain_name" {
  description = "S3 bucket domain name"
  value       = module.storage.s3_bucket_domain_name
}
` : ""}

# Security outputs
output "kms_key_id" {
  description = "KMS key ID"
  value       = module.security.kms_key_id
  sensitive   = true
}

output "iam_role_arns" {
  description = "ARNs of created IAM roles"
  value       = module.security.iam_role_arns
}

# Monitoring outputs
${options.monitoring.logging ? `
output "log_group_names" {
  description = "Names of CloudWatch log groups"
  value       = module.monitoring.log_group_names
}
` : ""}

${options.monitoring.alerting ? `
output "sns_topic_arns" {
  description = "ARNs of SNS topics for alerts"
  value       = module.monitoring.sns_topic_arns
}
` : ""}`;
	}

	/**
	 * Generate terraform.tfvars.example content
	 */
	private generateTfVarsExample(options: TerraformOptions): string {
		return `# Example Terraform variables file
# Copy this file to terraform.tfvars and update with your values

# Project configuration
project_name = "xaheen-project"
environment  = "development"
owner        = "your-team@company.com"

# Regional configuration
region = "${options.region}"

# Networking configuration
${options.networking.vpc ? `
vpc_cidr             = "10.0.0.0/16"
availability_zones   = ["${options.region}a", "${options.region}b", "${options.region}c"]
public_subnets       = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
private_subnets      = ["10.0.10.0/24", "10.0.20.0/24", "10.0.30.0/24"]
enable_nat_gateway   = ${options.networking.enableNatGateway}
enable_vpn_gateway   = ${options.networking.enableVpnGateway}
` : ""}

# Compute configuration
${options.compute.instances.length > 0 ? `
instance_type        = "${options.compute.instances[0]?.instanceType || "t3.micro"}"
min_size            = ${options.compute.instances[0]?.minSize || 1}
max_size            = ${options.compute.instances[0]?.maxSize || 3}
desired_capacity    = ${options.compute.instances[0]?.desiredCapacity || 2}
enable_load_balancer = ${options.compute.loadBalancer}
enable_auto_scaling  = ${options.compute.autoScaling}
` : ""}

# Storage configuration
enable_object_storage = ${options.storage.objectStorage}
enable_file_system   = ${options.storage.fileSystem}

${options.storage.databases.length > 0 ? `
db_engine            = "${options.storage.databases[0]?.engine || "postgresql"}"
db_version           = "${options.storage.databases[0]?.version || "15"}"
db_instance_class    = "${options.storage.databases[0]?.instanceClass || "db.t3.micro"}"
db_allocated_storage = ${options.storage.databases[0]?.allocatedStorage || 20}
` : ""}

# Security configuration
enable_kms             = ${options.security.keyManagement}
enable_secrets_manager = ${options.security.secretsManager}
enable_waf            = ${options.security.waf}
iam_roles             = ${JSON.stringify(options.security.iamRoles, null, 2)}

# Monitoring configuration
enable_cloudwatch = ${options.monitoring.cloudWatch}
enable_logging    = ${options.monitoring.logging}
enable_alerting   = ${options.monitoring.alerting}
enable_tracing    = ${options.monitoring.tracing}

# Compliance configuration
encryption_enabled     = ${options.compliance.encryption}
backup_enabled        = ${options.compliance.backup}
backup_retention_days = ${options.compliance.retention}
audit_logs_enabled    = ${options.compliance.auditLogs}`;
	}

	/**
	 * Generate versions.tf content
	 */
	private generateVersionsTf(options: TerraformOptions): string {
		const providers = {
			aws: 'aws = {\n      source  = "hashicorp/aws"\n      version = "~> 5.0"\n    }',
			azure: 'azurerm = {\n      source  = "hashicorp/azurerm"\n      version = "~> 3.0"\n    }',
			gcp: 'google = {\n      source  = "hashicorp/google"\n      version = "~> 4.0"\n    }'
		};

		let requiredProviders = "";
		
		if (options.cloudProvider === "multi-cloud") {
			requiredProviders = Object.values(providers).join('\n    ');
		} else {
			requiredProviders = providers[options.cloudProvider] || providers.aws;
		}

		return `# Terraform version constraints
# Generated by Xaheen CLI Terraform Generator

terraform {
  required_version = ">= 1.0"
  
  required_providers {
    ${requiredProviders}
    
    random = {
      source  = "hashicorp/random"
      version = "~> 3.1"
    }
    
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }
  }
}`;
	}

	/**
	 * Generate AWS provider configuration
	 */
	private generateAWSProvider(options: TerraformOptions): string {
		return `# AWS Provider configuration
# Generated by Xaheen CLI Terraform Generator

provider "aws" {
  region = var.region
  
  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
      CreatedBy   = "xaheen-cli"
    }
  }
}

# Additional provider configurations for multi-region setups
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
  
  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
      CreatedBy   = "xaheen-cli"
    }
  }
}`;
	}

	/**
	 * Generate Azure provider configuration
	 */
	private generateAzureProvider(options: TerraformOptions): string {
		return `# Azure Provider configuration
# Generated by Xaheen CLI Terraform Generator

provider "azurerm" {
  features {
    key_vault {
      purge_soft_delete_on_destroy    = true
      recover_soft_deleted_key_vaults = true
    }
    
    resource_group {
      prevent_deletion_if_contains_resources = false
    }
  }
}`;
	}

	/**
	 * Generate GCP provider configuration
	 */
	private generateGCPProvider(options: TerraformOptions): string {
		return `# Google Cloud Provider configuration
# Generated by Xaheen CLI Terraform Generator

provider "google" {
  project = var.project_id
  region  = var.region
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
}`;
	}

	/**
	 * Generate multi-cloud provider configuration
	 */
	private generateMultiCloudProvider(options: TerraformOptions): string {
		return `# Multi-Cloud Provider configuration
# Generated by Xaheen CLI Terraform Generator

# AWS Provider
provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
      CreatedBy   = "xaheen-cli"
    }
  }
}

# Azure Provider
provider "azurerm" {
  features {
    key_vault {
      purge_soft_delete_on_destroy    = true
      recover_soft_deleted_key_vaults = true
    }
  }
}

# Google Cloud Provider
provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
}`;
	}

	/**
	 * Generate AWS VPC configuration
	 */
	private generateAWSVPC(options: TerraformOptions): string {
		return `# AWS VPC configuration
# Generated by Xaheen CLI Terraform Generator

resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = merge(var.tags, {
    Name = "\${var.project_name}-\${var.environment}-vpc"
  })
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  
  tags = merge(var.tags, {
    Name = "\${var.project_name}-\${var.environment}-igw"
  })
}

# Elastic IPs for NAT Gateways
resource "aws_eip" "nat" {
  count  = var.enable_nat_gateway ? length(var.public_subnets) : 0
  domain = "vpc"
  
  depends_on = [aws_internet_gateway.main]
  
  tags = merge(var.tags, {
    Name = "\${var.project_name}-\${var.environment}-eip-\${count.index + 1}"
  })
}`;
	}

	/**
	 * Generate AWS Subnets configuration
	 */
	private generateAWSSubnets(options: TerraformOptions): string {
		return `# AWS Subnets configuration
# Generated by Xaheen CLI Terraform Generator

# Public Subnets
resource "aws_subnet" "public" {
  count = length(var.public_subnets)
  
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.public_subnets[count.index]
  availability_zone = data.aws_availability_zones.available.names[count.index]
  
  map_public_ip_on_launch = true
  
  tags = merge(var.tags, {
    Name = "\${var.project_name}-\${var.environment}-public-\${count.index + 1}"
    Type = "Public"
  })
}

# Private Subnets
resource "aws_subnet" "private" {
  count = length(var.private_subnets)
  
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_subnets[count.index]
  availability_zone = data.aws_availability_zones.available.names[count.index]
  
  tags = merge(var.tags, {
    Name = "\${var.project_name}-\${var.environment}-private-\${count.index + 1}"
    Type = "Private"
  })
}

# NAT Gateways
resource "aws_nat_gateway" "main" {
  count = var.enable_nat_gateway ? length(aws_subnet.public) : 0
  
  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id
  
  depends_on = [aws_internet_gateway.main]
  
  tags = merge(var.tags, {
    Name = "\${var.project_name}-\${var.environment}-nat-\${count.index + 1}"
  })
}

# Public Route Table
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
  
  tags = merge(var.tags, {
    Name = "\${var.project_name}-\${var.environment}-public-rt"
  })
}

# Private Route Tables
resource "aws_route_table" "private" {
  count  = var.enable_nat_gateway ? length(aws_subnet.private) : 1
  vpc_id = aws_vpc.main.id
  
  dynamic "route" {
    for_each = var.enable_nat_gateway ? [1] : []
    content {
      cidr_block     = "0.0.0.0/0"
      nat_gateway_id = aws_nat_gateway.main[count.index].id
    }
  }
  
  tags = merge(var.tags, {
    Name = "\${var.project_name}-\${var.environment}-private-rt-\${count.index + 1}"
  })
}

# Route Table Associations
resource "aws_route_table_association" "public" {
  count = length(aws_subnet.public)
  
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "private" {
  count = length(aws_subnet.private)
  
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = var.enable_nat_gateway ? aws_route_table.private[count.index].id : aws_route_table.private[0].id
}`;
	}

	/**
	 * Generate AWS Security Groups configuration
	 */
	private generateAWSSecurityGroups(options: TerraformOptions): string {
		return `# AWS Security Groups configuration
# Generated by Xaheen CLI Terraform Generator

# Web Security Group
resource "aws_security_group" "web" {
  name_prefix = "\${var.project_name}-\${var.environment}-web-"
  vpc_id      = aws_vpc.main.id
  description = "Security group for web servers"
  
  # HTTP
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTP"
  }
  
  # HTTPS
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTPS"
  }
  
  # SSH (restrict to your IP)
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # TODO: Restrict to your IP
    description = "SSH"
  }
  
  # All outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "All outbound traffic"
  }
  
  tags = merge(var.tags, {
    Name = "\${var.project_name}-\${var.environment}-web-sg"
  })
  
  lifecycle {
    create_before_destroy = true
  }
}

# Application Security Group
resource "aws_security_group" "app" {
  name_prefix = "\${var.project_name}-\${var.environment}-app-"
  vpc_id      = aws_vpc.main.id
  description = "Security group for application servers"
  
  # Application port
  ingress {
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.web.id]
    description     = "Application port from web servers"
  }
  
  # SSH from web servers
  ingress {
    from_port       = 22
    to_port         = 22
    protocol        = "tcp"
    security_groups = [aws_security_group.web.id]
    description     = "SSH from web servers"
  }
  
  # All outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "All outbound traffic"
  }
  
  tags = merge(var.tags, {
    Name = "\${var.project_name}-\${var.environment}-app-sg"
  })
  
  lifecycle {
    create_before_destroy = true
  }
}

# Database Security Group
resource "aws_security_group" "db" {
  name_prefix = "\${var.project_name}-\${var.environment}-db-"
  vpc_id      = aws_vpc.main.id
  description = "Security group for database servers"
  
  # PostgreSQL
  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id]
    description     = "PostgreSQL from application servers"
  }
  
  # MySQL
  ingress {
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id]
    description     = "MySQL from application servers"
  }
  
  # Redis
  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id]
    description     = "Redis from application servers"
  }
  
  tags = merge(var.tags, {
    Name = "\${var.project_name}-\${var.environment}-db-sg"
  })
  
  lifecycle {
    create_before_destroy = true
  }
}`;
	}

	/**
	 * Generate next steps based on configuration
	 */
	private generateNextSteps(options: TerraformOptions): string[] {
		const steps = [
			"Review the generated Terraform configuration files",
			"Update terraform.tfvars with your specific values",
			"Configure your cloud provider credentials",
			"Initialize Terraform: terraform init",
			"Validate configuration: terraform validate",
			"Plan deployment: terraform plan",
			"Apply configuration: terraform apply",
		];

		if (options.remoteState.backend !== "local") {
			steps.splice(3, 0, "Configure remote state backend");
		}

		if (options.security.keyManagement) {
			steps.push("Configure KMS key permissions");
		}

		if (options.monitoring.alerting) {
			steps.push("Configure alerting notifications");
		}

		if (options.compliance.backup) {
			steps.push("Verify backup policies are configured");
		}

		steps.push(
			"Test your infrastructure deployment",
			"Set up monitoring and alerting",
			"Document your infrastructure"
		);

		return steps;
	}

	// Placeholder methods for various cloud provider specific configurations
	// These would be implemented with actual Terraform configurations for each provider

	private generateAzureVNet(options: TerraformOptions): string {
		return "# Azure VNet configuration placeholder";
	}

	private generateAzureNSG(options: TerraformOptions): string {
		return "# Azure NSG configuration placeholder";
	}

	private generateGCPVPC(options: TerraformOptions): string {
		return "# GCP VPC configuration placeholder";
	}

	private generateGCPFirewall(options: TerraformOptions): string {
		return "# GCP Firewall configuration placeholder";
	}

	private generateAWSEC2(options: TerraformOptions): string {
		return "# AWS EC2 configuration placeholder";
	}

	private generateAWSALB(options: TerraformOptions): string {
		return "# AWS ALB configuration placeholder";
	}

	private generateAWSASG(options: TerraformOptions): string {
		return "# AWS ASG configuration placeholder";
	}

	private generateAzureVM(options: TerraformOptions): string {
		return "# Azure VM configuration placeholder";
	}

	private generateAzureLB(options: TerraformOptions): string {
		return "# Azure LB configuration placeholder";
	}

	private generateGCPInstances(options: TerraformOptions): string {
		return "# GCP Instances configuration placeholder";
	}

	private generateGCPLB(options: TerraformOptions): string {
		return "# GCP LB configuration placeholder";
	}

	private generateAWSRDS(options: TerraformOptions): string {
		return "# AWS RDS configuration placeholder";
	}

	private generateAzureSQL(options: TerraformOptions): string {
		return "# Azure SQL configuration placeholder";
	}

	private generateGCPSQL(options: TerraformOptions): string {
		return "# GCP SQL configuration placeholder";
	}

	private generateAWSS3(options: TerraformOptions): string {
		return "# AWS S3 configuration placeholder";
	}

	private generateAzureBlob(options: TerraformOptions): string {
		return "# Azure Blob configuration placeholder";
	}

	private generateGCPStorage(options: TerraformOptions): string {
		return "# GCP Storage configuration placeholder";
	}

	private generateAWSIAM(options: TerraformOptions): string {
		return "# AWS IAM configuration placeholder";
	}

	private generateAWSKMS(options: TerraformOptions): string {
		return "# AWS KMS configuration placeholder";
	}

	private generateAWSSecrets(options: TerraformOptions): string {
		return "# AWS Secrets configuration placeholder";
	}

	private generateAzureRBAC(options: TerraformOptions): string {
		return "# Azure RBAC configuration placeholder";
	}

	private generateAzureKeyVault(options: TerraformOptions): string {
		return "# Azure Key Vault configuration placeholder";
	}

	private generateGCPIAM(options: TerraformOptions): string {
		return "# GCP IAM configuration placeholder";
	}

	private generateGCPKMS(options: TerraformOptions): string {
		return "# GCP KMS configuration placeholder";
	}

	private generateAWSCloudWatch(options: TerraformOptions): string {
		return "# AWS CloudWatch configuration placeholder";
	}

	private generateAWSLogs(options: TerraformOptions): string {
		return "# AWS Logs configuration placeholder";
	}

	private generateAzureMonitor(options: TerraformOptions): string {
		return "# Azure Monitor configuration placeholder";
	}

	private generateGCPLogging(options: TerraformOptions): string {
		return "# GCP Logging configuration placeholder";
	}

	private generateEnvironmentTfVars(options: TerraformOptions, environment: string): string {
		return `# Environment-specific variables for ${environment}
project_name = "xaheen-${environment}"
environment  = "${environment}"`;
	}

	private generateEnvironmentBackend(options: TerraformOptions, environment: string): string {
		return `# Backend configuration for ${environment} environment
terraform {
  backend "${options.remoteState.backend}" {
    bucket = "${options.remoteState.bucket || 'xaheen-terraform-state'}"
    key    = "environments/${environment}/terraform.tfstate"
    region = "${options.remoteState.region || options.region}"
  }
}`;
	}
}

/**
 * Factory function to create TerraformGenerator instance
 */
export function createTerraformGenerator(): TerraformGenerator {
	return new TerraformGenerator();
}