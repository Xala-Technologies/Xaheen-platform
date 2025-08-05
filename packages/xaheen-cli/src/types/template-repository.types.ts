/**
 * @fileoverview Template Repository System Types - EPIC 15 Story 15.3 Task 1
 * @description Comprehensive TypeScript types for shared template repositories
 * @version 1.0.0
 * @compliance Norwegian NSM Standards, GDPR, Enterprise Security
 * @author Xaheen CLI Team
 * @since 2025-01-03
 */

import type { z } from "zod";
import type { 
  NSMClassification, 
  Permission, 
  User,
  AuthenticationEvent 
} from "../services/authentication/types";

// Re-export core types from services for convenience
export type {
  TemplateRepositoryConfig,
  TemplateMetadata,
  RepositoryOperation,
  RepositoryEvent,
  VersionConstraint,
  TemplateDependency,
  VersionHistory,
  VersionResolution,
  Migration,
  VersionEvent,
  SyncConfig,
  SyncStatus,
  CacheEntry,
  SyncJob,
  SyncEvent
} from "../services/templates";

export { 
  RepositoryEventType,
  VersionEventType,
  SyncEventType 
} from "../services/templates";

// Extended Template Repository Types

/**
 * Template Repository Manager Configuration
 */
export interface TemplateRepositoryManagerConfig {
  readonly basePath: string;
  readonly versionDataPath: string;
  readonly syncConfig: {
    readonly enabled: boolean;
    readonly interval: number;
    readonly conflictResolution: "manual" | "remote-wins" | "local-wins" | "merge" | "skip";
    readonly maxRetries: number;
    readonly parallelJobs: number;
  };
  readonly gitConfig: {
    readonly username: string;
    readonly email: string;
    readonly signingKey?: string;
    readonly sshKeyPath?: string;
    readonly gpgSign: boolean;
  };
  readonly norwegianCompliance: {
    readonly enableGDPRCompliance: boolean;
    readonly enableNSMCompliance: boolean;
    readonly defaultClassification: NSMClassification;
    readonly auditAllOperations: boolean;
    readonly dataRetention: number;
  };
  readonly caching: {
    readonly enabled: boolean;
    readonly ttl: number;
    readonly maxSize: number;
    readonly encryption: boolean;
  };
}

/**
 * Team Template Workspace
 */
export interface TeamTemplateWorkspace {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly owner: string;
  readonly members: Array<{
    readonly userId: string;
    readonly role: "owner" | "admin" | "contributor" | "viewer";
    readonly permissions: Permission[];
    readonly addedAt: Date;
    readonly addedBy: string;
  }>;
  readonly repositories: string[]; // Repository names
  readonly settings: {
    readonly defaultNSMClassification: NSMClassification;
    readonly requireApproval: boolean;
    readonly autoSync: boolean;
    readonly conflictResolution: "manual" | "remote-wins" | "local-wins" | "merge";
    readonly enableNotifications: boolean;
  };
  readonly compliance: {
    readonly gdprCompliant: boolean;
    readonly nsmApproved: boolean;
    readonly auditTrail: boolean;
    readonly dataRetention: number;
  };
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly metadata: Record<string, any>;
}

/**
 * Template Repository Access Control
 */
export interface RepositoryAccessControl {
  readonly repositoryName: string;
  readonly isPrivate: boolean;
  readonly nsmClassification: NSMClassification;
  readonly allowedUsers: Array<{
    readonly userId: string;
    readonly permissions: Permission[];
    readonly grantedAt: Date;
    readonly grantedBy: string;
    readonly expiresAt?: Date;
  }>;
  readonly allowedTeams: Array<{
    readonly teamId: string;
    readonly permissions: Permission[];
    readonly grantedAt: Date;
    readonly grantedBy: string;
    readonly expiresAt?: Date;
  }>;
  readonly restrictedOperations: Array<{
    readonly operation: string;
    readonly requiredPermission: Permission;
    readonly requiredClearance: NSMClassification;
  }>;
  readonly auditConfig: {
    readonly logAllAccess: boolean;
    readonly logFailedAccess: boolean;
    readonly alertOnUnauthorized: boolean;
    readonly retentionPeriod: number;
  };
}

/**
 * Template Repository Statistics
 */
export interface RepositoryStatistics {
  readonly repositoryName: string;
  readonly totalCommits: number;
  readonly totalTags: number;
  readonly totalBranches: number;
  readonly totalContributors: number;
  readonly fileStatistics: {
    readonly totalFiles: number;
    readonly templateFiles: number;
    readonly configFiles: number;
    readonly documentationFiles: number;
    readonly testFiles: number;
    readonly totalSize: number; // in bytes
  };
  readonly activityMetrics: {
    readonly commitsLastWeek: number;
    readonly commitsLastMonth: number;
    readonly lastCommitDate?: Date;
    readonly mostActiveContributor: string;
    readonly averageCommitsPerWeek: number;
  };
  readonly syncMetrics: {
    readonly totalSyncs: number;
    readonly successfulSyncs: number;
    readonly failedSyncs: number;
    readonly lastSyncDate?: Date;
    readonly averageSyncDuration: number;
    readonly totalConflicts: number;
    readonly resolvedConflicts: number;
  };
  readonly usageMetrics: {
    readonly totalDownloads: number;
    readonly uniqueUsers: number;
    readonly mostUsedTemplates: Array<{
      readonly templateId: string;
      readonly usageCount: number;
    }>;
  };
  readonly compliance: {
    readonly nsmClassification: NSMClassification;
    readonly gdprCompliant: boolean;
    readonly lastAuditDate?: Date;
    readonly complianceScore: number; // 0-100
  };
  readonly generatedAt: Date;
}

/**
 * Template Dependency Graph
 */
export interface TemplateDependencyGraph {
  readonly templateId: string;
  readonly version: string;
  readonly dependencies: Array<{
    readonly templateId: string;
    readonly version: string;
    readonly constraint: string;
    readonly type: "dependency" | "peerDependency" | "devDependency" | "optionalDependency";
    readonly resolved: boolean;
    readonly circular: boolean;
  }>;
  readonly dependents: Array<{
    readonly templateId: string;
    readonly version: string;
    readonly constraint: string;
  }>;
  readonly depth: number;
  readonly circularDependencies: Array<{
    readonly path: string[];
    readonly severity: "warning" | "error";
  }>;
  readonly vulnerabilities: Array<{
    readonly templateId: string;
    readonly version: string;
    readonly severity: "low" | "medium" | "high" | "critical";
    readonly description: string;
    readonly fixAvailable: boolean;
    readonly fixVersion?: string;
  }>;
}

/**
 * Template Repository Migration
 */
export interface RepositoryMigration {
  readonly id: string;
  readonly repositoryName: string;
  readonly fromVersion: string;
  readonly toVersion: string;
  readonly type: "structure" | "content" | "metadata" | "dependencies";
  readonly status: "pending" | "running" | "completed" | "failed" | "rollback";
  readonly description: string;
  readonly changes: Array<{
    readonly type: "add" | "remove" | "modify" | "move" | "rename";
    readonly path: string;
    readonly oldValue?: any;
    readonly newValue?: any;
    readonly reason: string;
  }>;
  readonly requirements: Array<{
    readonly type: "permission" | "clearance" | "dependency" | "approval";
    readonly description: string;
    readonly satisfied: boolean;
  }>;
  readonly rollbackPlan: Array<{
    readonly step: number;
    readonly description: string;
    readonly command: string;
    readonly validation: string;
  }>;
  readonly executionPlan: Array<{
    readonly step: number;
    readonly description: string;
    readonly command: string;
    readonly validation: string;
    readonly rollbackCommand: string;
  }>;
  readonly createdAt: Date;
  readonly createdBy: string;
  readonly startedAt?: Date;
  readonly completedAt?: Date;
  readonly duration?: number;
  readonly result?: {
    readonly success: boolean;
    readonly message?: string;
    readonly affectedFiles: string[];
    readonly errors: Array<{
      readonly step: number;
      readonly error: string;
      readonly resolution?: string;
    }>;
  };
}

/**
 * Template Repository Backup
 */
export interface RepositoryBackup {
  readonly id: string;
  readonly repositoryName: string;
  readonly type: "full" | "incremental" | "differential";
  readonly status: "creating" | "completed" | "failed" | "expired";
  readonly backupPath: string;
  readonly size: number; // in bytes
  readonly checksum: string;
  readonly compression: "none" | "gzip" | "bzip2" | "xz";
  readonly encryption: {
    readonly enabled: boolean;
    readonly algorithm?: string;
    readonly keyFingerprint?: string;
  };
  readonly retention: {
    readonly expiresAt: Date;
    readonly policy: "time-based" | "count-based" | "size-based";
    readonly maxRetention: number;
  };
  readonly metadata: {
    readonly totalFiles: number;
    readonly totalCommits: number;
    readonly latestCommit: string;
    readonly branches: string[];
    readonly tags: string[];
  };
  readonly createdAt: Date;
  readonly createdBy: string;
  readonly completedAt?: Date;
  readonly error?: string;
}

/**
 * Template Repository Notification
 */
export interface RepositoryNotification {
  readonly id: string;
  readonly repositoryName: string;
  readonly type: "sync" | "conflict" | "version" | "access" | "compliance" | "error";
  readonly severity: "info" | "warning" | "error" | "critical";
  readonly title: string;
  readonly message: string;
  readonly recipients: Array<{
    readonly userId: string;
    readonly method: "email" | "webhook" | "slack" | "teams";
    readonly address: string;
  }>;
  readonly trigger: {
    readonly event: string;
    readonly condition: string;
    readonly threshold?: number;
  };
  readonly status: "pending" | "sent" | "failed" | "acknowledged";
  readonly deliveryAttempts: number;
  readonly maxRetries: number;
  readonly createdAt: Date;
  readonly sentAt?: Date;
  readonly acknowledgedAt?: Date;
  readonly acknowledgedBy?: string;
  readonly error?: string;
}

/**
 * Template Repository Webhook
 */
export interface RepositoryWebhook {
  readonly id: string;
  readonly repositoryName: string;
  readonly url: string;
  readonly secret?: string;
  readonly events: Array<
    "push" | "pull" | "tag" | "branch" | "sync" | "conflict" | 
    "version" | "migration" | "access" | "compliance"
  >;
  readonly headers: Record<string, string>;
  readonly timeout: number;
  readonly retries: number;
  readonly status: "active" | "inactive" | "failed";
  readonly lastTrigger?: {
    readonly timestamp: Date;
    readonly event: string;
    readonly status: "success" | "failed";
    readonly responseCode?: number;
    readonly responseTime?: number;
    readonly error?: string;
  };
  readonly statistics: {
    readonly totalTriggers: number;
    readonly successfulTriggers: number;
    readonly failedTriggers: number;
    readonly averageResponseTime: number;
  };
  readonly createdAt: Date;
  readonly createdBy: string;
  readonly updatedAt: Date;
}

/**
 * Template Repository Analytics
 */
export interface RepositoryAnalytics {
  readonly repositoryName: string;
  readonly timeRange: {
    readonly start: Date;
    readonly end: Date;
  };
  readonly usage: {
    readonly totalRequests: number;
    readonly uniqueUsers: number;
    readonly topTemplates: Array<{
      readonly templateId: string;
      readonly requests: number;
      readonly percentage: number;
    }>;
    readonly requestsByDay: Array<{
      readonly date: Date;
      readonly requests: number;
    }>;
    readonly usersByRegion: Array<{
      readonly region: string;
      readonly users: number;
      readonly percentage: number;
    }>;
  };
  readonly performance: {
    readonly averageResponseTime: number;
    readonly p95ResponseTime: number;
    readonly p99ResponseTime: number;
    readonly errorRate: number;
    readonly availabilityPercentage: number;
    readonly cacheHitRate: number;
  };
  readonly collaboration: {
    readonly totalContributors: number;
    readonly activeContributors: number;
    readonly contributionsByUser: Array<{
      readonly userId: string;
      readonly commits: number;
      readonly linesAdded: number;
      readonly linesRemoved: number;
    }>;
    readonly reviewMetrics: {
      readonly averageReviewTime: number;
      readonly reviewApprovalRate: number;
      readonly commentsPerReview: number;
    };
  };
  readonly quality: {
    readonly testCoverage: number;
    readonly lintingScore: number;
    readonly securityScore: number;
    readonly complianceScore: number;
    readonly vulnerabilities: Array<{
      readonly severity: "low" | "medium" | "high" | "critical";
      readonly count: number;
    }>;
  };
  readonly generatedAt: Date;
}

/**
 * Template Repository Configuration Export/Import
 */
export interface RepositoryConfigExport {
  readonly version: string;
  readonly exportedAt: Date;
  readonly exportedBy: string;
  readonly repositories: Array<{
    readonly config: any; // Full repository configuration
    readonly access: RepositoryAccessControl;
    readonly statistics: RepositoryStatistics;
    readonly webhooks: RepositoryWebhook[];
    readonly backups: RepositoryBackup[];
  }>;
  readonly workspaces: TeamTemplateWorkspace[];
  readonly globalSettings: {
    readonly defaultNSMClassification: NSMClassification;
    readonly complianceSettings: any;
    readonly syncSettings: any;
  };
  readonly checksum: string;
  readonly encryptionKey?: string;
}

/**
 * Template Repository Event Stream
 */
export interface RepositoryEventStream {
  readonly repositoryName: string;
  readonly streamId: string;
  readonly events: Array<{
    readonly timestamp: Date;
    readonly eventType: string;
    readonly userId?: string;
    readonly details: Record<string, any>;
    readonly nsmClassification: NSMClassification;
  }>;
  readonly filters: {
    readonly eventTypes: string[];
    readonly dateRange: {
      readonly start: Date;
      readonly end: Date;
    };
    readonly userIds: string[];
    readonly nsmClassifications: NSMClassification[];
  };
  readonly pagination: {
    readonly offset: number;
    readonly limit: number;
    readonly total: number;
    readonly hasMore: boolean;
  };
}

/**
 * Template Repository Health Check
 */
export interface RepositoryHealthCheck {
  readonly repositoryName: string;
  readonly overall: "healthy" | "warning" | "critical";
  readonly checks: Array<{
    readonly name: string;
    readonly status: "pass" | "warn" | "fail";
    readonly message: string;
    readonly details?: Record<string, any>;
    readonly checkedAt: Date;
  }>;
  readonly recommendations: Array<{
    readonly priority: "low" | "medium" | "high" | "critical";
    readonly category: "performance" | "security" | "compliance" | "maintenance";
    readonly title: string;
    readonly description: string;
    readonly action: string;
  }>;
  readonly metrics: {
    readonly uptime: number; // percentage
    readonly responseTime: number; // milliseconds
    readonly errorRate: number; // percentage
    readonly diskUsage: number; // percentage
    readonly memoryUsage: number; // percentage
  };
  readonly lastChecked: Date;
  readonly nextCheckAt: Date;
}

/**
 * Utility Types
 */

// Template Repository Manager Factory Options
export interface TemplateRepositoryManagerOptions {
  readonly config: TemplateRepositoryManagerConfig;
  readonly logger?: any; // MCPExecutionLogger
  readonly authenticator?: any; // Authentication service
  readonly notificationService?: any; // Notification service
  readonly metricsCollector?: any; // Metrics service
}

// Template Repository Operation Result
export type RepositoryOperationResult<T = any> = {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: {
    readonly code: string;
    readonly message: string;
    readonly details?: Record<string, any>;
  };
  readonly metadata: {
    readonly operationId: string;
    readonly timestamp: Date;
    readonly duration: number;
    readonly userId?: string;
  };
};

// Template Repository Query Options
export interface RepositoryQueryOptions {
  readonly filters?: {
    readonly name?: string;
    readonly category?: string;
    readonly framework?: string;
    readonly nsmClassification?: NSMClassification;
    readonly isPrivate?: boolean;
    readonly hasConflicts?: boolean;
    readonly lastSyncBefore?: Date;
    readonly lastSyncAfter?: Date;
  };
  readonly sorting?: {
    readonly field: string;
    readonly direction: "asc" | "desc";
  };
  readonly pagination?: {
    readonly offset: number;
    readonly limit: number;
  };
  readonly include?: Array<"statistics" | "access" | "webhooks" | "backups" | "health">;
}

// Template Repository Batch Operation
export interface RepositoryBatchOperation {
  readonly operationType: "sync" | "backup" | "migrate" | "delete" | "update";
  readonly repositories: string[];
  readonly options: Record<string, any>;
  readonly concurrency: number;
  readonly continueOnError: boolean;
  readonly dryRun: boolean;
}

// Template Repository Integration
export interface RepositoryIntegration {
  readonly type: "github" | "gitlab" | "bitbucket" | "azure-devops" | "custom";
  readonly config: Record<string, any>;
  readonly enabled: boolean;
  readonly lastSync?: Date;
  readonly status: "connected" | "disconnected" | "error";
  readonly error?: string;
}