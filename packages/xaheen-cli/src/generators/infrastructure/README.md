# Infrastructure Generators

## Overview

The Infrastructure Generators module provides specialized code generators for creating containerization configurations, infrastructure-as-code templates, deployment pipelines, and other infrastructure components. These generators implement DevOps best practices, security standards, and modern infrastructure patterns to support reliable application deployment and operation.

## Architecture

The infrastructure generators follow the modular architecture of the Xaheen CLI generator system with strict adherence to SOLID principles:

1. Each generator extends the `BaseGenerator<TOptions>` abstract class with explicit return types
2. Generators implement the `generate` method with comprehensive validation
3. All generators are registered via the Infrastructure Registrar
4. Common infrastructure utilities are shared through composition rather than inheritance

## Key Generators

### Docker Generator

Creates Docker configurations with:
- Dockerfile with multi-stage builds
- docker-compose.yml for local development
- Docker ignore files
- Container optimization (caching, layering, size reduction)
- Environment variable handling
- Volume configurations
- Security hardening options
- Network configuration

### Kubernetes Generator

Generates Kubernetes manifests with:
- Deployment configurations
- Service definitions
- Ingress rules
- ConfigMaps and Secrets
- StatefulSets when needed
- Pod resource specifications
- Namespace configuration
- Health check definitions
- Autoscaling options

### Terraform Generator

Creates infrastructure-as-code using Terraform with:
- Provider configurations
- Resource definitions
- Variable declarations
- Output specifications
- Module structures
- State management
- Security groups
- IAM policies
- CI/CD integration

### Deployment Generator

Creates deployment pipeline configurations with:
- CI/CD workflow definitions
- Environment configurations
- Artifact management
- Build and test steps
- Deployment strategies
- Rollback procedures
- Security scanning
- Notification setup

## Integration with Main CLI

The Infrastructure Generators integrate with the Xaheen CLI through:

1. **Command Registration**: Each generator type is exposed as a CLI command
2. **Project Analysis**: Generators analyze the project structure to create appropriate infrastructure
3. **Platform Detection**: Generators adapt output based on detected platforms and environments
4. **Configuration Inheritance**: Generators respect project-wide configuration settings
5. **Provider Integration**: Generators work with various cloud providers and platforms

## Usage Examples

### Via CLI

```bash
# Generate Docker configuration
xaheen generate docker --multi-stage --production --optimize

# Generate Kubernetes manifests
xaheen generate k8s --namespace=myapp --replicas=3 --resources=medium

# Generate Terraform configuration
xaheen generate terraform aws --modules=vpc,ec2,rds,s3
```

### Programmatically

```typescript
import { generateCode } from '@xaheen/cli/generators';

// Generate Docker configuration
const result = await generateCode({
  type: 'infrastructure',
  target: 'docker',
  options: {
    multiStage: true,
    production: true,
    ports: [3000, 9000],
    volumes: ['data', 'logs'],
    env: ['NODE_ENV', 'API_KEY']
  }
});
```

## Security & Compliance

The infrastructure generators implement security best practices including:

- Secret management (no hardcoded secrets)
- Least privilege principle
- Network segmentation
- Resource limitations
- Container hardening
- Compliance with industry standards (CIS, GDPR, etc.)
- Audit logging
- Encryption for data at rest and in transit
