/**
 * Service Environment Schema
 * 
 * Defines environment-specific service configuration and deployment schemas.
 * Supports multi-environment deployments and environment-specific overrides.
 * 
 * @author Backend Expert Agent
 * @since 2025-01-03
 */

import { z } from 'zod';
import { ServiceTypeSchema, ServiceEnvironmentSchema } from './service-definition.schema';

/**
 * Environment tier definitions
 */
export const EnvironmentTierSchema = z.enum([
  'local',
  'development',
  'testing',
  'staging',
  'preview',
  'production',
  'disaster-recovery'
]);

export type EnvironmentTier = z.infer<typeof EnvironmentTierSchema>;

/**
 * Environment security level
 */
export const EnvironmentSecurityLevelSchema = z.enum([
  'development',  // Minimal security for development
  'testing',      // Basic security for testing
  'staging',      // Production-like security
  'production',   // Maximum security
  'enterprise'    // Enterprise-grade security
]);

export type EnvironmentSecurityLevel = z.infer<typeof EnvironmentSecurityLevelSchema>;

/**
 * Environment configuration template
 */
export const EnvironmentConfigTemplateSchema = z.object({
  name: z.string(),
  tier: EnvironmentTierSchema,
  securityLevel: EnvironmentSecurityLevelSchema,
  
  // Environment metadata
  description: z.string().optional(),
  region: z.string().optional(),
  zone: z.string().optional(),
  
  // Infrastructure configuration
  infrastructure: z.object({
    provider: z.enum(['aws', 'gcp', 'azure', 'cloudflare', 'local', 'hybrid']),
    region: z.string().optional(),
    vpc: z.string().optional(),
    subnets: z.array(z.string()).default([]),
    securityGroups: z.array(z.string()).default([])
  }).optional(),
  
  // Resource limits
  resources: z.object({
    cpu: z.object({
      limit: z.string().optional(),
      request: z.string().optional()
    }).optional(),
    memory: z.object({
      limit: z.string().optional(),
      request: z.string().optional()
    }).optional(),
    storage: z.object({
      limit: z.string().optional(),
      type: z.enum(['ssd', 'hdd', 'network']).optional()
    }).optional(),
    network: z.object({
      bandwidth: z.string().optional(),
      ingress: z.boolean().default(true),
      egress: z.boolean().default(true)
    }).optional()
  }).optional(),
  
  // Scaling configuration
  scaling: z.object({
    horizontal: z.object({
      enabled: z.boolean().default(true),
      minReplicas: z.number().min(0).default(1),
      maxReplicas: z.number().min(1).default(10),
      targetCPU: z.number().min(1).max(100).default(70),
      targetMemory: z.number().min(1).max(100).default(80)
    }).optional(),
    vertical: z.object({
      enabled: z.boolean().default(false),
      updateMode: z.enum(['Off', 'Initial', 'Auto']).default('Off')
    }).optional()
  }).optional(),
  
  // Security configuration
  security: z.object({
    encryption: z.object({
      atRest: z.boolean().default(true),
      inTransit: z.boolean().default(true),
      keyRotation: z.boolean().default(true)
    }).optional(),
    networkPolicies: z.array(z.object({
      name: z.string(),
      rules: z.array(z.string())
    })).default([]),
    accessControl: z.object({
      authentication: z.boolean().default(true),
      authorization: z.boolean().default(true),
      rbac: z.boolean().default(true)
    }).optional()
  }).optional(),
  
  // Monitoring and observability
  observability: z.object({
    logging: z.object({
      enabled: z.boolean().default(true),
      level: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
      retention: z.string().default('30d')
    }).optional(),
    metrics: z.object({
      enabled: z.boolean().default(true),
      scrapeInterval: z.string().default('30s'),
      retention: z.string().default('15d')
    }).optional(),
    tracing: z.object({
      enabled: z.boolean().default(false),
      samplingRate: z.number().min(0).max(1).default(0.1)
    }).optional(),
    healthChecks: z.object({
      enabled: z.boolean().default(true),
      interval: z.string().default('30s'),
      timeout: z.string().default('10s')
    }).optional()
  }).optional(),
  
  // Backup and disaster recovery
  backup: z.object({
    enabled: z.boolean().default(true),
    frequency: z.enum(['hourly', 'daily', 'weekly']).default('daily'),
    retention: z.string().default('30d'),
    crossRegion: z.boolean().default(false),
    encryption: z.boolean().default(true)
  }).optional(),
  
  // Environment-specific overrides
  overrides: z.record(z.unknown()).default({})
});

export type EnvironmentConfigTemplate = z.infer<typeof EnvironmentConfigTemplateSchema>;

/**
 * Service environment configuration
 */
export const ServiceEnvironmentConfigSchema = z.object({
  serviceType: ServiceTypeSchema,
  provider: z.string(),
  environment: EnvironmentTierSchema,
  
  // Service-specific environment config
  config: z.record(z.unknown()).default({}),
  
  // Environment variables
  envVars: z.record(z.object({
    value: z.string(),
    secret: z.boolean().default(false),
    required: z.boolean().default(true),
    description: z.string().optional()
  })).default({}),
  
  // Resource allocation
  resources: z.object({
    cpu: z.string().optional(),
    memory: z.string().optional(),
    storage: z.string().optional(),
    replicas: z.number().min(0).optional()
  }).optional(),
  
  // Health and monitoring
  health: z.object({
    endpoint: z.string().optional(),
    timeout: z.number().default(5000),
    interval: z.number().default(30000),
    retries: z.number().min(0).max(10).default(3)
  }).optional(),
  
  // Dependencies specific to environment
  dependencies: z.array(z.object({
    serviceType: ServiceTypeSchema,
    provider: z.string(),
    version: z.string().optional(),
    environment: EnvironmentTierSchema.optional()
  })).default([]),
  
  // Feature flags
  features: z.record(z.boolean()).default({}),
  
  // Configuration metadata
  version: z.string().default('1.0.0'),
  lastUpdated: z.date(),
  updatedBy: z.string().optional()
});

export type ServiceEnvironmentConfig = z.infer<typeof ServiceEnvironmentConfigSchema>;

/**
 * Environment deployment strategy
 */
export const EnvironmentDeploymentStrategySchema = z.object({
  name: z.string(),
  environment: EnvironmentTierSchema,
  
  // Deployment strategy
  strategy: z.enum([
    'blue-green',
    'canary',
    'rolling',
    'recreate',
    'ramped'
  ]).default('rolling'),
  
  // Strategy configuration
  config: z.object({
    // Blue-green specific
    switchThreshold: z.number().min(0).max(100).optional(),
    
    // Canary specific
    canaryPercentage: z.number().min(0).max(100).optional(),
    canaryDuration: z.string().optional(),
    
    // Rolling specific
    maxSurge: z.string().optional(),
    maxUnavailable: z.string().optional(),
    
    // General
    timeout: z.string().default('10m'),
    rollbackOnFailure: z.boolean().default(true)
  }).optional(),
  
  // Pre and post deployment steps
  preDeployment: z.array(z.object({
    name: z.string(),
    command: z.string(),
    timeout: z.number().default(300000),
    continueOnError: z.boolean().default(false)
  })).default([]),
  
  postDeployment: z.array(z.object({
    name: z.string(),
    command: z.string(),
    timeout: z.number().default(300000),
    continueOnError: z.boolean().default(false)
  })).default([]),
  
  // Validation steps
  validation: z.array(z.object({
    name: z.string(),
    type: z.enum(['http', 'tcp', 'command', 'custom']),
    config: z.record(z.unknown()),
    timeout: z.number().default(30000),
    retries: z.number().min(0).max(10).default(3)
  })).default([]),
  
  // Rollback configuration
  rollback: z.object({
    enabled: z.boolean().default(true),
    automatic: z.boolean().default(true),
    conditions: z.array(z.enum([
      'health-check-failure',
      'deployment-timeout',
      'validation-failure',
      'manual-trigger'
    ])).default(['health-check-failure', 'deployment-timeout'])
  }).optional()
});

export type EnvironmentDeploymentStrategy = z.infer<typeof EnvironmentDeploymentStrategySchema>;

/**
 * Environment promotion pipeline
 */
export const EnvironmentPromotionPipelineSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  
  // Pipeline stages
  stages: z.array(z.object({
    name: z.string(),
    environment: EnvironmentTierSchema,
    order: z.number().min(0),
    
    // Stage requirements
    requirements: z.array(z.object({
      type: z.enum(['approval', 'test', 'security-scan', 'performance-test']),
      config: z.record(z.unknown()).default({})
    })).default([]),
    
    // Deployment strategy for this stage
    deploymentStrategy: z.string().optional(), // Reference to strategy name
    
    // Stage configuration
    autoPromote: z.boolean().default(false),
    parallelExecution: z.boolean().default(false),
    rollbackOnFailure: z.boolean().default(true)
  })).min(1),
  
  // Pipeline triggers
  triggers: z.array(z.object({
    type: z.enum(['push', 'schedule', 'manual', 'webhook']),
    config: z.record(z.unknown()).default({})
  })).default([]),
  
  // Pipeline metadata
  version: z.string().default('1.0.0'),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  createdBy: z.string().optional()
});

export type EnvironmentPromotionPipeline = z.infer<typeof EnvironmentPromotionPipelineSchema>;

/**
 * Environment compliance requirements
 */
export const EnvironmentComplianceSchema = z.object({
  environment: EnvironmentTierSchema,
  
  // Compliance standards
  standards: z.array(z.enum([
    'gdpr',
    'hipaa',
    'pci-dss',
    'soc2',
    'iso27001',
    'nsm',
    'ccpa',
    'fisma'
  ])).default([]),
  
  // Data requirements
  dataRequirements: z.object({
    dataResidency: z.array(z.string()).default([]), // Country codes
    dataClassification: z.enum(['public', 'internal', 'confidential', 'restricted']).optional(),
    retentionPeriod: z.string().optional(),
    anonymization: z.boolean().default(false)
  }).optional(),
  
  // Security requirements
  securityRequirements: z.object({
    encryption: z.object({
      level: z.enum(['basic', 'advanced', 'enterprise']).default('basic'),
      algorithms: z.array(z.string()).default([]),
      keyManagement: z.enum(['platform', 'customer', 'hybrid']).default('platform')
    }).optional(),
    
    access: z.object({
      mfa: z.boolean().default(false),
      sso: z.boolean().default(false),
      rbac: z.boolean().default(true),
      audit: z.boolean().default(true)
    }).optional(),
    
    network: z.object({
      isolation: z.boolean().default(false),
      vpn: z.boolean().default(false),
      whitelist: z.array(z.string()).default([])
    }).optional()
  }).optional(),
  
  // Audit requirements
  auditRequirements: z.object({
    logging: z.object({
      level: z.enum(['basic', 'detailed', 'comprehensive']).default('basic'),
      retention: z.string().default('1y'),
      realTime: z.boolean().default(false)
    }).optional(),
    
    monitoring: z.object({
      continuous: z.boolean().default(false),
      alerting: z.boolean().default(true),
      reporting: z.enum(['weekly', 'monthly', 'quarterly']).default('monthly')
    }).optional()
  }).optional()
});

export type EnvironmentCompliance = z.infer<typeof EnvironmentComplianceSchema>;

/**
 * Comprehensive environment management
 */
export const EnvironmentManagementSchema = z.object({
  // Environment definitions
  environments: z.array(EnvironmentConfigTemplateSchema),
  
  // Service environment configurations
  serviceConfigs: z.array(ServiceEnvironmentConfigSchema),
  
  // Deployment strategies
  deploymentStrategies: z.array(EnvironmentDeploymentStrategySchema),
  
  // Promotion pipelines
  promotionPipelines: z.array(EnvironmentPromotionPipelineSchema),
  
  // Compliance configurations
  compliance: z.array(EnvironmentComplianceSchema),
  
  // Global settings
  globalSettings: z.object({
    defaultEnvironment: EnvironmentTierSchema.default('development'),
    autoPromotion: z.boolean().default(false),
    rollbackOnFailure: z.boolean().default(true),
    maxEnvironments: z.number().min(1).default(10)
  }).optional(),
  
  // Management metadata
  version: z.string().default('1.0.0'),
  lastUpdated: z.date(),
  managedBy: z.string().optional()
});

export type EnvironmentManagement = z.infer<typeof EnvironmentManagementSchema>;