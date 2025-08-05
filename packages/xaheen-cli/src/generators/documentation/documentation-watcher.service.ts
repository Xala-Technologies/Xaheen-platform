/**
 * @fileoverview Documentation Watcher Service - EPIC 13 Story 13.6.12
 * @description Documentation watching and auto-regeneration capabilities with intelligent change detection
 * @version 1.0.0
 * @compliance Norwegian Enterprise Standards, File System Monitoring, Performance Optimization
 */

import { promises as fs } from "fs";
import { join, relative, extname, dirname } from "path";
import { EventEmitter } from "events";
import { logger } from "../../utils/logger.js";
import { mcpExecutionLogger } from "../../services/mcp/mcp-execution-logger.service";
import { documentationOrchestrator, type DocumentationOrchestrationOptions } from "./documentation-orchestrator.generator";

export interface WatcherOptions {
	readonly watchPaths: readonly string[];
	readonly ignorePaths: readonly string[];
	readonly debounceMs: number;
	readonly batchChanges: boolean;
	readonly enableIntelligentRegeneration: boolean;
	readonly enablePartialRegeneration: boolean;
	readonly maxConcurrentRegenerations: number;
	readonly retryAttempts: number;
	readonly retryDelayMs: number;
	readonly enableAnalytics: boolean;
	readonly enableNotifications: boolean;
	readonly healthCheckIntervalMs: number;
}

export interface FileChangeEvent {
	readonly type: "added" | "changed" | "deleted" | "renamed";
	readonly path: string;
	readonly timestamp: Date;
	readonly size?: number;
	readonly previousPath?: string; // For renames
	readonly metadata?: Record<string, any>;
}

export interface ChangeAnalysis {
	readonly affectedComponents: readonly string[];
	readonly affectedTemplates: readonly string[];
	readonly affectedStories: readonly string[];
	readonly affectedTests: readonly string[];
	readonly regenerationScope: "full" | "partial" | "component" | "template" | "story";
	readonly estimatedDuration: number;
	readonly priority: "low" | "medium" | "high" | "critical";
	readonly dependencies: readonly string[];
}

export interface RegenerationTask {
	readonly id: string;
	readonly timestamp: Date;
	readonly changes: readonly FileChangeEvent[];
	readonly analysis: ChangeAnalysis;
	readonly status: "pending" | "running" | "completed" | "failed" | "cancelled";
	readonly startTime?: Date;
	readonly endTime?: Date;
	readonly duration?: number;
	readonly error?: string;
	readonly generatedFiles?: readonly string[];
	readonly notifications?: readonly string[];
}

export interface WatcherStatistics {
	readonly totalChangesDetected: number;
	readonly totalRegenerationsTriggered: number;
	readonly successfulRegenerations: number;
	readonly failedRegenerations: number;
	readonly averageRegenerationTime: number;
	readonly changesByType: Record<string, number>;
	readonly changesByPath: Record<string, number>;
	readonly peakActivity: readonly ActivityPeak[];
	readonly uptime: number;
	readonly lastActivity: Date;
}

export interface ActivityPeak {
	readonly timestamp: Date;
	readonly changeCount: number;
	readonly duration: number;
}

export interface WatcherHealth {
	readonly status: "healthy" | "degraded" | "unhealthy";
	readonly uptime: number;
	readonly watchedPaths: number;
	readonly activeWatchers: number;
	readonly pendingTasks: number;
	readonly runningTasks: number;
	readonly memoryUsage: number;
	readonly cpuUsage: number;
	readonly lastHealthCheck: Date;
	readonly issues: readonly HealthIssue[];
}

export interface HealthIssue {
	readonly type: "performance" | "error" | "resource" | "configuration";
	readonly severity: "low" | "medium" | "high" | "critical";
	readonly description: string;
	readonly recommendation: string;
	readonly timestamp: Date;
}

/**
 * Documentation Watcher Service
 * Provides intelligent file watching and automatic documentation regeneration
 */
export class DocumentationWatcherService extends EventEmitter {
	private readonly options: WatcherOptions;
	private readonly watchers = new Map<string, any>();
	private readonly changeQueue: FileChangeEvent[] = [];
	private readonly taskQueue: RegenerationTask[] = [];
	private readonly runningTasks = new Set<string>();
	private readonly statistics: WatcherStatistics;
	private readonly startTime: Date;
	private isWatching = false;
	private debounceTimer: NodeJS.Timeout | null = null;
	private healthCheckTimer: NodeJS.Timeout | null = null;
	private lastActivity: Date;

	constructor(options: Partial<WatcherOptions> = {}) {
		super();
		
		this.options = {
			watchPaths: ["src/", "docs/", "templates/", "stories/"],
			ignorePaths: [
				"node_modules/",
				".git/",
				"dist/",
				"build/",
				".next/",
				".nuxt/",
				"coverage/",
				"*.log",
				".DS_Store",
				"*.tmp",
				"*.temp",
			],
			debounceMs: 1000,
			batchChanges: true,
			enableIntelligentRegeneration: true,
			enablePartialRegeneration: true,
			maxConcurrentRegenerations: 2,
			retryAttempts: 3,
			retryDelayMs: 5000,
			enableAnalytics: true,
			enableNotifications: true,
			healthCheckIntervalMs: 60000, // 1 minute
			...options,
		};

		this.startTime = new Date();
		this.lastActivity = new Date();
		
		this.statistics = {
			totalChangesDetected: 0,
			totalRegenerationsTriggered: 0,
			successfulRegenerations: 0,
			failedRegenerations: 0,
			averageRegenerationTime: 0,
			changesByType: {},
			changesByPath: {},
			peakActivity: [],
			uptime: 0,
			lastActivity: this.lastActivity,
		};

		// Set up event listeners
		this.setupEventListeners();
	}

	/**
	 * Start watching for file changes
	 */
	async startWatching(documentationOptions: DocumentationOrchestrationOptions): Promise<void> {
		if (this.isWatching) {
			logger.warn("Documentation watcher is already running");
			return;
		}

		logger.info("👀 Starting documentation watcher...");

		try {
			// Log watcher start
			await mcpExecutionLogger.logOperation(
				"info",
				"user_action",
				"Documentation watcher started",
				{
					executionContext: { command: "start watcher" },
					tags: ["watcher", "start", "documentation"],
					structuredData: {
						watchPaths: this.options.watchPaths,
						options: this.options,
					},
				}
			);

			// Set up file system watchers
			await this.setupWatchers();

			// Start health monitoring
			if (this.options.healthCheckIntervalMs > 0) {
				this.startHealthMonitoring();
			}

			this.isWatching = true;
			this.emit("started");

			logger.info(`✅ Documentation watcher started: monitoring ${this.watchers.size} paths`);
		} catch (error) {
			logger.error("Failed to start documentation watcher:", error);
			await this.stopWatching();
			throw error;
		}
	}

	/**
	 * Stop watching for file changes
	 */
	async stopWatching(): Promise<void> {
		if (!this.isWatching) return;

		logger.info("🛑 Stopping documentation watcher...");

		try {
			// Cancel any pending tasks
			await this.cancelPendingTasks();

			// Close all watchers
			for (const [path, watcher] of this.watchers) {
				try {
					if (watcher && typeof watcher.close === "function") {
						await watcher.close();
					}
				} catch (error) {
					logger.warn(`Failed to close watcher for ${path}:`, error);
				}
			}
			this.watchers.clear();

			// Clear timers
			if (this.debounceTimer) {
				clearTimeout(this.debounceTimer);
				this.debounceTimer = null;
			}

			if (this.healthCheckTimer) {
				clearInterval(this.healthCheckTimer);
				this.healthCheckTimer = null;
			}

			this.isWatching = false;
			this.emit("stopped");

			// Log watcher stop
			await mcpExecutionLogger.logOperation(
				"info",
				"user_action",
				"Documentation watcher stopped",
				{
					executionContext: { command: "stop watcher" },
					tags: ["watcher", "stop", "documentation"],
					structuredData: {
						uptime: Date.now() - this.startTime.getTime(),
						statistics: this.statistics,
					},
				}
			);

			logger.info("✅ Documentation watcher stopped");
		} catch (error) {
			logger.error("Error stopping documentation watcher:", error);
		}
	}

	/**
	 * Get current watcher statistics
	 */
	getStatistics(): WatcherStatistics {
		return {
			...this.statistics,
			uptime: Date.now() - this.startTime.getTime(),
			lastActivity: this.lastActivity,
		};
	}

	/**
	 * Get watcher health status
	 */
	async getHealth(): Promise<WatcherHealth> {
		const memoryUsage = process.memoryUsage();
		const issues: HealthIssue[] = [];

		// Check for performance issues
		if (this.statistics.averageRegenerationTime > 30000) { // 30 seconds
			issues.push({
				type: "performance",
				severity: "medium",
				description: "Average regeneration time is high",
				recommendation: "Consider optimizing documentation generation or enabling partial regeneration",
				timestamp: new Date(),
			});
		}

		// Check for error rate
		const errorRate = this.statistics.totalRegenerationsTriggered > 0
			? (this.statistics.failedRegenerations / this.statistics.totalRegenerationsTriggered) * 100
			: 0;

		if (errorRate > 10) {
			issues.push({
				type: "error",
				severity: "high",
				description: `High error rate: ${errorRate.toFixed(1)}%`,
				recommendation: "Review error logs and fix underlying issues",
				timestamp: new Date(),
			});
		}

		// Check memory usage
		const memoryUsageMB = memoryUsage.heapUsed / 1024 / 1024;
		if (memoryUsageMB > 500) { // 500MB
			issues.push({
				type: "resource",
				severity: "medium",
				description: `High memory usage: ${memoryUsageMB.toFixed(1)}MB`,
				recommendation: "Consider restarting the watcher or optimizing memory usage",
				timestamp: new Date(),
			});
		}

		// Determine overall health status
		const criticalIssues = issues.filter(i => i.severity === "critical").length;
		const highIssues = issues.filter(i => i.severity === "high").length;
		
		let status: WatcherHealth["status"];
		if (criticalIssues > 0) {
			status = "unhealthy";
		} else if (highIssues > 0 || issues.length > 3) {
			status = "degraded";
		} else {
			status = "healthy";
		}

		return {
			status,
			uptime: Date.now() - this.startTime.getTime(),
			watchedPaths: this.watchers.size,
			activeWatchers: this.watchers.size,
			pendingTasks: this.taskQueue.filter(t => t.status === "pending").length,
			runningTasks: this.runningTasks.size,
			memoryUsage: memoryUsageMB,
			cpuUsage: 0, // Would implement CPU usage monitoring
			lastHealthCheck: new Date(),
			issues,
		};
	}

	/**
	 * Manually trigger documentation regeneration
	 */
	async triggerRegeneration(
		scope: "full" | "partial" = "full",
		reason = "manual trigger"
	): Promise<string> {
		logger.info(`🔄 Manually triggering ${scope} documentation regeneration`);

		const task: RegenerationTask = {
			id: this.generateTaskId(),
			timestamp: new Date(),
			changes: [],
			analysis: {
				affectedComponents: [],
				affectedTemplates: [],
				affectedStories: [],
				affectedTests: [],
				regenerationScope: scope,
				estimatedDuration: scope === "full" ? 60000 : 30000,
				priority: "medium",
				dependencies: [],
			},
			status: "pending",
		};

		this.taskQueue.push(task);
		this.processTaskQueue();

		return task.id;
	}

	/**
	 * Cancel a regeneration task
	 */
	async cancelTask(taskId: string): Promise<boolean> {
		const task = this.taskQueue.find(t => t.id === taskId);
		if (!task) return false;

		if (task.status === "running") {
			// Task is already running, mark for cancellation
			task.status = "cancelled";
			this.runningTasks.delete(taskId);
			return true;
		} else if (task.status === "pending") {
			// Remove from queue
			const index = this.taskQueue.findIndex(t => t.id === taskId);
			if (index >= 0) {
				this.taskQueue.splice(index, 1);
				return true;
			}
		}

		return false;
	}

	/**
	 * Get pending and running tasks
	 */
	getTasks(): RegenerationTask[] {
		return [...this.taskQueue];
	}

	// Private methods

	private async setupWatchers(): Promise<void> {
		const { default: chokidar } = await import("chokidar");

		for (const watchPath of this.options.watchPaths) {
			try {
				const absolutePath = join(process.cwd(), watchPath);
				
				// Check if path exists
				try {
					await fs.access(absolutePath);
				} catch {
					logger.warn(`Watch path does not exist: ${absolutePath}`);
					continue;
				}

				const watcher = chokidar.watch(absolutePath, {
					ignored: this.options.ignorePaths.map(p => join(absolutePath, p)),
					persistent: true,
					ignoreInitial: true,
					awaitWriteFinish: {
						stabilityThreshold: 1000,
						pollInterval: 100,
					},
				});

				// Set up event handlers
				watcher
					.on("add", (path) => this.handleFileChange("added", path))
					.on("change", (path) => this.handleFileChange("changed", path))
					.on("unlink", (path) => this.handleFileChange("deleted", path))
					.on("addDir", (path) => this.handleDirectoryChange("added", path))
					.on("unlinkDir", (path) => this.handleDirectoryChange("deleted", path))
					.on("error", (error) => this.handleWatcherError(watchPath, error));

				this.watchers.set(watchPath, watcher);
				logger.debug(`📁 Watching: ${watchPath}`);
			} catch (error) {
				logger.error(`Failed to setup watcher for ${watchPath}:`, error);
			}
		}
	}

	private async handleFileChange(type: FileChangeEvent["type"], filePath: string): Promise<void> {
		try {
			// Update statistics
			this.statistics.totalChangesDetected++;
			this.statistics.changesByType[type] = (this.statistics.changesByType[type] || 0) + 1;
			this.statistics.changesByPath[filePath] = (this.statistics.changesByPath[filePath] || 0) + 1;
			this.lastActivity = new Date();

			// Create change event
			const change: FileChangeEvent = {
				type,
				path: filePath,
				timestamp: new Date(),
			};

			// Get file size for added/changed files
			if (type === "added" || type === "changed") {
				try {
					const stats = await fs.stat(filePath);
					change.size = stats.size;
				} catch {
					// File might have been deleted between detection and stat
				}
			}

			// Add to change queue
			this.changeQueue.push(change);

			// Log the change
			await mcpExecutionLogger.logOperation(
				"debug",
				"user_action",
				`File ${type}: ${relative(process.cwd(), filePath)}`,
				{
					executionContext: { command: "file change" },
					tags: ["watcher", "file-change", type],
					structuredData: { change },
				}
			);

			this.emit("fileChange", change);

			// Trigger debounced processing
			this.debouncedProcessChanges();
		} catch (error) {
			logger.error("Error handling file change:", error);
		}
	}

	private async handleDirectoryChange(type: "added" | "deleted", dirPath: string): Promise<void> {
		logger.debug(`📁 Directory ${type}: ${relative(process.cwd(), dirPath)}`);
		
		// Log directory changes
		await mcpExecutionLogger.logOperation(
			"debug",
			"user_action",
			`Directory ${type}: ${relative(process.cwd(), dirPath)}`,
			{
				executionContext: { command: "directory change" },
				tags: ["watcher", "directory-change", type],
				structuredData: { path: dirPath, type },
			}
		);
	}

	private handleWatcherError(watchPath: string, error: Error): void {
		logger.error(`Watcher error for ${watchPath}:`, error);
		
		// Log watcher error
		mcpExecutionLogger.logOperation(
			"error",
			"user_action",
			`Watcher error for ${watchPath}: ${error.message}`,
			{
				executionContext: { command: "watcher error" },
				tags: ["watcher", "error"],
				structuredData: { watchPath, error: error.message },
			}
		);

		this.emit("watcherError", { watchPath, error });
	}

	private debouncedProcessChanges(): void {
		if (this.debounceTimer) {
			clearTimeout(this.debounceTimer);
		}

		this.debounceTimer = setTimeout(() => {
			this.processChanges();
		}, this.options.debounceMs);
	}

	private async processChanges(): Promise<void> {
		if (this.changeQueue.length === 0) return;

		logger.info(`🔍 Processing ${this.changeQueue.length} file changes...`);

		try {
			// Extract changes to process
			const changes = [...this.changeQueue];
			this.changeQueue.length = 0;

			// Analyze changes to determine regeneration scope
			const analysis = await this.analyzeChanges(changes);

			// Create regeneration task
			const task: RegenerationTask = {
				id: this.generateTaskId(),
				timestamp: new Date(),
				changes,
				analysis,
				status: "pending",
			};

			// Add to task queue
			this.taskQueue.push(task);
			this.statistics.totalRegenerationsTriggered++;

			// Log task creation
			await mcpExecutionLogger.logOperation(
				"info",
				"template_processing",
				`Documentation regeneration task created: ${analysis.regenerationScope}`,
				{
					executionContext: { command: "create regeneration task" },
					tags: ["watcher", "regeneration", "task-created"],
					structuredData: { task: { id: task.id, analysis } },
				}
			);

			this.emit("taskCreated", task);

			// Process task queue
			this.processTaskQueue();
		} catch (error) {
			logger.error("Error processing changes:", error);
		}
	}

	private async analyzeChanges(changes: FileChangeEvent[]): Promise<ChangeAnalysis> {
		const affectedComponents: string[] = [];
		const affectedTemplates: string[] = [];
		const affectedStories: string[] = [];
		const affectedTests: string[] = [];

		let regenerationScope: ChangeAnalysis["regenerationScope"] = "partial";
		let priority: ChangeAnalysis["priority"] = "medium";

		for (const change of changes) {
			const ext = extname(change.path);
			const relativePath = relative(process.cwd(), change.path);

			// Analyze file type and impact
			if (relativePath.includes("components/")) {
				if (ext === ".tsx" || ext === ".jsx" || ext === ".ts" || ext === ".js") {
					affectedComponents.push(relativePath);
				}
			}

			if (relativePath.includes("templates/")) {
				if (ext === ".hbs" || ext === ".handlebars") {
					affectedTemplates.push(relativePath);
				}
			}

			if (relativePath.includes("stories") || change.path.includes(".stories.")) {
				affectedStories.push(relativePath);
			}

			if (relativePath.includes("test") || change.path.includes(".test.") || change.path.includes(".spec.")) {
				affectedTests.push(relativePath);
			}

			// Determine scope based on file importance
			if (relativePath.includes("package.json") || relativePath.includes("tsconfig.json")) {
				regenerationScope = "full";
				priority = "high";
			} else if (relativePath.includes("src/") && !relativePath.includes("test")) {
				regenerationScope = regenerationScope === "full" ? "full" : "component";
			}
		}

		// Estimate duration based on scope and affected files
		let estimatedDuration = 10000; // Base 10 seconds
		if (regenerationScope === "full") {
			estimatedDuration = 60000; // 1 minute
		} else if (affectedComponents.length > 5) {
			estimatedDuration = 30000; // 30 seconds
		} else if (affectedComponents.length > 0) {
			estimatedDuration = 20000; // 20 seconds
		}

		return {
			affectedComponents: [...new Set(affectedComponents)],
			affectedTemplates: [...new Set(affectedTemplates)],
			affectedStories: [...new Set(affectedStories)],
			affectedTests: [...new Set(affectedTests)],
			regenerationScope,
			estimatedDuration,
			priority,
			dependencies: [],
		};
	}

	private async processTaskQueue(): Promise<void> {
		// Process tasks up to the concurrent limit
		while (
			this.runningTasks.size < this.options.maxConcurrentRegenerations &&
			this.taskQueue.some(t => t.status === "pending")
		) {
			const nextTask = this.taskQueue
				.filter(t => t.status === "pending")
				.sort((a, b) => {
					// Sort by priority, then by timestamp
					const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
					const aPriority = priorityOrder[a.analysis.priority];
					const bPriority = priorityOrder[b.analysis.priority];
					
					if (aPriority !== bPriority) {
						return aPriority - bPriority;
					}
					
					return a.timestamp.getTime() - b.timestamp.getTime();
				})[0];

			if (nextTask) {
				this.executeTask(nextTask);
			}
		}
	}

	private async executeTask(task: RegenerationTask): Promise<void> {
		task.status = "running";
		task.startTime = new Date();
		this.runningTasks.add(task.id);

		logger.info(`🔄 Executing regeneration task: ${task.id} (${task.analysis.regenerationScope})`);

		try {
			// Log task start
			await mcpExecutionLogger.logOperation(
				"info",
				"template_processing",
				`Documentation regeneration started: ${task.analysis.regenerationScope}`,
				{
					executionContext: { command: "execute regeneration task" },
					mcpOperation: {
						operationType: "template_render",
						startTime: task.startTime,
						status: "started",
						input: { taskId: task.id, analysis: task.analysis },
					},
					tags: ["watcher", "regeneration", "started"],
					correlationId: task.id,
				}
			);

			// Execute documentation generation based on scope
			const documentationOptions = this.buildDocumentationOptions(task.analysis);
			const result = await documentationOrchestrator.generate(documentationOptions);

			// Update task status
			task.endTime = new Date();
			task.duration = task.endTime.getTime() - task.startTime.getTime();
			
			if (result.success) {
				task.status = "completed";
				task.generatedFiles = result.files;
				this.statistics.successfulRegenerations++;
			} else {
				task.status = "failed";
				task.error = result.error || "Unknown error";
				this.statistics.failedRegenerations++;
			}

			// Update average regeneration time
			const totalSuccessful = this.statistics.successfulRegenerations;
			if (totalSuccessful > 0) {
				this.statistics.averageRegenerationTime = 
					(this.statistics.averageRegenerationTime * (totalSuccessful - 1) + task.duration) / totalSuccessful;
			}

			// Log task completion
			await mcpExecutionLogger.logOperation(
				task.status === "completed" ? "info" : "error",
				"template_processing",
				`Documentation regeneration ${task.status}: ${task.analysis.regenerationScope}`,
				{
					executionContext: { command: "execute regeneration task" },
					mcpOperation: {
						operationType: "template_render",
						startTime: task.startTime,
						endTime: task.endTime,
						duration: task.duration,
						status: task.status === "completed" ? "completed" : "failed",
						output: { filesGenerated: task.generatedFiles?.length || 0 },
						error: task.error,
					},
					tags: ["watcher", "regeneration", task.status],
					correlationId: task.id,
				}
			);

			this.emit("taskCompleted", task);
			logger.info(`✅ Regeneration task completed: ${task.id} (${task.duration}ms)`);
		} catch (error) {
			task.status = "failed";
			task.endTime = new Date();
			task.duration = task.endTime.getTime() - task.startTime!.getTime();
			task.error = error.message;
			this.statistics.failedRegenerations++;

			logger.error(`❌ Regeneration task failed: ${task.id}`, error);
			this.emit("taskFailed", task);
		} finally {
			this.runningTasks.delete(task.id);
			
			// Continue processing queue
			setTimeout(() => this.processTaskQueue(), 100);
		}
	}

	private buildDocumentationOptions(analysis: ChangeAnalysis): DocumentationOrchestrationOptions {
		// Build documentation options based on the analysis
		const baseOptions: DocumentationOrchestrationOptions = {
			projectName: "Auto-Generated",
			projectType: "web",
			runtime: "node",
			version: "1.0.0",
			enableOpenAPI: false,
			enableSwaggerUI: false,
			enableArchitectureDocs: false,
			enableDeploymentGuides: false,
			enableAPIReference: false,
			enableClientSDK: false,
			enableTroubleshooting: false,
			enableGettingStarted: false,
			enableDeveloperWorkflow: false,
			enableCodeDocumentation: false,
			enableMermaidDiagrams: false,
			enableDocsify: false,
			enableVitePress: false,
			enableGitBookFormat: false,
			languages: ["en"],
			deploymentTargets: [],
			integrations: [],
			databases: [],
			outputDir: process.cwd(),
			
			// Orchestrator-specific options
			enableStorybook: analysis.affectedStories.length > 0,
			enableInteractiveTutorials: false, // Usually not needed for auto-regeneration
			enableMDXDocs: analysis.affectedComponents.length > 0,
			enableComplianceReports: false,
			enablePerformanceAnalytics: false,
			enableAuditTrail: true,
			enableWatching: false, // Don't start watching from auto-regeneration
			enableAutoRegeneration: false,
			enableSearchIndex: false,
			enableAnalytics: false,
		};

		// Adjust options based on regeneration scope
		if (analysis.regenerationScope === "full") {
			baseOptions.enableStorybook = true;
			baseOptions.enableMDXDocs = true;
			baseOptions.enableAPIReference = true;
			baseOptions.enableGettingStarted = true;
		} else if (analysis.regenerationScope === "component") {
			baseOptions.enableMDXDocs = true;
			baseOptions.enableStorybook = analysis.affectedStories.length > 0;
		}

		return baseOptions;
	}

	private setupEventListeners(): void {
		// Handle process shutdown gracefully
		process.on("SIGINT", () => this.stopWatching());
		process.on("SIGTERM", () => this.stopWatching());
		
		// Handle uncaught errors
		process.on("uncaughtException", (error) => {
			logger.error("Uncaught exception in watcher:", error);
		});

		process.on("unhandledRejection", (reason) => {
			logger.error("Unhandled rejection in watcher:", reason);
		});
	}

	private startHealthMonitoring(): void {
		this.healthCheckTimer = setInterval(async () => {
			try {
				const health = await this.getHealth();
				
				if (health.status !== "healthy") {
					logger.warn(`Watcher health: ${health.status}`, {
						issues: health.issues.length,
						memoryUsage: health.memoryUsage,
						pendingTasks: health.pendingTasks,
					});
				}

				// Emit health status
				this.emit("healthCheck", health);
			} catch (error) {
				logger.error("Health check failed:", error);
			}
		}, this.options.healthCheckIntervalMs);
	}

	private async cancelPendingTasks(): Promise<void> {
		const pendingTasks = this.taskQueue.filter(t => t.status === "pending");
		
		for (const task of pendingTasks) {
			task.status = "cancelled";
		}

		// Wait for running tasks to complete or timeout
		const runningTaskIds = Array.from(this.runningTasks);
		const timeout = 30000; // 30 seconds
		const startTime = Date.now();

		while (this.runningTasks.size > 0 && Date.now() - startTime < timeout) {
			await new Promise(resolve => setTimeout(resolve, 1000));
		}

		// Force cancel any remaining tasks
		for (const taskId of this.runningTasks) {
			const task = this.taskQueue.find(t => t.id === taskId);
			if (task) {
				task.status = "cancelled";
			}
		}
		this.runningTasks.clear();
	}

	private generateTaskId(): string {
		return `task_${Date.now()}_${Math.random().toString(36).substring(2)}`;
	}
}

/**
 * Create singleton watcher instance
 */
export const documentationWatcher = new DocumentationWatcherService();