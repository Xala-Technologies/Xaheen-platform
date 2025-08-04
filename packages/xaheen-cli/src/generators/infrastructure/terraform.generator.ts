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

	// Azure VNet Configuration
	private generateAzureVNet(options: TerraformOptions): string {
		return `# Azure Virtual Network configuration
# Generated by Xaheen CLI Terraform Generator

resource "azurerm_resource_group" "main" {
  name     = "\${var.project_name}-\${var.environment}-rg"
  location = var.location
  
  tags = var.tags
}

resource "azurerm_virtual_network" "main" {
  name                = "\${var.project_name}-\${var.environment}-vnet"
  address_space       = var.address_space
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  
  tags = var.tags
}

# Public Subnets
resource "azurerm_subnet" "public" {
  count = length(var.public_subnets)
  
  name                 = "\${var.project_name}-\${var.environment}-public-\${count.index + 1}"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = [var.public_subnets[count.index]]
}

# Private Subnets
resource "azurerm_subnet" "private" {
  count = length(var.private_subnets)
  
  name                 = "\${var.project_name}-\${var.environment}-private-\${count.index + 1}"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = [var.private_subnets[count.index]]
}

# NAT Gateway
resource "azurerm_public_ip" "nat" {
  count = var.enable_nat_gateway ? 1 : 0
  
  name                = "\${var.project_name}-\${var.environment}-nat-pip"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  allocation_method   = "Static"
  sku                = "Standard"
  
  tags = var.tags
}

resource "azurerm_nat_gateway" "main" {
  count = var.enable_nat_gateway ? 1 : 0
  
  name                    = "\${var.project_name}-\${var.environment}-nat"
  location                = azurerm_resource_group.main.location
  resource_group_name     = azurerm_resource_group.main.name
  sku_name               = "Standard"
  idle_timeout_in_minutes = 10
  
  tags = var.tags
}

resource "azurerm_nat_gateway_public_ip_association" "main" {
  count = var.enable_nat_gateway ? 1 : 0
  
  nat_gateway_id       = azurerm_nat_gateway.main[0].id
  public_ip_address_id = azurerm_public_ip.nat[0].id
}

resource "azurerm_subnet_nat_gateway_association" "private" {
  count = var.enable_nat_gateway ? length(azurerm_subnet.private) : 0
  
  subnet_id      = azurerm_subnet.private[count.index].id
  nat_gateway_id = azurerm_nat_gateway.main[0].id
}`;
	}

	// Azure Network Security Groups
	private generateAzureNSG(options: TerraformOptions): string {
		return `# Azure Network Security Groups configuration
# Generated by Xaheen CLI Terraform Generator

# Web NSG
resource "azurerm_network_security_group" "web" {
  name                = "\${var.project_name}-\${var.environment}-web-nsg"
  location            = var.location
  resource_group_name = var.resource_group_name
  
  security_rule {
    name                       = "HTTP"
    priority                   = 1001
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "80"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }
  
  security_rule {
    name                       = "HTTPS"
    priority                   = 1002
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "443"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }
  
  security_rule {
    name                       = "SSH"
    priority                   = 1003
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "22"
    source_address_prefix      = "*" # TODO: Restrict to your IP
    destination_address_prefix = "*"
  }
  
  tags = var.tags
}

# Application NSG
resource "azurerm_network_security_group" "app" {
  name                = "\${var.project_name}-\${var.environment}-app-nsg"
  location            = var.location
  resource_group_name = var.resource_group_name
  
  security_rule {
    name                                   = "AppPort"
    priority                               = 1001
    direction                              = "Inbound"
    access                                 = "Allow"
    protocol                               = "Tcp"
    source_port_range                      = "*"
    destination_port_range                 = "8080"
    source_application_security_group_ids  = [azurerm_application_security_group.web.id]
    destination_application_security_group_ids = [azurerm_application_security_group.app.id]
  }
  
  tags = var.tags
}

# Database NSG
resource "azurerm_network_security_group" "db" {
  name                = "\${var.project_name}-\${var.environment}-db-nsg"
  location            = var.location
  resource_group_name = var.resource_group_name
  
  security_rule {
    name                                   = "PostgreSQL"
    priority                               = 1001
    direction                              = "Inbound"
    access                                 = "Allow"
    protocol                               = "Tcp"
    source_port_range                      = "*"
    destination_port_range                 = "5432"
    source_application_security_group_ids  = [azurerm_application_security_group.app.id]
    destination_application_security_group_ids = [azurerm_application_security_group.db.id]
  }
  
  tags = var.tags
}

# Application Security Groups
resource "azurerm_application_security_group" "web" {
  name                = "\${var.project_name}-\${var.environment}-web-asg"
  location            = var.location
  resource_group_name = var.resource_group_name
  
  tags = var.tags
}

resource "azurerm_application_security_group" "app" {
  name                = "\${var.project_name}-\${var.environment}-app-asg"
  location            = var.location
  resource_group_name = var.resource_group_name
  
  tags = var.tags
}

resource "azurerm_application_security_group" "db" {
  name                = "\${var.project_name}-\${var.environment}-db-asg"
  location            = var.location
  resource_group_name = var.resource_group_name
  
  tags = var.tags
}`;
	}

	// GCP VPC Configuration
	private generateGCPVPC(options: TerraformOptions): string {
		return `# GCP VPC configuration
# Generated by Xaheen CLI Terraform Generator

resource "google_compute_network" "main" {
  name                    = "\${var.project_name}-\${var.environment}-vpc"
  auto_create_subnetworks = false
  mtu                     = 1460
  
  description = "VPC for \${var.project_name} \${var.environment} environment"
}

# Public Subnets
resource "google_compute_subnetwork" "public" {
  count = length(var.public_subnets)
  
  name          = "\${var.project_name}-\${var.environment}-public-\${count.index + 1}"
  ip_cidr_range = var.public_subnets[count.index]
  region        = var.region
  network       = google_compute_network.main.id
  
  description = "Public subnet \${count.index + 1} for \${var.project_name}"
}

# Private Subnets
resource "google_compute_subnetwork" "private" {
  count = length(var.private_subnets)
  
  name          = "\${var.project_name}-\${var.environment}-private-\${count.index + 1}"
  ip_cidr_range = var.private_subnets[count.index]
  region        = var.region
  network       = google_compute_network.main.id
  
  private_ip_google_access = true
  
  description = "Private subnet \${count.index + 1} for \${var.project_name}"
}

# NAT Gateway
resource "google_compute_address" "nat" {
  count = var.enable_nat_gateway ? var.availability_zones : 0
  
  name   = "\${var.project_name}-\${var.environment}-nat-ip-\${count.index + 1}"
  region = var.region
}

resource "google_compute_router" "main" {
  count = var.enable_nat_gateway ? 1 : 0
  
  name    = "\${var.project_name}-\${var.environment}-router"
  region  = var.region
  network = google_compute_network.main.id
}

resource "google_compute_router_nat" "main" {
  count = var.enable_nat_gateway ? 1 : 0
  
  name                               = "\${var.project_name}-\${var.environment}-nat"
  router                             = google_compute_router.main[0].name
  region                             = var.region
  nat_ip_allocate_option             = "MANUAL_ONLY"
  nat_ips                            = google_compute_address.nat[*].self_link
  source_subnetwork_ip_ranges_to_nat = "LIST_OF_SUBNETWORKS"
  
  dynamic "subnetwork" {
    for_each = google_compute_subnetwork.private
    content {
      name                    = subnetwork.value.id
      source_ip_ranges_to_nat = ["ALL_IP_RANGES"]
    }
  }
  
  log_config {
    enable = true
    filter = "ERRORS_ONLY"
  }
}`;
	}

	// GCP Firewall Rules
	private generateGCPFirewall(options: TerraformOptions): string {
		return `# GCP Firewall Rules configuration
# Generated by Xaheen CLI Terraform Generator

# Allow HTTP traffic
resource "google_compute_firewall" "allow_http" {
  name    = "\${var.project_name}-\${var.environment}-allow-http"
  network = google_compute_network.main.name
  
  allow {
    protocol = "tcp"
    ports    = ["80"]
  }
  
  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["web-server"]
  
  description = "Allow HTTP traffic to web servers"
}

# Allow HTTPS traffic
resource "google_compute_firewall" "allow_https" {
  name    = "\${var.project_name}-\${var.environment}-allow-https"
  network = google_compute_network.main.name
  
  allow {
    protocol = "tcp"
    ports    = ["443"]
  }
  
  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["web-server"]
  
  description = "Allow HTTPS traffic to web servers"
}

# Allow SSH access
resource "google_compute_firewall" "allow_ssh" {
  name    = "\${var.project_name}-\${var.environment}-allow-ssh"
  network = google_compute_network.main.name
  
  allow {
    protocol = "tcp"
    ports    = ["22"]
  }
  
  source_ranges = ["0.0.0.0/0"] # TODO: Restrict to your IP
  target_tags   = ["ssh-server"]
  
  description = "Allow SSH access to instances"
}

# Allow internal communication
resource "google_compute_firewall" "allow_internal" {
  name    = "\${var.project_name}-\${var.environment}-allow-internal"
  network = google_compute_network.main.name
  
  allow {
    protocol = "tcp"
    ports    = ["0-65535"]
  }
  
  allow {
    protocol = "udp"
    ports    = ["0-65535"]
  }
  
  allow {
    protocol = "icmp"
  }
  
  source_ranges = var.private_subnets
  
  description = "Allow internal communication between private subnets"
}

# Allow health checks
resource "google_compute_firewall" "allow_health_checks" {
  name    = "\${var.project_name}-\${var.environment}-allow-health-checks"
  network = google_compute_network.main.name
  
  allow {
    protocol = "tcp"
  }
  
  source_ranges = [
    "130.211.0.0/22",
    "35.191.0.0/16"
  ]
  target_tags = ["load-balanced"]
  
  description = "Allow Google Cloud health checks"
}`;
	}

	// AWS EC2 Configuration
	private generateAWSEC2(options: TerraformOptions): string {
		return `# AWS EC2 configuration
# Generated by Xaheen CLI Terraform Generator

resource "aws_launch_template" "main" {
  name_prefix   = "\\\${var.project_name}-\\\${var.environment}-"
  image_id      = data.aws_ami.amazon_linux.id
  instance_type = var.instance_type
  key_name      = var.key_pair_name
  
  vpc_security_group_ids = var.security_group_ids
  
  user_data = base64encode(templatefile("\\\${path.module}/user_data.sh", {
    project_name = var.project_name
    environment  = var.environment
  }))
  
  block_device_mappings {
    device_name = "/dev/xvda"
    ebs {
      volume_size = 20
      volume_type = "gp3"
      encrypted   = var.encryption_enabled
      delete_on_termination = true
    }
  }
  
  metadata_options {
    http_endpoint = "enabled"
    http_tokens   = "required"
    http_put_response_hop_limit = 2
  }
  
  monitoring {
    enabled = true
  }
  
  tag_specifications {
    resource_type = "instance"
    tags = merge(var.tags, {
      Name = "\\\${var.project_name}-\\\${var.environment}-instance"
    })
  }
  
  lifecycle {
    create_before_destroy = true
  }
}

# Data source for latest Amazon Linux 2 AMI
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]
  
  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }
  
  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}`;
	}

	// AWS Application Load Balancer
	private generateAWSALB(options: TerraformOptions): string {
		return `# AWS Application Load Balancer configuration
# Generated by Xaheen CLI Terraform Generator

resource "aws_lb" "main" {
  name               = "\\\${var.project_name}-\\\${var.environment}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = var.public_subnets
  
  enable_deletion_protection = var.environment == "production" ? true : false
  
  access_logs {
    bucket  = aws_s3_bucket.alb_logs.bucket
    prefix  = "alb-logs"
    enabled = true
  }
  
  tags = var.tags
}

resource "aws_lb_target_group" "main" {
  name     = "\\\${var.project_name}-\\\${var.environment}-tg"
  port     = 80
  protocol = "HTTP"
  vpc_id   = var.vpc_id
  
  health_check {
    enabled             = true
    healthy_threshold   = 2
    interval            = 30
    matcher             = "200"
    path                = "/health"
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = 5
    unhealthy_threshold = 2
  }
  
  tags = var.tags
}

resource "aws_lb_listener" "main" {
  load_balancer_arn = aws_lb.main.arn
  port              = "80"
  protocol          = "HTTP"
  
  default_action {
    type = "redirect"
    
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.main.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS-1-2-2017-01"
  certificate_arn   = var.ssl_certificate_arn
  
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.main.arn
  }
}

# ALB Security Group
resource "aws_security_group" "alb" {
  name_prefix = "\\\${var.project_name}-\\\${var.environment}-alb-"
  vpc_id      = var.vpc_id
  
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = merge(var.tags, {
    Name = "\\\${var.project_name}-\\\${var.environment}-alb-sg"
  })
}

# S3 bucket for ALB logs
resource "aws_s3_bucket" "alb_logs" {
  bucket        = "\\\${var.project_name}-\\\${var.environment}-alb-logs-\\\${random_id.bucket_suffix.hex}"
  force_destroy = var.environment != "production"
  
  tags = var.tags
}

resource "aws_s3_bucket_policy" "alb_logs" {
  bucket = aws_s3_bucket.alb_logs.id
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          AWS = data.aws_elb_service_account.main.arn
        }
        Action   = "s3:PutObject"
        Resource = "\\\${aws_s3_bucket.alb_logs.arn}/alb-logs/AWSLogs/\\\${data.aws_caller_identity.current.account_id}/*"
      },
      {
        Effect = "Allow"
        Principal = {
          Service = "delivery.logs.amazonaws.com"
        }
        Action   = "s3:PutObject"
        Resource = "\\\${aws_s3_bucket.alb_logs.arn}/alb-logs/AWSLogs/\\\${data.aws_caller_identity.current.account_id}/*"
      }
    ]
  })
}

data "aws_elb_service_account" "main" {}
data "aws_caller_identity" "current" {}

resource "random_id" "bucket_suffix" {
  byte_length = 4
}`;
	}

	// AWS Auto Scaling Group
	private generateAWSASG(options: TerraformOptions): string {
		return `# AWS Auto Scaling Group configuration
# Generated by Xaheen CLI Terraform Generator

resource "aws_autoscaling_group" "main" {
  name                = "\\\${var.project_name}-\\\${var.environment}-asg"
  vpc_zone_identifier = var.private_subnets
  min_size            = var.min_size
  max_size            = var.max_size
  desired_capacity    = var.desired_capacity
  health_check_type   = "ELB"
  health_check_grace_period = 300
  
  launch_template {
    id      = aws_launch_template.main.id
    version = "$Latest"
  }
  
  target_group_arns = var.enable_load_balancer ? [aws_lb_target_group.main.arn] : []
  
  enabled_metrics = [
    "GroupMinSize",
    "GroupMaxSize",
    "GroupDesiredCapacity",
    "GroupInServiceInstances",
    "GroupTotalInstances"
  ]
  
  tag {
    key                 = "Name"
    value               = "\\\${var.project_name}-\\\${var.environment}-instance"
    propagate_at_launch = true
  }
  
  dynamic "tag" {
    for_each = var.tags
    content {
      key                 = tag.key
      value               = tag.value
      propagate_at_launch = true
    }
  }
  
  instance_refresh {
    strategy = "Rolling"
    preferences {
      min_healthy_percentage = 50
    }
  }
  
  lifecycle {
    create_before_destroy = true
  }
}

# Auto Scaling Policies
resource "aws_autoscaling_policy" "scale_up" {
  name                   = "\\\${var.project_name}-\\\${var.environment}-scale-up"
  scaling_adjustment     = 1
  adjustment_type        = "ChangeInCapacity"
  cooldown               = 300
  autoscaling_group_name = aws_autoscaling_group.main.name
}

resource "aws_autoscaling_policy" "scale_down" {
  name                   = "\\\${var.project_name}-\\\${var.environment}-scale-down"
  scaling_adjustment     = -1
  adjustment_type        = "ChangeInCapacity"
  cooldown               = 300
  autoscaling_group_name = aws_autoscaling_group.main.name
}

# CloudWatch Alarms
resource "aws_cloudwatch_metric_alarm" "cpu_high" {
  alarm_name          = "\\\${var.project_name}-\\\${var.environment}-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = "120"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "This metric monitors ec2 cpu utilization"
  
  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.main.name
  }
  
  alarm_actions = [aws_autoscaling_policy.scale_up.arn]
  
  tags = var.tags
}

resource "aws_cloudwatch_metric_alarm" "cpu_low" {
  alarm_name          = "\\\${var.project_name}-\\\${var.environment}-cpu-low"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = "120"
  statistic           = "Average"
  threshold           = "10"
  alarm_description   = "This metric monitors ec2 cpu utilization"
  
  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.main.name
  }
  
  alarm_actions = [aws_autoscaling_policy.scale_down.arn]
  
  tags = var.tags
}`;
	}

	// Azure Virtual Machine Configuration
	private generateAzureVM(options: TerraformOptions): string {
		return `# Azure Virtual Machine configuration
# Generated by Xaheen CLI Terraform Generator

resource "azurerm_virtual_machine_scale_set" "main" {
  name                = "\\\${var.project_name}-\\\${var.environment}-vmss"
  location            = var.location
  resource_group_name = var.resource_group_name
  
  sku {
    name     = var.vm_size
    tier     = "Standard"
    capacity = var.instance_count
  }
  
  upgrade_policy_mode = "Manual"
  
  storage_profile_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-focal"
    sku       = "20_04-lts-gen2"
    version   = "latest"
  }
  
  storage_profile_os_disk {
    name              = ""
    caching           = "ReadWrite"
    create_option     = "FromImage"
    managed_disk_type = "Premium_LRS"
  }
  
  os_profile {
    computer_name_prefix = var.project_name
    admin_username       = var.admin_username
    admin_password       = var.admin_password
    custom_data         = base64encode(file("\\\${path.module}/cloud-init.yaml"))
  }
  
  os_profile_linux_config {
    disable_password_authentication = false
  }
  
  network_profile {
    name    = "terraformnetworkprofile"
    primary = true
    
    ip_configuration {
      name                                   = "TestIPConfiguration"
      primary                                = true
      subnet_id                              = var.subnet_id
      load_balancer_backend_address_pool_ids = var.enable_load_balancer ? [azurerm_lb_backend_address_pool.main.id] : []
    }
  }
  
  tags = var.tags
}

# Auto-scaling settings
resource "azurerm_monitor_autoscale_setting" "main" {
  name                = "\\\${var.project_name}-\\\${var.environment}-autoscale"
  resource_group_name = var.resource_group_name
  location            = var.location
  target_resource_id  = azurerm_virtual_machine_scale_set.main.id
  
  profile {
    name = "defaultProfile"
    
    capacity {
      default = var.desired_capacity
      minimum = var.min_size
      maximum = var.max_size
    }
    
    rule {
      metric_trigger {
        metric_name        = "Percentage CPU"
        metric_resource_id = azurerm_virtual_machine_scale_set.main.id
        time_grain         = "PT1M"
        statistic          = "Average"
        time_window        = "PT5M"
        time_aggregation   = "Average"
        operator           = "GreaterThan"
        threshold          = 75
      }
      
      scale_action {
        direction = "Increase"
        type      = "ChangeCount"
        value     = "1"
        cooldown  = "PT1M"
      }
    }
    
    rule {
      metric_trigger {
        metric_name        = "Percentage CPU"
        metric_resource_id = azurerm_virtual_machine_scale_set.main.id
        time_grain         = "PT1M"
        statistic          = "Average"
        time_window        = "PT5M"
        time_aggregation   = "Average"
        operator           = "LessThan"
        threshold          = 25
      }
      
      scale_action {
        direction = "Decrease"
        type      = "ChangeCount"
        value     = "1"
        cooldown  = "PT1M"
      }
    }
  }
  
  tags = var.tags
}`;
	}

	// Azure Load Balancer
	private generateAzureLB(options: TerraformOptions): string {
		return `# Azure Load Balancer configuration
# Generated by Xaheen CLI Terraform Generator

resource "azurerm_public_ip" "main" {
  name                = "\\\${var.project_name}-\\\${var.environment}-lb-pip"
  location            = var.location
  resource_group_name = var.resource_group_name
  allocation_method   = "Static"
  sku                = "Standard"
  
  tags = var.tags
}

resource "azurerm_lb" "main" {
  name                = "\\\${var.project_name}-\\\${var.environment}-lb"
  location            = var.location
  resource_group_name = var.resource_group_name
  sku                = "Standard"
  
  frontend_ip_configuration {
    name                 = "PublicIPAddress"
    public_ip_address_id = azurerm_public_ip.main.id
  }
  
  tags = var.tags
}

resource "azurerm_lb_backend_address_pool" "main" {
  loadbalancer_id = azurerm_lb.main.id
  name            = "BackEndAddressPool"
}

resource "azurerm_lb_probe" "main" {
  loadbalancer_id = azurerm_lb.main.id
  name            = "http-probe"
  protocol        = "Http"
  request_path    = "/health"
  port            = 80
}

resource "azurerm_lb_rule" "main" {
  loadbalancer_id                = azurerm_lb.main.id
  name                           = "LBRule"
  protocol                       = "Tcp"
  frontend_port                  = 80
  backend_port                   = 80
  frontend_ip_configuration_name = "PublicIPAddress"
  backend_address_pool_ids       = [azurerm_lb_backend_address_pool.main.id]
  probe_id                       = azurerm_lb_probe.main.id
}`;
	}

	// GCP Compute Instances
	private generateGCPInstances(options: TerraformOptions): string {
		return `# GCP Compute Instances configuration
# Generated by Xaheen CLI Terraform Generator

resource "google_compute_instance_template" "main" {
  name_prefix  = "\\\${var.project_name}-\\\${var.environment}-"
  machine_type = var.machine_type
  region       = var.region
  
  tags = ["web-server", "ssh-server"]
  
  disk {
    source_image = data.google_compute_image.ubuntu.id
    auto_delete  = true
    boot         = true
    disk_size_gb = 20
    disk_type    = "pd-ssd"
  }
  
  network_interface {
    network    = var.network_name
    subnetwork = var.subnet_names[0]
    
    access_config {
      // Ephemeral public IP
    }
  }
  
  service_account {
    email  = google_service_account.main.email
    scopes = ["cloud-platform"]
  }
  
  metadata = {
    ssh-keys = "ubuntu:\\\${file(var.public_key_path)}"
  }
  
  metadata_startup_script = file("\\\${path.module}/startup-script.sh")
  
  lifecycle {
    create_before_destroy = true
  }
}

resource "google_compute_instance_group_manager" "main" {
  name = "\\\${var.project_name}-\\\${var.environment}-igm"
  zone = data.google_compute_zones.available.names[0]
  
  version {
    instance_template = google_compute_instance_template.main.id
  }
  
  base_instance_name = "\\\${var.project_name}-\\\${var.environment}"
  target_size        = var.desired_capacity
  
  named_port {
    name = "http"
    port = 80
  }
  
  auto_healing_policies {
    health_check      = google_compute_health_check.main.id
    initial_delay_sec = 300
  }
}

resource "google_compute_autoscaler" "main" {
  name   = "\\\${var.project_name}-\\\${var.environment}-autoscaler"
  zone   = data.google_compute_zones.available.names[0]
  target = google_compute_instance_group_manager.main.id
  
  autoscaling_policy {
    max_replicas    = var.max_size
    min_replicas    = var.min_size
    cooldown_period = 60
    
    cpu_utilization {
      target = 0.8
    }
  }
}

resource "google_compute_health_check" "main" {
  name = "\\\${var.project_name}-\\\${var.environment}-health-check"
  
  timeout_sec        = 5
  check_interval_sec = 10
  
  http_health_check {
    port         = "80"
    request_path = "/health"
  }
}

resource "google_service_account" "main" {
  account_id   = "\\\${var.project_name}-\\\${var.environment}-sa"
  display_name = "Service Account for \\\${var.project_name} \\\${var.environment}"
}

data "google_compute_image" "ubuntu" {
  family  = "ubuntu-2004-lts"
  project = "ubuntu-os-cloud"
}

data "google_compute_zones" "available" {
  region = var.region
}`;
	}

	// GCP Load Balancer
	private generateGCPLB(options: TerraformOptions): string {
		return `# GCP Load Balancer configuration
# Generated by Xaheen CLI Terraform Generator

resource "google_compute_global_address" "main" {
  name = "\\\${var.project_name}-\\\${var.environment}-lb-ip"
}

resource "google_compute_backend_service" "main" {
  name        = "\\\${var.project_name}-\\\${var.environment}-backend"
  port_name   = "http"
  protocol    = "HTTP"
  timeout_sec = 10
  
  health_checks = [google_compute_health_check.main.id]
  
  backend {
    group           = google_compute_instance_group_manager.main.instance_group
    balancing_mode  = "UTILIZATION"
    max_utilization = 0.8
  }
}

resource "google_compute_url_map" "main" {
  name            = "\\\${var.project_name}-\\\${var.environment}-url-map"
  default_service = google_compute_backend_service.main.id
}

resource "google_compute_target_http_proxy" "main" {
  name    = "\\\${var.project_name}-\\\${var.environment}-http-proxy"
  url_map = google_compute_url_map.main.id
}

resource "google_compute_global_forwarding_rule" "main" {
  name       = "\\\${var.project_name}-\\\${var.environment}-forwarding-rule"
  port_range = "80"
  target     = google_compute_target_http_proxy.main.id
  ip_address = google_compute_global_address.main.address
}`;
	}

	// AWS RDS Configuration
	private generateAWSRDS(options: TerraformOptions): string {
		return `# AWS RDS configuration
# Generated by Xaheen CLI Terraform Generator

resource "aws_db_subnet_group" "main" {
  name       = "\\\${var.project_name}-\\\${var.environment}-db-subnet-group"
  subnet_ids = var.private_subnets
  
  tags = merge(var.tags, {
    Name = "\\\${var.project_name}-\\\${var.environment}-db-subnet-group"
  })
}

resource "aws_db_parameter_group" "main" {
  family = var.db_engine == "postgresql" ? "postgres15" : "mysql8.0"
  name   = "\\\${var.project_name}-\\\${var.environment}-db-params"
  
  dynamic "parameter" {
    for_each = var.db_engine == "postgresql" ? [
      {
        name  = "shared_preload_libraries"
        value = "pg_stat_statements"
      }
    ] : [
      {
        name  = "innodb_buffer_pool_size"
        value = "{DBInstanceClassMemory*3/4}"
      }
    ]
    content {
      name  = parameter.value.name
      value = parameter.value.value
    }
  }
  
  tags = var.tags
}

resource "aws_db_instance" "main" {
  identifier = "\\\${var.project_name}-\\\${var.environment}-db"
  
  engine                = var.db_engine
  engine_version        = var.db_version
  instance_class        = var.db_instance_class
  allocated_storage     = var.db_allocated_storage
  max_allocated_storage = var.db_allocated_storage * 2
  
  db_name  = var.project_name
  username = var.db_username
  password = var.db_password
  
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  parameter_group_name   = aws_db_parameter_group.main.name
  
  backup_retention_period = var.backup_retention_days
  backup_window          = var.backup_window
  maintenance_window     = var.maintenance_window
  
  storage_encrypted = var.encryption_enabled
  kms_key_id       = var.encryption_enabled ? var.kms_key_id : null
  
  multi_az               = var.environment == "production"
  publicly_accessible    = false
  storage_type           = "gp3"
  
  skip_final_snapshot       = var.environment != "production"
  final_snapshot_identifier = var.environment == "production" ? "\\\${var.project_name}-\\\${var.environment}-final-snapshot-\\\${formatdate("YYYY-MM-DD-hhmm", timestamp())}" : null
  
  enabled_cloudwatch_logs_exports = var.db_engine == "postgresql" ? ["postgresql"] : ["error", "general", "slow_query"]
  
  monitoring_interval = 60
  monitoring_role_arn = aws_iam_role.rds_enhanced_monitoring.arn
  
  tags = merge(var.tags, {
    Name = "\\\${var.project_name}-\\\${var.environment}-db"
  })
  
  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_security_group" "rds" {
  name_prefix = "\\\${var.project_name}-\\\${var.environment}-rds-"
  vpc_id      = var.vpc_id
  
  ingress {
    from_port       = var.db_engine == "postgresql" ? 5432 : 3306
    to_port         = var.db_engine == "postgresql" ? 5432 : 3306
    protocol        = "tcp"
    security_groups = var.app_security_group_ids
    description     = "Database access from application servers"
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "All outbound traffic"
  }
  
  tags = merge(var.tags, {
    Name = "\\\${var.project_name}-\\\${var.environment}-rds-sg"
  })
  
  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_iam_role" "rds_enhanced_monitoring" {
  name = "\\\${var.project_name}-\\\${var.environment}-rds-monitoring-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "monitoring.rds.amazonaws.com"
        }
      }
    ]
  })
  
  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "rds_enhanced_monitoring" {
  role       = aws_iam_role.rds_enhanced_monitoring.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}`;
	}

	// AWS S3 Configuration
	private generateAWSS3(options: TerraformOptions): string {
		return `# AWS S3 configuration
# Generated by Xaheen CLI Terraform Generator

resource "aws_s3_bucket" "main" {
  bucket        = "\\\${var.project_name}-\\\${var.environment}-storage-\\\${random_id.bucket_suffix.hex}"
  force_destroy = var.environment != "production"
  
  tags = var.tags
}

resource "aws_s3_bucket_public_access_block" "main" {
  bucket = aws_s3_bucket.main.id
  
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "main" {
  bucket = aws_s3_bucket.main.id
  
  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = var.kms_key_id
      sse_algorithm     = var.encryption_enabled ? "aws:kms" : "AES256"
    }
    bucket_key_enabled = var.encryption_enabled
  }
}

resource "aws_s3_bucket_versioning" "main" {
  bucket = aws_s3_bucket.main.id
  versioning_configuration {
    status = var.environment == "production" ? "Enabled" : "Suspended"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "main" {
  bucket = aws_s3_bucket.main.id
  
  rule {
    id     = "lifecycle_rule"
    status = "Enabled"
    
    expiration {
      days = var.backup_retention_days * 2
    }
    
    noncurrent_version_expiration {
      noncurrent_days = 30
    }
    
    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }
}

resource "aws_s3_bucket_logging" "main" {
  count = var.audit_logs_enabled ? 1 : 0
  
  bucket = aws_s3_bucket.main.id
  
  target_bucket = aws_s3_bucket.access_logs[0].id
  target_prefix = "access-logs/"
}

resource "aws_s3_bucket" "access_logs" {
  count = var.audit_logs_enabled ? 1 : 0
  
  bucket        = "\\\${var.project_name}-\\\${var.environment}-access-logs-\\\${random_id.bucket_suffix.hex}"
  force_destroy = var.environment != "production"
  
  tags = var.tags
}

resource "random_id" "bucket_suffix" {
  byte_length = 4
}`;
	}

	// Azure SQL Database
	private generateAzureSQL(options: TerraformOptions): string {
		return `# Azure SQL Database configuration
# Generated by Xaheen CLI Terraform Generator

resource "azurerm_mssql_server" "main" {
  name                         = "\\\${var.project_name}-\\\${var.environment}-sqlserver"
  resource_group_name          = var.resource_group_name
  location                     = var.location
  version                      = "12.0"
  administrator_login          = var.db_username
  administrator_login_password = var.db_password
  
  public_network_access_enabled = false
  
  tags = var.tags
}

resource "azurerm_mssql_database" "main" {
  name      = "\\\${var.project_name}_\\\${var.environment}_db"
  server_id = azurerm_mssql_server.main.id
  
  collation    = "SQL_Latin1_General_CP1_CI_AS"
  license_type = "LicenseIncluded"
  sku_name     = var.db_sku_name
  
  tags = var.tags
}

resource "azurerm_mssql_firewall_rule" "main" {
  name             = "AllowAzureServices"
  server_id        = azurerm_mssql_server.main.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}`;
	}

	// Azure Blob Storage
	private generateAzureBlob(options: TerraformOptions): string {
		return `# Azure Blob Storage configuration
# Generated by Xaheen CLI Terraform Generator

resource "azurerm_storage_account" "main" {
  name                     = "\\\${replace(var.project_name, "-", "")}\\\${var.environment}storage"
  resource_group_name      = var.resource_group_name
  location                 = var.location
  account_tier             = "Standard"
  account_replication_type = var.environment == "production" ? "GRS" : "LRS"
  
  blob_properties {
    versioning_enabled = var.environment == "production"
    
    delete_retention_policy {
      days = var.backup_retention_days
    }
  }
  
  network_rules {
    default_action = "Deny"
    bypass         = ["AzureServices"]
  }
  
  tags = var.tags
}

resource "azurerm_storage_container" "main" {
  name                  = "data"
  storage_account_name  = azurerm_storage_account.main.name
  container_access_type = "private"
}`;
	}

	// GCP SQL Database
	private generateGCPSQL(options: TerraformOptions): string {
		return `# GCP SQL Database configuration
# Generated by Xaheen CLI Terraform Generator

resource "google_sql_database_instance" "main" {
  name             = "\\\${var.project_name}-\\\${var.environment}-db"
  database_version = var.database_version
  region           = var.region
  
  settings {
    tier              = var.db_tier
    availability_type = var.environment == "production" ? "REGIONAL" : "ZONAL"
    disk_type         = "PD_SSD"
    disk_size         = var.db_disk_size
    disk_autoresize   = true
    
    backup_configuration {
      enabled                        = true
      start_time                     = "02:00"
      location                       = var.region
      point_in_time_recovery_enabled = true
      
      backup_retention_settings {
        retained_backups = var.backup_retention_days
        retention_unit   = "COUNT"
      }
    }
    
    ip_configuration {
      ipv4_enabled    = false
      private_network = var.network_id
    }
    
    database_flags {
      name  = "log_checkpoints"
      value = "on"
    }
    
    database_flags {
      name  = "log_connections"
      value = "on"
    }
    
    database_flags {
      name  = "log_disconnections"
      value = "on"
    }
  }
  
  deletion_protection = var.environment == "production"
}

resource "google_sql_database" "main" {
  name     = var.project_name
  instance = google_sql_database_instance.main.name
}

resource "google_sql_user" "main" {
  name     = var.db_username
  instance = google_sql_database_instance.main.name
  password = var.db_password
}`;
	}

	// GCP Cloud Storage
	private generateGCPStorage(options: TerraformOptions): string {
		return `# GCP Cloud Storage configuration
# Generated by Xaheen CLI Terraform Generator

resource "google_storage_bucket" "main" {
  name     = "\\\${var.project_name}-\\\${var.environment}-storage-\\\${random_id.bucket_suffix.hex}"
  location = var.region
  
  uniform_bucket_level_access = true
  
  versioning {
    enabled = var.environment == "production"
  }
  
  lifecycle_rule {
    condition {
      age = var.backup_retention_days * 2
    }
    action {
      type = "Delete"
    }
  }
  
  lifecycle_rule {
    condition {
      num_newer_versions = 3
    }
    action {
      type = "Delete"
    }
  }
}

resource "google_storage_bucket_iam_binding" "main" {
  bucket = google_storage_bucket.main.name
  role   = "roles/storage.objectViewer"
  
  members = [
    "serviceAccount:\\\${google_service_account.main.email}",
  ]
}

resource "random_id" "bucket_suffix" {
  byte_length = 4
}`;
	}

	// AWS IAM Configuration
	private generateAWSIAM(options: TerraformOptions): string {
		return `# AWS IAM configuration
# Generated by Xaheen CLI Terraform Generator

# EC2 Instance Role
resource "aws_iam_role" "ec2_role" {
  name = "\\\${var.project_name}-\\\${var.environment}-ec2-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
  
  tags = var.tags
}

resource "aws_iam_instance_profile" "ec2_profile" {
  name = "\\\${var.project_name}-\\\${var.environment}-ec2-profile"
  role = aws_iam_role.ec2_role.name
}

resource "aws_iam_role_policy" "ec2_policy" {
  name = "\\\${var.project_name}-\\\${var.environment}-ec2-policy"
  role = aws_iam_role.ec2_role.id
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ]
        Resource = [
          "\\\${aws_s3_bucket.main.arn}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      }
    ]
  })
}

# Custom IAM roles
${options.security.iamRoles.map(role => `
resource "aws_iam_role" "${role.toLowerCase().replace(/[^a-z0-9]/g, '_')}_role" {
  name = "\\\${var.project_name}-\\\${var.environment}-${role.toLowerCase()}-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
  
  tags = var.tags
}`).join('')}`;
	}

	// AWS KMS Configuration
	private generateAWSKMS(options: TerraformOptions): string {
		return `# AWS KMS configuration
# Generated by Xaheen CLI Terraform Generator

resource "aws_kms_key" "main" {
  description             = "KMS key for \\\${var.project_name} \\\${var.environment}"
  deletion_window_in_days = var.environment == "production" ? 30 : 7
  enable_key_rotation     = true
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "Enable IAM User Permissions"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::\\\${data.aws_caller_identity.current.account_id}:root"
        }
        Action   = "kms:*"
        Resource = "*"
      },
      {
        Sid    = "Allow CloudWatch Logs"
        Effect = "Allow"
        Principal = {
          Service = "logs.amazonaws.com"
        }
        Action = [
          "kms:Encrypt",
          "kms:Decrypt",
          "kms:ReEncrypt*",
          "kms:GenerateDataKey*",
          "kms:DescribeKey"
        ]
        Resource = "*"
        Condition = {
          ArnEquals = {
            "kms:EncryptionContext:aws:logs:arn" = "arn:aws:logs:\\\${data.aws_region.current.name}:\\\${data.aws_caller_identity.current.account_id}:*"
          }
        }
      }
    ]
  })
  
  tags = merge(var.tags, {
    Name = "\\\${var.project_name}-\\\${var.environment}-kms-key"
  })
}

resource "aws_kms_alias" "main" {
  name          = "alias/\\\${var.project_name}-\\\${var.environment}"
  target_key_id = aws_kms_key.main.key_id
}`;
	}

	// AWS Secrets Manager
	private generateAWSSecrets(options: TerraformOptions): string {
		return `# AWS Secrets Manager configuration
# Generated by Xaheen CLI Terraform Generator

resource "aws_secretsmanager_secret" "db_credentials" {
  name                    = "\\\${var.project_name}-\\\${var.environment}-db-credentials"
  description             = "Database credentials for \\\${var.project_name} \\\${var.environment}"
  kms_key_id             = aws_kms_key.main.arn
  recovery_window_in_days = var.environment == "production" ? 30 : 0
  
  tags = var.tags
}

resource "aws_secretsmanager_secret_version" "db_credentials" {
  secret_id = aws_secretsmanager_secret.db_credentials.id
  secret_string = jsonencode({
    username = var.db_username
    password = var.db_password
    endpoint = aws_db_instance.main.endpoint
    port     = aws_db_instance.main.port
    dbname   = aws_db_instance.main.db_name
  })
}

resource "aws_secretsmanager_secret" "api_keys" {
  name                    = "\\\${var.project_name}-\\\${var.environment}-api-keys"
  description             = "API keys for \\\${var.project_name} \\\${var.environment}"
  kms_key_id             = aws_kms_key.main.arn
  recovery_window_in_days = var.environment == "production" ? 30 : 0
  
  tags = var.tags
}`;
	}

	// Azure RBAC Configuration
	private generateAzureRBAC(options: TerraformOptions): string {
		return `# Azure RBAC configuration
# Generated by Xaheen CLI Terraform Generator

resource "azurerm_user_assigned_identity" "main" {
  name                = "\\\${var.project_name}-\\\${var.environment}-identity"
  location            = var.location
  resource_group_name = var.resource_group_name
  
  tags = var.tags
}

resource "azurerm_role_assignment" "storage_contributor" {
  scope                = azurerm_storage_account.main.id
  role_definition_name = "Storage Blob Data Contributor"
  principal_id         = azurerm_user_assigned_identity.main.principal_id
}

resource "azurerm_role_assignment" "sql_contributor" {
  scope                = azurerm_mssql_server.main.id
  role_definition_name = "SQL DB Contributor"
  principal_id         = azurerm_user_assigned_identity.main.principal_id
}`;
	}

	// Azure Key Vault
	private generateAzureKeyVault(options: TerraformOptions): string {
		return `# Azure Key Vault configuration
# Generated by Xaheen CLI Terraform Generator

data "azurerm_client_config" "current" {}

resource "azurerm_key_vault" "main" {
  name                = "\\\${var.project_name}-\\\${var.environment}-kv"
  location            = var.location
  resource_group_name = var.resource_group_name
  tenant_id           = data.azurerm_client_config.current.tenant_id
  sku_name            = "standard"
  
  enabled_for_disk_encryption     = true
  enabled_for_deployment          = true
  enabled_for_template_deployment = true
  purge_protection_enabled        = var.environment == "production"
  
  network_acls {
    default_action = "Deny"
    bypass         = "AzureServices"
  }
  
  access_policy {
    tenant_id = data.azurerm_client_config.current.tenant_id
    object_id = data.azurerm_client_config.current.object_id
    
    key_permissions = [
      "Create",
      "Get",
      "List",
      "Update",
      "Delete"
    ]
    
    secret_permissions = [
      "Set",
      "Get",
      "List",
      "Delete"
    ]
  }
  
  tags = var.tags
}

resource "azurerm_key_vault_secret" "db_connection_string" {
  name         = "db-connection-string"
  value        = "Server=\\\${azurerm_mssql_server.main.fully_qualified_domain_name};Database=\\\${azurerm_mssql_database.main.name};User ID=\\\${var.db_username};Password=\\\${var.db_password};Encrypt=true;TrustServerCertificate=false;Connection Timeout=30;"
  key_vault_id = azurerm_key_vault.main.id
  
  tags = var.tags
}`;
	}

	// GCP IAM Configuration
	private generateGCPIAM(options: TerraformOptions): string {
		return `# GCP IAM configuration
# Generated by Xaheen CLI Terraform Generator

resource "google_service_account" "app" {
  account_id   = "\\\${var.project_name}-\\\${var.environment}-app"
  display_name = "Application Service Account for \\\${var.project_name}"
}

resource "google_project_iam_member" "storage_admin" {
  project = var.project_id
  role    = "roles/storage.admin"
  member  = "serviceAccount:\\\${google_service_account.app.email}"
}

resource "google_project_iam_member" "sql_client" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:\\\${google_service_account.app.email}"
}

resource "google_project_iam_member" "monitoring_writer" {
  project = var.project_id
  role    = "roles/monitoring.metricWriter"
  member  = "serviceAccount:\\\${google_service_account.app.email}"
}

resource "google_project_iam_member" "logging_writer" {
  project = var.project_id
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:\\\${google_service_account.app.email}"
}`;
	}

	// GCP KMS Configuration
	private generateGCPKMS(options: TerraformOptions): string {
		return `# GCP KMS configuration
# Generated by Xaheen CLI Terraform Generator

resource "google_kms_key_ring" "main" {
  name     = "\\\${var.project_name}-\\\${var.environment}-keyring"
  location = var.region
}

resource "google_kms_crypto_key" "main" {
  name     = "\\\${var.project_name}-\\\${var.environment}-key"
  key_ring = google_kms_key_ring.main.id
  
  rotation_period = "7776000s" # 90 days
  
  lifecycle {
    prevent_destroy = true
  }
}

resource "google_kms_crypto_key_iam_binding" "crypto_key" {
  crypto_key_id = google_kms_crypto_key.main.id
  role          = "roles/cloudkms.cryptoKeyEncrypterDecrypter"
  
  members = [
    "serviceAccount:\\\${google_service_account.app.email}",
  ]
}`;
	}

	// AWS CloudWatch Configuration
	private generateAWSCloudWatch(options: TerraformOptions): string {
		return `# AWS CloudWatch configuration
# Generated by Xaheen CLI Terraform Generator

resource "aws_cloudwatch_log_group" "app" {
  name              = "/aws/ec2/\\\${var.project_name}-\\\${var.environment}"
  retention_in_days = var.backup_retention_days
  kms_key_id        = aws_kms_key.main.arn
  
  tags = var.tags
}

resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "\\\${var.project_name}-\\\${var.environment}-dashboard"
  
  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6
        
        properties = {
          metrics = [
            ["AWS/EC2", "CPUUtilization", "AutoScalingGroupName", aws_autoscaling_group.main.name],
            [".", "NetworkIn", ".", "."],
            [".", "NetworkOut", ".", "."]
          ]
          view    = "timeSeries"
          stacked = false
          region  = data.aws_region.current.name
          title   = "EC2 Instance Metrics"
          period  = 300
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 6
        width  = 12
        height = 6
        
        properties = {
          metrics = [
            ["AWS/RDS", "DatabaseConnections", "DBInstanceIdentifier", aws_db_instance.main.id],
            [".", "CPUUtilization", ".", "."],
            [".", "ReadLatency", ".", "."],
            [".", "WriteLatency", ".", "."]
          ]
          view    = "timeSeries"
          stacked = false
          region  = data.aws_region.current.name
          title   = "RDS Metrics"
          period  = 300
        }
      }
    ]
  })
}`;
	}

	// AWS Logs Configuration
	private generateAWSLogs(options: TerraformOptions): string {
		return `# AWS Logs configuration
# Generated by Xaheen CLI Terraform Generator

resource "aws_cloudwatch_log_group" "vpc_flow_logs" {
  name              = "/aws/vpc/flowlogs/\\\${var.project_name}-\\\${var.environment}"
  retention_in_days = var.backup_retention_days
  kms_key_id        = aws_kms_key.main.arn
  
  tags = var.tags
}

resource "aws_flow_log" "vpc" {
  iam_role_arn    = aws_iam_role.flow_log.arn
  log_destination = aws_cloudwatch_log_group.vpc_flow_logs.arn
  traffic_type    = "ALL"
  vpc_id          = var.vpc_id
  
  tags = var.tags
}

resource "aws_iam_role" "flow_log" {
  name = "\\\${var.project_name}-\\\${var.environment}-flow-log-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "vpc-flow-logs.amazonaws.com"
        }
      }
    ]
  })
  
  tags = var.tags
}

resource "aws_iam_role_policy" "flow_log" {
  name = "\\\${var.project_name}-\\\${var.environment}-flow-log-policy"
  role = aws_iam_role.flow_log.id
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogGroups",
          "logs:DescribeLogStreams"
        ]
        Effect   = "Allow"
        Resource = "*"
      }
    ]
  })
}`;
	}

	// Azure Monitor Configuration
	private generateAzureMonitor(options: TerraformOptions): string {
		return `# Azure Monitor configuration
# Generated by Xaheen CLI Terraform Generator

resource "azurerm_log_analytics_workspace" "main" {
  name                = "\\\${var.project_name}-\\\${var.environment}-workspace"
  location            = var.location
  resource_group_name = var.resource_group_name
  sku                 = "PerGB2018"
  retention_in_days   = var.backup_retention_days
  
  tags = var.tags
}

resource "azurerm_application_insights" "main" {
  name                = "\\\${var.project_name}-\\\${var.environment}-insights"
  location            = var.location
  resource_group_name = var.resource_group_name
  workspace_id        = azurerm_log_analytics_workspace.main.id
  application_type    = "web"
  
  tags = var.tags
}

resource "azurerm_monitor_action_group" "main" {
  name                = "\\\${var.project_name}-\\\${var.environment}-alerts"
  resource_group_name = var.resource_group_name
  short_name          = "alerts"
  
  email_receiver {
    name          = "admin"
    email_address = var.alert_email
  }
  
  tags = var.tags
}`;
	}

	// GCP Logging Configuration
	private generateGCPLogging(options: TerraformOptions): string {
		return `# GCP Logging configuration
# Generated by Xaheen CLI Terraform Generator

resource "google_logging_project_sink" "main" {
  name        = "\\\${var.project_name}-\\\${var.environment}-sink"
  destination = "storage.googleapis.com/\\\${google_storage_bucket.logs.name}"
  
  filter = "severity >= WARNING"
  
  unique_writer_identity = true
}

resource "google_storage_bucket" "logs" {
  name     = "\\\${var.project_name}-\\\${var.environment}-logs-\\\${random_id.bucket_suffix.hex}"
  location = var.region
  
  lifecycle_rule {
    condition {
      age = var.backup_retention_days
    }
    action {
      type = "Delete"
    }
  }
}

resource "google_storage_bucket_iam_binding" "logs" {
  bucket = google_storage_bucket.logs.name
  role   = "roles/storage.objectCreator"
  
  members = [
    google_logging_project_sink.main.writer_identity,
  ]
}

resource "google_monitoring_alert_policy" "cpu_usage" {
  display_name = "\\\${var.project_name}-\\\${var.environment} High CPU Usage"
  combiner     = "OR"
  
  conditions {
    display_name = "CPU usage is above 80%"
    
    condition_threshold {
      filter          = "resource.type=\\"gce_instance\\""
      duration        = "300s"
      comparison      = "COMPARISON_GT"
      threshold_value = 0.8
      
      aggregations {
        alignment_period   = "300s"
        per_series_aligner = "ALIGN_MEAN"
      }
    }
  }
  
  notification_channels = [google_monitoring_notification_channel.email.name]
}

resource "google_monitoring_notification_channel" "email" {
  display_name = "Email"
  type         = "email"
  
  labels = {
    email_address = var.alert_email
  }
}`;
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