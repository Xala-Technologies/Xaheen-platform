/**
 * Undo/Rollback Manager for Xaheen CLI
 * Provides transaction-based rollback for template changes and generator actions
 * Generated with Xaheen CLI - AI-Native Developer Productivity
 */

import { EventEmitter } from "events";
import { execSync } from "child_process";
import { createHash } from "crypto";
import { readFile, writeFile, mkdir, unlink, readdir, stat } from "fs/promises";
import { existsSync } from "fs";
import { join, dirname } from "path";
import { z } from "zod";
import chalk from "chalk";
import { logger } from "../../utils/logger.js";

/**
 * File operation types
 */
export enum FileOperationType {
	CREATE = "create",
	UPDATE = "update",
	DELETE = "delete",
	MOVE = "move",
	COPY = "copy",
	SYMLINK = "symlink",
	CHMOD = "chmod",
	ENV_VARIABLE = "env_variable",
	PACKAGE_INSTALL = "package_install",
	DIRECTORY_CREATE = "directory_create",
}

/**
 * File operation schema
 */
const FileOperationSchema = z.object({
	id: z.string(),
	type: z.nativeEnum(FileOperationType),
	path: z.string(),
	previousPath: z.string().optional(),
	previousContent: z.string().optional(),
	currentContent: z.string().optional(),
	checksum: z.string().optional(),
	timestamp: z.string(),
	metadata: z.record(z.any()).optional(),
});

export type FileOperation = z.infer<typeof FileOperationSchema>;

/**
 * Transaction schema
 */
const TransactionSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string(),
	command: z.string(),
	operations: z.array(FileOperationSchema),
	timestamp: z.string(),
	status: z.enum(["pending", "completed", "failed", "rolled_back"]),
	rollbackTimestamp: z.string().optional(),
	metadata: z.record(z.any()).optional(),
});

export type Transaction = z.infer<typeof TransactionSchema>;

/**
 * Rollback options
 */
export interface RollbackOptions {
	readonly dryRun?: boolean;
	readonly force?: boolean;
	readonly interactive?: boolean;
	readonly verbose?: boolean;
	readonly preserveBackups?: boolean;
}

/**
 * Rollback result
 */
export interface RollbackResult {
	readonly success: boolean;
	readonly transactionId: string;
	readonly rolledBackOperations: number;
	readonly errors: string[];
	readonly warnings: string[];
	readonly skippedOperations: string[];
	readonly duration: number;
	readonly riskLevel: 'low' | 'medium' | 'high';
}

/**
 * Checkpoint data
 */
export interface Checkpoint {
	readonly id: string;
	readonly name: string;
	readonly description: string;
	readonly timestamp: string;
	readonly transactionIds: string[];
	readonly metadata: Record<string, any>;
}

/**
 * Rollback preview
 */
export interface RollbackPreview {
	readonly operations: Array<{
		readonly type: string;
		readonly path: string;
		readonly action: string;
		readonly hasBackup: boolean;
		readonly riskLevel: 'low' | 'medium' | 'high';
		readonly estimatedTime: number;
	}>;
	readonly warnings: string[];
	readonly totalOperations: number;
	readonly estimatedDuration: number;
	readonly overallRiskLevel: 'low' | 'medium' | 'high';
	readonly canProceed: boolean;
}

/**
 * Session statistics
 */
export interface SessionStatistics {
	readonly totalTransactions: number;
	readonly completedTransactions: number;
	readonly failedTransactions: number;
	readonly rolledBackTransactions: number;
	readonly totalOperations: number;
	readonly averageOperationsPerTransaction: number;
	readonly sessionDuration: number;
	readonly mostCommonOperationType: string;
	readonly riskDistribution: Record<string, number>;
}

/**
 * Transaction events
 */
export interface TransactionEvents {
	readonly transactionStarted: (transaction: Transaction) => void;
	readonly transactionCompleted: (transaction: Transaction) => void;
	readonly transactionFailed: (transaction: Transaction, error: Error) => void;
	readonly operationExecuted: (operation: FileOperation) => void;
	readonly rollbackStarted: (transactionId: string) => void;
	readonly rollbackCompleted: (result: RollbackResult) => void;
}

/**
 * Enhanced Undo/Rollback manager with modern CLI patterns
 */
export class UndoRollbackManager extends EventEmitter {
	private readonly projectPath: string;
	private readonly transactionsPath: string;
	private readonly backupsPath: string;
	private readonly checkpointsPath: string;
	private readonly maxTransactions: number;
	private currentTransaction: Transaction | null = null;
	private readonly transactionHistory: Map<string, Transaction> = new Map();
	private readonly checkpoints: Map<string, Checkpoint> = new Map();
	private readonly sessionStartTime: number = Date.now();
	private operationQueue: Array<() => Promise<void>> = [];
	private parallelRollbackEnabled: boolean = false;

	constructor(projectPath: string, maxTransactions: number = 50, options: {
		readonly enableParallelRollback?: boolean;
	} = {}) {
		super();
		this.projectPath = projectPath;
		this.maxTransactions = maxTransactions;
		this.transactionsPath = join(projectPath, ".xaheen", "transactions");
		this.backupsPath = join(projectPath, ".xaheen", "backups");
		this.checkpointsPath = join(projectPath, ".xaheen", "checkpoints");
		this.parallelRollbackEnabled = options.enableParallelRollback ?? false;
	}

	/**
	 * Initialize enhanced undo/rollback system
	 */
	public async initialize(): Promise<void> {
		try {
			// Ensure directories exist
			await this.ensureDirectories();

			// Load transaction history and checkpoints
			await this.loadTransactionHistory();
			await this.loadCheckpoints();

			logger.info(
				`Enhanced Undo/Rollback system initialized with ${this.transactionHistory.size} transactions and ${this.checkpoints.size} checkpoints`,
			);
		} catch (error) {
			logger.error("Failed to initialize undo/rollback system:", error);
			throw error;
		}
	}

	/**
	 * Start a new transaction
	 */
	public async startTransaction(
		name: string,
		description: string,
		command: string,
		metadata?: Record<string, any>,
	): Promise<string> {
		try {
			if (this.currentTransaction) {
				throw new Error(
					`Transaction "${this.currentTransaction.name}" is already in progress`,
				);
			}

			const transactionId = this.generateTransactionId();
			const transaction: Transaction = {
				id: transactionId,
				name,
				description,
				command,
				operations: [],
				timestamp: new Date().toISOString(),
				status: "pending",
				metadata,
			};

			this.currentTransaction = transaction;
			this.emit("transactionStarted", transaction);

			logger.info(`Started transaction: ${name} (${transactionId})`);

			return transactionId;
		} catch (error) {
			logger.error("Failed to start transaction:", error);
			throw error;
		}
	}

	/**
	 * Add file operation to current transaction
	 */
	public async addOperation(
		type: FileOperationType,
		path: string,
		options: {
			previousPath?: string;
			previousContent?: string;
			currentContent?: string;
			metadata?: Record<string, any>;
		} = {},
	): Promise<string> {
		if (!this.currentTransaction) {
			throw new Error("No transaction in progress");
		}

		try {
			const operationId = this.generateOperationId();
			const normalizedPath = this.normalizePath(path);

			// Read current file content for backup
			let previousContent = options.previousContent;
			if (!previousContent && existsSync(normalizedPath)) {
				previousContent = await readFile(normalizedPath, "utf8");
			}

			// Calculate checksum
			const checksum = previousContent
				? this.calculateChecksum(previousContent)
				: undefined;

			const operation: FileOperation = {
				id: operationId,
				type,
				path: normalizedPath,
				previousPath: options.previousPath,
				previousContent,
				currentContent: options.currentContent,
				checksum,
				timestamp: new Date().toISOString(),
				metadata: options.metadata,
			};

			// Create backup if needed
			if (
				(type === FileOperationType.UPDATE ||
					type === FileOperationType.DELETE) &&
				previousContent
			) {
				await this.createBackup(operationId, normalizedPath, previousContent);
			}

			this.currentTransaction.operations.push(operation);
			this.emit("operationExecuted", operation);

			logger.debug(`Added ${type} operation for ${normalizedPath}`);

			return operationId;
		} catch (error) {
			logger.error("Failed to add operation:", error);
			throw error;
		}
	}

	/**
	 * Complete current transaction
	 */
	public async completeTransaction(): Promise<void> {
		if (!this.currentTransaction) {
			throw new Error("No transaction in progress");
		}

		try {
			this.currentTransaction.status = "completed";
			
			// Save transaction
			await this.saveTransaction(this.currentTransaction);
			
			// Add to history
			this.transactionHistory.set(
				this.currentTransaction.id,
				this.currentTransaction,
			);

			// Cleanup old transactions
			await this.cleanupOldTransactions();

			this.emit("transactionCompleted", this.currentTransaction);

			logger.info(
				`Completed transaction: ${this.currentTransaction.name} (${this.currentTransaction.operations.length} operations)`,
			);

			this.currentTransaction = null;
		} catch (error) {
			logger.error("Failed to complete transaction:", error);
			
			if (this.currentTransaction) {
				this.currentTransaction.status = "failed";
				this.emit("transactionFailed", this.currentTransaction, error as Error);
			}
			
			throw error;
		}
	}

	/**
	 * Rollback transaction (legacy method, use rollbackTransactionEnhanced for better features)
	 */
	public async rollbackTransaction(
		transactionId: string,
		options: RollbackOptions = {},
	): Promise<RollbackResult> {
		// Delegate to enhanced method for consistency
		return this.rollbackTransactionEnhanced(transactionId, options);
	}

	/**
	 * Get transaction history
	 */
	public getTransactionHistory(): readonly Transaction[] {
		return Array.from(this.transactionHistory.values()).sort(
			(a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
		);
	}

	/**
	 * Get transaction by ID
	 */
	public getTransaction(transactionId: string): Transaction | undefined {
		return this.transactionHistory.get(transactionId);
	}

	/**
	 * Get current transaction
	 */
	public getCurrentTransaction(): Transaction | null {
		return this.currentTransaction;
	}

	/**
	 * List available rollback points
	 */
	public getAvailableRollbackPoints(): Array<{
		id: string;
		name: string;
		description: string;
		timestamp: string;
		operations: number;
		canRollback: boolean;
	}> {
		return this.getTransactionHistory()
			.filter((tx) => tx.status === "completed")
			.map((tx) => ({
				id: tx.id,
				name: tx.name,
				description: tx.description,
				timestamp: tx.timestamp,
				operations: tx.operations.length,
				canRollback: true,
			}));
	}

	/**
	 * Enhanced rollback preview with risk assessment
	 */
	public async previewRollback(
		transactionId: string,
	): Promise<RollbackPreview> {
		const transaction = this.transactionHistory.get(transactionId);
		if (!transaction) {
			throw new Error(`Transaction ${transactionId} not found`);
		}

		const operations = [];
		const warnings = [];
		let totalEstimatedTime = 0;
		let highRiskOperations = 0;
		let canProceed = true;

		for (const op of [...transaction.operations].reverse()) {
			const hasBackup = await this.hasBackup(op.id);
			let action = "";
			let riskLevel: 'low' | 'medium' | 'high' = 'low';
			let estimatedTime = 100; // milliseconds

			switch (op.type) {
				case FileOperationType.CREATE:
					action = "Delete created file";
					riskLevel = 'low';
					estimatedTime = 50;
					break;
				case FileOperationType.UPDATE:
					action = hasBackup ? "Restore from backup" : "Cannot restore (no backup)";
					riskLevel = hasBackup ? 'low' : 'high';
					estimatedTime = hasBackup ? 150 : 0;
					if (!hasBackup) {
						warnings.push(`No backup available for ${op.path}`);
						canProceed = false;
					}
					break;
				case FileOperationType.DELETE:
					action = hasBackup ? "Restore deleted file" : "Cannot restore (no backup)";
					riskLevel = hasBackup ? 'medium' : 'high';
					estimatedTime = hasBackup ? 200 : 0;
					if (!hasBackup) {
						warnings.push(`No backup available for ${op.path}`);
						canProceed = false;
					}
					break;
				case FileOperationType.MOVE:
					action = "Move file back to original location";
					riskLevel = existsSync(op.path) ? 'low' : 'high';
					estimatedTime = 100;
					break;
				case FileOperationType.COPY:
					action = "Delete copied file";
					riskLevel = 'low';
					estimatedTime = 50;
					break;
				case FileOperationType.SYMLINK:
					action = "Remove symbolic link";
					riskLevel = 'low';
					estimatedTime = 30;
					break;
				case FileOperationType.PACKAGE_INSTALL:
					action = "Uninstall package";
					riskLevel = 'medium';
					estimatedTime = 5000;
					break;
				default:
					action = "Unknown operation";
					riskLevel = 'medium';
					estimatedTime = 100;
			}

			if (riskLevel === 'high') highRiskOperations++;
			totalEstimatedTime += estimatedTime;

			operations.push({
				type: op.type,
				path: op.path,
				action,
				hasBackup,
				riskLevel,
				estimatedTime,
			});
		}

		const overallRiskLevel: 'low' | 'medium' | 'high' = 
			highRiskOperations > 0 ? 'high' :
			operations.filter(op => op.riskLevel === 'medium').length > operations.length / 2 ? 'medium' : 'low';

		return {
			operations,
			warnings,
			totalOperations: operations.length,
			estimatedDuration: totalEstimatedTime,
			overallRiskLevel,
			canProceed,
		};
	}

	/**
	 * Clear transaction history
	 */
	public async clearHistory(olderThanDays?: number): Promise<number> {
		try {
			let cleared = 0;
			const cutoffDate = olderThanDays
				? new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000)
				: null;

			for (const [id, transaction] of this.transactionHistory) {
				const transactionDate = new Date(transaction.timestamp);
				
				if (!cutoffDate || transactionDate < cutoffDate) {
					// Remove transaction files
					const transactionFile = join(this.transactionsPath, `${id}.json`);
					if (existsSync(transactionFile)) {
						await unlink(transactionFile);
					}

					// Remove backups
					for (const operation of transaction.operations) {
						const backupFile = join(this.backupsPath, `${operation.id}.bak`);
						if (existsSync(backupFile)) {
							await unlink(backupFile);
						}
					}

					this.transactionHistory.delete(id);
					cleared++;
				}
			}

			logger.info(`Cleared ${cleared} transactions from history`);
			return cleared;
		} catch (error) {
			logger.error("Failed to clear transaction history:", error);
			throw error;
		}
	}

	/**
	 * Create a checkpoint for selective rollback
	 */
	public async createCheckpoint(
		name: string,
		description: string,
		transactionIds?: string[],
		metadata?: Record<string, any>,
	): Promise<string> {
		try {
			const checkpointId = this.generateCheckpointId();
			const relevantTransactionIds = transactionIds || 
				Array.from(this.transactionHistory.keys()).slice(-10); // Last 10 transactions

			const checkpoint: Checkpoint = {
				id: checkpointId,
				name,
				description,
				timestamp: new Date().toISOString(),
				transactionIds: relevantTransactionIds,
				metadata: metadata || {},
			};

			this.checkpoints.set(checkpointId, checkpoint);
			await this.saveCheckpoint(checkpoint);

			logger.info(`Created checkpoint: ${name} (${checkpointId})`);
			return checkpointId;
		} catch (error) {
			logger.error("Failed to create checkpoint:", error);
			throw error;
		}
	}

	/**
	 * Rollback to a specific checkpoint
	 */
	public async rollbackToCheckpoint(
		checkpointId: string,
		options: RollbackOptions = {},
	): Promise<RollbackResult[]> {
		const checkpoint = this.checkpoints.get(checkpointId);
		if (!checkpoint) {
			throw new Error(`Checkpoint ${checkpointId} not found`);
		}

		logger.info(`Rolling back to checkpoint: ${checkpoint.name}`);

		const results: RollbackResult[] = [];
		const transactionsToRollback = checkpoint.transactionIds
			.filter(id => this.transactionHistory.has(id))
			.reverse(); // Rollback in reverse order

		if (this.parallelRollbackEnabled && !options.interactive) {
			// Parallel rollback for independent operations
			const rollbackPromises = transactionsToRollback.map(async (txId) => {
				return this.rollbackTransaction(txId, options);
			});

			const parallelResults = await Promise.allSettled(rollbackPromises);
			for (const result of parallelResults) {
				if (result.status === 'fulfilled') {
					results.push(result.value);
				} else {
					logger.error('Parallel rollback failed:', result.reason);
				}
			}
		} else {
			// Sequential rollback
			for (const txId of transactionsToRollback) {
				const result = await this.rollbackTransaction(txId, options);
				results.push(result);
				
				if (!result.success && !options.force) {
					logger.warn('Rollback failed, stopping checkpoint rollback');
					break;
				}
			}
		}

		return results;
	}

	/**
	 * Get all checkpoints
	 */
	public getCheckpoints(): readonly Checkpoint[] {
		return Array.from(this.checkpoints.values()).sort(
			(a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
		);
	}

	/**
	 * Interactive rollback selector
	 */
	public async selectiveRollback(
		transactionIds: string[],
		options: RollbackOptions = {},
	): Promise<RollbackResult[]> {
		logger.info(`Starting selective rollback of ${transactionIds.length} transactions`);

		const results: RollbackResult[] = [];
		const validTransactionIds = transactionIds.filter(id => 
			this.transactionHistory.has(id)
		);

		if (validTransactionIds.length === 0) {
			throw new Error('No valid transactions found for rollback');
		}

		// Show preview for each transaction
		for (const txId of validTransactionIds) {
			const preview = await this.previewRollback(txId);
			logger.info(`\n${chalk.cyan('Transaction:')} ${txId}`);
			logger.info(`${chalk.yellow('Risk Level:')} ${preview.overallRiskLevel}`);
			logger.info(`${chalk.blue('Operations:')} ${preview.totalOperations}`);
			logger.info(`${chalk.green('Estimated Time:')} ${preview.estimatedDuration}ms`);

			if (preview.warnings.length > 0) {
				logger.warn(`${chalk.red('Warnings:')}`);
				preview.warnings.forEach(warning => logger.warn(`  - ${warning}`));
			}
		}

		// Execute rollbacks
		for (const txId of validTransactionIds.reverse()) {
			const result = await this.rollbackTransaction(txId, options);
			results.push(result);
			
			if (!result.success && !options.force) {
				logger.warn('Rollback failed, stopping selective rollback');
				break;
			}
		}

		return results;
	}

	/**
	 * Get session statistics
	 */
	public getSessionStatistics(): SessionStatistics {
		const transactions = Array.from(this.transactionHistory.values());
		const sessionDuration = Date.now() - this.sessionStartTime;

		const completedTransactions = transactions.filter(tx => tx.status === 'completed').length;
		const failedTransactions = transactions.filter(tx => tx.status === 'failed').length;
		const rolledBackTransactions = transactions.filter(tx => tx.status === 'rolled_back').length;

		const totalOperations = transactions.reduce((sum, tx) => sum + tx.operations.length, 0);
		const averageOperationsPerTransaction = transactions.length > 0 
			? totalOperations / transactions.length 
			: 0;

		// Count operation types
		const operationCounts: Record<string, number> = {};
		transactions.forEach(tx => {
			tx.operations.forEach(op => {
				operationCounts[op.type] = (operationCounts[op.type] || 0) + 1;
			});
		});

		const mostCommonOperationType = Object.entries(operationCounts)
			.sort(([,a], [,b]) => b - a)[0]?.[0] || 'none';

		// Risk distribution (mock calculation)
		const riskDistribution = {
			low: Math.floor(totalOperations * 0.6),
			medium: Math.floor(totalOperations * 0.3),
			high: Math.floor(totalOperations * 0.1),
		};

		return {
			totalTransactions: transactions.length,
			completedTransactions,
			failedTransactions,
			rolledBackTransactions,
			totalOperations,
			averageOperationsPerTransaction,
			sessionDuration,
			mostCommonOperationType,
			riskDistribution,
		};
	}

	/**
	 * Enhanced rollback with better error handling and progress tracking
	 */
	public async rollbackTransactionEnhanced(
		transactionId: string,
		options: RollbackOptions = {},
	): Promise<RollbackResult> {
		const startTime = Date.now();
		const result: RollbackResult = {
			success: false,
			transactionId,
			rolledBackOperations: 0,
			errors: [],
			warnings: [],
			skippedOperations: [],
			duration: 0,
			riskLevel: 'low',
		};

		try {
			const transaction = this.transactionHistory.get(transactionId);
			if (!transaction) {
				result.errors.push(`Transaction ${transactionId} not found`);
				return result;
			}

			if (transaction.status === "rolled_back") {
				result.warnings.push("Transaction already rolled back");
				result.success = true;
				result.duration = Date.now() - startTime;
				return result;
			}

			// Get rollback preview for risk assessment
			const preview = await this.previewRollback(transactionId);
			result.riskLevel = preview.overallRiskLevel;

			if (!preview.canProceed && !options.force) {
				result.errors.push('Rollback cannot proceed due to missing backups');
				result.duration = Date.now() - startTime;
				return result;
			}

			this.emit("rollbackStarted", transactionId);
			logger.info(`Starting enhanced rollback of transaction: ${transaction.name}`);

			// Rollback operations in reverse order
			const operations = [...transaction.operations].reverse();

			for (const operation of operations) {
				try {
					const rollbackSuccess = await this.rollbackOperation(
						operation,
						options,
					);
					
					if (rollbackSuccess) {
						result.rolledBackOperations++;
					} else {
						result.skippedOperations.push(operation.path);
					}
				} catch (error) {
					const errorMsg = `Failed to rollback operation ${operation.id}: ${error}`;
					result.errors.push(errorMsg);
					logger.error(errorMsg);

					if (!options.force) {
						break; // Stop on first error unless force is enabled
					}
				}
			}

			// Update transaction status
			if (result.errors.length === 0) {
				transaction.status = "rolled_back";
				transaction.rollbackTimestamp = new Date().toISOString();
				await this.saveTransaction(transaction);
				result.success = true;
			}

			result.duration = Date.now() - startTime;
			this.emit("rollbackCompleted", result);

			logger.info(
				`Enhanced rollback completed in ${result.duration}ms: ${result.rolledBackOperations}/${operations.length} operations`,
			);
		} catch (error) {
			result.errors.push(`Rollback failed: ${error}`);
			result.duration = Date.now() - startTime;
			logger.error("Enhanced transaction rollback failed:", error);
		}

		return result;
	}

	// Private helper methods

	private async ensureDirectories(): Promise<void> {
		const dirs = [this.transactionsPath, this.backupsPath, this.checkpointsPath];
		
		for (const dir of dirs) {
			if (!existsSync(dir)) {
				await mkdir(dir, { recursive: true });
			}
		}
	}

	private async loadTransactionHistory(): Promise<void> {
		try {
			if (!existsSync(this.transactionsPath)) {
				return;
			}

			const files = await readdir(this.transactionsPath);
			
			for (const file of files) {
				if (file.endsWith(".json")) {
					try {
						const filePath = join(this.transactionsPath, file);
						const content = await readFile(filePath, "utf8");
						const transaction = TransactionSchema.parse(JSON.parse(content));
						this.transactionHistory.set(transaction.id, transaction);
					} catch (error) {
						logger.warn(`Failed to load transaction ${file}:`, error);
					}
				}
			}
		} catch (error) {
			logger.warn("Failed to load transaction history:", error);
		}
	}

	private async saveTransaction(transaction: Transaction): Promise<void> {
		try {
			const filePath = join(this.transactionsPath, `${transaction.id}.json`);
			await writeFile(filePath, JSON.stringify(transaction, null, 2));
		} catch (error) {
			logger.error(`Failed to save transaction ${transaction.id}:`, error);
			throw error;
		}
	}

	private async createBackup(
		operationId: string,
		filePath: string,
		content: string,
	): Promise<void> {
		try {
			const backupPath = join(this.backupsPath, `${operationId}.bak`);
			await writeFile(backupPath, content);
		} catch (error) {
			logger.error(`Failed to create backup for ${filePath}:`, error);
			throw error;
		}
	}

	private async hasBackup(operationId: string): Promise<boolean> {
		const backupPath = join(this.backupsPath, `${operationId}.bak`);
		return existsSync(backupPath);
	}

	private async rollbackOperation(
		operation: FileOperation,
		options: RollbackOptions,
	): Promise<boolean> {
		try {
			if (options.dryRun) {
				logger.info(`[DRY RUN] Would rollback ${operation.type} on ${operation.path}`);
				return true;
			}

			switch (operation.type) {
				case FileOperationType.CREATE:
					return await this.rollbackCreate(operation, options);
				case FileOperationType.UPDATE:
					return await this.rollbackUpdate(operation, options);
				case FileOperationType.DELETE:
					return await this.rollbackDelete(operation, options);
				case FileOperationType.MOVE:
					return await this.rollbackMove(operation, options);
				case FileOperationType.COPY:
					return await this.rollbackCopy(operation, options);
				default:
					logger.warn(`Unknown operation type: ${operation.type}`);
					return false;
			}
		} catch (error) {
			logger.error(`Failed to rollback operation ${operation.id}:`, error);
			throw error;
		}
	}

	private async rollbackCreate(
		operation: FileOperation,
		options: RollbackOptions,
	): Promise<boolean> {
		if (existsSync(operation.path)) {
			if (options.verbose) {
				logger.info(`Deleting created file: ${operation.path}`);
			}
			await unlink(operation.path);
			return true;
		}
		return false;
	}

	private async rollbackUpdate(
		operation: FileOperation,
		options: RollbackOptions,
	): Promise<boolean> {
		const backupPath = join(this.backupsPath, `${operation.id}.bak`);
		
		if (existsSync(backupPath)) {
			if (options.verbose) {
				logger.info(`Restoring file from backup: ${operation.path}`);
			}
			const backupContent = await readFile(backupPath, "utf8");
			
			// Ensure directory exists
			const dir = dirname(operation.path);
			if (!existsSync(dir)) {
				await mkdir(dir, { recursive: true });
			}
			
			await writeFile(operation.path, backupContent);
			
			// Optionally remove backup
			if (!options.preserveBackups) {
				await unlink(backupPath);
			}
			
			return true;
		}
		
		return false;
	}

	private async rollbackDelete(
		operation: FileOperation,
		options: RollbackOptions,
	): Promise<boolean> {
		const backupPath = join(this.backupsPath, `${operation.id}.bak`);
		
		if (existsSync(backupPath)) {
			if (options.verbose) {
				logger.info(`Restoring deleted file: ${operation.path}`);
			}
			const backupContent = await readFile(backupPath, "utf8");
			
			// Ensure directory exists
			const dir = dirname(operation.path);
			if (!existsSync(dir)) {
				await mkdir(dir, { recursive: true });
			}
			
			await writeFile(operation.path, backupContent);
			
			// Optionally remove backup
			if (!options.preserveBackups) {
				await unlink(backupPath);
			}
			
			return true;
		}
		
		return false;
	}

	private async rollbackMove(
		operation: FileOperation,
		options: RollbackOptions,
	): Promise<boolean> {
		if (operation.previousPath && existsSync(operation.path)) {
			if (options.verbose) {
				logger.info(`Moving file back: ${operation.path} -> ${operation.previousPath}`);
			}
			
			// Ensure target directory exists
			const dir = dirname(operation.previousPath);
			if (!existsSync(dir)) {
				await mkdir(dir, { recursive: true });
			}
			
			// Use filesystem move or copy+delete
			try {
				execSync(`mv "${operation.path}" "${operation.previousPath}"`);
				return true;
			} catch (error) {
				// Fallback to copy+delete
				const content = await readFile(operation.path, "utf8");
				await writeFile(operation.previousPath, content);
				await unlink(operation.path);
				return true;
			}
		}
		
		return false;
	}

	private async rollbackCopy(
		operation: FileOperation,
		options: RollbackOptions,
	): Promise<boolean> {
		if (existsSync(operation.path)) {
			if (options.verbose) {
				logger.info(`Deleting copied file: ${operation.path}`);
			}
			await unlink(operation.path);
			return true;
		}
		return false;
	}

	private generateTransactionId(): string {
		return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}

	private generateOperationId(): string {
		return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}

	private normalizePath(path: string): string {
		return join(this.projectPath, path);
	}

	private calculateChecksum(content: string): string {
		return createHash("sha256").update(content).digest("hex");
	}

	private async cleanupOldTransactions(): Promise<void> {
		const transactions = Array.from(this.transactionHistory.values());
		
		if (transactions.length > this.maxTransactions) {
			// Sort by timestamp and remove oldest
			transactions.sort(
				(a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
			);

			const toRemove = transactions.slice(0, transactions.length - this.maxTransactions);
			
			for (const transaction of toRemove) {
				await this.removeTransaction(transaction.id);
			}
		}
	}

	private async removeTransaction(transactionId: string): Promise<void> {
		try {
			const transaction = this.transactionHistory.get(transactionId);
			if (!transaction) {
				return;
			}

			// Remove transaction file
			const transactionFile = join(this.transactionsPath, `${transactionId}.json`);
			if (existsSync(transactionFile)) {
				await unlink(transactionFile);
			}

			// Remove backup files
			for (const operation of transaction.operations) {
				const backupFile = join(this.backupsPath, `${operation.id}.bak`);
				if (existsSync(backupFile)) {
					await unlink(backupFile);
				}
			}

			this.transactionHistory.delete(transactionId);
		} catch (error) {
			logger.warn(`Failed to remove transaction ${transactionId}:`, error);
		}
	}

	private async loadCheckpoints(): Promise<void> {
		try {
			if (!existsSync(this.checkpointsPath)) {
				return;
			}

			const files = await readdir(this.checkpointsPath);
			
			for (const file of files) {
				if (file.endsWith(".json")) {
					try {
						const filePath = join(this.checkpointsPath, file);
						const content = await readFile(filePath, "utf8");
						const checkpoint = JSON.parse(content) as Checkpoint;
						this.checkpoints.set(checkpoint.id, checkpoint);
					} catch (error) {
						logger.warn(`Failed to load checkpoint ${file}:`, error);
					}
				}
			}
		} catch (error) {
			logger.warn("Failed to load checkpoints:", error);
		}
	}

	private async saveCheckpoint(checkpoint: Checkpoint): Promise<void> {
		try {
			const filePath = join(this.checkpointsPath, `${checkpoint.id}.json`);
			await writeFile(filePath, JSON.stringify(checkpoint, null, 2));
		} catch (error) {
			logger.error(`Failed to save checkpoint ${checkpoint.id}:`, error);
			throw error;
		}
	}

	private generateCheckpointId(): string {
		return `cp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}
}

/**
 * Default export
 */
export default UndoRollbackManager;