# HashiCorp Vault Configuration for Xaheen CLI
# Norwegian Enterprise Grade with NSM Security Compliance

# Storage backend configuration
storage "raft" {
  path         = "/vault/data"
  node_id      = "vault-node-1"
  
  # Norwegian compliance - performance tuning
  performance_multiplier = 1
  
  # Retry configuration for Norwegian network conditions
  retry_join {
    leader_api_addr         = "https://vault-0.vault-internal.vault-system.svc.cluster.local:8200"
    leader_ca_cert_file     = "/vault/tls/ca.crt"
    leader_client_cert_file = "/vault/tls/tls.crt"
    leader_client_key_file  = "/vault/tls/tls.key"
  }
  
  retry_join {
    leader_api_addr         = "https://vault-1.vault-internal.vault-system.svc.cluster.local:8200"
    leader_ca_cert_file     = "/vault/tls/ca.crt"
    leader_client_cert_file = "/vault/tls/tls.crt" 
    leader_client_key_file  = "/vault/tls/tls.key"
  }
  
  retry_join {
    leader_api_addr         = "https://vault-2.vault-internal.vault-system.svc.cluster.local:8200"
    leader_ca_cert_file     = "/vault/tls/ca.crt"
    leader_client_cert_file = "/vault/tls/tls.crt"
    leader_client_key_file  = "/vault/tls/tls.key"
  }
}

# High Availability configuration
ha_storage "raft" {
  path = "/vault/data"
  
  # Norwegian compliance - cluster configuration
  cluster_addr = "https://vault:8201"
  api_addr     = "https://vault.vault-system.svc.cluster.local:8200"
  
  # Performance settings for Norwegian infrastructure
  max_entry_size = 1048576
}

# Cluster configuration
cluster_addr = "https://vault:8201"
api_addr     = "https://vault.vault-system.svc.cluster.local:8200"

# TLS Configuration for Norwegian Security Requirements
listener "tcp" {
  address       = "0.0.0.0:8200"
  cluster_addr  = "0.0.0.0:8201"
  
  # Norwegian compliance - TLS configuration
  tls_cert_file            = "/vault/tls/tls.crt"
  tls_key_file             = "/vault/tls/tls.key"
  tls_client_ca_file       = "/vault/tls/ca.crt"
  tls_min_version          = "tls12"
  tls_max_version          = "tls13"
  tls_require_and_verify_client_cert = false
  tls_disable_client_certs = false
  
  # Security headers for Norwegian compliance
  tls_cipher_suites = [
    "TLS_AES_128_GCM_SHA256",
    "TLS_AES_256_GCM_SHA384", 
    "TLS_CHACHA20_POLY1305_SHA256",
    "TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256",
    "TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384",
    "TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256",
    "TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384"
  ]
  
  # Performance tuning
  tcp_keep_alive    = "30s"
  max_request_size  = 33554432
  max_request_duration = "90s"
  
  # Norwegian compliance headers
  custom_response_headers = {
    "X-NSM-Classification" = "SECRET"
    "X-GDPR-Compliant"     = "true"
    "X-Data-Localization"  = "norway"
    "X-Norwegian-Locale"   = "nb-NO"
    "Strict-Transport-Security" = "max-age=31536000; includeSubDomains"
    "X-Content-Type-Options"    = "nosniff"
    "X-Frame-Options"           = "DENY"
    "X-XSS-Protection"          = "1; mode=block"
    "Content-Security-Policy"   = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
  }
}

# Telemetry configuration for Norwegian compliance monitoring
telemetry {
  prometheus_retention_time = "30s"
  disable_hostname         = false
  enable_hostname_label    = true
  
  # Norwegian compliance metrics labels
  add_labels = {
    "nsm_classification" = "SECRET"
    "gdpr_compliant"     = "true"
    "data_localization"  = "norway"
    "norwegian_locale"   = "nb-NO"
    "environment"        = "production"
    "service"           = "vault"
    "component"         = "secret-management"
  }
  
  # Metrics endpoint configuration
  usage_gauge_period = "10m"
  maximum_gauge_cardinality = 500
  
  # StatsD configuration for external monitoring
  statsd_address = "127.0.0.1:8125"
  
  # DogStatsD configuration
  dogstatsd_addr = "127.0.0.1:8125"
  dogstatsd_tags = [
    "nsm_classification:SECRET",
    "gdpr_compliant:true", 
    "data_localization:norway",
    "norwegian_locale:nb-NO",
    "environment:production"
  ]
}

# Seal configuration for Norwegian security requirements
seal "transit" {
  address            = "https://vault-transit.vault-system.svc.cluster.local:8200"
  disable_renewal    = false
  key_name          = "xaheen-cli-unseal-key"
  mount_path        = "transit/"
  namespace         = ""
  
  # TLS configuration for seal communication
  tls_ca_cert       = "/vault/tls/ca.crt"
  tls_client_cert   = "/vault/tls/tls.crt"
  tls_client_key    = "/vault/tls/tls.key"
  tls_server_name   = "vault-transit.vault-system.svc.cluster.local"
  tls_skip_verify   = false
}

# Alternative KMS seal for cloud provider integration
# Uncomment based on cloud provider

# AWS KMS Seal (for AWS deployments)
# seal "awskms" {
#   region     = "eu-north-1"  # Stockholm - closest to Norway
#   kms_key_id = "alias/xaheen-cli-vault-unseal"
#   
#   # Norwegian compliance
#   endpoint   = "https://kms.eu-north-1.amazonaws.com"
# }

# Azure Key Vault Seal (for Azure deployments)
# seal "azurekeyvault" {
#   tenant_id     = "your-tenant-id"
#   client_id     = "your-client-id"
#   client_secret = "your-client-secret"
#   vault_name    = "xaheen-cli-vault"
#   key_name      = "xaheen-cli-unseal-key"
#   
#   # Norwegian compliance - use Norway regions
#   resource      = "https://vault.azure.net"
#   environment   = "AZUREPUBLICCLOUD"
# }

# GCP KMS Seal (for GCP deployments)
# seal "gcpckms" {
#   project     = "your-gcp-project"
#   region      = "europe-north1"  # Finland - closest to Norway
#   key_ring    = "xaheen-cli-vault"
#   crypto_key  = "xaheen-cli-unseal-key"
#   
#   # Service account for authentication
#   credentials = "/vault/gcp/service-account.json"
# }

# Logging configuration for Norwegian compliance auditing
log_level  = "INFO"
log_format = "json"
log_file   = "/vault/logs/vault.log"
log_rotate_duration   = "24h"
log_rotate_max_files  = 30
log_rotate_bytes      = 104857600  # 100MB

# Performance and security settings
default_lease_ttl = "768h"    # 32 days
max_lease_ttl     = "8760h"   # 1 year

# Norwegian compliance - disable mlock for container environments
disable_mlock = true

# Cache settings for Norwegian network conditions
disable_cache = false
cache_size    = "32000"

# Plugin directory
plugin_directory = "/vault/plugins"

# User interface configuration
ui = true

# Administrative settings
raw_storage_endpoint     = true
introspection_endpoint   = false
disable_sealwrap         = false
disable_indexing         = false
disable_performance_standby = false

# Entropy configuration for cryptographic operations
entropy "seal" {
  mode = "augmentation"
}

# Service registration for Norwegian infrastructure
service_registration "kubernetes" {
  namespace      = "vault-system"
  pod_name       = "vault"
  
  # Norwegian compliance labels
  labels = {
    "nsm.classification"    = "SECRET"
    "gdpr.compliant"       = "true"
    "data.localization"    = "norway"
    "norwegian.locale"     = "nb-NO"
    "app.kubernetes.io/name" = "vault"
    "app.kubernetes.io/instance" = "xaheen-vault"
    "app.kubernetes.io/component" = "secret-management"
  }
  
  # Health check configuration
  annotations = {
    "prometheus.io/scrape" = "true"
    "prometheus.io/port"   = "8200"
    "prometheus.io/path"   = "/v1/sys/metrics"
  }
}

# Experimental features for enhanced security
experiments = [
  "events.alpha1"
]

# License path (for Enterprise features)
license_path = "/vault/license/vault.hclic"