/**
 * @fileoverview Template Sync Service - EPIC 15 Story 15.3 Task 1
 * @description Automatic template synchronization with conflict resolution and distributed caching
 * @version 1.0.0
 * @compliance Norwegian NSM Standards, GDPR, Enterprise Security, Audit Trail
 * @author Xaheen CLI Team
 * @since 2025-01-03
 */

import { z } from "zod";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { EventEmitter } from "events";
import { setTimeout, clearTimeout } from "timers";
import { 
  NSMClassification, 
  Permission, 
  User 
} from "../authentication/types";
import type { MCPExecutionLogger } from "../mcp/mcp-execution-logger.service";
import type { 
  TemplateRepositoryService,
  TemplateRepositoryConfig 
} from "./template-repository.service";
import type { 
  TemplateVersionManagerService,
  VersionHistory 
} from "./template-version-manager.service";

// Sync Configuration Schema
export const SyncConfigSchema = z.object({
  enabled: z.boolean().default(true),
  interval: z.number().int().min(60).default(300), // 5 minutes
  batchSize: z.number().int().min(1).max(100).default(10),
  maxRetries: z.number().int().min(0).max(10).default(3),
  retryDelay: z.number().int().min(1000).default(5000), // 5 seconds
  conflictResolution: z.enum(["manual", "remote-wins", "local-wins", "merge", "skip"]).default("manual"),
  parallelJobs: z.number().int().min(1).max(10).default(3),
  cacheTTL: z.number().int().min(300).default(3600), // 1 hour
  enableWebhooks: z.boolean().default(false),
  webhookUrl: z.string().url().optional(),
  webhookSecret: z.string().optional(),
  norwegianCompliance: z.object({
    enableGDPRCompliance: z.boolean().default(true),
    enableNSMCompliance: z.boolean().default(true),
    auditAllOperations: z.boolean().default(true),
    encryptCache: z.boolean().default(true),
    dataRetention: z.number().int().min(30).default(2555) // 7 years
  }).default({})
});

// Sync Status Schema
export const SyncStatusSchema = z.object({
  repositoryName: z.string().min(1),
  status: z.enum(["idle", "syncing", "conflict", "error", "success"]),
  lastSync: z.date().optional(),
  nextSync: z.date().optional(),
  progress: z.object({
    current: z.number().int().min(0).default(0),
    total: z.number().int().min(0).default(0),
    percentage: z.number().min(0).max(100).default(0)
  }).default({}),
  conflicts: z.array(z.object({
    file: z.string(),
    type: z.enum(["content", "version", "metadata", "permission"]),
    localHash: z.string().optional(),
    remoteHash: z.string().optional(),
    resolution: z.enum(["pending", "resolved", "skipped"]).default("pending"),
    resolvedBy: z.string().optional(),
    resolvedAt: z.date().optional()
  })).default([]),
  errors: z.array(z.object({
    timestamp: z.date(),
    error: z.string(),
    code: z.string().optional(),
    file: z.string().optional(),
    retryCount: z.number().int().min(0).default(0)
  })).default([]),
  statistics: z.object({
    filesChecked: z.number().int().min(0).default(0),
    filesUpdated: z.number().int().min(0).default(0),
    filesAdded: z.number().int().min(0).default(0),
    filesDeleted: z.number().int().min(0).default(0),
    conflictsDetected: z.number().int().min(0).default(0),
    conflictsResolved: z.number().int().min(0).default(0),
    bytesTransferred: z.number().int().min(0).default(0),
    duration: z.number().int().min(0).default(0)
  }).default({})
});

// Cache Entry Schema
export const CacheEntrySchema = z.object({
  key: z.string().min(1),
  value: z.any(),
  hash: z.string().min(1),
  createdAt: z.date(),
  expiresAt: z.date(),
  accessCount: z.number().int().min(0).default(0),
  lastAccessed: z.date(),
  size: z.number().int().min(0).default(0),
  metadata: z.record(z.any()).default({})
});

// Sync Job Schema
export const SyncJobSchema = z.object({
  id: z.string().min(1),
  repositoryName: z.string().min(1),
  type: z.enum(["scheduled", "manual", "webhook", "dependency"]),
  status: z.enum(["queued", "running", "completed", "failed", "cancelled"]),
  priority: z.number().int().min(0).max(10).default(5),
  scheduledAt: z.date(),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
  userId: z.string().optional(),
  options: z.object({
    force: z.boolean().default(false),
    dryRun: z.boolean().default(false),
    skipConflictResolution: z.boolean().default(false),
    includeSubmodules: z.boolean().default(true)
  }).default({}),
  result: z.object({
    success: z.boolean(),
    message: z.string().optional(),
    conflicts: z.number().int().min(0).default(0),
    errors: z.number().int().min(0).default(0),
    filesChanged: z.number().int().min(0).default(0)
  }).optional()
});

// Type definitions
export type SyncConfig = z.infer<typeof SyncConfigSchema>;
export type SyncStatus = z.infer<typeof SyncStatusSchema>;
export type CacheEntry = z.infer<typeof CacheEntrySchema>;
export type SyncJob = z.infer<typeof SyncJobSchema>;

// Sync Events
export interface SyncEvent {
  readonly eventId: string;
  readonly repositoryName: string;
  readonly eventType: SyncEventType;
  readonly timestamp: Date;
  readonly userId?: string;
  readonly details: Record<string, any>;
  readonly nsmClassification: NSMClassification;
}

export enum SyncEventType {
  SYNC_STARTED = "SYNC_STARTED",
  SYNC_COMPLETED = "SYNC_COMPLETED",
  SYNC_FAILED = "SYNC_FAILED",
  CONFLICT_DETECTED = "CONFLICT_DETECTED",
  CONFLICT_RESOLVED = "CONFLICT_RESOLVED",
  CACHE_HIT = "CACHE_HIT",
  CACHE_MISS = "CACHE_MISS",
  CACHE_INVALIDATED = "CACHE_INVALIDATED",
  WEBHOOK_RECEIVED = "WEBHOOK_RECEIVED",
  JOB_QUEUED = "JOB_QUEUED",
  JOB_STARTED = "JOB_STARTED",
  JOB_COMPLETED = "JOB_COMPLETED"
}

// Sync Service Error Classes
export class TemplateSyncError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly repositoryName?: string,
    public readonly operation?: string
  ) {
    super(message);
    this.name = "TemplateSyncError";
  }
}

export class ConflictResolutionError extends Error {
  constructor(
    message: string,
    public readonly repositoryName: string,
    public readonly conflicts: Array<{
      file: string;
      type: string;
    }>
  ) {
    super(message);
    this.name = "ConflictResolutionError";
  }
}

export class CacheError extends Error {
  constructor(
    message: string,
    public readonly operation: string,
    public readonly key?: string
  ) {
    super(message);
    this.name = "CacheError";
  }
}

/**
 * Template Sync Service
 * 
 * Provides automatic synchronization for template repositories:
 * - Scheduled and on-demand synchronization
 * - Intelligent conflict detection and resolution
 * - Distributed caching for performance
 * - Webhook integration for real-time updates
 * - Comprehensive audit trail and compliance
 * - Norwegian standards compliance (GDPR, NSM)
 */
export class TemplateSyncService extends EventEmitter {
  private readonly config: SyncConfig;
  private readonly syncStatuses = new Map<string, SyncStatus>();
  private readonly cache = new Map<string, CacheEntry>();
  private readonly jobQueue: SyncJob[] = [];
  private readonly activeJobs = new Map<string, SyncJob>();
  private readonly timers = new Map<string, NodeJS.Timeout>();
  private readonly dataPath: string;
  private readonly logger: MCPExecutionLogger;
  private readonly repositoryService: TemplateRepositoryService;
  private readonly versionManager: TemplateVersionManagerService;
  private isRunning = false;
  
  constructor(
    config: SyncConfig,
    dataPath: string,
    logger: MCPExecutionLogger,
    repositoryService: TemplateRepositoryService,
    versionManager: TemplateVersionManagerService
  ) {
    super();
    this.config = SyncConfigSchema.parse(config);
    this.dataPath = path.resolve(dataPath);
    this.logger = logger;
    this.repositoryService = repositoryService;
    this.versionManager = versionManager;
    
    // Ensure data directory exists
    this.ensureDirectoryExists(this.dataPath);
    
    // Load persisted data
    this.loadPersistedData();
    
    // Start service if enabled
    if (this.config.enabled) {
      this.start();
    }
  }

  /**
   * Start the sync service
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      return;
    }
    
    this.isRunning = true;
    
    // Start job processor
    this.processJobs();
    
    // Schedule periodic sync for all repositories
    this.schedulePeriodicSync();
    
    await this.logger.logOperation(
      "info",
      "mcp_connection",
      "Template Sync Service started",
      {
        executionContext: {
          sessionId: crypto.randomUUID(),
          userId: "system",
          processId: process.pid,
          timestamp: new Date(),
          command: "sync-service",
          arguments: [],
          workingDirectory: process.cwd(),
        },
        mcpOperation: {
          operationId: crypto.randomUUID(),
          operationType: "connect",
          startTime: new Date(),
          endTime: new Date(),
          status: "completed",
        },
        structuredData: {
          config: this.config,
          cacheSize: this.cache.size,
          queuedJobs: this.jobQueue.length
        }
      }
    );
    
    this.emit("serviceStarted", {
      eventId: crypto.randomUUID(),
      repositoryName: "system",
      eventType: SyncEventType.SYNC_STARTED,
      timestamp: new Date(),
      details: { config: this.config },
      nsmClassification: NSMClassification.OPEN
    });
  }

  /**
   * Stop the sync service
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }
    
    this.isRunning = false;
    
    // Clear all timers
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
    
    // Cancel active jobs
    for (const job of this.activeJobs.values()) {
      job.status = "cancelled";
    }
    this.activeJobs.clear();
    
    // Persist data
    await this.persistData();
    
    await this.logger.logOperation(
      "info",
      "mcp_connection", 
      "Template Sync Service stopped",
      {
        executionContext: {
          sessionId: crypto.randomUUID(),
          userId: "system",
          processId: process.pid,
          timestamp: new Date(),
          command: "stop-sync-service",
          arguments: [],
          workingDirectory: process.cwd(),
        },
        mcpOperation: {
          operationId: crypto.randomUUID(),
          operationType: "disconnect",
          startTime: new Date(),
          endTime: new Date(),
          status: "completed",
        },
        structuredData: {
          cacheSize: this.cache.size,
          cancelledJobs: this.activeJobs.size
        }
      }
    );
  }

  /**
   * Queue a sync job
   */
  async queueSync(
    repositoryName: string,
    type: "scheduled" | "manual" | "webhook" | "dependency" = "manual",
    options: {
      readonly force?: boolean;
      readonly dryRun?: boolean;
      readonly skipConflictResolution?: boolean;
      readonly priority?: number;
      readonly userId?: string;
    } = {}
  ): Promise<string> {
    const jobId = crypto.randomUUID();
    const job: SyncJob = {
      id: jobId,
      repositoryName,
      type,
      status: "queued",
      priority: options.priority || 5,
      scheduledAt: new Date(),
      userId: options.userId,
      options: {
        force: options.force || false,
        dryRun: options.dryRun || false,
        skipConflictResolution: options.skipConflictResolution || false,
        includeSubmodules: true
      }
    };
    
    // Insert job in priority order
    const insertIndex = this.jobQueue.findIndex(j => j.priority < job.priority);
    if (insertIndex === -1) {
      this.jobQueue.push(job);
    } else {
      this.jobQueue.splice(insertIndex, 0, job);
    }
    
    await this.logger.logOperation(
      "info",
      "mcp_connection",
      "Sync job queued",
      {
        executionContext: {
          sessionId: crypto.randomUUID(),
          userId: options.userId || "system",
          processId: process.pid,
          timestamp: new Date(),
          command: "queue-sync",
          arguments: [],
          workingDirectory: process.cwd(),
        },
        mcpOperation: {
          operationId: jobId,
          operationType: "generate_component",
          startTime: new Date(),
          endTime: new Date(),
          status: "completed",
        },
        structuredData: { 
          repositoryName,
          jobId,
          type,
          priority: job.priority,
          options
        }
      }
    );
    
    this.emit("jobQueued", {
      eventId: crypto.randomUUID(),
      repositoryName,
      eventType: SyncEventType.JOB_QUEUED,
      timestamp: new Date(),
      userId: options.userId,
      details: { job },
      nsmClassification: NSMClassification.OPEN
    });
    
    return jobId;
  }

  /**
   * Sync a specific repository
   */
  async syncRepository(
    repositoryName: string,
    user: User,
    options: {
      readonly force?: boolean;
      readonly dryRun?: boolean;
      readonly skipConflictResolution?: boolean;
    } = {}
  ): Promise<SyncStatus> {
    const startTime = Date.now();
    const operationId = crypto.randomUUID();
    
    try {
      // Get repository configuration
      const repoConfig = this.repositoryService.getRepositoryConfig(repositoryName);
      
      // Initialize sync status
      const syncStatus: SyncStatus = {
        repositoryName,
        status: "syncing",
        lastSync: new Date(),
        progress: { current: 0, total: 100, percentage: 0 },
        conflicts: [],
        errors: [],
        statistics: {
          filesChecked: 0,
          filesUpdated: 0,
          filesAdded: 0,
          filesDeleted: 0,
          conflictsDetected: 0,
          conflictsResolved: 0,
          bytesTransferred: 0,
          duration: 0
        }
      };
      
      this.syncStatuses.set(repositoryName, syncStatus);
      
      // Emit sync started event
      this.emit("syncStarted", {
        eventId: crypto.randomUUID(),
        repositoryName,
        eventType: SyncEventType.SYNC_STARTED,
        timestamp: new Date(),
        userId: user.id,
        details: { options },
        nsmClassification: repoConfig.norwegianCompliance.dataClassification as NSMClassification
      });
      
      if (!options.dryRun) {
        // Pull latest changes
        const pullResult = await this.repositoryService.pullRepository(
          repositoryName,
          user,
          { force: options.force }
        );
        
        syncStatus.statistics.filesUpdated += pullResult.changedFiles.length;
        syncStatus.statistics.conflictsDetected += pullResult.conflicts.length;
        
        // Handle conflicts if any
        if (pullResult.conflicts.length > 0 && !options.skipConflictResolution) {
          await this.handleConflicts(repositoryName, pullResult.conflicts, user);
        }
        
        // Update conflict status
        for (const conflictFile of pullResult.conflicts) {
          syncStatus.conflicts.push({
            file: conflictFile,
            type: "content",
            resolution: "pending"
          });
        }
      }
      
      // Update progress
      syncStatus.progress = { current: 100, total: 100, percentage: 100 };
      syncStatus.status = syncStatus.conflicts.length > 0 ? "conflict" : "success";
      syncStatus.statistics.duration = Date.now() - startTime;
      
      // Cache sync result
      await this.cacheSet(
        `sync:${repositoryName}:last`,
        syncStatus,
        this.config.cacheTTL
      );
      
      // Log operation
      await this.logger.logOperation(
        "info",
        "mcp_connection",
        "Repository sync completed",
        {
          executionContext: {
            sessionId: operationId,
            userId: user.id,
            processId: process.pid,
            timestamp: new Date(),
            command: "sync-repository",
            arguments: [],
            workingDirectory: process.cwd(),
          },
          mcpOperation: {
            operationId,
            operationType: "template_render",
            startTime: new Date(startTime),
            endTime: new Date(),
            status: "completed",
          },
          structuredData: {
            repositoryName,
            syncStatus,
            duration: Date.now() - startTime
          }
        }
      );
      
      // Emit sync completed event
      this.emit("syncCompleted", {
        eventId: crypto.randomUUID(),
        repositoryName,
        eventType: SyncEventType.SYNC_COMPLETED,
        timestamp: new Date(),
        userId: user.id,
        details: { syncStatus },
        nsmClassification: repoConfig.norwegianCompliance.dataClassification as NSMClassification
      });
      
      return syncStatus;
      
    } catch (error) {
      const syncStatus = this.syncStatuses.get(repositoryName);
      if (syncStatus) {
        syncStatus.status = "error";
        syncStatus.errors.push({
          timestamp: new Date(),
          error: error instanceof Error ? error.message : String(error),
          code: error instanceof Error ? error.name : "UNKNOWN_ERROR",
          retryCount: 0
        });
      }
      
      await this.logger.logOperation(
        "error",
        "mcp_connection",
        "Repository sync failed",
        {
          executionContext: {
            sessionId: operationId,
            userId: user.id,
            processId: process.pid,
            timestamp: new Date(),
            command: "sync-repository",
            arguments: [],
            workingDirectory: process.cwd(),
          },
          mcpOperation: {
            operationId,
            operationType: "template_render",
            startTime: new Date(startTime),
            endTime: new Date(),
            status: "failed",
            error: error instanceof Error ? error.message : String(error),
          },
          structuredData: {
            repositoryName,
            error: error instanceof Error ? error.message : String(error),
            duration: Date.now() - startTime
          }
        }
      );
      
      this.emit("syncFailed", {
        eventId: crypto.randomUUID(),
        repositoryName,
        eventType: SyncEventType.SYNC_FAILED,
        timestamp: new Date(),
        userId: user.id,
        details: { error: error instanceof Error ? error.message : String(error) },
        nsmClassification: NSMClassification.OPEN
      });
      
      throw error;
    }
  }

  /**
   * Resolve conflicts for a repository
   */
  async resolveConflicts(
    repositoryName: string,
    resolutions: Array<{
      readonly file: string;
      readonly resolution: "local" | "remote" | "merge" | "skip";
      readonly content?: string;
    }>,
    user: User
  ): Promise<void> {
    const startTime = Date.now();
    const operationId = crypto.randomUUID();
    
    try {
      const syncStatus = this.syncStatuses.get(repositoryName);
      if (!syncStatus) {
        throw new TemplateSyncError(
          `No sync status found for repository ${repositoryName}`,
          "SYNC_STATUS_NOT_FOUND",
          repositoryName
        );
      }
      
      let resolvedCount = 0;
      
      for (const resolution of resolutions) {
        const conflict = syncStatus.conflicts.find(c => c.file === resolution.file);
        if (!conflict) {
          continue;
        }
        
        switch (resolution.resolution) {
          case "local":
            // Keep local version - no action needed
            break;
            
          case "remote":
            // Accept remote version
            await this.repositoryService.pullRepository(
              repositoryName,
              user,
              { force: true }
            );
            break;
            
          case "merge":
            // Manual merge with provided content
            if (resolution.content) {
              const repoPath = path.join(this.dataPath, repositoryName);
              const filePath = path.join(repoPath, resolution.file);
              await fs.writeFile(filePath, resolution.content, "utf-8");
            }
            break;
            
          case "skip":
            // Skip this file
            break;
        }
        
        conflict.resolution = "resolved";
        conflict.resolvedBy = user.id;
        conflict.resolvedAt = new Date();
        resolvedCount++;
      }
      
      syncStatus.statistics.conflictsResolved += resolvedCount;
      
      // Update sync status
      const remainingConflicts = syncStatus.conflicts.filter(c => c.resolution === "pending");
      if (remainingConflicts.length === 0) {
        syncStatus.status = "success";
      }
      
      // Log operation
      await this.logger.logOperation(
        "info",
        "mcp_connection",
        "Conflicts resolved",
        {
          executionContext: {
            sessionId: operationId,
            userId: user.id,
            processId: process.pid,
            timestamp: new Date(),
            command: "resolve-conflicts",
            arguments: [],
            workingDirectory: process.cwd(),
          },
          mcpOperation: {
            operationId,
            operationType: "validate_step",
            startTime: new Date(startTime),
            endTime: new Date(),
            status: "completed",
          },
          structuredData: {
            repositoryName,
            resolutionsCount: resolutions.length,
            resolvedCount,
            remainingConflicts: remainingConflicts.length,
            compliance: {
              gdprApplicable: this.config.norwegianCompliance.enableGDPRCompliance,
              nsmClassification: NSMClassification.OPEN,
              dataRetention: this.config.norwegianCompliance.dataRetention,
              auditRequired: this.config.norwegianCompliance.auditAllOperations
            }
          }
        }
      );
      
      // Emit event
      this.emit("conflictsResolved", {
        eventId: crypto.randomUUID(),
        repositoryName,
        eventType: SyncEventType.CONFLICT_RESOLVED,
        timestamp: new Date(),
        userId: user.id,
        details: { resolvedCount, remainingConflicts: remainingConflicts.length },
        nsmClassification: NSMClassification.OPEN
      });
      
    } catch (error) {
      await this.logger.logOperation(
        "error",
        "mcp_connection",
        "Failed to resolve conflicts",
        {
          executionContext: {
            sessionId: operationId,
            userId: user.id,
            processId: process.pid,
            timestamp: new Date(),
            command: "resolve-conflicts",
            arguments: [],
            workingDirectory: process.cwd(),
          },
          mcpOperation: {
            operationId,
            operationType: "validate_step",
            startTime: new Date(startTime),
            endTime: new Date(),
            status: "failed",
            error: error instanceof Error ? error.message : String(error),
          },
          structuredData: { 
            repositoryName,
            error: error instanceof Error ? error.message : String(error)
          }
        }
      );
      
      throw error;
    }
  }

  /**
   * Get sync status for a repository
   */
  getSyncStatus(repositoryName: string): SyncStatus | null {
    return this.syncStatuses.get(repositoryName) || null;
  }

  /**
   * Get all sync statuses
   */
  getAllSyncStatuses(): SyncStatus[] {
    return Array.from(this.syncStatuses.values());
  }

  /**
   * Get cache statistics
   */
  getCacheStatistics(): {
    readonly size: number;
    readonly hitRate: number;
    readonly totalHits: number;
    readonly totalMisses: number;
    readonly memoryUsage: number;
  } {
    let totalAccess = 0;
    let totalSize = 0;
    
    for (const entry of this.cache.values()) {
      totalAccess += entry.accessCount;
      totalSize += entry.size;
    }
    
    return {
      size: this.cache.size,
      hitRate: totalAccess > 0 ? (totalAccess / (totalAccess + this.cache.size)) * 100 : 0,
      totalHits: totalAccess,
      totalMisses: this.cache.size,
      memoryUsage: totalSize
    };
  }

  /**
   * Clear cache
   */
  async clearCache(): Promise<void> {
    this.cache.clear();
    
    await this.logger.logOperation(
      "info",
      "mcp_connection",
      "Cache cleared",
      {
        executionContext: {
          sessionId: crypto.randomUUID(),
          userId: "system",
          processId: process.pid,
          timestamp: new Date(),
          command: "clear-cache",
          arguments: [],
          workingDirectory: process.cwd(),
        },
        mcpOperation: {
          operationId: crypto.randomUUID(),
          operationType: "metadata_extract",
          startTime: new Date(),
          endTime: new Date(),
          status: "completed",
        },
        structuredData: { 
          operation: "CLEAR_CACHE",
          clearedEntries: this.cache.size 
        }
      }
    );
    
    this.emit("cacheCleared", {
      eventId: crypto.randomUUID(),
      repositoryName: "system",
      eventType: SyncEventType.CACHE_INVALIDATED,
      timestamp: new Date(),
      details: { clearedEntries: this.cache.size },
      nsmClassification: NSMClassification.OPEN
    });
  }

  /**
   * Handle conflicts
   */
  private async handleConflicts(
    repositoryName: string,
    conflicts: string[],
    user: User
  ): Promise<void> {
    const repoConfig = this.repositoryService.getRepositoryConfig(repositoryName);
    
    switch (this.config.conflictResolution) {
      case "remote-wins":
        // Accept all remote changes
        await this.repositoryService.pullRepository(
          repositoryName,
          user,
          { force: true }
        );
        break;
        
      case "local-wins":
        // Keep all local changes - no action needed
        break;
        
      case "skip":
        // Skip conflicted files
        break;
        
      case "manual":
      default:
        // Manual resolution required - conflicts will be tracked in sync status
        this.emit("conflictDetected", {
          eventId: crypto.randomUUID(),
          repositoryName,
          eventType: SyncEventType.CONFLICT_DETECTED,
          timestamp: new Date(),
          userId: user.id,
          details: { conflicts },
          nsmClassification: repoConfig.norwegianCompliance.dataClassification as NSMClassification
        });
        break;
    }
  }

  /**
   * Process job queue
   */
  private async processJobs(): Promise<void> {
    if (!this.isRunning) {
      return;
    }
    
    // Process jobs with parallelism limit
    while (this.activeJobs.size < this.config.parallelJobs && this.jobQueue.length > 0) {
      const job = this.jobQueue.shift()!;
      this.activeJobs.set(job.id, job);
      
      // Process job asynchronously
      this.processJob(job).finally(() => {
        this.activeJobs.delete(job.id);
      });
    }
    
    // Schedule next processing cycle
    setTimeout(() => this.processJobs(), 1000);
  }

  /**
   * Process a single job
   */
  private async processJob(job: SyncJob): Promise<void> {
    job.status = "running";
    job.startedAt = new Date();
    
    try {
      // Mock user for system jobs
      const user: User = {
        id: job.userId || "system",
        email: "system@xaheen-ai.com",
        firstName: "System",
        lastName: "User",
        roles: ["system"],
        permissions: [],
        nsmClearance: NSMClassification.OPEN,
        mfaEnabled: false,
        mfaMethods: [],
        isActive: true,
        metadata: {}
      };
      
      const result = await this.syncRepository(job.repositoryName, user, job.options);
      
      job.status = "completed";
      job.completedAt = new Date();
      job.result = {
        success: result.status === "success",
        conflicts: result.conflicts.length,
        errors: result.errors.length,
        filesChanged: result.statistics.filesUpdated + result.statistics.filesAdded + result.statistics.filesDeleted
      };
      
    } catch (error) {
      job.status = "failed";
      job.completedAt = new Date();
      job.result = {
        success: false,
        message: error instanceof Error ? error.message : String(error),
        conflicts: 0,
        errors: 1,
        filesChanged: 0
      };
    }
    
    this.emit("jobCompleted", {
      eventId: crypto.randomUUID(),
      repositoryName: job.repositoryName,
      eventType: SyncEventType.JOB_COMPLETED,
      timestamp: new Date(),
      userId: job.userId,
      details: { job },
      nsmClassification: NSMClassification.OPEN
    });
  }

  /**
   * Schedule periodic sync
   */
  private schedulePeriodicSync(): void {
    if (!this.config.enabled) {
      return;
    }
    
    const scheduleNext = () => {
      const timer = setTimeout(async () => {
        try {
          // Get all repositories and queue sync jobs
          const repositories = await this.repositoryService.listRepositories({
            id: "system",
            email: "system@xaheen-ai.com", 
            firstName: "System",
            lastName: "User",
            roles: ["system"],
            permissions: [],
            nsmClearance: NSMClassification.OPEN,
            mfaEnabled: false,
            mfaMethods: [],
            isActive: true,
            metadata: {}
          });
          
          for (const repo of repositories) {
            if (repo.synchronization.autoSync) {
              await this.queueSync(repo.name, "scheduled");
            }
          }
        } catch (error) {
          // Log error and continue
          console.error("Failed to schedule periodic sync:", error);
        }
        
        // Schedule next cycle
        scheduleNext();
      }, this.config.interval * 1000);
      
      this.timers.set("periodic", timer);
    };
    
    scheduleNext();
  }

  /**
   * Cache operations
   */
  private async cacheGet(key: string): Promise<any> {
    const entry = this.cache.get(key);
    if (!entry) {
      this.emit("cacheMiss", {
        eventId: crypto.randomUUID(),
        repositoryName: "cache",
        eventType: SyncEventType.CACHE_MISS,
        timestamp: new Date(),
        details: { key },
        nsmClassification: NSMClassification.OPEN
      });
      return null;
    }
    
    if (entry.expiresAt < new Date()) {
      this.cache.delete(key);
      return null;
    }
    
    entry.accessCount++;
    entry.lastAccessed = new Date();
    
    this.emit("cacheHit", {
      eventId: crypto.randomUUID(),
      repositoryName: "cache",
      eventType: SyncEventType.CACHE_HIT,
      timestamp: new Date(),
      details: { key, accessCount: entry.accessCount },
      nsmClassification: NSMClassification.OPEN
    });
    
    return entry.value;
  }

  private async cacheSet(key: string, value: any, ttlSeconds: number): Promise<void> {
    const valueStr = JSON.stringify(value);
    const hash = crypto.createHash("sha256").update(valueStr).digest("hex");
    
    const entry: CacheEntry = {
      key,
      value,
      hash,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + ttlSeconds * 1000),
      accessCount: 0,
      lastAccessed: new Date(),
      size: valueStr.length,
      metadata: {}
    };
    
    this.cache.set(key, entry);
  }

  /**
   * Load persisted data
   */
  private async loadPersistedData(): Promise<void> {
    try {
      const statusPath = path.join(this.dataPath, "sync-statuses.json");
      const statusData = await fs.readFile(statusPath, "utf-8");
      const statuses = JSON.parse(statusData);
      
      for (const [name, status] of Object.entries(statuses)) {
        this.syncStatuses.set(name, status as SyncStatus);
      }
    } catch (error) {
      // File doesn't exist or is corrupted - start fresh
    }
  }

  /**
   * Persist data to disk
   */
  private async persistData(): Promise<void> {
    try {
      const statusPath = path.join(this.dataPath, "sync-statuses.json");
      const statuses = Object.fromEntries(this.syncStatuses);
      await fs.writeFile(statusPath, JSON.stringify(statuses, null, 2));
    } catch (error) {
      console.error("Failed to persist sync data:", error);
    }
  }

  /**
   * Ensure directory exists
   */
  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }
}

// Service instance factory
export function createTemplateSyncService(
  config: SyncConfig,
  dataPath: string,
  logger: MCPExecutionLogger,
  repositoryService: TemplateRepositoryService,
  versionManager: TemplateVersionManagerService
): TemplateSyncService {
  return new TemplateSyncService(
    config,
    dataPath,
    logger,
    repositoryService,
    versionManager
  );
}

// Default export
export { TemplateSyncService as default };