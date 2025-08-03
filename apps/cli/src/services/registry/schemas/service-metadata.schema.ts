/**
 * Service Metadata Schema
 * 
 * Defines metadata structures for service tracking, versioning, and management.
 * Supports enterprise-grade service lifecycle management and analytics.
 * 
 * @author Backend Expert Agent
 * @since 2025-01-03
 */

import { z } from 'zod';
import { ServiceTypeSchema, ServiceEnvironmentSchema, ServicePrioritySchema } from './service-definition.schema';

/**
 * Service usage analytics schema
 */
export const ServiceUsageAnalyticsSchema = z.object({
  serviceId: z.string(),
  usageCount: z.number().min(0).default(0),
  lastUsed: z.date().optional(),
  popularityScore: z.number().min(0).max(100).default(0),
  successRate: z.number().min(0).max(100).default(100),
  averageSetupTime: z.number().min(0).optional(), // in milliseconds
  userRating: z.number().min(1).max(5).optional(),
  issues: z.array(z.object({
    type: z.enum(['bug', 'performance', 'compatibility', 'documentation']),
    count: z.number().min(0),
    lastReported: z.date()
  })).default([])
});

export type ServiceUsageAnalytics = z.infer<typeof ServiceUsageAnalyticsSchema>;

/**
 * Service version information
 */
export const ServiceVersionInfoSchema = z.object({
  current: z.string(),
  latest: z.string().optional(),
  deprecated: z.boolean().default(false),
  changelog: z.string().optional(),
  migrationGuide: z.string().optional(),
  breakingChanges: z.array(z.string()).default([]),
  releaseDate: z.date().optional(),
  endOfLife: z.date().optional()
});

export type ServiceVersionInfo = z.infer<typeof ServiceVersionInfoSchema>;

/**
 * Service health and status information
 */
export const ServiceHealthStatusSchema = z.object({
  status: z.enum(['healthy', 'warning', 'error', 'unknown']).default('unknown'),
  lastHealthCheck: z.date().optional(),
  uptime: z.number().min(0).optional(), // in milliseconds
  responseTime: z.number().min(0).optional(), // in milliseconds
  errorRate: z.number().min(0).max(100).default(0),
  memoryUsage: z.number().min(0).optional(), // in MB
  cpuUsage: z.number().min(0).max(100).optional(),
  diskUsage: z.number().min(0).optional(), // in MB
  networkLatency: z.number().min(0).optional(), // in milliseconds
  checks: z.array(z.object({
    name: z.string(),
    status: z.enum(['pass', 'fail', 'warn']),
    message: z.string().optional(),
    checkedAt: z.date()
  })).default([])
});

export type ServiceHealthStatus = z.infer<typeof ServiceHealthStatusSchema>;

/**
 * Service configuration validation result
 */
export const ServiceConfigValidationSchema = z.object({
  valid: z.boolean(),
  errors: z.array(z.object({
    field: z.string(),
    message: z.string(),
    severity: z.enum(['error', 'warning', 'info']).default('error')
  })).default([]),
  warnings: z.array(z.string()).default([]),
  suggestions: z.array(z.string()).default([]),
  validatedAt: z.date(),
  validator: z.string().optional()
});

export type ServiceConfigValidation = z.infer<typeof ServiceConfigValidationSchema>;

/**
 * Service dependency resolution metadata
 */
export const ServiceDependencyResolutionSchema = z.object({
  serviceId: z.string(),
  dependencies: z.array(z.object({
    serviceId: z.string(),
    type: ServiceTypeSchema,
    provider: z.string(),
    version: z.string(),
    required: z.boolean(),
    satisfied: z.boolean(),
    reason: z.string().optional()
  })).default([]),
  conflicts: z.array(z.object({
    conflictingServices: z.array(z.string()),
    reason: z.string(),
    resolution: z.string().optional()
  })).default([]),
  resolutionOrder: z.array(z.string()).default([]),
  resolvedAt: z.date(),
  resolutionTime: z.number().min(0).optional() // in milliseconds
});

export type ServiceDependencyResolution = z.infer<typeof ServiceDependencyResolutionSchema>;

/**
 * Service deployment information
 */
export const ServiceDeploymentInfoSchema = z.object({
  environment: ServiceEnvironmentSchema,
  deployedAt: z.date(),
  deployedBy: z.string().optional(),
  deploymentId: z.string().optional(),
  version: z.string(),
  status: z.enum(['pending', 'deploying', 'deployed', 'failed', 'rolling-back']),
  rolloutStrategy: z.enum(['blue-green', 'canary', 'rolling', 'recreate']).optional(),
  replicas: z.number().min(0).optional(),
  resources: z.object({
    cpu: z.string().optional(),
    memory: z.string().optional(),
    storage: z.string().optional()
  }).optional(),
  endpoints: z.array(z.object({
    name: z.string(),
    url: z.string().url(),
    type: z.enum(['api', 'web', 'grpc', 'websocket']),
    public: z.boolean().default(false)
  })).default([])
});

export type ServiceDeploymentInfo = z.infer<typeof ServiceDeploymentInfoSchema>;

/**
 * Service compliance and audit information
 */
export const ServiceComplianceInfoSchema = z.object({
  standards: z.array(z.enum(['gdpr', 'hipaa', 'pci-dss', 'soc2', 'iso27001', 'nsm', 'ccpa'])).default([]),
  lastAudit: z.date().optional(),
  auditResults: z.array(z.object({
    standard: z.string(),
    status: z.enum(['compliant', 'non-compliant', 'partial', 'pending']),
    score: z.number().min(0).max(100).optional(),
    findings: z.array(z.string()).default([]),
    auditedAt: z.date()
  })).default([]),
  certifications: z.array(z.object({
    name: z.string(),
    issuer: z.string(),
    issuedAt: z.date(),
    expiresAt: z.date().optional(),
    certificateId: z.string().optional()
  })).default([]),
  dataProcessing: z.object({
    personalData: z.boolean().default(false),
    dataRetention: z.string().optional(),
    dataLocation: z.array(z.string()).default([]),
    encryptionAtRest: z.boolean().default(false),
    encryptionInTransit: z.boolean().default(false)
  }).optional()
});

export type ServiceComplianceInfo = z.infer<typeof ServiceComplianceInfoSchema>;

/**
 * Service cost and billing information
 */
export const ServiceCostInfoSchema = z.object({
  pricingModel: z.enum(['free', 'freemium', 'subscription', 'pay-per-use', 'enterprise']),
  cost: z.object({
    setup: z.number().min(0).optional(),
    monthly: z.number().min(0).optional(),
    annual: z.number().min(0).optional(),
    perUser: z.number().min(0).optional(),
    perTransaction: z.number().min(0).optional(),
    currency: z.string().default('USD')
  }).optional(),
  limits: z.object({
    requests: z.number().min(0).optional(),
    storage: z.string().optional(),
    bandwidth: z.string().optional(),
    users: z.number().min(0).optional()
  }).optional(),
  billing: z.object({
    provider: z.string().optional(),
    accountId: z.string().optional(),
    lastBilled: z.date().optional(),
    nextBilling: z.date().optional(),
    billingCycle: z.enum(['monthly', 'quarterly', 'annual']).optional()
  }).optional()
});

export type ServiceCostInfo = z.infer<typeof ServiceCostInfoSchema>;

/**
 * Comprehensive service metadata container
 */
export const ServiceMetadataSchema = z.object({
  serviceId: z.string().uuid(),
  name: z.string(),
  type: ServiceTypeSchema,
  provider: z.string(),
  priority: ServicePrioritySchema.default('medium'),
  
  // Core metadata
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
  
  // Version and lifecycle
  versionInfo: ServiceVersionInfoSchema.optional(),
  lifecycle: z.enum(['development', 'testing', 'staging', 'production', 'deprecated', 'archived']).default('development'),
  
  // Health and performance
  healthStatus: ServiceHealthStatusSchema.optional(),
  usage: ServiceUsageAnalyticsSchema.optional(),
  
  // Configuration and dependencies
  configValidation: ServiceConfigValidationSchema.optional(),
  dependencyResolution: ServiceDependencyResolutionSchema.optional(),
  
  // Deployment and operations
  deploymentInfo: ServiceDeploymentInfoSchema.optional(),
  
  // Compliance and governance
  complianceInfo: ServiceComplianceInfoSchema.optional(),
  
  // Cost and billing
  costInfo: ServiceCostInfoSchema.optional(),
  
  // Additional metadata
  tags: z.array(z.string()).default([]),
  labels: z.record(z.string()).default({}),
  annotations: z.record(z.string()).default({}),
  
  // Documentation and support
  documentation: z.object({
    readme: z.string().optional(),
    apiDocs: z.string().url().optional(),
    guides: z.array(z.string()).default([]),
    examples: z.array(z.string()).default([]),
    troubleshooting: z.string().optional()
  }).optional(),
  
  // Support and maintenance
  support: z.object({
    level: z.enum(['community', 'standard', 'premium', 'enterprise']).default('community'),
    contact: z.string().optional(),
    sla: z.string().optional(),
    maintenanceWindow: z.string().optional()
  }).optional()
});

export type ServiceMetadata = z.infer<typeof ServiceMetadataSchema>;

/**
 * Service metadata collection for bulk operations
 */
export const ServiceMetadataCollectionSchema = z.object({
  services: z.array(ServiceMetadataSchema),
  totalCount: z.number().min(0),
  lastUpdated: z.date(),
  version: z.string().default('1.0.0'),
  checksum: z.string().optional()
});

export type ServiceMetadataCollection = z.infer<typeof ServiceMetadataCollectionSchema>;