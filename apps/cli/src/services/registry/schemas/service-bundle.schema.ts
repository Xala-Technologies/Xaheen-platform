/**
 * Service Bundle Schema
 * 
 * Defines service bundle structures for predefined service combinations.
 * Supports SaaS preset bundles and enterprise service collections.
 * 
 * @author Backend Expert Agent
 * @since 2025-01-03
 */

import { z } from 'zod';
import { ServiceTypeSchema, ServiceEnvironmentSchema, ServiceConfigSchema } from './service-definition.schema';

/**
 * Bundle types for different use cases
 */
export const BundleTypeSchema = z.enum([
  'saas-starter',
  'saas-enterprise',
  'e-commerce',
  'marketplace',
  'fintech',
  'healthcare',
  'education',
  'media',
  'iot',
  'analytics',
  'ai-platform',
  'custom'
]);

export type BundleType = z.infer<typeof BundleTypeSchema>;

/**
 * Bundle deployment target
 */
export const BundleDeploymentTargetSchema = z.enum([
  'cloud-native',
  'kubernetes',
  'docker',
  'serverless',
  'edge',
  'hybrid',
  'on-premise'
]);

export type BundleDeploymentTarget = z.infer<typeof BundleDeploymentTargetSchema>;

/**
 * Bundle service reference with configuration
 */
export const BundleServiceReferenceSchema = z.object({
  serviceType: ServiceTypeSchema,
  provider: z.string(),
  version: z.string().optional(),
  required: z.boolean().default(true),
  priority: z.number().min(1).max(100).default(50),
  config: z.record(z.string(), z.any()).default({}),
  environment: z.array(ServiceEnvironmentSchema).optional(),
  conditionalInclusion: z.string().optional(), // Handlebars condition
  alternatives: z.array(z.object({
    provider: z.string(),
    version: z.string().optional(),
    condition: z.string().optional()
  })).default([])
});

export type BundleServiceReference = z.infer<typeof BundleServiceReferenceSchema>;

/**
 * Bundle configuration template
 */
export const BundleConfigurationTemplateSchema = z.object({
  name: z.string(),
  description: z.string(),
  type: z.enum(['environment', 'feature', 'scaling', 'compliance']),
  required: z.boolean().default(false),
  defaultValue: z.unknown(),
  validation: z.object({
    type: z.enum(['string', 'number', 'boolean', 'array', 'object']),
    pattern: z.string().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    enum: z.array(z.unknown()).optional()
  }).optional(),
  dependencies: z.array(z.string()).default([]), // Other config names this depends on
  affects: z.array(z.string()).default([]) // Service types this config affects
});

export type BundleConfigurationTemplate = z.infer<typeof BundleConfigurationTemplateSchema>;

/**
 * Bundle resource requirements
 */
export const BundleResourceRequirementsSchema = z.object({
  minimum: z.object({
    cpu: z.string().optional(), // e.g., "100m", "0.5"
    memory: z.string().optional(), // e.g., "128Mi", "1Gi"
    storage: z.string().optional(), // e.g., "1Gi", "10Gi"
    network: z.string().optional() // e.g., "100Mbps"
  }).optional(),
  recommended: z.object({
    cpu: z.string().optional(),
    memory: z.string().optional(),
    storage: z.string().optional(),
    network: z.string().optional()
  }).optional(),
  scaling: z.object({
    horizontal: z.object({
      enabled: z.boolean().default(true),
      minReplicas: z.number().min(1).default(1),
      maxReplicas: z.number().min(1).default(10),
      targetCPU: z.number().min(1).max(100).optional(),
      targetMemory: z.number().min(1).max(100).optional()
    }).optional(),
    vertical: z.object({
      enabled: z.boolean().default(false),
      cpuPolicy: z.enum(['Off', 'Initial', 'Auto']).default('Off'),
      memoryPolicy: z.enum(['Off', 'Initial', 'Auto']).default('Off')
    }).optional()
  }).optional()
});

export type BundleResourceRequirements = z.infer<typeof BundleResourceRequirementsSchema>;

/**
 * Bundle compliance requirements
 */
export const BundleComplianceRequirementsSchema = z.object({
  standards: z.array(z.enum(['gdpr', 'hipaa', 'pci-dss', 'soc2', 'iso27001', 'nsm', 'ccpa'])).default([]),
  dataResidency: z.array(z.string()).default([]), // Country codes
  encryption: z.object({
    atRest: z.boolean().default(true),
    inTransit: z.boolean().default(true),
    keyManagement: z.enum(['platform', 'customer', 'hybrid']).default('platform')
  }).optional(),
  audit: z.object({
    required: z.boolean().default(false),
    retention: z.string().optional(), // e.g., "7y", "90d"
    realTime: z.boolean().default(false)
  }).optional(),
  backup: z.object({
    required: z.boolean().default(true),
    frequency: z.string().optional(), // e.g., "daily", "hourly"
    retention: z.string().optional(),
    encryption: z.boolean().default(true),
    crossRegion: z.boolean().default(false)
  }).optional()
});

export type BundleComplianceRequirements = z.infer<typeof BundleComplianceRequirementsSchema>;

/**
 * Bundle monetization configuration
 */
export const BundleMonetizationConfigSchema = z.object({
  model: z.enum(['free', 'freemium', 'subscription', 'usage-based', 'enterprise']),
  billing: z.object({
    currency: z.string().default('USD'),
    cycles: z.array(z.enum(['monthly', 'quarterly', 'annual'])).default(['monthly']),
    trial: z.object({
      enabled: z.boolean().default(false),
      duration: z.number().optional(), // days
      features: z.array(z.string()).default([])
    }).optional()
  }).optional(),
  limits: z.object({
    users: z.number().optional(),
    requests: z.number().optional(),
    storage: z.string().optional(),
    bandwidth: z.string().optional(),
    features: z.array(z.string()).default([])
  }).optional(),
  metrics: z.array(z.object({
    name: z.string(),
    unit: z.string(),
    price: z.number().min(0)
  })).default([])
});

export type BundleMonetizationConfig = z.infer<typeof BundleMonetizationConfigSchema>;

/**
 * Comprehensive service bundle definition
 */
export const ServiceBundleSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  displayName: z.string().min(1).max(150),
  description: z.string().min(1),
  version: z.string(),
  type: BundleTypeSchema,
  category: z.string().optional(),
  subcategory: z.string().optional(),
  
  // Bundle metadata
  author: z.string().optional(),
  license: z.string().default('MIT'),
  homepage: z.string().url().optional(),
  repository: z.string().url().optional(),
  keywords: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  
  // Services and dependencies
  services: z.array(BundleServiceReferenceSchema),
  optionalServices: z.array(BundleServiceReferenceSchema).default([]),
  excludedServices: z.array(z.string()).default([]), // Service types to exclude
  
  // Configuration and customization
  configurationTemplate: z.array(BundleConfigurationTemplateSchema).default([]),
  customizationPoints: z.array(z.object({
    name: z.string(),
    description: z.string(),
    type: z.enum(['service-selection', 'configuration', 'template']),
    options: z.array(z.object({
      name: z.string(),
      value: z.unknown(),
      description: z.string().optional()
    })).default([])
  })).default([]),
  
  // Deployment and infrastructure
  deploymentTargets: z.array(BundleDeploymentTargetSchema).default(['cloud-native']),
  resourceRequirements: BundleResourceRequirementsSchema.optional(),
  
  // Compliance and governance
  complianceRequirements: BundleComplianceRequirementsSchema.optional(),
  
  // Business and monetization
  monetization: BundleMonetizationConfigSchema.optional(),
  
  // Prerequisites and compatibility
  prerequisites: z.object({
    frameworks: z.array(z.string()).default([]),
    databases: z.array(z.string()).default([]),
    platforms: z.array(z.string()).default([]),
    minNodeVersion: z.string().optional(),
    minMemory: z.string().optional(),
    minCPU: z.string().optional()
  }).optional(),
  
  // Bundle lifecycle
  maturity: z.enum(['alpha', 'beta', 'stable', 'deprecated']).default('stable'),
  supportLevel: z.enum(['community', 'commercial', 'enterprise']).default('community'),
  
  // Post-installation configuration
  postInstallation: z.object({
    steps: z.array(z.object({
      name: z.string(),
      description: z.string(),
      command: z.string().optional(),
      manual: z.boolean().default(false),
      order: z.number().default(0)
    })).default([]),
    verification: z.array(z.object({
      name: z.string(),
      command: z.string(),
      expectedOutput: z.string().optional(),
      timeout: z.number().default(30000)
    })).default([])
  }).optional(),
  
  // Documentation and examples
  documentation: z.object({
    quickStart: z.string().optional(),
    setup: z.string().optional(),
    configuration: z.string().optional(),
    examples: z.array(z.object({
      name: z.string(),
      description: z.string(),
      path: z.string()
    })).default([]),
    troubleshooting: z.string().optional()
  }).optional(),
  
  // Analytics and metrics
  analytics: z.object({
    usageCount: z.number().min(0).default(0),
    successRate: z.number().min(0).max(100).default(100),
    averageSetupTime: z.number().min(0).optional(),
    userRating: z.number().min(1).max(5).optional(),
    lastUsed: z.date().optional()
  }).optional(),
  
  // Versioning and changelog
  changelog: z.string().optional(),
  migrationGuides: z.array(z.object({
    fromVersion: z.string(),
    toVersion: z.string(),
    guide: z.string(),
    automated: z.boolean().default(false)
  })).default([]),
  
  // Bundle creation metadata
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional()
});

export type ServiceBundle = z.infer<typeof ServiceBundleSchema>;

/**
 * Bundle resolution result
 */
export const BundleResolutionResultSchema = z.object({
  bundleId: z.string(),
  resolved: z.boolean(),
  services: z.array(ServiceConfigSchema),
  conflicts: z.array(z.object({
    type: z.string(),
    message: z.string(),
    severity: z.enum(['error', 'warning', 'info'])
  })).default([]),
  missingDependencies: z.array(z.string()).default([]),
  recommendations: z.array(z.string()).default([]),
  estimatedSetupTime: z.number().optional(), // in minutes
  estimatedCost: z.object({
    setup: z.number().optional(),
    monthly: z.number().optional(),
    currency: z.string().default('USD')
  }).optional()
});

export type BundleResolutionResult = z.infer<typeof BundleResolutionResultSchema>;

/**
 * Bundle collection for managing multiple bundles
 */
export const BundleCollectionSchema = z.object({
  bundles: z.array(ServiceBundleSchema),
  categories: z.array(z.object({
    name: z.string(),
    description: z.string(),
    bundles: z.array(z.string()) // Bundle IDs
  })).default([]),
  featured: z.array(z.string()).default([]), // Featured bundle IDs
  popular: z.array(z.string()).default([]), // Popular bundle IDs
  recent: z.array(z.string()).default([]), // Recently updated bundle IDs
  totalCount: z.number().min(0),
  lastUpdated: z.date(),
  version: z.string().default('1.0.0')
});

export type BundleCollection = z.infer<typeof BundleCollectionSchema>;

/**
 * Bundle Resolution Schemas for the Bundle Resolver
 */

// Bundle resolution options
export const BundleResolutionOptionsSchema = z.object({
  targetFramework: z.string().optional(),
  targetPlatform: z.string().optional(),
  environment: z.enum(['development', 'staging', 'production']).optional(),
  region: z.string().optional(),
  userConfig: z.record(z.string(), z.any()).optional(),
  enableOptionalServices: z.boolean().default(true),
  validateCompatibility: z.boolean().default(true),
  resolveAllDependencies: z.boolean().default(true)
});

export type BundleResolutionOptions = z.infer<typeof BundleResolutionOptionsSchema>;

// Service configuration after resolution
export const ServiceConfigurationSchema = z.object({
  serviceId: z.string(),
  serviceType: ServiceTypeSchema,
  provider: z.string(),
  version: z.string(),
  required: z.boolean(),
  priority: z.number(),
  configuration: z.record(z.string(), z.any()),
  environmentVariables: z.array(z.object({
    name: z.string(),
    description: z.string(),
    required: z.boolean().default(false),
    defaultValue: z.string().optional(),
    type: z.enum(['string', 'number', 'boolean', 'url', 'secret', 'json', 'array']).default('string'),
    sensitive: z.boolean().default(false)
  })),
  dependencies: z.array(z.object({
    dependentService: z.string(),
    requiredService: z.string(),
    requiredProvider: z.string(),
    requiredVersion: z.string().optional(),
    relationship: z.enum(['requires', 'depends-on', 'optional', 'conflicts']).default('requires')
  })),
  postInstallSteps: z.array(z.object({
    name: z.string(),
    description: z.string(),
    command: z.string().optional(),
    manual: z.boolean().optional(),
    order: z.number()
  })),
  verificationSteps: z.array(z.object({
    name: z.string(),
    command: z.string(),
    timeout: z.number().optional()
  }))
});

export type ServiceConfiguration = z.infer<typeof ServiceConfigurationSchema>;

// Service dependency definition for resolution
export const ServiceDependencySchema = z.object({
  dependentService: z.string(),
  requiredService: z.string(),
  requiredProvider: z.string(),
  requiredVersion: z.string().optional(),
  relationship: z.enum(['requires', 'depends-on', 'optional', 'conflicts']).default('requires')
});

export type ServiceDependency = z.infer<typeof ServiceDependencySchema>;

// Enhanced bundle resolution result
export const EnhancedBundleResolutionResultSchema = z.object({
  bundleId: z.string(),
  bundleName: z.string(),
  bundleVersion: z.string(),
  status: z.enum(['success', 'warning', 'failed']),
  resolvedServices: z.array(ServiceConfigurationSchema),
  dependencies: z.array(ServiceDependencySchema),
  configuration: z.record(z.string(), z.any()),
  deploymentInstructions: z.array(z.string()),
  postInstallSteps: z.array(z.object({
    name: z.string(),
    description: z.string(),
    command: z.string().optional(),
    manual: z.boolean().optional(),
    order: z.number()
  })),
  verificationSteps: z.array(z.object({
    name: z.string(),
    command: z.string(),
    timeout: z.number().optional()
  })),
  errors: z.array(z.string()),
  warnings: z.array(z.string()),
  resolutionTime: z.number(),
  resolvedAt: z.date()
});

export type EnhancedBundleResolutionResult = z.infer<typeof EnhancedBundleResolutionResultSchema>;