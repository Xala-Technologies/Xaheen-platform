# Xaheen CLI - Terraform Variables
# Norwegian Enterprise Grade Infrastructure Configuration

# =============================================================================
# Basic Configuration Variables
# =============================================================================

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "xaheen"
  
  validation {
    condition     = can(regex("^[a-z0-9-]+$", var.project_name))
    error_message = "Project name must contain only lowercase letters, numbers, and hyphens."
  }
}

variable "app_name" {
  description = "Name of the application"
  type        = string
  default     = "xaheen-cli"
  
  validation {
    condition     = can(regex("^[a-z0-9-]+$", var.app_name))
    error_message = "App name must contain only lowercase letters, numbers, and hyphens."
  }
}

variable "app_version" {
  description = "Version of the application"
  type        = string
  default     = "1.0.0"
  
  validation {
    condition     = can(regex("^[0-9]+\\.[0-9]+\\.[0-9]+(-[a-zA-Z0-9-]+)?$", var.app_version))
    error_message = "App version must follow semantic versioning format (e.g., 1.0.0 or 1.0.0-beta)."
  }
}

variable "environment" {
  description = "Environment name (production, staging, development)"
  type        = string
  
  validation {
    condition     = contains(["production", "staging", "development"], var.environment)
    error_message = "Environment must be one of: production, staging, development."
  }
}

# =============================================================================
# Cloud Provider Configuration
# =============================================================================

variable "cloud_provider" {
  description = "Cloud provider to use (aws, azure, gcp)"
  type        = string
  
  validation {
    condition     = contains(["aws", "azure", "gcp"], var.cloud_provider)
    error_message = "Cloud provider must be one of: aws, azure, gcp."
  }
}

variable "primary_region" {
  description = "Primary region for deployment (Norway-friendly regions preferred)"
  type        = string
  
  # Default to Norway-friendly regions by cloud provider
  default = ""
  
  validation {
    condition = var.primary_region != ""
    error_message = "Primary region must be specified."
  }
}

variable "secondary_region" {
  description = "Secondary region for disaster recovery (Norway-friendly regions preferred)"
  type        = string
  default     = ""
}

# AWS specific variables
variable "aws_account_id" {
  description = "AWS Account ID"
  type        = string
  default     = ""
  sensitive   = true
}

# Azure specific variables
variable "azure_subscription_id" {
  description = "Azure Subscription ID"
  type        = string
  default     = ""
  sensitive   = true
}

variable "azure_tenant_id" {
  description = "Azure Tenant ID"
  type        = string
  default     = ""
  sensitive   = true
}

# GCP specific variables
variable "gcp_project_id" {
  description = "GCP Project ID"
  type        = string
  default     = ""
}

# =============================================================================
# Norwegian Compliance Configuration
# =============================================================================

variable "nsm_classification" {
  description = "NSM (Norwegian Security Authority) classification level"
  type        = string
  default     = "RESTRICTED"
  
  validation {
    condition     = contains(["OPEN", "RESTRICTED", "CONFIDENTIAL", "SECRET"], var.nsm_classification)
    error_message = "NSM classification must be one of: OPEN, RESTRICTED, CONFIDENTIAL, SECRET."
  }
}

variable "gdpr_compliance_enabled" {
  description = "Enable GDPR compliance features"
  type        = bool
  default     = true
}

variable "data_residency_norway" {
  description = "Ensure all data remains within Norwegian or EU boundaries"
  type        = bool
  default     = true
}

variable "norwegian_locale_required" {
  description = "Require Norwegian locale support (nb-NO)"
  type        = bool
  default     = true
}

# =============================================================================
# Network Configuration
# =============================================================================

variable "vpc_cidr" {
  description = "CIDR block for VPC/Virtual Network"
  type        = string
  default     = "10.0.0.0/16"
  
  validation {
    condition     = can(cidrhost(var.vpc_cidr, 0))
    error_message = "VPC CIDR must be a valid CIDR block."
  }
}

variable "enable_nat_gateway" {
  description = "Enable NAT Gateway for private subnets"
  type        = bool
  default     = true
}

variable "enable_vpn_gateway" {
  description = "Enable VPN Gateway for secure connections"
  type        = bool
  default     = false
}

# =============================================================================
# Kubernetes Configuration
# =============================================================================

variable "kubernetes_version" {
  description = "Kubernetes version to use"
  type        = string
  default     = "1.31"
  
  validation {
    condition     = can(regex("^1\\.(2[8-9]|3[0-9])$", var.kubernetes_version))
    error_message = "Kubernetes version must be 1.28 or higher."
  }
}

variable "node_instance_type" {
  description = "Instance type for Kubernetes nodes"
  type        = string
  # Default will be set based on cloud provider in locals
}

variable "min_nodes" {
  description = "Minimum number of nodes in the cluster"
  type        = number
  default     = 3
  
  validation {
    condition     = var.min_nodes >= 1
    error_message = "Minimum nodes must be at least 1."
  }
}

variable "max_nodes" {
  description = "Maximum number of nodes in the cluster"
  type        = number
  default     = 10
  
  validation {
    condition     = var.max_nodes >= var.min_nodes
    error_message = "Maximum nodes must be greater than or equal to minimum nodes."
  }
}

variable "node_disk_size" {
  description = "Disk size for each node in GB"
  type        = number
  default     = 100
  
  validation {
    condition     = var.node_disk_size >= 20
    error_message = "Node disk size must be at least 20 GB."
  }
}

variable "enable_cluster_autoscaler" {
  description = "Enable cluster autoscaler"
  type        = bool
  default     = true
}

variable "pod_security_standard" {
  description = "Pod Security Standard to enforce (baseline, restricted)"
  type        = string
  default     = "restricted"
  
  validation {
    condition     = contains(["baseline", "restricted"], var.pod_security_standard)
    error_message = "Pod Security Standard must be either 'baseline' or 'restricted'."
  }
}

# =============================================================================
# Application Configuration
# =============================================================================

variable "replica_count" {
  description = "Number of application replicas"
  type        = number
  default     = 3
  
  validation {
    condition     = var.replica_count >= 1
    error_message = "Replica count must be at least 1."
  }
}

variable "container_registry" {
  description = "Container registry URL"
  type        = string
  default     = "registry.gitlab.com"
}

variable "container_repository" {
  description = "Container repository name"
  type        = string
  default     = "xaheen/xaheen-cli"
}

variable "container_tag" {
  description = "Container image tag"
  type        = string
  default     = "latest"
}

variable "helm_chart_version" {
  description = "Version of the Helm chart to deploy"
  type        = string
  default     = "1.0.0"
}

# =============================================================================
# Resource Configuration
# =============================================================================

variable "cpu_request" {
  description = "CPU request for the application"
  type        = string
  default     = "100m"
}

variable "cpu_limit" {
  description = "CPU limit for the application"
  type        = string
  default     = "500m"
}

variable "memory_request" {
  description = "Memory request for the application"
  type        = string
  default     = "256Mi"
}

variable "memory_limit" {
  description = "Memory limit for the application"
  type        = string
  default     = "1Gi"
}

# =============================================================================
# Security Configuration
# =============================================================================

variable "security_level" {
  description = "Security level (low, medium, high)"
  type        = string
  default     = "high"
  
  validation {
    condition     = contains(["low", "medium", "high"], var.security_level)
    error_message = "Security level must be one of: low, medium, high."
  }
}

variable "enable_encryption_at_rest" {
  description = "Enable encryption at rest for all storage"
  type        = bool
  default     = true
}

variable "enable_encryption_in_transit" {
  description = "Enable encryption in transit for all communications"
  type        = bool
  default     = true
}

variable "kms_enabled" {
  description = "Enable cloud provider KMS for key management"
  type        = bool
  default     = true
}

variable "vault_enabled" {
  description = "Enable HashiCorp Vault for secret management"
  type        = bool
  default     = true
}

variable "vault_version" {
  description = "HashiCorp Vault version"
  type        = string
  default     = "1.15.2"
}

variable "vault_storage_size" {
  description = "Storage size for Vault in GB"
  type        = number
  default     = 20
}

# =============================================================================
# Monitoring Configuration
# =============================================================================

variable "monitoring_enabled" {
  description = "Enable monitoring stack"
  type        = bool
  default     = true
}

variable "prometheus_enabled" {
  description = "Enable Prometheus monitoring"
  type        = bool
  default     = true
}

variable "prometheus_storage_size" {
  description = "Storage size for Prometheus in GB"
  type        = number
  default     = 50
}

variable "prometheus_retention_days" {
  description = "Data retention period for Prometheus in days"
  type        = number
  default     = 30
}

variable "grafana_enabled" {
  description = "Enable Grafana dashboards"
  type        = bool
  default     = true
}

variable "grafana_storage_size" {
  description = "Storage size for Grafana in GB"
  type        = number
  default     = 10
}

variable "jaeger_enabled" {
  description = "Enable Jaeger distributed tracing"
  type        = bool
  default     = true
}

variable "opentelemetry_enabled" {
  description = "Enable OpenTelemetry instrumentation"
  type        = bool
  default     = true
}

# =============================================================================
# Service Mesh Configuration (Istio)
# =============================================================================

variable "istio_enabled" {
  description = "Enable Istio service mesh"
  type        = bool
  default     = true
}

variable "istio_version" {
  description = "Istio version to install"
  type        = string
  default     = "1.20.0"
}

variable "istio_ambient_mode" {
  description = "Enable Istio Ambient Mode (sidecar-less)"
  type        = bool
  default     = true
}

variable "istio_mtls_mode" {
  description = "mTLS mode for Istio (PERMISSIVE, STRICT)"
  type        = string
  default     = "STRICT"
  
  validation {
    condition     = contains(["PERMISSIVE", "STRICT"], var.istio_mtls_mode)
    error_message = "Istio mTLS mode must be either 'PERMISSIVE' or 'STRICT'."
  }
}

# =============================================================================
# Database Configuration
# =============================================================================

variable "database_enabled" {
  description = "Enable managed database service"
  type        = bool
  default     = false
}

variable "database_engine" {
  description = "Database engine to use (postgresql, mysql)"
  type        = string
  default     = "postgresql"
  
  validation {
    condition     = contains(["postgresql", "mysql"], var.database_engine)
    error_message = "Database engine must be either 'postgresql' or 'mysql'."
  }
}

variable "database_version" {
  description = "Database version"
  type        = string
  default     = "15.4"
}

variable "database_instance_class" {
  description = "Database instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "database_allocated_storage" {
  description = "Database allocated storage in GB"
  type        = number
  default     = 20
}

variable "database_max_allocated_storage" {
  description = "Database maximum allocated storage in GB"
  type        = number
  default     = 100
}

variable "database_backup_retention_period" {
  description = "Database backup retention period in days"
  type        = number
  default     = 7
}

variable "redis_enabled" {
  description = "Enable Redis for caching"
  type        = bool
  default     = true
}

variable "redis_version" {
  description = "Redis version"
  type        = string
  default     = "7.0"
}

variable "redis_node_type" {
  description = "Redis node type"
  type        = string
  default     = "cache.t3.micro"
}

# =============================================================================
# Backup and Disaster Recovery
# =============================================================================

variable "backup_enabled" {
  description = "Enable backup solutions"
  type        = bool
  default     = true
}

variable "backup_retention_days" {
  description = "Backup retention period in days"
  type        = number
  default     = 30
}

variable "backup_schedule" {
  description = "Backup schedule in cron format"
  type        = string
  default     = "0 2 * * *"  # Daily at 2 AM
}

variable "enable_cross_region_backup" {
  description = "Enable cross-region backup for disaster recovery"
  type        = bool
  default     = true
}

# =============================================================================
# Cost Optimization
# =============================================================================

variable "enable_spot_instances" {
  description = "Enable spot instances for cost optimization"
  type        = bool
  default     = false
}

variable "cost_center" {
  description = "Cost center for resource billing"
  type        = string
  default     = "engineering"
}

variable "budget_alert_enabled" {
  description = "Enable budget alerts"
  type        = bool
  default     = true
}

variable "monthly_budget_usd" {
  description = "Monthly budget in USD for cost alerts"
  type        = number
  default     = 1000
}

# =============================================================================
# Operational Configuration
# =============================================================================

variable "owner" {
  description = "Owner of the infrastructure"
  type        = string
  default     = "xaheen-platform-team"
}

variable "maintenance_window" {
  description = "Maintenance window for updates"
  type        = string
  default     = "Sun:03:00-Sun:04:00"
}

variable "enable_auto_updates" {
  description = "Enable automatic security updates"
  type        = bool
  default     = true
}

variable "log_retention_days" {
  description = "Log retention period in days"
  type        = number
  default     = 90
}

# =============================================================================
# Development and Testing
# =============================================================================

variable "enable_dev_tools" {
  description = "Enable development tools and debugging features"
  type        = bool
  default     = false
}

variable "enable_load_testing" {
  description = "Enable load testing infrastructure"
  type        = bool
  default     = false
}

# =============================================================================
# Additional Tags
# =============================================================================

variable "additional_tags" {
  description = "Additional tags to apply to all resources"
  type        = map(string)
  default     = {}
  
  validation {
    condition = length(var.additional_tags) <= 50
    error_message = "Cannot have more than 50 additional tags."
  }
}