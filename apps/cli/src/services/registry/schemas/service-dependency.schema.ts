/**
 * Service Dependency Schema
 * 
 * Defines complex service dependency relationships and resolution algorithms.
 * Supports dependency graphs, circular dependency detection, and resolution ordering.
 * 
 * @author Backend Expert Agent
 * @since 2025-01-03
 */

import { z } from 'zod';
import { ServiceTypeSchema, ServiceEnvironmentSchema } from './service-definition.schema';

/**
 * Dependency relationship types
 */
export const DependencyRelationshipTypeSchema = z.enum([
  'requires',        // Hard dependency - cannot function without
  'recommends',      // Soft dependency - works better with
  'suggests',        // Optional dependency - might benefit from
  'conflicts',       // Incompatible - cannot coexist
  'replaces',        // Supersedes another service
  'enhances',        // Provides additional functionality to
  'extends',         // Builds upon another service
  'integrates',      // Integrates with another service
  'complements',     // Works well together
  'breaks'           // Known to break functionality
]);

export type DependencyRelationshipType = z.infer<typeof DependencyRelationshipTypeSchema>;

/**
 * Dependency constraint types
 */
export const DependencyConstraintTypeSchema = z.enum([
  'version',         // Version constraint
  'environment',     // Environment constraint
  'platform',       // Platform constraint
  'configuration',   // Configuration constraint
  'resource',        // Resource constraint
  'license',         // License compatibility
  'security',        // Security constraint
  'performance',     // Performance constraint
  'custom'           // Custom constraint
]);

export type DependencyConstraintType = z.infer<typeof DependencyConstraintTypeSchema>;

/**
 * Version constraint operators
 */
export const VersionOperatorSchema = z.enum([
  '=',    // Exact version
  '!=',   // Not equal
  '>',    // Greater than
  '>=',   // Greater than or equal
  '<',    // Less than
  '<=',   // Less than or equal
  '~',    // Compatible within patch version
  '^',    // Compatible within minor version
  '*',    // Any version
  'latest' // Latest available version
]);

export type VersionOperator = z.infer<typeof VersionOperatorSchema>;

/**
 * Dependency constraint definition
 */
export const DependencyConstraintSchema = z.object({
  type: DependencyConstraintTypeSchema,
  operator: z.string().optional(),
  value: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]),
  description: z.string().optional(),
  
  // Constraint metadata
  strict: z.boolean().default(false),
  optional: z.boolean().default(false),
  reason: z.string().optional(),
  
  // Environment-specific constraints
  environments: z.array(ServiceEnvironmentSchema).optional(),
  
  // Constraint validation
  validation: z.object({
    script: z.string().optional(),
    command: z.string().optional(),
    regex: z.string().optional()
  }).optional()
});

export type DependencyConstraint = z.infer<typeof DependencyConstraintSchema>;

/**
 * Service identifier with enhanced metadata
 */
export const ServiceDependencyIdentifierSchema = z.object({
  type: ServiceTypeSchema,
  provider: z.string(),
  version: z.string().optional(),
  alias: z.string().optional(), // Alternative name for the service
  
  // Identification metadata
  namespace: z.string().optional(),
  group: z.string().optional(),
  tags: z.array(z.string()).default([]),
  
  // Constraints
  constraints: z.array(DependencyConstraintSchema).default([])
});

export type ServiceDependencyIdentifier = z.infer<typeof ServiceDependencyIdentifierSchema>;

/**
 * Service dependency relationship
 */
export const ServiceDependencyRelationshipSchema = z.object({
  id: z.string().uuid(),
  source: ServiceDependencyIdentifierSchema,
  target: ServiceDependencyIdentifierSchema,
  relationship: DependencyRelationshipTypeSchema,
  
  // Relationship properties
  required: z.boolean().default(true),
  optional: z.boolean().default(false),
  weight: z.number().min(0).max(1).default(1.0), // Importance weight
  
  // Conditional dependency
  condition: z.string().optional(), // Handlebars condition
  environments: z.array(ServiceEnvironmentSchema).optional(),
  
  // Relationship metadata
  reason: z.string(),
  description: z.string().optional(),
  documentation: z.string().url().optional(),
  
  // Resolution information
  resolution: z.object({
    automatic: z.boolean().default(true),
    order: z.number().min(0).default(0),
    strategy: z.enum(['eager', 'lazy', 'on-demand']).default('eager')
  }).optional(),
  
  // Constraints for this relationship
  constraints: z.array(DependencyConstraintSchema).default([]),
  
  // Lifecycle information
  introduced: z.string().optional(), // Version when introduced
  deprecated: z.string().optional(), // Version when deprecated
  removed: z.string().optional(), // Version when removed
  
  // Relationship metadata
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  createdBy: z.string().optional()
});

export type ServiceDependencyRelationship = z.infer<typeof ServiceDependencyRelationshipSchema>;

/**
 * Dependency graph node
 */
export const DependencyGraphNodeSchema = z.object({
  id: z.string(),
  service: ServiceDependencyIdentifierSchema,
  
  // Node properties
  level: z.number().min(0).default(0), // Depth in dependency tree
  visited: z.boolean().default(false),
  processing: z.boolean().default(false),
  resolved: z.boolean().default(false),
  
  // Dependencies
  dependencies: z.array(z.string()).default([]), // Node IDs
  dependents: z.array(z.string()).default([]), // Node IDs that depend on this
  
  // Resolution metadata
  resolutionOrder: z.number().optional(),
  resolutionTime: z.number().optional(), // in milliseconds
  
  // Node metadata
  metadata: z.record(z.unknown()).default({})
});

export type DependencyGraphNode = z.infer<typeof DependencyGraphNodeSchema>;

/**
 * Dependency graph edge
 */
export const DependencyGraphEdgeSchema = z.object({
  id: z.string().uuid(),
  source: z.string(), // Source node ID
  target: z.string(), // Target node ID
  relationship: ServiceDependencyRelationshipSchema,
  
  // Edge properties
  weight: z.number().min(0).default(1.0),
  satisfied: z.boolean().default(false),
  
  // Edge metadata
  metadata: z.record(z.unknown()).default({})
});

export type DependencyGraphEdge = z.infer<typeof DependencyGraphEdgeSchema>;

/**
 * Service dependency graph
 */
export const ServiceDependencyGraphSchema = z.object({
  id: z.string().uuid(),
  name: z.string().optional(),
  description: z.string().optional(),
  
  // Graph structure
  nodes: z.array(DependencyGraphNodeSchema),
  edges: z.array(DependencyGraphEdgeSchema),
  
  // Graph properties
  acyclic: z.boolean().default(true),
  connected: z.boolean().default(true),
  
  // Circular dependency detection
  cycles: z.array(z.object({
    id: z.string().uuid(),
    nodes: z.array(z.string()), // Node IDs forming the cycle
    edges: z.array(z.string()), // Edge IDs forming the cycle
    severity: z.enum(['warning', 'error', 'critical']).default('error'),
    resolution: z.string().optional()
  })).default([]),
  
  // Graph statistics
  statistics: z.object({
    totalNodes: z.number().min(0),
    totalEdges: z.number().min(0),
    maxDepth: z.number().min(0),
    averageDepth: z.number().min(0),
    cycleCount: z.number().min(0),
    complexityScore: z.number().min(0).max(100)
  }).optional(),
  
  // Graph metadata
  version: z.string().default('1.0.0'),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date())
});

export type ServiceDependencyGraph = z.infer<typeof ServiceDependencyGraphSchema>;

/**
 * Dependency resolution strategy
 */
export const DependencyResolutionStrategySchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  
  // Strategy configuration
  algorithm: z.enum([
    'topological-sort',
    'depth-first-search',
    'breadth-first-search',
    'kahn-algorithm',
    'custom'
  ]).default('topological-sort'),
  
  // Resolution behavior
  failureHandling: z.enum([
    'fail-fast',
    'continue-on-error',
    'best-effort',
    'rollback-on-failure'
  ]).default('fail-fast'),
  
  // Conflict resolution
  conflictResolution: z.enum([
    'prefer-explicit',
    'prefer-latest',
    'prefer-stable',
    'manual-resolution'
  ]).default('prefer-explicit'),
  
  // Optimization settings
  optimization: z.object({
    parallelResolution: z.boolean().default(false),
    cacheResults: z.boolean().default(true),
    pruneOptional: z.boolean().default(false),
    maxDepth: z.number().min(1).default(100)
  }).optional(),
  
  // Strategy metadata
  version: z.string().default('1.0.0'),
  createdAt: z.date().default(() => new Date())
});

export type DependencyResolutionStrategy = z.infer<typeof DependencyResolutionStrategySchema>;

/**
 * Dependency resolution result
 */
export const DependencyResolutionResultSchema = z.object({
  id: z.string().uuid(),
  strategy: z.string(), // Strategy name
  
  // Resolution status
  success: z.boolean(),
  partial: z.boolean().default(false),
  
  // Resolved dependencies
  resolved: z.array(z.object({
    service: ServiceDependencyIdentifierSchema,
    order: z.number().min(0),
    level: z.number().min(0),
    satisfied: z.boolean()
  })),
  
  // Unresolved dependencies
  unresolved: z.array(z.object({
    service: ServiceDependencyIdentifierSchema,
    reason: z.string(),
    suggestions: z.array(ServiceDependencyIdentifierSchema).default([])
  })).default([]),
  
  // Conflicts and issues
  conflicts: z.array(z.object({
    type: z.enum(['version', 'incompatibility', 'circular', 'missing']),
    services: z.array(ServiceDependencyIdentifierSchema),
    description: z.string(),
    severity: z.enum(['warning', 'error', 'critical']).default('error'),
    resolution: z.string().optional()
  })).default([]),
  
  // Resolution metadata
  resolutionTime: z.number().optional(), // in milliseconds
  graphComplexity: z.number().min(0).max(100).optional(),
  
  // Alternative solutions
  alternatives: z.array(z.object({
    description: z.string(),
    changes: z.array(z.object({
      action: z.enum(['add', 'remove', 'replace', 'upgrade', 'downgrade']),
      service: ServiceDependencyIdentifierSchema,
      reason: z.string()
    })),
    score: z.number().min(0).max(100) // Quality score
  })).default([]),
  
  // Result metadata
  resolvedAt: z.date().default(() => new Date()),
  metadata: z.record(z.unknown()).default({})
});

export type DependencyResolutionResult = z.infer<typeof DependencyResolutionResultSchema>;

/**
 * Dependency analysis report
 */
export const DependencyAnalysisReportSchema = z.object({
  id: z.string().uuid(),
  targetServices: z.array(ServiceDependencyIdentifierSchema),
  
  // Analysis results
  graph: ServiceDependencyGraphSchema,
  resolution: DependencyResolutionResultSchema,
  
  // Analysis insights
  insights: z.array(z.object({
    type: z.enum(['optimization', 'risk', 'opportunity', 'warning']),
    title: z.string(),
    description: z.string(),
    impact: z.enum(['low', 'medium', 'high']).default('medium'),
    recommendation: z.string().optional()
  })).default([]),
  
  // Security analysis
  security: z.object({
    vulnerabilities: z.array(z.object({
      service: ServiceDependencyIdentifierSchema,
      severity: z.enum(['low', 'medium', 'high', 'critical']),
      description: z.string(),
      cve: z.string().optional(),
      fix: z.string().optional()
    })).default([]),
    licenses: z.array(z.object({
      service: ServiceDependencyIdentifierSchema,
      license: z.string(),
      compatible: z.boolean(),
      issues: z.array(z.string()).default([])
    })).default([])
  }).optional(),
  
  // Performance analysis
  performance: z.object({
    bundleSize: z.object({
      total: z.number().optional(),
      byService: z.record(z.number()).default({})
    }).optional(),
    loadTime: z.object({
      estimated: z.number().optional(),
      critical: z.array(z.string()).default([])
    }).optional()
  }).optional(),
  
  // Report metadata
  generatedAt: z.date().default(() => new Date()),
  generatedBy: z.string().optional(),
  version: z.string().default('1.0.0')
});

export type DependencyAnalysisReport = z.infer<typeof DependencyAnalysisReportSchema>;