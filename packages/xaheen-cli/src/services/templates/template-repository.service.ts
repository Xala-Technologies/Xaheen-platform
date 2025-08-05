/**
 * @fileoverview Template Repository Service - EPIC 15 Story 15.3 Task 1
 * @description Git-based template storage with versioning, team synchronization, and Norwegian compliance
 * @version 1.0.0
 * @compliance Norwegian NSM Standards, GDPR, Enterprise Security, Audit Trail
 * @author Xaheen CLI Team
 * @since 2025-01-03
 */

import { z } from "zod";
import { spawn } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { EventEmitter } from "events";
import type { 
  NSMClassification, 
  Permission, 
  User, 
  AuthenticationEvent,
  EnterpriseAuthConfig 
} from "../authentication/types";
import type { MCPExecutionLogger } from "../mcp/mcp-execution-logger.service";

// Template Repository Configuration Schema
export const TemplateRepositoryConfigSchema = z.object({
  name: z.string().min(1, "Repository name is required"),
  description: z.string().optional(),
  gitUrl: z.string().url("Invalid Git repository URL"),
  branch: z.string().default("main"),
  localPath: z.string().min(1, "Local path is required"),
  accessControl: z.object({
    isPrivate: z.boolean().default(false),
    allowedUsers: z.array(z.string()).default([]),
    allowedTeams: z.array(z.string()).default([]),
    requiredPermissions: z.array(z.string()).default([]),
    nsmClassification: z.enum(["OPEN", "RESTRICTED", "CONFIDENTIAL", "SECRET"]).default("OPEN")
  }).default({}),
  versioning: z.object({
    strategy: z.enum(["semantic", "timestamp", "sequential"]).default("semantic"),
    autoTag: z.boolean().default(true),
    enforceVersioning: z.boolean().default(true),
    allowPrerelease: z.boolean().default(true)
  }).default({}),
  synchronization: z.object({
    autoSync: z.boolean().default(true),
    syncInterval: z.number().int().min(60).default(300), // 5 minutes
    conflictResolution: z.enum(["manual", "remote-wins", "local-wins", "merge"]).default("manual"),
    enableWebhooks: z.boolean().default(false),
    webhookSecret: z.string().optional()
  }).default({}),
  norwegianCompliance: z.object({
    enableGDPRCompliance: z.boolean().default(true),
    enableNSMCompliance: z.boolean().default(true),
    dataClassification: z.enum(["OPEN", "RESTRICTED", "CONFIDENTIAL", "SECRET"]).default("OPEN"),
    requiresApproval: z.boolean().default(false),
    approvers: z.array(z.string()).default([]),
    auditTrail: z.boolean().default(true),
    retentionPeriod: z.number().int().min(30).default(2555) // 7 years
  }).default({}),
  metadata: z.object({
    createdAt: z.date().default(() => new Date()),
    updatedAt: z.date().default(() => new Date()),
    createdBy: z.string().default("system"),
    tags: z.array(z.string()).default([]),
    category: z.string().optional(),
    language: z.string().default("typescript"),
    framework: z.string().optional()
  }).default({})
});

// Template Metadata Schema
export const TemplateMetadataSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  version: z.string().min(1),
  description: z.string().optional(),
  author: z.string().min(1),
  license: z.string().default("MIT"),
  keywords: z.array(z.string()).default([]),
  category: z.string().optional(),
  framework: z.string().optional(),
  language: z.string().default("typescript"),
  dependencies: z.array(z.object({
    name: z.string(),
    version: z.string(),
    required: z.boolean().default(true)
  })).default([]),
  nsmClassification: z.enum(["OPEN", "RESTRICTED", "CONFIDENTIAL", "SECRET"]).default("OPEN"),
  norwegianCompliance: z.object({
    wcagLevel: z.enum(["A", "AA", "AAA"]).default("AA"),
    gdprCompliant: z.boolean().default(true),
    nsmApproved: z.boolean().default(false),
    dataRetention: z.number().int().min(30).default(365)
  }).default({}),
  files: z.array(z.object({
    path: z.string(),
    type: z.enum(["template", "config", "documentation", "test", "asset"]),
    required: z.boolean().default(true),
    checksum: z.string().optional()
  })).default([]),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date())
});

// Repository Operation Schema
export const RepositoryOperationSchema = z.object({
  id: z.string().min(1),
  type: z.enum([
    "clone", "pull", "push", "branch", "merge", "tag", 
    "checkout", "reset", "revert", "cherry-pick"
  ]),
  repositoryName: z.string().min(1),
  branch: z.string().optional(),
  commitHash: z.string().optional(),
  message: z.string().optional(),
  author: z.string().min(1),
  timestamp: z.date().default(() => new Date()),
  status: z.enum(["pending", "in-progress", "completed", "failed", "cancelled"]).default("pending"),
  result: z.object({
    success: z.boolean(),
    output: z.string().optional(),
    error: z.string().optional(),
    conflicts: z.array(z.string()).default([]),
    changedFiles: z.array(z.string()).default([])
  }).optional(),
  metadata: z.record(z.any()).default({})
});

// Type definitions
export type TemplateRepositoryConfig = z.infer<typeof TemplateRepositoryConfigSchema>;
export type TemplateMetadata = z.infer<typeof TemplateMetadataSchema>;
export type RepositoryOperation = z.infer<typeof RepositoryOperationSchema>;

// Repository Events
export interface RepositoryEvent {
  readonly eventId: string;
  readonly repositoryName: string;
  readonly eventType: RepositoryEventType;
  readonly timestamp: Date;
  readonly userId: string;
  readonly details: Record<string, any>;
  readonly nsmClassification: NSMClassification;
}

export enum RepositoryEventType {
  REPOSITORY_CREATED = "REPOSITORY_CREATED",
  REPOSITORY_CLONED = "REPOSITORY_CLONED",
  REPOSITORY_UPDATED = "REPOSITORY_UPDATED",
  REPOSITORY_DELETED = "REPOSITORY_DELETED",
  TEMPLATE_ADDED = "TEMPLATE_ADDED",
  TEMPLATE_UPDATED = "TEMPLATE_UPDATED",
  TEMPLATE_DELETED = "TEMPLATE_DELETED",
  VERSION_TAGGED = "VERSION_TAGGED",
  BRANCH_CREATED = "BRANCH_CREATED",
  BRANCH_MERGED = "BRANCH_MERGED",
  CONFLICT_DETECTED = "CONFLICT_DETECTED",
  SYNC_COMPLETED = "SYNC_COMPLETED",
  ACCESS_GRANTED = "ACCESS_GRANTED",
  ACCESS_DENIED = "ACCESS_DENIED"
}

// Git Configuration
interface GitConfig {
  readonly username: string;
  readonly email: string;
  readonly signingKey?: string;
  readonly sshKeyPath?: string;
  readonly gpgSign: boolean;
}

// Template Repository Error Classes
export class TemplateRepositoryError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly repositoryName?: string,
    public readonly operation?: string
  ) {
    super(message);
    this.name = "TemplateRepositoryError";
  }
}

export class GitOperationError extends Error {
  constructor(
    message: string,
    public readonly command: string,
    public readonly exitCode: number,
    public readonly stderr: string
  ) {
    super(message);
    this.name = "GitOperationError";
  }
}

export class AccessControlError extends Error {
  constructor(
    message: string,
    public readonly requiredPermission: Permission,
    public readonly userPermissions: Permission[],
    public readonly nsmClassification: NSMClassification
  ) {
    super(message);
    this.name = "AccessControlError";
  }
}

/**
 * Template Repository Service
 * 
 * Provides Git-based template storage and versioning with enterprise features:
 * - Git repository management and operations
 * - Team synchronization and collaboration
 * - Access control and security
 * - Version management and tagging
 * - Norwegian compliance (GDPR, NSM)
 * - Comprehensive audit trail
 */
export class TemplateRepositoryService extends EventEmitter {
  private readonly repositories = new Map<string, TemplateRepositoryConfig>();
  private readonly operations = new Map<string, RepositoryOperation>();
  private readonly gitConfig: GitConfig;
  private readonly basePath: string;
  private readonly logger: MCPExecutionLogger;
  
  constructor(
    basePath: string,
    gitConfig: GitConfig,
    logger: MCPExecutionLogger
  ) {
    super();
    this.basePath = path.resolve(basePath);
    this.gitConfig = gitConfig;
    this.logger = logger;
    
    // Ensure base directory exists
    this.ensureDirectoryExists(this.basePath);
  }

  /**
   * Register a new template repository
   */
  async registerRepository(
    config: TemplateRepositoryConfig,
    user: User
  ): Promise<void> {
    const startTime = Date.now();
    const operationId = crypto.randomUUID();
    
    try {
      // Validate configuration
      const validatedConfig = TemplateRepositoryConfigSchema.parse(config);
      
      // Check permissions
      await this.checkAccess(validatedConfig, user, "WRITE");
      
      // Check if repository already exists
      if (this.repositories.has(validatedConfig.name)) {
        throw new TemplateRepositoryError(
          `Repository '${validatedConfig.name}' already exists`,
          "REPOSITORY_EXISTS",
          validatedConfig.name
        );
      }
      
      // Create local directory
      const repoPath = path.join(this.basePath, validatedConfig.name);
      await this.ensureDirectoryExists(repoPath);
      
      // Store repository configuration
      this.repositories.set(validatedConfig.name, validatedConfig);
      
      // Log operation
      await this.logger.logOperation({
        operationId,
        category: "REPOSITORY_MANAGEMENT",
        operation: "REGISTER_REPOSITORY",
        userId: user.id,
        startTime: new Date(startTime),
        endTime: new Date(),
        success: true,
        details: {
          repositoryName: validatedConfig.name,
          gitUrl: validatedConfig.gitUrl,
          nsmClassification: validatedConfig.norwegianCompliance.dataClassification
        },
        compliance: {
          gdprApplicable: validatedConfig.norwegianCompliance.enableGDPRCompliance,
          nsmClassification: validatedConfig.norwegianCompliance.dataClassification as NSMClassification,
          dataRetention: validatedConfig.norwegianCompliance.retentionPeriod,
          auditRequired: validatedConfig.norwegianCompliance.auditTrail
        }
      });
      
      // Emit event
      this.emit("repositoryRegistered", {
        eventId: crypto.randomUUID(),
        repositoryName: validatedConfig.name,
        eventType: RepositoryEventType.REPOSITORY_CREATED,
        timestamp: new Date(),
        userId: user.id,
        details: { config: validatedConfig },
        nsmClassification: validatedConfig.norwegianCompliance.dataClassification as NSMClassification
      });
      
    } catch (error) {
      await this.logger.logOperation({
        operationId,
        category: "REPOSITORY_MANAGEMENT", 
        operation: "REGISTER_REPOSITORY",
        userId: user.id,
        startTime: new Date(startTime),
        endTime: new Date(),
        success: false,
        error: error instanceof Error ? error.message : String(error),
        details: {
          repositoryName: config.name,
          gitUrl: config.gitUrl
        }
      });
      
      throw error;
    }
  }

  /**
   * Clone a Git repository
   */
  async cloneRepository(
    repositoryName: string,
    user: User,
    options: {
      readonly force?: boolean;
      readonly shallow?: boolean;
      readonly depth?: number;
    } = {}
  ): Promise<void> {
    const startTime = Date.now();
    const operationId = crypto.randomUUID();
    
    try {
      const config = this.getRepositoryConfig(repositoryName);
      await this.checkAccess(config, user, "READ");
      
      const repoPath = path.join(this.basePath, repositoryName);
      
      // Check if repository already exists locally
      const exists = await this.directoryExists(repoPath);
      if (exists && !options.force) {
        throw new TemplateRepositoryError(
          `Repository '${repositoryName}' already exists locally. Use force option to overwrite.`,
          "REPOSITORY_EXISTS_LOCALLY",
          repositoryName
        );
      }
      
      // Remove existing directory if force is enabled
      if (exists && options.force) {
        await fs.rm(repoPath, { recursive: true, force: true });
      }
      
      // Build clone command
      const cloneArgs = ["clone"];
      if (options.shallow || options.depth) {
        cloneArgs.push("--depth", String(options.depth || 1));
      }
      cloneArgs.push("--branch", config.branch);
      cloneArgs.push(config.gitUrl, repoPath);
      
      // Execute git clone
      const result = await this.executeGitCommand(cloneArgs, this.basePath);
      
      // Log operation
      await this.logger.logOperation({
        operationId,
        category: "GIT_OPERATIONS",
        operation: "CLONE_REPOSITORY",
        userId: user.id,
        startTime: new Date(startTime),
        endTime: new Date(),
        success: true,
        details: {
          repositoryName,
          gitUrl: config.gitUrl,
          branch: config.branch,
          shallow: options.shallow,
          depth: options.depth
        },
        compliance: {
          gdprApplicable: config.norwegianCompliance.enableGDPRCompliance,
          nsmClassification: config.norwegianCompliance.dataClassification as NSMClassification,
          dataRetention: config.norwegianCompliance.retentionPeriod,
          auditRequired: config.norwegianCompliance.auditTrail
        }
      });
      
      // Emit event
      this.emit("repositoryCloned", {
        eventId: crypto.randomUUID(),
        repositoryName,
        eventType: RepositoryEventType.REPOSITORY_CLONED,
        timestamp: new Date(),
        userId: user.id,
        details: { result },
        nsmClassification: config.norwegianCompliance.dataClassification as NSMClassification
      });
      
    } catch (error) {
      await this.logger.logOperation({
        operationId,
        category: "GIT_OPERATIONS",
        operation: "CLONE_REPOSITORY", 
        userId: user.id,
        startTime: new Date(startTime),
        endTime: new Date(),
        success: false,
        error: error instanceof Error ? error.message : String(error),
        details: { repositoryName }
      });
      
      throw error;
    }
  }

  /**
   * Pull latest changes from remote repository
   */
  async pullRepository(
    repositoryName: string,
    user: User,
    options: {
      readonly rebase?: boolean;
      readonly force?: boolean;
    } = {}
  ): Promise<{ readonly conflicts: string[]; readonly changedFiles: string[] }> {
    const startTime = Date.now();
    const operationId = crypto.randomUUID();
    
    try {
      const config = this.getRepositoryConfig(repositoryName);
      await this.checkAccess(config, user, "READ");
      
      const repoPath = path.join(this.basePath, repositoryName);
      await this.ensureRepositoryExists(repoPath, repositoryName);
      
      // Build pull command
      const pullArgs = ["pull"];
      if (options.rebase) {
        pullArgs.push("--rebase");
      }
      if (options.force) {
        pullArgs.push("--force");
      }
      pullArgs.push("origin", config.branch);
      
      // Execute git pull
      const result = await this.executeGitCommand(pullArgs, repoPath);
      
      // Parse output for conflicts and changed files
      const conflicts = this.parseGitConflicts(result.stdout + result.stderr);
      const changedFiles = this.parseChangedFiles(result.stdout);
      
      // Log operation
      await this.logger.logOperation({
        operationId,
        category: "GIT_OPERATIONS",
        operation: "PULL_REPOSITORY",
        userId: user.id,
        startTime: new Date(startTime),
        endTime: new Date(),
        success: true,
        details: {
          repositoryName,
          branch: config.branch,
          conflicts: conflicts.length,
          changedFiles: changedFiles.length,
          rebase: options.rebase
        },
        compliance: {
          gdprApplicable: config.norwegianCompliance.enableGDPRCompliance,
          nsmClassification: config.norwegianCompliance.dataClassification as NSMClassification,
          dataRetention: config.norwegianCompliance.retentionPeriod,
          auditRequired: config.norwegianCompliance.auditTrail
        }
      });
      
      // Emit event
      this.emit("repositoryPulled", {
        eventId: crypto.randomUUID(),
        repositoryName,
        eventType: RepositoryEventType.REPOSITORY_UPDATED,
        timestamp: new Date(),
        userId: user.id,
        details: { conflicts, changedFiles },
        nsmClassification: config.norwegianCompliance.dataClassification as NSMClassification
      });
      
      return { conflicts, changedFiles };
      
    } catch (error) {
      await this.logger.logOperation({
        operationId,
        category: "GIT_OPERATIONS",
        operation: "PULL_REPOSITORY",
        userId: user.id,
        startTime: new Date(startTime),
        endTime: new Date(),
        success: false,
        error: error instanceof Error ? error.message : String(error),
        details: { repositoryName }
      });
      
      throw error;
    }
  }

  /**
   * Push changes to remote repository
   */
  async pushRepository(
    repositoryName: string,
    user: User,
    commitMessage: string,
    options: {
      readonly force?: boolean;
      readonly tags?: boolean;
      readonly branch?: string;
    } = {}
  ): Promise<void> {
    const startTime = Date.now();
    const operationId = crypto.randomUUID();
    
    try {
      const config = this.getRepositoryConfig(repositoryName);
      await this.checkAccess(config, user, "WRITE");
      
      const repoPath = path.join(this.basePath, repositoryName);
      await this.ensureRepositoryExists(repoPath, repositoryName);
      
      // Stage all changes
      await this.executeGitCommand(["add", "."], repoPath);
      
      // Check if there are changes to commit
      const status = await this.executeGitCommand(["status", "--porcelain"], repoPath);
      if (!status.stdout.trim()) {
        throw new TemplateRepositoryError(
          "No changes to commit",
          "NO_CHANGES",
          repositoryName
        );
      }
      
      // Commit changes
      await this.executeGitCommand([
        "commit", 
        "-m", commitMessage,
        "--author", `${user.firstName} ${user.lastName} <${user.email}>`
      ], repoPath);
      
      // Build push command
      const pushArgs = ["push"];
      if (options.force) {
        pushArgs.push("--force");
      }
      if (options.tags) {
        pushArgs.push("--tags");
      }
      pushArgs.push("origin", options.branch || config.branch);
      
      // Execute git push
      const result = await this.executeGitCommand(pushArgs, repoPath);
      
      // Log operation
      await this.logger.logOperation({
        operationId,
        category: "GIT_OPERATIONS",
        operation: "PUSH_REPOSITORY",
        userId: user.id,
        startTime: new Date(startTime),
        endTime: new Date(),
        success: true,
        details: {
          repositoryName,
          commitMessage,
          branch: options.branch || config.branch,
          force: options.force,
          tags: options.tags
        },
        compliance: {
          gdprApplicable: config.norwegianCompliance.enableGDPRCompliance,
          nsmClassification: config.norwegianCompliance.dataClassification as NSMClassification,
          dataRetention: config.norwegianCompliance.retentionPeriod,
          auditRequired: config.norwegianCompliance.auditTrail
        }
      });
      
      // Emit event
      this.emit("repositoryPushed", {
        eventId: crypto.randomUUID(),
        repositoryName,
        eventType: RepositoryEventType.REPOSITORY_UPDATED,
        timestamp: new Date(),
        userId: user.id,
        details: { commitMessage, result },
        nsmClassification: config.norwegianCompliance.dataClassification as NSMClassification
      });
      
    } catch (error) {
      await this.logger.logOperation({
        operationId,
        category: "GIT_OPERATIONS",
        operation: "PUSH_REPOSITORY",
        userId: user.id,
        startTime: new Date(startTime),
        endTime: new Date(),
        success: false,
        error: error instanceof Error ? error.message : String(error),
        details: { repositoryName, commitMessage }
      });
      
      throw error;
    }
  }

  /**
   * Create and push a version tag
   */
  async tagVersion(
    repositoryName: string,
    version: string,
    user: User,
    message?: string
  ): Promise<void> {
    const startTime = Date.now();
    const operationId = crypto.randomUUID();
    
    try {
      const config = this.getRepositoryConfig(repositoryName);
      await this.checkAccess(config, user, "WRITE");
      
      const repoPath = path.join(this.basePath, repositoryName);
      await this.ensureRepositoryExists(repoPath, repositoryName);
      
      // Validate version format based on strategy
      this.validateVersionFormat(version, config.versioning.strategy);
      
      // Create tag
      const tagArgs = ["tag"];
      if (message) {
        tagArgs.push("-a", version, "-m", message);
      } else {
        tagArgs.push(version);
      }
      
      await this.executeGitCommand(tagArgs, repoPath);
      
      // Push tag
      await this.executeGitCommand(["push", "origin", version], repoPath);
      
      // Log operation
      await this.logger.logOperation({
        operationId,
        category: "VERSION_MANAGEMENT",
        operation: "TAG_VERSION",
        userId: user.id,
        startTime: new Date(startTime),
        endTime: new Date(),
        success: true,
        details: {
          repositoryName,
          version,
          message,
          strategy: config.versioning.strategy
        },
        compliance: {
          gdprApplicable: config.norwegianCompliance.enableGDPRCompliance,
          nsmClassification: config.norwegianCompliance.dataClassification as NSMClassification,
          dataRetention: config.norwegianCompliance.retentionPeriod,
          auditRequired: config.norwegianCompliance.auditTrail
        }
      });
      
      // Emit event
      this.emit("versionTagged", {
        eventId: crypto.randomUUID(),
        repositoryName,
        eventType: RepositoryEventType.VERSION_TAGGED,
        timestamp: new Date(),
        userId: user.id,
        details: { version, message },
        nsmClassification: config.norwegianCompliance.dataClassification as NSMClassification
      });
      
    } catch (error) {
      await this.logger.logOperation({
        operationId,
        category: "VERSION_MANAGEMENT",
        operation: "TAG_VERSION",
        userId: user.id,
        startTime: new Date(startTime),
        endTime: new Date(),
        success: false,
        error: error instanceof Error ? error.message : String(error),
        details: { repositoryName, version }
      });
      
      throw error;
    }
  }

  /**
   * List all registered repositories
   */
  async listRepositories(
    user: User,
    filters: {
      readonly category?: string;
      readonly framework?: string;
      readonly nsmClassification?: NSMClassification;
    } = {}
  ): Promise<TemplateRepositoryConfig[]> {
    const repositories: TemplateRepositoryConfig[] = [];
    
    for (const [name, config] of this.repositories) {
      try {
        // Check if user has access
        await this.checkAccess(config, user, "READ");
        
        // Apply filters
        if (filters.category && config.metadata.category !== filters.category) {
          continue;
        }
        if (filters.framework && config.metadata.framework !== filters.framework) {
          continue;
        }
        if (filters.nsmClassification && config.norwegianCompliance.dataClassification !== filters.nsmClassification) {
          continue;
        }
        
        repositories.push(config);
      } catch (error) {
        // User doesn't have access to this repository
        continue;
      }
    }
    
    return repositories;
  }

  /**
   * Get repository configuration
   */
  getRepositoryConfig(repositoryName: string): TemplateRepositoryConfig {
    const config = this.repositories.get(repositoryName);
    if (!config) {
      throw new TemplateRepositoryError(
        `Repository '${repositoryName}' not found`,
        "REPOSITORY_NOT_FOUND",
        repositoryName
      );
    }
    return config;
  }

  /**
   * Check user access to repository
   */
  private async checkAccess(
    config: TemplateRepositoryConfig,
    user: User,
    operation: "READ" | "WRITE" | "ADMIN"
  ): Promise<void> {
    // Check NSM classification clearance
    const userClearance = user.nsmClearance;
    const repoClearance = config.norwegianCompliance.dataClassification as NSMClassification;
    
    if (!this.hasNSMClearance(userClearance, repoClearance)) {
      throw new AccessControlError(
        `Insufficient NSM clearance. Required: ${repoClearance}, User: ${userClearance}`,
        Permission.TEMPLATE_READ,
        user.permissions,
        repoClearance
      );
    }
    
    // Check if repository is private
    if (config.accessControl.isPrivate) {
      const hasAccess = 
        config.accessControl.allowedUsers.includes(user.id) ||
        config.accessControl.allowedUsers.includes(user.email) ||
        config.accessControl.allowedTeams.some(team => 
          user.metadata?.teams?.includes(team)
        );
      
      if (!hasAccess) {
        throw new AccessControlError(
          "Access denied to private repository",
          Permission.TEMPLATE_READ,
          user.permissions,
          repoClearance
        );
      }
    }
    
    // Check required permissions
    const requiredPermission = operation === "READ" ? Permission.TEMPLATE_READ :
                              operation === "WRITE" ? Permission.TEMPLATE_WRITE :
                              Permission.TEMPLATE_ADMIN;
    
    if (!user.permissions.includes(requiredPermission)) {
      throw new AccessControlError(
        `Missing required permission: ${requiredPermission}`,
        requiredPermission,
        user.permissions,
        repoClearance
      );
    }
  }

  /**
   * Check NSM clearance level
   */
  private hasNSMClearance(
    userClearance: NSMClassification,
    requiredClearance: NSMClassification
  ): boolean {
    const clearanceLevels = {
      [NSMClassification.OPEN]: 0,
      [NSMClassification.RESTRICTED]: 1,
      [NSMClassification.CONFIDENTIAL]: 2,
      [NSMClassification.SECRET]: 3
    };
    
    return clearanceLevels[userClearance] >= clearanceLevels[requiredClearance];
  }

  /**
   * Execute Git command
   */
  private async executeGitCommand(
    args: string[],
    cwd: string
  ): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
      const process = spawn("git", args, {
        cwd,
        env: {
          ...process.env,
          GIT_AUTHOR_NAME: this.gitConfig.username,
          GIT_AUTHOR_EMAIL: this.gitConfig.email,
          GIT_COMMITTER_NAME: this.gitConfig.username,
          GIT_COMMITTER_EMAIL: this.gitConfig.email
        }
      });
      
      let stdout = "";
      let stderr = "";
      
      process.stdout.on("data", (data) => {
        stdout += data.toString();
      });
      
      process.stderr.on("data", (data) => {
        stderr += data.toString();
      });
      
      process.on("close", (code) => {
        if (code === 0) {
          resolve({ stdout, stderr });
        } else {
          reject(new GitOperationError(
            `Git command failed: ${args.join(" ")}`,
            args.join(" "),
            code || -1,
            stderr
          ));
        }
      });
      
      process.on("error", (error) => {
        reject(new GitOperationError(
          `Failed to execute git command: ${error.message}`,
          args.join(" "),
          -1,
          error.message
        ));
      });
    });
  }

  /**
   * Validate version format
   */
  private validateVersionFormat(version: string, strategy: string): void {
    switch (strategy) {
      case "semantic":
        if (!/^\d+\.\d+\.\d+(-[\w.-]+)?(\+[\w.-]+)?$/.test(version)) {
          throw new TemplateRepositoryError(
            `Invalid semantic version format: ${version}`,
            "INVALID_VERSION_FORMAT"
          );
        }
        break;
      case "timestamp":
        if (!/^\d{8}-\d{6}$/.test(version)) {
          throw new TemplateRepositoryError(
            `Invalid timestamp version format: ${version}. Expected: YYYYMMDD-HHMMSS`,
            "INVALID_VERSION_FORMAT"
          );
        }
        break;
      case "sequential":
        if (!/^\d+$/.test(version)) {
          throw new TemplateRepositoryError(
            `Invalid sequential version format: ${version}. Expected: number`,
            "INVALID_VERSION_FORMAT"
          );
        }
        break;
    }
  }

  /**
   * Parse Git conflicts from output
   */
  private parseGitConflicts(output: string): string[] {
    const conflicts: string[] = [];
    const lines = output.split("\n");
    
    for (const line of lines) {
      if (line.includes("CONFLICT") || line.includes("Merge conflict")) {
        const match = line.match(/CONFLICT.*?in (.+)/);
        if (match) {
          conflicts.push(match[1]);
        }
      }
    }
    
    return conflicts;
  }

  /**
   * Parse changed files from Git output
   */
  private parseChangedFiles(output: string): string[] {
    const files: string[] = [];
    const lines = output.split("\n");
    
    for (const line of lines) {
      if (line.trim().startsWith("|") || line.includes("=>")) {
        const match = line.match(/^\s*(.+?)\s*\|/);
        if (match) {
          files.push(match[1].trim());
        }
      }
    }
    
    return files;
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

  /**
   * Check if directory exists
   */
  private async directoryExists(dirPath: string): Promise<boolean> {
    try {
      const stat = await fs.stat(dirPath);
      return stat.isDirectory();
    } catch {
      return false;
    }
  }

  /**
   * Ensure repository exists locally
   */
  private async ensureRepositoryExists(repoPath: string, repositoryName: string): Promise<void> {
    const exists = await this.directoryExists(repoPath);
    if (!exists) {
      throw new TemplateRepositoryError(
        `Repository '${repositoryName}' does not exist locally. Clone it first.`,
        "REPOSITORY_NOT_FOUND_LOCALLY",
        repositoryName
      );
    }
    
    // Check if it's a valid Git repository
    const gitDir = path.join(repoPath, ".git");
    const isGitRepo = await this.directoryExists(gitDir);
    if (!isGitRepo) {
      throw new TemplateRepositoryError(
        `Directory '${repositoryName}' is not a valid Git repository`,
        "INVALID_GIT_REPOSITORY",
        repositoryName
      );
    }
  }
}

// Service instance factory
export function createTemplateRepositoryService(
  basePath: string,
  gitConfig: {
    readonly username: string;
    readonly email: string;
    readonly signingKey?: string;
    readonly sshKeyPath?: string;
    readonly gpgSign?: boolean;
  },
  logger: MCPExecutionLogger
): TemplateRepositoryService {
  return new TemplateRepositoryService(
    basePath,
    {
      ...gitConfig,
      gpgSign: gitConfig.gpgSign ?? false
    },
    logger
  );
}

// Default export
export { TemplateRepositoryService as default };