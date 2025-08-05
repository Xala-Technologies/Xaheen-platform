/**
 * @fileoverview Codebuff integration service for AI-powered code generation
 * @version 1.0.0
 * @author Xala Technologies
 */

import chalk from "chalk";
import { execSync, spawn } from "child_process";
import { existsSync } from "fs";
import { join } from "path";

export interface CodebuffOptions {
	readonly cwd: string;
	readonly model?: string;
	readonly temperature?: number;
	readonly maxTokens?: number;
	readonly includeContext?: boolean;
	readonly verbose?: boolean;
}

export interface CodebuffResult {
	readonly success: boolean;
	readonly patch: string;
	readonly filesAffected: readonly string[];
	readonly confidence: number;
	readonly reasoning: string;
	readonly error?: string;
}

export interface ProjectContext {
	readonly framework: string;
	readonly language: string;
	readonly dependencies: readonly string[];
	readonly hasTests: boolean;
	readonly hasDocumentation: boolean;
	readonly gitBranch: string;
	readonly lastCommit: string;
}

/**
 * Codebuff integration service for context-aware AI code generation
 */
export class CodebuffIntegrationService {
	private readonly cwd: string;
	private readonly defaultModel: string;
	private indexPath: string;

	constructor(cwd: string = process.cwd(), defaultModel: string = "gpt-4") {
		this.cwd = cwd;
		this.defaultModel = defaultModel;
		this.indexPath = join(cwd, ".codebuff");
	}

	/**
	 * Runs Codebuff CLI and returns the generated patch
	 */
	private async runCodebuffCLI(
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
					reject(
						new Error(`Codebuff failed with code ${code}: ${errorOutput}`),
					);
				}
			});

			codebuffProcess.on("error", (error) => {
				reject(new Error(`Failed to start Codebuff: ${error.message}`));
			});
		});
	}

	/**
	 * Generates code changes using Codebuff with enhanced context
	 */
	async generateCode(
		prompt: string,
		options: Partial<CodebuffOptions> = {},
	): Promise<CodebuffResult> {
		const config: CodebuffOptions = {
			cwd: this.cwd,
			model: this.defaultModel,
			temperature: 0.2,
			maxTokens: 4000,
			includeContext: true,
			verbose: false,
			...options,
		};

		try {
			// Ensure index exists for better context
			await this.ensureIndex();

			// Get project context
			const context = await this.getProjectContext();

			// Enhance prompt with Norwegian compliance if applicable
			const enhancedPrompt = this.enhancePromptWithContext(prompt, context);

			console.log(chalk.blue("🤖 Generating code with Codebuff..."));
			if (config.verbose) {
				console.log(
					chalk.gray(`📍 Context: ${context.framework} (${context.language})`),
				);
				console.log(chalk.gray(`🔍 Model: ${config.model}`));
			}

			// Run Codebuff CLI
			const patch = await this.runCodebuffCLI(config.cwd, enhancedPrompt, {
				model: config.model,
				verbose: config.verbose,
			});

			if (!patch || patch.trim().length === 0) {
				return {
					success: false,
					patch: "",
					filesAffected: [],
					confidence: 0,
					reasoning:
						"No changes generated - prompt may not require code modifications",
					error: "Empty patch generated",
				};
			}

			// Analyze the patch
			const analysis = this.analyzePatch(patch);

			return {
				success: true,
				patch,
				filesAffected: analysis.filesAffected,
				confidence: analysis.confidence,
				reasoning: analysis.reasoning,
			};
		} catch (error) {
			return {
				success: false,
				patch: "",
				filesAffected: [],
				confidence: 0,
				reasoning: "Failed to generate code",
				error: error instanceof Error ? error.message : String(error),
			};
		}
	}

	/**
	 * Generates code specifically for Norwegian compliance requirements
	 */
	async generateNorwegianCompliantCode(
		prompt: string,
		options: Partial<CodebuffOptions> = {},
	): Promise<CodebuffResult> {
		const compliancePrompt = `${prompt}

NORWEGIAN COMPLIANCE REQUIREMENTS:
- Implement GDPR-compliant data handling with explicit consent mechanisms
- Follow NSM (Norwegian National Security Authority) security standards
- Include BankID integration patterns where authentication is needed
- Support Norwegian language (Bokmål) with proper localization
- Ensure WCAG 2.2 AAA accessibility compliance
- Implement PCI DSS compliance for payment processing
- Add comprehensive audit logging for compliance tracking
- Include proper error handling with Norwegian-specific error messages
- Follow Norwegian data residency requirements
- Implement secure session management with Norwegian standards`;

		return this.generateCode(compliancePrompt, options);
	}

	/**
	 * Fixes failing tests using AI analysis
	 */
	async fixFailingTests(
		options: Partial<CodebuffOptions> = {},
	): Promise<CodebuffResult> {
		try {
			// Run tests to capture failures
			const testOutput = this.runTests();

			const prompt = `Analyze the failing test output and fix the issues:

TEST OUTPUT:
${testOutput}

Please:
1. Identify the root cause of test failures
2. Make minimal, targeted fixes to make tests pass
3. Ensure no existing functionality is broken
4. Follow existing code patterns and conventions
5. Add any missing test cases if needed`;

			return this.generateCode(prompt, options);
		} catch (error) {
			return {
				success: false,
				patch: "",
				filesAffected: [],
				confidence: 0,
				reasoning: "Failed to analyze test failures",
				error: error instanceof Error ? error.message : String(error),
			};
		}
	}

	/**
	 * Integrates with existing generator templates
	 */
	async enhanceGeneratedCode(
		generatorName: string,
		templateOutput: string,
		customizations: string,
		options: Partial<CodebuffOptions> = {},
	): Promise<CodebuffResult> {
		const prompt = `Enhance the generated code from the ${generatorName} generator with these customizations:

GENERATED CODE:
${templateOutput}

REQUESTED CUSTOMIZATIONS:
${customizations}

Please:
1. Integrate the customizations seamlessly with the generated code
2. Maintain the existing code structure and patterns
3. Ensure type safety and proper error handling
4. Follow the project's coding conventions
5. Add appropriate documentation and comments`;

		return this.generateCode(prompt, options);
	}

	/**
	 * Creates or updates the Codebuff index
	 */
	async ensureIndex(): Promise<boolean> {
		try {
			if (!existsSync(this.indexPath)) {
				console.log(chalk.blue("🔍 Creating Codebuff index..."));
				execSync("codebuff index --output ./.codebuff", {
					cwd: this.cwd,
					stdio: "pipe",
				});
				console.log(chalk.green("✅ Codebuff index created"));
			}
			return true;
		} catch (error) {
			console.warn(
				chalk.yellow(
					"⚠️ Failed to create Codebuff index, continuing without it",
				),
			);
			return false;
		}
	}

	/**
	 * Gets comprehensive project context
	 */
	private async getProjectContext(): Promise<ProjectContext> {
		try {
			const packageJsonPath = join(this.cwd, "package.json");
			let framework = "unknown";
			let language = "javascript";
			let dependencies: string[] = [];

			if (existsSync(packageJsonPath)) {
				const packageJson = JSON.parse(
					require("fs").readFileSync(packageJsonPath, "utf8"),
				);
				dependencies = Object.keys({
					...packageJson.dependencies,
					...packageJson.devDependencies,
				});

				// Detect framework
				if (dependencies.includes("next")) framework = "nextjs";
				else if (dependencies.includes("react")) framework = "react";
				else if (dependencies.includes("vue")) framework = "vue";
				else if (dependencies.includes("@nestjs/core")) framework = "nestjs";
				else if (dependencies.includes("express")) framework = "express";

				// Detect language
				if (
					dependencies.includes("typescript") ||
					existsSync(join(this.cwd, "tsconfig.json"))
				) {
					language = "typescript";
				}
			}

			const hasTests =
				existsSync(join(this.cwd, "test")) ||
				existsSync(join(this.cwd, "__tests__")) ||
				dependencies.some(
					(dep) =>
						dep.includes("test") ||
						dep.includes("jest") ||
						dep.includes("vitest"),
				);

			const hasDocumentation =
				existsSync(join(this.cwd, "README.md")) ||
				existsSync(join(this.cwd, "docs"));

			let gitBranch = "main";
			let lastCommit = "unknown";

			try {
				gitBranch = execSync("git rev-parse --abbrev-ref HEAD", {
					cwd: this.cwd,
					encoding: "utf8",
				}).trim();

				lastCommit = execSync('git log -1 --format="%h %s"', {
					cwd: this.cwd,
					encoding: "utf8",
				}).trim();
			} catch {
				// Git not available or not a git repo
			}

			return {
				framework,
				language,
				dependencies,
				hasTests,
				hasDocumentation,
				gitBranch,
				lastCommit,
			};
		} catch (error) {
			return {
				framework: "unknown",
				language: "javascript",
				dependencies: [],
				hasTests: false,
				hasDocumentation: false,
				gitBranch: "main",
				lastCommit: "unknown",
			};
		}
	}

	/**
	 * Enhances prompt with project context
	 */
	private enhancePromptWithContext(
		prompt: string,
		context: ProjectContext,
	): string {
		return `${prompt}

PROJECT CONTEXT:
- Framework: ${context.framework}
- Language: ${context.language}
- Key Dependencies: ${context.dependencies.slice(0, 10).join(", ")}
- Has Tests: ${context.hasTests}
- Has Documentation: ${context.hasDocumentation}
- Git Branch: ${context.gitBranch}

Please ensure the generated code:
1. Follows ${context.language} best practices
2. Is compatible with ${context.framework} patterns
3. Integrates well with existing dependencies
4. ${context.hasTests ? "Includes appropriate test updates" : "Follows testable patterns"}
5. ${context.hasDocumentation ? "Updates relevant documentation" : "Includes inline documentation"}`;
	}

	/**
	 * Analyzes a patch to extract metadata
	 */
	private analyzePatch(patch: string): {
		filesAffected: string[];
		confidence: number;
		reasoning: string;
	} {
		const lines = patch.split("\n");
		const filesAffected: string[] = [];
		let addedLines = 0;
		let removedLines = 0;

		for (const line of lines) {
			if (line.startsWith("diff --git")) {
				const match = line.match(/diff --git a\/(.*) b\/(.*)/);
				if (match) {
					filesAffected.push(match[1]);
				}
			} else if (line.startsWith("+") && !line.startsWith("+++")) {
				addedLines++;
			} else if (line.startsWith("-") && !line.startsWith("---")) {
				removedLines++;
			}
		}

		// Calculate confidence based on patch characteristics
		let confidence = 0.7; // Base confidence

		if (filesAffected.length <= 3) confidence += 0.1; // Focused changes
		if (addedLines > 0 && removedLines === 0) confidence += 0.1; // Additive changes
		if (addedLines < 50) confidence += 0.1; // Small changes

		confidence = Math.min(confidence, 1.0);

		const reasoning = `Modified ${filesAffected.length} file(s), added ${addedLines} lines, removed ${removedLines} lines. ${
			confidence > 0.8
				? "High confidence - focused, small changes."
				: confidence > 0.6
					? "Medium confidence - moderate changes."
					: "Lower confidence - extensive changes, review carefully."
		}`;

		return { filesAffected, confidence, reasoning };
	}

	/**
	 * Runs tests and captures output
	 */
	private runTests(): string {
		try {
			execSync("npm test", {
				cwd: this.cwd,
				stdio: "pipe",
				timeout: 30000,
			});
			return "All tests passed";
		} catch (error: any) {
			return (
				error.stdout?.toString() ||
				error.stderr?.toString() ||
				"Test execution failed"
			);
		}
	}
}

export default CodebuffIntegrationService;
