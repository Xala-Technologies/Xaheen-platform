# Bundle System Documentation

## Overview

The Bundle System provides pre-configured collections of services optimized for specific use cases. Bundles simplify project setup by automatically including all necessary services with proper configuration.

## Bundle Structure

```typescript
interface ServiceBundle {
  id: string;
  name: string;
  displayName: string;
  description: string;
  version: string;
  type: BundleType;
  category?: BundleCategory;
  
  services: BundleService[];
  optionalServices?: BundleService[];
  
  pricing?: {
    tier: 'starter' | 'professional' | 'enterprise';
    monthlyPrice: string;
    annualPrice?: string;
    currency?: string;
  };
  
  compliance?: {
    standards: ComplianceStandard[];
    certifications?: string[];
    dataResidency?: string[];
  };
  
  deployment?: {
    targets: DeploymentTarget[];
    preferredTarget?: DeploymentTarget;
    infrastructure?: InfrastructureRequirement[];
  };
  
  prerequisites?: {
    knowledge?: string[];
    tools?: string[];
    accounts?: string[];
  };
  
  metadata?: {
    author?: string;
    maintainers?: string[];
    tags?: string[];
    popularity?: number;
  };
}
```

## Available Bundles

### SaaS Starter Bundle

**ID**: `saas-starter`  
**Price Tier**: $0-10k MRR  
**Description**: Essential services for MVP SaaS applications

```json
{
  "id": "saas-starter",
  "name": "SaaS Starter Kit",
  "type": "saas",
  "services": [
    {
      "serviceType": "database",
      "provider": "postgresql",
      "config": {
        "version": "15",
        "extensions": ["uuid-ossp", "pgcrypto"]
      }
    },
    {
      "serviceType": "auth",
      "provider": "better-auth",
      "features": ["email-password", "oauth", "magic-links"]
    },
    {
      "serviceType": "payment",
      "provider": "stripe",
      "features": ["subscriptions", "customer-portal"]
    },
    {
      "serviceType": "notification",
      "provider": "resend",
      "config": {
        "templates": ["welcome", "receipt", "reminder"]
      }
    },
    {
      "serviceType": "analytics",
      "provider": "posthog",
      "features": ["events", "users", "funnels"]
    },
    {
      "serviceType": "monitoring",
      "provider": "sentry",
      "config": {
        "performance": true,
        "profiling": false
      }
    }
  ]
}
```

### SaaS Professional Bundle

**ID**: `saas-professional`  
**Price Tier**: $10k-100k MRR  
**Description**: Comprehensive services for scaling SaaS

```json
{
  "id": "saas-professional",
  "name": "SaaS Professional",
  "type": "saas",
  "services": [
    // All starter services plus:
    {
      "serviceType": "cache",
      "provider": "redis",
      "features": ["sessions", "queues", "pub-sub"]
    },
    {
      "serviceType": "messaging",
      "provider": "rabbitmq",
      "config": {
        "exchanges": ["events", "commands"],
        "queues": ["email", "webhooks", "analytics"]
      }
    },
    {
      "serviceType": "rbac",
      "provider": "casbin",
      "features": ["role-hierarchy", "resource-permissions"]
    },
    {
      "serviceType": "search",
      "provider": "elasticsearch",
      "config": {
        "indices": ["users", "content", "logs"]
      }
    },
    {
      "serviceType": "storage",
      "provider": "s3",
      "config": {
        "buckets": ["uploads", "backups", "static"]
      }
    }
  ],
  "compliance": {
    "standards": ["GDPR", "SOC2-Type1"]
  }
}
```

### SaaS Enterprise Bundle

**ID**: `saas-enterprise`  
**Price Tier**: $100k+ MRR  
**Description**: Enterprise-grade services with advanced compliance

```json
{
  "id": "saas-enterprise",
  "name": "SaaS Enterprise",
  "type": "saas",
  "services": [
    // All professional services plus:
    {
      "serviceType": "auth",
      "provider": "auth0",
      "features": ["sso", "saml", "ldap", "mfa-required"]
    },
    {
      "serviceType": "monitoring",
      "provider": "datadog",
      "features": ["apm", "logs", "synthetics", "rum"]
    },
    {
      "serviceType": "security",
      "provider": "snyk",
      "features": ["sca", "container-scanning", "iac"]
    },
    {
      "serviceType": "audit",
      "provider": "custom",
      "features": ["immutable-logs", "compliance-reports"]
    }
  ],
  "compliance": {
    "standards": ["SOC2-Type2", "ISO27001", "HIPAA"],
    "certifications": ["CSA-STAR", "PCI-DSS"]
  },
  "deployment": {
    "targets": ["aws", "azure", "gcp", "on-premise"],
    "infrastructure": ["kubernetes", "terraform"]
  }
}
```

### Industry-Specific Bundles

#### FinTech Bundle

```json
{
  "id": "fintech-saas",
  "name": "FinTech SaaS",
  "type": "industry",
  "category": "financial",
  "services": [
    {
      "serviceType": "payment",
      "provider": "stripe",
      "features": ["connect", "treasury", "issuing"]
    },
    {
      "serviceType": "compliance",
      "provider": "trulioo",
      "features": ["kyc", "aml", "sanctions"]
    },
    {
      "serviceType": "security",
      "provider": "vault",
      "features": ["encryption", "key-management", "pki"]
    }
  ],
  "compliance": {
    "standards": ["PCI-DSS", "PSD2", "GDPR"],
    "certifications": ["SOC1", "SOC2", "ISO27001"]
  }
}
```

#### Healthcare Bundle

```json
{
  "id": "healthcare-saas",
  "name": "Healthcare SaaS",
  "type": "industry",
  "category": "healthcare",
  "services": [
    {
      "serviceType": "ehr",
      "provider": "custom",
      "features": ["patient-records", "appointments", "prescriptions"]
    },
    {
      "serviceType": "compliance",
      "provider": "hipaa-vault",
      "features": ["audit-logs", "encryption", "access-control"]
    },
    {
      "serviceType": "communication",
      "provider": "twilio",
      "features": ["video", "voice", "sms", "hipaa-compliant"]
    }
  ],
  "compliance": {
    "standards": ["HIPAA", "GDPR", "HITRUST"],
    "dataResidency": ["US", "EU"]
  }
}
```

## Bundle Resolution

### Dependency Resolution

```typescript
const resolver = new BundleResolver();

// Resolve bundle with all dependencies
const resolution = await resolver.resolveBundle('saas-professional', {
  framework: 'next',
  deployment: 'vercel',
  additionalServices: ['cms']
});

// Returns:
{
  services: Service[],           // All services with dependencies resolved
  configurationSteps: Step[],    // Configuration instructions
  deploymentPlan: Plan,          // Deployment steps
  environmentVariables: EnvVar[], // Required env vars
  estimatedCost: Cost            // Monthly cost estimate
}
```

### Compatibility Checking

```typescript
// Check bundle compatibility with project
const compatibility = await resolver.checkBundleCompatibility('fintech-saas', {
  framework: 'next',
  database: 'postgres',
  deployment: 'aws'
});

// Returns:
{
  compatible: boolean,
  conflicts: Conflict[],
  warnings: Warning[],
  suggestions: Suggestion[]
}
```

### Bundle Merging

```typescript
// Merge multiple bundles
const merged = await resolver.mergeBundles([
  'saas-starter',
  'norwegian-compliance'
], {
  conflictResolution: 'prefer-newer',
  deduplication: true
});
```

## Bundle Customization

### Creating Custom Bundles

```typescript
const customBundle: ServiceBundle = {
  id: 'my-custom-bundle',
  name: 'My Custom SaaS',
  type: 'custom',
  version: '1.0.0',
  services: [
    {
      serviceType: 'auth',
      provider: 'clerk',
      priority: 100,
      required: true,
      config: {
        features: ['passwordless', 'social-login']
      }
    },
    // ... more services
  ]
};

// Register custom bundle
await bundleRegistry.registerBundle(customBundle);
```

### Extending Existing Bundles

```typescript
// Extend existing bundle
const extendedBundle = await bundleRegistry.extendBundle('saas-starter', {
  additionalServices: [
    {
      serviceType: 'ai',
      provider: 'openai',
      config: {
        models: ['gpt-4', 'dall-e-3']
      }
    }
  ],
  overrides: {
    'auth.features': ['passkeys', 'webauthn']
  }
});
```

## Bundle Analytics

### Usage Tracking

```typescript
// Track bundle usage
bundleAnalytics.trackUsage({
  bundleId: 'saas-professional',
  projectId: 'proj_123',
  userId: 'user_456',
  timestamp: new Date()
});

// Get bundle statistics
const stats = await bundleAnalytics.getBundleStats('saas-professional');
// Returns: usage count, success rate, popular configurations
```

### Performance Metrics

```typescript
// Track bundle installation performance
const metrics = await bundleAnalytics.getPerformanceMetrics('saas-enterprise');
// Returns: average install time, success rate, common errors
```

## Bundle Recommendations

### Smart Recommendations

```typescript
// Get bundle recommendations based on project type
const recommendations = await bundleRecommender.recommend({
  projectType: 'marketplace',
  teamSize: 'small',
  budget: 'medium',
  compliance: ['GDPR']
});

// Returns ranked list of suitable bundles
```

### Feature-Based Selection

```typescript
// Find bundles with specific features
const bundles = await bundleRegistry.findBundles({
  requiredServices: ['auth', 'payment', 'notification'],
  compliance: ['GDPR', 'PCI-DSS'],
  maxPrice: 1000,
  deployment: 'cloud-native'
});
```

## Bundle Deployment

### Deployment Planning

```typescript
// Generate deployment plan
const plan = await bundleDeployer.createDeploymentPlan('saas-professional', {
  target: 'aws',
  region: 'us-east-1',
  environment: 'production'
});

// Returns step-by-step deployment instructions
```

### Infrastructure as Code

```typescript
// Generate IaC templates
const templates = await bundleDeployer.generateIaC('saas-enterprise', {
  provider: 'terraform',
  modules: ['network', 'compute', 'database', 'security']
});
```

## Best Practices

### 1. Bundle Selection

- Start with the smallest bundle that meets your needs
- Consider future scaling requirements
- Evaluate compliance requirements early
- Check service availability in your region

### 2. Customization

- Extend bundles rather than creating from scratch
- Document custom configurations
- Version control bundle definitions
- Test bundle combinations

### 3. Cost Management

- Review bundle cost estimates
- Monitor actual vs estimated costs
- Optimize service configurations
- Use development/staging bundles

### 4. Security

- Review security configurations
- Enable all compliance features
- Audit service permissions
- Implement least privilege

### 5. Maintenance

- Keep bundles updated
- Monitor deprecation notices
- Plan migration strategies
- Document bundle changes

## Troubleshooting

### Common Issues

1. **Dependency Conflicts**
   ```typescript
   // Resolve conflicts
   const resolved = await resolver.resolveConflicts(conflicts, {
     strategy: 'prefer-compatible',
     manual: ['auth'] // Manual resolution for auth
   });
   ```

2. **Missing Services**
   ```typescript
   // Find alternative services
   const alternatives = await registry.findAlternatives('unavailable-service');
   ```

3. **Configuration Errors**
   ```typescript
   // Validate configuration
   const validation = await validator.validateBundleConfig(bundle, config);
   ```

## CLI Commands

```bash
# List available bundles
xaheen bundle list

# Show bundle details
xaheen bundle info saas-professional

# Create project with bundle
xaheen create my-app --bundle saas-starter

# Add bundle to existing project
xaheen add bundle fintech-saas

# Customize bundle interactively
xaheen bundle customize saas-professional

# Validate bundle configuration
xaheen bundle validate ./my-bundle.json

# Compare bundles
xaheen bundle compare saas-starter saas-professional
```