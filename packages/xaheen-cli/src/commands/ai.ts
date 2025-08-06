/**
 * @fileoverview AI-powered code generation and modification commands using Codebuff
 * @version 1.0.0
 * @author Xala Technologies
 */

import chalk from "chalk";
import { execSync, spawn } from "child_process";
import { Command } from "commander";
import inquirer from "inquirer";
import type { AIRefactoringOptions } from "../generators/ai/refactoring.generator";
import { AIRefactoringGenerator } from "../generators/ai/refactoring.generator";
import {
	applyPatch,
	createCodebuffIndex,
	diffPreview,
	getCurrentBranch,
	hasUncommittedChanges,
	validateGitRepository,
} from "../lib/patch-utils";
import { mcpGenerationOrchestrator } from "../services/mcp/mcp-generation-orchestrator";

export interface AICommandOptions {
	readonly model?: string;
	readonly dryRun?: boolean;
	readonly autoCommit?: boolean;
	readonly interactive?: boolean;
	readonly index?: boolean;
}

/**
 * Runs Codebuff CLI and returns the generated patch
 */
export async function runCodebuffCLI(
	cwd: string,
	prompt: string,
	options: { model?: string; verbose?: boolean } = {},
): Promise<string> {
	return new Promise((resolve, reject) => {
		const args = [cwd, prompt];

		// Add model option if specified
		if (options.model) {
			process.env.OPENAI_MODEL = options.model;
		}

		const codebuffProcess = spawn("codebuff", args, {
			cwd,
			stdio: ["pipe", "pipe", "pipe"],
			env: { ...process.env },
		});

		let output = "";
		let errorOutput = "";

		codebuffProcess.stdout?.on("data", (data) => {
			output += data.toString();
		});

		codebuffProcess.stderr?.on("data", (data) => {
			errorOutput += data.toString();
		});

		codebuffProcess.on("close", (code) => {
			if (code === 0) {
				// Extract patch from output - Codebuff typically outputs the patch
				resolve(output);
			} else {
				reject(new Error(`Codebuff failed with code ${code}: ${errorOutput}`));
			}
		});

		codebuffProcess.on("error", (error) => {
			reject(new Error(`Failed to start Codebuff: ${error.message}`));
		});
	});
}


/**
 * Main AI command using Codebuff for context-aware code generation
 */
export async function codebuffCommand(
	prompt: string,
	options: AICommandOptions = {},
): Promise<void> {
	const cwd = process.cwd();
	const {
		model = "gpt-4",
		dryRun = false,
		autoCommit = true,
		interactive = true,
		index = false,
	} = options;

	console.log(chalk.blue("🤖 Xaheen AI - Context-Aware Code Generation\n"));

	// Validate Git repository
	if (!validateGitRepository(cwd)) {
		console.error(
			chalk.red(
				"❌ Error: Not a Git repository. Please run this command in a Git repository.",
			),
		);
		process.exit(1);
	}

	// Check for uncommitted changes
	if (hasUncommittedChanges(cwd) && autoCommit) {
		const { proceed } = await inquirer.prompt([
			{
				type: "confirm",
				name: "proceed",
				message: "You have uncommitted changes. Continue anyway?",
				default: false,
			},
		]);

		if (!proceed) {
			console.log(chalk.yellow("Operation cancelled."));
			return;
		}
	}

	// Create or update Codebuff index if requested
	if (index) {
		const indexSuccess = await createCodebuffIndex(cwd);
		if (!indexSuccess) {
			console.error(
				chalk.red(
					"❌ Failed to create Codebuff index. Continuing without index...",
				),
			);
		}
	}

	try {
		console.log(
			chalk.blue(`🔍 Analyzing codebase and generating patch for: "${prompt}"`),
		);
		console.log(chalk.gray(`📍 Branch: ${getCurrentBranch(cwd)}`));
		console.log(chalk.gray(`🤖 Model: ${model}\n`));

		// Generate patch using Codebuff CLI
		const patch = await runCodebuffCLI(cwd, prompt, { model, verbose: true });

		if (!patch || patch.trim().length === 0) {
			console.log(
				chalk.yellow(
					"⚠️ No changes generated. The request might not require code modifications.",
				),
			);
			return;
		}

		// Show interactive diff preview
		let accepted = true;
		if (interactive) {
			accepted = await diffPreview(patch, { cwd, dryRun });
		}

		if (!accepted) {
			console.log(chalk.yellow("🚫 Changes cancelled by user."));
			return;
		}

		if (dryRun) {
			console.log(chalk.blue("🔍 Dry run completed - no changes applied."));
			return;
		}

		// Apply the patch
		const result = await applyPatch(patch, {
			cwd,
			autoCommit,
			commitMessage: `AI: ${prompt}`,
		});

		if (result.success) {
			console.log(chalk.green("\n✅ Codebuff changes applied successfully!"));
			console.log(
				chalk.blue(`📁 Files changed: ${result.filesChanged.length}`),
			);
			console.log(chalk.green(`➕ Lines added: ${result.linesAdded}`));
			console.log(chalk.red(`➖ Lines removed: ${result.linesRemoved}`));

			if (result.filesChanged.length > 0) {
				console.log(chalk.gray("\n📄 Modified files:"));
				result.filesChanged.forEach((file) => {
					console.log(chalk.gray(`  • ${file}`));
				});
			}
		} else {
			console.error(chalk.red("\n❌ Failed to apply changes:"));
			console.error(chalk.red(result.error || "Unknown error"));
			process.exit(1);
		}
	} catch (error) {
		console.error(chalk.red("\n❌ Error running Codebuff:"));
		console.error(
			chalk.red(error instanceof Error ? error.message : String(error)),
		);
		process.exit(1);
	}
}

/**
 * AI command to fix failing tests
 */
export async function fixTestsCommand(
	options: AICommandOptions = {},
): Promise<void> {
	console.log(chalk.blue("🧪 AI Test Fixer\n"));

	// Run tests to identify failures
	try {
		const { execSync } = await import("child_process");
		console.log(chalk.blue("🔍 Running tests to identify failures..."));

		execSync("npm test", {
			cwd: process.cwd(),
			stdio: "inherit",
		});

		console.log(chalk.green("✅ All tests are already passing!"));
		return;
	} catch (error) {
		console.log(
			chalk.yellow("⚠️ Tests are failing. Attempting AI-powered fixes...\n"),
		);

		await codebuffCommand(
			"Fix the failing tests. Analyze the test output and make the necessary code changes to make all tests pass.",
			{
				...options,
				autoCommit: true,
			},
		);
	}
}

/**
 * AI command for Norwegian compliance enhancements
 */
export async function norwegianComplianceCommand(
	prompt: string,
	options: AICommandOptions = {},
): Promise<void> {
	const enhancedPrompt = `${prompt}

Please ensure the implementation follows Norwegian compliance requirements:
- GDPR compliance for data handling
- NSM (Norwegian National Security Authority) standards
- BankID integration patterns where applicable
- Norwegian language support (Bokmål)
- Accessibility compliance (WCAG 2.2 AAA)
- PCI DSS compliance for payment processing
- Proper error handling and logging for audit trails`;

	await codebuffCommand(enhancedPrompt, options);
}

/**
 * AI refactoring command to generate refactoring assistants
 */
export async function generateRefactoringAssistantCommand(
	name: string,
	framework: string,
	outputPath: string,
	options: {
		providers?: string[];
		features?: string[];
		includeUI?: boolean;
		includeGit?: boolean;
		includeTests?: boolean;
		includeCLI?: boolean;
	} = {},
): Promise<void> {
	console.log(chalk.blue("🤖 Generating AI Refactoring Assistant\n"));

	try {
		const generator = new AIRefactoringGenerator();

		const refactoringOptions: AIRefactoringOptions = {
			name: name,
			framework: framework as any,
			aiProviders: (options.providers as any) || ["openai", "anthropic"],
			outputPath: outputPath,
			features: (options.features as any) || [
				"extract-function",
				"rename-variable",
				"simplify-condition",
				"remove-duplication",
				"optimize-imports",
				"modernize-syntax",
			],
			includeInteractiveUI: options.includeUI ?? true,
			includeGitIntegration: options.includeGit ?? true,
			includeTests: options.includeTests ?? true,
			includeCLI: options.includeCLI ?? true,
			confidenceThreshold: 0.7,
			maxSuggestionsPerFile: 10,
		};

		await generator.generate(refactoringOptions);

		console.log(
			chalk.green("\n✅ AI Refactoring Assistant generated successfully!"),
		);
		console.log(chalk.blue(`📁 Generated at: ${outputPath}`));
		console.log(chalk.yellow(`🎯 Framework: ${framework}`));
		console.log(
			chalk.yellow(
				`🤖 AI Providers: ${refactoringOptions.aiProviders.join(", ")}`,
			),
		);
		console.log(
			chalk.yellow(`⚡ Features: ${refactoringOptions.features.join(", ")}`),
		);

		console.log(chalk.cyan("\n📋 Next steps:"));
		console.log(chalk.gray("  1. Install dependencies: npm install"));
		console.log(
			chalk.gray(
				"  2. Configure AI provider API keys in environment variables",
			),
		);
		console.log(
			chalk.gray("  3. Run the CLI: npx your-refactor-cli analyze <files>"),
		);
		console.log(chalk.gray("  4. Start refactoring with interactive mode"));
	} catch (error) {
		console.error(chalk.red("\n❌ Error generating AI Refactoring Assistant:"));
		console.error(
			chalk.red(error instanceof Error ? error.message : String(error)),
		);
		process.exit(1);
	}
}

/**
 * MCP-enhanced component generation command
 */
async function mcpEnhancedComponentCommand(
	name: string,
	options: {
		framework?: string;
		description?: string;
		tests?: boolean;
		stories?: boolean;
		model?: string;
		dryRun?: boolean;
	}
): Promise<void> {
	console.log(chalk.blue("🎨 MCP-Enhanced Component Generation\n"));

	try {
		// Initialize MCP orchestrator
		await mcpGenerationOrchestrator.initialize();

		// Create MCP generation request
		const mcpRequest = {
			type: "component" as const,
			name,
			description: options.description || `Generate ${name} component with best practices`,
			options: {
				framework: options.framework || "react",
				styling: "tailwind",
				hooks: true,
				stories: options.stories !== false,
				tests: options.tests !== false,
				typescript: true,
			},
			platform: (options.framework as any) || "react",
			aiEnhancement: !!options.description,
		};

		// Generate component with MCP intelligence
		const result = await mcpGenerationOrchestrator.generateComponent(mcpRequest);

		if (result.success) {
			console.log(chalk.green("\n✅ MCP-enhanced component generated successfully!"));
			console.log(chalk.blue(`📁 Files generated: ${result.files.length}`));
			console.log(chalk.yellow(`⏱️ Generation time: ${result.mcpMetadata.generationTime}ms`));
			console.log(chalk.yellow(`🤖 AI enhanced: ${result.mcpMetadata.aiEnhanced ? 'Yes' : 'No'}`));
			console.log(chalk.yellow(`🎯 Confidence: ${Math.round(result.mcpMetadata.confidence * 100)}%`));

			if (result.files.length > 0) {
				console.log(chalk.gray("\n📄 Generated files:"));
				result.files.forEach((file) => {
					console.log(chalk.gray(`  • ${file}`));
				});
			}

			if (result.recommendations && result.recommendations.length > 0) {
				console.log(chalk.cyan("\n💡 Recommendations:"));
				result.recommendations.forEach((rec) => {
					console.log(chalk.gray(`  • ${rec}`));
				});
			}

			if (result.nextSteps && result.nextSteps.length > 0) {
				console.log(chalk.cyan("\n📋 Next steps:"));
				result.nextSteps.forEach((step) => {
					console.log(chalk.gray(`  • ${step}`));
				});
			}
		} else {
			console.error(chalk.red(`\n❌ Component generation failed: ${result.message}`));
			process.exit(1);
		}
	} catch (error) {
		console.error(chalk.red("\n❌ Error generating MCP-enhanced component:"));
		console.error(chalk.red(error instanceof Error ? error.message : String(error)));
		process.exit(1);
	}
}

/**
 * MCP-enhanced service generation command
 */
async function mcpEnhancedServiceCommand(
	name: string,
	options: {
		description?: string;
		features?: string[];
		model?: string;
		dryRun?: boolean;
	}
): Promise<void> {
	console.log(chalk.blue("⚙️ MCP-Enhanced Service Generation\n"));

	try {
		// Initialize MCP orchestrator
		await mcpGenerationOrchestrator.initialize();

		// Create MCP generation request
		const mcpRequest = {
			type: "service" as const,
			name,
			description: options.description || `Generate ${name} service with enterprise-grade architecture`,
			options: {
				framework: "express",
				features: [
					"dependency-injection",
					"error-handling",
					"logging",
					"validation",
					"caching",
					...(options.features || []),
				],
				typescript: true,
				testing: true,
			},
			platform: "react" as const,
			aiEnhancement: !!options.description,
		};

		// Generate service with MCP intelligence
		const result = await mcpGenerationOrchestrator.generateService(mcpRequest);

		if (result.success) {
			console.log(chalk.green("\n✅ MCP-enhanced service generated successfully!"));
			console.log(chalk.blue(`📁 Files generated: ${result.files.length}`));
			console.log(chalk.yellow(`⏱️ Generation time: ${result.mcpMetadata.generationTime}ms`));
			console.log(chalk.yellow(`🤖 AI enhanced: ${result.mcpMetadata.aiEnhanced ? 'Yes' : 'No'}`));
			console.log(chalk.yellow(`🎯 Confidence: ${Math.round(result.mcpMetadata.confidence * 100)}%`));

			if (result.files.length > 0) {
				console.log(chalk.gray("\n📄 Generated files:"));
				result.files.forEach((file) => {
					console.log(chalk.gray(`  • ${file}`));
				});
			}

			if (result.recommendations && result.recommendations.length > 0) {
				console.log(chalk.cyan("\n💡 Recommendations:"));
				result.recommendations.forEach((rec) => {
					console.log(chalk.gray(`  • ${rec}`));
				});
			}

			if (result.nextSteps && result.nextSteps.length > 0) {
				console.log(chalk.cyan("\n📋 Next steps:"));
				result.nextSteps.forEach((step) => {
					console.log(chalk.gray(`  • ${step}`));
				});
			}
		} else {
			console.error(chalk.red(`\n❌ Service generation failed: ${result.message}`));
			process.exit(1);
		}
	} catch (error) {
		console.error(chalk.red("\n❌ Error generating MCP-enhanced service:"));
		console.error(chalk.red(error instanceof Error ? error.message : String(error)));
		process.exit(1);
	}
}

/**
 * MCP code enhancement command
 */
async function mcpCodeEnhancementCommand(
	file: string,
	options: {
		prompt?: string;
		model?: string;
		dryRun?: boolean;
	}
): Promise<void> {
	console.log(chalk.blue("🚀 MCP Code Enhancement\n"));

	try {
		// Read the file content
		const fs = await import("fs/promises");
		const path = await import("path");
		
		const filePath = path.resolve(file);
		let originalCode: string;
		
		try {
			originalCode = await fs.readFile(filePath, "utf-8");
		} catch (error) {
			console.error(chalk.red(`❌ Failed to read file: ${filePath}`));
			process.exit(1);
		}

		console.log(chalk.blue(`📄 Enhancing: ${filePath}`));
		console.log(chalk.gray(`🔍 Original size: ${originalCode.length} characters`));

		// Initialize MCP orchestrator
		await mcpGenerationOrchestrator.initialize();

		// Determine code type
		const codeType = file.endsWith('.tsx') || file.endsWith('.jsx') ? 'component' : 
						 file.includes('service') || file.includes('api') ? 'service' : 'other';

		// Enhance code with MCP
		const enhancedCode = await mcpGenerationOrchestrator.enhanceCode(
			originalCode,
			options.prompt || "Improve and optimize this code following best practices",
			codeType as any
		);

		if (enhancedCode === originalCode) {
			console.log(chalk.yellow("⚠️ No enhancements were made to the code."));
			return;
		}

		console.log(chalk.green(`✅ Code enhanced successfully!`));
		console.log(chalk.gray(`📈 Enhanced size: ${enhancedCode.length} characters`));
		console.log(chalk.gray(`📊 Size change: ${enhancedCode.length - originalCode.length > 0 ? '+' : ''}${enhancedCode.length - originalCode.length} characters`));

		if (options.dryRun) {
			console.log(chalk.blue("\n🔍 Dry run - Enhanced code preview:"));
			console.log(chalk.gray("=" .repeat(50)));
			console.log(enhancedCode);
			console.log(chalk.gray("=" .repeat(50)));
		} else {
			// Write enhanced code back to file
			await fs.writeFile(filePath, enhancedCode, "utf-8");
			console.log(chalk.green(`💾 Enhanced code saved to: ${filePath}`));
		}

		console.log(chalk.cyan("\n💡 Enhancement completed using MCP intelligence"));
	} catch (error) {
		console.error(chalk.red("\n❌ Error enhancing code with MCP:"));
		console.error(chalk.red(error instanceof Error ? error.message : String(error)));
		process.exit(1);
	}
}

/**
 * Creates the AI command structure for the CLI
 */
export function createAICommand(): Command {
	const aiCommand = new Command("ai")
		.description("AI-powered code generation and modification using Codebuff")
		.option("-m, --model <model>", "AI model to use", "gpt-4")
		.option("--dry-run", "Preview changes without applying them", false)
		.option("--no-auto-commit", "Skip automatic Git commit", false)
		.option("--no-interactive", "Skip interactive confirmation", false)
		.option("--index", "Create/update Codebuff index before generation", false);

	// Main code generation command
	aiCommand
		.command("code <prompt>")
		.description("Generate code changes from natural language prompt")
		.action(async (prompt: string, options) => {
			await codebuffCommand(prompt, {
				model: aiCommand.opts().model,
				dryRun: aiCommand.opts().dryRun,
				autoCommit: aiCommand.opts().autoCommit,
				interactive: aiCommand.opts().interactive,
				index: aiCommand.opts().index,
			});
		});

	// Fix failing tests
	aiCommand
		.command("fix-tests")
		.description("Automatically fix failing tests using AI")
		.action(async () => {
			await fixTestsCommand({
				model: aiCommand.opts().model,
				dryRun: aiCommand.opts().dryRun,
				autoCommit: aiCommand.opts().autoCommit,
				interactive: aiCommand.opts().interactive,
			});
		});

	// Norwegian compliance enhancements
	aiCommand
		.command("norwegian <prompt>")
		.description("Generate code with Norwegian compliance requirements")
		.action(async (prompt: string) => {
			await norwegianComplianceCommand(prompt, {
				model: aiCommand.opts().model,
				dryRun: aiCommand.opts().dryRun,
				autoCommit: aiCommand.opts().autoCommit,
				interactive: aiCommand.opts().interactive,
				index: aiCommand.opts().index,
			});
		});

	// Index management
	aiCommand
		.command("index")
		.description("Create or update Codebuff index for better context awareness")
		.action(async () => {
			await createCodebuffIndex(process.cwd());
		});

	// AI Refactoring Assistant generator
	aiCommand
		.command("refactor-assistant <name> <framework> <outputPath>")
		.description(
			"Generate an AI-powered refactoring assistant for your project",
		)
		.option(
			"-p, --providers <providers>",
			"Comma-separated list of AI providers (openai,anthropic,local-llm)",
			"openai,anthropic",
		)
		.option(
			"-f, --features <features>",
			"Comma-separated list of refactoring features",
			"extract-function,rename-variable,simplify-condition,remove-duplication,optimize-imports,modernize-syntax",
		)
		.option("--no-ui", "Skip generating interactive UI components")
		.option("--no-git", "Skip generating Git integration")
		.option("--no-tests", "Skip generating test files")
		.option("--no-cli", "Skip generating CLI interface")
		.action(
			async (name: string, framework: string, outputPath: string, options) => {
				await generateRefactoringAssistantCommand(name, framework, outputPath, {
					providers: options.providers.split(","),
					features: options.features.split(","),
					includeUI: options.ui,
					includeGit: options.git,
					includeTests: options.tests,
					includeCLI: options.cli,
				});
			},
		);

	// MCP-enhanced component generation
	aiCommand
		.command("component <name>")
		.description("Generate intelligent UI component using MCP and AI")
		.option("-f, --framework <framework>", "Target framework", "react")
		.option("-d, --description <description>", "AI description for enhancement")
		.option("--no-tests", "Skip generating test files")
		.option("--no-stories", "Skip generating Storybook stories")
		.action(async (name: string, options) => {
			await mcpEnhancedComponentCommand(name, {
				framework: options.framework,
				description: options.description,
				tests: options.tests,
				stories: options.stories,
				model: aiCommand.opts().model,
				dryRun: aiCommand.opts().dryRun,
			});
		});

	// MCP-enhanced service generation
	aiCommand
		.command("service <name>")
		.description("Generate intelligent microservice using MCP and AI")
		.option("-d, --description <description>", "AI description for business logic")
		.option("--features <features>", "Comma-separated service features")
		.action(async (name: string, options) => {
			await mcpEnhancedServiceCommand(name, {
				description: options.description,
				features: options.features?.split(",") || [],
				model: aiCommand.opts().model,
				dryRun: aiCommand.opts().dryRun,
			});
		});

	// MCP code enhancement
	aiCommand
		.command("enhance <file>")
		.description("Enhance existing code with AI using MCP intelligence")
		.option("-p, --prompt <prompt>", "Enhancement description", "Improve and optimize this code")
		.action(async (file: string, options) => {
			await mcpCodeEnhancementCommand(file, {
				prompt: options.prompt,
				model: aiCommand.opts().model,
				dryRun: aiCommand.opts().dryRun,
			});
		});

	return aiCommand;
}

export default createAICommand;
