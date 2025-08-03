/**
 * Core Service Definition Schema
 * 
 * Defines the fundamental service types and structures for the Xaheen platform.
 * Supports enterprise-grade SaaS applications with comprehensive service definitions.
 * 
 * @author Backend Expert Agent
 * @since 2025-01-03
 */

import { z } from 'zod';

/**
 * Comprehensive service types for enterprise SaaS applications
 */
export const ServiceTypeSchema = z.enum([
  // Core Infrastructure Services
  'database',
  'cache',
  'storage',
  'messaging',
  'api',
  
  // Authentication & Authorization Services
  'auth',
  'rbac',
  'session',
  'oauth',
  'mfa',
  
  // Business & Financial Services
  'payment',
  'billing',
  'subscription',
  'invoice',
  'accounting',
  
  // Communication Services
  'notification',
  'email',
  'sms',
  'push',
  'webhook',
  
  // Monitoring & Analytics Services
  'analytics',
  'monitoring',
  'logging',
  'error-tracking',
  'performance',
  'health-check',
  
  // Tenant & Multi-tenancy Services
  'tenant-management',
  'tenant-isolation',
  'tenant-provisioning',
  
  // Content & Media Services
  'cdn',
  'file-upload',
  'image-processing',
  'video-streaming',
  
  // Search & Discovery Services
  'search',
  'indexing',
  'recommendation',
  
  // Compliance & Security Services
  'gdpr',
  'audit',
  'encryption',
  'backup',
  'security',
  
  // Integration Services
  'crm',
  'erp',
  'accounting-software',
  'third-party-api',
  
  // DevOps & Deployment Services
  'ci-cd',
  'containerization',
  'orchestration',
  'scaling',
  
  // Norwegian Compliance Services
  'altinn',
  'bankid',
  'vipps',
  'nsm-compliance',
  
  // AI & Machine Learning Services
  'ai-assistant',
  'ml-pipeline',
  'data-processing',
  'recommendation-engine'
]);

export type ServiceType = z.infer<typeof ServiceTypeSchema>;

/**
 * Service deployment environments
 */
export const ServiceEnvironmentSchema = z.enum([
  'development',
  'staging',
  'production',
  'test',
  'preview',
  'local'
]);

export type ServiceEnvironment = z.infer<typeof ServiceEnvironmentSchema>;

/**
 * Service injection strategies
 */
export const ServiceInjectionStrategySchema = z.enum([
  'replace',
  'merge',
  'append',
  'prepend',
  'inject-block',
  'conditional-merge'
]);

export type ServiceInjectionStrategy = z.infer<typeof ServiceInjectionStrategySchema>;

/**
 * Service injection point types
 */
export const ServiceInjectionPointTypeSchema = z.enum([
  'file',
  'directory',
  'config',
  'package-json',
  'env-file',
  'docker-compose',
  'k8s-manifest'
]);

export type ServiceInjectionPointType = z.infer<typeof ServiceInjectionPointTypeSchema>;

/**
 * Service dependency types
 */
export const ServiceDependencyTypeSchema = z.enum([
  'runtime',
  'dev',
  'peer',
  'optional',
  'bundled'
]);

export type ServiceDependencyType = z.infer<typeof ServiceDependencyTypeSchema>;

/**
 * Service configuration priorities
 */
export const ServicePrioritySchema = z.enum([
  'critical',
  'high',
  'medium',
  'low',
  'optional'
]);

export type ServicePriority = z.infer<typeof ServicePrioritySchema>;

/**
 * Service configuration schema with comprehensive validation
 */
export const ServiceConfigSchema = z.object({
  name: z.string().min(1).max(100),
  type: ServiceTypeSchema,
  provider: z.string().min(1).max(50),
  version: z.string().optional(),
  enabled: z.boolean().default(true),
  priority: ServicePrioritySchema.default('medium'),
  config: z.record(z.unknown()).default({}),
  environment: z.array(ServiceEnvironmentSchema).optional(),
  dependencies: z.array(z.string()).default([]),
  conflicts: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  metadata: z.record(z.unknown()).default({})
});

export type ServiceConfig = z.infer<typeof ServiceConfigSchema>;

/**
 * Service injection point definition with enhanced capabilities
 */
export const ServiceInjectionPointSchema = z.object({
  path: z.string().min(1),
  type: ServiceInjectionPointTypeSchema,
  strategy: ServiceInjectionStrategySchema,
  condition: z.string().optional(), // Handlebars condition
  template: z.string().optional(),
  templatePath: z.string().optional(),
  priority: z.number().min(0).max(1000).default(100),
  backup: z.boolean().default(true),
  encoding: z.string().default('utf-8'),
  permissions: z.string().optional(), // Unix permissions
  merge: z.object({
    key: z.string().optional(),
    strategy: z.enum(['deep', 'shallow', 'array-concat']).default('deep')
  }).optional()
});

export type ServiceInjectionPoint = z.infer<typeof ServiceInjectionPointSchema>;

/**
 * Environment variable definition with enhanced validation
 */
export const ServiceEnvironmentVariableSchema = z.object({
  name: z.string().regex(/^[A-Z][A-Z0-9_]*$/),
  description: z.string().min(1),
  required: z.boolean().default(false),
  defaultValue: z.string().optional(),
  type: z.enum(['string', 'number', 'boolean', 'url', 'secret', 'json', 'array']).default('string'),
  validation: z.object({
    pattern: z.string().optional(),
    minLength: z.number().optional(),
    maxLength: z.number().optional(),
    enum: z.array(z.string()).optional()
  }).optional(),
  sensitive: z.boolean().default(false),
  environments: z.array(ServiceEnvironmentSchema).optional()
});

export type ServiceEnvironmentVariable = z.infer<typeof ServiceEnvironmentVariableSchema>;

/**
 * Service dependency definition with version constraints
 */
export const ServiceDependencySchema = z.object({
  name: z.string().min(1),
  version: z.string().min(1),
  type: ServiceDependencyTypeSchema,
  condition: z.string().optional(), // Handlebars condition
  optional: z.boolean().default(false),
  reason: z.string().optional(),
  alternatives: z.array(z.string()).default([]),
  registry: z.enum(['npm', 'pypi', 'nuget', 'maven', 'composer']).default('npm')
});

export type ServiceDependency = z.infer<typeof ServiceDependencySchema>;

/**
 * Post-injection step definition
 */
export const ServicePostInjectionStepSchema = z.object({
  name: z.string().min(1),
  command: z.string().min(1),
  description: z.string().min(1),
  condition: z.string().optional(),
  timeout: z.number().positive().default(30000), // 30 seconds
  retries: z.number().min(0).max(5).default(0),
  async: z.boolean().default(false),
  environment: z.record(z.string()).default({}),
  workingDirectory: z.string().optional()
});

export type ServicePostInjectionStep = z.infer<typeof ServicePostInjectionStepSchema>;

/**
 * Comprehensive service template definition
 */
export const ServiceTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  type: ServiceTypeSchema,
  provider: z.string().min(1).max(50),
  version: z.string().min(1),
  description: z.string().min(1),
  author: z.string().optional(),
  license: z.string().default('MIT'),
  homepage: z.string().url().optional(),
  repository: z.string().url().optional(),
  keywords: z.array(z.string()).default([]),
  
  // Injection configuration
  injectionPoints: z.array(ServiceInjectionPointSchema).default([]),
  envVariables: z.array(ServiceEnvironmentVariableSchema).default([]),
  dependencies: z.array(ServiceDependencySchema).default([]),
  postInjectionSteps: z.array(ServicePostInjectionStepSchema).default([]),
  
  // Compatibility and requirements
  frameworks: z.array(z.string()).default([]), // Supported frameworks
  databases: z.array(z.string()).default([]), // Compatible databases
  platforms: z.array(z.string()).default([]), // Supported platforms
  minNodeVersion: z.string().optional(),
  
  // SaaS-specific configuration
  multiTenant: z.boolean().default(false),
  compliance: z.array(z.enum(['gdpr', 'hipaa', 'pci', 'soc2', 'iso27001', 'nsm'])).default([]),
  scalingRequirements: z.object({
    horizontal: z.boolean().default(true),
    vertical: z.boolean().default(true),
    stateless: z.boolean().default(true)
  }).optional(),
  
  // Metadata and classification
  category: z.string().optional(),
  subcategory: z.string().optional(),
  maturity: z.enum(['alpha', 'beta', 'stable', 'deprecated']).default('stable'),
  supportLevel: z.enum(['community', 'commercial', 'enterprise']).default('community'),
  
  // Configuration schema
  configSchema: z.record(z.unknown()).optional(),
  
  // Documentation and examples
  documentation: z.object({
    readme: z.string().optional(),
    examples: z.array(z.string()).default([]),
    guides: z.array(z.string()).default([])
  }).optional()
});

export type ServiceTemplate = z.infer<typeof ServiceTemplateSchema>;

/**
 * Service injection metadata for tracking
 */
export const ServiceInjectionMetadataSchema = z.object({
  id: z.string().uuid(),
  serviceConfig: ServiceConfigSchema,
  injectedAt: z.date(),
  environment: ServiceEnvironmentSchema,
  injectionPoint: z.string(),
  files: z.array(z.string()).default([]),
  envVars: z.array(z.string()).default([]),
  dependencies: z.array(z.string()).default([]),
  templateVersion: z.string(),
  checksum: z.string().optional(),
  metadata: z.record(z.unknown()).default({})
});

export type ServiceInjectionMetadata = z.infer<typeof ServiceInjectionMetadataSchema>;

/**
 * Service injection result with comprehensive feedback
 */
export const ServiceInjectionResultSchema = z.object({
  success: z.boolean(),
  serviceId: z.string(),
  metadata: ServiceInjectionMetadataSchema,
  filesModified: z.array(z.string()).default([]),
  filesCreated: z.array(z.string()).default([]),
  filesDeleted: z.array(z.string()).default([]),
  envVarsAdded: z.array(z.string()).default([]),
  dependenciesAdded: z.array(z.string()).default([]),
  errors: z.array(z.string()).default([]),
  warnings: z.array(z.string()).default([]),
  duration: z.number().optional(),
  rollbackInfo: z.object({
    backupPath: z.string().optional(),
    rollbackSteps: z.array(z.string()).default([])
  }).optional()
});

export type ServiceInjectionResult = z.infer<typeof ServiceInjectionResultSchema>;

/**
 * Service compatibility result
 */
export const ServiceCompatibilityResultSchema = z.object({
  compatible: z.boolean(),
  conflicts: z.array(z.object({
    serviceA: z.string(),
    serviceB: z.string(),
    reason: z.string(),
    severity: z.enum(['error', 'warning', 'info']).default('error')
  })).default([]),
  missingDependencies: z.array(ServiceDependencySchema).default([]),
  suggestions: z.array(z.string()).default([]),
  score: z.number().min(0).max(100).optional() // Compatibility score
});

export type ServiceCompatibilityResult = z.infer<typeof ServiceCompatibilityResultSchema>;