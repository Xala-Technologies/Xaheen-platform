# Configuration Documentation

## Overview

The Xaheen CLI provides a comprehensive configuration system that supports multiple configuration sources, environment-specific settings, and Norwegian compliance requirements. The configuration system is designed to be flexible, secure, and enterprise-ready with full support for NSM security standards and GDPR compliance.

## Configuration Hierarchy

The CLI loads configuration from multiple sources in the following priority order (highest to lowest):

1. **Command Line Arguments** - Runtime arguments and flags
2. **Environment Variables** - Environment-specific settings
3. **Local Configuration File** - Project-specific `.xaheen.config.js`
4. **Global Configuration File** - User-wide configuration
5. **Default Configuration** - Built-in default values

## Configuration Files

### Project Configuration (`.xaheen.config.js`)

Create a configuration file in your project root:

```javascript
// .xaheen.config.js
module.exports = {
  // Project identification
  project: {
    name: 'my-project',
    version: '1.0.0',
    type: 'web-application'
  },

  // Default platform and framework
  defaults: {
    platform: 'react',
    framework: 'nextjs',
    language: 'typescript',
    packageManager: 'pnpm'
  },

  // Generation settings
  generation: {
    outputPath: './src',
    templatePath: './templates',
    overwrite: false,
    backup: true
  },

  // Feature flags
  features: {
    typescript: true,
    testing: true,
    linting: true,
    formatting: true,
    accessibility: true,
    internationalization: true,
    analytics: false
  },

  // Norwegian compliance settings
  compliance: {
    nsm: {
      enabled: true,
      classification: 'RESTRICTED',
      auditLevel: 'detailed',
      encryptionRequired: true
    },
    gdpr: {
      enabled: true,
      consentRequired: true,
      dataRetentionPeriod: 365, // days
      rightToErasure: true
    },
    accessibility: {
      enabled: true,
      level: 'AAA',
      testing: true,
      validation: true
    }
  },

  // Template configuration
  templates: {
    customPath: './custom-templates',
    overrides: {
      'react-component': './templates/custom-react-component.hbs'
    },
    helpers: {
      norwegianFormat: './helpers/norwegian-format.js'
    }
  },

  // Service integrations
  services: {
    ai: {
      provider: 'openai',
      model: 'gpt-4',
      maxTokens: 2000,
      temperature: 0.3
    },
    database: {
      type: 'postgresql',
      ssl: true,
      poolSize: 10
    },
    cloud: {
      provider: 'azure',
      region: 'norwayeast'
    }
  },

  // Plugin configuration
  plugins: {
    enabled: true,
    autoLoad: true,
    searchPaths: ['./plugins', '~/.xaheen/plugins'],
    allowedPlugins: ['@xaheen-ai/plugin-*'],
    blockedPlugins: []
  },

  // Development settings
  development: {
    verbose: false,
    debug: false,
    dryRun: false,
    performance: {
      monitoring: true,
      profiling: false
    }
  }
};
```

### Global Configuration (`~/.xaheen/config.json`)

User-wide configuration stored in the user's home directory:

```json
{
  "user": {
    "name": "Developer Name",
    "email": "developer@company.no",
    "organization": "Norwegian Company AS"
  },
  "preferences": {
    "defaultPlatform": "react",
    "defaultFramework": "nextjs",
    "colorOutput": true,
    "progressIndicators": true
  },
  "compliance": {
    "defaultNSMClassification": "RESTRICTED",
    "defaultGDPRSettings": {
      "consentRequired": true,
      "dataRetentionPeriod": 365
    }
  },
  "integrations": {
    "ai": {
      "apiKey": "${OPENAI_API_KEY}",
      "defaultModel": "gpt-4"
    },
    "git": {
      "defaultBranch": "main",
      "commitMessageTemplate": "feat: ${description}\n\n🤖 Generated with Xaheen CLI"
    }
  }
}
```

### Environment-Specific Configuration

Use environment variables for sensitive or environment-specific settings:

```bash
# .env.development
XAHEEN_DEBUG=true
XAHEEN_VERBOSE=true
XAHEEN_DRY_RUN=false

# AI Configuration
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key

# Database Configuration
DATABASE_URL=postgresql://user:pass@localhost:5432/dev_db
DATABASE_SSL=false

# Norwegian Compliance
NSM_CLASSIFICATION=RESTRICTED
GDPR_ENABLED=true
ACCESSIBILITY_LEVEL=AAA

# Cloud Configuration
AZURE_TENANT_ID=your-tenant-id
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret
```

```bash
# .env.production
XAHEEN_DEBUG=false
XAHEEN_VERBOSE=false
XAHEEN_PERFORMANCE_MONITORING=true

# Production Database
DATABASE_URL=postgresql://user:pass@prod-db.norwegiancompany.no:5432/prod_db
DATABASE_SSL=true
DATABASE_POOL_SIZE=20

# NSM Production Settings
NSM_CLASSIFICATION=CONFIDENTIAL
NSM_AUDIT_LEVEL=comprehensive
NSM_ENCRYPTION_REQUIRED=true

# GDPR Production Settings
GDPR_ENABLED=true
GDPR_CONSENT_REQUIRED=true
GDPR_DATA_RETENTION_PERIOD=1095
```

## Configuration Schema

### Core Configuration Types

```typescript
interface XaheenConfig {
  // Project settings
  project: ProjectConfig;
  
  // Default settings
  defaults: DefaultConfig;
  
  // Generation settings
  generation: GenerationConfig;
  
  // Feature flags
  features: FeatureConfig;
  
  // Norwegian compliance
  compliance: ComplianceConfig;
  
  // Template settings
  templates: TemplateConfig;
  
  // Service integrations
  services: ServiceConfig;
  
  // Plugin settings
  plugins: PluginConfig;
  
  // Development settings
  development: DevelopmentConfig;
}
```

### Project Configuration

```typescript
interface ProjectConfig {
  name: string;
  version: string;
  type: ProjectType;
  description?: string;
  repository?: string;
  license?: string;
  author?: string;
}

type ProjectType = 
  | 'web-application'
  | 'mobile-application'
  | 'desktop-application'
  | 'library'
  | 'api-service'
  | 'microservice';
```

### Default Configuration

```typescript
interface DefaultConfig {
  platform: Platform;
  framework?: Framework;
  language: Language;
  packageManager: PackageManager;
  styling?: StylingFramework;
  testing?: TestingFramework;
  linting?: LintingFramework;
}

type Platform = 'react' | 'vue' | 'angular' | 'svelte' | 'nextjs';
type Language = 'typescript' | 'javascript';
type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun';
```

### Generation Configuration

```typescript
interface GenerationConfig {
  outputPath: string;
  templatePath?: string;
  overwrite: boolean;
  backup: boolean;
  dryRun?: boolean;
  parallel?: {
    enabled: boolean;
    maxConcurrency: number;
  };
  validation?: {
    syntax: boolean;
    linting: boolean;
    accessibility: boolean;
    security: boolean;
  };
}
```

### Feature Configuration

```typescript
interface FeatureConfig {
  typescript: boolean;
  testing: boolean;
  linting: boolean;
  formatting: boolean;
  accessibility: boolean;
  internationalization: boolean;
  analytics: boolean;
  documentation: boolean;
  storybook: boolean;
  jest: boolean;
  eslint: boolean;
  prettier: boolean;
}
```

### Norwegian Compliance Configuration

```typescript
interface ComplianceConfig {
  nsm: NSMConfig;
  gdpr: GDPRConfig;
  accessibility: AccessibilityConfig;
}

interface NSMConfig {
  enabled: boolean;
  classification: DataClassification;
  auditLevel: AuditLevel;
  encryptionRequired: boolean;
  accessControl: {
    rbacEnabled: boolean;
    mfaRequired: boolean;
    sessionTimeout: number; // minutes
  };
  monitoring: {
    auditLogging: boolean;
    realTimeMonitoring: boolean;
    alerting: boolean;
  };
}

enum DataClassification {
  OPEN = 'OPEN',
  RESTRICTED = 'RESTRICTED',
  CONFIDENTIAL = 'CONFIDENTIAL',
  SECRET = 'SECRET'
}

enum AuditLevel {
  BASIC = 'basic',
  DETAILED = 'detailed',
  COMPREHENSIVE = 'comprehensive'
}

interface GDPRConfig {
  enabled: boolean;
  consentRequired: boolean;
  dataRetentionPeriod: number; // days
  rightToErasure: boolean;
  dataPortability: boolean;
  privacyByDesign: boolean;
  cookieConsent: {
    required: boolean;
    categories: string[];
  };
  dataProcessing: {
    lawfulBasis: string[];
    dataMinimization: boolean;
    purposeLimitation: boolean;
  };
}

interface AccessibilityConfig {
  enabled: boolean;
  level: AccessibilityLevel;
  testing: boolean;
  validation: boolean;
  screenReaderSupport: boolean;
  keyboardNavigation: boolean;
  colorContrast: boolean;
  alternativeText: boolean;
}

enum AccessibilityLevel {
  A = 'A',
  AA = 'AA',
  AAA = 'AAA'
}
```

### Service Configuration

```typescript
interface ServiceConfig {
  ai?: AIServiceConfig;
  database?: DatabaseConfig;
  cloud?: CloudConfig;
  authentication?: AuthConfig;
  monitoring?: MonitoringConfig;
}

interface AIServiceConfig {
  provider: AIProvider;
  apiKey?: string;
  model: string;
  maxTokens: number;
  temperature: number;
  timeout: number;
  retries: number;
  costOptimization: {
    enabled: boolean;
    maxCostPerRequest: number; // USD
    budgetAlert: number; // USD
  };
}

type AIProvider = 'openai' | 'anthropic' | 'azure' | 'google' | 'local';

interface DatabaseConfig {
  type: DatabaseType;
  connectionString?: string;
  ssl: boolean;
  poolSize: number;
  timeout: number;
  retries: number;
  backup: {
    enabled: boolean;
    schedule: string; // cron format
    retention: number; // days
  };
}

type DatabaseType = 'postgresql' | 'mysql' | 'sqlite' | 'mongodb' | 'redis';

interface CloudConfig {
  provider: CloudProvider;
  region: string;
  credentials?: {
    accessKey?: string;
    secretKey?: string;
    tenantId?: string;
    clientId?: string;
  };
  resources?: {
    compute?: ComputeConfig;
    storage?: StorageConfig;
    network?: NetworkConfig;
  };
}

type CloudProvider = 'azure' | 'aws' | 'gcp' | 'digitalocean';
```

### Template Configuration

```typescript
interface TemplateConfig {
  customPath?: string;
  overrides?: Record<string, string>;
  helpers?: Record<string, string>;
  partials?: Record<string, string>;
  data?: Record<string, any>;
  compilation?: {
    cache: boolean;
    optimization: boolean;
    minification: boolean;
  };
  validation?: {
    syntax: boolean;
    security: boolean;
    accessibility: boolean;
    performance: boolean;
  };
}
```

### Plugin Configuration

```typescript
interface PluginConfig {
  enabled: boolean;
  autoLoad: boolean;
  searchPaths: string[];
  allowedPlugins: string[];
  blockedPlugins: string[];
  security?: {
    sandbox: boolean;
    permissions: PluginPermissions;
    validation: boolean;
  };
  performance?: {
    timeout: number; // milliseconds
    memoryLimit: number; // MB
    cpuLimit: number; // percentage
  };
}

interface PluginPermissions {
  fileSystem?: FileSystemPermissions;
  network?: NetworkPermissions;
  process?: ProcessPermissions;
}
```

## Environment Variables

### Core Environment Variables

```bash
# CLI Behavior
XAHEEN_DEBUG=true|false                    # Enable debug mode
XAHEEN_VERBOSE=true|false                  # Enable verbose output
XAHEEN_DRY_RUN=true|false                 # Enable dry run mode
XAHEEN_CONFIG_PATH=/path/to/config        # Custom config file path
XAHEEN_CACHE_DISABLED=true|false          # Disable caching

# Performance
XAHEEN_MAX_CONCURRENCY=4                  # Maximum parallel operations
XAHEEN_TIMEOUT=30000                      # Operation timeout in milliseconds
XAHEEN_MEMORY_LIMIT=2048                  # Memory limit in MB

# Logging
XAHEEN_LOG_LEVEL=debug|info|warn|error    # Log level
XAHEEN_LOG_FILE=/path/to/log/file         # Log file path
XAHEEN_LOG_FORMAT=json|text               # Log format
```

### Norwegian Compliance Environment Variables

```bash
# NSM Security
NSM_ENABLED=true|false                    # Enable NSM compliance
NSM_CLASSIFICATION=OPEN|RESTRICTED|CONFIDENTIAL|SECRET
NSM_AUDIT_LEVEL=basic|detailed|comprehensive
NSM_ENCRYPTION_REQUIRED=true|false        # Require encryption
NSM_ACCESS_CONTROL=true|false             # Enable access control
NSM_MFA_REQUIRED=true|false              # Require multi-factor auth

# GDPR Compliance
GDPR_ENABLED=true|false                   # Enable GDPR compliance
GDPR_CONSENT_REQUIRED=true|false          # Require user consent
GDPR_DATA_RETENTION_PERIOD=365            # Data retention in days
GDPR_RIGHT_TO_ERASURE=true|false         # Enable right to erasure
GDPR_DATA_PORTABILITY=true|false         # Enable data portability
GDPR_PRIVACY_BY_DESIGN=true|false        # Enable privacy by design

# Accessibility
A11Y_ENABLED=true|false                   # Enable accessibility features
A11Y_LEVEL=A|AA|AAA                      # WCAG compliance level
A11Y_TESTING=true|false                   # Enable accessibility testing
A11Y_VALIDATION=true|false               # Enable accessibility validation
```

### Service Integration Environment Variables

```bash
# AI Services
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=2000
OPENAI_TEMPERATURE=0.3

ANTHROPIC_API_KEY=your-anthropic-api-key
ANTHROPIC_MODEL=claude-3-sonnet-20240229

# Database
DATABASE_URL=postgresql://user:pass@host:port/db
DATABASE_SSL=true|false
DATABASE_POOL_SIZE=10
DATABASE_TIMEOUT=30000

# Azure Cloud
AZURE_TENANT_ID=your-tenant-id
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret
AZURE_SUBSCRIPTION_ID=your-subscription-id
AZURE_REGION=norwayeast

# GitHub
GITHUB_TOKEN=your-github-token
GITHUB_API_URL=https://api.github.com

# Monitoring
MONITORING_ENABLED=true|false
TELEMETRY_ENDPOINT=https://telemetry.yourcompany.no
ANALYTICS_API_KEY=your-analytics-api-key
```

## Configuration Validation

The CLI validates all configuration at startup:

### Validation Rules

```typescript
interface ConfigValidationRules {
  // Required fields
  required: string[];
  
  // Type validation
  types: Record<string, ConfigType>;
  
  // Value constraints
  constraints: Record<string, ValidationConstraint>;
  
  // Norwegian compliance rules
  compliance: ComplianceValidationRules;
  
  // Security rules
  security: SecurityValidationRules;
}

interface ComplianceValidationRules {
  nsm: {
    classificationRequired: boolean;
    auditLevelRequired: boolean;
    encryptionValidation: boolean;
  };
  gdpr: {
    consentValidation: boolean;
    retentionPeriodValidation: boolean;
    lawfulBasisValidation: boolean;
  };
  accessibility: {
    levelValidation: boolean;
    testingValidation: boolean;
  };
}
```

### Validation Commands

```bash
# Validate current configuration
xaheen config validate

# Validate specific configuration file
xaheen config validate --config=./custom-config.js

# Show configuration with validation status
xaheen config show --validate

# Test Norwegian compliance settings
xaheen config test-compliance
```

## Configuration Management

### View Current Configuration

```bash
# Show all configuration
xaheen config show

# Show specific section
xaheen config show compliance
xaheen config show services.ai
xaheen config show templates

# Show configuration sources
xaheen config sources

# Show effective configuration (after merging all sources)
xaheen config effective
```

### Modify Configuration

```bash
# Set configuration value
xaheen config set defaults.platform react
xaheen config set compliance.nsm.classification RESTRICTED

# Unset configuration value
xaheen config unset services.ai.apiKey

# Reset to defaults
xaheen config reset
xaheen config reset compliance
```

### Configuration Profiles

Create and manage configuration profiles for different environments:

```bash
# Create profile
xaheen config profile create development
xaheen config profile create staging
xaheen config profile create production

# Switch profile
xaheen config profile use development

# List profiles
xaheen config profile list

# Delete profile
xaheen config profile delete staging
```

## Security Considerations

### Sensitive Data Handling

1. **API Keys**: Never store API keys in configuration files. Use environment variables or secure vaults.

2. **Database Credentials**: Use connection strings with environment variable substitution:
   ```javascript
   database: {
     connectionString: '${DATABASE_URL}'
   }
   ```

3. **Encryption**: Sensitive configuration can be encrypted:
   ```bash
   # Encrypt configuration
   xaheen config encrypt --file=.xaheen.config.js
   
   # Decrypt configuration
   xaheen config decrypt --file=.xaheen.config.encrypted.js
   ```

### Norwegian Security Standards

All configuration follows NSM security guidelines:

1. **Data Classification**: All data must be properly classified
2. **Access Control**: Configuration access is logged and controlled
3. **Encryption**: Sensitive configuration is encrypted at rest
4. **Audit Trail**: All configuration changes are audited

## Advanced Configuration

### Dynamic Configuration

Configuration can be loaded dynamically:

```javascript
// .xaheen.config.js
module.exports = async () => {
  const environment = process.env.NODE_ENV || 'development';
  
  // Load base configuration
  const baseConfig = require('./config/base.config.js');
  
  // Load environment-specific configuration
  const envConfig = require(`./config/${environment}.config.js`);
  
  // Load secrets from Azure Key Vault (for Norwegian enterprises)
  const secrets = await loadSecretsFromKeyVault();
  
  return {
    ...baseConfig,
    ...envConfig,
    services: {
      ...baseConfig.services,
      ...envConfig.services,
      ai: {
        ...baseConfig.services?.ai,
        ...envConfig.services?.ai,
        apiKey: secrets.OPENAI_API_KEY
      }
    }
  };
};
```

### Configuration Inheritance

```javascript
// base.config.js
module.exports = {
  compliance: {
    accessibility: {
      enabled: true,
      level: 'AA'
    }
  }
};

// production.config.js
module.exports = {
  extends: './base.config.js',
  compliance: {
    accessibility: {
      level: 'AAA', // Override for production
      testing: true
    }
  }
};
```

### Configuration Validation Schemas

```javascript
// config.schema.js
const Joi = require('joi');

module.exports = Joi.object({
  project: Joi.object({
    name: Joi.string().required(),
    version: Joi.string().pattern(/^\d+\.\d+\.\d+$/).required(),
    type: Joi.string().valid('web-application', 'mobile-application', 'library').required()
  }).required(),
  
  compliance: Joi.object({
    nsm: Joi.object({
      enabled: Joi.boolean().required(),
      classification: Joi.string().valid('OPEN', 'RESTRICTED', 'CONFIDENTIAL', 'SECRET').when('enabled', {
        is: true,
        then: Joi.required()
      })
    })
  })
});
```

## Troubleshooting Configuration

### Common Issues

1. **Configuration Not Found**:
   ```bash
   # Check configuration search paths
   xaheen config debug
   
   # Specify custom config path
   xaheen --config=/path/to/config.js command
   ```

2. **Invalid Configuration**:
   ```bash
   # Validate configuration
   xaheen config validate
   
   # Show validation errors
   xaheen config validate --verbose
   ```

3. **Environment Variable Issues**:
   ```bash
   # Show environment variables
   xaheen config env
   
   # Test environment variable resolution
   xaheen config test-env
   ```

4. **Norwegian Compliance Issues**:
   ```bash
   # Test NSM compliance
   xaheen config test-compliance --nsm
   
   # Test GDPR compliance
   xaheen config test-compliance --gdpr
   
   # Test accessibility compliance
   xaheen config test-compliance --accessibility
   ```

### Debug Configuration

```bash
# Enable configuration debugging
DEBUG=xaheen:config xaheen command

# Show configuration loading process
xaheen config debug --trace

# Validate configuration step by step
xaheen config validate --step-by-step
```

---

This configuration system ensures that the Xaheen CLI can be tailored for any Norwegian enterprise environment while maintaining security, compliance, and accessibility standards.