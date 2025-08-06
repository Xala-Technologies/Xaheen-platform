/**
 * CLI Research-Driven Developer Experience - Main Exports
 * Provides comprehensive CLI enhancement services for developer productivity
 * Generated with Xaheen CLI - AI-Native Developer Productivity
 */

// Plugin Architecture
export { default as PluginLifecycleManager } from "../plugins/plugin-lifecycle-manager";
export { default as PluginRegistry } from "../plugins/plugin-registry";
export type {
	PluginState,
	PluginLifecycleResult,
	PluginActivationOptions,
} from "../plugins/plugin-lifecycle-manager.js";
export type {
	PluginRegistryEntry,
	PluginAPI,
	PluginContext,
	PluginDiscoveryOptions,
} from "../plugins/plugin-registry.js";

// Auto-Completion System
export { default as AutoCompletionEngine } from "./auto-completion-engine";
export { default as CommandAutoCompletion, ShellType } from "./command-auto-completion";
export type {
	CompletionItem,
	CompletionContext,
	FuzzyMatchOptions,
	FuzzyMatchResult,
	CompletionProvider,
} from "./auto-completion-engine.js";
export type {
	AutoCompletionSetupOptions,
	ShellCompletionResult,
} from "./command-auto-completion.js";

// Contextual Help System
export { default as ContextualHelpSystem } from "./contextual-help-system";
export type {
	HelpContent,
	HelpContext,
	SmartSuggestion,
	HelpFormattingOptions,
} from "./contextual-help-system.js";

// Undo/Rollback System
export { default as UndoRollbackManager, FileOperationType } from "./undo-rollback-manager";
export type {
	FileOperation,
	Transaction,
	RollbackOptions,
	RollbackResult,
} from "./undo-rollback-manager.js";

// Progress Indicators
export {
	default as ProgressIndicatorFactory,
	ProgressBar,
	Spinner,
	MultiProgress,
} from "./progress-indicator.js";
export type {
	ProgressBarOptions,
	SpinnerOptions,
	SpinnerDefinition,
	MultiProgressOptions,
	ProgressEventData,
} from "./progress-indicator.js";

// Rich Output Formatting
export { default as RichOutputFormatter } from "./rich-output-formatter";
export type {
	OutputFormattingOptions,
	OutputTheme,
	DiffOptions,
	TableColumn,
	TreeNode,
} from "./rich-output-formatter.js";

// Interactive CLI Output
export { default as InteractiveCLIOutput, AnimationType, NotificationType } from "./interactive-cli-output";
export type {
	AnimationOptions,
	InteractiveOptions,
	BannerOptions,
	NotificationOptions,
} from "./interactive-cli-output.js";

/**
 * CLI Enhancement Factory
 * Provides a unified interface for creating and managing CLI enhancement services
 */
export class CLIEnhancementFactory {
	private readonly projectPath: string;
	private readonly services: Map<string, any> = new Map();

	constructor(projectPath: string) {
		this.projectPath = projectPath;
	}

	/**
	 * Get or create plugin lifecycle manager
	 */
	public getPluginLifecycleManager(): PluginLifecycleManager {
		if (!this.services.has("pluginLifecycle")) {
			const manager = new PluginLifecycleManager(this.projectPath);
			this.services.set("pluginLifecycle", manager);
		}
		return this.services.get("pluginLifecycle");
	}

	/**
	 * Get or create plugin registry
	 */
	public getPluginRegistry(): PluginRegistry {
		if (!this.services.has("pluginRegistry")) {
			const registry = new PluginRegistry(this.projectPath);
			this.services.set("pluginRegistry", registry);
		}
		return this.services.get("pluginRegistry");
	}

	/**
	 * Get or create auto-completion engine
	 */
	public getAutoCompletionEngine(): AutoCompletionEngine {
		if (!this.services.has("autoCompletion")) {
			const engine = new AutoCompletionEngine(this.projectPath);
			this.services.set("autoCompletion", engine);
		}
		return this.services.get("autoCompletion");
	}

	/**
	 * Get or create command auto-completion
	 */
	public getCommandAutoCompletion(): CommandAutoCompletion {
		if (!this.services.has("commandAutoCompletion")) {
			const completion = new CommandAutoCompletion(this.projectPath);
			this.services.set("commandAutoCompletion", completion);
		}
		return this.services.get("commandAutoCompletion");
	}

	/**
	 * Get or create contextual help system
	 */
	public getContextualHelpSystem(): ContextualHelpSystem {
		if (!this.services.has("contextualHelp")) {
			const help = new ContextualHelpSystem(this.projectPath);
			this.services.set("contextualHelp", help);
		}
		return this.services.get("contextualHelp");
	}

	/**
	 * Get or create undo/rollback manager
	 */
	public getUndoRollbackManager(): UndoRollbackManager {
		if (!this.services.has("undoRollback")) {
			const manager = new UndoRollbackManager(this.projectPath);
			this.services.set("undoRollback", manager);
		}
		return this.services.get("undoRollback");
	}

	/**
	 * Get or create rich output formatter
	 */
	public getRichOutputFormatter(): RichOutputFormatter {
		if (!this.services.has("richOutput")) {
			const formatter = new RichOutputFormatter();
			this.services.set("richOutput", formatter);
		}
		return this.services.get("richOutput");
	}

	/**
	 * Get or create interactive CLI output
	 */
	public getInteractiveCLIOutput(): InteractiveCLIOutput {
		if (!this.services.has("interactiveOutput")) {
			const output = new InteractiveCLIOutput();
			this.services.set("interactiveOutput", output);
		}
		return this.services.get("interactiveOutput");
	}

	/**
	 * Initialize all services
	 */
	public async initializeAll(): Promise<void> {
		const initPromises = [
			this.getPluginLifecycleManager().initialize(),
			this.getPluginRegistry().initialize(),
			this.getCommandAutoCompletion().initialize(),
			this.getUndoRollbackManager().initialize(),
		];

		await Promise.all(initPromises);
	}

	/**
	 * Cleanup all services
	 */
	public cleanup(): void {
		// Cleanup interactive output
		const interactiveOutput = this.services.get("interactiveOutput");
		if (interactiveOutput) {
			interactiveOutput.cleanup();
		}

		// Clear all services
		this.services.clear();
	}

	/**
	 * Get service statistics
	 */
	public getServiceStatistics(): Record<string, any> {
		const stats: Record<string, any> = {};

		// Plugin statistics
		const pluginLifecycle = this.services.get("pluginLifecycle");
		if (pluginLifecycle) {
			stats.plugins = {
				total: pluginLifecycle.getAllPluginStates().length,
				active: pluginLifecycle.getActivePlugins().length,
				activationOrder: pluginLifecycle.getActivationOrder(),
			};
		}

		// Auto-completion statistics
		const autoCompletion = this.services.get("autoCompletion");
		if (autoCompletion) {
			// Auto-completion engine doesn't have built-in stats, but we could add them
			stats.autoCompletion = {
				initialized: true,
			};
		}

		// Undo/rollback statistics
		const undoRollback = this.services.get("undoRollback");
		if (undoRollback) {
			const history = undoRollback.getTransactionHistory();
			stats.undoRollback = {
				totalTransactions: history.length,
				completedTransactions: history.filter(t => t.status === "completed").length,
				rollbackPoints: undoRollback.getAvailableRollbackPoints().length,
			};
		}

		return stats;
	}
}

/**
 * Default factory instance
 */
let defaultFactory: CLIEnhancementFactory | null = null;

/**
 * Get or create default CLI enhancement factory
 */
export function getCLIEnhancementFactory(projectPath?: string): CLIEnhancementFactory {
	if (!defaultFactory && projectPath) {
		defaultFactory = new CLIEnhancementFactory(projectPath);
	}
	
	if (!defaultFactory) {
		throw new Error("CLI Enhancement Factory not initialized. Please provide a project path.");
	}
	
	return defaultFactory;
}

/**
 * Reset default factory (useful for testing)
 */
export function resetCLIEnhancementFactory(): void {
	if (defaultFactory) {
		defaultFactory.cleanup();
		defaultFactory = null;
	}
}

/**
 * Quick access functions for common operations
 */

/**
 * Quick setup for auto-completion
 */
export async function setupAutoCompletion(
	projectPath: string,
	shell?: ShellType,
): Promise<boolean> {
	const factory = getCLIEnhancementFactory(projectPath);
	const completion = factory.getCommandAutoCompletion();
	
	await completion.initialize();
	return completion.setupShellCompletion({ shell });
}

/**
 * Quick transaction for undo/rollback
 */
export async function withTransaction<T>(
	projectPath: string,
	name: string,
	description: string,
	command: string,
	operation: (manager: UndoRollbackManager) => Promise<T>,
): Promise<T> {
	const factory = getCLIEnhancementFactory(projectPath);
	const manager = factory.getUndoRollbackManager();
	
	await manager.initialize();
	
	const transactionId = await manager.startTransaction(name, description, command);
	
	try {
		const result = await operation(manager);
		await manager.completeTransaction();
		return result;
	} catch (error) {
		// Transaction will be marked as failed automatically
		throw error;
	}
}

/**
 * Quick help lookup
 */
export async function getQuickHelp(
	projectPath: string,
	command: string[],
): Promise<string> {
	const factory = getCLIEnhancementFactory(projectPath);
	const help = factory.getContextualHelpSystem();
	
	const context = {
		command,
		currentArg: "",
		projectPath,
		isOption: false,
	};
	
	return help.getContextualHelp(context);
}

/**
 * Quick completion
 */
export async function getQuickCompletion(
	projectPath: string,
	commandLine: string,
	position?: number,
): Promise<string[]> {
	const factory = getCLIEnhancementFactory(projectPath);
	const completion = factory.getCommandAutoCompletion();
	
	await completion.initialize();
	
	const result = await completion.getCompletions(commandLine, position);
	return result.completions;
}

/**
 * Default export
 */
export default CLIEnhancementFactory;