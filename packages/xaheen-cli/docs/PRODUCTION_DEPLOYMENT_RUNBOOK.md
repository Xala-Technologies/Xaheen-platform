# Xaheen CLI - Production Deployment Runbook
## Norwegian Enterprise Grade with Multi-Cloud Support

> **Norwegian Compliance**: This runbook ensures compliance with NSM (Nasjonal sikkerhetsmyndighet) security requirements and GDPR data protection regulations.

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Infrastructure Setup](#infrastructure-setup)
3. [Security Configuration](#security-configuration)
4. [Application Deployment](#application-deployment)
5. [Monitoring Setup](#monitoring-setup)
6. [Norwegian Compliance Verification](#norwegian-compliance-verification)
7. [Post-Deployment Validation](#post-deployment-validation)
8. [Rollback Procedures](#rollback-procedures)
9. [Troubleshooting Guide](#troubleshooting-guide)
10. [Emergency Contacts](#emergency-contacts)

---

## Pre-Deployment Checklist

### ✅ Infrastructure Requirements

- [ ] **Cloud Provider Setup**
  - [ ] AWS Account with appropriate permissions (if using AWS)
  - [ ] Azure Subscription with Resource Group access (if using Azure)
  - [ ] GCP Project with necessary APIs enabled (if using GCP)
  - [ ] Multi-region setup for disaster recovery
  - [ ] Norwegian-friendly regions selected (eu-north-1, europe-north1, Norway East)

- [ ] **Network Configuration**
  - [ ] VPC/Virtual Network configured with appropriate CIDR blocks
  - [ ] Subnets configured across multiple availability zones
  - [ ] NAT Gateways configured for private subnet internet access
  - [ ] Security Groups/Network Security Groups configured
  - [ ] DNS configuration for `*.xala.no` domains

- [ ] **Norwegian Compliance Prerequisites**
  - [ ] Data residency confirmed within Norwegian/EU boundaries
  - [ ] NSM classification level determined and documented
  - [ ] GDPR compliance assessment completed
  - [ ] Privacy Impact Assessment (PIA) approved
  - [ ] Data Processing Agreement (DPA) in place

### ✅ Security Requirements

- [ ] **Certificate Management**
  - [ ] TLS certificates obtained for all domains
  - [ ] CA certificates configured for internal communication
  - [ ] Certificate rotation procedures documented
  - [ ] Wildcard certificate for `*.xala.no` obtained

- [ ] **Secret Management**
  - [ ] HashiCorp Vault cluster deployed and initialized
  - [ ] KMS keys created for encryption at rest
  - [ ] Database passwords generated and stored in Vault
  - [ ] API keys and tokens securely stored
  - [ ] Service account credentials configured

- [ ] **Access Control**
  - [ ] RBAC roles and policies defined
  - [ ] Service accounts created with minimal permissions
  - [ ] Multi-factor authentication configured
  - [ ] Audit logging enabled at all levels

### ✅ Application Requirements

- [ ] **Container Images**
  - [ ] Production container image built and security scanned
  - [ ] Image pushed to container registry
  - [ ] Vulnerability scan passed with acceptable risk level
  - [ ] Image signatures verified

- [ ] **Configuration Management**
  - [ ] Environment-specific configuration prepared
  - [ ] Feature flags configured
  - [ ] Database migration scripts tested
  - [ ] External service integrations tested

---

## Infrastructure Setup

### Step 1: Initialize Terraform

```bash
# Clone the repository
git clone https://github.com/xaheen/xaheen-cli.git
cd xaheen-cli/terraform

# Initialize Terraform with Norwegian compliance backend
terraform init \
  -backend-config="bucket=xaheen-terraform-state-norway" \
  -backend-config="key=xaheen-cli/production/terraform.tfstate" \
  -backend-config="region=eu-north-1" \
  -backend-config="encrypt=true"

# Select workspace
terraform workspace select production || terraform workspace new production
```

### Step 2: Plan Infrastructure

```bash
# Create terraform.tfvars file for production
cat > terraform.tfvars << EOF
# Basic Configuration
project_name = "xaheen"
app_name = "xaheen-cli"
environment = "production"

# Cloud Provider (choose one)
cloud_provider = "aws"  # or "azure" or "gcp"
primary_region = "eu-north-1"  # Stockholm - closest to Norway
secondary_region = "eu-west-1"  # Ireland - for DR

# Norwegian Compliance
nsm_classification = "RESTRICTED"
gdpr_compliance_enabled = true
data_residency_norway = true
norwegian_locale_required = true

# Security Configuration
security_level = "high"
pod_security_standard = "restricted"
kms_enabled = true
vault_enabled = true

# Application Configuration
replica_count = 3
container_registry = "registry.gitlab.com"
container_repository = "xaheen/xaheen-cli"
container_tag = "1.0.0"

# Monitoring
monitoring_enabled = true
prometheus_enabled = true
grafana_enabled = true
istio_enabled = true
istio_ambient_mode = true

# Resources
cpu_request = "200m"
cpu_limit = "1000m"
memory_request = "512Mi"
memory_limit = "2Gi"

# Cost Management
cost_center = "platform-engineering"
monthly_budget_usd = 2000
EOF

# Plan the deployment
terraform plan -var-file=terraform.tfvars -out=production.tfplan

# Review the plan thoroughly for Norwegian compliance
echo "⚠️  Review the plan for:"
echo "   - Data residency compliance"
echo "   - NSM classification consistency"
echo "   - Security group configurations"
echo "   - Encryption settings"
```

### Step 3: Apply Infrastructure

```bash
# Apply the infrastructure
terraform apply production.tfplan

# Verify outputs
terraform output
```

### Step 4: Configure kubectl

```bash
# AWS
aws eks update-kubeconfig --region eu-north-1 --name xaheen-xaheen-cli-production

# Azure
az aks get-credentials --resource-group xaheen-xaheen-cli-production --name xaheen-xaheen-cli-production

# GCP
gcloud container clusters get-credentials xaheen-xaheen-cli-production --zone europe-north1-a
```

---

## Security Configuration

### Step 1: Initialize HashiCorp Vault

```bash
# Port forward to Vault service
kubectl port-forward -n vault-system svc/vault 8200:8200 &

# Initialize Vault (only run once)
export VAULT_ADDR=https://localhost:8200
export VAULT_SKIP_VERIFY=true  # Only for initial setup

vault operator init -key-shares=5 -key-threshold=3 > vault-init-keys.txt

# Store the unseal keys and root token securely
# ⚠️ CRITICAL: Store these in a secure location according to NSM requirements

# Unseal Vault
vault operator unseal <unseal-key-1>
vault operator unseal <unseal-key-2>
vault operator unseal <unseal-key-3>

# Login with root token
vault auth <root-token>
```

### Step 2: Configure Vault Policies

```bash
# Create policy for Xaheen CLI
vault policy write xaheen-cli - << EOF
# Norwegian compliance policy for Xaheen CLI
path "secret/data/xaheen-cli/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}

path "secret/metadata/xaheen-cli/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}

path "database/creds/xaheen-cli" {
  capabilities = ["read"]
}

path "auth/token/lookup-self" {
  capabilities = ["read"]
}
EOF

# Enable Kubernetes auth
vault auth enable kubernetes

# Configure Kubernetes auth
vault write auth/kubernetes/config \
  token_reviewer_jwt="$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)" \
  kubernetes_host="https://kubernetes.default.svc:443" \
  kubernetes_ca_cert=@/var/run/secrets/kubernetes.io/serviceaccount/ca.crt

# Create role for Xaheen CLI
vault write auth/kubernetes/role/xaheen-cli \
  bound_service_account_names=xaheen-cli \
  bound_service_account_namespaces=xaheen-production \
  policies=xaheen-cli \
  ttl=24h
```

### Step 3: Store Application Secrets

```bash
# Enable KV secrets engine
vault secrets enable -path=secret kv-v2

# Store database credentials
vault kv put secret/xaheen-cli/database \
  username="xaheen_cli_user" \
  password="$(openssl rand -base64 32)" \
  host="postgresql.xaheen-production.svc.cluster.local" \
  port="5432" \
  database="xaheen_cli"

# Store Redis credentials
vault kv put secret/xaheen-cli/redis \
  password="$(openssl rand -base64 32)" \
  host="redis.xaheen-production.svc.cluster.local" \
  port="6379"

# Store API keys and tokens
vault kv put secret/xaheen-cli/api-keys \
  jwt_secret="$(openssl rand -base64 64)" \
  encryption_key="$(openssl rand -base64 32)" \
  api_key="$(openssl rand -base64 32)"

# Store external service credentials
vault kv put secret/xaheen-cli/external \
  openai_api_key="sk-..." \
  sendgrid_api_key="SG..." \
  stripe_secret_key="sk_..."
```

---

## Application Deployment

### Step 1: Deploy Istio Service Mesh (Ambient Mode)

```bash
# Install Istio with Ambient Mode
curl -L https://istio.io/downloadIstio | sh -
cd istio-1.20.0
export PATH=$PWD/bin:$PATH

# Install Istio with Ambient Mode
istioctl install --set values.pilot.env.EXTERNAL_ISTIOD=false \
  --set values.istiodRemote.enabled=false \
  --set values.pilot.env.ENABLE_WORKLOAD_ENTRY_AUTOREGISTRATION=true \
  --set values.ztunnel.enabled=true

# Enable ambient mode for the namespace
kubectl label namespace xaheen-production istio.io/dataplane-mode=ambient

# Deploy waypoint proxy for L7 features
kubectl apply -f k8s/istio-ambient.yaml
```

### Step 2: Deploy Prometheus 3.0 Monitoring Stack

```bash
# Add Prometheus Helm repository
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Install Prometheus 3.0 with Norwegian compliance
helm upgrade --install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring --create-namespace \
  --set prometheus.prometheusSpec.version="v3.0.0" \
  --set prometheus.prometheusSpec.configMaps[0]="prometheus-3.0-config" \
  --set prometheus.prometheusSpec.additionalScrapeConfigs.name="additional-scrape-configs" \
  --set prometheus.prometheusSpec.storageSpec.volumeClaimTemplate.spec.resources.requests.storage="100Gi" \
  --set prometheus.prometheusSpec.retention="90d" \
  --set grafana.adminPassword="$(openssl rand -base64 32)" \
  --values monitoring/prometheus-values.yaml

# Create Prometheus configuration
kubectl create configmap prometheus-3.0-config \
  --from-file=monitoring/prometheus-3.0-config.yaml \
  --namespace monitoring
```

### Step 3: Deploy Application

```bash
# Add Xaheen Helm repository
helm repo add xaheen https://registry.gitlab.com/xaheen/helm-charts
helm repo update

# Deploy Xaheen CLI with Norwegian compliance
helm upgrade --install xaheen-cli xaheen/xaheen-cli \
  --namespace xaheen-production --create-namespace \
  --set global.environment=production \
  --set global.norwegianCompliance.enabled=true \
  --set global.norwegianCompliance.nsmClassification=RESTRICTED \
  --set global.norwegianCompliance.gdprCompliant=true \
  --set global.norwegianCompliance.dataLocalization=norway \
  --set image.tag=1.0.0 \
  --set deployment.replicaCount=3 \
  --set istio.enabled=true \
  --set istio.ambient.enabled=true \
  --set vault.enabled=true \
  --set redis.enabled=true \
  --set monitoring.prometheus.enabled=true \
  --wait --timeout=600s

# Verify deployment
kubectl get pods -n xaheen-production
kubectl get services -n xaheen-production
kubectl get ingress -n xaheen-production
```

### Step 4: Configure Ingress and DNS

```bash
# Apply ingress configuration
kubectl apply -f k8s/ingress.yaml

# Verify DNS resolution
dig xaheen-cli.xala.no
dig prometheus.xala.no
dig grafana.xala.no

# Test TLS certificates
curl -I https://xaheen-cli.xala.no/health
```

---

## Monitoring Setup

### Step 1: Configure Grafana Dashboards

```bash
# Port forward to Grafana
kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80 &

# Get Grafana admin password
kubectl get secret --namespace monitoring prometheus-grafana -o jsonpath="{.data.admin-password}" | base64 --decode

# Import Norwegian compliance dashboards
curl -X POST http://admin:password@localhost:3000/api/dashboards/db \
  -H "Content-Type: application/json" \
  -d @monitoring/grafana-dashboards/xaheen-cli-overview.json

curl -X POST http://admin:password@localhost:3000/api/dashboards/db \
  -H "Content-Type: application/json" \
  -d @monitoring/grafana-dashboards/norwegian-compliance.json

curl -X POST http://admin:password@localhost:3000/api/dashboards/db \
  -H "Content-Type: application/json" \
  -d @monitoring/grafana-dashboards/security-monitoring.json
```

### Step 2: Configure Alerting

```bash
# Apply Prometheus alerting rules
kubectl apply -f monitoring/prometheus-rules.yaml

# Configure AlertManager for Norwegian compliance
kubectl apply -f monitoring/alertmanager-config.yaml

# Test alerts
kubectl run test-pod --image=nginx --restart=Never
kubectl delete pod test-pod
```

### Step 3: Setup Log Aggregation

```bash
# Deploy ELK Stack for Norwegian compliance logging
helm repo add elastic https://helm.elastic.co
helm upgrade --install elasticsearch elastic/elasticsearch \
  --namespace logging --create-namespace \
  --set replicas=3 \
  --set minimumMasterNodes=2 \
  --set resources.requests.memory="2Gi" \
  --set resources.limits.memory="4Gi" \
  --set volumeClaimTemplate.resources.requests.storage="100Gi"

helm upgrade --install kibana elastic/kibana \
  --namespace logging \
  --set resources.requests.memory="1Gi" \
  --set resources.limits.memory="2Gi"

helm upgrade --install filebeat elastic/filebeat \
  --namespace logging \
  --set daemonset.enabled=true
```

---

## Norwegian Compliance Verification

### Step 1: Data Residency Verification

```bash
# Verify all data is within Norwegian/EU boundaries
echo "Verifying data residency..."

# Check Kubernetes nodes location
kubectl get nodes -o wide
kubectl describe nodes | grep zone

# Check storage classes and persistent volumes
kubectl get storageclass
kubectl get pv -o custom-columns=NAME:.metadata.name,ZONE:.metadata.labels."topology\.kubernetes\.io/zone"

# Verify database location
kubectl exec -n xaheen-production deployment/postgresql -- psql -c "SELECT name, setting FROM pg_settings WHERE name = 'timezone';"

# Check Redis configuration
kubectl exec -n xaheen-production deployment/redis -- redis-cli config get "*"
```

### Step 2: NSM Classification Verification

```bash
# Verify NSM classification labels on all resources
echo "Verifying NSM classification..."

kubectl get pods -n xaheen-production -o json | jq '.items[].metadata.labels."nsm.classification"'
kubectl get services -n xaheen-production -o json | jq '.items[].metadata.labels."nsm.classification"'
kubectl get ingress -n xaheen-production -o json | jq '.items[].metadata.annotations."nsm.no/classification"'

# Verify network policies are enforced
kubectl get networkpolicies -n xaheen-production
kubectl describe networkpolicy xaheen-cli-netpol -n xaheen-production
```

### Step 3: GDPR Compliance Check

```bash
# Verify GDPR compliance markers
echo "Verifying GDPR compliance..."

# Check for GDPR labels and annotations
kubectl get all -n xaheen-production -o json | jq '.items[].metadata.labels."gdpr.compliant"'
kubectl get all -n xaheen-production -o json | jq '.items[].metadata.annotations."gdpr.eu/article32"'

# Verify data retention policies
kubectl get configmap xaheen-cli-config -n xaheen-production -o yaml | grep -i retention

# Check audit logging
kubectl logs -n kube-system -l component=kube-apiserver | grep audit | tail -5
```

### Step 4: Security Compliance Verification

```bash
# Verify Pod Security Standards
kubectl get pods -n xaheen-production -o json | jq '.items[].spec.securityContext'
kubectl get pods -n xaheen-production -o json | jq '.items[].spec.containers[].securityContext'

# Check for privileged containers (should be none)
kubectl get pods -n xaheen-production -o json | jq '.items[].spec.containers[] | select(.securityContext.privileged == true)'

# Verify network policies
kubectl get networkpolicies -A
kubectl describe networkpolicy -n xaheen-production

# Check TLS configuration
kubectl get secrets -n xaheen-production | grep tls
kubectl describe secret xaheen-cli-tls -n xaheen-production
```

---

## Post-Deployment Validation

### Step 1: Health Checks

```bash
# Application health check
curl -f https://xaheen-cli.xala.no/health
curl -f https://xaheen-cli.xala.no/ready
curl -f https://xaheen-cli.xala.no/startup

# Prometheus metrics check
curl -f https://xaheen-cli.xala.no/metrics

# Database connectivity
kubectl exec -n xaheen-production deployment/xaheen-cli -- node -e "
const client = require('pg').Client({
  connectionString: process.env.DATABASE_URL
});
client.connect().then(() => {
  console.log('Database connection successful');
  client.end();
}).catch(err => {
  console.error('Database connection failed:', err);
  process.exit(1);
});
"

# Redis connectivity
kubectl exec -n xaheen-production deployment/xaheen-cli -- node -e "
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);
client.ping().then(result => {
  console.log('Redis connection successful:', result);
  client.quit();
}).catch(err => {
  console.error('Redis connection failed:', err);
  process.exit(1);
});
"
```

### Step 2: Performance Testing

```bash
# Install k6 for load testing
kubectl apply -f testing/k6-load-test.yaml

# Run performance tests
kubectl create job performance-test --from=cronjob/k6-load-test

# Monitor results
kubectl logs job/performance-test -f

# Verify metrics in Prometheus
curl -G https://prometheus.xala.no/api/v1/query \
  --data-urlencode 'query=http_requests_total{service="xaheen-cli"}'
```

### Step 3: Security Testing

```bash
# Run security scan
kubectl apply -f security/security-scan-job.yaml

# Check for vulnerabilities
kubectl logs job/security-scan -f

# Verify no privileged containers
kubectl get pods -o json | jq '.items[] | select(.spec.containers[]?.securityContext.privileged == true) | .metadata.name'

# Check for exposed secrets
kubectl get secrets -o json | jq '.items[] | select(.type == "Opaque") | .metadata.name'
```

### Step 4: Disaster Recovery Testing

```bash
# Test backup procedures
kubectl apply -f backup/backup-test-job.yaml

# Simulate failure scenarios
kubectl delete pod -n xaheen-production -l app.kubernetes.io/name=xaheen-cli --force

# Verify auto-recovery
kubectl get pods -n xaheen-production -w

# Test cross-region failover (if applicable)
# This should be done during planned maintenance windows
```

---

## Rollback Procedures

### Emergency Rollback

```bash
# Quick rollback using Helm
helm rollback xaheen-cli -n xaheen-production

# Or rollback to specific revision
helm history xaheen-cli -n xaheen-production
helm rollback xaheen-cli 2 -n xaheen-production

# Verify rollback
kubectl get pods -n xaheen-production
curl -f https://xaheen-cli.xala.no/health
```

### Blue-Green Rollback

```bash
# Switch traffic back to previous color
kubectl patch service xaheen-cli -n xaheen-production -p '{"spec":{"selector":{"color":"blue"}}}'

# Clean up failed deployment
helm uninstall xaheen-cli-green -n xaheen-production

# Verify traffic routing
curl -f https://xaheen-cli.xala.no/health
```

### Database Rollback

```bash
# Restore from backup (if database changes were made)
kubectl apply -f backup/restore-job.yaml

# Verify data integrity
kubectl exec -n xaheen-production deployment/postgresql -- pg_dump -t users | head -20
```

---

## Troubleshooting Guide

### Common Issues

#### 1. Pod Startup Issues

```bash
# Check pod status
kubectl get pods -n xaheen-production
kubectl describe pod <pod-name> -n xaheen-production

# Check logs
kubectl logs <pod-name> -n xaheen-production -c xaheen-cli
kubectl logs <pod-name> -n xaheen-production -c vault-agent --previous

# Check resource constraints
kubectl top pods -n xaheen-production
kubectl describe limitrange -n xaheen-production
```

#### 2. Network Connectivity Issues

```bash
# Check service endpoints
kubectl get endpoints -n xaheen-production
kubectl describe service xaheen-cli -n xaheen-production

# Test internal connectivity
kubectl run debug --image=nicolaka/netshoot --rm -it -- /bin/bash
# Inside the debug pod:
nslookup xaheen-cli.xaheen-production.svc.cluster.local
telnet xaheen-cli.xaheen-production.svc.cluster.local 3000

# Check Istio service mesh
istioctl proxy-status
istioctl proxy-config endpoint <pod-name>.<namespace>
```

#### 3. Certificate Issues

```bash
# Check certificate status
kubectl get certificates -n xaheen-production
kubectl describe certificate xaheen-cli-tls -n xaheen-production

# Check cert-manager logs
kubectl logs -n cert-manager deployment/cert-manager

# Manual certificate verification
openssl s_client -connect xaheen-cli.xala.no:443 -servername xaheen-cli.xala.no
```

#### 4. Vault Integration Issues

```bash
# Check Vault status
kubectl exec -n vault-system vault-0 -- vault status

# Check Vault agent logs
kubectl logs -n xaheen-production <pod-name> -c vault-agent

# Verify Kubernetes auth
vault auth -method=kubernetes role=xaheen-cli jwt=<service-account-token>

# Check secret injection
kubectl exec -n xaheen-production <pod-name> -- ls -la /vault/secrets/
```

#### 5. Monitoring Issues

```bash
# Check Prometheus targets
curl -G https://prometheus.xala.no/api/v1/targets | jq '.data.activeTargets[] | select(.health != "up")'

# Check ServiceMonitor configuration
kubectl get servicemonitor -n xaheen-production
kubectl describe servicemonitor xaheen-cli-metrics -n xaheen-production

# Verify metrics endpoint
kubectl port-forward -n xaheen-production svc/xaheen-cli 9090:9090 &
curl http://localhost:9090/metrics
```

### Performance Issues

```bash
# Check resource usage
kubectl top pods -n xaheen-production
kubectl top nodes

# Check HPA status
kubectl get hpa -n xaheen-production
kubectl describe hpa xaheen-cli-hpa -n xaheen-production

# Check for resource throttling
kubectl describe pod <pod-name> -n xaheen-production | grep -i throttl

# Review Istio performance
istioctl proxy-config cluster <pod-name>.<namespace> --fqdn <service-fqdn>
```

### Security Issues

```bash
# Check security policies
kubectl get psp
kubectl get networkpolicies -A

# Verify RBAC
kubectl auth can-i --list --as=system:serviceaccount:xaheen-production:xaheen-cli

# Check for security violations
kubectl get events -n xaheen-production | grep -i security
kubectl logs -n kube-system -l component=kube-apiserver | grep -i denied
```

---

## Emergency Contacts

### Norwegian Compliance Team
- **NSM Compliance Officer**: compliance@xaheen.no
- **GDPR Data Protection Officer**: dpo@xaheen.no
- **Security Team**: security@xaheen.no

### Technical Teams
- **Platform Team**: platform@xaheen.no
- **DevOps Team**: devops@xaheen.no
- **On-Call Engineer**: +47 XXX XX XXX

### External Contacts
- **Cloud Provider Support**: 
  - AWS: +1-206-266-4064
  - Azure: +47 XXXX XXXX
  - GCP: +47 XXXX XXXX
- **Certificate Authority**: support@letsencrypt.org
- **DNS Provider**: support@cloudflare.com

### Escalation Matrix

| Severity | Response Time | Contacts |
|----------|---------------|----------|
| Critical (P0) | 15 minutes | On-Call + Platform Team + Security Team |
| High (P1) | 1 hour | Platform Team + DevOps Team |
| Medium (P2) | 4 hours | DevOps Team |
| Low (P3) | Next business day | DevOps Team |

---

## Maintenance Windows

### Scheduled Maintenance
- **Weekly**: Sundays 03:00-04:00 CET (Security updates)
- **Monthly**: First Sunday 02:00-06:00 CET (Major updates)
- **Quarterly**: TBD (Infrastructure upgrades)

### Emergency Maintenance
- **Authorization Required**: Platform Team Lead + Security Officer
- **Communication**: All stakeholders notified via Slack #incidents
- **Documentation**: All changes logged in incident management system

---

**Document Version**: 1.0.0
**Last Updated**: 2025-01-05
**Next Review**: 2025-04-01
**Owner**: Platform Engineering Team
**Approval**: Security Team + Norwegian Compliance Officer