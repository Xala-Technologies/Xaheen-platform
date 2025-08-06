# Service Registry System

## Overview

The Service Registry is the central component that manages all service definitions, their metadata, and relationships. It provides a type-safe, extensible system for defining and managing services.

## Core Components

### Service Definition Schema

```typescript
interface ServiceDefinition {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  version: string;
  author?: string;
  license?: string;
  homepage?: string;
  repository?: string;
  
  dependencies: {
    server: string[];
    web: string[];
    dev: string[];
    peer?: string[];
  };
  
  templates: {
    components?: string[];
    pages?: string[];
    api?: string[];
    middleware?: string[];
    services?: string[];
    hooks?: string[];
  };
  
  config: {
    env?: Record<string, {
      name: string;
      description: string;
      required: boolean;
      default?: string;
      secret?: boolean;
    }>;
    features?: string[];
    defaults?: Record<string, any>;
    options?: ServiceOptions;
  };
  
  compatibility?: {
    frameworks?: string[];
    platforms?: string[];
    nodejs?: string;
    browsers?: string[];
  };
  
  compliance?: {
    standards?: string[];
    certifications?: string[];
    dataResidency?: string[];
  };
}
```

### Service Categories

```typescript
type ServiceCategory = 
  | 'auth'
  | 'payment'
  | 'database'
  | 'cache'
  | 'notification'
  | 'analytics'
  | 'monitoring'
  | 'search'
  | 'messaging'
  | 'storage'
  | 'cdn'
  | 'security'
  | 'rbac'
  | 'cms'
  | 'i18n'
  | 'testing'
  | 'devops'
  | 'ai';
```

## Service Examples

### Authentication Service (Better Auth)

```json
{
  "id": "better-auth",
  "name": "Better Auth",
  "category": "auth",
  "description": "Modern authentication library with built-in adapters",
  "version": "1.0.0",
  "dependencies": {
    "server": ["better-auth", "@better-auth/node"],
    "web": ["@better-auth/react"],
    "dev": ["@types/better-auth"]
  },
  "templates": {
    "components": ["sign-in", "sign-up", "user-menu", "auth-guard"],
    "api": ["auth-handler", "session-handler"],
    "middleware": ["auth-middleware", "rbac-middleware"],
    "services": ["auth-service", "user-service"]
  },
  "config": {
    "env": {
      "AUTH_SECRET": {
        "name": "AUTH_SECRET",
        "description": "Secret key for JWT signing",
        "required": true,
        "secret": true
      },
      "AUTH_URL": {
        "name": "AUTH_URL",
        "description": "Authentication URL",
        "required": true,
        "default": "http://localhost:3000"
      }
    },
    "features": ["email-auth", "oauth", "mfa", "magic-links", "passkeys"]
  }
}
```

### Payment Service (Stripe)

```json
{
  "id": "stripe",
  "name": "Stripe",
  "category": "payment",
  "description": "Full-featured payment processing platform",
  "version": "2.0.0",
  "dependencies": {
    "server": ["stripe"],
    "web": ["@stripe/stripe-js", "@stripe/react-stripe-js"],
    "dev": ["@types/stripe"]
  },
  "templates": {
    "components": ["checkout-form", "pricing-table", "subscription-manager"],
    "api": ["webhook-handler", "payment-intent", "subscription-api"],
    "services": ["billing-service", "subscription-service", "invoice-service"]
  },
  "config": {
    "env": {
      "STRIPE_SECRET_KEY": {
        "name": "STRIPE_SECRET_KEY",
        "description": "Stripe secret API key",
        "required": true,
        "secret": true
      },
      "STRIPE_PUBLISHABLE_KEY": {
        "name": "STRIPE_PUBLISHABLE_KEY",
        "description": "Stripe publishable key",
        "required": true
      },
      "STRIPE_WEBHOOK_SECRET": {
        "name": "STRIPE_WEBHOOK_SECRET",
        "description": "Stripe webhook endpoint secret",
        "required": true,
        "secret": true
      }
    },
    "features": ["subscriptions", "one-time-payments", "connect", "billing-portal", "tax"]
  }
}
```

## Service Registry API

### Initialization

```typescript
const registry = new EnhancedServiceRegistry();
await registry.initialize();
```

### Service Operations

```typescript
// Get a service
const authService = await registry.getTemplate('auth', 'better-auth');

// Register a custom service
await registry.registerTemplate({
  category: 'custom',
  id: 'my-service',
  // ... service definition
});

// Update service metadata
await registry.updateMetadata('auth', 'better-auth', {
  lastUsed: new Date(),
  usageCount: 42
});

// List all services in a category
const authServices = await registry.listTemplates('auth');

// Search services
const results = await registry.searchTemplates({
  query: 'norwegian',
  categories: ['auth', 'payment']
});
```

### Event Handling

```typescript
// Listen to registry events
registry.on('template:registered', (template) => {
  console.log('New service registered:', template.id);
});

registry.on('template:updated', (template) => {
  console.log('Service updated:', template.id);
});

registry.on('metadata:updated', (category, id, metadata) => {
  console.log('Metadata updated:', { category, id, metadata });
});
```

## Service Metadata

The registry tracks comprehensive metadata for each service:

```typescript
interface ServiceMetadata {
  // Usage statistics
  usageCount: number;
  lastUsed: Date;
  firstUsed: Date;
  
  // Installation info
  installations: {
    projectId: string;
    installedAt: Date;
    version: string;
  }[];
  
  // Performance metrics
  averageInstallTime: number;
  successRate: number;
  
  // User feedback
  rating?: number;
  reviews?: Review[];
  
  // Health status
  status: 'active' | 'deprecated' | 'experimental';
  healthScore: number;
  lastHealthCheck: Date;
}
```

## Service Validation

All services are validated against the schema:

```typescript
const validator = new ServiceValidator();

// Validate a service definition
const result = validator.validateService(serviceDefinition);
if (!result.valid) {
  console.error('Validation errors:', result.errors);
}

// Validate dependencies
const depResult = validator.validateDependencies(service.dependencies);

// Validate compatibility
const compatResult = validator.validateCompatibility(service, projectConfig);
```

## Service Discovery

The registry supports multiple discovery mechanisms:

### 1. File-Based Discovery

```typescript
// Scan directory for service definitions
await registry.discoverServices('./services/definitions');
```

### 2. Remote Registry

```typescript
// Connect to remote registry
await registry.connectRemote('https://registry.xaheen.dev');

// Sync services
await registry.syncRemoteServices();
```

### 3. Plugin Discovery

```typescript
// Register plugin loader
registry.registerPlugin('npm-plugin-loader', {
  prefix: '@xaheen-ai/service-'
});
```

## Service Lifecycle Hooks

Services can define lifecycle hooks:

```typescript
interface ServiceLifecycle {
  // Pre-installation
  preInstall?: (context: InstallContext) => Promise<void>;
  
  // Post-installation
  postInstall?: (context: InstallContext) => Promise<void>;
  
  // Configuration
  configure?: (config: ServiceConfig) => Promise<ServiceConfig>;
  
  // Validation
  validate?: (project: ProjectConfig) => Promise<ValidationResult>;
  
  // Cleanup
  uninstall?: (context: UninstallContext) => Promise<void>;
}
```

## Service Relationships

### Dependencies

```typescript
// Resolve service dependencies
const dependencies = await registry.resolveDependencies('stripe');
// Returns: ['database', 'cache', 'queue']

// Get dependency tree
const tree = await registry.getDependencyTree('stripe');
// Returns nested dependency structure
```

### Conflicts

```typescript
// Check for conflicts
const conflicts = await registry.checkConflicts(['auth0', 'clerk']);
// Returns: [{ service1: 'auth0', service2: 'clerk', reason: 'Multiple auth providers' }]
```

### Recommendations

```typescript
// Get service recommendations
const recommendations = await registry.getRecommendations({
  services: ['stripe'],
  projectType: 'saas'
});
// Returns: ['redis', 'bullmq', 'sentry']
```

## Performance Optimization

### Caching

```typescript
// Enable caching
registry.enableCache({
  ttl: 3600, // 1 hour
  maxSize: 100 // Max cached services
});

// Clear cache
registry.clearCache();
```

### Lazy Loading

```typescript
// Services are loaded on-demand
const service = await registry.getTemplate('auth', 'better-auth');
// Only loads when requested
```

### Indexing

```typescript
// Build search index
await registry.buildSearchIndex();

// Query index
const results = await registry.searchIndex('payment norwegian');
```

## Best Practices

1. **Version Management**: Always specify service versions
2. **Dependency Pinning**: Pin critical dependencies
3. **Environment Variables**: Use descriptive env var names
4. **Template Organization**: Group related templates
5. **Metadata Tracking**: Update usage statistics
6. **Error Handling**: Implement proper error handling
7. **Validation**: Validate all service definitions
8. **Documentation**: Document all custom services

## Extending the Registry

### Custom Service Types

```typescript
// Register custom service type
registry.registerServiceType('blockchain', {
  validator: blockchainValidator,
  loader: blockchainLoader,
  templates: blockchainTemplates
});
```

### Custom Validators

```typescript
// Add custom validation rule
registry.addValidationRule('norwegian-compliance', (service) => {
  return service.compliance?.standards?.includes('NSM');
});
```

### Registry Plugins

```typescript
// Create registry plugin
const myPlugin: RegistryPlugin = {
  name: 'my-plugin',
  version: '1.0.0',
  
  async onRegister(registry) {
    // Plugin initialization
  },
  
  async onServiceLoad(service) {
    // Modify service on load
    return service;
  }
};

registry.use(myPlugin);
```