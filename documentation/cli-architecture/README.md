# Xaheen CLI Architecture Documentation

## Overview

The Xaheen CLI provides a modern, service-based architecture focused on building production-ready SaaS applications. This documentation covers the JSON-based service registry, intelligent bundle system, and strict UI compliance engine.

## Table of Contents

1. [Architecture Overview](./architecture-overview.md)
2. [Service Registry System](./service-registry.md)
3. [Bundle System](./bundle-system.md)
4. [Template Fragment System](./template-fragments.md)
5. [UI Compliance Engine](./ui-compliance.md)
6. [Testing Guide](./testing-guide.md)
7. [Migration Guide](./migration-guide.md)
8. [API Reference](./api-reference.md)

## Key Features

### 🏗️ Service-Based Architecture
- **Service Registry**: Centralized service definitions with metadata
- **Bundle System**: Pre-configured service combinations for different use cases
- **Dependency Resolution**: Automatic service dependency management
- **Compatibility Checking**: Validates service combinations

### 🎨 UI System Integration
- **Xala v5 Compliance**: Strict enforcement of UI rules
- **WCAG AAA**: Accessibility validation
- **Design Tokens**: Mandatory token usage
- **Localization**: Built-in i18n support

### 🚀 SaaS-First Design
- **Essential Services**: Auth, billing, tenancy built-in
- **Industry Bundles**: FinTech, Healthcare, Marketplace
- **Enterprise Features**: SSO, audit logs, compliance
- **Norwegian Compliance**: BankID, Vipps, NSM

### 🧩 Template Fragment System
- **Composable Fragments**: Reusable template parts
- **Context-Aware**: Smart template generation
- **Framework Support**: React, Vue, Angular, Blazor
- **Type Safety**: Full TypeScript support

## Quick Start

### Installation
```bash
npm install -g @xala-technologies/xaheen
# or
bun add -g @xala-technologies/xaheen
```

### Create a SaaS Application
```bash
# Interactive mode
xaheen create

# Direct preset
xaheen create my-saas --preset saas-b2b

# Custom bundles
xaheen create my-app --bundles auth:enterprise,billing:marketplace
```

### Add Features
```bash
# Add billing to existing project
xaheen add billing --level enterprise

# Add compliance features
xaheen add compliance --profile gdpr

# Add authentication
xaheen add auth --provider bankid
```

## Architecture Highlights

### Service Definition Schema
```typescript
interface ServiceDefinition {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  version: string;
  dependencies: {
    server: string[];
    web: string[];
    dev: string[];
  };
  templates: {
    components?: string[];
    pages?: string[];
    api?: string[];
    services?: string[];
  };
  config: {
    env?: Record<string, string>;
    features?: string[];
    defaults?: Record<string, any>;
  };
}
```

### Bundle Structure
```typescript
interface ServiceBundle {
  id: string;
  name: string;
  description: string;
  type: BundleType;
  services: BundleService[];
  pricing?: {
    tier: string;
    monthlyPrice: string;
  };
  compliance?: string[];
  deployment?: DeploymentConfig;
}
```

## Service Categories

1. **Authentication**: Better Auth, Clerk, Auth0, BankID
2. **Payments**: Stripe, Vipps, Paddle
3. **Database**: PostgreSQL, MySQL, MongoDB
4. **Caching**: Redis, Memcached
5. **Notifications**: Resend, SendGrid, Twilio
6. **Analytics**: PostHog, Mixpanel, Google Analytics
7. **Monitoring**: Sentry, DataDog, New Relic
8. **RBAC**: Casbin, OPA
9. **Messaging**: RabbitMQ, Kafka
10. **Search**: Elasticsearch, Algolia

## Compliance & Security

- **GDPR**: Data protection, consent management
- **WCAG AAA**: Full accessibility compliance
- **NSM**: Norwegian security standards
- **HIPAA**: Healthcare compliance
- **PCI-DSS**: Payment card security
- **SOC2**: Security controls

## Performance

- **Bundle Optimization**: Tree-shaking unused services
- **Parallel Processing**: Multi-threaded operations
- **Caching**: Service and template caching
- **Lazy Loading**: On-demand service loading

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

## License

MIT License - see [LICENSE](../../LICENSE) for details.