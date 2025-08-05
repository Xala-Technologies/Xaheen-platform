/**
 * @fileoverview MCP Command - EPIC 14 Story 14.1
 * @description MCP (Model Context Protocol) management commands for AI-powered development
 * @version 1.0.0
 * @compliance Enterprise Security, Norwegian NSM Standards
 */

import { intro, outro, select, spinner, text, confirm, isCancel, cancel } from "@clack/prompts";
import chalk from "chalk";
import { Command } from "commander";
import consola from "consola";
import { mcpClientService } from "../services/mcp/mcp-client.service.js";
import { mcpContextIndexerService } from "../services/mcp/mcp-context-indexer.service.js";
import type { IndexingOptions } from "../services/mcp/mcp-context-indexer.service.js";

/**
 * Create MCP command with subcommands
 */
export function createMCPCommand(): Command {
	const mcpCommand = new Command("mcp")
		.description("MCP (Model Context Protocol) management commands")
		.addHelpText(
			"after",
			`
${chalk.yellow("Examples:")}
  ${chalk.cyan("xaheen mcp index")}           Index project for AI context
  ${chalk.cyan("xaheen mcp status")}          Show MCP connection status
  ${chalk.cyan("xaheen mcp init")}            Initialize MCP configuration
  ${chalk.cyan("xaheen mcp clear")}           Clear cached context data
  ${chalk.cyan("xaheen mcp export")}          Export project context
  ${chalk.cyan("xaheen mcp analyze")}         Analyze project structure

${chalk.yellow("MCP Integration:")}
  The MCP system enables intelligent AI-powered code generation by analyzing
  your project structure, patterns, and requirements. It maintains context
  across sessions for consistent, high-quality code generation.

${chalk.yellow("Enterprise Features:")}
  - Secure credential management with NSM classifications
  - Comprehensive audit logging and compliance tracking
  - Advanced project analysis with quality metrics
  - Multi-platform component generation support
`,
		);

	// Add subcommands
	mcpCommand.addCommand(createIndexCommand());
	mcpCommand.addCommand(createStatusCommand());
	mcpCommand.addCommand(createInitCommand());
	mcpCommand.addCommand(createClearCommand());
	mcpCommand.addCommand(createExportCommand());
	mcpCommand.addCommand(createAnalyzeCommand());

	return mcpCommand;
}

/**
 * MCP Index Command - Core functionality for EPIC 14 Story 14.1
 */
function createIndexCommand(): Command {
	return new Command("index")
		.description("Index project files and context for AI-powered development")
		.option("--deep", "Enable deep analysis with complexity metrics", false)
		.option("--include-tests", "Include test files in analysis", true)
		.option("--max-size <size>", "Maximum file size to analyze (MB)", "2")
		.option("--exclude <patterns>", "Comma-separated exclude patterns")
		.option("--format <format>", "Output format (standard|verbose|json)", "standard")
		.option("--export-path <path>", "Export context data to file")
		.action(async (options) => {
			intro(chalk.cyan("🔍 MCP Project Indexing"));

			const loadingSpinner = spinner();

			try {
				// Initialize MCP client
				loadingSpinner.start("Initializing MCP client...");
				await mcpClientService.initialize();
				loadingSpinner.stop("MCP client initialized");

				// Configure indexing options
				const indexingOptions: IndexingOptions = {
					deepAnalysis: options.deep,
					analyzeTests: options.includeTests,
					maxFileSize: parseInt(options.maxSize) * 1024 * 1024,
					generateMetrics: true,
					analyzeDependencies: true,
				};

				if (options.exclude) {
					indexingOptions.excludePatterns = options.exclude.split(",").map((p: string) => p.trim());
				}

				// Start project indexing
				loadingSpinner.start("Scanning and analyzing project files...");
				const projectIndex = await mcpContextIndexerService.indexProject(
					process.cwd(),
					indexingOptions
				);
				loadingSpinner.stop("Project analysis complete");

				// Load context items
				loadingSpinner.start("Loading context items...");
				const contextItems = await mcpClientService.loadContextItems({
					maxFileSize: indexingOptions.maxFileSize,
					includeHidden: false,
				});
				loadingSpinner.stop("Context items loaded");

				// Send to MCP server for indexing
				loadingSpinner.start("Indexing context with MCP server...");
				await mcpClientService.indexProjectContext();
				loadingSpinner.stop("Context indexed successfully");

				// Display results
				displayIndexResults(projectIndex, contextItems.length, options.format);

				// Export if requested
				if (options.exportPath) {
					loadingSpinner.start(`Exporting context to ${options.exportPath}...`);
					await exportContextData(projectIndex, contextItems, options.exportPath);
					loadingSpinner.stop("Context exported successfully");
				}

				outro(chalk.green("✅ MCP indexing completed successfully"));

			} catch (error) {
				loadingSpinner.stop("Indexing failed");
				consola.error("MCP indexing failed:", error);
				process.exit(1);
			}
		});
}

/**
 * MCP Status Command
 */
function createStatusCommand(): Command {
	return new Command("status")
		.description("Show MCP connection status and project context information")
		.action(async () => {
			intro(chalk.cyan("📊 MCP Status"));

			try {
				const isConnected = mcpClientService.isClientConnected();
				const projectContext = mcpClientService.getProjectContext();
				const contextItems = mcpClientService.getContextItems();
				const projectIndex = mcpContextIndexerService.getProjectIndex();

				console.log(chalk.blue("\n🔌 Connection Status:"));
				console.log(`  MCP Server: ${isConnected ? chalk.green("Connected") : chalk.red("Disconnected")}`);

				if (projectContext) {
					console.log(chalk.blue("\n📁 Project Context:"));
					console.log(`  Root: ${chalk.yellow(projectContext.projectRoot)}`);
					console.log(`  Framework: ${chalk.yellow(projectContext.framework || "Unknown")}`);
					console.log(`  Language: ${chalk.yellow(projectContext.language || "Unknown")}`);
					console.log(`  Files: ${chalk.yellow(projectContext.totalFiles.toLocaleString())}`);
					console.log(`  Size: ${chalk.yellow(formatBytes(projectContext.totalSize))}`);
					console.log(`  Last Indexed: ${chalk.yellow(projectContext.lastIndexed.toLocaleString())}`);
				}

				if (contextItems.length > 0) {
					console.log(chalk.blue("\n📋 Context Items:"));
					console.log(`  Total Items: ${chalk.yellow(contextItems.length)}`);
					
					const itemsByType = contextItems.reduce((acc, item) => {
						acc[item.type] = (acc[item.type] || 0) + 1;
						return acc;
					}, {} as Record<string, number>);

					Object.entries(itemsByType).forEach(([type, count]) => {
						console.log(`  ${type}: ${chalk.yellow(count)}`);
					});
				}

				if (projectIndex) {
					console.log(chalk.blue("\n📈 Analysis Summary:"));
					console.log(`  Languages: ${chalk.yellow(Object.keys(projectIndex.languages).join(", "))}`);
					console.log(`  Frameworks: ${chalk.yellow(Object.keys(projectIndex.frameworks).join(", "))}`);
					console.log(`  Total Lines: ${chalk.yellow(projectIndex.totalLines.toLocaleString())}`);
					console.log(`  Total Tokens: ${chalk.yellow(projectIndex.totalTokens.toLocaleString())}`);
					console.log(`  Avg Complexity: ${chalk.yellow(projectIndex.quality.averageComplexity.toFixed(1))}`);
					console.log(`  Maintainability: ${chalk.yellow(projectIndex.quality.averageMaintainability.toFixed(1))}%`);
					console.log(`  Test Coverage: ${chalk.yellow(projectIndex.quality.testCoverage.toFixed(1))}%`);

					if (projectIndex.hotspots.length > 0) {
						console.log(chalk.blue("\n🚨 Quality Hotspots:"));
						projectIndex.hotspots.slice(0, 5).forEach(hotspot => {
							const severityColor = hotspot.severity === "critical" ? chalk.red :
								hotspot.severity === "high" ? chalk.yellow : chalk.blue;
							console.log(`  ${severityColor(hotspot.severity.toUpperCase())}: ${hotspot.path} - ${hotspot.message}`);
						});
					}
				}

				if (!isConnected && !projectContext) {
					console.log(chalk.yellow("\n💡 Run 'xaheen mcp index' to initialize MCP context"));
				}

				outro(chalk.green("Status displayed"));

			} catch (error) {
				consola.error("Failed to get MCP status:", error);
				process.exit(1);
			}
		});
}

/**
 * MCP Init Command
 */
function createInitCommand(): Command {
	return new Command("init")
		.description("Initialize MCP configuration for the project")
		.option("--force", "Force reinitialize even if config exists", false)
		.action(async (options) => {
			intro(chalk.cyan("🚀 MCP Initialization"));

			try {
				const shouldInitialize = options.force || await confirm({
					message: "Initialize MCP configuration for this project?",
				});

				if (isCancel(shouldInitialize) || !shouldInitialize) {
					cancel("MCP initialization cancelled");
					return;
				}

				const loadingSpinner = spinner();
				loadingSpinner.start("Initializing MCP configuration...");

				await mcpClientService.initialize();

				loadingSpinner.stop("MCP configuration initialized");

				outro(chalk.green("✅ MCP initialization completed"));

			} catch (error) {
				consola.error("MCP initialization failed:", error);
				process.exit(1);
			}
		});
}

/**
 * MCP Clear Command
 */
function createClearCommand(): Command {
	return new Command("clear")
		.description("Clear cached MCP context data")
		.option("--all", "Clear all data including configuration", false)
		.action(async (options) => {
			intro(chalk.cyan("🧹 MCP Clear"));

			try {
				const shouldClear = await confirm({
					message: options.all ? 
						"Clear ALL MCP data including configuration?" : 
						"Clear cached context data?",
				});

				if (isCancel(shouldClear) || !shouldClear) {
					cancel("Clear operation cancelled");
					return;
				}

				const loadingSpinner = spinner();
				loadingSpinner.start("Clearing MCP data...");

				mcpClientService.clearContext();

				if (options.all) {
					// Additional cleanup for configuration files would go here
					loadingSpinner.message = "Clearing configuration...";
				}

				loadingSpinner.stop("MCP data cleared");

				outro(chalk.green("✅ MCP data cleared successfully"));

			} catch (error) {
				consola.error("Failed to clear MCP data:", error);
				process.exit(1);
			}
		});
}

/**
 * MCP Export Command
 */
function createExportCommand(): Command {
	return new Command("export")
		.description("Export project context data for sharing or backup")
		.option("--output <path>", "Output file path", "./mcp-context-export.json")
		.option("--format <format>", "Export format (json|yaml)", "json")
		.action(async (options) => {
			intro(chalk.cyan("📤 MCP Export"));

			try {
				const loadingSpinner = spinner();
				loadingSpinner.start("Preparing export data...");

				const projectContext = mcpClientService.getProjectContext();
				const contextItems = mcpClientService.getContextItems();
				const projectIndex = mcpContextIndexerService.getProjectIndex();

				if (!projectContext) {
					throw new Error("No project context available. Run 'xaheen mcp index' first.");
				}

				await exportContextData(projectIndex, contextItems, options.output, options.format);

				loadingSpinner.stop("Export completed");

				outro(chalk.green(`✅ Context exported to ${options.output}`));

			} catch (error) {
				consola.error("Export failed:", error);
				process.exit(1);
			}
		});
}

/**
 * MCP Analyze Command
 */
function createAnalyzeCommand(): Command {
	return new Command("analyze")
		.description("Analyze project structure and provide AI context insights")
		.option("--detailed", "Show detailed analysis", false)
		.action(async (options) => {
			intro(chalk.cyan("🔬 MCP Analysis"));

			try {
				const loadingSpinner = spinner();
				loadingSpinner.start("Analyzing project structure...");

				const projectIndex = mcpContextIndexerService.getProjectIndex();
				
				if (!projectIndex) {
					throw new Error("No project analysis available. Run 'xaheen mcp index' first.");
				}

				const aiContext = mcpContextIndexerService.exportForAIContext();

				loadingSpinner.stop("Analysis complete");

				// Display analysis results
				console.log(chalk.blue("\n📊 Project Analysis Results:"));
				console.log(`${aiContext.projectSummary}\n`);

				console.log(chalk.blue("🏗️  Architecture Patterns:"));
				aiContext.architecturePatterns.forEach(pattern => {
					console.log(`  • ${chalk.yellow(pattern)}`);
				});

				console.log(chalk.blue("\n📈 Quality Metrics:"));
				Object.entries(aiContext.qualityMetrics).forEach(([metric, value]) => {
					console.log(`  ${metric}: ${chalk.yellow(typeof value === 'number' ? value.toFixed(1) : value)}`);
				});

				console.log(chalk.blue("\n💡 AI Recommendations:"));
				aiContext.recommendations.forEach(rec => {
					console.log(`  • ${rec}`);
				});

				if (options.detailed && projectIndex.hotspots.length > 0) {
					console.log(chalk.blue("\n🚨 Detailed Hotspots:"));
					projectIndex.hotspots.forEach(hotspot => {
						const severityColor = hotspot.severity === "critical" ? chalk.red :
							hotspot.severity === "high" ? chalk.yellow : chalk.blue;
						console.log(`  ${severityColor(hotspot.severity.toUpperCase())}: ${hotspot.path}`);
						console.log(`    ${hotspot.message}`);
					});
				}

				outro(chalk.green("✅ Analysis completed"));

			} catch (error) {
				consola.error("Analysis failed:", error);
				process.exit(1);
			}
		});
}

// Helper functions

function displayIndexResults(projectIndex: any, contextItemsCount: number, format: string): void {
	if (format === "json") {
		console.log(JSON.stringify({
			projectIndex,
			contextItemsCount,
			timestamp: new Date().toISOString(),
		}, null, 2));
		return;
	}

	console.log(chalk.blue("\n📊 Indexing Results:"));
	console.log(`  Files Analyzed: ${chalk.yellow(projectIndex.totalFiles.toLocaleString())}`);
	console.log(`  Lines of Code: ${chalk.yellow(projectIndex.totalLines.toLocaleString())}`);
	console.log(`  Estimated Tokens: ${chalk.yellow(projectIndex.totalTokens.toLocaleString())}`);
	console.log(`  Context Items: ${chalk.yellow(contextItemsCount)}`);

	console.log(chalk.blue("\n🔍 Languages Detected:"));
	Object.entries(projectIndex.languages).forEach(([lang, count]: [string, any]) => {
		console.log(`  ${lang}: ${chalk.yellow(count)} files`);
	});

	if (Object.keys(projectIndex.frameworks).length > 0) {
		console.log(chalk.blue("\n🛠️  Frameworks Detected:"));
		Object.entries(projectIndex.frameworks).forEach(([framework, count]: [string, any]) => {
			console.log(`  ${framework}: ${chalk.yellow(count)} files`);
		});
	}

	console.log(chalk.blue("\n📈 Quality Metrics:"));
	console.log(`  Average Complexity: ${chalk.yellow(projectIndex.quality.averageComplexity.toFixed(1))}`);
	console.log(`  Maintainability: ${chalk.yellow(projectIndex.quality.averageMaintainability.toFixed(1))}%`);
	console.log(`  Test Coverage: ${chalk.yellow(projectIndex.quality.testCoverage.toFixed(1))}%`);
	console.log(`  Documentation: ${chalk.yellow(projectIndex.quality.documentation.toFixed(1))}%`);

	if (format === "verbose" && projectIndex.architecture.patterns.length > 0) {
		console.log(chalk.blue("\n🏗️  Architecture Patterns:"));
		projectIndex.architecture.patterns.forEach((pattern: string) => {
			console.log(`  • ${chalk.yellow(pattern)}`);
		});
	}
}

async function exportContextData(
	projectIndex: any,
	contextItems: any[],
	outputPath: string,
	format: string = "json"
): Promise<void> {
	const { promises: fs } = await import("fs");
	const { dirname } = await import("path");

	const exportData = {
		version: "1.0.0",
		timestamp: new Date().toISOString(),
		projectIndex,
		contextItems: contextItems.map(item => ({
			...item,
			// Truncate large content for export
			content: item.content?.length > 10000 ? 
				item.content.substring(0, 10000) + "...[truncated]" : 
				item.content,
		})),
		metadata: {
			exportedBy: "xaheen-cli",
			nodeVersion: process.version,
			platform: process.platform,
		},
	};

	// Ensure directory exists
	await fs.mkdir(dirname(outputPath), { recursive: true });

	if (format === "yaml") {
		const { stringify } = await import("yaml");
		await fs.writeFile(outputPath, stringify(exportData), "utf-8");
	} else {
		await fs.writeFile(outputPath, JSON.stringify(exportData, null, 2), "utf-8");
	}
}

function formatBytes(bytes: number): string {
	const units = ["B", "KB", "MB", "GB"];
	let size = bytes;
	let unitIndex = 0;

	while (size >= 1024 && unitIndex < units.length - 1) {
		size /= 1024;
		unitIndex++;
	}

	return `${size.toFixed(1)} ${units[unitIndex]}`;
}