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
 * Undo/Rollback manager
 */
export class UndoRollbackManager extends EventEmitter {
	private readonly projectPath: string;
	private readonly transactionsPath: string;
	private readonly backupsPath: string;
	private readonly maxTransactions: number;
	private currentTransaction: Transaction | null = null;
	private readonly transactionHistory: Map<string, Transaction> = new Map();

	constructor(projectPath: string, maxTransactions: number = 50) {
		super();
		this.projectPath = projectPath;
		this.maxTransactions = maxTransactions;
		this.transactionsPath = join(projectPath, ".xaheen", "transactions");
		this.backupsPath = join(projectPath, ".xaheen", "backups");
	}

	/**
	 * Initialize undo/rollback system
	 */
	public async initialize(): Promise<void> {
		try {
			// Ensure directories exist
			await this.ensureDirectories();

			// Load transaction history
			await this.loadTransactionHistory();

			logger.info(
				`Undo/Rollback system initialized with ${this.transactionHistory.size} transactions`,
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
	 * Rollback transaction
	 */
	public async rollbackTransaction(
		transactionId: string,
		options: RollbackOptions = {},
	): Promise<RollbackResult> {
		const result: RollbackResult = {
			success: false,
			transactionId,
			rolledBackOperations: 0,
			errors: [],
			warnings: [],
			skippedOperations: [],
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
				return result;
			}

			this.emit("rollbackStarted", transactionId);

			logger.info(`Starting rollback of transaction: ${transaction.name}`);

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

			this.emit("rollbackCompleted", result);

			logger.info(
				`Rollback completed: ${result.rolledBackOperations}/${operations.length} operations`,
			);
		} catch (error) {
			result.errors.push(`Rollback failed: ${error}`);
			logger.error("Transaction rollback failed:", error);
		}

		return result;
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
	 * Preview rollback changes
	 */
	public async previewRollback(
		transactionId: string,
	): Promise<{
		operations: Array<{
			type: string;
			path: string;
			action: string;
			hasBackup: boolean;
		}>;
		warnings: string[];
	}> {
		const transaction = this.transactionHistory.get(transactionId);
		if (!transaction) {
			throw new Error(`Transaction ${transactionId} not found`);
		}

		const operations = [];
		const warnings = [];

		for (const op of [...transaction.operations].reverse()) {
			const hasBackup = await this.hasBackup(op.id);
			let action = "";

			switch (op.type) {
				case FileOperationType.CREATE:
					action = "Delete created file";
					break;
				case FileOperationType.UPDATE:
					action = hasBackup ? "Restore from backup" : "Cannot restore (no backup)";
					if (!hasBackup) {
						warnings.push(`No backup available for ${op.path}`);
					}
					break;
				case FileOperationType.DELETE:
					action = hasBackup ? "Restore deleted file" : "Cannot restore (no backup)";
					if (!hasBackup) {
						warnings.push(`No backup available for ${op.path}`);
					}
					break;
				case FileOperationType.MOVE:
					action = "Move file back to original location";
					break;
				case FileOperationType.COPY:
					action = "Delete copied file";
					break;
			}

			operations.push({
				type: op.type,
				path: op.path,
				action,
				hasBackup,
			});
		}

		return { operations, warnings };
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

	// Private helper methods

	private async ensureDirectories(): Promise<void> {
		const dirs = [this.transactionsPath, this.backupsPath];
		
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
}

/**
 * Default export
 */
export default UndoRollbackManager;