# Terraform Infrastructure Generator

The Terraform Infrastructure Generator is a comprehensive tool for generating production-ready Infrastructure as Code (IaC) configurations. It supports AWS, Azure, GCP, and multi-cloud deployments with best practices built-in.

## Features

### Multi-Cloud Support
- **AWS**: Complete infrastructure including VPC, EC2, RDS, S3, IAM, KMS, CloudWatch
- **Azure**: Virtual Networks, Virtual Machines, SQL Database, Blob Storage, Key Vault, Monitor
- **GCP**: VPC, Compute Engine, Cloud SQL, Cloud Storage, Cloud KMS, Cloud Logging
- **Multi-Cloud**: Coordinated infrastructure across multiple cloud providers

### Infrastructure Components

#### Networking
- Virtual Private Clouds (VPC/VNet)
- Public and private subnets
- NAT gateways and internet gateways
- Security groups and network ACLs
- VPN gateways for hybrid connectivity

#### Compute
- Auto-scaling groups with configurable policies
- Load balancers (Application Load Balancer, Network Load Balancer)
- Launch templates with security best practices
- Instance types optimized for different workloads
- Health checks and monitoring

#### Storage
- **Databases**: PostgreSQL, MySQL, SQL Server with high availability
- **Object Storage**: S3, Azure Blob Storage, Google Cloud Storage
- **File Systems**: EFS, Azure Files, Google Filestore
- Automated backups with configurable retention periods
- Encryption at rest and in transit

#### Security
- IAM roles and policies following least privilege principles
- Key Management Service (KMS) for encryption
- Secrets Manager for secure credential storage
- Web Application Firewall (WAF) for application protection
- Certificate Manager for SSL/TLS certificates

#### Monitoring & Observability
- CloudWatch/Azure Monitor/Google Monitoring dashboards
- Centralized logging with structured log forwarding
- Custom metrics and alerting rules
- Distributed tracing (optional)
- Cost monitoring and optimization alerts

### Environment-Specific Configurations

The generator creates separate configurations for:
- **Development**: Minimal resources, cost-optimized
- **Staging**: Production-like with reduced capacity
- **Production**: High availability, security, and performance optimized

## Usage

### Command Line Interface

```bash
# Generate AWS infrastructure
xaheen generate terraform my-app --cloud-provider aws --region us-west-2

# Generate Azure infrastructure
xaheen generate terraform my-app --cloud-provider azure --region "East US"

# Generate GCP infrastructure
xaheen generate terraform my-app --cloud-provider gcp --region us-central1

# Generate multi-cloud infrastructure
xaheen generate terraform my-app --cloud-provider multi-cloud
```

### Programmatic Usage

```typescript
import { executeFullStackGenerator } from '@xala-technologies/xaheen-cli';

const result = await executeFullStackGenerator({
  type: 'terraform',
  name: 'my-web-app',
  options: {
    cloudProvider: 'aws',
    region: 'us-west-2',
    environment: 'production',
    networking: {
      vpc: true,
      subnets: 'both',
      availabilityZones: 3,
      enableNatGateway: true,
    },
    compute: {
      instances: [{
        name: 'web-server',
        instanceType: 't3.medium',
        minSize: 2,
        maxSize: 10,
        desiredCapacity: 3,
      }],
      loadBalancer: true,
      autoScaling: true,
    },
    // ... additional configuration
  },
  projectInfo: {
    name: 'my-web-app',
    version: '1.0.0',
    framework: 'terraform',
  }
});
```

## Generated File Structure

```
terraform/
├── main.tf                    # Main configuration
├── variables.tf               # Variable definitions
├── outputs.tf                 # Output definitions
├── versions.tf                # Provider version constraints
├── providers.tf               # Provider configurations
├── terraform.tfvars.example   # Example variables file
├── modules/                   # Terraform modules
│   ├── networking/            # Network infrastructure
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── compute/               # Compute resources
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── user_data.sh       # Instance startup script
│   ├── storage/               # Storage resources
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── security/              # Security resources
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   └── monitoring/            # Monitoring resources
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
├── environments/              # Environment-specific configs
│   ├── development/
│   │   ├── terraform.tfvars
│   │   └── backend.tf
│   ├── staging/
│   │   ├── terraform.tfvars
│   │   └── backend.tf
│   └── production/
│       ├── terraform.tfvars
│       └── backend.tf
└── README.md                  # Deployment instructions
```

## Configuration Options

### Cloud Provider Options

#### AWS Configuration
```typescript
{
  cloudProvider: 'aws',
  region: 'us-west-2',
  networking: {
    vpc: true,
    subnets: 'both',              // 'public', 'private', or 'both'
    availabilityZones: 3,
    enableNatGateway: true,
    enableVpnGateway: false,
  },
  compute: {
    instances: [{
      name: 'web-server',
      instanceType: 't3.medium',   // AWS instance types
      minSize: 2,
      maxSize: 10,
      desiredCapacity: 3,
    }],
    loadBalancer: true,
    autoScaling: true,
  }
}
```

#### Azure Configuration
```typescript
{
  cloudProvider: 'azure',
  region: 'East US',
  networking: {
    vpc: true,                    // Creates Virtual Network
    subnets: 'both',
    availabilityZones: 2,         // Azure availability zones
  },
  compute: {
    instances: [{
      name: 'app-servers',
      instanceType: 'Standard_B2s', // Azure VM sizes
      minSize: 1,
      maxSize: 5,
      desiredCapacity: 2,
    }],
    loadBalancer: true,
    autoScaling: true,
  }
}
```

#### GCP Configuration
```typescript
{
  cloudProvider: 'gcp',
  region: 'us-central1',
  networking: {
    vpc: true,                    // Creates VPC network
    subnets: 'both',
    availabilityZones: 3,         // GCP zones
  },
  compute: {
    instances: [{
      name: 'compute-instances',
      instanceType: 'e2-medium',   // GCP machine types
      minSize: 2,
      maxSize: 8,
      desiredCapacity: 3,
    }],
    loadBalancer: true,
    autoScaling: true,
  }
}
```

### Storage Configuration

```typescript
storage: {
  databases: [{
    name: 'main-db',
    engine: 'postgresql',         // postgresql, mysql, sqlserver
    version: '15.4',
    instanceClass: 'db.t3.micro', // Cloud-specific instance classes
    allocatedStorage: 20,         // GB
    multiAZ: true,               // High availability
    backupRetentionPeriod: 7,    // Days
    encrypted: true,
  }],
  objectStorage: true,           // S3, Blob Storage, Cloud Storage
  fileSystem: false,             // EFS, Azure Files, Filestore
}
```

### Security Configuration

```typescript
security: {
  waf: true,                     // Web Application Firewall
  certificateManager: true,      // SSL/TLS certificates
  keyManagement: true,           // KMS for encryption keys
  secretsManager: true,          // Store secrets securely
  iamRoles: [                    // Custom IAM roles
    'WebServerRole',
    'DatabaseRole',
    'MonitoringRole'
  ],
}
```

### Remote State Configuration

```typescript
remoteState: {
  backend: 's3',                 // s3, azurerm, gcs
  bucket: 'my-terraform-state',  // Backend-specific storage
  region: 'us-west-2',
  prefix: 'production',
}
```

## Best Practices Built-In

### Security
- **Least Privilege**: IAM roles with minimal required permissions
- **Encryption**: All data encrypted at rest and in transit
- **Network Security**: Private subnets for databases and internal services
- **Secrets Management**: Credentials stored in cloud secrets services
- **Security Groups**: Restrictive network access rules

### High Availability
- **Multi-AZ Deployment**: Resources spread across availability zones
- **Auto-Scaling**: Automatic scaling based on demand
- **Load Balancing**: Traffic distribution across instances
- **Health Checks**: Automated health monitoring and replacement
- **Backup Strategy**: Automated backups with configurable retention

### Performance
- **Right-Sizing**: Instance types optimized for workload
- **Caching**: CloudFront/CDN for static content
- **Database Optimization**: Read replicas and connection pooling
- **Monitoring**: Performance metrics and alerting

### Cost Optimization
- **Reserved Instances**: Recommendations for long-term workloads
- **Auto-Scaling**: Scale down during low usage periods
- **Resource Tagging**: Proper cost allocation and tracking
- **Storage Classes**: Intelligent tiering for object storage

## Deployment Workflow

### 1. Generate Infrastructure
```bash
xaheen generate terraform my-app --cloud-provider aws
```

### 2. Configure Variables
```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your specific values
```

### 3. Initialize Terraform
```bash
terraform init
```

### 4. Plan Deployment
```bash
terraform plan
```

### 5. Apply Configuration
```bash
terraform apply
```

### 6. Environment-Specific Deployment
```bash
# Development
terraform init -backend-config=environments/development/backend.tf
terraform apply -var-file=environments/development/terraform.tfvars

# Production
terraform init -backend-config=environments/production/backend.tf
terraform apply -var-file=environments/production/terraform.tfvars
```

## Compliance and Governance

### Security Compliance
- **GDPR**: Data protection and privacy controls
- **SOC2**: Security controls and audit trails
- **HIPAA**: Healthcare data protection (when configured)
- **NSM**: Norwegian security standards support

### Audit and Monitoring
- **CloudTrail/Activity Logs**: All API calls logged
- **Change Management**: Infrastructure changes tracked
- **Access Logging**: All resource access monitored
- **Compliance Reports**: Automated compliance checking

## Troubleshooting

### Common Issues

1. **State Lock Errors**
   ```bash
   terraform force-unlock LOCK_ID
   ```

2. **Permission Errors**
   - Verify cloud provider credentials
   - Check IAM permissions for Terraform

3. **Resource Conflicts**
   - Use unique resource names
   - Check for existing resources

4. **Network Connectivity**
   - Verify security group rules
   - Check route table configurations

### Support Resources

- [Terraform Documentation](https://www.terraform.io/docs)
- [AWS Provider Documentation](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Azure Provider Documentation](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs)
- [GCP Provider Documentation](https://registry.terraform.io/providers/hashicorp/google/latest/docs)

## Examples

See `examples/terraform-generator-usage.ts` for complete usage examples including:
- AWS infrastructure generation
- Azure infrastructure generation
- Multi-cloud infrastructure generation
- Environment-specific configurations

## Contributing

The Terraform generator is part of the Xaheen CLI infrastructure generators. For contributions:

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## License

This Terraform generator is part of the Xaheen CLI and is subject to the project's license terms.