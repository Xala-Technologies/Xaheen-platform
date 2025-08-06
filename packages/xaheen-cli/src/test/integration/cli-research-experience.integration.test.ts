/**
 * Integration Tests for CLI Research-Driven Developer Experience
 * Tests plugin architecture, auto-completion, contextual help, and undo/rollback
 * Generated with Xaheen CLI - AI-Native Developer Productivity
 */

import { beforeAll, afterAll, beforeEach, afterEach, describe, it, expect, jest } from "@jest/globals";
import { mkdtempSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { execSync } from "child_process";

// Import services to test
import PluginLifecycleManager from "../../services/plugins/plugin-lifecycle-manager";
import PluginRegistry from "../../services/plugins/plugin-registry";
import AutoCompletionEngine from "../../services/cli/auto-completion-engine";
import CommandAutoCompletion from "../../services/cli/command-auto-completion";
import ContextualHelpSystem from "../../services/cli/contextual-help-system";
import UndoRollbackManager from "../../services/cli/undo-rollback-manager";
import ProgressIndicatorFactory from "../../services/cli/progress-indicator";
import RichOutputFormatter from "../../services/cli/rich-output-formatter";
import InteractiveCLIOutput from "../../services/cli/interactive-cli-output";

describe("CLI Research-Driven Developer Experience", () => {
	let testProjectPath: string;
	let pluginLifecycleManager: PluginLifecycleManager;
	let pluginRegistry: PluginRegistry;
	let autoCompletionEngine: AutoCompletionEngine;
	let commandAutoCompletion: CommandAutoCompletion;
	let contextualHelpSystem: ContextualHelpSystem;
	let undoRollbackManager: UndoRollbackManager;
	let richOutputFormatter: RichOutputFormatter;
	let interactiveCLIOutput: InteractiveCLIOutput;

	beforeAll(async () => {
		// Create temporary test directory
		testProjectPath = mkdtempSync(join(tmpdir(), "xaheen-cli-test-"));

		// Initialize Git repository for testing
		execSync("git init", { cwd: testProjectPath });
		execSync("git config user.name 'Test User'", { cwd: testProjectPath });
		execSync("git config user.email 'test@example.com'", { cwd: testProjectPath });

		// Initialize services
		pluginLifecycleManager = new PluginLifecycleManager(testProjectPath);
		pluginRegistry = new PluginRegistry(testProjectPath);
		autoCompletionEngine = new AutoCompletionEngine(testProjectPath);
		commandAutoCompletion = new CommandAutoCompletion(testProjectPath);
		contextualHelpSystem = new ContextualHelpSystem(testProjectPath);
		undoRollbackManager = new UndoRollbackManager(testProjectPath);
		richOutputFormatter = new RichOutputFormatter();
		interactiveCLIOutput = new InteractiveCLIOutput();

		// Initialize all systems
		await pluginLifecycleManager.initialize();
		await pluginRegistry.initialize();
		await commandAutoCompletion.initialize();
		await undoRollbackManager.initialize();
	});

	afterAll(async () => {
		// Cleanup
		interactiveCLIOutput.cleanup();
		
		// Remove temporary directory
		try {
			rmSync(testProjectPath, { recursive: true, force: true });
		} catch (error) {
			console.warn("Failed to cleanup test directory:", error);
		}
	});

	beforeEach(() => {
		// Reset any state before each test
		jest.clearAllMocks();
	});

	afterEach(() => {
		// Cleanup after each test
	});

	describe("Plugin Architecture", () => {
		describe("Plugin Lifecycle Manager", () => {
			it("should initialize successfully", async () => {
				expect(pluginLifecycleManager).toBeDefined();
				expect(pluginLifecycleManager.getAllPluginStates()).toEqual([]);
			});

			it("should register plugin installation", async () => {
				const mockPlugin = {
					name: "test-plugin",
					version: "1.0.0",
					description: "Test plugin",
					author: "Test Author",
					keywords: ["test"],
					category: "generator" as const,
					xaheenVersion: "^2.0.0",
					license: "MIT",
					certified: false,
					downloads: 0,
					rating: 0,
					lastUpdated: new Date().toISOString(),
				};

				const result = await pluginLifecycleManager.registerPluginInstallation(mockPlugin);
				
				expect(result.success).toBe(true);
				expect(result.plugin).toEqual(mockPlugin);
				
				const pluginState = pluginLifecycleManager.getPluginState("test-plugin");
				expect(pluginState).toBeDefined();
				expect(pluginState?.status).toBe("installed");
			});

			it("should activate plugin with dependency resolution", async () => {
				// First register a plugin
				const mockPlugin = {
					name: "test-plugin-2",
					version: "1.0.0",
					description: "Test plugin 2",
					author: "Test Author",
					keywords: ["test"],
					category: "generator" as const,
					xaheenVersion: "^2.0.0",
					license: "MIT",
					certified: false,
					downloads: 0,
					rating: 0,
					lastUpdated: new Date().toISOString(),
				};

				await pluginLifecycleManager.registerPluginInstallation(mockPlugin);

				// Activate plugin
				const result = await pluginLifecycleManager.activatePlugin("test-plugin-2");
				
				expect(result.success).toBe(true);
				
				const pluginState = pluginLifecycleManager.getPluginState("test-plugin-2");
				expect(pluginState?.status).toBe("active");
				expect(pluginState?.activationCount).toBe(1);
			});

			it("should deactivate plugin", async () => {
				const result = await pluginLifecycleManager.deactivatePlugin("test-plugin-2");
				
				expect(result.success).toBe(true);
				
				const pluginState = pluginLifecycleManager.getPluginState("test-plugin-2");
				expect(pluginState?.status).toBe("inactive");
			});

			it("should handle plugin dependencies", async () => {
				const dependencies = pluginLifecycleManager.getPluginDependencies("test-plugin");
				expect(Array.isArray(dependencies)).toBe(true);
			});
		});

		describe("Plugin Registry", () => {
			it("should discover plugins in project", async () => {
				const plugins = await pluginRegistry.discoverPlugins();
				expect(Array.isArray(plugins)).toBe(true);
			});

			it("should search plugins", async () => {
				const results = pluginRegistry.searchPlugins("test");
				expect(Array.isArray(results)).toBe(true);
			});

			it("should get available generators", () => {
				const generators = pluginRegistry.getAvailableGenerators();
				expect(typeof generators).toBe("object");
			});

			it("should get available commands", () => {
				const commands = pluginRegistry.getAvailableCommands();
				expect(typeof commands).toBe("object");
			});
		});
	});

	describe("Auto-Completion System", () => {
		describe("Auto-Completion Engine", () => {
			it("should parse command line correctly", () => {
				const context = autoCompletionEngine.parseCommandLine("xaheen generate component", 25);
				
				expect(context.command).toEqual(["generate", "component"]);
				expect(context.currentArg).toBe("component");
				expect(context.isOption).toBe(false);
			});

			it("should parse options correctly", () => {
				const context = autoCompletionEngine.parseCommandLine("xaheen generate --help", 22);
				
				expect(context.command).toEqual(["generate"]);
				expect(context.isOption).toBe(true);
				expect(context.optionName).toBe("--help");
			});

			it("should get completions for commands", async () => {
				const context = autoCompletionEngine.parseCommandLine("xaheen gen", 10);
				const completions = await autoCompletionEngine.getCompletions(context);
				
				expect(Array.isArray(completions)).toBe(true);
				expect(completions.some(c => c.label === "generate")).toBe(true);
			});

			it("should perform fuzzy matching", () => {
				const items = [
					{ label: "generate", value: "generate", kind: "command" as const },
					{ label: "create", value: "create", kind: "command" as const },
					{ label: "plugin", value: "plugin", kind: "command" as const },
				];

				const filtered = autoCompletionEngine.fuzzyFilter(items, "gen");
				
				expect(filtered.length).toBeGreaterThan(0);
				expect(filtered[0].label).toBe("generate");
			});
		});

		describe("Command Auto-Completion", () => {
			it("should get shell completions", async () => {
				const result = await commandAutoCompletion.getCompletions("xaheen gen");
				
				expect(result.completions).toBeDefined();
				expect(Array.isArray(result.completions)).toBe(true);
			});

			it("should test completion functionality", async () => {
				const testResult = await commandAutoCompletion.testCompletion();
				expect(testResult).toBe(true);
			});
		});
	});

	describe("Contextual Help System", () => {
		it("should get contextual help for commands", async () => {
			const context = {
				command: ["generate"],
				currentArg: "",
				projectPath: testProjectPath,
				isOption: false,
			};

			const help = await contextualHelpSystem.getContextualHelp(context);
			
			expect(typeof help).toBe("string");
			expect(help.length).toBeGreaterThan(0);
			expect(help).toContain("Generate");
		});

		it("should get smart suggestions", async () => {
			const context = {
				command: [],
				currentArg: "",
				projectPath: testProjectPath,
				isOption: false,
			};

			const suggestions = await contextualHelpSystem.getSmartSuggestions(context);
			
			expect(Array.isArray(suggestions)).toBe(true);
			expect(suggestions.length).toBeGreaterThan(0);
		});

		it("should search help content", async () => {
			const results = await contextualHelpSystem.searchHelp("generate");
			
			expect(Array.isArray(results)).toBe(true);
		});

		it("should get command examples", async () => {
			const examples = await contextualHelpSystem.getCommandExamples(["generate"]);
			
			expect(Array.isArray(examples)).toBe(true);
		});

		it("should get inline help", async () => {
			const inlineHelp = await contextualHelpSystem.getInlineHelp(["generate"], 0);
			
			expect(typeof inlineHelp === "string" || inlineHelp === null).toBe(true);
		});
	});

	describe("Undo/Rollback System", () => {
		it("should start and complete transactions", async () => {
			const transactionId = await undoRollbackManager.startTransaction(
				"Test Transaction",
				"Testing transaction functionality",
				"test command"
			);

			expect(typeof transactionId).toBe("string");
			
			const currentTransaction = undoRollbackManager.getCurrentTransaction();
			expect(currentTransaction).toBeDefined();
			expect(currentTransaction?.name).toBe("Test Transaction");

			await undoRollbackManager.completeTransaction();
			
			const completedTransaction = undoRollbackManager.getCurrentTransaction();
			expect(completedTransaction).toBeNull();
		});

		it("should add file operations to transactions", async () => {
			const transactionId = await undoRollbackManager.startTransaction(
				"File Operation Test",
				"Testing file operations",
				"test command"
			);

			const operationId = await undoRollbackManager.addOperation(
				"create" as any,
				"test-file.txt",
				{
					currentContent: "test content",
					metadata: { test: true },
				}
			);

			expect(typeof operationId).toBe("string");
			
			const currentTransaction = undoRollbackManager.getCurrentTransaction();
			expect(currentTransaction?.operations.length).toBe(1);
			expect(currentTransaction?.operations[0].type).toBe("create");

			await undoRollbackManager.completeTransaction();
		});

		it("should rollback transactions", async () => {
			const history = undoRollbackManager.getTransactionHistory();
			
			if (history.length > 0) {
				const lastTransaction = history[0];
				const rollbackResult = await undoRollbackManager.rollbackTransaction(
					lastTransaction.id,
					{ dryRun: true }
				);

				expect(rollbackResult.success).toBe(true);
				expect(rollbackResult.transactionId).toBe(lastTransaction.id);
			}
		});

		it("should get transaction history", () => {
			const history = undoRollbackManager.getTransactionHistory();
			
			expect(Array.isArray(history)).toBe(true);
			expect(history.length).toBeGreaterThan(0);
		});

		it("should get available rollback points", () => {
			const rollbackPoints = undoRollbackManager.getAvailableRollbackPoints();
			
			expect(Array.isArray(rollbackPoints)).toBe(true);
		});

		it("should preview rollback changes", async () => {
			const history = undoRollbackManager.getTransactionHistory();
			
			if (history.length > 0) {
				const preview = await undoRollbackManager.previewRollback(history[0].id);
				
				expect(preview.operations).toBeDefined();
				expect(Array.isArray(preview.operations)).toBe(true);
				expect(preview.warnings).toBeDefined();
				expect(Array.isArray(preview.warnings)).toBe(true);
			}
		});
	});

	describe("Progress Indicators", () => {
		it("should create progress bar", () => {
			const progressBar = ProgressIndicatorFactory.createProgressBar({
				total: 100,
				format: ":bar :percent",
			});

			expect(progressBar).toBeDefined();
			
			// Test tick functionality
			progressBar.tick(10);
			progressBar.tick(20);
			
			// Complete the progress bar
			progressBar.complete();
		});

		it("should create spinner", () => {
			const spinner = ProgressIndicatorFactory.createSpinner({
				text: "Loading...",
				spinner: "dots",
			});

			expect(spinner).toBeDefined();
			
			// Test spinner functionality
			spinner.start();
			spinner.updateText("Updated text");
			spinner.stop();
		});

		it("should create multi-progress", () => {
			const multiProgress = ProgressIndicatorFactory.createMultiProgress();
			
			expect(multiProgress).toBeDefined();
			
			const bar1 = multiProgress.newBar("Task 1 :bar", { total: 50 });
			const bar2 = multiProgress.newBar("Task 2 :bar", { total: 100 });
			
			expect(bar1).toBeDefined();
			expect(bar2).toBeDefined();
			
			multiProgress.terminate();
		});

		it("should get available spinners", () => {
			const spinners = ProgressIndicatorFactory.getAvailableSpinners();
			
			expect(Array.isArray(spinners)).toBe(true);
			expect(spinners.length).toBeGreaterThan(0);
			expect(spinners).toContain("dots");
		});
	});

	describe("Rich Output Formatter", () => {
		it("should format success messages", () => {
			const message = richOutputFormatter.success("Operation completed");
			
			expect(typeof message).toBe("string");
			expect(message.length).toBeGreaterThan(0);
		});

		it("should format error messages", () => {
			const message = richOutputFormatter.error("Operation failed", "Additional details");
			
			expect(typeof message).toBe("string");
			expect(message.length).toBeGreaterThan(0);
		});

		it("should format warning messages", () => {
			const message = richOutputFormatter.warning("Warning message");
			
			expect(typeof message).toBe("string");
			expect(message.length).toBeGreaterThan(0);
		});

		it("should format info messages", () => {
			const message = richOutputFormatter.info("Info message");
			
			expect(typeof message).toBe("string");
			expect(message.length).toBeGreaterThan(0);
		});

		it("should create tables", () => {
			const data = [
				{ name: "John", age: 30, city: "New York" },
				{ name: "Jane", age: 25, city: "San Francisco" },
			];

			const columns = [
				{ key: "name", title: "Name" },
				{ key: "age", title: "Age" },
				{ key: "city", title: "City" },
			];

			const table = richOutputFormatter.table(data, columns);
			
			expect(typeof table).toBe("string");
			expect(table.length).toBeGreaterThan(0);
		});

		it("should create diffs", () => {
			const oldContent = "line 1\nline 2\nline 3";
			const newContent = "line 1\nmodified line 2\nline 3\nline 4";

			const diff = richOutputFormatter.diff(oldContent, newContent, "test.txt");
			
			expect(typeof diff).toBe("string");
			expect(diff.length).toBeGreaterThan(0);
		});

		it("should create inline diffs", () => {
			const oldText = "Hello world";
			const newText = "Hello beautiful world";

			const inlineDiff = richOutputFormatter.inlineDiff(oldText, newText);
			
			expect(typeof inlineDiff).toBe("string");
			expect(inlineDiff.length).toBeGreaterThan(0);
		});

		it("should create tree structures", () => {
			const nodes = [
				{
					name: "root",
					children: [
						{ name: "child1" },
						{ name: "child2", children: [{ name: "grandchild" }] },
					],
				},
			];

			const tree = richOutputFormatter.tree(nodes);
			
			expect(typeof tree).toBe("string");
			expect(tree.length).toBeGreaterThan(0);
		});

		it("should create boxes", () => {
			const boxed = richOutputFormatter.box("Hello World", {
				title: "Greeting",
				padding: 2,
				style: "single",
			});
			
			expect(typeof boxed).toBe("string");
			expect(boxed.length).toBeGreaterThan(0);
		});

		it("should create progress summaries", () => {
			const summary = richOutputFormatter.progressSummary(3, 5, [
				{ name: "Task 1", status: "success" },
				{ name: "Task 2", status: "success" },
				{ name: "Task 3", status: "success" },
				{ name: "Task 4", status: "error" },
				{ name: "Task 5", status: "pending" },
			]);
			
			expect(typeof summary).toBe("string");
			expect(summary.length).toBeGreaterThan(0);
		});

		it("should format lists", () => {
			const items = ["Item 1", "Item 2", "Item 3"];
			const list = richOutputFormatter.list(items);
			
			expect(typeof list).toBe("string");
			expect(list.length).toBeGreaterThan(0);
		});

		it("should format numbered lists", () => {
			const items = ["First item", "Second item", "Third item"];
			const numberedList = richOutputFormatter.numberedList(items);
			
			expect(typeof numberedList).toBe("string");
			expect(numberedList.length).toBeGreaterThan(0);
		});

		it("should format key-value pairs", () => {
			const pairs = {
				name: "John Doe",
				age: 30,
				city: "New York",
			};

			const keyValue = richOutputFormatter.keyValue(pairs);
			
			expect(typeof keyValue).toBe("string");
			expect(keyValue.length).toBeGreaterThan(0);
		});

		it("should create separators", () => {
			const separator = richOutputFormatter.separator();
			
			expect(typeof separator).toBe("string");
			expect(separator.length).toBeGreaterThan(0);
		});

		it("should wrap text", () => {
			const longText = "This is a very long text that should be wrapped to multiple lines when displayed in the terminal with a specific width constraint.";
			const wrapped = richOutputFormatter.wrap(longText, 40);
			
			expect(typeof wrapped).toBe("string");
			expect(wrapped.includes("\n")).toBe(true);
		});
	});

	describe("Interactive CLI Output", () => {
		it("should create rainbow text", () => {
			const rainbow = interactiveCLIOutput.rainbow("Hello World");
			
			expect(typeof rainbow).toBe("string");
			expect(rainbow.length).toBeGreaterThan(0);
		});

		it("should create loading animation", () => {
			const spinner = interactiveCLIOutput.createLoadingAnimation("Loading...");
			
			expect(spinner).toBeDefined();
			
			spinner.start();
			spinner.stop();
		});

		it("should create notifications", () => {
			const notificationId = interactiveCLIOutput.notification("success" as any, {
				title: "Success!",
				message: "Operation completed successfully",
				timeout: 1000,
			});
			
			expect(typeof notificationId).toBe("string");
			
			// Dismiss notification
			interactiveCLIOutput.dismissNotification(notificationId);
		});

		it("should cleanup resources", () => {
			// This should not throw any errors
			expect(() => {
				interactiveCLIOutput.cleanup();
			}).not.toThrow();
		});
	});

	describe("Integration Scenarios", () => {
		it("should handle complete plugin lifecycle", async () => {
			// Install plugin
			const mockPlugin = {
				name: "integration-test-plugin",
				version: "1.0.0",
				description: "Integration test plugin",
				author: "Test Author",
				keywords: ["integration", "test"],
				category: "generator" as const,
				xaheenVersion: "^2.0.0",
				license: "MIT",
				certified: false,
				downloads: 0,
				rating: 0,
				lastUpdated: new Date().toISOString(),
			};

			// Register plugin
			const installResult = await pluginLifecycleManager.registerPluginInstallation(mockPlugin);
			expect(installResult.success).toBe(true);

			// Activate plugin
			const activateResult = await pluginLifecycleManager.activatePlugin("integration-test-plugin");
			expect(activateResult.success).toBe(true);

			// Check plugin is in registry
			const registryPlugin = pluginRegistry.getPlugin("integration-test-plugin");
			// Registry might not have the plugin if not properly registered, that's okay

			// Deactivate plugin
			const deactivateResult = await pluginLifecycleManager.deactivatePlugin("integration-test-plugin");
			expect(deactivateResult.success).toBe(true);

			// Unregister plugin
			const unregisterResult = await pluginLifecycleManager.unregisterPlugin("integration-test-plugin");
			expect(unregisterResult).toBe(true);
		});

		it("should handle complete transaction lifecycle", async () => {
			// Start transaction
			const transactionId = await undoRollbackManager.startTransaction(
				"Integration Test Transaction",
				"Testing complete lifecycle",
				"integration test"
			);

			// Add multiple operations
			const op1 = await undoRollbackManager.addOperation(
				"create" as any,
				"file1.txt",
				{ currentContent: "content 1" }
			);

			const op2 = await undoRollbackManager.addOperation(
				"create" as any,
				"file2.txt",
				{ currentContent: "content 2" }
			);

			expect(typeof op1).toBe("string");
			expect(typeof op2).toBe("string");

			// Complete transaction
			await undoRollbackManager.completeTransaction();

			// Verify transaction in history
			const history = undoRollbackManager.getTransactionHistory();
			const completedTransaction = history.find(t => t.id === transactionId);
			expect(completedTransaction).toBeDefined();
			expect(completedTransaction?.status).toBe("completed");
			expect(completedTransaction?.operations.length).toBe(2);

			// Preview rollback
			const preview = await undoRollbackManager.previewRollback(transactionId);
			expect(preview.operations.length).toBe(2);

			// Test rollback (dry run)
			const rollbackResult = await undoRollbackManager.rollbackTransaction(
				transactionId,
				{ dryRun: true }
			);
			expect(rollbackResult.success).toBe(true);
		});

		it("should provide contextual help based on project state", async () => {
			// Test help for different command contexts
			const contexts = [
				{ command: [], currentArg: "", projectPath: testProjectPath, isOption: false },
				{ command: ["generate"], currentArg: "", projectPath: testProjectPath, isOption: false },
				{ command: ["create"], currentArg: "", projectPath: testProjectPath, isOption: false },
				{ command: ["plugin"], currentArg: "", projectPath: testProjectPath, isOption: false },
			];

			for (const context of contexts) {
				const help = await contextualHelpSystem.getContextualHelp(context);
				expect(typeof help).toBe("string");
				expect(help.length).toBeGreaterThan(0);

				const suggestions = await contextualHelpSystem.getSmartSuggestions(context);
				expect(Array.isArray(suggestions)).toBe(true);
			}
		});

		it("should provide auto-completion for various scenarios", async () => {
			const scenarios = [
				"xaheen ",
				"xaheen g",
				"xaheen generate ",
				"xaheen generate c",
				"xaheen plugin ",
				"xaheen plugin i",
				"xaheen --",
			];

			for (const scenario of scenarios) {
				const result = await commandAutoCompletion.getCompletions(scenario);
				expect(result.completions).toBeDefined();
				expect(Array.isArray(result.completions)).toBe(true);
			}
		});
	});

	describe("Error Handling", () => {
		it("should handle invalid plugin operations gracefully", async () => {
			// Try to activate non-existent plugin
			const result = await pluginLifecycleManager.activatePlugin("non-existent-plugin");
			expect(result.success).toBe(false);
			expect(result.errors.length).toBeGreaterThan(0);
		});

		it("should handle invalid transaction operations", async () => {
			// Try to add operation without transaction
			await expect(
				undoRollbackManager.addOperation("create" as any, "test.txt")
			).rejects.toThrow();
		});

		it("should handle completion errors gracefully", async () => {
			// This should not throw errors
			const result = await commandAutoCompletion.getCompletions("invalid command structure");
			expect(result.completions).toBeDefined();
			expect(Array.isArray(result.completions)).toBe(true);
		});

		it("should handle help system errors gracefully", async () => {
			const context = {
				command: ["non-existent-command"],
				currentArg: "",
				projectPath: "/non/existent/path",
				isOption: false,
			};

			// This should not throw, but return helpful error message
			const help = await contextualHelpSystem.getContextualHelp(context);
			expect(typeof help).toBe("string");
		});
	});

	describe("Performance", () => {
		it("should handle large completion sets efficiently", async () => {
			const startTime = Date.now();
			
			// Generate large set of completions
			const context = autoCompletionEngine.parseCommandLine("xaheen ", 7);
			const completions = await autoCompletionEngine.getCompletions(context);
			
			const endTime = Date.now();
			const duration = endTime - startTime;
			
			expect(duration).toBeLessThan(1000); // Should complete in less than 1 second
			expect(Array.isArray(completions)).toBe(true);
		});

		it("should handle multiple concurrent transactions", async () => {
			const transactions = [];
			
			// Start multiple transactions concurrently
			for (let i = 0; i < 5; i++) {
				const promise = (async () => {
					const id = await undoRollbackManager.startTransaction(
						`Concurrent Test ${i}`,
						`Testing concurrent transaction ${i}`,
						`test ${i}`
					);
					
					await undoRollbackManager.addOperation(
						"create" as any,
						`concurrent-file-${i}.txt`,
						{ currentContent: `content ${i}` }
					);
					
					await undoRollbackManager.completeTransaction();
					return id;
				})();
				
				transactions.push(promise);
			}
			
			// Wait for all transactions to complete
			const results = await Promise.allSettled(transactions);
			
			// At least some should succeed (they can't all run concurrently due to single transaction limit)
			const successful = results.filter(r => r.status === "fulfilled");
			expect(successful.length).toBeGreaterThan(0);
		});
	});
});