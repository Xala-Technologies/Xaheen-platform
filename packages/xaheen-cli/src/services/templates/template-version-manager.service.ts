/**
 * @fileoverview Template Version Manager Service - EPIC 15 Story 15.3 Task 1
 * @description Semantic versioning, dependency management, and compatibility checking for templates
 * @version 1.0.0
 * @compliance Norwegian NSM Standards, GDPR, Enterprise Security, Audit Trail
 * @author Xaheen CLI Team
 * @since 2025-01-03
 */

import { z } from "zod";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import semver from "semver";
import { EventEmitter } from "events";
import type { 
  NSMClassification, 
  Permission, 
  User 
} from "../authentication/types";
import type { MCPExecutionLogger } from "../mcp/mcp-execution-logger.service";
import type { TemplateMetadata } from "./template-repository.service";

// Version Constraint Schema
export const VersionConstraintSchema = z.object({
  name: z.string().min(1),
  constraint: z.string().min(1), // e.g., "^1.0.0", ">=2.0.0 <3.0.0"
  type: z.enum(["dependency", "peerDependency", "devDependency", "optionalDependency"]).default("dependency"),
  required: z.boolean().default(true),
  reason: z.string().optional()
});

// Template Dependency Schema
export const TemplateDependencySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  version: z.string().min(1),
  type: z.enum(["template", "library", "framework", "tool"]).default("template"),
  repository: z.string().optional(),
  path: z.string().optional(),
  checksum: z.string().optional(),
  metadata: z.object({
    author: z.string().optional(),
    license: z.string().optional(),
    description: z.string().optional(),
    keywords: z.array(z.string()).default([])
  }).default({})
});

// Version History Schema
export const VersionHistorySchema = z.object({
  version: z.string().min(1),
  templateId: z.string().min(1),
  releaseDate: z.date(),
  author: z.string().min(1),
  commitHash: z.string().optional(),
  changelog: z.string().optional(),
  breaking: z.boolean().default(false),
  deprecated: z.boolean().default(false),
  prerelease: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  dependencies: z.array(TemplateDependencySchema).default([]),
  constraints: z.array(VersionConstraintSchema).default([]),
  compatibility: z.object({
    frameworks: z.array(z.string()).default([]),
    nodeVersion: z.string().optional(),
    npmVersion: z.string().optional(),
    platforms: z.array(z.string()).default([])
  }).default({}),
  norwegianCompliance: z.object({
    nsmClassification: z.enum(["OPEN", "RESTRICTED", "CONFIDENTIAL", "SECRET"]).default("OPEN"),
    gdprCompliant: z.boolean().default(true),
    wcagLevel: z.enum(["A", "AA", "AAA"]).default("AA"),
    approved: z.boolean().default(false),
    approver: z.string().optional(),
    approvalDate: z.date().optional()
  }).default({})
});

// Version Resolution Schema
export const VersionResolutionSchema = z.object({
  templateId: z.string().min(1),
  requestedVersion: z.string().min(1),
  resolvedVersion: z.string().min(1),
  resolutionStrategy: z.enum(["exact", "latest", "range", "prerelease"]),
  dependencies: z.array(z.object({
    templateId: z.string(),
    requestedVersion: z.string(),
    resolvedVersion: z.string(),
    reason: z.string().optional()
  })).default([]),
  conflicts: z.array(z.object({
    templateId: z.string(),
    conflictingVersions: z.array(z.string()),
    resolution: z.string().optional(),
    reason: z.string().optional()
  })).default([])
});

// Migration Schema
export const MigrationSchema = z.object({
  id: z.string().min(1),
  templateId: z.string().min(1),
  fromVersion: z.string().min(1),
  toVersion: z.string().min(1),
  type: z.enum(["major", "minor", "patch", "prerelease"]),
  breaking: z.boolean().default(false),
  automated: z.boolean().default(true),
  migrationScript: z.string().optional(),
  instructions: z.string().optional(),
  transformations: z.array(z.object({
    type: z.enum(["rename", "remove", "add", "modify", "replace"]),
    path: z.string(),
    from: z.any().optional(),
    to: z.any().optional(),
    reason: z.string().optional()
  })).default([]),
  requirements: z.array(z.string()).default([]),
  warnings: z.array(z.string()).default([]),
  createdAt: z.date().default(() => new Date()),
  createdBy: z.string().min(1)
});

// Type definitions
export type VersionConstraint = z.infer<typeof VersionConstraintSchema>;
export type TemplateDependency = z.infer<typeof TemplateDependencySchema>;
export type VersionHistory = z.infer<typeof VersionHistorySchema>;
export type VersionResolution = z.infer<typeof VersionResolutionSchema>;
export type Migration = z.infer<typeof MigrationSchema>;

// Version Events
export interface VersionEvent {
  readonly eventId: string;
  readonly templateId: string;
  readonly eventType: VersionEventType;
  readonly version: string;
  readonly timestamp: Date;
  readonly userId: string;
  readonly details: Record<string, any>;
  readonly nsmClassification: NSMClassification;
}

export enum VersionEventType {
  VERSION_CREATED = "VERSION_CREATED",
  VERSION_PUBLISHED = "VERSION_PUBLISHED",
  VERSION_DEPRECATED = "VERSION_DEPRECATED",
  VERSION_DELETED = "VERSION_DELETED",
  DEPENDENCY_ADDED = "DEPENDENCY_ADDED",
  DEPENDENCY_UPDATED = "DEPENDENCY_UPDATED",
  DEPENDENCY_REMOVED = "DEPENDENCY_REMOVED",
  MIGRATION_CREATED = "MIGRATION_CREATED",
  MIGRATION_EXECUTED = "MIGRATION_EXECUTED",
  CONFLICT_DETECTED = "CONFLICT_DETECTED",
  COMPATIBILITY_CHECKED = "COMPATIBILITY_CHECKED"
}

// Version Manager Error Classes
export class VersionManagerError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly templateId?: string,
    public readonly version?: string
  ) {
    super(message);
    this.name = "VersionManagerError";
  }
}

export class DependencyError extends Error {
  constructor(
    message: string,
    public readonly templateId: string,
    public readonly dependencyId: string,
    public readonly constraint: string
  ) {
    super(message);
    this.name = "DependencyError";
  }
}

export class CompatibilityError extends Error {
  constructor(
    message: string,
    public readonly templateId: string,
    public readonly version: string,
    public readonly incompatibilities: string[]
  ) {
    super(message);
    this.name = "CompatibilityError";
  }
}

/**
 * Template Version Manager Service
 * 
 * Provides comprehensive version management for templates:
 * - Semantic versioning with proper constraints
 * - Dependency resolution and management
 * - Version compatibility checking
 * - Automated migration support
 * - Norwegian compliance tracking
 * - Comprehensive audit trail
 */
export class TemplateVersionManagerService extends EventEmitter {
  private readonly versions = new Map<string, VersionHistory[]>();
  private readonly dependencies = new Map<string, TemplateDependency[]>();
  private readonly migrations = new Map<string, Migration[]>();
  private readonly dataPath: string;
  private readonly logger: MCPExecutionLogger;
  
  constructor(dataPath: string, logger: MCPExecutionLogger) {
    super();
    this.dataPath = path.resolve(dataPath);
    this.logger = logger;
    
    // Ensure data directory exists
    this.ensureDirectoryExists(this.dataPath);
  }

  /**
   * Create a new version for a template
   */
  async createVersion(
    templateId: string,
    version: string,
    metadata: {
      readonly author: string;
      readonly changelog?: string;
      readonly breaking?: boolean;
      readonly dependencies?: TemplateDependency[];
      readonly constraints?: VersionConstraint[];
      readonly commitHash?: string;
    },
    user: User
  ): Promise<VersionHistory> {
    const startTime = Date.now();
    const operationId = crypto.randomUUID();
    
    try {
      // Validate version format
      if (!semver.valid(version)) {
        throw new VersionManagerError(
          `Invalid semantic version: ${version}`,
          "INVALID_VERSION",
          templateId,
          version
        );
      }
      
      // Check if version already exists
      const existingVersions = this.versions.get(templateId) || [];
      if (existingVersions.some(v => v.version === version)) {
        throw new VersionManagerError(
          `Version ${version} already exists for template ${templateId}`,
          "VERSION_EXISTS",
          templateId,
          version
        );
      }
      
      // Create version history entry
      const versionHistory: VersionHistory = {
        version,
        templateId,
        releaseDate: new Date(),
        author: metadata.author,
        commitHash: metadata.commitHash,
        changelog: metadata.changelog,
        breaking: metadata.breaking || false,
        deprecated: false,
        prerelease: semver.prerelease(version) !== null,
        tags: [],
        dependencies: metadata.dependencies || [],
        constraints: metadata.constraints || [],
        compatibility: {
          frameworks: [],
          platforms: []
        },
        norwegianCompliance: {
          nsmClassification: user.nsmClearance,
          gdprCompliant: true,
          wcagLevel: "AA",
          approved: false
        }
      };
      
      // Validate dependencies
      await this.validateDependencies(versionHistory.dependencies, templateId, version);
      
      // Store version
      const versions = this.versions.get(templateId) || [];
      versions.push(versionHistory);
      versions.sort((a, b) => semver.compare(b.version, a.version)); // Sort descending
      this.versions.set(templateId, versions);
      
      // Persist to disk
      await this.persistVersionData(templateId);
      
      // Log operation
      await this.logger.logOperation(
        "info",
        "template_processing",
        "Version created successfully",
        {
          executionContext: {
            operationId,
            operation: "CREATE_VERSION",
            timestamp: new Date().toISOString(),
            duration: Date.now() - startTime
          },
          mcpOperation: {
            type: "VERSION_MANAGEMENT",
            subtype: "CREATE_VERSION",
            userId: user.id,
            templateId,
            version,
            metadata: {
              breaking: metadata.breaking,
              prerelease: versionHistory.prerelease,
              dependencyCount: versionHistory.dependencies.length
            }
          },
          structuredData: {
            compliance: {
              gdprApplicable: true,
              nsmClassification: user.nsmClearance,
              dataRetention: 2555, // 7 years
              auditRequired: true
            }
          }
        }
      );
      
      // Emit event
      this.emit("versionCreated", {
        eventId: crypto.randomUUID(),
        templateId,
        eventType: VersionEventType.VERSION_CREATED,
        version,
        timestamp: new Date(),
        userId: user.id,
        details: { versionHistory },
        nsmClassification: user.nsmClearance
      });
      
      return versionHistory;
      
    } catch (error) {
      await this.logger.logOperation(
        "error",
        "template_processing",
        `Failed to create version: ${error instanceof Error ? error.message : String(error)}`,
        {
          executionContext: {
            operationId,
            operation: "CREATE_VERSION",
            timestamp: new Date().toISOString(),
            duration: Date.now() - startTime
          },
          mcpOperation: {
            type: "VERSION_MANAGEMENT",
            subtype: "CREATE_VERSION",
            userId: user.id,
            templateId,
            version,
            error: error instanceof Error ? error.message : String(error)
          },
          structuredData: {}
        }
      );
      
      throw error;
    }
  }

  /**
   * Resolve version constraints for a template and its dependencies
   */
  async resolveVersion(
    templateId: string,
    versionConstraint: string,
    options: {
      readonly includePrerelease?: boolean;
      readonly strategy?: "exact" | "latest" | "range" | "prerelease";
    } = {}
  ): Promise<VersionResolution> {
    const startTime = Date.now();
    const operationId = crypto.randomUUID();
    
    try {
      const versions = this.versions.get(templateId) || [];
      if (versions.length === 0) {
        throw new VersionManagerError(
          `No versions found for template ${templateId}`,
          "NO_VERSIONS",
          templateId
        );
      }
      
      // Filter versions based on options
      let availableVersions = versions.filter(v => !v.deprecated);
      if (!options.includePrerelease) {
        availableVersions = availableVersions.filter(v => !v.prerelease);
      }
      
      // Resolve version based on constraint and strategy
      let resolvedVersion: string;
      const strategy = options.strategy || "range";
      
      switch (strategy) {
        case "exact":
          if (!availableVersions.some(v => v.version === versionConstraint)) {
            throw new VersionManagerError(
              `Exact version ${versionConstraint} not found`,
              "VERSION_NOT_FOUND",
              templateId,
              versionConstraint
            );
          }
          resolvedVersion = versionConstraint;
          break;
          
        case "latest":
          resolvedVersion = availableVersions[0].version; // Already sorted descending
          break;
          
        case "prerelease":
          const prereleaseVersions = versions.filter(v => v.prerelease && !v.deprecated);
          if (prereleaseVersions.length === 0) {
            throw new VersionManagerError(
              `No prerelease versions found for template ${templateId}`,
              "NO_PRERELEASE_VERSIONS",
              templateId
            );
          }
          resolvedVersion = prereleaseVersions[0].version;
          break;
          
        case "range":
        default:
          const satisfyingVersion = semver.maxSatisfying(
            availableVersions.map(v => v.version),
            versionConstraint
          );
          if (!satisfyingVersion) {
            throw new VersionManagerError(
              `No version satisfies constraint ${versionConstraint}`,
              "NO_SATISFYING_VERSION",
              templateId,
              versionConstraint
            );
          }
          resolvedVersion = satisfyingVersion;
          break;
      }
      
      // Get resolved version details
      const versionDetails = versions.find(v => v.version === resolvedVersion)!;
      
      // Resolve dependencies recursively
      const resolvedDependencies = await this.resolveDependencies(
        versionDetails.dependencies,
        options
      );
      
      // Check for conflicts
      const conflicts = this.detectConflicts(resolvedDependencies);
      
      const resolution: VersionResolution = {
        templateId,
        requestedVersion: versionConstraint,
        resolvedVersion,
        resolutionStrategy: strategy,
        dependencies: resolvedDependencies,
        conflicts
      };
      
      // Log operation
      await this.logger.logOperation(
        "info",
        "template_processing",
        "Version resolved successfully",
        {
          executionContext: {
            operationId,
            operation: "RESOLVE_VERSION",
            timestamp: new Date().toISOString(),
            duration: Date.now() - startTime
          },
          mcpOperation: {
            type: "VERSION_MANAGEMENT",
            subtype: "RESOLVE_VERSION",
            userId: "system",
            templateId,
            constraint: versionConstraint,
            resolved: resolvedVersion,
            strategy,
            metadata: {
              dependencyCount: resolvedDependencies.length,
              conflictCount: conflicts.length
            }
          },
          structuredData: {}
        }
      );
      
      return resolution;
      
    } catch (error) {
      await this.logger.logOperation(
        "error",
        "template_processing",
        `Failed to resolve version: ${error instanceof Error ? error.message : String(error)}`,
        {
          executionContext: {
            operationId,
            operation: "RESOLVE_VERSION",
            timestamp: new Date().toISOString(),
            duration: Date.now() - startTime
          },
          mcpOperation: {
            type: "VERSION_MANAGEMENT",
            subtype: "RESOLVE_VERSION",
            userId: "system",
            templateId,
            constraint: versionConstraint,
            error: error instanceof Error ? error.message : String(error)
          },
          structuredData: {}
        }
      );
      
      throw error;
    }
  }

  /**
   * Check compatibility between template versions
   */
  async checkCompatibility(
    templateId: string,
    version: string,
    targetEnvironment: {
      readonly framework?: string;
      readonly nodeVersion?: string;
      readonly npmVersion?: string;
      readonly platforms?: string[];
    }
  ): Promise<{
    readonly compatible: boolean;
    readonly issues: string[];
    readonly warnings: string[];
  }> {
    const startTime = Date.now();
    const operationId = crypto.randomUUID();
    
    try {
      const versionData = await this.getVersionHistory(templateId, version);
      if (!versionData) {
        throw new VersionManagerError(
          `Version ${version} not found for template ${templateId}`,
          "VERSION_NOT_FOUND",
          templateId,
          version
        );
      }
      
      const issues: string[] = [];
      const warnings: string[] = [];
      
      // Check framework compatibility
      if (targetEnvironment.framework && versionData.compatibility.frameworks.length > 0) {
        if (!versionData.compatibility.frameworks.includes(targetEnvironment.framework)) {
          issues.push(`Framework ${targetEnvironment.framework} is not supported. Supported: ${versionData.compatibility.frameworks.join(", ")}`);
        }
      }
      
      // Check Node.js version compatibility
      if (targetEnvironment.nodeVersion && versionData.compatibility.nodeVersion) {
        if (!semver.satisfies(targetEnvironment.nodeVersion, versionData.compatibility.nodeVersion)) {
          issues.push(`Node.js version ${targetEnvironment.nodeVersion} does not satisfy requirement ${versionData.compatibility.nodeVersion}`);
        }
      }
      
      // Check npm version compatibility
      if (targetEnvironment.npmVersion && versionData.compatibility.npmVersion) {
        if (!semver.satisfies(targetEnvironment.npmVersion, versionData.compatibility.npmVersion)) {
          warnings.push(`npm version ${targetEnvironment.npmVersion} does not satisfy recommendation ${versionData.compatibility.npmVersion}`);
        }
      }
      
      // Check platform compatibility
      if (targetEnvironment.platforms && versionData.compatibility.platforms.length > 0) {
        const unsupportedPlatforms = targetEnvironment.platforms.filter(
          platform => !versionData.compatibility.platforms.includes(platform)
        );
        if (unsupportedPlatforms.length > 0) {
          warnings.push(`Platforms may not be fully supported: ${unsupportedPlatforms.join(", ")}`);
        }
      }
      
      // Check dependency compatibility
      for (const dependency of versionData.dependencies) {
        try {
          await this.resolveVersion(dependency.name, dependency.version);
        } catch (error) {
          issues.push(`Dependency ${dependency.name}@${dependency.version} cannot be resolved`);
        }
      }
      
      const compatible = issues.length === 0;
      
      // Log operation
      await this.logger.logOperation(
        "info",
        "template_processing",
        "Compatibility check completed",
        {
          executionContext: {
            operationId,
            operation: "CHECK_COMPATIBILITY",
            timestamp: new Date().toISOString(),
            duration: Date.now() - startTime
          },
          mcpOperation: {
            type: "VERSION_MANAGEMENT",
            subtype: "CHECK_COMPATIBILITY",
            userId: "system",
            templateId,
            version,
            metadata: {
              compatible,
              issueCount: issues.length,
              warningCount: warnings.length,
              targetEnvironment
            }
          },
          structuredData: {}
        }
      );
      
      return { compatible, issues, warnings };
      
    } catch (error) {
      await this.logger.logOperation(
        "error",
        "template_processing",
        `Failed to check compatibility: ${error instanceof Error ? error.message : String(error)}`,
        {
          executionContext: {
            operationId,
            operation: "CHECK_COMPATIBILITY",
            timestamp: new Date().toISOString(),
            duration: Date.now() - startTime
          },
          mcpOperation: {
            type: "VERSION_MANAGEMENT",
            subtype: "CHECK_COMPATIBILITY",
            userId: "system",
            templateId,
            version,
            error: error instanceof Error ? error.message : String(error)
          },
          structuredData: {}
        }
      );
      
      throw error;
    }
  }

  /**
   * Create migration between template versions
   */
  async createMigration(
    templateId: string,
    fromVersion: string,
    toVersion: string,
    migrationData: {
      readonly breaking?: boolean;
      readonly automated?: boolean;
      readonly migrationScript?: string;
      readonly instructions?: string;
      readonly transformations?: Array<{
        readonly type: "rename" | "remove" | "add" | "modify" | "replace";
        readonly path: string;
        readonly from?: any;
        readonly to?: any;
        readonly reason?: string;
      }>;
      readonly requirements?: string[];
      readonly warnings?: string[];
    },
    user: User
  ): Promise<Migration> {
    const startTime = Date.now();
    const operationId = crypto.randomUUID();
    
    try {
      // Validate versions exist
      const fromVersionData = await this.getVersionHistory(templateId, fromVersion);
      const toVersionData = await this.getVersionHistory(templateId, toVersion);
      
      if (!fromVersionData) {
        throw new VersionManagerError(
          `Source version ${fromVersion} not found`,
          "SOURCE_VERSION_NOT_FOUND",
          templateId,
          fromVersion
        );
      }
      
      if (!toVersionData) {
        throw new VersionManagerError(
          `Target version ${toVersion} not found`,
          "TARGET_VERSION_NOT_FOUND",
          templateId,
          toVersion
        );
      }
      
      // Determine migration type
      const versionDiff = semver.diff(fromVersion, toVersion);
      const migrationType = versionDiff === "major" ? "major" :
                           versionDiff === "minor" ? "minor" :
                           versionDiff === "patch" ? "patch" : "prerelease";
      
      // Create migration
      const migration: Migration = {
        id: crypto.randomUUID(),
        templateId,
        fromVersion,
        toVersion,
        type: migrationType,
        breaking: migrationData.breaking || migrationType === "major",
        automated: migrationData.automated ?? true,
        migrationScript: migrationData.migrationScript,
        instructions: migrationData.instructions,
        transformations: migrationData.transformations || [],
        requirements: migrationData.requirements || [],
        warnings: migrationData.warnings || [],
        createdAt: new Date(),
        createdBy: user.id
      };
      
      // Store migration
      const migrations = this.migrations.get(templateId) || [];
      migrations.push(migration);
      this.migrations.set(templateId, migrations);
      
      // Persist to disk
      await this.persistMigrationData(templateId);
      
      // Log operation
      await this.logger.logOperation(
        "info",
        "template_processing",
        "Migration created successfully",
        {
          executionContext: {
            operationId,
            operation: "CREATE_MIGRATION",
            timestamp: new Date().toISOString(),
            duration: Date.now() - startTime
          },
          mcpOperation: {
            type: "VERSION_MANAGEMENT",
            subtype: "CREATE_MIGRATION",
            userId: user.id,
            templateId,
            fromVersion,
            toVersion,
            metadata: {
              type: migrationType,
              breaking: migration.breaking,
              automated: migration.automated
            }
          },
          structuredData: {
            compliance: {
              gdprApplicable: true,
              nsmClassification: user.nsmClearance,
              dataRetention: 2555,
              auditRequired: true
            }
          }
        }
      );
      
      // Emit event
      this.emit("migrationCreated", {
        eventId: crypto.randomUUID(),
        templateId,
        eventType: VersionEventType.MIGRATION_CREATED,
        version: `${fromVersion} -> ${toVersion}`,
        timestamp: new Date(),
        userId: user.id,
        details: { migration },
        nsmClassification: user.nsmClearance
      });
      
      return migration;
      
    } catch (error) {
      await this.logger.logOperation(
        "error",
        "template_processing",
        `Failed to create migration: ${error instanceof Error ? error.message : String(error)}`,
        {
          executionContext: {
            operationId,
            operation: "CREATE_MIGRATION",
            timestamp: new Date().toISOString(),
            duration: Date.now() - startTime
          },
          mcpOperation: {
            type: "VERSION_MANAGEMENT",
            subtype: "CREATE_MIGRATION",
            userId: user.id,
            templateId,
            fromVersion,
            toVersion,
            error: error instanceof Error ? error.message : String(error)
          },
          structuredData: {}
        }
      );
      
      throw error;
    }
  }

  /**
   * Get all versions for a template
   */
  async getVersions(
    templateId: string,
    options: {
      readonly includeDeprecated?: boolean;
      readonly includePrerelease?: boolean;
    } = {}
  ): Promise<VersionHistory[]> {
    let versions = this.versions.get(templateId) || [];
    
    if (!options.includeDeprecated) {
      versions = versions.filter(v => !v.deprecated);
    }
    
    if (!options.includePrerelease) {
      versions = versions.filter(v => !v.prerelease);
    }
    
    return versions;
  }

  /**
   * Get specific version history
   */
  async getVersionHistory(templateId: string, version: string): Promise<VersionHistory | null> {
    const versions = this.versions.get(templateId) || [];
    return versions.find(v => v.version === version) || null;
  }

  /**
   * Get latest version for a template
   */
  async getLatestVersion(
    templateId: string,
    options: {
      readonly includePrerelease?: boolean;
    } = {}
  ): Promise<VersionHistory | null> {
    const versions = await this.getVersions(templateId, {
      includeDeprecated: false,
      includePrerelease: options.includePrerelease
    });
    
    return versions.length > 0 ? versions[0] : null;
  }

  /**
   * Deprecate a version
   */
  async deprecateVersion(templateId: string, version: string, user: User): Promise<void> {
    const versionData = await this.getVersionHistory(templateId, version);
    if (!versionData) {
      throw new VersionManagerError(
        `Version ${version} not found`,
        "VERSION_NOT_FOUND",
        templateId,
        version
      );
    }
    
    versionData.deprecated = true;
    await this.persistVersionData(templateId);
    
    // Emit event
    this.emit("versionDeprecated", {
      eventId: crypto.randomUUID(),
      templateId,
      eventType: VersionEventType.VERSION_DEPRECATED,
      version,
      timestamp: new Date(),
      userId: user.id,
      details: { versionData },
      nsmClassification: user.nsmClearance
    });
  }

  /**
   * Validate dependencies
   */
  private async validateDependencies(
    dependencies: TemplateDependency[],
    templateId: string,
    version: string
  ): Promise<void> {
    for (const dependency of dependencies) {
      // Check if dependency exists
      const dependencyVersions = this.versions.get(dependency.name);
      if (!dependencyVersions || dependencyVersions.length === 0) {
        throw new DependencyError(
          `Dependency ${dependency.name} not found`,
          templateId,
          dependency.name,
          dependency.version
        );
      }
      
      // Check version constraint
      const satisfyingVersion = semver.maxSatisfying(
        dependencyVersions.map(v => v.version),
        dependency.version
      );
      
      if (!satisfyingVersion) {
        throw new DependencyError(
          `No version of ${dependency.name} satisfies constraint ${dependency.version}`,
          templateId,
          dependency.name,
          dependency.version
        );
      }
    }
  }

  /**
   * Resolve dependencies recursively
   */
  private async resolveDependencies(
    dependencies: TemplateDependency[],
    options: {
      readonly includePrerelease?: boolean;
      readonly strategy?: "exact" | "latest" | "range" | "prerelease";
    }
  ): Promise<Array<{
    readonly templateId: string;
    readonly requestedVersion: string;
    readonly resolvedVersion: string;
    readonly reason?: string;
  }>> {
    const resolved: Array<{
      readonly templateId: string;
      readonly requestedVersion: string;  
      readonly resolvedVersion: string;
      readonly reason?: string;
    }> = [];
    
    for (const dependency of dependencies) {
      try {
        const resolution = await this.resolveVersion(
          dependency.name,
          dependency.version,
          options
        );
        
        resolved.push({
          templateId: dependency.name,
          requestedVersion: dependency.version,
          resolvedVersion: resolution.resolvedVersion
        });
        
        // Add nested dependencies
        resolved.push(...resolution.dependencies);
      } catch (error) {
        resolved.push({
          templateId: dependency.name,
          requestedVersion: dependency.version,
          resolvedVersion: "UNRESOLVED",
          reason: error instanceof Error ? error.message : String(error)
        });
      }
    }
    
    return resolved;
  }

  /**
   * Detect version conflicts
   */
  private detectConflicts(
    dependencies: Array<{
      readonly templateId: string;
      readonly requestedVersion: string;
      readonly resolvedVersion: string;
    }>
  ): Array<{
    readonly templateId: string;
    readonly conflictingVersions: string[];
    readonly resolution?: string;
    readonly reason?: string;
  }> {
    const conflicts: Array<{
      readonly templateId: string;
      readonly conflictingVersions: string[];
      readonly resolution?: string;
      readonly reason?: string;
    }> = [];
    
    // Group dependencies by template ID
    const dependencyMap = new Map<string, Array<{
      readonly requestedVersion: string;
      readonly resolvedVersion: string;
    }>>();
    
    for (const dep of dependencies) {
      if (!dependencyMap.has(dep.templateId)) {
        dependencyMap.set(dep.templateId, []);
      }
      dependencyMap.get(dep.templateId)!.push({
        requestedVersion: dep.requestedVersion,
        resolvedVersion: dep.resolvedVersion
      });
    }
    
    // Check for conflicts
    for (const [templateId, versions] of dependencyMap) {
      const uniqueResolved = [...new Set(versions.map(v => v.resolvedVersion))];
      if (uniqueResolved.length > 1) {
        conflicts.push({
          templateId,
          conflictingVersions: uniqueResolved,
          reason: "Multiple versions required by different dependencies"
        });
      }
    }
    
    return conflicts;
  }

  /**
   * Persist version data to disk
   */
  private async persistVersionData(templateId: string): Promise<void> {
    const versions = this.versions.get(templateId) || [];
    const filePath = path.join(this.dataPath, `${templateId}.versions.json`);
    await fs.writeFile(filePath, JSON.stringify(versions, null, 2));
  }

  /**
   * Persist migration data to disk
   */
  private async persistMigrationData(templateId: string): Promise<void> {
    const migrations = this.migrations.get(templateId) || [];
    const filePath = path.join(this.dataPath, `${templateId}.migrations.json`);
    await fs.writeFile(filePath, JSON.stringify(migrations, null, 2));
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
export function createTemplateVersionManagerService(
  dataPath: string,
  logger: MCPExecutionLogger
): TemplateVersionManagerService {
  return new TemplateVersionManagerService(dataPath, logger);
}

// Default export
export { TemplateVersionManagerService as default };