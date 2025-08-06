/**
 * Dry Run Manager
 * Preview changes without executing them - enhanced developer experience
 * Generated with Xaheen CLI - AI-Native Developer Productivity
 */

import chalk from "chalk";
import { existsSync } from "fs";
import { readFile, stat } from "fs/promises";
import { dirname, join, relative } from "path";
import { logger } from "../../utils/logger";

// import { diffLines } from 'diff'; // TODO: Add diff package or implement simple diff

/**
 * Simple diff interface
 */
interface DiffPart {
	readonly value: string;
	readonly added?: boolean;
	readonly removed?: boolean;
}

/**
 * Simple line-based diff implementation
 */
function simpleDiffLines(oldText: string, newText: string): DiffPart[] {
	const oldLines = oldText.split("\n");
	const newLines = newText.split("\n");
	const result: DiffPart[] = [];

	// Simple implementation - in production, use a proper diff library
	const maxLines = Math.max(oldLines.length, newLines.length);

	for (let i = 0; i < maxLines; i++) {
		const oldLine = oldLines[i];
		const newLine = newLines[i];

		if (oldLine === undefined) {
			result.push({ value: newLine + "\n", added: true });
		} else if (newLine === undefined) {
			result.push({ value: oldLine + "\n", removed: true });
		} else if (oldLine !== newLine) {
			result.push({ value: oldLine + "\n", removed: true });
			result.push({ value: newLine + "\n", added: true });
		} else {
			result.push({ value: oldLine + "\n" });
		}
	}

	return result;
}

/**
 * File operation types
 */
export type FileOperation = "create" | "update" | "delete" | "move" | "copy";

/**
 * Dry run file change interface
 */
export interface DryRunFileChange {
	readonly operation: FileOperation;
	readonly path: string;
	readonly originalPath?: string; // For move/copy operations
	readonly originalContent?: string;
	readonly newContent?: string;
	readonly size?: number;
	readonly reason: string;
	readonly generator?: string;
}

/**
 * Dry run command change interface
 */
export interface DryRunCommandChange {
	readonly command: string;
	readonly description: string;
	readonly workingDirectory?: string;
	readonly generator?: string;
}

/**
 * Dry run result interface
 */
export interface DryRunResult {
	readonly success: boolean;
	readonly fileChanges: DryRunFileChange[];
	readonly commandChanges: DryRunCommandChange[];
	readonly summary: {
		readonly filesCreated: number;
		readonly filesUpdated: number;
		readonly filesDeleted: number;
		readonly filesMoved: number;
		readonly filesCopied: number;
		readonly commandsToRun: number;
		readonly totalSize: number;
	};
	readonly warnings: string[];
	readonly errors: string[];
}

/**
 * Dry run options interface
 */
export interface DryRunOptions {
	readonly showDiff?: boolean;
	readonly showContent?: boolean;
	readonly maxContentLines?: number;
	readonly groupByGenerator?: boolean;
	readonly includeCommands?: boolean;
	readonly verbose?: boolean;
}

/**
 * Dry run manager for previewing changes
 */
export class DryRunManager {
	private readonly projectPath: string;
	private readonly fileChanges: DryRunFileChange[] = [];
	private readonly commandChanges: DryRunCommandChange[] = [];
	private readonly warnings: string[] = [];
	private readonly errors: string[] = [];

	constructor(projectPath: string) {
		this.projectPath = projectPath;
	}

	/**
	 * Record a file creation
	 */
	public recordFileCreation(
		filePath: string,
		content: string,
		reason: string,
		generator?: string,
	): void {
		const absolutePath = this.resolveAbsolutePath(filePath);
		const relativePath = relative(this.projectPath, absolutePath);

		this.fileChanges.push({
			operation: "create",
			path: relativePath,
			newContent: content,
			size: Buffer.byteLength(content, "utf8"),
			reason,
			generator,
		});
	}

	/**
	 * Record a file update
	 */
	public async recordFileUpdate(
		filePath: string,
		newContent: string,
		reason: string,
		generator?: string,
	): Promise<void> {
		const absolutePath = this.resolveAbsolutePath(filePath);
		const relativePath = relative(this.projectPath, absolutePath);

		let originalContent = "";

		try {
			if (existsSync(absolutePath)) {
				originalContent = await readFile(absolutePath, "utf-8");
			}
		} catch (error) {
			this.warnings.push(
				`Could not read original content of ${relativePath}: ${error}`,
			);
		}

		this.fileChanges.push({
			operation: "update",
			path: relativePath,
			originalContent,
			newContent,
			size: Buffer.byteLength(newContent, "utf8"),
			reason,
			generator,
		});
	}

	/**
	 * Record a file deletion
	 */
	public async recordFileDeletion(
		filePath: string,
		reason: string,
		generator?: string,
	): Promise<void> {
		const absolutePath = this.resolveAbsolutePath(filePath);
		const relativePath = relative(this.projectPath, absolutePath);

		let originalContent = "";
		let size = 0;

		try {
			if (existsSync(absolutePath)) {
				originalContent = await readFile(absolutePath, "utf-8");
				const stats = await stat(absolutePath);
				size = stats.size;
			}
		} catch (error) {
			this.warnings.push(
				`Could not read file to delete ${relativePath}: ${error}`,
			);
		}

		this.fileChanges.push({
			operation: "delete",
			path: relativePath,
			originalContent,
			size,
			reason,
			generator,
		});
	}

	/**
	 * Record a file move
	 */
	public async recordFileMove(
		fromPath: string,
		toPath: string,
		reason: string,
		generator?: string,
	): Promise<void> {
		const absoluteFromPath = this.resolveAbsolutePath(fromPath);
		const absoluteToPath = this.resolveAbsolutePath(toPath);
		const relativeFromPath = relative(this.projectPath, absoluteFromPath);
		const relativeToPath = relative(this.projectPath, absoluteToPath);

		let originalContent = "";
		let size = 0;

		try {
			if (existsSync(absoluteFromPath)) {
				originalContent = await readFile(absoluteFromPath, "utf-8");
				const stats = await stat(absoluteFromPath);
				size = stats.size;
			}
		} catch (error) {
			this.warnings.push(
				`Could not read file to move ${relativeFromPath}: ${error}`,
			);
		}

		this.fileChanges.push({
			operation: "move",
			path: relativeToPath,
			originalPath: relativeFromPath,
			originalContent,
			newContent: originalContent, // Content stays the same for moves
			size,
			reason,
			generator,
		});
	}

	/**
	 * Record a file copy
	 */
	public async recordFileCopy(
		fromPath: string,
		toPath: string,
		reason: string,
		generator?: string,
	): Promise<void> {
		const absoluteFromPath = this.resolveAbsolutePath(fromPath);
		const absoluteToPath = this.resolveAbsolutePath(toPath);
		const relativeFromPath = relative(this.projectPath, absoluteFromPath);
		const relativeToPath = relative(this.projectPath, absoluteToPath);

		let originalContent = "";
		let size = 0;

		try {
			if (existsSync(absoluteFromPath)) {
				originalContent = await readFile(absoluteFromPath, "utf-8");
				const stats = await stat(absoluteFromPath);
				size = stats.size;
			}
		} catch (error) {
			this.warnings.push(
				`Could not read file to copy ${relativeFromPath}: ${error}`,
			);
		}

		this.fileChanges.push({
			operation: "copy",
			path: relativeToPath,
			originalPath: relativeFromPath,
			originalContent,
			newContent: originalContent, // Content stays the same for copies
			size,
			reason,
			generator,
		});
	}

	/**
	 * Record a command to be executed
	 */
	public recordCommand(
		command: string,
		description: string,
		workingDirectory?: string,
		generator?: string,
	): void {
		this.commandChanges.push({
			command,
			description,
			workingDirectory: workingDirectory
				? relative(this.projectPath, workingDirectory)
				: undefined,
			generator,
		});
	}

	/**
	 * Add a warning
	 */
	public addWarning(message: string): void {
		this.warnings.push(message);
	}

	/**
	 * Add an error
	 */
	public addError(message: string): void {
		this.errors.push(message);
	}

	/**
	 * Generate dry run result
	 */
	public generateResult(): DryRunResult {
		const summary = this.generateSummary();

		return {
			success: this.errors.length === 0,
			fileChanges: [...this.fileChanges],
			commandChanges: [...this.commandChanges],
			summary,
			warnings: [...this.warnings],
			errors: [...this.errors],
		};
	}

	/**
	 * Display dry run results
	 */
	public async displayResults(options: DryRunOptions = {}): Promise<void> {
		const result = this.generateResult();

		console.log(chalk.cyan.bold("\n🔍 Dry Run Results\n"));

		// Display summary
		this.displaySummary(result.summary);

		// Display errors
		if (result.errors.length > 0) {
			console.log(chalk.red.bold("\n❌ Errors:\n"));
			result.errors.forEach((error) => console.log(chalk.red(`  - ${error}`)));
		}

		// Display warnings
		if (result.warnings.length > 0) {
			console.log(chalk.yellow.bold("\n⚠️  Warnings:\n"));
			result.warnings.forEach((warning) =>
				console.log(chalk.yellow(`  - ${warning}`)),
			);
		}

		// Display file changes
		if (result.fileChanges.length > 0) {
			await this.displayFileChanges(result.fileChanges, options);
		}

		// Display command changes
		if (result.commandChanges.length > 0 && options.includeCommands !== false) {
			this.displayCommandChanges(result.commandChanges, options);
		}

		// Display next steps
		this.displayNextSteps(result);
	}

	/**
	 * Clear all recorded changes
	 */
	public clear(): void {
		this.fileChanges.length = 0;
		this.commandChanges.length = 0;
		this.warnings.length = 0;
		this.errors.length = 0;
	}

	// Private helper methods

	private resolveAbsolutePath(filePath: string): string {
		if (filePath.startsWith("/")) {
			return filePath;
		}
		return join(this.projectPath, filePath);
	}

	private generateSummary(): DryRunResult["summary"] {
		const filesCreated = this.fileChanges.filter(
			(c) => c.operation === "create",
		).length;
		const filesUpdated = this.fileChanges.filter(
			(c) => c.operation === "update",
		).length;
		const filesDeleted = this.fileChanges.filter(
			(c) => c.operation === "delete",
		).length;
		const filesMoved = this.fileChanges.filter(
			(c) => c.operation === "move",
		).length;
		const filesCopied = this.fileChanges.filter(
			(c) => c.operation === "copy",
		).length;
		const commandsToRun = this.commandChanges.length;
		const totalSize = this.fileChanges.reduce(
			(sum, change) => sum + (change.size || 0),
			0,
		);

		return {
			filesCreated,
			filesUpdated,
			filesDeleted,
			filesMoved,
			filesCopied,
			commandsToRun,
			totalSize,
		};
	}

	private displaySummary(summary: DryRunResult["summary"]): void {
		console.log(chalk.blue.bold("📊 Summary:\n"));

		if (summary.filesCreated > 0) {
			console.log(chalk.green(`  ✨ ${summary.filesCreated} files to create`));
		}

		if (summary.filesUpdated > 0) {
			console.log(chalk.yellow(`  📝 ${summary.filesUpdated} files to update`));
		}

		if (summary.filesDeleted > 0) {
			console.log(chalk.red(`  🗑️  ${summary.filesDeleted} files to delete`));
		}

		if (summary.filesMoved > 0) {
			console.log(chalk.blue(`  📦 ${summary.filesMoved} files to move`));
		}

		if (summary.filesCopied > 0) {
			console.log(chalk.cyan(`  📋 ${summary.filesCopied} files to copy`));
		}

		if (summary.commandsToRun > 0) {
			console.log(
				chalk.magenta(`  ⚡ ${summary.commandsToRun} commands to run`),
			);
		}

		if (summary.totalSize > 0) {
			console.log(
				chalk.gray(`  📏 Total size: ${this.formatBytes(summary.totalSize)}`),
			);
		}
	}

	private async displayFileChanges(
		fileChanges: DryRunFileChange[],
		options: DryRunOptions,
	): Promise<void> {
		console.log(chalk.blue.bold("\n📁 File Changes:\n"));

		// Group by generator if requested
		if (options.groupByGenerator) {
			const grouped = this.groupChangesByGenerator(fileChanges);

			for (const [generator, changes] of Object.entries(grouped)) {
				console.log(chalk.cyan.bold(`${generator || "Core"}:`));
				await this.displayFileChangeGroup(changes, options);
				console.log("");
			}
		} else {
			await this.displayFileChangeGroup(fileChanges, options);
		}
	}

	private async displayFileChangeGroup(
		changes: DryRunFileChange[],
		options: DryRunOptions,
	): Promise<void> {
		for (const change of changes) {
			await this.displaySingleFileChange(change, options);
		}
	}

	private async displaySingleFileChange(
		change: DryRunFileChange,
		options: DryRunOptions,
	): Promise<void> {
		const operationIcon = this.getOperationIcon(change.operation);
		const operationColor = this.getOperationColor(change.operation);

		console.log(
			operationColor(
				`${operationIcon} ${change.operation.toUpperCase()}: ${change.path}`,
			),
		);
		console.log(chalk.gray(`    Reason: ${change.reason}`));

		if (change.originalPath) {
			console.log(chalk.gray(`    From: ${change.originalPath}`));
		}

		if (change.size) {
			console.log(chalk.gray(`    Size: ${this.formatBytes(change.size)}`));
		}

		// Show content preview
		if (options.showContent && change.newContent) {
			const maxLines = options.maxContentLines || 10;
			const lines = change.newContent.split("\n");
			const preview = lines.slice(0, maxLines).join("\n");

			console.log(chalk.gray("    Content preview:"));
			console.log(chalk.gray(this.indentText(preview, "      ")));

			if (lines.length > maxLines) {
				console.log(
					chalk.gray(`      ... (${lines.length - maxLines} more lines)`),
				);
			}
		}

		// Show diff for updates
		if (
			options.showDiff &&
			change.operation === "update" &&
			change.originalContent &&
			change.newContent
		) {
			const diff = simpleDiffLines(change.originalContent, change.newContent);

			if (diff.some((part: DiffPart) => part.added || part.removed)) {
				console.log(chalk.gray("    Changes:"));

				for (const part of diff) {
					if (part.added) {
						console.log(chalk.green(this.indentText(part.value, "      + ")));
					} else if (part.removed) {
						console.log(chalk.red(this.indentText(part.value, "      - ")));
					}
				}
			}
		}

		console.log("");
	}

	private displayCommandChanges(
		commandChanges: DryRunCommandChange[],
		options: DryRunOptions,
	): void {
		console.log(chalk.blue.bold("\n⚡ Commands to Run:\n"));

		// Group by generator if requested
		if (options.groupByGenerator) {
			const grouped = this.groupCommandsByGenerator(commandChanges);

			for (const [generator, commands] of Object.entries(grouped)) {
				console.log(chalk.cyan.bold(`${generator || "Core"}:`));
				this.displayCommandGroup(commands);
				console.log("");
			}
		} else {
			this.displayCommandGroup(commandChanges);
		}
	}

	private displayCommandGroup(commands: DryRunCommandChange[]): void {
		for (const command of commands) {
			console.log(chalk.magenta(`  $ ${command.command}`));
			console.log(chalk.gray(`    ${command.description}`));

			if (command.workingDirectory) {
				console.log(
					chalk.gray(`    Working directory: ${command.workingDirectory}`),
				);
			}

			console.log("");
		}
	}

	private displayNextSteps(result: DryRunResult): void {
		console.log(chalk.cyan.bold("\n🚀 Next Steps:\n"));

		if (result.success) {
			console.log(
				chalk.green(
					"  ✅ All checks passed! You can proceed with the operation.",
				),
			);
			console.log(
				chalk.gray("  💡 Run the same command without --dry-run to execute."),
			);
		} else {
			console.log(
				chalk.red("  ❌ Please fix the errors above before proceeding."),
			);
		}

		if (result.warnings.length > 0) {
			console.log(
				chalk.yellow(
					"  ⚠️  Review the warnings and consider if any action is needed.",
				),
			);
		}

		console.log(
			chalk.gray(
				"\n  📖 For more information, see the documentation or run with --help",
			),
		);
	}

	private getOperationIcon(operation: FileOperation): string {
		const icons = {
			create: "✨",
			update: "📝",
			delete: "🗑️",
			move: "📦",
			copy: "📋",
		};
		return icons[operation] || "📄";
	}

	private getOperationColor(operation: FileOperation): typeof chalk.green {
		const colors = {
			create: chalk.green,
			update: chalk.yellow,
			delete: chalk.red,
			move: chalk.blue,
			copy: chalk.cyan,
		};
		return colors[operation] || chalk.white;
	}

	private groupChangesByGenerator(
		changes: DryRunFileChange[],
	): Record<string, DryRunFileChange[]> {
		const grouped: Record<string, DryRunFileChange[]> = {};

		for (const change of changes) {
			const generator = change.generator || "Core";
			if (!grouped[generator]) {
				grouped[generator] = [];
			}
			grouped[generator].push(change);
		}

		return grouped;
	}

	private groupCommandsByGenerator(
		commands: DryRunCommandChange[],
	): Record<string, DryRunCommandChange[]> {
		const grouped: Record<string, DryRunCommandChange[]> = {};

		for (const command of commands) {
			const generator = command.generator || "Core";
			if (!grouped[generator]) {
				grouped[generator] = [];
			}
			grouped[generator].push(command);
		}

		return grouped;
	}

	private formatBytes(bytes: number): string {
		if (bytes === 0) return "0 B";

		const k = 1024;
		const sizes = ["B", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));

		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
	}

	private indentText(text: string, indent: string): string {
		return text
			.split("\n")
			.map((line) => indent + line)
			.join("\n");
	}
}

/**
 * Create dry run manager instance
 */
export function createDryRunManager(projectPath: string): DryRunManager {
	return new DryRunManager(projectPath);
}

/**
 * Default export
 */
export default DryRunManager;
