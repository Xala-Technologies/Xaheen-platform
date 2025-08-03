/**
 * Service Compatibility Schema
 * 
 * Defines compatibility matrices and validation rules for service combinations.
 * Ensures service interoperability and conflict detection.
 * 
 * @author Backend Expert Agent
 * @since 2025-01-03
 */

import { z } from 'zod';
import { ServiceTypeSchema } from './service-definition.schema';

/**
 * Compatibility rule types
 */
export const CompatibilityRuleTypeSchema = z.enum([
  'require',      // Service A requires Service B
  'conflict',     // Service A conflicts with Service B
  'recommend',    // Service A recommends Service B
  'exclude',      // Service A excludes Service B
  'replace',      // Service A replaces Service B
  'enhance',      // Service A enhances Service B
  'depend'        // Service A depends on Service B
]);

export type CompatibilityRuleType = z.infer<typeof CompatibilityRuleTypeSchema>;

/**
 * Compatibility severity levels
 */
export const CompatibilitySeveritySchema = z.enum([
  'critical',   // Critical conflict - cannot proceed
  'error',      // Error - should not proceed
  'warning',    // Warning - can proceed with caution
  'info',       // Informational - good to know
  'suggestion'  // Suggestion - optional improvement
]);

export type CompatibilitySeverity = z.infer<typeof CompatibilitySeveritySchema>;

/**
 * Version constraint schema
 */
export const VersionConstraintSchema = z.object({
  operator: z.enum(['=', '!=', '>', '>=', '<', '<=', '~', '^', '*']).default('>='),
  version: z.string(),
  prerelease: z.boolean().default(false),
  build: z.string().optional()
});

export type VersionConstraint = z.infer<typeof VersionConstraintSchema>;

/**
 * Service identifier with version constraints
 */
export const ServiceIdentifierSchema = z.object({
  type: ServiceTypeSchema,
  provider: z.string(),
  versionConstraint: VersionConstraintSchema.optional(),
  tags: z.array(z.string()).default([]),
  environment: z.array(z.string()).default([])
});

export type ServiceIdentifier = z.infer<typeof ServiceIdentifierSchema>;

/**
 * Compatibility condition schema
 */
export const CompatibilityConditionSchema = z.object({
  type: z.enum(['environment', 'configuration', 'platform', 'framework', 'custom']),
  key: z.string(),
  operator: z.enum(['equals', 'not_equals', 'contains', 'not_contains', 'regex', 'version']),
  value: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]),
  description: z.string().optional()
});

export type CompatibilityCondition = z.infer<typeof CompatibilityConditionSchema>;

/**
 * Compatibility rule definition
 */
export const CompatibilityRuleSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().min(1),
  type: CompatibilityRuleTypeSchema,
  severity: CompatibilitySeveritySchema,
  
  // Services involved in the rule
  source: ServiceIdentifierSchema,
  target: ServiceIdentifierSchema.optional(),
  
  // Conditions for rule application
  conditions: z.array(CompatibilityConditionSchema).default([]),
  conditionLogic: z.enum(['AND', 'OR']).default('AND'),
  
  // Rule metadata
  category: z.string().optional(),
  reason: z.string().min(1),
  resolution: z.string().optional(),
  documentation: z.string().url().optional(),
  
  // Rule lifecycle
  active: z.boolean().default(true),
  deprecated: z.boolean().default(false),
  replacedBy: z.string().optional(), // Rule ID that replaces this one
  
  // Versioning
  version: z.string().default('1.0.0'),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  createdBy: z.string().optional(),
  
  // Additional metadata
  tags: z.array(z.string()).default([]),
  priority: z.number().min(0).max(100).default(50),
  weight: z.number().min(0).max(1).default(1.0)
});

export type CompatibilityRule = z.infer<typeof CompatibilityRuleSchema>;

/**
 * Compatibility matrix entry
 */
export const CompatibilityMatrixEntrySchema = z.object({
  serviceA: ServiceIdentifierSchema,
  serviceB: ServiceIdentifierSchema,
  compatibility: z.enum(['compatible', 'incompatible', 'conditional', 'unknown']),
  confidence: z.number().min(0).max(1).default(1.0),
  rules: z.array(z.string()).default([]), // Rule IDs
  lastTested: z.date().optional(),
  testResults: z.array(z.object({
    environment: z.string(),
    status: z.enum(['pass', 'fail', 'warn', 'skip']),
    details: z.string().optional(),
    testedAt: z.date()
  })).default([])
});

export type CompatibilityMatrixEntry = z.infer<typeof CompatibilityMatrixEntrySchema>;

/**
 * Service compatibility matrix
 */
export const ServiceCompatibilityMatrixSchema = z.object({
  version: z.string().default('1.0.0'),
  description: z.string().optional(),
  entries: z.array(CompatibilityMatrixEntrySchema),
  rules: z.array(CompatibilityRuleSchema),
  
  // Matrix metadata
  generatedAt: z.date().default(() => new Date()),
  validUntil: z.date().optional(),
  coverage: z.object({
    totalCombinations: z.number().min(0),
    testedCombinations: z.number().min(0),
    coveragePercentage: z.number().min(0).max(100)
  }).optional(),
  
  // Statistics
  statistics: z.object({
    compatiblePairs: z.number().min(0).default(0),
    incompatiblePairs: z.number().min(0).default(0),
    conditionalPairs: z.number().min(0).default(0),
    unknownPairs: z.number().min(0).default(0),
    totalRules: z.number().min(0).default(0),
    activeRules: z.number().min(0).default(0)
  }).optional()
});

export type ServiceCompatibilityMatrix = z.infer<typeof ServiceCompatibilityMatrixSchema>;

/**
 * Compatibility check request
 */
export const CompatibilityCheckRequestSchema = z.object({
  services: z.array(ServiceIdentifierSchema).min(1),
  environment: z.string().optional(),
  framework: z.string().optional(),
  platform: z.string().optional(),
  includeRecommendations: z.boolean().default(true),
  includeWarnings: z.boolean().default(true),
  maxSuggestions: z.number().min(0).max(50).default(10),
  context: z.record(z.unknown()).default({})
});

export type CompatibilityCheckRequest = z.infer<typeof CompatibilityCheckRequestSchema>;

/**
 * Compatibility issue detail
 */
export const CompatibilityIssueSchema = z.object({
  id: z.string().uuid(),
  type: CompatibilityRuleTypeSchema,
  severity: CompatibilitySeveritySchema,
  message: z.string(),
  description: z.string().optional(),
  
  // Services involved
  sourceService: ServiceIdentifierSchema,
  targetService: ServiceIdentifierSchema.optional(),
  
  // Resolution information
  resolution: z.object({
    possible: z.boolean(),
    automatic: z.boolean().default(false),
    steps: z.array(z.string()).default([]),
    alternatives: z.array(ServiceIdentifierSchema).default([]),
    cost: z.enum(['low', 'medium', 'high']).optional()
  }).optional(),
  
  // Rule reference
  ruleId: z.string().optional(),
  ruleName: z.string().optional(),
  
  // Additional context
  context: z.record(z.unknown()).default({}),
  documentation: z.string().url().optional()
});

export type CompatibilityIssue = z.infer<typeof CompatibilityIssueSchema>;

/**
 * Service recommendation
 */
export const ServiceRecommendationSchema = z.object({
  type: z.enum(['add', 'remove', 'replace', 'configure', 'upgrade']),
  service: ServiceIdentifierSchema,
  reason: z.string(),
  benefits: z.array(z.string()).default([]),
  effort: z.enum(['low', 'medium', 'high']).default('medium'),
  impact: z.enum(['low', 'medium', 'high']).default('medium'),
  priority: z.number().min(0).max(100).default(50),
  
  // Implementation details
  implementation: z.object({
    automated: z.boolean().default(false),
    steps: z.array(z.string()).default([]),
    estimatedTime: z.number().optional(), // in minutes
    dependencies: z.array(z.string()).default([])
  }).optional()
});

export type ServiceRecommendation = z.infer<typeof ServiceRecommendationSchema>;

/**
 * Comprehensive compatibility check result
 */
export const CompatibilityCheckResultSchema = z.object({
  requestId: z.string().uuid(),
  compatible: z.boolean(),
  overallScore: z.number().min(0).max(100),
  
  // Issues and conflicts
  issues: z.array(CompatibilityIssueSchema).default([]),
  criticalIssues: z.array(CompatibilityIssueSchema).default([]),
  warnings: z.array(CompatibilityIssueSchema).default([]),
  
  // Missing dependencies and requirements
  missingDependencies: z.array(ServiceIdentifierSchema).default([]),
  missingRequirements: z.array(z.string()).default([]),
  
  // Recommendations and suggestions
  recommendations: z.array(ServiceRecommendationSchema).default([]),
  alternatives: z.array(z.object({
    original: ServiceIdentifierSchema,
    alternatives: z.array(ServiceIdentifierSchema),
    reason: z.string()
  })).default([]),
  
  // Analysis metadata
  checkedAt: z.date().default(() => new Date()),
  analysisTime: z.number().optional(), // in milliseconds
  matrixVersion: z.string().optional(),
  rulesApplied: z.number().min(0).default(0),
  confidence: z.number().min(0).max(1).default(1.0),
  
  // Summary statistics
  summary: z.object({
    totalServices: z.number().min(0),
    compatiblePairs: z.number().min(0),
    conflictingPairs: z.number().min(0),
    missingPairs: z.number().min(0),
    recommendationCount: z.number().min(0),
    estimatedSetupComplexity: z.enum(['simple', 'moderate', 'complex', 'very-complex']).optional()
  }).optional()
});

export type CompatibilityCheckResult = z.infer<typeof CompatibilityCheckResultSchema>;