/**
 * Core Type Definitions for Xaheen CLI v2
 * 
 * @author CLI Template Generator Agent
 * @since 2025-01-03
 */

import { z } from 'zod';

// Project configuration
export const ProjectConfigSchema = z.object({
  name: z.string(),
  path: z.string(),
  framework: z.string(),
  backend: z.string(),
  database: z.string(),
  platform: z.enum(['web', 'mobile', 'desktop']).default('web'),
  features: z.array(z.string()).default([]),
  metadata: z.record(z.string(), z.any()).default({})
});

export type ProjectConfig = z.infer<typeof ProjectConfigSchema>;

// Service types
export const ServiceTypeSchema = z.enum([
  'auth',
  'payments',
  'database',
  'cache',
  'queue',
  'storage',
  'email',
  'sms',
  'push',
  'search',
  'analytics',
  'monitoring',
  'logging',
  'i18n',
  'cms',
  'admin',
  'docs',
  'testing',
  'deployment',
  'ci',
  'cdn',
  'security',
  'backup',
  'compliance',
  'ai',
  'realtime',
  'api',
  'orm',
  'ui',
  'state',
  'routing',
  'forms',
  'validation',
  'charts',
  'maps',
  'calendar',
  'chat',
  'video',
  'audio',
  'image',
  'pdf',
  'office'
]);

export type ServiceType = z.infer<typeof ServiceTypeSchema>;

// Service configuration
export const ServiceConfigurationSchema = z.object({
  serviceId: z.string(),
  serviceType: ServiceTypeSchema,
  provider: z.string(),
  version: z.string(),
  required: z.boolean().default(true),
  priority: z.number().default(50),
  configuration: z.record(z.string(), z.any()).default({}),
  environmentVariables: z.array(z.object({
    name: z.string(),
    value: z.string().optional(),
    required: z.boolean().default(false)
  })).default([]),
  dependencies: z.array(z.object({
    serviceType: ServiceTypeSchema,
    provider: z.string().optional(),
    version: z.string().optional()
  })).default([]),
  postInstallSteps: z.array(z.string()).default([]),
  verificationSteps: z.array(z.string()).default([])
});

export type ServiceConfiguration = z.infer<typeof ServiceConfigurationSchema>;

// Service template
export const ServiceTemplateSchema = z.object({
  name: z.string(),
  type: ServiceTypeSchema,
  provider: z.string(),
  version: z.string(),
  description: z.string(),
  author: z.string().optional(),
  license: z.string().default('MIT'),
  injectionPoints: z.array(z.object({
    type: z.enum(['file-create', 'file-append', 'file-prepend', 'file-replace', 'ast-modify', 'json-merge', 'config-update']),
    target: z.string(),
    template: z.string(),
    condition: z.string().optional(),
    searchPattern: z.string().optional(),
    conflictsWith: z.array(z.string()).optional(),
    priority: z.number().default(50)
  })).default([]),
  envVariables: z.array(z.object({
    name: z.string(),
    description: z.string(),
    required: z.boolean().default(false),
    defaultValue: z.string().optional(),
    type: z.enum(['string', 'number', 'boolean', 'url', 'secret']).default('string'),
    sensitive: z.boolean().default(false)
  })).default([]),
  dependencies: z.array(z.object({
    serviceType: ServiceTypeSchema,
    provider: z.string().optional(),
    version: z.string().optional(),
    required: z.boolean().default(true)
  })).default([]),
  postInjectionSteps: z.array(z.object({
    type: z.enum(['command', 'manual']),
    description: z.string(),
    command: z.string().optional()
  })).default([]),
  frameworks: z.array(z.string()).default([]),
  databases: z.array(z.string()).default([]),
  platforms: z.array(z.string()).default(['web']),
  tags: z.array(z.string()).default([])
});

export type ServiceTemplate = z.infer<typeof ServiceTemplateSchema>;

// Service bundle
export const ServiceBundleSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  displayName: z.string(),
  description: z.string(),
  version: z.string(),
  type: z.enum(['saas-starter', 'saas-professional', 'saas-enterprise', 'marketplace', 'fintech', 'healthcare', 'ecommerce', 'custom']),
  author: z.string().optional(),
  services: z.array(z.object({
    serviceType: ServiceTypeSchema,
    provider: z.string(),
    version: z.string().optional(),
    required: z.boolean().default(true),
    priority: z.number().default(50),
    config: z.record(z.string(), z.any()).default({})
  })),
  optionalServices: z.array(z.object({
    serviceType: ServiceTypeSchema,
    provider: z.string(),
    version: z.string().optional(),
    condition: z.string().optional()
  })).default([]),
  deploymentTargets: z.array(z.string()).default(['cloud-native']),
  prerequisites: z.object({
    frameworks: z.array(z.string()).default([]),
    databases: z.array(z.string()).default([]),
    platforms: z.array(z.string()).default([])
  }).optional(),
  pricing: z.object({
    tier: z.string(),
    monthlyPrice: z.string(),
    features: z.array(z.string())
  }).optional(),
  compliance: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date())
});

export type ServiceBundle = z.infer<typeof ServiceBundleSchema>;

// Bundle resolution result
export const BundleResolutionResultSchema = z.object({
  bundleId: z.string(),
  bundleName: z.string(),
  bundleVersion: z.string(),
  status: z.enum(['success', 'warning', 'failed']),
  resolvedServices: z.array(ServiceConfigurationSchema),
  dependencies: z.array(z.object({
    dependentService: z.string(),
    requiredService: z.string(),
    requiredProvider: z.string(),
    requiredVersion: z.string().optional()
  })),
  configuration: z.record(z.string(), z.any()),
  deploymentInstructions: z.array(z.string()),
  postInstallSteps: z.array(z.string()),
  verificationSteps: z.array(z.string()),
  errors: z.array(z.string()),
  warnings: z.array(z.string()),
  resolutionTime: z.number(),
  resolvedAt: z.date()
});

export type BundleResolutionResult = z.infer<typeof BundleResolutionResultSchema>;

// Service injection result
export const ServiceInjectionResultSchema = z.object({
  serviceId: z.string(),
  serviceType: ServiceTypeSchema,
  provider: z.string(),
  status: z.enum(['success', 'failed']),
  injectedFiles: z.array(z.string()),
  createdFiles: z.array(z.string()),
  environmentVariables: z.array(z.object({
    name: z.string(),
    value: z.string(),
    required: z.boolean()
  })),
  postInstallSteps: z.array(z.string()),
  errors: z.array(z.string()),
  warnings: z.array(z.string()),
  injectionTime: z.number(),
  injectedAt: z.date()
});

export type ServiceInjectionResult = z.infer<typeof ServiceInjectionResultSchema>;

// Project context for template rendering
export interface ProjectContext {
  name: string;
  framework: string;
  backend?: string;
  database?: string;
  platform: string;
  packageManager: 'npm' | 'pnpm' | 'yarn' | 'bun';
  typescript: boolean;
  git: boolean;
  features: string[];
  author?: string;
  license?: string;
  [key: string]: any;
}

// Service registry interface
export interface IServiceRegistry {
  initialize(): Promise<void>;
  getTemplate(type: ServiceType | string, provider: string): Promise<ServiceTemplate | null>;
  listTemplates(type?: ServiceType | string): Promise<ServiceTemplate[]>;
  registerTemplate(template: ServiceTemplate): Promise<void>;
}

// Bundle resolver interface
export interface IBundleResolver {
  resolveBundle(bundle: ServiceBundle, options?: any): Promise<BundleResolutionResult>;
  loadBundleByName(name: string): Promise<ServiceBundle | null>;
  createCustomBundle(services: string[]): Promise<ServiceBundle>;
}

// Service injector interface  
export interface IServiceInjector {
  injectService(
    service: ServiceConfiguration,
    template: ServiceTemplate,
    projectPath: string,
    projectContext: ProjectContext,
    options?: any
  ): Promise<ServiceInjectionResult>;
  
  injectServices(
    services: ServiceConfiguration[],
    projectPath: string,
    projectContext: ProjectContext,
    options?: any
  ): Promise<ServiceInjectionResult[]>;
}

// Validation types
export const ValidationIssueSchema = z.object({
  id: z.string(),
  category: z.string(),
  severity: z.enum(['error', 'warning', 'info']),
  message: z.string(),
  file: z.string().optional(),
  line: z.number().optional(),
  column: z.number().optional(),
  suggestion: z.string().optional(),
  fixable: z.boolean().default(false),
  rule: z.string().optional()
});

export type ValidationIssue = z.infer<typeof ValidationIssueSchema>;

export const ValidationResultSchema = z.object({
  isValid: z.boolean(),
  errors: z.array(ValidationIssueSchema),
  warnings: z.array(ValidationIssueSchema),
  fixableIssues: z.number().default(0),
  validatedAt: z.date().default(() => new Date()),
  metrics: z.object({
    dependencies: z.object({
      total: z.number(),
      outdated: z.number(),
      vulnerable: z.number()
    }).optional(),
    bundleSize: z.number().optional(),
    typesCoverage: z.number().optional(),
    lintIssues: z.number().optional(),
    testCoverage: z.number().optional()
  }).optional()
});

export type ValidationResult = z.infer<typeof ValidationResultSchema>;

export const FixResultSchema = z.object({
  fixedCount: z.number(),
  errors: z.array(z.string()),
  appliedFixes: z.array(z.object({
    issueId: z.string(),
    description: z.string(),
    success: z.boolean()
  }))
});

export type FixResult = z.infer<typeof FixResultSchema>;