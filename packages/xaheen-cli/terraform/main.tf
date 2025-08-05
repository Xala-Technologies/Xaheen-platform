# Xaheen CLI - Terraform Infrastructure as Code
# Norwegian Enterprise Grade Cloud Infrastructure with Multi-Cloud Support
# Supports AWS, Azure, and GCP with data localization compliance

terraform {
  required_version = ">= 1.6.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.31"
    }
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.84"
    }
    google = {
      source  = "hashicorp/google"
      version = "~> 5.8"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.24"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.12"
    }
    vault = {
      source  = "hashicorp/vault"
      version = "~> 3.23"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }
  }
  
  # Remote state configuration for Norwegian compliance
  backend "s3" {
    # This will be configured via backend config file
    # bucket  = "xaheen-terraform-state-norway"
    # key     = "xaheen-cli/terraform.tfstate"
    # region  = "eu-north-1"  # Stockholm - closest to Norway
    # encrypt = true
    
    # Norwegian compliance requirements
    # server_side_encryption_configuration {
    #   rule {
    #     apply_server_side_encryption_by_default {
    #       sse_algorithm = "AES256"
    #     }
    #   }
    # }
  }
}

# =============================================================================
# Local Values for Configuration
# =============================================================================
locals {
  # Application metadata
  app_name        = "xaheen-cli"
  app_version     = var.app_version
  environment     = var.environment
  project_name    = var.project_name
  
  # Norwegian compliance
  nsm_classification = var.nsm_classification
  data_localization  = "norway"
  norwegian_locale   = "nb-NO"
  timezone          = "Europe/Oslo"
  
  # Cloud provider configuration
  cloud_provider = var.cloud_provider
  
  # Multi-region configuration for Norway compliance
  primary_region   = var.primary_region
  secondary_region = var.secondary_region
  
  # Common tags for all resources
  common_tags = merge(var.additional_tags, {
    Application         = local.app_name
    Version            = local.app_version
    Environment        = local.environment
    Project            = local.project_name
    ManagedBy          = "terraform"
    
    # Norwegian compliance tags
    NSMClassification  = local.nsm_classification
    GDPRCompliant      = "true"
    DataLocalization   = local.data_localization
    NorwegianLocale    = local.norwegian_locale
    Timezone           = local.timezone
    ComplianceFramework = "nsm"
    
    # Security tags
    SecurityLevel      = var.security_level
    Encryption         = "enabled"
    BackupEnabled      = "true"
    MonitoringEnabled  = "true"
    
    # Operational tags
    Owner              = var.owner
    CostCenter         = var.cost_center
    MaintenanceWindow  = var.maintenance_window
  })
  
  # Resource naming convention
  resource_prefix = "${local.project_name}-${local.app_name}-${local.environment}"
  
  # Network configuration
  vpc_cidr = var.vpc_cidr
  
  # Kubernetes configuration
  kubernetes_version = var.kubernetes_version
  node_instance_type = var.node_instance_type
  min_nodes         = var.min_nodes
  max_nodes         = var.max_nodes
  
  # Monitoring configuration
  monitoring_enabled = var.monitoring_enabled
  prometheus_enabled = var.prometheus_enabled
  grafana_enabled   = var.grafana_enabled
  
  # Security configuration
  vault_enabled     = var.vault_enabled
  kms_enabled       = var.kms_enabled
  
  # Database configuration
  database_enabled  = var.database_enabled
  redis_enabled    = var.redis_enabled
}

# =============================================================================
# Data Sources
# =============================================================================

# Get available availability zones
data "aws_availability_zones" "available" {
  count = local.cloud_provider == "aws" ? 1 : 0
  state = "available"
  
  filter {
    name   = "region-name"
    values = [local.primary_region]
  }
}

data "azurerm_locations" "available" {
  count = local.cloud_provider == "azure" ? 1 : 0
}

data "google_compute_zones" "available" {
  count  = local.cloud_provider == "gcp" ? 1 : 0
  region = local.primary_region
}

# =============================================================================
# Random Resources for Security
# =============================================================================

resource "random_id" "cluster_suffix" {
  byte_length = 4
}

resource "random_password" "database_password" {
  count   = local.database_enabled ? 1 : 0
  length  = 32
  special = true
}

resource "random_password" "redis_password" {
  count   = local.redis_enabled ? 1 : 0
  length  = 32
  special = false
}

# =============================================================================
# TLS Certificates for Internal Communication
# =============================================================================

resource "tls_private_key" "ca" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "tls_self_signed_cert" "ca" {
  private_key_pem = tls_private_key.ca.private_key_pem

  subject {
    common_name         = "${local.resource_prefix}-ca"
    organization        = "Xaheen Enterprise"
    organizational_unit = "Security"
    country            = "NO"
    locality           = "Oslo"
  }

  validity_period_hours = 8760 # 1 year

  is_ca_certificate = true

  allowed_uses = [
    "key_encipherment",
    "digital_signature",
    "cert_signing",
  ]
}

# =============================================================================
# Cloud Provider Specific Infrastructure
# =============================================================================

# AWS Infrastructure
module "aws_infrastructure" {
  count  = local.cloud_provider == "aws" ? 1 : 0
  source = "./modules/aws"

  # Basic configuration
  project_name    = local.project_name
  app_name        = local.app_name
  environment     = local.environment
  resource_prefix = local.resource_prefix
  
  # Norwegian compliance
  nsm_classification = local.nsm_classification
  data_localization  = local.data_localization
  
  # Network configuration
  vpc_cidr           = local.vpc_cidr
  availability_zones = data.aws_availability_zones.available[0].names
  
  # Kubernetes configuration
  kubernetes_version = local.kubernetes_version
  node_instance_type = local.node_instance_type
  min_nodes         = local.min_nodes
  max_nodes         = local.max_nodes
  
  # Security configuration
  vault_enabled = local.vault_enabled
  kms_enabled   = local.kms_enabled
  
  # Database configuration
  database_enabled = local.database_enabled
  redis_enabled   = local.redis_enabled
  
  # Monitoring
  monitoring_enabled = local.monitoring_enabled
  
  # Common tags
  tags = local.common_tags
}

# Azure Infrastructure
module "azure_infrastructure" {
  count  = local.cloud_provider == "azure" ? 1 : 0
  source = "./modules/azure"

  # Basic configuration
  project_name     = local.project_name
  app_name         = local.app_name
  environment      = local.environment
  resource_prefix  = local.resource_prefix
  
  # Location configuration
  primary_location   = local.primary_region
  secondary_location = local.secondary_region
  
  # Norwegian compliance
  nsm_classification = local.nsm_classification
  data_localization  = local.data_localization
  
  # Network configuration
  vpc_cidr = local.vpc_cidr
  
  # Kubernetes configuration
  kubernetes_version = local.kubernetes_version
  node_instance_type = local.node_instance_type
  min_nodes         = local.min_nodes
  max_nodes         = local.max_nodes
  
  # Security configuration
  vault_enabled = local.vault_enabled
  
  # Database configuration
  database_enabled = local.database_enabled
  redis_enabled   = local.redis_enabled
  
  # Monitoring
  monitoring_enabled = local.monitoring_enabled
  
  # Common tags
  tags = local.common_tags
}

# GCP Infrastructure
module "gcp_infrastructure" {
  count  = local.cloud_provider == "gcp" ? 1 : 0
  source = "./modules/gcp"

  # Basic configuration
  project_id      = var.gcp_project_id
  project_name    = local.project_name
  app_name        = local.app_name
  environment     = local.environment
  resource_prefix = local.resource_prefix
  
  # Location configuration
  region = local.primary_region
  zones  = data.google_compute_zones.available[0].names
  
  # Norwegian compliance
  nsm_classification = local.nsm_classification
  data_localization  = local.data_localization
  
  # Network configuration
  vpc_cidr = local.vpc_cidr
  
  # Kubernetes configuration
  kubernetes_version = local.kubernetes_version
  node_instance_type = local.node_instance_type
  min_nodes         = local.min_nodes
  max_nodes         = local.max_nodes
  
  # Security configuration
  vault_enabled = local.vault_enabled
  
  # Database configuration
  database_enabled = local.database_enabled
  redis_enabled   = local.redis_enabled
  
  # Monitoring
  monitoring_enabled = local.monitoring_enabled
  
  # Common labels
  labels = local.common_tags
}

# =============================================================================
# Kubernetes Configuration
# =============================================================================

# Get cluster credentials based on cloud provider
locals {
  cluster_endpoint = (
    local.cloud_provider == "aws" ? try(module.aws_infrastructure[0].cluster_endpoint, "") :
    local.cloud_provider == "azure" ? try(module.azure_infrastructure[0].cluster_endpoint, "") :
    local.cloud_provider == "gcp" ? try(module.gcp_infrastructure[0].cluster_endpoint, "") :
    ""
  )
  
  cluster_ca_certificate = (
    local.cloud_provider == "aws" ? try(module.aws_infrastructure[0].cluster_ca_certificate, "") :
    local.cloud_provider == "azure" ? try(module.azure_infrastructure[0].cluster_ca_certificate, "") :
    local.cloud_provider == "gcp" ? try(module.gcp_infrastructure[0].cluster_ca_certificate, "") :
    ""
  )
  
  cluster_token = (
    local.cloud_provider == "aws" ? try(module.aws_infrastructure[0].cluster_token, "") :
    local.cloud_provider == "azure" ? try(module.azure_infrastructure[0].cluster_token, "") :
    local.cloud_provider == "gcp" ? try(module.gcp_infrastructure[0].cluster_token, "") :
    ""
  )
}

# Configure Kubernetes provider
provider "kubernetes" {
  host                   = local.cluster_endpoint
  cluster_ca_certificate = base64decode(local.cluster_ca_certificate)
  token                 = local.cluster_token
}

provider "helm" {
  kubernetes {
    host                   = local.cluster_endpoint
    cluster_ca_certificate = base64decode(local.cluster_ca_certificate)
    token                 = local.cluster_token
  }
}

# =============================================================================
# Shared Infrastructure Components
# =============================================================================

# Monitoring Stack (Prometheus 3.0 + Grafana)
module "monitoring" {
  count  = local.monitoring_enabled ? 1 : 0
  source = "./modules/monitoring"

  # Basic configuration
  project_name    = local.project_name
  app_name        = local.app_name
  environment     = local.environment
  resource_prefix = local.resource_prefix
  
  # Norwegian compliance
  nsm_classification = local.nsm_classification
  data_localization  = local.data_localization
  
  # Monitoring configuration
  prometheus_enabled = local.prometheus_enabled
  grafana_enabled   = local.grafana_enabled
  
  # Storage configuration
  prometheus_storage_size = var.prometheus_storage_size
  grafana_storage_size   = var.grafana_storage_size
  
  # Security configuration
  prometheus_retention_days = var.prometheus_retention_days
  
  # Norwegian compliance labels
  labels = local.common_tags
  
  depends_on = [
    module.aws_infrastructure,
    module.azure_infrastructure,
    module.gcp_infrastructure
  ]
}

# HashiCorp Vault for Secret Management
module "vault" {
  count  = local.vault_enabled ? 1 : 0
  source = "./modules/vault"

  # Basic configuration
  project_name    = local.project_name
  app_name        = local.app_name
  environment     = local.environment
  resource_prefix = local.resource_prefix
  
  # Norwegian compliance
  nsm_classification = local.nsm_classification
  data_localization  = local.data_localization
  
  # Security configuration
  vault_version = var.vault_version
  
  # TLS configuration
  ca_cert_pem     = tls_self_signed_cert.ca.cert_pem
  ca_private_key  = tls_private_key.ca.private_key_pem
  
  # Storage configuration
  vault_storage_size = var.vault_storage_size
  
  # Norwegian compliance labels
  labels = local.common_tags
  
  depends_on = [
    module.aws_infrastructure,
    module.azure_infrastructure,
    module.gcp_infrastructure
  ]
}

# Istio Service Mesh (Ambient Mode)
module "istio" {
  count  = var.istio_enabled ? 1 : 0
  source = "./modules/istio"

  # Basic configuration
  project_name    = local.project_name
  app_name        = local.app_name
  environment     = local.environment
  
  # Istio configuration
  istio_version = var.istio_version
  ambient_mode  = var.istio_ambient_mode
  
  # Security configuration
  mtls_mode = var.istio_mtls_mode
  
  # Norwegian compliance
  nsm_classification = local.nsm_classification
  
  # Norwegian compliance labels
  labels = local.common_tags
  
  depends_on = [
    module.aws_infrastructure,
    module.azure_infrastructure,
    module.gcp_infrastructure
  ]
}

# =============================================================================
# Application Deployment
# =============================================================================

# Xaheen CLI Helm Deployment
resource "helm_release" "xaheen_cli" {
  name       = "${local.app_name}-${local.environment}"
  namespace  = "xaheen-${local.environment}"
  repository = "oci://registry.gitlab.com/xaheen/helm-charts"
  chart      = "xaheen-cli"
  version    = var.helm_chart_version
  
  create_namespace = true
  wait            = true
  timeout         = 600
  
  # Norwegian compliance values
  values = [
    yamlencode({
      global = {
        environment = local.environment
        norwegianCompliance = {
          enabled           = true
          nsmClassification = local.nsm_classification
          gdprCompliant     = true
          dataLocalization  = local.data_localization
          norwegianLocale   = local.norwegian_locale
          timezone          = local.timezone
        }
        security = {
          enabled               = true
          framework            = "nsm"
          podSecurityStandard  = var.pod_security_standard
          networkPolicies      = true
        }
        serviceMesh = {
          enabled  = var.istio_enabled
          mode     = var.istio_ambient_mode ? "ambient" : "sidecar"
          waypoint = var.istio_ambient_mode
          mtls     = var.istio_mtls_mode
        }
        monitoring = {
          enabled       = local.monitoring_enabled
          prometheus    = local.prometheus_enabled
          grafana       = local.grafana_enabled
          opentelemetry = var.opentelemetry_enabled
        }
      }
      
      image = {
        registry   = var.container_registry
        repository = var.container_repository
        tag        = var.container_tag
      }
      
      deployment = {
        replicaCount = var.replica_count
        resources = {
          requests = {
            memory = var.memory_request
            cpu    = var.cpu_request
          }
          limits = {
            memory = var.memory_limit
            cpu    = var.cpu_limit
          }
        }
      }
      
      redis = {
        enabled = local.redis_enabled
      }
      
      postgresql = {
        enabled = local.database_enabled
      }
      
      vault = {
        enabled = local.vault_enabled
      }
      
      istio = {
        enabled = var.istio_enabled
        ambient = {
          enabled = var.istio_ambient_mode
        }
      }
      
      monitoring = {
        prometheus = {
          enabled = local.prometheus_enabled
        }
        grafana = {
          enabled = local.grafana_enabled
        }
      }
    })
  ]
  
  depends_on = [
    module.aws_infrastructure,
    module.azure_infrastructure,
    module.gcp_infrastructure,
    module.monitoring,
    module.vault,
    module.istio
  ]
}

# =============================================================================
# Data Backup and Disaster Recovery (Norwegian Compliance)
# =============================================================================

module "backup" {
  count  = var.backup_enabled ? 1 : 0
  source = "./modules/backup"

  # Basic configuration
  project_name    = local.project_name
  app_name        = local.app_name
  environment     = local.environment
  resource_prefix = local.resource_prefix
  
  # Norwegian compliance
  nsm_classification = local.nsm_classification
  data_localization  = local.data_localization
  
  # Backup configuration
  backup_retention_days = var.backup_retention_days
  backup_schedule      = var.backup_schedule
  
  # Cross-region backup for disaster recovery
  enable_cross_region_backup = var.enable_cross_region_backup
  backup_region             = local.secondary_region
  
  # Encryption configuration
  encryption_enabled = true
  
  # Norwegian compliance labels
  labels = local.common_tags
  
  depends_on = [
    module.aws_infrastructure,
    module.azure_infrastructure,
    module.gcp_infrastructure
  ]
}