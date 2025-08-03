/**
 * Service Injection Schema
 * 
 * Defines schemas for service injection operations, tracking, and management.
 * Supports complex injection workflows and rollback capabilities.
 * 
 * @author Backend Expert Agent
 * @since 2025-01-03
 */

import { z } from 'zod';
import { 
  ServiceTypeSchema, 
  ServiceEnvironmentSchema, 
  ServiceConfigSchema,
  ServiceInjectionResultSchema
} from './service-definition.schema';

/**
 * Injection strategy types
 */
export const InjectionStrategyTypeSchema = z.enum([
  'immediate',     // Inject immediately
  'staged',        // Inject in stages
  'conditional',   // Inject based on conditions
  'lazy',          // Inject when needed
  'batch',         // Inject as batch operation
  'atomic'         // All-or-nothing injection
]);

export type InjectionStrategyType = z.infer<typeof InjectionStrategyTypeSchema>;

/**
 * Injection phase definitions
 */
export const InjectionPhaseSchema = z.enum([
  'pre-validation',
  'validation',
  'dependency-resolution',
  'backup',
  'file-injection',
  'configuration',
  'post-injection',
  'verification',
  'cleanup'
]);

export type InjectionPhase = z.infer<typeof InjectionPhaseSchema>;

/**
 * Injection operation status
 */
export const InjectionOperationStatusSchema = z.enum([
  'pending',
  'running',
  'completed',
  'failed',
  'cancelled',
  'rolled-back',
  'partial'
]);

export type InjectionOperationStatus = z.infer<typeof InjectionOperationStatusSchema>;

/**
 * Service injection options with enhanced capabilities
 */
export const ServiceInjectionOptionsSchema = z.object({
  // Execution options
  dryRun: z.boolean().default(false),
  force: z.boolean().default(false),
  overwrite: z.boolean().default(false),
  skipValidation: z.boolean().default(false),
  skipBackup: z.boolean().default(false),
  
  // Strategy and phases
  strategy: InjectionStrategyTypeSchema.default('immediate'),
  phases: z.array(InjectionPhaseSchema).optional(),
  
  // Environment and context
  environment: ServiceEnvironmentSchema.optional(),
  context: z.record(z.unknown()).default({}),
  
  // File handling
  backup: z.object({
    enabled: z.boolean().default(true),
    path: z.string().optional(),
    compression: z.boolean().default(true),
    retention: z.string().default('7d') // 7 days
  }).optional(),
  
  // Rollback configuration
  rollback: z.object({
    enabled: z.boolean().default(true),
    automatic: z.boolean().default(false),
    conditions: z.array(z.enum(['error', 'timeout', 'validation-failure'])).default(['error']),
    maxRetries: z.number().min(0).max(5).default(3)
  }).optional(),
  
  // Concurrency and performance
  concurrency: z.object({
    maxParallel: z.number().min(1).max(10).default(3),
    timeout: z.number().min(1000).default(300000), // 5 minutes
    retryDelay: z.number().min(0).default(1000) // 1 second
  }).optional(),
  
  // Validation options
  validation: z.object({
    strict: z.boolean().default(true),
    checkCompatibility: z.boolean().default(true),
    checkDependencies: z.boolean().default(true),
    checkConflicts: z.boolean().default(true)
  }).optional(),
  
  // Notification and reporting
  notifications: z.object({
    enabled: z.boolean().default(false),
    channels: z.array(z.enum(['console', 'email', 'webhook', 'slack'])).default(['console']),
    events: z.array(z.enum(['start', 'complete', 'error', 'warning'])).default(['complete', 'error'])
  }).optional(),
  
  // Custom configuration
  customConfig: z.record(z.unknown()).default({})
});

export type ServiceInjectionOptions = z.infer<typeof ServiceInjectionOptionsSchema>;

/**
 * Injection step definition
 */
export const InjectionStepSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  phase: InjectionPhaseSchema,
  order: z.number().min(0).default(0),
  description: z.string().optional(),
  
  // Step execution
  command: z.string().optional(),
  script: z.string().optional(),
  function: z.string().optional(),
  
  // Step conditions
  condition: z.string().optional(), // Handlebars condition
  dependsOn: z.array(z.string()).default([]), // Step IDs
  
  // Step configuration
  timeout: z.number().min(1000).default(30000),
  retries: z.number().min(0).max(5).default(0),
  continueOnError: z.boolean().default(false),
  
  // Step validation
  validation: z.object({
    required: z.boolean().default(true),
    checks: z.array(z.object({
      name: z.string(),
      command: z.string(),
      expectedOutput: z.string().optional(),
      expectedExitCode: z.number().default(0)
    })).default([])
  }).optional(),
  
  // Step metadata
  tags: z.array(z.string()).default([]),
  metadata: z.record(z.unknown()).default({})
});

export type InjectionStep = z.infer<typeof InjectionStepSchema>;

/**
 * Injection workflow definition
 */
export const InjectionWorkflowSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  version: z.string().default('1.0.0'),
  
  // Workflow structure
  steps: z.array(InjectionStepSchema),
  phases: z.array(z.object({
    name: InjectionPhaseSchema,
    parallel: z.boolean().default(false),
    continueOnError: z.boolean().default(false),
    timeout: z.number().min(1000).default(300000)
  })).default([]),
  
  // Workflow configuration
  strategy: InjectionStrategyTypeSchema.default('immediate'),
  rollbackStrategy: z.enum(['step-by-step', 'phase-by-phase', 'all-or-nothing']).default('step-by-step'),
  
  // Workflow metadata
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  createdBy: z.string().optional()
});

export type InjectionWorkflow = z.infer<typeof InjectionWorkflowSchema>;

/**
 * Injection operation tracking
 */
export const InjectionOperationSchema = z.object({
  id: z.string().uuid(),
  serviceId: z.string(),
  workflowId: z.string().optional(),
  
  // Operation details
  status: InjectionOperationStatusSchema,
  phase: InjectionPhaseSchema.optional(),
  currentStep: z.string().optional(), // Step ID
  
  // Timestamps
  startedAt: z.date(),
  completedAt: z.date().optional(),
  duration: z.number().optional(), // in milliseconds
  
  // Operation context
  projectPath: z.string(),
  environment: ServiceEnvironmentSchema.optional(),
  options: ServiceInjectionOptionsSchema,
  
  // Progress tracking
  progress: z.object({
    totalSteps: z.number().min(0),
    completedSteps: z.number().min(0),
    failedSteps: z.number().min(0),
    skippedSteps: z.number().min(0),
    percentage: z.number().min(0).max(100)
  }).optional(),
  
  // Step results
  stepResults: z.array(z.object({
    stepId: z.string(),
    status: z.enum(['pending', 'running', 'completed', 'failed', 'skipped']),
    startedAt: z.date(),
    completedAt: z.date().optional(),
    duration: z.number().optional(),
    output: z.string().optional(),
    error: z.string().optional(),
    metadata: z.record(z.unknown()).default({})
  })).default([]),
  
  // Operation results
  result: ServiceInjectionResultSchema.optional(),
  
  // Rollback information
  rollback: z.object({
    enabled: z.boolean(),
    triggered: z.boolean().default(false),
    reason: z.string().optional(),
    startedAt: z.date().optional(),
    completedAt: z.date().optional(),
    steps: z.array(z.string()).default([])
  }).optional(),
  
  // Operation metadata
  metadata: z.record(z.unknown()).default({}),
  logs: z.array(z.object({
    level: z.enum(['debug', 'info', 'warn', 'error']),
    message: z.string(),
    timestamp: z.date(),
    context: z.record(z.unknown()).default({})
  })).default([])
});

export type InjectionOperation = z.infer<typeof InjectionOperationSchema>;

/**
 * Injection history entry
 */
export const InjectionHistoryEntrySchema = z.object({
  operationId: z.string().uuid(),
  serviceId: z.string(),
  serviceType: ServiceTypeSchema,
  provider: z.string(),
  action: z.enum(['inject', 'update', 'remove', 'rollback']),
  
  // History metadata
  timestamp: z.date(),
  user: z.string().optional(),
  environment: ServiceEnvironmentSchema.optional(),
  
  // Operation summary
  success: z.boolean(),
  duration: z.number().optional(),
  filesAffected: z.number().min(0).default(0),
  
  // Change tracking
  changes: z.object({
    filesCreated: z.array(z.string()).default([]),
    filesModified: z.array(z.string()).default([]),
    filesDeleted: z.array(z.string()).default([]),
    configChanges: z.record(z.object({
      from: z.unknown(),
      to: z.unknown()
    })).default({})
  }).optional(),
  
  // Related operations
  relatedOperations: z.array(z.string()).default([]), // Operation IDs
  rollbackOf: z.string().optional(), // Operation ID
  
  // Additional metadata
  notes: z.string().optional(),
  tags: z.array(z.string()).default([])
});

export type InjectionHistoryEntry = z.infer<typeof InjectionHistoryEntrySchema>;

/**
 * Service injection state
 */
export const ServiceInjectionStateSchema = z.object({
  projectPath: z.string(),
  
  // Active services
  services: z.array(z.object({
    serviceId: z.string(),
    config: ServiceConfigSchema,
    injectedAt: z.date(),
    lastUpdated: z.date().optional(),
    status: z.enum(['active', 'inactive', 'error', 'updating']),
    metadata: z.record(z.unknown()).default({})
  })).default([]),
  
  // Active operations
  activeOperations: z.array(z.string()).default([]), // Operation IDs
  
  // History
  history: z.array(InjectionHistoryEntrySchema).default([]),
  
  // State metadata
  version: z.string().default('1.0.0'),
  lastUpdated: z.date(),
  checksum: z.string().optional()
});

export type ServiceInjectionState = z.infer<typeof ServiceInjectionStateSchema>;

/**
 * Bulk injection request
 */
export const BulkInjectionRequestSchema = z.object({
  services: z.array(z.object({
    config: ServiceConfigSchema,
    options: ServiceInjectionOptionsSchema.optional()
  })).min(1),
  
  // Bulk operation options
  strategy: z.enum(['sequential', 'parallel', 'dependency-order']).default('dependency-order'),
  failureStrategy: z.enum(['stop-on-first-failure', 'continue-on-failure', 'rollback-on-failure']).default('rollback-on-failure'),
  
  // Global options
  globalOptions: ServiceInjectionOptionsSchema.optional(),
  
  // Request metadata
  requestId: z.string().uuid(),
  requestedBy: z.string().optional(),
  requestedAt: z.date().default(() => new Date())
});

export type BulkInjectionRequest = z.infer<typeof BulkInjectionRequestSchema>;

/**
 * Bulk injection result
 */
export const BulkInjectionResultSchema = z.object({
  requestId: z.string().uuid(),
  success: z.boolean(),
  
  // Operation results
  operations: z.array(z.object({
    serviceId: z.string(),
    operationId: z.string(),
    result: ServiceInjectionResultSchema
  })),
  
  // Summary
  summary: z.object({
    totalServices: z.number().min(0),
    successfulServices: z.number().min(0),
    failedServices: z.number().min(0),
    skippedServices: z.number().min(0),
    totalDuration: z.number().optional()
  }),
  
  // Rollback information
  rollback: z.object({
    performed: z.boolean().default(false),
    reason: z.string().optional(),
    affectedOperations: z.array(z.string()).default([])
  }).optional(),
  
  // Result metadata
  completedAt: z.date(),
  metadata: z.record(z.unknown()).default({})
});

export type BulkInjectionResult = z.infer<typeof BulkInjectionResultSchema>;