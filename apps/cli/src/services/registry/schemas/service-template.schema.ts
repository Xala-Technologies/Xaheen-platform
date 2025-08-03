/**
 * Service Template Schema
 * 
 * Extended template definitions for complex service deployment scenarios.
 * Supports multi-framework, multi-platform service templates.
 * 
 * @author Backend Expert Agent
 * @since 2025-01-03
 */

import { z } from 'zod';
import { 
  ServiceTypeSchema, 
  ServiceEnvironmentSchema, 
  ServiceInjectionPointSchema,
  ServiceEnvironmentVariableSchema,
  ServiceDependencySchema,
  ServicePostInjectionStepSchema
} from './service-definition.schema';

/**
 * Template framework support
 */
export const TemplateFrameworkSchema = z.object({
  name: z.string(),
  versions: z.array(z.string()).default(['*']),
  condition: z.string().optional(), // Handlebars condition
  priority: z.number().min(0).max(100).default(50),
  adaptations: z.object({
    injectionPoints: z.array(ServiceInjectionPointSchema).default([]),
    envVariables: z.array(ServiceEnvironmentVariableSchema).default([]),
    dependencies: z.array(ServiceDependencySchema).default([]),
    postSteps: z.array(ServicePostInjectionStepSchema).default([])
  }).optional()
});

export type TemplateFramework = z.infer<typeof TemplateFrameworkSchema>;

/**
 * Template platform support
 */
export const TemplatePlatformSchema = z.object({
  name: z.string(),
  architecture: z.array(z.enum(['x86_64', 'arm64', 'armv7', 'universal'])).default(['x86_64']),
  os: z.array(z.enum(['linux', 'darwin', 'windows', 'freebsd'])).default(['linux']),
  container: z.object({
    supported: z.boolean().default(true),
    baseImages: z.array(z.string()).default([]),
    requirements: z.array(z.string()).default([])
  }).optional(),
  cloud: z.object({
    providers: z.array(z.enum(['aws', 'gcp', 'azure', 'cloudflare', 'vercel', 'netlify'])).default([]),
    services: z.array(z.string()).default([])
  }).optional()
});

export type TemplatePlatform = z.infer<typeof TemplatePlatformSchema>;

/**
 * Template configuration schema definition
 */
export const TemplateConfigSchemaSchema = z.object({
  type: z.enum(['object', 'array', 'string', 'number', 'boolean']),
  properties: z.record(z.lazy(() => TemplateConfigSchemaSchema)).optional(),
  items: z.lazy(() => TemplateConfigSchemaSchema).optional(),
  required: z.array(z.string()).default([]),
  enum: z.array(z.unknown()).optional(),
  default: z.unknown(),
  description: z.string().optional(),
  examples: z.array(z.unknown()).default([]),
  validation: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    minLength: z.number().optional(),
    maxLength: z.number().optional(),
    pattern: z.string().optional(),
    format: z.enum(['email', 'url', 'uuid', 'date', 'time', 'datetime']).optional()
  }).optional()
});

export type TemplateConfigSchema = z.infer<typeof TemplateConfigSchemaSchema>;

/**
 * Template file transformation
 */
export const TemplateFileTransformationSchema = z.object({
  type: z.enum(['handlebars', 'mustache', 'ejs', 'nunjucks', 'custom']),
  source: z.string(),
  target: z.string(),
  condition: z.string().optional(),
  encoding: z.string().default('utf-8'),
  permissions: z.string().optional(), // Unix permissions
  transformers: z.array(z.object({
    name: z.string(),
    config: z.record(z.unknown()).default({})
  })).default([])
});

export type TemplateFileTransformation = z.infer<typeof TemplateFileTransformationSchema>;

/**
 * Template asset management
 */
export const TemplateAssetSchema = z.object({
  type: z.enum(['file', 'directory', 'symlink', 'binary']),
  source: z.string(),
  target: z.string(),
  condition: z.string().optional(),
  executable: z.boolean().default(false),
  compress: z.boolean().default(false),
  checksum: z.string().optional(),
  metadata: z.record(z.unknown()).default({})
});

export type TemplateAsset = z.infer<typeof TemplateAssetSchema>;

/**
 * Template testing configuration
 */
export const TemplateTestingSchema = z.object({
  unit: z.object({
    framework: z.string(),
    configFile: z.string().optional(),
    testPaths: z.array(z.string()).default([]),
    coverage: z.object({
      enabled: z.boolean().default(true),
      threshold: z.number().min(0).max(100).default(80),
      reports: z.array(z.enum(['text', 'html', 'lcov', 'json'])).default(['text'])
    }).optional()
  }).optional(),
  integration: z.object({
    framework: z.string(),
    environment: z.record(z.string()).default({}),
    services: z.array(z.string()).default([]),
    timeout: z.number().default(30000)
  }).optional(),
  e2e: z.object({
    framework: z.string(),
    browsers: z.array(z.string()).default(['chromium']),
    baseUrl: z.string().optional(),
    retries: z.number().min(0).max(5).default(2)
  }).optional()
});

export type TemplateTesting = z.infer<typeof TemplateTestingSchema>;

/**
 * Template security configuration
 */
export const TemplateSecuritySchema = z.object({
  vulnerabilityScanning: z.object({
    enabled: z.boolean().default(true),
    tools: z.array(z.enum(['npm-audit', 'snyk', 'safety', 'bandit', 'semgrep'])).default(['npm-audit']),
    severity: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
    autoFix: z.boolean().default(false)
  }).optional(),
  secretScanning: z.object({
    enabled: z.boolean().default(true),
    patterns: z.array(z.string()).default([]),
    excludePaths: z.array(z.string()).default([])
  }).optional(),
  codeAnalysis: z.object({
    enabled: z.boolean().default(true),
    tools: z.array(z.string()).default([]),
    rules: z.array(z.string()).default([])
  }).optional()
});

export type TemplateSecurity = z.infer<typeof TemplateSecuritySchema>;

/**
 * Comprehensive service template definition
 */
export const ServiceTemplateEnhancedSchema = z.object({
  // Base template information
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  displayName: z.string().min(1).max(150),
  description: z.string().min(1),
  type: ServiceTypeSchema,
  provider: z.string().min(1).max(50),
  version: z.string().min(1),
  
  // Template metadata
  author: z.string().optional(),
  maintainers: z.array(z.string()).default([]),
  license: z.string().default('MIT'),
  homepage: z.string().url().optional(),
  repository: z.string().url().optional(),
  documentation: z.string().url().optional(),
  keywords: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  
  // Framework and platform support
  frameworks: z.array(TemplateFrameworkSchema).default([]),
  platforms: z.array(TemplatePlatformSchema).default([]),
  databases: z.array(z.string()).default([]),
  runtimes: z.array(z.string()).default([]),
  
  // Template structure
  templatePath: z.string(),
  assets: z.array(TemplateAssetSchema).default([]),
  transformations: z.array(TemplateFileTransformationSchema).default([]),
  
  // Service injection configuration
  injectionPoints: z.array(ServiceInjectionPointSchema).default([]),
  envVariables: z.array(ServiceEnvironmentVariableSchema).default([]),
  dependencies: z.array(ServiceDependencySchema).default([]),
  postInjectionSteps: z.array(ServicePostInjectionStepSchema).default([]),
  
  // Configuration and customization
  configSchema: TemplateConfigSchemaSchema.optional(),
  defaultConfig: z.record(z.unknown()).default({}),
  examples: z.array(z.object({
    name: z.string(),
    description: z.string(),
    config: z.record(z.unknown()),
    files: z.array(z.string()).default([])
  })).default([]),
  
  // Requirements and constraints
  requirements: z.object({
    node: z.object({
      min: z.string().optional(),
      max: z.string().optional(),
      lts: z.boolean().default(true)
    }).optional(),
    memory: z.object({
      min: z.string().optional(),
      recommended: z.string().optional()
    }).optional(),
    disk: z.object({
      min: z.string().optional(),
      type: z.enum(['ssd', 'hdd', 'any']).default('any')
    }).optional(),
    network: z.object({
      internet: z.boolean().default(true),
      ports: z.array(z.number()).default([])
    }).optional()
  }).optional(),
  
  // Quality and testing
  testing: TemplateTestingSchema.optional(),
  security: TemplateSecuritySchema.optional(),
  quality: z.object({
    codeQuality: z.object({
      linting: z.boolean().default(true),
      formatting: z.boolean().default(true),
      typeChecking: z.boolean().default(true)
    }).optional(),
    performance: z.object({
      bundleSize: z.object({
        maxSize: z.string().optional(),
        monitoring: z.boolean().default(false)
      }).optional(),
      metrics: z.boolean().default(false)
    }).optional()
  }).optional(),
  
  // Compliance and governance
  compliance: z.object({
    standards: z.array(z.enum(['gdpr', 'hipaa', 'pci', 'soc2', 'iso27001', 'nsm'])).default([]),
    dataHandling: z.object({
      personalData: z.boolean().default(false),
      encryption: z.boolean().default(false),
      audit: z.boolean().default(false)
    }).optional(),
    accessibility: z.object({
      wcag: z.enum(['A', 'AA', 'AAA']).optional(),
      testing: z.boolean().default(false)
    }).optional()
  }).optional(),
  
  // Template lifecycle
  maturity: z.enum(['alpha', 'beta', 'stable', 'deprecated']).default('stable'),
  supportLevel: z.enum(['community', 'commercial', 'enterprise']).default('community'),
  
  // Analytics and usage
  analytics: z.object({
    usageCount: z.number().min(0).default(0),
    successRate: z.number().min(0).max(100).default(100),
    averageSetupTime: z.number().min(0).optional(),
    userRating: z.number().min(1).max(5).optional(),
    feedback: z.array(z.object({
      rating: z.number().min(1).max(5),
      comment: z.string(),
      timestamp: z.date()
    })).default([])
  }).optional(),
  
  // Versioning and updates
  changelog: z.string().optional(),
  migrationGuides: z.array(z.object({
    fromVersion: z.string(),
    toVersion: z.string(),
    guide: z.string(),
    automated: z.boolean().default(false),
    breaking: z.boolean().default(false)
  })).default([]),
  deprecationNotice: z.object({
    deprecated: z.boolean().default(false),
    reason: z.string().optional(),
    replacement: z.string().optional(),
    endOfLife: z.date().optional()
  }).optional(),
  
  // Template creation metadata
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
  
  // Template validation
  validation: z.object({
    validated: z.boolean().default(false),
    validatedAt: z.date().optional(),
    validationResults: z.array(z.object({
      check: z.string(),
      status: z.enum(['pass', 'fail', 'warning']),
      message: z.string().optional()
    })).default([])
  }).optional()
});

export type ServiceTemplateEnhanced = z.infer<typeof ServiceTemplateEnhancedSchema>;

/**
 * Template registry for managing multiple templates
 */
export const TemplateRegistrySchema = z.object({
  templates: z.array(ServiceTemplateEnhancedSchema),
  categories: z.array(z.object({
    name: z.string(),
    description: z.string(),
    templates: z.array(z.string()) // Template IDs
  })).default([]),
  statistics: z.object({
    totalTemplates: z.number().min(0),
    templatesByType: z.record(z.number()),
    templatesByProvider: z.record(z.number()),
    averageRating: z.number().min(0).max(5).optional()
  }).optional(),
  version: z.string().default('1.0.0'),
  lastUpdated: z.date()
});

export type TemplateRegistry = z.infer<typeof TemplateRegistrySchema>;