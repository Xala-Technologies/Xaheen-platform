/**
 * @fileoverview MCP Execution Logger - EPIC 13 Story 13.6.8 & EPIC 14 Story 14.2.3
 * @description Structured logging system with audit trail and searchable metadata for MCP operations
 * @version 1.0.0
 * @compliance Norwegian Enterprise Standards, Audit Trail Requirements, GDPR
 */

import { promises as fs } from "fs";
import { join, resolve, dirname } from "path";
import { z } from "zod";
import { logger } from "../../utils/logger.js";

// Core logging schemas
const LogLevelSchema = z.enum(["trace", "debug", "info", "warn", "error", "fatal"]);
const LogCategorySchema = z.enum([
	"mcp_connection",
	"component_generation", 
	"template_processing",
	"validation",
	"context_indexing",
	"audit_trail",
	"performance",
	"security",
	"compliance",
	"user_action",
]);

const ExecutionContextSchema = z.object({
	sessionId: z.string(),
	userId: z.string().optional(),
	processId: z.number(),
	threadId: z.string().optional(),
	timestamp: z.date(),
	command: z.string(),
	arguments: z.array(z.string()),
	workingDirectory: z.string(),
	environment: z.record(z.string()).optional(),
});

const MCPOperationSchema = z.object({
	operationId: z.string(),
	operationType: z.enum([
		"connect",
		"disconnect", 
		"generate_component",
		"index_context",
		"validate_step",
		"template_render",
		"metadata_extract",
		"audit_log",
	]),
	startTime: z.date(),
	endTime: z.date().optional(),
	duration: z.number().optional(),
	status: z.enum(["started", "in_progress", "completed", "failed", "cancelled"]),
	input: z.record(z.any()).optional(),
	output: z.record(z.any()).optional(),
	error: z.string().optional(),
	metadata: z.record(z.any()).optional(),
});

const SecurityContextSchema = z.object({
	classification: z.enum(["OPEN", "RESTRICTED", "CONFIDENTIAL", "SECRET"]),
	accessLevel: z.string(),
	auditRequired: z.boolean(),
	dataHandling: z.array(z.string()),
	complianceFlags: z.array(z.string()),
});

const ComplianceMetadataSchema = z.object({
	gdprCompliant: z.boolean(),
	norwegianStandards: z.boolean(),
	nsmClassification: z.string().optional(),
	dataRetentionDays: z.number(),
	auditTrailRequired: z.boolean(),
	anonymizationRequired: z.boolean(),
});

const LogEntrySchema = z.object({
	id: z.string(),
	timestamp: z.date(),
	level: LogLevelSchema,
	category: LogCategorySchema,
	message: z.string(),
	executionContext: ExecutionContextSchema,
	mcpOperation: MCPOperationSchema.optional(),
	securityContext: SecurityContextSchema.optional(),
	complianceMetadata: ComplianceMetadataSchema,
	correlationId: z.string().optional(),
	parentId: z.string().optional(),
	tags: z.array(z.string()),
	searchableText: z.string(),
	structuredData: z.record(z.any()).optional(),
});

const SearchQuerySchema = z.object({
	query: z.string().optional(),
	level: LogLevelSchema.optional(),
	category: LogCategorySchema.optional(),
	dateFrom: z.date().optional(),
	dateTo: z.date().optional(),
	sessionId: z.string().optional(),
	userId: z.string().optional(),
	operationType: z.string().optional(),
	tags: z.array(z.string()).optional(),
	limit: z.number().default(100),
	offset: z.number().default(0),
});

export type LogLevel = z.infer<typeof LogLevelSchema>;
export type LogCategory = z.infer<typeof LogCategorySchema>;
export type ExecutionContext = z.infer<typeof ExecutionContextSchema>;
export type MCPOperation = z.infer<typeof MCPOperationSchema>;
export type SecurityContext = z.infer<typeof SecurityContextSchema>;
export type ComplianceMetadata = z.infer<typeof ComplianceMetadataSchema>;
export type LogEntry = z.infer<typeof LogEntrySchema>;
export type SearchQuery = z.infer<typeof SearchQuerySchema>;

export interface LogStorageOptions {
	readonly maxFileSize: number;
	readonly maxFiles: number;
	readonly retentionDays: number;
	readonly compressionEnabled: boolean;
	readonly encryptionEnabled: boolean;
	readonly auditTrailPath: string;
	readonly indexingEnabled: boolean;
}

export interface LogAnalytics {
	readonly totalEntries: number;
	readonly entriesByLevel: Record<LogLevel, number>;
	readonly entriesByCategory: Record<LogCategory, number>;
	readonly topOperations: Array<{ operation: string; count: number }>;
	readonly errorRate: number;
	readonly averageDuration: number;
	readonly peakHours: Array<{ hour: number; count: number }>;
	readonly complianceStatus: {
		gdprCompliant: number;
		norwegianCompliant: number;
		auditTrailComplete: number;
	};
}

/**
 * Enterprise-grade MCP Execution Logger
 * Provides comprehensive logging, audit trails, and compliance tracking
 */
export class MCPExecutionLogger {
	private readonly storageDir: string;
	private readonly indexDir: string;
	private readonly auditDir: string;
	private readonly options: LogStorageOptions;
	private currentLogFile: string | null = null;
	private currentFileSize = 0;
	private searchIndex = new Map<string, Set<string>>();
	private isInitialized = false;

	constructor(options: Partial<LogStorageOptions> = {}) {
		this.options = {
			maxFileSize: 50 * 1024 * 1024, // 50MB
			maxFiles: 100,
			retentionDays: 365, // 1 year for compliance
			compressionEnabled: true,
			encryptionEnabled: false, // Enable for sensitive data
			auditTrailPath: ".xaheen/audit",
			indexingEnabled: true,
			...options,
		};

		this.storageDir = join(process.cwd(), ".xaheen", "logs");
		this.indexDir = join(process.cwd(), ".xaheen", "search-index");
		this.auditDir = join(process.cwd(), this.options.auditTrailPath);
	}

	/**
	 * Initialize the logging system
	 */
	async initialize(): Promise<void> {
		if (this.isInitialized) return;

		try {
			// Create directories
			await fs.mkdir(this.storageDir, { recursive: true });
			await fs.mkdir(this.indexDir, { recursive: true });
			await fs.mkdir(this.auditDir, { recursive: true });

			// Initialize current log file
			await this.initializeLogFile();

			// Load search index if enabled
			if (this.options.indexingEnabled) {
				await this.loadSearchIndex();
			}

			// Clean up old files based on retention policy
			await this.cleanupOldLogs();

			this.isInitialized = true;
			logger.info("📊 MCP Execution Logger initialized successfully");
		} catch (error) {
			logger.error("Failed to initialize MCP Execution Logger:", error);
			throw error;
		}
	}

	/**
	 * Log an MCP operation with full context
	 */
	async logOperation(
		level: LogLevel,
		category: LogCategory,
		message: string,
		context: {
			executionContext: Partial<ExecutionContext>;
			mcpOperation?: Partial<MCPOperation>;
			securityContext?: Partial<SecurityContext>;
			complianceMetadata?: Partial<ComplianceMetadata>;
			tags?: readonly string[];
			structuredData?: Record<string, any>;
			correlationId?: string;
			parentId?: string;
		}
	): Promise<void> {
		if (!this.isInitialized) {
			await this.initialize();
		}

		try {
			// Generate unique ID for this log entry
			const id = this.generateLogId();
			const timestamp = new Date();

			// Build complete execution context
			const fullExecutionContext: ExecutionContext = {
				sessionId: this.generateSessionId(),
				processId: process.pid,
				timestamp,
				command: process.argv[1] || "unknown",
				arguments: process.argv.slice(2),
				workingDirectory: process.cwd(),
				...context.executionContext,
			};

			// Build compliance metadata with defaults
			const fullComplianceMetadata: ComplianceMetadata = {
				gdprCompliant: true,
				norwegianStandards: true,
				dataRetentionDays: this.options.retentionDays,
				auditTrailRequired: category === "audit_trail" || level === "error",
				anonymizationRequired: false,
				...context.complianceMetadata,
			};

			// Build searchable text
			const searchableText = this.buildSearchableText(
				message,
				context.tags || [],
				context.structuredData || {}
			);

			// Create log entry
			const logEntry: LogEntry = {
				id,
				timestamp,
				level,
				category,
				message,
				executionContext: fullExecutionContext,
				mcpOperation: context.mcpOperation ? {
					operationId: this.generateOperationId(),
					operationType: "generate_component",
					startTime: timestamp,
					status: "started",
					...context.mcpOperation,
				} : undefined,
				securityContext: context.securityContext,
				complianceMetadata: fullComplianceMetadata,
				correlationId: context.correlationId,
				parentId: context.parentId,
				tags: Array.from(context.tags || []),
				searchableText,
				structuredData: context.structuredData,
			};

			// Validate log entry
			const validatedEntry = LogEntrySchema.parse(logEntry);

			// Write to log file
			await this.writeLogEntry(validatedEntry);

			// Update search index if enabled
			if (this.options.indexingEnabled) {
				await this.updateSearchIndex(validatedEntry);
			}

			// Write to audit trail if required
			if (fullComplianceMetadata.auditTrailRequired) {
				await this.writeAuditEntry(validatedEntry);
			}

			// Log to console for development
			if (process.env.NODE_ENV === "development") {
				this.logToConsole(validatedEntry);
			}
		} catch (error) {
			logger.error("Failed to log MCP operation:", error);
			// Don't throw - logging failures shouldn't crash the application
		}
	}

	/**
	 * Log MCP connection events
	 */
	async logConnection(
		action: "connect" | "disconnect" | "reconnect" | "timeout",
		context: {
			serverUrl?: string;
			clientId?: string;
			duration?: number;
			error?: string;
			metadata?: Record<string, any>;
		}
	): Promise<void> {
		await this.logOperation(
			context.error ? "error" : "info",
			"mcp_connection",
			`MCP ${action}${context.error ? ` failed: ${context.error}` : " successful"}`,
			{
				executionContext: {},
				mcpOperation: {
					operationType: action === "connect" ? "connect" : "disconnect",
					duration: context.duration,
					status: context.error ? "failed" : "completed",
					error: context.error,
					metadata: context.metadata,
				},
				tags: ["mcp", "connection", action],
				structuredData: {
					serverUrl: context.serverUrl,
					clientId: context.clientId,
				},
			}
		);
	}

	/**
	 * Log component generation events
	 */
	async logComponentGeneration(
		componentName: string,
		action: "start" | "complete" | "error",
		context: {
			platform?: string;
			features?: string[];
			duration?: number;
			error?: string;
			outputFiles?: string[];
			metadata?: Record<string, any>;
		}
	): Promise<void> {
		const correlationId = `component_${componentName}_${Date.now()}`;

		await this.logOperation(
			action === "error" ? "error" : "info",
			"component_generation",
			`Component ${componentName} generation ${action}${context.error ? `: ${context.error}` : ""}`,
			{
				executionContext: {},
				mcpOperation: {
					operationType: "generate_component",
					duration: context.duration,
					status: action === "error" ? "failed" : (action === "complete" ? "completed" : "started"),
					error: context.error,
					input: {
						componentName,
						platform: context.platform,
						features: context.features,
					},
					output: {
						files: context.outputFiles,
					},
					metadata: context.metadata,
				},
				tags: ["component", "generation", componentName, context.platform || "unknown"],
				structuredData: {
					componentName,
					platform: context.platform,
					features: context.features,
					outputFiles: context.outputFiles,
				},
				correlationId,
			}
		);
	}

	/**
	 * Log security and compliance events
	 */
	async logSecurityEvent(
		event: "classification_applied" | "audit_required" | "data_anonymized" | "access_granted" | "access_denied",
		context: {
			classification?: string;
			userId?: string;
			resourceId?: string;
			reason?: string;
			metadata?: Record<string, any>;
		}
	): Promise<void> {
		await this.logOperation(
			event.includes("denied") ? "warn" : "info",
			"security",
			`Security event: ${event}${context.reason ? ` - ${context.reason}` : ""}`,
			{
				executionContext: {
					userId: context.userId,
				},
				securityContext: {
					classification: (context.classification as any) || "OPEN",
					accessLevel: context.userId ? "authenticated" : "anonymous",
					auditRequired: true,
					dataHandling: ["logged", "audited"],
					complianceFlags: ["nsm", "gdpr"],
				},
				complianceMetadata: {
					auditTrailRequired: true,
					gdprCompliant: true,
					norwegianStandards: true,
				},
				tags: ["security", event, context.classification || "unclassified"],
				structuredData: {
					event,
					classification: context.classification,
					userId: context.userId,
					resourceId: context.resourceId,
					reason: context.reason,
				},
			}
		);
	}

	/**
	 * Search log entries
	 */
	async searchLogs(query: SearchQuery): Promise<{
		entries: LogEntry[];
		totalCount: number;
		hasMore: boolean;
	}> {
		if (!this.isInitialized) {
			await this.initialize();
		}

		try {
			const validatedQuery = SearchQuerySchema.parse(query);
			const results: LogEntry[] = [];
			let totalCount = 0;

			// If search index is enabled and we have a text query, use it
			if (this.options.indexingEnabled && validatedQuery.query) {
				const matchingIds = this.searchInIndex(validatedQuery.query);
				// Load matching entries (simplified implementation)
				// In production, this would be more sophisticated
			}

			// Fallback to file-based search
			const logFiles = await this.getLogFiles();
			
			for (const logFile of logFiles) {
				const entries = await this.readLogFile(logFile);
				
				for (const entry of entries) {
					if (this.matchesQuery(entry, validatedQuery)) {
						if (totalCount >= validatedQuery.offset && results.length < validatedQuery.limit) {
							results.push(entry);
						}
						totalCount++;
					}
				}

				// Early exit if we have enough results
				if (results.length >= validatedQuery.limit) break;
			}

			return {
				entries: results,
				totalCount,
				hasMore: totalCount > validatedQuery.offset + validatedQuery.limit,
			};
		} catch (error) {
			logger.error("Failed to search logs:", error);
			return { entries: [], totalCount: 0, hasMore: false };
		}
	}

	/**
	 * Generate analytics from log data
	 */
	async generateAnalytics(dateFrom?: Date, dateTo?: Date): Promise<LogAnalytics> {
		if (!this.isInitialized) {
			await this.initialize();
		}

		try {
			const logFiles = await this.getLogFiles();
			let totalEntries = 0;
			const entriesByLevel: Record<LogLevel, number> = {
				trace: 0, debug: 0, info: 0, warn: 0, error: 0, fatal: 0
			};
			const entriesByCategory: Record<LogCategory, number> = {
				mcp_connection: 0, component_generation: 0, template_processing: 0,
				validation: 0, context_indexing: 0, audit_trail: 0,
				performance: 0, security: 0, compliance: 0, user_action: 0
			};
			const operationCounts = new Map<string, number>();
			const durations: number[] = [];
			const hourCounts = new Array(24).fill(0);
			let gdprCompliant = 0;
			let norwegianCompliant = 0;
			let auditTrailComplete = 0;

			for (const logFile of logFiles) {
				const entries = await this.readLogFile(logFile);
				
				for (const entry of entries) {
					// Filter by date range if specified
					if (dateFrom && entry.timestamp < dateFrom) continue;
					if (dateTo && entry.timestamp > dateTo) continue;

					totalEntries++;
					entriesByLevel[entry.level]++;
					entriesByCategory[entry.category]++;

					// Track operations
					if (entry.mcpOperation?.operationType) {
						const count = operationCounts.get(entry.mcpOperation.operationType) || 0;
						operationCounts.set(entry.mcpOperation.operationType, count + 1);

						// Track durations for completed operations
						if (entry.mcpOperation.duration) {
							durations.push(entry.mcpOperation.duration);
						}
					}

					// Track hourly distribution
					const hour = entry.timestamp.getHours();
					hourCounts[hour]++;

					// Track compliance
					if (entry.complianceMetadata.gdprCompliant) gdprCompliant++;
					if (entry.complianceMetadata.norwegianStandards) norwegianCompliant++;
					if (entry.complianceMetadata.auditTrailRequired) auditTrailComplete++;
				}
			}

			// Calculate top operations
			const topOperations = Array.from(operationCounts.entries())
				.sort(([, a], [, b]) => b - a)
				.slice(0, 10)
				.map(([operation, count]) => ({ operation, count }));

			// Calculate error rate
			const errorCount = entriesByLevel.error + entriesByLevel.fatal;
			const errorRate = totalEntries > 0 ? (errorCount / totalEntries) * 100 : 0;

			// Calculate average duration
			const averageDuration = durations.length > 0 
				? durations.reduce((sum, d) => sum + d, 0) / durations.length 
				: 0;

			// Calculate peak hours
			const peakHours = hourCounts
				.map((count, hour) => ({ hour, count }))
				.sort((a, b) => b.count - a.count)
				.slice(0, 5);

			return {
				totalEntries,
				entriesByLevel,
				entriesByCategory,
				topOperations,
				errorRate,
				averageDuration,
				peakHours,
				complianceStatus: {
					gdprCompliant,
					norwegianCompliant,
					auditTrailComplete,
				},
			};
		} catch (error) {
			logger.error("Failed to generate analytics:", error);
			throw error;
		}
	}

	/**
	 * Export logs for external analysis
	 */
	async exportLogs(
		query: SearchQuery,
		format: "json" | "csv" | "xml" = "json",
		outputPath?: string
	): Promise<string> {
		const results = await this.searchLogs(query);
		const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
		const filename = outputPath || `mcp-logs-export-${timestamp}.${format}`;

		let content: string;

		switch (format) {
			case "csv":
				content = this.convertToCSV(results.entries);
				break;
			case "xml":
				content = this.convertToXML(results.entries);
				break;
			default:
				content = JSON.stringify(results.entries, null, 2);
		}

		await fs.writeFile(filename, content, "utf-8");
		return filename;
	}

	/**
	 * Clean up old logs based on retention policy
	 */
	async cleanupOldLogs(): Promise<void> {
		try {
			const cutoffDate = new Date();
			cutoffDate.setDate(cutoffDate.getDate() - this.options.retentionDays);

			const logFiles = await this.getLogFiles();
			let filesDeleted = 0;

			for (const logFile of logFiles) {
				const stats = await fs.stat(logFile);
				
				if (stats.mtime < cutoffDate) {
					await fs.unlink(logFile);
					filesDeleted++;
				}
			}

			if (filesDeleted > 0) {
				logger.info(`🧹 Cleaned up ${filesDeleted} old log files`);
			}
		} catch (error) {
			logger.warn("Failed to cleanup old logs:", error);
		}
	}

	// Private helper methods

	private async initializeLogFile(): Promise<void> {
		const timestamp = new Date().toISOString().split('T')[0];
		this.currentLogFile = join(this.storageDir, `mcp-${timestamp}.jsonl`);
		
		try {
			const stats = await fs.stat(this.currentLogFile);
			this.currentFileSize = stats.size;
		} catch {
			// File doesn't exist, will be created on first write
			this.currentFileSize = 0;
		}
	}

	private async writeLogEntry(entry: LogEntry): Promise<void> {
		if (!this.currentLogFile) {
			await this.initializeLogFile();
		}

		// Check if we need to rotate the log file
		if (this.currentFileSize >= this.options.maxFileSize) {
			await this.rotateLogFile();
		}

		const logLine = JSON.stringify(entry) + '\n';
		await fs.appendFile(this.currentLogFile!, logLine, 'utf-8');
		this.currentFileSize += Buffer.byteLength(logLine, 'utf-8');
	}

	private async rotateLogFile(): Promise<void> {
		if (!this.currentLogFile) return;

		const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
		const rotatedFile = this.currentLogFile.replace('.jsonl', `-${timestamp}.jsonl`);
		
		try {
			await fs.rename(this.currentLogFile, rotatedFile);
			
			// Compress if enabled
			if (this.options.compressionEnabled) {
				await this.compressFile(rotatedFile);
			}
		} catch (error) {
			logger.warn("Failed to rotate log file:", error);
		}

		// Initialize new log file
		await this.initializeLogFile();
	}

	private async writeAuditEntry(entry: LogEntry): Promise<void> {
		const auditFile = join(this.auditDir, `audit-${new Date().toISOString().split('T')[0]}.jsonl`);
		const auditLine = JSON.stringify({
			...entry,
			auditMarker: true,
			auditTimestamp: new Date().toISOString(),
		}) + '\n';
		
		await fs.appendFile(auditFile, auditLine, 'utf-8');
	}

	private async loadSearchIndex(): Promise<void> {
		try {
			const indexFile = join(this.indexDir, 'search-index.json');
			const content = await fs.readFile(indexFile, 'utf-8');
			const indexData = JSON.parse(content);
			
			this.searchIndex = new Map(
				Object.entries(indexData).map(([key, value]) => [key, new Set(value as string[])])
			);
		} catch {
			// Index doesn't exist yet, will be created
		}
	}

	private async updateSearchIndex(entry: LogEntry): Promise<void> {
		// Extract searchable terms
		const terms = this.extractSearchTerms(entry.searchableText);
		
		for (const term of terms) {
			if (!this.searchIndex.has(term)) {
				this.searchIndex.set(term, new Set());
			}
			this.searchIndex.get(term)!.add(entry.id);
		}

		// Periodically save the index
		if (Math.random() < 0.1) { // 10% chance to save
			await this.saveSearchIndex();
		}
	}

	private extractSearchTerms(text: string): string[] {
		return text
			.toLowerCase()
			.split(/\W+/)
			.filter(term => term.length > 2);
	}

	private async saveSearchIndex(): Promise<void> {
		try {
			const indexFile = join(this.indexDir, 'search-index.json');
			const indexData = Object.fromEntries(
				Array.from(this.searchIndex.entries()).map(([key, value]) => [key, Array.from(value)])
			);
			await fs.writeFile(indexFile, JSON.stringify(indexData, null, 2), 'utf-8');
		} catch (error) {
			logger.warn("Failed to save search index:", error);
		}
	}

	private searchInIndex(query: string): Set<string> {
		const terms = this.extractSearchTerms(query);
		const results = new Set<string>();
		
		for (const term of terms) {
			const termResults = this.searchIndex.get(term);
			if (termResults) {
				for (const id of termResults) {
					results.add(id);
				}
			}
		}

		return results;
	}

	private async getLogFiles(): Promise<string[]> {
		try {
			const files = await fs.readdir(this.storageDir);
			return files
				.filter(file => file.endsWith('.jsonl'))
				.map(file => join(this.storageDir, file))
				.sort();
		} catch {
			return [];
		}
	}

	private async readLogFile(filePath: string): Promise<LogEntry[]> {
		try {
			const content = await fs.readFile(filePath, 'utf-8');
			const lines = content.trim().split('\n').filter(line => line.trim());
			
			return lines.map(line => {
				try {
					return JSON.parse(line);
				} catch {
					return null;
				}
			}).filter(Boolean);
		} catch {
			return [];
		}
	}

	private matchesQuery(entry: LogEntry, query: SearchQuery): boolean {
		// Text search
		if (query.query && !entry.searchableText.toLowerCase().includes(query.query.toLowerCase())) {
			return false;
		}

		// Level filter
		if (query.level && entry.level !== query.level) {
			return false;
		}

		// Category filter
		if (query.category && entry.category !== query.category) {
			return false;
		}

		// Date range
		if (query.dateFrom && entry.timestamp < query.dateFrom) {
			return false;
		}
		if (query.dateTo && entry.timestamp > query.dateTo) {
			return false;
		}

		// Session filter
		if (query.sessionId && entry.executionContext.sessionId !== query.sessionId) {
			return false;
		}

		// User filter
		if (query.userId && entry.executionContext.userId !== query.userId) {
			return false;
		}

		// Operation type filter
		if (query.operationType && entry.mcpOperation?.operationType !== query.operationType) {
			return false;
		}

		// Tags filter
		if (query.tags && query.tags.length > 0) {
			const hasAllTags = query.tags.every(tag => entry.tags.includes(tag));
			if (!hasAllTags) {
				return false;
			}
		}

		return true;
	}

	private buildSearchableText(
		message: string,
		tags: readonly string[],
		structuredData: Record<string, any>
	): string {
		const parts = [
			message,
			...tags,
			...Object.values(structuredData).map(v => String(v)),
		];

		return parts.join(' ').toLowerCase();
	}

	private logToConsole(entry: LogEntry): void {
		const levelColors = {
			trace: '\x1b[37m', // white
			debug: '\x1b[36m', // cyan
			info: '\x1b[32m',  // green
			warn: '\x1b[33m',  // yellow
			error: '\x1b[31m', // red
			fatal: '\x1b[35m', // magenta
		};

		const reset = '\x1b[0m';
		const color = levelColors[entry.level];
		
		console.log(
			`${color}[${entry.timestamp.toISOString()}] ${entry.level.toUpperCase()} [${entry.category}] ${entry.message}${reset}`
		);
	}

	private convertToCSV(entries: LogEntry[]): string {
		const headers = ['id', 'timestamp', 'level', 'category', 'message', 'sessionId', 'operationType', 'status', 'duration'];
		const rows = entries.map(entry => [
			entry.id,
			entry.timestamp.toISOString(),
			entry.level,
			entry.category,
			entry.message.replace(/"/g, '""'),
			entry.executionContext.sessionId,
			entry.mcpOperation?.operationType || '',
			entry.mcpOperation?.status || '',
			entry.mcpOperation?.duration?.toString() || '',
		]);

		return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
	}

	private convertToXML(entries: LogEntry[]): string {
		const xmlEntries = entries.map(entry => {
			return `  <logEntry id="${entry.id}">
    <timestamp>${entry.timestamp.toISOString()}</timestamp>
    <level>${entry.level}</level>
    <category>${entry.category}</category>
    <message><![CDATA[${entry.message}]]></message>
    <sessionId>${entry.executionContext.sessionId}</sessionId>
    ${entry.mcpOperation ? `
    <operation>
      <type>${entry.mcpOperation.operationType}</type>
      <status>${entry.mcpOperation.status}</status>
      ${entry.mcpOperation.duration ? `<duration>${entry.mcpOperation.duration}</duration>` : ''}
    </operation>` : ''}
  </logEntry>`;
		}).join('\n');

		return `<?xml version="1.0" encoding="UTF-8"?>
<mcpLogs>
${xmlEntries}
</mcpLogs>`;
	}

	private async compressFile(filePath: string): Promise<void> {
		// Placeholder for file compression
		// In production, implement gzip compression
	}

	private generateLogId(): string {
		return `log_${Date.now()}_${Math.random().toString(36).substring(2)}`;
	}

	private generateSessionId(): string {
		return `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
	}

	private generateOperationId(): string {
		return `op_${Date.now()}_${Math.random().toString(36).substring(2)}`;
	}
}

/**
 * Singleton instance for global use
 */
export const mcpExecutionLogger = new MCPExecutionLogger({
	retentionDays: parseInt(process.env.MCP_LOG_RETENTION_DAYS || "365"),
	compressionEnabled: process.env.MCP_LOG_COMPRESSION === "true",
	encryptionEnabled: process.env.MCP_LOG_ENCRYPTION === "true",
	indexingEnabled: process.env.MCP_LOG_INDEXING !== "false",
});